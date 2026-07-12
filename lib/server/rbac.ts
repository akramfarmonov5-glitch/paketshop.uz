import 'server-only';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'SALES_MANAGER' | 'WAREHOUSE_VIEWER';

export async function getAdminSession(allowedRoles: AdminRole[]) {
  const session = await getServerSession(authOptions);
  const roles = session?.user?.roles || [];
  if (!session?.user?.id || !roles.some((role) => allowedRoles.includes(role as AdminRole))) return null;
  return session;
}

export async function requireRole(allowedRoles: AdminRole[]) {
  const session = await getAdminSession(allowedRoles);
  if (!session) throw new Error('FORBIDDEN');
  return session;
}
