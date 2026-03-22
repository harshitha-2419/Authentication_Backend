import { Document } from "mongoose";

// ─── Session Interface ────────────────────────────────────────────────────────
export interface ISession {
  sessionId: string;
  refreshToken: string;
  deviceInfo: string;
  ip: string;
  createdAt: Date;
}

// ─── Login History Interface ──────────────────────────────────────────────────
export interface ILoginHistory {
  ip: string;
  deviceInfo: string;
  status: "success" | "failed";
  reason?: string;
  timestamp: Date;
}

// ─── User Interface ───────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;

  isVerified: boolean;

  otp: string | null;
  otpExpiry: Date | null;
  otpAttempts: number;
  otpResendCount: number;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  refreshToken: string | null;
  role: "user" | "admin" | "super_admin";

  // Account lock
  failedLoginAttempts: number;
  lockUntil: Date | null;

  // Sessions
  sessions: ISession[];

  // Login history
  loginHistory: ILoginHistory[];
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
