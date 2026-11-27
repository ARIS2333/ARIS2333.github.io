import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../scripts/import-note.mjs", import.meta.url));
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

function fixture(t, body, files = []) {
  const root = mkdtempSync(path.join(tmpdir(), "cv-import-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, "source");
  mkdirSync(source);
  for (const file of files) {
    const target = path.join(source, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, image);
  }
  const note = path.join(source, "note.md");
  writeFileSync(note, `# Note\n\n${body}\n`);
  const result = spawnSync(process.execPath, [script, note], { cwd: root, encoding: "utf8" });
  return { ...result, destination: path.join(root, "src/content/blog/note") };
}

test("imports full, collapsed, and shortcut image references without changing the Markdown", (t) => {
  const body = [
    "![First][Mixed LABEL]",
    "![collapsed][]",
    "![shortcut]",
    "![Again][mixed label]",
    "",
    '[mixed label]: <./images/photo one.svg> "Caption"',
    "[collapsed]: ./images/collapsed.svg",
    "[shortcut]: ./images/shortcut.svg",
  ].join("\n");
  const files = ["images/photo one.svg", "images/collapsed.svg", "images/shortcut.svg"];
  const result = fixture(t, body, files);
  assert.equal(result.status, 0, result.stderr);
  for (const file of files) assert.equal(readFileSync(path.join(result.destination, file), "utf8"), image);
  const imported = readFileSync(path.join(result.destination, "index.md"), "utf8");
  assert.ok(imported.endsWith(`# Note\n\n${body}\n`));
  assert.match(imported, /draft: true/);
});

test("keeps inline and HTML image imports working with encoded spaces and parentheses", (t) => {
  const files = ["images/inline.svg", "images/photo (1).svg", "images/html.svg"];
  const result = fixture(t, [
    '![Inline](./images/inline.svg "Title")',
    "![Encoded](./images/photo%20(1).svg)",
    '<img src="./images/html.svg" alt="HTML image">',
  ].join("\n\n"), files);
  assert.equal(result.status, 0, result.stderr);
  for (const file of files) assert.equal(readFileSync(path.join(result.destination, file), "utf8"), image);
});

test("ignores code examples, unused link definitions, and remote images", (t) => {
  const result = fixture(t, [
    "`![Example](missing.svg)`",
    "```md",
    "![Example](also-missing.svg)",
    '<img src="not-an-image.svg">',
    "```",
    "[unused]: missing-link-target.svg",
    "![Remote][remote]",
    "[remote]: https://example.com/photo.svg",
  ].join("\n\n"));
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(path.join(result.destination, "index.md")));
  assert.equal(existsSync(path.join(result.destination, "missing.svg")), false);
});

test("reports missing referenced images instead of claiming a successful import", (t) => {
  const result = fixture(t, "![Diagram][diagram]\n\n[diagram]: ./missing.svg");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing image/);
  assert.equal(existsSync(path.join(result.destination, "index.md")), false);
});

test("rejects referenced images outside the note directory", (t) => {
  const result = fixture(t, "![Diagram][diagram]\n\n[diagram]: ../outside.svg");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside the note directory/);
  assert.equal(existsSync(path.join(result.destination, "index.md")), false);
});
