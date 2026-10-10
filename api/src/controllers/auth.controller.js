import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import { env } from '../config/env.js';
import { failure, success } from '../utils/apiResponse.js';
import { createOpaqueToken, hashToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { recordActivity } from '../services/activity.service.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: env.cookieSameSite,
  secure: env.nodeEnv === 'production',
};
export const accessCookieOptions = { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 };
export const refreshCookieOptions = { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000, path: '/api/v1/auth' };

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ email: email.toLowerCase(), isActive: true }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return failure(res, 'Invalid credentials', [], 401);
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie(env.cookieName, signAccessToken(user), accessCookieOptions);
  res.cookie(`${env.cookieName}_refresh`, signRefreshToken(user), refreshCookieOptions);
  await recordActivity({ adminUser: user._id, action: 'LOGIN', entityType: 'AdminUser', entityId: user._id, description: 'Admin logged in' });
  return success(res, { name: user.name, email: user.email, role: user.role }, 'Login successful');
}

export async function logout(req, res) {
  if (req.cookies[env.cookieName]) {
    try {
      const payload = jwt.verify(req.cookies[env.cookieName], env.jwtSecret);
      await recordActivity({ adminUser: payload.sub, action: 'LOGOUT', entityType: 'AdminUser', entityId: payload.sub, description: 'Admin logged out' });
    } catch {}
  }
  res.clearCookie(env.cookieName, accessCookieOptions);
  res.clearCookie(`${env.cookieName}_refresh`, refreshCookieOptions);
  return success(res, null, 'Logout successful');
}

export async function refresh(req, res) {
  const token = req.cookies[`${env.cookieName}_refresh`];
  if (!token) return failure(res, 'Refresh token required', [], 401);
  const payload = jwt.verify(token, env.jwtSecret);
  if (payload.type !== 'refresh') return failure(res, 'Invalid refresh token', [], 401);
  const user = await AdminUser.findOne({ _id: payload.sub, isActive: true });
  if (!user) return failure(res, 'Invalid refresh token', [], 401);
  res.cookie(env.cookieName, signAccessToken(user), accessCookieOptions);
  return success(res, null, 'Session refreshed successfully');
}

export function me(req, res) { return success(res, req.adminUser, 'Session fetched successfully'); }

export async function forgotPassword(req, res) {
  const user = await AdminUser.findOne({ email: req.body.email.toLowerCase(), isActive: true });
  if (user) {
    const token = createOpaqueToken();
    await PasswordResetToken.deleteMany({ adminUser: user._id });
    await PasswordResetToken.create({ adminUser: user._id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
  }
  return success(res, null, 'If the account exists, password reset instructions have been issued');
}

export async function resetPassword(req, res) {
  const reset = await PasswordResetToken.findOne({ tokenHash: hashToken(req.body.token), expiresAt: { $gt: new Date() } });
  if (!reset) return failure(res, 'Invalid or expired reset token', [], 400);
  await AdminUser.findByIdAndUpdate(reset.adminUser, { passwordHash: await bcrypt.hash(req.body.password, 12) });
  await PasswordResetToken.deleteOne({ _id: reset._id });
  return success(res, null, 'Password reset successfully');
}
