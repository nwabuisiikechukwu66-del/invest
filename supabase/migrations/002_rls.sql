-- ─────────────────────────────────────────────────────────────────────────────
-- 002_rls.sql
-- Row Level Security policies for RealtyInvestors
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages     ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Users can read and update their own profile only.
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can read all profiles (service role bypasses RLS automatically)
-- No additional policy needed for service role.

-- ── properties ───────────────────────────────────────────────────────────────
-- All active properties are publicly readable (even unauthenticated).
CREATE POLICY "properties: public read"
  ON public.properties FOR SELECT
  USING (is_active = TRUE);

-- Only service role (admin) can insert / update / delete properties.
-- (Service role bypasses RLS, so no extra policy needed.)

-- ── documents ────────────────────────────────────────────────────────────────
-- Public documents readable by anyone.
CREATE POLICY "documents: public read"
  ON public.documents FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can read all documents for properties they have invested in.
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
  );

-- ── investments ──────────────────────────────────────────────────────────────
-- Users can only see their own investments.
CREATE POLICY "investments: select own"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own investments.
CREATE POLICY "investments: insert own"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── transactions ─────────────────────────────────────────────────────────────
CREATE POLICY "transactions: select own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions: insert own"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── earnings ─────────────────────────────────────────────────────────────────
CREATE POLICY "earnings: select own"
  ON public.earnings FOR SELECT
  USING (auth.uid() = user_id);

-- ── messages ─────────────────────────────────────────────────────────────────
-- Users can read their own thread.
CREATE POLICY "messages: select own"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id);

-- Users can send messages in their own thread.
CREATE POLICY "messages: insert own"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND from_admin = FALSE);
