/** Paths for local test output (gitignored under testResults/, except README + example). */
const { join } = require("path");

const ROOT = join(__dirname, "..");
const TESTS_DIR = join(ROOT, "tests");
const TEST_RESULTS_DIR = join(ROOT, "testResults");

module.exports = {
  ROOT,
  TESTS_DIR,
  TEST_RESULTS_DIR,
  TARGETS_FILE: join(TEST_RESULTS_DIR, "rebaseline-targets.txt"),
  EXAMPLE_TARGETS_FILE: join(TEST_RESULTS_DIR, "rebaseline-targets.example.txt"),
  EDITED_FILE: join(TEST_RESULTS_DIR, "rebaseline-edited.txt"),
  NOT_EDITED_FILE: join(TEST_RESULTS_DIR, "rebaseline-not-edited.txt"),
  FAILED_TESTS_DIR: join(TEST_RESULTS_DIR, "failedTests"),
  CAPTURE_FILE: join(TEST_RESULTS_DIR, ".rebaseline-capture.txt"),
};
