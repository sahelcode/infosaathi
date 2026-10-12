// Search index, built with the site. One short record per page people may want to find.
// t = title, s = subtitle, u = url, k = kind label, x = extra words to match (names in both languages, specialty, city ...).
import type { APIRoute } from 'astro';
import { getDoctors, getHospitals, getUniversities, getInstitutions, getHotels, getPlaces, getScholarships, getJobs, getBloodOrgs,
  doctorUrl, hospitalUrl, universityUrl, institutionUrl, hotelUrl, placeUrl, scholarshipUrl, jobUrl, instSection } from '../lib/data';
import { CITIES, SPECIALTIES } from '../lib/taxonomy';
import { districtBn } from '../lib/blood';

type Rec = { t: string; s: string; u: string; k: string; x: string };
const cityOf = (c: string) => CITIES[c as keyof typeof CITIES];
const INST_K: Record<string, string> = { college: 'কলেজ', school: 'স্কুল', madrasa: 'মাদ্রাসা' };

export const GET: APIRoute = async () => {
  const out: Rec[] = [];
  const hospitals = await getHospitals();
  const hname = new Map(hospitals.map((h) => [h.id, h.data.short ?? h.data.name]));
  for (const d of await getDoctors()) {
    const sp = SPECIALTIES[d.data.specialty];
    const c = cityOf(d.data.city);
    const places = d.data.chambers.map((ch) => ch.name ?? (ch.hospital ? hname.get(ch.hospital.id) : '') ?? '').filter(Boolean);
    out.push({ t: d.data.name, s: `${d.data.title ?? sp.bn} · ${c.bn}`, u: doctorUrl(d), k: 'ডাক্তার',
      x: [d.data.name_en, sp.bn, sp.en, d.data.title, d.data.degrees.join(' '), c.bn, c.en, d.data.bmdc, ...(d.data.aliases ?? []), ...places].filter(Boolean).join(' ') });
  }
  for (const h of hospitals) out.push({ t: h.data.name, s: `${cityOf(h.data.city).bn} · ${h.data.type}`, u: hospitalUrl(h), k: 'হাসপাতাল', x: [h.data.name_en, h.data.short, cityOf(h.data.city).en, h.data.address].filter(Boolean).join(' ') });
  for (const u of await getUniversities()) out.push({ t: u.data.name_bn, s: `${u.data.name} · ${cityOf(u.data.city).bn}`, u: universityUrl(u), k: 'বিশ্ববিদ্যালয়', x: [u.data.name, u.data.short, cityOf(u.data.city).en].filter(Boolean).join(' ') });
  for (const i of await getInstitutions()) out.push({ t: i.data.name_bn, s: `${i.data.name} · ${cityOf(i.data.city).bn}`, u: institutionUrl(i), k: INST_K[instSection(i)] ?? 'প্রতিষ্ঠান', x: [i.data.name, i.data.short, cityOf(i.data.city).en].filter(Boolean).join(' ') });
  for (const h of await getHotels()) out.push({ t: h.data.name_bn, s: `${h.data.name} · ${cityOf(h.data.city).bn}`, u: hotelUrl(h), k: 'হোটেল', x: [h.data.name, cityOf(h.data.city).en].join(' ') });
  for (const p of await getPlaces()) out.push({ t: p.data.name, s: `${p.data.area} · ${cityOf(p.data.city).bn}`, u: placeUrl(p), k: 'দর্শনীয় স্থান', x: [p.data.name_en, cityOf(p.data.city).en].filter(Boolean).join(' ') });
  for (const s of await getScholarships()) out.push({ t: s.data.name_bn ?? s.data.name, s: `${s.data.provider} · ${s.data.country}`, u: scholarshipUrl(s), k: 'বৃত্তি', x: [s.data.name, s.data.provider, s.data.country].join(' ') });
  for (const j of await getJobs()) out.push({ t: j.data.title, s: j.data.org, u: jobUrl(j), k: 'চাকরি', x: j.data.org });
  for (const o of await getBloodOrgs()) out.push({ t: o.data.name, s: `${o.data.upazila} · ${districtBn(o.data.district)}`, u: '/blood/', k: 'রক্তদাতা সংস্থা', x: [o.data.upazila, districtBn(o.data.district), 'রক্ত blood'].join(' ') });
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
