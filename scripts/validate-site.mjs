import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";

const siteRoot = resolve(".");
const skippedDirectories = new Set([".git", ".github"]);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (skippedDirectories.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlFiles = walk(siteRoot).filter((path) => path.endsWith(".html"));
const errors = [];
const forbidden = [
  "civil engineering shown through the work",
  "civil engineering, shown through the work",
  "five skills. each supported by visual evidence",
  "proof of skills",
  "evidence of my abilities",
  "evidence-led",
];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const label = relative(siteRoot, file);
  if (!/^<!doctype html>/i.test(html.trim())) errors.push(`${label}: missing doctype`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${label}: missing title`);
  if (!/<meta\s+name="viewport"/i.test(html)) errors.push(`${label}: missing viewport metadata`);

  for (const phrase of forbidden) {
    if (html.toLowerCase().includes(phrase)) errors.push(`${label}: forbidden phrase: ${phrase}`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${label}: duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[0])) errors.push(`${label}: image missing alt text`);
  }

  for (const match of html.matchAll(/\b(?:href|src|data-lightbox-src)="([^"]+)"/gi)) {
    const raw = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(raw)) continue;
    const clean = raw.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = clean.startsWith("/") ? join(siteRoot, clean.slice(1)) : resolve(dirname(file), clean);
    const safeTarget = normalize(target);
    if (!safeTarget.startsWith(siteRoot)) errors.push(`${label}: path escapes site root: ${raw}`);
    else if (!existsSync(safeTarget)) errors.push(`${label}: missing local target: ${raw}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages.`);
