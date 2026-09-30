# Assumptions Log

This log records decisions made without blocking implementation. It should be updated if live APIs or deployment behavior differ.

1. The repository starts empty, so the app will be scaffolded in place rather than nested under another package.
2. The requested area labels are stable API allowlist values. They are sent as exact strings, not arbitrary user text.
3. Coordinates are representative central points, not polygon centroids: Whitefield `12.9698, 77.7500`, Electronic City `12.8452, 77.6602`, Marathahalli `12.9591, 77.6974`, Bellandur / Sarjapur `12.9250, 77.6760`, HSR Layout `12.9116, 77.6389`, Koramangala `12.9352, 77.6245`, Indiranagar `12.9784, 77.6408`, Hebbal `13.0358, 77.5970`, Yelahanka `13.1007, 77.5963`, Jayanagar `12.9250, 77.5938`. Bellandur / Sarjapur is the least precise because it spans a corridor; its point is centered near Bellandur/Sarjapur Road.
4. Open-Meteo's forecast and air-quality APIs expose time arrays in the requested timezone when `timezone=Asia/Kolkata` is supplied. The parser will match local hour strings rather than assume UTC.
5. “Next commute windows” means today's local 08:00–10:00 and 17:00–20:00 slots. If the request occurs after a window, the score still uses today's complete windows because the product answers “today.”
6. Precipitation in the score is the sum of hourly millimeters in both windows; probability is the maximum hourly probability across those windows. This deliberately overweights a bad commute window for comedic usefulness.
7. Open-Meteo weather codes are WMO-style. Thunderstorm codes 95–99 receive an additional storm penalty; unknown codes contribute no storm bonus.
8. Weather and AQI response values can be null or absent. Missing values are treated as zero contribution, while the UI marks the result as partly unavailable if either upstream request fails or required fields are absent.
9. For current temperature, the implementation uses the current API value when present and otherwise the nearest usable hourly value.
10. The score's hand-tuned weights are a product heuristic, not a scientific health or traffic model. Score output is rounded and clamped to 0–100.
11. Day multipliers use the local weekday: Monday/Friday are lighter, Tuesday–Thursday heavier, and Saturday/Sunday use a neutral/lighter multiplier. Evening peak receives a modest bump.
12. The frontend may use a query parameter for area selection to make results linkable; no server-side session is required.
13. The app's base URL is read from `NEXT_PUBLIC_APP_URL`, then Vercel's deployment URL, then a relative URL fallback. No deployment URL is hardcoded.
14. LLM provider requests use the provider's simple JSON HTTP API from server route code. If the provider's exact response shape differs, the adapter will follow the live response and the change will be recorded here.
15. A missing `LLM_PROVIDER`, missing key, invalid provider, timeout, non-2xx response, or empty model output all choose a handwritten fallback; the core verdict never depends on an LLM.
16. The in-memory rate limiter is per process/instance and best effort because Vercel serverless instances do not share memory. It is sufficient for v0 abuse reduction, not durable enforcement.
17. IP extraction trusts the first `x-forwarded-for` value or falls back to `x-real-ip`; this is adequate for a lightweight limit behind Vercel's proxy.
18. The card route accepts `tone` for contract compatibility and future copy variations, but the visual card primarily needs verdict, score, and area.
19. Native Web Share may reject a share request or be unavailable. The UI falls back to copying the card URL and reports that outcome.
20. LocalStorage is unavailable during server rendering and may be blocked by privacy settings; all counter reads/writes are guarded and the feature is non-critical.
21. The LLM prompt contains only allowlisted area/tone/verdict and normalized numeric factors. No free-form browser text is interpolated.
22. The app uses a distinctive display font from `next/font/google`; if a build environment cannot fetch Google font assets, the CSS fallback stack remains usable.
23. The requested live public URL cannot be created from this local workspace without Vercel credentials/project access. The repository will be deployment-ready and include a verification checklist.
