// Homepage. The design is the finished prototype (src/partials/home.html) exactly as it was;
// only the doctor and hospital rows are filled from the published data files at build time.
import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import home from '../partials/home.html?raw';
import { getDoctors, getHospitals, getUniversities, getInstitutions, doctorUrl, hospitalUrl, universityUrl, institutionUrl, instSection, doctorsAt } from '../lib/data';
import { CITIES } from '../lib/taxonomy';
import { SPECIALTIES } from '../lib/taxonomy';
import { bn } from '../lib/format';

const swap = (src: string, from: string, to: string) => {
  if (!src.includes(from)) throw new Error(`হোমপেজের টেমপ্লেটে এই অংশ পাওয়া যায়নি: ${from.slice(0, 60)}`);
  return src.replace(from, to);
};
// Replace a whole `const name = [ ... ];` block.
const swapArray = (src: string, name: string, value: unknown) => {
  const start = src.indexOf(`const ${name} = [`);
  const end = src.indexOf('];', start);
  if (start < 0 || end < 0) throw new Error(`হোমপেজে ${name} তালিকা পাওয়া যায়নি`);
  return src.slice(0, start) + `const ${name} = ${JSON.stringify(value)};` + src.slice(end + 2);
};

export const GET: APIRoute = async () => {
  const doctors = await getDoctors();
  const hospitals = await getHospitals();
  const placeName = new Map(hospitals.map((h) => [h.id, h.data.short ?? h.data.name]));

  // Newest checks first, so the row always shows fresh, verified profiles.
  const docRows = await Promise.all(
    [...doctors]
      .sort((a, b) => b.data.verified.getTime() - a.data.verified.getTime())
      .slice(0, 8)
      .map(async (d, i) => {
        const c = d.data.chambers[0];
        return {
          name: d.data.name,
          specialty: d.data.title ?? SPECIALTIES[d.data.specialty].bn,
          degrees: d.data.degrees.join(', '),
          hospital: c.name ?? placeName.get(c.hospital!.id) ?? '',
          t: i,
          photo: d.data.photo ? (await getImage({ src: d.data.photo, width: 160, height: 160, format: 'webp' })).src : '',
          url: doctorUrl(d),
        };
      }),
  );
  const hospRows = hospitals.slice(0, 8).map((h, i) => ({
    name: h.data.name,
    sub: h.data.address,
    tags: [h.data.beds && `${bn(h.data.beds)} শয্যা`, `${bn(doctorsAt(doctors, h.id).length)} জন ডাক্তার`, h.data.emergency_24h && '২৪/৭ জরুরি'].filter(Boolean),
    t: i,
    url: hospitalUrl(h),
  }));

  // Bangladesh first: public universities, then private, newest checks first within each
  const unis = (await getUniversities()).sort((a, b) => (a.data.type === b.data.type ? 0 : a.data.type === 'সরকারি' ? -1 : 1));
  const uniRows = unis.slice(0, 8).map((u, i) => ({
    name: u.data.name,
    sub: `${CITIES[u.data.city].bn}, বাংলাদেশ`,
    tags: [u.data.type, `${u.data.type} বিশ্ববিদ্যালয়`],
    t: i % 5,
    est: u.data.est,
    mono: (u.data.short ?? u.data.name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('')).slice(0, 4),
    url: universityUrl(u),
  }));

  // colleges and schools: government first
  const inst = (await getInstitutions()).sort((a, b) => (a.data.type === b.data.type ? 0 : a.data.type === 'সরকারি' ? -1 : 1));
  const instRow = (section: 'college' | 'school') =>
    inst.filter((i) => instSection(i) === section).slice(0, 8).map((i) => ({
      name: i.data.name_bn,
      loc: CITIES[i.data.city].bn,
      type: i.data.type,
      est: i.data.est ?? '',
      tags: [...i.data.levels.slice(0, 2), ...(i.data.eiin ? [`EIIN ${bn(i.data.eiin)}`] : [])].slice(0, 3),
      url: institutionUrl(i),
    }));

  let html = swapArray(home, 'doctorNames', docRows);
  html = swapArray(html, 'colleges', instRow('college'));
  html = swapArray(html, 'schools', instRow('school'));
  html = swap(html, "put('collegeRow', colleges.map((c,i)=>`\n    <div class=\"org-card ix-card\">", "put('collegeRow', colleges.map((c,i)=>`\n    <a class=\"org-card ix-card\" href=\"${c.url}\" style=\"color:inherit;text-decoration:none\">");
  html = swap(html, "put('schoolRow', schools.map((c,i)=>`\n    <div class=\"org-card ix-card\">", "put('schoolRow', schools.map((c,i)=>`\n    <a class=\"org-card ix-card\" href=\"${c.url}\" style=\"color:inherit;text-decoration:none\">");
  html = swap(html, "${tags(c.tags)}</div>\n    </div>`).join(''));", "${tags(c.tags)}</div>\n    </a>`).join(''));");
  html = swap(html, "${tags(c.tags)}</div>\n    </div>`).join(''));", "${tags(c.tags)}</div>\n    </a>`).join(''));");
  html = html.replace('<span class="ix-badge">Est. ${c.est}</span>', '${c.est ? `<span class="ix-badge">Est. ${c.est}</span>` : ""}');
  html = swap(html, '<span class="eyebrow">Colleges</span><a href="#" class="see-all">', '<span class="eyebrow">Colleges</span><a href="/colleges/" class="see-all">');
  html = swap(html, '<span class="eyebrow">Schools</span><a href="#" class="see-all">', '<span class="eyebrow">Schools</span><a href="/schools/" class="see-all">');
  html = swapArray(html, 'uniNames', uniRows);
  html = swap(html, `uniNames.map(u=>\`
  <div class="org-card uni-card">`, `uniNames.map(u=>\`
  <a class="org-card uni-card" href="\${u.url}" style="color:inherit;text-decoration:none">`);
  html = swap(html, `<span class="uni-est">Est. \${u.est}</span></div></div>
  </div>
\`).join('');`, `<span class="uni-est">Est. \${u.est}</span></div></div>
  </a>
\`).join('');`);
  html = swap(html, "<div class=\"org-logo \${tint(u.t)}\">\${u.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>", "<div class=\"org-logo \${tint(u.t)}\">\${u.mono}</div>");
  html = swap(html, '<span class="eyebrow">Universities</span><a href="#" class="see-all">', '<span class="eyebrow">Universities</span><a href="/universities/" class="see-all">');
  html = swapArray(html, 'hospitalNames', hospRows);
  // cards become links to the real pages
  html = swap(html, '<a href="#" class="p-view">প্রোফাইল দেখুন</a>', '<a href="${d.url}" class="p-view">প্রোফাইল দেখুন</a>');
  html = swap(
    html,
    `<div class="org-tags"><span>\${h.beds}</span><span>\${h.doctors}</span><span class="hosp-rating">★ \${h.rating}</span></div></div>
  </div>`,
    `<div class="org-tags">\${h.tags.map(x=>\`<span>\${x}</span>\`).join('')}</div><a href="\${h.url}" class="p-view">বিস্তারিত দেখুন</a></div>
  </div>`,
  );
  // "See all" in the two section heads
  html = swap(html, '<span class="eyebrow">Doctors</span><a href="#" class="see-all">', '<span class="eyebrow">Doctors</span><a href="/doctors/" class="see-all">');
  html = swap(html, '<span class="eyebrow">Hospitals</span><a href="#" class="see-all">', '<span class="eyebrow">Hospitals</span><a href="/hospitals/" class="see-all">');

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
