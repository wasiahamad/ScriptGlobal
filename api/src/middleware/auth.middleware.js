import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { failure } from "../utils/apiResponse.js";
import AdminUser from "../models/AdminUser.model.js";

export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies[env.cookieName];
        if (!token) return failure(res, "Authentication required", [], 401);
        const payload = jwt.verify(token, env.jwtSecret);
        if (payload.type !== "access")
            return failure(res, "Invalid session", [], 401);
        const user = await AdminUser.findOne({
            _id: payload.sub,
            isActive: true,
        }).select("-passwordHash");
        if (!user) return failure(res, "Authentication required", [], 401);
        req.adminUser = user;
        return next();
    } catch {
        return failure(res, "Invalid or expired session", [], 401);
    }
}

export function requireRole(...roles) {
    return (req, res, next) =>
        roles.includes(req.adminUser?.role)
            ? next()
            : failure(res, "Insufficient permissions", [], 403);
}
