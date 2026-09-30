export type ScoreInput = {
  areaHellFactor: number;
  rainProbability?: number | null;
  rainMm?: number | null;
  temperatureC?: number | null;
  aqi?: number | null;
  windSpeedKph?: number | null;
  weatherCode?: number | null;
  /** JavaScript weekday, where Sunday is 0 and Saturday is 6. */
  weekday?: number;
  /** Local hour in India Standard Time. */
  hour?: number;
  now?: Date;
};

export type Verdict = 'YES' | 'MAYBE' | 'NO';

export type ScoreFactors = {
  rain: { points: number; probability: number; mm: number };
  commute: { points: number; hellFactor: number; multiplier: number };
  heat: { points: number; temperatureC: number | null };
  aqi: { points: number; aqi: number | null };
  wind: { points: number; speedKph: number; weatherCode: number | null };
};

export type ScoreResult = {
  score: number;
  verdict: Verdict;
  factors: ScoreFactors;
};

function finite(value: number | null | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function indiaClock(now: Date): { weekday: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const weekdayNames: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    weekday: weekdayNames[parts.find((part) => part.type === 'weekday')?.value ?? ''] ?? 0,
    hour: Number(parts.find((part) => part.type === 'hour')?.value ?? 12),
  };
}

export function dayTimeMultiplier(weekday: number, hour: number): number {
  const weekdayMultiplier = weekday === 1 || weekday === 5 ? 0.72 : weekday >= 2 && weekday <= 4 ? 1 : 0.5;
  const eveningMultiplier = hour >= 17 && hour <= 20 ? 1.15 : 1;
  return weekdayMultiplier * eveningMultiplier;
}

export function verdictForScore(score: number): Verdict {
  if (score >= 65) return 'YES';
  if (score >= 35) return 'MAYBE';
  return 'NO';
}

export function calculateScore(input: ScoreInput): ScoreResult {
  const clock = input.weekday === undefined || input.hour === undefined ? indiaClock(input.now ?? new Date()) : null;
  const weekday = input.weekday ?? clock?.weekday ?? 0;
  const hour = input.hour ?? clock?.hour ?? 12;

  const probability = clamp(finite(input.rainProbability), 0, 100);
  const rainMm = Math.max(0, finite(input.rainMm));
  const rainPoints = clamp(probability * 0.24 + rainMm * 1.6, 0, 40);

  const hellFactor = clamp(finite(input.areaHellFactor), 0, 15);
  const multiplier = dayTimeMultiplier(weekday, hour);
  const commutePoints = clamp(hellFactor * multiplier, 0, 17.25);

  const temperatureC = input.temperatureC === null || input.temperatureC === undefined ? null : finite(input.temperatureC);
  const heatPoints = clamp(Math.max(0, finite(input.temperatureC) - 33) * 2, 0, 10);

  const aqi = input.aqi === null || input.aqi === undefined ? null : Math.max(0, finite(input.aqi));
  const aqiPoints = clamp(Math.max(0, finite(input.aqi) - 100) * 0.1, 0, 15);

  const windSpeedKph = Math.max(0, finite(input.windSpeedKph));
  const weatherCode = input.weatherCode === null || input.weatherCode === undefined ? null : finite(input.weatherCode);
  const stormBonus = weatherCode !== null && weatherCode >= 95 && weatherCode <= 99 ? 5 : 0;
  const windPoints = clamp(windSpeedKph / 4 + stormBonus, 0, 10);

  const score = clamp(Math.round(rainPoints + commutePoints + heatPoints + aqiPoints + windPoints), 0, 100);
  return {
    score,
    verdict: verdictForScore(score),
    factors: {
      rain: { points: Math.round(rainPoints), probability, mm: Number(rainMm.toFixed(1)) },
      commute: { points: Math.round(commutePoints), hellFactor, multiplier: Number(multiplier.toFixed(2)) },
      heat: { points: Math.round(heatPoints), temperatureC },
      aqi: { points: Math.round(aqiPoints), aqi },
      wind: { points: Math.round(windPoints), speedKph: Number(windSpeedKph.toFixed(1)), weatherCode },
    },
  };
}
