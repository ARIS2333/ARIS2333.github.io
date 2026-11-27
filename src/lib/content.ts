import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type Publication = CollectionEntry<"publications">;
export type ExperienceEntry = CollectionEntry<"experience">;
export type EducationEntry = CollectionEntry<"education">;
export type NewsEntry = CollectionEntry<"news">;
export type Post = CollectionEntry<"blog">;

function byTimeDesc(a: number, b: number) {
  return b - a;
}

export function isPublished(post: Post) {
  return post.data.draft === false;
}

export async function getPublications() {
  const publications = await getCollection("publications");
  return publications.sort((a, b) => {
    const rank = (item: Publication) => item.data.year * 100 + (item.data.month ?? 0);
    return byTimeDesc(rank(a), rank(b));
  });
}

export function groupByYear(publications: Publication[]) {
  const groups: { year: number; items: Publication[] }[] = [];
  for (const item of publications) {
    const current = groups.at(-1);
    if (!current || current.year !== item.data.year) {
      groups.push({ year: item.data.year, items: [item] });
    } else {
      current.items.push(item);
    }
  }
  return groups;
}

export async function getExperience() {
  const entries = await getCollection("experience");
  const sorted = entries.sort((a, b) => byTimeDesc(a.data.start.getTime(), b.data.start.getTime()));
  return Promise.all(
    sorted.map(async (entry) => {
      const relatedNotes: Post[] = [];
      for (const id of entry.data.noteIds) {
        const note = await getEntry("blog", id);
        if (!note) throw new Error(`Experience "${entry.id}" references missing note "${id}".`);
        if (!isPublished(note)) continue;
        relatedNotes.push(note);
      }
      return { entry, relatedNotes };
    }),
  );
}

export async function getEducation() {
  const entries = await getCollection("education");
  const recency = (end?: Date) => (end ? end.getTime() : Number.POSITIVE_INFINITY);
  return entries.sort(
    (a, b) =>
      byTimeDesc(recency(a.data.end), recency(b.data.end)) ||
      byTimeDesc(a.data.start.getTime(), b.data.start.getTime()),
  );
}

export async function getNews() {
  const entries = await getCollection("news");
  return entries.sort((a, b) => byTimeDesc(a.data.date.getTime(), b.data.date.getTime()));
}

export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => data.draft === false);
  return posts.sort((a, b) => byTimeDesc(a.data.date.getTime(), b.data.date.getTime()));
}

export function taxonomySlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error(`Cannot build a slug for "${name}".`);
  return slug;
}

export function sectionHref(name: string) {
  return `/blog/section/${taxonomySlug(name)}`;
}

export function tagHref(name: string) {
  return `/blog/tag/${taxonomySlug(name)}`;
}

export function noteCount(count: number) {
  return count === 1 ? "1 note" : `${count} notes`;
}

export function sortPostsByDate<T extends { data: { date: Date } }>(posts: T[], direction: "asc" | "desc" = "asc") {
  return [...posts].sort((a, b) => {
    const delta = a.data.date.getTime() - b.data.date.getTime();
    return direction === "asc" ? delta : -delta;
  });
}

function groupPosts(posts: Post[], namesFor: (post: Post) => string[]) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    for (const raw of namesFor(post)) {
      const name = raw.trim();
      if (!name) continue;
      const list = groups.get(name) ?? [];
      list.push(post);
      groups.set(name, list);
    }
  }
  const items = [...groups.entries()].map(([name, grouped]) => ({
    name,
    slug: taxonomySlug(name),
    posts: grouped,
  }));
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) throw new Error(`Duplicate blog slug "${item.slug}".`);
    seen.add(item.slug);
  }
  return items.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export async function getBlogSections() {
  const posts = await getPublishedPosts();
  return groupPosts(posts, (post) => (post.data.category ? [post.data.category] : []));
}

export async function getBlogTags() {
  const posts = await getPublishedPosts();
  return groupPosts(posts, (post) => post.data.tags);
}

export async function assertContentLinks() {
  await getExperience();
}
