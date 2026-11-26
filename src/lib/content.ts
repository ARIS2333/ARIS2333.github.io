import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { site } from "../config/site";

export type Project = CollectionEntry<"projects">;
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

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => byTimeDesc(a.data.date.getTime(), b.data.date.getTime()));
}

export async function getProject(id: string) {
  const project = await getEntry("projects", id);
  if (!project) throw new Error(`Missing project "${id}".`);
  return project;
}

export async function getFeaturedProjects() {
  const ids = site.featuredWork;
  if (ids.length < 1 || ids.length > 2) {
    throw new Error("site.featuredWork must list 1 or 2 project ids.");
  }
  const projects = await Promise.all(ids.map((id) => getProject(id)));
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new Error("site.featuredWork contains a duplicate project id.");
  }
  return projects;
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

export async function getPublicationsForProject(projectId: string) {
  const publications = await getPublications();
  const related = publications.filter((item) => item.data.projectId === projectId);
  for (const item of related) {
    if (item.data.projectId) await getProject(item.data.projectId);
  }
  return related;
}

export async function getExperience() {
  const entries = await getCollection("experience");
  const sorted = entries.sort((a, b) => byTimeDesc(a.data.start.getTime(), b.data.start.getTime()));
  return Promise.all(
    sorted.map(async (entry) => {
      const relatedProjects = await Promise.all(entry.data.projectIds.map((id) => getProject(id)));
      const relatedNotes: Post[] = [];
      for (const id of entry.data.noteIds) {
        const note = await getEntry("blog", id);
        if (!note) throw new Error(`Experience "${entry.id}" references missing note "${id}".`);
        if (!isPublished(note)) continue;
        relatedNotes.push(note);
      }
      return { entry, relatedProjects, relatedNotes };
    }),
  );
}

export async function getEducation() {
  const entries = await getCollection("education");
  return entries.sort((a, b) => byTimeDesc(a.data.start.getTime(), b.data.start.getTime()));
}

export async function getNews() {
  const entries = await getCollection("news");
  return entries.sort((a, b) => byTimeDesc(a.data.date.getTime(), b.data.date.getTime()));
}

export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => data.draft === false);
  return posts.sort((a, b) => byTimeDesc(a.data.date.getTime(), b.data.date.getTime()));
}

export async function getPublishedNotesForProject(projectId: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.projectId === projectId);
}

export async function assertContentLinks() {
  const [posts, publications] = await Promise.all([
    getCollection("blog"),
    getCollection("publications"),
  ]);

  for (const post of posts) {
    if (post.data.projectId) await getProject(post.data.projectId);
  }

  for (const publication of publications) {
    if (publication.data.projectId) await getProject(publication.data.projectId);
  }

  await getExperience();
  await getFeaturedProjects();
}
