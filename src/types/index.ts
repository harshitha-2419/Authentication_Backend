import { Document } from "mongoose";

// ─── User Interface ───────────────────────────────────────────────────────────

// Represents the shape of a User document in MongoDB
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string; // stored as bcrypt hash

  isVerified: boolean; // becomes true after OTP verification

  otp: string | null;
  otpExpiry: Date | null;
  otpAttempts: number;
  otpResendCount: number;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  refreshToken: string | null;
  role: "user" | "admin" | "super_admin";
}

// ─── Request Body Types ───────────────────────────────────────────────────────

// Body expected when user hits POST /api/auth/register
export interface RegisterRequestBody {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Body expected when user hits POST /api/auth/verify-otp
export interface VerifyOtpRequestBody {
  email: string;
  otp: string;
}

// Body expected when user hits POST /api/auth/login
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Body expected when user hits POST /api/auth/login-otp (request OTP)
export interface LoginOtpRequestBody {
  email: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}
