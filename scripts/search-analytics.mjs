import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const rows = await db.searchQuery.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
for (const row of rows) console.log(`${row.query} | ${row.locale} | natija: ${row.resultCount} | ${row.source}`);
console.log(`Jami yozuvlar: ${await db.searchQuery.count()}`);
await db.$disconnect();
