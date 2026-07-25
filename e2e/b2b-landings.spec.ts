import { expect, test } from '@playwright/test';

/**
 * B2B landinglar avval statik maketga aylanib qolgan va wholesale formasi
 * hech qayerga yubormagan edi. Bu testlar shu regressiyani qaytarmaslikni kafolatlaydi.
 */

const LANDINGS = [
  { path: '/uz/wholesale', heading: /ulgurji shartlar/i, requiredField: 'Ismingiz yoki kompaniya nomi *' },
  { path: '/uz/organizations', heading: /qadoqlash ta’minoti/i, requiredField: 'Tashkilot nomi *' },
  { path: '/uz/starter-kits', heading: /start to‘plamlar|tayyor to‘plamlar/i, requiredField: 'Ismingiz yoki kompaniya nomi *' },
];

test.describe('B2B landing sahifalari', () => {
  for (const landing of LANDINGS) {
    test(`${landing.path} — ishlaydigan lead formasi bor`, async ({ page }) => {
      await page.goto(landing.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(landing.heading);

      // Forma haqiqiy submit tugmasi bilan bo'lishi shart (type="button" bo'lsa hech narsa yubormaydi)
      const form = page.locator('form');
      await expect(form).toBeVisible();
      await expect(form.getByRole('button', { name: /So‘rov yuborish/ })).toHaveAttribute('type', 'submit');
      await expect(page.getByPlaceholder(landing.requiredField)).toBeVisible();
      // Tashkilot formasida bank/shartnoma checkboxlari ham bor — roziligini nomi bo'yicha tanlaymiz
      await expect(form.getByRole('checkbox', { name: /roziman/ })).toBeVisible();
    });

    test(`${landing.path} — rozilik belgilanmasa yuborilmaydi`, async ({ page }) => {
      await page.goto(landing.path);

      await page.getByPlaceholder(landing.requiredField).fill('E2E-TEST landing');
      await page.getByPlaceholder(/Telefon raqami \*/).fill('+998901234567');
      await page.locator('form').getByRole('button', { name: /So‘rov yuborish/ }).click();

      await expect(page.locator('p[role="alert"]')).toContainText('rozilik');
    });
  }

  test('landinglar ru tilida canonical va hreflang bilan ochiladi', async ({ page }) => {
    await page.goto('/ru/organizations');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('организаций');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ru\/organizations/);
    await expect(page.locator('link[rel="alternate"][hreflang="uz"]')).toHaveCount(1);
    await expect(page.getByPlaceholder('Название организации *')).toBeVisible();
  });

  test('start to‘plamlarda Telegram deep-linklari to‘plam nomini uzatadi', async ({ page }) => {
    await page.goto('/uz/starter-kits');

    const kits = page.locator('article');
    await expect(kits).toHaveCount(4);

    const firstKitName = await kits.first().locator('h2').innerText();
    const href = decodeURIComponent((await kits.first().locator('a[href*="t.me"]').getAttribute('href')) || '');
    expect(href).toContain(firstKitName);
    expect(href).toMatch(/hisoblab yuboring/);
  });
});
