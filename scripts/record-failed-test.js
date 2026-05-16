/**
 * Record failing tests to testResults/failedTests/ — used from tests/failedTestsHook.cjs
 * and optionally from jest-failed-tests-reporter.js.
 * LAST_RUN.txt is rebuilt from dump files on disk so all Jest workers stay in sync.
 */
const {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} = require("fs");
const { join, relative } = require("path");
const { ROOT, FAILED_TESTS_DIR } = require("./rebaseline-paths.js");

const FAILED_DIR = FAILED_TESTS_DIR;
const LAST_RUN_FILE = join(FAILED_DIR, "LAST_RUN.txt");

/** Jest uses › (U+203A); accept ASCII > as well. */
const JEST_NAME_SEP = /\s*›\s*|\s*>\s*/;

function stripAnsi(text) {
  return String(text).replace(/\u001B\[[0-9;]*[A-Za-z]/g, "");
}

function slugify(s) {
  return String(s)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function relPathToFilePart(relPath) {
  return relPath
    .replace(/\//g, "--")
    .replace(/\.(test|spec)\.(tsx?|jsx?)$/, "");
}

function testDisplayName(ancestorTitles, title) {
  if (!ancestorTitles || ancestorTitles.length === 0) {
    return title;
  }
  return `${ancestorTitles.join(" › ")} › ${title}`;
}

function lastNameSegment(displayName) {
  const parts = String(displayName).split(JEST_NAME_SEP).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1].trim() : String(displayName).trim();
}

/**
 * One canonical dump name: slugify(full display name).
 * (Old code used describeSlug + "--" + testSlug, which doubled "--" vs the hook path.)
 */
function resolveDisplayName(ancestorTitles, title, currentTestName) {
  if (ancestorTitles && ancestorTitles.length > 0) {
    return testDisplayName(ancestorTitles, title);
  }
  if (currentTestName && JEST_NAME_SEP.test(currentTestName)) {
    return currentTestName;
  }
  return currentTestName || title;
}

function failureDumpPath(absPath, ancestorTitles, title, currentTestName) {
  const relPath = relative(ROOT, absPath).split("\\").join("/");
  const displayName = resolveDisplayName(ancestorTitles, title, currentTestName);
  return join(
    FAILED_DIR,
    `${relPathToFilePart(relPath)}--${slugify(displayName)}.txt`,
  );
}

function inferTestPathFromError(err) {
  if (!err?.stack) {
    return null;
  }
  for (const line of String(err.stack).split("\n")) {
    const m =
      line.match(/\((.+?\.(?:test|spec)\.[cm]?[jt]sx?):\d+:\d+\)/) ||
      line.match(/at (.+?\.(?:test|spec)\.[cm]?[jt]sx?):\d+:\d+/);
    if (m && !m[1].includes("node_modules")) {
      return m[1];
    }
  }
  return null;
}

function parseCurrentTestName(currentTestName) {
  if (!currentTestName) {
    return { ancestorTitles: [], title: "unknown" };
  }
  const parts = currentTestName.split(JEST_NAME_SEP).filter(Boolean);
  if (parts.length === 1) {
    return { ancestorTitles: [], title: parts[0].trim() };
  }
  return {
    ancestorTitles: parts.slice(0, -1).map((p) => p.trim()),
    title: parts[parts.length - 1].trim(),
  };
}

/** Exact it() title for rebaseline-targets.txt (file::title). */
function itTitleFromDumpContent(content) {
  const it = content.match(/^It:\s+(.+)$/m)?.[1]?.trim() || "";
  const describe =
    content.match(/^Describe path:\s+(.+)$/m)?.[1]?.trim() || "";
  if (describe) {
    return it;
  }
  if (JEST_NAME_SEP.test(it)) {
    return lastNameSegment(it);
  }
  return it;
}

function listFailureTargetLinesFromDumps() {
  if (!existsSync(FAILED_DIR)) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const entry of readdirSync(FAILED_DIR)) {
    if (!entry.startsWith("tests--") || !entry.endsWith(".txt")) {
      continue;
    }
    const content = readFileSync(join(FAILED_DIR, entry), "utf8");
    const rel = content.match(/^Test file \(relative\):\s+(.+)$/m)?.[1]?.trim();
    if (!rel) {
      continue;
    }
    const title = itTitleFromDumpContent(content);
    if (!title) {
      continue;
    }
    const line = `${rel}::${title}`;
    if (seen.has(line)) {
      continue;
    }
    seen.add(line);
    out.push(line);
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function specFromDumpContent(content, filePath) {
  const rel =
    content.match(/^Test file \(relative\):\s+(.+)$/m)?.[1]?.trim() || "";
  const describePath =
    content.match(/^Describe path:\s+(.+)$/m)?.[1]?.trim() || "";
  const itTitle = content.match(/^It:\s+(.+)$/m)?.[1]?.trim() || "";
  if (!rel) {
    return { spec: filePath, filePath };
  }
  const spec =
    describePath.length > 0
      ? `${rel} :: ${describePath} › ${itTitle}`
      : `${rel} :: ${itTitle}`;
  return { spec, filePath };
}

function dumpContentMatchesCase(relPath, displayName, content) {
  const rel = content.match(/^Test file \(relative\):\s+(.+)$/m)?.[1]?.trim();
  if (rel !== relPath) {
    return false;
  }
  const it = content.match(/^It:\s+(.+)$/m)?.[1]?.trim() || "";
  const describe =
    content.match(/^Describe path:\s+(.+)$/m)?.[1]?.trim() || "";
  const itOnly = lastNameSegment(displayName);
  if (it === itOnly || it === displayName) {
    return true;
  }
  if (describe && testDisplayName([describe], it) === displayName) {
    return true;
  }
  if (describe && `${describe} ${it}` === displayName.replace(JEST_NAME_SEP, " ")) {
    return true;
  }
  return slugify(it) === slugify(displayName);
}

/** Remove every dump for this test case (legacy duplicate filenames included). */
function removeAllDumpsForCase(absPath, ancestorTitles, title, currentTestName) {
  if (!existsSync(FAILED_DIR)) {
    return false;
  }
  const relPath = relative(ROOT, absPath).split("\\").join("/");
  const displayName = resolveDisplayName(ancestorTitles, title, currentTestName);
  const filePart = relPathToFilePart(relPath);
  let removed = false;
  for (const entry of readdirSync(FAILED_DIR)) {
    if (!entry.startsWith(`${filePart}--`) || !entry.endsWith(".txt")) {
      continue;
    }
    const filePath = join(FAILED_DIR, entry);
    try {
      const content = readFileSync(filePath, "utf8");
      if (!dumpContentMatchesCase(relPath, displayName, content)) {
        continue;
      }
    } catch {
      continue;
    }
    unlinkSync(filePath);
    removed = true;
    process.stderr.write(
      `[failedTests] removed ${relative(ROOT, filePath).split("\\").join("/")}\n`,
    );
  }
  if (removed) {
    rebuildLastRunIndex("updated after pass");
  }
  return removed;
}

/** Rebuild LAST_RUN.txt from tests--*.txt dumps (safe across Jest workers). */
function rebuildLastRunIndex(runLabel, options = {}) {
  if (!existsSync(FAILED_DIR)) {
    mkdirSync(FAILED_DIR, { recursive: true });
  }
  const when = new Date().toISOString().replace("T", " ").slice(0, 19);
  const lines = [
    "# Failed tests (current — passing tests have no dump file)",
    `# ${runLabel}, ${when} UTC`,
    `# Folder: ${FAILED_DIR}`,
    "# Dump files: tests--*.txt in that folder",
    "",
  ];

  const dumps = readdirSync(FAILED_DIR)
    .filter((e) => e.startsWith("tests--") && e.endsWith(".txt"))
    .sort();

  if (dumps.length === 0) {
    lines.push("(no failures)");
  } else {
    lines.push(`${dumps.length} failure dump(s):`, "");
    for (const name of dumps) {
      const filePath = join(FAILED_DIR, name);
      let spec = name;
      try {
        const content = readFileSync(filePath, "utf8");
        spec = specFromDumpContent(content, filePath).spec;
      } catch {
        // keep filename as spec
      }
      lines.push(spec);
      lines.push(`  → ${filePath}`, "");
    }
  }
  writeFileSync(LAST_RUN_FILE, `${lines.join("\n")}\n`, "utf8");
  if (options.syncRebaseline === false) {
    return;
  }
  try {
    require("./sync-rebaseline-targets").syncRebaselineTargetsFromDumps(
      runLabel,
    );
  } catch {
    // optional if sync module unavailable
  }
}

function recordFailure(
  absPath,
  ancestorTitles,
  title,
  failureMessages,
  currentTestName,
) {
  if (!existsSync(FAILED_DIR)) {
    mkdirSync(FAILED_DIR, { recursive: true });
  }

  const relPath = relative(ROOT, absPath).split("\\").join("/");
  const parsedAncestors = ancestorTitles || [];
  const displayName = resolveDisplayName(
    parsedAncestors,
    title,
    currentTestName,
  );
  removeAllDumpsForCase(absPath, parsedAncestors, title, currentTestName);

  const filePath = failureDumpPath(
    absPath,
    parsedAncestors,
    title,
    currentTestName,
  );

  const lines = [
    `Test file (absolute): ${absPath}`,
    `Test file (relative):  ${relPath}`,
  ];
  const { ancestorTitles: a, title: t } = parseCurrentTestName(displayName);
  if (a.length > 0) {
    lines.push(`Describe path:         ${a.join(" › ")}`);
    lines.push(`It:                    ${t}`, "", "--- Failure ---", "");
  } else {
    lines.push(`It:                    ${t}`, "", "--- Failure ---", "");
  }
  const msgs = (failureMessages || []).map((m) => stripAnsi(String(m)).trimEnd());
  if (msgs.length > 0) {
    for (const msg of msgs) {
      lines.push(msg, "");
    }
  } else {
    lines.push("(no failure message)", "");
  }
  const joined = msgs.join("\n");
  if (joined.includes("Server terminated early with status")) {
    lines.push(
      "--- Note ---",
      "ChromeDriver (Selenium) exited — not the Next.js dev server on :3000.",
      "Common cause: too many browser test files running Chrome in parallel.",
      "Mitigation: restart start4 with FINKITTY_JEST_MAX_WORKERS=1 (or 2).",
      "Ensure the app is up at http://localhost:3000 before browser tests run.",
      "",
    );
  }
  writeFileSync(filePath, lines.join("\n"), "utf8");
  const relDump = relative(ROOT, filePath).split("\\").join("/");
  process.stderr.write(`[failedTests] wrote ${relDump}\n`);
  rebuildLastRunIndex("updated after failure");
}

function removeFailureDump(absPath, ancestorTitles, title, currentTestName) {
  return removeAllDumpsForCase(absPath, ancestorTitles, title, currentTestName);
}

/** Called from tests/failedTestsHook.cjs when a test body throws. */
function recordFailedTestFromExpectState(state) {
  if (!state?.error) {
    return;
  }
  const testPath = state.testPath || inferTestPathFromError(state.error);
  if (!testPath) {
    process.stderr.write(
      "[failedTests] skip dump (no testPath in expect state or stack)\n",
    );
    return;
  }
  const { ancestorTitles, title } = parseCurrentTestName(state.currentTestName);
  const err = state.error;
  const failureMessages = [
    err.stack || err.message || String(err),
  ];
  recordFailure(
    testPath,
    ancestorTitles,
    title,
    failureMessages,
    state.currentTestName,
  );
}

/** Called when a test passes — drop stale dump if any. */
function removeFailedTestFromExpectState(state) {
  if (!state?.testPath || !state.currentTestName) {
    return;
  }
  const { ancestorTitles, title } = parseCurrentTestName(state.currentTestName);
  removeFailureDump(
    state.testPath,
    ancestorTitles,
    title,
    state.currentTestName,
  );
}

function clearFailureDumpFiles() {
  if (!existsSync(FAILED_DIR)) {
    mkdirSync(FAILED_DIR, { recursive: true });
    rebuildLastRunIndex("cleared", { syncRebaseline: false });
    return;
  }
  for (const entry of readdirSync(FAILED_DIR)) {
    if (!entry.startsWith("tests--") || !entry.endsWith(".txt")) continue;
    unlinkSync(join(FAILED_DIR, entry));
  }
  // Keep testResults/rebaseline-targets.txt — scoped start4 still needs it after dump clear.
  rebuildLastRunIndex("cleared", { syncRebaseline: false });
}

module.exports = {
  FAILED_DIR,
  clearFailureDumpFiles,
  recordFailure,
  removeFailureDump,
  recordFailedTestFromExpectState,
  removeFailedTestFromExpectState,
  rebuildLastRunIndex,
  listFailureTargetLinesFromDumps,
};
