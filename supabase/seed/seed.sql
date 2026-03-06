-- ─────────────────────────────────────────────────────────────────────────────
-- seed.sql
-- Sample property data for development and staging
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.properties
  (name, location, country, type, image_url, description, roi, min_investment, target_amount, raised_amount, rental_yield, duration_months, bedrooms, sqft, year_built, status)
VALUES
  (
    'Marble Arch Residences',
    'London, United Kingdom', 'GB',
    'Luxury Apartments',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    'A prestigious residential development in the heart of London, offering investors access to premium rental yields from high-demand city apartments. Located steps from Hyde Park.',
    14.2, 500, 2500000, 1925000, 8.4, 36, 42, 48000, 2022, 'active'
  ),
  (
    'Brickell Bay Tower',
    'Miami, Florida, USA', 'US',
    'Commercial & Residential',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'Premium waterfront tower in Miami''s premier financial district. Strong short-term and long-term rental demand from corporate tenants and high-net-worth individuals.',
    16.8, 200, 1800000, 1134000, 10.2, 24, 68, 72000, 2021, 'active'
  ),
  (
    'Sagrada Hills Estate',
    'Barcelona, Spain', 'ES',
    'Luxury Villas',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'Exclusive hillside villa complex overlooking Barcelona, combining Catalan architectural heritage with contemporary luxury.',
    12.5, 300, 3200000, 896000, 7.1, 48, 24, 38000, 2023, 'active'
  ),
  (
    'The Grand Ritz Suites',
    'Dubai, UAE', 'AE',
    'Hotel Residences',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    'Flagship hotel residence development in Dubai''s golden triangle, managed by an internationally recognized hospitality group. Tax-free returns.',
    18.4, 1000, 5000000, 4100000, 12.8, 60, 120, 180000, 2022, 'active'
  ),
  (
    'Copacabana Beachfront',
    'Rio de Janeiro, Brazil', 'BR',
    'Residential Apartments',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'Prime beachfront apartments steps from one of the world''s most famous beaches. Strong short-term rental market driven by year-round tourism.',
    13.7, 150, 1200000, 516000, 9.0, 30, 36, 28000, 2020, 'active'
  ),
  (
    'Shogun Business Plaza',
    'Tokyo, Japan', 'JP',
    'Commercial Office',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'Grade-A commercial office space in Tokyo''s business district, fully leased to multinational corporations on long-term contracts.',
    11.2, 500, 4500000, 4320000, 6.8, 72, 0, 95000, 2019, 'closing'
  );

-- Seed documents for first property
INSERT INTO public.documents (property_id, name, is_public)
SELECT id, doc_name, TRUE
FROM public.properties,
UNNEST(ARRAY[
  'Property Valuation Report',
  'Legal Title Documents',
  'Building Inspection Report',
  'Financial Projections'
]) AS doc_name
WHERE name = 'Marble Arch Residences';
