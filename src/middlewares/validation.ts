import { Request, Response, NextFunction } from "express";

// ─── Register Validation ──────────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/auth/register
 * Checks: name, email format, phone (10 digits), password length
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, phone, password } = req.body;

  // Check all fields are present
  if (!name || !email || !phone || !password) {
    res.status(400).json({ success: false, message: "All fields are required: name, email, phone, password" });
    return;
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  // Validate phone — must be exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ success: false, message: "Phone must be a 10-digit number" });
    return;
  }

  // Validate password — min 8 chars, uppercase, lowercase, number, special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ success: false, message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)" });
    return;
  }

  next(); // all validations passed, move to controller
};

// ─── Verify OTP Validation ────────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/auth/verify-otp
 * Checks: email format, otp is 6 digits
 */
export const validateVerifyOtp = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ success: false, message: "Email and OTP are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  // OTP must be exactly 6 digits
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    res.status(400).json({ success: false, message: "OTP must be a 6-digit number" });
    return;
  }

  next();
};

// ─── Login Validation ─────────────────────────────────────────────────────────

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  next();
};

// ─── Login OTP Request Validation ─────────────────────────────────────────────

export const validateLoginOtpRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  next();
};

// ─── Forgot Password Validation ──────────────────────────────────────────────

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  next();
};

// ─── Reset Password Validation ────────────────────────────────────────────────

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: "Token and new password are required" });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    res.status(400).json({ success: false, message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" });
    return;
  }

  next();
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Something went wrong" });
};
