import { expect } from "@jest/globals";
import { appendFileSync } from "fs";
import {
  CASH_ASSET_NAME,
  pensionDB,
  pensionPrefix,
  taxFree,
  crystallizedPension,
  pensionTransfer,
  revalue,
  conditional,
  pensionSS,
  moveTaxFreePart,
  transferCrystallizedPension,
  custom,
  birthDate,
  viewType,
  viewFrequency,
  monthly,
  chartViewType,
  chartVals,
  viewDetail,
  fineDetail,
  assetChartFocus,
  debtChartFocus,
  allItems,
  expenseChartFocus,
  incomeChartFocus,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  valueFocusDate,
  cpi,
  cpiHint,
  birthDateHint,
  valueFocusDateHint,
  bondInvest,
  bondMature,
  taxablePart,
  taxFreePart,
} from "../../localization/stringConstants";
import { EvaluationHelper, getEvaluations, processGenerators } from "../../models/evaluations";
import {
  emptyModel,
  simpleExpense,
  simpleAsset,
} from "../../models/exampleModels";
import {
  attemptRenameLong,
  revertToUndoModel,
  setSetting,
} from "../../models/modelUtils";
import {
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetIncomeTag,
  makeNetGainTag,
  hasDependentDate,
  dateAsString,
} from "../../utils/stringUtils";
import {
  Evaluation,
  ChartDataPoint,
  DataForView,
  ModelData,
  AssetOrDebtVal,
  IncomeVal,
  ExpenseVal,
  SettingVal,
  Setting,
  Expense,
  Income,
  Asset,
  ReportValueChecker,
  ReportDatum,
} from "../../types/interfaces";
import { DateFormatType, log } from "../../utils/utils";
import { diffModels } from "../../models/diffModels";
import { defaultModelSettings } from "../../models/testModel";
import { viewSetting, simpleSetting } from "../../models/exampleSettings";
import { allViews } from "../../utils/allViews";
import { minimalModel } from "../../models/minimalModel";
import { makeModelFromJSONString } from "../../models/modelFromJSON";
import { ViewSettings } from "../../utils/viewUtils";
import {
  ExpressionProbeTransform,
  applyExpressionProbeTransform,
  assertZeroIdentitySymmetry,
  isExpressionSymmetryAutoCheckEnabled,
  parseExpressionProbeTransform,
} from "./expressionProbe";

let symmetryCheckDepth = 0;

function currentJestTestName(): string | undefined {
  return expect.getState().currentTestName ?? undefined;
}

function maybeAssertZeroIdentitySymmetry(
  unprocessedModel: ModelData,
  frequency: string,
): void {
  if (symmetryCheckDepth > 0) {
    return;
  }
  if (process.env.FINKITTY_EXPR_PROBE !== undefined) {
    return;
  }
  if (!isExpressionSymmetryAutoCheckEnabled()) {
    return;
  }
  symmetryCheckDepth += 1;
  try {
    assertZeroIdentitySymmetry(
      unprocessedModel,
      (model) => {
        return runTestEvaluationsCore(model, false, false, frequency).evaluations;
      },
      { context: currentJestTestName() },
    );
  } finally {
    symmetryCheckDepth -= 1;
  }
}

export function expectEvals(
  evals: Evaluation[],
  i: number,
  name: string,
  dateString: string,
  value: number,
  numDigits: number,
) {
  expect(evals[i].name).toBe(name);
  expect(evals[i].date.getTestDescription()).toBe(dateString);
  if (numDigits < 0) {
    expect(evals[i].value).toBe(value);
  } else {
    expect(evals[i].value).toBeCloseTo(value, numDigits);
  }
}

/**
 * Embeds a string in single-quoted test source (same style as `expectEvals(..., 'name', 'date', …)`).
 */
function tsStringLiteralSingleQuoted(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/** When set by `scripts/rebaseline-algo-tests.mjs --write`, codegen is appended here (testResults/.rebaseline-capture.txt). */
function writeRebaselineCapture(kind: "evals" | "chart", body: string) {
  const path = process.env.FINKITTY_REBASELINE_CAPTURE;
  if (!path) return;
  const begin = kind === "evals" ? "@@REBASELINE_BEGIN:evals@@" : "@@REBASELINE_BEGIN:chart@@";
  const end = kind === "evals" ? "@@REBASELINE_END:evals@@" : "@@REBASELINE_END:chart@@";
  appendFileSync(path, `${begin}\n${body}${body.endsWith("\n") ? "" : "\n"}${end}\n`, "utf8");
}

export type PrintTestCodeForEvalsOptions = {
  /** Indent for each emitted line (match the `it` body, e.g. `"    "` or `"  "`). */
  baseIndent?: string;
};

/**
 * Logs copy-pastable `expect(evals.length)` / `expectEvals` lines to **stdout** (like
 * `printTestCodeForChart`), for use with `npm run rebaseline:algo` while prints are uncommented.
 *
 * **Rebaseline layout (see `scripts/rebaseline-algo-tests.mjs`):** keep a commented marker
 * `// printTestCodeForEvals(evals);` (or `evalsAndValues.evaluations`) immediately above the
 * `expect(evals.length)` / `expectEvals` block. Chart expectations use
 * `// printTestCodeForChart(result);` above the `expect(result.*)` / `expectChartData` block.
 * `npm run rebaseline:algo -- --write --test=…` replaces those blocks from captured stdout.
 */
export function printTestCodeForEvals(
  evals: Evaluation[],
  options?: PrintTestCodeForEvalsOptions,
) {
  const b = options?.baseIndent ?? "    ";
  let result = "";
  result += b + `expect(evals.length).toBe(${evals.length});\n`;
  for (let i = 0; i < evals.length; i += 1) {
    result +=
      b +
      `expectEvals(evals, ${i}, ` +
      `${tsStringLiteralSingleQuoted(evals[i].name)}, ${tsStringLiteralSingleQuoted(
        evals[i].date.getTestDescription(),
      )}, `;
    if (evals[i].value.toFixed(0) === `${evals[i].value}`) {
      result += `${evals[i].value}, -1);\n`;
    } else {
      result += `${evals[i].value.toFixed(2)}, 2);\n`;
    }
  }
  writeRebaselineCapture("evals", result);
  /* eslint-disable no-console */ // intentional codegen dump for test maintenance
  console.log(result);
  /* eslint-enable no-console */
}

export function printTestCodeForReportData(reportData: ReportDatum[]) {
  log("printTestCodeForReportData:");
  let result = "";
  result += `expect(reportData.length).toBe(${reportData.length});\n`;
  for (let i = 0; i < reportData.length; i += 1) {
    // log(`reportData[${i}] is ${showObj(reportData[i])}`);
    result +=
      `expect(reportData[${i}].date).toEqual('` + reportData[i].date + `');\n`;
    result += `expect(reportData[${i}].name).toBe('${reportData[i].name}');\n`;

    const oldVal = reportData[i].oldVal;
    if (oldVal === undefined) {
      result += `expect(reportData[${i}].oldVal).toBe(undefined);\n`;
    } else {
      if (typeof reportData[i].oldVal === "number") {
        if (oldVal.toFixed(0) === `${reportData[i].oldVal}`) {
          result += `expect(reportData[${i}].oldVal).toBeCloseTo(${reportData[i].oldVal}, 2);\n`;
        } else {
          result += `expect(reportData[${i}].oldVal).toBeCloseTo(${oldVal.toFixed(2)}, 2);\n`;
        }
      }
    }
    const newVal = reportData[i].newVal;
    if (newVal === undefined) {
      result += `expect(reportData[${i}].newVal).toBe(undefined);\n`;
    } else {
      if (typeof reportData[i].newVal === "number") {
        if (newVal.toFixed(0) === `${reportData[i].newVal}`) {
          result += `expect(reportData[${i}].newVal).toBeCloseTo(${reportData[i].newVal}, 2);\n`;
        } else {
          result += `expect(reportData[${i}].newVal).toBeCloseTo(${newVal.toFixed(2)}, 2);\n`;
        }
      }
    }
  }
  log(result);
}  


export function expectChartData(
  pts: ChartDataPoint[],
  i: number,
  date: string,
  val: number,
  numDigits: number,
) {
  expect(pts[i].label).toBe(date);
  if (numDigits < 0) {
    expect(pts[i].y).toBeCloseTo(val, undefined);
  } else {
    expect(pts[i].y).toBeCloseTo(val, numDigits);
  }
}

/** One chart series: single-quoted strings; `b` for `expect`/`{`/`}`, `b + "  "` inside `{`. */
function formatChartTestCodeForSeries(
  accessPath: string,
  itemName: string,
  chartPts: ChartDataPoint[],
  b: string,
) {
  const inBlock = b + "  ";
  let s = "";
  s +=
    b +
    `expect(${accessPath}.item.NAME).toBe(${tsStringLiteralSingleQuoted(
      itemName,
    )});\n`;
  s += b + "{\n";
  s += inBlock + `const chartPts = ${accessPath}.chartDataPoints;\n`;
  s += inBlock + `expect(chartPts.length).toBe(${chartPts.length});\n`;
  for (let j = 0; j < chartPts.length; j += 1) {
    s +=
      inBlock +
      `expectChartData(chartPts, ${j}, ${tsStringLiteralSingleQuoted(
        chartPts[j].label,
      )}, `;
    if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
      s += `${chartPts[j].y}, -1);\n`;
    } else {
      s += `${chartPts[j].y.toFixed(2)}, 2);\n`;
    }
  }
  s += b + "}\n\n";
  return s;
}

/** Which `result.*Data` chart blocks `printTestCodeForChart` may emit (canonical order). */
export type ChartSection = 'expenses' | 'incomes' | 'assets' | 'debt' | 'tax';

export type PrintTestCodeForChartOptions = {
  /**
   * Indent before each top-level `expect` / `{` in the pasted block.
   * Use `"    "` (4 spaces) for tests that use a 4-space `it` body, etc.
   */
  baseIndent?: string;
  /**
   * Emit only these chart sections (in expenses → incomes → assets → debt → tax order).
   * Omit or leave empty for the full chart dump. Example: `['assets', 'tax']` when only
   * those series changed.
   */
  sections?: readonly ChartSection[];
};

const CHART_SECTION_ORDER: readonly ChartSection[] = [
  'expenses',
  'incomes',
  'assets',
  'debt',
  'tax',
];

function resolveChartSections(
  options?: PrintTestCodeForChartOptions,
): readonly ChartSection[] {
  const raw = options?.sections;
  if (!raw?.length) {
    return CHART_SECTION_ORDER;
  }
  const allowed = new Set<ChartSection>(CHART_SECTION_ORDER);
  const picked: ChartSection[] = [];
  for (const s of CHART_SECTION_ORDER) {
    if (raw.includes(s) && allowed.has(s)) {
      picked.push(s);
    }
  }
  return picked.length > 0 ? picked : CHART_SECTION_ORDER;
}

/**
 * Logs copy-pastable `expect` / `expectChartData` lines for a full
 * `DataForView` (expenses, incomes, assets, debt, tax).
 *
 * **Rebaseline layout:** keep `// printTestCodeForChart(result);` (with any options) directly
 * above the chart `expect` block; pair with `// printTestCodeForEvals(…)` for evaluations.
 * Use `npm run rebaseline:algo -- --write --test=…` to refresh both blocks automatically.
 *
 * **Manual workflow (minimize unrelated git diffs):**
 * 1. Uncomment `printTestCodeForChart(result)` (or
 *    `printTestCodeForChart(result, { baseIndent: "  " })` if this `it`
 *    body indents with 2 spaces, etc.).
 * 2. Run the test (e.g. `npm run rebaseline:algo -- --test='…/file.ts::it name'`); copy the
 *    `console` output. Content uses
 *    **single-quoted** strings (same as the original `expectChartData`
 *    style), **one blank line** between series, and `baseIndent` + 2
 *    spaces inside each `{` … `}`.
 * 3. Replace the old expectation block. **Match** the `baseIndent` to
 *    sibling lines in the `it` (e.g. if your `expect` lines start with
 *    4 spaces, the pasted block should too—re-indent if the terminal
 *    or Jest’s UI added an extra level).
 * 4. Re-comment the call and re-run the test. To limit noise, pass
 *    `{ sections: ['tax'] }` (or `{ sections: ['assets', 'tax'] }`, etc.) instead of dumping
 *    every series.
 */
export function printTestCodeForChart(
  result: DataForView,
  options?: PrintTestCodeForChartOptions,
) {
  const b = options?.baseIndent ?? "    ";
  const active = resolveChartSections(options);
  let toPrint = "";
  for (const sec of active) {
    if (sec === "expenses") {
      toPrint += b + `expect(result.expensesData.length).toBe(${result.expensesData.length});\n`;
      for (let i = 0; i < result.expensesData.length; i += 1) {
        toPrint += formatChartTestCodeForSeries(
          `result.expensesData[${i}]`,
          result.expensesData[i].item.NAME,
          result.expensesData[i].chartDataPoints,
          b,
        );
      }
    } else if (sec === "incomes") {
      toPrint += b + `expect(result.incomesData.length).toBe(${result.incomesData.length});\n`;
      for (let i = 0; i < result.incomesData.length; i += 1) {
        toPrint += formatChartTestCodeForSeries(
          `result.incomesData[${i}]`,
          result.incomesData[i].item.NAME,
          result.incomesData[i].chartDataPoints,
          b,
        );
      }
    } else if (sec === "assets") {
      toPrint += b + `expect(result.assetData.length).toBe(${result.assetData.length});\n`;
      for (let i = 0; i < result.assetData.length; i += 1) {
        toPrint += formatChartTestCodeForSeries(
          `result.assetData[${i}]`,
          result.assetData[i].item.NAME,
          result.assetData[i].chartDataPoints,
          b,
        );
      }
    } else if (sec === "debt") {
      toPrint += b + `expect(result.debtData.length).toBe(${result.debtData.length});\n`;
      for (let i = 0; i < result.debtData.length; i += 1) {
        toPrint += formatChartTestCodeForSeries(
          `result.debtData[${i}]`,
          result.debtData[i].item.NAME,
          result.debtData[i].chartDataPoints,
          b,
        );
      }
    } else if (sec === "tax") {
      toPrint += b + `expect(result.taxData.length).toBe(${result.taxData.length});\n`;
      for (let i = 0; i < result.taxData.length; i += 1) {
        toPrint += formatChartTestCodeForSeries(
          `result.taxData[${i}]`,
          result.taxData[i].item.NAME,
          result.taxData[i].chartDataPoints,
          b,
        );
      }
    }
  }
  writeRebaselineCapture("chart", toPrint);
  /* eslint-disable no-console */ // intentional codegen dump for test maintenance
  console.log(toPrint);
  /* eslint-enable no-console */
}

function runTestEvaluationsCore(
  unprocessedModel: ModelData,
  renamingChecks = true,
  diffChecks = false,
  frequency = monthly,
  exprProbe?: ExpressionProbeTransform,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
} {
  const model = makeModelFromJSONString(JSON.stringify(unprocessedModel));
  model.name = 'ready to be processed';

  if (exprProbe !== undefined) {
    applyExpressionProbeTransform(model, exprProbe);
  }

  processGenerators(model);
  model.name = 'has been processed';

  const emptyResult = {
    evaluations: [],
    todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
    todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
    todaysIncomeValues: new Map<Income, IncomeVal>(),
    todaysExpenseValues: new Map<Expense, ExpenseVal>(),
    todaysSettingValues: new Map<Setting, SettingVal>(),
  };

  if (renamingChecks) {
    // only rename if new model makes sense
    const doChecks = true;

    let oldModelCopy: ModelData | undefined = undefined;
    if (diffChecks) {
      // log(`model = ${JSON.stringify(model)}`);
      oldModelCopy = JSON.parse(JSON.stringify(model));
      // log(`oldModelCopy = ${JSON.stringify(oldModelCopy)}`);
      const diffResult = diffModels(
        model,
        oldModelCopy,
        false,
        "model",
        "oldModelCopy",
      );
      /* istanbul ignore if */
      if (diffResult.length !== 0) {
        log(`Error: expect copy to match original, got ${diffResult}`);
        return emptyResult;
      } else {
        // log(`Good: copy matches original`);
      }
    }

    // hijack to try some renaming
    model.triggers.forEach((obj) => {
      // dont rename a trigger if there's a dependence
      if (hasDependentDate(obj, model)) {
        // dont attempt rename of a trigger if there's
        // dependent date
        // e.g. "start+1y"
        // log(`don't rename trigger ${obj.NAME}`);
        return;
      }
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, doChecks, oldName, "abcd");
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, "abcd", oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.assets.forEach((obj) => {
      const oldName = obj.NAME;
      if (oldName === CASH_ASSET_NAME) {
        return;
      }
      let newName = "abcd";
      if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pensionPrefix)) {
        newName = pensionPrefix + newName;
      } else if (oldName.startsWith(taxFree)) {
        newName = taxFree + newName;
      } else if (oldName.endsWith(taxFreePart)) {
        newName = newName + taxFreePart;
      } else if (oldName.startsWith(crystallizedPension)) {
        newName = crystallizedPension + newName;
      }

      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.incomes.forEach((obj) => {
      const oldName = obj.NAME;
      let newName = "abcd";
      if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pensionTransfer)) {
        newName = pensionTransfer + newName;
      }
      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.expenses.forEach((obj) => {
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, doChecks, oldName, "abcd");
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, "abcd", oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.transactions.forEach((obj) => {
      const oldName = obj.NAME;
      let newName = "abcd";
      if (oldName.startsWith(revalue)) {
        newName = revalue + newName;
      } else if (oldName.startsWith(conditional)) {
        newName = conditional + newName;
      } else if (oldName.startsWith(pensionSS)) {
        newName = pensionSS + newName;
      } else if (oldName.startsWith(pensionTransfer)) {
        newName = pensionTransfer + newName;
      } else if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pensionPrefix)) {
        newName = pensionPrefix + newName;
      } else if (oldName.startsWith(moveTaxFreePart)) {
        newName = moveTaxFreePart + newName;
      } else if (oldName.startsWith(crystallizedPension)) {
        newName = crystallizedPension + newName;
      } else if (oldName.startsWith(transferCrystallizedPension)) {
        newName = transferCrystallizedPension + newName;
      } else if (oldName.endsWith(bondInvest)) {
        newName = newName + bondInvest;
      } else if (oldName.endsWith(bondMature)) {
        newName = newName + bondMature;
      } else if (oldName.endsWith(taxablePart)) {
        newName = newName + taxablePart;
      } else if (oldName.endsWith(taxFreePart)) {
        newName = newName + taxFreePart;
      } else if (oldName.endsWith("5y")) {
        newName = newName + "5y";
      } else if (oldName.endsWith("4y")) {
        newName = newName + "4y";
      } else if (oldName.endsWith("3y")) {
        newName = newName + "3y";
      } else if (oldName.endsWith("2y")) {
        newName = newName + "2y";
      } else if (oldName.endsWith("1y")) {
        newName = newName + "1y";
      }
      // log(`transaction oldName ${obj.NAME} -> ${newName}`);

      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.settings.forEach((obj) => {
      if (
        minimalModel.settings.find((s) => {
          return s.NAME === obj.NAME;
        }) !== undefined
      ) {
        return;
      }
      const oldName = obj.NAME;
      const newName = "abcd";
      let message = attemptRenameLong(model, doChecks, oldName, newName);
      const renamedToNew = true;
      if (message.length > 0) {
        throw new Error(`rename setting failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          "model",
          "oldModelCopy",
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      if (renamedToNew) {
        message = attemptRenameLong(model, doChecks, newName, oldName);
        if (message.length > 0) {
          throw new Error(`rename failed with message '${message}'`);
        }
        revertToUndoModel(model);
        revertToUndoModel(model);
      }
    });
  }

  let evalnsAndVals;
  if (!renamingChecks) {
    evalnsAndVals = getEvaluations(
      model,
      undefined, // no key for a values report
    );
  } else {
    const copyModel = makeModelFromJSONString(JSON.stringify(model));
    const reporter = () =>
      //name: string, // name of thing which has a value
      //val: number | string, // value of the thing
      //date: Date,
      //source: string,
      {
        return true;
      };
    evalnsAndVals = getEvaluations(copyModel, {
      frequency: frequency,
      reporter: reporter,
      maxReportSize: 100,
    });
  }
  return evalnsAndVals;
}

export function getTestEvaluations(
  unprocessedModel: ModelData,
  renamingChecks = true,
  diffChecks = false,
  frequency = monthly,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
} {
  maybeAssertZeroIdentitySymmetry(unprocessedModel, frequency);
  const exprProbe = parseExpressionProbeTransform(
    process.env.FINKITTY_EXPR_PROBE,
  );
  return runTestEvaluationsCore(
    unprocessedModel,
    renamingChecks,
    diffChecks,
    frequency,
    exprProbe,
  );
}

export function getTestEvaluationsForReport(
  unprocessedModel: ModelData,
  reporter: ReportValueChecker,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportData: ReportDatum[];
} {
  maybeAssertZeroIdentitySymmetry(unprocessedModel, monthly);
  const exprProbe = parseExpressionProbeTransform(
    process.env.FINKITTY_EXPR_PROBE,
  );
  const model = makeModelFromJSONString(JSON.stringify(unprocessedModel));
  model.name = 'ready to be processed';

  if (exprProbe !== undefined) {
    applyExpressionProbeTransform(model, exprProbe);
  }

  processGenerators(model);
  model.name = 'has been processed';

  const helper = new EvaluationHelper(
    reporter,
    100,
    monthly,
  );
  let evaluationsAndVals = getEvaluations(model, helper);

  return evaluationsAndVals;
}


export function getICLabel(person: string) {
  return makeIncomeTaxTag(person);
}
export function getNILabel(person: string) {
  return makeNationalInsuranceTag(person);
}
export function getCGTLabel(person: string) {
  return makeCGTTag(person);
}
export function getnetincLabel(person: string) {
  return makeNetIncomeTag(person);
}
export function getnetgainLabel(person: string) {
  return makeNetGainTag(person);
}

export function getModelFutureExpense2() {
  const roi = {
    start: "Dec 1, 2016 00:00:00",
    end: "March 1, 2017 00:00:00",
  };
  const model: ModelData = {
    ...emptyModel,
    expenses: [
      {
        ...simpleExpense,
        START: "January 1 2018",
        END: "July 2 2018",
        NAME: "Phon",
        VALUE: "99",
        VALUE_SET: "January 1 2018",
      },
    ],
    settings: [...defaultModelSettings(roi)],
  };
  return { roi, model };
}

export function getModelCrystallizedPension() {
  const roi = {
    start: "1 April 2023",
    end: "1 April 2026",
  };
  const model: ModelData = {
    ...minimalModel,
    incomes: [],
    assets: [
      {
        ...simpleAsset,
        NAME: "AvailablePensionTaxFree",
        START: "Apr 06 2019",
        CATEGORY: "B",
      },
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: "Apr 06 2019",
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + "Joe.PNN",
        START: "Apr 06 2019",
        CATEGORY: "B",
      },
      {
        ...simpleAsset,
        NAME: "EmploymentPension",
        START: "Apr 06 2019",
        VALUE: "100000",
        CATEGORY: "B",
      },
    ],
    settings: [...defaultModelSettings(roi)],
    expenses: [],
    transactions: [
      {
        NAME: "MoveQuarterPension",
        ERA: undefined,
        FROM: "EmploymentPension",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.25",
        TO: "AvailablePensionTaxFree",
        TO_ABSOLUTE: false,
        TO_VALUE: "0.98",
        DATE: "Oct 04 2024",
        STOP_DATE: "1 January 2018",
        RECURRENCE: "",
        CATEGORY: "D",
        TYPE: custom,
      },
      {
        NAME: "MoveRemainingPension",
        ERA: undefined,
        FROM: "EmploymentPension",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1",
        TO: crystallizedPension + "Joe.PNN",
        TO_ABSOLUTE: false,
        TO_VALUE: "0.98",
        DATE: "Oct 05 2024",
        STOP_DATE: "1 January 2018",
        RECURRENCE: "",
        CATEGORY: "",
        TYPE: custom,
      },
    ],
  };

  // log(`getModelCrystallizedPension created ${showObj(model)}`);

  setSetting(model.settings, birthDate, "", viewType);
  return {
    model,
    roi,
  };
}

export function getModelTwoCrystallizedPensions() {
  const roi = {
    start: "1 March 2019",
    end: "10 May 2021",
  };
  const model: ModelData = {
    ...minimalModel,
    incomes: [],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: "1 March 2019",
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + "Joe.A",
        START: "1 March 2019",
        CATEGORY: "B",
        VALUE: "13500",
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + "Joe.B",
        START: "1 March 2019",
        CATEGORY: "B",
        VALUE: "13500",
      },
    ],
    settings: [...defaultModelSettings(roi)],
    expenses: [],
  };

  setSetting(model.settings, birthDate, "", viewType);
  return {
    model,
    roi,
  };
}

export function getMinimalModelCopySettings(): ViewSettings {
  const result = new ViewSettings(
    allViews
      .map((v) => {
        return {
          NAME: `${viewFrequency}${v.lc}`,
          VALUE: monthly,
        };
      })
      .concat(
        allViews
        .map((v) => {
          return {
            NAME: `${viewDetail}${v.lc}`,
            VALUE: fineDetail,
          };
        })
      ,[
        {
          NAME: chartViewType,
          VALUE: chartVals,
        },
        {
          NAME: assetChartFocus,
          VALUE: CASH_ASSET_NAME,
        },
        {
          NAME: debtChartFocus,
          VALUE: allItems,
        },
        {
          NAME: expenseChartFocus,
          VALUE: allItems,
        },
        {
          NAME: incomeChartFocus,
          VALUE: allItems,
        },
        {
          NAME: taxChartFocusPerson,
          VALUE: allItems,
        },
        {
          NAME: taxChartFocusType,
          VALUE: allItems,
        },
        {
          NAME: taxChartShowNet,
          VALUE: "Y",
        },
        {
          NAME: valueFocusDate,
          VALUE: "",
        },
      ]),
  );
  return result;
}

export function defaultTestViewSettings(): ViewSettings {
  const result = new ViewSettings(
    allViews
      .map((v) => {
        return {
          ...viewSetting,
          NAME: `${viewFrequency}${v.lc}`,
          VALUE: monthly,
        };
      })
      .concat(
        allViews
      .map((v) => {
        return {
            ...viewSetting,
            NAME: `${viewDetail}${v.lc}`,
            VALUE: fineDetail,
          };
        })
      ,[
        { ...viewSetting, NAME: chartViewType, VALUE: chartVals },
        {
          ...viewSetting,
          NAME: assetChartFocus,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: debtChartFocus,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: expenseChartFocus,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: incomeChartFocus,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: taxChartFocusPerson,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: taxChartFocusType,
          VALUE: allItems,
        },
        {
          ...viewSetting,
          NAME: taxChartShowNet,
          VALUE: "Y",
        },
        {
          ...simpleSetting,
          NAME: cpi,
          VALUE: "0.0",
          HINT: cpiHint,
        },
        {
          ...viewSetting,
          NAME: birthDate,
          VALUE: "",
          HINT: birthDateHint,
        },
        {
          ...viewSetting,
          NAME: valueFocusDate,
          VALUE: "",
          HINT: valueFocusDateHint,
        },
      ]),
  );
  return result;
}
