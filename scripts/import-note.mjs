import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const args = process.argv.slice(2);
const positionals = [];
let slugFlag = "";
let force = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") {
    force = true;
  } else if (arg === "--slug") {
    slugFlag = args[index + 1] ?? "";
    index += 1;
  } else if (arg.startsWith("--slug=")) {
    slugFlag = arg.slice("--slug=".length);
  } else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else if (arg.startsWith("-")) {
    console.error(`Unknown option: ${arg}`);
    printHelp();
    process.exit(1);
  } else {
    positionals.push(arg);
  }
}

if (positionals.length !== 1) {
  printHelp();
  process.exit(1);
}

const sourceFile = path.resolve(positionals[0]);
if (!existsSync(sourceFile) || !statSync(sourceFile).isFile()) {
  console.error(`Cannot read ${sourceFile}`);
  process.exit(1);
}

const sourceDir = path.dirname(sourceFile);
const raw = readFileSync(sourceFile, "utf8");
const { data, body } = splitFrontmatter(raw);
const slug = slugFlag || slugify(path.basename(sourceFile, path.extname(sourceFile)));
const destDir = path.resolve("src/content/blog", slug);
const destFile = path.join(destDir, "index.md");
const blogRoot = path.resolve("src/content/blog");

if (!destDir.startsWith(`${blogRoot}${path.sep}`)) {
  console.error("Refusing to write outside src/content/blog.");
  process.exit(1);
}

if (existsSync(destFile) && !force) {
  console.error(`Refusing to overwrite ${path.relative(process.cwd(), destFile)}. Pass --force to replace it.`);
  process.exit(1);
}

const hadTitle = typeof data.title === "string" && data.title.trim().length > 0;
const hadDescription = typeof data.description === "string" && data.description.trim().length > 0;
const hadDate = normalizeDate(data.date) !== null;
const inferredTitle = inferTitle(body);
const title = hadTitle ? data.title.trim() : inferredTitle || "TODO: add title";
const description = hadDescription ? data.description.trim() : "TODO: add a short summary";
const date = hadDate ? normalizeDate(data.date) : "2026-01-01";
const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];

mkdirSync(destDir, { recursive: true });
copyImages(body, sourceDir, destDir);

const frontmatter = [
  "---",
  "# Imported as a draft. Confirm the fields below, then set draft: false to publish.",
  titleLine(title, hadTitle, inferredTitle),
  hadDescription ? `description: ${JSON.stringify(description)}` : 'description: "TODO: add a short summary"',
  hadDate ? `date: ${date}` : `date: ${date} # TODO: set the original date`,
  tags.length > 0 ? `tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]` : "tags: []",
  "draft: true",
  ...(data.projectId ? [`projectId: ${JSON.stringify(String(data.projectId))}`] : []),
  "---",
  "",
].join("\n");

writeFileSync(destFile, `${frontmatter}${body.endsWith("\n") ? body : `${body}\n`}`);

console.log(`Imported draft: ${path.relative(process.cwd(), destFile)}`);
if (!hadTitle) console.log("- title still needs confirmation");
if (!hadDescription) console.log("- description is a TODO");
if (!hadDate) console.log("- date is a placeholder");
console.log("The note stays unpublished until you set draft: false.");

function printHelp() {
  console.log("Usage: npm run import-note -- <note.md> [--slug name] [--force]");
  console.log("Copies the note and its relative images into src/content/blog as a draft.");
}

function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  const parsed = parse(match[1]);
  if (parsed === null || parsed === undefined) return { data: {}, body: text.slice(match[0].length) };
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Frontmatter must be a mapping.");
  }
  return { data: parsed, body: text.slice(match[0].length) };
}

function inferTitle(text) {
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = /^#\s+(.+?)\s*$/.exec(line);
    return match ? match[1].trim() : "";
  }
  return "";
}

function titleLine(value, hadTitle, inferred) {
  const quoted = `title: ${JSON.stringify(value)}`;
  if (hadTitle) return quoted;
  if (inferred) return `${quoted} # TODO: confirm title`;
  return quoted;
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    console.error("Could not derive a slug. Pass --slug.");
    process.exit(1);
  }
  return slug;
}

function copyImages(text, fromDir, toDir) {
  for (const reference of imageReferences(text)) {
    if (isRemote(reference)) continue;
    let decoded = reference;
    try {
      decoded = decodeURI(reference);
    } catch {
      throw new Error(`Could not decode image path ${reference}`);
    }
    if (decoded.includes("\0")) throw new Error(`Unsafe image path ${reference}`);

    const source = path.resolve(fromDir, decoded);
    const relative = path.relative(fromDir, source);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Image "${reference}" is outside the note directory. Move it beside the note before importing.`,
      );
    }
    if (!existsSync(source) || !statSync(source).isFile()) {
      throw new Error(`Missing image "${reference}".`);
    }

    const destination = path.resolve(toDir, relative);
    if (!destination.startsWith(`${path.resolve(toDir)}${path.sep}`)) {
      throw new Error(`Refusing to copy ${reference} outside the note folder.`);
    }
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
}

function imageReferences(text) {
  const refs = [];
  for (const match of text.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)) {
    let raw = match[1].trim();
    if (raw.startsWith("<")) {
      const end = raw.indexOf(">");
      raw = raw.slice(1, end === -1 ? undefined : end).trim();
    } else {
      raw = raw.split(/\s+/)[0];
    }
    if (raw) refs.push(raw);
  }
  for (const match of text.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
    refs.push(match[1].trim());
  }
  return refs;
}

function isRemote(reference) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference) || reference.startsWith("/");
}
