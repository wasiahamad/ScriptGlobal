import { createContentModel } from "./_createContentModel.js";
export default createContentModel("Footer", "footer", {
  brandDescription: String,
  navigationGroups: [Object],
  serviceLinks: [Object],
  socialLinks: [Object],
  copyrightText: String,
});
