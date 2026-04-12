#!/usr/bin/env bash
# Benchmark getEvaluations at each commit since a date (default 2026-03-20).
# Copies tests/perf/getEvaluations.perf.test.ts from this repo into each worktree
# so older commits (before perf:eval existed) still run the same harness against
# that commit's engine code.
#
# Requires FINKITTY_PERF_MODEL_PATH (absolute path to JSON export; never commit it).
#
# Optional env:
#   FINKITTY_PERF_SINCE       default 2026-03-20
#   FINKITTY_PERF_BRANCH      default main
#   FINKITTY_PERF_RESULTS_FILE  default <repo>/perf-results.jsonl
#   FINKITTY_PERF_WORKTREE_ROOT parent dir for worktrees (default <repo>/../finkitty-perf-wt)
#
# Git compatibility: written for Git 2.15.x — no `git worktree remove` (added in 2.17).
# Cleanup uses `rm -rf` on the worktree path plus `git worktree prune`.

set -euo pipefail

# Git 2.15+ : drop a linked worktree without `git worktree remove`.
remove_worktree_2_15() {
  local wt_path="$1"
  if [[ -e "$wt_path" ]]; then
    rm -rf "$wt_path"
  fi
  git worktree prune
}

if [[ -z "${FINKITTY_PERF_MODEL_PATH:-}" ]]; then
  echo "Set FINKITTY_PERF_MODEL_PATH to the absolute path of your JSON export." >&2
  exit 1
fi
export FINKITTY_PERF_MODEL_PATH

SINCE="${FINKITTY_PERF_SINCE:-2026-03-20}"
BRANCH="${FINKITTY_PERF_BRANCH:-main}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
RESULTS="${FINKITTY_PERF_RESULTS_FILE:-$ROOT/perf-results.jsonl}"
WT_BASE="${FINKITTY_PERF_WORKTREE_ROOT:-$ROOT/../finkitty-perf-wt}"
mkdir -p "$WT_BASE"
export FINKITTY_PERF_RESULTS_FILE="$RESULTS"
touch "$RESULTS"

HARNESS_SRC="$ROOT/tests/perf/getEvaluations.perf.test.ts"
if [[ ! -f "$HARNESS_SRC" ]]; then
  echo "Missing perf harness at $HARNESS_SRC (run from repo with Phase 1 committed)." >&2
  exit 1
fi

count="$(git rev-list --count --since="$SINCE" "$BRANCH")"
echo "Commits to benchmark: $count (since $SINCE on $BRANCH)" >&2
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
    HUSKY=0 npm ci
    mkdir -p tests/perf
    cp "$HARNESS_SRC" tests/perf/getEvaluations.perf.test.ts
    export FINKITTY_PERF_MODEL_PATH
    export FINKITTY_PERF_RESULTS_FILE="$RESULTS"
    # Do not use npm run perf:eval — it may not exist on older commits.
    npx jest tests/perf/getEvaluations.perf.test.ts --runInBand --ci --testTimeout=600000 2>&1 \
      | tee "/tmp/finkitty-perf-$short.log" \
      | grep '__PERF_RESULT__' || true
  )
  remove_worktree_2_15 "$wt"
done < <(git rev-list --reverse --since="$SINCE" "$BRANCH")

echo "Done. Results: $RESULTS" >&2
