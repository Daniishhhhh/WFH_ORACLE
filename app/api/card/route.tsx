import { ImageResponse } from 'next/og';
import { AREAS, DEFAULT_AREA, isAreaName } from '@/lib/areas';
import type { Verdict } from '@/lib/score';

export const runtime = 'edge';

const VERDICTS = ['YES', 'MAYBE', 'NO'] as const;
const TONES = ['corporate', 'dramatic', 'desi'] as const;
const styles = {
  YES: { background: '#b7f7cb', ink: '#075e38', accent: '#18a866', tagline: 'Protect your peace. Work from home.' },
  MAYBE: { background: '#ffe7a3', ink: '#704b00', accent: '#d89a00', tagline: 'The commute is on probation.' },
  NO: { background: '#ffc2c8', ink: '#8c1d32', accent: '#d63355', tagline: 'Go forth. Unfortunately.' },
} as const;

function safeVerdict(value: string | null): Verdict {
  return VERDICTS.includes(value as Verdict) ? (value as Verdict) : 'MAYBE';
}

function safeScore(value: string | null): number {
  const score = Number(value);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 52;
}

function safeArea(value: string | null): string {
  return isAreaName(value) ? value : DEFAULT_AREA;
}

function safeTone(value: string | null): string {
  return TONES.includes(value as (typeof TONES)[number]) ? value! : 'corporate';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verdict = safeVerdict(url.searchParams.get('verdict'));
  const score = safeScore(url.searchParams.get('score'));
  const area = safeArea(url.searchParams.get('area'));
  const tone = safeTone(url.searchParams.get('tone'));
  const style = styles[verdict];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const areaData = AREAS.find((item) => item.name === area);
  const hell = areaData?.hellFactor ?? 9;

  return new ImageResponse(
    (
      <div style={{ background: style.background, color: style.ink, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '58px 70px', fontFamily: 'Arial' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
          <span>SHOULD I WFH TODAY?</span>
          <span style={{ fontSize: 20, letterSpacing: 0, opacity: 0.7 }}>BENGALURU ORACLE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <span style={{ fontSize: 154, fontWeight: 900, lineHeight: 0.9, letterSpacing: -5 }}>{verdict}</span>
            <span style={{ fontSize: 54, fontWeight: 900 }}>/{score}</span>
          </div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 42, fontWeight: 800 }}>{area}</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 28, fontWeight: 600 }}>{style.tagline}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 20, fontWeight: 700 }}>
          <span style={{ opacity: 0.75 }}>Commute hell: {hell}/15 · tone: {tone}</span>
          <span style={{ color: style.accent }}>{appUrl.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
