import { RequestHandler } from "express";
import { ExplanationRequest, ExplanationResponse } from "@shared/api";

// Mock database for storing explanations
interface StoredExplanation {
  _id: string;
  pdfId: string;
  selectedText: string;
  mode: string;
  explanation: string;
  audioUrl?: string;
  timestamp: string;
}

const explanations: Map<string, StoredExplanation> = new Map();

// Mock AI explanation generator
async function generateAIExplanation(
  text: string,
  mode: string
): Promise<string> {
  // In production, this would call OpenAI API
  // For now, return mock explanations
  const explanations: Record<string, string> = {
    text: `Here's a detailed explanation of the selected text:\n\n"${text}"\n\nThis content discusses important concepts that are fundamental to understanding the subject matter. The key points include:\n\n1. Core Concepts: The text introduces several core concepts that form the foundation of this topic.\n\n2. Applications: These concepts have practical applications in real-world scenarios.\n\n3. Implications: Understanding these concepts helps you grasp deeper topics.\n\nTo summarize, the main takeaway is that this material is essential for comprehensive learning.`,

    voice: `The selected text explains that ${text.substring(0, 50)}... This is an important concept that you should understand. Let me break it down for you. First, this deals with fundamental principles. Second, these principles have practical applications. Third, mastering this will help you progress to more advanced topics.`,

    animated: `Key points about "${text.substring(0, 40)}...":\n1. Introduction\n2. Main Concepts\n3. Practical Applications\n4. Summary`,

    doubt: `Based on your question about "${text.substring(0, 40)}...", here's the answer: This is a common question in this field. The answer involves understanding the fundamental principles, recognizing how they apply to your specific question, and connecting the concepts together. The key insight is that all these ideas work together to create a comprehensive understanding of the topic.`,
  };

  return explanations[mode] || explanations.text;
}

// Mock voice generation
async function generateVoice(
  text: string,
  gender: "male" | "female"
): Promise<string> {
  // In production, this would use a text-to-speech API
  // For now, return a mock audio URL
  return `https://example.com/audio/${gender}-${Date.now()}.mp3`;
}

// Mock slide generation
async function generateSlides(text: string): Promise<Array<{ title: string; content: string }>> {
  // In production, this would analyze the text and generate meaningful slides
  return [
    {
      title: "Introduction",
      content: `Overview of "${text.substring(0, 50)}..."`,
    },
    {
      title: "Key Concepts",
      content:
        "Understanding the fundamental principles and how they interconnect.",
    },
    {
      title: "Applications",
      content:
        "Practical examples and real-world use cases for these concepts.",
    },
    {
      title: "Summary",
      content:
        "Key takeaways and how to apply this knowledge to your learning.",
    },
  ];
}

export const handleExplain: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      pdfId,
      selectedText,
      mode,
      voiceGender,
    } = req.body as ExplanationRequest;

    // Validate input
    if (!selectedText || !mode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate explanation
    const explanation = await generateAIExplanation(selectedText, mode);

    // Store in database
    const storedExplanation: StoredExplanation = {
      _id: Date.now().toString(),
      pdfId: pdfId || "",
      selectedText,
      mode,
      explanation,
      timestamp: new Date().toISOString(),
    };

    explanations.set(storedExplanation._id, storedExplanation);

    const response: ExplanationResponse = {
      explanation,
    };

    // Add voice if requested
    if (mode === "voice" && voiceGender) {
      response.audioUrl = await generateVoice(explanation, voiceGender);
    }

    // Add slides if animated mode
    if (mode === "animated") {
      response.slides = await generateSlides(selectedText);
    }

    res.json(response);
  } catch (error) {
    console.error("Explanation error:", error);
    res.status(500).json({ message: "Error generating explanation" });
  }
};

export const handleGetExplanationHistory: RequestHandler = (req, res) => {
  try {
    const { pdfId } = req.params;

    const pdfExplanations = Array.from(explanations.values()).filter(
      (e) => e.pdfId === pdfId
    );

    res.json(pdfExplanations);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ message: "Error fetching explanation history" });
  }
};

export const handleDeleteExplanation: RequestHandler = (req, res) => {
  try {
    const { explanationId } = req.params;

    if (explanations.has(explanationId)) {
      explanations.delete(explanationId);
      res.json({ message: "Explanation deleted" });
    } else {
      res.status(404).json({ message: "Explanation not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting explanation" });
  }
};
