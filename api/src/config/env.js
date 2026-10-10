import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

function getMongoUri() {
  const sourceUri = process.env.MONGO_URI;
  if (!sourceUri || !sourceUri.startsWith("mongodb+srv://")) return sourceUri;

  const source = new URL(sourceUri);
  if (source.hostname !== "sciscript.zld8ieq.mongodb.net") return sourceUri;

  const hosts = [
    "ac-zuzsrwd-shard-00-00.zld8ieq.mongodb.net:27017",
    "ac-zuzsrwd-shard-00-01.zld8ieq.mongodb.net:27017",
    "ac-zuzsrwd-shard-00-02.zld8ieq.mongodb.net:27017",
  ].join(",");
  return `mongodb://${source.username}:${source.password}@${hosts}/sciscript?authSource=admin&replicaSet=atlas-azt9j5-shard-0&tls=true`;
}

const isProduction = process.env.NODE_ENV === "production";
const requiredProductionEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "PUBLIC_SITE_URL",
  "ADMIN_SITE_URL",
];
if (isProduction) {
  const missing = requiredProductionEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 8000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri:
    process.env.DISABLE_DATABASE === "true" ? undefined : getMongoUri(),
  jwtSecret: process.env.JWT_SECRET || "local-development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "30d",
  cookieName: process.env.COOKIE_NAME || "sciscript_admin_token",
  publicSiteUrl: process.env.PUBLIC_SITE_URL,
  adminSiteUrl: process.env.ADMIN_SITE_URL,
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    notifyTo: process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_USER,
  },
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPrefix: process.env.CLOUDINARY_UPLOAD_PREFIX || "https://api-eu.cloudinary.com",
  },
};
