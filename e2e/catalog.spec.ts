import { expect, test } from '@playwright/test';

// TZ §38 E2E: 1-qadam (qidiruv), 2-qadam (filtr)

test.describe('Katalog qidiruvi va filtrlari', () => {
  test('katalog SKU, qadoq va mavjudlik bilan ochiladi', async ({ page }) => {
    await page.goto('/uz/catalog');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('katalog');
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible();

    // Har kartada SKU, qadoqdagi dona va korobka ma'lumoti bo'lishi shart (TZ §12.4)
    const first = cards.first();
    await expect(first).toContainText(/PS-\d+|[A-Z]{2,}-/);
    await expect(first).toContainText('Qadoqda');
    await expect(first).toContainText('Korobkada');
  });

  test('nom bo‘yicha qidiruv natijani toraytiradi', async ({ page }) => {
    await page.goto('/uz/catalog');
    const totalBefore = Number((await page.locator('main p strong').first().innerText()).trim());

    await page.getByPlaceholder('Mahsulot nomi yoki SKU').fill('stakan');
    await page.getByRole('button', { name: 'Ko‘rsatish' }).click();

    await expect(page).toHaveURL(/q=stakan/);
    const totalAfter = Number((await page.locator('main p strong').first().innerText()).trim());
    expect(totalAfter).toBeGreaterThan(0);
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    await expect(page.locator('article').first()).toContainText(/[Ss]takan/);
  });

  test('kirill so‘rovi lotin mahsulotni topadi (transliteratsiya)', async ({ page }) => {
    await page.goto('/uz/catalog?q=' + encodeURIComponent('стакан'));

    const total = Number((await page.locator('main p strong').first().innerText()).trim());
    expect(total).toBeGreaterThan(0);
    await expect(page.locator('article').first()).toContainText(/[Ss]takan/);
  });

  test('xato yozilgan so‘rov ham topiladi (typo tolerance)', async ({ page }) => {
    await page.goto('/uz/catalog?q=stakn');

    const total = Number((await page.locator('main p strong').first().innerText()).trim());
    expect(total).toBeGreaterThan(0);
  });

  test('natija topilmasa Telegram orqali so‘rov CTA chiqadi', async ({ page }) => {
    await page.goto('/uz/catalog?q=zzzqwertyyoq123');

    await expect(page.getByText('Mahsulot topilmadi')).toBeVisible();
    const cta = page.getByRole('link', { name: /Telegram orqali topib beramiz/ });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /t\.me\//);
  });

  test('kategoriya filtri URL query’ga yoziladi va ulashish mumkin', async ({ page }) => {
    await page.goto('/uz/catalog');

    const categorySelect = page.getByLabel('Barcha kategoriyalar');
    await categorySelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Ko‘rsatish' }).click();

    await expect(page).toHaveURL(/category=[^&]+/);
    const sharedUrl = page.url();

    // Ulashilgan havola bir xil natijani qaytaradi
    const totalFromForm = (await page.locator('main p strong').first().innerText()).trim();
    await page.goto(sharedUrl);
    await expect(page.locator('main p strong').first()).toHaveText(totalFromForm);
  });

  test('narx bo‘yicha saralash tartibni o‘zgartiradi', async ({ page }) => {
    await page.goto('/uz/catalog?sort=price_asc');
    const ascFirst = await page.locator('article').first().innerText();

    await page.goto('/uz/catalog?sort=price_desc');
    const descFirst = await page.locator('article').first().innerText();

    const cardCount = await page.locator('article').count();
    if (cardCount > 1) expect(ascFirst).not.toEqual(descFirst);
  });
});
