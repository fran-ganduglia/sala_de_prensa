import { getCollection } from 'astro:content';

export const slugOf = (entry: { id: string }) => entry.id.replace(/\.md$/, '');

export async function getNews() {
  const entries = await getCollection('news');
  return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(date);
}
