import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("ResearchIntegrity", "research-integrity", {
    heading: String,
    introduction: String,
    principles: [Object],
    seo: { type: Object, default: {} },
});
