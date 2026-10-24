// Site-wide settings.
export const SITE = 'https://infosaathi.com';

// Drafts (draft: true) are shown while you run `npm run dev`, or when you build with SHOW_DRAFTS=1
// to preview them. A normal `npm run build` (what Cloudflare runs) never publishes a draft.
export const SHOW_DRAFTS = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

// AdSense publisher id. With it set, every page loads the AdSense script (needed for the site review).
// Ad boxes appear only when ADSENSE_SLOT is also set: create one responsive display ad unit in AdSense
// after approval and paste its slot number here (one unit can be reused on every box).
// Previews (npm run dev) show grey placeholders instead.
export const ADSENSE_CLIENT = 'ca-pub-9545422197271271';
export const ADSENSE_SLOT = '4825591813';
export const ADS_LIVE = Boolean(ADSENSE_CLIENT && ADSENSE_SLOT);
export const ADSENSE_SRC = ADSENSE_CLIENT ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}` : '';

// Public contact address shown on the contact, privacy and policy pages. Change it here only.
export const CONTACT_EMAIL = 'contact@infosaathi.com';
export const UPDATED = '২৪ অক্টোবর ২০২৬';

// "যোগাযোগ" button: opens WhatsApp with a ready message. Number in international form, no plus sign.
export const WHATSAPP_NUMBER = '8801730175092';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('আমি InfoSaathi থেকে আপনার সাথে যোগাযোগ করছি। আমার সাহায্যের দরকার।')}`;
