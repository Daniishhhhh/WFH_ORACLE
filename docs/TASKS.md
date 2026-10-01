# Build Tasks

## Step 1 — Core oracle
- [x] Scaffold Next.js App Router + TypeScript + Tailwind.
  - Acceptance: `npm run build` completes and the app starts with the documented command.
- [x] Initialize git, add `.gitignore`, and add placeholder-only `.env.example` before the first commit.
  - Acceptance: `.env*` is ignored except `.env.example`; no secret values are tracked.
- [x] Add `lib/areas.ts` with ten areas, coordinates, hell factors, and Koramangala default.
  - Acceptance: every picker option has a stable allowlisted value.
- [x] Add cached Open-Meteo weather and air-quality fetchers with safe fallbacks.
  - Acceptance: blocked/failed upstream requests still return renderable normalized data and a partial-data signal.
- [x] Add pure `lib/score.ts` formula and Vitest coverage.
  - Acceptance: tests cover heavy rain, clear day, bad AQI, Friday vs Wednesday, missing data, and clamp behavior.
- [x] Build the first-screen area picker, verdict card, score, roast, and factor breakdown.
  - Acceptance: all ten areas produce a real or fallback verdict and the page renders on a 380px viewport.

## Step 2 — Excuse engine and share card
- [x] Add provider abstraction, fallback bank, validation, and best-effort IP rate limiting.
  - Acceptance: at least 30 handwritten excuses exist; missing key, provider error, timeout, and rate limit return fallbacks.
- [x] Add tone selector, Generate, Copy, loading, and error states.
  - Acceptance: client never receives or bundles `LLM_API_KEY` and copy works when supported.
- [x] Add `/api/card` 1200×630 image route and Open Graph metadata.
  - Acceptance: all verdicts render; malformed params safely default rather than crash.
- [x] Add Web Share API with copy-link fallback.
  - Acceptance: share action works on both share-capable and clipboard-only browsers.

## Step 3 — Polish, safety, deploy
- [x] Add reveal animation, system dark mode, localStorage claim counter, and accessibility basics.
  - Acceptance: keyboard focus, labels, contrast, reduced motion, and explicit claim action are present.
- [x] Add favicon, title, meta description, and responsive visual polish.
  - Acceptance: first screen is screenshot-worthy and readable at 380px.
- [x] Add README with screenshot placeholder, setup, environment table, and how-it-works.
  - Acceptance: a new developer can run the app without guessing.
- [x] Add `docs/DEPLOY.md` with Vercel import, env setup, and production smoke checks.
  - Acceptance: checklist covers `/api/card`, `/api/excuse`, API fallback behavior, and secret checks.
- [x] Run final build/tests and inspect git history for real secrets.
  - Acceptance: build/tests pass and `git log -p | grep -i key` finds no real credential.
