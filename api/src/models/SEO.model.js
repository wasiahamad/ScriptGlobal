import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("SEO", "seo", {
    pageType: String,
    referenceId: objectIdRef("Content"),
    title: String,
    description: String,
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    robots: String,
    schemaMarkup: Object,
});
