import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("ScientificVisual", "scientific-visuals", {
    category: String,
    mainImage: String,
    thumbnail: String,
    gallery: objectIdArray("Media"),
    caption: String,
    altText: String,
    relatedProject: objectIdRef("Project"),
    relatedResearch: objectIdRef("Research"),
    relatedPublication: objectIdRef("Publication"),
    relatedExpertise: objectIdRef("Expertise"),
    seo: { type: Object, default: {} },
});
