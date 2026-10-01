# Should I WFH Today? — Bengaluru Edition

A tiny, weather-powered Bengaluru oracle for the daily question: **should I work from home today?** It checks commute-window weather and air quality, converts the chaos into a playful YES / MAYBE / NO score, and writes a harmless manager excuse.

> **Screenshot placeholder:** add the finished mobile screenshot here before the portfolio submission.
>
> `![Should I WFH Today screenshot](docs/screenshot-placeholder.png)`

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works without an LLM key: the excuse engine uses its handwritten fallback bank.

Useful commands:

```bash
npm test          # Vitest scoring, fallback, and local-counter tests
npm run lint      # Next.js ESLint checks
npm run build     # production build check
npm start         # serve the production build
```

## Environment variables

All variables are optional for the core oracle. Put local values in `.env.local`; never commit them.

| Variable | Required | Description |
| --- | --- | --- |
| `LLM_PROVIDER` | No | `openai` or `anthropic`; leave blank for fallback-only mode. |
| `LLM_API_KEY` | No | Server-only provider key. It is read only by `/api/excuse`. |
| `LLM_MODEL` | No | Provider model name; sensible provider default when blank. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical public URL for share cards and Open Graph metadata, e.g. `https://wfh.example.com`. |

## How it works

1. The page defaults to Koramangala and lets you switch among ten Bengaluru neighborhoods.
2. Server-side fetchers call Open-Meteo forecast and air-quality endpoints with a ten-minute Next.js cache. The relevant windows are 08:00–10:00 and 17:00–20:00 IST.
3. `lib/score.ts` adds rain (up to 40), commute hell, heat, AQI, and wind/storm points, then clamps the result to 0–100.
4. Scores of 65+ are **YES**, 35–64 are **MAYBE**, and lower scores are **NO**. Every verdict has local roast copy that uses the actual rain and AQI values.
5. `/api/excuse` validates structured allowlists, applies a best-effort ten-per-minute IP limit, and optionally calls an LLM from server code. Provider failures, missing keys, timeouts, and rate limits use the 30+ excuse fallback bank.
6. `/api/card` returns a validated 1200×630 `ImageResponse` for sharing. The browser uses the Web Share API when available and copies the card URL otherwise.
7. The claimed-day counter is intentionally local-only and increments only after the explicit “I’m working from home” action.

## Project shape

- `app/` — App Router page, metadata, API routes, and global styles.
- `components/oracle.tsx` — client-side area/tone/share interactions.
- `lib/areas.ts`, `lib/weather.ts`, `lib/score.ts` — data and scoring core.
- `lib/llm.ts`, `lib/excuses.ts`, `lib/rate-limit.ts` — safe excuse engine.
- `lib/claims.ts` — guarded local-only WFH claim counter.
- `__tests__/` — scoring, fallback, claim-counter, and API validation tests.
- `docs/` — product requirements, architecture, assumptions, tasks, and deployment checklist.

## Deployment

The intended target is Vercel. Follow [`docs/DEPLOY.md`](docs/DEPLOY.md), set the optional environment variables in the Vercel dashboard, and verify both API routes on the deployed domain.
