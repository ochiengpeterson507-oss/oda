import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProducts() {
  const { data: products } = await supabase.from('products').select('id, name, price_range').limit(1);
  console.log("Product price_range:", products?.[0]?.price_range);
}

checkProducts();
