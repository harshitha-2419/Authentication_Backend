import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { generateOTP, getOTPExpiry } from "../utils/otp";
import { sendOTPEmail, sendResetPasswordEmail } from "../utils/email";
import { generateTokens, generateResetToken, hashToken } from "../utils/token";
import { ENV } from "../config";
import { RegisterRequestBody, VerifyOtpRequestBody, LoginRequestBody, LoginOtpRequestBody, ForgotPasswordBody, ResetPasswordBody } from "../types";

const SALT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 3;
const MAX_OTP_RESEND = 3;

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      res.status(409).json({ success: false, message: "Phone number already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      otpAttempts: 0,
      otpResendCount: 0,
      isVerified: false,
    });

    await sendOTPEmail(newUser.email, otp);
    console.log(`[DEV] Registration OTP for ${newUser.email}: ${otp}`);

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for the OTP.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Verify OTP (registration) ────────────────────────────────────────────────

export const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ success: false, message: "Account already verified" });
      return;
    }

    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
      return;
    }

    // Block if max attempts reached
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({ success: false, message: "Too many incorrect attempts. Please resend OTP." });
      return;
    }

    if (new Date() > user.otpExpiry) {
      res.status(400).json({ success: false, message: "OTP has expired. Please resend OTP." });
      return;
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
      return;
    }

    // OTP correct — verify and clear
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpResendCount = 0;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Resend OTP (registration + login OTP) ────────────────────────────────────

export const resendOtp = async (
  req: Request<{}, {}, LoginOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "No account found with this email" });
      return;
    }

    // Block if max resends reached
    if (user.otpResendCount >= MAX_OTP_RESEND) {
      res.status(429).json({ success: false, message: "Maximum OTP resend limit reached. Please try again later." });
      return;
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;          // reset attempts on resend
    user.otpResendCount += 1;
    await user.save();

    await sendOTPEmail(user.email, otp);
    console.log(`[DEV] Resend OTP for ${user.email}: ${otp}`);

    const remaining = MAX_OTP_RESEND - user.otpResendCount;
    res.status(200).json({
      success: true,
      message: `OTP resent to your email. ${remaining} resend(s) remaining.`,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Login (email + password) ─────────────────────────────────────────────────

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, message: "Please verify your email before logging in" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Request Login OTP ────────────────────────────────────────────────────────

export const requestLoginOtp = async (
  req: Request<{}, {}, LoginOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "No account found with this email" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, message: "Please verify your email before logging in" });
      return;
    }

    if (user.otpResendCount >= MAX_OTP_RESEND) {
      res.status(429).json({ success: false, message: "Maximum OTP request limit reached. Please try again later." });
      return;
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    user.otpResendCount += 1;
    await user.save();

    await sendOTPEmail(user.email, otp);
    console.log(`[DEV] Login OTP for ${user.email}: ${otp}`);

    const remaining = MAX_OTP_RESEND - user.otpResendCount;
    res.status(200).json({
      success: true,
      message: `OTP sent to your email. ${remaining} resend(s) remaining.`,
    });
  } catch (error) {
    console.error("Request login OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Verify Login OTP ─────────────────────────────────────────────────────────

export const verifyLoginOtp = async (
  req: Request<{}, {}, VerifyOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ success: false, message: "No OTP requested. Please request a new one." });
      return;
    }

    // Block if max attempts reached
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({ success: false, message: "Too many incorrect attempts. Please request a new OTP." });
      return;
    }

    if (new Date() > user.otpExpiry) {
      res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      return;
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
      return;
    }

    // OTP correct — clear and return tokens
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpResendCount = 0;
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond with success to avoid email enumeration
    if (!user) {
      res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
      return;
    }

    const { rawToken, hashedToken, expiry } = generateResetToken();

    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    await sendResetPasswordEmail(user.email, rawToken);
    console.log(`[DEV] Password reset token for ${user.email}: ${rawToken}`);

    res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordBody>,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }, // token must not be expired
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "Refresh token is required" });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { userId: string };

    // Check token exists in DB — invalidated tokens won't match
    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    res.status(200).json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "Refresh token is required" });
      return;
    }

    // Clear refresh token from DB — immediately invalidates it
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
