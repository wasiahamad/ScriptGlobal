import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 40 },
    researchArea: { type: String, trim: true, maxlength: 160 },
    serviceRequired: { type: String, trim: true, maxlength: 160 },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    preferredContactMethod: {
      type: String,
      enum: ["email", "phone", "either"],
      default: "email",
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "spam"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ContactInquiry", schema);
