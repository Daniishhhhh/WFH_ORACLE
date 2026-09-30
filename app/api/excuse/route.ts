import { NextRequest, NextResponse } from 'next/server';
import { isAreaName } from '@/lib/areas';
import { fallbackExcuse, type ExcuseContext, type Tone } from '@/lib/excuses';
import { generateLlmExcuse } from '@/lib/llm';
import { takeRateLimit } from '@/lib/rate-limit';
import type { Verdict } from '@/lib/score';

const TONES = ['corporate', 'dramatic', 'desi'] as const;
const VERDICTS = ['YES', 'MAYBE', 'NO'] as const;

type RequestBody = {
  area?: unknown;
  tone?: unknown;
  verdict?: unknown;
  factors?: unknown;
};

type RawFactors = Record<string, unknown>;

function boundedNumber(factors: RawFactors, key: string, min: number, max: number): number | null {
  const value = factors[key];
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
}

function invalid(): NextResponse {
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return invalid();
  }
  if (!isAreaName(body.area) || typeof body.tone !== 'string' || !TONES.includes(body.tone as Tone) || typeof body.verdict !== 'string' || !VERDICTS.includes(body.verdict as Verdict)) return invalid();
  if (body.factors === null || typeof body.factors !== 'object' || Array.isArray(body.factors)) return invalid();
  const raw = body.factors as RawFactors;
  const factors = {
    rainProbability: boundedNumber(raw, 'rainProbability', 0, 100),
    rainMm: boundedNumber(raw, 'rainMm', 0, 500),
    aqi: boundedNumber(raw, 'aqi', 0, 1000),
    temperatureC: boundedNumber(raw, 'temperature', -50, 70),
    windSpeedKph: boundedNumber(raw, 'windSpeed', 0, 300),
    commutePoints: boundedNumber(raw, 'commutePoints', 0, 20),
  };
  if (Object.values(factors).some((value) => value === null)) return invalid();

  const context: ExcuseContext = {
    area: body.area,
    tone: body.tone as Tone,
    verdict: body.verdict as Verdict,
    rainProbability: factors.rainProbability!,
    rainMm: factors.rainMm!,
    aqi: factors.aqi!,
    temperatureC: factors.temperatureC!,
    windSpeedKph: factors.windSpeedKph!,
    commutePoints: factors.commutePoints!,
  };
  const fallback = () => NextResponse.json({ excuse: fallbackExcuse(context), source: 'fallback' as const });
  const rate = takeRateLimit(getIp(request));
  if (!rate.allowed) return NextResponse.json({ excuse: fallbackExcuse(context), source: 'fallback' as const, reason: 'rate_limited' });

  const generated = await generateLlmExcuse(context);
  if (!generated) return fallback();
  return NextResponse.json({ excuse: generated, source: 'llm' as const });
}
