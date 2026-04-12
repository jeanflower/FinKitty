#!/usr/bin/env bash
# Benchmark getEvaluations at each commit since a date (default 2026-03-20).
# Copies tests/perf/getEvaluations.perf.test.ts from this repo into each worktree
# so older commits (before perf:eval existed) still run the same harness against
# that commit's engine code.
#
# Defaults (override by exporting env vars before npm run perf:across-commits):
#   FINKITTY_PERF_MODEL_PATH     → /Users/jeanflower/outsideICloud/git/FinKitty/NeoPerfModel.json
#   FINKITTY_PERF_RESULTS_FILE   → <repo>/NeoPerfResults.jsonl
#
# Optional env:
#   FINKITTY_PERF_SINCE       default 2026-03-20
#   FINKITTY_PERF_BRANCH      default main
#   FINKITTY_PERF_WORKTREE_ROOT parent dir for worktrees (default <repo>/../finkitty-perf-wt)
#   FINKITTY_PERF_ITERATIONS / FINKITTY_PERF_WARMUP — passed to Jest (default 50 / 3 in harness)
#   FINKITTY_PERF_FAST=1      if iterations/warmup unset, use 10 / 1 (coarser but much faster)
#   FINKITTY_PERF_COMMIT_STEP  default 1; use 2 or 3 to benchmark every Nth commit only
#   FINKITTY_PERF_LAST_N       if set (e.g. 3), only the last N commits on BRANCH
#                              (oldest→newest among those N); ignores SINCE and COMMIT_STEP
#
# Git compatibility: written for Git 2.15.x — no `git worktree remove` (added in 2.17).
# Cleanup uses `rm -rf` on the worktree path plus `git worktree prune`.
#
# Results jsonl: each successful run appends one line by parsing /tmp/finkitty-perf-<short>.log
# (Jest sets FINKITTY_PERF_SKIP_FILE_APPEND=1 so file IO is done here, not in Node).

set -euo pipefail

# Git 2.15+ : drop a linked worktree without `git worktree remove`.
remove_worktree_2_15() {
  local wt_path="$1"
  if [[ -e "$wt_path" ]]; then
    rm -rf "$wt_path"
  fi
  git worktree prune
}

perf_tail_log() {
  local logf="$1"
  if [[ -s "$logf" ]]; then
    echo "----- tail -30 $logf -----" >&2
    tail -n 30 "$logf" >&2
    echo "----- end tail -----" >&2
  else
    echo "(log missing or empty — check npm ci above, or subshell exited early)" >&2
  fi
}

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

: "${FINKITTY_PERF_MODEL_PATH:=/Users/jeanflower/outsideICloud/git/FinKitty/NeoPerfModel.json}"
: "${FINKITTY_PERF_RESULTS_FILE:=/Users/jeanflower/outsideICloud/git/FinKitty/NeoPerfResults.jsonl}"

export FINKITTY_PERF_MODEL_PATH
export FINKITTY_PERF_RESULTS_FILE

if [[ ! -f "$FINKITTY_PERF_MODEL_PATH" ]]; then
  echo "Model file not found: $FINKITTY_PERF_MODEL_PATH" >&2
  exit 1
fi

echo "Using model: $FINKITTY_PERF_MODEL_PATH" >&2
echo "Using results: $FINKITTY_PERF_RESULTS_FILE" >&2

if [[ "${FINKITTY_PERF_FAST:-}" == "1" ]]; then
  if [[ -z "${FINKITTY_PERF_ITERATIONS:-}" ]]; then
    export FINKITTY_PERF_ITERATIONS=4
  fi
  if [[ -z "${FINKITTY_PERF_WARMUP:-}" ]]; then
    export FINKITTY_PERF_WARMUP=1
  fi
  echo "FINKITTY_PERF_FAST=1 → iterations=${FINKITTY_PERF_ITERATIONS} warmup=${FINKITTY_PERF_WARMUP}" >&2
fi

SINCE="${FINKITTY_PERF_SINCE:-2026-03-20}"
BRANCH="${FINKITTY_PERF_BRANCH:-main}"
RESULTS="$FINKITTY_PERF_RESULTS_FILE"
WT_BASE="${FINKITTY_PERF_WORKTREE_ROOT:-$ROOT/../finkitty-perf-wt}"
mkdir -p "$WT_BASE"
touch "$RESULTS"

HARNESS_SRC="$ROOT/tests/perf/getEvaluations.perf.test.ts"
if [[ ! -f "$HARNESS_SRC" ]]; then
  echo "Missing perf harness at $HARNESS_SRC (run from repo with Phase 1 committed)." >&2
  exit 1
fi

LAST_N="${FINKITTY_PERF_LAST_N:-}"
if [[ -n "$LAST_N" ]]; then
  if ! [[ "$LAST_N" =~ ^[1-9][0-9]*$ ]]; then
    echo "FINKITTY_PERF_LAST_N must be a positive integer, got: $LAST_N" >&2
    exit 1
  fi
  echo "Benchmarking last $LAST_N commit(s) on $BRANCH (oldest→newest)" >&2
else
  STEP="${FINKITTY_PERF_COMMIT_STEP:-1}"
  if ! [[ "$STEP" =~ ^[1-9][0-9]*$ ]]; then
    echo "FINKITTY_PERF_COMMIT_STEP must be a positive integer, got: $STEP" >&2
    exit 1
  fi
  count="$(git rev-list --count --since="$SINCE" "$BRANCH")"
  if [[ "$STEP" -gt 1 ]]; then
    picked="$(git rev-list --reverse --since="$SINCE" "$BRANCH" | awk -v step="$STEP" '(NR - 1) % step == 0' | wc -l | tr -d ' ')"
    echo "Commits in range: $count; benchmarking every ${STEP}th → ~$picked runs" >&2
  else
    echo "Commits to benchmark: $count (since $SINCE on $BRANCH)" >&2
  fi
fi
echo "Appending JSON lines to $RESULTS" >&2

while IFS= read -r sha; do
  [[ -n "$sha" ]] || continue
  sha="${sha//$'\r'/}"
  short="$(git rev-parse --short "$sha")"
  # Full SHA avoids ambiguous short prefixes and path collisions.
  wt="$WT_BASE/$sha"
  if [[ -e "$wt" ]]; then
    remove_worktree_2_15 "$wt"
  fi
  echo "=== $short ($sha) ===" >&2
  # Detached checkout at commit: plain `add <path> <commit>` is enough in 2.15 (SHA is not a branch).
  git worktree add "$wt" "$sha"
  (
    cd "$wt"
    # Avoid husky/prepare doing git setup that can confuse nested worktrees.
    # --no-audit --no-fund saves a bit per commit; --prefer-offline uses npm cache when possible.
    HUSKY=0 npm ci --no-audit --no-fund --prefer-offline
    mkdir -p tests/perf
    cp "$HARNESS_SRC" tests/perf/getEvaluations.perf.test.ts
    export FINKITTY_PERF_MODEL_PATH
    export FINKITTY_PERF_RESULTS_FILE="$RESULTS"
    # Runner append is unreliable under npx/jest in worktrees; shell appends from log below.
    export FINKITTY_PERF_SKIP_FILE_APPEND=1
    # Do not use npm run perf:eval — it may not exist on older commits.
    npx jest tests/perf/getEvaluations.perf.test.ts --runInBand --ci --testTimeout=600000 2>&1 \
      | tee "/tmp/finkitty-perf-$short.log" \
      | grep '__PERF_RESULT__' || true
  )
  logf="/tmp/finkitty-perf-$short.log"
  if grep -q "__PERF_RESULT__" "$logf" 2>/dev/null; then
    # Jest may prefix lines (e.g. "console.log"); strip through the marker.
    json_line="$(grep "__PERF_RESULT__" "$logf" | tail -1 | sed 's/.*__PERF_RESULT__ //')"
    if [[ -n "$json_line" ]]; then
      printf "%s\n" "$json_line" >>"$RESULTS"
      echo "Wrote result line for $short → $RESULTS" >&2
    else
      echo "WARN: could not parse __PERF_RESULT__ for $short (see $logf)" >&2
      perf_tail_log "$logf"
    fi
  else
    echo "WARN: no __PERF_RESULT__ for $short — jest likely failed (see $logf)" >&2
    perf_tail_log "$logf"
  fi
  remove_worktree_2_15 "$wt"
done < <(
  if [[ -n "${FINKITTY_PERF_LAST_N:-}" ]]; then
    git rev-list --reverse -n "$FINKITTY_PERF_LAST_N" "$BRANCH"
  else
    git rev-list --reverse --since="$SINCE" "$BRANCH" | awk -v step="$STEP" 'step < 2 || (NR - 1) % step == 0'
  fi
)

echo "Done. Results: $RESULTS" >&2
