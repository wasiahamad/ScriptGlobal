import crypto from 'node:crypto';
import sharp from 'sharp';
import Media from '../models/Media.model.js';
import { isCloudinaryConfigured, uploadBuffer } from '../config/cloudinary.js';
import { failure, success } from '../utils/apiResponse.js';

export async function uploadMedia(req, res) {
  if (!req.file) return failure(res, 'A valid image file is required', [], 422);
  if (!isCloudinaryConfigured()) return failure(res, 'Cloudinary is not configured. Add valid Cloudinary credentials and restart the API.', [], 503);
  const filename = `${crypto.randomUUID()}.webp`;
  const optimized = await sharp(req.file.buffer).rotate().webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  let result;
  try {
    result = await uploadBuffer(optimized.data, { public_id: filename.replace('.webp', '') });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    const detail = error?.error?.message || error?.message || 'Unknown Cloudinary error';
    return failure(res, `Cloudinary upload failed: ${detail}`, [], 502);
  }
  const upload = { secureUrl: result.secure_url, publicId: result.public_id };

  const media = await Media.create({
    originalName: req.file.originalname,
    filename: upload.publicId,
    secureUrl: upload.secureUrl,
    width: optimized.info.width,
    height: optimized.info.height,
    format: 'webp',
    size: optimized.data.length,
    altText: req.body.altText,
    caption: req.body.caption,
    category: req.body.category,
    uploadedBy: req.adminUser._id,
  });
  return success(res, media, 'Media uploaded successfully', null, 201);
}

export async function listMedia(req, res) { return success(res, await Media.find().sort({ createdAt: -1 }).limit(100).lean(), 'Media fetched successfully'); }
export async function updateMedia(req, res) { const media = await Media.findByIdAndUpdate(req.params.id, { $set: { altText: req.body.altText, caption: req.body.caption, category: req.body.category } }, { new: true, runValidators: true }); return media ? success(res, media, 'Media updated successfully') : failure(res, 'Media not found', [], 404); }
export async function deleteMedia(req, res) { const media = await Media.findByIdAndDelete(req.params.id); return media ? success(res, media, 'Media deleted successfully') : failure(res, 'Media not found', [], 404); }
