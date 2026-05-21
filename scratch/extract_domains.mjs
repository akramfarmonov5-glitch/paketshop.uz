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

async function extract() {
  console.log("--- EXTRACTING ALL UNIQUE IMAGE DOMAINS FROM DATABASE ---");
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const tables = ['products', 'blog_posts', 'categories'];
  const domains = new Set();

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error on table ${table}: ${error.message}`);
        continue;
      }
      
      data.forEach(row => {
        // Direct 'image'
        if (row.image && typeof row.image === 'string' && row.image.startsWith('http')) {
          try {
            const url = new URL(row.image);
            domains.add(url.hostname);
          } catch(e){}
        }
        
        // Array of 'images'
        if (row.images) {
          let parsedImages = row.images;
          if (typeof row.images === 'string') {
            try {
              parsedImages = JSON.parse(row.images);
            } catch(e){}
          }
          if (Array.isArray(parsedImages)) {
            parsedImages.forEach(img => {
              if (typeof img === 'string' && img.startsWith('http')) {
                try {
                  const url = new URL(img);
                  domains.add(url.hostname);
                } catch(e){}
              }
            });
          }
        }
      });
    } catch (e) {
      console.error(`Failed to scan ${table}:`, e.message);
    }
  }

  console.log("\nFound unique domains:");
  console.log(Array.from(domains));
  console.log("\n--- EXTRACTING COMPLETE ---");
}

extract();
