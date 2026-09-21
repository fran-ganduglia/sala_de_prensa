import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.replace(/\/$/, '') || 'https://lanusaladeprensa.com';

export default defineConfig({
  output: 'static',
  site,
});
