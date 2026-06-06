/**
 * Expression-symmetry checks for the algo test harness.
 *
 * Full reference (transforms, contexts, guards, roadmap):
 *   tests/algoTests/EXPRESSION_SYMMETRY_PROBE.md
 *
 * Zero- and One-identity transforms can run on every getTestEvaluations call when
 * enabled (see EXPRESSION_SYMMETRY_AUTO_CHECK_PARKED / FINKITTY_EXPR_SYMMETRY_ENABLE).
 * FINKITTY_EXPR_SYMMETRY_DISABLE=1 to force off; FINKITTY_EXPR_PROBE=<transform> for stress mode.
 */
import {
  adjustableType,
  cgt,
  cpi,
  revalue,
  revalueAsset,
  revalueDebt,
  revalueExp,
  revalueInc,
  revalueSetting,
  viewType,
} from "../../localization/stringConstants";
import { isNumberString } from "../../models/modelQueries";
import {
  Asset,
  Evaluation,
  ModelData,
  Setting,
  Transaction,
} from "../../types/interfaces";
import {
  fieldReferencesSettingName,
  getNumberAndWordParts,
  numericExpressionReferencesName,
  parseNumericExpression,
  valueIsPlainSettingAlias,
} from "../../utils/stringUtils";

export const PROBE_SETTING_ZERO = "Zero";
export const PROBE_SETTING_ONE = "One";

/** Set false (or FINKITTY_EXPR_SYMMETRY_ENABLE=1) to run automatic symmetry on every getTestEvaluations. */
export const EXPRESSION_SYMMETRY_AUTO_CHECK_PARKED = true;

export function isExpressionSymmetryAutoCheckEnabled(): boolean {
  if (process.env.FINKITTY_EXPR_SYMMETRY_DISABLE === "1") {
    return false;
  }
  if (process.env.FINKITTY_EXPR_SYMMETRY_ENABLE === "1") {
    return true;
  }
  return !EXPRESSION_SYMMETRY_AUTO_CHECK_PARKED;
}

/** Active transform; set via FINKITTY_EXPR_PROBE. */
export type ExpressionProbeTransform =
  | "suffixZero"
  | "prefixZero"
  | "sandwichZero"
  | "suffixZeroMinus"
  | "sandwichZeroPlusMinus"
  | "suffixZeroPlusMinus"
  | "suffixDoubleZero"
  | "prefixDoubleZero"
  | "interleaveZero"
  | "suffixOne"
  | "prefixZeroSuffixOne"
  | "interleaveOneOnNumbers";

const VALID_TRANSFORMS: ExpressionProbeTransform[] = [
  "suffixZero",
  "prefixZero",
  "sandwichZero",
  "suffixZeroMinus",
  "sandwichZeroPlusMinus",
  "suffixZeroPlusMinus",
  "suffixDoubleZero",
  "prefixDoubleZero",
  "interleaveZero",
  "suffixOne",
  "prefixZeroSuffixOne",
  "interleaveOneOnNumbers",
];

export function parseExpressionProbeTransform(
  raw: string | undefined,
): ExpressionProbeTransform | undefined {
  if (raw === undefined || raw.length === 0) {
    return undefined;
  }
  if (VALID_TRANSFORMS.includes(raw as ExpressionProbeTransform)) {
    return raw as ExpressionProbeTransform;
  }
  throw new Error(
    `Unknown FINKITTY_EXPR_PROBE='${raw}'. ` +
      `Use one of: ${VALID_TRANSFORMS.join(", ")}`,
  );
}

export function isZeroIdentityProbeTransform(
  transform: ExpressionProbeTransform,
): boolean {
  return ZERO_IDENTITY_TRANSFORMS.includes(transform);
}

export function isOneIdentityProbeTransform(
  transform: ExpressionProbeTransform,
): boolean {
  return ONE_IDENTITY_TRANSFORMS.includes(transform);
}

function isPlainNumericProbeValue(value: string): boolean {
  return isNumberString(value);
}

/** Insert +Zero before each (+|-) between terms: A+700+A → A+Zero+700+Zero+A */
export function interleaveZeroInExpression(value: string): string | undefined {
  const expr = parseNumericExpression(value);
  if (expr === undefined) {
    return undefined;
  }
  let rebuilt = expr.terms[0];
  for (let i = 0; i < expr.ops.length; i += 1) {
    rebuilt += `+${PROBE_SETTING_ZERO}${expr.ops[i]}${expr.terms[i + 1]}`;
  }
  return rebuilt;
}

/** Suffix One on plain numeric terms only: A+700+A → A+700One+A (not 2x → 2xOne). */
export function interleaveOneOnNumericTerms(value: string): string | undefined {
  const expr = parseNumericExpression(value);
  if (expr === undefined) {
    return undefined;
  }
  const mapTerm = (term: string): string => {
    if (isNumberString(term)) {
      return `${term}${PROBE_SETTING_ONE}`;
    }
    return term;
  };
  let rebuilt = mapTerm(expr.terms[0]);
  for (let i = 0; i < expr.ops.length; i += 1) {
    rebuilt += `${expr.ops[i]}${mapTerm(expr.terms[i + 1])}`;
  }
  return rebuilt;
}

function probeSetting(name: string, value: string): Setting {
  return {
    NAME: name,
    ERA: undefined,
    VALUE: value,
    HINT: "expressionProbe",
    TYPE: adjustableType,
  };
}

/** Add Zero=0 and One=1 unless the model already defines those names. */
export function addProbeZeroAndOneSettings(model: ModelData): void {
  const names = new Set(
    model.settings.map((s) => {
      return s.NAME;
    }),
  );
  if (!names.has(PROBE_SETTING_ZERO)) {
    model.settings.push(probeSetting(PROBE_SETTING_ZERO, "0"));
  }
  if (!names.has(PROBE_SETTING_ONE)) {
    model.settings.push(probeSetting(PROBE_SETTING_ONE, "1"));
  }
}

export function wrapProbeValue(
  value: string,
  transform: ExpressionProbeTransform,
): string {
  if (value.length === 0) {
    return value;
  }
  switch (transform) {
    case "suffixZero":
      return `${value}+${PROBE_SETTING_ZERO}`;
    case "prefixZero":
      return `${PROBE_SETTING_ZERO}+${value}`;
    case "sandwichZero":
      return `${PROBE_SETTING_ZERO}+${value}+${PROBE_SETTING_ZERO}`;
    case "suffixZeroMinus":
      return `${value}-${PROBE_SETTING_ZERO}`;
    case "sandwichZeroPlusMinus":
      return `${PROBE_SETTING_ZERO}+${value}-${PROBE_SETTING_ZERO}`;
    case "suffixZeroPlusMinus":
      return `${value}+${PROBE_SETTING_ZERO}-${PROBE_SETTING_ZERO}`;
    case "suffixDoubleZero":
      return `${value}+${PROBE_SETTING_ZERO}+${PROBE_SETTING_ZERO}`;
    case "prefixDoubleZero":
      return `${PROBE_SETTING_ZERO}+${PROBE_SETTING_ZERO}+${value}`;
    case "interleaveZero": {
      const interleaved = interleaveZeroInExpression(value);
      return interleaved ?? value;
    }
    case "suffixOne":
      return `${value}${PROBE_SETTING_ONE}`;
    case "prefixZeroSuffixOne":
      return `${PROBE_SETTING_ZERO}+${value}${PROBE_SETTING_ONE}`;
    case "interleaveOneOnNumbers": {
      const interleaved = interleaveOneOnNumericTerms(value);
      return interleaved ?? value;
    }
    default:
      return value;
  }
}

/** G-00: empty fields are not probed. */
export function shouldTransformValue(
  value: string,
  transform: ExpressionProbeTransform,
): boolean {
  if (value.length === 0) {
    return false;
  }
  switch (transform) {
    // G-01: One identity shapes apply to plain numerics only.
    case "suffixOne":
    case "prefixZeroSuffixOne":
      return isPlainNumericProbeValue(value);
    // G-02: interleaveZero requires a +/− expression chain.
    case "interleaveZero":
      return parseNumericExpression(value) !== undefined;
    // G-03: interleaveOne only when at least one numeric term would change.
    case "interleaveOneOnNumbers": {
      if (parseNumericExpression(value) === undefined) {
        return false;
      }
      const rebuilt = interleaveOneOnNumericTerms(value);
      return rebuilt !== undefined && rebuilt !== value;
    }
    default:
      return true;
  }
}

function assetGrowthReferencesSetting(asset: Asset): boolean {
  return (
    asset.GROWTH.length > 0 &&
    !isNumberString(asset.GROWTH) &&
    Number.isNaN(parseFloat(asset.GROWTH))
  );
}

/**
 * Asset VALUE probing.
 * Zero: expressions, scaled terms (2x), plain numerics with zero growth — not bare aliases (mini).
 * One: plain numerics with zero growth (68One), or interleaveOne on +/− chains — not 2xOne.
 */
export function shouldTransformAssetValue(
  asset: Asset,
  transform: ExpressionProbeTransform,
): boolean {
  if (!shouldTransformValue(asset.VALUE, transform)) {
    return false;
  }
  if (isNumberString(asset.VALUE)) {
    // G-11: negative plain numerics are not probed.
    if (parseFloat(asset.VALUE) < 0) {
      return false;
    }
    const growth = parseFloat(asset.GROWTH);
    // G-12: plain numerics with nonzero numeric growth are not probed.
    if (!Number.isNaN(growth) && growth !== 0) {
      return false;
    }
    // G-13: growth as a setting name (e.g. shareGrowth) is not probed.
    if (assetGrowthReferencesSetting(asset)) {
      return false;
    }
    // G-14: plain numeric + zero growth — One shapes only (literal kept for growth path).
    return ONE_IDENTITY_TRANSFORMS.includes(transform);
  }
  if (ONE_IDENTITY_TRANSFORMS.includes(transform)) {
    return transform === "interleaveOneOnNumbers";
  }
  if (parseNumericExpression(asset.VALUE) !== undefined) {
    return true;
  }
  // G-10: bare setting aliases (mini, ShareVal) and non-scaled words without numeric part.
  const parts = getNumberAndWordParts(asset.VALUE);
  return parts.numberPart !== undefined && parts.wordPart.length > 0;
}

/** Probe purchase prices on CGT assets (skip zero/empty/aliases; not scaled One). */
export function shouldTransformPurchasePrice(
  asset: Asset,
  transform: ExpressionProbeTransform,
): boolean {
  // G-20: purchase price probing is CGT assets only.
  if (!asset.LIABILITY.includes(cgt)) {
    return false;
  }
  // G-21: zero/empty purchase prices are not probed.
  if (
    asset.PURCHASE_PRICE.length === 0 ||
    asset.PURCHASE_PRICE === "0" ||
    asset.PURCHASE_PRICE === "0.0"
  ) {
    return false;
  }
  if (!shouldTransformValue(asset.PURCHASE_PRICE, transform)) {
    return false;
  }
  if (isNumberString(asset.PURCHASE_PRICE)) {
    return parseFloat(asset.PURCHASE_PRICE) >= 0;
  }
  // G-23: scaled purchase prices — One via interleaveOne only, not suffixOne on whole field.
  if (ONE_IDENTITY_TRANSFORMS.includes(transform)) {
    return transform === "interleaveOneOnNumbers";
  }
  if (parseNumericExpression(asset.PURCHASE_PRICE) !== undefined) {
    return true;
  }
  // G-22: bare setting aliases (SharePurchasePrice) are not probed.
  const parts = getNumberAndWordParts(asset.PURCHASE_PRICE);
  return parts.numberPart !== undefined && parts.wordPart.length > 0;
}

/**
 * G-42: FROM_VALUE — Zero family not probed (engine/validation paths differ from TO).
 * One: suffixOne only, plus G-40 and G-41.
 */
export function shouldTransformFromValue(
  transaction: Transaction,
  transform: ExpressionProbeTransform,
  model: ModelData,
): boolean {
  if (transform !== "suffixOne") {
    return false;
  }
  if (!isPlainNumericProbeValue(transaction.FROM_VALUE)) {
    return false;
  }
  if (
    transactionValueConflictsWithQuantisedSettingAliasAsset(
      transaction,
      "FROM_VALUE",
      "FROM",
      model,
    )
  ) {
    return false;
  }
  return true;
}

const REVALUE_TRANSACTION_TYPES = new Set([
  revalueAsset,
  revalueSetting,
  revalueExp,
  revalueInc,
  revalueDebt,
]);

function isRevalueTransaction(transaction: Transaction): boolean {
  if (REVALUE_TRANSACTION_TYPES.has(transaction.TYPE)) {
    return true;
  }
  return transaction.NAME.startsWith(revalue);
}

/**
 * G-40: quantised setting-alias quantity operand — plain TO/FROM_VALUE is a unit
 * count on assets with QUANTITY + bare alias VALUE; revalue txs stay eligible.
 */
function transactionValueConflictsWithQuantisedSettingAliasAsset(
  transaction: Transaction,
  valueField: "TO_VALUE" | "FROM_VALUE",
  assetField: "TO" | "FROM",
  model: ModelData,
): boolean {
  if (isRevalueTransaction(transaction)) {
    return false;
  }
  const assetName = transaction[assetField];
  const value = transaction[valueField];
  const linkedAsset = model.assets.find((a) => {
    return a.NAME === assetName;
  });
  if (
    linkedAsset === undefined ||
    linkedAsset.QUANTITY === "" ||
    !valueIsPlainSettingAlias(linkedAsset.VALUE)
  ) {
    return false;
  }
  return (
    isPlainNumericProbeValue(value) ||
    parseNumericExpression(value) !== undefined
  );
}

/**
 * G-41: prefix-Zero family on proportional plain-numeric TO/FROM_VALUE — false
 * scheduling via generateMoments `.includes(setting.NAME)` when Zero is injected.
 */
const PROPORTIONAL_PREFIX_ZERO_SKIP: ExpressionProbeTransform[] = [
  "prefixZero",
  "sandwichZero",
  "sandwichZeroPlusMinus",
  "prefixDoubleZero",
];

/** G-42 (TO): same guards as shouldTransformFromValue. */
export function shouldTransformToValue(
  transaction: Transaction,
  transform: ExpressionProbeTransform,
  model: ModelData,
): boolean {
  if (!shouldTransformValue(transaction.TO_VALUE, transform)) {
    return false;
  }
  if (
    transactionValueConflictsWithQuantisedSettingAliasAsset(
      transaction,
      "TO_VALUE",
      "TO",
      model,
    )
  ) {
    return false;
  }
  if (
    !transaction.TO_ABSOLUTE &&
    isPlainNumericProbeValue(transaction.TO_VALUE) &&
    PROPORTIONAL_PREFIX_ZERO_SKIP.includes(transform)
  ) {
    return false;
  }
  return true;
}

const OPTIMIZER_CONTROL_SETTINGS = new Set([
  "variable",
  "variableLow",
  "variableHigh",
  "variableCount",
]);

function isOptimizerControlSetting(name: string, model: ModelData): boolean {
  if (!OPTIMIZER_CONTROL_SETTINGS.has(name)) {
    return false;
  }
  const present = new Set(
    model.settings
      .map((s) => {
        return s.NAME;
      })
      .filter((n) => {
        return OPTIMIZER_CONTROL_SETTINGS.has(n);
      }),
  );
  return present.size === OPTIMIZER_CONTROL_SETTINGS.size;
}

function isReferencedInModelNumericFields(
  name: string,
  model: ModelData,
): boolean {
  if (isOptimizerControlSetting(name, model)) {
    return true;
  }
  if (
    model.settings.some((s) => {
      return (
        s.NAME !== name &&
        fieldReferencesSettingName(s.VALUE, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.assets.some((a) => {
      return (
        fieldReferencesSettingName(a.VALUE, name, model) ||
        fieldReferencesSettingName(a.PURCHASE_PRICE, name, model) ||
        fieldReferencesSettingName(a.GROWTH, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.incomes.some((i) => {
      return (
        fieldReferencesSettingName(i.VALUE, name, model) ||
        fieldReferencesSettingName(i.START, name, model) ||
        fieldReferencesSettingName(i.END, name, model) ||
        fieldReferencesSettingName(i.VALUE_SET, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.expenses.some((e) => {
      return (
        fieldReferencesSettingName(e.VALUE, name, model) ||
        fieldReferencesSettingName(e.START, name, model) ||
        fieldReferencesSettingName(e.END, name, model) ||
        fieldReferencesSettingName(e.VALUE_SET, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.transactions.some((t) => {
      return (
        fieldReferencesSettingName(t.TO_VALUE, name, model) ||
        fieldReferencesSettingName(t.FROM_VALUE, name, model) ||
        fieldReferencesSettingName(t.TO, name, model) ||
        fieldReferencesSettingName(t.FROM, name, model) ||
        fieldReferencesSettingName(t.DATE, name, model) ||
        fieldReferencesSettingName(t.STOP_DATE, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.triggers.some((tr) => {
      return (
        tr.NAME === name || fieldReferencesSettingName(tr.DATE, name, model)
      );
    })
  ) {
    return true;
  }
  if (
    model.generators.some((g) => {
      if (g.DETAILS === undefined || typeof g.DETAILS !== "object") {
        return false;
      }
      return Object.values(g.DETAILS as Record<string, unknown>).some((v) => {
        return typeof v === "string" && fieldReferencesSettingName(v, name, model);
      });
    })
  ) {
    return true;
  }
  return false;
}

export function shouldTransformSettingValue(
  setting: Setting,
  transform: ExpressionProbeTransform,
  model: ModelData,
): boolean {
  // G-30: view settings (dates, chart mode) are not probed.
  if (setting.TYPE === viewType) {
    return false;
  }
  // G-31: injected probe settings are not probed.
  if (setting.NAME === PROBE_SETTING_ZERO || setting.NAME === PROBE_SETTING_ONE) {
    return false;
  }
  // G-32: cpi VALUE — engine resolves expressions (cpiInitialValue) but wrapping
  // still perturbs generateMoments scheduling for setting-linked assets.
  if (setting.NAME === cpi) {
    return false;
  }
  // G-33: only adjustable settings are probed.
  if (setting.TYPE !== adjustableType) {
    return false;
  }
  if (!shouldTransformValue(setting.VALUE, transform)) {
    return false;
  }
  // G-34: only plain numerics and +/− expressions — not scaled chains or aliases.
  if (!isNumberString(setting.VALUE) && parseNumericExpression(setting.VALUE) === undefined) {
    return false;
  }
  // G-36: optimizer control settings (variable, variableLow, …) are not probed.
  // G-35: settings referenced elsewhere in the model are not probed.
  if (isReferencedInModelNumericFields(setting.NAME, model)) {
    return false;
  }
  return true;
}

function maybeWrap(
  value: string,
  transform: ExpressionProbeTransform,
  eligible: boolean,
): string {
  if (eligible) {
    return wrapProbeValue(value, transform);
  }
  return value;
}

/**
 * Rewrite model numeric value fields for identity-expression symmetry checks.
 */
export function applyExpressionProbeTransform(
  model: ModelData,
  transform: ExpressionProbeTransform,
): void {
  addProbeZeroAndOneSettings(model);

  model.expenses.forEach((e) => {
    e.VALUE = maybeWrap(
      e.VALUE,
      transform,
      shouldTransformValue(e.VALUE, transform),
    );
  });

  model.incomes.forEach((i) => {
    i.VALUE = maybeWrap(
      i.VALUE,
      transform,
      shouldTransformValue(i.VALUE, transform),
    );
  });

  model.settings.forEach((s) => {
    s.VALUE = maybeWrap(
      s.VALUE,
      transform,
      shouldTransformSettingValue(s, transform, model),
    );
  });

  model.assets.forEach((a) => {
    a.VALUE = maybeWrap(
      a.VALUE,
      transform,
      shouldTransformAssetValue(a, transform),
    );
    a.PURCHASE_PRICE = maybeWrap(
      a.PURCHASE_PRICE,
      transform,
      shouldTransformPurchasePrice(a, transform),
    );
  });

  model.transactions.forEach((t) => {
    t.TO_VALUE = maybeWrap(
      t.TO_VALUE,
      transform,
      shouldTransformToValue(t, transform, model),
    );
    t.FROM_VALUE = maybeWrap(
      t.FROM_VALUE,
      transform,
      shouldTransformFromValue(t, transform, model),
    );
  });
}

export const ZERO_IDENTITY_TRANSFORMS: ExpressionProbeTransform[] = [
  "suffixZero",
  "prefixZero",
  "sandwichZero",
  "suffixZeroMinus",
  "sandwichZeroPlusMinus",
  "suffixZeroPlusMinus",
  "suffixDoubleZero",
  "prefixDoubleZero",
  "interleaveZero",
];

export const ONE_IDENTITY_TRANSFORMS: ExpressionProbeTransform[] = [
  "suffixOne",
  "prefixZeroSuffixOne",
  "interleaveOneOnNumbers",
];

export const EXPRESSION_IDENTITY_TRANSFORMS: ExpressionProbeTransform[] = [
  ...ZERO_IDENTITY_TRANSFORMS,
  ...ONE_IDENTITY_TRANSFORMS,
];

const verifiedSymmetryModelKeys = new Set<string>();

/**
 * Assert that Zero=0 / One=1 identity wraps do not change evaluations.
 * `evaluate` must run getTestEvaluationsCore (no recursion into this check).
 */
export function assertZeroIdentitySymmetry(
  unprocessedModel: ModelData,
  evaluate: (model: ModelData) => Evaluation[],
  options?: { context?: string },
): void {
  const cacheKey = JSON.stringify(unprocessedModel);
  if (verifiedSymmetryModelKeys.has(cacheKey)) {
    return;
  }

  const baselineModel = JSON.parse(
    JSON.stringify(unprocessedModel),
  ) as ModelData;
  addProbeZeroAndOneSettings(baselineModel);
  const baseline = evaluate(baselineModel);

  for (const transform of EXPRESSION_IDENTITY_TRANSFORMS) {
    const probed = JSON.parse(JSON.stringify(unprocessedModel)) as ModelData;
    applyExpressionProbeTransform(probed, transform);
    const modified = evaluate(probed);
    const cmp = evaluationsSymmetricUnderZeroProbe(baseline, modified);
    if (!cmp.equal) {
      const where = options?.context ? ` (${options.context})` : "";
      throw new Error(
        `Expression symmetry failed for transform '${transform}'${where}: ` +
          `${cmp.firstDiff ?? "evaluations differ"}`,
      );
    }
  }

  verifiedSymmetryModelKeys.add(cacheKey);
}

function evaluationKey(e: Evaluation): string {
  return `${e.name}\0${e.date.getTime()}`;
}

function evaluationValuesEqual(
  a: number | string | undefined,
  b: number | string | undefined,
): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < 1e-9;
  }
  return false;
}

/**
 * Baseline evaluations must match modified at the same name+date; modified may
 * include extra rows only for probe settings Zero / One.
 */
export function evaluationsSymmetricUnderZeroProbe(
  baseline: Evaluation[],
  modified: Evaluation[],
): { equal: boolean; firstDiff?: string } {
  const probeNames = new Set([PROBE_SETTING_ZERO, PROBE_SETTING_ONE]);
  const modByKey = new Map<string, Evaluation>();
  modified.forEach((e) => {
    modByKey.set(evaluationKey(e), e);
  });
  const baseByKey = new Map<string, Evaluation>();
  baseline.forEach((e) => {
    baseByKey.set(evaluationKey(e), e);
  });

  for (const [k, b] of baseByKey) {
    const m = modByKey.get(k);
    if (m === undefined) {
      return {
        equal: false,
        firstDiff:
          `missing in probed run: ${b.name} at ${b.date.getTestDescription()}`,
      };
    }
    if (!evaluationValuesEqual(b.value, m.value)) {
      return {
        equal: false,
        firstDiff:
          `${b.name} at ${b.date.getTestDescription()}: ` +
          `${b.value} vs ${m.value}`,
      };
    }
  }

  for (const [k, m] of modByKey) {
    if (baseByKey.has(k)) {
      continue;
    }
    if (probeNames.has(m.name)) {
      continue;
    }
    return {
      equal: false,
      firstDiff:
        `unexpected extra in probed run: ${m.name} at ` +
        `${m.date.getTestDescription()} = ${m.value}`,
    };
  }

  return { equal: true };
}

export function evaluationsMatch(
  baseline: Evaluation[],
  modified: Evaluation[],
): { equal: boolean; firstDiff?: string } {
  return evaluationsSymmetricUnderZeroProbe(baseline, modified);
}
