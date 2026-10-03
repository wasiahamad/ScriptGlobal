import { createContentModel } from "./_createContentModel.js";
export default createContentModel("GlobalSettings", "settings", {
  siteName: String,
  tagline: String,
  logo: String,
  darkLogo: String,
  favicon: String,
  defaultLanguage: String,
  timezone: String,
  theme: Object,
  analytics: Object,
  maintenanceMode: Boolean,
});
