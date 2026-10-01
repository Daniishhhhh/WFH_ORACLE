import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/excuse/route';
import { generateLlmExcuse } from '@/lib/llm';
import { takeRateLimit } from '@/lib/rate-limit';

vi.mock('@/lib/llm', () => ({ generateLlmExcuse: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({ takeRateLimit: vi.fn() }));

const valid = {
  area: 'Koramangala', tone: 'corporate', verdict: 'YES',
  factors: { rainProbability: 82, rainMm: 11.4, aqi: 148, temperature: 30, windSpeed: 18, commutePoints: 10 },
};

function request(body: string) {
  return new NextRequest('http://localhost/api/excuse', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(generateLlmExcuse).mockResolvedValue(null);
  vi.mocked(takeRateLimit).mockReturnValue({ allowed: true, remaining: 9 });
});

describe('POST /api/excuse', () => {
  it.each(['null', '[]', '{}', '42', 'true', '"text"', 'invalid'])('rejects malformed body %s with 400', async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid request' });
    expect(generateLlmExcuse).not.toHaveBeenCalled();
  });

  it('returns a handwritten fallback when the provider is unavailable', async () => {
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ source: 'fallback', excuse: expect.any(String) });
  });

  it('returns a fallback without calling the provider when rate limited', async () => {
    vi.mocked(takeRateLimit).mockReturnValue({ allowed: false, remaining: 0 });
    const response = await POST(request(JSON.stringify(valid)));
    expect(await response.json()).toEqual({ source: 'fallback', excuse: expect.any(String), reason: 'rate_limited' });
    expect(generateLlmExcuse).not.toHaveBeenCalled();
  });
});
