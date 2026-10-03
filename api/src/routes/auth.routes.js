import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/common.validators.js";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();
router.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  asyncHandler(login),
);
router.post("/logout", asyncHandler(logout));
router.post("/refresh", asyncHandler(refresh));
router.get("/me", requireAuth, me);
router.post(
  "/forgot-password",
  authRateLimit,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);
router.post(
  "/reset-password",
  authRateLimit,
  validateBody(resetPasswordSchema),
  asyncHandler(resetPassword),
);
export default router;
