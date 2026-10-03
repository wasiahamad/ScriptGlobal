import { v2 as cloudinary } from 'cloudinary';

const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (configured) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });

export function isCloudinaryConfigured() { return configured; }
export function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'sciscript', ...options }, (error, result) => error ? reject(error) : resolve(result)).end(buffer));
}
export { cloudinary };
