import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './fixtures';

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('E2E uchun DATABASE_URL kerak');

// Test skriptlari ilovaning ulanish byudjetini yeb qo'ymasligi uchun kichik pool.
export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 2 }) });
