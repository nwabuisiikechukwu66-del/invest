-- ═══════════════════════════════════════════════════════════════════════════
-- EASY ADMIN ACCESS SCRIPT
-- Run this in Supabase SQL Editor to make a user an admin
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Find the user you want to make admin
-- Run this to see all users:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- STEP 2: Make a user admin (replace 'USER_EMAIL_HERE' with the actual email)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'greggreggreg100999@gmail.com';

-- OR by user ID (replace with actual UUID):
-- UPDATE public.profiles SET is_admin = true WHERE id = 'abc123-def456-ghi789';

-- STEP 3: Verify admin status
SELECT id, email, is_admin FROM public.profiles WHERE is_admin = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO ACCESS ADMIN DASHBOARD:
-- 1. Log in to the app with your admin account
-- 2. Navigate to: http://localhost:5173/admin (or your production URL)
-- ═══════════════════════════════════════════════════════════════════════════

