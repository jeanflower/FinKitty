#!/usr/bin/env node
/**
 * **Algo test rebaseline helper** — runs Jest targets and optionally rewrites expectation
 * blocks in place (`--write`).
 *
 * ## Test layout convention (required for `--write`)
 *
 * Each `it` that uses generated expectations should keep **commented marker lines** immediately
 * above the matching assertion blocks (prints stay commented in git; the script uncomments them
 * only for the capture run):
 *
 *   // printTestCodeForEvals(evals);
 *   //   — or `evalsAndValues.evaluations`, optional `{ baseIndent: "  " }`
 *
 *   expect(evals.length)…
 *   expectEvals(…)…
 *
 *   // printTestCodeForChart(result);
 *   //   — optional `{ baseIndent, sections: ['assets','tax'] }` (same as the live call)
 *
 *   expect(result.…)… / expectChartData(…)… / `{ const chartPts = … }` wrappers
 *
 * **Eval block** = contiguous lines after the marker matching `expect(evals.length)` /
 * `expectEvals(…)` (blank lines allowed).
 *
 * **Chart block** = contiguous lines matching chart expectations: `expect(result.*)`,
 * `expectChartData`, `const chartPts`, and `{` / `}` braces for per-series blocks.
 *
 * With `--write`, print helpers write blocks to `testResults/.rebaseline-capture.txt` (Jest reformats
 * `console.log`, so capture uses `FINKITTY_REBASELINE_CAPTURE`, not stdout).
 *
 * ## Workflow
 *
 * **Automatic (`--write`):** edit `testResults/rebaseline-targets.txt`, then:
 *   npm run rebaseline:algo -- --write
 *
 * **Manual (no file edit):** uncomment prints, run without `--write`, copy console output, paste,
 * re-comment, run again to confirm.
 *
 * **Default targets:** `testResults/rebaseline-targets.txt` (gitignored; also filled by start4… on failures).
 * Result lists (gitignored): `testResults/rebaseline-edited.txt`, `testResults/rebaseline-not-edited.txt`.
 * Override with `--test=…` and/or `--tests-file=…`.
 */
import { createRequire } from "module";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);
const {
  ROOT,
  TARGETS_FILE: DEFAULT_TESTS_FILE,
  EDITED_FILE,
  NOT_EDITED_FILE,
  CAPTURE_FILE,
} = require("./rebaseline-paths.js");

const __dirname = dirname(fileURLToPath(import.meta.url));

const JEST_TEST_TIMEOUT_MS = 300_000;
const JEST_EXEC_MAX_BUFFER = 100 * 1024 * 1024;

const SENTINEL = {
  evals: { begin: "@@REBASELINE_BEGIN:evals@@", end: "@@REBASELINE_END:evals@@" },
  chart: { begin: "@@REBASELINE_BEGIN:chart@@", end: "@@REBASELINE_END:chart@@" },
};

const MARKER_EVALS = /^\s*\/\/\s*printTestCodeForEvals\s*\(/;
const MARKER_CHART = /^\s*\/\/\s*printTestCodeForChart\s*\(/;
const PRINT_EVALS = /^\s*printTestCodeForEvals\s*\(/;
const PRINT_CHART = /^\s*printTestCodeForChart\s*\(/;

function parseArgs(argv) {
  const out = { testsFile: null, testsInline: [], write: false };
  for (const a of argv) {
    if (a === "--write") {
      out.write = true;
      continue;
    }
    if (a.startsWith("--tests-file=")) {
      out.testsFile = a.slice("--tests-file=".length);
      continue;
    }
    if (a.startsWith("--test=")) {
      out.testsInline.push(a.slice("--test=".length));
      continue;
    }
    if (a === "--help" || a === "-h") {
      console.log(
        [
          "Run algo Jest tests; optionally rewrite expectation blocks from print helpers.",
          "",
          "  npm run rebaseline:algo",
          "  npm run rebaseline:algo -- --write",
          "",
          "  (reads testResults/rebaseline-targets.txt by default — edit that file)",
          "",
          "  node scripts/rebaseline-algo-tests.mjs --test='tests/algoTests/foo.test.ts::it name'",
          "  node scripts/rebaseline-algo-tests.mjs --tests-file=scripts/other-targets.txt --write",
          "",
          "Options:",
          "  --test=<file>::<it name>   Repeatable; skips the default targets file.",
          "  --tests-file=<path>        Lines: file::it name  OR  JSON array.",
          "  --write                    Replace eval/chart blocks after markers (see file header).",
        ].join("\n"),
      );
      process.exit(0);
    }
    if (a.startsWith("--")) {
      console.error("Unknown option:", a);
      process.exit(2);
    }
  }
  return out;
}

function parseTestSpec(spec) {
  const s = String(spec || "").trim();
  const k = s.indexOf("::");
  if (k <= 0 || k >= s.length - 2) return null;
  return { file: s.slice(0, k).trim(), name: s.slice(k + 2).trim() };
}

function loadTestsFromFile(maybePath) {
  const abs = maybePath.startsWith("/") ? maybePath : join(ROOT, maybePath);
  const raw = readFileSync(abs, "utf8");
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) throw new Error("tests-file JSON must be an array");
    return parsed
      .map((x) => {
        if (x && typeof x === "object" && typeof x.file === "string" && typeof x.name === "string") {
          return { file: x.file, name: x.name };
        }
        if (typeof x === "string") return parseTestSpec(x);
        return null;
      })
      .filter(Boolean);
  }
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const t = parseTestSpec(line);
      if (!t) throw new Error(`Bad line (expected <file>::<it name>): ${line}`);
      return t;
    });
}

function specLine(t) {
  return `${t.file}::${t.name}`;
}

function formatTimestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function writeResultListFile(absPath, title, entries) {
  const lines = [
    `# ${title}`,
    `# Updated: ${formatTimestamp()} UTC`,
    "#",
    "# Format: <test-file>::<it name>  optional # reason",
    "#",
  ];
  if (entries.length === 0) {
    lines.push("# (none)");
  } else {
    for (const e of entries) {
      lines.push(e.note ? `${specLine(e)}  # ${e.note}` : specLine(e));
    }
  }
  writeFileSync(absPath, `${lines.join("\n")}\n`, "utf8");
}

function dedupeTests(tests) {
  const seen = new Set();
  const out = [];
  for (const t of tests) {
    const key = `${t.file}\t${t.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function isEvalExpectLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^expect\(evals\.length\)/.test(t)) return true;
  if (/^expectEvals\(/.test(t)) return true;
  return false;
}

function isChartExpectLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (t === "{" || t === "}") return true;
  if (/^const chartPts =/.test(t)) return true;
  if (/^expect\(result\./.test(t)) return true;
  if (/^expect\(chartPts\.length\)/.test(t)) return true;
  if (/^expectChartData\(/.test(t)) return true;
  return false;
}

function expectBlockEnd(lines, markerIdx, kind) {
  const isLine = kind === "evals" ? isEvalExpectLine : isChartExpectLine;
  let i = markerIdx + 1;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  while (i < lines.length && isLine(lines[i])) i += 1;
  return i;
}

function findMarkerLine(lines, start, end, kind) {
  const re = kind === "evals" ? MARKER_EVALS : MARKER_CHART;
  for (let i = start; i < end; i += 1) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

function uncommentPrintInRange(lines, start, end) {
  let changed = false;
  for (let i = start; i < end; i += 1) {
    const next = lines[i].replace(/^(\s*)\/\/\s*(printTestCodeFor(?:Evals|Chart)\s*\()/, "$1$2");
    if (next !== lines[i]) {
      lines[i] = next;
      changed = true;
    }
  }
  return changed;
}

function commentPrintInRange(lines, start, end) {
  for (let i = start; i < end; i += 1) {
    if (PRINT_EVALS.test(lines[i]) || PRINT_CHART.test(lines[i])) {
      lines[i] = lines[i].replace(/^(\s*)(printTestCodeFor(?:Evals|Chart)\s*\()/, "$1// $2");
    }
  }
}

function findItBlock(source, itName) {
  const escaped = itName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`\\bit\\(\\s*'${escaped.replace(/'/g, "\\'")}'`),
    new RegExp(`\\bit\\(\\s*"${escaped.replace(/"/g, '\\"')}"`),
    new RegExp(`\\bit\\(\\s*\`${escaped.replace(/`/g, "\\`")}\``),
  ];
  let start = -1;
  for (const re of patterns) {
    const hit = source.search(re);
    if (hit >= 0 && (start < 0 || hit < start)) start = hit;
  }
  if (start < 0) return null;
  const brace = source.indexOf("{", start);
  if (brace < 0) return null;
  let depth = 0;
  for (let j = brace; j < source.length; j += 1) {
    const c = source[j];
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: j + 1 };
    }
  }
  return null;
}

function offsetToLineIndex(source, offset) {
  return source.slice(0, offset).split("\n").length - 1;
}

function extractSentinelBlock(output, kind) {
  const { begin, end } = SENTINEL[kind];
  const i = output.indexOf(begin);
  if (i < 0) return null;
  const j = output.indexOf(end, i + begin.length);
  if (j < 0) return null;
  return output.slice(i + begin.length, j).replace(/^\n/, "").replace(/\n$/, "");
}

function validateCodegen(text, kind) {
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const ok = kind === "evals" ? isEvalExpectLine(line) : isChartExpectLine(line);
    if (!ok) {
      throw new Error(`Invalid ${kind} codegen line (refusing to patch): ${line.trim().slice(0, 100)}`);
    }
  }
}

function fallbackExtractBlock(output, kind) {
  const lines = output.split("\n");
  const isLine = kind === "evals" ? isEvalExpectLine : isChartExpectLine;
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (kind === "evals" && /expect\(evals\.length\)/.test(lines[i])) {
      start = i;
      break;
    }
    if (kind === "chart" && /expect\(result\./.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  const out = [];
  for (let i = start; i < lines.length; i += 1) {
    if (!isLine(lines[i])) break;
    out.push(lines[i]);
  }
  return out.length ? out.join("\n") : null;
}

function spliceExpectBlock(lines, markerIdx, newContent, kind) {
  const end = expectBlockEnd(lines, markerIdx, kind);
  let insertAt = markerIdx + 1;
  while (insertAt < end && lines[insertAt].trim() === "") insertAt += 1;
  const newLines = newContent ? newContent.split("\n") : [];
  while (newLines.length > 0 && newLines[newLines.length - 1] === "") newLines.pop();
  return [...lines.slice(0, insertAt), ...newLines, ...lines.slice(end)];
}

function runOneCapture(rel, name) {
  if (existsSync(CAPTURE_FILE)) unlinkSync(CAPTURE_FILE);
  const env = { ...process.env, FORCE_COLOR: "0", FINKITTY_REBASELINE_CAPTURE: CAPTURE_FILE };
  try {
    execSync(
      `npx jest ${JSON.stringify(rel)} -t ${JSON.stringify(name)} --no-coverage --runInBand --testTimeout=${JEST_TEST_TIMEOUT_MS}`,
      {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env,
        maxBuffer: JEST_EXEC_MAX_BUFFER,
      },
    );
  } catch (e) {
    if (!existsSync(CAPTURE_FILE)) throw e;
  }
  if (!existsSync(CAPTURE_FILE)) {
    throw new Error("Capture file missing — were printTestCodeForEvals/Chart markers present?");
  }
  return readFileSync(CAPTURE_FILE, "utf8");
}

function runOneInherit(rel, name) {
  execSync(
    `npx jest ${JSON.stringify(rel)} -t ${JSON.stringify(name)} --no-coverage --runInBand --testTimeout=${JEST_TEST_TIMEOUT_MS}`,
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "0" },
      maxBuffer: JEST_EXEC_MAX_BUFFER,
    },
  );
}

function rebaselineWriteOne({ file, name }) {
  const absPath = join(ROOT, file);
  const source = readFileSync(absPath, "utf8");
  const block = findItBlock(source, name);
  if (!block) {
    throw new Error(`Could not find it("${name}") in ${file}`);
  }
  const lineStart = offsetToLineIndex(source, block.start);
  const lineEnd = offsetToLineIndex(source, block.end);
  const lines = source.split("\n");

  const evalMarker = findMarkerLine(lines, lineStart, lineEnd + 1, "evals");
  const chartMarker = findMarkerLine(lines, lineStart, lineEnd + 1, "chart");
  if (evalMarker < 0 && chartMarker < 0) {
    throw new Error(
      `No // printTestCodeForEvals / printTestCodeForChart markers in it("${name}") — add commented markers above expectation blocks.`,
    );
  }

  uncommentPrintInRange(lines, lineStart, lineEnd + 1);
  writeFileSync(absPath, lines.join("\n"), "utf8");

  let output;
  try {
    output = runOneCapture(file, name);
  } finally {
    const restore = readFileSync(absPath, "utf8").split("\n");
    commentPrintInRange(restore, lineStart, lineEnd + 1);
    writeFileSync(absPath, restore.join("\n"), "utf8");
  }

  let evalText =
    extractSentinelBlock(output, "evals") ?? fallbackExtractBlock(output, "evals");
  let chartText =
    extractSentinelBlock(output, "chart") ?? fallbackExtractBlock(output, "chart");
  if (evalText) validateCodegen(evalText, "evals");
  if (chartText) validateCodegen(chartText, "chart");

  const reasons = [];
  if (evalMarker >= 0 && !evalText) {
    console.warn(`  (no eval codegen in output — eval block unchanged)`);
    reasons.push("no eval codegen");
  }
  if (chartMarker >= 0 && !chartText) {
    console.warn(`  (no chart codegen in output — chart block unchanged)`);
    reasons.push("no chart codegen");
  }

  const beforePatch = readFileSync(absPath, "utf8");
  const patched = beforePatch.split("\n");
  let next = patched;
  if (chartMarker >= 0 && chartText) {
    const idx = findMarkerLine(next, lineStart, lineEnd + 1, "chart");
    if (idx >= 0) next = spliceExpectBlock(next, idx, chartText, "chart");
  }
  if (evalMarker >= 0 && evalText) {
    const idx = findMarkerLine(next, lineStart, lineEnd + 1, "evals");
    if (idx >= 0) next = spliceExpectBlock(next, idx, evalText, "evals");
  }

  const afterPatch = next.join("\n");
  const fileChanged = afterPatch !== beforePatch;
  writeFileSync(absPath, afterPatch, "utf8");

  runOneInherit(file, name);

  if (fileChanged) {
    return { edited: true, note: "expectations updated" };
  }
  return {
    edited: false,
    note: reasons.length > 0 ? reasons.join("; ") : "unchanged",
  };
}

const cli = parseArgs(process.argv.slice(2));
let tests = [];
const useDefaultTargets = !cli.testsFile && cli.testsInline.length === 0;
const targetsFile = cli.testsFile ?? (useDefaultTargets ? DEFAULT_TESTS_FILE : null);

if (targetsFile) {
  if (!existsSync(targetsFile)) {
    console.error("Targets file not found:", targetsFile);
    process.exit(2);
  }
  try {
    tests.push(...loadTestsFromFile(targetsFile));
  } catch (e) {
    console.error("Could not read targets file:", targetsFile, String(e?.message || e));
    process.exit(2);
  }
  const rel = targetsFile.startsWith(ROOT) ? targetsFile.slice(ROOT.length + 1) : targetsFile;
  console.log(`Targets: ${rel}\n`);
}
for (const s of cli.testsInline) {
  const t = parseTestSpec(s);
  if (!t) {
    console.error("Bad --test (expected <file>::<it name>):", s);
    process.exit(2);
  }
  tests.push(t);
}
tests = dedupeTests(tests);
if (tests.length === 0) {
  const hint = useDefaultTargets
    ? `No active targets in testResults/rebaseline-targets.txt — uncomment a line (file::it name) or pass --test=…`
    : "No tests: pass --test and/or --tests-file (see --help).";
  console.error(hint);
  process.exit(2);
}

const mode = cli.write ? "--write (patch expectation blocks)" : "verify only";
console.log(`Running ${tests.length} test target(s) [${mode}].\n`);

const edited = [];
const notEdited = [];
const editedTitle = "Rebaseline edited (expectations updated or verify passed)";
const notEditedTitle = "Rebaseline not edited (failed, unchanged, or no codegen)";

writeResultListFile(EDITED_FILE, editedTitle, edited);
writeResultListFile(NOT_EDITED_FILE, notEditedTitle, notEdited);

for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  console.log(`[${i + 1}/${tests.length}] ${t.file} :: ${t.name}`);
  try {
    if (cli.write) {
      const result = rebaselineWriteOne(t);
      if (result.edited) edited.push({ ...t, note: result.note });
      else notEdited.push({ ...t, note: result.note });
    } else {
      runOneInherit(t.file, t.name);
      edited.push({ ...t, note: "verify passed" });
    }
  } catch (e) {
    const note = String(e?.message || e).split("\n")[0];
    console.error(note);
    if (e.stdout) console.error(e.stdout);
    if (e.stderr) console.error(e.stderr);
    notEdited.push({ ...t, note });
  }
  writeResultListFile(EDITED_FILE, editedTitle, edited);
  writeResultListFile(NOT_EDITED_FILE, notEditedTitle, notEdited);
}

console.log(
  `\n${edited.length} edited, ${notEdited.length} not edited → testResults/rebaseline-edited.txt, testResults/rebaseline-not-edited.txt`,
);

if (notEdited.length > 0) {
  process.exit(1);
}
console.log("\nAll listed tests passed.");
