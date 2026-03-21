import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config";
import { User } from "../models/User";

// Extend Express Request to carry userId after token verification
export interface AuthRequest extends Request {
  userId?: string;
}

// ─── Verify JWT Access Token ──────────────────────────────────────────────────

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Access token required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
};

// ─── Require Email Verified ───────────────────────────────────────────────────
// Must be used AFTER requireAuth (needs req.userId)

export const requireVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await User.findById(req.userId).select("isVerified");

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({ success: false, message: "Please verify your email to access this resource" });
    return;
  }

  next();
};

// ─── Require Role ─────────────────────────────────────────────────────────────
// Must be used AFTER requireAuth (needs req.userId)
// Usage: requireRole("admin", "super_admin")

export const requireRole = (...roles: Array<"user" | "admin" | "super_admin">) =>
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!roles.includes(user.role as "user" | "admin" | "super_admin")) {
      res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
      return;
    }

    next();
  };
