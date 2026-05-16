/**
 * Keep testResults/rebaseline-targets.txt in sync with testResults/failedTests/ dump files.
 */
const { writeFileSync } = require("fs");
const { relative } = require("path");
const { ROOT, TARGETS_FILE } = require("./rebaseline-paths.js");
const { listFailureTargetLinesFromDumps } = require("./record-failed-test.js");

const FILE_HEADER = `# Failed tests (synced with testResults/failedTests/ after each fail or pass)
#
# Algo tests (under tests/algoTests/): npm run rebaseline:algo
#   npm run rebaseline:algo -- --write   # needs printTestCodeForEvals/Chart markers
# Other tests: fix expectations manually (rebaseline:algo only runs listed Jest targets)
#
# Format (one per line):  <test-file>::<exact it() title>
#   tests/algoTests/algoPension.test.ts::pay into defined contributions pension simplest
#
# Lines starting with # and blank lines are ignored.
# Override:  npm run rebaseline:algo -- --tests-file=path/to/other.txt
# One-off:   npm run rebaseline:algo -- --test='file::name'
`;

function syncRebaselineTargetsFromDumps(runLabel) {
  const targets = listFailureTargetLinesFromDumps();
  const when = new Date().toISOString().replace("T", " ").slice(0, 19);
  let body = `${FILE_HEADER}
# Auto-updated (${runLabel}, ${when} UTC)
`;
  if (targets.length === 0) {
    body += "# No failures in testResults/failedTests/.\n";
  } else {
    body += `${targets.join("\n")}\n`;
  }
  writeFileSync(TARGETS_FILE, body, "utf8");
  const rel = relative(ROOT, TARGETS_FILE).split("\\").join("/");
  if (targets.length === 0) {
    process.stderr.write(`[rebaseline] ${rel} cleared (no failed tests)\n`);
  } else {
    process.stderr.write(
      `[rebaseline] ${rel} ← ${targets.length} failed test(s) from testResults/failedTests/\n`,
    );
  }
  return targets;
}

module.exports = { syncRebaselineTargetsFromDumps };
