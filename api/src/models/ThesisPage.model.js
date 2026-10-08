import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("ThesisPage", "thesis", {
    heading: String,
    introduction: String,
    supportItems: [Object],
    workflow: [Object],
    images: objectIdArray("Media"),
    cta: Object,
    seo: { type: Object, default: {} },
});
