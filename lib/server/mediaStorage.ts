import 'server-only';
import sharp from 'sharp';
import { buildCloudinarySignature, cloudinaryUploadEndpoint } from '@/lib/media/cloudinarySignature';
import { optimizedCloudinaryUrl, toPublicId } from '@/lib/media/uploadValidation';

/**
 * Cloudinary imzolangan yuklash adapteri.
 * API secret faqat shu modulda ishlatiladi va hech qachon brauzerga yuborilmaydi.
 */

export interface StoredImage {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export const mediaStorageConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
);

/**
 * Fayl baytlari haqiqatan rasm ekanini tekshiradi.
 * Faqat MIME sarlavhasiga ishonib bo'lmaydi — uni yuklovchi o'zi yozadi.
 */
export async function inspectImage(buffer: Buffer): Promise<{ format: string; width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format || !metadata.width || !metadata.height) return null;
    if (!['jpeg', 'png', 'webp', 'avif'].includes(metadata.format)) return null;
    return { format: metadata.format, width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

export async function uploadImage(input: { buffer: Buffer; filename: string; mimeType: string }): Promise<StoredImage> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('MEDIA_NOT_CONFIGURED');

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = toPublicId(input.filename);
  const signature = buildCloudinarySignature({ public_id: publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(input.buffer)], { type: input.mimeType }), input.filename);
  form.set('api_key', apiKey);
  form.set('timestamp', String(timestamp));
  form.set('public_id', publicId);
  form.set('signature', signature);

  const response = await fetch(cloudinaryUploadEndpoint(cloudName), {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    // Cloudinary xato matnini log'ga yozamiz, mijozga umumiy xabar qaytadi.
    const detail = await response.text().catch(() => '');
    console.error('Cloudinary upload failed:', response.status, detail.slice(0, 300));
    throw new Error('MEDIA_UPLOAD_FAILED');
  }

  const result = await response.json() as {
    secure_url?: string; public_id?: string; bytes?: number; width?: number; height?: number; format?: string;
  };
  if (!result.secure_url || !result.public_id) throw new Error('MEDIA_UPLOAD_FAILED');

  return {
    key: result.public_id,
    url: optimizedCloudinaryUrl(result.secure_url),
    mimeType: result.format ? `image/${result.format}` : input.mimeType,
    sizeBytes: result.bytes ?? input.buffer.byteLength,
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}

/** Cloudinary'dan rasmni o'chiradi (admin media'ni olib tashlaganda). */
export async function deleteImage(publicId: string): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildCloudinarySignature({ public_id: publicId, timestamp }, apiSecret);
  const form = new FormData();
  form.set('public_id', publicId);
  form.set('api_key', apiKey);
  form.set('timestamp', String(timestamp));
  form.set('signature', signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    return response.ok;
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return false;
  }
}
