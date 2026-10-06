// Homepage. The design is the finished prototype (src/partials/home.html) exactly as it was;
// the rows (doctors, hospitals, universities, colleges, schools, places) are filled from the published data files at build time.
import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import home from '../partials/home.html?raw';
import { getDoctors, getHospitals, getUniversities, getInstitutions, doctorUrl, hospitalUrl, universityUrl, institutionUrl, instSection, doctorsAt, getPlaces, placeUrl, getHotels, hotelUrl, getScholarships, getJobs, getAiTools, getServices, serviceUrl, scholarshipUrl, jobUrl, aiToolUrl, isClosed, getNews, getRankings, getApps, newsUrl, isOwnNews } from '../lib/data';
import { CITIES } from '../lib/taxonomy';
import { SPECIALTIES, HOTEL_FACILITIES } from '../lib/taxonomy';
import { ART, artKind } from '../lib/newsArt';
import { bn, bnDate } from '../lib/format';

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
  const hotelRows = (await getHotels()).slice(0, 8).map((h) => ({
    name: h.data.name,
    loc: `${h.data.address.split(',')[0]}, ${CITIES[h.data.city].bn}`,
    tags: [...(h.data.stars ? [`${h.data.stars}-star`] : []), ...h.data.facilities.slice(0, 2).map((f) => HOTEL_FACILITIES[f])].slice(0, 3),
    url: hotelUrl(h),
  }));

  // scholarships, jobs, AI tools: real entries; open ones first. Government services: links to the official portals only.
  const FUND = { full: 'সম্পূর্ণ অর্থায়িত', partial: 'আংশিক', varies: 'ভিন্ন ভিন্ন' } as const;
  const schRows = (await getScholarships()).sort((a, b) => Number(isClosed(a.data.close)) - Number(isClosed(b.data.close))).slice(0, 4).map((x, i) => ({
    name: x.data.name_bn ?? x.data.name, org: x.data.provider, amount: x.data.country, badge: FUND[x.data.funding], t: i,
    deadline: x.data.close ? (isClosed(x.data.close) ? 'আবেদন শেষ' : `শেষ ${bnDate(x.data.close)}`) : 'তারিখ ঘোষণা হয়নি', url: scholarshipUrl(x),
  }));
  const jobRows = (await getJobs()).filter((x) => !isClosed(x.data.close)).slice(0, 5).map((x, i) => ({
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

  const appRows = (await getApps()).map((x, i) => ({ name: x.data.name, desc: x.data.desc, url: x.data.url, featured: x.data.featured, own: x.data.own, t: i }));

  let html = swapArray(home, 'doctorNames', docRows);
  html = swapArray(html, 'usefulApps', appRows);
  html = swap(html, '<span class="app-desc">${a.desc}</span>', '<span class="app-desc">${a.desc}</span>');
  html = swap(html, '</svg>Download</a>', '</svg>${a.own?\'Play Store\':\'খুঁজুন\'}</a>');
  html = swapArray(html, 'newsData', newsAll.slice(1));
  html = swap(html, 'const newsFeatureData = {', `const NEWS_ART = ${JSON.stringify(ART)};\nconst newsFeatureData = {`);
  html = swap(html, "${icon('news',44,44)}</div>\n  <div class=\"news-feature-body\">", "${NEWS_ART[newsFeatureData.kind]||icon('news',44,44)}</div>\n  <div class=\"news-feature-body\">");
  html = swap(html, '<div class="news-thumb ${tint(n.t)}">${icon(\'news\',20,20)}</div>', '<div class="news-thumb">${NEWS_ART[n.kind]||icon(\'news\',20,20)}</div>');
  html = swap(html, '.news-feature-img svg{', '.news-feature-img:has(svg.na){height:auto;aspect-ratio:16/9;}\n.news-feature-img svg.na{width:100%;height:100%;opacity:1;color:inherit;}\n.news-feature-img svg:not(.na){');
  html = swap(html, '.news-thumb svg{width:20px;height:20px;}', '.news-thumb svg{width:20px;height:20px;}\n.news-thumb svg.na{width:100%;height:100%;display:block;}\n.news-thumb:has(svg.na){background:none;overflow:hidden;padding:0;}');
  html = swapArray(html, 'rankData', rankRows);
  html = swap(html, 'const newsFeatureData = {', `const newsFeatureData = ${JSON.stringify(newsAll[0])}; const _unused = {`);
  html = swap(html, 'const rankData =', `const rankInfo = ${JSON.stringify(rankInfo)};\nconst rankData =`);
  html = swap(html, '<span>#</span><span>Name</span><span>Score</span><span>Trend</span>', '<span>#</span><span>বিশ্ববিদ্যালয়</span><span>QS র‍্যাংক</span><span></span>');
  html = swap(html, "<span class=\"rank-num\">${String(i+1).padStart(2,'0')}</span>", "<span class=\"rank-num\">${r.single?String(i+1).padStart(2,'0'):'–'}</span>");
  html = swap(html, '<span class="rank-score">${r.score} / 100</span>', '<span class="rank-score">${r.rank}</span>');
  html = swap(html, "<span class=\"rank-trend ${r.trend}\">${r.trend==='up'?'▲ Rising':r.trend==='down'?'▼ Falling':'● Stable'}</span></div>", "<span class=\"rank-trend flat\">${r.url?`<a href=\"${r.url}\">প্রোফাইল</a>`:''}</span></div>");
  html = swap(html, '<h2>See who leads — by the numbers</h2><p>Independent, methodology-first rankings refreshed every quarter across research output, employability, and student satisfaction.</p>', `<h2>${rk.data.system}-এ বাংলাদেশ</h2><p style="margin-top:8px"><a href="/rankings/" class="see-all">সব ${bn(rk.data.rows.length)}টি দেখুন</a></p>`);
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
  html = swap(html, '<p>48,000+ active scholarships across undergraduate, graduate, and research programs.</p>', '<p>Scholarships Bangladeshis can apply to, with real deadlines. <a href="/scholarships/" class="see-all">See all</a></p>');
  // jobs
  html = swap(html, '<a href="#" class="btn btn-ghost btn-sm job-apply">Apply</a>', '<a href="${j.url}" class="btn btn-ghost btn-sm job-apply">View</a>');
  html = swap(html, '<span class="eyebrow">Jobs</span><a href="#" class="see-all">', '<span class="eyebrow">Jobs</span><a href="/jobs/" class="see-all">');
  html = swap(html, '<h2 style="font-size:28px;">Careers worldwide</h2>', '<h2 style="font-size:28px;">Open recruitment circulars</h2>');
  // AI tools
  html = swap(html, '<div class="feature-card"><div class="fc-top"><div class="cat-icn ${tint(a.t)}">${icon(\'aitools\')}</div>', '<a class="feature-card" href="${a.url}" style="color:inherit;text-decoration:none"><div class="fc-top"><div class="cat-icn ${tint(a.t)}">${icon(\'aitools\')}</div>');
  html = swap(html, "<span>${icon('star',12,12)} ${a.rating}</span><span class=\"btn-text\">View<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></div>", "<span>${a.free}</span><span class=\"btn-text\">View<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></a>");
  html = swap(html, '<h2 style="font-size:28px;">14,000+ tools, tracked and rated</h2>', '<h2 style="font-size:28px;">Popular AI tools, with official prices</h2><p style="margin-top:8px"><a href="/ai-tools/" class="see-all">See all</a></p>');
  // government services: links to the official portals
  html = swap(html, '<div class="feature-card"><div class="fc-top"><div class="cat-icn ${tint(g.t)}">${icon(\'govt\')}</div></div>', '<a class="feature-card" href="${g.url}" style="color:inherit;text-decoration:none"><div class="fc-top"><div class="cat-icn ${tint(g.t)}">${icon(\'govt\')}</div></div>');
  html = swap(html, "<span>${icon('clock',12,12)} ${g.time}</span><span class=\"btn-text\">Start<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></div>", "<span>${icon('clock',12,12)} ${g.time}</span><span class=\"btn-text\">Start<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></span></div></a>");
  html = swap(html, '<h2 style="font-size:28px;">Every civic process, in plain language</h2>', '<h2 style="font-size:28px;">Common government services, step by step</h2><p style="margin-top:8px"><a href="/services/" class="see-all">See all</a></p>');
  html = swapArray(html, 'hotels', hotelRows);
  html = swapArray(html, 'places', placeRows);
  html = swap(html, "put('placeRow', places.map(p=>`\n    <div class=\"org-card ix-card ix-place\">\n      <div class=\"ix-image\">${placeArt(p.kind)}",
    "put('placeRow', places.map(p=>`\n    <a class=\"org-card ix-card ix-place\" href=\"${p.url}\" style=\"color:inherit;text-decoration:none\">\n      <div class=\"ix-image\">${p.img ? `<img src=\"${p.img}\" alt=\"\" loading=\"lazy\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\">` : placeArt(p.kind)}");
  html = swap(html, "<div class=\"ix-body\">${tags(p.tags)}</div>\n    </div>`).join(''));", "<div class=\"ix-body\">${tags(p.tags)}</div>\n    </a>`).join(''));");
  html = swap(html, '<span class="eyebrow">Famous places</span><a href="#" class="see-all">', '<span class="eyebrow">Famous places</span><a href="/places/" class="see-all">');
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
    `<div class="org-tags">\${h.tags.map(x=>\`<span>\${x}</span>\`).join('')}</div></div>
  </a>`,
  );
  html = swap(html, '<div class="org-card hosp-card">', '<a class="org-card hosp-card" href="${h.url}" style="color:inherit;text-decoration:none">');
  // "See all" in the two section heads
  html = swap(html, '<span class="eyebrow">Doctors</span><a href="#" class="see-all">', '<span class="eyebrow">Doctors</span><a href="/doctors/" class="see-all">');
  html = swap(html, '<span class="eyebrow">Hospitals</span><a href="#" class="see-all">', '<span class="eyebrow">Hospitals</span><a href="/hospitals/" class="see-all">');

  html = swap(html, "put('hotelRow', hotels.map((h,i)=>`\n    <div class=\"org-card ix-card\">", "put('hotelRow', hotels.map((h,i)=>`\n    <a class=\"org-card ix-card\" href=\"${h.url}\" style=\"color:inherit;text-decoration:none\">");
  html = swap(html, '<span class="eyebrow">Hotels</span><a href="#" class="see-all">', '<span class="eyebrow">Hotels</span><a href="/hotels/" class="see-all">');
  html = swap(html, '<span class="ix-rate">★ ${h.rating}</span></div>\n      </div>\n    </div>`).join(\'\'));', '</div>\n      </div>\n    </a>`).join(\'\'));');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
