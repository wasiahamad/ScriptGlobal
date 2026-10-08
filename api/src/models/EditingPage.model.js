import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("EditingPage", "editing", {
  heading: String,
  introduction: String,
  editingAreas: [Object],
  responsibleAI: Object,
  originalityApproach: [Object],
  images: objectIdArray("Media"),
  cta: Object,
  seo: { type: Object, default: {} },
});
