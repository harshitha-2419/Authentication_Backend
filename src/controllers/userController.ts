import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

// ─── GET /api/user/profile ────────────────────────────────────────────────────
// Protected: requires valid JWT + verified email

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password -otp -otpExpiry -otpAttempts -otpResendCount");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
