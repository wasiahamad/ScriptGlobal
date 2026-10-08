import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const configured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
if (configured) cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  upload_prefix: env.cloudinary.uploadPrefix,
  secure: true,
  timeout: 120000,
});

export function isCloudinaryConfigured() { return configured; }
export async function uploadBuffer(buffer, options = {}) {
  const uploadOptions = {
    resource_type: 'image',
    folder: 'sciscript',
    timeout: 120000,
    ...options,
  };
  let lastError;
  const uploadPrefixes = [
    env.cloudinary.uploadPrefix,
    'https://api-eu.cloudinary.com',
    'https://api-ap.cloudinary.com',
    undefined,
  ].filter((prefix, index, values) => values.indexOf(prefix) === index);

  for (const uploadPrefix of uploadPrefixes) {
    cloudinary.config({ upload_prefix: uploadPrefix });
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await new Promise((resolve, reject) => {
          let settled = false;
          const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            callback(value);
          };
          const timer = setTimeout(() => {
            finish(reject, Object.assign(new Error('Cloudinary upload timed out'), { code: 'ETIMEDOUT' }));
          }, uploadOptions.timeout);
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            clearTimeout(timer);
            if (error) finish(reject, error);
            else finish(resolve, result);
          });
          stream.on('error', (error) => {
            clearTimeout(timer);
            finish(reject, error);
          });
          stream.end(buffer);
        });
      } catch (error) {
        lastError = error;
        const retryable = [
          'ECONNRESET',
          'ECONNREFUSED',
          'EPIPE',
          'ETIMEDOUT',
          'ENETUNREACH',
          'EAI_AGAIN',
        ].includes(error?.code)
          || error?.http_code === 499
          || error?.name === 'TimeoutError';
        if (!retryable || attempt === 3) break;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}
export { cloudinary };
