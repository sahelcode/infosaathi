// Site-wide settings.
export const SITE = 'https://infosaathi.com';

// Drafts (draft: true) are shown while you run `npm run dev`, or when you build with SHOW_DRAFTS=1
// to preview them. A normal `npm run build` (what Cloudflare runs) never publishes a draft.
export const SHOW_DRAFTS = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

// AdSense: put your publisher id here (ca-pub-XXXXXXXXXXXXXXXX) when the new site is approved.
// Until then the published site shows no ad boxes; previews show grey placeholders.
export const ADSENSE_CLIENT = '';
