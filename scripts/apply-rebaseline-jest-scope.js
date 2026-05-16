/**
 * Narrow Jest to testResults/rebaseline-targets.txt (used from jest.config.js when env is set).
 */
const { loadRebaselineTargets } = require("./load-rebaseline-targets");

function isTruthyEnv(v) {
  if (v === undefined || v === null || String(v).trim() === "") {
    return false;
  }
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function rebaselineTargetsFileSpec() {
  const f = process.env.FINKITTY_REBASELINE_TARGETS_FILE;
  return f && String(f).trim() !== "" ? String(f).trim() : undefined;
}

function loadScopedRebaselineTargets() {
  return loadRebaselineTargets(rebaselineTargetsFileSpec());
}

/** Path shown in start4 messages (relative to repo root when possible). */
function rebaselineTargetsDisplayPath() {
  const { relative } = require("path");
  const { ROOT, TARGETS_FILE } = require("./rebaseline-paths");
  const spec = rebaselineTargetsFileSpec();
  if (!spec) {
    return relative(ROOT, TARGETS_FILE).split("\\").join("/");
  }
  return spec.replace(/^\//, "");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Jest CLI flags — reliable in --watch (config-only testMatch is often ignored). */
function buildScopedJestCliArgs(targets) {
  const files = [...new Set(targets.map((t) => t.file))];
  const pathPattern = files.map((f) => escapeRegex(f.replace(/^\//, ""))).join("|");
  const namePattern = targets.map((t) => `${escapeRegex(t.name)}$`).join("|");
  return [
    `--testPathPattern=${pathPattern}`,
    `--testNamePattern=${namePattern}`,
  ];
}

function applyRebaselineScopeToConfig(config) {
  const targets = loadScopedRebaselineTargets();
  if (targets.length === 0) {
    return { applied: false, targets: [], files: [] };
  }
  const files = [...new Set(targets.map((t) => t.file))];
  config.testMatch = files.map((f) => `<rootDir>/${f.replace(/^\//, "")}`);
  const cli = buildScopedJestCliArgs(targets);
  config.testNamePattern = cli
    .find((a) => a.startsWith("--testNamePattern="))
    .slice("--testNamePattern=".length);
  return { applied: true, targets, files, cliArgs: cli };
}

module.exports = {
  isTruthyEnv,
  rebaselineTargetsDisplayPath,
  loadScopedRebaselineTargets,
  buildScopedJestCliArgs,
  applyRebaselineScopeToConfig,
};
