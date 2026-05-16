import { supabase } from './src/lib/supabase.js';

async function test() {
  const { data, error } = await supabase.from('products').insert({
    company_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test',
    description: 'Test',
    price: 10,
    category_id: null,
    images: ['https://example.com/image.jpg'],
    active: true
  });
  console.log(error);
}

test();
