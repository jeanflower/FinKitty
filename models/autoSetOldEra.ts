import {
  custom,
  revalueAsset,
  revalueExp,
  revalueSetting,
} from "../localization/stringConstants";
import type {
  BondGeneratorDetails,
  ModelData,
  Transaction,
} from "../types/interfaces";
import { checkTriggerDate } from "../utils/stringUtils";
import { getVarVal } from "./modelQueries";
import { getTodaysDate, markForUndo, revertToUndoModel } from "./modelUtils";
import { generateAndCheckModel } from "./checks";

function parseModelDate(s: string, model: ModelData): Date | undefined {
  if (s === "") {
    return undefined;
  }
  const v = getVarVal(model.settings);
  return checkTriggerDate(s, model.triggers, v, undefined, model);
}

function anchorDateForModel(model: ModelData, override?: Date): Date {
  if (override !== undefined) {
    return new Date(override);
  }
  return new Date(getTodaysDate(model).d);
}

function yearsBeforeAnchor(anchor: Date, years: number): Date {
  const base = new Date(anchor);
  base.setFullYear(base.getFullYear() - years);
  return base;
}

function compareTime(a: Date | undefined): number {
  return a !== undefined ? a.getTime() : Number.NEGATIVE_INFINITY;
}

/** Sets ERA to -1; returns true only if ERA was not already -1. */
function applyHistoricalEra(item: { ERA?: number }): boolean {
  if (item.ERA === -1) {
    return false;
  }
  item.ERA = -1;
  return true;
}

/** Groups revaluation transactions by TO; returns max DATE (time ms) per group. */
function maxRevalueDateByTo(
  model: ModelData,
  type: string,
): Map<string, number> {
  const maxByTo = new Map<string, number>();
  for (const t of model.transactions) {
    if (t.TYPE !== type) {
      continue;
    }
    const d = parseModelDate(t.DATE, model);
    if (d === undefined) {
      continue;
    }
    const prev = maxByTo.get(t.TO);
    const tt = d.getTime();
    if (prev === undefined || tt > prev) {
      maxByTo.set(t.TO, tt);
    }
  }
  return maxByTo;
}

function transactionSortKey(t: Transaction, model: ModelData): number {
  return compareTime(parseModelDate(t.DATE, model));
}

export interface AutoSetOldEraResult {
  /** Non-empty if the model failed validation after changes (model reverted). */
  checkMessage: string;
  /** Human-readable counts for the user. */
  summary: string;
}

export type AutoSetOldEraOptions = {
  /** For tests: fixed "today" instead of {@link getTodaysDate}. */
  anchorDate?: Date;
};

/**
 * Sets ERA to -1 on "old" model items so they hide under standard era filters.
 * T = one year ago from the model's "today"; 2T = two years ago (same anchor).
 */
export function autoSetOldEra(
  model: ModelData,
  options?: AutoSetOldEraOptions,
): AutoSetOldEraResult {
  markForUndo(model);

  const anchor = anchorDateForModel(model, options?.anchorDate);
  const t1 = yearsBeforeAnchor(anchor, 1);
  const t2 = yearsBeforeAnchor(anchor, 2);
  const y2 = t2.getFullYear();

  let nExpenseOld = 0;
  let nRevExp = 0;
  let nRevAsset = 0;
  let nBondGen = 0;
  let nCustom = 0;
  let nRevSetting = 0;

  // (a),(b) expenses with end before 2T. Valid models require a recurrence string
  // (e.g. 1m); finished streams in either case are identified by END.
  for (const e of model.expenses) {
    const end = parseModelDate(e.END, model);
    if (compareTime(end) < t2.getTime() && applyHistoricalEra(e)) {
      nExpenseOld += 1;
    }
  }

  const maxExpRev = maxRevalueDateByTo(model, revalueExp);
  for (const t of model.transactions) {
    if (t.TYPE !== revalueExp) {
      continue;
    }
    const d = parseModelDate(t.DATE, model);
    const maxT = maxExpRev.get(t.TO);
    if (d === undefined || maxT === undefined) {
      continue;
    }
    if (d.getTime() >= maxT) {
      continue;
    }
    if (t.RECURRENCE === "") {
      if (d.getTime() < t2.getTime() && applyHistoricalEra(t)) {
        nRevExp += 1;
      }
    } else {
      const stop = parseModelDate(t.STOP_DATE, model);
      if (compareTime(stop) < t2.getTime() && applyHistoricalEra(t)) {
        nRevExp += 1;
      }
    }
  }

  const maxAssetRev = maxRevalueDateByTo(model, revalueAsset);
  for (const t of model.transactions) {
    if (t.TYPE !== revalueAsset) {
      continue;
    }
    const d = parseModelDate(t.DATE, model);
    const maxT = maxAssetRev.get(t.TO);
    if (d === undefined || maxT === undefined) {
      continue;
    }
    if (d.getTime() >= maxT) {
      continue;
    }
    if (t.RECURRENCE === "") {
      if (d.getTime() < t2.getTime() && applyHistoricalEra(t)) {
        nRevAsset += 1;
      }
    } else {
      const stop = parseModelDate(t.STOP_DATE, model);
      if (compareTime(stop) < t2.getTime() && applyHistoricalEra(t)) {
        nRevAsset += 1;
      }
    }
  }

  // (g) bond generators — target YEAR before 2T (calendar year vs T2's year)
  for (const g of model.generators) {
    if (g.TYPE !== "Bonds") {
      continue;
    }
    const y = parseInt((g.DETAILS as BondGeneratorDetails).YEAR, 10);
    if (Number.isNaN(y)) {
      continue;
    }
    if (y < y2 && applyHistoricalEra(g)) {
      nBondGen += 1;
    }
  }

  // (h),(i) custom transactions
  for (const t of model.transactions) {
    if (t.TYPE !== custom) {
      continue;
    }
    if (t.RECURRENCE === "") {
      const d = parseModelDate(t.DATE, model);
      if (compareTime(d) < t1.getTime() && applyHistoricalEra(t)) {
        nCustom += 1;
      }
    } else {
      const stop = parseModelDate(t.STOP_DATE, model);
      if (compareTime(stop) < t1.getTime() && applyHistoricalEra(t)) {
        nCustom += 1;
      }
    }
  }

  // (j) setting revaluations — non-recurring, not among the two most recent per setting
  const settingTxs = model.transactions.filter((x) => x.TYPE === revalueSetting);
  const byTo = new Map<string, Transaction[]>();
  for (const t of settingTxs) {
    const list = byTo.get(t.TO);
    if (list) {
      list.push(t);
    } else {
      byTo.set(t.TO, [t]);
    }
  }
  for (const [, list] of byTo) {
    list.sort((a, b) => {
      const tb = transactionSortKey(b, model);
      const ta = transactionSortKey(a, model);
      if (tb !== ta) {
        return tb - ta;
      }
      return a.NAME.localeCompare(b.NAME);
    });
    for (let i = 2; i < list.length; i += 1) {
      const t = list[i];
      if (t.RECURRENCE === "" && applyHistoricalEra(t)) {
        nRevSetting += 1;
      }
    }
  }

  const outcome = generateAndCheckModel(model);
  if (outcome.message !== "") {
    revertToUndoModel(model);
    return {
      checkMessage: outcome.message,
      summary: "",
    };
  }

  const summary =
    `Updated ERA for old items; ` +
    `changed: ` +
    (nExpenseOld > 0 ? `${nExpenseOld} expenses, ` : "") +
    (nRevExp > 0 ? `${nRevExp} expense revals, ` : "") + 
    (nRevAsset > 0 ? `${nRevAsset} asset revals, ` : "") + 
    (nBondGen > 0 ? `${nBondGen} bond gens, ` : "") +
    (nCustom > 0 ? `${nCustom} custom txs, ` : "") + 
    (nRevSetting > 0 ? `${nRevSetting} setting revals.` : "");

  return { checkMessage: "", summary };
}
