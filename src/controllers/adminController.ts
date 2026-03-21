import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Allowed: admin, super_admin

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry -otpAttempts -otpResendCount -resetToken -resetTokenExpiry -refreshToken");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
// Allowed: super_admin only

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
// Allowed: super_admin only

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;

    if (!["user", "admin", "super_admin"].includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role. Must be user, admin, or super_admin" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("name email role");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
