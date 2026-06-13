import { isNumberString, isSetting } from "../models/modelQueries";
import {
  separator,
  incomeTax,
  nationalInsurance,
  income,
  net,
  gain,
  cgt,
  revalue,
  conditional,
  pensionSS,
  pensionTransfer,
  pensionDB,
  pensionPrefix,
  moveTaxFreePart,
  crystallizedPension,
  transferCrystallizedPension,
  liquidateAsset,
  payOffDebt,
  investExcessCash,
  revalueAsset,
  currentValue,
  revalueDebt,
  revalueExp,
  revalueInc,
  revalueSetting,
  bondInvest,
  bondMature,
  taxablePart,
  taxFreePart,
} from "../localization/stringConstants";
import { Setting, ModelData, Trigger } from "../types/interfaces";
import {
  DateFormatType,
  FinKittyDate,
  log,
  makeDateFromString,
  printDebug,
  showObj,
} from "./utils";

showObj;

export function lessThan(a: string, b: string) {
  if (a.startsWith("-") && !b.startsWith("-")) {
    return 1;
  }
  if (!a.startsWith("-") && b.startsWith("-")) {
    return -1;
  }
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function getNumberAndWordParts(input: string): {
  numberPart: number | undefined;
  wordPart: string;
} {
  // strip away any number part from the front of the
  // string
  const re = new RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)");
  const numberParts = input.match(re);
  // log(`number parts of ${input} are ${numberParts}`);

  let numberPart = undefined;
  let wordPart = input;
  if (numberParts === null || numberParts.length === 0) {
    // log(`no number part`);
  } else {
    numberPart = parseFloat(numberParts[0]);
    wordPart = input.substring(numberParts[0].length);
    // log(`numberPart = ${numberPart}, wordPart = ${wordPart}`);
  }
  // log(`from ${input}, numberPart = ${numberPart}, wordPart = ${wordPart}`);
  return {
    numberPart: numberPart,
    wordPart: wordPart,
  };
}

/** A term is a plain number, a word (setting/asset name), or numberPart+wordPart (e.g. 2x). */
export function isNumericExpressionTerm(term: string): boolean {
  const t = term.trim();
  if (t.length === 0) {
    return false;
  }
  if (isNumberString(t)) {
    return true;
  }
  for (let i = 1; i < t.length; i += 1) {
    if (t[i] === "+" || t[i] === "-") {
      return false;
    }
  }
  const parts = getNumberAndWordParts(t);
  return (
    parts.wordPart.length > 0 &&
    parts.wordPart !== "+" &&
    parts.wordPart !== "-"
  );
}

export type BinaryNumericExpression = {
  left: string;
  op: "+" | "-";
  right: string;
};

export type NumericExpression = {
  terms: string[];
  ops: ("+" | "-")[];
};

function takeLeadingNumericExpressionTerm(
  input: string,
): { term: string; rest: string } | undefined {
  const s = input.trim();
  if (s.length === 0) {
    return undefined;
  }
  for (let i = 1; i <= s.length; i += 1) {
    const candidate = s.substring(0, i).trim();
    if (!isNumericExpressionTerm(candidate)) {
      continue;
    }
    const rest = s.substring(i);
    if (rest.length === 0 || rest[0] === "+" || rest[0] === "-") {
      return { term: candidate, rest };
    }
  }
  return undefined;
}

/**
 * True when the string may contain a binary +/- numeric expression (not a lone
 * leading sign). Skips expensive parsing for plain words and scaled terms.
 */
export function mayContainBinaryNumericExpression(value: string): boolean {
  const s = value.trim();
  for (let i = 1; i < s.length; i += 1) {
    if (s[i] === "+" || s[i] === "-") {
      return true;
    }
  }
  return false;
}

/**
 * True when wordPart may need splitScaledValueSuffix (scaled term, identity
 * suffix, setting+setting, or asset+setting). Plain setting/asset aliases skip.
 * Pass pre-parsed parts and name sets when calling in a hot loop.
 */
export function wordPartMayHaveScaledSuffix(
  wordPart: string,
  settingNames: string[],
  assetNames: string[],
  parts?: { numberPart: number | undefined; wordPart: string },
  settingSet?: Set<string>,
  assetSet?: Set<string>,
): boolean {
  if (wordPart.length === 0) {
    return false;
  }
  const parsed = parts ?? getNumberAndWordParts(wordPart);
  if (parsed.numberPart !== undefined && parsed.wordPart.length > 0) {
    return true;
  }
  const sSet = settingSet ?? new Set(settingNames);
  const aSet = assetSet ?? new Set(assetNames);
  if (sSet.has(wordPart) || aSet.has(wordPart)) {
    return false;
  }
  if (wordPart.endsWith("One") || wordPart.endsWith("Zero")) {
    return true;
  }
  for (const suffix of settingNames) {
    if (suffix.length === 0 || wordPart.length <= suffix.length) {
      continue;
    }
    if (!wordPart.endsWith(suffix)) {
      continue;
    }
    const base = wordPart.substring(0, wordPart.length - suffix.length);
    if (base.length > 0 && (sSet.has(base) || aSet.has(base))) {
      return true;
    }
  }
  return false;
}

/**
 * Parse a (+|-) b (+|- c ...)* where each term is a number, word, or numberPart+wordPart.
 * Returns undefined for a single term with no operator.
 */
export function parseNumericExpression(
  input: string,
): NumericExpression | undefined {
  if (!mayContainBinaryNumericExpression(input)) {
    return undefined;
  }
  const first = takeLeadingNumericExpressionTerm(input);
  if (first === undefined) {
    return undefined;
  }
  const terms: string[] = [first.term];
  const ops: ("+" | "-")[] = [];
  let remaining = first.rest.trim();
  while (remaining.length > 0) {
    const op = remaining[0];
    if (op !== "+" && op !== "-") {
      return undefined;
    }
    remaining = remaining.substring(1).trim();
    const next = takeLeadingNumericExpressionTerm(remaining);
    if (next === undefined) {
      return undefined;
    }
    ops.push(op);
    terms.push(next.term);
    remaining = next.rest.trim();
  }
  if (ops.length === 0) {
    return undefined;
  }
  return { terms, ops };
}

/**
 * Parse a + b or a - b where each side is a numeric expression term.
 * Returns undefined if the string is not exactly one such binary expression.
 */
export function splitBinaryNumericExpression(
  input: string,
): BinaryNumericExpression | undefined {
  const expr = parseNumericExpression(input);
  if (expr === undefined || expr.terms.length !== 2) {
    return undefined;
  }
  return {
    left: expr.terms[0],
    op: expr.ops[0],
    right: expr.terms[1],
  };
}

/** Terms to resolve for a stored value (one term, or each part of a + / - expression). */
export function getNumericExpressionTerms(value: string): string[] {
  const expr = parseNumericExpression(value);
  if (expr !== undefined) {
    return expr.terms;
  }
  return [value];
}

/** True when a revalue TO_VALUE expression references CurrentValue. */
export function revalueToValueReferencesCurrentValue(value: string): boolean {
  return getNumericExpressionTerms(value).some((term) => {
    return term === currentValue;
  });
}

/** Replace CurrentValue with a concrete asset name or number in an expression. */
export function substituteCurrentValue(
  value: string,
  replacement: string,
): string {
  const expr = parseNumericExpression(value);
  if (expr === undefined) {
    return value === currentValue ? replacement : value;
  }
  const terms = expr.terms.map((term) => {
    return term === currentValue ? replacement : term;
  });
  let result = terms[0];
  for (let i = 0; i < expr.ops.length; i += 1) {
    result += expr.ops[i] + terms[i + 1];
  }
  return result;
}

/** True when a model item name field equals a setting (or lists it with separator). */
export function modelNameReferencesSetting(
  field: string,
  settingName: string,
): boolean {
  if (field === settingName) {
    return true;
  }
  if (field.includes(separator)) {
    return field.split(separator).some((w) => {
      return w === settingName;
    });
  }
  return false;
}

function termReferencesName(
  term: string,
  name: string,
  settingNames?: string[],
  assetNames?: string[],
): boolean {
  if (term === name) {
    return true;
  }
  const parts = getNumberAndWordParts(term);
  if (parts.wordPart === name) {
    return true;
  }
  if (parts.wordPart.length === 0 || settingNames === undefined) {
    return false;
  }
  const split = splitScaledValueSuffix(
    parts.wordPart,
    settingNames,
    assetNames,
  );
  if (split !== undefined) {
    return split.baseWord === name || split.suffixSetting === name;
  }
  return false;
}

/** True when a stored value references a setting/asset name (not a plain number). */
export function numericExpressionReferencesName(
  value: string,
  name: string,
  model?: ModelData,
): boolean {
  const settingNames =
    model !== undefined ? modelSettingNamesLongestFirst(model) : undefined;
  const assetNames =
    model !== undefined ? modelAssetNames(model) : undefined;
  return getNumericExpressionTerms(value).some((term) => {
    return termReferencesName(term, name, settingNames, assetNames);
  });
}

/** True when a model text field names or embeds a setting (not substring .includes). */
export function fieldReferencesSettingName(
  field: string,
  name: string,
  model?: ModelData,
): boolean {
  if (field.length === 0) {
    return false;
  }
  if (field === name) {
    return true;
  }
  if (numericExpressionReferencesName(field, name, model)) {
    return true;
  }
  if (modelNameReferencesSetting(field, name)) {
    return true;
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dateRef = new RegExp(`[+\\-?]${escaped}(?:[0-9]*[dmwy])?`);
  return dateRef.test(field);
}

/** True when value is not a plain number and contains a word reference (any term). */
export function valueReferencesWord(value: string): boolean {
  if (isNumberString(value)) {
    return false;
  }
  const expr = parseNumericExpression(value);
  if (expr !== undefined) {
    return expr.terms.some((term) => {
      return valueReferencesWord(term);
    });
  }
  return getNumberAndWordParts(value).wordPart.length > 0;
}

/**
 * True when the whole value is a single symbolic reference (setting name or
 * scaled setting like 2x), not a plain number or a + / - expression.
 * Used to block proportional transactions to assets whose value is an alias
 * for a live setting, while still allowing expressions such as 222+X.
 */
export function valueIsPureSymbolicValue(value: string): boolean {
  if (isNumberString(value)) {
    return false;
  }
  if (parseNumericExpression(value) !== undefined) {
    return false;
  }
  return getNumberAndWordParts(value).wordPart.length > 0;
}

/** Bare setting name (e.g. MyCarValue), not a scaled reference (e.g. 2x or 50One). */
export function valueIsPlainSettingAlias(value: string): boolean {
  if (!valueIsPureSymbolicValue(value)) {
    return false;
  }
  return getNumberAndWordParts(value).numberPart === undefined;
}

/**
 * When wordPart ends with a setting name (e.g. xOne → x + One), return the split.
 * Pass settingNames longest-first so twoUSD wins over USD.
 */
export function splitScaledSettingSuffix(
  wordPart: string,
  settingNames: string[],
): { baseWord: string; suffixSetting: string } | undefined {
  const settingNameSet = new Set(settingNames);
  const candidates: { baseWord: string; suffixSetting: string }[] = [];
  for (const name of settingNames) {
    if (name.length === 0 || wordPart.length <= name.length) {
      continue;
    }
    if (wordPart.endsWith(name)) {
      const baseWord = wordPart.substring(0, wordPart.length - name.length);
      if (baseWord.length > 0 && settingNameSet.has(baseWord)) {
        candidates.push({ baseWord, suffixSetting: name });
      }
    }
  }
  if (candidates.length === 0) {
    return undefined;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const identitySuffix = candidates.filter((c) => {
    return c.suffixSetting === "Zero" || c.suffixSetting === "One";
  });
  if (identitySuffix.length === 1) {
    return identitySuffix[0];
  }
  if (identitySuffix.length > 1) {
    return identitySuffix.sort((a, b) => {
      return b.suffixSetting.length - a.suffixSetting.length;
    })[0];
  }
  return candidates.sort((a, b) => {
    return b.baseWord.length - a.baseWord.length;
  })[0];
}

export function modelSettingNamesLongestFirst(model: {
  settings: { NAME: string }[];
}): string[] {
  return model.settings
    .map((s) => {
      return s.NAME;
    })
    .sort((a, b) => {
      return b.length - a.length;
    });
}

export function modelAssetNames(model: { assets: { NAME: string }[] }): string[] {
  return model.assets
    .map((a) => {
      return a.NAME;
    })
    .sort((a, b) => {
      return b.length - a.length;
    });
}

/**
 * Split wordPart into base (setting or asset) + trailing setting suffix (e.g. xOne, NSIOne).
 * Setting+setting splits (twoUSD) are handled first via splitScaledSettingSuffix.
 */
export function splitScaledValueSuffix(
  wordPart: string,
  settingNames: string[],
  assetNames?: string[],
): { baseWord: string; suffixSetting: string } | undefined {
  const settingSplit = splitScaledSettingSuffix(wordPart, settingNames);
  if (settingSplit !== undefined) {
    return settingSplit;
  }
  if (assetNames === undefined || assetNames.length === 0) {
    return undefined;
  }
  const assetNameSet = new Set(assetNames);
  const candidates: { baseWord: string; suffixSetting: string }[] = [];
  for (const name of settingNames) {
    if (name.length === 0 || wordPart.length <= name.length) {
      continue;
    }
    if (wordPart.endsWith(name)) {
      const baseWord = wordPart.substring(0, wordPart.length - name.length);
      if (baseWord.length > 0 && assetNameSet.has(baseWord)) {
        candidates.push({ baseWord, suffixSetting: name });
      }
    }
  }
  if (candidates.length === 0) {
    return undefined;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const identitySuffix = candidates.filter((c) => {
    return c.suffixSetting === "Zero" || c.suffixSetting === "One";
  });
  if (identitySuffix.length === 1) {
    return identitySuffix[0];
  }
  if (identitySuffix.length > 1) {
    return identitySuffix.sort((a, b) => {
      return b.suffixSetting.length - a.suffixSetting.length;
    })[0];
  }
  return candidates.sort((a, b) => {
    return b.suffixSetting.length - a.suffixSetting.length;
  })[0];
}

// if there's no leading number part, this returns undefined
export function removeNumberPart(input: string) {
  const parts = getNumberAndWordParts(input);
  if (parts.numberPart === undefined) {
    return undefined;
  } else {
    return parts.wordPart;
  }
}

/** Category for incomes auto-generated from a Defined Benefits pension generator. */
export function dbpGeneratedIncomeCategory(taxPayerName: string): string {
  return `Pension${taxPayerName}`;
}

export function makeIncomeLiabilityFromNameAndNI(
  name: string,
  NI: boolean,
  printOnError = true,
) {
  if (name === "") {
    return "";
  }
  if (name.includes(separator)) {
    /* istanbul ignore if  */
    if (printOnError) {
      log(`Error: name ${name} can't contain ${separator}`);
    }
    return "";
  }
  if (NI) {
    return name + incomeTax + separator + name + nationalInsurance;
  } else {
    return name + incomeTax;
  }
}

export function makeIncomeTaxTag(person: string) {
  return person + " " + income + " " + incomeTax;
}
export function makeNationalInsuranceTag(person: string) {
  return person + " " + income + " " + nationalInsurance;
}
export function makeNetIncomeTag(person: string) {
  return person + " " + income + " " + net;
}
export function makeCGTTag(person: string) {
  return person + " " + gain + " " + cgt;
}
export function makeNetGainTag(person: string) {
  return person + " " + gain + " " + net;
}
export function deconstructTaxTag(tag: string): {
  isIncome: boolean;
  isGain: boolean;
  isIncomeTax: boolean;
  isNationalInsurance: boolean;
  isNet: boolean;
  isCGT: boolean;
  person: string;
} {
  const result = {
    isIncome: false,
    isGain: false,
    isIncomeTax: false,
    isNationalInsurance: false,
    isNet: false,
    isCGT: false,
    person: "",
  };
  let s = tag;
  if (s.includes(income)) {
    result.isIncome = true;
    if (s.includes(incomeTax)) {
      result.isIncomeTax = true;
      s = s.substring(0, s.length - incomeTax.length - 1);
    } else if (s.includes(nationalInsurance)) {
      result.isNationalInsurance = true;
      s = s.substring(0, s.length - nationalInsurance.length - 1);
    } else {
      result.isNet = true;
      s = s.substring(0, s.length - net.length - 1);
    }
    s = s.substring(0, s.length - income.length - 1);
  } else {
    result.isGain = true;
    if (s.includes(cgt)) {
      result.isCGT = true;
      s = s.substring(0, s.length - cgt.length - 1);
    } else {
      result.isNet = true;
      s = s.substring(0, s.length - net.length - 1);
    }
    s = s.substring(0, s.length - gain.length - 1);
  }
  result.person = s;
  // log(`deconstruct ${tag} result = ${showObj(result)}`);
  return result;
}
export function makeBooleanFromString(s: string) {
  const result = s === "T" || s === "t" || s === "True" || s === "true";
  // log(`convert ${s} to boolean and get ${result}`);
  return result;
}

export function makeStringFromBoolean(b: boolean) {
  if (b) {
    return "T";
  }
  return "F";
}

export function makeBooleanFromYesNo(input: string) {
  const result = {
    value: true,
    checksOK: true,
  };
  const lcInput = input.toLowerCase();
  if (lcInput === "y" || lcInput === "yes") {
    result.value = true;
  } else if (lcInput === "n" || lcInput === "no") {
    result.value = false;
  } else {
    result.checksOK = false;
  }
  return result;
}

export function makeYesNoFromBoolean(b: boolean) {
  if (b) {
    return "Yes";
  }
  return "No";
}

export function isNumber(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  const wordAndNumber = getNumberAndWordParts(input);
  if (wordAndNumber.wordPart !== "") {
    // log(`isNumber = false for ${input}; returning ${result}`);
    result.checksOK = false;
    return result;
  }
  const num = parseFloat(input);
  if (num === undefined || Number.isNaN(num)) {
    result.checksOK = false;
    return result;
  }

  result.value = num;
  return result;
}

export const proportionMustEndWithPercentMessage =
  "proportions must end with a %";

/** Parse user proportion input (e.g. "5%") into stored decimal (e.g. "0.05"). */
export function makeProportionFromString(
  input: string,
  optional = false,
): { value: string; checksOK: boolean } {
  const result = { value: "", checksOK: true };
  if (input === "") {
    if (!optional) {
      result.checksOK = false;
    }
    return result;
  }
  if (input[input.length - 1] !== "%") {
    result.checksOK = false;
    return result;
  }
  const numberPart = input.substring(0, input.length - 1);
  const parseNum = isNumber(numberPart);
  if (!parseNum.checksOK) {
    result.checksOK = false;
    return result;
  }
  result.value = `${parseNum.value / 100.0}`;
  return result;
}

/** Format stored proportion decimal (e.g. "0.05") for table display (e.g. "5%"). */
export function makeStringFromProportion(input: string, settings: Setting[]) {
  if (input === "") {
    return "";
  }
  if (input[input.length - 1] === "%") {
    return input;
  }
  const parseSetting = isSetting(input, settings);
  if (parseSetting.numFound === 1) {
    return input;
  }
  const parseNum = isNumber(input);
  if (!parseNum.checksOK) {
    return input;
  }
  const pcVal = parseNum.value * 100;
  let strVal = `${pcVal}`;
  if (
    strVal.substring(0, strVal.length - 1).endsWith("0000000") ||
    strVal.substring(0, strVal.length - 1).endsWith("9999999")
  ) {
    strVal = makeTwoDP(pcVal);
    if (strVal.endsWith(".00")) {
      strVal = strVal.substring(0, strVal.length - 3);
    } else if (strVal.endsWith("0")) {
      strVal = strVal.substring(0, strVal.length - 1);
    }
  }
  return `${strVal}%`;
}

/** Convert a proportion table cell (display or stored) back to stored decimal. */
export function proportionStoredValueFromGridCell(
  input: string,
  settings: Setting[],
): string {
  if (input === "") {
    return "";
  }
  if (isSetting(input, settings).numFound === 1) {
    return input;
  }
  if (input[input.length - 1] === "%") {
    const parsed = makeProportionFromString(input);
    return parsed.checksOK ? parsed.value : input;
  }
  return input;
}

export const growthMustEndWithPercentMessage = "growth must end with a %";

export type GrowthParseResult = {
  value: string;
  checksOK: boolean;
  missingPercentSuffix?: boolean;
};

export function growthInputErrorMessage(
  input: string,
  parsed: GrowthParseResult,
): string {
  if (parsed.missingPercentSuffix) {
    return growthMustEndWithPercentMessage;
  }
  return `Growth value '${input}' should be a numerical or setting value`;
}

/** Parse growth from user input (requires %) or stored model value (plain number). */
export function makeGrowthFromString(
  input: string,
  settings: Setting[],
  fromUserInput = false,
): GrowthParseResult {
  // log(`make growth value from string ${input}`);
  const result: GrowthParseResult = {
    value: "",
    checksOK: true,
    missingPercentSuffix: false,
  };
  if (input === "") {
    result.checksOK = false;
    return result;
  }
  const parseSetting = isSetting(input, settings);
  if (parseSetting.numFound === 1) {
    result.value = input;
    return result;
  }
  if (fromUserInput) {
    if (input[input.length - 1] !== "%") {
      result.checksOK = false;
      result.missingPercentSuffix = true;
      return result;
    }
    const numberPart = input.substring(0, input.length - 1);
    const num = isNumber(numberPart);
    if (!num.checksOK) {
      result.checksOK = false;
      return result;
    }
    result.value = `${num.value}`;
    return result;
  }
  const x = input.replace("%", "");
  const num = isNumber(x);
  if (!num.checksOK) {
    result.checksOK = false;
    return result;
  }
  result.value = `${num.value}`;
  return result;
}

export function makeStringFromGrowth(input: string, settings: Setting[]) {
  // log(`format growth as string; input is ${input}`);
  const parseGrowth = isSetting(input, settings);
  if (parseGrowth.numFound === 1) {
    return input;
  }
  const parseNum = isNumber(input);
  if (parseNum.checksOK) {
    const firstTry = `${parseFloat(input)}%`
    if (firstTry.length <= 5) {
      return firstTry;
    }
    // shorten long growth expressions
    return `${makeTwoDP(parseFloat(input))}%`;
  }
  return input;
}

export function makeCashValueFromString(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  let x = input.replace("£", "");
  x = x.replace(",", "");
  const parseDirectly = isNumber(x);
  if (parseDirectly.checksOK) {
    result.value = parseDirectly.value;
  } else {
    result.checksOK = false;
  }
  // log(`parsing ${input} as cash yields ${showObj(result)}`);
  return result;
}

export function makeQuantityFromString(input: string) {
  const result = {
    value: "",
    checksOK: true,
  };
  if (input.length === 0) {
    return result;
  }
  const parseDirectly = isNumber(input);
  if (parseDirectly.checksOK) {
    if (parseDirectly.value === Math.floor(parseDirectly.value)) {
      result.value = `${parseDirectly.value}`;
    } else {
      result.checksOK = false;
    }
  } else {
    result.checksOK = false;
  }
  // log(`parsing ${input} as quantity yields ${showObj(result)}`);
  return result;
}

export function makeValueAbsPropFromString(
  input: string,
  settings?: Setting[],
) {
  const result = {
    absolute: true,
    value: input,
    checksOK: true,
  };
  if (input === "") {
    result.value = "0.0";
    return result;
  }
  if (settings !== undefined && isSetting(input, settings).numFound === 1) {
    // a plain setting name is an absolute value, resolved at evaluation time
    result.absolute = true;
    result.value = input;
    result.checksOK = true;
    return result;
  }
  if (parseNumericExpression(input) !== undefined) {
    result.absolute = true;
    result.value = input;
    result.checksOK = true;
    return result;
  }
  const lastPartForUnits = input.substring(input.length - 6, input.length);
  const numWordSplit = getNumberAndWordParts(input);
  // log(`from ${input}, lastPartForUnits = ${lastPartForUnits}`);
  // log(`from ${input}, numWordSplit = ${showObj(numWordSplit)}`);
  if (lastPartForUnits === " units") {
    const numberPart = input.substring(0, input.length - 6);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.value = numberPart;
    } else {
      result.checksOK = false;
    }
  } else if (
    numWordSplit.numberPart !== undefined &&
    numWordSplit.wordPart !== "%" &&
    numWordSplit.wordPart !== ""
  ) {
    result.value = input;
    result.checksOK = true;
  } else if (input[input.length - 1] === "%") {
    const numberPart = input.substring(0, input.length - 1);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.absolute = false;
      result.value = `${num / 100.0}`;
    } else {
      result.checksOK = false;
    }
  } else {
    const noCommas = input.replace(",", "");
    const parseNum = isNumber(noCommas);
    if (!parseNum.checksOK) {
      const parseCashValue = makeCashValueFromString(noCommas);
      if (!parseCashValue.checksOK) {
        result.checksOK = false;
      } else {
        result.value = `${parseCashValue.value}`;
      }
    } else {
      result.value = `${parseNum.value}`;
      // parses OK as a number
    }
  }
  // log(`parsing ${input} makes result ${showObj(result)}`);
  return result;
}

export function getStartQuantity(w: string, model: ModelData) {
  // log(`try to get a quantity for ${w}`);
  const a = model.assets.filter((a) => {
    return a.NAME === w;
  })[0];
  if (a === undefined) {
    // log(`no matched asset found`);
    return undefined;
  }
  if (a.QUANTITY === "") {
    return undefined;
  }
  const result = parseFloat(a.QUANTITY);
  // log(`getStartQuantity for ${w} is ${result}`);
  return result;
}

export function makeTwoDP(x: number) {
  const result = x.toFixed(2);
  // log(`2dp input = ${x} result = ${result}`);
  return result;
}

export function makeStringFromValueAbsProp(
  value: string,
  absolute: boolean,
  assetName: string,
  model: ModelData,
  tname: string,
) {
  let result = "";
  // log(`value = ${value}`);
  if (value.length === 0) {
    return "0.0";
  } else if (
    !tname.startsWith(revalue) &&
    getStartQuantity(assetName, model) !== undefined
  ) {
    // value should be an integer
    result = value + " units"; // TODO const string 'units'
  } else if (!absolute) {
    const pcVal = parseFloat(value) * 100;
    let strVal = `${pcVal}`;
    //log(`${strVal.substring(0, strVal.length - 1)}`);
    if (
      strVal.substring(0, strVal.length - 1).endsWith("0000000") ||
      strVal.substring(0, strVal.length - 1).endsWith("9999999")
    ) {
      strVal = makeTwoDP(pcVal);
      if (strVal.endsWith(".00")) {
        strVal = strVal.substring(0, strVal.length - 3);
      } else if (strVal.endsWith("0")) {
        strVal = strVal.substring(0, strVal.length - 1);
      }
    } else {
      strVal = `${pcVal}`;
    }
    result = `${strVal}%`;
  } else {
    result = value;
  }
  // log(`string for ${value} is ${result}`);
  return result;
}
export function makeStringFromCashValue(input: string, currency: string) {
  // formatting from 34567.23 as £34,567.23
  // log(`formatting ${input} as a cash value`);
  if (input === "") {
    return "";
  }
  let n = parseFloat(input);
  const negative = n < 0;
  if (negative) {
    n *= -1;
  }
  let s = n.toFixed(2);
  if (s.length > 6) {
    s =
      s.substring(0, s.length - 6) + "," + s.substring(s.length - 6, s.length);
  }
  if (s.length > 10) {
    s =
      s.substring(0, s.length - 10) +
      "," +
      s.substring(s.length - 10, s.length);
  }
  if (negative) {
    return `-${currency}${s}`;
  } else {
    return `${currency}${s}`;
  }
}
export function makeStringFromFromToValue(input: string) {
  if (input === "") {
    return "";
  }
  if (input.substring(input.length - 6, input.length) === " units") {
    // TODO
    return input;
  } else if (input[input.length - 1] === "%") {
    return input;
  } else {
    return makeStringFromCashValue(input, "£");
  }
}

function parseDateStringForOperator(
  triggerName: string,
  opSymbol: string,
  triggers: Trigger[],
  varValue: number,
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
  model: ModelData | undefined,
) {
  if (opSymbol === "?") {
    const parts = triggerName.split(opSymbol);
    if (parts.length === 2) {
      const partsLessThan = parts[0].split("<");
      const partsElse = parts[1].split(":");
      if (partsLessThan.length === 2 && partsElse.length === 2) {
        const cleaned1 = {
          cleaned: "",
        };
        const cleaned2 = {
          cleaned: "",
        };
        const cleaned3 = {
          cleaned: "",
        };
        const cleaned4 = {
          cleaned: "",
        };
        const date1: Date | undefined = findMatchedTriggerDate(
          partsLessThan[0],
          triggers,
          varValue,
          recursionLevel + 1,
          cleaned1,
          model,
        );
        const date2: Date | undefined = findMatchedTriggerDate(
          partsLessThan[1],
          triggers,
          varValue,
          recursionLevel + 1,
          cleaned2,
          model,
        );
        const date3: Date | undefined = findMatchedTriggerDate(
          partsElse[0],
          triggers,
          varValue,
          recursionLevel + 1,
          cleaned3,
          model,
        );
        const date4: Date | undefined = findMatchedTriggerDate(
          partsElse[1],
          triggers,
          varValue,
          recursionLevel + 1,
          cleaned4,
          model,
        );
        if (cleanedUp !== undefined) {
          cleanedUp.cleaned = `${cleaned1.cleaned}<${cleaned2.cleaned}?${cleaned3.cleaned}:${cleaned4.cleaned}`;
        }
        if (date1 !== undefined && date2 !== undefined) {
          if (date1.getTime() < date2.getTime()) {
            return date3;
          } else {
            return date4;
          }
        }
      }
    }
  }

  let numChange = 0;
  if (opSymbol === "-") {
    numChange = -1;
  } else if (opSymbol === "+") {
    numChange = 1;
  } else {
    /* istanbul ignore next  */
    return undefined;
  }

  const parts = triggerName.split(opSymbol);
  if (parts.length === 2) {
    const varString = "variable";
    let secondPartStartsVariable = false;
    if (parts[1].startsWith(varString)) {
      numChange *= varValue;
      parts[1] = parts[1].substring(varString.length);
      secondPartStartsVariable = true;
    }
    const secondPartNW = getNumberAndWordParts(parts[1]);
    if (
      secondPartNW.numberPart !== undefined &&
      (secondPartNW.wordPart === "d" ||
        secondPartNW.wordPart === "m" ||
        secondPartNW.wordPart === "w" ||
        secondPartNW.wordPart === "y")
    ) {
      //no-use-before-define
      /* eslint-disable */
      const firstPartDate: Date | undefined = findMatchedTriggerDate(
        parts[0],
        triggers,
        varValue,
        recursionLevel + 1,
        cleanedUp,
        model,
      );
      if (cleanedUp) {
        cleanedUp.cleaned = `${cleanedUp.cleaned}${opSymbol}`;
        if (secondPartStartsVariable) {
          cleanedUp.cleaned = `${cleanedUp.cleaned}variable`;
        }
      }
      /* eslint-enable */
      if (firstPartDate !== undefined) {
        if (secondPartNW.wordPart === "d") {
          firstPartDate.setDate(
            firstPartDate.getDate() + numChange * secondPartNW.numberPart,
          );
          if (cleanedUp) {
            cleanedUp.cleaned = `${cleanedUp.cleaned}${secondPartNW.numberPart}d`;
          }
        } else if (secondPartNW.wordPart === "w") {
          firstPartDate.setDate(
            firstPartDate.getDate() + numChange * secondPartNW.numberPart * 7,
          );
          if (cleanedUp) {
            cleanedUp.cleaned = `${cleanedUp.cleaned}${secondPartNW.numberPart}w`;
          }
        } else if (secondPartNW.wordPart === "m") {
          firstPartDate.setMonth(
            firstPartDate.getMonth() + numChange * secondPartNW.numberPart,
          );
          if (cleanedUp) {
            cleanedUp.cleaned = `${cleanedUp.cleaned}${secondPartNW.numberPart}m`;
          }
        } else if (secondPartNW.wordPart === "y") {
          firstPartDate.setFullYear(
            firstPartDate.getFullYear() + numChange * secondPartNW.numberPart,
          );
          if (cleanedUp) {
            cleanedUp.cleaned = `${cleanedUp.cleaned}${secondPartNW.numberPart}y`;
          }
        }
        // log(`converted ${triggerName} into ${firstPartDate)}`);
        return firstPartDate;
      } else {
        /* istanbul ignore if */
        if (printDebug()) {
          log(`Error: can't understand ${triggerName}`);
        }
      }
    }
  }
}
export function dateAsString(
  mode: DateFormatType,
  d: Date | undefined,
): string {
  if (d === undefined) {
    return "Invalid date";
  }
  if (
    mode === DateFormatType.View ||
    mode === DateFormatType.Debug ||
    mode === DateFormatType.Data
  ) {
    try {
      const result = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(d);
      return result;
    } catch (e) {
      // log(`error from date ${d} = ${e}`);
      /* istanbul ignore next */
      return "Invalid Date";
    }
  } else if (mode === DateFormatType.Test) {
    return d.toDateString();
  } else {
    return d.toDateString();
  }
}

// returns a date for a trigger, or undefined
export function findMatchedTriggerDate(
  dateString: string,
  triggers: Trigger[],
  varValue: number,
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
  model: ModelData | undefined,
): Date | undefined {
  // log(`findMatchedTriggerDate recursionLevel = ${recursionLevel}, triggerName = ${triggerName}`)
  if (recursionLevel > 10) {
    //log(`infinite or too-complex recursion for dates - emergency stop`);
    return undefined;
  }
  const conditionalOp = parseDateStringForOperator(
    dateString,
    "?",
    triggers,
    varValue,
    recursionLevel,
    cleanedUp,
    model,
  );
  if (conditionalOp !== undefined) {
    return conditionalOp;
  }
  const minusOp = parseDateStringForOperator(
    dateString,
    "-",
    triggers,
    varValue,
    recursionLevel,
    cleanedUp,
    model,
  );
  if (minusOp !== undefined) {
    return minusOp;
  }
  const plusOp = parseDateStringForOperator(
    dateString,
    "+",
    triggers,
    varValue,
    recursionLevel,
    cleanedUp,
    model,
  );
  if (plusOp !== undefined) {
    return plusOp;
  }
  // log('look for '+triggerName+'in '+triggers.map(showObj))
  const matched = triggers.filter((trigger) => trigger.NAME === dateString);
  // log(`matched trigger = ${showObj(matched)}`);
  let result: Date | undefined = undefined;
  if (matched.length !== 0) {
    result = checkTriggerDateRecursive(
      matched[0].DATE,
      triggers,
      varValue,
      recursionLevel + 1,
      undefined,
      model,
    );
    if (cleanedUp !== undefined) {
      cleanedUp.cleaned = dateString;
    }
    // log(`converted ${triggerName} into ${dateAsString(DateFormatType.Debug,result)}`);
  }

  if (result === undefined) {
    const parsedDate = makeDateFromString(dateString, model);
    if (parsedDate.getTime()) {
      result = parsedDate;
      if (cleanedUp) {
        // Keep the symbolic token so JSON round-trip and offsets like
        // "tomorrow+1d" stay relative (see makeDateFromString in utils.ts).
        if (dateString === "tomorrow") {
          cleanedUp.cleaned = "tomorrow";
        } else {
          const preferredString = dateAsString(DateFormatType.Data, parsedDate);
          const preferredStringDate = new Date(preferredString);
          if (preferredStringDate.getTime() === parsedDate.getTime()) {
            cleanedUp.cleaned = preferredString;
          } else {
            // we are about to accept this string because it
            // can be made sense of
            // if it's of the form '2019', convert it to '1 Jan 2019'
            const regExp = RegExp("[1-2]{1}[0-9]{3}");
            if (dateString.match(regExp)) {
              cleanedUp.cleaned = `1 Jan ${dateString}`;
            } else {
              // we have a string for a date which
              // becomes a different date when we convert
              // string -> Date -> string -> Date
              /* istanbul ignore next */
              cleanedUp.cleaned = dateString;
            }
          }
        }
      }
    } else {
      //log(`BUG : unrecognised date!!! ${input}, `
      // `${showObj(triggers.length)}`);
      if (cleanedUp) {
        cleanedUp.cleaned = `Invalid Date ${dateString}`;
      }
      result = undefined;
    }
  }
  // log(`date for ${input} is ${result}`);
  if(result === undefined)
  {
    return undefined;
  }
  return result;
}

export function usesTriggerDate(value: string, model: ModelData) {
  const matchedTrigger = model.triggers.find((t) => {
    return value.includes(t.NAME);
  });
  return matchedTrigger !== undefined;
}

function checkTriggerDateRecursive(
  input: string,
  triggers: Trigger[],
  varValue: number,
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
  model: ModelData | undefined,
): Date | undefined {
  // log(`checkTriggerDateRecursive recursionLevel = ${recursionLevel}, input = ${input}`);
  // log('first look for '+input+'in '+showObj(triggers));
  /* eslint-disable no-use-before-define*/ // recursion
  const matched = findMatchedTriggerDate(
    input,
    triggers,
    varValue,
    recursionLevel,
    cleanedUp,
    model,
  );
  /* eslint-enable no-use-before-define*/

  // log(`matched = ${showObj(matched)}`);
  return matched;
}

// returns a date for a trigger or for a date string, or undefined for junk
export function checkTriggerDate(
  input: string,
  triggers: Trigger[],
  varValue: number,
  cleanedUp: { cleaned: string } | undefined = undefined,
  model?: ModelData,
): Date | undefined {
  // log(`checking input ${input}`);
  const result = checkTriggerDateRecursive(
    input,
    triggers,
    varValue,
    0,
    cleanedUp,
    model,
  );
  // log(`checking input ${input} got result = ${result}`);
  return result;
}

// Suppresses any not-understood values and returns new Date('Invalid Date')
export function getTriggerDate(
  triggerName: string,
  triggers: Trigger[],
  varValue: number,
  model?: ModelData,
): FinKittyDate {
  // log(`triggers length is ${triggers.length}`);
  const outcomeDate = checkTriggerDate(
    triggerName,
    triggers,
    varValue,
    undefined,
    model,
  );
  if (outcomeDate !== undefined) {
    return new FinKittyDate(outcomeDate);
  }
  return new FinKittyDate(new Date("Invalid Date"));
}

export const dateFormatOptions = {
  weekday: undefined,
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

// returns a date string for a trigger, or '' for date or junk
export function makeDateTooltip(
  input: string,
  triggers: Trigger[],
  varValue: number,
  model?: ModelData,
) {
  // log(`triggers.length = ${triggers.length}`);
  let result = `${input}`;
  if (input !== "") {
    const date = checkTriggerDate(
      input,
      triggers,
      varValue,
      undefined,
      model,
    );
    if (date !== undefined) {
      const dateString = dateAsString(DateFormatType.View, date);
      if(dateString !== input) {
        result += "\n";
        result += dateAsString(DateFormatType.View, date);
      }
    }
  }
  // log(`make date tooltip for ${input}: ${result}`);
  return result;
}

export function makeStringFromPurchasePrice(input: string, liability: string) {
  if (!liability.includes(cgt)) {
    return ""; // don't display irrelevant purchae price
  } else {
    return input;
  }
}
export function makePurchasePriceFromString(input: string) {
  if (input === "") {
    return "0";
  } else {
    return input;
  }
}

function usesWholeWord(existing: string, checkWord: string) {
  if (existing === checkWord) {
    return true;
  }
  return false;
}
function usesNumberValueWord(
  existing: string,
  checkWord: string,
  model: ModelData,
) {
  if (checkWord.length === 0) {
    return false;
  }
  return numericExpressionReferencesName(existing, checkWord, model);
}
function usesSeparatedString(existing: string, checkWord: string) {
  const parts = existing.split(separator);
  let numMatches = 0;
  parts.forEach((obj) => {
    if (obj === checkWord) {
      numMatches += 1;
    }
  });
  return numMatches > 0;
}

function isDependentDate(dateName: string, dependent: string): boolean {
  if (!dateName.startsWith(dependent)) {
    // log(`${dateName} does not begin ${dependent}`);
    return false;
  }
  const endDateName = dateName.substring(dependent.length);
  if (!(endDateName.startsWith("+") || endDateName.startsWith("-"))) {
    // log(`${dateName} does not have + or - after ${dependent}`);
    return false;
  }
  const tailDateName = endDateName.substring(1);
  const breakDown = getNumberAndWordParts(tailDateName);
  if (breakDown.numberPart === undefined) {
    // log(`${dateName} does not have number part after ${dependent}`);
    return false;
  }
  const hasLetter =
    breakDown.wordPart === "m" ||
    breakDown.wordPart === "d" ||
    breakDown.wordPart === "w" ||
    breakDown.wordPart === "y";
  if (hasLetter) {
    // log(`${dateName} is dependent upon ${dependent}`);
  } else {
    // log(`${dateName} does not have d/m/y after ${dependent}`);
  }
  return hasLetter;
}

export function hasDependentDate(t: Trigger, model: ModelData): boolean {
  // log(`see if this model depends on ${t.NAME}`);
  const name = t.NAME;
  // log(`trigger name is ${name}`);
  // is there a transaction date which begins with name
  // and appends some date algebra
  if (
    model.triggers.find((t) => {
      // log(`see if trigger ${t.DATE} depends on ${name}`);
      return isDependentDate(t.DATE, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.transactions.find((t) => {
      return isDependentDate(t.DATE, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.transactions.find((t) => {
      return isDependentDate(t.STOP_DATE, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.incomes.find((t) => {
      return isDependentDate(t.START, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.incomes.find((t) => {
      return isDependentDate(t.END, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.incomes.find((t) => {
      return isDependentDate(t.VALUE_SET, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.expenses.find((t) => {
      return isDependentDate(t.START, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.expenses.find((t) => {
      return isDependentDate(t.END, name);
    }) !== undefined
  ) {
    return true;
  }
  if (
    model.expenses.find((t) => {
      return isDependentDate(t.VALUE_SET, name);
    }) !== undefined
  ) {
    return true;
  }
  const dependentAsset = model.assets.find((t) => {
    return isDependentDate(t.START, name);
  });
  if (dependentAsset !== undefined) {
    return true;
  }
  return false;
}

export function getSpecialWord(name: string, model: ModelData): string {
  if (name.startsWith(revalue)) {
    return revalue;
  }
  if (name.startsWith(conditional)) {
    return conditional;
  }
  if (name.startsWith(pensionSS)) {
    return pensionSS;
  }
  if (name.startsWith(pensionTransfer)) {
    return pensionTransfer;
  }
  if (name.startsWith(pensionDB)) {
    return pensionDB;
  }
  if (name.startsWith(pensionPrefix)) {
    return pensionPrefix;
  }
  if (name.startsWith(moveTaxFreePart)) {
    return moveTaxFreePart;
  }
  if (name.startsWith(crystallizedPension)) {
    return crystallizedPension;
  }
  if (name.startsWith(transferCrystallizedPension)) {
    return transferCrystallizedPension;
  }
  if (name.endsWith(bondInvest)) {
    return bondInvest;
  }
  if (name.endsWith(bondMature)) {
    return bondMature;
  }
  if (name.endsWith(taxablePart)) {
    return taxablePart;
  }
    if (name.endsWith(taxFreePart)) {
    return taxFreePart;
  }
  let durationEnding = "";
  if (name.endsWith("5y")) {
    durationEnding = "5y";
  } else if (name.endsWith("4y")) {
    durationEnding = "4y";
  } else if (name.endsWith("3y")) {
    durationEnding = "3y";
  } else if (name.endsWith("2y")) {
    durationEnding = "2y";
  } else if (name.endsWith("1y")) {
    durationEnding = "1y";
  } else if (name.endsWith("1m")) {
    durationEnding = "1m";
  }

  if (durationEnding !== "") {
    // this might be a bond investment - take care!
    const sourceTransaction = model.transactions.find((t) => {
      if (!t.NAME.endsWith(durationEnding)) {
        return false;
      }
      // there is an investment with this duration
      return true;
    });
    if (sourceTransaction === undefined) {
      return "";
    }
    // I can rename this but I msut ensure same duration
    return durationEnding;
  }
  // account for date algebra with settings
  const matchingTrigger = model.triggers.find((t) => {
    return t.NAME === name;
  });
  // log(`check for trigger with name ${name}`);
  if (matchingTrigger !== undefined) {
    if (hasDependentDate(matchingTrigger, model)) {
      return `${matchingTrigger.NAME} in date algebra`;
    }
  }
  return "";
}

export function checkForWordClashInModel(
  model: ModelData,
  replacement: string,
  messageWord: string,
): string {
  const settingMessages = model.settings
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Setting '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.VALUE, replacement, model)) {
        return (
          `Setting '${obj.NAME}' has ` +
          `value ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const triggerMessages = model.triggers
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Trigger '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const assetMessages = model.assets
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.START, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `start ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.VALUE, replacement, model)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `value ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.QUANTITY, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `quantity ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `growth ${messageWord} called ${replacement}`
        );
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `liability ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.PURCHASE_PRICE, replacement, model)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `purchase price ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return (
          `Asset '${obj.NAME}' has ` +
          `category ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const incomeMessages = model.incomes
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.START, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `start ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.END, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `end ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.VALUE, replacement, model)) {
        return (
          `Income '${obj.NAME}' has ` +
          `value ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `value set ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.GROWTH ?? "0", replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `growth ${messageWord} called ${replacement}`
        );
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `liability ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return (
          `Income '${obj.NAME}' has ` +
          `category ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const expenseMessages = model.expenses
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `category ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.START, replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `start ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.END, replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `end ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.VALUE, replacement, model)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `value ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `value set ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.GROWTH ?? "0", replacement)) {
        return (
          `Expense '${obj.NAME}' has ` +
          `growth ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const transactionMessages = model.transactions
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `name ${messageWord} called ${replacement}`
        );
      }
      if (usesSeparatedString(obj.FROM, replacement)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `from ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.FROM_VALUE, replacement, model)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `from value ${messageWord} called ${replacement}`
        );
      }
      if (usesSeparatedString(obj.TO, replacement)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `to ${messageWord} called ${replacement}`
        );
      }
      if (usesNumberValueWord(obj.TO_VALUE, replacement, model)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `to value ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.DATE, replacement)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `date ${messageWord} called ${replacement}`
        );
      }
      if (usesWholeWord(obj.STOP_DATE, replacement)) {
        return (
          `Transaction '${obj.NAME}' has ` +
          `stop date ${messageWord} called ${replacement}`
        );
      }
      return "";
    })
    .filter((obj) => {
      return obj.length > 0;
    });
    const generatornMessages = model.generators
    .map((obj) => {
      return Object.keys(obj.DETAILS).map((k) => {
        if (usesWholeWord(obj.DETAILS[k], replacement)) {
          return (
            `Generator '${obj.NAME}' has ` +
            `details ${k} ${messageWord} called ${replacement}`
          );
        } else {
          return '';
        }
      }).filter((obj) => {
        return obj.length > 0;
      });
    }).filter((obj) => {
      return obj.length > 0;
    });
  let message =
    `${settingMessages} ${triggerMessages} ${assetMessages} ` +
    `${incomeMessages} ${expenseMessages} ${transactionMessages} ${generatornMessages}`;
  if (message.length <= 7) {
    message = "";
  }
  return message;
}

export function replaceNumberValueString(
  value: string,
  old: string,
  replacement: string,
  model?: ModelData,
): string {
  const expr = parseNumericExpression(value);
  if (expr !== undefined) {
    let rebuilt = replaceNumberValueString(
      expr.terms[0],
      old,
      replacement,
      model,
    );
    for (let i = 0; i < expr.ops.length; i += 1) {
      rebuilt += `${expr.ops[i]}${replaceNumberValueString(
        expr.terms[i + 1],
        old,
        replacement,
        model,
      )}`;
    }
    return rebuilt;
  }
  const parsed = getNumberAndWordParts(value);
  if (parsed.wordPart === "") {
    return value;
  }
  if (parsed.wordPart === old) {
    return value.substring(0, value.length - old.length) + replacement;
  }
  if (model !== undefined) {
    const split = splitScaledValueSuffix(
      parsed.wordPart,
      modelSettingNamesLongestFirst(model),
      modelAssetNames(model),
    );
    if (split?.baseWord === old) {
      const newWordPart = replacement + split.suffixSetting;
      const numberPrefix =
        parsed.numberPart !== undefined ? String(parsed.numberPart) : "";
      return numberPrefix + newWordPart;
    }
  }
  return value;
}

export function replaceSeparatedString(
  value: string,
  old: string,
  replacement: string,
) {
  const parts = value.split(separator);
  let result = "";
  parts.forEach((obj) => {
    if (obj === old) {
      result += replacement;
    } else {
      result += obj;
    }
    result += separator;
  });
  result = result.substr(0, result.length - separator.length);
  return result;
}

export function replaceWholeString(
  value: string,
  old: string,
  replacement: string,
) {
  if (value !== old) {
    return value;
  } else {
    return replacement;
  }
}

export function getDisplayName(obj: string, type: string) {
  // log(`obj = ${obj}`);
  let result: string;
  if (
    (type === liquidateAsset ||
      type === payOffDebt ||
      type === investExcessCash) &&
    obj.startsWith(conditional)
  ) {
    result = obj.substring(conditional.length);
  } else if (
    (type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc ||
      type === revalueSetting) &&
    obj.startsWith(revalue)
  ) {
    result = obj.substring(revalue.length);
    //if (result.startsWith(' ')) {
    //  alert(`revalue starts with a space '${result}'`);
    //}
  } else {
    result = obj;
  }
  // log(`display ${result}`);
  return result;
}
