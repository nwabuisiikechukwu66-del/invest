-- Simple patch to add admin functionality (run this if you already have the base schema)

-- 1. Add is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Add payment_status to investments if not exists  
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- 3. Make the columns nullable-friendly (if they already exist but have issues)
-- This is safe to run multiple times

-- 4. Create the admin helper function (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant admin permissions (run this to give yourself admin access)
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'greggreggreg10099@gmail.com';

