import { Router } from "express";
import Content from "../models/content.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const types = [
      "services",
      "expertise",
      "projects",
      "publications",
      "scientific-visuals",
      "faqs",
      "testimonials",
    ];
    const counts = await Content.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { type: "$contentType", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);
    const stats = Object.fromEntries(
      types.map((type) => [
        type.replace("-", ""),
        counts
          .filter((item) => item._id.type === type)
          .reduce((total, item) => total + item.count, 0),
      ]),
    );
    stats.drafts = counts
      .filter((item) => item._id.status === "draft")
      .reduce((total, item) => total + item.count, 0);
    stats.published = counts
      .filter((item) => item._id.status === "published")
      .reduce((total, item) => total + item.count, 0);
    stats.recentActivity = await ActivityLog.find()
      .populate("adminUser", "name email")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return success(res, stats, "Dashboard fetched successfully");
  }),
);
export default router;
