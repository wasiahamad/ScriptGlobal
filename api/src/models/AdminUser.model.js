import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: ["super_admin", "content_manager", "editor"],
            default: "editor",
        },
        isActive: { type: Boolean, default: true },
        lastLoginAt: Date,
    },
    { timestamps: true },
);

export default mongoose.model("AdminUser", adminUserSchema);
