import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testProductsRLS() {
  // Try to create mock product? no we can't do it with anon key unless we auth
}
testProductsRLS();
