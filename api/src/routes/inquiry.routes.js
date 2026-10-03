import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { inquirySchema } from "../validators/common.validators.js";
import {
  createContactInquiry,
  deleteContactInquiry,
  listContactInquiries,
  updateContactInquiryStatus,
} from "../controllers/contact.controller.js";

const router = Router();
router.post(
  "/",
  validateBody(inquirySchema),
  asyncHandler(createContactInquiry),
);
router.get("/", requireAuth, asyncHandler(listContactInquiries));
router.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(updateContactInquiryStatus),
);
router.delete("/:id", requireAuth, asyncHandler(deleteContactInquiry));
export default router;
