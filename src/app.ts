import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB, ENV } from "./config";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorHandler } from "./middlewares/validation";

dotenv.config();

const app = express();

// ─── Secure Headers (Helmet) ──────────────────────────────────────────────────
// Sets various HTTP headers to protect against common attacks
// e.g. XSS, clickjacking, sniffing, etc.
app.use(helmet());

// ─── CORS Configuration ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // allow cookies / auth headers
}));

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// General limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter — for sensitive auth routes (login, register, OTP, password reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window (increase for dev testing)
  message: { success: false, message: "Too many attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter to all routes
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth routes — strict rate limit on sensitive endpoints
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/login-otp", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(` Server running on http://localhost:${ENV.PORT}`);
    console.log(` Register         → POST /api/auth/register`);
    console.log(` Verify OTP       → POST /api/auth/verify-otp`);
    console.log(` Login            → POST /api/auth/login`);
    console.log(` Login OTP        → POST /api/auth/login-otp`);
    console.log(` Refresh Token    → POST /api/auth/refresh-token`);
    console.log(` Forgot Password  → POST /api/auth/forgot-password`);
    console.log(` Reset Password   → POST /api/auth/reset-password`);
    console.log(` Logout           → POST /api/auth/logout`);
    console.log(` Me               → GET  /api/auth/me  [protected]`);
  });
};

startServer();
