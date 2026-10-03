import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import Media from '../models/Media.model.js';
import { env } from '../config/env.js';
import { isCloudinaryConfigured, uploadBuffer } from '../config/cloudinary.js';
import { failure, success } from '../utils/apiResponse.js';

export async function uploadMedia(req, res) {
  if (!req.file) return failure(res, 'A valid image file is required', [], 422);
  const filename = `${crypto.randomUUID()}.webp`;
  const optimized = await sharp(req.file.buffer).rotate().webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  let secureUrl = `/uploads/${filename}`;
  let publicId = filename;
  if (isCloudinaryConfigured()) {
    const result = await uploadBuffer(optimized.data, { public_id: filename.replace('.webp', '') });
    secureUrl = result.secure_url;
    publicId = result.public_id;
  } else {
    const outputDir = path.resolve(env.uploadDir);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, filename), optimized.data);
  }
  const media = await Media.create({ originalName: req.file.originalname, filename: publicId, secureUrl, width: optimized.info.width, height: optimized.info.height, format: 'webp', size: optimized.data.length, altText: req.body.altText, caption: req.body.caption, category: req.body.category, uploadedBy: req.adminUser._id });
  return success(res, media, 'Media uploaded successfully', null, 201);
}

export async function listMedia(req, res) { return success(res, await Media.find().sort({ createdAt: -1 }).limit(100).lean(), 'Media fetched successfully'); }
export async function updateMedia(req, res) { const media = await Media.findByIdAndUpdate(req.params.id, { $set: { altText: req.body.altText, caption: req.body.caption, category: req.body.category } }, { new: true, runValidators: true }); return media ? success(res, media, 'Media updated successfully') : failure(res, 'Media not found', [], 404); }
export async function deleteMedia(req, res) { const media = await Media.findByIdAndDelete(req.params.id); return media ? success(res, media, 'Media deleted successfully') : failure(res, 'Media not found', [], 404); }
