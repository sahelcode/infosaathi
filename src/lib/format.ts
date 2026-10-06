// Turning raw data (English digits, 24-hour times, day lists) into the Bangla text the pages show.

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const bn = (v: string | number): string => String(v).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** 1000 -> ৳১,০০০ */
export const taka = (n: number): string => '৳' + bn(n.toLocaleString('en-US'));

/** 09610009640 -> ০৯৬১০-০০৯৬৪০, 0241032671 -> ০২-৪১০৩২৬৭১, 0821716755 -> ০৮২১-৭১৬৭৫৫, 052163347 -> ০৫২১-৬৩৩৪৭ */
export function phoneShow(num: string): string {
  let s: string;
  if (num.startsWith('02')) s = num.slice(0, 2) + '-' + num.slice(2);
  else if (num.length === 10 || num.length === 9) s = num.slice(0, 4) + '-' + num.slice(4); // district landlines: 0821-716755, 0521-63347
  else s = num.slice(0, 5) + '-' + num.slice(5);
  return bn(s);
}
/** For tel: links and schema.org: +8809610009640 */
export const phoneIntl = (num: string): string => '+88' + num;

// ---- days ----
// Order the week the way Bangladesh does: Saturday first.
export const DAYS = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র'] as const;
export type Day = (typeof DAYS)[number];
/** JavaScript's getDay() number for each day (Sunday = 0). The page script compares against it. */
export const DAY_JS: Record<Day, number> = { শনি: 6, রবি: 0, সোম: 1, মঙ্গল: 2, বুধ: 3, বৃহস্পতি: 4, শুক্র: 5 };
const DAY_SCHEMA: Record<Day, string> = { শনি: 'Sa', রবি: 'Su', সোম: 'Mo', মঙ্গল: 'Tu', বুধ: 'We', বৃহস্পতি: 'Th', শুক্র: 'Fr' };
export const DAY_SHORT: Record<Day, string> = { শনি: 'শনি', রবি: 'রবি', সোম: 'সোম', মঙ্গল: 'মঙ্গল', বুধ: 'বুধ', বৃহস্পতি: 'বৃহঃ', শুক্র: 'শুক্র' };

/** ['শনি','রবি','সোম','মঙ্গল','বুধ','বৃহস্পতি'] -> 'শনি – বৃহস্পতি'; ['শনি','সোম','বুধ'] -> 'শনি, সোম, বুধ' */
export function daysText(days: readonly Day[]): string {
  const idx = [...new Set(days)].map((d) => DAYS.indexOf(d)).sort((a, b) => a - b);
  if (idx.length === 7) return 'প্রতিদিন';
  const runs: number[][] = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && i === last[last.length - 1] + 1) last.push(i);
    else runs.push([i]);
  }
  return runs
    .map((r) => (r.length >= 3 ? `${DAYS[r[0]]} – ${DAYS[r[r.length - 1]]}` : r.map((i) => DAYS[i]).join(', ')))
    .join(', ');
}
export const daysSchema = (days: readonly Day[]): string => days.map((d) => DAY_SCHEMA[d]).join(',');

// ---- times ----
const period = (h: number): string => (h < 5 ? 'রাত' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 18 ? 'বিকাল' : h < 20 ? 'সন্ধ্যা' : 'রাত');
function clock(t: string): { p: string; text: string } {
  const [h, m] = t.split(':').map(Number);
  const h12 = h % 12 || 12;
  return { p: period(h), text: bn(h12) + (m ? ':' + bn(String(m).padStart(2, '0')) : '') + 'টা' };
}
/** '12:00','14:00' -> 'দুপুর ১২টা – ২টা'; '17:00','20:00' -> 'বিকাল ৫টা – রাত ৮টা' */
export function timeRange(start: string, end: string): string {
  const a = clock(start), b = clock(end);
  return `${a.p} ${a.text} – ${a.p === b.p ? '' : b.p + ' '}${b.text}`;
}

// ---- dates ----
const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
/** Date -> '৫ অক্টোবর ২০২৬' (read in UTC so the YAML date never shifts by a day) */
export const bnDate = (d: Date): string => `${bn(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${bn(d.getUTCFullYear())}`;
export const bnMonth = (d: Date): string => `${MONTHS[d.getUTCMonth()]} ${bn(d.getUTCFullYear())}`;
export const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Same input always gives the same small number: used to pick a stand-in avatar. */
export function hashIndex(s: string, n: number): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h % n;
}
