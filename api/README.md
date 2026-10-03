# SciScript API

Node.js, Express, MongoDB and Mongoose API for the public portfolio and admin CMS.

## Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run dev` for development or `npm start` for production.

The API is versioned under `/api/v1`. Public routes are read-only and filter to `published`, `isActive` and non-deleted content. Admin routes require the HTTP-only cookie created by `/api/v1/auth/login`.

## Main routes

- `GET /health`
- `POST /api/v1/auth/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`, `GET /me`
- `GET /api/v1/public/home`, `/global`, `/services`, `/projects`, `/publications`, `/faqs`
- `POST /api/v1/public/contact-inquiries`
- Authenticated CRUD, publishing and reorder operations under `/api/v1/admin/*`
- `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/activity-logs`
- `POST /api/v1/admin/media` with `multipart/form-data` field `file`

Content is stored in separate MongoDB documents by `contentType`, with common publishing metadata and flexible section data. When Cloudinary credentials are present, uploads are optimized with Sharp and stored in Cloudinary; local optimized files are used for development otherwise. Seed provisioning is environment-driven, so production credentials are never committed.

## Environment

Set `MONGO_URI`, `JWT_SECRET`, and the `PUBLIC_SITE_URL`/`ADMIN_SITE_URL` origins. Add the three `CLOUDINARY_*` variables for production media storage. To seed the first administrator, also set `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`, then run `npm run seed`.

The current API foundation uses a shared content document with a strict `contentType` boundary. Named per-entity schemas, admin-user management screens, SMTP delivery, and OpenAPI generation remain follow-up work before a production deployment review.
