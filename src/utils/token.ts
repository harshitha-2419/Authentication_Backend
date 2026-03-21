import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ENV } from "../config";

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  const refreshToken = jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  return { accessToken, refreshToken };
};

// Generates a secure random reset token and its SHA-256 hash
// rawToken is sent in the email link, hashedToken is stored in DB
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { rawToken, hashedToken, expiry };
};

// Hashes an incoming token to compare against the stored hash
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
