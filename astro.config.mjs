// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://infosaathi.com',
  trailingSlash: 'always',
  integrations: [sitemap({ customPages: ['https://infosaathi.com/'] })],
  build: { inlineStylesheets: 'auto' },
});
