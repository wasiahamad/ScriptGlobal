import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import Content from "../models/content.model.js";
import { success } from "../utils/apiResponse.js";
import homeRoutes from './home.routes.js';
import profileRoutes from './profile.routes.js';
import serviceRoutes from './service.routes.js';
import expertiseRoutes from './expertise.routes.js';
import researchRoutes from './research.routes.js';
import publicationRoutes from './publication.routes.js';
import projectRoutes from './project.routes.js';
import scientificVisualRoutes from './scientificVisual.routes.js';
import thesisRoutes from './thesis.routes.js';
import editingRoutes from './editing.routes.js';
import publicationSupportRoutes from './publicationSupport.routes.js';
import peerReviewRoutes from './peerReview.routes.js';
import researchIntegrityRoutes from './researchIntegrity.routes.js';
import faqRoutes from './faq.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import navigationRoutes from './navigation.routes.js';
import footerRoutes from './footer.routes.js';
import contactRoutes from './contact.routes.js';
import settingsRoutes from './settings.routes.js';
import seoRoutes from './seo.routes.js';
import blogPostRoutes from './blogPost.routes.js';

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get(
  "/home",
  asyncHandler(async (req, res) => {
    const items = await Content.find({
      contentType: {
        $in: [
          "home",
          "services",
          "expertise",
          "projects",
          "scientific-visuals",
          "publications",
          "faqs",
          "research-integrity",
        ],
      },
      status: "published",
      isActive: true,
      isDeleted: false,
    })
      .sort({ displayOrder: 1 })
      .lean();
    const home = items.find((item) => item.contentType === "home") || {};
    const byType = (type) => items.filter((item) => item.contentType === type);
    return success(
      res,
      {
        ...home.data,
        services: byType("services"),
        expertise: byType("expertise"),
        selectedWork: byType("projects"),
        scientificVisuals: byType("scientific-visuals"),
        research: byType("publications"),
        faqs: byType("faqs"),
        integrity: byType("research-integrity")[0] || null,
      },
      "Home fetched successfully",
    );
  }),
);

publicRouter.get(
  "/global",
  asyncHandler(async (req, res) => {
    const items = await Content.find({
      contentType: {
        $in: ["navigation", "footer", "contact", "settings", "seo"],
      },
      status: "published",
      isActive: true,
      isDeleted: false,
    }).lean();
    const one = (type) =>
      items.find((item) => item.contentType === type) || null;
    return success(
      res,
      {
        navigation: one("navigation"),
        footer: one("footer"),
        contact: one("contact"),
        settings: one("settings"),
        seo: one("seo"),
      },
      "Global data fetched successfully",
    );
  }),
);

const routeMounts = [
  ['home', homeRoutes], ['profile', profileRoutes], ['services', serviceRoutes], ['expertise', expertiseRoutes],
  ['research', researchRoutes], ['publications', publicationRoutes], ['projects', projectRoutes], ['scientific-visuals', scientificVisualRoutes],
  ['thesis', thesisRoutes], ['editing', editingRoutes], ['publication-support', publicationSupportRoutes], ['peer-review', peerReviewRoutes],
  ['research-integrity', researchIntegrityRoutes], ['faqs', faqRoutes], ['testimonials', testimonialRoutes], ['navigation', navigationRoutes],
  ['footer', footerRoutes], ['contact', contactRoutes], ['settings', settingsRoutes], ['seo', seoRoutes],
  ['blog-posts', blogPostRoutes],
];

for (const [path, routes] of routeMounts) {
  publicRouter.use(`/${path}`, routes.publicRouter);
  adminRouter.use(`/${path}`, routes.adminRouter);
}
