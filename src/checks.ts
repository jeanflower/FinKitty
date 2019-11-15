import { evaluationType } from './evaluations';
import {
  allItems,
  annually,
  assetChartAdditions,
  assetChartDeltas,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  cgt,
  coarse,
  conditional,
  cpi,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  incomeTax,
  monthly,
  nationalInsurance,
  pension,
  revalue,
  roiEnd,
  roiStart,
  separator,
  assetChartFocus,
  viewDetail,
  viewFrequency,
  taxPot,
} from './stringConstants';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  Evaluation,
} from './types/interfaces';
import {
  checkTriggerDate,
  getSettings,
  getTriggerDate,
  log,
  showObj,
} from './utils';

function checkTransactionWords(
  name: string,
  word: string,
  date: string,
  triggers: DbTrigger[],
  assets: DbAsset[],
  incomes: DbIncome[],
) {
  // log(`date for check = ${getTriggerDate(date, triggers)}`);
  const a = assets.find(
    as =>
      as.NAME === word &&
      getTriggerDate(as.START, triggers) <=
        getTriggerDate(date, triggers),
  );
  if (a !== undefined) {
    return true;
  }

  // maybe t.FROM is the name of an income
  let i = incomes.find(
    is =>
      is.NAME === word &&
      getTriggerDate(is.START, triggers) <= getTriggerDate(date, triggers),
  );
  if (i !== undefined) {
    // the word is an income
    // this only happens for transactions called Pension*
    if (!name.startsWith(pension)) {
      log(`Transaction ${name} from income
        ${word} must be pension-related`);
      return false;
    }
    return true;
  }

  // maybe t.FROM is an income liability
  i = incomes.find(
    is =>
      is.LIABILITY.includes(word) &&
      getTriggerDate(is.START, triggers) <= getTriggerDate(date, triggers),
  );
  if (i !== undefined) {
    // the word is an income liability
    return true;
  }

  return false;
}
function checkDate(d: Date) {
  // log(`checking date ${d}`);
  if (
    Number.isNaN(d.getTime()) ||
    d < new Date('1 Jan 1870') ||
    d > new Date('1 Jan 2199')
  ) {
    return false;
  }
  return true;
}
export function checkAssetLiability(l: string) {
  if (l.length > 0 && !l.startsWith(cgt) && !l.startsWith(incomeTax)) {
    return `Asset liability ${l} should start with ${cgt} or ${incomeTax}`;
  }
  return '';
}
export function checkAsset(a: DbAsset, model: DbModelData): string {
  // log(`checkAsset ${showObj(a)}`);
  if (a.NAME.length === 0) {
    return 'Asset name needs some characters';
  }
  if (a.NAME.split(separator).length !== 1) {
    return `Asset name '${a.NAME}' should not contain '${separator}'`;
  }
  if (a.LIABILITY.length > 0) {
    if (a.LIABILITY.includes(separator)) {
      return `Unexpected multiple asset liabilities for ${a.LIABILITY}`;
    }
    const x = checkAssetLiability(a.LIABILITY);
    if (x.length > 0) {
      return x;
    }
  }

  if (Number.isNaN(parseFloat(a.GROWTH))) {
    const settingVal = getSettings(model.settings, a.GROWTH, 'missing');
    if (settingVal === 'missing') {
      return `Asset growth set to '${a.GROWTH}'
        but no corresponding setting found`;
    }
    if (Number.isNaN(parseFloat(settingVal))) {
      return `Asset growth set to '${a.GROWTH}'
        but corresponding setting not a number`;
    }
  }

  if (Number.isNaN(parseFloat(a.VALUE))) {
    return `Asset value '${a.VALUE}' is not a number`;
  }

  if (Number.isNaN(parseFloat(a.PURCHASE_PRICE))) {
    return `Asset purchase price '${a.PURCHASE_PRICE}'
      is not a number`;
  }

  const d = checkTriggerDate(a.START, model.triggers);
  if (d === undefined || !checkDate(d)) {
    return `Asset start date doesn't make sense :
      ${showObj(a.START)}`;
  }
  return '';
}

export function checkIncomeLiability(l: string) {
  if (
    l.length > 0 &&
    !l.startsWith(incomeTax) &&
    !l.startsWith(nationalInsurance)
  ) {
    return (
      `Income liability '${l}' should begin with ` +
      `'${incomeTax}' or '${nationalInsurance}'`
    );
  }
  return '';
}
export function checkIncome(i: DbIncome, model: DbModelData): string {
  if (i.NAME.length === 0) {
    return 'Income name needs some characters';
  }
  // log(`checking ${showObj(i)}`);
  const parts = i.LIABILITY.split(separator);
  for (const l of parts) {
    /* eslint-disable-line no-restricted-syntax */
    if (
      l.length > 0 &&
      !l.startsWith(incomeTax) &&
      !l.startsWith(nationalInsurance)
    ) {
      const x = checkIncomeLiability(l);
      if (x.length > 0) {
        return (
          `Income liability for '${i.NAME}' has parts '${parts}' ` +
          `but the part '${l}' should begin with ` +
          `'${incomeTax}' or '${nationalInsurance}'`
        );
      }
    }
  }
  if (Number.isNaN(parseFloat(i.VALUE))) {
    return `Income value '${i.VALUE}' is not a number`;
  }
  if (Number.isNaN(parseFloat(i.GROWTH))) {
    return `Income growth '${i.GROWTH}' is not a number`;
  }
  const startDate = checkTriggerDate(i.START, model.triggers);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Income start date doesn't make sense : ${showObj(i.START)}`;
  }
  const valueSetDate = checkTriggerDate(i.VALUE_SET, model.triggers);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Income value set date doesn't make sense : ${showObj(i.VALUE_SET)}`;
  }
  const endDate = checkTriggerDate(i.END, model.triggers);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Income end date doesn't make sense : ${showObj(i.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Income value must be set on or before the start of the income.
      Here, start is ${startDate.toDateString()} and
      value is set ${valueSetDate.toDateString()}.`;
  }
  if (startDate > endDate) {
    return `Income start must be set on or before the end of the income.
      Here, start is ${startDate.toDateString()} and
      end is ${endDate.toDateString()}.`;
  }
  return '';
}

export function checkExpense(e: DbExpense, model: DbModelData): string {
  if (e.NAME.length === 0) {
    return 'Expense name needs some characters';
  }
  if (Number.isNaN(parseFloat(e.VALUE))) {
    return `Expense value '${e.VALUE}' is not a number`;
  }
  if (Number.isNaN(parseFloat(e.GROWTH))) {
    return `Expense growth '${e.GROWTH}' is not a number`;
  }
  let d = checkTriggerDate(e.START, model.triggers);
  if (d === undefined || !checkDate(d)) {
    return `Expense start date doesn't make sense :
      ${showObj(e.START)}`;
  }
  d = checkTriggerDate(e.VALUE_SET, model.triggers);
  if (d === undefined || !checkDate(d)) {
    return `Expense value set date doesn't make sense :
      ${showObj(e.VALUE_SET)}`;
  }
  d = checkTriggerDate(e.END, model.triggers);
  if (d === undefined || !checkDate(d)) {
    return `Expense end date doesn't make sense :
      ${showObj(e.END)}`;
  }
  return '';
}
export function checkTransaction(t: DbTransaction, model: DbModelData): string {
  // log(`checking transaction ${showObj(t)}`);
  const { assets, incomes, expenses, triggers } = model;
  const assetsForChecking = assets.filter(a => a.NAME !== taxPot);
  if (t.NAME.length === 0) {
    return 'Transaction name needs some characters';
  }
  const d = checkTriggerDate(t.DATE, triggers);
  if (d === undefined || !checkDate(d)) {
    return `Transaction has bad date : ${showObj(t.DATE)}`;
  }
  // log(`transaction date ${getTriggerDate(t.DATE, triggers)}`);
  if (t.FROM !== '') {
    if (
      !checkTransactionWords(
        t.NAME,
        t.FROM,
        t.DATE,
        triggers,
        assetsForChecking,
        incomes,
      )
    ) {
      // log(`split up t.FROM ${t.FROM}`);
      const words = t.FROM.split(separator);
      // log(`words ${showObj(words)}`);
      const arrayLength = words.length;
      for (let i = 0; i < arrayLength; i += 1) {
        const word = words[i];
        // log(`word to check is ${word}`);
        if (
          !checkTransactionWords(
            t.NAME,
            word,
            t.DATE,
            triggers,
            assetsForChecking,
            incomes,
          )
        ) {
          // flag a problem
          return (
            'Transaction from unrecognised asset (could ' +
            `be typo or before asset start date?) : ${showObj(word)}`
          );
        }
      }
    }
    if (t.FROM_VALUE === '') {
      return `Transaction from ${t.FROM} needs a non-empty from value`;
    } else if (Number.isNaN(parseFloat(t.FROM_VALUE))) {
      return `Transaction from value ${t.FROM_VALUE} isn't a number`;
    }
  }
  if (t.TO !== '') {
    const a = assetsForChecking.find(as => as.NAME === t.TO);
    if (a === undefined) {
      // not an asset
      // maybe the transaction is a Revalue?
      if (t.NAME.startsWith(revalue)) {
        // revalue an income?
        const i = incomes.find(ic => ic.NAME === t.TO);
        if (i === undefined) {
          // revalue an expense?
          const exp = expenses.find(e => e.NAME === t.TO);
          if (exp === undefined) {
            return `Transaction to unrecognised asset : ${t.TO}`;
          }
          // transacting on an expense - check dates
          if (
            getTriggerDate(exp.START, triggers) >
            getTriggerDate(t.DATE, triggers)
          ) {
            return (
              `Transaction ${t.NAME} dated before start ` +
              `of affected expense : ${exp.NAME}`
            );
          }
        } else {
          // transacting on an income - check dates
          if (
            getTriggerDate(i.START, triggers) >
            getTriggerDate(t.DATE, triggers)
          ) {
            return (
              `Transaction ${t.NAME} dated before start ` +
              `of affected income : ${i.NAME}`
            );
          }
        }
      } else {
        return `Transaction to unrecognised asset : ${t.TO}`;
      }
    } else if (
      getTriggerDate(a.START, triggers) >
      getTriggerDate(t.DATE, triggers)
    ) {
      return `Transaction dated before to asset : ${t.TO}`;
    }
    // log(`to asset starts ${getTriggerDate(a.ASSET_START, triggers)}`);
    if (t.TO_VALUE === '') {
      return `Transaction to ${t.TO} needs a non-empty to value`;
    } else if (Number.isNaN(parseFloat(t.TO_VALUE))) {
      return `Transaction to value ${t.TO_VALUE} isn't a number`;
    }
  }

  const tToValue = parseFloat(t.TO_VALUE);
  if (t.NAME.startsWith(conditional)) {
    if (
      !t.FROM_ABSOLUTE &&
      (t.TO_ABSOLUTE || tToValue !== 1.0)
    ) {
      log(`WARNING : unexpected stopping condition implemented for ${t.NAME}`);
    }
  }

  const tFromValue = parseFloat(t.FROM_VALUE);
  // log(`transaction ${showObj(t)} appears OK`);
  if (!t.FROM_ABSOLUTE && tFromValue > 1.0) {
    log(`WARNING : not-absolute value from ${tFromValue} > 1.0`);
  }
  if (
    !t.TO_ABSOLUTE &&
    tToValue > 1.0 &&
    !t.NAME.startsWith(pension)
  ) {
    log(`WARNING : not-absolute value to ${tToValue} > 1.0`);
  }
  return '';
}

export function checkTrigger(t: DbTrigger): string {
  if (t.NAME.length === 0) {
    return 'Trigger name needs some characters';
  }
  if (!checkDate(t.DATE)) {
    return `Your important dats is not valid : ${t.DATE}`;
  }
  return '';
}

function checkViewFrequency(settings: DbSetting[]) {
  const vf = getSettings(settings, viewFrequency, 'noneFound');
  if (vf !== 'noneFound') {
    if (
      vf.substring(0, 5).toLowerCase() !==
        monthly.substring(0, 5).toLowerCase() &&
      vf.substring(0, 6).toLowerCase() !==
        annually.substring(0, 6).toLowerCase()
    ) {
      return (
        `"${viewFrequency}" setting should be "${monthly}" ` +
        `or "${annually}"`
      );
    }
  } else {
    return (
      `"${viewFrequency}" setting should be present ` +
      `(value "${monthly}" or "${annually})"`
    );
  }
  return '';
}
function checkViewDetail(settings: DbSetting[]) {
  const vf = getSettings(settings, viewDetail, 'noneFound');
  if (vf !== 'noneFound') {
    if (
      vf.substring(0, 5).toLowerCase() !==
        coarse.substring(0, 5).toLowerCase() &&
      vf.substring(0, 4).toLowerCase() !== fine.substring(0, 4).toLowerCase()
    ) {
      return `"${viewDetail}" setting should be "${coarse}" or "${fine}"`;
    }
  } else {
    return (
      `"${viewDetail}" setting should be present, ` +
      `(value "${coarse}" or "${fine}")`
    );
  }
  return '';
}
function checkViewROI(settings: DbSetting[]) {
  // log(`check settings ${showObj(settings)}`);
  const start = getSettings(settings, roiStart, 'noneFound');
  if (start === 'noneFound') {
    return `"${roiStart}" should be present in settings (value is a date)`;
  }
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return `Setting "${roiStart}" should be a valid date string (e.g. 1 April 2018)`;
  }
  const end = getSettings(settings, roiEnd, 'noneFound');
  if (end === 'noneFound') {
    return `"${roiEnd}" should be present in settings (value is a date)`;
  }
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return `Setting "${roiEnd}" should be a valid date string (e.g. 1 April 2018)`;
  }
  if (endDate < startDate) {
    return `Setting "${roiEnd}" should be after setting "${roiStart}"`;
  }
  return '';
}

function checkViewType(settings: DbSetting[]): string {
  const type = getSettings(settings, assetChartView, 'noneFound');
  if (type === 'noneFound') {
    return (
      `"${assetChartView}" should be present in settings (value is ` +
      `"${assetChartVal}", "${assetChartAdditions}", ` +
      `"${assetChartReductions}" or "${assetChartDeltas}"`
    );
  }
  if (
    type !== assetChartVal &&
    type !== assetChartAdditions &&
    type !== assetChartReductions &&
    type !== assetChartDeltas
  ) {
    return (
      `"${assetChartView}" in settings should have value ` +
      `"${assetChartVal}", "${assetChartAdditions}", ` +
      `"${assetChartReductions}" or "${assetChartDeltas}"`
    );
  }
  return '';
}
function checkDateOfBirth(settings: DbSetting[]): string {
  const doc = getSettings(settings, birthDate, '');
  if (doc === '') {
    return '';
  }
  const d = new Date(doc);
  if (!checkDate(d)) {
    return 'Date of birth should parse and be reasonable';
  }
  return '';
}
function checkCpi(settings: DbSetting[]): string {
  const stringVal = getSettings(settings, cpi, '');
  const val = parseFloat(stringVal);
  if (Number.isNaN(val)) {
    return 'Setting for CPI should be a number';
  }
  return '';
}
function checkSingleAssetName(model: DbModelData) {
  const val = getSettings(model.settings, assetChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.assets.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${assetChartFocus}' should be '${allItems}'` +
    ` or one of the asset names or one of the asset categories (not ${val})`
  );
}
function checkExpenseChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, expenseChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.expenses.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${expenseChartFocus}' should be '${allItems}'` +
    ` or one of the expense names or one of the expense categories (not ${val})`
  );
}
function checkIncomeChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, incomeChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.incomes.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${incomeChartFocus}' should be '${allItems}'` +
    ` or one of the income names or one of the income categories (not ${val})`
  );
}

export function checkData(model: DbModelData): string {
  // log('checking data...');
  let message = checkViewFrequency(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewDetail(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewROI(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewType(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkDateOfBirth(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkCpi(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkSingleAssetName(model);
  if (message.length > 0) {
    return message;
  }
  message = checkExpenseChartFocus(model);
  if (message.length > 0) {
    return message;
  }
  message = checkIncomeChartFocus(model);
  if (message.length > 0) {
    return message;
  }

  // Any transactions must have date inside
  // the lifetime of relevant assets
  // Don't use forEach because we want to log a bug and
  // return if we meet bad data.

  // linter doesn't like this loop
  //  for (let i = 0; i < transactions.length; i += 1){
  //    const t = transactions[i];
  // ERROR: Expected a 'for-of' loop instead of a 'for'
  // loop with this simple iteration

  // codacy doesn't like this loop
  // iterators/generators require regenerator-runtime,
  // which is too heavyweight for this guide to allow them.
  // Separately, loops should be avoided in favor of array iterations.
  // (no-restricted-syntax)
  for (const t of model.transactions) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTransaction(t, model);
    if (message.length > 0) {
      return message;
    }
  }
  for (const a of model.assets) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkAsset(a, model);
    if (message.length > 0) {
      return message;
    }
  }
  for (const i of model.incomes) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkIncome(i, model);
    if (message.length > 0) {
      return message;
    }
  }
  for (const e of model.expenses) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkExpense(e, model);
    if (message.length > 0) {
      return message;
    }
  }
  for (const t of model.triggers) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTrigger(t);
    if (message.length > 0) {
      return message;
    }
  }
  return '';
}
export function checkEvalnType(
  evaln: Evaluation,
  nameToTypeMap: Map<string, string>,
) {
  // expect 'PurchaseAssetName' as valuation for cgt purposes
  if (evaln.name.startsWith('Purchase')) {
    const evalnType = nameToTypeMap.get(evaln.name.substr(8));
    if (evalnType === evaluationType.asset) {
      // don't process this evaluation
      // it was just logged to track CGT liability
      return;
    }
    if (evalnType === undefined) {
      log(`BUG!! evaluation of an unknown type: ${showObj(evaln)}`);
      return;
    }
    log(`BUG!! Purchase of non-asset? : ${showObj(evaln)}`);
  } else {
    log(`BUG!! evaluation of an unknown type: ${showObj(evaln)}`);
  }
}
