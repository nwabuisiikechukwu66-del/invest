-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data for RealtyInvestors
-- Run this after setting up your Supabase project
-- IMPORTANT: Replace UUID placeholders with actual user IDs after signup
-- ─────────────────────────────────────────────────────────────────────────────

-- Sample Properties
INSERT INTO public.properties (name, location, country, type, description, roi, min_investment, target_amount, raised_amount, rental_yield, bedrooms, sqft, status, is_active) VALUES
('Sunset Villa', 'Los Angeles', 'USA', 'house', 'Luxury 5-bedroom villa with ocean views', 14.5, 5000, 500000, 125000, 6.2, 5, 4200, 'active', TRUE),
('Downtown Loft', 'New York', 'USA', 'apartment', 'Modern loft in Manhattan', 12.8, 2500, 250000, 180000, 5.8, 2, 1100, 'active', TRUE),
('Beach Resort', 'Miami', 'USA', 'condo', 'Beachfront condo with resort amenities', 15.2, 10000, 1000000, 450000, 7.5, 3, 1800, 'active', TRUE),
('Mountain Cabin', 'Denver', 'USA', 'house', 'Cozy mountain retreat', 11.5, 3000, 150000, 75000, 4.8, 4, 2400, 'active', TRUE),
('City Center Office', 'Chicago', 'USA', 'commercial', 'Prime commercial office space', 13.9, 15000, 800000, 320000, 6.5, 0, 5000, 'active', TRUE),
('Lakeside Cottage', 'Seattle', 'USA', 'house', 'Peaceful lakeside property', 10.8, 4000, 300000, 90000, 5.2, 3, 1900, 'closing', TRUE),
('Urban Studio', 'San Francisco', 'USA', 'apartment', 'Compact studio in tech hub', 16.5, 1500, 100000, 95000, 6.8, 0, 550, 'funded', TRUE)
ON CONFLICT DO NOTHING;

-- Sample Documents (linked to properties)
INSERT INTO public.documents (property_id, name, file_path, is_public) VALUES
((SELECT id FROM public.properties WHERE name = 'Sunset Villa' LIMIT 1), 'Property Details', '/docs/sunset-villa.pdf', TRUE),
((SELECT id FROM public.properties WHERE name = 'Sunset Villa' LIMIT 1), 'Financial Projections', '/docs/sunset-villa-financials.pdf', TRUE),
((SELECT id FROM public.properties WHERE name = 'Downtown Loft' LIMIT 1), 'Property Details', '/docs/downtown-loft.pdf', TRUE),
((SELECT id FROM public.properties WHERE name = 'Beach Resort' LIMIT 1), 'Property Details', '/docs/beach-resort.pdf', TRUE),
((SELECT id FROM public.properties WHERE name = 'Beach Resort' LIMIT 1), 'Floor Plan', '/docs/beach-resort-floorplan.pdf', TRUE)
ON CONFLICT DO NOTHING;

-- NOTE: To create an admin user:
-- 1. Sign up a new user through the app
-- 2. Run this SQL to make them admin (replace with their actual UUID):
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'user-uuid-here';

-- To get user IDs:
-- SELECT id, email FROM auth.users;

-- Sample investments (uncomment and replace with actual user IDs after signup)
-- INSERT INTO public.investments (user_id, property_id, amount_invested, status, payment_status) VALUES
-- ('user-uuid-1', (SELECT id FROM public.properties WHERE name = 'Sunset Villa' LIMIT 1), 10000, 'active', 'paid'),
-- ('user-uuid-1', (SELECT id FROM public.properties WHERE name = 'Downtown Loft' LIMIT 1), 5000, 'active', 'paid'),
-- ('user-uuid-2', (SELECT id FROM public.properties WHERE name = 'Beach Resort' LIMIT 1), 15000, 'active', 'unpaid');

-- Sample transactions (uncomment and replace with actual user IDs)
-- INSERT INTO public.transactions (user_id, type, amount, description, status) VALUES
-- ('user-uuid-1', 'deposit', 15000, 'Bank Transfer', 'completed'),
-- ('user-uuid-1', 'investment', -10000, 'Investment in Sunset Villa', 'completed'),
-- ('user-uuid-1', 'income', 450, 'Rental Income - Sunset Villa', 'completed'),
-- ('user-uuid-2', 'deposit', 20000, 'Bank Transfer', 'completed'),
-- ('user-uuid-2', 'investment', -15000, 'Investment in Beach Resort', 'completed');

-- Sample earnings (uncomment and replace with actual investment IDs)
-- INSERT INTO public.earnings (user_id, investment_id, period_month, rental_income, appreciation, paid_at) VALUES
-- ('user-uuid-1', (SELECT id FROM public.investments WHERE user_id = 'user-uuid-1' AND property_id = (SELECT id FROM public.properties WHERE name = 'Sunset Villa' LIMIT 1) LIMIT 1), '2024-01-01', 250, 200, NOW()),
-- ('user-uuid-1', (SELECT id FROM public.investments WHERE user_id = 'user-uuid-1' AND property_id = (SELECT id FROM public.properties WHERE name = 'Sunset Villa' LIMIT 1) LIMIT 1), '2024-02-01', 275, 220, NOW());

-- Sample messages
-- INSERT INTO public.messages (user_id, content, from_admin) VALUES
-- ('user-uuid-1', 'Hello, I would like to know more about the investment process.', FALSE),
-- ('user-uuid-1', 'Thank you for your interest! Happy to help. What would you like to know?', TRUE),
-- ('user-uuid-2', 'Is the Beach Resort property still available?', FALSE),
-- ('user-uuid-2', 'Yes, it is still available! Would you like to schedule a call?', TRUE);

