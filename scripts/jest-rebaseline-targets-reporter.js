/**
 * Jest reporter: keeps testResults/rebaseline-targets.txt in sync with testResults/failedTests/.
 * Primary updates happen in record-failed-test.js on each fail/pass; onRunComplete
 * refreshes again from dump files when the main process finishes a run.
 */
const { syncRebaselineTargetsFromDumps } = require("./sync-rebaseline-targets");

class RebaselineTargetsReporter {
  onRunComplete() {
    syncRebaselineTargetsFromDumps("onRunComplete");
  }
}

module.exports = RebaselineTargetsReporter;
