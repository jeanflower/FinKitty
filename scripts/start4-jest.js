#!/usr/bin/env node
/**
 * Start Jest for start4TestLocalWebServer.sh.
 * Scoped mode passes --testPathPattern / --testNamePattern on the CLI (watch ignores config-only scope).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const {
  isTruthyEnv,
  rebaselineTargetsDisplayPath,
  loadScopedRebaselineTargets,
  buildScopedJestCliArgs,
} = require("./apply-rebaseline-jest-scope");

const ROOT = path.join(__dirname, "..");

const scoped = isTruthyEnv(process.env.FINKITTY_JEST_ONLY_REBASELINE_TARGETS);
const maxWorkers = process.env.FINKITTY_JEST_MAX_WORKERS || "2";

const env = {
  ...process.env,
  NEXT_PUBLIC_REACT_APP_SERVER_URL_NOT_SECRET:
    process.env.NEXT_PUBLIC_REACT_APP_SERVER_URL_NOT_SECRET ||
    "http://localhost:3001/finkitty/",
};

const jestArgs = [`--maxWorkers=${maxWorkers}`];
let scopeCliArgs = [];

if (scoped) {
  const targetsFileLabel = rebaselineTargetsDisplayPath();
  const targets = loadScopedRebaselineTargets();
  if (targets.length === 0) {
    process.stderr.write(
      `[start4] ERROR: ${targetsFileLabel} has no valid targets (or all commented out).\n`,
    );
    process.exit(1);
  }
  scopeCliArgs = buildScopedJestCliArgs(targets);
  jestArgs.push(...scopeCliArgs);

  const check = spawnSync("npx", ["jest", "--listTests", ...scopeCliArgs], {
    cwd: ROOT,
    env,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    process.stderr.write("[start4] ERROR: Jest failed to start with rebaseline scope:\n");
    process.stderr.write(check.stderr || check.stdout || "(no output)\n");
    process.exit(1);
  }
  const listed = (check.stdout || "")
    .trim()
    .split("\n")
    .filter((line) => /\.test\.(tsx?|jsx?)$/.test(line.trim()));
  if (listed.length === 0) {
    process.stderr.write(
      `[start4] ERROR: scope matched no test files — check ${targetsFileLabel}\n`,
    );
    process.exit(1);
  }
  if (listed.length > 5) {
    process.stderr.write(
      `[start4] WARNING: scope lists ${listed.length} test files — expected 1–few. Check ${targetsFileLabel}\n`,
    );
  }
  process.stderr.write(
    `[start4] Scoped Jest (${targetsFileLabel}): ${targets.length} it() in ${listed.length} file(s)\n`,
  );
  for (const t of targets) {
    process.stderr.write(`  ${t.file} :: ${t.name}\n`);
  }
  process.stderr.write(
    "[start4] Expect: Tests: 1 failed (or passed), 5 skipped, 6 total — not 5 passed.\n",
  );
  process.stderr.write(
    "[start4] --watch (not watchAll). Press Enter to re-run; do NOT press 'a' (full suite).\n",
  );
  jestArgs.push("--watch");
} else {
  process.stderr.write("[start4] Full suite: Jest --watchAll\n");
  jestArgs.push("--watchAll");
}

jestArgs.push(
  "--reporters=default",
  "--reporters=./scripts/jest-failed-tests-reporter.js",
  "--reporters=./scripts/jest-rebaseline-targets-reporter.js",
);

process.stderr.write(`[start4] npx jest ${jestArgs.join(" ")}\n`);

const result = spawnSync("npx", ["jest", ...jestArgs], {
  cwd: ROOT,
  env,
  stdio: "inherit",
});

process.exit(result.status === null ? 1 : result.status);
