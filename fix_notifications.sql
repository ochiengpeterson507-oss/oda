-- The following policy allows users to create notifications for other users
-- This fixes the error: new row violates row-level security policy for table "notifications"
-- when creating an inquiry that triggers a notification for the seller.

CREATE POLICY "Allow authenticated users to insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Alternatively, if your trigger function is causing the issue, you can make the function run as the database owner:
-- ALTER FUNCTION your_trigger_function_name() SECURITY DEFINER;
