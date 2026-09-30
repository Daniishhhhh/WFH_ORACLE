# Should I WFH Today? — Architecture

## Stack
- Next.js App Router + TypeScript.
- Tailwind CSS for styling; no UI kit.
- Vitest for pure scoring tests.
- Vercel runtime for the web app and route handlers.
- Open-Meteo for weather and air quality; no API key.
- Optional OpenAI or Anthropic-compatible LLM, called only by server route code.
- Browser localStorage for the local WFH counter.

## Proposed folder structure
```text
app/
  api/
    card/route.tsx       # 1200x630 ImageResponse
    excuse/route.ts      # POST excuse generation
  globals.css
  layout.tsx
  page.tsx
components/
  oracle.tsx             # interactive client experience
  ...
lib/
  areas.ts               # area allowlist, coordinates, hell factors
  excuses.ts             # handwritten fallback bank
  llm.ts                 # provider abstraction and timeout
  roasts.ts              # verdict-aware roast copy
  score.ts               # pure scoring formula and types
  weather.ts             # Open-Meteo fetchers, parsing, fallback
  rate-limit.ts          # simple in-memory IP window
  validation.ts          # shared API allowlists/parsers
public/
  favicon.svg
docs/
  PRD.md
  ARCHITECTURE.md
  TASKS.md
  ASSUMPTIONS.md
  DEPLOY.md
__tests__/
  score.test.ts
.env.example
.gitignore
README.md
```

## Data flow
```text
Browser requests / (default Koramangala)
  -> Next server-rendered page
     -> fetchWeather(area) ---------------------> Open-Meteo forecast
     -> fetchAirQuality(area) ------------------> Open-Meteo air quality
     -> normalize + scoreToday(weather, air, area, date)
     -> page receives verdict, score, factors, data status
  -> browser changes area
     -> URL/query or server action refreshes the same server data path

Browser selects tone and clicks Generate
  -> POST /api/excuse { allowlisted area, tone, verdict, factors }
     -> validate body and structured factor ranges
     -> IP window check
     -> optional server-only LLM provider with an 8s timeout
     -> fallback bank on missing key, error, timeout, or rate limit
     -> { excuse, source }

Browser clicks Share
  -> build /api/card?verdict=&score=&area=&tone=
  -> navigator.share({ url }) OR clipboard copy
  -> /api/card validates query params
  -> ImageResponse (1200x630) is returned
```

## API contracts

### `POST /api/excuse`
Request JSON:
```json
{
  "area": "Koramangala",
  "tone": "corporate",
  "verdict": "YES",
  "factors": {
    "rainProbability": 80,
    "rainMm": 12.4,
    "aqi": 142,
    "temperature": 31.8,
    "windSpeed": 19,
    "commutePoints": 7
  }
}
```
Only the listed areas, tones (`corporate`, `dramatic`, `desi`), verdicts (`YES`, `MAYBE`, `NO`), and finite numeric ranges are accepted. The implementation may accept a subset of factors but ignores unknown fields.

Success JSON:
```json
{ "excuse": "...", "source": "llm" }
```
Fallback/rate-limited JSON remains a successful, usable response:
```json
{ "excuse": "...", "source": "fallback", "reason": "rate_limited" }
```
Malformed JSON or invalid allowlist data returns HTTP 400 with:
```json
{ "error": "Invalid request" }
```

### `GET /api/card`
Query:
```text
/api/card?verdict=YES&score=78&area=Koramangala&tone=desi
```
`verdict` is one of `YES`, `MAYBE`, `NO`; `score` is an integer from 0–100; `area` is the exact area allowlist value; `tone` is one of the three tone values. Invalid or missing values use safe defaults rather than throwing. Response is a 1200×630 `ImageResponse`.

## Environment variables
| Variable | Required | Purpose |
| --- | --- | --- |
| `LLM_PROVIDER` | No | `openai` or `anthropic`; unset means fallback-only behavior. |
| `LLM_API_KEY` | No | Server-only provider credential. Never use in client code. |
| `LLM_MODEL` | No | Provider model name; provider-specific default when unset. |
| `NEXT_PUBLIC_APP_URL` | No | Canonical public URL used in sharing/metadata; Vercel URL fallback is acceptable. |

`.env*` is ignored except `.env.example`; `.env.example` contains placeholders only.

## Scoring formula
All inputs are normalized to safe finite values before scoring. The score is the rounded, clamped sum:

```text
rainPoints = min(40, precipitationProbability * 0.24 + precipitationMm * 1.6)
commutePoints = hellFactor * dayTimeMultiplier
heatPoints = min(10, max(0, temperatureC - 33) * 2)
aqiPoints = min(15, max(0, (aqi - 100) * 0.1))
windStormPoints = min(10, windSpeedKph / 4 + weatherCodeStormBonus)
score = clamp(round(rainPoints + commutePoints + heatPoints + aqiPoints + windStormPoints), 0, 100)
```

The day/time multiplier is lighter on Monday and Friday, heavier Tuesday–Thursday, and adds an evening-peak bump when applicable. Missing factors contribute zero rather than crashing. Verdict thresholds are `YES` for 65–100, `MAYBE` for 35–64, and `NO` for 0–34.
