/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// Auth Types
export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

// PDF Types
export interface PDFUploadResponse {
  _id: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  status: "processing" | "completed" | "error";
}

export interface PDFsResponse {
  pdfs: PDFUploadResponse[];
  stats: {
    totalPdfs: number;
    totalDoubts: number;
    learningTime: string;
  };
}

// Explanation Types
export interface ExplanationRequest {
  pdfId: string;
  selectedText: string;
  mode: "text" | "voice" | "animated" | "doubt";
  voiceGender?: "male" | "female";
}

export interface ExplanationResponse {
  explanation: string;
  audioUrl?: string;
  slides?: Array<{ title: string; content: string }>;
}

// Doubt Types
export interface DoubtRequest {
  pdfId: string;
  question: string;
}

export interface DoubtResponse {
  _id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface DemoResponse {
  message: string;
}
