import mongoose from "mongoose";

export const contentFields = {
  title: { type: String, trim: true, maxlength: 240 },
  slug: { type: String, trim: true, lowercase: true, index: true },
  shortDescription: { type: String, trim: true, maxlength: 1000 },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0, index: true },
  publishedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date,
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
};

export const objectIdRef = (ref) => ({ type: mongoose.Schema.Types.ObjectId, ref });
export const objectIdArray = (ref) => [{ type: mongoose.Schema.Types.ObjectId, ref }];

export function createContentModel(name, contentType, fields = {}) {
  const schema = new mongoose.Schema(
    {
      ...contentFields,
      ...fields,
      contentType: {
        type: String,
        default: contentType,
        immutable: true,
        index: true,
      },
    },
    { timestamps: true, collection: "contents", strict: false },
  );
  schema.index(
    { contentType: 1, slug: 1 },
    {
      unique: true,
      partialFilterExpression: { slug: { $type: "string" }, isDeleted: false },
    },
  );
  return mongoose.models[name] || mongoose.model(name, schema);
}
