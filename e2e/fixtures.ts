import fs from 'node:fs';
import path from 'node:path';

/** E2E yozuvlarini haqiqiy ma'lumotlardan ajratish uchun belgi — teardown shu bo'yicha tozalaydi. */
export const E2E_MARKER = 'E2E-TEST';
export const E2E_ADMIN_EMAIL = 'e2e-runner@paketshop.local';
export const E2E_REDIRECT_FROM = '/e2e-eski-sahifa';
export const E2E_REDIRECT_TO = '/catalog';

const CREDENTIALS_FILE = path.join(process.cwd(), 'e2e', '.auth', 'credentials.json');

export function saveCredentials(password: string): void {
  fs.mkdirSync(path.dirname(CREDENTIALS_FILE), { recursive: true });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ email: E2E_ADMIN_EMAIL, password }), 'utf8');
}

export function readCredentials(): { email: string; password: string } {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    throw new Error('E2E admin ma\'lumotlari topilmadi — global-setup ishga tushmagan.');
  }
  return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
}

/** .env faylini Playwright jarayoniga yuklaydi (Vercel kabi muhitlarda fayl bo'lmasa jim o'tadi). */
export function loadEnv(): void {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env'));
  } catch {
    // .env yo'q — muhit o'zgaruvchilari tashqaridan berilgan deb hisoblaymiz.
  }
}
