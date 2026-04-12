#!/usr/bin/env bash
# V8 CPU profile of getEvaluations via the Jest perf harness (Node --cpu-prof).
#
# Default model path (override with FINKITTY_PERF_MODEL_PATH):
#   /Users/jeanflower/outsideICloud/git/FinKitty/NeoPerfModel.json
#
# Optional env:
#   FINKITTY_PERF_ITERATIONS  default 3  (keep low for smaller .cpuprofile)
#   FINKITTY_PERF_WARMUP      default 1
#
# Note: Node forbids --cpu-prof in NODE_OPTIONS; this script runs
#   node --cpu-prof node_modules/jest/bin/jest.js ...
#
# Output: one or more CPU*.cpuprofile files in the repo root. Open in Chrome:
#   DevTools → Performance (or JavaScript Profiler) → Load profile

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

: "${FINKITTY_PERF_MODEL_PATH:=/Users/jeanflower/outsideICloud/git/FinKitty/NeoPerfModel.json}"
export FINKITTY_PERF_MODEL_PATH

export FINKITTY_PERF_ITERATIONS="${FINKITTY_PERF_ITERATIONS:-3}"
export FINKITTY_PERF_WARMUP="${FINKITTY_PERF_WARMUP:-1}"

# Profiling run: do not append jsonl unless user explicitly exported this.
if [[ -z "${FINKITTY_PERF_RESULTS_FILE:-}" ]]; then
  unset FINKITTY_PERF_RESULTS_FILE 2>/dev/null || true
fi
unset FINKITTY_PERF_SKIP_FILE_APPEND 2>/dev/null || true

if [[ ! -f "$FINKITTY_PERF_MODEL_PATH" ]]; then
  echo "Model file not found: $FINKITTY_PERF_MODEL_PATH" >&2
  exit 1
fi

JEST_CLI="$ROOT/node_modules/jest/bin/jest.js"
if [[ ! -f "$JEST_CLI" ]]; then
  echo "Missing $JEST_CLI — run npm ci from the repo root." >&2
  exit 1
fi

echo "Repo: $ROOT" >&2
echo "Model: $FINKITTY_PERF_MODEL_PATH" >&2
echo "iterations=$FINKITTY_PERF_ITERATIONS warmup=$FINKITTY_PERF_WARMUP" >&2
echo "→ node --cpu-prof $JEST_CLI …" >&2
echo "→ Expect CPU*.cpuprofile under $ROOT after Jest finishes." >&2
echo >&2

node --cpu-prof "$JEST_CLI" tests/perf/getEvaluations.perf.test.ts --runInBand --ci --testTimeout=600000

echo >&2
echo "Recent CPU profiles:" >&2
ls -lt "$ROOT"/CPU*.cpuprofile 2>/dev/null | head -10 || echo "(none found in $ROOT — check Jest/Node version or cwd)" >&2
echo >&2
echo "Open the newest .cpuprofile in Chrome DevTools → Performance → load." >&2
