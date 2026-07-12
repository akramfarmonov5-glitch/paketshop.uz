import { loadEnvFile } from 'node:process';
import { defineConfig, env } from 'prisma/config';

try {
  loadEnvFile();
} catch (e) {
  // Ignore missing .env file on Vercel
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
});
