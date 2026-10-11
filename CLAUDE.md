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

## Other rules
- AI-researched data must carry sources and honest badges; Sahel verifies by phone.
- Photos only from Sahel or free-licence sources with credit. Never lift photos from other sites.
- Homepage fake sections (testimonials, world map, newsletter, fake counts) are to be fixed before public launch; do not remove them unless asked.
- Commits end with the attribution trailer the session instructions give.
