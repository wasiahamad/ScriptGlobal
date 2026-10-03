import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteMedia,
  listMedia,
  updateMedia,
  uploadMedia,
} from "../controllers/media.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)),
});

router.post("/", requireAuth, upload.single("file"), asyncHandler(uploadMedia));
router.get("/", requireAuth, asyncHandler(listMedia));
router.put("/:id", requireAuth, asyncHandler(updateMedia));
router.delete("/:id", requireAuth, asyncHandler(deleteMedia));
export default router;
