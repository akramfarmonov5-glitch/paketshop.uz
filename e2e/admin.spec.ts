import { expect, test, type Page } from '@playwright/test';
import { readCredentials } from './fixtures';

// TZ §38 E2E: 7-qadam (admin buyurtmani ko'radi), 8-qadam (admin statusni o'zgartiradi)

async function loginAsAdmin(page: Page) {
  const { email, password } = readCredentials();
  await page.goto('/uz/admin');
  await page.getByPlaceholder('admin@paketshop.uz').fill(email);
  await page.getByPlaceholder('Parolingizni kiriting').fill(password);
  await page.getByRole('button', { name: 'Kirish' }).click();
  await expect(page.getByRole('heading', { name: 'Boshqaruv Paneli' })).toBeVisible({ timeout: 30_000 });
}

test.describe('Admin panel', () => {
  test('autentifikatsiyasiz admin API’lari yopiq (RBAC)', async ({ request }) => {
    for (const endpoint of ['/api/admin/orders', '/api/admin/leads', '/api/admin/products', '/api/admin/redirects']) {
      const response = await request.get(endpoint);
      expect(response.status(), `${endpoint} himoyalanmagan`).toBe(403);
    }
  });

  test('admin buyurtmalar ekrani ochiladi va statuslarni boshqaradi', async ({ page }) => {
    // Buyurtma yaratish va status o'zgartirish journey.spec.ts da tekshiriladi.
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'Buyurtmalar (CRM)' }).click();

    await expect(page.getByPlaceholder('Raqam, mijoz yoki telefon…')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('combobox').filter({ has: page.locator('option[value=""]') }).first()).toBeVisible();
  });

  test('admin leadlar ekrani status filtrlari bilan ochiladi', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'Leadlar' }).click();

    await expect(page.getByRole('heading', { name: 'Leadlar (CRM)' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Yangi \(/ })).toBeVisible();
  });

  test('admin redirect yaratadi, o‘chiradi va u darhol ishlaydi', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'Redirectlar' }).click();
    await expect(page.getByRole('heading', { name: 'Redirectlar (301)' })).toBeVisible();

    const fromPath = `/e2e-vaqtinchalik-${Date.now()}`;
    await page.getByPlaceholder('Eski yo‘l: /eski-sahifa').fill(fromPath);
    await page.getByPlaceholder('Yangi yo‘l: /catalog').fill('/catalog');
    await page.getByRole('button', { name: 'Qo‘shish' }).click();
    await expect(page.getByText(fromPath)).toBeVisible();

    // Redirect darhol kuchga kiradi
    await page.goto(`/uz${fromPath}`);
    await expect(page).toHaveURL(/\/uz\/catalog$/);

    // Tozalaymiz
    await page.goto('/uz/admin');
    await page.getByRole('button', { name: 'Redirectlar' }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: `${fromPath} redirectini o‘chirish` }).click();
    await expect(page.getByText(fromPath)).toHaveCount(0);
  });
});
