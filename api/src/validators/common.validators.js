import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(8).max(200),
});
export const forgotPasswordSchema = z.object({
  email: z.string().email().max(160),
});
export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(200),
});
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().trim().max(40).optional(),
  researchArea: z.string().trim().max(160).optional(),
  serviceRequired: z.string().trim().max(160).optional(),
  projectDescription: z.string().trim().min(10).max(10000),
  preferredContactMethod: z.enum(["email", "phone", "either"]).default("email"),
});
