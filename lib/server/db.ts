import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL
  || 'postgresql://paketshop:paketshop@localhost:5432/paketshop?schema=public';

// Supabase session pooler bir loyiha uchun 15 ta ulanishga ruxsat beradi.
// Cheklovsiz pool migration/seed skriptlari va boshqa instansiyalarga joy qoldirmaydi
// va limit tugaganda so'rovlar EMAXCONNSESSION bilan yiqiladi.
const POOL_MAX = Number(process.env.DATABASE_POOL_MAX) || 3;

export const db = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaPg({ connectionString, max: POOL_MAX, idleTimeoutMillis: 10_000 }),
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
