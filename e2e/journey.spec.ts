import { expect, test, type Page } from '@playwright/test';
import { E2E_MARKER, readCredentials } from './fixtures';

/**
 * TZ §38 to'liq E2E sayohati: qidiruv → filtr → mahsulot → savat →
 * buyurtma so'rovi → admin ko'radi → admin statusni o'zgartiradi.
 *
 * Bitta buyurtma yaratiladi: /api/orders da IP bo'yicha 10 daqiqada 8 ta
 * so'rov limiti bor, shuning uchun qadamlar ketma-ket bir buyurtmani ulashadi.
 */
test.describe.configure({ mode: 'serial' });

// Honeypot server tomonda 700ms dan tez yuborilgan formani spam deb rad etadi.
const HUMAN_FILL_DELAY_MS = 900;

let orderNumber = '';

async function loginAsAdmin(page: Page) {
  const { email, password } = readCredentials();
  await page.goto('/uz/admin');
  await page.getByPlaceholder('admin@paketshop.uz').fill(email);
  await page.getByPlaceholder('Parolingizni kiriting').fill(password);
  await page.getByRole('button', { name: 'Kirish' }).click();
  await expect(page.getByRole('heading', { name: 'Boshqaruv Paneli' })).toBeVisible({ timeout: 30_000 });
}

test.describe('To‘liq savdo sayohati', () => {
  test('1-4: qidiruv, filtr, mahsulot va savatga qo‘shish', async ({ page }) => {
    await page.goto('/uz/catalog');

    // Qidiruv
    await page.getByPlaceholder('Mahsulot nomi yoki SKU').fill('stakan');
    await page.getByRole('button', { name: 'Ko‘rsatish' }).click();
    await expect(page).toHaveURL(/q=stakan/);
    await expect(page.locator('article').first()).toBeVisible();

    // Mahsulot sahifasiga o'tish va qadoq ma'lumotini tekshirish
    await page.locator('article a').first().click();
    await page.waitForURL(/\/product\//);
    await expect(page.locator('main')).toContainText('Qadoqda');

    // Savatga qo'shish
    await page.getByRole('button', { name: 'Savatga qo‘shish' }).click();
    await expect(page.getByRole('button', { name: 'Qo‘shildi' })).toBeVisible();
  });

  test('5: buyurtma so‘rovi bazaga yoziladi va raqam beriladi', async ({ page }) => {
    await page.goto('/uz/catalog');
    await page.getByRole('button', { name: 'Savatga qo‘shish' }).first().click();
    await expect(page.getByRole('button', { name: 'Qo‘shildi' }).first()).toBeVisible();

    await page.goto('/uz/checkout');
    await expect(page.getByRole('heading', { name: 'Ulgurji buyurtma so‘rovi' })).toBeVisible();

    await page.getByRole('group', { name: 'Mijoz turi' }).getByText('Tashkilot').click();
    await page.getByLabel('Ism yoki mas’ul shaxs *').fill(`${E2E_MARKER} Sayohat mijozi`);
    await page.getByLabel('Telefon *').fill('+998901234567');
    await page.getByLabel('Shahar yoki viloyat *').fill('Toshkent');
    await page.getByRole('checkbox').check();

    await page.waitForTimeout(HUMAN_FILL_DELAY_MS);
    await page.getByRole('button', { name: 'So‘rov yuborish' }).click();

    await expect(page.getByRole('heading', { name: 'So‘rov qabul qilindi' })).toBeVisible({ timeout: 30_000 });
    orderNumber = (await page.locator('strong.font-mono').innerText()).trim();
    expect(orderNumber).toMatch(/^PS-\d{8}-[A-Z0-9]+$/);
  });

  test('7-8: admin buyurtmani ko‘radi va statusini o‘zgartiradi', async ({ page }) => {
    expect(orderNumber, 'oldingi qadamda buyurtma yaratilmagan').toBeTruthy();
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Buyurtmalar (CRM)' }).click();
    await expect(page.getByText(orderNumber)).toBeVisible({ timeout: 30_000 });

    // Qatorda ikki select bor (menejer va status) — status variantiga qarab tanlaymiz
    const statusSelect = page.locator('tr', { hasText: orderNumber }).first()
      .locator('select')
      .filter({ has: page.locator('option[value="CONTACTED"]') });

    await statusSelect.selectOption('CONTACTED');
    await expect(statusSelect).toHaveValue('CONTACTED');

    // Status bazaga yozilganini sahifani yangilab tasdiqlaymiz
    await page.reload();
    await page.getByRole('button', { name: 'Buyurtmalar (CRM)' }).click();
    const reloadedStatus = page.locator('tr', { hasText: orderNumber }).first()
      .locator('select')
      .filter({ has: page.locator('option[value="CONTACTED"]') });
    await expect(reloadedStatus).toHaveValue('CONTACTED', { timeout: 30_000 });
  });
});
