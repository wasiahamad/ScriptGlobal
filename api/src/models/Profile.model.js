import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Profile", "profile", {
    name: String,
    professionalTitle: String,
    biography: String,
    profileImage: objectIdRef("Media"),
    location: Object,
    contact: Object,
    social: Object,
    professionalFocus: [String],
    contributionAreas: [Object],
});
