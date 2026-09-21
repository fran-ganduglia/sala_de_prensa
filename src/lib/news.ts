import { getCollection } from 'astro:content';

export const slugOf = (entry: { id: string }) => entry.id.replace(/\.md$/, '');

const imagePositions = new Set(['0% 0%', '50% 0%', '100% 0%', '0% 50%', '50% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%']);

export function imagePosition(value?: string) {
  return value && imagePositions.has(value) ? value : '50% 50%';
}

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
