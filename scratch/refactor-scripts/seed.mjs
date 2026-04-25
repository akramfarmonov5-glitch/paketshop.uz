import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  {
    name: 'Chiqindi paketlari',
    image: 'https://images.unsplash.com/photo-1610555356070-d1fb336f13b1?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Salfetka va lattalar',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Zip-Lock paketlar',
    image: 'https://images.unsplash.com/photo-1605600659908-0befcd3d6331?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Konteynerlar va idishlar',
    image: 'https://images.unsplash.com/photo-1596649811779-16a70a8d67c5?q=80&w=1000&auto=format&fit=crop',
  }
];

const products = [
  {
    name: "Musor paketlari Professional 50x70 sm",
    price: 8500,
    category: "Chiqindi paketlari",
    image: "https://images.unsplash.com/photo-1610555356070-d1fb336f13b1?q=80&w=1000&auto=format&fit=crop",
    description: "Sifatli va mustahkam qora rangli chiqindi qoplari, kundalik foydalanish uchun qulay.",
    stock: 500,
    itemsPerPackage: 25,
    specifications: [
      { label: "O'lcham", value: "50x70 sm" },
      { label: "Soni", value: "25 dona" },
      { label: "Rang", value: "Qora" },
      { label: "Material", value: "Zich polietilen" }
    ]
  },
  {
    name: "Chiqindi uchun qoplar 70x90 sm",
    price: 8000,
    category: "Chiqindi paketlari",
    image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=1000&auto=format&fit=crop",
    description: "Katta hajmli va baquvvat chiqindi qoplari, ofis va xo'jalik ishlari uchun mos.",
    stock: 300,
    itemsPerPackage: 20,
    specifications: [
      { label: "O'lcham", value: "70x90 sm" },
      { label: "Soni", value: "20 dona" },
      { label: "Hajm", value: "120L" },
      { label: "Turi", value: "Mustahkamlangan" }
    ]
  },
  {
    name: "Verita universal tozalash lattalari",
    price: 8000,
    category: "Salfetka va lattalar",
    image: "https://images.unsplash.com/photo-1584820927498-cafe2c1c6e1e?q=80&w=1000&auto=format&fit=crop",
    description: "Yuqori sifatli universal lattalar, har qanday yuzani tozalash uchun ideal.",
    stock: 150,
    itemsPerPackage: 3,
    specifications: [
      { label: "Turi", value: "Universal latta" },
      { label: "Soni", value: "3 dona" },
      { label: "Ishlab chiqaruvchi", value: "Verita (Germaniya)" },
      { label: "Xususiyat", value: "Namlikni yaxshi tortadi" }
    ]
  },
  {
    name: "Mikrofibra lattalar",
    price: 17000,
    category: "Salfetka va lattalar",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1000&auto=format&fit=crop",
    description: "Uy va avtomobil uchun mikrofibra matoli lattalar, suvni yaxshi tortadi.",
    stock: 200,
    itemsPerPackage: 1,
    specifications: [
      { label: "Material", value: "Mikrofibra" },
      { label: "Qo'llanilishi", value: "Uy va Avtomobil" },
      { label: "Afzalligi", value: "Dog' qoldirmaydi" },
      { label: "Hajmi", value: "40x40 sm" }
    ]
  },
  {
    name: "Ziplock paketlar 6x9 sm",
    price: 5000,
    category: "Zip-Lock paketlar",
    image: "https://images.unsplash.com/photo-1605600659908-0befcd3d6331?q=80&w=1000&auto=format&fit=crop",
    description: "Mayda buyumlarni saqlash uchun qulay qulflanadigan kichik paketlar.",
    stock: 1000,
    itemsPerPackage: 200,
    specifications: [
      { label: "O'lcham", value: "6x9 sm" },
      { label: "Soni", value: "200 dona" },
      { label: "Turi", value: "Shaffof Zip-lock" },
      { label: "Material", value: "Polietilen" }
    ]
  },
  {
    name: "Ziplock paketlar 5x7 sm",
    price: 4000,
    category: "Zip-Lock paketlar",
    image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=1000&auto=format&fit=crop",
    description: "Zich yopiladigan, shaffof va sifatli polietilen zip-paketlar.",
    stock: 1200,
    itemsPerPackage: 200,
    specifications: [
      { label: "O'lcham", value: "5x7 sm" },
      { label: "Soni", value: "200 dona" },
      { label: "Zichligi", value: "Standart" },
      { label: "Qulf turi", value: "Germetik" }
    ]
  },
  {
    name: "Plastik oziq-ovqat konteyneri 1000ml",
    price: 230000,
    category: "Konteynerlar va idishlar",
    image: "https://images.unsplash.com/photo-1596649811779-16a70a8d67c5?q=80&w=1000&auto=format&fit=crop",
    description: "Issiq va sovuq taomlar uchun mo'ljallangan plastik idishlar to'plami.",
    stock: 50,
    itemsPerPackage: 200,
    specifications: [
      { label: "Hajmi", value: "1000 ml" },
      { label: "Soni", value: "200 dona" },
      { label: "Turi", value: "Oziq-ovqat uchun" },
      { label: "Material", value: "Oziq-ovqat plastigi" }
    ]
  },
  {
    name: "Plastik sanchqilar (PS)",
    price: 13000,
    category: "Konteynerlar va idishlar",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop",
    description: "Bir marta ishlatiladigan sifatli plastik sanchqilar.",
    stock: 800,
    itemsPerPackage: 100,
    specifications: [
      { label: "Turi", value: "Sanchqi" },
      { label: "Soni", value: "100 dona" },
      { label: "Material", value: "Polistirol (PS)" },
      { label: "Rang", value: "Oq" }
    ]
  }
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    const { error } = await supabase.from('categories').insert(cat);
    if (error) console.error("Error inserting category:", error);
  }
  console.log('Seeding products...');
  for (const prod of products) {
    const { error } = await supabase.from('products').insert(prod);
    if (error) console.error("Error inserting product:", error);
  }
  console.log('Seeding finished!');
}

seed();
