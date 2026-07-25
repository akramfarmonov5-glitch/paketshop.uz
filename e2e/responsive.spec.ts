import { expect, test } from '@playwright/test';

// TZ §39 mezon 2: mobil qurilmada asosiy oqim ishlashi kerak (Pixel 7 profili)

test.describe('Mobil ko‘rinish', () => {
  test('katalog mobilda gorizontal scrollsiz ochiladi', async ({ page }) => {
    await page.goto('/uz/catalog');
    await expect(page.locator('article').first()).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('mahsulotni savatga qo‘shish tugmasi bosh barmoq uchun yetarli katta', async ({ page }) => {
    await page.goto('/uz/catalog');

    const button = page.getByRole('button', { name: 'Savatga qo‘shish' }).first();
    await expect(button).toBeVisible();

    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);
  });

  test('mahsulot sahifasi mobilda narx va qadoq ma’lumotini ko‘rsatadi', async ({ page }) => {
    await page.goto('/uz/catalog');
    await page.locator('article a').first().click();
    await page.waitForURL(/\/product\//);

    await expect(page.locator('main')).toContainText('Qadoqda');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
