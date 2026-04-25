import { supabase } from './supabaseClient';

export async function isAdminUser(userId?: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Admin role lookup failed:', error.message);
    return false;
  }

  return Boolean(data);
}
