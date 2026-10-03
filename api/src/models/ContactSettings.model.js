import { createContentModel } from "./_createContentModel.js";
export default createContentModel("ContactSettings", "contact", {
  name: String,
  role: String,
  email: String,
  phone: String,
  location: Object,
  social: Object,
  contactPage: Object,
});
