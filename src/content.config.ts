import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const video = z.object({
  type: z.enum(['Archivo propio', 'YouTube', 'Instagram']),
  url: z.string().optional(),
  caption: z.string().optional(),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.preprocess((input) => {
    if (!input || typeof input !== 'object') return input;
    const entry = input as Record<string, unknown>;
    const classification = (entry.classification || {}) as Record<string, unknown>;
    const media = (entry.media || {}) as Record<string, unknown>;
    return { ...entry, ...classification, ...media };
  }, z.object({
    title: z.string().min(1),
    summary: z.string().optional().default(''),
    primarySection: z.string().optional(),
    sections: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    image: z.string().optional(),
    imagePosition: z.string().optional(),
    imageCredit: z.string().optional(),
    gallery: z.array(z.object({ image: z.string(), caption: z.string().optional() })).default([]),
    videos: z.array(video).default([]),
  })),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/home' }),
  schema: z.object({
    main: z.string().optional(),
    urgent: z.string().optional(),
    featured: z.array(z.object({ story: z.string() })).default([]),
  }),
});

export const collections = { news, home };
