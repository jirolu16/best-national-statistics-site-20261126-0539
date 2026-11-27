/**
 * Japan in Numbers - hand-in program for the make.fun entry.
 *
 * The site itself is a handful of static files under app/, plus four
 * screenshots under screenshots/. This program is the courier between
 * that repository and the grader:
 *
 *   - it sanity-checks app/ so a broken entry fails loudly here
 *     instead of silently at scoring time,
 *   - it copies app/ and screenshots/ into the output directory
 *     (MAKEFUN_OUTPUT_DIR when the environment sets one, "/output"
 *     otherwise),
 *   - and it writes the dossier for that output directory with the
 *     vendored buildDossier helper, under the bounty's caps.
 *
 * Nothing is ever written back into the repository: on the grader the
 * snapshot is read-only, so the repo is treated as a source, never a
 * scratchpad. Unknown command-line arguments are ignored on purpose;
 * a stray flag from a wrapper script must not sink the hand-in.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

/** The caps the bounty prescribes for the dossier build. */
const HANDIN_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

/** Files the site cannot boot without; each must exist and be non-empty. */
const APP_FILES_REQUIRED: string[] = [
  "index.html",
  "style.css",
  "data.js",
  "main.js",
  "views.js",
];

/**
 * Where the repository lives. The default is this file's own folder,
 * derived from import.meta.url so the answer never depends on the
 * caller's working directory. A "--root DIR" pair anywhere in argv
 * overrides it; every other argument is skipped without complaint.
 */
function repoRootFromArgs(argv: string[]): string {
  let root = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--root" && i + 1 < argv.length) {
      root = resolve(argv[i + 1]);
      i++;
    }
  }
  return root;
}

/**
 * Collect every reason app/ is not shippable, or an empty list when it
 * is. Beyond presence and size, index.html must actually reference the
 * stylesheet and the three scripts, because a page that never loads
 * its data renders as an empty shell.
 */
function appProblems(root: string): string[] {
  const problems: string[] = [];
  const appDir = join(root, "app");
  if (!existsSync(appDir)) {
    problems.push("app/ directory is missing");
    return problems;
  }
  for (const name of APP_FILES_REQUIRED) {
    const target = join(appDir, name);
    if (!existsSync(target)) {
      problems.push("app/" + name + " is missing");
    } else if (statSync(target).size === 0) {
      problems.push("app/" + name + " is empty");
    }
  }
  const indexPath = join(appDir, "index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf8");
    for (const ref of ["style.css", "data.js", "main.js", "views.js"]) {
      if (html.indexOf(ref) === -1) {
        problems.push("app/index.html never references " + ref);
      }
    }
  }
  return problems;
}

/**
 * Lift the object literal bound by `const NAME = { ... };` out of a
 * JavaScript source text and hand it back parsed. The walk is
 * string-aware: a brace that appears inside a double-quoted string
 * (or right after a backslash escape) does not move the depth
 * counter, so the scan stops at the literal's true closing brace.
 * data.js keeps its literals JSON-shaped, so JSON.parse finishes
 * the job.
 */
function liftObjectLiteral(source: string, name: string): Record<string, unknown> {
  const binding = "const " + name + " =";
  const bindingAt = source.indexOf(binding);
  if (bindingAt === -1) {
    throw new Error("app/data.js has no '" + binding + "' binding");
  }
  const open = source.indexOf("{", bindingAt);
  if (open === -1) {
    throw new Error("no '{' follows '" + binding + "' in app/data.js");
  }
  let depth = 0;
  let quoted = false;
  let afterBackslash = false;
  for (let i = open; i < source.length; i++) {
    const ch = source.charAt(i);
    if (quoted) {
      if (afterBackslash) {
        afterBackslash = false;
      } else if (ch === "\\") {
        afterBackslash = true;
      } else if (ch === '"') {
        quoted = false;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(source.slice(open, i + 1)) as Record<string, unknown>;
      }
    }
  }
  throw new Error("the " + name + " literal in app/data.js never closes");
}

/** Length of a value when it is an array, zero for anything else. */
function listLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * The site's countable content: the headline indicators from the
 * metadata plus every row of the four data collections (population
 * series, GDP series, prefecture table, at-a-glance facts).
 */
function countIndicators(meta: Record<string, unknown>, data: Record<string, unknown>): number {
  let total = listLength(meta["indicators"]);
  total += listLength(data["populationSeries"]);
  total += listLength(data["gdpSeries"]);
  total += listLength(data["prefectures"]);
  total += listLength(data["glanceFacts"]);
  return total;
}

/**
 * Copy a directory tree into place, creating folders as needed and
 * overwriting whatever a previous run left behind, so stale files
 * from an older build can never linger in the hand-in. Returns how
 * many files were copied.
 */
function copyTree(sourceDir: string, targetDir: string): number {
  mkdirSync(targetDir, { recursive: true });
  let copied = 0;
  const entries = readdirSync(sourceDir, { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const from = join(sourceDir, entry.name);
    const to = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copied += copyTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
      copied += 1;
    }
  }
  return copied;
}

function run(): void {
  const root = repoRootFromArgs(process.argv.slice(2));

  const problems = appProblems(root);
  if (problems.length > 0) {
    console.error("app/ failed validation, nothing was handed in:");
    for (const problem of problems) {
      console.error("  - " + problem);
    }
    process.exit(1);
  }

  const dataSource = readFileSync(join(root, "app", "data.js"), "utf8");
  const meta = liftObjectLiteral(dataSource, "SITE_META");
  const japan = liftObjectLiteral(dataSource, "JAPAN_DATA");
  const indicatorCount = countIndicators(meta, japan);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });

  let filesCopied = 0;
  filesCopied += copyTree(join(root, "app"), join(outDir, "app"));
  const shotsDir = join(root, "screenshots");
  if (existsSync(shotsDir)) {
    filesCopied += copyTree(shotsDir, join(outDir, "screenshots"));
  }

  const dossierPath = join(outDir, "dossier.json");
  writeFileSync(dossierPath, buildDossier(outDir, HANDIN_CAPS));

  const sections = Array.isArray(meta["sections"]) ? meta["sections"] : [];
  console.log("Japan in Numbers hand-in complete");
  console.log("  site title:  " + String(meta["title"] ?? "(untitled)"));
  console.log("  country:     " + String(meta["country"] ?? "(unknown)"));
  console.log("  sections:    " + sections.join(", "));
  console.log("  indicators:  " + indicatorCount);
  console.log("  files copied: " + filesCopied);
  console.log("  dossier:     " + dossierPath);
}

run();
