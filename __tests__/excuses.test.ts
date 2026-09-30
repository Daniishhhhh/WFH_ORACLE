import { describe, expect, it } from 'vitest';
import { fallbackBankSize, fallbackExcuse, type ExcuseContext } from '@/lib/excuses';

const base: Omit<ExcuseContext, 'tone'> = {
  area: 'Koramangala',
  verdict: 'YES',
  rainProbability: 82,
  rainMm: 11.4,
  aqi: 148,
  temperatureC: 30,
  windSpeedKph: 18,
  commutePoints: 10,
};

describe('fallback excuses', () => {
  it('ships at least ten handwritten fallbacks per tone', () => {
    expect(fallbackBankSize).toBeGreaterThanOrEqual(30);
  });

  it.each(['corporate', 'dramatic', 'desi'] as const)('renders a usable %s fallback', (tone) => {
    const excuse = fallbackExcuse({ ...base, tone });
    expect(excuse).toContain('82');
    expect(excuse.length).toBeGreaterThan(40);
  });
});
