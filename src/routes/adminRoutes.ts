import { Router } from "express";
import { requireAuth, requireVerified, requireRole } from "../middlewares/auth";
import { getAllUsers, deleteUser, updateUserRole } from "../controllers/adminController";

const router = Router();

// All admin routes require valid JWT + verified email
router.use(requireAuth, requireVerified);

// GET /api/admin/users — admin and super_admin
router.get("/users", requireRole("admin", "super_admin"), getAllUsers);

// DELETE /api/admin/users/:id — super_admin only
router.delete("/users/:id", requireRole("super_admin"), deleteUser);

// PATCH /api/admin/users/:id/role — super_admin only
router.patch("/users/:id/role", requireRole("super_admin"), updateUserRole);

export default router;
