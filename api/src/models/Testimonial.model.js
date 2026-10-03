import { createContentModel } from "./_createContentModel.js";
export default createContentModel("Testimonial", "testimonials", {
    name: String,
    designation: String,
    organization: String,
    profileImage: String,
    testimonial: String,
    linkedinUrl: String,
    websiteUrl: String,
});
