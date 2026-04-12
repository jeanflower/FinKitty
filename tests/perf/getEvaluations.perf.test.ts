/**
 * Phase 1 perf harness: times getEvaluations on a local JSON export.
 *
 * Requires FINKITTY_PERF_MODEL_PATH (absolute path). Never commit customer JSON;
 * keep exports outside the repo or under gitignored paths.
 *
 * Optional env:
 *   FINKITTY_PERF_ITERATIONS   (default 50)
 *   FINKITTY_PERF_WARMUP       (default 3)
 *   FINKITTY_PERF_MAX_REPORT_SIZE (default defaultReportSize)
 *   FINKITTY_PERF_VIEW_FREQUENCY  (default monthly)
 *   FINKITTY_PERF_REPORTER     monitoring | tax | optimizer  (default monitoring)
 *   FINKITTY_PERF_RESULTS_FILE  if set, append one JSON line (jsonl)
 *
 * Speed (also see perf:across-commits.sh): lower ITERATIONS/WARMUP, or
 * FINKITTY_PERF_FAST=1 / perf:across-commits:fast, or FINKITTY_PERF_COMMIT_STEP=2|3
 * to sample every Nth commit.
 *
 * FINKITTY_PERF_SKIP_FILE_APPEND=1 — only print __PERF_RESULT__; perf-across-commits.sh
 * appends jsonl lines from the tee log (avoids flaky writes from inside Jest).
 */

import { execSync } from "child_process";
import * as fs from "fs";
import {
  defaultReportSize,
  monthly,
  revalueAsset,
} from "../../localization/stringConstants";
import { makeModelFromJSON } from "../../models/modelFromJSON";
import {
  EvaluationHelper,
  getEvaluations,
  processGenerators,
} from "../../models/evaluations";
import type {
  Asset,
  Expense,
  Income,
  ModelData,
  ReportValueChecker,
  Setting,
  Transaction,
  Trigger,
} from "../../types/interfaces";
import { lessThan } from "../../utils/stringUtils";

/** Mirrors isDCPRevalueBatchTransaction in dcpRevalueExpand.ts (inlined for older commits that lack that export). */
const dcpRevalueBatchCategoryPrefix = "DCPRevalueBatch ";

function isDcpRevalueBatchTransactionLocal(t: Transaction): boolean {
  return (
    t.TYPE === revalueAsset &&
    typeof t.CATEGORY === "string" &&
    t.CATEGORY.startsWith(dcpRevalueBatchCategoryPrefix)
  );
}

function gitMeta(): { commit: string | null; commit_date: string | null } {
  try {
    const commit = execSync("git rev-parse HEAD", {
      encoding: "utf8",
    }).trim();
    const commit_date = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
    }).trim();
    return { commit, commit_date };
  } catch {
    return { commit: null, commit_date: null };
  }
}

function parsePositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`${name} must be a positive integer, got ${raw}`);
  }
  return n;
}

function sortedMedian(values: number[]): number {
  if (values.length === 0) {
    return NaN;
  }
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return NaN;
  }
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    s.length - 1,
    Math.max(0, Math.ceil((p / 100) * s.length) - 1),
  );
  return s[idx];
}

function reporterForMode(mode: string): ReportValueChecker {
  if (mode === "tax") {
    return (
      name: string,
      _val: number | string,
      _date: Date,
      _source: string,
    ) => name.startsWith("taxBreakdown");
  }
  if (mode === "optimizer") {
    return () => false;
  }
  return (
    name: string,
    _val: number | string,
    _date: Date,
    _source: string,
  ) => name.startsWith("taxForFixed") || name.startsWith("incomeFixed");
}

function prepareProcessedModel(jsonText: string): ModelData {
  const modelRaw = JSON.parse(jsonText) as ModelData;
  modelRaw.triggers.sort((a: Trigger, b: Trigger) =>
    lessThan(b.NAME, a.NAME),
  );
  modelRaw.expenses.sort((a: Expense, b: Expense) =>
    lessThan(b.NAME, a.NAME),
  );
  modelRaw.settings.sort((a: Setting, b: Setting) =>
    lessThan(b.NAME, a.NAME),
  );
  modelRaw.incomes.sort((a: Income, b: Income) => lessThan(b.NAME, a.NAME));
  modelRaw.transactions.sort((a: Transaction, b: Transaction) =>
    lessThan(b.NAME, a.NAME),
  );
  modelRaw.transactions = modelRaw.transactions.filter((t) => {
    return !isDcpRevalueBatchTransactionLocal(t);
  });
  modelRaw.assets.sort((a: Asset, b: Asset) => lessThan(b.NAME, a.NAME));

  const modelProcessed = makeModelFromJSON(JSON.stringify(modelRaw));
  modelProcessed.undoModel = undefined;
  modelProcessed.redoModel = undefined;
  modelProcessed.name = "ready to be processed";

  const error = processGenerators(modelProcessed);
  modelProcessed.name = "has been processed";
  if (error.length > 0) {
    throw new Error(`processGenerators failed: ${error}`);
  }
  return modelProcessed;
}

const modelPath = process.env.FINKITTY_PERF_MODEL_PATH;
const runSuite = !!modelPath;

(runSuite ? describe : describe.skip)("getEvaluations perf (local JSON)", () => {
  it(
    "reports timing statistics",
    () => {
      if (!modelPath) {
        return;
      }
      const jsonText = fs.readFileSync(modelPath, "utf8");
      const modelProcessed = prepareProcessedModel(jsonText);

      const iterations = parsePositiveInt("FINKITTY_PERF_ITERATIONS", 50);
      const warmup = parsePositiveInt("FINKITTY_PERF_WARMUP", 3);
      const maxReportSize = parsePositiveInt(
        "FINKITTY_PERF_MAX_REPORT_SIZE",
        defaultReportSize,
      );
      const frequency =
        process.env.FINKITTY_PERF_VIEW_FREQUENCY ?? monthly;
      const reporterMode =
        process.env.FINKITTY_PERF_REPORTER ?? "monitoring";

      const reporter = reporterForMode(reporterMode);
      const helper = new EvaluationHelper(
        reporter,
        maxReportSize,
        frequency,
      );

      for (let w = 0; w < warmup; w += 1) {
        getEvaluations(modelProcessed, helper);
      }

      const sanity = getEvaluations(modelProcessed, helper);
      if (sanity.evaluations.length === 0) {
        const hint =
          sanity.reportData[0]?.source ??
          JSON.stringify(sanity.reportData.slice(0, 2));
        throw new Error(
          "perf harness: getEvaluations returned 0 evaluations (not comparable timing). " +
            `First reportData hint: ${hint}`,
        );
      }

      const samples: number[] = [];
      let lastEvalCount = 0;
      for (let i = 0; i < iterations; i += 1) {
        const t0 = performance.now();
        const out = getEvaluations(modelProcessed, helper);
        samples.push(performance.now() - t0);
        lastEvalCount = out.evaluations.length;
        expect(out.evaluations.length).toBeGreaterThan(0);
      }

      const min_ms = Math.min(...samples);
      const median_ms = sortedMedian(samples);
      const p95_ms = percentile(samples, 95);
      const max_ms = Math.max(...samples);

      const meta = gitMeta();
      const row = {
        metric: "getEvaluations",
        commit: meta.commit,
        commit_date: meta.commit_date,
        node: process.version,
        iterations,
        warmup,
        maxReportSize,
        view_frequency: frequency,
        reporter: reporterMode,
        min_ms,
        median_ms,
        p95_ms,
        max_ms,
        eval_count_last_run: lastEvalCount,
      };

      const line = `__PERF_RESULT__ ${JSON.stringify(row)}`;
      // eslint-disable-next-line no-console
      console.log(line);

      const outFile = process.env.FINKITTY_PERF_RESULTS_FILE;
      const skipFileAppend =
        process.env.FINKITTY_PERF_SKIP_FILE_APPEND === "1";
      if (outFile && !skipFileAppend) {
        fs.appendFileSync(outFile, `${JSON.stringify(row)}\n`, "utf8");
      }

      expect(samples.length).toBe(iterations);
      expect(median_ms).toBeGreaterThan(0);
    },
    600_000,
  );
});
