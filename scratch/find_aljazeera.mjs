import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function findAlJazeera() {
  console.log("--- SCANNING SUPABASE FOR ALJAZEERA IMAGES ---");
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const tables = ['products', 'blog_posts', 'categories', 'hero_content', 'navigation_settings'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`[XATOLIK] Jadval: ${table} - ${error.message}`);
        continue;
      }
      
      const dataStr = JSON.stringify(data);
      if (dataStr.includes('aljazeera')) {
        console.log(`\n🔍 MUVAFFAQIYAT! '${table}' jadvalida 'aljazeera' topildi:`);
        data.forEach((row, index) => {
          if (JSON.stringify(row).includes('aljazeera')) {
            console.log(`\nQator #${index + 1}:`);
            console.log(JSON.stringify(row, null, 2));
          }
        });
      }
    } catch (e) {
      console.error(`scan error on table ${table}:`, e.message);
    }
  }
  console.log("\n--- SCANNING COMPLETE ---");
}

findAlJazeera();
