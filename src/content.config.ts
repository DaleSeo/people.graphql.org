import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const stories = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/stories' }), schema: z.object({ title: z.string(), name: z.string(), description: z.string(), category: z.string(), color: z.string(), initials: z.string(), order: z.number(), sample: z.boolean().default(false) }) });
const stars = defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/stars' }), schema: z.object({ name: z.string(), initials: z.string(), year: z.number().int(), contribution: z.string().optional(), tsc: z.boolean().default(false), github: z.string().regex(/^[a-zA-Z0-9-]+$/).optional(), avatar: z.string().url().optional() }) });
export const collections = { stories, stars };
