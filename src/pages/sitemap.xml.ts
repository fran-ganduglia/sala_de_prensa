import { getNews, sectionHref, siteSections, slugOf } from "../lib/news";
import type { APIRoute } from "astro";

function escapeXml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] || character,
  );
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site || new URL("https://lanusaladeprensa.com/");
  const news = await getNews();
  const staticPaths = ["/", "/privacidad/", ...siteSections.map(sectionHref)];
  const urls = [
    ...staticPaths.map((path) => ({ loc: new URL(path, siteUrl).href })),
    ...news.map((entry) => ({
      loc: new URL(`/noticias/${slugOf(entry)}/`, siteUrl).href,
      lastmod: (entry.data.updatedAt || entry.data.publishedAt).toISOString(),
    })),
  ];
  const body = urls
    .map(
      ({ loc, lastmod }) =>
        `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    },
  );
};
