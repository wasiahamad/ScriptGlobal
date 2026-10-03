import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
        action: {
            type: String,
            required: true,
            enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "PUBLISH",
                "UNPUBLISH",
                "ARCHIVE",
                "LOGIN",
                "LOGOUT",
                "UPLOAD",
            ],
        },
        entityType: { type: String, required: true },
        entityId: mongoose.Schema.Types.ObjectId,
        description: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("ActivityLog", schema);
