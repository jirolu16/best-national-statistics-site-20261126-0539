// Japan in Numbers — dossier entry point.
//
// Copies app/ and screenshots/ into the output directory (MAKEFUN_OUTPUT_DIR,
// default /output), then writes dossier.json there using the vendored
// dossier library. The output directory is wiped first, so a stale file
// from an earlier run can never leak in, and running the script twice over
// the same tree produces byte-identical dossier.json.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

for (const name of ['app', 'screenshots', 'dossier.json']) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const appCount = readdirSync(join(outDir, 'app')).length;
const shotNames = readdirSync(join(outDir, 'screenshots')).sort();
console.log(`copied app (${appCount} files) and screenshots (${shotNames.join(', ')})`);

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`dossier.json written to ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
