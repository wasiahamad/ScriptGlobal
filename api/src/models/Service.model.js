import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Service", "services", {
    benefits: [Object],
    deliverables: [String],
    process: [Object],
    cta: Object,
    seo: objectIdRef("SEO"),
});
