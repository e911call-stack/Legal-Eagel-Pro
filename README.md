# Legal Eagle — Legal Accountability Platform

> AI-powered case transparency between lawyers and clients. Real-time tracking, negligence detection, and secure communication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_REPO/legal-eagle)

---

## ✨ Features

### Client-Facing
- 🔐 Secure login (email/password or magic link)
- 📋 Case dashboard with status & risk indicators
- 📄 Read-only document hub (only lawyer-shared files)
- 💬 Secure messaging with lawyers
- 💰 Billing visibility (hours billed vs budget cap)
- 🩺 "Check Case Health" — AI-powered transparency report

### Lawyer / Firm Features
- 🗂️ Full case management (create, update, track)
- 📅 Tasks, deadlines, and case timelines
- 🤖 **AI Negligence Detection Engine** — daily automated monitoring
- 📁 Document management with client visibility control
- 💬 Internal notes + client messaging
- ⏱️ Time entries & billing tracking (hourly & flat fee)
- 🌐 Bilingual UI (English, Arabic, Spanish)

### AI Engine (Negligence Detection)
Monitors all active cases for:
| Trigger | Risk Level |
|---|---|
| No activity in 14+ days | Medium |
| Unanswered client message 72+ hrs | Medium |
| Internal review deadline missed | High |

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/YOUR_REPO/legal-eagle
cd legal-eagle
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in your Supabase and Anthropic keys
```

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **Anon Key** into `.env.local`

### 4. Run locally
```bash
npm run dev
# Visit http://localhost:3000
```

---

## 📦 Deploying to Vercel

### Option A — Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
5. Deploy ✅

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🏗️ Architecture

```
legal-eagle/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── onboarding/    # AI-driven firm onboarding wizard
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Sidebar + header shell
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── cases/         # Case list + individual case detail
│   │   │   ├── documents/     # Document hub
│   │   │   ├── messages/      # Messaging center
│   │   │   ├── billing/       # Time entries + budget tracking
│   │   │   ├── alerts/        # AI Negligence Engine dashboard
│   │   │   └── settings/      # Profile, security, preferences
│   │   └── api/
│   │       └── ai/analyze/    # Negligence Detection Engine API route
│   ├── lib/
│   │   ├── supabase.ts        # Supabase browser client
│   │   ├── utils.ts           # Helpers, formatters, translations
│   │   └── mock-data.ts       # Demo data
│   └── types/
│       └── index.ts           # TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full DB schema + RLS + AI functions
```

---

## 🧠 AI Negligence Detection Engine

The engine runs via two mechanisms:

**1. On-demand** (via "Run AI Health Check" button):
```
POST /api/ai/analyze
Body: { caseData: { title, status, days_inactive, ... } }
```

**2. Scheduled** (via Supabase pg_cron or external cron):
```sql
-- In Supabase SQL Editor, run daily:
SELECT run_negligence_engine('your-firm-id');
```

---

## 🗃️ Database Schema

Key tables: `users`, `firms`, `cases`, `tasks`, `deadlines`, `case_events`, `ai_alerts`, `documents_metadata`, `messages`, `time_entries`, `flat_fee_cases`

See `supabase/migrations/001_initial_schema.sql` for the full schema with RLS policies and AI engine SQL functions.

---

## 🌐 Bilingual Support

The platform supports **English**, **Arabic (RTL)**, and **Spanish**. Language is toggled per user in Settings or the sidebar. Translations are managed in `src/lib/utils.ts` via the `t(key, lang)` function.

---

## 📋 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | ✅ | Claude AI API key for the Negligence Engine |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployment URL |

---

## 🔒 Security

- **Row Level Security (RLS)** enforced at the database level
- Clients can only see their own cases and client-visible documents
- Internal notes are never exposed to clients
- API keys are server-side only (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`)
- JWT-based auth via Supabase Auth

---

## 📄 License

MIT © 2024 Lexora Technologies
