import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("FAQ", "faqs", {
  question: { type: String, maxlength: 500 },
  answer: String,
  category: String,
  relatedService: objectIdRef("Service"),
  relatedExpertise: objectIdRef("Expertise"),
});
