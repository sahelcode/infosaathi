// Homepage. The design is the finished prototype (src/partials/home.html) exactly as it was;
// the rows (doctors, hospitals, universities, colleges, schools, places) are filled from the published data files at build time.
import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import home from '../partials/home.html?raw';
import { getDoctors, getHospitals, getUniversities, getInstitutions, doctorUrl, hospitalUrl, universityUrl, institutionUrl, instSection, doctorsAt, getPlaces, placeUrl, getHotels, hotelUrl, getScholarships, getJobs, getAiTools, getServices, serviceUrl, scholarshipUrl, jobUrl, aiToolUrl, isClosed, getNews, getRankings, getApps, newsUrl, isOwnNews } from '../lib/data';
import { CITIES } from '../lib/taxonomy';
import { ICONS } from '../lib/icons';
import { SPECIALTIES, HOTEL_FACILITIES } from '../lib/taxonomy';
import { ART, artKind } from '../lib/newsArt';
import { bn, bnDate } from '../lib/format';
import { CONTACT_EMAIL, WHATSAPP_LINK, ADSENSE_CLIENT, ADSENSE_SLOT, ADSENSE_SRC, ADS_LIVE } from '../lib/site';

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
  const hospRows = await Promise.all(hospitals.slice(0, 8).map(async (h, i) => ({
    name: h.data.name,
    sub: h.data.address,
    img: h.data.photo ? (await getImage({ src: h.data.photo, width: 640, format: 'webp' })).src : '',
    tags: [h.data.type, `${bn(doctorsAt(doctors, h.id).length)} জন ডাক্তার`],
    t: i,
    url: hospitalUrl(h),
  })));

  // Bangladesh first: public universities, then private, newest checks first within each
  const unis = (await getUniversities()).sort((a, b) => (a.data.type === b.data.type ? 0 : a.data.type === 'সরকারি' ? -1 : 1));
  const uniRows = await Promise.all(unis.slice(0, 8).map(async (u, i) => ({
    name: u.data.name,
    img: u.data.photo ? (await getImage({ src: u.data.photo, width: 640, format: 'webp' })).src : '',
    logo: u.data.logo ? (await getImage({ src: u.data.logo, width: 140, format: 'webp' })).src : '',
    sub: `${CITIES[u.data.city].bn}, বাংলাদেশ`,
    tags: [u.data.type, u.data.type === 'সরকারি' ? 'Public University' : 'Private University'],
    t: i % 5,
    est: u.data.est,
    mono: (u.data.short ?? u.data.name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('')).slice(0, 4),
    url: universityUrl(u),
  })));

  // colleges and schools: government first
  const inst = (await getInstitutions()).sort((a, b) => (a.data.type === b.data.type ? 0 : a.data.type === 'সরকারি' ? -1 : 1));
  const instRow = (section: 'college' | 'school') =>
    Promise.all(
      inst.filter((i) => instSection(i) === section).slice(0, 8).map(async (i) => ({
        name: i.data.name_bn,
        addr: i.data.address,
        type: i.data.type,
        est: i.data.est ?? '',
        tags: [i.data.type === 'সরকারি' ? 'Government' : 'Private', ...(i.data.est ? [`Est. ${i.data.est}`] : []), ...(i.data.eiin ? [`EIIN ${i.data.eiin}`] : [])],
        img: i.data.photo ? (await getImage({ src: i.data.photo, width: 640, format: 'webp' })).src : '',
        url: institutionUrl(i),
      })),
    );

  // famous places: the first photo if there is one, otherwise the drawn scene of its kind
  const placeRows = await Promise.all(
    (await getPlaces()).slice(0, 8).map(async (p) => ({
      name: p.data.name,
      loc: p.data.area,
      kind: p.data.kind,
      tags: p.data.tags.slice(0, 2),
      url: placeUrl(p),
      img: p.data.photos[0] ? (await getImage({ src: p.data.photos[0].src, width: 480, format: 'webp' })).src : '',
    })),
  );

  // hotels: real ones only, no ratings (there are no real reviews yet)
  const hotelRows = await Promise.all((await getHotels()).slice(0, 8).map(async (h) => ({
    img: h.data.photos[0] ? (await getImage({ src: h.data.photos[0].src, width: 480, format: 'webp' })).src : '',
    name: h.data.name,
    loc: `${h.data.address.split(',')[0]}, ${CITIES[h.data.city].bn}`,
    tags: [...(h.data.stars ? [`${h.data.stars}-star`] : []), ...h.data.facilities.slice(0, 2).map((f) => HOTEL_FACILITIES[f])].slice(0, 3),
    url: hotelUrl(h),
  })));

  // scholarships, jobs, AI tools: real entries; open ones first. Government services: links to the official portals only.
  const FUND = { full: 'সম্পূর্ণ অর্থায়িত', partial: 'আংশিক', varies: 'ভিন্ন ভিন্ন' } as const;
  const schRows = (await getScholarships()).sort((a, b) => Number(isClosed(a.data.close)) - Number(isClosed(b.data.close))).slice(0, 4).map((x, i) => ({
    name: x.data.name_bn ?? x.data.name, org: x.data.provider, amount: x.data.country, badge: FUND[x.data.funding], t: i,
    deadline: x.data.close ? (isClosed(x.data.close) ? 'আবেদন শেষ' : `শেষ ${bnDate(x.data.close)}`) : 'তারিখ ঘোষণা হয়নি', url: scholarshipUrl(x),
  }));
  const jobRows = (await getJobs()).filter((x) => !isClosed(x.data.close)).slice(0, 3).map((x, i) => ({
    title: x.data.title, company: x.data.org, loc: x.data.sector, salary: `শেষ ${bnDate(x.data.close)}`, t: i, url: jobUrl(x),
  }));
  const aiRows = (await getAiTools()).slice(0, 4).map((x, i) => ({ name: x.data.name, cat: x.data.category, desc: x.data.summary, free: x.data.free_plan ? 'ফ্রি প্ল্যান আছে' : 'পেইড', t: i, url: aiToolUrl(x) }));
  const govRows = (await getServices()).slice(0, 4).map((x, i) => ({ name: x.data.name, dept: x.data.dept, time: x.data.online ? 'অনলাইনে আবেদন' : 'সরাসরি আবেদন', url: serviceUrl(x), t: i }));

  const newsAll = (await getNews()).map((x, i) => ({ cat: x.data.cat, title: x.data.title, source: x.data.source ?? 'InfoSaathi', time: bnDate(x.data.date), url: newsUrl(x), own: isOwnNews(x), kind: artKind(x.data.cat), t: i }));
  const rk = (await getRankings())[0];
  const uniById = new Map((await getUniversities()).map((u) => [u.id, u]));
  const rankRows = rk.data.rows.slice(0, 5).map((r, i) => ({
    name: r.name_bn, sub: r.name_en, rank: r.rank, t: i, url: r.university && uniById.has(r.university.id) ? universityUrl(uniById.get(r.university.id)!) : '',
    single: /^[০-৯]+$/.test(r.rank),
  }));
  const rankInfo = { system: rk.data.system, source: rk.data.source_url, note: rk.data.note ?? '', verified: bnDate(rk.data.verified) };

  const appRows = await Promise.all((await getApps()).slice(0, 8).map(async (x, i) => ({ name: x.data.name, desc: x.data.desc, url: x.data.url, featured: x.data.featured, own: x.data.own, t: i, logo: x.data.logo ? (await getImage({ src: x.data.logo, width: 96, format: 'webp' })).src : '' })));

  let html = swapArray(home, 'doctorNames', docRows);
  html = swapArray(html, 'usefulApps', appRows);
  html = swap(html, '<span class="app-desc">${a.desc}</span>', '<span class="app-desc">${a.desc}</span>');
  html = swap(html, '</svg>Download</a>', '</svg>${a.own?\'Play Store\':\'ডাউনলোড\'}</a>');
  html = swapArray(html, 'newsData', newsAll.slice(1, 5));
  html = swap(html, 'const newsFeatureData = {', `const NEWS_ART = ${JSON.stringify(ART)};\nconst newsFeatureData = {`);
  html = swap(html, "${icon('news',44,44)}</div>\n  <div class=\"news-feature-body\">", "${NEWS_ART[newsFeatureData.kind]||icon('news',44,44)}</div>\n  <div class=\"news-feature-body\">");
  html = swap(html, '<div class="news-thumb ${tint(n.t)}">${icon(\'news\',20,20)}</div>', '<div class="news-thumb">${NEWS_ART[n.kind]||icon(\'news\',20,20)}</div>');
  html = swap(html, '.news-feature-img svg{', '.news-feature-img:has(svg.na){height:auto;aspect-ratio:16/9;}\n.news-feature-img svg.na{width:100%;height:100%;opacity:1;color:inherit;}\n.news-feature-img svg:not(.na){');
  html = swap(html, '.news-thumb svg{width:20px;height:20px;}', '.news-thumb svg{width:20px;height:20px;}\n.news-thumb svg.na{width:100%;height:100%;display:block;}\n.news-thumb:has(svg.na){background:none;overflow:hidden;padding:0;}');
  html = swapArray(html, 'rankData', rankRows);
  html = swap(html, 'const newsFeatureData = {', `const newsFeatureData = ${JSON.stringify(newsAll[0])}; const _unused = {`);
  html = swap(html, 'const rankData =', `const rankInfo = ${JSON.stringify(rankInfo)};\nconst rankData =`);
  const SEE_ALL_SVG = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  const qsShort = rk.data.system.replace(/World University Rankings/i, '').replace(/\s+/g, ' ').trim();
  html = swap(html, '<div class="section-head reveal"><span class="eyebrow">University rankings</span><h2>See who leads — by the numbers</h2><p>Independent, methodology-first rankings refreshed every quarter across research output, employability, and student satisfaction.</p></div>',
    `<div class="doc-head reveal" style="margin-bottom:6px;"><div class="doc-head-top"><span class="eyebrow">University rankings · ${qsShort}</span><a href="/rankings/" class="see-all">See All${SEE_ALL_SVG}</a></div><h2 style="font-size:28px;">Top ${rankRows.length} in Bangladesh</h2></div>`);
  html = swap(html, '<h2 style="font-size:26px;">Signal, not noise</h2>', '<h2 style="font-size:26px;">সাম্প্রতিক খবর</h2><p style="font-size:13px;color:var(--text-muted)">শিক্ষা ও স্বাস্থ্যের খবর, সূত্রসহ। কিছু শিরোনাম মূল সংবাদমাধ্যমের পাতায় যায়। <a href="/news/" class="see-all">সব খবর</a></p>');
  html = swap(html, '<div class="news-feature"><div class="news-feature-img">', '<a class="news-feature" href="${newsFeatureData.url}" ${newsFeatureData.own?\'\':\'target="_blank" rel="noopener"\'} style="color:inherit;text-decoration:none"><div class="news-feature-img">');
  html = swap(html, '${newsFeatureData.time}</div></div></div>', '${newsFeatureData.source} · ${newsFeatureData.time}</div></div></a>');
  html = swap(html, '<div class="news-item"><div class="news-thumb', '<a class="news-item" href="${n.url}" ${n.own?\'\':\'target="_blank" rel="noopener"\'} style="color:inherit;text-decoration:none"><div class="news-thumb');
  html = swap(html, '<div class="time">${n.time}</div></div></div>', '<div class="time">${n.source} · ${n.time}</div></div></a>');
  html = swapArray(html, 'scholarships', schRows);
  html = swapArray(html, 'jobs', jobRows);
  html = swapArray(html, 'aiTools', aiRows);
  html = swapArray(html, 'govServices', govRows);
  // scholarships
  html = swap(html, '<div class="feature-card"><div class="fc-top"><div class="cat-icn ${tint(s.t)}">${icon(\'scholarship\')}</div>', '<a class="feature-card" href="${s.url}" style="color:inherit;text-decoration:none"><div class="fc-top"><div class="cat-icn ${tint(s.t)}">${icon(\'scholarship\')}</div>');
  html = swap(html, '<span class="btn-text">Apply<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></div>\n`).join(\'\');', '<span class="btn-text">Apply<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></a>\n`).join(\'\');');
  html = swap(html, '<div class="section-head reveal"><span class="eyebrow">Scholarships</span><h2 style="font-size:28px;">Funding for the next step</h2><p>48,000+ active scholarships across undergraduate, graduate, and research programs.</p></div>',
    `<div class="doc-head reveal" style="margin-bottom:6px;"><div class="doc-head-top"><span class="eyebrow">Scholarships</span><a href="/scholarships/" class="see-all">See All${SEE_ALL_SVG}</a></div><h2 style="font-size:28px;">Funding for the next step</h2></div>`);
  // jobs
  html = swap(html, '<span class="eyebrow">Jobs</span><a href="#" class="see-all">', '<span class="eyebrow">Jobs</span><a href="/jobs/" class="see-all">');
  html = swap(html, '<h2 style="font-size:28px;">Careers worldwide</h2>', '<h2 style="font-size:28px;">Apply before it closes</h2>');
  // AI tools
  html = swap(html, '<div class="feature-card"><div class="fc-top"><div class="cat-icn ${tint(a.t)}">${icon(\'aitools\')}</div>', '<a class="feature-card" href="${a.url}" style="color:inherit;text-decoration:none"><div class="fc-top"><div class="cat-icn ${tint(a.t)}">${icon(\'aitools\')}</div>');
  html = swap(html, "<span>${icon('star',12,12)} ${a.rating}</span><span class=\"btn-text\">View<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></div>", "<span>${a.free}</span><span class=\"btn-text\">দেখুন<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></a>");
  html = swap(html, '<h2 style="font-size:28px;">14,000+ tools, tracked and rated</h2>', '<h2 style="font-size:28px;">Popular AI tools, with official prices</h2><p style="margin-top:8px"><a href="/ai-tools/" class="see-all">See All</a></p>');
  // government services: links to the official portals
  html = swap(html, '<div class="section-head reveal"><span class="eyebrow">Government services</span><h2 style="font-size:28px;">Every civic process, in plain language</h2></div>',
    `<div class="doc-head reveal" style="margin-bottom:6px;"><div class="doc-head-top"><span class="eyebrow">Government services</span><a href="/services/" class="see-all">See All${SEE_ALL_SVG}</a></div><h2 style="font-size:28px;">Common government services, step by step</h2></div>`);
  // Category pills: real counts from the published data. A category with nothing yet links to its "coming soon" page.
  const nHotels = (await getHotels()).length;
  const nSch = (await getScholarships()).length;
  const nJobs = (await getJobs()).length;
  const unit = (n: number, u: string) => (n > 0 ? `${bn(n)}টি ${u}` : 'শীঘ্রই আসছে');
  const EN: Record<string, string> = { hospital: 'Hospitals', university: 'Universities', college: 'Colleges', madrasa: 'Madrasas', hotels: 'Hotels', scholarship: 'Scholarships', jobs: 'Jobs', news: 'News' };
  // Optional coloured icon images: src/assets/pill-icons/<key>.png (see README there). Without a file the page draws a gradient badge.
  const pillFiles = import.meta.glob<{ default: ImageMetadata }>('/src/assets/pill-icons/*.{png,webp,jpg,jpeg}', { eager: true });
  const pillImg: Record<string, string> = {};
  for (const [path, mod] of Object.entries(pillFiles)) {
    const key = path.split('/').pop()!.replace(/\.[a-z]+$/i, '');
    pillImg[key] = (await getImage({ src: mod.default, width: 128, format: 'webp' })).src;
  }
  const mk = (k: string, name: string, href: string, n: number, u: string) => ({ k, name, en: EN[k], href, count: unit(n, u), soon: n === 0, img: pillImg[k] ?? '' });
  html = swapArray(html, 'setA', [
    { k: 'doctor', name: 'ডাক্তার', en: 'Doctors', href: '/doctors/', count: doctors.length ? `${bn(doctors.length)} জন যাচাই করা` : 'শীঘ্রই আসছে', soon: !doctors.length, img: pillImg.doctor ?? '' },
    mk('hospital', 'হাসপাতাল', '/hospitals/', hospitals.length, 'প্রোফাইল'),
    mk('university', 'বিশ্ববিদ্যালয়', '/universities/', (await getUniversities()).length, 'প্রোফাইল'),
    mk('college', 'কলেজ', '/colleges/', inst.filter((i) => instSection(i) === 'college').length, 'কলেজ'),
    mk('hotels', 'হোটেল', '/hotels/', nHotels, 'হোটেল'),
  ]);
  html = swapArray(html, 'setB', [
    mk('madrasa', 'মাদরাসা', '/madrasas/', inst.filter((i) => instSection(i) === 'madrasa').length, 'মাদরাসা'),
    mk('scholarship', 'বৃত্তি', '/scholarships/', nSch, 'বৃত্তি'),
    mk('jobs', 'চাকরি', '/jobs/', nJobs, 'বিজ্ঞপ্তি'),
    mk('news', 'সংবাদ', '/news/', newsAll.length, 'খবর'),
  ]);
  html = swap(html, '<span class="eyebrow">AI tools</span>', '<span class="eyebrow">AI tools</span>');
  html = swapArray(html, 'hotels', hotelRows);
  html = swapArray(html, 'places', placeRows);
  html = swap(html, "put('placeRow', places.map(p=>`\n    <div class=\"org-card ix-card ix-place\">\n      <div class=\"ix-image\">${placeArt(p.kind)}",
    "put('placeRow', places.map(p=>`\n    <a class=\"org-card ix-card ix-place\" href=\"${p.url}\" style=\"color:inherit;text-decoration:none\">\n      <div class=\"ix-image\">${p.img ? `<img src=\"${p.img}\" alt=\"\" loading=\"lazy\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\">` : placeArt(p.kind)}");
  html = swap(html, "<div class=\"ix-body\">${tags(p.tags)}</div>\n    </div>`).join(''));", "<div class=\"ix-body\">${tags(p.tags)}</div>\n    </a>`).join(''));");
  html = swap(html, '<span class="eyebrow">Famous places</span><a href="#" class="see-all">', '<span class="eyebrow">Famous places</span><a href="/places/" class="see-all">');
  html = swapArray(html, 'colleges', await instRow('college'));
  html = swapArray(html, 'schools', await instRow('school'));
  // colleges and schools: photo (no text on it), then name, address and 2-3 small facts
  html = swap(html, "put('collegeRow', colleges.map((c,i)=>`\n    <div class=\"org-card ix-card\">\n      <div class=\"ix-image\">${collegeArt(i+2)}<span class=\"ix-type\">${c.type}</span><span class=\"ix-badge\">Est. ${c.est}</span></div>\n      <div class=\"ix-body\"><b>${c.name}</b><div class=\"sub\">${pin}${c.loc}</div>${tags(c.tags)}</div>\n    </div>`",
    "put('collegeRow', colleges.map((c,i)=>`\n    <a class=\"org-card ix-card ix-inst\" href=\"${c.url}\" style=\"color:inherit;text-decoration:none\">\n      <div class=\"ix-image\">${c.img?`<img src=\"${c.img}\" alt=\"\" loading=\"lazy\">`:collegeArt(i+2)}</div>\n      <div class=\"ix-body\"><b>${c.name}</b><div class=\"sub\">${pin}${c.addr}</div>${tags(c.tags)}</div>\n    </a>`");
  html = swap(html, "put('schoolRow', schools.map((c,i)=>`\n    <div class=\"org-card ix-card\">\n      <div class=\"ix-image\">${schoolArt(i+5)}<span class=\"ix-type\">${c.type}</span></div>\n      <div class=\"ix-body\"><b>${c.name}</b><div class=\"sub\">${pin}${c.loc}</div>${tags(c.tags)}</div>\n    </div>`",
    "put('schoolRow', schools.map((c,i)=>`\n    <a class=\"org-card ix-card ix-inst\" href=\"${c.url}\" style=\"color:inherit;text-decoration:none\">\n      <div class=\"ix-image\">${c.img?`<img src=\"${c.img}\" alt=\"\" loading=\"lazy\">`:schoolArt(i+5)}</div>\n      <div class=\"ix-body\"><b>${c.name}</b><div class=\"sub\">${pin}${c.addr}</div>${tags(c.tags)}</div>\n    </a>`");
  html = swap(html, '.ix-body .sub svg,.ix-cap span svg{', '.ix-inst .ix-image img{display:block;width:100%;height:100%;object-fit:cover;}\n.ix-inst .ix-body .sub{align-items:flex-start;line-height:1.35;}\n.ix-inst .ix-body .sub svg{margin-top:3px;}\n.ix-inst .ix-body{padding:14px 14px 16px;}\n.ix-inst .org-tags{display:flex;flex-wrap:wrap;gap:5px;padding-top:12px;}\n.ix-inst .org-tags span{font-size:11px;padding:4px 7px;white-space:nowrap;}\n.ix-body .sub svg,.ix-cap span svg{');
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
  html = swap(html, "<div class=\"org-logo \${tint(u.t)}\">\${u.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>", "<div class=\"org-logo \${u.logo?'has-img':tint(u.t)}\">\${u.logo?`<img src=\"\${u.logo}\" alt=\"\" loading=\"lazy\">`:u.mono}</div>");
  html = swap(html, '<div class="org-image">${uniBuilding(u.t)}</div>', '<div class="org-image">${u.img?`<img src="${u.img}" alt="" loading="lazy">`:uniBuilding(u.t)}</div>');
  html = swap(html, '.uni-card .org-image svg{display:block;width:100%;height:100%;}', '.uni-card .org-image svg,.uni-card .org-image img{display:block;width:100%;height:100%;}\n.uni-card .org-image img{object-fit:cover;}\n.uni-card .org-logo.has-img{background:#fff;overflow:hidden;}\n.uni-card .org-logo.has-img img{display:block;width:100%;height:100%;object-fit:contain;padding:6px;box-sizing:border-box;}\n.uni-card .org-name-wrap{padding-bottom:3px;}\n.uni-card .uni-rank{letter-spacing:.01em;}\nsection:has(#uniRow){padding-top:0;padding-bottom:26px;}\n.top-cover > .top-feature-section{padding-bottom:34px !important;}\nsection:has(#uniRow) .row-scroll{padding-top:20px;padding-bottom:6px;}');
  html = swap(html, '<span class="eyebrow">Universities</span><a href="#" class="see-all">', '<span class="eyebrow">Universities</span><a href="/universities/" class="see-all">');
  html = swapArray(html, 'hospitalNames', hospRows);
  // cards become links to the real pages
  html = swap(
    html,
    `<div class="org-tags"><span>\${h.beds}</span><span>\${h.doctors}</span><span class="hosp-rating">★ \${h.rating}</span></div></div>
  </div>`,
    `<div class="org-tags">\${h.tags.map(x=>\`<span>\${x}</span>\`).join('')}</div></div>
  </a>`,
  );
  html = swap(html, '<div class="org-image hosp-image">${hospBuilding(h.t)}</div>', '<div class="org-image hosp-image">${h.img?`<img src="${h.img}" alt="" loading="lazy">`:hospBuilding(h.t)}</div>');
  html = swap(html, '.hosp-image svg{display:block;width:100%;height:100%;}', '.hosp-image svg,.hosp-image img{display:block;width:100%;height:100%;}\n.hosp-image img{object-fit:cover;object-position:center 70%;}');
  html = swap(html, '<div class="org-card hosp-card">', '<a class="org-card hosp-card" href="${h.url}" style="color:inherit;text-decoration:none">');
  // "See all" in the two section heads
  html = swap(html, '<span class="eyebrow">Doctors</span><a href="#" class="see-all">', '<span class="eyebrow">Doctors</span><a href="/doctors/" class="see-all">');
  html = swap(html, '<span class="eyebrow">Hospitals</span><a href="#" class="see-all">', '<span class="eyebrow">Hospitals</span><a href="/hospitals/" class="see-all">');

  html = swap(html, "put('hotelRow', hotels.map((h,i)=>`\n    <div class=\"org-card ix-card\">", "put('hotelRow', hotels.map((h,i)=>`\n    <a class=\"org-card ix-card\" href=\"${h.url}\" style=\"color:inherit;text-decoration:none\">");
  html = swap(html, "<div class=\"ix-image\">${hotelArt(i+1)}</div>", "<div class=\"ix-image\">${h.img ? `<img src=\"${h.img}\" alt=\"\" loading=\"lazy\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\">` : hotelArt(i+1)}</div>");
  html = swap(html, '<span class="eyebrow">Hotels</span><a href="#" class="see-all">', '<span class="eyebrow">Hotels</span><a href="/hotels/" class="see-all">');
  html = swap(html, '<span class="ix-rate">★ ${h.rating}</span></div>\n      </div>\n    </div>`).join(\'\'));', '</div>\n      </div>\n    </a>`).join(\'\'));');
  // madrasas: same card as the university row, placed right after the blood section; the type (কওমি, সরকারি, ফুলতলি ...) replaces public/private
  const madrasaList = inst.filter((i) => instSection(i) === 'madrasa').slice(0, 8);
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const madrasaCards = (await Promise.all(madrasaList.map(async (m) => {
    const img = m.data.photo ? (await getImage({ src: m.data.photo, width: 640, format: 'webp' })).src : '';
    const logo = m.data.logo ? (await getImage({ src: m.data.logo, width: 140, format: 'webp' })).src : '';
    const kind = m.data.madrasa_type ?? `${m.data.type} মাদ্রাসা`;
    const dome = '<svg viewBox="0 0 160 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="160" height="80" fill="#f1f6f3"/><rect y="64" width="160" height="16" fill="#e4eee8"/><path d="M56 64V44a24 24 0 0 1 48 0v20z" fill="#fff" stroke="#8fb09e" stroke-width="2"/><path d="M80 12v8" stroke="#8fb09e" stroke-width="2" stroke-linecap="round"/><rect x="28" y="30" width="10" height="34" fill="#fff" stroke="#8fb09e" stroke-width="2"/><rect x="122" y="30" width="10" height="34" fill="#fff" stroke="#8fb09e" stroke-width="2"/><path d="M28 30l5-9 5 9M122 30l5-9 5 9" fill="none" stroke="#8fb09e" stroke-width="2" stroke-linejoin="round"/></svg>';
    return `<a class="org-card uni-card" href="${institutionUrl(m)}" style="color:inherit;text-decoration:none"><div class="org-image">${img ? `<img src="${img}" alt="" loading="lazy">` : dome}</div><div class="org-body"><div class="logo-row"><div class="org-logo ${logo ? 'has-img' : ''}" style="${logo ? '' : 'background:#eef5f1;color:#2f6b4f'}">${logo ? `<img src="${logo}" alt="" loading="lazy">` : 'ম'}</div><div class="org-name-wrap"><span class="uni-rank">${esc(kind)}</span></div></div><b class="uni-full-name">${esc(m.data.name_bn)}</b><div class="uni-meta"><span class="uni-loc">${esc(CITIES[m.data.city].bn)}, বাংলাদেশ</span>${m.data.est ? `<span class="uni-est">Est. ${m.data.est}</span>` : ''}</div></div></a>`;
  }))).join('');
  if (madrasaCards) {
    const section = `<section class="tight" id="madrasaSec"><div class="container"><div class="doc-head reveal" style="margin-bottom:6px;"><div class="doc-head-top"><span class="eyebrow">Madrasas</span><a href="/madrasas/" class="see-all">See All<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></a></div><h2 style="font-size:28px;">Learning rooted in faith</h2></div><div class="row-scroll reveal" id="madrasaRow">${madrasaCards}</div></div></section>\n\n`;
    html = swap(html, '<!-- ============================================================ 6.6 MORE CATEGORIES', section + '<!-- ============================================================ 6.6 MORE CATEGORIES');
  }
  html = html.replaceAll('__CONTACT_EMAIL__', CONTACT_EMAIL).replaceAll('__WA_LINK__', WHATSAPP_LINK);
  // little icons that float on the last "সব দেখুন" card of each swipe row
  const rowIcons: Record<string, (keyof typeof ICONS)[]> = {
    doctorRow: ['steth', 'heart', 'user'], uniRow: ['cap', 'build', 'award'], hospitalRow: ['build', 'ambulance', 'heart'], madrasaRow: ['cap', 'build', 'award'],
    collegeRow: ['cap', 'award', 'file'], schoolRow: ['cap', 'star', 'walk'], placeRow: ['mount', 'sun', 'beach'], hotelRow: ['bed', 'pool', 'star'],
  };
  html = swap(html, 'var I=/*ROW_ICONS*/{};', `var I=${JSON.stringify(Object.fromEntries(Object.entries(rowIcons).map(([k, v]) => [k, v.map((n) => ICONS[n])])))};`);
  // Ads: three places on the home page (university/hospital, after news, before the footer).
  // Nothing is printed until ADSENSE_SLOT is set; the AdSense script itself loads as soon as ADSENSE_CLIENT is set.
  const adBox = ADS_LIVE
    ? `<div class="container"><div class="ad-slot ad-live" aria-label="বিজ্ঞাপন"><small>বিজ্ঞাপন</small><ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${ADSENSE_SLOT}" data-ad-format="horizontal" data-full-width-responsive="true"></ins></div></div>\n`
    : '';
  const adCss = adBox ? '<style>.ad-live{display:block;text-align:center;overflow:hidden;margin:18px 0}.ad-live small{display:block;font-size:11px;color:#94a3b8;margin-bottom:4px}.ad-live:has(ins[data-ad-status="unfilled"]){display:none}</style>\n' : '';
  if (ADSENSE_SRC) html = swap(html, '</head>', `<script async src="${ADSENSE_SRC}" crossorigin="anonymous"></script>\n${adCss}</head>`);
  if (adBox) {
    html = swap(html, '<div class="row-scroll reveal" id="uniRow"></div>\n  </div>\n</section>', '<div class="row-scroll reveal" id="uniRow"></div>\n  </div>\n</section>\n' + adBox);
    html = swap(html, '<div id="newsList"></div>\n      </div>\n    </div>\n  </div>\n</section>', '<div id="newsList"></div>\n      </div>\n    </div>\n  </div>\n</section>\n' + adBox);
    html = swap(html, '<!-- ============================================================ 26. FOOTER', adBox + '<!-- ============================================================ 26. FOOTER');
    html = swap(html, '</body>', "<script>document.querySelectorAll('ins.adsbygoogle').forEach(function(){try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}})</script>\n</body>");
  }
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
