import type { ImageMetadata } from "astro";
import { site } from "../config/site";

const portraits = import.meta.glob<ImageMetadata>(
  "../assets/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
);

export function affiliationLine() {
  return [site.affiliation, site.lab]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

export function seekingFacts() {
  if (!site.seeking.active) return null;
  const roles = site.seeking.roles.map((part) => part.trim()).filter(Boolean).join(", ");
  const areas = site.seeking.areas.map((part) => part.trim()).filter(Boolean).join(", ");
  const when = site.seeking.availability.trim();
  if (!roles && !areas && !when) return null;
  return { roles, areas, when };
}

export function emailAddress() {
  return site.email.trim();
}

export function cvHref() {
  return site.cv.trim();
}

export function portrait() {
  const src = site.portrait.trim();
  return {
    src,
    image: portraits[`../assets/${src}`],
    alt: site.portraitAlt.trim() || "Portrait placeholder",
  };
}

const socialLabels = [
  ["github", "GitHub"],
  ["scholar", "Google Scholar"],
  ["linkedin", "LinkedIn"],
] as const;

export function socialLinks() {
  return socialLabels.flatMap(([key, label]) => {
    const href = site.links[key].trim();
    return href ? [{ key, label, href }] : [];
  });
}

export function isSelfAuthor(name: string) {
  const aliases = new Set(site.nameAliases.map((alias) => alias.trim().toLowerCase()));
  return aliases.has(name.trim().toLowerCase());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatAuthors(authors: string[]) {
  return authors
    .map((author) => {
      const safe = escapeHtml(author);
      return isSelfAuthor(author) ? `<strong>${safe}</strong>` : safe;
    })
    .join(", ");
}
