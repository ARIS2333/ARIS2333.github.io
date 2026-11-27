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
    status: z.enum(["accepted"]).optional(),
    summary: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).default([]),
    links: z
      .object({
        paper: link.optional(),
        pdf: link.optional(),
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
    precision: z.enum(["year", "month"]).default("month"),
    advisor: z.string().min(1).optional(),
    detail: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
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
    label: z.string().min(1),
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
    category: z.string().trim().min(1).optional(),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(true),
  }),
});

export const collections = {
  publications,
  experience,
  education,
  news,
  blog,
};
