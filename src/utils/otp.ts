import { ENV } from "../config";

// ─── OTP Generator ────────────────────────────────────────────────────────────

/**
 * Generates a random 6-digit OTP as a string
 * e.g. "048321"
 */
export const generateOTP = (): string => {
  // Math.random gives 0.0 - 0.9999, multiply by 900000 + 100000 = always 6 digits
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Returns the OTP expiry Date object
 * based on OTP_EXPIRY_MINUTES from .env (default: 10 mins)
 */
export const getOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + ENV.OTP_EXPIRY);
  return expiry;
};
