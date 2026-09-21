import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const stories = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/stories' }), schema: z.object({ title: z.string(), name: z.string(), description: z.string(), color: z.string(), initials: z.string(), publishedAt: z.coerce.date(), location: z.string().optional(), links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]), hero: z.object({ src: z.string(), alt: z.string(), caption: z.string() }).optional() }) });
const stars = defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/stars' }), schema: z.object({ name: z.string(), initials: z.string(), year: z.number().int(), contribution: z.string().optional(), tsc: z.boolean().default(false), github: z.string().regex(/^[a-zA-Z0-9-]+$/).optional(), avatar: z.string().regex(/^\/avatars\/[a-zA-Z0-9-]+\.png$/).optional() }) });
export const collections = { stories, stars };
