import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { listActivityLogs } from "../controllers/activityLog.controller.js";

const router = Router();
router.get(
  "/",
  requireAuth,
  requireRole("super_admin", "content_manager"),
  asyncHandler(listActivityLogs),
);
export default router;
