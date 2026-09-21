import type { APIRoute } from 'astro';
import { getNews, slugOf } from '../lib/news';

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] || character);
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site || new URL('https://lanusaladeprensa.com/');
  const news = await getNews();
  const items = news.map((entry) => {
    const url = new URL(`/noticias/${slugOf(entry)}/`, siteUrl).href;
    const description = entry.data.summary || entry.data.title;
    return `<item>\n<title>${escapeXml(entry.data.title)}</title>\n<link>${escapeXml(url)}</link>\n<guid isPermaLink="true">${escapeXml(url)}</guid>\n<description>${escapeXml(description)}</description>\n<pubDate>${entry.data.publishedAt.toUTCString()}</pubDate>\n<category>${escapeXml(entry.data.primarySection)}</category>\n</item>`;
  }).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n<title>Sala de Prensa</title>\n<link>${escapeXml(siteUrl.href)}</link>\n<description>Actualidad, política, deportes y cultura de Lanús.</description>\n<language>es-ar</language>\n<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${items}\n</channel></rss>\n`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
};
