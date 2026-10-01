export const CLAIM_STORAGE_KEY = 'wfh-days-claimed';

type ClaimStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function parseClaimCount(raw: string | null): number {
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function readClaimCount(storage: () => ClaimStorage, current = 0): number {
  try {
    return Math.max(current, parseClaimCount(storage().getItem(CLAIM_STORAGE_KEY)));
  } catch {
    return current;
  }
}

// Resolve storage inside the guard: even accessing localStorage can throw.
export function claimDay(storage: () => ClaimStorage, current: number): number {
  const next = Math.min(Number.MAX_SAFE_INTEGER, readClaimCount(storage, current) + 1);
  try {
    storage().setItem(CLAIM_STORAGE_KEY, String(next));
  } catch {
    // Keep the count usable for this visit when persistence is blocked.
  }
  return next;
}
