// Drawn cover pictures for news without a photo. Original artwork, so there is no copyright question.
export type ArtKind = 'health' | 'edu' | 'general';
export const artKind = (cat: string): ArtKind => (cat.includes('স্বাস্থ্য') ? 'health' : cat.includes('শিক্ষা') ? 'edu' : 'general');
const wrap = (id: string, a: string, b: string, body: string) =>
  `<svg class="na" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="প্রতীকী চিত্র" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g${id})"/><circle cx="690" cy="70" r="150" fill="#fff" opacity=".08"/><circle cx="90" cy="420" r="190" fill="#fff" opacity=".07"/>${body}</svg>`;
export const ART: Record<ArtKind, string> = {
  health: wrap('h', '#0f766e', '#115e59',
    `<rect x="300" y="95" width="200" height="200" rx="44" fill="#fff"/><path d="M370 135h60v50h50v60h-50v50h-60v-50h-50v-60h50z" transform="translate(0 -22) scale(1)" fill="#e11d48" opacity="0"/><path d="M382 130h36v50h50v36h-50v50h-36v-50h-50v-36h50z" fill="#e11d48"/><path d="M60 360h170l25-60 40 110 45-150 35 100h90l30-50h245" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`),
  edu: wrap('e', '#3730a3', '#1e3a8a',
    `<path d="M400 120 190 200l210 80 210-80z" fill="#fbbf24"/><path d="M290 238v70c0 28 50 48 110 48s110-20 110-48v-70l-110 42z" fill="#f59e0b"/><path d="M610 200v110" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/><circle cx="610" cy="322" r="14" fill="#fde68a"/><path d="M120 395h250c15 0 30-6 30-6s15 6 30 6h250" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`),
  general: wrap('n', '#166534', '#14532d',
    `<rect x="230" y="110" width="340" height="230" rx="20" fill="#fff" opacity=".95"/><rect x="262" y="146" width="150" height="92" rx="10" fill="#16a34a"/><g fill="#94a3b8"><rect x="430" y="148" width="108" height="12" rx="6"/><rect x="430" y="176" width="108" height="12" rx="6"/><rect x="430" y="204" width="80" height="12" rx="6"/><rect x="262" y="262" width="276" height="12" rx="6"/><rect x="262" y="290" width="276" height="12" rx="6"/></g>`),
};
