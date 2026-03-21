import { Router } from "express";
import { register, verifyOtp, resendOtp, login, requestLoginOtp, verifyLoginOtp, forgotPassword, resetPassword, refreshToken, logout } from "../controllers/authController";
import { validateRegister, validateVerifyOtp, validateLogin, validateLoginOtpRequest, validateForgotPassword, validateResetPassword } from "../middlewares/validation";
import { requireAuth, requireVerified } from "../middlewares/auth";
import { getProfile } from "../controllers/userController";

const router = Router();

// POST /api/auth/register
router.post("/register", validateRegister, register);

// POST /api/auth/verify-otp
router.post("/verify-otp", validateVerifyOtp, verifyOtp);

// POST /api/auth/resend-otp  (registration + login OTP resend)
router.post("/resend-otp", validateLoginOtpRequest, resendOtp);

// POST /api/auth/login  (email + password)
router.post("/login", validateLogin, login);

// POST /api/auth/login-otp  (request OTP to email)
router.post("/login-otp", validateLoginOtpRequest, requestLoginOtp);

// POST /api/auth/login-otp/verify
router.post("/login-otp/verify", validateVerifyOtp, verifyLoginOtp);

// POST /api/auth/forgot-password
router.post("/forgot-password", validateForgotPassword, forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", validateResetPassword, resetPassword);

// POST /api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me (protected)
router.get("/me", requireAuth, requireVerified, getProfile);

export default router;
