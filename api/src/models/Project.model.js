import mongoose from "mongoose";
import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Project", "projects", {
    projectType: String,
    researchArea: String,
    shortSummary: String,
    overview: String,
    scientificContext: String,
    challenge: String,
    contribution: String,
    workflow: [Object],
    deliverables: [String],
    outcome: String,
    featuredImage: { type: mongoose.Schema.Types.Mixed, default: null },
    gallery: objectIdArray("Media"),
    scientificVisuals: objectIdArray("ScientificVisual"),
    references: [Object],
    externalLinks: [Object],
    relatedServices: objectIdArray("Service"),
    relatedExpertise: objectIdArray("Expertise"),
    relatedPublications: objectIdArray("Publication"),
    seo: { type: Object, default: {} },
});
