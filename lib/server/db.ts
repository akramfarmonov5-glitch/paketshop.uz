import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL
  || 'postgresql://paketshop:paketshop@localhost:5432/paketshop?schema=public';

export const db = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
