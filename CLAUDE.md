# InfoSaathi: working rules for Claude sessions

Site: infosaathi.com. Astro static site on Cloudflare, content in YAML files under `src/content/`. Cloudflare deploys automatically after `git push` to the main branch.
Owner: Sahel Ahmed (Sylhet). Reply to him in Bengali. Disagree directly when an idea is weak. Remind him: one thing done well beats ten done mediocrely (no feature creep).

## Task type: ADD A DOCTOR (the most common task)

Trigger: Sahel sends doctor data plus two photos. Do ONLY this task in that session: no layout, CSS or template changes, no other features. If he asks for one, remind him to finish doctor data first.

### Input from Sahel
- Bangla name, English name, specialty (key from `src/lib/taxonomy.ts`), city.
- Chamber(s): hospital (an existing file in `src/content/hospitals/`) or own name + address; room; days; start/end time; fee if known (one amount: `fee: { visit: N }`; separate amounts: `new`, `old`, `report`) (a missing fee shows "কল করে জানুন" automatically; do not log chamber fees in `docs/data-gaps.md`).
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
   - The page always shows the পরীক্ষার ফি card (after সুবিধাসমূহ); with no data the common tests show "যুক্ত হয়নি" instead of the amount. The কেবিন/আইসিইউ খরচ card shows ONLY when you list `rates:`. List only room types the hospital really has (government hospitals: general/free ward, paying ward, cabin; private: ward, cabin, suite; ICU/HDU/CCU/NICU only if it has them). An item may omit `price` when the amount is unknown (shows "যুক্ত হয়নি"). If you cannot tell what rooms exist, leave `rates:` out. Never invent amounts or room types. Use the word "বেড" (not শয্যা) in text.
   - "রোগী দেখার সময়" shows "ডাক্তারের সময় অনুযায়ী" by default; set `visiting_hours` only if the hospital publishes real visiting hours for patients' relatives.
5. FAQ (`faq:`) 4-6 extra questions (the page already adds honest "আমরা সঠিক তথ্য পাইনি" answers for পরীক্ষার ফি, কেবিন ভাড়া, আইসিইউ খরচ unless you add your own sourced answer to the same question; when you find the figure, write it in `faq:`/`tests`) people search, direct answer in the first sentence, consistent with the data. The page already adds: যোগাযোগ নম্বর ও হটলাইন নাম্বার কী, সিরিয়াল, ঠিকানা, জরুরি বিভাগ, রোগী দেখার সময়, কোন বিশেষজ্ঞ বসেন. Add from: শয্যা/ICU, MRI-CT আছে কি, কোন কোন বিভাগে ডাক্তার, অ্যাম্বুলেন্স, পরীক্ষার ফি (only if published), ভর্তি/কেবিন ভাড়া (only if published).
6. Sources: maximum 2 (see SOURCES RULE), official pages first.
7. Build, open `dist/hospital/<city>/<slug>/index.html` (title, one h1, JSON-LD Hospital/FAQPage/Breadcrumb, phones equal the data). Playwright 360/390: no overflow, no JS error, the "কল করুন" sheet opens. Look at a screenshot.
8. One commit, `git pull --rebase`, `git push`. Report in Bengali: files, live path `https://infosaathi.com/hospital/<city>/<slug>/`, gaps written to `docs/data-gaps.md`, mismatches found.

## Task type: ADD A COLLEGE / SCHOOL / CADET COLLEGE (`src/content/institutions/`)

Trigger: Sahel sends a college/school name (often with the old Blogger link) plus images. Do ONLY this task in that session (no layout/CSS/template changes, no other features).

### Input and research
- Name, city/district, old Blogger link (also listed in `docs/old-posts-plan.csv`). Images: FIRST = logo, SECOND = cover photo (look; if content contradicts the order trust the content and say so). No images: build without `logo`/`photo` and say so.
- Research the same way as universities: official website first (admission notices, contact, about), then education board / DSHE / reputable news for facts the site lacks. Collect: address, est., EIIN, board, affiliation (National University for degree/honours colleges), levels, gender, phone numbers WITH the college's own labels, email, subjects (honours), seats, fees from the latest official admission notice, HSC results only from the board or reputable news. Every number must be traceable; last-year figures only if labelled "গত বছর".
- Missing facts: never delete the field. The page shows "আমরা সঠিক তথ্য পাইনি". Record each gap in `docs/data-gaps.md`.

### Steps
1. Read `src/content/institutions/_template.yaml` and `naogaon-government-college.yaml` (finished example) and the `institutions` schema in `src/content.config.ts`.
2. `kind` college | cadet | school | school_college | madrasa. Slug = English name lowercase hyphenated (+ city if needed). If the file exists, update in place.
3. Images: logo PNG max 400 px (do not crop the emblem), cover JPEG max 1600 px wide, quality 82; save under `src/content/institutions/images/<slug>-logo.png` and `<slug>.jpg`; set `logo:` and `photo:` as `./images/...`. LOOK at both. Tell Sahel about any watermark before publishing.
4. YAML per the template. The page shows a "বিভাগসমূহ" tile card automatically: for a college it always shows এইচএসসি, ডিগ্রি (পাস), অনার্স, মাস্টার্স (a level not in `levels` shows "যুক্ত হয়নি"), plus any extra level you list (diploma, BM, professional masters). So `levels` must list EVERY level the college really offers (check the official site and a second page), `streams: [বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা]` = HSC groups, `subjects` = every honours department from the official page (the honours tile shows the count), `faculties` only when departments are not listed. Also fill `eiin` (two independent pages must agree, e.g. the official site plus BANBEIS-based directories such as eduportalbd), `gender`, `students` (official figure, with 'প্রায়'), `board`. `old_urls: [/2025/07/....html]` = the old Blogger path (path only, no domain; take it from `docs/old-posts-plan.csv`, never guess). `about`: 2-3 plain factual sentences (the page shows it as the পরিচিতি card just before the contact numbers). `faq`: 3-5 extra real questions with direct first-sentence answers, consistent with the data (the page already adds EIIN, founded, levels, honours subjects, address, contact number).
5. Sources: maximum 2, official first. `verified:` today, `verified_by: official` (or phone if Sahel confirmed). Use `draft: true` only if the data is too thin to publish, and say why.
6. `npm run build` must pass BEFORE pushing. Open `dist/college/<city>/<slug>/index.html` (or `dist/school/...`): one h1, JSON-LD, phones equal the data. Playwright at 360 and 390 px: no overflow, no JS error; look at one screenshot (header, "এক নজরে", contact rows).
7. One commit per item, `git pull --rebase`, `git push`. Report in Bengali: files, live path, gaps, conflicts, anything unopened.

## Task type: ADD OR UPDATE AN APP (`src/content/apps/`)

Trigger: Sahel sends an app name (often with a logo, a Play Store link, or a priority). Do ONLY this task in that session (no layout/CSS/template changes, no other features; remind him if he asks for one).

### Input from Sahel
- App name, the exact Play Store link, the logo image (square), whether it is our own app, and an optional priority 1-3.
- Missing the exact link: use the official Play Store page only if you can open it or the developer's official site shows it; otherwise keep the search link `https://play.google.com/store/search?q=<name>&c=apps` and say so. Never guess a package id.
- Missing logo: build without `logo` (a coloured monogram shows) and say so. Logos come from Sahel or the app's own brand page he points to; never lift one from a random site.

### Steps
1. Read `src/content/apps/_template.yaml`, one finished app (`hifz-quran.yaml`) and the `apps` schema in `src/content.config.ts`.
2. Slug = app name lower case, hyphenated. If the file exists, update it in place.
3. `desc`: one short plain Bangla line saying what the app does (from the store page or the official site). No ratings, download counts or claims you cannot source.
4. Logo: square PNG, 256-512 px (resize only down, never enlarge, do not crop the emblem; if the image is not square, pad it with transparent edges). Save as `src/content/apps/images/<slug>.png`, set `logo: "./images/<slug>.png"`. LOOK at it (Read tool).
5. `priority` (optional, 1, 2 or 3): shown before every other app, in that order, on the home page and on /apps/. Only three exist. If Sahel gives a number that is already used, ask which app gives it up. Apps without a priority follow by `order` (lower first). `draft: true` hides an app everywhere without deleting it. `own: true` only for our own apps (button says Play Store).
6. The home page shows the first 8 apps, /apps/ the first 30 (then "আরও দেখুন").
7. `npm run build` must pass (check the real exit code and that `dist/index.html` and `dist/apps/index.html` are not empty). Check `dist/apps/index.html` for the order and the logo `<img>`. Playwright at 360 and 1280: no horizontal overflow, the logo loads, the home "Useful apps" row and /apps/ both look right; look at one screenshot of each.
8. One commit, `git pull --rebase`, `git push`. Report in Bengali: files, what link was used (exact or search), the priority order now, anything left out and why.

## Task type: UPDATE UNIVERSITY RANKINGS (`src/content/rankings/`)

Trigger: Sahel asks to update the ranking (a new QS edition, a correction, or more rows). Do ONLY this task in that session. No layout/CSS/template changes. Filters such as "world top 10" or "India top 10" are a new feature that needs sourced data for each list: do not build them, remind him to finish the data first.

### How the site uses it
- One YAML per edition (`qs-2027.yaml`). `getRankings()` sorts by `year` (newest first) and the home page and /rankings/ use the FIRST file. Never add two files with the same `year` (the home page would pick one at random). A second ranking system needs a decision from Sahel first.
- The home page shows the first 5 rows as a numbered list (01-05, name and English name, no rank column), so `rows` must be in the source's rank order, best first. Ties and bands that the source lists alphabetically stay alphabetical.

### Steps
1. Read `src/content/rankings/qs-2027.yaml` and the `rankings` schema in `src/content.config.ts`.
2. Sources: the official ranking page first (QS: topuniversities.com). If the workspace cannot open it (WebFetch usually fails there), use WebSearch to find reputable reports (Daily Star, Prothom Alo, The Financial Express, the universities' own pages). A rank goes live only when the official page states it, or when two independent pages agree. If they disagree, prefer the official and newest one, otherwise leave that university out and say so. Research text pasted by Sahel from another AI is a lead, not a source.
3. Rows: `name_bn`, `name_en`, `rank` exactly as the ranking states it, in Bangla digits ("৬০০", "৭১১–৭২০", "১,৪০১+"). `prev` and `trend` ONLY if the source states last year's rank. `university:` ONLY if a page for that university exists in `src/content/universities/` (use the file name). Never guess a band.
4. `system`, `year`, one `source_url` (the best page), `note` (plain Bangla: how many Bangladeshi universities, which source was used and what could not be opened, and that the ranking is not ours), `verified: <today>`.
5. Do not delete the old edition file; the newer `year` takes over automatically.
6. `npm run build` (real exit code, `dist/index.html` not empty). Check the home list and /rankings/ in `dist`, then Playwright at 360 and 1280: the numbered list, no overflow; look at one screenshot.
7. One commit, `git pull --rebase`, `git push`. Report in Bengali: what changed, sources used, rows that disagreed or could not be verified.

## DATA GAPS (applies to doctors, universities, hospitals)
- Before marking any field missing, do maximum research: official site, at least 3 searches in Bangla and English, news. Only then leave it out (the page shows "আমরা সঠিক তথ্য পাইনি").
- Every missing field is recorded in `docs/data-gaps.md`: one row per item with `type | file | field | what was searched | date`. Update the row instead of duplicating.
- When Sahel later sends new data for doctors, universities or hospitals in one batch: read `docs/data-gaps.md` first, update every named file, fill the gaps he covered, set `verified:` to today's date ONLY on files whose data changed, remove the resolved rows from `docs/data-gaps.md`, then build, test and push once.
- A gap that research can fill is not a gap: fill it before writing the row.

## BATCH WORK AND RESEARCH DEPTH (universities, hospitals, doctors)
- Sahel may send 5-10 items at once. Do them one by one in this order: research, YAML, images, then ONE build, test pass and push for the batch (one commit per item). For universities and hospitals use one sub-agent per item for the research step so each item gets full attention; the main session merges, runs the build, checks every page and pushes. If a batch is too big to do well, say so and split it.
- Research depth per university/hospital: the official site first, then up to 10 other pages (UGC or ministry, ranking pages, hospital/university notices, reputable newspapers, Wikipedia only for background). A number goes live only when the official site states it, or when two independent pages agree. If sources disagree, prefer the official and newest one, otherwise leave the field as a gap. Only the best 2 are listed as sources (SOURCES RULE).
- Research text pasted by Sahel from another AI (Gemini, ChatGPT, etc.) is a lead, not a source: verify each fact on an official or reputable page before using it, and never copy it as is.
- Claude Code cannot call Gemini or ChatGPT; it researches with web search and page fetching only.
- At the end, report per item: filled, gaps (also written to `docs/data-gaps.md`), conflicts found.

## WRITING STYLE (all pages)
- Plain, short, everyday Bangla. One fact per sentence. No scholarly or wordy phrasing, no extra explanations, no filler such as "সাইটে দেওয়া নেই"; if a fact is missing, the page already shows "আমরা সঠিক তথ্য পাইনি" or "যুক্ত হয়নি".
- Never remove a field because data is missing: keep every field/row and let the page show "আমরা সঠিক তথ্য পাইনি" / "যুক্ত হয়নি".

## SOURCES RULE (all content types)
- Maximum 2 sources per file (enforced by the schema): the official website (or the official page that holds the facts) first, then the single most useful second page (the official fee/admission/notice page, or one reputable news article), only if it helps trust or SEO. Never more than 2. Prefer the official page that holds the most numbers.
- If more pages were used, keep the facts but list only the 2 best; every number must still be consistent with those pages.

## Other rules
- AI-researched data must carry sources and honest badges; Sahel verifies by phone.
- Photos only from Sahel or free-licence sources with credit. Never lift photos from other sites.
- Homepage fake sections (testimonials, world map, newsletter, fake counts) are to be fixed before public launch; do not remove them unless asked.
- Commits end with the attribution trailer the session instructions give.
