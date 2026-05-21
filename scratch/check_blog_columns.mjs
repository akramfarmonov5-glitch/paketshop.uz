import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// .env.local faylini qo'lda o'qish
function loadEnv() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogPosts() {
  console.log("Supabase blog_posts jadvali ustunlari tekshirilmoqda...");
  const { data, error } = await supabase.from('blog_posts').select('*').limit(1);
  
  if (error) {
    console.error("Xatolik:", error);
  } else {
    console.log("Topilgan yozuvlar soni:", data.length);
    if (data.length > 0) {
      console.log("Jadvaldagi ustunlar (Columns):", Object.keys(data[0]));
      console.log("Yozuv namunasi:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("Jadval bo'sh.");
    }
  }
}

checkBlogPosts();
