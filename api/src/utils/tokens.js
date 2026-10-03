import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role, type: "access" },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn },
    );
}
export function signRefreshToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), type: "refresh" },
        env.jwtSecret,
        { expiresIn: env.refreshExpiresIn },
    );
}
export function createOpaqueToken() {
    return crypto.randomBytes(32).toString("hex");
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
