#!/bin/bash
# Reb baseline algo tests from testResults/rebaseline-targets.txt (filled by ./start4TestLocalWebServer.sh).
# Requires // printTestCodeForEvals / // printTestCodeForChart markers in algo tests. See testResults/README.txt.
#
# ─── Settings (edit here) ───────────────────────────────────────────────────
#
# 1 = patch expectation blocks in test files (--write)
# 0 = run listed tests only (verify, no file edits)
FINKITTY_REBASELINE_WRITE=1
#
# Default targets: testResults/rebaseline-targets.txt (synced from testResults/failedTests/ after start4 failures)
# FINKITTY_REBASELINE_TARGETS_FILE=testResults/my-targets.txt
#
# Extra CLI (optional): pass through to rebaseline-algo-tests.mjs, e.g.:
#   ./start8Rebaseline.sh --test='tests/algoTests/algoBond.test.ts::my it name'
#   ./start8Rebaseline.sh --help
#
# ─── end settings ─────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

TARGETS_FILE="${FINKITTY_REBASELINE_TARGETS_FILE:-$SCRIPT_DIR/testResults/rebaseline-targets.txt}"

ARGS=()
if [ "${FINKITTY_REBASELINE_WRITE}" = "1" ]; then
  ARGS+=(--write)
fi

use_default_targets=true
for a in "$@"; do
  case "$a" in
    --test=*|--tests-file=*|--help|-h)
      use_default_targets=false
      ;;
  esac
done

if $use_default_targets; then
  ARGS+=(--tests-file="$TARGETS_FILE")
fi

ARGS+=("$@")

echo "[start8] Reb baseline algo tests"
if [ "${FINKITTY_REBASELINE_WRITE}" = "1" ]; then
  echo "[start8] Mode: --write (updates expectations where print markers exist)"
else
  echo "[start8] Mode: verify only (no file edits; set FINKITTY_REBASELINE_WRITE=1 to patch)"
fi

if $use_default_targets; then
  if [ ! -f "$TARGETS_FILE" ]; then
    echo "[start8] ERROR: targets file missing: $TARGETS_FILE"
    echo "[start8] Run ./start4TestLocalWebServer.sh until tests fail, or:"
    echo "[start8]   cp testResults/rebaseline-targets.example.txt testResults/rebaseline-targets.txt"
    exit 1
  fi
  target_count="$(node -e "
    const { loadRebaselineTargets } = require('./scripts/load-rebaseline-targets');
    const f = process.argv[1];
    const t = loadRebaselineTargets(f);
    console.log(t.length);
  " "$TARGETS_FILE")"
  if [ "${target_count:-0}" = "0" ]; then
    echo "[start8] ERROR: no active targets in $TARGETS_FILE"
    echo "[start8] Add a line:  tests/algoTests/foo.test.ts::exact it() title"
    echo "[start8] Or pass:  ./start8Rebaseline.sh --test='file::name'"
    exit 1
  fi
  echo "[start8] Targets: $TARGETS_FILE ($target_count test(s))"
fi

echo "[start8] node scripts/rebaseline-algo-tests.mjs ${ARGS[*]}"
echo ""

node "$SCRIPT_DIR/scripts/rebaseline-algo-tests.mjs" "${ARGS[@]}"
exit $?
