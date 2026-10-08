import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";
import HomePage from "../models/HomePage.model.js";
import Profile from "../models/Profile.model.js";
import Service from "../models/Service.model.js";
import Expertise from "../models/Expertise.model.js";
import Research from "../models/Research.model.js";
import Publication from "../models/Publication.model.js";
import Project from "../models/Project.model.js";
import ScientificVisual from "../models/ScientificVisual.model.js";
import ThesisPage from "../models/ThesisPage.model.js";
import EditingPage from "../models/EditingPage.model.js";
import PublicationSupport from "../models/PublicationSupport.model.js";
import PeerReview from "../models/PeerReview.model.js";
import ResearchIntegrity from "../models/ResearchIntegrity.model.js";
import FAQ from "../models/FAQ.model.js";
import Testimonial from "../models/Testimonial.model.js";
import Navigation from "../models/Navigation.model.js";
import Footer from "../models/Footer.model.js";
import ContactSettings from "../models/ContactSettings.model.js";
import GlobalSettings from "../models/GlobalSettings.model.js";
import SEO from "../models/SEO.model.js";
import BlogPost from "../models/BlogPost.model.js";

const modelByType = {
  home: HomePage,
  profile: Profile,
  services: Service,
  expertise: Expertise,
  research: Research,
  publications: Publication,
  projects: Project,
  "scientific-visuals": ScientificVisual,
  thesis: ThesisPage,
  editing: EditingPage,
  "publication-support": PublicationSupport,
  "peer-review": PeerReview,
  "research-integrity": ResearchIntegrity,
  faqs: FAQ,
  testimonials: Testimonial,
  navigation: Navigation,
  footer: Footer,
  contact: ContactSettings,
  settings: GlobalSettings,
  seo: SEO,
  "blog-posts": BlogPost,
};
function modelFor(type) {
  return modelByType[type];
}

export const resourceTypes = [
  "home",
  "profile",
  "services",
  "expertise",
  "research",
  "publications",
  "projects",
  "scientific-visuals",
  "thesis",
  "editing",
  "publication-support",
  "peer-review",
  "research-integrity",
  "faqs",
  "testimonials",
  "navigation",
  "footer",
  "contact",
  "settings",
  "seo",
  "blog-posts",
];
export const singletonTypes = new Set([
  "home",
  "profile",
  "thesis",
  "editing",
  "publication-support",
  "peer-review",
  "research-integrity",
  "footer",
  "contact",
  "settings",
]);

function filterFor(type, publicOnly) {
  const filter = { contentType: type, isDeleted: false };
  if (publicOnly)
    Object.assign(filter, { status: "published", isActive: true });
  return filter;
}

export async function listContent(type, query, publicOnly = false) {
  const Model = modelFor(type);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const filter = filterFor(type, publicOnly);
  if (publicOnly && (type === "faqs" || type === "testimonials")) {
    delete filter.isActive;
  }
  if (query.status && !publicOnly) filter.status = query.status;
  if (query.category) filter["data.category"] = query.category;
  if (query.search) filter.$text = { $search: query.search };
  const sort = {
    [query.sort || "displayOrder"]: query.order === "desc" ? -1 : 1,
    createdAt: -1,
  };
  const [data, total] = await Promise.all([
    Model.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Model.countDocuments(filter),
  ]);
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getContent(type, key, publicOnly = false) {
  const Model = modelFor(type);
  const filter = filterFor(type, publicOnly);
  if (singletonTypes.has(type))
    return Model.findOne(filter).sort({ updatedAt: -1 }).lean();

  const lookup = mongoose.isValidObjectId(key)
    ? { $or: [{ _id: key }, { slug: key }] }
    : { slug: key };

  return Model.findOne({
    ...filter,
    ...lookup,
  }).lean();
}

export async function saveContent(type, body, userId, id) {
  const Model = modelFor(type);
  const payload = { ...body, contentType: type, updatedBy: userId };
  delete payload.id;
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.created_at;
  delete payload.updated_at;
  delete payload.createdBy;
  delete payload.created_by;
  delete payload.deletedAt;
  delete payload.deleted_at;
  if (payload.title && !payload.slug) payload.slug = slugify(payload.title);
  if (payload.status === "published")
    payload.publishedAt = payload.publishedAt || new Date();
  if (id)
    return Model.findOneAndUpdate(
      { _id: id, contentType: type, isDeleted: false },
      payload,
      { new: true, runValidators: true, upsert: false },
    );
  if (singletonTypes.has(type))
    return Model.findOneAndUpdate(
      { contentType: type, isDeleted: false },
      {
        $set: payload,
        $setOnInsert: { createdBy: userId },
      },
      { new: true, runValidators: true, upsert: true },
    );
  return Model.create({ ...payload, createdBy: userId });
}

export async function softDeleteContent(type, id, userId) {
  return modelFor(type).findOneAndUpdate(
    { _id: id, contentType: type, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    { new: true },
  );
}

export async function updateContentStatus(type, id, status, userId) {
  return modelFor(type).findOneAndUpdate(
    { _id: id, contentType: type, isDeleted: false },
    {
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      updatedBy: userId,
    },
    { new: true, runValidators: true },
  );
}

export async function reorderContent(type, items, userId) {
  await modelFor(type).bulkWrite(
    items.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id, contentType: type, isDeleted: false },
        update: { displayOrder, updatedBy: userId },
      },
    })),
  );
  return listContent(type, { page: 1, limit: 100, sort: "displayOrder" });
}
