# Deployment Guide — RealtyInvestors

## Overview

| Service | Provider | Purpose |
|---|---|---|
| Frontend | Vercel | React app hosting |
| Backend / Auth / DB | Supabase | Database, auth, storage, Edge Functions |
| Email | Resend | Transactional emails |

---

## 1. Supabase Setup

### Create project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region closest to your primary user base
3. Save your database password securely

### Run migrations

In the Supabase dashboard → **SQL Editor**, run each migration file in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_rls.sql
supabase/migrations/003_functions.sql
```

Then optionally run the seed file for sample data:

```
supabase/seed/seed.sql
```

### Get credentials

From your Supabase project dashboard → **Settings → API**:

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (Edge Functions only, never expose)

### Configure Auth

In **Authentication → Settings**:

- Set **Site URL** to your production domain: `https://realtyinvestors.com`
- Add redirect URLs: `https://realtyinvestors.com`, `http://localhost:5173`
- Enable **Email confirmations**

### Storage bucket

In **Storage → New bucket**:

- Name: `property-documents`
- Public: No (private bucket, access via signed URLs)

---

## 2. Deploy Edge Functions

Install Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
```

Set secrets for Edge Functions:

```bash
supabase secrets set RESEND_API_KEY=your-resend-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Deploy:

```bash
supabase functions deploy send-notification
```

---

## 3. Frontend — Vercel Deployment

### Connect repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Framework Preset: **Vite**

### Environment variables

In Vercel → Project Settings → Environment Variables, add:

```
VITE_SUPABASE_URL          = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY     = your-anon-public-key
VITE_APP_NAME              = RealtyInvestors
VITE_APP_URL               = https://realtyinvestors.com
VITE_SUPABASE_STORAGE_BUCKET = property-documents
```

### Build settings

Vercel auto-detects Vite. Verify:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Custom domain

In Vercel → Domains → Add `realtyinvestors.com` and follow DNS instructions.

---

## 4. Local Development

```bash
# Clone
git clone https://github.com/your-org/realtyinvestors.git
cd realtyinvestors

# Set up env
cp .env.example frontend/.env
# Edit frontend/.env with your Supabase credentials

# Install and run
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

> The app works in demo mode without Supabase credentials — auth actions fall back to an in-memory demo user so you can develop and preview the full UI locally.

---

## 5. Admin Access

There is no separate admin app in this version. Admin operations are performed via:

1. **Supabase Dashboard** → Table Editor (view/edit any table)
2. **SQL Editor** (run queries, call functions like `distribute_earnings`)
3. **Authentication** (manage users, KYC status updates via `profiles` table)

To update a user's KYC status from the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET kyc_status = 'verified', investor_level = 'active'
WHERE id = 'user-uuid-here';
```

To trigger earnings distribution for a property:

```sql
SELECT public.distribute_earnings(
  'property-uuid-here',
  '2026-03-01'::DATE,
  45000,   -- total rental income for this month
  12000    -- total appreciation for this month
);
```

---

## 6. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never in frontend code or `.env` committed to git
- [ ] RLS is enabled on all tables (migrations/002_rls.sql applied)
- [ ] Storage bucket is private
- [ ] Auth email confirmations are enabled
- [ ] Custom domain has SSL (Vercel provides this automatically)
- [ ] `.env` is in `.gitignore`
- [ ] Supabase project has MFA enabled for admin accounts

---

## 7. Resend Email Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your sending domain (`realtyinvestors.com`)
3. Create an API key
4. Set as Supabase Edge Function secret: `supabase secrets set RESEND_API_KEY=re_...`
