#!/usr/bin/env node
/**
 * Rebaseline chart tests: run printTestCodeForChart, capture Jest output, replace
 * the chart block. Run: node scripts/rebaseline-chart-its.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TESTS = [
  { file: "tests/algoTests/algoChart.test.ts", name: "handle PDC generator detailed" },
  { file: "tests/algoTests/algoChart.test.ts", name: "handle PDC generator coarse" },
  { file: "tests/algoTests/algo.test.ts", name: "should apply income tax to some asset growth" },
  { file: "tests/algoTests/algo.test.ts", name: "can use income tax on asset for taxable benefits" },
  { file: "tests/algoTests/algo.test.ts", name: "Generate taxable income from asset" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined contributions pension simplest" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay one-off pension and employee pension contribution" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into two defined contributions pension schemes" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined contributions pension with employer contribution" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay monthly pay into defined contributions pension with employer contribution" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined contributions pension with salary sacrifice" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay one-off pension contribution" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined benefits pension simplest" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined benefits pension salary sacrifice" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay into defined benefits pension apply cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on conditional absolute crystallized pension" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on conditional categorized crystallized pension" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on conditional proportional crystallized pension" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on recurring conditional proportional crystallized pension" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on list member recurring conditional proportional crystallized pension" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on monthly crystallized pension to cash" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on monthly crystallized pension to savings monthly transfers" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on monthly crystallized pension to savings fortnight transfers" },
  { file: "tests/algoTests/algoPension.test.ts", name: "pay income tax on monthly crystallized pensions to savings" },
  { file: "tests/algoTests/algoPension.test.ts", name: "Defined Benefits Pension evaluations" },
  { file: "tests/algoTests/algoPension.test.ts", name: "Defined Contributions Pension evaluations" },
  { file: "tests/algoTests/algoPension.test.ts", name: "DCP revalue scales sub-assets through crystal, withdrawal, and ratios" },
  { file: "tests/algoTests/algoPension.test.ts", name: "DCP Joe withdrawal then transfer to Jack then Jack withdrawal" },
  { file: "tests/algoTests/algoPension.test.ts", name: "Transferring pensions to others" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator low income SS no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator low income SS with cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator NI income no SS with cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator NI income SS with cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator tax income SS with cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDB generator tax income no SS with cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator low income no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator withdrawal" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator withdrawal (withdrawal VALUE from setting)" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator withdrawal tax income no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator NI income no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator NI income SS no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator tax income SS no cpi" },
  { file: "tests/algoTests/algoPension.test.ts", name: "handle PDC generator tax income no SS no cpi" },
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findItLine(lines, name) {
  const re = new RegExp(`^\\s*it\\(\\s*['"]${escapeRe(name)}['"]`, "m");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

/** Sibling `it(…)` at the same column as the opening `it` (not nested `it` at deeper indent). */
function findNextItLineAtSameIndent(lines, itLine) {
  const m = (lines[itLine] || "").match(/^(\s*)it\s*\(/);
  if (!m) return -1;
  const itIndent = m[1];
  const re = new RegExp("^" + escapeRe(itIndent) + "it\\s*\\(");
  for (let i = itLine + 1; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

/**
 * Line index *exclusive* of this `it` so `lines.slice(itLine, ex)` is exactly one test body, ending
 * at the `});` that matches the `it(…)` (not comments before the next sibling `it`, not the
 * parent describe's `});` at column 0 when this is the last `it` in a describe).
 */
function findItBlockEndExclusive(lines, itLine) {
  const m = (lines[itLine] || "").match(/^(\s*)it\s*\(/);
  if (!m) return -1;
  const itIndent = m[1];
  const reIt = new RegExp("^" + escapeRe(itIndent) + "it\\s*\\(");
  const reClose = new RegExp("^" + escapeRe(itIndent) + "\\}\\);\\s*$");
  let nextSib = -1;
  for (let i = itLine + 1; i < lines.length; i++) {
    if (reIt.test(lines[i])) {
      nextSib = i;
      break;
    }
  }
  const searchEnd = nextSib === -1 ? lines.length : nextSib;
  let lastClose = -1;
  for (let i = itLine + 1; i < searchEnd; i++) {
    if (reClose.test(lines[i])) lastClose = i;
  }
  if (lastClose < 0) return -1;
  return lastClose + 1;
}

/** Trailing blank lines make closeIdx point at ""/whitespace, not `});` — corrupts splice. */
function trimItBlockEnd(block) {
  const b = [...block];
  while (b.length && b[b.length - 1].trim() === "") b.pop();
  return b;
}

function findMakeResultEndInIt(itBlockLines) {
  let start = -1;
  for (let i = 0; i < itBlockLines.length; i++) {
    if (
      /(?:const|let)\s+result\s*=\s*makeChartDataFromEvaluations/.test(
        itBlockLines[i],
      )
    ) {
      start = i;
      break;
    }
  }
  if (start < 0) return { end: -1, base: "    " };
  for (let i = start; i < itBlockLines.length; i++) {
    if (/^\s*\);\s*$/.test(itBlockLines[i])) {
      const m = itBlockLines[i].match(/^(\s*)\);\s*$/);
      return { end: i, base: m ? m[1] : "    " };
    }
  }
  return { end: -1, base: "    " };
}

function makePrintCall(base) {
  if (base === "    ") return `${base}// printTestCodeForChart(result);`;
  return `${base}// printTestCodeForChart(result, { baseIndent: ${JSON.stringify(base)} });`;
}

function makePrintCallActive(base) {
  if (base === "    ") return `${base}printTestCodeForChart(result);`;
  return `${base}printTestCodeForChart(result, { baseIndent: ${JSON.stringify(base)} });`;
}

function extractJestConsoleLogDump(stdout) {
  const s = String(stdout);
  const markers = [
    "expect(result.expensesData.length)",
    "expect(result.incomesData.length)",
  ];
  let best = -1;
  for (const mk of markers) {
    const i = s.indexOf(mk);
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  if (best === -1) return null;
  let start = best;
  while (start > 0 && s[start - 1] !== "\n") start--;
  const lines = s.slice(start).split("\n");
  const out = [];
  for (let L of lines) {
    const cutAt = (s) => {
      for (const mk of [
        "○", // Jest "skipped" can embed mid-line and split between 'cha' and 'rt' in "chart"
        "PASS tests/",
        "FAIL tests/",
        "Tests:       ",
        "Test Suites: ",
        "Snapshots:   ",
        "Time:        ",
        "Ran all test suites",
      ]) {
        const j = s.indexOf(mk);
        if (j > 0) s = s.slice(0, j);
      }
      return s;
    };
    L = cutAt(L);
    if (L.indexOf("○") >= 0) {
      L = L.slice(0, L.indexOf("○"));
    }
    if (L.trim().startsWith("○") || L.includes("○ skipped")) {
      break;
    }
    if (
      /^\s*at\s+/.test(L) ||
      L.includes("at log (") ||
      L.trim().startsWith("PASS ") ||
      L.trim().startsWith("FAIL ") ||
      L.includes("Test Suites:") ||
      L.includes("Snapshots:") ||
      /^\s*Tests:\s/.test(L) ||
      /^\s*Time:\s/.test(L) ||
      /^\s*Ran all test suites/.test(L) ||
      L.includes("  ● ") ||
      /^\s*●\s/.test(L) ||
      /^\s*✓\s/.test(L) ||
      /^\s*✕\s/.test(L) ||
      /chart data tests|evaluations tests|pension tests/.test(L)
    ) {
      break;
    }
    if (L.includes("      at log ") && L.includes("algoTestUtils")) break;
    out.push(L);
  }
  return out.join("\n").replace(/\r\n/g, "\n");
}

function dedentGeneratedBlock(text) {
  const lines = text.split("\n").filter((l) => l.length);
  if (!lines.length) return "";
  let min = Infinity;
  for (const L of lines) {
    if (!L.trim()) continue;
    const m = L.match(/^(\s*)/);
    if (m) min = Math.min(min, m[1].length);
  }
  if (min === Infinity) min = 0;
  return lines
    .map((L) => (L.trim() ? L.slice(min) : ""))
    .join("\n")
    .replace(/\n+$/, "");
}

function patchItBlockToCaptureOnly(itBlock, makeEnd, base, closeIdx) {
  const head = itBlock.slice(0, makeEnd + 1);
  const printLine = makePrintCallActive(base);
  const last = itBlock[closeIdx];
  return [...head, printLine, last];
}

function applyRebaselineGen(itBlock, makeEnd, base, closeIdx, genLines) {
  const head = itBlock.slice(0, makeEnd + 1);
  const comment = makePrintCall(base);
  const last = itBlock[closeIdx];
  return [...head, comment, ...genLines, last];
}

function fixTypoRint(s) {
  return s.replace(/\/\/\s*rintTestCodeForChart/g, "// printTestCodeForChart");
}

function rebaselineOne(absFile, name) {
  const rel = absFile.replace(ROOT + "/", "");
  const backup = readFileSync(absFile, "utf8");
  const restore = () => {
    writeFileSync(absFile, backup, "utf8");
  };

  let text = fixTypoRint(backup);
  let lines = text.split("\n");

  const itLine = findItLine(lines, name);
  if (itLine < 0) {
    console.error("SKIP: it not found:", rel, name);
    return false;
  }

  const endEx = findItBlockEndExclusive(lines, itLine);
  if (endEx < 0) {
    console.error("SKIP: could not find it block end (matching });)", rel, name);
    return false;
  }
  let itBlock = trimItBlockEnd(lines.slice(itLine, endEx));
  const closeIdx = itBlock.length - 1;
  const lastTrim = (itBlock[closeIdx] || "").trim();
  if (!/^\}\);$/.test(lastTrim)) {
    console.error("SKIP: bad it close", rel, name, "last:", JSON.stringify(itBlock[closeIdx]));
    return false;
  }

  const { end: makeEnd, base: base2 } = findMakeResultEndInIt(itBlock);
  if (makeEnd < 0) {
    console.error("SKIP: no const result = makeChartDataFromEvaluations", rel, name);
    return false;
  }

  const captureIt = patchItBlockToCaptureOnly(itBlock, makeEnd, base2, closeIdx);
  const newLinesA = [
    ...lines.slice(0, itLine),
    ...captureIt,
    ...lines.slice(endEx),
  ];
  writeFileSync(absFile, newLinesA.join("\n") + "\n", "utf8");

  let stdout = "";
  try {
    stdout = execSync(
      `npx jest "${rel}" -t ${JSON.stringify(name)} --no-coverage --runInBand 2>&1`,
      {
        cwd: ROOT,
        encoding: "utf8",
        maxBuffer: 25 * 1024 * 1024,
        env: { ...process.env, FORCE_COLOR: "0" },
      },
    );
  } catch (e) {
    stdout = (e.stdout && String(e.stdout)) || (e.message || "");
  }

  const raw = extractJestConsoleLogDump(stdout) || extractJestConsoleLogDump(String(stdout));
  if (!raw || raw.length < 50) {
    restore();
    console.error("FAIL: no chart dump in stdout", rel, name);
    console.error(stdout.slice(0, 2500));
    return false;
  }
  const gen = dedentGeneratedBlock(raw);
  const badGenLine = gen
    .split("\n")
    .find(
      (l) =>
        l.trim() &&
        l.includes("expectChartData") &&
        !l.trim().endsWith(");"),
    );
  if (badGenLine) {
    restore();
    console.error("FAIL: truncated or malformed line in generated chart dump", rel, name);
    console.error("Offending line:", badGenLine.slice(0, 200));
    return false;
  }
  const genLines = gen.split("\n");

  text = readFileSync(absFile, "utf8");
  lines = text.split("\n");
  const itL = findItLine(lines, name);
  if (itL < 0) {
    restore();
    console.error("FAIL: it not found after capture write", rel, name);
    return false;
  }
  const endEx2 = findItBlockEndExclusive(lines, itL);
  if (endEx2 < 0) {
    restore();
    console.error("FAIL: it block end not found (phase2)", rel, name);
    return false;
  }
  itBlock = trimItBlockEnd(lines.slice(itL, endEx2));
  const closeIdx2 = itBlock.length - 1;
  const lastTrim2 = (itBlock[closeIdx2] || "").trim();
  if (!/^\}\);$/.test(lastTrim2)) {
    restore();
    console.error("SKIP: bad it close (phase2)", rel, name, "last:", JSON.stringify(itBlock[closeIdx2]));
    return false;
  }
  const { end: makeEnd2, base: printBase } = findMakeResultEndInIt(itBlock);
  if (makeEnd2 < 0) {
    restore();
    console.error("SKIP: no const result = makeChartDataFromEvaluations (phase2)", rel, name);
    return false;
  }
  const finalIt = applyRebaselineGen(
    itBlock,
    makeEnd2,
    printBase,
    closeIdx2,
    genLines,
  );

  const newLinesB = [
    ...lines.slice(0, itL),
    ...finalIt,
    ...lines.slice(endEx2),
  ];
  writeFileSync(absFile, newLinesB.join("\n") + "\n", "utf8");
  console.log("OK", rel, "::", name);
  return true;
}

let failed = 0;
for (const t of TESTS) {
  const abs = join(ROOT, t.file);
  if (!rebaselineOne(abs, t.name)) failed++;
}

if (failed) {
  console.error("Finished with", failed, "failures");
  process.exit(1);
}
console.log("All OK. Run: npm run test:algo");
