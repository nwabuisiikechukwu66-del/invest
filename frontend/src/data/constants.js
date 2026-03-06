// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA & CONSTANTS
// In production these come from Supabase. This file serves as:
//   1. Local development fallback (when Supabase is not yet configured)
//   2. Reference for the database seed data shape
// ─────────────────────────────────────────────────────────────────────────────

export const PROPERTIES = [
  {
    id: 1,
    name: 'Marble Arch Residences',
    location: 'London, United Kingdom',
    type: 'Luxury Apartments',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    roi: 14.2,
    minInvestment: 500,
    target: 2500000,
    raised: 1925000,
    duration: '36 months',
    rentalYield: 8.4,
    status: 'active',
    description:
      'A prestigious residential development in the heart of London, offering investors access to premium rental yields from high-demand city apartments. Located steps from Hyde Park, this property commands top-tier rental rates year-round.',
    bedrooms: 42,
    sqft: 48000,
    yearBuilt: 2022,
    documents: [
      'Property Valuation Report',
      'Legal Title Documents',
      'Building Inspection Report',
      'Financial Projections',
    ],
  },
  {
    id: 2,
    name: 'Brickell Bay Tower',
    location: 'Miami, Florida, USA',
    type: 'Commercial & Residential',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    roi: 16.8,
    minInvestment: 200,
    target: 1800000,
    raised: 1134000,
    duration: '24 months',
    rentalYield: 10.2,
    status: 'active',
    description:
      "Premium waterfront tower in Miami's premier financial district. Strong short-term and long-term rental demand from corporate tenants and high-net-worth individuals.",
    bedrooms: 68,
    sqft: 72000,
    yearBuilt: 2021,
    documents: [
      'Property Valuation Report',
      'Legal Title Documents',
      'Environmental Assessment',
      'Rental Income History',
    ],
  },
  {
    id: 3,
    name: 'Sagrada Hills Estate',
    location: 'Barcelona, Spain',
    type: 'Luxury Villas',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    roi: 12.5,
    minInvestment: 300,
    target: 3200000,
    raised: 896000,
    duration: '48 months',
    rentalYield: 7.1,
    status: 'active',
    description:
      'Exclusive hillside villa complex overlooking Barcelona, combining Catalan architectural heritage with contemporary luxury. Exceptional demand from premium tourism and long-term expat tenants.',
    bedrooms: 24,
    sqft: 38000,
    yearBuilt: 2023,
    documents: [
      'Property Valuation Report',
      'Legal Title Documents',
      'Tourism License',
      'Architect Certificates',
    ],
  },
  {
    id: 4,
    name: 'The Grand Ritz Suites',
    location: 'Dubai, UAE',
    type: 'Hotel Residences',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    roi: 18.4,
    minInvestment: 1000,
    target: 5000000,
    raised: 4100000,
    duration: '60 months',
    rentalYield: 12.8,
    status: 'active',
    description:
      "Flagship hotel residence development in Dubai's golden triangle, managed by an internationally recognized hospitality group. Tax-free returns and robust tourism demand.",
    bedrooms: 120,
    sqft: 180000,
    yearBuilt: 2022,
    documents: [
      'Property Valuation Report',
      'Hotel Management Agreement',
      'RERA Registration',
      'Feasibility Study',
    ],
  },
  {
    id: 5,
    name: 'Copacabana Beachfront',
    location: 'Rio de Janeiro, Brazil',
    type: 'Residential Apartments',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    roi: 13.7,
    minInvestment: 150,
    target: 1200000,
    raised: 516000,
    duration: '30 months',
    rentalYield: 9.0,
    status: 'active',
    description:
      "Prime beachfront apartments steps from one of the world's most famous beaches. Strong short-term rental market driven by year-round tourism and international events.",
    bedrooms: 36,
    sqft: 28000,
    yearBuilt: 2020,
    documents: [
      'Property Valuation Report',
      'Legal Title Documents',
      'Short-Term Rental Permits',
      'Financial Projections',
    ],
  },
  {
    id: 6,
    name: 'Shogun Business Plaza',
    location: 'Tokyo, Japan',
    type: 'Commercial Office',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    roi: 11.2,
    minInvestment: 500,
    target: 4500000,
    raised: 4320000,
    duration: '72 months',
    rentalYield: 6.8,
    status: 'closing',
    description:
      "Grade-A commercial office space in Tokyo's business district, fully leased to multinational corporations on long-term contracts. Exceptional stability and yen-denominated income.",
    bedrooms: 0,
    sqft: 95000,
    yearBuilt: 2019,
    documents: [
      'Property Valuation Report',
      'Lease Agreements',
      'Building Inspection',
      'Environmental Clearance',
    ],
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Retired Teacher, Canada',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    text: 'I never thought real estate investing was accessible to someone like me. With RealtyInvestors I started with $300 across two properties and now earn a reliable monthly income. The transparency is unlike anything I have seen in the investment world.',
    return: '13.4% ROI',
    invested: '$4,200',
  },
  {
    id: 2,
    name: 'Emmanuel Okafor',
    role: 'Software Engineer, Nigeria',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    text: 'Accessing global real estate markets from Lagos used to be impossible for ordinary investors. RealtyInvestors changed that. I am now invested in properties in London and Dubai, and the returns have been consistent and exactly as projected.',
    return: '15.1% ROI',
    invested: '$8,500',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Financial Analyst, Singapore',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    text: 'The due diligence on each property is thorough. As someone who works in finance, I looked hard for weaknesses and found only strengths. The documentation, the legal structure, the reporting — it is institutional grade.',
    return: '12.8% ROI',
    invested: '$22,000',
  },
  {
    id: 4,
    name: 'Marco Bellini',
    role: 'Restaurant Owner, Italy',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
    text: 'I have been investing in Italian property for twenty years. The friction, the fees, the management. RealtyInvestors removes all of that. I diversified internationally for the first time and my portfolio income increased significantly.',
    return: '14.7% ROI',
    invested: '$15,000',
  },
  {
    id: 5,
    name: 'Aisha Al-Rashid',
    role: 'Doctor, UAE',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=120&q=80',
    text: 'Between work and family I have no time to manage properties. RealtyInvestors handles everything. I simply receive my returns each month. It is genuinely passive income.',
    return: '16.2% ROI',
    invested: '$35,000',
  },
];

export const FAQS = [
  {
    q: 'What is fractional real estate investing?',
    a: 'Fractional real estate investing allows multiple investors to collectively own shares of a property. Instead of purchasing an entire building, you buy a fraction of it, proportionate to your investment. You earn rental income and appreciation gains in line with your ownership percentage.',
  },
  {
    q: 'What is the minimum investment?',
    a: 'The minimum investment varies per property, starting from as low as $100. Each property listing clearly displays the minimum investment required before you commit any funds.',
  },
  {
    q: 'How do I earn returns?',
    a: 'You earn in two ways. First, rental income — distributed monthly or quarterly from tenants occupying the property. Second, appreciation — when the property is eventually sold or revalued, investors receive their proportionate share of capital gains.',
  },
  {
    q: 'How do I withdraw my profits?',
    a: "Profits are distributed directly to your linked bank account or wallet on a scheduled basis. You can request a withdrawal at any time for accumulated earnings. Principal investments follow the property's specified investment duration.",
  },
  {
    q: 'Is my investment guaranteed?',
    a: 'No investment is guaranteed. Real estate markets can decline, and returns are projections based on thorough analysis, not promises. We provide full documentation and risk disclosures for each property so you can make informed decisions.',
  },
  {
    q: 'Which countries can invest?',
    a: 'We accept investors from over 80 countries worldwide. Some jurisdictions have specific regulatory requirements. During sign-up, KYC verification will confirm your eligibility based on your country of residence.',
  },
  {
    q: 'How are properties selected and verified?',
    a: 'Our acquisitions team conducts extensive due diligence on every property including legal title verification, independent valuation, building inspection, market analysis, and financial modeling. Only properties meeting our strict standards are listed.',
  },
  {
    q: 'What fees does RealtyInvestors charge?',
    a: 'We charge a 2% annual management fee on invested capital and a 10% performance fee on profits above projections. All fees are disclosed transparently before you invest. There are no hidden charges.',
  },
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: 'Why Global Real Estate Outperforms Domestic Stocks Over 20 Years',
    excerpt:
      'Historical data shows that diversified international real estate portfolios have consistently delivered superior risk-adjusted returns compared to equity markets.',
    category: 'Market Insights',
    date: 'February 28, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1611348586840-ea9872d33411?w=600&q=80',
  },
  {
    id: 2,
    title: 'The Fractional Investment Revolution: How Small Investors Are Winning Big',
    excerpt:
      'Access to institutional-grade real estate was once reserved for the wealthy. That paradigm has fundamentally changed. Here is what it means for your portfolio.',
    category: 'Investment Strategy',
    date: 'February 15, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80',
  },
  {
    id: 3,
    title: 'Dubai Real Estate in 2026: Opportunity or Overheated Market?',
    excerpt:
      'An honest analysis of the Dubai property market, examining rental yields, foreign investment trends, and where we see genuine value for long-term investors.',
    category: 'Market Insights',
    date: 'January 30, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    id: 4,
    title: 'Understanding Rental Yield vs. Capital Appreciation: Which Should You Prioritize?',
    excerpt:
      'The two primary ways real estate generates returns serve very different investor goals. Understanding the distinction is essential to building the right portfolio.',
    category: 'Education',
    date: 'January 18, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    id: 5,
    title: 'How KYC and AML Compliance Protects Investors on Our Platform',
    excerpt:
      'Regulatory compliance is not a bureaucratic burden — it is a critical layer of investor protection. We explain what happens behind the scenes when you verify your identity.',
    category: 'Platform',
    date: 'January 5, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  },
  {
    id: 6,
    title: 'Portfolio Diversification Across Borders: A Practical Guide',
    excerpt:
      'Currency diversification, geographic risk distribution, and property type allocation — building a truly resilient real estate portfolio requires thinking beyond your home country.',
    category: 'Investment Strategy',
    date: 'December 20, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80',
  },
];

export const PARTNERS = [
  'Savills', 'JLL', 'CBRE', 'Knight Frank', 'Colliers',
  'Cushman & Wakefield', 'Brookfield', 'Hines', 'Greystar', 'Nuveen',
];

export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=85',
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Nigeria', 'Germany', 'France',
  'Canada', 'Australia', 'UAE', 'Singapore', 'Japan', 'Brazil',
  'South Africa', 'India', 'Ghana', 'Kenya', 'Netherlands', 'Other',
];

export const TEAM = [
  {
    name: 'James Calloway',
    role: 'CEO & Co-Founder',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
  {
    name: 'Amara Diallo',
    role: 'Chief Investment Officer',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  },
  {
    name: 'Thomas Richter',
    role: 'Chief Technology Officer',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
  {
    name: 'Yuki Tanaka',
    role: 'Head of Legal & Compliance',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
];

export const MOCK_TRANSACTIONS = [
  { date: 'Mar 1, 2026', type: 'Income', desc: 'Rental Income — Marble Arch', amount: '+$312', badge: 'in' },
  { date: 'Feb 15, 2026', type: 'Investment', desc: 'Invested — Brickell Bay Tower', amount: '-$2,000', badge: 'out' },
  { date: 'Feb 1, 2026', type: 'Income', desc: 'Rental Income — Multiple Properties', amount: '+$294', badge: 'in' },
  { date: 'Jan 20, 2026', type: 'Deposit', desc: 'Bank Transfer Deposit', amount: '+$5,000', badge: 'in' },
  { date: 'Jan 15, 2026', type: 'Investment', desc: 'Invested — Grand Ritz Suites', amount: '-$3,000', badge: 'out' },
];

export const MOCK_EARNINGS = [
  { month: 'March 2026', property: 'Marble Arch Residences', rental: '$190', appreciation: '$122', total: '$312' },
  { month: 'February 2026', property: 'Brickell Bay Tower', rental: '$210', appreciation: '$84', total: '$294' },
  { month: 'January 2026', property: 'Multiple Properties', rental: '$185', appreciation: '$108', total: '$293' },
  { month: 'December 2025', property: 'Multiple Properties', rental: '$172', appreciation: '$96', total: '$268' },
];
