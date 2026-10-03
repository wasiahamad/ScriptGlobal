import { createContentModel } from './_createContentModel.js';

export default createContentModel('BlogPost', 'blog-posts', {
  title: { type: String, required: true, trim: true, maxlength: 240 },
  slug: { type: String, required: true, trim: true, lowercase: true, index: true },
  seoTitle: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
  focusKeyword: { type: String, trim: true },
  secondaryKeywords: { type: [String], default: [] },
  excerpt: { type: String, trim: true },
  featuredImage: { type: String, trim: true },
  author: { type: String, trim: true },
  category: { type: String, trim: true },
  content: { type: String, default: '' },
  canonicalUrl: { type: String, trim: true },
  publishedAt: Date,
});
