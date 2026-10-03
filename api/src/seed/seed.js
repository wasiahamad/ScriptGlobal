import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import AdminUser from "../models/AdminUser.model.js";
import Content from "../models/content.model.js";

await connectDatabase();
const { SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
if (!SEED_ADMIN_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD)
    throw new Error(
        "Set SEED_ADMIN_NAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before seeding",
    );
await AdminUser.updateOne(
    { email: SEED_ADMIN_EMAIL.toLowerCase() },
    {
        $setOnInsert: {
            name: SEED_ADMIN_NAME,
            email: SEED_ADMIN_EMAIL.toLowerCase(),
            passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12),
            role: "super_admin",
        },
    },
    { upsert: true },
);
await Content.bulkWrite([
    {
        updateOne: {
            filter: { contentType: "home", isDeleted: false },
            update: {
                $setOnInsert: { contentType: "home", status: "draft", data: {} },
            },
            upsert: true,
        },
    },
    {
        updateOne: {
            filter: { contentType: "research-integrity", isDeleted: false },
            update: {
                $setOnInsert: {
                    contentType: "research-integrity",
                    status: "draft",
                    data: {
                        principles: [
                            "Accurate Attribution",
                            "No Fabricated Information",
                            "Responsible AI Use",
                            "Confidentiality",
                            "Ethical Originality",
                        ],
                    },
                },
            },
            upsert: true,
        },
    },
]);
console.log("Seed complete");
process.exit(0);
