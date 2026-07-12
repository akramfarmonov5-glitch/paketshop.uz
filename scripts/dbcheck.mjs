import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const [roles, categories, translations, users, userRoles, settings] = await Promise.all([
  db.role.count(),
  db.category.count(),
  db.categoryTranslation.count(),
  db.user.count(),
  db.userRole.count(),
  db.siteSetting.count(),
]);

console.log(`Rollar: ${roles}`);
console.log(`Kategoriyalar: ${categories}`);
console.log(`Kategoriya tarjimalari: ${translations}`);
console.log(`Foydalanuvchilar: ${users}`);
console.log(`Foydalanuvchi rollari: ${userRoles}`);
console.log(`Sozlamalar: ${settings}`);

await db.$disconnect();
