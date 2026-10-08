import { createContentModel } from "./_createContentModel.js";
export default createContentModel("Service", "services", {
    benefits: [String],
    deliverables: [String],
    process: [String],
    cta: Object,
    seo: { type: Object, default: {} },
});
