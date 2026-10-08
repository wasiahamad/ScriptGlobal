import mongoose from "mongoose";
import { createContentModel } from "./_createContentModel.js";
export default createContentModel("Footer", "footer", {
  brandDescription: String,
  navigationGroups: { type: mongoose.Schema.Types.Mixed, default: [] },
  serviceLinks: { type: mongoose.Schema.Types.Mixed, default: [] },
  socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  copyrightText: String,
  legal: { type: mongoose.Schema.Types.Mixed, default: {} },
});
