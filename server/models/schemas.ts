/**
 * MongoDB Schema Definitions for Talk To Learn
 * 
 * This file documents the MongoDB collections structure.
 * In production, these would be implemented using Mongoose or TypeORM.
 */

/**
 * Users Collection
 * Stores user account information and login history
 */
export interface IUser {
  _id: string; // MongoDB ObjectId
  name: string;
  email: string;
  password: string; // Hashed with bcrypt
  loginHistory: string[]; // Array of ISO date strings
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UploadedPDFs Collection
 * Stores PDF file metadata and processing status
 */
export interface IUploadedPDF {
  _id: string; // MongoDB ObjectId
  userId: string; // Reference to Users collection
  fileName: string;
  filePath: string; // Storage path (S3, local, etc.)
  fileSize: number; // Size in bytes
  uploadDate: Date;
  status: "processing" | "completed" | "error"; // Processing status
  extractedText?: string; // Full extracted text from PDF
  processingError?: string; // Error message if processing failed
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ExtractedContent Collection
 * Stores extracted portions and selections from PDFs
 */
export interface IExtractedContent {
  _id: string; // MongoDB ObjectId
  pdfId: string; // Reference to UploadedPDFs collection
  userId: string; // Reference to Users collection
  fullText: string; // Complete extracted text
  selectedText: string; // User-selected portion
  selectionIndex: { start: number; end: number }; // Character positions
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserSessions Collection
 * Tracks learning sessions and time spent
 */
export interface IUserSession {
  _id: string; // MongoDB ObjectId
  userId: string; // Reference to Users collection
  pdfId: string; // Reference to UploadedPDFs collection
  mode: "text" | "voice" | "animated" | "doubt"; // Learning mode
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number; // Calculated end_time - start_time
  explanationsGenerated: number;
  doubtsAsked: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Doubts Collection
 * Stores user questions and AI-generated answers
 */
export interface IDoubt {
  _id: string; // MongoDB ObjectId
  userId: string; // Reference to Users collection
  pdfId: string; // Reference to UploadedPDFs collection
  question: string;
  answer: string; // AI-generated answer
  selectedContext?: string; // Related text from PDF
  voiceQuestion?: string; // Transcript if voice input
  timestamp: Date;
  helpful?: boolean; // User feedback
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Explanations Collection
 * Caches generated explanations for reuse
 */
export interface IExplanation {
  _id: string; // MongoDB ObjectId
  userId: string; // Reference to Users collection
  pdfId: string; // Reference to UploadedPDFs collection
  selectedText: string;
  mode: "text" | "voice" | "animated";
  explanation: string;
  audioUrl?: string; // S3 URL to generated audio
  slides?: Array<{ title: string; content: string }>;
  voiceGender?: "male" | "female";
  tokens_used?: number; // For cost tracking
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MongoDB Indexes (for performance optimization)
 * 
 * Users:
 *   - { email: 1 } (UNIQUE)
 * 
 * UploadedPDFs:
 *   - { userId: 1, uploadDate: -1 }
 *   - { status: 1 }
 * 
 * Doubts:
 *   - { userId: 1, pdfId: 1, timestamp: -1 }
 * 
 * Explanations:
 *   - { userId: 1, pdfId: 1, timestamp: -1 }
 * 
 * UserSessions:
 *   - { userId: 1, startTime: -1 }
 */

/**
 * MongoDB Connection String Format:
 * mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
 * 
 * Local Development:
 * mongodb://localhost:27017/talk-to-learn
 */
