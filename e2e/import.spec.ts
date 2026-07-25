import { expect, test, type Page } from '@playwright/test';
import { readCredentials } from './fixtures';

// TZ §24.3: import shabloni, dry-run va rollback boshqaruvi

async function loginAsAdmin(page: Page) {
  const { email, password } = readCredentials();
  await page.goto('/uz/admin');
  await page.getByPlaceholder('admin@paketshop.uz').fill(email);
  await page.getByPlaceholder('Parolingizni kiriting').fill(password);
  await page.getByRole('button', { name: 'Kirish' }).click();
  await expect(page.getByRole('heading', { name: 'Boshqaruv Paneli' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Import / eksport' }).click();
}

test.describe('Import va rollback', () => {
  test('rollback API autentifikatsiyasiz yopiq', async ({ request }) => {
    const jobs = await request.get('/api/admin/import/jobs');
    expect(jobs.status()).toBe(403);

    const rollback = await request.post('/api/admin/import/jobs/fake-id/rollback');
    expect(rollback.status()).toBe(403);
  });

  test('import ekrani shablon, dry-run va tarix bilan ochiladi', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('heading', { name: 'Excel / CSV import' })).toBeVisible();
    await expect(page.getByRole('link', { name: /CSV shablon/ })).toHaveAttribute('href', /template=csv/);
    await expect(page.getByRole('heading', { name: 'Import tarixi' })).toBeVisible({ timeout: 30_000 });
  });

  test('CSV shabloni barcha majburiy ustunlarni qaytaradi', async ({ page }) => {
    await loginAsAdmin(page);

    const response = await page.request.get('/api/admin/import/products?template=csv');
    expect(response.status()).toBe(200);
    const header = (await response.text()).split('\n')[0];

    for (const column of ['sku', 'category', 'nameUz', 'nameRu', 'saleUnit', 'unitsPerPack', 'packsPerCarton', 'price', 'priceMode', 'availabilityStatus']) {
      expect(header, `${column} ustuni yo‘q`).toContain(column);
    }
  });

  test('dry-run xato qatorlarni sanab, bazaga yozmaydi', async ({ page }) => {
    await loginAsAdmin(page);

    // Kategoriyasi mavjud bo'lmagan qator — commit bloklanishi kerak
    const csv = [
      'sku,category,nameUz,nameRu,saleUnit,unitsPerPack,packsPerCarton,price,priceMode,minimumOrderQuantity,orderStep,availabilityStatus,originCountry,imageUrl',
      'E2E-BADROW-1,bunday-kategoriya-yoq,Xato qator,Ошибочная строка,PACK,50,20,40000,PUBLIC_EXACT,1,1,IN_STOCK,Uzbekistan,',
    ].join('\n');

    const preview = await page.request.post('/api/admin/import/products', {
      multipart: {
        file: { name: 'e2e-bad.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') },
        mode: 'preview',
      },
    });
    const previewBody = await preview.json();
    expect(preview.status()).toBe(200);
    expect(previewBody.errorRows).toBe(1);
    expect(previewBody.errors[0].field).toBe('category');

    const commit = await page.request.post('/api/admin/import/products', {
      multipart: {
        file: { name: 'e2e-bad.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') },
        mode: 'commit',
      },
    });
    expect(commit.status()).toBe(400);
  });
});
