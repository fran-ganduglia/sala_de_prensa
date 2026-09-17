import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.replace(/\/$/, '') || 'https://lanusaladeprensa.netlify.app';

export default defineConfig({
  output: 'static',
  site,
});
