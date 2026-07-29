import { expect, test } from '@playwright/test';
import { E2E_REDIRECT_FROM } from './fixtures';

// TZ §38 E2E: 9-qadam (UZ/RU til almashish), 10-qadam (eski URL 301 bilan yangi sahifaga)

test.describe('Til va lokalizatsiya', () => {
  test('katalog uz va ru tillarida mos matn bilan ochiladi', async ({ page }) => {
    await page.goto('/uz/catalog');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ulgurji mahsulotlar katalogi');

    await page.goto('/ru/catalog');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Каталог оптовых товаров');
  });

  test('canonical va hreflang faqat uz/ru ni ko‘rsatadi (TZ §7)', async ({ page }) => {
    await page.goto('/uz/catalog');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/uz\/catalog/);
    await expect(page.locator('link[rel="alternate"][hreflang="uz"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0);
  });

  test('html lang atributi tilga mos keladi', async ({ page }) => {
    await page.goto('/ru/catalog');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('eski /en yo‘llari uz tiliga yo‘naltiriladi', async ({ page }) => {
    const response = await page.goto('/en/catalog');
    await expect(page).toHaveURL(/\/uz\/catalog/);
    expect(response?.status()).toBe(200);
  });

  test('tilsiz yo‘l uz tiliga yo‘naltiriladi', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page).toHaveURL(/\/uz\/catalog/);
  });
});

test.describe('Redirect va 404', () => {
  test('Google indeksidagi olib tashlangan mahsulotlar tegishli katalogga yo‘naltiriladi', async ({ request }) => {
    const uzResponse = await request.get('/uz/product/zip-paket-27', { maxRedirects: 0 });
    const ruResponse = await request.get('/ru/product/70x90-20-1', { maxRedirects: 0 });

    expect(uzResponse.status()).toBe(308);
    expect(uzResponse.headers()['location']).toContain('/uz/catalog');
    expect(ruResponse.status()).toBe(308);
    expect(ruResponse.headers()['location']).toContain('/ru/catalog');
  });

  test('admin yaratgan eski URL doimiy redirect bilan ishlaydi', async ({ request }) => {
    const response = await request.get(`/uz${E2E_REDIRECT_FROM}`, { maxRedirects: 0 });

    expect([301, 308]).toContain(response.status());
    expect(response.headers()['location']).toContain('/uz/catalog');
  });

  test('redirect so‘ralgan tilni saqlaydi', async ({ request }) => {
    const response = await request.get(`/ru${E2E_REDIRECT_FROM}`, { maxRedirects: 0 });

    expect([301, 308]).toContain(response.status());
    expect(response.headers()['location']).toContain('/ru/catalog');
  });

  test('mavjud bo‘lmagan sahifa 404 qaytaradi', async ({ request }) => {
    const response = await request.get('/uz/bunday-sahifa-yoq-12345', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test('robots.txt admin va checkout’ni yopadi', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();

    expect(body).toContain('Disallow: /uz/admin');
    expect(body).toContain('Disallow: /uz/checkout');
    expect(body).toContain('Sitemap: https://www.paketshop.uz/sitemap.xml');
  });

  test('sitemap uz va ru sahifalarni o‘z ichiga oladi, en yo‘q', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();

    expect(body).toContain('/uz/catalog');
    expect(body).toContain('/ru/catalog');
    expect(body).not.toContain('/en/');
  });
});
