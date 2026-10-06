// The shape every data file must follow. If a file breaks a rule, the build stops and names the file,
// the field and the reason, so a mistake never reaches the live site.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CITIES, SPECIALTIES, FACILITIES, TEST_GROUPS, keysOf } from './lib/taxonomy';
import { DAYS } from './lib/format';

// Files whose name starts with _ (like _template.yaml) are guides, never published.
const files = (dir: string) => glob({ pattern: '**/[^_]*.yaml', base: `./src/content/${dir}` });

// A Bangladeshi number written without spaces. YAML drops the leading 0 of an unquoted number,
// so a number that arrives as digits gets its 0 back here.
const phone = z.preprocess(
  (v) => (typeof v === 'number' ? '0' + String(v) : typeof v === 'string' ? v.replace(/[\s-]/g, '') : v),
  z.string().regex(/^0\d{9,10}$/, 'ফোন নম্বর ০ দিয়ে শুরু হবে, মোট ১০ বা ১১ সংখ্যা (যেমন 01712345678)'),
);
// 24-hour time like 09:30 or 17:00
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'সময় ২৪ ঘণ্টার হিসাবে লিখুন, যেমন 09:30 বা 17:00');
const day = z.enum(DAYS, 'দিনের নাম হবে: শনি, রবি, সোম, মঙ্গল, বুধ, বৃহস্পতি, শুক্র');
const days = z.preprocess((v) => (v === 'প্রতিদিন' ? [...DAYS] : v), z.array(day).min(1, 'অন্তত একটি দিন দিন'));
const date = z.coerce.date();
const city = z.enum(keysOf(CITIES), 'শহরের নাম src/lib/taxonomy.ts-এর তালিকা থেকে দিন (যেমন sylhet)');
const extraFaq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

const doctors = defineCollection({
  loader: files('doctors'),
  schema: ({ image }) =>
    z
      .object({
        draft: z.boolean().default(false), // true = not published yet (only visible in preview)
        name: z.string().min(3),
        name_en: z.string().min(3),
        specialty: z.enum(keysOf(SPECIALTIES), 'বিশেষজ্ঞতা src/lib/taxonomy.ts-এর তালিকা থেকে দিন (যেমন gynecology)'),
        title: z.string().optional(), // full wording from the doctor's card, e.g. "প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ ও সার্জন"
        degrees: z.array(z.string()).min(1),
        designation: z.string().optional(),
        bmdc: z.string().optional(),
        city,
        photo: image().optional(),
        banner: image().optional(), // chamber card / banner from the hospital
        banner_month: date.optional(),
        verified: date, // the day you checked this information yourself
        notice: z.object({ text: z.string(), from: date, to: date }).optional(),
        treats: z.array(z.string()).default([]),
        about: z.string().optional(),
        chambers: z
          .array(
            z
              .object({
                hospital: reference('hospitals').optional(), // the hospital's file name, if it has a page here
                name: z.string().optional(), // only when the place has no hospital page
                address: z.string().optional(),
                room: z.string().optional(),
                days,
                start: time,
                end: time,
                fee: z.object({ new: z.number().optional(), old: z.number().optional(), report: z.number().optional() }).optional(),
                serials: z
                  .array(z.object({ label: z.string().default('সিরিয়াল'), number: phone, note: z.string().optional() }))
                  .min(1, 'অন্তত একটি সিরিয়াল নম্বর দিন'),
                map: z.url().optional(),
              })
              .refine((c) => c.hospital || (c.name && c.address), 'চেম্বারে hospital দিন, অথবা name ও address দুটোই দিন')
              .refine((c) => c.start < c.end, 'শেষের সময় শুরুর সময়ের পরে হতে হবে'),
          )
          .min(1, 'অন্তত একটি চেম্বার দিন'),
        faq: extraFaq,
      })
      .refine((d) => !d.notice || d.notice.from <= d.notice.to, 'নোটিশের from তারিখ to-এর আগে হতে হবে'),
});

const hospitals = defineCollection({
  loader: files('hospitals'),
  schema: ({ image }) =>
    z.object({
      draft: z.boolean().default(false),
      name: z.string().min(3),
      name_en: z.string().min(3),
      short: z.string().optional(), // short name for buttons and lists
      type: z.enum(['সরকারি', 'বেসরকারি'], 'type হবে সরকারি বা বেসরকারি'),
      city,
      address: z.string(),
      map: z.url().optional(),
      photo: image().optional(),
      certification: z.string().optional(), // e.g. ISO 9001:2015
      emergency_24h: z.boolean().default(false),
      visiting_hours: z.string().optional(),
      beds: z.number().int().positive().optional(),
      icu_beds: z.number().int().positive().optional(),
      numbers: z
        .array(
          z.object({
            label: z.string(),
            number: phone,
            note: z.string().optional(),
            kind: z.enum(['emergency', 'serial', 'ambulance', 'other']).default('other'),
          }),
        )
        .min(1, 'অন্তত একটি নম্বর দিন'),
      facilities: z.array(z.enum(keysOf(FACILITIES), 'সুবিধার নাম src/lib/taxonomy.ts-এর তালিকা থেকে দিন')).default([]),
      tests: z
        .array(z.object({ group: z.enum(keysOf(TEST_GROUPS)), name: z.string(), name_en: z.string().optional(), price: z.number().positive() }))
        .default([]),
      tests_updated: date.optional(),
      verified: date,
      faq: extraFaq,
    }),
});

export const collections = { doctors, hospitals };
