// The shape every data file must follow. If a file breaks a rule, the build stops and names the file,
// the field and the reason, so a mistake never reaches the live site.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CITIES, SPECIALTIES, FACILITIES, HOTEL_FACILITIES, TEST_GROUPS, keysOf } from './lib/taxonomy';
import { DAYS } from './lib/format';

// Files whose name starts with _ (like _template.yaml) are guides, never published.
const files = (dir: string) => glob({ pattern: '**/[^_]*.yaml', base: `./src/content/${dir}` });

// A Bangladeshi number written without spaces. YAML drops the leading 0 of an unquoted number,
// so a number that arrives as digits gets its 0 back here.
const phone = z.preprocess(
  (v) => (typeof v === 'number' ? '0' + String(v) : typeof v === 'string' ? v.replace(/[\s-]/g, '') : v),
  z.string().regex(/^0\d{8,10}$/, 'ফোন নম্বর ০ দিয়ে শুরু হবে, মোট ৯ থেকে ১১ সংখ্যা (যেমন 01712345678 বা 052163347)'),
);
// 24-hour time like 09:30 or 17:00
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'সময় ২৪ ঘণ্টার হিসাবে লিখুন, যেমন 09:30 বা 17:00');
const day = z.enum(DAYS, 'দিনের নাম হবে: শনি, রবি, সোম, মঙ্গল, বুধ, বৃহস্পতি, শুক্র');
const days = z.preprocess((v) => (v === 'প্রতিদিন' ? [...DAYS] : v), z.array(day).min(1, 'অন্তত একটি দিন দিন'));
const date = z.coerce.date();
const city = z.enum(keysOf(CITIES), 'শহরের নাম src/lib/taxonomy.ts-এর তালিকা থেকে দিন (যেমন sylhet)');
// phone = you called and checked; official = taken from the institution's own website or notice
const verifiedBy = z.enum(['phone', 'official'], 'verified_by হবে phone অথবা official').default('phone');
const sources = z.array(z.object({ title: z.string(), url: z.url() })).default([]);
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
        verified_by: verifiedBy,
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
                days: days.optional(), // may be empty only while draft: true
                start: time.optional(),
                end: time.optional(),
                fee: z.object({ new: z.number().optional(), old: z.number().optional(), report: z.number().optional() }).optional(),
                serials: z
                  .array(z.object({ label: z.string().default('সিরিয়াল'), number: phone, note: z.string().optional() }))
                  .default([]),
                map: z.url().optional(),
              })
              .refine((c) => c.hospital || (c.name && c.address), 'চেম্বারে hospital দিন, অথবা name ও address দুটোই দিন')
              .refine((c) => !c.start || !c.end || c.start < c.end, 'শেষের সময় শুরুর সময়ের পরে হতে হবে'),
          )
          .min(1, 'অন্তত একটি চেম্বার দিন'),
        faq: extraFaq,
        old_urls: z.array(z.string().startsWith('/')).default([]), // old Blogger links that should lead here
      })
      .refine(
        (d) => d.draft || d.chambers.every((c) => c.days && c.start && c.end && c.serials.length > 0),
        'প্রকাশের আগে প্রতিটি চেম্বারে days, start, end আর অন্তত একটি সিরিয়াল নম্বর দিন (অথবা draft: true রাখুন)',
      )
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
      verified_by: verifiedBy,
      sources: sources,
      faq: extraFaq,
    })
    .refine((h) => h.draft || h.verified_by === 'phone' || h.sources.length > 0, 'official তথ্যের জন্য অন্তত একটি sources দিন'),
});

const universities = defineCollection({
  loader: files('universities'),
  schema: ({ image }) =>
    z
      .object({
        draft: z.boolean().default(false),
        name: z.string().min(3), // English name, as the university writes it
        name_bn: z.string().min(3),
        short: z.string().optional(), // e.g. SUST, NSU
        type: z.enum(['সরকারি', 'বেসরকারি'], 'type হবে সরকারি বা বেসরকারি'),
        est: z.number().int().min(1800).max(2100),
        city,
        address: z.string(),
        web: z.url(),
        apply_url: z.url().optional(),
        ugc: z.boolean().default(true), // listed by the University Grants Commission
        logo: image().optional(),
        photo: image().optional(),
        campus: z.string().optional(), // e.g. "রাগিবনগর, ৬২ একর স্থায়ী ক্যাম্পাস"
        students: z.string().optional(), // e.g. "১০,০০০+"
        teachers: z.string().optional(),
        verified: date,
        verified_by: verifiedBy,
        numbers: z.array(z.object({ label: z.string(), number: phone, note: z.string().optional() })).min(1, 'অন্তত একটি নম্বর দিন'),
        emails: z.array(z.object({ label: z.string(), email: z.email() })).default([]),
        admission: z
          .object({
            intake: z.string(), // e.g. "স্প্রিং ২০২৭" or "২০২৬–২৭ শিক্ষাবর্ষ"
            open: date.optional(),
            close: date.optional(),
            requirement: z.string(),
            exam: z.string().optional(),
            app_fee: z.number().positive().optional(),
            classes_start: z.string().optional(),
            steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
            documents: z.array(z.string()).default([]),
          })
          .refine((a) => !a.open || !a.close || a.open <= a.close, 'admission.open তারিখ close-এর আগে হতে হবে')
          .optional(),
        programs: z
          .array(
            z.object({
              faculty: z.string(),
              name: z.string(), // Bangla
              name_en: z.string(),
              years: z.number().positive().optional(),
              credits: z.number().positive().optional(),
              total_cost: z.number().positive().optional(), // whole programme, taka
            }),
          )
          .default([]),
        cost_note: z.string().optional(),
        waivers: z.array(z.object({ condition: z.string(), amount: z.string() })).default([]),
        about: z.string().optional(),
        good: z.array(z.string()).default([]),
        think: z.array(z.string()).default([]),
        faq: extraFaq,
        sources: sources,
        old_urls: z.array(z.string().startsWith('/')).default([]),
      })
      .refine((u) => u.draft || u.verified_by === 'phone' || u.sources.length > 0, 'official তথ্যের জন্য অন্তত একটি sources দিন'),
});

// Colleges, cadet colleges, schools and school-and-colleges share one shape; `kind` decides the page and the homepage row.
const institutions = defineCollection({
  loader: files('institutions'),
  schema: ({ image }) =>
    z
      .object({
        draft: z.boolean().default(false),
        kind: z.enum(['college', 'cadet', 'school', 'school_college', 'madrasa'], 'kind হবে college, cadet, school, school_college বা madrasa'),
        name: z.string().min(3), // English
        name_bn: z.string().min(3),
        short: z.string().optional(),
        type: z.enum(['সরকারি', 'বেসরকারি'], 'type হবে সরকারি বা বেসরকারি'),
        est: z.number().int().min(1700).max(2100).optional(),
        city,
        address: z.string(),
        web: z.url().optional(),
        eiin: z.string().regex(/^\d{5,7}$/, 'EIIN শুধু সংখ্যা').optional(),
        board: z.string().optional(), // e.g. সিলেট শিক্ষা বোর্ড
        affiliation: z.string().optional(), // e.g. জাতীয় বিশ্ববিদ্যালয়
        gender: z.enum(['বালক', 'বালিকা', 'সহশিক্ষা']).optional(),
        levels: z.array(z.string()).default([]), // e.g. [HSC, অনার্স, মাস্টার্স] or [৩য় – ১০ম শ্রেণি]
        shifts: z.string().optional(), // e.g. প্রভাতি ও দিবা
        versions: z.string().optional(), // e.g. বাংলা ও ইংরেজি ভার্সন
        logo: image().optional(),
        photo: image().optional(),
        campus: z.string().optional(),
        students: z.string().optional(),
        teachers: z.string().optional(),
        verified: date,
        verified_by: verifiedBy,
        numbers: z.array(z.object({ label: z.string(), number: phone, note: z.string().optional() })).min(1, 'অন্তত একটি নম্বর দিন'),
        emails: z.array(z.object({ label: z.string(), email: z.email() })).default([]),
        admission: z
          .object({
            intake: z.string(),
            open: date.optional(),
            close: date.optional(),
            requirement: z.string(),
            exam: z.string().optional(),
            app_fee: z.number().positive().optional(),
            apply_url: z.url().optional(),
            steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
            documents: z.array(z.string()).default([]),
          })
          .refine((a) => !a.open || !a.close || a.open <= a.close, 'admission.open তারিখ close-এর আগে হতে হবে')
          .optional(),
        seats: z.object({ title: z.string(), head: z.array(z.string()).min(2), rows: z.array(z.array(z.string())).min(1) }).optional(),
        subjects: z
          .array(z.object({ faculty: z.string(), name: z.string(), name_en: z.string().optional(), seats: z.number().optional(), masters: z.boolean().optional() }))
          .default([]),
        results: z
          .array(z.object({ exam: z.string(), year: z.number().int(), pass_rate: z.number().min(0).max(100), examinees: z.number().optional(), gpa5: z.number().optional() }))
          .default([]),
        fees: z.array(z.object({ item: z.string(), amount: z.string() })).default([]),
        fee_note: z.string().optional(),
        facilities: z.array(z.string()).default([]),
        alumni: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
        about: z.string().optional(),
        good: z.array(z.string()).default([]),
        think: z.array(z.string()).default([]),
        faq: extraFaq,
        sources: sources,
        old_urls: z.array(z.string().startsWith('/')).default([]),
      })
      .refine((u) => u.draft || u.verified_by === 'phone' || u.sources.length > 0, 'official তথ্যের জন্য অন্তত একটি sources দিন'),
});

// Famous place. Photos come first on the page (2-3 animated, names underneath); without photos a drawn scene of `kind` is shown.
// visited = you went there yourself; sources = taken from the district portal and travel guides (sources required).
const PLACE_KINDS = ['river', 'swamp', 'beach', 'tea', 'clouds', 'waterfall', 'forest', 'heritage', 'lake'] as const;
const places = defineCollection({
  loader: files('places'),
  schema: ({ image }) =>
    z
      .object({
        draft: z.boolean().default(false),
        name: z.string().min(2), // Bangla
        name_en: z.string().min(2),
        city, // the district, for /places/<city>/
        area: z.string(), // e.g. গোয়াইনঘাট, সিলেট
        kind: z.enum(PLACE_KINDS, `kind হবে: ${PLACE_KINDS.join(', ')}`),
        tags: z.array(z.string()).max(3).default([]), // short, e.g. [নদী ও পাহাড়, একদিনের ভ্রমণ]
        verified: date,
        verified_by: z.enum(['visited', 'sources'], 'verified_by হবে visited অথবা sources').default('sources'),
        map_query: z.string(), // what to search on Google Maps, e.g. "Jaflong Zero Point"
        geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
        photos: z.array(z.object({ src: image(), caption: z.string(), sub: z.string().optional(), label: z.string().optional() })).max(5).default([]),
        intro: z.string(), // 1-2 sentences
        glance: z.object({
          from: z.string(), // e.g. সিলেট শহর থেকে
          distance: z.string(), // e.g. প্রায় ৬০ কিমি
          time: z.string(), // e.g. ২ – ২.৫ ঘণ্টা
          fee: z.string(), // e.g. নেই, or ৳৫০
          best: z.string(), // e.g. জুন – নভেম্বর
        }),
        spots: z.array(z.object({ title: z.string(), text: z.string(), meta: z.string().optional(), photo: image().optional() })).min(1, 'অন্তত একটি spots দিন'),
        routes: z
          .array(
            z.object({
              from: z.string(),
              rows: z.array(z.object({ mode: z.enum(['bus', 'car', 'train', 'boat', 'walk', 'plane']), name: z.string(), text: z.string(), fare: z.string() })).min(1),
            }),
          )
          .min(1),
        months: z.array(z.number().int().min(1).max(3)).length(12, 'months-এ ১২টি সংখ্যা দিন (জানুয়ারি থেকে ডিসেম্বর; ৩ সেরা, ২ ভালো, ১ মোটামুটি)'),
        seasons: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
        cost_from: z.string().optional(), // e.g. সিলেট থেকে, জনপ্রতি
        cost: z.array(z.object({ item: z.string(), amount: z.string() })).default([]),
        cost_total: z.string().optional(),
        tips: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
        stay: z.string().optional(),
        nearby: z.array(reference('places')).default([]),
        faq: extraFaq,
        sources: sources,
        old_urls: z.array(z.string().startsWith('/')).default([]),
      })
      .refine((p) => p.draft || p.verified_by === 'visited' || p.sources.length > 0, 'sources থেকে নেওয়া তথ্যের জন্য অন্তত একটি sources দিন'),
});

// Hotel / resort. Rates are the hotel's published rack rates (no ratings until real reviews exist).
const hotels = defineCollection({
  loader: files('hotels'),
  schema: ({ image }) =>
    z
      .object({
        draft: z.boolean().default(false),
        kind: z.enum(['hotel', 'resort'], 'kind হবে hotel অথবা resort').default('hotel'),
        name: z.string().min(3), // English
        name_bn: z.string().min(3),
        short: z.string().optional(),
        city,
        address: z.string(),
        stars: z.number().int().min(1).max(5).optional(), // only if the hotel itself states it
        web: z.url().optional(),
        map_query: z.string(),
        geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
        photos: z.array(z.object({ src: image(), caption: z.string(), sub: z.string().optional(), label: z.string().optional() })).max(5).default([]),
        logo: image().optional(),
        verified: date,
        verified_by: z.enum(['phone', 'official'], 'verified_by হবে phone অথবা official').default('phone'),
        numbers: z.array(z.object({ label: z.string(), number: phone, note: z.string().optional() })).min(1, 'অন্তত একটি ফোন নম্বর দিন'),
        emails: z.array(z.object({ label: z.string(), email: z.email() })).default([]),
        rooms: z.array(z.object({ name: z.string(), name_en: z.string().optional(), size: z.string().optional(), bed: z.string().optional(), price: z.number().positive() })).default([]),
        price_plus: z.boolean().default(true), // true = prices are before VAT and service charge (shown as ++)
        price_note: z.string().optional(),
        amenities: z.array(z.string()).default([]), // what every room has
        facilities: z.array(z.enum(keysOf(HOTEL_FACILITIES), `সুবিধা src/lib/taxonomy.ts-এর HOTEL_FACILITIES তালিকা থেকে দিন (যেমন ${Object.keys(HOTEL_FACILITIES).slice(0, 4).join(', ')})`)).default([]),
        facility_notes: z.string().optional(), // e.g. "৫টি রেস্টুরেন্ট, ১৭০ আসনের সিনেমা হল"
        rooms_total: z.number().int().positive().optional(),
        checkin: z.string().optional(), // e.g. "দুপুর ২টা থেকে"
        checkout: z.string().optional(),
        rules: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
        nearby: z.array(z.object({ name: z.string(), time: z.string().optional(), place: reference('places').optional() })).default([]), // time only if a source states it
        about: z.string().optional(),
        good: z.array(z.string()).default([]),
        think: z.array(z.string()).default([]),
        faq: extraFaq,
        sources: sources,
        old_urls: z.array(z.string().startsWith('/')).default([]),
      })
      .refine((h) => h.draft || h.verified_by === 'phone' || h.sources.length > 0, 'official তথ্যের জন্য অন্তত একটি sources দিন'),
});

export const collections = { doctors, hospitals, universities, institutions, places, hotels };
