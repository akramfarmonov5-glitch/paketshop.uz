import crypto from 'node:crypto';
import { hash } from 'bcryptjs';
import { db } from './db';
import { E2E_ADMIN_EMAIL, E2E_REDIRECT_FROM, E2E_REDIRECT_TO, saveCredentials } from './fixtures';

export default async function globalSetup(): Promise<void> {
  const password = `E2e${crypto.randomBytes(12).toString('base64url')}`;

  const role = await db.role.findUniqueOrThrow({ where: { code: 'SUPER_ADMIN' } });
  const user = await db.user.upsert({
    where: { email: E2E_ADMIN_EMAIL },
    update: { passwordHash: await hash(password, 10), active: true },
    create: { email: E2E_ADMIN_EMAIL, name: 'E2E Runner', passwordHash: await hash(password, 10), active: true },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  saveCredentials(password);

  await db.redirect.upsert({
    where: { fromPath: E2E_REDIRECT_FROM },
    update: { toPath: E2E_REDIRECT_TO, statusCode: 301, active: true },
    create: { fromPath: E2E_REDIRECT_FROM, toPath: E2E_REDIRECT_TO, statusCode: 301, active: true },
  });

  const activeProducts = await db.product.count({ where: { status: 'ACTIVE' } });
  if (activeProducts === 0) {
    throw new Error('E2E uchun kamida bitta ACTIVE mahsulot kerak — avval `npm run db:seed` va migratsiya skriptini ishga tushiring.');
  }

  console.log(`E2E setup: admin tayyor, ${activeProducts} ta faol mahsulot, test redirect yaratildi.`);
  await db.$disconnect();
}
