import { RequestHandler } from "express";
import { DoubtRequest, DoubtResponse } from "@shared/api";

// Mock database
interface Doubt {
  _id: string;
  userId: string;
  pdfId: string;
  question: string;
  answer: string;
  timestamp: string;
}

const doubts: Map<string, Doubt> = new Map();
const userDoubts: Map<string, string[]> = new Map(); // userId -> doubtIds

// Mock AI doubt answerer
async function answerDoubt(question: string, pdfContent: string): Promise<string> {
  // In production, this would use OpenAI API with context
  return `Based on the provided content, here's the answer to your question "${question.substring(0, 50)}...":\n\nThis is a great question that many learners ask. The answer involves several key points:\n\n1. Understanding the Concept: The question relates to fundamental principles in the material.\n\n2. Context Application: When applied to the specific context you mentioned, we need to consider multiple factors.\n\n3. Practical Implications: This understanding helps you solve problems more effectively.\n\nIn conclusion, the key takeaway is to focus on the interconnection between different concepts to fully grasp the answer.`;
}

export const handleAskDoubt: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { pdfId, question } = req.body as DoubtRequest;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Generate answer (in production, use OpenAI API)
    const answer = await answerDoubt(question, "");

    // Store doubt
    const doubt: Doubt = {
      _id: Date.now().toString(),
      userId,
      pdfId: pdfId || "",
      question,
      answer,
      timestamp: new Date().toISOString(),
    };

    doubts.set(doubt._id, doubt);

    // Add to user's doubts
    if (!userDoubts.has(userId)) {
      userDoubts.set(userId, []);
    }
    userDoubts.get(userId)!.push(doubt._id);

    const response: DoubtResponse = {
      _id: doubt._id,
      question: doubt.question,
      answer: doubt.answer,
      timestamp: doubt.timestamp,
    };

    res.json(response);
  } catch (error) {
    console.error("Ask doubt error:", error);
    res.status(500).json({ message: "Error processing doubt" });
  }
};

export const handleGetDoubts: RequestHandler = (req, res) => {
  try {
    const userId = req.userId;
    const { pdfId } = req.query;

    let userDoubtList = (userDoubts.get(userId) || [])
      .map((id) => doubts.get(id))
      .filter(Boolean) as Doubt[];

    // Filter by PDF if provided
    if (pdfId) {
      userDoubtList = userDoubtList.filter((d) => d.pdfId === pdfId);
    }

    const response = userDoubtList.map((d) => ({
      _id: d._id,
      question: d.question,
      answer: d.answer,
      timestamp: d.timestamp,
    }));

    res.json(response);
  } catch (error) {
    console.error("Get doubts error:", error);
    res.status(500).json({ message: "Error fetching doubts" });
  }
};

export const handleGetDoubt: RequestHandler = (req, res) => {
  try {
    const { doubtId } = req.params;

    const doubt = doubts.get(doubtId);
    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const response: DoubtResponse = {
      _id: doubt._id,
      question: doubt.question,
      answer: doubt.answer,
      timestamp: doubt.timestamp,
    };

    res.json(response);
  } catch (error) {
    console.error("Get doubt error:", error);
    res.status(500).json({ message: "Error fetching doubt" });
  }
};

export const handleDeleteDoubt: RequestHandler = (req, res) => {
  try {
    const userId = req.userId;
    const { doubtId } = req.params;

    const doubt = doubts.get(doubtId);
    if (!doubt || doubt.userId !== userId) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    doubts.delete(doubtId);

    // Remove from user's doubts
    const userDoubtList = userDoubts.get(userId);
    if (userDoubtList) {
      const index = userDoubtList.indexOf(doubtId);
      if (index > -1) {
        userDoubtList.splice(index, 1);
      }
    }

    res.json({ message: "Doubt deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting doubt" });
  }
};
