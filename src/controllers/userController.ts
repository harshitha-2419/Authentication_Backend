import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

// ─── GET /api/user/profile ────────────────────────────────────────────────────

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

// ─── GET /api/user/sessions ───────────────────────────────────────────────────

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("sessions");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const sessions = user.sessions.map(({ sessionId, deviceInfo, ip, createdAt }) => ({
      sessionId, deviceInfo, ip, createdAt,
    }));

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /api/user/sessions/:sessionId ─────────────────────────────────────

export const revokeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const sessionIndex = user.sessions.findIndex((s) => s.sessionId === sessionId);
    if (sessionIndex === -1) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    user.sessions.splice(sessionIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /api/user/login-history ─────────────────────────────────────────────

export const getLoginHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("loginHistory");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, loginHistory: user.loginHistory });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
