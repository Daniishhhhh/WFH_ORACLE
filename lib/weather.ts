import type { Area } from './areas';

const REVALIDATE_SECONDS = 600;
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const AIR_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

type JsonRecord = Record<string, unknown>;

type ForecastSnapshot = {
  temperatureC: number | null;
  rainProbability: number | null;
  rainMm: number | null;
  windSpeedKph: number | null;
  weatherCode: number | null;
};

type AirSnapshot = {
  aqi: number | null;
  pm25: number | null;
};

export type OracleData = {
  weather: ForecastSnapshot;
  airQuality: AirSnapshot;
  partial: boolean;
  errors: string[];
};

function record(value: unknown): JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function numberArray(value: unknown): Array<number | null> {
  return Array.isArray(value) ? value.map(numberOrNull) : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => (typeof item === 'string' ? item : '')) : [];
}

function commuteIndexes(times: string[]): number[] {
  return times.reduce<number[]>((indexes, value, index) => {
    const match = value.match(/T(\d{2})/);
    const hour = match ? Number(match[1]) : -1;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) indexes.push(index);
    return indexes;
  }, []);
}

function valuesAtIndexes(values: Array<number | null>, indexes: number[]): number[] {
  return indexes.map((index) => values[index]).filter((value): value is number => value !== null && Number.isFinite(value));
}

function maxOrNull(values: number[]): number | null {
  return values.length ? Math.max(...values) : null;
}

function sumOrNull(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

async function getJson(url: string): Promise<JsonRecord> {
  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
  return record(await response.json());
}

async function fetchForecast(area: Area): Promise<ForecastSnapshot> {
  const params = new URLSearchParams({
    latitude: String(area.latitude),
    longitude: String(area.longitude),
    current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m',
    timezone: 'Asia/Kolkata',
    forecast_days: '1',
  });
  const payload = await getJson(`${FORECAST_ENDPOINT}?${params.toString()}`);
  const current = record(payload.current);
  const hourly = record(payload.hourly);
  const times = stringArray(hourly.time);
  const indexes = commuteIndexes(times);
  const temperatureValues = valuesAtIndexes(numberArray(hourly.temperature_2m), indexes);
  const precipitationValues = valuesAtIndexes(numberArray(hourly.precipitation), indexes);
  const probabilityValues = valuesAtIndexes(numberArray(hourly.precipitation_probability), indexes);
  const windValues = valuesAtIndexes(numberArray(hourly.wind_speed_10m), indexes);
  const codeValues = valuesAtIndexes(numberArray(hourly.weather_code), indexes);

  return {
    temperatureC: maxOrNull(temperatureValues) ?? numberOrNull(current.temperature_2m),
    rainProbability: maxOrNull(probabilityValues) ?? numberOrNull(current.precipitation_probability),
    rainMm: sumOrNull(precipitationValues) ?? numberOrNull(current.precipitation),
    windSpeedKph: maxOrNull(windValues) ?? numberOrNull(current.wind_speed_10m),
    weatherCode: maxOrNull(codeValues) ?? numberOrNull(current.weather_code),
  };
}

async function fetchAirQuality(area: Area): Promise<AirSnapshot> {
  const params = new URLSearchParams({
    latitude: String(area.latitude),
    longitude: String(area.longitude),
    current: 'us_aqi,pm2_5',
    hourly: 'us_aqi,pm2_5',
    timezone: 'Asia/Kolkata',
    forecast_days: '1',
  });
  const payload = await getJson(`${AIR_ENDPOINT}?${params.toString()}`);
  const current = record(payload.current);
  const hourly = record(payload.hourly);
  const times = stringArray(hourly.time);
  const indexes = commuteIndexes(times);
  const aqiValues = valuesAtIndexes(numberArray(hourly.us_aqi), indexes);
  const pmValues = valuesAtIndexes(numberArray(hourly.pm2_5), indexes);
  return {
    aqi: numberOrNull(current.us_aqi) ?? maxOrNull(aqiValues),
    pm25: numberOrNull(current.pm2_5) ?? maxOrNull(pmValues),
  };
}

const EMPTY_WEATHER: ForecastSnapshot = {
  temperatureC: null,
  rainProbability: null,
  rainMm: null,
  windSpeedKph: null,
  weatherCode: null,
};

const EMPTY_AIR: AirSnapshot = { aqi: null, pm25: null };

export async function getOracleData(area: Area): Promise<OracleData> {
  const [weatherResult, airResult] = await Promise.allSettled([fetchForecast(area), fetchAirQuality(area)]);
  const errors: string[] = [];
  if (weatherResult.status === 'rejected') errors.push('weather');
  if (airResult.status === 'rejected') errors.push('air quality');
  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : EMPTY_WEATHER;
  const airQuality = airResult.status === 'fulfilled' ? airResult.value : EMPTY_AIR;
  const missingWeather = Object.values(weather).some((value) => value === null);
  const missingAir = Object.values(airQuality).some((value) => value === null);
  return { weather, airQuality, partial: errors.length > 0 || missingWeather || missingAir, errors };
}
