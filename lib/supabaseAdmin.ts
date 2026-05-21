import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const hasAdminCredentials = Boolean(supabaseUrl && supabaseServiceKey);

// supabaseAdmin will bypass RLS. This should ONLY be used in secure API routes.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
