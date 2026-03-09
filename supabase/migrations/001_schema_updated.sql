-- ─────────────────────────────────────────────────────────────────────────────
-- 001_schema_updated.sql
-- Core database schema for RealtyInvestors (Updated)
-- Run in Supabase SQL Editor in order: 001 → 002 → 003
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Extended user data. One row per auth.users entry.
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name      TEXT,
  last_name       TEXT,
  country         TEXT,
  phone           TEXT,
  kyc_status      TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  kyc_notes       TEXT,
  kyc_verified_at TIMESTAMPTZ,
  investor_level  TEXT DEFAULT 'new' CHECK (investor_level IN ('new', 'active', 'premium')),
  bank_account    TEXT,
  is_admin        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── properties ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.properties (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            TEXT NOT NULL,
  location        TEXT NOT NULL,
  country         TEXT NOT NULL,
  type            TEXT NOT NULL,
  image_url       TEXT,
  description     TEXT,
  roi             NUMERIC(5,2) NOT NULL,
  min_investment  NUMERIC(12,2) NOT NULL DEFAULT 100,
  target_amount   NUMERIC(15,2) NOT NULL,
  raised_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
  rental_yield    NUMERIC(5,2),
  duration_months INTEGER,
  bedrooms        INTEGER DEFAULT 0,
  sqft            INTEGER,
  year_built      INTEGER,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'closing', 'funded', 'completed')),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── documents ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id     UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  file_path       TEXT,               -- Supabase storage path
  file_size_kb    INTEGER,
  is_public       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── investments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.investments (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES public.properties(id),
  amount_invested NUMERIC(12,2) NOT NULL,
  ownership_pct   NUMERIC(8,6),       -- calculated: amount / target * 100
  status          TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_status  TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  paid_at         TIMESTAMPTZ,
  invested_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'income', 'credit', 'earning', 'fee')),
  amount          NUMERIC(12,2) NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  reference       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── earnings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.earnings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id   UUID REFERENCES public.investments(id),
  period_month    DATE NOT NULL,      -- first day of the month
  rental_income   NUMERIC(12,2) DEFAULT 0,
  appreciation    NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) GENERATED ALWAYS AS (rental_income + appreciation) STORED,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── messages (support chat) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  from_admin      BOOLEAN DEFAULT FALSE,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── admin_activity_log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  target_type     TEXT,
  target_id       UUID,
  details         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Triggers: updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Trigger: auto-create profile on signup ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, country)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investments_user    ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_prop    ON public.investments(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user   ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_user       ON public.earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user       ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status   ON public.properties(status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_documents_prop      ON public.documents(property_id);
CREATE INDEX IF NOT EXISTS idx_earnings_investment ON public.earnings(investment_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_admin     ON public.admin_activity_log(admin_id);

-- ── Add columns if tables exist (for existing databases) ─────────────────────
-- Run these separately if upgrading an existing database

-- Add payment_status and paid_at to investments if not exists
-- ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
-- ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add is_admin to profiles if not exists
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add credit type to transactions if not exists
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_constraint 
--     WHERE conname = 'transactions_type_check'
--   ) THEN
--     ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
--     ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
--       CHECK (type IN ('deposit', 'withdrawal', 'investment', 'income', 'credit', 'earning', 'fee'));
--   END IF;
-- END $$;

