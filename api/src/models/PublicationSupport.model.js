import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("PublicationSupport", "publication-support", {
    heading: String,
    introduction: String,
    steps: [Object],
    images: objectIdArray("Media"),
    cta: Object,
    seo: { type: Object, default: {} },
});
