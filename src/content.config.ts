import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), {
    message: "Use a root-relative path or an http(s) URL.",
  });

function entryId({ entry }: { entry: string }) {
  return entry.replace(/\.[^.]+$/, "").replace(/\/index$/, "");
}

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/projects",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    problem: z.string().min(1),
    contribution: z.string().min(1),
    outcome: z.string().min(1),
    date: z.coerce.date(),
    links: z
      .object({
        code: link.optional(),
        demo: link.optional(),
      })
      .optional(),
  }),
});

const publications = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/publications",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string().min(1),
    authors: z.array(z.string().min(1)).min(1),
    venue: z.string().min(1),
    year: z.number().int(),
    month: z.number().int().min(1).max(12).optional(),
    representative: z.boolean().default(false),
    projectId: z.string().min(1).optional(),
    links: z
      .object({
        paper: link.optional(),
        code: link.optional(),
      })
      .optional(),
  }),
});

const experience = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/experience",
    generateId: entryId,
  }),
  schema: z.object({
    organization: z.string().min(1),
    team: z.string().min(1).optional(),
    role: z.string().min(1),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    highlights: z.array(z.string().min(1)).min(1),
    projectIds: z.array(z.string().min(1)).default([]),
    noteIds: z.array(z.string().min(1)).default([]),
  }),
});

const education = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/education",
    generateId: entryId,
  }),
  schema: z.object({
    school: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    advisor: z.string().min(1).optional(),
    lab: z.string().min(1).optional(),
    thesis: z.string().min(1).optional(),
    thesisUrl: link.optional(),
  }),
});

const news = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/news",
    generateId: entryId,
  }),
  schema: z.object({
    date: z.coerce.date(),
    content: z.string().min(1),
    href: link.optional(),
    linkLabel: z.string().min(1).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(true),
    projectId: z.string().min(1).optional(),
  }),
});

export const collections = {
  projects,
  publications,
  experience,
  education,
  news,
  blog,
};
