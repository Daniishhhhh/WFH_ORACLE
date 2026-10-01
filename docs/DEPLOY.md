# Vercel Deployment Checklist

## Import

- [ ] Push this repository to the portfolio Git host.
- [ ] In Vercel, choose **Add New → Project → Import** and select the repository.
- [ ] Keep the detected framework as Next.js. The build command should be `npm run build`; output is managed by Next.js.
- [ ] Use the repository root as the project root.

## Environment variables

In **Project Settings → Environment Variables**, add the following for Production (and Preview if desired):

- [ ] `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>`
- [ ] `LLM_PROVIDER=openai` or `anthropic` (optional; omit for handwritten fallbacks)
- [ ] `LLM_API_KEY=<provider secret>` (optional; server-only)
- [ ] `LLM_MODEL=<provider model>` (optional; defaults are documented in `lib/llm.ts`)

Never paste a real key into source, `README.md`, `.env.example`, client code, or an issue. `.env*` is ignored except `.env.example`.

## Deploy and smoke test

- [ ] Deploy from the Vercel dashboard.
- [ ] Open the public homepage on a narrow phone viewport and switch through all ten areas.
- [ ] Confirm the verdict still renders if Open-Meteo is temporarily unavailable (the partial-data note should appear).
- [ ] Verify the default card:
  - [ ] `https://<your-domain>/api/card?verdict=YES&score=78&area=Koramangala&tone=corporate` returns a 1200×630 image.
  - [ ] A malformed request such as `/api/card?verdict=wat&score=banana&area=nope` returns a safe default card, not a 500.
- [ ] Click **Generate my excuse** with no LLM key and confirm a fallback excuse is returned.
- [ ] If an LLM key is configured, confirm the response is still one or two harmless sentences and never exposes the key in browser devtools.
- [ ] Send more than ten excuse requests from one IP and confirm the route returns a fallback with `reason: rate_limited` rather than an error.
- [ ] Test **Share result** on a mobile browser with Web Share and on a desktop browser with clipboard fallback.
- [ ] Check the Open Graph preview using the deployed URL and confirm the card image loads.

## Post-deploy safety checks

- [ ] Run `npm test`, `npm run lint`, and `npm run build` locally before merging.
- [ ] Run `npm audit --omit=dev`; resolve any production dependency advisories before deploying.
- [ ] Run `git log -p | grep -i key` and inspect that any matches are variable names/documentation only, never credential values.

> The repository currently uses Next.js `16.3.8` and the production-only audit is clean. Re-run the audit after dependency updates; do not use `npm audit fix --force` blindly because it may introduce a major framework upgrade.
- [ ] Confirm `LLM_API_KEY` appears only in server-side `lib/llm.ts`/Vercel configuration, never in `components/` or `NEXT_PUBLIC_*` variables.
- [ ] Keep an eye on Vercel function logs for provider timeouts and Open-Meteo failures; fallback behavior is expected, not an incident.
- [ ] If the card endpoint is deployed on a platform where Edge is deprecated, remove `runtime = 'edge'` from `app/api/card/route.tsx` and use the default Node.js runtime.
