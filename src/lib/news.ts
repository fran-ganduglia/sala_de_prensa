import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export const siteSections = ['Actualidad', 'Política', 'Deportes', 'Cultura'] as const;
export type SiteSection = typeof siteSections[number];

const sectionSlugs: Record<SiteSection, string> = {
  Actualidad: 'actualidad',
  Política: 'politica',
  Deportes: 'deportes',
  Cultura: 'cultura',
};

export const slugOf = (entry: { id: string }) => entry.id.replace(/\.md$/, '');

export function sectionSlug(section: SiteSection) {
  return sectionSlugs[section];
}

export function sectionHref(section: SiteSection) {
  return `/${sectionSlug(section)}/`;
}

export function sectionFromSlug(slug?: string): SiteSection | undefined {
  return siteSections.find((section) => sectionSlug(section) === slug);
}

const imagePositions = new Set(['0% 0%', '50% 0%', '100% 0%', '0% 50%', '50% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%']);

export function imagePosition(value?: string) {
  return value && imagePositions.has(value) ? value : '50% 50%';
}

export async function getNews() {
  const entries = await getCollection('news');
  return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

type NewsEntry = CollectionEntry<'news'>;

export function sectionsOf(entry: NewsEntry): string[] {
  return [...new Set([entry.data.primarySection || 'Actualidad', ...entry.data.sections])];
}

export function newsForSection(entries: NewsEntry[], section: SiteSection) {
  return entries.filter((entry) => sectionsOf(entry).includes(section));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(date);
}
