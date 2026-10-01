import { describe, expect, it, vi } from 'vitest';
import { CLAIM_STORAGE_KEY, claimDay, parseClaimCount, readClaimCount } from '@/lib/claims';

describe('local claim counter', () => {
  it.each([null, '', 'NaN', 'Infinity', '-4', '1.5', 'broken', '9007199254740992'])('treats invalid or absent count %s as zero', (raw) => {
    expect(parseClaimCount(raw)).toBe(0);
  });

  it('loads a saved count without incrementing or writing it', () => {
    const storage = { getItem: vi.fn(() => '4'), setItem: vi.fn() };
    expect(readClaimCount(() => storage)).toBe(4);
    expect(storage.getItem).toHaveBeenCalledWith(CLAIM_STORAGE_KEY);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('increments and persists an explicit claim', () => {
    const storage = { getItem: vi.fn(() => '4'), setItem: vi.fn() };
    expect(claimDay(() => storage, 2)).toBe(5);
    expect(storage.setItem).toHaveBeenCalledWith(CLAIM_STORAGE_KEY, '5');
  });

  it('recovers a corrupt count', () => {
    const storage = { getItem: () => 'NaN', setItem: vi.fn() };
    expect(claimDay(() => storage, 0)).toBe(1);
  });

  it('continues counting when storage access is blocked', () => {
    const blocked = () => { throw new Error('SecurityError'); };
    expect(readClaimCount(blocked)).toBe(0);
    expect(claimDay(blocked, 2)).toBe(3);
  });

  it('continues counting when reads work but writes fail', () => {
    const storage = { getItem: () => '2', setItem: () => { throw new Error('QuotaExceededError'); } };
    const first = claimDay(() => storage, 2);
    expect(first).toBe(3);
    expect(claimDay(() => storage, first)).toBe(4);
  });

  it('does not overflow the safe integer range', () => {
    const storage = { getItem: () => String(Number.MAX_SAFE_INTEGER), setItem: vi.fn() };
    expect(claimDay(() => storage, 0)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
