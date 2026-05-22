# Porra Mundial 2026

WIP

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS
- Deploy: Vercel

## Setup

```bash
cp .env.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

## Database

Run migrations and seeds in the Supabase Dashboard SQL editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed/teams.sql`
3. `supabase/seed/matches.sql`
