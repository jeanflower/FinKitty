/**
 * Parse testResults/rebaseline-targets.txt lines: <file>::<it() title>
 */
const { readFileSync, existsSync } = require("fs");
const { join } = require("path");
const { ROOT, TARGETS_FILE } = require("./rebaseline-paths.js");

function parseTestSpec(spec) {
  const s = String(spec || "").trim();
  const k = s.indexOf("::");
  if (k <= 0 || k >= s.length - 2) {
    return null;
  }
  return { file: s.slice(0, k).trim(), name: s.slice(k + 2).trim() };
}

function loadRebaselineTargets(maybePath) {
  const abs = maybePath
    ? maybePath.startsWith("/")
      ? maybePath
      : join(ROOT, maybePath)
    : TARGETS_FILE;
  if (!existsSync(abs)) {
    return [];
  }
  const raw = readFileSync(abs, "utf8");
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error("targets file JSON must be an array");
    }
    return parsed
      .map((x) => {
        if (
          x &&
          typeof x === "object" &&
          typeof x.file === "string" &&
          typeof x.name === "string"
        ) {
          return { file: x.file, name: x.name };
        }
        if (typeof x === "string") {
          return parseTestSpec(x);
        }
        return null;
      })
      .filter(Boolean);
  }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    let t = line.trim();
    if (!t || t.startsWith("#")) {
      continue;
    }
    const hash = t.indexOf("#");
    if (hash >= 0) {
      t = t.slice(0, hash).trim();
    }
    if (!t || t.includes("<test-file>")) {
      continue;
    }
    const spec = parseTestSpec(t);
    if (!spec) {
      throw new Error(`Bad line (expected <file>::<it name>): ${t}`);
    }
    out.push(spec);
  }
  return out;
}

module.exports = {
  parseTestSpec,
  loadRebaselineTargets,
};
