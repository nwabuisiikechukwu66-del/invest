-- ─────────────────────────────────────────────────────────────────────────────
-- 001_schema.sql (Updated - Idempotent Version)
-- Core database schema for RealtyInvestors
-- Run in Supabase SQL Editor in order: 001 → 002 → 003
-- This version is fully idempotent - safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Extended user data. One row per auth.users entry.
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT,
  country         TEXT,
  phone           TEXT,
  kyc_status      TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
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
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── documents ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id     UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  file_path       TEXT,
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
  ownership_pct   NUMERIC(8,6),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'paid')),
  payment_status  TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
  paid_at         TIMESTAMPTZ,
  invested_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id   UUID REFERENCES public.investments(id),
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'income', 'fee', 'refund')),
  amount          NUMERIC(12,2) NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  reference       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── earnings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.earnings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id   UUID REFERENCES public.investments(id),
  period_month    DATE NOT NULL,
  rental_income   NUMERIC(12,2) DEFAULT 0,
  appreciation    NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) GENERATED ALWAYS AS (rental_income + appreciation) STORED,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── messages (support chat) ─────────────────────────────────────────────────
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
  admin_id        UUID REFERENCES auth.users(id),
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

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Trigger: auto-create profile on signup ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, country)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'country'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger: auto-calculate ownership percentage ──────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_ownership()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    SELECT target_amount INTO NEW.ownership_pct
    FROM public.properties
    WHERE id = NEW.property_id;
    
    IF NEW.ownership_pct > 0 THEN
      NEW.ownership_pct := (NEW.amount_invested / NEW.ownership_pct) * 100;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_investments_ownership ON public.investments;
CREATE TRIGGER trg_investments_ownership
  BEFORE INSERT OR UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.calculate_ownership();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investments_user    ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_prop    ON public.investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user  ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_user     ON public.earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user     ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_read     ON public.messages(read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_documents_prop    ON public.documents(property_id);
CREATE INDEX IF NOT EXISTS idx_profiles_admin    ON public.profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_admin_log_admin   ON public.admin_activity_log(admin_id);

