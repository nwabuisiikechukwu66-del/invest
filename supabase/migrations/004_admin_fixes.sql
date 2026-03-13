-- ─────────────────────────────────────────────────────────────────────────────
-- 004_admin_fixes.sql
-- Add DELETE privileges for admins, new fields, and replication for real-time
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable logical replication on profiles, transactions, investments, earnings, messages for real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.earnings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Helper function is_admin() should already be defined from 002.

-- 1. profiles table: Allow Admins to Delete Users
DROP POLICY IF EXISTS "profiles: delete admin" ON public.profiles;
CREATE POLICY "profiles: delete admin"
  ON public.profiles FOR DELETE
  USING (public.is_admin() = TRUE);

-- 2. transactions table: Admins can delete
DROP POLICY IF EXISTS "transactions: delete admin" ON public.transactions;
CREATE POLICY "transactions: delete admin"
  ON public.transactions FOR DELETE
  USING (public.is_admin() = TRUE);

-- Add updated_at trigger for transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    CREATE TRIGGER trg_transactions_updated_at
      BEFORE UPDATE ON public.transactions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 3. investments table: Admins can delete
DROP POLICY IF EXISTS "investments: delete admin" ON public.investments;
CREATE POLICY "investments: delete admin"
  ON public.investments FOR DELETE
  USING (public.is_admin() = TRUE);

-- Add updated_at trigger for investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.investments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    CREATE TRIGGER trg_investments_updated_at
      BEFORE UPDATE ON public.investments
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 4. earnings table: Admins can delete
DROP POLICY IF EXISTS "earnings: delete admin" ON public.earnings;
CREATE POLICY "earnings: delete admin"
  ON public.earnings FOR DELETE
  USING (public.is_admin() = TRUE);

-- Add updated_at trigger for earnings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'earnings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    CREATE TRIGGER trg_earnings_updated_at
      BEFORE UPDATE ON public.earnings
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 5. messages table: Admins can delete
DROP POLICY IF EXISTS "messages: delete admin" ON public.messages;
CREATE POLICY "messages: delete admin"
  ON public.messages FOR DELETE
  USING (public.is_admin() = TRUE);

-- Add updated_at trigger for messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    CREATE TRIGGER trg_messages_updated_at
      BEFORE UPDATE ON public.messages
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
