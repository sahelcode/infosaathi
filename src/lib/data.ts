// Reading the data files, with drafts left out of the published site.
import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_DRAFTS } from './site';

export type Doctor = CollectionEntry<'doctors'>;
export type Hospital = CollectionEntry<'hospitals'>;
export type University = CollectionEntry<'universities'>;
export type Institution = CollectionEntry<'institutions'>;
export type Place = CollectionEntry<'places'>;
export type HotelEntry = CollectionEntry<'hotels'>;
export type Scholarship = CollectionEntry<'scholarships'>;
export type Job = CollectionEntry<'jobs'>;
export type AiTool = CollectionEntry<'aiTools'>;
export type Service = CollectionEntry<'services'>;

const visible = (e: { data: { draft: boolean } }) => SHOW_DRAFTS || !e.data.draft;
const byName = (a: { data: { name: string } }, b: { data: { name: string } }) => a.data.name.localeCompare(b.data.name, 'bn');

export async function getDoctors(): Promise<Doctor[]> {
  const doctors = (await getCollection('doctors', visible)).sort(byName);
  // Stop the build with a clear message if a chamber names a hospital file that does not exist.
  const ids = new Set((await getCollection('hospitals')).map((h) => h.id));
  for (const d of doctors)
    for (const c of d.data.chambers)
      if (c.hospital && !ids.has(c.hospital.id))
        throw new Error(`ডাক্তারের ফাইল "${d.id}.yaml": hospital: ${c.hospital.id} নামে কোনো হাসপাতালের ফাইল নেই। src/content/hospitals/-এ ফাইলের নাম মিলিয়ে দেখুন।`);
  // One old Blogger link can lead to only one new page.
  const seen = new Map<string, string>();
  for (const d of await getCollection('doctors'))
    for (const u of d.data.old_urls) {
      if (seen.has(u)) throw new Error(`পুরনো লিংক ${u} দুটো ফাইলে আছে: "${seen.get(u)}.yaml" ও "${d.id}.yaml"। একটা থেকে মুছুন।`);
      seen.set(u, d.id);
    }
  return doctors;
}
export const getHospitals = async (): Promise<Hospital[]> => (await getCollection('hospitals', visible)).sort(byName);

export const getUniversities = async (): Promise<University[]> => (await getCollection('universities', visible)).sort((a, b) => a.data.name.localeCompare(b.data.name));

export const getInstitutions = async (): Promise<Institution[]> => (await getCollection('institutions', visible)).sort((a, b) => a.data.name.localeCompare(b.data.name));
/** college row and /college/ pages: colleges and cadet colleges; school row and /school/: schools and school-and-colleges */
export const instSection = (i: Institution): 'college' | 'school' | 'madrasa' =>
  i.data.kind === 'madrasa' ? 'madrasa' : i.data.kind === 'college' || i.data.kind === 'cadet' ? 'college' : 'school';

export const doctorUrl = (d: Doctor) => `/doctor/${d.data.city}/${d.id}/`;
export const hospitalUrl = (h: Hospital) => `/hospital/${h.data.city}/${h.id}/`;
export const institutionUrl = (i: Institution) => `/${instSection(i)}/${i.data.city}/${i.id}/`;
export const getPlaces = async (): Promise<Place[]> => (await getCollection('places', visible)).sort(byName);
export const placeUrl = (p: Place) => `/place/${p.data.city}/${p.id}/`;
export const getHotels = async (): Promise<HotelEntry[]> => (await getCollection('hotels', visible)).sort(byName);
export const hotelUrl = (h: HotelEntry) => `/hotel/${h.data.city}/${h.id}/`;
export const getScholarships = async (): Promise<Scholarship[]> => (await getCollection('scholarships', visible)).sort((a, b) => (a.data.close?.getTime() ?? 9e15) - (b.data.close?.getTime() ?? 9e15));
export const getJobs = async (): Promise<Job[]> => (await getCollection('jobs', visible)).sort((a, b) => a.data.close.getTime() - b.data.close.getTime());
export const getAiTools = async (): Promise<AiTool[]> => (await getCollection('aiTools', visible)).sort((a, b) => a.data.name.localeCompare(b.data.name));
export const getServices = async (): Promise<Service[]> => (await getCollection('services', visible)).sort((a, b) => a.data.name.localeCompare(b.data.name, 'bn'));
export const scholarshipUrl = (x: Scholarship) => `/scholarship/${x.id}/`;
export const jobUrl = (x: Job) => `/job/${x.id}/`;
export const aiToolUrl = (x: AiTool) => `/ai-tool/${x.id}/`;
export const serviceUrl = (x: Service) => `/service/${x.id}/`;
/** true once the deadline day (UTC+6) has passed; decided at build time, the page also checks again in the browser */
export const isClosed = (close?: Date) => !!close && close.getTime() + 18 * 3600 * 1000 - 1000 < Date.now();
export const universityUrl = (u: University) => `/university/${u.data.city}/${u.id}/`;

/** Doctors who sit in a chamber at this hospital. */
export const doctorsAt = (doctors: Doctor[], hospitalId: string) =>
  doctors.filter((d) => d.data.chambers.some((c) => c.hospital?.id === hospitalId));

export const getNews = async () => (await getCollection('news', visible)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
export const getRankings = async () => (await getCollection('rankings', visible)).sort((a, b) => b.data.year - a.data.year);
