import { expect, test } from '@playwright/test';

// TZ §38 E2E: 3-qadam (mahsulot tafsilotlari), 6-qadam (Telegram tugmasi)

async function openFirstProduct(page: import('@playwright/test').Page, locale: 'uz' | 'ru' = 'uz') {
  await page.goto(`/${locale}/catalog`);
  await page.locator('article h2 a, article a h2').first().click().catch(async () => {
    await page.locator('article a').first().click();
  });
  await page.waitForURL(/\/product\//);
}

test.describe('Mahsulot sahifasi', () => {
  test('narx bloki dona va qadoqni aralashtirmaydi (TZ §16.1)', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');
    await expect(main).toContainText(/Qadoqda/);
    await expect(main).toContainText(/Korobkada/);
    await expect(main).toContainText(/Eng kam buyurtma/);

    // Narx ko'rsatilsa, birligi bilan ko'rsatiladi ("1 qadoq: ...") yoki so'rov rejimi
    const priceBlock = await main.innerText();
    expect(priceBlock).toMatch(/1 (qadoq|dona|korobka|rulon|kg):|Narxni aniqlang/);

    // Aniq narx bo'lsa, taxminiy dona narxi ham ko'rsatiladi
    if (/1 qadoq:/.test(priceBlock)) {
      expect(priceBlock).toMatch(/Taxminiy 1 dona narxi/);
    }
  });

  test('breadcrumb kategoriyaga olib boradi', async ({ page }) => {
    await openFirstProduct(page);

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Katalog' })).toHaveAttribute('href', '/uz/catalog');
  });

  test('Telegram tugmasi SKU, nom, miqdor va URL bilan xabar ochadi (TZ §17.3)', async ({ page }) => {
    await openFirstProduct(page);

    const sku = (await page.locator('main span.font-mono').first().innerText()).trim();
    // Tayyor xabarli havola (bare t.me widget havolasidan farqli) — ?text= bo'yicha tanlaymiz
    const telegramLink = page.locator('main a[href*="t.me/"][href*="text="]').first();
    await expect(telegramLink).toBeVisible();

    const href = decodeURIComponent((await telegramLink.getAttribute('href')) || '');
    expect(href).toContain(sku);
    expect(href).toMatch(/mahsulotidan \d+ /);
    expect(href).toContain('/product/');
    expect(href).toMatch(/narxi va qoldig/i);
  });

  test('rus tilida Telegram xabari ruscha bo‘ladi', async ({ page }) => {
    await openFirstProduct(page, 'ru');

    const telegramLink = page.locator('main a[href*="t.me/"][href*="text="]').first();
    const href = decodeURIComponent((await telegramLink.getAttribute('href')) || '');
    expect(href).toContain('Здравствуйте');
    expect(href).toContain('/ru/product/');
  });

  test('telefon tugmasi tel: havolasi bilan ishlaydi', async ({ page }) => {
    await openFirstProduct(page);
    await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible();
  });

  test('Product schema.org razmetkasi mavjud (TZ §27)', async ({ page }) => {
    await openFirstProduct(page);

    // Sahifada bir nechta JSON-LD bor (layout'dagi Organization ham) — Product'ni tanlaymiz
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schemas = blocks.map((block) => { try { return JSON.parse(block); } catch { return null; } });
    const product = schemas.find((schema) => schema?.['@type'] === 'Product');

    expect(product, 'Product schema topilmadi').toBeTruthy();
    expect(product.sku).toBeTruthy();
    expect(product.offers?.priceCurrency).toBe('UZS');
  });
});
