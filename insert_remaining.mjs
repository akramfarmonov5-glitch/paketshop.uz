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

const products = [
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

async function insert() {
  console.log('Seeding remaining products...');
  for (const prod of products) {
    const { error } = await supabase.from('products').insert(prod);
    if (error) console.error("Error inserting product:", error);
  }
  console.log('Seeding finished!');
}

insert();
