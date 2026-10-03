import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        secureUrl: { type: String, required: true },
        thumbnailUrl: String,
        width: Number,
        height: Number,
        format: String,
        size: Number,
        altText: { type: String, trim: true, maxlength: 240 },
        caption: { type: String, trim: true, maxlength: 1000 },
        category: { type: String, trim: true },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
            required: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Media", schema);
