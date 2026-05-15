import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Prevent "Failed to fetch" errors when Supabase is not configured
const customFetch = async (url: string | URL | Request, options?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : (url instanceof URL ? url.href : url.url);
  if (urlString.includes('placeholder-url')) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    return await fetch(url, options);
  } catch (err: any) {
    // If it's a fetch error, it's usually CORS or a bad URL.
    const message = err.message === 'Failed to fetch' 
      ? 'Failed to fetch. This usually means your Supabase URL is incorrect, or you need to add this app\'s URL to your Supabase CORS settings.'
      : err.message;
      
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  company_id?: string;
}
