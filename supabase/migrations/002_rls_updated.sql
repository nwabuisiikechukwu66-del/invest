-- ─────────────────────────────────────────────────────────────────────────────
-- 002_rls.sql (Updated)
-- Row Level Security policies for RealtyInvestors
-- Includes admin access policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ── Helper function to check if user is admin ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Users can read and update their own profile only.
DROP POLICY IF EXISTS "profiles: select own" ON public.profiles;
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin() = TRUE);

DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin() = TRUE)
  WITH CHECK (auth.uid() = id OR public.is_admin() = TRUE);

-- Admin can insert new profiles
DROP POLICY IF EXISTS "profiles: admin insert" ON public.profiles;
CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

-- Admin can delete profiles
DROP POLICY IF EXISTS "profiles: admin delete" ON public.profiles;
CREATE POLICY "profiles: admin delete"
  ON public.profiles FOR DELETE
  USING (public.is_admin() = TRUE);

-- ── properties ───────────────────────────────────────────────────────────────
-- All active properties are publicly readable
DROP POLICY IF EXISTS "properties: public read" ON public.properties;
CREATE POLICY "properties: public read"
  ON public.properties FOR SELECT
  USING (is_active = TRUE);

-- Admin has full access to properties
DROP POLICY IF EXISTS "properties: admin full" ON public.properties;
CREATE POLICY "properties: admin full"
  ON public.properties FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── documents ───────────────────────────────────────────────────────────────
-- Public documents readable by anyone
DROP POLICY IF EXISTS "documents: public read" ON public.documents;
CREATE POLICY "documents: public read"
  ON public.documents FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can read documents for properties they've invested in
DROP POLICY IF EXISTS "documents: investor read" ON public.documents;
CREATE POLICY "documents: investor read"
  ON public.documents FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.investments
      WHERE investments.property_id = documents.property_id
        AND investments.user_id = auth.uid()
        AND investments.status IN ('active', 'completed')
    )
  );

-- Admin has full access to documents
DROP POLICY IF EXISTS "documents: admin full" ON public.documents;
CREATE POLICY "documents: admin full"
  ON public.documents FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── investments ──────────────────────────────────────────────────────────────
-- Users can only see their own investments
DROP POLICY IF EXISTS "investments: select own" ON public.investments;
CREATE POLICY "investments: select own"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Users can create their own investments
DROP POLICY IF EXISTS "investments: insert own" ON public.investments;
CREATE POLICY "investments: insert own"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Users can update their own investments
DROP POLICY IF EXISTS "investments: update own" ON public.investments;
CREATE POLICY "investments: update own"
  ON public.investments FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin() = TRUE)
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Admin has full access to investments
DROP POLICY IF EXISTS "investments: admin full" ON public.investments;
CREATE POLICY "investments: admin full"
  ON public.investments FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── transactions ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "transactions: select own" ON public.transactions;
CREATE POLICY "transactions: select own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

DROP POLICY IF EXISTS "transactions: insert own" ON public.transactions;
CREATE POLICY "transactions: insert own"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

DROP POLICY IF EXISTS "transactions: update own" ON public.transactions;
CREATE POLICY "transactions: update own"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin() = TRUE)
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Admin has full access
DROP POLICY IF EXISTS "transactions: admin full" ON public.transactions;
CREATE POLICY "transactions: admin full"
  ON public.transactions FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── earnings ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "earnings: select own" ON public.earnings;
CREATE POLICY "earnings: select own"
  ON public.earnings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

DROP POLICY IF EXISTS "earnings: insert own" ON public.earnings;
CREATE POLICY "earnings: insert own"
  ON public.earnings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

DROP POLICY IF EXISTS "earnings: update own" ON public.earnings;
CREATE POLICY "earnings: update own"
  ON public.earnings FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin() = TRUE)
  WITH CHECK (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Admin has full access
DROP POLICY IF EXISTS "earnings: admin full" ON public.earnings;
CREATE POLICY "earnings: admin full"
  ON public.earnings FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── messages ─────────────────────────────────────────────────────────────────
-- Users can read their own thread
DROP POLICY IF EXISTS "messages: select own" ON public.messages;
CREATE POLICY "messages: select own"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Users can send messages (not as admin)
DROP POLICY IF EXISTS "messages: insert own" ON public.messages;
CREATE POLICY "messages: insert own"
  ON public.messages FOR INSERT
  WITH CHECK ((auth.uid() = user_id AND from_admin = FALSE) OR public.is_admin() = TRUE);

-- Admin can read all messages
DROP POLICY IF EXISTS "messages: admin read" ON public.messages;
CREATE POLICY "messages: admin read"
  ON public.messages FOR SELECT
  USING (public.is_admin() = TRUE);

-- Admin can send messages as admin
DROP POLICY IF EXISTS "messages: admin insert" ON public.messages;
CREATE POLICY "messages: admin insert"
  ON public.messages FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

-- ── admin_activity_log ─────────────────────────────────────────────────────
-- Only admins can read activity log
DROP POLICY IF EXISTS "admin_log: admin read" ON public.admin_activity_log;
CREATE POLICY "admin_log: admin read"
  ON public.admin_activity_log FOR SELECT
  USING (public.is_admin() = TRUE);

-- Admin can insert activity logs
DROP POLICY IF EXISTS "admin_log: admin insert" ON public.admin_activity_log;
CREATE POLICY "admin_log: admin insert"
  ON public.admin_activity_log FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

