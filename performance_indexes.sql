-- Performance Optimization Indexes
-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Products table indexes for fast filtering and searching
CREATE INDEX IF NOT EXISTS products_active_idx ON public.products (active);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_company_id_idx ON public.products (company_id);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
-- GIN index for search on product names
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);

-- Inquiries table indexes
CREATE INDEX IF NOT EXISTS inquiries_seller_id_idx ON public.inquiries (seller_id);
CREATE INDEX IF NOT EXISTS inquiries_buyer_id_idx ON public.inquiries (buyer_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies (owner_id);

-- Profile indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS messages_inquiry_id_idx ON public.messages (inquiry_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages (created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications (read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);
