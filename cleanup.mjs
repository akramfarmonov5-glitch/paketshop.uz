import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAll() {
  console.log('Deleting all products...');
  const { error: err1 } = await supabase.from('products').delete().neq('id', 0);
  if (err1) console.error("Error deleting all products", err1);

  console.log('Deleting all categories...');
  const { error: err2 } = await supabase.from('categories').delete().neq('id', 0);
  if (err2) console.error("Error deleting all categories", err2);

  console.log('Database is completely empty!');
}

deleteAll();
