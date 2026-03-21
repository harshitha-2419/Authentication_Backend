import { Router } from "express";
import { requireAuth, requireVerified } from "../middlewares/auth";
import { getProfile } from "../controllers/userController";

const router = Router();

// All routes below require: valid JWT + verified email
router.use(requireAuth, requireVerified);

// GET /api/user/profile
router.get("/profile", getProfile);

export default router;
