import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthRequest, AuthResponse } from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Mock database - in production this would be MongoDB
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  loginHistory: string[];
  createdAt: Date;
}

const users: Map<string, User> = new Map();

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body as AuthRequest;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
      (u) => u.email === email
    );
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      loginHistory: [new Date().toISOString()],
      createdAt: new Date(),
    };

    users.set(user._id, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as AuthRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update login history
    user.loginHistory.push(new Date().toISOString());
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
