import { checkData, isNumberString } from './checks';
import {
  annually,
  CASH_ASSET_NAME,
  cgt,
  conditional,
  cpi,
  crystallizedPension,
  incomeTax,
  monthly,
  nationalInsurance,
  pension,
  pensionSS,
  revalue,
  roiEnd,
  separator,
  taxPot,
  growth,
  pensionDB,
  pensionTransfer,
  quantity,
  EvaluateAllAssets,
} from '../localization/stringConstants';
import {
  DatedThing,
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  Evaluation,
  Interval,
} from '../types/interfaces';
import {
  getMonthlyGrowth,
  getSettings,
  getTriggerDate,
  log,
  printDebug,
  showObj,
  makeDateFromString,
  getStartQuantity,
  getNumberAndWordParts,
  getTodaysDate,
  removeNumberPart,
} from '../utils';
import { getDisplayName } from '../views/tablePages';

function parseRecurrenceString(recurrence: string) {
  const result = {
    frequency: '', // monthly or annual
    count: 0,
  };
  const l = recurrence.length;
  const lastChar = recurrence.substring(l - 1, l);
  // log(`lastChar of ${recurrence} is ${lastChar}`);
  if (lastChar === 'm') {
    result.frequency = monthly;
  } else if (lastChar === 'y') {
    result.frequency = annually;
  } else {
    log(`BUG!! frequency should be of form 4m or 6y not ${recurrence}`);
  }
  const firstPart = recurrence.substring(0, l - 1);
  // log(`firstPart of ${recurrence} is ${firstPart}`);
  const n = parseFloat(firstPart);
  if (n === undefined || Number.isNaN(n)) {
    log(`BUG!! frequency should be of form 4m or 6y not ${recurrence}`);
  }
  result.count = n;
  return result;
}

export function generateSequenceOfDates(
  roi: Interval,
  frequency: string /* e.g. 1m or 1y */,
  addPreDate = false,
): Date[] {
  const result: Date[] = [];
  const freq = parseRecurrenceString(frequency);

  if (addPreDate) {
    // add a pre-dates before roi
    const preDate = new Date(roi.start);
    if (frequency === '1m') {
      preDate.setMonth(preDate.getMonth() - 1);
    } else if (frequency === '1y') {
      preDate.setFullYear(preDate.getFullYear() - 1);
    } else {
      throw new Error(`BUG : frequency ${frequency} not implemented!`);
    }
    result.push(preDate);
  }

  // now add dates in roi, from start
  let numstepsAdvanced = 0;
  let thisDate = roi.start;
  while (thisDate < roi.end) {
    const newDate: Date = new Date(thisDate);
    result.push(newDate);

    // advance thisDate for the next transaction
    const nextDate = new Date(roi.start);
    numstepsAdvanced += freq.count;
    if (freq.frequency === monthly) {
      // log(`monthly dates for ${frequency}`);
      nextDate.setMonth(nextDate.getMonth() + numstepsAdvanced);
    } else if (freq.frequency === annually) {
      // log(`annual dates for ${frequency}`);
      nextDate.setFullYear(nextDate.getFullYear() + numstepsAdvanced);
    } else {
      throw new Error(`BUG : frequency ${frequency} not understood!`);
    }
    thisDate = nextDate;
  }
  // log(`return ${transactionMoments.length} transactionMoments`)
  return result;
}

export function generateTaxYearSequenceDates(roi: Interval): Date[] {
  const result: Date[] = [];

  let numYearsAdvanced = 0;
  let thisDate = roi.start;
  if (thisDate.getMonth() > 3 || thisDate.getDay() > 5) {
    thisDate.setFullYear(thisDate.getFullYear() + numYearsAdvanced);
  }
  thisDate.setMonth(3);
  thisDate.setDate(5);

  const stopBefore = roi.end;
  stopBefore.setFullYear(stopBefore.getFullYear() + 1);
  while (thisDate < stopBefore) {
    const newDate: Date = new Date(thisDate);
    result.push(newDate);

    // advance thisDate for the next transaction
    numYearsAdvanced += 1;
    const nextDate = new Date(roi.start);
    nextDate.setFullYear(nextDate.getFullYear() + numYearsAdvanced);

    thisDate = nextDate;
  }
  // log(`return ${transactionMoments.length} transactionMoments`)
  return result;
}

export const momentType = {
  expense: 'Expense',
  expenseStart: 'expenseStart',
  income: 'Income',
  incomeStart: 'IncomeStart',
  asset: 'Asset',
  assetStart: 'AssetStart',
  transaction: 'Transaction',
};

export function sortByDate(arrayOfDatedThings: DatedThing[]) {
  if (printDebug()) {
    log('before date sort --------------');
    arrayOfDatedThings.forEach(t => {
      log(`t.name = ${t.name}, ${t.type}, ${t.date}`);
    });
  }
  arrayOfDatedThings.sort((a, b) => {
    const ad = a.date; // getTriggerDate(a.date, triggers);
    const bd = b.date; // getTriggerDate(b.date, triggers);
    let result = 0;

    // the primary sort mechanism is the date
    // look for differences between defined / undefined
    // or both defined and one before the other
    if (ad !== undefined && bd === undefined) {
      result = -1;
    } else if (ad === undefined && bd !== undefined) {
      result = 1;
    } else if (ad !== undefined && bd !== undefined) {
      if (ad < bd) {
        result = 1;
      } else if (ad > bd) {
        result = -1;
      }
    }
    if (result === 0) {
      // dates are equal or both undefined
      // so we need some other way of distinguishing
      // special-case CASH status
      if (b.name === CASH_ASSET_NAME && a.name !== CASH_ASSET_NAME) {
        result = -1;
      } else if (a.name === CASH_ASSET_NAME && b.name !== CASH_ASSET_NAME) {
        result = 1;
      }
    }
    if (result === 0) {
      // dates equal, cash status matches
      // if an asset has started, that's a special case
      if (
        a.type === momentType.assetStart &&
        b.type !== momentType.assetStart
      ) {
        result = 1;
      } else if (
        b.type === momentType.assetStart &&
        a.type !== momentType.assetStart
      ) {
        result = -1;
      }
    }
    if (result === 0) {
      // dates equal, cash status equal, asset-start equal
      // pay attention to whether it's an asset
      if (a.type === momentType.asset && b.type !== momentType.asset) {
        result = 1;
      } else if (b.type === momentType.asset && a.type !== momentType.asset) {
        result = -1;
      }
    }
    if (result === 0) {
      if (
        a.name.startsWith(crystallizedPension) &&
        !b.name.startsWith(crystallizedPension)
      ) {
        return -1;
      } else if (
        !a.name.startsWith(crystallizedPension) &&
        b.name.startsWith(crystallizedPension)
      ) {
        return 1;
      }
    }
    if (result === 0) {
      // dates equal, cash status equal, asset-start equal
      // whether it's an asset is equal
      if (
        printDebug() &&
        a.type !== 'Asset' &&
        a.type !== 'Expense' &&
        a.type !== 'Income'
      ) {
        log(`using names to order moments ${a.name}, ${a.type} and ${b.name}`);
      }
      if (a.name < b.name) {
        result = 1;
      } else if (a.name > b.name) {
        result = -1;
      } else if (a.type < b.type) {
        result = 1;
      } else if (a.type > b.type) {
        result = -1;
      } else {
        result = 0;
      }
    }
    if (result === 0) {
      log(`can't order two moments named ${a.name}`);
    }
    // log(`${showObj(a)} < ${showObj(b)} = ${result}`)
    return result;
  });

  if (printDebug()) {
    log('after date sort --------------');
    arrayOfDatedThings.forEach(t => {
      log(`(name, type, date) = (${t.name}, ${t.type}, ${t.date})`);
    });
  }
}

export const evaluationType = {
  expense: 'Expense',
  income: 'Income',
  asset: 'Asset',
  setting: 'Setting',
};

function getNumberValue(
  values: Map<string, number | string>,
  key: string,
  expectValue = true,
): number | undefined {
  let result = values.get(key);
  // log(`key = '${key}' has value ${result}`);
  if (typeof result === 'string') {
    // log(`value ${result} is a string`);
    if (isNumberString(result)) {
      result = parseFloat(result);
    } else {
      const val = getNumberValue(values, result, expectValue);
      // log(`value ${result} as a number is ${val}`);
      result = val;
    }
  }
  // log(`getNumberValue of ${key} is ${result}`);
  if (result === undefined) {
    if (expectValue) {
      log(
        `getNumberValue returning undefined for ${key}; ` +
          `consider switch to traceEvaluation ` +
          `for values involving words and settings`,
      );
    }
  }
  return result;
}

function traceEvaluation(
  value: number | string,
  values: Map<string, number | string>,
  source: string,
): number | undefined {
  if (printDebug()) {
    log(
      `in traceEvaluation, for ${source} get value of ${value} ` +
        `using ${Array.from(values.keys()).map(k => {
          return `[${k}, ${values.get(k)}]`;
        })}`,
    );
  }
  if (typeof value !== 'string') {
    return value;
  }
  const debug = false;
  if (isNumberString(value)) {
    return parseFloat(value);
  }
  const parts = getNumberAndWordParts(value);
  let numberPart = 1.0;
  if (parts.numberPart !== undefined) {
    numberPart = parts.numberPart;
  }
  const wordPart = parts.wordPart;
  const settingForWordPart = values.get(wordPart);
  if (debug) {
    log(`settingForWordPart ${wordPart} = ${settingForWordPart}`);
  }
  if (settingForWordPart === undefined) {
    if (debug) {
      log(`values were ${showObj(values)}`);
    }
    return undefined;
  } else if (typeof settingForWordPart === 'string') {
    const nextLevel = traceEvaluation(settingForWordPart, values, source);
    if (nextLevel === undefined) {
      if (debug) {
        log(
          `got undefined for ${settingForWordPart} - returning undefined for ${value}`,
        );
      }
      return undefined;
    } else {
      if (debug) {
        log(
          `calculate ${numberPart} * ${nextLevel} = ${numberPart * nextLevel}`,
        );
      }
      return numberPart * nextLevel;
    }
  } else {
    //log(`calculate ${numberPart} * ${settingForWordPart} = ${numberPart * settingForWordPart}`)
    return numberPart * settingForWordPart;
  }
}

function getQuantity(
  w: string,
  values: Map<string, number | string>,
  model: DbModelData,
): undefined | number {
  if (getStartQuantity(w, model) === undefined) {
    // log(`no start quantity for ${w}`);
    return undefined;
  }
  // log(`go to get current quantity for ${w}`);
  const result = getNumberValue(values, quantity + w, false);
  // log(`current quantity for ${w} is ${result}`);
  return result;
}

function applyQuantity(
  value: number,
  values: Map<string, number | string>,
  assetName: string,
  model: DbModelData,
) {
  // log(`apply quantity for ${assetName}, unit val = ${value}`);
  if (value === undefined) {
    return value;
  }
  const q = getQuantity(assetName, values, model);
  if (q === undefined) {
    // log(`quantity for ${assetName} is undefined`);
    return value;
  }
  //log(`quantity for ${assetName} is ${q},`
  //  +` scale up from ${value} to ${value * q}`);
  const result = value * q;
  return result;
}

function setValue(
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  date: Date,
  name: string,
  newValue: number | string,
  model: DbModelData,
  source: string, // something that triggered the new value
) {
  if (name === newValue) {
    log(`BUG??? don't expect value of ${name} = ${newValue}!`);
  }
  if (printDebug()) {
    const existingValue = values.get(name);
    if (existingValue === undefined) {
      log(
        `setting first value of ${name}, ` +
          `newValue = ${newValue} ` +
          `date = ${date.toDateString()}, ` +
          `source = ${source}`,
      );
    } else {
      log(
        `setting value of ${name}, ` +
          `newValue = ${newValue} ` +
          `oldValue = ${existingValue} ` +
          `date = ${date.toDateString()}, ` +
          `source = ${source}`,
      );
    }
  }
  values.set(name, newValue);
  // log(`Go to find unit val for ${name}'s, we have value = some of ${newValue}`);
  const unitVal = traceEvaluation(newValue, values, name);
  // log(`Unit val of ${name} is ${unitVal}`);
  if (unitVal === undefined) {
    log(`Error: evaluation of ${newValue} for ${name} undefined`);
    // throw new Error(`evaluation of ${newValue} for ${name} undefined`);
  } else {
    const totalVal = applyQuantity(unitVal, values, name, model);
    const evaln = {
      name,
      date,
      value: totalVal,
      source,
    };
    // log(`add evaluation for ${name} at ${date}`);
    // log(`add evaluation ${showObj(evaln)}`);
    evaluations.push(evaln);
    if (printDebug()) {
      log(`date = ${date}, name = ${name}, value = ${values.get(name)}`);
    }
    if (printDebug()) {
      for (const key of values.keys()) {
        /* eslint-disable-line no-restricted-syntax */
        log(`values.get(${key}) = ${values.get(key)}`);
      }
    }
  }
}

function diffMonths(d1: Date, d2: Date) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear() - 1) * 12;
  months += 12 - d1.getMonth();
  months += d2.getMonth() - 1;
  if (d1.getDate() <= d2.getDate()) {
    months += 1;
  }
  return months;
}

interface Moment {
  date: Date;
  name: string;
  type: string;
  setValue: number | string | undefined;
  transaction: DbTransaction | undefined;
}

export function getYearOfTaxYear(d: Date) {
  let startYearOfTaxYear;
  if (d.getMonth() > 3) {
    startYearOfTaxYear = d.getFullYear();
  } else if (d.getMonth() < 3) {
    startYearOfTaxYear = d.getFullYear() - 1;
  } else if (d.getDate() > 5) {
    startYearOfTaxYear = d.getFullYear();
  } else {
    startYearOfTaxYear = d.getFullYear() - 1;
  }
  // log(`tax year of ${d} = ${startYearOfTaxYear}`);
  // log(`details: d.getDate() = ${d.getDate()}, `+
  //  `d.getMonth() = ${d.getMonth()}, `+
  //  `d.getFullYear() = ${d.getFullYear()}, `);
  return startYearOfTaxYear;
}

function updateValueForCPI(
  dateSet: Date,
  dateNow: Date,
  origValue: number,
  cpiVal: number,
) {
  const numYears = dateNow.getFullYear() - dateSet.getFullYear();
  // log(`update tax bands after ${numYears} have passed at ${cpiVal} rate`)
  const result = Math.exp(
    Math.log(origValue) + numYears * Math.log(1.0 + cpiVal / 100.0),
  );
  // log(`update tax band from ${origValue} to ${result}`);
  return result;
}

const taxBandsSet = makeDateFromString('April 5 2018');
const noTaxBandSet = 12500;
const lowTaxBandSet = 50000;
const highTaxBandSet = 150000;

function calculateTaxPayable(income: number, d: Date, cpiVal: number) {
  // log(`in calculateTaxPayable`);
  let taxPayable = 0;

  const noTaxBand = updateValueForCPI(taxBandsSet, d, noTaxBandSet, cpiVal);
  const lowTaxBand = updateValueForCPI(taxBandsSet, d, lowTaxBandSet, cpiVal);
  const sizeOfLowTaxBand = lowTaxBand - noTaxBand;
  const highTaxBand = updateValueForCPI(taxBandsSet, d, highTaxBandSet, cpiVal);
  const sizeOfHighTaxBand = highTaxBand - lowTaxBand;

  const lowTaxRate = 0.2;
  const highTaxRate = 0.4;
  const topTaxRate = 0.45;

  // TODO
  // adjust noTaxBand for high incomes

  let incomeInNoTaxBand = 0;
  let incomeInLowTaxBand = 0;
  let incomeInHighTaxBand = 0;
  let incomeInTopTaxBand = 0;

  incomeInNoTaxBand = income;
  // test next band
  incomeInLowTaxBand = incomeInNoTaxBand - noTaxBand;
  // see if we have strayed into next band
  if (incomeInLowTaxBand > 0) {
    // we have some income in low tax band
    // cap income in no tax band
    incomeInNoTaxBand = noTaxBand;
    // test next band
    incomeInHighTaxBand = incomeInLowTaxBand - sizeOfLowTaxBand;
    // see if we have strayed into next band
    if (incomeInHighTaxBand > 0) {
      // we have some income in high tax band
      // cap income in low tax band
      incomeInLowTaxBand = sizeOfLowTaxBand;
      incomeInTopTaxBand = incomeInHighTaxBand - sizeOfHighTaxBand;
      // see if we have strayed into next band
      if (incomeInTopTaxBand > 0) {
        // we have some income in top tax band
        // cap income in high tax band
        incomeInHighTaxBand = sizeOfHighTaxBand;
      } else {
        // income falls into no, low and high tax bands
        incomeInTopTaxBand = 0;
      }
    } else {
      // income falls into no and low tax bands
      incomeInHighTaxBand = 0;
    }
  } else {
    // income falls into no tax band
    incomeInLowTaxBand = 0;
  }
  // log(`${income} = ${incomeInNoTaxBand} + `
  //   + `${incomeInLowTaxBand} + ${incomeInHighTaxBand} + `
  //   + `${incomeInTopTaxBand}`);

  taxPayable =
    lowTaxRate * incomeInLowTaxBand +
    highTaxRate * incomeInHighTaxBand +
    topTaxRate * incomeInTopTaxBand;

  // log(`taxPayable from income ${income} is ${taxPayable}`);
  return taxPayable;
}

const NIBandsSet = makeDateFromString('April 5 2018');
const noNIBandSet = 8628;
const lowNIBandSet = 50004;

function calculateNIPayable(income: number, d: Date, cpiVal: number) {
  // log(`in calculateNIPayable`);
  let NIPayable = 0;

  const noNIBand = updateValueForCPI(NIBandsSet, d, noNIBandSet, cpiVal);
  const lowNIBand = updateValueForCPI(NIBandsSet, d, lowNIBandSet, cpiVal);
  const sizeOfLowNIBand = lowNIBand - noNIBand;

  const lowNIRate = 0.12;
  const highNIRate = 0.02;

  let incomeInNoNIBand = 0;
  let incomeInLowNIBand = 0;
  let incomeInHighNIBand = 0;

  incomeInNoNIBand = income;
  // test next band
  incomeInLowNIBand = incomeInNoNIBand - noNIBand;
  // see if we have strayed into next band
  if (incomeInLowNIBand > 0) {
    // we have some income in low NI band
    // cap income in no NI band
    incomeInNoNIBand = noNIBand;
    // test next band
    incomeInHighNIBand = incomeInLowNIBand - sizeOfLowNIBand;
    // see if we have strayed into next band
    if (incomeInHighNIBand > 0) {
      // we have some income in high tax band
      // cap income in low tax band
      incomeInLowNIBand = sizeOfLowNIBand;
    } else {
      // income falls into no and low tax bands
      incomeInHighNIBand = 0;
    }
  } else {
    // income falls into no tax band
    incomeInLowNIBand = 0;
  }
  // log(`${income} = ${incomeInNoNIBand} + `
  //    + `${incomeInLowNIBand} + ${incomeInHighNIBand}`);

  NIPayable = lowNIRate * incomeInLowNIBand + highNIRate * incomeInHighNIBand;

  // log(`NI = ${lowNIRate * incomeInLowNIBand} + `
  //  + `${highNIRate * incomeInHighNIBand} = ${NIPayable}`);

  // log(`NIPayable from income ${income} is ${NIPayable}`);
  return NIPayable;
}

const CGTBandsSet = makeDateFromString('April 5 2018');
const noCGTBandSet = 12000;

function calculateCGTPayable(gain: number, d: Date, cpiVal: number) {
  // log(`in calculateCGTPayable`);
  const noCGTBand = updateValueForCPI(CGTBandsSet, d, noCGTBandSet, cpiVal);

  const CGTRate = 0.2;
  // TODO - this should depend on whether payer is high income tax payer

  if (gain < noCGTBand) {
    // log(`CGT not payable on ${gain}`);
    return 0.0;
  }

  const payable = CGTRate * (gain - noCGTBand);
  // log(`${payable} due as CGT`);
  return payable;
}

function adjustCash(
  amount: number,
  d: Date,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  source: string, // what led to the change
) {
  const cashValue = getNumberValue(values, CASH_ASSET_NAME, false);
  if (cashValue === undefined) {
    // log('don't adjust undefined cash asset');
    // NB some tests have an expense and watch its value
    // without having a cash asset to decrement
  } else {
    // log('in adjustCash, setValue:');
    setValue(
      values,
      evaluations,
      d,
      CASH_ASSET_NAME,
      cashValue + amount,
      model,
      source,
    );
  }
}

function payIncomeTax(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  source: string, // e.g. IncomeTaxJoe
) {
  // log(`pay income tax on ${income} for date ${startOfTaxYear}`);
  // calculate tax liability
  const taxDue = calculateTaxPayable(income, startOfTaxYear, cpiVal);
  // log(`taxDue for ${source} on ${startOfTaxYear} = ${taxDue}`);
  if (taxDue > 0) {
    // log('in payIncomeTax, adjustCash:');
    adjustCash(-taxDue, startOfTaxYear, values, evaluations, model, source);
    let taxValue = getNumberValue(values, taxPot, false);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log(`setValue on taxPot: ${taxValue + taxDue}`);
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + taxDue,
      model,
      source,
    );
  }
  return taxDue; // for information only - cash already adjusted
}

function payNI(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  source: string, // e.g. NIJoe
) {
  // log(`pay NI on ${income} for date ${startOfTaxYear}`);
  // calculate NI liability
  const NIDue = calculateNIPayable(income, startOfTaxYear, cpiVal);
  // log(`taxDue = ${taxDue}`);
  if (NIDue > 0) {
    // log('in payNI, adjustCash:');
    adjustCash(-NIDue, startOfTaxYear, values, evaluations, model, source);

    let taxValue = getNumberValue(values, taxPot, false);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log(`setValue on taxPot: ${taxValue + NIDue}`);
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + NIDue,
      model,
      source,
    );
  }
  return NIDue; // just for information
}

function payCGT(
  startOfTaxYear: Date,
  gain: number,
  cpiVal: number,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  source: string, // e.g. 'CGTJoe'
) {
  // log(`pay CGT on ${gain} for date ${startOfTaxYear}`);
  // calculate CGT liability
  // TODO should pass in whether high rate income tax next
  const CGTDue = calculateCGTPayable(gain, startOfTaxYear, cpiVal);
  // log(`taxDue = ${taxDue}`);
  if (CGTDue > 0) {
    // log('in payCGT, adjustCash:');
    adjustCash(-CGTDue, startOfTaxYear, values, evaluations, model, source);
    let taxValue = getNumberValue(values, taxPot, false);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log(`setValue on taxPot: ${taxValue + CGTDue}`);
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + CGTDue,
      model,
      source,
    );
  }
}
function OptimizeIncomeTax(
  date: Date,
  cpiVal: number,
  amount: number,
  values: Map<string, number | string>,
  person: string,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  evaluations: Evaluation[],
  model: DbModelData,
) {
  // log(`settle up income tax for ${person} and ${amount} on ${date}`);
  const noTaxBand = updateValueForCPI(taxBandsSet, date, noTaxBandSet, cpiVal);
  if (amount > noTaxBand) {
    return;
  }
  const unusedAllowance = noTaxBand - amount;
  // if we have unused allowance, see
  // have we got some crystallised pension we can use?
  for (const valueKey of values.keys()) {
    /* eslint-disable-line no-restricted-syntax */
    // log(`valueKey = ${valueKey}`);
    if (valueKey.startsWith(crystallizedPension)) {
      // is it for the right person?
      const liability = `${valueKey.substr(
        crystallizedPension.length,
      )}${incomeTax}`;
      // e.g. IncomeTaxJoe
      // log(`liability = ${liability}`);
      if (liability === person) {
        let amountToTransfer = unusedAllowance;
        const pensionVal = getNumberValue(values, valueKey);
        if (pensionVal === undefined) {
          log('BUG!!! pension has no value');
          return;
        }
        if (amountToTransfer > pensionVal) {
          amountToTransfer = pensionVal;
        }
        // log(`to use allowance, on ${date}, '
        //  +'move ${amountToTransfer} from ${valueKey}`);
        const personAmountMap = liableIncomeInTaxYear.get(incomeTax);
        if (personAmountMap === undefined) {
          log('BUG!!! person has no liability');
          return;
        }
        const cashVal = getNumberValue(values, CASH_ASSET_NAME);
        if (cashVal === undefined) {
          log('BUG!!! cash has no value');
        } else {
          personAmountMap.set(person, amount + amountToTransfer);

          // log(`valueKey = ${valueKey}`);
          // log(`liability = ${liability}`);
          // log('in settleIncomeTax, setValue:');
          setValue(
            values,
            evaluations,
            date,
            CASH_ASSET_NAME,
            cashVal + amountToTransfer,
            model,
            valueKey,
          ); // e.g. 'CrystallizedPensionNorwich'
          setValue(
            values,
            evaluations,
            date,
            valueKey,
            pensionVal - amountToTransfer,
            model,
            liability,
          ); // e.g. 'IncomeTaxJoe'
        }
      }
    }
  }
}

const doOptimizeForIncomeTax = true;

function settleUpTax(
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  startYearOfTaxYear: number,
  cpiVal: number,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
) {
  const date = new Date(startYearOfTaxYear + 1, 3, 5);
  // before going to pay income tax,
  // see if there's a wise move to use up unused income tax allowance
  // for each person
  for (const [key, value] of liableIncomeInTaxYear) {
    /* eslint-disable-line no-restricted-syntax */
    if (key === incomeTax && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        if (doOptimizeForIncomeTax) {
          OptimizeIncomeTax(
            date,
            cpiVal,
            amount,
            values,
            person,
            liableIncomeInTaxYear,
            evaluations,
            model,
          );
        }
      }
    }
  }

  for (const [key, value] of liableIncomeInTaxYear) {
    /* eslint-disable-line no-restricted-syntax */
    if (key === incomeTax && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        // log(`go to pay income tax for ${person}, amount = ${amount} for ${date}`);
        const taxPaid = payIncomeTax(
          date,
          amount,
          cpiVal,
          values,
          evaluations,
          model,
          person, // e.g. IncomeTaxJoe
        );
        if (printDebug()) {
          log(`${person} paid income tax ${taxPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    } else if (key === nationalInsurance && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        const NIPaid = payNI(
          new Date(startYearOfTaxYear + 1, 3, 5),
          amount,
          cpiVal,
          values,
          evaluations,
          model,
          person,
        ); // e.g. 'NIJoe'
        if (printDebug()) {
          log(`${person} paid NI ${NIPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    } else if (key === 'cgt' && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        payCGT(
          new Date(startYearOfTaxYear + 1, 3, 5),
          amount,
          cpiVal,
          values,
          evaluations,
          model,
          person,
        ); // e.g. 'CGTJoe'
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    }
  }
}

function handleLiability(
  liability: string,
  type: string, // "income" or "NI"
  incomeValue: number,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  let map = liableIncomeInTaxYear.get(type);
  if (map === undefined) {
    // set up a map to collect accumulations for type
    liableIncomeInTaxYear.set(type, new Map<string, number>());
    map = liableIncomeInTaxYear.get(type);
  }
  if (map !== undefined) {
    // log this amount in the accumulating total
    let taxLiability = map.get(liability);
    if (taxLiability === undefined) {
      taxLiability = 0;
    }
    // log(`${liability} accumulate ${incomeValue} into ${taxLiability}`);
    const newLiability = taxLiability + incomeValue;
    map.set(liability, newLiability);
    // log(`${type} accumulated ${liability} liability = ${newLiability}`);
  }
}

function handleIncome(
  incomeValue: number,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  pensionTransactions: DbTransaction[],
  liabilitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  sourceDescription: string,
) {
  // log(`handle income value = ${incomeValue}`);
  const triggers = model.triggers;

  // log(`handle income for moment ${moment.name}`);

  if (moment.name.startsWith(pensionDB)) {
    // This type of income has moments which fall before the
    // income start date; allowing for other actions to
    // influence its value
    const income = model.incomes.find(i => {
      return i.NAME === moment.name;
    });
    if (income === undefined) {
      throw new Error(`income ${moment.name} not found in model`);
    }
    const incomeStartDate = getTriggerDate(income.START, triggers);
    // log(`income start is ${incomeStartDate}, moment date is ${moment.date}`);
    if (incomeStartDate > moment.date) {
      // log(`skip income ${income.NAME} at moment ${moment.name}`);
      // don't receive this income yet!
      return;
    }
  }

  // default income increment is all of the income
  let amountForCashIncrement = incomeValue;
  let amountForIncomeTax = incomeValue;
  let amountForNI = incomeValue;
  // some types of pension scheme reduce NI liability

  if (moment.type === momentType.asset) {
    // asset growth does not transfer money into cash
    amountForCashIncrement = 0;
  }

  // when we receive income
  // the amount paid to cash is sometimes
  // reduced to account for pension contributions
  // and it sometimes adjusts defined contributions pension asset
  // and it sometimes adjusts defined benefits pension benefit
  pensionTransactions.forEach(transaction => {
    const tFromValue = parseFloat(transaction.FROM_VALUE);
    const tToValue = parseFloat(transaction.TO_VALUE);

    // log(`pension transaction ${transaction.NAME}`)

    if (getTriggerDate(transaction.DATE, triggers) > moment.date) {
      return;
    }
    // log(`see if ${showObj(transaction)} should affect `
    //  +`this handleIncome moment ${showObj(moment)}`);
    if (moment.name === transaction.FROM) {
      // log(`matched transaction ${showObj(transaction)}`);

      let amountFrom = 0.0;
      if (transaction.FROM_ABSOLUTE) {
        amountFrom = tFromValue;
      } else {
        // e.g. employee chooses 5% pension contribution
        amountFrom = tFromValue * incomeValue;
        // log(`amountFrom = ${tFromValue} * ${incomeValue}`);
      }

      if (!transaction.NAME.startsWith(pensionDB)) {
        // a Defined Benefits Pension
        // has two transactions
        // - one flagged as pension (or pensionSS)
        //   which will decrease cash Increment etc
        // - another flagged as pensionDB
        // whose purpose is solely to setValue on the
        // target benefit
        amountForCashIncrement -= amountFrom;
        amountForIncomeTax -= amountFrom;

        if (transaction.NAME.startsWith(pensionSS)) {
          amountForNI -= amountFrom;
        }
      }

      let amountForPension = 0;
      if (transaction.TO_ABSOLUTE) {
        amountForPension = tToValue;
      } else {
        // e.g. employer increments employee's pension contribution
        amountForPension = tToValue * amountFrom;
      }
      let pensionValue = getNumberValue(values, transaction.TO, false);
      if (transaction.TO === '') {
        if (printDebug()) {
          log('pension contributions going into void');
        }
      } else if (pensionValue === undefined) {
        log('BUG : contributing to undefined pension scheme');
      } else {
        // log(`old pensionValue is ${pensionValue}`);
        pensionValue += amountForPension;
        // log(`new pensionValue is ${pensionValue}`);
        // log(`income source = ${transaction.NAME}`);
        // log('in handleIncome:');
        setValue(
          values,
          evaluations,
          moment.date,
          transaction.TO,
          pensionValue,
          model,
          transaction.NAME,
        );
      }
    }
  });

  // pay income into cash
  if (amountForCashIncrement > 0) {
    // log(`cash source = ${sourceDescription}`);
    // log('in handleIncome, adjustCash:');
    adjustCash(
      amountForCashIncrement,
      moment.date,
      values,
      evaluations,
      model,
      sourceDescription,
    );
  }

  // log(`look for ${moment.name+sourceDescription} in liabilitiesMap`);
  let liabilityList = liabilitiesMap.get(moment.name + sourceDescription); // e.g. "IncomeTaxJoe, NIJoe"
  if (liabilityList === undefined) {
    liabilityList = liabilitiesMap.get(moment.name);
  }
  // log(`for ${moment.name+sourceDescription}, liabilityList = ${liabilityList}`);
  if (liabilityList !== undefined) {
    const words: string[] = liabilityList.split(separator);
    words.forEach(liability => {
      // log(`liability = ${liability}`);
      if (liability.endsWith(incomeTax)) {
        // log(`IncomeTax due on ${amountForIncomeTax} for ${liability}, ${moment.name+sourceDescription}`);
        handleLiability(
          liability,
          incomeTax,
          amountForIncomeTax,
          liableIncomeInTaxYear,
        );
      }
      if (liability.endsWith(nationalInsurance)) {
        // log(`NI moment is ${showObj(moment.name)} amount ${amountForNI}`);
        handleLiability(
          liability,
          nationalInsurance,
          amountForNI,
          liableIncomeInTaxYear,
        );
      }
    });
  }
}

function logExpenseGrowth(
  expense: DbExpense,
  cpiVal: number,
  growths: Map<string, number>,
) {
  const expenseGrowth = parseFloat(expense.GROWTH);
  const monthlyInf = expense.CPI_IMMUNE
    ? getMonthlyGrowth(expenseGrowth)
    : getMonthlyGrowth(expenseGrowth + cpiVal);
  growths.set(expense.NAME, monthlyInf);
}

function logIncomeGrowth(
  income: DbIncome,
  cpiVal: number,
  growths: Map<string, number>,
) {
  const incomeGrowth = parseFloat(income.GROWTH);
  const monthlyInf = income.CPI_IMMUNE
    ? getMonthlyGrowth(incomeGrowth)
    : getMonthlyGrowth(incomeGrowth + cpiVal);
  // log(`for ${income.NAME}, monthly infl is ${monthlyInf}`);
  growths.set(income.NAME, monthlyInf);
}

function logAssetGrowth(
  asset: DbAsset,
  cpiVal: number,
  growths: Map<string, number>,
  settings: DbSetting[],
) {
  // log(`stored growth is ${asset.GROWTH}`);
  let growth: number = parseFloat(asset.GROWTH);
  // log(`growth is ${growth}`);
  if (Number.isNaN(growth)) {
    // log(`growth is recognised as NaN`);
    let settingVal = getSettings(settings, asset.GROWTH, 'None');
    // log(`setting value for ${asset.GROWTH} is ${settingVal}`);
    if (settingVal === 'None') {
      log(`BUG : no setting value for asset growth ${asset.GROWTH}`);
      settingVal = '0.0';
    }
    growth = parseFloat(settingVal);
    if (Number.isNaN(growth)) {
      if (settingVal === 'None') {
        log(
          'BUG : cant parse setting value for asset growth ' +
            `${asset.GROWTH} = ${settingVal}`,
        );
        growth = 0.0;
      }
    }
  } else {
    // log(`growth is not recognised as a NaN - assume parseFloat gave something useful`);
  }
  // log(`annual growth before cpi adjustment is ${growth}`);
  const monthlyInf = asset.CPI_IMMUNE
    ? getMonthlyGrowth(growth)
    : getMonthlyGrowth(growth + cpiVal);
  // log(`monthly growth is ${monthlyInf}`);
  growths.set(asset.NAME, monthlyInf);
}

function logAssetValueString(
  assetVal: string,
  assetStart: string,
  assetName: string,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  level = 1,
): boolean {
  const debug = false;
  if (debug) {
    log(
      `level${level}: logAssetValueString processing ${assetVal} as value of ${assetName}`,
    );
  }
  if (isNumberString(assetVal)) {
    // log(`${assetVal} is a number string`);
    return true;
  }

  if (debug) {
    // log(`look for a value of ${assetVal} in the settings`);
  }
  const settingVal: string | number = getSettings(
    model.settings,
    assetVal,
    'missing',
    false,
  );
  let parsedOK = false;
  if (settingVal === 'missing') {
    if (debug) {
      // log(`there's no setting for ${assetVal}`);
    }
    const wordPart = removeNumberPart(assetVal);
    if (wordPart !== undefined) {
      if (debug) {
        log(`level${level}: go do work on ${wordPart} instead`);
      }
      parsedOK = logAssetValueString(
        wordPart,
        assetStart,
        wordPart,
        values,
        evaluations,
        model,
        level + 1,
      );
    } else {
      if (debug) {
        log(
          `level${level}: we can't remove any number part of ${assetVal}, give up`,
        );
      }
      parsedOK = false;
    }
  } else {
    if (debug) {
      log(
        `level${level}: we found ${assetVal} as a setting with value ${settingVal}`,
      );
    }
    if (isNumberString(settingVal)) {
      if (debug) {
        log(
          `level${level}: go set the value of ${assetVal} as number ${parseFloat(
            settingVal,
          )}`,
        );
      }
      setValue(
        values,
        evaluations,
        getTriggerDate(assetStart, model.triggers),
        assetVal,
        parseFloat(settingVal),
        model,
        assetName,
      );
      if (debug) {
        log(`level${level}: return true`);
      }
      return true;
    } else {
      if (debug) {
        log(
          `level${level}: go parse the value of ${settingVal}` +
            ` as a setting as a value definition`,
        );
      }
      parsedOK = logAssetValueString(
        settingVal,
        assetStart,
        assetVal,
        values,
        evaluations,
        model,
        level + 1,
      );
    }
  }
  if (parsedOK && level > 1) {
    if (assetName !== assetVal) {
      if (debug) {
        log(`level${level}: go set the value of ${assetName} as ${assetVal}`);
      }
      setValue(
        values,
        evaluations,
        getTriggerDate(assetStart, model.triggers),
        assetName,
        assetVal,
        model,
        assetName,
      );
    }

    if (debug) {
      log(`level${level}: return true`);
    }
    return true;
  } else {
    if (debug) {
      log(`level${level}: return false`);
    }
    return false;
  }
}

function getGrowth(name: string, growths: Map<string, number>) {
  let result = growths.get(name);
  if (result === undefined) {
    log(`Bug : Undefined growth value for ${name}!`);
    result = 0.0;
  }
  // log(`growth for ${name} is ${result}`);
  return result;
}

function getRecurrentMoments(
  x: {
    // could be an income or an expense
    NAME: string;
    START: string; // trigger string
    END: string; // trigger string
    VALUE: string;
    VALUE_SET: string; // trigger string
  },
  type: string,
  monthlyInf: number,
  triggers: DbTrigger[],
  rOIStartDate: Date,
  rOIEndDate: Date,
  recurrence: string,
) {
  let endDate = getTriggerDate(x.END, triggers);
  if (rOIEndDate < endDate) {
    endDate = rOIEndDate;
  }
  const roi = {
    start: rOIStartDate,
    end: endDate,
  };
  const dates = generateSequenceOfDates(roi, recurrence);
  const newMoments: Moment[] = dates.map(date => {
    const result: Moment = {
      date,
      name: x.NAME,
      type,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });

  // Set up special values in the first value.
  // This will be the first instance, the value may need advancing
  // by monthlyInf from date at which the value was set
  // (can be before the expense ever kicks in).
  if (newMoments.length > 0) {
    if (type === momentType.expense) {
      newMoments[0].type = momentType.expenseStart;
    } else if (type === momentType.income) {
      newMoments[0].type = momentType.incomeStart;
    }
    let startVal = parseFloat(x.VALUE);
    // take account of VALUE_SET and CPI+GROWTH
    const from = getTriggerDate(x.VALUE_SET, triggers);
    const to = roi.start;
    // log(`${x.NAME} grew between ${from} and ${to}`);
    const numMonths = diffMonths(from, to);
    if (!x.NAME.startsWith(pensionDB) && numMonths < 0) {
      log(
        `BUG : income/expense start value set ${from} after ` +
          `start date ${to} ${x.NAME}`,
      );
    }
    //log(`numMonths = ${numMonths}`);
    // log(`there are ${numMonths} months between `
    //    +`${from} and ${to}`)
    // apply monthlyInf
    // log(`before growth on x start value : ${startVal}`);
    startVal *= (1.0 + monthlyInf) ** numMonths;
    // log(`applied growth to generate start value : ${startVal}`);
    newMoments[0].setValue = startVal;
  }
  // log(`generated ${showObj(newMoments)} for ${x.NAME}`);
  return newMoments;
}

function getAssetMonthlyMoments(
  asset: DbAsset,
  triggers: DbTrigger[],
  rOIEndDate: Date,
) {
  const roi = {
    start: getTriggerDate(asset.START, triggers),
    end: rOIEndDate,
  };
  // log(`roi = ${showObj(roi)}`)
  const dates = generateSequenceOfDates(roi, '1m');
  // log(`dates = ${showObj(dates)}`)
  const newMoments = dates.map(date => {
    const result: Moment = {
      date,
      name: asset.NAME,
      type: momentType.asset,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });
  if (newMoments.length > 0) {
    newMoments[0].type = momentType.assetStart;
    if (isNumberString(asset.VALUE)) {
      newMoments[0].setValue = parseFloat(asset.VALUE);
    } else {
      //log(`start of asset, storing value '${asset.VALUE}'`);
      newMoments[0].setValue = asset.VALUE;
    }
  }
  return newMoments;
}

function getTransactionMoments(
  transaction: DbTransaction,
  triggers: DbTrigger[],
  rOIEndDate: Date,
) {
  const newMoments: Moment[] = [];
  if (
    !transaction.NAME.startsWith(pensionTransfer) &&
    (transaction.NAME.startsWith(pension) ||
      transaction.NAME.startsWith(pensionSS) ||
      transaction.NAME.startsWith(pensionDB))
  ) {
    // we don't track pension actions here
    // (see pensionTransactions, reviewed during handleIncome)
    return newMoments;
  }
  const recurrenceGiven = transaction.RECURRENCE.length > 0;
  if (recurrenceGiven) {
    // create a sequence of moments
    // use ROI to limit number of moments generated
    let stop = rOIEndDate;
    if (transaction.STOP_DATE !== '') {
      const transStop = getTriggerDate(transaction.STOP_DATE, triggers);
      if (stop > transStop) {
        stop = transStop;
      }
    }
    const sequenceRoi: Interval = {
      start: getTriggerDate(transaction.DATE, triggers),
      end: stop,
    };
    const transactionDates = generateSequenceOfDates(
      sequenceRoi,
      transaction.RECURRENCE,
    );
    transactionDates.forEach(d => {
      newMoments.push({
        name: transaction.NAME,
        date: d,
        type: momentType.transaction,
        setValue: undefined,
        transaction,
      });
    });
  } else {
    const date = getTriggerDate(transaction.DATE, triggers);
    if (date < rOIEndDate) {
      newMoments.push({
        name: transaction.NAME,
        date,
        type: momentType.transaction,
        transaction,
        setValue: undefined,
      });
    }
  }
  return newMoments;
}

function assetAllowedNegative(assetName: string, asset: DbAsset) {
  if (asset) {
    return asset.CAN_BE_NEGATIVE;
  }
  console.log(`Error : asset name ${assetName} not found in assets list`);
  return (
    assetName === CASH_ASSET_NAME ||
    assetName.includes('mortgage') ||
    assetName.includes('Mortgage')
  );
}

function revalueApplied(
  t: DbTransaction,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  model: DbModelData,
) {
  if (!t.NAME.startsWith(revalue)) {
    return false;
  }
  // log(`it's a revaluation`)
  if (t.FROM !== '') {
    log(
      'WARNING : FROM supplied but no used ' +
        `for a revaluation transaction ${showObj(t)}`,
    );
  }
  let tToValue: string | number | undefined = traceEvaluation(
    t.TO_VALUE,
    values,
    t.TO_VALUE,
  );
  let words = t.TO.split(separator);
  words = replaceCategoryWithAssetNames(words, model);
  words.forEach(w => {
    const wValue = values.get(w);
    // log(`word from ${t.TO} is ${w} has value ${wValue}`);
    let prevValue: number | undefined = undefined;
    let scaledNumberWordParts = false;
    if (wValue === undefined) {
      // log(`word for ${showObj(t)} is ${w} has value ${wValue}`);
      throw new Error(
        `proportional change to an undefined value not implemented`,
      );
    } else if (typeof wValue !== 'string') {
      // log(`${wValue} is a number`);
      prevValue = wValue;
    } else if (isNumberString(wValue)) {
      // log(`${wValue} is a number-string`);
      prevValue = parseFloat(wValue);
    } else {
      if (!t.TO_ABSOLUTE) {
        // log(`${wValue} is a not-number-string`);
        const parts = getNumberAndWordParts(wValue);
        if (parts.numberPart !== undefined && parts.wordPart !== undefined) {
          if (tToValue !== undefined && typeof tToValue !== 'string') {
            const newNumberPart = parts.numberPart * tToValue;
            tToValue = '' + newNumberPart + parts.wordPart;
            scaledNumberWordParts = true;
          } else {
            throw new Error(
              `proportional change to a not-number value ${wValue} not implemented`,
            );
          }
        } else {
          throw new Error(
            `proportional change to a not-number value ${wValue} not implemented`,
          );
        }
      }
    }
    if (!t.TO_ABSOLUTE) {
      // this is a proportional change
      // log(`previous value was ${prevValue}`);
      if (prevValue === undefined) {
        if (!scaledNumberWordParts) {
          log(
            'WARNING : proportional value supplied' +
              ' for a revaluation transaction' +
              ` with no prev value ${showObj(t)}`,
          );
        }
      } else {
        tToValue = prevValue * parseFloat(t.TO_VALUE);
      }
    }
    // log income tax liability for assets which grow
    const matchingAsset = model.assets.find(a => {
      return a.NAME === w;
    });
    if (matchingAsset !== undefined) {
      const liabilities = matchingAsset.LIABILITY.split(separator);
      liabilities.forEach(l => {
        if (l.endsWith(incomeTax)) {
          if (prevValue === undefined) {
            log(`WARNING : no prev value found for revalue`);
          } else if (tToValue === undefined || typeof tToValue === 'string') {
            log(`WARNING : tToValue undefined/string for revalue`);
          } else {
            let gain = tToValue - prevValue;
            if (gain > 0) {
              // log(`handle liability ${l} with gain ${gain}`);
              const q = getQuantity(matchingAsset.NAME, values, model);
              if (q !== undefined) {
                log('Untested code for income tax on quantities');
                gain *= q;
              }
              handleLiability(l, incomeTax, gain, liableIncomeInTaxYear);
            }
          }
        }
      });
    }
    // log(`passing ${t.TO_VALUE} as new value of ${moment.name}`);
    // log('in revalueApplied:');
    if (!t.TO_ABSOLUTE && tToValue !== undefined) {
      setValue(values, evaluations, moment.date, w, tToValue, model, revalue);
    } else {
      setValue(values, evaluations, moment.date, w, t.TO_VALUE, model, revalue);
    }
  });
  return true;
}

function calculateFromChange(
  t: DbTransaction,
  preToValue: number | undefined,
  preFromValue: number,
  fromWord: string,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
):
  | {
      fromImpact: number;
      toImpact: number;
    }
  | undefined {
  // log(`t.FROM_VALUE = ${t.FROM_VALUE}`)
  if (t.NAME.startsWith(conditional) && preToValue === undefined) {
    log(`Bug : conditional transaction to undefined value ${showObj(t)}`);
    //throw new Error(
    //  `Bug : conditional transaction to undefined value ${showObj(t)}`,
    //);
    return undefined;
  }

  if (
    t.NAME.startsWith(conditional) &&
    preToValue !== undefined &&
    preToValue >= 0
  ) {
    // don't need to perform this transaction
    // no need to 'maintain' value of to-asset
    // as it's already >= 0
    // log(`no need to maintain ${t.TO} from ${t.FROM} `
    //   +`as targetValue = ${targetValue}`)
    return undefined;
  }

  // log(`in calculateFromChange for ${t.NAME}, ${fromWord}`);
  const tFromValue = parseFloat(t.FROM_VALUE);
  const tToValue = parseFloat(t.TO_VALUE);

  const q = getQuantity(fromWord, values, model);
  const fromHasQuantity = q !== undefined;

  // The calling code will use fromChange to setValue on
  // the from-asset.
  // It will use to-settings (value and absolute) to adjust
  // toChange to make a change to the to-asset.
  // Mostly, the toChange and fromChange are the same in this function
  // but if either from or to involve quantities, then
  // we see important differences.
  let fromChange = 0;
  // log(`fromChange = ${fromChange}`);

  const matchingAsset = model.assets.find(a => {
    return a.NAME === fromWord;
  });
  const assetNotAllowedNegative =
    matchingAsset && !assetAllowedNegative(fromWord, matchingAsset);

  if (t.FROM_ABSOLUTE) {
    fromChange = tFromValue;
  } else {
    // relative amounts behave differently for conditionals
    if (t.NAME.startsWith(conditional) && !t.TO_ABSOLUTE) {
      if (preToValue !== undefined) {
        // proportion of target
        // log(`use proportion of target amount; proportion of ${preToValue}`);
        fromChange = (-preToValue * tFromValue) / tToValue;
      }
    } else {
      // proportion of source
      // log(`use proportion of source amount; proportion of ${preFromValue}`);
      fromChange = preFromValue * tFromValue;
    }
  }
  // log(`fromChange = ${fromChange}`);

  let numberUnits = 0;
  let unitValue = 0.0;

  // reinterpret a change as a number of units for quantised assets
  if (fromHasQuantity) {
    if (t.NAME.startsWith(conditional)) {
      // log(`absolute from change involving quantities`);
      // fromChange is a number of pounds
      // use q to determine a proportional change
      // for fromChange
      unitValue = preFromValue;
      numberUnits = Math.ceil(fromChange / unitValue);
      // reset fromChange so it's a £ value
    } else {
      // log(`absolute from change involving quantities`);
      // fromChange is a number of units
      // use q to determine a proportional change
      // for fromChange
      numberUnits = fromChange;
      unitValue = preFromValue;
      // reset fromChange so it's a £ value
      fromChange = numberUnits * unitValue;
    }
    // log(`fromChange = ${fromChange}`);
    // log(`numberUnits = ${numberUnits}`);
    // log(`unitValue = ${unitValue}`);
  }

  // don't transfer more than we need to for conditional
  // transactions
  if (
    t.NAME.startsWith(conditional) &&
    preToValue !== undefined &&
    !t.TO_ABSOLUTE &&
    preToValue > -fromChange * tToValue
  ) {
    // log(`cap conditional amount - we only need ${preToValue}`);
    fromChange = -preToValue / tToValue;
    if (fromHasQuantity) {
      //log(`quantity involved in working out fromChange`);
      numberUnits = Math.ceil(fromChange / unitValue);
      fromChange = numberUnits * unitValue;
    }
  }
  // apply change for quantised assets
  if (fromHasQuantity && q !== undefined) {
    if (q - numberUnits < 0 && assetNotAllowedNegative) {
      if (t.NAME.startsWith(conditional) && q > 0) {
        // transfer as much as we have
        numberUnits = q;
        fromChange = numberUnits * unitValue;
      } else {
        // log(`don't sell more units than we have`);
        return undefined;
      }
    }
    // log(`set new quantity ${q} - ${numberUnits} = ${q - numberUnits}`);
    setValue(
      values,
      evaluations,
      moment.date,
      quantity + fromWord,
      q - numberUnits,
      model,
      t.FROM,
    );
  }

  // Allow some assets to become negative but not others
  if (
    assetNotAllowedNegative &&
    !fromHasQuantity &&
    fromChange > preFromValue
  ) {
    if (t.NAME.startsWith(conditional)) {
      // transfer as much as we have
      // log(`transfer only ${preFromValue} because we don't have ${fromChange}`);
      fromChange = preFromValue;
    } else {
      // don't transfer anything
      //log(`don't apply transaction from ${fromWord} `
      //  +`because value ${preFromValue} < ${fromChange} `);
      return undefined;
    }
  }
  const matchingIncome = model.incomes.find(i => {
    return i.NAME === fromWord;
  });
  if (matchingIncome && fromChange > preFromValue) {
    //log(
    //  `Error: dont take more than income value ` +
    //    `${preFromValue} from income ${matchingIncome.NAME}`,
    //);
    return undefined;
  }
  if (matchingAsset && fromWord !== undefined) {
    if (!assetAllowedNegative(fromWord, matchingAsset) && preFromValue <= 0) {
      // log(`we cannot help`);
      return undefined;
    }
  }

  // log(`fromChange = ${fromChange}`);
  const toChange = fromChange;
  if (fromHasQuantity) {
    // log(`don't alter the unit value of a quantised asset`);
    // log(`fromChange was ${fromChange} but reset to 0`)
    fromChange = 0; // don't alter the unit value
  }
  // log(`passing {fromImpact:${fromChange}, toImpact: ${toChange}}`);
  return {
    fromImpact: fromChange,
    toImpact: toChange,
  };
}

function calculateToChange(
  t: DbTransaction,
  preToValue: number | undefined,
  fromChange: number | undefined,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
) {
  let toChange = 0;
  if (t.TO === '') {
    return toChange;
  }
  const tToValue = parseFloat(t.TO_VALUE);
  // log(`t.TO = ${t.TO}`)
  // log(`before transaction, toValue = ${tToValue}`)
  if (preToValue === undefined) {
    throw new Error(`Bug : transacting to unvalued asset ${showObj(moment)}`);
  }
  // log(`t.TO_VALUE = ${t.TO_VALUE}`);
  if (t.TO_ABSOLUTE) {
    toChange = tToValue;
    const q = getQuantity(t.TO, values, model);
    if (q !== undefined) {
      // log(`absolute to change involving quantities`);
      // log(`q = ${q}`);
      // expect toChange to be an integer number
      // adjust the quantity of items stored in values accordingly
      // adjust the toChange value too
      const numUnits = toChange;
      // log(`numUnits = ${numUnits}`);
      const currentValue = traceEvaluation(t.TO, values, t.TO);
      if (currentValue !== undefined) {
        const newNumUnits = q + numUnits;
        // log(`newNumUnits = ${newNumUnits}`);
        setValue(
          values,
          evaluations,
          moment.date,
          quantity + t.TO,
          newNumUnits,
          model,
          t.TO,
        );
        toChange = 0.0;
        // log(`toChange = ${toChange}`);
      }
    }
  } else {
    if (fromChange === undefined) {
      throw new Error(
        'Bug : transacting to proportion of undefined fromChange' +
          `${showObj(moment)}`,
      );
    }
    // proportion of the amount taken from from_asset
    toChange = tToValue * fromChange;
  }
  return toChange;
}

function handleCGTLiability(
  t: DbTransaction,
  fromWord: string,
  preFromValue: number,
  fromChange: number,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  model: DbModelData,
) {
  // log(`${fromWord} reducing from ${preFromValue} by ${fromChange}`);
  // log(`liabilites are ${liabliitiesMap.get(fromWord}`);
  const liabilities = liabliitiesMap.get(fromWord);
  if (liabilities === undefined) {
    return;
  }
  const liabilityWords = liabilities.split(separator);
  // log(`liabilityWords = ${liabilityWords}`);
  const cgtLiability = liabilityWords.find(word => word.endsWith(cgt));
  // log(`cgtLiability = ${cgtLiability}`);
  if (cgtLiability === undefined) {
    return;
  }
  const proportionSale = fromChange / preFromValue;
  // log(`proportionSale = ${proportionSale}`);
  const purchasePrice = getNumberValue(values, `Purchase${fromWord}`);
  // log(`purchasePrice = ${purchasePrice}`);
  if (purchasePrice !== undefined) {
    const totalGain = preFromValue - purchasePrice;
    // log(`totalGain = ${totalGain}`);
    const proportionGain = totalGain * proportionSale;
    // log(`proportionGain = ${proportionGain}`);
    let cgtMap = liableIncomeInTaxYear.get('cgt');
    if (cgtMap === undefined) {
      liableIncomeInTaxYear.set('cgt', new Map<string, number>());
      cgtMap = liableIncomeInTaxYear.get('cgt');
    }
    if (cgtMap !== undefined) {
      let currentcgtVal = cgtMap.get(cgtLiability);
      if (currentcgtVal === undefined) {
        currentcgtVal = 0.0;
      }
      currentcgtVal += proportionGain;
      cgtMap.set(cgtLiability, currentcgtVal);
      // log(`logged cgt for ${cgtLiability}, accumulated value ${currentcgtVal}`);
    }
    const newPurchasePrice = purchasePrice * (1 - proportionSale);
    // when selling some asset, we reduce the Purchase value
    // of what's left for CGT purposes
    // log('in handleCGTLiability, setValue:');
    setValue(
      values,
      evaluations,
      moment.date,
      `Purchase${fromWord}`,
      newPurchasePrice,
      model,
      t.NAME, // TODO no test??
    );
  } else {
    log('BUG!! - CGT liability on an asset with no record of purchase price');
  }
}

export function makeSourceForFromChange(t: DbTransaction) {
  const sourceDescription = getDisplayName(t.NAME, t.TYPE);
  return sourceDescription;
}

export function makeSourceForToChange(t: DbTransaction, fromWord: string) {
  let source = t.NAME;
  if (source.startsWith(conditional)) {
    source = fromWord;
  }
  return source;
}

function processTransactionFromTo(
  t: DbTransaction,
  fromWord: string,
  toWord: string,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  pensionTransactions: DbTransaction[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // log(`processTransactionFromTo fromWord = ${fromWord}`);
  // log(`processTransactionFromTo takes in ${showObj(t)}`);
  const preFromValue = traceEvaluation(fromWord, values, fromWord);
  // log(`pound value of ${fromWord} is ${preFromValue}`);
  let preToValue = undefined;
  if (toWord !== '') {
    preToValue = traceEvaluation(toWord, values, toWord);
    if (preToValue === undefined) {
      preToValue = 0.0;
    }
  }

  // handle conditional transactions
  // Conditions on source/from:
  //   UseUp (move money if source > 0)  not coded
  //   this is linked to - which assets may become -ve?
  // Condition on target/to:
  //   Maintain (move money there if target < 0)
  //   Payoff / repay (move money there if target < 0)

  let fromChange;
  // log(`preFromValue = ${preFromValue}`);
  if (preFromValue !== undefined) {
    fromChange = calculateFromChange(
      t,
      preToValue,
      preFromValue,
      fromWord,
      moment,
      values,
      evaluations,
      model,
    );
    // Transaction is permitted to be blocked by the calculation
    // of fromChange - e.g. if it would require an asset to become
    // a not-permitted value (e.g. shares become negative).
    if (fromChange === undefined) {
      return;
    }
  }
  // log(`for ${t.NAME}, fromChange = ${fromChange}`);

  // Determine how to change the To asset.
  let toChange;
  if (preToValue !== undefined && fromChange !== undefined) {
    toChange = calculateToChange(
      t,
      preToValue,
      fromChange.toImpact,
      moment,
      values,
      evaluations,
      model,
    );
  }

  // apply fromChange
  if (fromChange !== undefined && preFromValue !== undefined) {
    handleCGTLiability(
      t,
      fromWord,
      preFromValue,
      fromChange.fromImpact,
      moment,
      values,
      evaluations,
      liabliitiesMap,
      liableIncomeInTaxYear,
      model,
    );
    // log(`reduce ${fromWord}'s ${preFromValue} by ${fromChange}`);
    // log(`in processTransactionFromTo, setValue of ${fromWord} to ${preFromValue - fromChange}`);
    setValue(
      values,
      evaluations,
      moment.date,
      fromWord,
      preFromValue - fromChange.fromImpact,
      model,
      makeSourceForFromChange(t),
    );
  }

  // log(`for ${t.NAME}, toChange = ${toChange}`);

  // apply toChange
  if (toChange !== undefined) {
    // special case - if we're transacting out of
    // something called CrystallizedPension* into CASH_ASSET_NAME
    // then we should treat this as an income
    // (it's liable to income tax)
    // log(`transacting ${fromChange} from ${fromWord}
    // into ${toWord}`);
    if (fromWord.startsWith(crystallizedPension) && toWord === CASH_ASSET_NAME) {
      // log(`for ${fromWord}, register ${toChange} pension withdrawal on ${moment.date}, ${moment.name} as liable for income tax`);
      handleIncome(
        toChange,
        moment,
        values,
        evaluations,
        model,
        pensionTransactions,
        liabliitiesMap,
        liableIncomeInTaxYear,
        fromWord,
      );
    } else {
      if (preToValue === undefined) {
        throw new Error(
          'Bug : transacting to adjust undefined toValue' +
            `${showObj(moment)}`,
        );
      }
      // log('in processTransactionFromTo, setValue:');
      // log(`in processTransactionFromTo, setValue of ${toWord} to ${preToValue + toChange}`);
      setValue(
        values,
        evaluations,
        moment.date,
        toWord,
        preToValue + toChange,
        model,
        makeSourceForToChange(t, fromWord),
      );
    }
  }
}

function processTransactionTo(
  t: DbTransaction,
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
) {
  if (!t.FROM_ABSOLUTE) {
    throw new Error(
      `BUG : transacting from a proportional amount of undefined ${showObj(t)}`,
    );
  }
  const tToValue = parseFloat(t.TO_VALUE);
  const fromChange = parseFloat(t.FROM_VALUE);
  // Determine how much to add to the To asset.
  // Set the increased value of the To asset accordingly.
  // log(`t.TO = ${t.TO}`)
  let value = getNumberValue(values, t.TO);
  // log(`before transaction, value = ${value}`)
  if (value === undefined) {
    throw new Error(
      `Bug : transacting to unvalued/string-valued asset ${showObj(moment)}`,
    );
  } else {
    let change = 0;
    // log(`t.TO_VALUE = ${t.TO_VALUE}`);
    if (t.TO_ABSOLUTE) {
      change = tToValue;
    } else {
      if (tToValue > 1.0) {
        log(`WARNING : not-absolute value ${tToValue} > 1.0`);
      }
      // proportion of the amount taken from from_asset
      change = tToValue * fromChange;
    }
    // log(`fromChange for the "TO" part of this transaction = ${fromChange}`);
    value += change;
    // log('in processTransactionTo, setValue:');
    setValue(values, evaluations, moment.date, t.TO, value, model, t.NAME);
  }
}

function replaceCategoryWithAssetNames(words: string[], model: DbModelData) {
  let wordsNew: string[] = [];
  words.forEach(fromWord => {
    // if fromWord is a category of one or more assets
    // then remove fromWord from the list and
    // if the assets are not already on the list
    // then add the asset Names.
    const assetsWithCategory = model.assets.filter(a => {
      return a.CATEGORY === fromWord;
    });
    if (assetsWithCategory.length === 0) {
      wordsNew.push(fromWord);
    } else {
      wordsNew = wordsNew.concat(
        assetsWithCategory.map(a => {
          return a.NAME;
        }),
      );
    }
  });
  return wordsNew;
}

function processTransactionMoment(
  moment: Moment,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
  pensionTransactions: DbTransaction[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // transactions have a direct effect on their
  // "from" and "to" assets.  Apply the transaction
  // and set new asset values.
  const t = moment.transaction;
  if (t === undefined) {
    throw Error('BUG!!! moment of type transaction should have a transaction');
  }
  // log(`process transaction ${showObj(t.NAME)}`);

  // Some transactions are simple Revalues.  They have no
  // FROM and a value for TO.  Code similar to application
  // of growth to assets, except we know the new value.
  if (
    revalueApplied(t, moment, values, evaluations, liableIncomeInTaxYear, model)
  ) {
    return;
  }

  // todo for a conditional transactions from a list
  // of sources, use something like this
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
  // and remember a cumulative amount that's been transferred
  // so we stop at the absolute total for the list

  // Determine how much to take off the From asset(s).
  // Set the reduced value of the From asset accordingly.
  if (t.FROM !== '') {
    // we can sometimes see multiple 'FROM's
    // handle one word at a time
    let fromWords = t.FROM.split(separator);
    fromWords = replaceCategoryWithAssetNames(fromWords, model);
    fromWords.forEach(fromWord => {

      let toWords = t.TO.split(separator);
      toWords = replaceCategoryWithAssetNames(toWords, model);
      toWords.forEach(toWord => {
        // log(`process a transaction from ${fromWord}`);
        processTransactionFromTo(
          t,
          fromWord,
          toWord,
          moment,
          values,
          evaluations,
          model,
          pensionTransactions,
          liabliitiesMap,
          liableIncomeInTaxYear,
        );
      });
    });
  } else if (t.FROM === '' && t.TO !== '') {
    processTransactionTo(t, moment, values, evaluations, model);
  }
}

function logPensionIncomeLiabilities(
  t: DbTransaction,
  liabilitiesMap: Map<string, string>,
  model: DbModelData,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  let words = t.FROM.split(separator);

  words = replaceCategoryWithAssetNames(words, model);

  words.forEach(word => {
    if (word.startsWith(crystallizedPension)) {
      const liability = `${word.substr(
        crystallizedPension.length,
      )}${incomeTax}`;
      // e.g. IncomeTaxJoe
      // log(`logging liability for ${word}, add to map: [${t.NAME+word}, ${liability}}`);
      liabilitiesMap.set(t.NAME + word, liability);
    }
  });
}

function logAssetIncomeLiabilities(
  a: DbAsset,
  liabilitiesMap: Map<string, string>,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  if (a.LIABILITY !== '') {
    // log(`logging liability ${showObj(a)}`);
    liabilitiesMap.set(a.NAME, a.LIABILITY);
  } else if (a.NAME.startsWith(crystallizedPension)) {
    const liability = `${a.NAME.substr(
      crystallizedPension.length,
    )}${incomeTax}`;
    // e.g. IncomeTaxJoe
    liabilitiesMap.set(a.NAME, liability);
  }
}

function logPurchaseValues(
  a: DbAsset,
  values: Map<string, number | string>,
  evaluations: Evaluation[],
  model: DbModelData,
) {
  if (a.LIABILITY.includes(cgt)) {
    // log('in logPurchaseValues, setValue:');
    setValue(
      values,
      evaluations,
      getTriggerDate(a.START, model.triggers),
      `Purchase${a.NAME}`,
      parseFloat(a.PURCHASE_PRICE),
      model,
      `Purchase${a.NAME}`,
    );
  }
}

// This is the key entry point for code calling from outside
// this file.
export function getEvaluations(
  model: DbModelData,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<string, number>;
  todaysDebtValues: Map<string, number>;
  todaysIncomeValues: Map<string, number>;
  todaysExpenseValues: Map<string, number>;
  todaysSettingValues: Map<string, string>;
} {
  const todaysAssetValues = new Map<string, number>();
  const todaysDebtValues = new Map<string, number>();
  const todaysIncomeValues = new Map<string, number>();
  const todaysExpenseValues = new Map<string, number>();
  const todaysSettingValues = new Map<string, string>();

  const message = checkData(model);
  if (message.length > 0) {
    log(message);
    return {
      evaluations: [],
      todaysAssetValues: todaysAssetValues,
      todaysDebtValues: todaysDebtValues,
      todaysIncomeValues: todaysIncomeValues,
      todaysExpenseValues: todaysExpenseValues,
      todaysSettingValues: todaysSettingValues,
    };
  }
  // log('in getEvaluations');
  const roiEndDate: Date = makeDateFromString(
    getSettings(model.settings, roiEnd, '1 Jan 1999'),
  );

  if (printDebug()) {
    log(`data = ${showObj(model)}`);
  }

  // Calculate a set of "moments" for each transaction/income/expense...
  // each has a date - we'll process these in date order.
  let allMoments: Moment[] = [];

  // Calculate a monthly growth once per item,
  // refer to this map for each indiviual moment.
  const growths = new Map<string, number>([]);

  // Record which items are liable for income tax.
  // Map from income name to a person identifier.
  // (e.g. "PaperRound", "IncomeTaxJane").
  // (e.g. "PaperRound", "NIJane").
  // (e.g. "get some pension", "IncomeTaxJoe" )
  const liabilitiesMap = new Map<string, string>([]);

  // Some transactions affect income processing.
  const pensionTransactions: DbTransaction[] = [];

  // Keep track of current value of any expense, income or asset
  const values = new Map<string, number | string>([]);

  const cpiInitialVal: number = parseFloat(
    getSettings(model.settings, cpi, '0.0'),
  );
  values.set(cpi, cpiInitialVal);

  // A historical record of evaluations (useful for creating trends or charts)
  const evaluations: Evaluation[] = [];

  // For each expense, work out monthly growth and
  // a set of moments starting when the expense began,
  // ending when the roi ends.
  model.expenses.forEach(expense => {
    // Growth is important to set the value of the
    // first expense.  Later expense values are not
    // set here, but the 'moment' at which the expense
    // changes is set here.
    logExpenseGrowth(expense, cpiInitialVal, growths);
    const monthlyInf = getGrowth(expense.NAME, growths);
    const expenseStart = getTriggerDate(expense.START, model.triggers);
    // log(`expense start = ${expenseStart}`);
    const newMoments = getRecurrentMoments(
      expense,
      momentType.expense,
      monthlyInf,
      model.triggers,
      expenseStart,
      roiEndDate,
      expense.RECURRENCE,
    );
    allMoments = allMoments.concat(newMoments);

    const freq = parseRecurrenceString(expense.RECURRENCE);
    if (freq.frequency !== monthly || freq.count !== 1) {
      // scale up the stored growths value
      const monthlyGrowth = growths.get(expense.NAME);
      if (monthlyGrowth === undefined) {
        log(`Error: didn't find growth of ${expense.NAME}`);
      } else {
        let power = freq.count;
        if (freq.frequency === annually) {
          power *= 12;
        }
        // log(`growth power up by ${power}`);
        const growth = (1 + monthlyGrowth) ** power - 1;
        growths.set(expense.NAME, growth);
        // log(`growth changed from ${monthlyGrowth} to ${growth}`);
      }
    }
  });

  // For each income, work out monthly growth and
  // a set of moments starting when the income began,
  // ending when the roi ends.
  model.incomes.forEach(income => {
    // Growth is important to set the value of the
    // first income.  Later income values are not
    // set here, but the 'moment' at which the income
    // changes is set here.
    logIncomeGrowth(income, cpiInitialVal, growths);
    const monthlyInf = getGrowth(income.NAME, growths);
    const dbTransaction = model.transactions.find(t => {
      return t.NAME.startsWith(pensionDB) && t.TO === income.NAME;
    });
    const roiStartDate = getTriggerDate(income.START, model.triggers);
    if (dbTransaction !== undefined) {
      const sourceIncome = model.incomes.find(i => {
        return dbTransaction.FROM === i.NAME;
      });
      if (sourceIncome === undefined) {
        log(
          `Error: DB transaction ${dbTransaction.NAME} ` +
            `with no source income`,
        );
        throw new Error(
          `Error: DB transaction ${dbTransaction.NAME} ` +
            `with no source income`,
        );
      }
      const startOfSource = getTriggerDate(sourceIncome.START, model.triggers);
      let numAdjustments = 0;
      while (startOfSource <= roiStartDate) {
        roiStartDate.setMonth(roiStartDate.getMonth() - 1);
        numAdjustments += 1;
        if (numAdjustments > 1000) {
          throw new Error(
            `${sourceIncome.NAME} start ${sourceIncome.START} too far ` +
              `from ${income.NAME}'s start ${income.START}`,
          );
        }
      }
    }
    const newMoments = getRecurrentMoments(
      income,
      momentType.income,
      monthlyInf,
      model.triggers,
      roiStartDate,
      roiEndDate,
      '1m', // all incomes are received monthly
    );
    allMoments = allMoments.concat(newMoments);
    liabilitiesMap.set(income.NAME, income.LIABILITY);
  });

  // log(`liabilitiesMap = ...`);
  // liabilitiesMap.forEach((value, key)=>{log(`{\`${key}\`, \`${value}\`}`)});

  model.assets.forEach(asset => {
    logAssetGrowth(asset, cpiInitialVal, growths, model.settings);

    logAssetValueString(
      asset.VALUE,
      asset.START,
      asset.NAME,
      values,
      evaluations,
      model,
    );

    const newMoments = getAssetMonthlyMoments(
      asset,
      model.triggers,
      roiEndDate,
    );
    allMoments = allMoments.concat(newMoments);

    logAssetIncomeLiabilities(asset, liabilitiesMap);

    logPurchaseValues(asset, values, evaluations, model);
  });

  model.transactions.forEach(transaction => {
    // one-off asset-asset transactions generate a single moment
    // recurring asset-asset transactions generate a sequence of moments
    const newMoments = getTransactionMoments(
      transaction,
      model.triggers,
      roiEndDate,
    );
    allMoments = allMoments.concat(newMoments);

    // some transactions affect income processing
    // (e.g. diverting income to pensions)
    if (
      transaction.NAME.startsWith(pension) ||
      transaction.NAME.startsWith(pensionSS) ||
      transaction.NAME.startsWith(pensionDB)
    ) {
      pensionTransactions.push(transaction);
    }

    // some transactions out of pensions are liable to incometax
    logPensionIncomeLiabilities(transaction, liabilitiesMap, model);
  });

  model.settings.forEach(setting => {
    let referencingDates = model.transactions
      .filter(t => {
        // does the setting name appear as part of the transaction TO value?
        if (t.TO_VALUE.includes(setting.NAME)) {
          return true;
        }
        return false;
      })
      .map(t => {
        // log(`date for matching transaction is ${t.DATE}`);
        return t.DATE;
      })
      //.map(ds => getTriggerDate(ds, model.triggers));
      .map(ds => new Date(ds));

    // log(`got referencing dates ${showObj(referencingDates)}`);
    /*
    referencingDates = referencingDates.concat(model.assets
      .filter(a => {
        if(a.GROWTH === setting.NAME){
          return true;
        } 
        return false;
      })
      .map(a => a.START)
      .map(ds => getTriggerDate(ds, model.triggers)));
*/
    // log(`referencingDates for ${setting.NAME} = ${referencingDates.map(d=>d.toDateString())}`);
    referencingDates = referencingDates.sort();
    if (referencingDates.length > 0 && values.get(setting.NAME) === undefined) {
      setValue(
        values,
        evaluations,
        referencingDates[0], // TODO or last Date?
        setting.NAME,
        setting.VALUE,
        model,
        setting.NAME,
      );
    }
  });

  // might be set using a settings value
  const today = getTodaysDate(model);

  if (roiEndDate > today) {
    allMoments.push({
      date: today,
      name: EvaluateAllAssets,
      type: momentType.asset,
      setValue: 0,
      transaction: undefined,
    });
  }

  // log(`pensionTransactions = ${pensionTransactions}`);

  const datedMoments = allMoments.filter(moment => moment.date !== undefined);

  // Process the moments in date order
  sortByDate(datedMoments);

  let startYearOfTaxYear;
  if (datedMoments.length > 0) {
    startYearOfTaxYear = getYearOfTaxYear(
      datedMoments[datedMoments.length - 1].date,
    );
  }
  // we track different types of income liability for different individuals
  // the outer map has a key for "cgt", "incomeTax" and "NI".
  // the inner map has a key for the person who is liable to pay and
  // a value for the accrued liable value as a tax year progresses
  const liableIncomeInTaxYear = new Map<string, Map<string, number>>();

  // log(`gathered ${datedMoments.length} moments to process`);
  while (datedMoments.length > 0) {
    const moment = datedMoments.pop();
    if (moment === undefined) {
      throw new Error('BUG!!! array length > 0 should pop!');
    }

    if (moment.name === EvaluateAllAssets) {
      model.assets.forEach(asset => {
        if (asset.NAME === taxPot) {
          return;
        }
        let val = values.get(asset.NAME);
        if (typeof val === 'string') {
          val = traceEvaluation(val, values, val);
        }
        const q = getQuantity(asset.NAME, values, model);
        if (q !== undefined && val !== undefined) {
          val *= q;
        }
        if (val !== undefined) {
          if (asset.IS_A_DEBT) {
            todaysDebtValues.set(asset.NAME, val);
          } else {
            todaysAssetValues.set(asset.NAME, val);
          }
          // log(`asset ${asset.NAME} has value ${val}`);
        } else {
          // log(`don't report undefined today's value for ${asset.NAME}`);
        }
      });
      model.incomes.forEach(i => {
        let val = values.get(i.NAME);
        if (typeof val === 'string') {
          val = traceEvaluation(val, values, val);
        }
        if (val !== undefined) {
          todaysIncomeValues.set(i.NAME, val);
        } else {
          // log(`don't report undefined today's value for ${i.NAME}`);
        }
      });
      model.expenses.forEach(e => {
        let val = values.get(e.NAME);
        if (typeof val === 'string') {
          val = traceEvaluation(val, values, val);
        }
        if (val !== undefined) {
          todaysExpenseValues.set(e.NAME, val);
        } else {
          // log(`don't report undefined today's value for ${e.NAME}`);
        }
      });
      model.settings.forEach(s => {
        const val = values.get(s.NAME);
        if (val !== undefined) {
          todaysSettingValues.set(s.NAME, `${val}`);
        } else {
          // log(`don't report undefined today's value for ${s.NAME}`);
        }
      });
    }

    // Each moment we process is in dated order.
    // log(`popped moment is ${showObj(moment)}, `+
    //  `${datedMoments.length} moments left`);

    // Detect if this date has brought us into a new tax year.
    // At a change of tax year, log last year's accrual
    // and start a fresh accrual for the next year.
    const momentsTaxYear = getYearOfTaxYear(moment.date);
    // log(`momentsTaxYear = ${momentsTaxYear}`);
    // log(`startYearOfTaxYear = ${startYearOfTaxYear}`);
    if (
      startYearOfTaxYear !== undefined &&
      momentsTaxYear > startYearOfTaxYear
    ) {
      // change of tax year - report count of moments
      // log('change of tax year...');
      settleUpTax(
        liableIncomeInTaxYear,
        startYearOfTaxYear,
        cpiInitialVal,
        values,
        evaluations,
        model,
      );
      startYearOfTaxYear = momentsTaxYear;
    }

    if (moment.type === momentType.transaction) {
      processTransactionMoment(
        moment,
        values,
        evaluations,
        model,
        pensionTransactions,
        liabilitiesMap,
        liableIncomeInTaxYear,
      );
    } else if (
      moment.type === momentType.expenseStart ||
      moment.type === momentType.incomeStart ||
      moment.type === momentType.assetStart
    ) {
      // Starts are well defined
      // log(`start moment ${moment.name}, ${moment.type}`)
      if (moment.setValue === undefined) {
        log('BUG!!! starts of income/asset/expense should have a value!');
        break;
      }
      // Log quanities for assets which have them; needed for setting value.
      if (moment.type === momentType.assetStart) {
        // log(`at start of asset ${moment.name}`);
        const startQ = getStartQuantity(moment.name, model);
        if (startQ !== undefined) {
          // log(`set quantity of asset ${moment.name} = ${startQ}`);
          setValue(
            values,
            evaluations,
            moment.date,
            quantity + moment.name, // value of what?
            startQ,
            model,
            moment.name, // source
          );
        }
      }
      const startValue = moment.setValue;
      // log(`in getEvaluations starting something: ${moment.name}`);
      setValue(
        values,
        evaluations,
        moment.date,
        moment.name,
        startValue,
        model,
        moment.name, // e.g. Cash (it's just the starting value)
      );
      if (moment.type === momentType.incomeStart) {
        if (typeof startValue === 'string') {
          throw new Error(`income ${moment.name} can't be a string`);
        }
        handleIncome(
          startValue,
          moment,
          values,
          evaluations,
          model,
          pensionTransactions,
          liabilitiesMap,
          liableIncomeInTaxYear,
          moment.name,
        );
      } else if (moment.type === momentType.expenseStart) {
        // log('in getEvaluations, adjustCash:');
        adjustCash(
          -startValue,
          moment.date,
          values,
          evaluations,
          model,
          moment.name,
        );
      }
    } else {
      // not a transaction
      // not at start of expense/income/asset
      let x: string | number | undefined = getNumberValue(
        values,
        moment.name,
        false,
      );
      // log(`value of ${moment.name} is ${x}`);
      if (x === undefined) {
        x = values.get(moment.name);
        if (x !== undefined) {
          setValue(
            values,
            evaluations,
            moment.date,
            moment.name,
            x,
            model,
            growth,
          );
        }
      } else {
        const inf = getGrowth(moment.name, growths);
        if (printDebug()) {
          log(`change = x * inf = ${x * inf}`);
        }
        const change = x * inf;
        x += change;
        // We _do_ want to log changes of 0
        // because this is how we generate monthly
        // data to plot.
        // if(change!==0){ // we _do_ want to log no-change evaluations!
        // log('in getEvaluations:');
        setValue(
          values,
          evaluations,
          moment.date,
          moment.name,
          x,
          model,
          growth,
        );
        // }
        if (moment.type === momentType.asset) {
          // some assets experience growth which is
          // liable for tax
          // log(`asset moment for growth : ${moment.date}, ${moment.name}`);
          handleIncome(
            change,
            moment,
            values,
            evaluations,
            model,
            pensionTransactions,
            liabilitiesMap,
            liableIncomeInTaxYear,
            moment.name,
          );
        } else if (moment.type === momentType.income) {
          handleIncome(
            x,
            moment,
            values,
            evaluations,
            model,
            pensionTransactions,
            liabilitiesMap,
            liableIncomeInTaxYear,
            moment.name,
          );
        } else if (moment.type === momentType.expense) {
          // log('in getEvaluations, adjustCash:');
          adjustCash(-x, moment.date, values, evaluations, model, moment.name);
        }
      }
      if (printDebug()) {
        log(`${moment.date.toDateString()},
                  ${moment.name},
                  value = ${values.get(moment.name)}`);
      }
    }

    // Catch any tax information if we've just processed the last
    // of the moments.
    if (startYearOfTaxYear !== undefined && datedMoments.length === 0) {
      // change of tax year - report count of moments
      // log('last item in tax year...');
      settleUpTax(
        liableIncomeInTaxYear,
        startYearOfTaxYear,
        cpiInitialVal,
        values,
        evaluations,
        model,
      );
    }
  }

  if (printDebug()) {
    evaluations.forEach(evalns => {
      log(showObj(evalns));
    });
  }
  // log(`getEvaluations returning ${evaluations.length} evaluations`);

  const result = {
    evaluations: evaluations,
    todaysAssetValues: todaysAssetValues,
    todaysDebtValues: todaysDebtValues,
    todaysIncomeValues: todaysIncomeValues,
    todaysExpenseValues: todaysExpenseValues,
    todaysSettingValues: todaysSettingValues,
  };
  // log(`result.todaysDebtValues = ${result.todaysDebtValues}`);
  return result;
}
