/**
 * Japan in Numbers - build and dossier tool.
 *
 * This program is the entrypoint for the make.fun entry. It does not
 * bundle or transform the site (the site is plain static files); its
 * job is to prove the entry is complete and self-describing:
 *
 *   1. It checks that every file the site needs is present in app/.
 *   2. It reads the metadata and series out of app/data.js by lifting
 *      the JSON-compatible literals the site itself renders from, so
 *      the dossier can never drift away from the shipped data.
 *   3. It inventories every file in the entry with its byte size.
 *   4. It writes the result to out/dossier.json and prints a summary.
 *
 * Usage: node main.ts [--root DIR] [--out FILE]
 * Defaults: root is this file's directory, out is <root>/out/dossier.json.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

interface CliOptions {
  root: string;
  out: string;
}

interface FileRecord {
  path: string;
  bytes: number;
}

interface SiteMeta {
  title: string;
  country: string;
  tagline: string;
  sections: string[];
  sources: string[];
  indicators: unknown[];
}

interface JapanData {
  populationSeries: unknown[];
  gdpSeries: unknown[];
  prefectures: unknown[];
  glanceFacts: unknown[];
}

const REQUIRED_APP_FILES: string[] = [
  "index.html",
  "style.css",
  "data.js",
  "main.js",
  "views.js",
];

function parseArgs(argv: string[]): CliOptions {
  const here = dirname(fileURLToPath(import.meta.url));
  let root = here;
  let out = "";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--root" && i + 1 < argv.length) {
      root = resolve(argv[++i]);
    } else if (arg === "--out" && i + 1 < argv.length) {
      out = resolve(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error("unknown argument: " + arg);
    }
  }
  if (out === "") {
    out = join(root, "out", "dossier.json");
  }
  return { root: root, out: out };
}

function printUsage(): void {
  console.log("Usage: node main.ts [--root DIR] [--out FILE]");
  console.log("Validates app/ and writes the entry dossier JSON.");
}

function formatBytes(n: number): string {
  if (n < 1024) { return n + " B"; }
  if (n < 1024 * 1024) { return (n / 1024).toFixed(1) + " KiB"; }
  return (n / (1024 * 1024)).toFixed(2) + " MiB";
}

/**
 * Extract the object literal assigned to `const NAME = { ... };` in a
 * JavaScript source file and parse it as JSON. The data file is
 * written to make this safe: double-quoted keys, no comments or brace
 * characters inside the literal. The scanner still tracks string
 * state so braces inside quoted text would not break the matching.
 */
function extractLiteral(source: string, name: string): unknown {
  const marker = "const " + name + " =";
  const at = source.indexOf(marker);
  if (at < 0) {
    throw new Error("could not find '" + marker + "' in app/data.js");
  }
  const start = source.indexOf("{", at);
  if (start < 0) {
    throw new Error("no object literal after '" + marker + "'");
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) { escaped = false; }
      else if (ch === "\\") { escaped = true; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; }
    else if (ch === "{") { depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const text = source.slice(start, i + 1);
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error("failed to parse " + name + " literal: " + String(err));
        }
      }
    }
  }
  throw new Error("unbalanced braces in " + name + " literal");
}

function validateApp(root: string): string[] {
  const problems: string[] = [];
  const appDir = join(root, "app");
  if (!existsSync(appDir)) {
    problems.push("missing app/ directory");
    return problems;
  }
  for (const name of REQUIRED_APP_FILES) {
    const file = join(appDir, name);
    if (!existsSync(file)) {
      problems.push("missing required file app/" + name);
    } else if (statSync(file).size === 0) {
      problems.push("required file app/" + name + " is empty");
    }
  }
  const indexHtml = join(appDir, "index.html");
  if (existsSync(indexHtml)) {
    const html = readFileSync(indexHtml, "utf8");
    for (const needed of ["data.js", "views.js", "main.js", "style.css"]) {
      if (!html.includes(needed)) {
        problems.push("app/index.html does not reference " + needed);
      }
    }
  }
  return problems;
}

function countIndicators(meta: SiteMeta, data: JapanData): number {
  return (
    meta.indicators.length +
    data.populationSeries.length +
    data.gdpSeries.length +
    data.prefectures.length +
    data.glanceFacts.length
  );
}

function inventory(root: string): FileRecord[] {
  const records: FileRecord[] = [];
  const skipDirs = new Set(["out", "node_modules", ".git"]);
  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) { walk(full); }
      } else if (entry.isFile()) {
        const rel = relative(root, full).split(sep).join("/");
        records.push({ path: rel, bytes: statSync(full).size });
      }
    }
  }
  walk(root);
  records.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return records;
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  const problems = validateApp(opts.root);
  if (problems.length > 0) {
    console.error("Entry validation failed:");
    for (const p of problems) { console.error("  - " + p); }
    process.exit(1);
  }

  const dataSource = readFileSync(join(opts.root, "app", "data.js"), "utf8");
  const meta = extractLiteral(dataSource, "SITE_META") as SiteMeta;
  const data = extractLiteral(dataSource, "JAPAN_DATA") as JapanData;

  const files = inventory(opts.root);
  const totalBytes = files.reduce((sum, f) => sum + f.bytes, 0);
  const indicatorCount = countIndicators(meta, data);

  const dossier = {
    site: meta.title,
    country: meta.country,
    tagline: meta.tagline,
    sections: meta.sections,
    indicatorCount: indicatorCount,
    dataSources: meta.sources,
    dataFile: "app/data.js",
    series: {
      populationPoints: data.populationSeries.length,
      gdpPoints: data.gdpSeries.length,
      prefectures: data.prefectures.length,
      headlineIndicators: meta.indicators.length,
    },
    files: files,
    totalFiles: files.length,
    totalBytes: totalBytes,
  };

  mkdirSync(dirname(opts.out), { recursive: true });
  writeFileSync(opts.out, JSON.stringify(dossier, null, 2) + "\n", "utf8");

  console.log(meta.title + " - entry dossier");
  console.log("  country:        " + meta.country);
  console.log("  sections:       " + meta.sections.join(", "));
  console.log("  indicators:     " + indicatorCount + " counted data points and figures");
  console.log("  data sources:   " + meta.sources.join("; "));
  console.log("  files:          " + files.length + " (" + formatBytes(totalBytes) + " total)");
  console.log("  dossier written: " + opts.out);
}

main();
