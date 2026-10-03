import mongoose from "mongoose";

const common = {
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
};

const contentSchema = new mongoose.Schema(
    {
        ...common,
        contentType: { type: String, required: true, index: true },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true, strict: false },
);

contentSchema.index(
    { contentType: 1, slug: 1 },
    {
        unique: true,
        partialFilterExpression: { slug: { $type: "string" }, isDeleted: false },
    },
);
contentSchema.index({
    title: "text",
    shortDescription: "text",
    description: "text",
    slug: "text",
});

export default mongoose.model("Content", contentSchema);
