# Founder AI Agent Operating System

Production-grade SaaS web application for building, debugging, and scaling AI agents with execution discipline.

## Product Philosophy
This platform is built to:
1. Train founder CEO-level decision systems.
2. Force execution with structured operating loops.
3. Design AI agents correctly using Perception/Brain/Tools/Memory.
4. Integrate automation into business workflows only when justified.
5. Track leverage creation over time.
6. Convert internal systems into monetizable SaaS offerings.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma ORM
- JWT Authentication (HttpOnly cookie)
- Recharts

## Implemented Modules
1. Agent Log System (system of record)
2. AI Agent Builder (4 core components + agent types + input/output contracts)
3. Automation Worthiness Framework (0-100 scoring + recommendation engine)
4. Failure Mode Analysis Panel (5 required scenarios + guardrail capture)
5. CEO Learning System (tracks + lessons + progress)
6. Finance & Strategy Intelligence (financial metrics, scenario inputs, TAM/SAM/SOM, competitive matrix, SWOT)
7. Leverage Dashboard (formula-backed score + historical charts)
8. AI Integration Roadmap Engine (7-step flow + top 5 ROI opportunities)
9. Agent Debugging Console (structured diagnosis and fixes)
10. SaaS Commercialization Lab (ICP, value prop, pricing, feature gating, tiers, GTM)

## Pre-built Agents (Seeded)
All pre-built agents strictly define Perception, Brain, Tools, and Memory.
- Email Triage Agent
- Market Intelligence Agent
- Lead Research Agent
- Finance Report Agent

## Database Models
- User
- Agent
- AgentLog
- AgentWorkflow
- AgentFailureMode
- AutomationScore
- LearningTrack
- Lesson
- LessonProgress
- FinancialMetric
- StrategyEntry
- LeverageScore
- Goal
- KPI
- SaaSPlan

## Folder Structure
```text
founder-ai-agent-os/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── agent-log/page.tsx
│   │   ├── agent-builder/page.tsx
│   │   ├── automation-worthiness/page.tsx
│   │   ├── failure-analysis/page.tsx
│   │   ├── ceo-learning/page.tsx
│   │   ├── finance-strategy/page.tsx
│   │   ├── leverage/page.tsx
│   │   ├── integration-roadmap/page.tsx
│   │   ├── debug-console/page.tsx
│   │   ├── saas-lab/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/{login,logout,me}/route.ts
│   │   ├── dashboard/summary/route.ts
│   │   ├── agents/route.ts
│   │   ├── agent-logs/route.ts
│   │   ├── automation-scores/route.ts
│   │   ├── failure-modes/route.ts
│   │   ├── learning/progress/route.ts
│   │   ├── financial-metrics/route.ts
│   │   ├── strategy-entries/route.ts
│   │   ├── leverage-scores/route.ts
│   │   ├── integration-roadmap/route.ts
│   │   ├── debug-console/route.ts
│   │   ├── saas-plans/route.ts
│   │   ├── goals/route.ts
│   │   └── kpis/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── charts/
│   ├── forms/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── db/prisma.ts
│   ├── agent-debugging.ts
│   ├── calculations.ts
│   ├── dashboard.ts
│   ├── http.ts
│   ├── utils.ts
│   └── validations/schemas.ts
├── prisma/
│   ├── migrations/
│   │   └── 20260224212500_init/migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── .env.example
├── DEPLOYMENT.md
└── package.json
```

## Local Setup
1. Copy environment file:
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Generate Prisma client:
```bash
npm run prisma:generate
```
4. Create and apply migration:
```bash
npm run prisma:migrate -- --name init
```
5. Seed data:
```bash
npm run seed
```
6. Start dev server:
```bash
npm run dev
```

## Seed Credentials
- Email: `founder@faos.local`
- Password: `Founder@123`

## Input → Output Contract Principle
Each agent requires:
- explicit input schema
- explicit output schema and example
- numbered workflow steps
- guardrails
- fallback behavior

## Production Notes
- Middleware protects all command center modules.
- JWT is stored in secure HttpOnly cookie in production.
- All major modules are DB-backed (not static).
- Prisma models are SaaS-ready with user-level scoping and audit timestamps.
