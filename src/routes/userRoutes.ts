import { Router } from "express";
import { requireAuth, requireVerified } from "../middlewares/auth";
import { getProfile, getSessions, revokeSession, getLoginHistory } from "../controllers/userController";

const router = Router();

router.use(requireAuth, requireVerified);

// GET /api/user/profile
router.get("/profile", getProfile);

// GET /api/user/sessions
router.get("/sessions", getSessions);

// DELETE /api/user/sessions/:sessionId
router.delete("/sessions/:sessionId", revokeSession);

// GET /api/user/login-history
router.get("/login-history", getLoginHistory);

export default router;
