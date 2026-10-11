import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import { env } from '../config/env.js';
import { failure, success } from '../utils/apiResponse.js';
import { createOpaqueToken, hashToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { recordActivity } from '../services/activity.service.js';
import crypto from 'node:crypto';
import AdminPasswordOtp from '../models/AdminPasswordOtp.model.js';
import { sendPasswordChangeOtp } from '../services/email.service.js';

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

export async function requestPasswordChangeOtp(req, res) {
  const code = crypto.randomInt(100000, 1000000).toString();
  await AdminPasswordOtp.deleteMany({ adminUser: req.adminUser._id });
  await AdminPasswordOtp.create({
    adminUser: req.adminUser._id,
    codeHash: hashToken(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendPasswordChangeOtp(req.adminUser, code);
  } catch (error) {
    await AdminPasswordOtp.deleteMany({ adminUser: req.adminUser._id });
    console.error("Password change OTP delivery failed:", error);
    return failure(res, "Unable to send the verification code. Please try again later.", [], 503);
  }

  return success(res, { email: req.adminUser.email }, "Verification code sent to your registered email");
}

export async function changePasswordWithOtp(req, res) {
  const otp = await AdminPasswordOtp.findOne({
    adminUser: req.adminUser._id,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (!otp) return failure(res, "Verification code expired or not requested", [], 400);
  if (otp.attempts >= 5) {
    await otp.deleteOne();
    return failure(res, "Too many invalid attempts. Request a new verification code.", [], 429);
  }

  if (hashToken(req.body.code) !== otp.codeHash) {
    otp.attempts += 1;
    await otp.save();
    return failure(res, "Invalid verification code", [], 400);
  }

  const user = await AdminUser.findById(req.adminUser._id).select("+passwordHash");
  if (!user || !user.isActive) return failure(res, "Admin account is not active", [], 401);
  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  await user.save();
  await otp.deleteOne();
  await recordActivity({
    adminUser: req.adminUser._id,
    action: "PASSWORD_CHANGED",
    entityType: "AdminUser",
    entityId: req.adminUser._id,
    description: "Admin password changed after email OTP verification",
  });
  return success(res, null, "Password updated successfully");
}

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
