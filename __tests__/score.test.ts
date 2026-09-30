import { describe, expect, it } from 'vitest';
import { calculateScore } from '@/lib/score';

describe('calculateScore', () => {
  it('calls a heavy rain day a YES', () => {
    const result = calculateScore({
      areaHellFactor: 14,
      rainProbability: 100,
      rainMm: 28,
      temperatureC: 31,
      aqi: 90,
      windSpeedKph: 24,
      weatherCode: 95,
      weekday: 3,
      hour: 18,
    });
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.verdict).toBe('YES');
    expect(result.factors.rain.points).toBe(40);
  });

  it('keeps a clear, cool day in NO territory for a low-hell area', () => {
    const result = calculateScore({
      areaHellFactor: 6,
      rainProbability: 0,
      rainMm: 0,
      temperatureC: 27,
      aqi: 45,
      windSpeedKph: 4,
      weatherCode: 1,
      weekday: 3,
      hour: 10,
    });
    expect(result.score).toBeLessThan(35);
    expect(result.verdict).toBe('NO');
  });

  it('adds air-quality points above 100', () => {
    const clean = calculateScore({ areaHellFactor: 0, aqi: 100, weekday: 3, hour: 12 });
    const polluted = calculateScore({ areaHellFactor: 0, aqi: 250, weekday: 3, hour: 12 });
    expect(clean.factors.aqi.points).toBe(0);
    expect(polluted.factors.aqi.points).toBe(15);
    expect(polluted.score).toBeGreaterThan(clean.score);
  });

  it('makes Wednesday heavier than Friday', () => {
    const wednesday = calculateScore({ areaHellFactor: 13, weekday: 3, hour: 12 });
    const friday = calculateScore({ areaHellFactor: 13, weekday: 5, hour: 12 });
    expect(wednesday.factors.commute.points).toBeGreaterThan(friday.factors.commute.points);
    expect(wednesday.score).toBeGreaterThan(friday.score);
  });

  it('handles missing upstream values without throwing', () => {
    const result = calculateScore({ areaHellFactor: 9, weekday: 2, hour: 9, rainProbability: null, rainMm: null, temperatureC: null, aqi: null, windSpeedKph: null, weatherCode: null });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.factors.heat.temperatureC).toBeNull();
    expect(result.factors.aqi.aqi).toBeNull();
  });

  it('clamps a pathological input to 100', () => {
    const result = calculateScore({ areaHellFactor: 999, rainProbability: 999, rainMm: 999, temperatureC: 999, aqi: 9999, windSpeedKph: 999, weatherCode: 99, weekday: 3, hour: 18 });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.verdict).toBe('YES');
    expect(result.factors.rain.points).toBe(40);
    expect(result.factors.heat.points).toBe(10);
    expect(result.factors.aqi.points).toBe(15);
    expect(result.factors.wind.points).toBe(10);
  });
});
