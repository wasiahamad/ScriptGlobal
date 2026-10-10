import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import mediaRoutes from './routes/media.routes.js';
import { publicRouter, adminRouter } from './routes/content.routes.js';
import { publicRateLimit } from './middleware/rateLimit.middleware.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';

const app = express();
app.use(helmet());
const allowedOrigins = [
    env.publicSiteUrl,
    env.adminSiteUrl,
    "http://localhost:5173",
    "https://scriptglobal.mdwasia98.workers.dev",
    "https://scriptglobal-admin.mdwasia98.workers.dev",
    "https://sciscriptglobal.com",
    "https://www.sciscriptglobal.com",
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/api/v1', publicRateLimit);
app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/public/contact-inquiries', inquiryRoutes);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/activity-logs', activityRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/admin-users', adminUserRoutes);
app.use('/api/v1/admin/contact-inquiries', inquiryRoutes);
app.use('/api/v1/admin/media', mediaRoutes);
app.use('/uploads', express.static(env.uploadDir));
app.use(notFound);
app.use(errorHandler);
export default app;
