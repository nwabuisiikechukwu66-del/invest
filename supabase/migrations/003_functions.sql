-- ─────────────────────────────────────────────────────────────────────────────
-- 003_functions.sql
-- Utility database functions and views for RealtyInvestors
-- ─────────────────────────────────────────────────────────────────────────────

-- ── get_portfolio_summary ────────────────────────────────────────────────────
-- Returns totals for a user's portfolio.
CREATE OR REPLACE FUNCTION public.get_portfolio_summary(p_user_id UUID)
RETURNS TABLE (
  total_invested   NUMERIC,
  total_earnings   NUMERIC,
  active_count     BIGINT,
  avg_roi          NUMERIC
)
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    COALESCE(SUM(i.amount_invested), 0)               AS total_invested,
    COALESCE(SUM(e.rental_income + e.appreciation), 0) AS total_earnings,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'active') AS active_count,
    COALESCE(AVG(p.roi), 0)                           AS avg_roi
  FROM public.investments i
  JOIN public.properties p ON p.id = i.property_id
  LEFT JOIN public.earnings e ON e.investment_id = i.id
  WHERE i.user_id = p_user_id;
$$;

-- ── create_investment ────────────────────────────────────────────────────────
-- Creates an investment and updates property raised_amount atomically.
CREATE OR REPLACE FUNCTION public.create_investment(
  p_user_id     UUID,
  p_property_id UUID,
  p_amount      NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_target      NUMERIC;
  v_raised      NUMERIC;
  v_min         NUMERIC;
  v_inv_id      UUID;
  v_ownership   NUMERIC;
BEGIN
  -- Fetch property details
  SELECT target_amount, raised_amount, min_investment
  INTO v_target, v_raised, v_min
  FROM public.properties
  WHERE id = p_property_id AND is_active = TRUE AND status IN ('active', 'closing')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not available for investment.';
  END IF;

  IF p_amount < v_min THEN
    RAISE EXCEPTION 'Amount is below the minimum investment of %.', v_min;
  END IF;

  IF v_raised + p_amount > v_target THEN
    RAISE EXCEPTION 'Investment exceeds remaining funding target.';
  END IF;

  -- Calculate ownership percentage
  v_ownership := (p_amount / v_target) * 100;

  -- Insert investment
  INSERT INTO public.investments (user_id, property_id, amount_invested, ownership_pct, status)
  VALUES (p_user_id, p_property_id, p_amount, v_ownership, 'active')
  RETURNING id INTO v_inv_id;

  -- Update raised amount on property
  UPDATE public.properties
  SET raised_amount = raised_amount + p_amount,
      status = CASE WHEN raised_amount + p_amount >= target_amount THEN 'funded' ELSE status END
  WHERE id = p_property_id;

  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, description, reference)
  VALUES (p_user_id, 'investment', -p_amount, 'Property investment', v_inv_id::TEXT);

  RETURN v_inv_id;
END;
$$;

-- ── distribute_earnings ──────────────────────────────────────────────────────
-- Called monthly (via Edge Function cron) to distribute rental income.
CREATE OR REPLACE FUNCTION public.distribute_earnings(
  p_property_id UUID,
  p_period      DATE,
  p_total_rental NUMERIC,
  p_total_appreciation NUMERIC
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_target NUMERIC;
  v_count  INTEGER := 0;
  rec      RECORD;
BEGIN
  SELECT target_amount INTO v_target FROM public.properties WHERE id = p_property_id;

  FOR rec IN
    SELECT id, user_id, amount_invested, ownership_pct
    FROM public.investments
    WHERE property_id = p_property_id AND status = 'active'
  LOOP
    INSERT INTO public.earnings (
      user_id, investment_id, period_month,
      rental_income, appreciation
    )
    VALUES (
      rec.user_id,
      rec.id,
      p_period,
      ROUND((rec.ownership_pct / 100) * p_total_rental, 2),
      ROUND((rec.ownership_pct / 100) * p_total_appreciation, 2)
    );

    -- Record income transaction
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (
      rec.user_id,
      'income',
      ROUND((rec.ownership_pct / 100) * (p_total_rental + p_total_appreciation), 2),
      'Monthly earnings distribution'
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ── view: admin_investor_overview ────────────────────────────────────────────
-- Admin-only view (service role) showing all investor summaries.
CREATE OR REPLACE VIEW public.admin_investor_overview AS
SELECT
  p.id,
  p.first_name || ' ' || p.last_name         AS full_name,
  u.email,
  p.country,
  p.kyc_status,
  p.investor_level,
  COUNT(DISTINCT i.id)                        AS total_investments,
  COALESCE(SUM(i.amount_invested), 0)         AS total_invested,
  COALESCE(SUM(e.total), 0)                   AS total_earnings,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN public.investments i ON i.user_id = p.id AND i.status = 'active'
LEFT JOIN public.earnings e ON e.user_id = p.id
GROUP BY p.id, u.email;

-- ── view: property_funding_progress ──────────────────────────────────────────
CREATE OR REPLACE VIEW public.property_funding_progress AS
SELECT
  id,
  name,
  location,
  type,
  target_amount,
  raised_amount,
  ROUND((raised_amount / NULLIF(target_amount, 0)) * 100, 1) AS funded_pct,
  status,
  roi,
  min_investment
FROM public.properties
WHERE is_active = TRUE;
