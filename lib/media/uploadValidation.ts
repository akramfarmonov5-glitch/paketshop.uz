/** Rasm yuklash validatsiyasi (TZ §30: MIME va hajm tekshiruvi). */

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_FILENAME_LENGTH = 120;

const EXTENSION_BY_MIME: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
};

export interface UploadCandidate {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateImageUpload(candidate: UploadCandidate): ValidationResult {
  if (!candidate.sizeBytes) return { ok: false, error: 'Fayl bo‘sh' };
  if (candidate.sizeBytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: `Rasm ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB dan katta bo‘lmasligi kerak` };
  }

  const mime = candidate.mimeType.toLowerCase().split(';')[0].trim();
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return { ok: false, error: 'Faqat JPG, PNG, WebP va AVIF rasmlar qabul qilinadi' };
  }

  const extension = candidate.filename.toLowerCase().split('.').pop() || '';
  if (!EXTENSION_BY_MIME[mime].includes(extension)) {
    return { ok: false, error: 'Fayl kengaytmasi rasm turiga mos kelmaydi' };
  }

  return { ok: true };
}

/**
 * Fayl nomidan Cloudinary public_id yasaydi.
 * Yo'l ajratgichlari va nuqta-nuqta tashlanadi — yuklovchi papkadan chiqib keta olmasligi kerak.
 */
export function toPublicId(filename: string, prefix = 'paketshop/products'): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/['`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_FILENAME_LENGTH) || 'rasm';

  const unique = Date.now().toString(36);
  return `${prefix}/${base}-${unique}`;
}

/** Cloudinary yetkazib berish havolasiga avtomatik format/sifat qo'shadi (TZ §6: WebP/AVIF). */
export function optimizedCloudinaryUrl(secureUrl: string, transform = 'f_auto,q_auto'): string {
  if (!secureUrl.includes('/upload/')) return secureUrl;
  // Transformatsiya allaqachon qo'yilgan bo'lsa qayta qo'shmaymiz
  if (/\/upload\/[^/]*(f_auto|q_auto)/.test(secureUrl)) return secureUrl;
  return secureUrl.replace('/upload/', `/upload/${transform}/`);
}
