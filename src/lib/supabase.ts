import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  company_id?: string;
}
