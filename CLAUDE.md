# InfoSaathi: working rules for Claude sessions

Site: infosaathi.com. Astro static site on Cloudflare, content in YAML files under `src/content/`. Cloudflare deploys automatically after `git push` to the main branch.
Owner: Sahel Ahmed (Sylhet). Reply to him in Bengali. Disagree directly when an idea is weak. Remind him: one thing done well beats ten done mediocrely (no feature creep).

## Task type: ADD A DOCTOR (the most common task)

Trigger: Sahel sends doctor data plus two photos. Do ONLY this task in that session: no layout, CSS or template changes, no other features. If he asks for one, remind him to finish doctor data first.

### Input from Sahel
- Bangla name, English name, specialty (key from `src/lib/taxonomy.ts`), city.
- Chamber(s): hospital (an existing file in `src/content/hospitals/`) or own name + address; room; days; start/end time; fee if known.
- Serial numbers with labels and the time they can be called (`note`).
- Verification: how and when (phone, date).
- Two images. FIRST image = profile portrait. SECOND image = visiting card (banner). Check this by looking at the images; if the content contradicts the order (it happened once), trust the content and say so.
- Photo credit/permission if the image is not his own.

If anything required is missing, ask ONE message listing everything missing. Never guess phone numbers, fees, days, times or addresses.

### Steps
1. Read `src/content/doctors/_template.yaml`, one finished doctor (e.g. `dr-m-a-hai.yaml`) and the doctors schema in `src/content.config.ts`.
2. Slug = `dr-<english-name-lowercase-hyphenated>` (use `prof-dr-...` / `major-dr-...` like existing files). If `src/content/doctors/<slug>.yaml` already exists: if it is an unverified `draft: true` import of the same doctor, update that file in place (keep its `old_urls`); otherwise stop and ask.
2b. OLD BLOGGER URLS (keeps the old Google traffic): search `docs/old-doctor-urls.tsv` for this doctor by slug, Bangla name or English name (spelling varies, compare loosely). If found, put the URL(s) in the YAML as `old_urls: [/2025/10/....html]` and tell Sahel which one you used. If not found, say so in the report and ask whether the doctor had an old Blogger post (he can send the link; do not guess a URL).
3. Images: run `python3 scripts/prep-doctor-images.py <slug> <profile> [<banner>]`. It crops the portrait to a square around the face and keeps the card uncropped; it prints the YAML lines. LOOK at the result (Read tool) and redo the crop by hand if the face is cut. Never use generic names like `doctor.jpg`; names must contain the doctor's slug.
4. Read the banner image: take degrees, designation, treated conditions from it; cross-check days, times, phones, address, room against Sahel's data. Sahel's phone-verified data wins for phones, days, times, fees. A phone number in his message that differs from the card by a digit is probably his typo: use the card's number and tell him.
5. If the banner has another website's watermark, say so before publishing. Show it only if Sahel confirms.
6. Optional web research only for BMDC number or degrees, only from official sources (BMDC, the hospital's own site). If not found, leave the field out and say so.
7. Do NOT write `about`, `treats`, `aliases` or any keyword text unless Sahel gave it or it is on the banner. The page template builds a factual intro from the data. Nothing unverifiable goes live: no invented degrees, experience, ratings, counts.
8. `verified:` = date Sahel confirmed; `verified_by: phone` only if he said he verified by phone. If not verified by phone, set `draft: true` (draft pages are never published).
9. Run `npm run build` (must pass). Open `dist/doctor/<city>/<slug>/index.html`: check title/description read well, one h1, phone numbers equal Sahel's data, JSON-LD present.
10. Playwright check at 360 and 390 px width: no horizontal overflow. Playwright import path: `/opt/npm-tools/node_modules/playwright/index.mjs`. Look at one screenshot.
11. One commit per doctor (or one per batch), `git pull --rebase`, `git push`. Do not run `pkill -f` inside the shell.
12. Report in Bengali, short: files created, live path `https://infosaathi.com/doctor/<city>/<slug>/`, every mismatch found, fields left empty and why.

### SEO is in the template, not per doctor
Bilingual title/description, one h1, Physician + FAQ + breadcrumb JSON-LD, related doctors, canonical and sitemap all come from `src/pages/doctor/[city]/[slug].astro`. Per doctor only the DATA matters. No magic keyword counts.

### After publishing (Sahel does this)
Search Console: only after infosaathi.com is live as the real domain. Add the property, submit `https://infosaathi.com/sitemap-index.xml`, then URL Inspection → Request indexing for the newest pages (small daily limit).

## Task type: ADD A UNIVERSITY

Trigger: Sahel sends a university name plus images. Do ONLY this task in that session: no layout, CSS or template changes, no other features (remind him if he asks for one).

### Input from Sahel
- University name (Bangla and/or English). That is usually all.
- Images: FIRST image = logo, SECOND image = cover (campus) photo. If he does not number them, the first uploaded is the logo. Look at both; if the content clearly contradicts the order, trust the content and say so.
- If he sends only a name and no images, still build the page but leave `logo`/`photo` out and say so.

### Research (you do this, he does not send data)
1. Official website first (admission portal, prospectus, notices, fee page, UGC listing). Then other sources only if they add facts the official site lacks: UGC, university-ranking pages (QS/THE), reputable newspapers for admission circulars (Daily Star, Prothom Alo, Ittefaq, Kaler Kantho, Dainik Shiksha). No coaching-site or random blog numbers.
2. The official site is often slow or blocks the workspace. If WebFetch fails, say so and use the search results and news, never invent. Do not use an old prospectus (check the year) for current fees or eligibility.
3. Collect: address, est. year, type, UGC status, phone numbers (admission and main), emails, programmes with faculty, years, credits and total cost where published, admission cycle dates, eligibility (GPA/exam rules), application and admission fee, seats, exam date, waivers, rank, students/teachers counts, class start.
4. Current cycle first. If the next cycle is not announced, say that plainly and use last cycle numbers ONLY when labelled "গত বছর (YYYY–YY)" in the text. Never present last year's number as current.
5. A fact with no reliable source is left out. Never guess phones, fees, dates or seats. Missing values show "আমরা সঠিক তথ্য পাইনি" automatically.

### Steps
1. Read `src/content/universities/_template.yaml`, one finished file (`shahjalal-university-of-science-and-technology.yaml`) and the universities schema in `src/content.config.ts`.
2. Slug = English name lowercase hyphenated (e.g. `leading-university`). If the file exists, update it in place (keep `old_urls`); never create a duplicate.
3. OLD BLOGGER URLS: `docs/old-doctor-urls.tsv` is only for doctors. For universities search the file anyway by name; if nothing, ask Sahel for the old Blogger link. Do not guess a URL.
4. Images: logo keep PNG (or convert to PNG), longest side max 400 px, do not crop the emblem. Cover to JPEG, max 1600 px wide, quality 82, no heavy crop (the cards use object-fit: cover, so keep the subject centred). Never enlarge. Save as `src/content/universities/images/<slug>-logo.png` and `<slug>-campus.jpg`; set `logo:` and `photo:` as `./images/...`. LOOK at both results (Read tool). If a cover carries another site's watermark or a stock-photo mark, tell Sahel before publishing.
5. Fill the YAML as the template shows, plus these two blocks the template page needs:
   - `quick:` short values for the "এক নজরে" card, keys: open, close, exam, elig, app_fee, admission_fee, seats, competition, cost, rank, classes. Short (a few words each). Missing key = "আমরা সঠিক তথ্য পাইনি".
   - `detail:` one sentence per key (same keys plus `programs`), 70-80 characters, factual, written for search. Any last-year number must say "গত বছর". `competition` per seat is computed (applicants / seats) and must be labelled "আমাদের হিসাব".
   - `programs`: every programme with `faculty`, `name`, `name_en`; add `years`, `credits`, `total_cost` only when published. Do not assume 4 years.
   - `faq`: 5-7 real questions people search, answers consistent with `detail`. Always include, with a direct answer in the first sentence: যোগাযোগ/ফোন নম্বর কত, ভর্তি ফি কত, ভর্তির যোগ্যতা (GPA), আসন সংখ্যা (if published), ঠিকানা/কোথায়. Phone numbers in the answer must equal `numbers`.
   - `about`: 2-3 factual sentences. `good`/`think`: short, honest.
6. Sources: maximum 2 (see SOURCES RULE): the official website first, then one more only if it helps SEO or trust. Every number must be traceable to a page you actually read.
7. `verified:` = today; `verified_by: official` (from official site/notices) unless Sahel confirmed by phone. Set `draft: true` only if the data is too thin to publish; say why.
8. `npm run build` must pass. Open `dist/university/<city>/<slug>/index.html`: title/description sensible, one h1, JSON-LD (CollegeOrUniversity, FAQPage, BreadcrumbList) present, phones match the data. Homepage row shows the logo and cover (the first 8 universities, government first).
9. Playwright check at 360 and 390 px: no horizontal overflow, no JS error, the numbers sheet opens on "কল". Look at one screenshot of the top and of the "এক নজরে" card.
10. One commit per university, `git pull --rebase`, `git push`. No `pkill -f` in the shell.
11. Report in Bengali, short: files, live path `https://infosaathi.com/university/<city>/<slug>/`, what is current vs last year, fields left empty and why, sources used, anything you could not open.

## Task type: ADD A HOSPITAL

Trigger: Sahel sends a hospital name plus a photo. Do ONLY this task in that session (no layout/CSS/template changes, no other features).

### Input from Sahel
- Hospital name (Bangla and/or English), city. The photo is the cover photo (first image if several). No photo: build without `photo` and say so.

### Research (you do this)
1. Official website first: contact page, about, services/facilities, specialties/doctor list, price list, news. Then other sources only for what the official site lacks (hospital association, reputable news). If the official site cannot be fetched from the workspace, use WebSearch to surface the URLs, then WebFetch them.
2. Collect: address, every phone number WITH the label the hospital itself uses, hotline/short code, email, beds, ICU/NICU/CCU units and bed counts, emergency 24/7, ambulance, MRI/CT/lab, dialysis, departments and doctor count (cite the date), visiting hours, certification, test price list if published.
3. Phone labels: copy the hospital's own labels. Never mark a number `kind: emergency` unless the official site calls it emergency/ambulance. Never mark 24/7 or any service the site does not state.
4. Do not invent. A fact with no reliable source stays out and goes to `docs/data-gaps.md` (see DATA GAPS below) after maximum research.

### Steps
1. Read `src/content/hospitals/_template.yaml`, `al-haramain-hospital-sylhet.yaml` (finished example) and the hospitals schema in `src/content.config.ts`.
2. Slug = English name lowercase hyphenated + city (e.g. `al-haramain-hospital-sylhet`). If the file exists, update in place.
3. Photo: save as `src/content/hospitals/images/<slug>.jpg` (JPEG, max 1600 px wide, quality 85, never enlarge). LOOK at it. If it shows another site's watermark, tell Sahel before publishing.
4. YAML: `name`, `name_en`, `short`, `type`, `city`, `address`, `photo`, `emergency_24h`, `beds`, `numbers`, `facilities` (keys from `src/lib/taxonomy.ts` only), `about` (1-2 factual sentences), `quick` (short values: beds, icu, emergency, ambulance, doctors, visiting, diagnostics; a missing key shows "আমরা সঠিক তথ্য পাইনি"), `tests` only from a published price list (with `tests_updated`), `sources`, `verified: <today>`, `verified_by: official`.
   - "রোগী দেখার সময়" shows "ডাক্তারের সময় অনুযায়ী" by default; set `visiting_hours` only if the hospital publishes real visiting hours for patients' relatives.
5. FAQ (`faq:`) 4-6 extra questions (the page already adds honest "আমরা সঠিক তথ্য পাইনি" answers for পরীক্ষার ফি, কেবিন ভাড়া, আইসিইউ খরচ unless you add your own sourced answer to the same question; when you find the figure, write it in `faq:`/`tests`) people search, direct answer in the first sentence, consistent with the data. The page already adds: যোগাযোগ নম্বর ও হটলাইন নাম্বার কী, সিরিয়াল, ঠিকানা, জরুরি বিভাগ, রোগী দেখার সময়, কোন বিশেষজ্ঞ বসেন. Add from: শয্যা/ICU, MRI-CT আছে কি, কোন কোন বিভাগে ডাক্তার, অ্যাম্বুলেন্স, পরীক্ষার ফি (only if published), ভর্তি/কেবিন ভাড়া (only if published).
6. Sources: maximum 2 (see SOURCES RULE), official pages first.
7. Build, open `dist/hospital/<city>/<slug>/index.html` (title, one h1, JSON-LD Hospital/FAQPage/Breadcrumb, phones equal the data). Playwright 360/390: no overflow, no JS error, the "কল করুন" sheet opens. Look at a screenshot.
8. One commit, `git pull --rebase`, `git push`. Report in Bengali: files, live path `https://infosaathi.com/hospital/<city>/<slug>/`, gaps written to `docs/data-gaps.md`, mismatches found.

## DATA GAPS (applies to doctors, universities, hospitals)
- Before marking any field missing, do maximum research: official site, at least 3 searches in Bangla and English, news. Only then leave it out (the page shows "আমরা সঠিক তথ্য পাইনি").
- Every missing field is recorded in `docs/data-gaps.md`: one row per item with `type | file | field | what was searched | date`. Update the row instead of duplicating.
- When Sahel later sends new data for doctors, universities or hospitals in one batch: read `docs/data-gaps.md` first, update every named file, fill the gaps he covered, set `verified:` to today's date ONLY on files whose data changed, remove the resolved rows from `docs/data-gaps.md`, then build, test and push once.
- A gap that research can fill is not a gap: fill it before writing the row.

## SOURCES RULE (all content types)
- Maximum 2 sources per file (enforced by the schema): the official website (or the official page that holds the facts) first, then the single most useful second page (the official fee/admission/notice page, or one reputable news article), only if it helps trust or SEO. Never more than 2. Prefer the official page that holds the most numbers.
- If more pages were used, keep the facts but list only the 2 best; every number must still be consistent with those pages.

## Other rules
- AI-researched data must carry sources and honest badges; Sahel verifies by phone.
- Photos only from Sahel or free-licence sources with credit. Never lift photos from other sites.
- Homepage fake sections (testimonials, world map, newsletter, fake counts) are to be fixed before public launch; do not remove them unless asked.
- Commits end with the attribution trailer the session instructions give.
