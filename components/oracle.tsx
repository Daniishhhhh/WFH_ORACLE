'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Area } from '@/lib/areas';
import type { OracleData } from '@/lib/weather';
import type { ScoreResult } from '@/lib/score';
import { getRoast } from '@/lib/roasts';
import { claimDay, readClaimCount } from '@/lib/claims';

type OracleProps = {
  areas: readonly Area[];
  selectedArea: Area;
  data: OracleData;
  result: ScoreResult;
};

const verdictStyles = {
  YES: { ink: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-300', label: 'WFH. Protect your peace.' },
  MAYBE: { ink: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-300', label: 'The commute is on probation.' },
  NO: { ink: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-300', label: 'Go forth. Unfortunately.' },
} as const;

function value(value: number | null, suffix = ''): string {
  return value === null ? '—' : `${value}${suffix}`;
}

export function Oracle({ areas, selectedArea, data, result }: OracleProps) {
  const router = useRouter();
  const [claimCount, setClaimCount] = useState<number | null>(null);
  const [tone, setTone] = useState<'corporate' | 'dramatic' | 'desi'>('corporate');
  const [excuse, setExcuse] = useState<string | null>(null);
  const [excuseSource, setExcuseSource] = useState<'llm' | 'fallback' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [excuseStatus, setExcuseStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const style = verdictStyles[result.verdict];
  const roast = getRoast(result.verdict, {
    rainProbability: data.weather.rainProbability,
    aqi: data.airQuality.aqi,
    area: selectedArea.name,
    score: result.score,
  });

  function changeArea(areaName: string) {
    router.replace(`/?area=${encodeURIComponent(areaName)}`, { scroll: false });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setClaimCount(readClaimCount(() => window.localStorage));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function generateExcuse() {
    setIsGenerating(true);
    setExcuseStatus('');
    try {
      const response = await fetch('/api/excuse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          area: selectedArea.name,
          tone,
          verdict: result.verdict,
          factors: {
            rainProbability: data.weather.rainProbability ?? 0,
            rainMm: data.weather.rainMm ?? 0,
            aqi: data.airQuality.aqi ?? 0,
            temperature: data.weather.temperatureC ?? 0,
            windSpeed: data.weather.windSpeedKph ?? 0,
            commutePoints: result.factors.commute.points,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || typeof payload.excuse !== 'string') throw new Error('The memo machine is taking a chai break.');
      setExcuse(payload.excuse);
      setExcuseSource(payload.source === 'llm' ? 'llm' : 'fallback');
    } catch (error) {
      setExcuseStatus(error instanceof Error ? error.message : 'Could not generate an excuse. Try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setExcuseStatus(successMessage);
    } catch {
      setExcuseStatus('Copy was blocked. Select the text manually — technology has chosen drama.');
    }
  }

  async function shareResult() {
    const params = new URLSearchParams({ verdict: result.verdict, score: String(result.score), area: selectedArea.name, tone });
    const url = `${window.location.origin}/api/card?${params.toString()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Should I WFH Today?', text: `${result.verdict}: ${selectedArea.name} scored ${result.score}/100`, url });
        setShareStatus('Shared. Go forth and influence the commute discourse.');
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus('Card link copied. Drop it in the group chat.');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus('Share sheet said no; card link copied instead.');
      } catch {
        setShareStatus('Could not share automatically. Copy the card URL from your browser.');
      }
    }
  }

  function claimWfh() {
    setClaimCount(claimDay(() => window.localStorage, claimCount ?? 0));
  }

  return (
    <main className="paper-grid mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-8 sm:py-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--muted)]">Bengaluru daily oracle</p>
          <h1 className="display-font mt-1 text-4xl leading-none tracking-wide sm:text-5xl">Should I WFH today?</h1>
        </div>
        <div className="hidden rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-right text-xs font-semibold text-[var(--muted)] shadow-sm sm:block">
          <span className="block text-[var(--ink)]">Powered by vibes + Open-Meteo</span>
          <span>Not HR advice</span>
        </div>
      </header>

      <section className="mx-auto mt-6 max-w-3xl">
        <label htmlFor="area" className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          Where are you escaping from?
        </label>
        <select
          id="area"
          value={selectedArea.name}
          onChange={(event) => changeArea(event.target.value)}
          className="w-full rounded-2xl border-2 border-[var(--ink)] bg-[var(--panel)] px-4 py-3 text-base font-bold shadow-ink outline-none transition focus:ring-4 focus:ring-yellow-300"
        >
          {areas.map((area) => <option key={area.name}>{area.name}</option>)}
        </select>
      </section>

      <section
        key={`${selectedArea.name}-${result.verdict}-${result.score}`}
        className="verdict-reveal mx-auto mt-5 max-w-3xl overflow-hidden rounded-[2rem] border-2 border-[var(--ink)] bg-[var(--panel)] shadow-ink"
        aria-labelledby="verdict-heading"
        aria-live="polite"
      >
        <div className={`flex items-center justify-between gap-4 px-5 pb-3 pt-5 sm:px-8 sm:pt-7 ${style.bg}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-800/70">{selectedArea.name} · today</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{style.label}</p>
          </div>
          <div className="rounded-full border-2 border-slate-900 bg-white/60 px-3 py-1 text-xs font-black text-slate-900">{result.score}/100</div>
        </div>
        <div className="px-5 pb-6 pt-4 sm:px-8 sm:pb-8">
          <h2 id="verdict-heading" className={`display-font text-[6.5rem] leading-[0.78] tracking-wide sm:text-[9rem] ${style.ink}`}>{result.verdict}</h2>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-snug sm:text-xl">{roast}</p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Factor label="RAIN" value={`+${result.factors.rain.points}`} detail={`${value(result.factors.rain.probability, '%')} · ${value(result.factors.rain.mm, 'mm')}`} />
            <Factor label="COMMUTE" value={`+${result.factors.commute.points}`} detail={`hell ${result.factors.commute.hellFactor}/15`} />
            <Factor label="HEAT" value={`+${result.factors.heat.points}`} detail={value(result.factors.heat.temperatureC, '°C')} />
            <Factor label="AIR" value={`+${result.factors.aqi.points}`} detail={`AQI ${value(result.factors.aqi.aqi)}`} />
            <Factor label="WIND" value={`+${result.factors.wind.points}`} detail={value(result.factors.wind.speedKph, ' km/h')} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-4 max-w-3xl rounded-2xl border-2 border-[var(--ink)] bg-[var(--panel)] p-4 shadow-sm sm:p-5" aria-labelledby="memo-heading" aria-busy={isGenerating}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">The manager memo machine</p>
            <h2 id="memo-heading" className="mt-1 text-xl font-black">Need an official-sounding excuse?</h2>
          </div>
          <fieldset className="flex min-w-0 shrink-0 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <legend className="sr-only">Excuse tone</legend>
            {(['corporate', 'dramatic', 'desi'] as const).map((option) => (
              <label key={option} className="cursor-pointer">
                <input type="radio" name="excuse-tone" value={option} checked={tone === option} onChange={() => setTone(option)} className="peer sr-only" />
                <span className="flex min-h-11 items-center rounded-lg px-3 py-2 text-xs font-black capitalize text-[var(--muted)] transition peer-checked:bg-[var(--ink)] peer-checked:text-[var(--paper)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ink)]">
                  {option}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <button type="button" onClick={generateExcuse} disabled={isGenerating} aria-controls="excuse-result" className="mt-4 w-full rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-yellow-200 focus:outline-none focus:ring-4 focus:ring-yellow-400 disabled:cursor-wait disabled:opacity-60">
          {isGenerating ? 'Consulting the forecast...' : 'Generate my excuse'}
        </button>
        {excuse && <div id="excuse-result" className="mt-4 rounded-xl border border-[var(--line)] bg-white/50 p-4 dark:bg-slate-900/40" aria-live="polite" aria-atomic="true">
          <p className="text-base font-semibold leading-relaxed">“{excuse}”</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => copyText(excuse, 'Excuse copied. Deploy responsibly.')} className="rounded-lg border border-[var(--ink)] px-3 py-2 text-xs font-black transition hover:bg-[var(--ink)] hover:text-[var(--paper)] focus:outline-none focus:ring-2 focus:ring-yellow-400">Copy excuse</button>
            <span className="text-xs font-semibold text-[var(--muted)]">{excuseSource === 'llm' ? 'freshly generated' : 'handwritten fallback, still legally unconvincing'}</span>
          </div>
        </div>}
        {excuseStatus && <p role="status" className="mt-3 text-xs font-bold text-[var(--muted)]">{excuseStatus}</p>}
      </section>

      <section className="mx-auto mt-4 flex max-w-3xl flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="share-heading">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">Screenshot your alibi</p>
          <h2 id="share-heading" className="mt-1 text-sm font-semibold">Share a 1200 × 630 result card.</h2>
        </div>
        <button type="button" onClick={shareResult} className="rounded-xl border-2 border-[var(--ink)] px-4 py-3 text-sm font-black transition hover:bg-[var(--ink)] hover:text-[var(--paper)] focus:outline-none focus:ring-4 focus:ring-yellow-300">Share result</button>
        {shareStatus && <p role="status" className="text-xs font-bold text-[var(--muted)] sm:max-w-[12rem]">{shareStatus}</p>}
      </section>

      <section className="mx-auto mt-4 grid max-w-3xl gap-4 sm:grid-cols-[1fr_auto]" aria-labelledby="why-heading">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h2 id="why-heading" className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">Why this number?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">Rain gets up to 40 points, commute hell up to 17, then heat, air quality, and wind bring the chaos. It is a heuristic, not a legal defence.</p>
          {data.partial && <p className="mt-3 rounded-xl bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-900 dark:bg-yellow-300/20 dark:text-yellow-100">Some data is partly unavailable. We scored what survived.</p>}
        </div>
        <button type="button" onClick={claimWfh} className="rounded-2xl border-2 border-[var(--ink)] bg-slate-900 px-5 py-4 text-left text-white shadow-ink transition motion-safe:hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-yellow-300">
          <span className="block text-xs font-black uppercase tracking-[0.16em] text-yellow-300">Make it official</span>
          <span className="mt-1 block font-bold">I&apos;m working from home</span>
          <span aria-live="polite" className="mt-2 block text-xs text-slate-300">{claimCount === null || claimCount === 0 ? 'Count this day on this device' : `${claimCount} day${claimCount === 1 ? '' : 's'} claimed here`}</span>
        </button>
      </section>

      <footer className="mx-auto mt-8 max-w-3xl text-center text-xs font-semibold text-[var(--muted)]">Weather and air quality refresh every 10 minutes · Built for people who have seen Silk Board at 6 PM</footer>
    </main>
  );
}

function Factor({ label, value: factorValue, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] px-3 py-3">
      <p className="text-[10px] font-black tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-black">{factorValue}</p>
      <p className="mt-1 truncate text-[11px] font-semibold text-[var(--muted)]">{detail}</p>
    </div>
  );
}
