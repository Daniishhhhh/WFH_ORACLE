import type { Verdict } from './score';

const ROASTS: Record<Verdict, Array<(rain: number, aqi: number | null, area: string) => string>> = {
  YES: [
    (rain, aqi, area) => `${rain}% rain and AQI ${aqi ?? 'unknown'}? ${area} has officially entered “reply from home” territory.`,
    (rain, aqi) => `At ${rain}% rain with AQI ${aqi ?? 'unknown'}, even your laptop wants to avoid the ORR.`,
    (rain, aqi) => `The forecast brought ${rain}% rain and AQI ${aqi ?? 'unknown'} — namma metro cannot save this commute.`,
    (rain, aqi) => `AQI ${aqi ?? 'unknown'} plus a ${rain}% rain chance: the office can receive your presence digitally.`,
    (rain, aqi, area) => `${area} is serving ${rain}% rain and AQI ${aqi ?? 'unknown'}. Your calendar deserves a remote cameo.`,
    (rain, aqi) => `With ${rain}% rain and AQI ${aqi ?? 'unknown'}, Silk Board has requested that you simply do not.`,
    (rain, aqi) => `${rain}% rain probability, AQI ${aqi ?? 'unknown'} — a strong day to commute from bed to desk.`,
    (rain, aqi, area) => `${area} says ${rain}% rain; AQI says ${aqi ?? 'unknown'}. The WFH button is right there for a reason.`,
  ],
  MAYBE: [
    (rain, aqi, area) => `${area} is at ${rain}% rain and AQI ${aqi ?? 'unknown'}: pack optimism, and maybe trousers.`,
    (rain, aqi) => `${rain}% rain with AQI ${aqi ?? 'unknown'} is not a crisis, but it is definitely a meeting talking point.`,
    (rain, aqi) => `The sky says ${rain}%, the air says ${aqi ?? 'unknown'}, and your manager says “let us sync.”`,
    (rain, aqi) => `AQI ${aqi ?? 'unknown'} and ${rain}% rain: technically survivable, spiritually questionable.`,
    (rain, aqi, area) => `${area} has ${rain}% rain odds and AQI ${aqi ?? 'unknown'}. Roll the commute dice carefully.`,
    (rain, aqi) => `At ${rain}% rain and AQI ${aqi ?? 'unknown'}, the ORR may be fine. Your enthusiasm may not be.`,
    (rain, aqi) => `${rain}% rain, AQI ${aqi ?? 'unknown'} — choose office if brave, WFH if emotionally literate.`,
    (rain, aqi) => `The forecast is giving ${rain}% rain and AQI ${aqi ?? 'unknown'}: a firm maybe, like a calendar invite with no agenda.`,
  ],
  NO: [
    (rain, aqi, area) => `${area} reports only ${rain}% rain and AQI ${aqi ?? 'unknown'}. The office has receipts.`,
    (rain, aqi) => `At ${rain}% rain and AQI ${aqi ?? 'unknown'}, Silk Board cannot be your excuse today.`,
    (rain, aqi) => `The sky offers ${rain}% rain and the air AQI ${aqi ?? 'unknown'} — please go collect your office attendance.`,
    (rain, aqi) => `AQI ${aqi ?? 'unknown'} with ${rain}% rain? Namma metro is calling, politely.`,
    (rain, aqi, area) => `${area} is at ${rain}% rain and AQI ${aqi ?? 'unknown'}. Your chair at work has missed you.`,
    (rain, aqi) => `${rain}% rain and AQI ${aqi ?? 'unknown'}: the commute is not the villain in this episode.`,
    (rain, aqi) => `Forecast: ${rain}% rain. Air: AQI ${aqi ?? 'unknown'}. Excuse: currently under review.`,
    (rain, aqi) => `With ${rain}% rain and AQI ${aqi ?? 'unknown'}, even the ORR says “see you there.”`,
  ],
};

export function getRoast(verdict: Verdict, values: { rainProbability: number | null; aqi: number | null; area: string; score: number }): string {
  const rain = Math.round(values.rainProbability ?? 0);
  const index = (rain + Math.round(values.aqi ?? 0) + values.score) % ROASTS[verdict].length;
  return ROASTS[verdict][index](rain, values.aqi, values.area);
}
