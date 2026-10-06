// Reading the data files, with drafts left out of the published site.
import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_DRAFTS } from './site';

export type Doctor = CollectionEntry<'doctors'>;
export type Hospital = CollectionEntry<'hospitals'>;

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

export const doctorUrl = (d: Doctor) => `/doctor/${d.data.city}/${d.id}/`;
export const hospitalUrl = (h: Hospital) => `/hospital/${h.data.city}/${h.id}/`;

/** Doctors who sit in a chamber at this hospital. */
export const doctorsAt = (doctors: Doctor[], hospitalId: string) =>
  doctors.filter((d) => d.data.chambers.some((c) => c.hospital?.id === hospitalId));
