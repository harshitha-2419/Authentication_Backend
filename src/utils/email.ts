import nodemailer from "nodemailer";
import { ENV } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

// ─── Send OTP Email ───────────────────────────────────────────────────────────

export const sendOTPEmail = async (toEmail: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"Auth App" <${ENV.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px;">
        <h2>Email Verification</h2>
        <p>Use the OTP below to verify your account. It expires in <strong>${ENV.OTP_EXPIRY} minutes</strong>.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─── Send Password Reset Email ────────────────────────────────────────────────

export const sendResetPasswordEmail = async (toEmail: string, rawToken: string): Promise<void> => {
  const resetLink = `http://localhost:5000/api/auth/reset-password?token=${rawToken}`;
  const mailOptions = {
    from: `"Auth App" <${ENV.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:5px;text-decoration:none;">Reset Password</a>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
