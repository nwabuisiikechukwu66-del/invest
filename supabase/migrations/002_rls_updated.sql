-- ─────────────────────────────────────────────────────────────────────────────
-- 002_rls_updated.sql
-- Row Level Security policies for RealtyInvestors (Updated for Admin)
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

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE plpgsql STABLE;

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

-- Admins can insert new profiles
CREATE POLICY "profiles: insert admin"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

-- ── properties ───────────────────────────────────────────────────────────────
-- All active properties are publicly readable (even unauthenticated).
DROP POLICY IF EXISTS "properties: public read" ON public.properties;
CREATE POLICY "properties: public read"
  ON public.properties FOR SELECT
  USING (is_active = TRUE);

-- Admin can insert/update/delete properties
CREATE POLICY "properties: insert admin"
  ON public.properties FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

CREATE POLICY "properties: update admin"
  ON public.properties FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

CREATE POLICY "properties: delete admin"
  ON public.properties FOR DELETE
  USING (public.is_admin() = TRUE);

-- ── documents ────────────────────────────────────────────────────────────────
-- Public documents readable by anyone.
DROP POLICY IF EXISTS "documents: public read" ON public.documents;
CREATE POLICY "documents: public read"
  ON public.documents FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can read all documents for properties they have invested in.
DROP POLICY IF EXISTS "documents: investor read" ON public.documents;
CREATE POLICY "documents: investor read"
  ON public.documents FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.investments
      WHERE investments.property_id = documents.property_id
        AND investments.user_id = auth.uid()
        AND investments.status = 'active'
    )
  )
  OR public.is_admin() = TRUE;

-- Admin can insert documents
CREATE POLICY "documents: insert admin"
  ON public.documents FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

-- ── investments ──────────────────────────────────────────────────────────────
-- Users can only see their own investments.
DROP POLICY IF EXISTS "investments: select own" ON public.investments;
CREATE POLICY "investments: select own"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Users can create their own investments.
DROP POLICY IF EXISTS "investments: insert own" ON public.investments;
CREATE POLICY "investments: insert own"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can update any investment
CREATE POLICY "investments: update admin"
  ON public.investments FOR UPDATE
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

-- Admin can update transactions
CREATE POLICY "transactions: update admin"
  ON public.transactions FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── earnings ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "earnings: select own" ON public.earnings;
CREATE POLICY "earnings: select own"
  ON public.earnings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Admin can insert earnings
CREATE POLICY "earnings: insert admin"
  ON public.earnings FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

-- Admin can update earnings
CREATE POLICY "earnings: update admin"
  ON public.earnings FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── messages ─────────────────────────────────────────────────────────────────
-- Users can read their own thread.
DROP POLICY IF EXISTS "messages: select own" ON public.messages;
CREATE POLICY "messages: select own"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() = TRUE);

-- Users can send messages in their own thread.
DROP POLICY IF EXISTS "messages: insert own" ON public.messages;
CREATE POLICY "messages: insert own"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can also send messages (from_admin = true)
CREATE POLICY "messages: insert admin"
  ON public.messages FOR INSERT
  WITH CHECK (public.is_admin() = TRUE OR (auth.uid() = user_id AND from_admin = FALSE));

-- Admin can mark messages as read
CREATE POLICY "messages: update admin"
  ON public.messages FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- ── admin_activity_log ─────────────────────────────────────────────────────
-- Only admins can read/write activity log
CREATE POLICY "admin_activity_log: select admin"
  ON public.admin_activity_log FOR SELECT
  USING (public.is_admin() = TRUE);

CREATE POLICY "admin_activity_log: insert admin"
  ON public.admin_activity_log FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

