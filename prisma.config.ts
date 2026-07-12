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
    url: env('DATABASE_URL'),
  },
});
