# RealtyInvestors

A full-stack fractional real estate investing platform. Investors worldwide can browse verified properties, invest fractional amounts, and track earnings — all in one professional platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | CSS Variables + Custom Design System |
| Backend & Auth | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting (frontend) | Vercel |
| Hosting (backend) | Supabase Cloud |

---

## Project Structure

```
realtyinvestors/
├── frontend/                   # React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Nav.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   └── ...
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Investments.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ...
│   │   ├── context/            # React context providers
│   │   │   └── AppContext.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useReveal.js
│   │   │   └── useScrolledNav.js
│   │   ├── lib/                # External service clients
│   │   │   └── supabase.js
│   │   ├── data/               # Static seed data & constants
│   │   │   └── constants.js
│   │   ├── utils/              # Helper functions
│   │   │   └── format.js
│   │   ├── styles/             # Global CSS
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── supabase/                   # Backend configuration
│   ├── migrations/             # SQL schema migrations (run in order)
│   │   ├── 001_schema.sql
│   │   ├── 002_rls.sql
│   │   └── 003_functions.sql
│   ├── seed/                   # Sample data for development
│   │   └── seed.sql
│   ├── functions/              # Supabase Edge Functions (Deno)
│   │   └── send-notification/
│   │       └── index.ts
│   └── config.toml             # Supabase local dev config
│
├── docs/                       # Documentation
│   └── DEPLOYMENT.md
│
├── .env.example                # Environment variable template
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/realtyinvestors.git
cd realtyinvestors
```

### 2. Set up environment variables

```bash
cp .env.example frontend/.env
# Edit frontend/.env with your Supabase credentials
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order via the Supabase SQL editor:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_functions.sql`
3. Optionally run `supabase/seed/seed.sql` to populate sample data
4. Copy your project URL and anon key into `frontend/.env`

### 4. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Supabase Database Tables

| Table | Description |
|---|---|
| `profiles` | Extended user data (name, KYC status, country) |
| `properties` | Property listings with financials |
| `investments` | Individual investor → property investments |
| `transactions` | Deposits, withdrawals, income events |
| `earnings` | Monthly earning records per investment |
| `messages` | Support chat messages |
| `documents` | Property document metadata |

---

## Deployment

See `docs/DEPLOYMENT.md` for full Vercel + Supabase deployment instructions.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only | Never expose to browser |

---

## License

Private — All rights reserved. RealtyInvestors Ltd.
