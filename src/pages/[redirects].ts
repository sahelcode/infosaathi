// Builds the _redirects file: every old Blogger link listed in a published data file (old_urls)
// is sent to its new page with a permanent (301) redirect, so search rankings carry over.
import type { APIRoute } from 'astro';
import { getDoctors, doctorUrl, getUniversities, universityUrl, getInstitutions, institutionUrl } from '../lib/data';
import { SHOW_DRAFTS } from '../lib/site';

export function getStaticPaths() {
  return [{ params: { redirects: '_redirects' } }];
}

export const GET: APIRoute = async () => {
  const lines = ['# Generated at build time from old_urls in src/content. Do not edit by hand.'];
  for (const d of await getDoctors()) {
    if (d.data.draft && !SHOW_DRAFTS) continue;
    for (const old of d.data.old_urls) {
      lines.push(`${old} ${doctorUrl(d)} 301`);
      // Blogger also served the same post with ?m=1 on phones; Cloudflare matches the path without the query.
    }
  }
  for (const u of await getUniversities()) {
    if (u.data.draft && !SHOW_DRAFTS) continue;
    for (const old of u.data.old_urls) lines.push(`${old} ${universityUrl(u)} 301`);
  }
  for (const i of await getInstitutions()) {
    if (i.data.draft && !SHOW_DRAFTS) continue;
    for (const old of i.data.old_urls) lines.push(`${old} ${institutionUrl(i)} 301`);
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
