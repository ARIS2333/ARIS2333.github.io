import { site } from "../config/site";

export function affiliationLine() {
  return [site.affiliation, site.lab]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

export function seekingText() {
  if (!site.seeking.active) return "";
  return [
    ...site.seeking.roles,
    ...site.seeking.areas,
    site.seeking.availability,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

export function emailAddress() {
  return site.email.trim();
}

export function cvHref() {
  return site.cv.trim();
}

export function portrait() {
  return {
    src: site.portrait.trim() || "/images/portrait.svg",
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
    return href ? [{ label, href }] : [];
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
