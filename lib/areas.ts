export type Area = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  hellFactor: number;
};

export const AREAS = [
  { name: 'Whitefield', slug: 'whitefield', latitude: 12.9698, longitude: 77.75, hellFactor: 13 },
  { name: 'Electronic City', slug: 'electronic-city', latitude: 12.8452, longitude: 77.6602, hellFactor: 12 },
  { name: 'Marathahalli', slug: 'marathahalli', latitude: 12.9591, longitude: 77.6974, hellFactor: 12 },
  { name: 'Bellandur / Sarjapur', slug: 'bellandur-sarjapur', latitude: 12.925, longitude: 77.676, hellFactor: 14 },
  { name: 'HSR Layout', slug: 'hsr-layout', latitude: 12.9116, longitude: 77.6389, hellFactor: 9 },
  { name: 'Koramangala', slug: 'koramangala', latitude: 12.9352, longitude: 77.6245, hellFactor: 9 },
  { name: 'Indiranagar', slug: 'indiranagar', latitude: 12.9784, longitude: 77.6408, hellFactor: 7 },
  { name: 'Hebbal', slug: 'hebbal', latitude: 13.0358, longitude: 77.597, hellFactor: 11 },
  { name: 'Yelahanka', slug: 'yelahanka', latitude: 13.1007, longitude: 77.5963, hellFactor: 8 },
  { name: 'Jayanagar', slug: 'jayanagar', latitude: 12.925, longitude: 77.5938, hellFactor: 6 },
] as const satisfies readonly Area[];

export type AreaName = (typeof AREAS)[number]['name'];
export const DEFAULT_AREA: AreaName = 'Koramangala';

export function isAreaName(value: unknown): value is AreaName {
  return typeof value === 'string' && AREAS.some((area) => area.name === value);
}

export function getArea(value: unknown): Area {
  return AREAS.find((area) => area.name === value) ?? AREAS.find((area) => area.name === DEFAULT_AREA)!;
}
