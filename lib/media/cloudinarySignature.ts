import { createHash } from 'node:crypto';

/**
 * Cloudinary imzolangan yuklash uchun signature.
 *
 * Cloudinary qoidasi: bo'sh bo'lmagan parametrlar kalit bo'yicha alifbo tartibida
 * `k=v&k=v` ko'rinishida ulanadi, oxiriga api_secret qo'shiladi va SHA-1 olinadi.
 * `file`, `api_key` va `resource_type` imzoga kirmaydi.
 */
export function buildCloudinarySignature(params: Record<string, string | number | undefined>, apiSecret: string): string {
  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export function cloudinaryUploadEndpoint(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
}
