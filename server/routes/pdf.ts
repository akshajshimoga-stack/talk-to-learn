import { RequestHandler } from "express";
import { PDFUploadResponse, PDFsResponse } from "@shared/api";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock database
interface PDF {
  _id: string;
  userId: string;
  fileName: string;
  filePath: string;
  uploadDate: string;
  fileSize: number;
  status: "processing" | "completed" | "error";
  extractedText: string;
}

const pdfs: Map<string, PDF> = new Map();
const userPdfs: Map<string, string[]> = new Map(); // userId -> pdfIds

// Configure multer for file uploads (memory storage for simplicity)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const handleUploadPdf: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdf: PDF = {
      _id: Date.now().toString(),
      userId: userId || "",
      fileName: file.originalname,
      filePath: "", // Using memory storage, no file path
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
      status: "processing",
      extractedText: "", // Would be extracted from PDF in production
    };

    pdfs.set(pdf._id, pdf);

    // Add to user's PDF list
    if (!userPdfs.has(userId)) {
      userPdfs.set(userId, []);
    }
    userPdfs.get(userId)!.push(pdf._id);

    // Simulate PDF processing
    setTimeout(() => {
      const existingPdf = pdfs.get(pdf._id);
      if (existingPdf) {
        existingPdf.status = "completed";
        existingPdf.extractedText = `Extracted text from ${file.originalname}`;
      }
    }, 2000);

    const response: PDFUploadResponse = {
      _id: pdf._id,
      fileName: pdf.fileName,
      uploadDate: pdf.uploadDate,
      fileSize: pdf.fileSize,
      status: pdf.status,
    };

    res.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading PDF" });
  }
};

export const handleGetPdfs: RequestHandler = (req, res) => {
  try {
    const userId = req.userId;

    const userPdfIds = userPdfs.get(userId) || [];
    const userPdfList = userPdfIds
      .map((id) => pdfs.get(id))
      .filter(Boolean) as PDF[];

    const response: PDFsResponse = {
      pdfs: userPdfList.map((pdf) => ({
        _id: pdf._id,
        fileName: pdf.fileName,
        uploadDate: pdf.uploadDate,
        fileSize: pdf.fileSize,
        status: pdf.status,
      })),
      stats: {
        totalPdfs: userPdfList.length,
        totalDoubts: 0, // Would query doubt database
        learningTime: "0h", // Would calculate from sessions
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get PDFs error:", error);
    res.status(500).json({ message: "Error fetching PDFs" });
  }
};

export const handleDeletePdf: RequestHandler = (req, res) => {
  try {
    const userId = req.userId;
    const { pdfId } = req.params;

    const pdf = pdfs.get(pdfId);
    if (!pdf || pdf.userId !== userId) {
      return res.status(404).json({ message: "PDF not found" });
    }

    pdfs.delete(pdfId);

    // Remove from user's PDF list
    const userPdfList = userPdfs.get(userId);
    if (userPdfList) {
      const index = userPdfList.indexOf(pdfId);
      if (index > -1) {
        userPdfList.splice(index, 1);
      }
    }

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting PDF" });
  }
};

export const handleGetPdfContent: RequestHandler = (req, res) => {
  try {
    const { pdfId } = req.params;

    const pdf = pdfs.get(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json({
      _id: pdf._id,
      fileName: pdf.fileName,
      extractedText: pdf.extractedText,
      status: pdf.status,
    });
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ message: "Error fetching PDF content" });
  }
};
