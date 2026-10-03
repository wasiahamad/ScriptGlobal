import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Research", "research", {
    researchType: Object,
    researchArea: String,
    scientificContext: String,
    challenge: String,
    contribution: String,
    workflow: [Object],
    featuredImage: objectIdRef("Media"),
    gallery: objectIdArray("Media"),
    scientificVisuals: objectIdArray("ScientificVisual"),
    references: [Object],
    externalLinks: [Object],
    relatedServices: objectIdArray("Service"),
    relatedExpertise: objectIdArray("Expertise"),
    seo: objectIdRef("SEO"),
});
