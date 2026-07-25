import { describe, expect, it } from 'vitest';
import { buildCloudinarySignature } from '@/lib/media/cloudinarySignature';
import {
  MAX_IMAGE_BYTES,
  optimizedCloudinaryUrl,
  toPublicId,
  validateImageUpload,
} from '@/lib/media/uploadValidation';

const candidate = (overrides: Partial<Parameters<typeof validateImageUpload>[0]> = {}) => ({
  filename: 'stakan.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 200_000,
  ...overrides,
});

describe('validateImageUpload', () => {
  it('accepts the supported image formats', () => {
    expect(validateImageUpload(candidate()).ok).toBe(true);
    expect(validateImageUpload(candidate({ filename: 'a.png', mimeType: 'image/png' })).ok).toBe(true);
    expect(validateImageUpload(candidate({ filename: 'a.webp', mimeType: 'image/webp' })).ok).toBe(true);
    expect(validateImageUpload(candidate({ filename: 'a.avif', mimeType: 'image/avif' })).ok).toBe(true);
  });

  it('tolerates a charset suffix and uppercase mime', () => {
    expect(validateImageUpload(candidate({ mimeType: 'IMAGE/JPEG; charset=binary' })).ok).toBe(true);
  });

  it('rejects non-image types', () => {
    const result = validateImageUpload(candidate({ filename: 'virus.pdf', mimeType: 'application/pdf' }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/JPG, PNG/);
  });

  it('rejects an SVG (script-carrying vector)', () => {
    expect(validateImageUpload(candidate({ filename: 'a.svg', mimeType: 'image/svg+xml' })).ok).toBe(false);
  });

  it('rejects an extension that contradicts the mime type', () => {
    const result = validateImageUpload(candidate({ filename: 'shell.php', mimeType: 'image/jpeg' }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/kengaytmasi/);
  });

  it('rejects empty and oversized files', () => {
    expect(validateImageUpload(candidate({ sizeBytes: 0 })).ok).toBe(false);
    expect(validateImageUpload(candidate({ sizeBytes: MAX_IMAGE_BYTES + 1 })).ok).toBe(false);
    expect(validateImageUpload(candidate({ sizeBytes: MAX_IMAGE_BYTES })).ok).toBe(true);
  });
});

describe('toPublicId', () => {
  it('slugifies the filename under a fixed folder', () => {
    const id = toPublicId("Kraft Qog'oz Stakan 250ml.JPG");
    expect(id).toMatch(/^paketshop\/products\/kraft-qogoz-stakan-250ml-[a-z0-9]+$/);
  });

  it('strips path traversal attempts', () => {
    const id = toPublicId('../../etc/passwd.png');
    expect(id.startsWith('paketshop/products/')).toBe(true);
    expect(id).not.toContain('..');
    expect(id.split('/').length).toBe(3);
  });

  it('falls back when the name has no usable characters', () => {
    expect(toPublicId('!!!.png')).toMatch(/^paketshop\/products\/rasm-/);
  });

  it('produces different ids for repeated uploads of one name', async () => {
    const first = toPublicId('a.png');
    await new Promise((resolve) => setTimeout(resolve, 2));
    expect(toPublicId('a.png')).not.toBe(first);
  });
});

describe('optimizedCloudinaryUrl', () => {
  it('injects automatic format and quality', () => {
    expect(optimizedCloudinaryUrl('https://res.cloudinary.com/x/image/upload/v1/a.jpg'))
      .toBe('https://res.cloudinary.com/x/image/upload/f_auto,q_auto/v1/a.jpg');
  });

  it('does not double-apply the transform', () => {
    const already = 'https://res.cloudinary.com/x/image/upload/f_auto,q_auto/v1/a.jpg';
    expect(optimizedCloudinaryUrl(already)).toBe(already);
  });

  it('leaves unrelated urls untouched', () => {
    expect(optimizedCloudinaryUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
  });
});

describe('buildCloudinarySignature', () => {
  // Cloudinary hujjatidagi qoida: sorted k=v&... + secret, so'ng SHA-1
  it('matches a known vector: sha1("timestamp=1234567890" + secret)', () => {
    expect(buildCloudinarySignature({ timestamp: 1234567890 }, 'abcd'))
      .toBe('fd13c6f5ed93ab461e80da0a59c1f874d94086e2');
  });

  it('sorts parameters alphabetically, not by insertion order', () => {
    const a = buildCloudinarySignature({ timestamp: 1, folder: 'x', public_id: 'y' }, 's');
    const b = buildCloudinarySignature({ public_id: 'y', folder: 'x', timestamp: 1 }, 's');
    expect(a).toBe(b);
  });

  it('ignores empty and undefined parameters', () => {
    const withEmpty = buildCloudinarySignature({ timestamp: 1, folder: '', public_id: undefined }, 's');
    const without = buildCloudinarySignature({ timestamp: 1 }, 's');
    expect(withEmpty).toBe(without);
  });

  it('changes when the secret changes', () => {
    expect(buildCloudinarySignature({ timestamp: 1 }, 'a')).not.toBe(buildCloudinarySignature({ timestamp: 1 }, 'b'));
  });
});
