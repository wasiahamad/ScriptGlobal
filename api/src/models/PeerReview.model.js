import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("PeerReview", "peer-review", {
    heading: String,
    introduction: String,
    reviewAreas: [Object],
    process: [Object],
    images: objectIdArray("Media"),
    externalEvidence: [Object],
    cta: Object,
    seo: objectIdRef("SEO"),
});
