import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminProductSchema } from '@/lib/validation/adminCatalog';
import { PRODUCT_IMPORT_HEADERS, normalizeHeader, normalizeImportRecord, toAdminProductImport, type RawImportRow } from '@/lib/import/productImport';
import { buildProductSnapshot, type RollbackEntry } from '@/lib/import/importRollback';
import { auditJson, productPriceTiers, productScalarData, productTranslations, productVariants } from '@/lib/server/adminCatalogService';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

export const runtime = 'nodejs';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

export async function GET(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (request.nextUrl.searchParams.get('template') !== 'csv') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(`${PRODUCT_IMPORT_HEADERS.join(',')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="paketshop-products-template.csv"' } });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await request.formData();
  const file = form.get('file');
  const mode = form.get('mode') === 'commit' ? 'commit' : 'preview';
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'CSV/XLSX file up to 10MB is required' }, { status: 400 });
  const extension = file.name.toLowerCase().split('.').pop();
  if (!['csv', 'xlsx'].includes(extension || '')) return NextResponse.json({ error: 'Only .csv and .xlsx files are supported' }, { status: 400 });

  try {
    const rows = await readRows(file, extension as 'csv' | 'xlsx');
    if (!rows.length || rows.length > 5_000) return NextResponse.json({ error: 'File must contain between 1 and 5000 rows' }, { status: 400 });
    const categories = await db.category.findMany({ include: { translations: true } });
    const categoryMap = new Map<string, string>();
    for (const category of categories) {
      categoryMap.set(normalizeHeader(category.slugUz), category.id);
      categoryMap.set(normalizeHeader(category.slugRu), category.id);
      for (const translation of category.translations) categoryMap.set(normalizeHeader(translation.name), category.id);
    }

    const valid: Array<{ rowNumber: number; data: ReturnType<typeof adminProductSchema.parse>; imageUrl: string | null }> = [];
    const errors: Array<{ rowNumber: number; field?: string; message: string; payload: RawImportRow }> = [];
    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const normalized = normalizeImportRecord(rawRow);
      const categoryId = categoryMap.get(normalizeHeader(normalized.category));
      if (!categoryId) { errors.push({ rowNumber, field: 'category', message: 'Category not found', payload: rawRow }); return; }
      const candidate = toAdminProductImport(rawRow, categoryId);
      const imageUrl = candidate.imageUrl;
      const productCandidate = Object.fromEntries(Object.entries(candidate).filter(([key]) => key !== 'imageUrl'));
      const parsed = adminProductSchema.safeParse(productCandidate);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push({ rowNumber, field: issue.path.join('.'), message: issue.message, payload: rawRow });
      } else valid.push({ rowNumber, data: parsed.data, imageUrl });
    });

    if (mode === 'preview') return NextResponse.json({ mode, totalRows: rows.length, validRows: valid.length, errorRows: errors.length, preview: valid.slice(0, 20), errors: errors.slice(0, 100) });
    if (errors.length) return NextResponse.json({ error: 'Import has validation errors; fix them before commit', totalRows: rows.length, validRows: valid.length, errorRows: errors.length, errors: errors.slice(0, 100) }, { status: 400 });

    const job = await db.importJob.create({ data: { filename: file.name, status: 'IMPORTING', totalRows: rows.length } });
    try {
      // Import to'plamli bajariladi: har qator uchun alohida so'rov yuborilsa,
      // 1000 qatorli fayl masofaviy bazada tranzaksiya timeout'iga urilardi (TZ §39.4).
      const existingProducts = await db.product.findMany({
        where: { sku: { in: valid.map((entry) => entry.data.sku.toUpperCase()) } },
        include: { translations: true, variants: true, priceTiers: true },
      });
      const existingBySku = new Map(existingProducts.map((product) => [product.sku, product]));

      const rollbackEntries: RollbackEntry[] = [];
      const productCreates: Array<Record<string, unknown>> = [];
      const productUpdates: Array<{ id: string; data: ReturnType<typeof productScalarData> }> = [];
      const translationRows: Array<Record<string, unknown>> = [];
      const variantRows: Array<Record<string, unknown>> = [];
      const tierRows: Array<Record<string, unknown>> = [];
      const mediaPlans: Array<{ key: string; url: string; productId: string }> = [];

      for (const entry of valid) {
        const sku = entry.data.sku.toUpperCase();
        const existing = existingBySku.get(sku);
        const productId = existing?.id ?? randomUUID();

        if (existing) {
          productUpdates.push({ id: existing.id, data: productScalarData(entry.data) });
          // Rollback uchun oldingi holat snapshot'i (TZ §24.3).
          rollbackEntries.push({ sku, productId, created: false, before: buildProductSnapshot(existing) });
        } else {
          productCreates.push({ id: productId, ...productScalarData(entry.data) });
          rollbackEntries.push({ sku, productId, created: true });
        }

        translationRows.push(...productTranslations(entry.data, productId));
        variantRows.push(...productVariants(entry.data, productId));
        tierRows.push(...productPriceTiers(entry.data, productId));
        if (entry.imageUrl) mediaPlans.push({ key: `import:${sku}:primary`, url: entry.imageUrl, productId });
      }

      await db.$transaction(async (transaction: any) => {
        if (productCreates.length) await transaction.product.createMany({ data: productCreates });
        for (const update of productUpdates) {
          await transaction.product.update({ where: { id: update.id }, data: update.data });
        }

        // Yangilanadigan mahsulotlarning bog'liq yozuvlari bitta so'rovda tozalanadi.
        const updatedIds = productUpdates.map((update) => update.id);
        if (updatedIds.length) {
          await transaction.productTranslation.deleteMany({ where: { productId: { in: updatedIds } } });
          await transaction.productVariant.deleteMany({ where: { productId: { in: updatedIds } } });
          await transaction.priceTier.deleteMany({ where: { productId: { in: updatedIds } } });
        }
        if (translationRows.length) await transaction.productTranslation.createMany({ data: translationRows });
        if (variantRows.length) await transaction.productVariant.createMany({ data: variantRows });
        if (tierRows.length) await transaction.priceTier.createMany({ data: tierRows });

        if (mediaPlans.length) {
          const existingMedia = await transaction.media.findMany({ where: { key: { in: mediaPlans.map((plan) => plan.key) } } });
          const mediaIdByKey = new Map<string, string>(existingMedia.map((media: { key: string; id: string }) => [media.key, media.id]));
          const mediaCreates: Array<Record<string, unknown>> = [];

          for (const plan of mediaPlans) {
            const mediaId = mediaIdByKey.get(plan.key);
            if (mediaId) {
              await transaction.media.update({ where: { id: mediaId }, data: { url: plan.url } });
            } else {
              const newId = randomUUID();
              mediaIdByKey.set(plan.key, newId);
              mediaCreates.push({ id: newId, key: plan.key, url: plan.url, mimeType: 'image/remote', sizeBytes: 0 });
            }
          }
          if (mediaCreates.length) await transaction.media.createMany({ data: mediaCreates });
          await transaction.productMedia.createMany({
            data: mediaPlans.map((plan) => ({ productId: plan.productId, mediaId: mediaIdByKey.get(plan.key)!, primary: true })),
            skipDuplicates: true,
          });
        }

        await transaction.importJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', successRows: valid.length, rollbackData: rollbackEntries } });
        await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'PRODUCT_IMPORT', entityType: 'ImportJob', entityId: job.id, after: auditJson({ filename: file.name, rows: valid.length, created: productCreates.length, updated: productUpdates.length }), ip: request.headers.get('x-real-ip') } });
      }, { timeout: 120_000, maxWait: 20_000 });
      revalidatePath('/uz'); revalidatePath('/ru');
      revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
      revalidatePath('/sitemap.xml'); revalidatePath('/api/catalog');
      return NextResponse.json({ success: true, jobId: job.id, importedRows: valid.length, createdRows: productCreates.length, updatedRows: productUpdates.length });
    } catch (commitError) {
      await db.importJob.update({ where: { id: job.id }, data: { status: 'FAILED', errorRows: rows.length } });
      throw commitError;
    }
  } catch (error) {
    console.error('Product import failed:', error);
    return NextResponse.json({ error: 'Import could not be processed' }, { status: 500 });
  }
}

async function readRows(file: File, extension: 'csv' | 'xlsx'): Promise<RawImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (extension === 'xlsx') await workbook.xlsx.load(buffer as never);
  else await workbook.csv.read(Readable.from(buffer.toString('utf8')));
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const headers = (sheet.getRow(1).values as unknown[]).slice(1).map((header) => String(header ?? '').trim());
  const rows: RawImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: RawImportRow = {};
    headers.forEach((header, index) => { record[header] = row.getCell(index + 1).value; });
    if (Object.values(record).some((value) => value !== null && String(value).trim() !== '')) rows.push(record);
  });
  return rows;
}
