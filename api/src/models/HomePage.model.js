import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("HomePage", "home", {
  hero: mongooseMixed(),
  introduction: mongooseMixed(),
  servicesSection: { type: Object, default: {} },
  expertiseSection: { type: Object, default: {} },
  selectedWorkSection: { type: Object, default: {} },
  visualsSection: { type: Object, default: {} },
  researchSection: { type: Object, default: {} },
  integritySection: { type: Object, default: {} },
  faqSection: { type: Object, default: {} },
  serviceIds: objectIdArray("Service"),
  expertiseIds: objectIdArray("Expertise"),
  projectIds: objectIdArray("Project"),
  visualIds: objectIdArray("ScientificVisual"),
  publicationIds: objectIdArray("Publication"),
  faqIds: objectIdArray("FAQ"),
  workflow: [Object],
});
function mongooseMixed() {
  return { type: Object, default: {} };
}
