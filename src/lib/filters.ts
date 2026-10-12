// Options for the dropdown filters on list pages.
import { CITIES } from './taxonomy';
export const cityField = (cities: string[]) => ({
  key: 'city' as const, label: 'জেলা', all: 'সব জেলা',
  options: [...new Set(cities)].sort((a, b) => CITIES[a as keyof typeof CITIES].bn.localeCompare(CITIES[b as keyof typeof CITIES].bn, 'bn')).map((c) => ({ v: c, l: CITIES[c as keyof typeof CITIES].bn })),
});
export const typeField = (label: string, all: string, values: string[], names?: Record<string, string>) => ({
  key: 'type' as const, label, all,
  options: [...new Set(values)].map((v) => ({ v, l: names?.[v] ?? v })),
});
