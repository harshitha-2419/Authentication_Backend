import { Schema, model } from "mongoose";
import { IUser } from "../types";

// ─── User Schema ──────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,       // enforces unique email at DB level
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,       // enforces unique phone at DB level
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      // stored as bcrypt hash — never plain text
    },

    isVerified: {
      type: Boolean,
      default: false,     // user must verify OTP to become true
    },

    otp: {
      type: String,
      default: null,      // set during registration, cleared after verification
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,   // increments on each wrong OTP, blocked at 3
    },

    otpResendCount: {
      type: Number,
      default: 0,
    },

    resetToken: {
      type: String,
      default: null,   // stores SHA-256 hash of the reset token
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
  },
  {
    timestamps: true,     // adds createdAt and updatedAt automatically
  }
);

// ─── User Model ───────────────────────────────────────────────────────────────

export const User = model<IUser>("User", UserSchema);
