import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleSignup,
  handleLogin,
} from "./routes/auth";
import {
  handleUploadPdf,
  handleGetPdfs,
  handleDeletePdf,
  handleGetPdfContent,
  upload,
} from "./routes/pdf";
import {
  handleExplain,
  handleGetExplanationHistory,
  handleDeleteExplanation,
} from "./routes/explain";
import {
  handleAskDoubt,
  handleGetDoubts,
  handleGetDoubt,
  handleDeleteDoubt,
} from "./routes/doubts";
import { verifyToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);

  // PDF routes
  app.post("/api/upload-pdf", verifyToken, upload.single("file"), handleUploadPdf);
  app.get("/api/pdfs", verifyToken, handleGetPdfs);
  app.delete("/api/pdfs/:pdfId", verifyToken, handleDeletePdf);
  app.get("/api/pdfs/:pdfId", verifyToken, handleGetPdfContent);

  // Explanation routes
  app.post("/api/explain", verifyToken, handleExplain);
  app.get("/api/explanations/:pdfId", verifyToken, handleGetExplanationHistory);
  app.delete("/api/explanations/:explanationId", verifyToken, handleDeleteExplanation);

  // Doubt routes
  app.post("/api/doubts", verifyToken, handleAskDoubt);
  app.get("/api/doubts", verifyToken, handleGetDoubts);
  app.get("/api/doubts/:doubtId", verifyToken, handleGetDoubt);
  app.delete("/api/doubts/:doubtId", verifyToken, handleDeleteDoubt);

  return app;
}
