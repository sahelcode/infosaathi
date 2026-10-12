// Options for the dropdown filters on list pages.
import { CITIES } from './taxonomy';
export const cityField = (cities: string[]) => ({
  key: 'city' as const, label: 'জেলা', all: 'সব জেলা',
  options: [...new Set(cities)].sort((a, b) => (a === 'sylhet' ? -1 : b === 'sylhet' ? 1 : CITIES[a as keyof typeof CITIES].bn.localeCompare(CITIES[b as keyof typeof CITIES].bn, 'bn'))).map((c) => ({ v: c, l: CITIES[c as keyof typeof CITIES].bn })),
});
export const typeField = (label: string, all: string, values: string[], names?: Record<string, string>) => ({
  key: 'type' as const, label, all,
  options: [...new Set(values)].map((v) => ({ v, l: names?.[v] ?? v })),
});

// Place kinds are grouped into a few categories people actually think in.
const PLACE_GROUP: Record<string, string> = {
  forest: 'nature', tea: 'nature', clouds: 'nature',
  river: 'water', swamp: 'water', lake: 'water',
  waterfall: 'waterfall', beach: 'beach', heritage: 'heritage',
};
export const PLACE_GROUP_BN: Record<string, string> = {
  nature: 'প্রকৃতি ও সবুজ', water: 'নদী ও জলাভূমি', waterfall: 'ঝরনা', beach: 'সমুদ্রসৈকত', heritage: 'ঐতিহ্য ও ইতিহাস',
};
export const placeGroup = (kind: string) => PLACE_GROUP[kind] ?? 'nature';
// Only categories that have at least one place are offered.
export const placeTypeField = (kinds: string[]) => {
  const present = new Set(kinds.map(placeGroup));
  return typeField('ধরন', 'সব ধরনের জায়গা', Object.keys(PLACE_GROUP_BN).filter((g) => present.has(g)), PLACE_GROUP_BN);
};
