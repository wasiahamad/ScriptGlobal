import { createContentModel, objectIdArray, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Expertise", "expertise", {
  icon: String,
  coverImage: String,
  gallery: objectIdArray("Media"),
  relatedServices: objectIdArray("Service"),
  relatedProjects: objectIdArray("Project"),
  seo: { type: Object, default: {} },
});
