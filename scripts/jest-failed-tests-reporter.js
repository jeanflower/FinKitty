/**
 * Jest reporter: syncs testResults/failedTests/ when the main process gets results.
 * Primary path is tests/failedTestsHook.cjs (watch); this reporter reinforces pass/fail.
 */
const {
  recordFailure,
  removeFailureDump,
  rebuildLastRunIndex,
  FAILED_DIR,
} = require("./record-failed-test");

class FailedTestsReporter {
  constructor() {
    this.runGeneration = 0;
  }

  onRunStart() {
    this.runGeneration += 1;
    rebuildLastRunIndex(`run #${this.runGeneration} started`);
  }

  onTestResult(test, testResult) {
    const absPath = test.path;
    let caseFailures = 0;

    for (const tr of testResult.testResults || []) {
      const ancestors = tr.ancestorTitles || [];
      if (tr.status === "passed") {
        removeFailureDump(absPath, ancestors, tr.title);
        continue;
      }
      if (tr.status !== "failed") {
        continue;
      }
      caseFailures += 1;
      recordFailure(absPath, ancestors, tr.title, tr.failureMessages || []);
    }

    if (testResult.failureMessage && caseFailures === 0) {
      recordFailure(absPath, [], "(test file / hooks)", [
        testResult.failureMessage,
      ]);
    }
  }

  onRunComplete() {
    rebuildLastRunIndex(`run #${this.runGeneration} complete`);
    const { existsSync, readdirSync } = require("fs");
    const count = existsSync(FAILED_DIR)
      ? readdirSync(FAILED_DIR).filter(
          (e) => e.startsWith("tests--") && e.endsWith(".txt"),
        ).length
      : 0;
    process.stderr.write(
      `[failedTests] ${count} dump(s) — see ${FAILED_DIR}\n`,
    );
  }
}

module.exports = FailedTestsReporter;
