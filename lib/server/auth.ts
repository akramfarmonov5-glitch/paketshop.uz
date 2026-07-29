import 'server-only';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { db } from './db';

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
});

const DUMMY_PASSWORD_HASH = '$2b$12$OnTGgxEOaG9dBb6Xi/f8LOtjCbEBfEmR0mWe.3YitCBOdnGM7JwZ2';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/uz/admin' },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const forwardedFor = request.headers?.['x-forwarded-for'];
        const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
          ?.split(',')[0]
          ?.trim() || request.headers?.['x-real-ip'] || 'unknown';
        const rateLimitKey = `admin-login:${ip}:${email}`;
        const limit = checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);
        if (!limit.allowed) return null;

        const user = await db.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        });
        const passwordMatches = await compare(
          parsed.data.password,
          user?.passwordHash || DUMMY_PASSWORD_HASH,
        );
        if (!user?.active || !passwordMatches) return null;

        resetRateLimit(rateLimitKey);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles.map(({ role }) => role.code),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || '');
        session.user.roles = token.roles || [];
      }
      return session;
    },
  },
};
