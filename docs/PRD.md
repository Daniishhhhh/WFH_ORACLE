# Should I WFH Today? — Product Requirements

## Problem
Bengaluru commuters make a daily work-location decision using fragmented weather, air-quality, and commute intuition. Existing weather apps say what the sky is doing; they do not answer the question people actually ask at 8:30 AM: “Is going to the office worth it today?”

**Should I WFH Today?** turns today’s local conditions into one instantly understandable, shareable recommendation. It should feel like a useful weather utility with the comedic confidence of a Bengaluru group chat.

## Target user
- Bengaluru knowledge workers who commute to a tech or office campus.
- People deciding whether to request or claim a WFH day.
- Social-first users who enjoy screenshot-worthy, locally specific internet products.
- Primary device: mobile phone at approximately 380px wide.

## User stories
1. As a Bengaluru commuter, I can land on the page and immediately see a YES, MAYBE, or NO recommendation for Koramangala.
2. As a user in another neighborhood, I can switch among ten Bengaluru areas with one tap.
3. As a user, I can understand the recommendation through a 0–100 score, a roast, and a compact factor breakdown.
4. As a user, I can choose a corporate, dramatic, or desi tone and generate a harmless manager excuse.
5. As a user, I can copy the excuse without reformatting it.
6. As a user, I can share a result card through the native share sheet or a copied link.
7. As a returning user, I can see how many WFH days I have claimed on this device.
8. As a user on a failed upstream API or without an LLM key, I still receive a useful result.
9. As a keyboard or screen-reader user, I can operate the picker, buttons, and status controls.

## Features
### Core oracle
- Default area: Koramangala.
- Area picker with ten predefined neighborhoods and hand-tuned commute “hell factors.”
- Server-side Open-Meteo forecast and air-quality fetches, cached for ten minutes.
- Current-day commute windows: 08:00–10:00 and 17:00–20:00 IST.
- 0–100 “Reasons to WFH” score and YES/MAYBE/NO thresholds.
- Roasts that incorporate actual rain and AQI values.
- Factor breakdown for rain, commute, heat, air quality, and wind/storm.
- Graceful partial-data state when one or both upstream requests fail.

### Excuse engine
- Three tones: corporate, dramatic, desi.
- Optional server-side LLM generation through an OpenAI- or Anthropic-compatible abstraction.
- Strictly allowlisted API inputs and no raw user text in prompts.
- Eight-second timeout and simple in-memory IP rate limit.
- Thirty-plus handwritten fallback excuses, ten per tone, used for missing keys, errors, or rate limits.
- Exactly one or two harmless sentences, with conditions referenced and no serious-event deception.

### Share card
- Dynamic 1200×630 image from `/api/card` using `next/og`.
- Safe validation for verdict, score, area, and tone query parameters.
- Native Web Share API where available; copy-link fallback elsewhere.
- Open Graph metadata for a good link preview.

### Convenience and polish
- Local-storage WFH claimed counter; increment only from the explicit claim action.
- System light/dark mode with high contrast.
- Mobile-first responsive design, focus states, labels, reduced-motion respect, title, description, and favicon.

## Non-goals
- No accounts, login, database, personal profiles, or cross-device history.
- No exact commute-time or traffic API integration in v0.
- No guarantee that WFH is permitted by an employer.
- No medical, emergency, bereavement, or serious-event excuses.
- No user-generated free text sent to an LLM.
- No promise that weather data predicts every street-level event.
- No automatic posting to social networks.
- No admin dashboard or analytics backend.

## Success metrics
- A first-time user can understand the verdict and next action within five seconds.
- The landing page renders a meaningful result even when upstream APIs are unavailable.
- All ten areas produce a valid verdict and card.
- Excuse generation returns a usable sentence with and without an LLM key.
- Mobile Lighthouse performance target: 90+ where feasible.
- No client bundle or git history contains the LLM secret.
- Portfolio reviewers describe the experience as funny, locally specific, and polished.

## Risks and mitigations
| Risk | Mitigation |
| --- | --- |
| Open-Meteo outage or malformed response | Isolate fetchers, validate parsed fields, use safe defaults, expose a partial-data note. |
| LLM outage, timeout, or rate limiting | Eight-second abort, handwritten fallback bank, in-memory IP limit, never fail the primary flow. |
| Misleading recommendation | Label score as a playful heuristic; show the factor breakdown and source-data note. |
| Input abuse or prompt injection | Allowlists for area/tone/verdict and structured numeric factors; never accept raw free text. |
| Coordinates not perfectly aligned to neighborhood boundaries | Use central representative points and document uncertain approximations. |
| Dark-mode contrast or tiny-screen overflow | Mobile-first CSS, semantic markup, responsive cards, explicit focus/contrast checks. |
| Native sharing unavailable | Copy the canonical card URL as a fallback. |
| In-memory limits reset on serverless instances | Treat rate limiting as best-effort abuse protection, not durable quota enforcement. |
