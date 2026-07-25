import { NextRequest, NextResponse } from 'next/server';
import { validateImageUpload, MAX_IMAGE_BYTES } from '@/lib/media/uploadValidation';
import { auditJson } from '@/lib/server/adminCatalogService';
import { db } from '@/lib/server/db';
import { inspectImage, mediaStorageConfigured, uploadImage } from '@/lib/server/mediaStorage';
import { getAdminSession } from '@/lib/server/rbac';

export const runtime = 'nodejs';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' }, take: 60 });
  return NextResponse.json({ media, configured: mediaStorageConfigured });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!mediaStorageConfigured) {
    return NextResponse.json({ error: 'Media saqlash sozlanmagan (CLOUDINARY_* muhit o‘zgaruvchilari)' }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Rasm fayli yuborilmadi' }, { status: 400 });

  const validation = validateImageUpload({ filename: file.name, mimeType: file.type, sizeBytes: file.size });
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Rasm juda katta' }, { status: 400 });

  // MIME sarlavhasiga ishonmaymiz — baytlarni o'qib, haqiqatan rasm ekanini tekshiramiz.
  const inspected = await inspectImage(buffer);
  if (!inspected) return NextResponse.json({ error: 'Fayl haqiqiy rasm emas yoki buzilgan' }, { status: 400 });

  try {
    const stored = await uploadImage({ buffer, filename: file.name, mimeType: `image/${inspected.format}` });
    const altText = file.name.replace(/\.[^.]+$/, '').slice(0, 200);

    const media = await db.media.upsert({
      where: { key: stored.key },
      update: { url: stored.url, mimeType: stored.mimeType, sizeBytes: stored.sizeBytes },
      create: { key: stored.key, url: stored.url, mimeType: stored.mimeType, sizeBytes: stored.sizeBytes, altUz: altText, altRu: altText },
    });

    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'MEDIA_UPLOAD',
        entityType: 'Media',
        entityId: media.id,
        after: auditJson({ key: stored.key, sizeBytes: stored.sizeBytes, width: stored.width, height: stored.height }),
        ip: request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({ media, width: inspected.width, height: inspected.height }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'MEDIA_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Media saqlash sozlanmagan' }, { status: 503 });
    }
    console.error('Media upload failed:', error);
    return NextResponse.json({ error: 'Rasmni yuklab bo‘lmadi' }, { status: 502 });
  }
}
