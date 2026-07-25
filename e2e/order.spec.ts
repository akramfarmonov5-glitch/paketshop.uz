import { expect, test, type Page } from '@playwright/test';
import { E2E_MARKER } from './fixtures';

// TZ §38 E2E: 4-qadam (savat tarkibi) va forma validatsiyasi.
// Buyurtma yaratish journey.spec.ts da — /api/orders IP limitini tejash uchun.

/** Next.js route-announcer ham role=alert bo'ladi — faqat forma xabarini tanlaymiz. */
function formAlert(page: Page) {
  return page.locator('p[role="alert"]');
}

async function addFirstProductToCart(page: Page) {
  await page.goto('/uz/catalog');
  await page.getByRole('button', { name: 'Savatga qo‘shish' }).first().click();
  await expect(page.getByRole('button', { name: 'Qo‘shildi' }).first()).toBeVisible();
}

test.describe('Savat va forma validatsiyasi', () => {
  test('savat sotuv birligi va dona ekvivalentini ajratib ko‘rsatadi', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/uz/checkout');

    const summary = page.getByRole('complementary');
    await expect(summary).toContainText('SKU');
    // TZ §18.1: qadoq soni va dona ekvivalenti alohida
    await expect(summary).toContainText(/\d+ (qadoq|dona|korobka|rulon|kg) · \d+ dona/);
    await expect(summary).toContainText('taxminiy summasi');
  });

  test('rozilik belgilanmasa so‘rov yuborilmaydi', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/uz/checkout');

    await page.getByLabel('Ism yoki mas’ul shaxs *').fill(`${E2E_MARKER} Rozilik sinovi`);
    await page.getByLabel('Telefon *').fill('+998901234567');
    await page.getByLabel('Shahar yoki viloyat *').fill('Toshkent');
    await page.getByRole('button', { name: 'So‘rov yuborish' }).click();

    await expect(formAlert(page)).toContainText('rozilik');
  });

  test('noto‘g‘ri telefon raqami rad etiladi', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/uz/checkout');

    await page.getByLabel('Ism yoki mas’ul shaxs *').fill(`${E2E_MARKER} Telefon sinovi`);
    await page.getByLabel('Telefon *').fill('123');
    await page.getByLabel('Shahar yoki viloyat *').fill('Toshkent');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'So‘rov yuborish' }).click();

    await expect(formAlert(page)).toContainText(/telefon/i);
  });

  test('majburiy maydonlar bo‘sh bo‘lsa xabar chiqadi', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/uz/checkout');

    await page.getByRole('button', { name: 'So‘rov yuborish' }).click();
    await expect(formAlert(page)).toBeVisible();
  });

  test('savat bo‘sh bo‘lsa checkout katalogga qaytaradi', async ({ page }) => {
    await page.goto('/uz/checkout');

    await expect(page.getByRole('heading', { name: 'Savat bo‘sh' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Katalogga qaytish' })).toHaveAttribute('href', '/uz/catalog');
  });
});
