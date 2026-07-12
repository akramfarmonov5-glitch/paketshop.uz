import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import { NextRequest, NextResponse } from 'next/server';
import { adminProductSchema } from '@/lib/validation/adminCatalog';
import { PRODUCT_IMPORT_HEADERS, normalizeHeader, normalizeImportRecord, toAdminProductImport, type RawImportRow } from '@/lib/import/productImport';
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
      await db.$transaction(async (transaction: any) => {
        for (const entry of valid) {
          const existing = await transaction.product.findUnique({ where: { sku: entry.data.sku.toUpperCase() } });
          const product = existing
            ? await transaction.product.update({ where: { id: existing.id }, data: productScalarData(entry.data) })
            : await transaction.product.create({ data: productScalarData(entry.data) });
          if (existing) {
            await transaction.productTranslation.deleteMany({ where: { productId: product.id } });
            await transaction.productVariant.deleteMany({ where: { productId: product.id } });
            await transaction.priceTier.deleteMany({ where: { productId: product.id } });
          }
          await transaction.productTranslation.createMany({ data: productTranslations(entry.data, product.id) });
          if (entry.data.variants.length) await transaction.productVariant.createMany({ data: productVariants(entry.data, product.id) });
          if (entry.data.priceTiers.length) await transaction.priceTier.createMany({ data: productPriceTiers(entry.data, product.id) });
          if (entry.imageUrl) {
            const media = await transaction.media.upsert({ where: { key: `import:${entry.data.sku}:primary` }, update: { url: entry.imageUrl }, create: { key: `import:${entry.data.sku}:primary`, url: entry.imageUrl, mimeType: 'image/remote', sizeBytes: 0 } });
            await transaction.productMedia.upsert({ where: { productId_mediaId: { productId: product.id, mediaId: media.id } }, update: { primary: true }, create: { productId: product.id, mediaId: media.id, primary: true } });
          }
        }
        await transaction.importJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', successRows: valid.length } });
        await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'PRODUCT_IMPORT', entityType: 'ImportJob', entityId: job.id, after: auditJson({ filename: file.name, rows: valid.length }), ip: request.headers.get('x-real-ip') } });
      }, { timeout: 60_000 });
      return NextResponse.json({ success: true, jobId: job.id, importedRows: valid.length });
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
