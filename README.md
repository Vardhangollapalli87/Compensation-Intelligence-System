# Compensation Intelligence System

A Levels.fyi-inspired compensation intelligence platform for Indian tech companies. Browse, filter, sort, and compare salary data across companies and engineering levels — with crowdsourced submissions and real-time analytics.

**Track 3 — Full Stack Developer Internship Assignment**

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://compensation-intelligence-system-h2.vercel.app |
| Backend  | https://compensation-intelligence-system-production-f4ed.up.railway.app |
| Database | Neon PostgreSQL (serverless) |

---

## Features

- **Salary Table** — filter by company, role, level, and location with 300ms debounced search; sort by Total TC, Base, or Experience (asc/desc)
- **Company Profiles** — per-company median compensation, median base, level distribution chart, full salary breakdown
- **Side-by-side Comparison** — select any two entries via checkbox or URL (`?ids=a,b`), get a diff table with winner highlighting and level-gap label
- **Submit Salary** — crowdsourced modal with Zod validation, level normalization, and duplicate detection
- **Level Standardization** — `SDE-1 → L3`, `Staff Engineer → L6`, `Principal → L7`, and 25+ other aliases
- **Company Normalization** — `"Google India"`, `"GOOGLE"`, `"Alphabet"` all resolve to `"google"`

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript |
| ORM       | Prisma 5 |
| Database  | PostgreSQL via Neon (serverless) |
| Validation | Zod |
| Deploy    | Vercel (frontend) · Railway (backend) · Neon (DB) |

---

## Architecture

```
assignment_full/
├── frontend/          # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home — server component
│       │   ├── salaries/page.tsx     # Salary table — client component
│       │   ├── company/[name]/page.tsx  # Company profile — server component
│       │   └── compare/page.tsx      # Compare — client component
│       ├── components/
│       │   ├── LevelBadge.tsx
│       │   ├── Navbar.tsx
│       │   └── SubmitModal.tsx
│       ├── lib/
│       │   ├── api.ts                # Typed fetch wrapper
│       │   └── format.ts             # fmtLPA, fmtDiff helpers
│       └── types/index.ts
│
└── backend/           # Express REST API
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts                   # 46 salary entries, 10 companies
    └── src/
        ├── index.ts                  # Express app + CORS
        ├── lib/prisma.ts             # Prisma client singleton
        ├── utils/normalize.ts        # Company + level normalization
        └── routes/
            ├── salaries.ts           # GET /salaries · POST /ingest-salary
            ├── company.ts            # GET /company/:name · GET /companies
            └── compare.ts            # GET /compare?ids=a,b
```

**Component strategy:** Home and Company pages are Server Components (fetch on server, zero loading state, better SEO). Salary table and Compare are Client Components (need interactive state — filters, debounce, checkbox selection, URL params).

---

## API Reference

### `GET /salaries`
Returns paginated, filterable, sortable salary data.

| Query param | Type   | Description |
|-------------|--------|-------------|
| `company`   | string | Case-insensitive partial match |
| `role`      | string | Case-insensitive partial match |
| `level`     | string | Exact level (L3–L8) or alias |
| `location`  | string | Case-insensitive partial match |
| `sort`      | string | `total_compensation` · `base_salary` · `experience_years` · `submitted_at` |
| `order`     | string | `asc` · `desc` (default `desc`) |
| `page`      | number | Page number (default `1`) |
| `limit`     | number | Page size, max 100 (default `20`) |

```json
{
  "data": [ { "id": "...", "company": "google", "role": "...", ... } ],
  "meta": { "total": 46, "page": 1, "limit": 20, "pages": 3 }
}
```

### `POST /ingest-salary`
Submit a new salary entry. Validates with Zod, normalizes company and level, checks for duplicates.

```json
{
  "company": "google",
  "role": "Software Engineer",
  "level_standardized": "L4",
  "location": "Bangalore",
  "experience_years": 3,
  "base_salary": 45,
  "bonus": 8,
  "stock": 12,
  "confidence": 0.9
}
```

Returns `201` on success, `400` on validation failure, `409` on duplicate.

### `GET /company/:name`
Returns all salaries for a company plus aggregate stats.

```json
{
  "company": "google",
  "salaries": [ ... ],
  "stats": {
    "median_compensation": 72.5,
    "median_base": 48.0,
    "total_entries": 5,
    "level_distribution": { "L3": 2, "L4": 2, "L5": 1 }
  }
}
```

### `GET /companies`
Returns all companies with entry count and average TC.

### `GET /compare?ids=id1,id2`
Side-by-side comparison of two salary records.

```json
{
  "salary_a": { ... },
  "salary_b": { ... },
  "comparison": {
    "base_diff": 10.0,
    "bonus_diff": 2.0,
    "stock_diff": -3.0,
    "total_diff": 9.0,
    "level_difference": "GOOGLE L5 is 1 level(s) above MICROSOFT L4"
  }
}
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database ([neon.tech](https://neon.tech) — free tier)

### 1. Clone & install

```bash
git clone https://github.com/Vardhangollapalli87/Compensation-Intelligence-System.git
cd Compensation-Intelligence-System
```

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env  (copy from .env.example)
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/DB?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 3. Set up database

```bash
cd backend
npx prisma db push          # apply schema to Neon
npm run db:seed             # seed 46 salary entries
```

### 4. Run both servers

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend && npm run dev
```

---

## Deployment

### Backend → Railway

1. New Project → Deploy from GitHub → select this repo → set **Root Directory** to `backend`
2. Add environment variables:
   ```
   DATABASE_URL   = <neon pooler URL>
   DIRECT_URL     = <neon direct URL>
   PORT           = 4000
   FRONTEND_URL   = https://your-app.vercel.app
   ```
3. Railway auto-runs `npm run build` (compiles TypeScript) then `npm start`

### Frontend → Vercel

1. Import repo → set **Root Directory** to `frontend`
2. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.up.railway.app
   ```
3. Deploy

---

## Data Model

```prisma
model Salary {
  id                 String   @id @default(cuid())
  company            String
  role               String
  level              String       // L3 · L4 · L5 · L6 · L7 · L8
  location           String
  experience_years   Int
  base_salary        Float        // LPA (Lakhs Per Annum)
  bonus              Float
  stock              Float
  total_compensation Float
  confidence_score   Float        // 0–1, for future quality ranking
  submitted_at       DateTime @default(now())
}
```

All monetary values are in **LPA (Lakhs Per Annum)**.

---

## Design Decisions & Tradeoffs

**Level standardization** — A two-layer system: an alias map (`SDE-1 → L3`, `Staff Engineer → L6`, etc.) backed by a valid-level set. Any title that can't be mapped returns a 400 at ingest time — dirty data never enters the DB.

**Company normalization** — A canonical map handles known variants (`"Google India" → "google"`, `"Alphabet" → "google"`), with lowercase + trim as the fallback. Ensures company profile pages always aggregate all entries correctly.

**Neon + Prisma pooler** — Neon requires `?pgbouncer=true` on the pooler URL at runtime, but migrations must use the direct (non-pooler) URL. Prisma's `directUrl` field in `schema.prisma` handles this cleanly without code changes.

**Server vs Client Components** — Pages that only read data (Home, Company profile) are Server Components: no hydration cost, no loading state, better SEO. Pages with interactive state (filters, checkboxes, URL params) are Client Components wrapped in `<Suspense>` per Next.js 14 requirements.

**Duplicate detection** — Exact match on `company + role + level + location + base_salary` returns 409 Conflict. Not foolproof against near-duplicates, but prevents obvious re-submissions without requiring auth.

**No authentication** — Per spec requirements. Mitigated by Zod validation, level/company normalization, and the `confidence_score` field (already in schema) for future crowdsource-quality ranking.

---

## Seed Data

46 salary entries across 10 Indian tech companies: `google`, `microsoft`, `flipkart`, `swiggy`, `razorpay`, `cred`, `phonepe`, `meesho`, `zepto`, `paytm` — covering levels L3–L5 with realistic LPA ranges.

```bash
cd backend && npm run db:seed
```
