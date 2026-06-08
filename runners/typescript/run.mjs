#!/usr/bin/env node
/**
 * Reference TypeScript conformance runner for the Cephios Protocol v1.0 test-vector suite.
 *
 * A THIN SHIM, not a reimplementation. It imports the pinned reference SDK's (`@cephios/core`)
 * own §17.3 conformance entry point (`main`) and runs it against THIS repository's published
 * `v1.0/` vectors. The conformance logic — loading vectors, driving the reference SDK, comparing
 * against `expected_output`, and enforcing the §17.3 per-category thresholds — lives entirely in
 * `@cephios/core`; this shim only points it at the published vectors and propagates its exit code.
 *
 * This is the TypeScript copy of the SHAPE `runners/python/run.py` defines: install the pinned
 * reference SDK, run its conformance entry against this repo's published vectors, surface the
 * pass/fail. Other-language runners do NOT copy conformance logic — each SDK ships its own runner.
 *
 * Usage (see package.json for the pinned SDK):
 *
 *     cd runners/typescript && npm install   # installs the git-pinned @cephios/core (builds dist/)
 *     node runners/typescript/run.mjs            # runs ./v1.0 through the installed §17.3 runner
 *     node runners/typescript/run.mjs --json     # extra args pass through to the SDK runner
 *
 * Exit code IS `@cephios/core`'s §17.3 gate: 0 iff every GATED category meets its threshold;
 * non-zero otherwise. `session_lifecycle` is executed and reported but never gates (it is in the
 * §17.1 repo structure, not the §17.3 criteria). See ./README.md.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '@cephios/core';

// This repo's published vectors. run.mjs lives at runners/typescript/run.mjs, so the repo root is
// two parents up; the path is resolved relative to THIS file (CWD-independent — robust under CI).
const VECTORS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'v1.0');

if (!existsSync(VECTORS_DIR)) {
  console.error(`published vector directory not found: ${VECTORS_DIR}`);
  process.exit(1);
}

// Delegate to @cephios/core's §17.3 runner; forward any extra flags (e.g. --json). Its resolved
// value (0 pass / non-zero fail) becomes this process's exit code — the CI gate. A thrown error is
// surfaced as a non-zero exit, never swallowed.
try {
  process.exit(await main([VECTORS_DIR, ...process.argv.slice(2)]));
} catch (error) {
  console.error(error);
  process.exit(1);
}
