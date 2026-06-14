#!/bin/bash
# Local Jest watch + failure dumps (output under testResults/ — see testResults/README.txt)
#
# Jest scope
#   1 = only tests listed in testResults/rebaseline-targets.txt (--watch)
#   0 = full suite (--watchAll)
FINKITTY_JEST_ONLY_REBASELINE_TARGETS=0
FINKITTY_REBASELINE_TARGETS_FILE=testResults/rebaseline-targets-copy.txt   # optional

# Browser (Chrome via Selenium)
FINKITTY_BROWSER_HEADLESS=1          # 1 = no visible window
FINKITTY_BROWSER_PAGE_ZOOM=0.5
FINKITTY_BROWSER_WINDOW_WIDTH=1000
FINKITTY_BROWSER_WINDOW_HEIGHT=720

# Jest / failure dumps
FINKITTY_JEST_MAX_WORKERS=3          # use 1 if Chrome "Server terminated early"
FINKITTY_CLEAR_FAILED_TESTS=1        # 0 = keep testResults/failedTests/*.txt at launch

#
# ─── end settings ─────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# ─── quick reminder (what the settings at the top of this file mean) ────────
cat <<'EOF'
============================== start4 reminder ===============================
This runs Jest. Scope is controlled by the settings at the TOP of this file:

  FINKITTY_JEST_ONLY_REBASELINE_TARGETS
    1 = SCOPED: only the it() titles listed in the rebaseline-targets file run.
        Jest still LOADS each whole matched .test file, so the summary's
        "N total" is that file's test count and most show as "skipped".
        (Expect e.g. "1 passed, 108 skipped, 1 suite" - NOT the full suite.)
    0 = FULL SUITE: run everything (Jest --watchAll).

  FINKITTY_REBASELINE_TARGETS_FILE   (only used when scoped)
    Targets list, one "<test-file>::<exact it() title>" per line.
    Defaults to testResults/rebaseline-targets.txt; the *-copy.txt is optional.

A "1 skipped" suite/test in a FULL run is the gated perf benchmark
  tests/perf/getEvaluations.perf.test.ts - it self-skips unless you set
  FINKITTY_PERF_MODEL_PATH=/path/to/model.json. That's expected.
==============================================================================
EOF
echo "[start4] Current: FINKITTY_JEST_ONLY_REBASELINE_TARGETS=${FINKITTY_JEST_ONLY_REBASELINE_TARGETS} (1=scoped, 0=full suite)"

export FINKITTY_JEST_ONLY_REBASELINE_TARGETS
export FINKITTY_JEST_MAX_WORKERS
export FINKITTY_CLEAR_FAILED_TESTS
export FINKITTY_BROWSER_HEADLESS
export FINKITTY_BROWSER_PAGE_ZOOM
export FINKITTY_BROWSER_WINDOW_WIDTH
export FINKITTY_BROWSER_WINDOW_HEIGHT
export FINKITTY_REBASELINE_TARGETS_FILE

is_truthy() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    1 | true | yes | on) return 0 ;;
    *) return 1 ;;
  esac
}

TEST_RESULTS_DIR="$SCRIPT_DIR/testResults"
FAILED_TESTS_DIR="$TEST_RESULTS_DIR/failedTests"
mkdir -p "$FAILED_TESTS_DIR"
if [ "${FINKITTY_CLEAR_FAILED_TESTS}" = "1" ]; then
  node -e "require('./scripts/record-failed-test.js').clearFailureDumpFiles()"
  CLEARED_NOTE="Cleared tests--*.txt at start4 launch."
else
  CLEARED_NOTE="Kept existing tests--*.txt (FINKITTY_CLEAR_FAILED_TESTS=0)."
fi
printf '%s\n' \
  "# $CLEARED_NOTE" \
  "# Folder: $FAILED_TESTS_DIR" \
  '# When a test fails, Jest prints: [failedTests] wrote testResults/failedTests/...' \
  > "$FAILED_TESTS_DIR/LAST_RUN.txt"
echo "[start4] Failure dumps → $FAILED_TESTS_DIR"
echo "[start4] $CLEARED_NOTE Watch the terminal for [failedTests] wrote ... lines."
echo "[start4] Jest --maxWorkers=$FINKITTY_JEST_MAX_WORKERS (raise for speed; use 1 if Chrome crashes)"

REBASELINE_TARGETS_DISPLAY="${FINKITTY_REBASELINE_TARGETS_FILE:-testResults/rebaseline-targets.txt}"
if is_truthy "${FINKITTY_JEST_ONLY_REBASELINE_TARGETS}"; then
  echo "[start4] MODE: scoped — only tests in $REBASELINE_TARGETS_DISPLAY (set FINKITTY_JEST_ONLY_REBASELINE_TARGETS=0 for full suite)"
  echo "[start4] Scoped OK when summary shows 5 skipped (not 5 passed) and 1 suite — not 28 suites."
else
  echo "[start4] MODE: full suite — Jest --watchAll"
fi

node "$SCRIPT_DIR/scripts/start4-jest.js"
