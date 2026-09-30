import type { ExcuseContext } from './excuses';

const TIMEOUT_MS = 8_000;

type Provider = 'openai' | 'anthropic';

function systemPrompt(context: ExcuseContext): string {
  return [
    'You write a harmless, funny manager excuse for a Bengaluru WFH decision.',
    'Output exactly one or two sentences and nothing else.',
    'Reference the supplied rain, AQI, and commute conditions accurately.',
    'Never mention medical emergencies, illness, bereavement, death, disasters, or serious events.',
    'Do not name a real company or person. Do not invent a serious event.',
    context.tone === 'corporate' ? 'Use a professional corporate tone and do not use emojis.' : `Use a ${context.tone} tone without emojis.`,
    `Structured facts: area=${context.area}; verdict=${context.verdict}; rain_probability=${Math.round(context.rainProbability)}%; rain_mm=${context.rainMm.toFixed(1)}; aqi=${Math.round(context.aqi)}; commute_points=${Math.round(context.commutePoints)}; temperature_c=${context.temperatureC.toFixed(1)}; wind_kph=${Math.round(context.windSpeedKph)}.`,
  ].join('\n');
}

function cleanOutput(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/\s+/g, ' ').trim().replace(/^['"]|['"]$/g, '');
  return cleaned.length > 0 && cleaned.length <= 500 ? cleaned : null;
}

async function requestOpenAi(context: ExcuseContext, apiKey: string, model: string, signal: AbortSignal): Promise<string | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.8, max_tokens: 120, messages: [{ role: 'system', content: systemPrompt(context) }] }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
  return cleanOutput(payload.choices?.[0]?.message?.content);
}

async function requestAnthropic(context: ExcuseContext, apiKey: string, model: string, signal: AbortSignal): Promise<string | null> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 120, system: systemPrompt(context), messages: [{ role: 'user', content: 'Write the excuse now.' }] }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { content?: Array<{ type?: string; text?: unknown }> };
  return cleanOutput(payload.content?.find((item) => item.type === 'text')?.text);
}

export async function generateLlmExcuse(context: ExcuseContext): Promise<string | null> {
  const provider = process.env.LLM_PROVIDER as Provider | undefined;
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || (provider !== 'openai' && provider !== 'anthropic')) return null;
  const model = process.env.LLM_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-haiku-latest');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return provider === 'openai'
      ? await requestOpenAi(context, apiKey, model, controller.signal)
      : await requestAnthropic(context, apiKey, model, controller.signal);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
