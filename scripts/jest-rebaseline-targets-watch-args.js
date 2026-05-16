#!/usr/bin/env node
/**
 * Print Jest watch args for tests listed in rebaseline-targets.txt.
 * Used by start4TestLocalWebServer.sh when FINKITTY_JEST_ONLY_REBASELINE_TARGETS=1.
 *
 * stdout:
 *   PATHPATTERN:<regex for --testPathPattern — which test files>
 *   NAMEPATTERN:<regex for -t — exact it() titles, $-anchored>
 *
 * Exit 2 if the targets file has no active entries (caller runs full suite).
 */
const { join } = require("path");
const { ROOT, TARGETS_FILE } = require("./rebaseline-paths.js");
const { loadRebaselineTargets } = require("./load-rebaseline-targets.js");

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function main() {
  const targetsFile = process.env.FINKITTY_REBASELINE_TARGETS_FILE || TARGETS_FILE;
  let targets;
  try {
    targets = loadRebaselineTargets(targetsFile);
  } catch (e) {
    process.stderr.write(`[start4] ${e.message}\n`);
    process.exit(1);
  }

  if (targets.length === 0) {
    process.stderr.write(
      `[start4] No targets in ${targetsFile} — use full test suite (or fix failures first).\n`,
    );
    process.exit(2);
  }

  const files = [];
  const seenFiles = new Set();
  for (const t of targets) {
    const abs = join(ROOT, t.file);
    if (!seenFiles.has(t.file)) {
      seenFiles.add(t.file);
      files.push(t.file);
    }
    if (!require("fs").existsSync(abs)) {
      process.stderr.write(`[start4] Warning: target file missing: ${t.file}\n`);
    }
  }

  const pathPattern = files.map((f) => escapeRegex(f)).join("|");
  // Anchor each it() title so we do not run every test in the file (e.g. all 6 in autoSetOldEra).
  const namePattern = targets.map((t) => `${escapeRegex(t.name)}$`).join("|");

  process.stdout.write(`PATHPATTERN:${pathPattern}\n`);
  process.stdout.write(`NAMEPATTERN:${namePattern}\n`);

  process.stderr.write(
    `[start4] Jest watch scoped to ${targets.length} listed test(s) in ${files.length} file(s) — not every test in those files:\n`,
  );
  for (const t of targets) {
    process.stderr.write(`  ${t.file} :: ${t.name}\n`);
  }
}

main();
