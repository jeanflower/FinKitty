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
  growth,
  pensionDB,
  pensionTransfer,
  quantity,
  EvaluateAllAssets,
  roiStart,
  purchase,
  vestedEval,
  rsu,
  vestedNum,
  pensionAllowance,
  dot,
} from '../localization/stringConstants';
import {
  DatedThing,
  Asset,
  Expense,
  Income,
  ModelData,
  Setting,
  Transaction,
  Trigger,
  Evaluation,
  Interval,
  SettingVal,
  AssetVal,
  DebtVal,
  IncomeVal,
  ExpenseVal,
  ReportDatum,
  ReportValueChecker,
} from '../types/interfaces';
import { getMonthlyGrowth, log, printDebug, showObj } from '../utils';
import { getDisplayName } from '../views/tablePages';
import {
  getNumberAndWordParts,
  getStartQuantity,
  makeDateFromString,
  getTriggerDate,
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetIncomeTag,
  makeNetGainTag,
  removeNumberPart,
  makePensionAllowanceTag,
  checkTriggerDate,
} from '../stringUtils';
import {
  getSettings,
  replaceCategoryWithAssetNames,
  getTodaysDate,
} from './modelUtils';

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

// let numCalls = 0;

export function generateSequenceOfDates(
  roi: Interval,
  frequency: string /* e.g. 1m or 1y */,
  addPreDate = false,
): Date[] {
  // numCalls = numCalls + 1;
  // log(`numCalls = ${numCalls}`);

  const result: Date[] = [];
  const freq = parseRecurrenceString(frequency);
  const mFreq = freq.frequency === monthly;
  const yFreq = freq.frequency === annually;

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
  let thisDate = new Date(roi.start);
  let initialCount;
  if (mFreq) {
    initialCount = thisDate.getMonth();
  } else {
    initialCount = thisDate.getFullYear();
  }

  while (thisDate < roi.end) {
    result.push(thisDate);

    // advance thisDate for the next transaction
    const nextDate = new Date(roi.start);
    numstepsAdvanced += freq.count;
    if (mFreq) {
      // log(`monthly dates for ${frequency}`);
      nextDate.setMonth(initialCount + numstepsAdvanced);
    } else if (yFreq) {
      // log(`annual dates for ${frequency}`);
      nextDate.setFullYear(initialCount + numstepsAdvanced);
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
      // log(`undefined b`);
      result = -1;
    } else if (ad === undefined && bd !== undefined) {
      // log(`undefined a`);
      result = 1;
    } else if (ad !== undefined && bd !== undefined) {
      if (ad < bd) {
        // log(`a before b`);
        result = 1;
      } else if (ad > bd) {
        // log(`b before a`);
        result = -1;
      }
    }
    if (result === 0) {
      // dates are equal or both undefined
      // so we need some other way of distinguishing
      // special-case CASH status
      const aIsCash = a.name === CASH_ASSET_NAME;
      const bIsCash = b.name === CASH_ASSET_NAME;
      if (bIsCash && !aIsCash) {
        // log(`b cash`);
        result = -1;
      } else if (aIsCash && !bIsCash) {
        // log(`a cash`);
        result = 1;
      }
    }
    if (result === 0) {
      // dates equal, cash status matches
      // if an asset has started, that's a special case
      const aIsAssetStart = a.type === momentType.assetStart;
      const bIsAssetStart = b.type === momentType.assetStart;
      if (aIsAssetStart && !bIsAssetStart) {
        // log(`a asset start`);
        result = 1;
      } else if (bIsAssetStart && !aIsAssetStart) {
        // log(`b asset start`);
        result = -1;
      }
    }
    if (result === 0) {
      // dates equal, cash status equal, asset-start equal
      // pay attention to whether it's an asset
      const aIsAsset = a.type === momentType.asset;
      const bIsAsset = b.type === momentType.asset;
      if (aIsAsset && !bIsAsset) {
        // log(`a asset`);
        result = 1;
      } else if (bIsAsset && !aIsAsset) {
        // log(`b asset`);
        result = -1;
      }
    }
    if (result === 0) {
      const aIsCP = a.name.startsWith(crystallizedPension);
      const bIsCP = b.name.startsWith(crystallizedPension);
      if (aIsCP && !bIsCP) {
        // log(`a cpension`);
        return -1;
      } else if (!aIsCP && bIsCP) {
        // log(`b cpension`);
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
        // log(`a name`);
        result = 1;
      } else if (a.name > b.name) {
        // log(`b name`);
        result = -1;
      } else if (a.type < b.type) {
        // log(`a type`);
        result = 1;
      } else if (a.type > b.type) {
        // log(`b type`);
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
  taxLiability: 'TaxLiability',
};

function getNumberValue(
  values: ValuesContainer,
  name: string,
  expectValue = true,
  printLogs = false,
): number | undefined {
  let result = values.get(name);
  if (printLogs) {
    log(`seek number value for key = '${name}', values has entry ${result}`);
  }
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
        `getNumberValue returning undefined for ${name}; ` +
          `consider switch to traceEvaluation ` +
          `for values involving words and settings`,
      );
    }
  }
  if (printLogs) {
    log(`number value for key = '${name}' is ${result}`);
  }
  return result;
}

function traceEvaluation(
  value: number | string,
  values: ValuesContainer,
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
  let result: number | undefined = 0.0;
  if (typeof value !== 'string') {
    result = value;
  } else {
    const debug = false;
    if (isNumberString(value)) {
      result = parseFloat(value);
    } else {
      const parts = getNumberAndWordParts(value);
      let numberPart = 1.0;
      if (parts.numberPart !== undefined) {
        numberPart = parts.numberPart;
      }
      const wordPart = parts.wordPart;
      const valueForWordPart = values.get(wordPart);
      if (debug) {
        log(`valueForWordPart ${wordPart} = ${valueForWordPart}`);
      }
      if (valueForWordPart === undefined) {
        if (debug) {
          log(`values were ${showObj(values)}`);
        }
        result = undefined;
      } else if (typeof valueForWordPart === 'string') {
        const nextLevel = traceEvaluation(valueForWordPart, values, source);
        if (nextLevel === undefined) {
          if (debug) {
            log(
              `got undefined for ${valueForWordPart} - returning undefined for ${value}`,
            );
          }
          result = undefined;
        } else {
          if (debug) {
            log(
              `calculate ${numberPart} * ${nextLevel} = ${numberPart *
                nextLevel}`,
            );
          }
          result = numberPart * nextLevel;
        }
      } else {
        //log(`calculate ${numberPart} * ${settingForWordPart} = ${numberPart * settingForWordPart}`)
        result = numberPart * valueForWordPart;
      }
    }
  }
  // log(`traceEvaluation result = ${result}`);
  return result;
}

function getQuantity(
  w: string,
  values: ValuesContainer,
  model: ModelData,
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
  values: ValuesContainer,
  assetName: string,
  model: ModelData,
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
  values: ValuesContainer,
  evaluations: Evaluation[],
  date: Date,
  name: string,
  newValue: number | string,
  model: ModelData,
  source: string, // something that triggered the new value
  callerID: string,
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
          `source = ${source}, from  ${callerID}`,
      );
    } else {
      log(
        `setting value of ${name}, ` +
          `newValue = ${newValue} ` +
          `oldValue = ${existingValue} ` +
          `date = ${date.toDateString()}, ` +
          `source = ${source}, from  ${callerID}`,
      );
    }
  }
  values.set(name, newValue, date, source);
  // log(`Go to find unit val for ${name}'s, we have value = some of ${newValue}`);
  const unitVal = traceEvaluation(newValue, values, name);
  // log(`Unit val of ${name} is ${unitVal}`);
  if (unitVal === undefined) {
    // this is not necessarily an error - just means
    // we're keeping track of something which cannot be
    // evaluated.
    // log(`evaluation of ${newValue} for ${name} undefined`);
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
  transaction: Transaction | undefined;
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

interface TaxBands {
  taxBandsSet: Date;
  noTaxBand: number;
  lowTaxBand: number;
  adjustnoTaxBand: number;
  highTaxBand: number;
  lowTaxRate: number;
  highTaxRate: number;
  topTaxRate: number;
  noNIBand: number;
  lowNIBand: number;
  lowNIRate: number;
  highNIRate: number;
}
interface TaxBandsMap {
  [key: string]: TaxBands | undefined;
}

const TAX_MAP: TaxBandsMap = {
  2016: {
    taxBandsSet: makeDateFromString('April 5 2016'),
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustnoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  2017: {
    taxBandsSet: makeDateFromString('April 5 2017'),
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustnoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  2018: {
    taxBandsSet: makeDateFromString('April 5 2018'),
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustnoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  2019: {
    taxBandsSet: makeDateFromString('April 5 2019'),
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustnoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  2020: {
    taxBandsSet: makeDateFromString('April 5 2020'),
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustnoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
};

function getTaxBands(income: number, d: Date, cpiVal: number) {
  const yearToPay = d.getFullYear();
  for (let yr = yearToPay; yr > 2016; yr = yr - 1) {
    // TODO drop yr to 2021 for performance
    const bands: any | undefined = TAX_MAP[`${yr}`];
    if (bands !== undefined) {
      const result = {
        noTaxBand: bands.noTaxBand,
        lowTaxBand: bands.lowTaxBand,
        lowTaxRate: bands.lowTaxRate,
        adjustnoTaxBand: bands.adjustnoTaxBand,
        highTaxBand: bands.highTaxBand,
        highTaxRate: bands.highTaxRate,
        topTaxRate: bands.topTaxRate,

        noNIBand: bands.noNIBand,
        lowNIBand: bands.lowNIBand,
        lowNIRate: bands.lowNIRate,
        highNIRate: bands.highNIRate,

        bandsSet: bands.taxBandsSet,
      };
      result.noTaxBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.noTaxBand,
        cpiVal,
      );
      result.lowTaxBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.lowTaxBand,
        cpiVal,
      );
      result.adjustnoTaxBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.adjustnoTaxBand,
        cpiVal,
      );
      result.highTaxBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.highTaxBand,
        cpiVal,
      );

      result.noNIBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.noNIBand,
        cpiVal,
      );
      result.lowNIBand = updateValueForCPI(
        result.bandsSet,
        d,
        result.lowNIBand,
        cpiVal,
      );

      if (income > result.adjustnoTaxBand) {
        const reducedNoTaxBand =
          12500 - (income - result.adjustnoTaxBand) / 2.0;
        if (reducedNoTaxBand > 0) {
          result.noTaxBand = reducedNoTaxBand;
        } else {
          result.noTaxBand = 0;
        }
      }
      // log(`bands for ${d.toDateString()} are ${showObj(result)}`);
      return result;
    }
  }
  throw new Error(`no Tax Bands defined!`);
}

function calculateIncomeTaxPayable(income: number, d: Date, cpiVal: number) {
  // log(`in calculateTaxPayable`);
  const bands = getTaxBands(income, d, cpiVal);

  const sizeOfLowTaxBand = bands.lowTaxBand - bands.noTaxBand;
  const sizeOfHighTaxBand = bands.highTaxBand - bands.lowTaxBand;

  const lowTaxRate = bands.lowTaxRate;
  const highTaxRate = bands.highTaxRate;
  const topTaxRate = bands.topTaxRate;

  let incomeInNoTaxBand = 0;
  let incomeInLowTaxBand = 0;
  let incomeInHighTaxBand = 0;
  let incomeInTopTaxBand = 0;

  incomeInNoTaxBand = income;
  // test next band
  incomeInLowTaxBand = incomeInNoTaxBand - bands.noTaxBand;
  // see if we have strayed into next band
  if (incomeInLowTaxBand > 0) {
    // we have some income in low tax band
    // cap income in no tax band
    incomeInNoTaxBand = bands.noTaxBand;
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
  const taxPayable = [
    {
      amountLiable: incomeInTopTaxBand,
      rate: topTaxRate,
    },
    {
      amountLiable: incomeInHighTaxBand,
      rate: highTaxRate,
    },
    {
      amountLiable: incomeInLowTaxBand,
      rate: lowTaxRate,
    },
  ];

  // log(`taxPayable from income ${income} is ${showObj(taxPayable)}`);
  return taxPayable;
}

function calculateNIPayable(
  income: number,
  d: Date,
  cpiVal: number,
): { amountLiable: number; rate: number }[] {
  // log(`in calculateNIPayable`);
  const bands = getTaxBands(income, d, cpiVal);

  const noNIBand = bands.noNIBand;
  const lowNIBand = bands.lowNIBand;
  const lowNIRate = bands.lowNIRate;
  const highNIRate = bands.highNIRate;

  const sizeOfLowNIBand = lowNIBand - noNIBand;

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

  const niPayable = [
    {
      amountLiable: incomeInHighNIBand,
      rate: highNIRate,
    },
    {
      amountLiable: incomeInLowNIBand,
      rate: lowNIRate,
    },
  ];

  // log(`niPayable from income ${income} is ${showObj(niPayable)}`);
  return niPayable;
}

const CGTBandsSet = makeDateFromString('April 5 2018');
const noCGTBandSet = 12000;

function calculateCGTPayable(gain: number, d: Date, cpiVal: number) {
  // log(`in calculateCGTPayable, gain = ${gain}`);
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
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
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
      '1', //callerID
    );
  }
}

function sumTaxDue(
  taxDueList: { amountLiable: number; rate: number }[],
): number {
  let total = 0.0;
  taxDueList.forEach(tx => {
    total = total + tx.amountLiable * tx.rate;
    // log(`total is now ${total}`);
  });
  return total;
}

function payTaxFromVestedRSU(
  a: Asset,
  taxDue: { amountLiable: number; rate: number }[],
  startOfTaxYear: Date,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. IncomeTaxJoe
) {
  const vestedEvaln = values.get(`${vestedEval}${a.NAME}`);
  if (vestedEvaln === undefined) {
    throw new Error('RSUs must have a defined vested evaluation');
  }
  const vestedNumb = values.get(`${vestedNum}${a.NAME}`);
  if (vestedNumb === undefined) {
    throw new Error('RSUs must have a defined vested number');
  }
  if (typeof vestedEvaln === 'string') {
    throw new Error('RSUs must have a numerical defined vested evaluation');
  }
  if (typeof vestedNumb === 'string') {
    throw new Error('RSUs must have a numerical defined vested quantity');
  }
  const assetQty = values.get(`${quantity}${a.NAME}`);
  if (assetQty === undefined || typeof assetQty === 'string') {
    throw new Error('RSUs need a numerical qty');
  }
  const numShares = traceEvaluation(assetQty, values, source);
  if (numShares === undefined) {
    throw new Error('RSUs must have a defined currentquantity');
  } else {
    let evalAvailable = vestedEvaln * vestedNumb;
    if (printDebug()) {
      log(
        `taxDue before some tax was paid from RSUs = ${showObj(
          taxDue.map(td => {
            return {
              amountLiable: td.amountLiable,
              rate: td.rate,
              amountDue: td.amountLiable * td.rate,
            };
          }),
        )}`,
      );
    }
    let amountForTax = 0;
    let amountToKeep = 0;
    taxDue.forEach(td => {
      const amountLiable = td.amountLiable;
      let addForTax = 0;
      if (evalAvailable > amountLiable) {
        // RSUs have more than we need for this td
        // log(`RSUs available worth ${evalAvailable} > tax liability ${amountLiable}`);
        // log(`due to pay ${amountLiable * td.rate}`);
        addForTax = amountLiable * td.rate;
      } else {
        // RSUs are not enough to cover the tax due
        // log(`RSUs available worth ${evalAvailable} <= tax liability ${amountLiable}`);
        // log(`due to pay ${evalAvailable * td.rate}`);
        addForTax = evalAvailable * td.rate;
      }

      const addForTaxRounded =
        Math.floor(addForTax / vestedEvaln + 0.00001) * vestedEvaln;
      amountForTax = amountForTax + addForTaxRounded;
      const addToKeep = (addForTax / td.rate) * (1 - td.rate);
      const addToKeepRounded =
        Math.floor(addToKeep / vestedEvaln + 0.00001) * vestedEvaln;
      amountToKeep = amountToKeep + addToKeepRounded;
      // log(`reduce evalAvailable by ${addForTax} + ${addToKeep} = ${addForTax + addToKeep}`)
      evalAvailable = evalAvailable - (addForTax + addToKeep);
      td.amountLiable = td.amountLiable - addForTaxRounded / td.rate;
      if (printDebug()) {
        log(
          `for tax band rate ${td.rate} ` +
            `pay ${addForTax} for tax bill ` +
            `and reduce liability by ${addForTax + addToKeep}`,
        );
      }
    });
    const numSharesForTax = amountForTax / vestedEvaln;
    if (printDebug()) {
      log(
        `reduce numShares from ${numShares} by ${numSharesForTax} ` +
          `to pay ${amountForTax} to tax bill`,
      );
    }
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      quantity + a.NAME,
      numShares - numSharesForTax,
      model,
      source,
      '29', //callerID
    );
    // log(`paid ${numSharesForTax} RSUs for income tax`);
    const currentPurchaseValue = values.get(`${purchase}${a.NAME}`);
    if (currentPurchaseValue !== undefined) {
      let numberPart = 0.0;
      let wordPart: string | undefined = undefined;
      if (typeof currentPurchaseValue === 'string') {
        const parsed = getNumberAndWordParts(currentPurchaseValue);
        if (parsed.numberPart === undefined) {
          throw new Error(`don't understand purchase price for RSUs?`);
        }
        numberPart = parsed.numberPart;
        wordPart = parsed.wordPart;
      } else {
        numberPart = currentPurchaseValue;
      }
      let purchaseValue = numberPart;
      if (purchaseValue !== 0.0) {
        // log(`before paying income tax, purchaseValue = ${purchaseValue}`);
        purchaseValue =
          (purchaseValue * (numShares - numSharesForTax)) / numShares;
        // log(`after paying income tax, purchaseValue = ${purchaseValue}`);
        if (wordPart === undefined) {
          setValue(
            values,
            evaluations,
            startOfTaxYear,
            `${purchase}${a.NAME}`,
            purchaseValue,
            model,
            source,
            '31', //callerID
          );
        } else {
          setValue(
            values,
            evaluations,
            startOfTaxYear,
            `${purchase}${a.NAME}`,
            `${purchaseValue}${wordPart}`,
            model,
            source,
            '32', //callerID
          );
        }
      }
    }

    if (printDebug()) {
      log(
        `taxDue after some tax was paid from RSUs = ${showObj(
          taxDue.map(td => {
            return {
              amountLiable: td.amountLiable,
              rate: td.rate,
              amountDue: td.amountLiable * td.rate,
            };
          }),
        )}`,
      );
    }
  }
}

function payTaxFromVestedRSUs(
  taxDue: { amountLiable: number; rate: number }[],
  startOfTaxYear: Date,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. IncomeTaxJoe
  type: string, // either incomeTax or nationalInsurance
) {
  const person = source.substring(0, source.length - type.length);
  const RSUsForTax = model.assets
    .filter(a => {
      return a.CATEGORY === rsu;
    })
    .filter(a => {
      return a.LIABILITY.split(separator).includes(`${person}${type}`);
    })
    .filter(a => {
      const rsuVested = getTriggerDate(a.START, model.triggers);
      if (rsuVested < startOfTaxYear) {
        rsuVested.setFullYear(rsuVested.getFullYear() + 1);
        if (rsuVested > startOfTaxYear) {
          // log(`asset ${a.NAME} vested in this tax year`);
          return true;
        }
      }
      return false;
    });
  RSUsForTax.forEach(a => {
    payTaxFromVestedRSU(
      a,
      taxDue,
      startOfTaxYear,
      values,
      evaluations,
      model,
      source, // e.g. IncomeTaxJoe
    );
  });
}

function payIncomeTax(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. IncomeTaxJoe
) {
  // log(`pay income tax on ${income} for date ${startOfTaxYear}`);
  // calculate tax liability
  const taxDue: {
    amountLiable: number;
    rate: number;
  }[] = calculateIncomeTaxPayable(income, startOfTaxYear, cpiVal);
  // log(`taxDue for ${source} on ${startOfTaxYear} = ${taxDue}`);
  const totalTaxDue = sumTaxDue(taxDue);
  if (totalTaxDue > 0) {
    payTaxFromVestedRSUs(
      taxDue,
      startOfTaxYear,
      values,
      evaluations,
      model,
      source,
      incomeTax,
    );
    const totalTaxDueFromCash = sumTaxDue(taxDue);
    if (totalTaxDueFromCash > 0) {
      // log('in payIncomeTax, adjustCash:');
      adjustCash(
        -totalTaxDueFromCash,
        startOfTaxYear,
        values,
        evaluations,
        model,
        source,
      );
    }
    // log(`setValue with taxDue = ${taxDue}`);
    const person = source.substring(0, source.length - incomeTax.length);
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      incomeTax,
      totalTaxDue,
      model,
      makeIncomeTaxTag(person),
      '23', //callerID
    );
  }
  return totalTaxDue;
}

function sumNI(niDue: { amountLiable: number; rate: number }[]): number {
  let sum = 0;
  niDue.forEach(nd => {
    sum = sum + nd.amountLiable * nd.rate;
  });
  return sum;
}

function payNI(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. NIJoe
) {
  // log(`pay NI on ${income} for date ${startOfTaxYear}`);
  // calculate NI liability
  const NIDue = calculateNIPayable(income, startOfTaxYear, cpiVal);

  const sumDue = sumNI(NIDue);
  if (sumDue > 0) {
    payTaxFromVestedRSUs(
      NIDue,
      startOfTaxYear,
      values,
      evaluations,
      model,
      source,
      nationalInsurance,
    );
    const totalTaxDueFromCash = sumTaxDue(NIDue);
    // log('in payNI, adjustCash:');
    adjustCash(
      -totalTaxDueFromCash,
      startOfTaxYear,
      values,
      evaluations,
      model,
      source,
    );
    const person = source.substring(
      0,
      source.length - nationalInsurance.length,
    );
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      nationalInsurance,
      sumDue,
      model,
      makeNationalInsuranceTag(person),
      '33', //callerID
    );
  }
  return sumDue;
}

function payCGT(
  startOfTaxYear: Date,
  gain: number,
  cpiVal: number,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
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
    const person = source.substring(0, source.length - cgt.length);
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      cgt,
      CGTDue,
      model,
      makeCGTTag(person),
      '26', //callerID
    );
  }
  return CGTDue;
}
function OptimizeIncomeTax(
  date: Date,
  cpiVal: number,
  liableIncome: number,
  values: ValuesContainer,
  person: string,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  // log(`OptimizeIncomeTax income tax for ${person} and ${liableIncome} on ${date.toDateString()}`);
  const bands = getTaxBands(liableIncome, date, cpiVal);
  if (liableIncome > bands.noTaxBand) {
    return;
  }
  let unusedAllowance = bands.noTaxBand - liableIncome;
  // log(`unusedAllowance = ${unusedAllowance}`);
  // if we have unused allowance, see
  // have we got some crystallised pension we can use?
  for (const valueKey of values.keys()) {
    /* eslint-disable-line no-restricted-syntax */
    if (valueKey.startsWith(crystallizedPension)) {
      // is it for the right person?
      const removedCP = `${valueKey.substr(crystallizedPension.length)}`;
      const wds = removedCP.split(dot);
      if (wds.length !== 2) {
        log(`unexpected formatting of ${valueKey}`);
        throw new Error('unexpected formatting of cp name');
      }
      const liability = `${wds[0]}${incomeTax}`;
      // e.g. IncomeTaxJoe
      // log(`liability = ${liability}`);
      if (liability === person) {
        // log(`valueKey = ${valueKey}`);

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
          personAmountMap.set(person, liableIncome + amountToTransfer);

          liableIncome = liableIncome + amountToTransfer;
          unusedAllowance = unusedAllowance - amountToTransfer;
          setValue(
            values,
            evaluations,
            date,
            CASH_ASSET_NAME,
            cashVal + amountToTransfer,
            model,
            valueKey,
            '5', //callerID
          ); // e.g. 'CrystallizedPensionNorwich'
          setValue(
            values,
            evaluations,
            date,
            valueKey,
            pensionVal - amountToTransfer,
            model,
            liability,
            '6', //callerID
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
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
) {
  const date = new Date(startYearOfTaxYear + 1, 3, 5);
  // before going to pay income tax,
  // see if there's a wise move to use up unused income tax allowance
  // for each person
  for (const [key, value] of liableIncomeInTaxYear) {
    /* eslint-disable-line no-restricted-syntax */
    if (key === incomeTax && value !== undefined) {
      for (const [person, liableIncome] of value) {
        /* eslint-disable-line no-restricted-syntax */
        if (doOptimizeForIncomeTax) {
          OptimizeIncomeTax(
            date,
            cpiVal,
            liableIncome,
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

  const personNetIncome = new Map<string, number>();
  const personNetGain = new Map<string, number>();
  const personPensionAllowanceUsed = new Map<string, number>();
  for (const [key, value] of liableIncomeInTaxYear) {
    let recalculatedNetIncome = false;
    let recalculatedNetGain = false;
    let recalculatedPensionAllowance = false;
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
        const personsName = person.substring(
          0,
          person.length - incomeTax.length,
        );
        // log(`paid some income tax for ${personsName}`);
        const knownNetIncome = personNetIncome.get(personsName);
        if (knownNetIncome === undefined) {
          // log(`for ${personsName}, set first net income ${amount} - ${taxPaid}`);
          personNetIncome.set(personsName, amount - taxPaid);
        } else {
          // log(`for ic, reduce existing net income for ${personsName}`);
          personNetIncome.set(personsName, knownNetIncome - taxPaid);
        }
        if (printDebug()) {
          log(`${person} paid income tax ${taxPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
        recalculatedNetIncome = true;
      }
    } else if (key === nationalInsurance && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        const NIPaid = payNI(
          date,
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
        const personsName = person.substring(
          0,
          person.length - nationalInsurance.length,
        );
        // log(`paid some NI for ${personsName}`);
        const knownNetIncome = personNetIncome.get(personsName);
        if (knownNetIncome === undefined) {
          // log(`for ni, set first net income for ${personsName}`);
          personNetIncome.set(personsName, amount - NIPaid);
        } else {
          // log(`for ni, reduce existing net income for ${personsName}`);
          personNetIncome.set(personsName, knownNetIncome - NIPaid);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
      recalculatedNetIncome = true;
    } else if (key === 'cgt' && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        const cgtPaid = payCGT(
          date,
          amount,
          cpiVal,
          values,
          evaluations,
          model,
          person,
        ); // e.g. 'CGTJoe'
        // log('resetting liableIncomeInTaxYear');
        const personsName = person.substring(0, person.length - cgt.length);
        const knownNetGain = personNetGain.get(personsName);
        if (knownNetGain === undefined) {
          personNetGain.set(personsName, amount - cgtPaid);
        } else {
          personNetGain.set(personsName, knownNetGain - cgtPaid);
        }
        value.set(person, 0);
        recalculatedNetGain = true;
      }
    } else if (key === pensionAllowance && value !== undefined) {
      for (const [person, amount] of value) {
        // log(`for PensionAllowance, [person, amount] = [${person},${amount}] `);
        const personsName = person.substring(
          0,
          person.length - pensionAllowance.length,
        );
        const knownPensionAllowanceUsage = personPensionAllowanceUsed.get(
          personsName,
        );
        if (knownPensionAllowanceUsage === undefined) {
          personPensionAllowanceUsed.set(personsName, amount);
        } else {
          personPensionAllowanceUsed.set(
            personsName,
            knownPensionAllowanceUsage + amount,
          );
        }
        recalculatedPensionAllowance = true;
        value.set(person, 0);
      }
    } else {
      log(`unhandled key from liableIncomeInTaxYear = ${key} `);
    }
    if (recalculatedNetIncome) {
      for (const [person, amount] of personNetIncome) {
        if (amount > 0) {
          const netIncTag = makeNetIncomeTag(person);
          setValue(
            values,
            evaluations,
            date,
            netIncTag,
            amount,
            model,
            netIncTag,
            '27', //callerID
          );
        }
      }
    }
    if (recalculatedNetGain) {
      for (const [person, amount] of personNetGain) {
        if (amount > 0) {
          // log(`setValue ${'netgain'+person} amount ${amount}`)
          setValue(
            values,
            evaluations,
            date,
            makeNetGainTag(person),
            amount,
            model,
            makeNetGainTag(person),
            '28', //callerID
          );
        }
      }
    }
    if (recalculatedPensionAllowance) {
      for (const [person, amount] of personPensionAllowanceUsed) {
        if (amount > 0) {
          // log(`setValue ${'netgain'+person} amount ${amount}`)
          setValue(
            values,
            evaluations,
            date,
            makePensionAllowanceTag(person),
            amount,
            model,
            makePensionAllowanceTag(person),
            '34', //callerID
          );
        }
      }
    }
  }
}

function accumulateLiability(
  liability: string,
  type: string, // "income" or "NI"
  incomeValue: number,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // log(`accumulateLiability,
  //   liability = ${liability}, type = ${type}, incomeValue = ${incomeValue}`);
  /* 
  // This change breaks
  // 'pay income tax on conditional categorized crystallized pension'
  if(incomeValue === 0){
    return;
  }
  */
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
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
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
  let amountForPensionAllowance = 0.0;
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
  pensionTransactions.forEach(pt => {
    if (getTriggerDate(pt.DATE, triggers) > moment.date) {
      return;
    }
    const tFromValue = parseFloat(pt.FROM_VALUE);
    const tToValue = parseFloat(pt.TO_VALUE);
    // log(`pension transaction ${pt.NAME}`)
    // log(`see if ${showObj(pt)} should affect `
    //  +`this handleIncome moment ${showObj(moment)}`);
    if (moment.name === pt.FROM) {
      // log(`matched transaction ${showObj(pt)}`);

      let amountFrom = 0.0;
      if (pt.FROM_ABSOLUTE) {
        amountFrom = tFromValue;
      } else {
        // e.g. employee chooses 5% pension contribution
        amountFrom = tFromValue * incomeValue;
        // log(`amountFrom = ${tFromValue} * ${incomeValue}`);
      }

      if (!pt.NAME.startsWith(pensionDB)) {
        // A Defined Contributions pension
        // has a name beginnning pensionDC
        //
        // A Defined Benefits Pension
        // has two transactions
        // - one flagged as pension (or pensionSS)
        //   which will decrease cash Increment etc
        // - another flagged as pensionDB
        // whose purpose is solely to setValue on the
        // target benefit
        // log(`pay into pension : ${pt.NAME}`);
        amountForCashIncrement -= amountFrom;
        amountForIncomeTax -= amountFrom;

        if (pt.NAME.startsWith(pensionSS)) {
          amountForNI -= amountFrom;
        }
      }

      let amountForPension = 0;
      if (pt.TO_ABSOLUTE) {
        amountForPension = tToValue;
      } else {
        // e.g. employer increments employee's pension contribution
        amountForPension = tToValue * amountFrom;
      }
      let pensionValue = getNumberValue(values, pt.TO, false);
      if (pt.TO === '') {
        if (printDebug()) {
          log('pension contributions going into void');
        }
      } else if (pensionValue === undefined) {
        log('BUG : contributing to undefined pension scheme');
      } else {
        // log(`old pensionValue is ${pensionValue}`);
        pensionValue += amountForPension;

        // log(`pt.NAME = ${pt.NAME}`);
        if (pt.NAME.startsWith(pensionDB)) {
          // defined benefits pensions
          // take the amount of change to the annual pension value
          // (not the monthly pension value)
          // and scale it by an
          // arbitrary 19* (matches teacher's pension scheme rule)
          // log(`add ${amountForPension}*12*19 to amountForPensionAllowance for ${pt.NAME}`);
          amountForPensionAllowance += amountForPension * 19 * 12;
        } else {
          // defined contributions pensions
          // log(`add ${amountForPension} to amountForPensionAllowance for ${pt.NAME}`);
          amountForPensionAllowance += amountForPension;
        }
        // log(`new pensionValue is ${pensionValue}`);
        // log(`income source = ${transaction.NAME}`);
        // log('in handleIncome:');
        setValue(
          values,
          evaluations,
          moment.date,
          pt.TO,
          pensionValue,
          model,
          pt.NAME,
          '7', //callerID
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
  let person = '';
  let liabilitiesMapKey = moment.name + sourceDescription;
  let liabilityList = liabilitiesMap.get(liabilitiesMapKey); // e.g. "IncomeTaxJoe, NIJoe"
  if (liabilityList === undefined) {
    liabilitiesMapKey = moment.name;
    liabilityList = liabilitiesMap.get(liabilitiesMapKey);
  }
  // log(`for ${liabilitiesMapKey}, liabilityList = ${liabilityList}`);
  if (liabilityList !== undefined) {
    const words: string[] = liabilityList.split(separator);
    words.forEach(liability => {
      // log(`liability = ${liability}`);
      if (liability.endsWith(incomeTax)) {
        accumulateLiability(
          liability,
          incomeTax,
          amountForIncomeTax,
          liableIncomeInTaxYear,
        );
        const thisPerson = liability.substring(
          0,
          liability.length - incomeTax.length,
        );
        if (person === '') {
          person = thisPerson;
        } else if (person !== thisPerson) {
          throw new Error(
            `can't handle multiple people liable from one income`,
          );
        }
      }
      if (liability.endsWith(nationalInsurance)) {
        // log(`NI moment is ${showObj(moment.name)} amount ${amountForNI}`);
        accumulateLiability(
          liability,
          nationalInsurance,
          amountForNI,
          liableIncomeInTaxYear,
        );
        const thisPerson = liability.substring(
          0,
          liability.length - nationalInsurance.length,
        );
        if (person === '') {
          person = thisPerson;
        } else if (person !== thisPerson) {
          throw new Error(
            `can't handle multiple people liable from one income`,
          );
        }
      }
    });
  }

  accumulateLiability(
    `${person}${pensionAllowance}`,
    pensionAllowance,
    amountForPensionAllowance,
    liableIncomeInTaxYear,
  );

  // log(`finished handleIncome`);
}

function logExpenseGrowth(
  expense: Expense,
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
  income: Income,
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
  asset: Asset,
  cpiVal: number,
  growths: Map<string, number>,
  settings: Setting[],
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
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
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
      log(`there's no setting for ${assetVal}`);
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
          `isNumber: level${level}: go set the value of ${assetVal} as number ${parseFloat(
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
        '8', //callerID
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
        log(
          `parsedOK: level${level}: go set the value of ${assetName} as ${assetVal}`,
        );
      }
      setValue(
        values,
        evaluations,
        getTriggerDate(assetStart, model.triggers),
        assetName,
        assetVal,
        model,
        assetName,
        '9', //callerID
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
  triggers: Trigger[],
  rOIStartDate: Date,
  rOIEndDate: Date,
  recurrence: string,
) {
  // log(`in getRecurrentMoments`);
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
    const numAndWordVal = getNumberAndWordParts(x.VALUE);
    if (numAndWordVal.numberPart !== undefined) {
      let startVal = numAndWordVal.numberPart;
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
      newMoments[0].setValue = `${startVal}${numAndWordVal.wordPart}`;
    } else if (monthlyInf === 0) {
      const startVal = x.VALUE;
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
      newMoments[0].setValue = startVal;
    } else {
      throw new Error(`shouldn't see non-number income with growth`);
    }
  }
  // log(`generated ${showObj(newMoments)} for ${x.NAME}`);
  return newMoments;
}

function getAssetMonthlyMoments(
  asset: Asset,
  triggers: Trigger[],
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
  transaction: Transaction,
  triggers: Trigger[],
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

function assetAllowedNegative(assetName: string, asset: Asset) {
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
  t: Transaction,
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  model: ModelData,
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
  // log(`t.TO_VALUE = ${t.TO_VALUE}`);
  let tToValue: string | number | undefined = traceEvaluation(
    t.TO_VALUE,
    values,
    t.TO_VALUE,
  );
  const toVal = tToValue;
  // log(`t.TO = ${t.TO}, tToValue = ${tToValue}`);
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
        `proportional change to an undefined value not implemented, ${t.NAME}`,
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
            // log(`tToValue = '' + ${newNumberPart} + ${parts.wordPart};`);
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
        if (toVal === undefined) {
          throw new Error(`can't interpret scale value ${t.TO_VALUE}`);
        } else {
          // log(`tToValue = '' + ${prevValue} + ${toVal};`);
          tToValue = prevValue * toVal;
        }
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
              accumulateLiability(l, incomeTax, gain, liableIncomeInTaxYear);
            }
          }
        }
      });
    }
    // log(`passing ${t.TO_VALUE} as new value of ${moment.name}`);
    // log('in revalueApplied:');
    if (!t.TO_ABSOLUTE && tToValue !== undefined) {
      setValue(
        values,
        evaluations,
        moment.date,
        w,
        tToValue,
        model,
        revalue,
        '10', //callerID
      );
    } else {
      // log(`revalue ${w} to ${t.TO_VALUE}`);
      setValue(
        values,
        evaluations,
        moment.date,
        w,
        t.TO_VALUE,
        model,
        revalue,
        '11', //callerID
      );
    }
  });
  return true;
}

function calculateFromChange(
  t: Transaction,
  preToValue: number | undefined,
  preFromValue: number,
  fromWord: string,
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
):
  | {
      fromImpact: number;
      toImpact: number;
      cgtPreWhole: number;
      cgtPreChange: number;
    }
  | undefined {
  // log(`t = ${showObj(t)}`)
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
  const tFromValue = traceEvaluation(t.FROM_VALUE, values, t.FROM);
  if (tFromValue === undefined) {
    log(`ERROR : can't interpret ${t.FROM_VALUE}`);
    return undefined;
  }
  const tToValue = parseFloat(t.TO_VALUE);

  const q = getQuantity(fromWord, values, model);
  const fromHasQuantity = q !== undefined;

  // log(`fromHasQuantity = ${fromHasQuantity}, q = ${q}`);

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
      if (fromHasQuantity && q) {
        fromChange = Math.floor(q * tFromValue);
      } else {
        // log(`use proportion of source amount; proportion of ${preFromValue}`);
        fromChange = preFromValue * tFromValue;
      }
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
        // log(`q = ${q}, numberUnits = ${numberUnits}`);
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
      '12', //callerID
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
  const cgtFromImpact = fromChange;
  let cgtPreWhole = preFromValue;
  if (fromHasQuantity && q !== undefined) {
    // log(`don't alter the unit value of a quantised asset`);
    // log(`fromChange was ${fromChange} but reset to 0`)
    // log(`cgtPreWhole * q = ${cgtPreWhole} * ${q}`);
    fromChange = 0; // don't alter the unit value
    cgtPreWhole = cgtPreWhole * q;
    // log(`cgtPreWhole = ${cgtPreWhole}`);
  }
  const result = {
    fromImpact: fromChange,
    toImpact: toChange,
    cgtPreWhole: cgtPreWhole,
    cgtPreChange: cgtFromImpact,
  };
  // log(`returning data for cgt ${showObj(result)}`);
  return result;
}

function calculateToChange(
  t: Transaction,
  preToValue: number | undefined,
  fromChange: number | undefined,
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
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
          '13', //callerID
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
  t: Transaction,
  fromWord: string,
  preFromValue: number, // what the whole from was worth before transaction
  fromChange: number, // the change in whole value of from during transaction
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  model: ModelData,
) {
  // log(`${fromWord} reducing from ${preFromValue} by ${fromChange}`);
  // log(`liabilites are ${liabliitiesMap.get(fromWord)}`);
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
  // log(`proportionSale = ${fromChange} / ${preFromValue} = ${proportionSale}`);
  const purchasePrice = getNumberValue(values, `${purchase}${fromWord}`);
  // log(`purchasePrice = ${purchasePrice}`);
  if (purchasePrice !== undefined) {
    const totalGain = preFromValue - purchasePrice;
    // log(`at ${moment.date}, totalGain = preFromValue - purchasePrice = ${preFromValue} - ${purchasePrice} = ${totalGain}`);
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
      // log(`setting new value for cgt ${currentcgtVal}`);
      cgtMap.set(cgtLiability, currentcgtVal);
      // log(`logged cgt for ${cgtLiability}, accumulated value ${currentcgtVal}`);
    }
    const newPurchasePrice = purchasePrice * (1 - proportionSale);
    // when selling some asset, we reduce the Purchase value
    // of what's left for CGT purposes
    // log(`in handleCGTLiability, set newPurchasePrice = ${newPurchasePrice}`);
    setValue(
      values,
      evaluations,
      moment.date,
      `${purchase}${fromWord}`,
      newPurchasePrice,
      model,
      t.NAME, // TODO no test??
      '13', //callerID
    );
  } else {
    log('BUG!! - CGT liability on an asset with no record of purchase price');
  }
}

export function makeSourceForFromChange(t: Transaction) {
  const sourceDescription = getDisplayName(t.NAME, t.TYPE);
  return sourceDescription;
}

export function makeSourceForToChange(t: Transaction, fromWord: string) {
  let source = t.NAME;
  if (source.startsWith(conditional)) {
    source = fromWord;
  }
  return source;
}

function processTransactionFromTo(
  t: Transaction,
  fromWord: string,
  toWord: string,
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // log(`process t = ${showObj(t)}`);
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
  // log(`for ${t.NAME}, toChange = ${toChange}`);

  // apply fromChange
  if (fromChange !== undefined && preFromValue !== undefined) {
    // log(`fromChange.cgtPreChange = ${fromChange.cgtPreChange}`);// fromChange = loss of value of from asset
    handleCGTLiability(
      t,
      fromWord,
      fromChange.cgtPreWhole, // preFromValue = old value of whole of from asset
      fromChange.cgtPreChange, // fromChange = loss of value of from asset
      moment,
      values,
      evaluations,
      liabliitiesMap,
      liableIncomeInTaxYear,
      model,
    );
    // log(`reduce ${fromWord}'s ${preFromValue} by ${showObj(fromChange)}`);
    // log(`in processTransactionFromTo, setValue of ${fromWord} to ${preFromValue - fromChange.fromImpact}`);
    let newFromValue: string | number;
    const oldVal = values.get(fromWord);
    if (fromChange.fromImpact === 0 && oldVal !== undefined) {
      newFromValue = oldVal;
    } else {
      newFromValue = preFromValue - fromChange.fromImpact;
    }
    setValue(
      values,
      evaluations,
      moment.date,
      fromWord,
      newFromValue,
      model,
      makeSourceForFromChange(t),
      '14', //callerID
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
    if (
      fromWord.startsWith(crystallizedPension) &&
      toWord === CASH_ASSET_NAME
    ) {
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
        '15', //callerID
      );
    }
  } else {
    // special case - if we're reducing an income tax liability
    // because we paid money into a pension
    ///////////////...
    if (t.FROM.endsWith(incomeTax) && t.TO === '') {
      // We're reducing our income tax liability
      // because of a pension scheme contribution.
      // Make a matching addition to our pensionAllowance
      // total too.
      // log(`use up ${fromChange} of ${pensionAllowance} for ${t.FROM}`);
      log(
        `ERROR : one-off income tax adjustment might affect pensionAllowance...no code for this`,
      );
      // throw new Error('unhandled pensionAllowance change');
    }
  }
}

function processTransactionTo(
  t: Transaction,
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
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
    setValue(
      values,
      evaluations,
      moment.date,
      t.TO,
      value,
      model,
      t.NAME,
      '16', //callerID
    );
  }
}

function processTransactionMoment(
  moment: Moment,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
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

  // Determine how much to take off the From asset(s).
  // Set the reduced value of the From asset accordingly.
  if (t.FROM !== '') {
    // we can sometimes see multiple 'FROM's
    // handle one word at a time
    let fromWords = t.FROM.split(separator);
    fromWords = replaceCategoryWithAssetNames(fromWords, model);
    for (const fromWord of fromWords) {
      let toWords: string[] = [];
      if (t.TO !== '') {
        toWords = t.TO.split(separator);
        toWords = replaceCategoryWithAssetNames(toWords, model);
      } else {
        toWords.push('');
      }
      // log(`transaction to "${t.TO}" as list ${toWords}`);
      for (const toWord of toWords) {
        // log(`process a transaction from word ${fromWord} to word ${toWord}`);
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
      }
    }
  } else if (t.FROM === '' && t.TO !== '') {
    // log(`process a transaction from ${t.FROM} to ${t.TO}`);
    processTransactionTo(t, moment, values, evaluations, model);
  }
}

function logPensionIncomeLiabilities(
  t: Transaction,
  liabilitiesMap: Map<string, string>,
  model: ModelData,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  let words = t.FROM.split(separator);

  words = replaceCategoryWithAssetNames(words, model);

  words.forEach(word => {
    if (word.startsWith(crystallizedPension)) {
      const removedCP = `${word.substr(crystallizedPension.length)}`;
      const wds = removedCP.split(dot);
      const liability = `${wds[0]}${incomeTax}`;
      // e.g. IncomeTaxJoe
      // log(`logging liability for ${word}, add to map: [${t.NAME+word}, ${liability}}`);
      liabilitiesMap.set(t.NAME + word, liability);
    }
  });
}

function logAssetIncomeLiabilities(
  a: Asset,
  liabilitiesMap: Map<string, string>,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  if (a.LIABILITY !== '') {
    // log(`logging liability ${showObj(a)}`);
    liabilitiesMap.set(a.NAME, a.LIABILITY);
  } else if (a.NAME.startsWith(crystallizedPension)) {
    const removedCP = `${a.NAME.substr(crystallizedPension.length)}`;
    const wds = removedCP.split(dot);
    const liability = `${wds[0]}${incomeTax}`;
    // e.g. IncomeTaxJoe
    liabilitiesMap.set(a.NAME, liability);
  }
}

function logPurchaseValues(
  a: Asset,
  values: ValuesContainer,
  evaluations: Evaluation[],
  model: ModelData,
) {
  if (a.LIABILITY.includes(cgt)) {
    let purchaseValue = 0.0;
    if (isNumberString(a.PURCHASE_PRICE)) {
      purchaseValue = parseFloat(a.PURCHASE_PRICE);
    } else {
      const tracedValue = traceEvaluation(a.PURCHASE_PRICE, values, a.NAME);
      if (tracedValue === undefined) {
        throw new Error(
          `BUG!! in logPurchaseValues, value of ${a.PURCHASE_PRICE} can't be understood`,
        );
      } else {
        purchaseValue = tracedValue;
      }
    }
    if (a.QUANTITY !== '') {
      purchaseValue *= parseFloat(a.QUANTITY);
    }
    // log(`in logPurchaseValues, setValue: ${purchaseValue}`);
    setValue(
      values,
      evaluations,
      getTriggerDate(a.START, model.triggers),
      `${purchase}${a.NAME}`,
      purchaseValue,
      model,
      `${purchase}${a.NAME}`,
      '17', //callerID
    );
  }
}
class ValuesContainer {
  private values = new Map<string, number | string>([]);
  private includeInReport: ReportValueChecker = (
    name: string, // name of something which has a value
    val: number | string,
    date: Date,
    source: string,
  ) => {
    if (printDebug()) {
      log(`report for name = ${name}`);
      log(`report for val = ${val}`);
      log(`report for date = ${date}`);
      log(`report for source = ${source}`);
    }
    return false;
  };
  private report: ReportDatum[] = [];

  public setIncludeInReport(fn: ReportValueChecker) {
    this.includeInReport = fn;
    this.report = [];
  }

  public set(
    name: string, // thing which has this value
    val: number | string, // the value of the thing
    date: Date,
    source: string,
  ) {
    const reportChange = this.includeInReport(name, val, date, source);
    let oldVal: number | undefined = 0.0;
    if (reportChange) {
      oldVal = traceEvaluation(name, this, 'debugReportOld');
    }
    this.values.set(name, val);
    if (reportChange) {
      const newVal = traceEvaluation(name, this, 'debugReportNew');
      if (oldVal !== newVal) {
        this.report.push({
          name: name,
          oldVal: oldVal,
          newVal: traceEvaluation(name, this, 'debugReportNew'),
          date: date.toString(),
          source: source,
        });
      }
    }
  }

  public get(key: string): number | string | undefined {
    return this.values.get(key);
  }

  public getReport(): ReportDatum[] {
    return this.report;
  }

  public keys() {
    return this.values.keys();
  }
}

// This is the key entry point for code calling from outside
// this file.
export function getEvaluations(
  model: ModelData,
  reporter: ReportValueChecker | undefined,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<string, AssetVal>;
  todaysDebtValues: Map<string, DebtVal>;
  todaysIncomeValues: Map<string, IncomeVal>;
  todaysExpenseValues: Map<string, ExpenseVal>;
  todaysSettingValues: Map<string, SettingVal>;
  reportData: ReportDatum[];
} {
  //log('get evaluations');
  const todaysAssetValues = new Map<string, AssetVal>();
  const todaysDebtValues = new Map<string, DebtVal>();
  const todaysIncomeValues = new Map<string, IncomeVal>();
  const todaysExpenseValues = new Map<string, ExpenseVal>();
  const todaysSettingValues = new Map<string, SettingVal>();

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
      reportData: [],
    };
  }
  // log('in getEvaluations');
  const roiStartDate: Date = makeDateFromString(
    getSettings(model.settings, roiStart, '1 Jan 1999'),
  );
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
  const pensionTransactions: Transaction[] = [];

  // Keep track of current value of any expense, income or asset
  const values = new ValuesContainer();
  if (reporter) {
    values.setIncludeInReport(reporter);
  }

  const cpiInitialVal: number = parseFloat(
    getSettings(model.settings, cpi, '0.0'),
  );
  values.set(cpi, cpiInitialVal, roiStartDate, 'start value');

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
    const incomeStartDate = getTriggerDate(income.START, model.triggers);
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
      while (startOfSource <= incomeStartDate) {
        incomeStartDate.setMonth(incomeStartDate.getMonth() - 1);
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
      incomeStartDate,
      roiEndDate,
      '1m', // all incomes are received monthly
    );
    allMoments = allMoments.concat(newMoments);
    liabilitiesMap.set(income.NAME, income.LIABILITY);
  });

  // log(`liabilitiesMap = ...`);
  // liabilitiesMap.forEach((value, key)=>{log(`{\`${key}\`, \`${value}\`}`)});

  model.assets.forEach(asset => {
    //  log(`log data for asset ${asset.NAME}`);
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

  const setSettingsData: {
    settingName: string;
    settingVal: string;
    setDate: Date;
  }[] = [];
  model.settings.forEach(setting => {
    let referencingPrices = model.assets.filter(a => {
      return a.PURCHASE_PRICE === setting.NAME;
    });
    referencingPrices = referencingPrices.sort();
    if (
      referencingPrices.length > 0 &&
      values.get(setting.NAME) === undefined
    ) {
      setValue(
        values,
        evaluations,
        roiStartDate,
        setting.NAME,
        setting.VALUE,
        model,
        setting.NAME,
        '18', //callerID
      );
    }

    let referencingDates = model.transactions
      .filter(t => {
        // log(`is setting ${setting.NAME} in t.TO  = ${t.TO}?`);
        // does the setting name appear as part of the transaction TO value?
        if (
          t.TO_VALUE.includes(setting.NAME) ||
          t.TO.includes(setting.NAME) ||
          t.FROM_VALUE.includes(setting.NAME) ||
          t.FROM.includes(setting.NAME)
        ) {
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
    referencingDates = referencingDates.concat(
      model.assets
        .filter(a => {
          if (a.GROWTH === setting.NAME) {
            return true;
          }
          return false;
        })
        .map(a => a.START)
        .map(ds => getTriggerDate(ds, model.triggers)),
    );

    // log(`referencingDates for ${setting.NAME} = ${referencingDates.map(d=>d.toDateString())}`);
    referencingDates = referencingDates.sort();
    if (referencingDates.length > 0 && values.get(setting.NAME) === undefined) {
      // log(`setValue ${setting.NAME} = ${setting.VALUE}`);
      setSettingsData.push({
        settingName: setting.NAME,
        settingVal: setting.VALUE,
        setDate: referencingDates[0],
      });
    }
  });
  model.settings.forEach(s => {
    if (
      !setSettingsData.find(sd => {
        return sd.settingName === s.NAME;
      })
    ) {
      // log(`should we add setValue ${s.NAME} = ${s.VALUE}?`);
      // s isn't being set in setSettingsData
      // should we include it?
      // We need it if something in setSettingsData
      // builds on it
      const match = setSettingsData.find(ss => {
        const nameIncluded = ss.settingVal.includes(s.NAME);
        // log(`${ss.settingVal} ? includes ${s.NAME} = ${nameIncluded}`);
        return nameIncluded;
      });
      if (match) {
        // ok, add this too
        // log(`add dependent setValue ${s.NAME} = ${s.VALUE}`);
        setSettingsData.push({
          settingName: s.NAME,
          settingVal: s.VALUE,
          setDate: match.setDate,
        });
      }
    }
  });

  setSettingsData.forEach(d => {
    setValue(
      values,
      evaluations,
      d.setDate,
      d.settingName,
      d.settingVal,
      model,
      d.settingName,
      '18', //callerID
    );
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
            todaysDebtValues.set(asset.NAME, {
              debtVal: val,
              category: asset.CATEGORY,
            });
          } else {
            todaysAssetValues.set(asset.NAME, {
              assetVal: val,
              category: asset.CATEGORY,
            });
          }
          // log(`asset ${asset.NAME} has value ${val}`);
        } else {
          // log(`don't report undefined today's value for ${asset.NAME}`);
        }
      });
      model.incomes.forEach(i => {
        const startDate = checkTriggerDate(i.START, model.triggers);
        if (startDate !== undefined && startDate > today) {
          todaysIncomeValues.set(i.NAME, {
            incomeVal: 0,
            category: i.CATEGORY,
          });
          return;
        }
        const endDate = checkTriggerDate(i.END, model.triggers);
        if (endDate !== undefined && endDate < today) {
          todaysIncomeValues.set(i.NAME, {
            incomeVal: 0,
            category: i.CATEGORY,
          });
          return;
        }
        // log(`income ${i.NAME} ends at ${i.END} not yet ended at ${today}`);
        let val = values.get(i.NAME);
        if (typeof val === 'string') {
          val = traceEvaluation(val, values, val);
        }
        if (val !== undefined) {
          todaysIncomeValues.set(i.NAME, {
            incomeVal: val,
            category: i.CATEGORY,
          });
        } else {
          // log(`don't report undefined today's value for ${i.NAME}`);
        }
      });
      model.expenses.forEach(e => {
        const startDate = checkTriggerDate(e.START, model.triggers);
        if (startDate !== undefined && startDate > today) {
          todaysExpenseValues.set(e.NAME, {
            expenseVal: 0,
            category: e.CATEGORY,
            expenseFreq: e.RECURRENCE,
          });
          return;
        }
        const endDate = checkTriggerDate(e.END, model.triggers);
        if (endDate !== undefined && endDate < today) {
          todaysExpenseValues.set(e.NAME, {
            expenseVal: 0,
            category: e.CATEGORY,
            expenseFreq: e.RECURRENCE,
          });
          return;
        }
        let val = values.get(e.NAME);
        if (typeof val === 'string') {
          val = traceEvaluation(val, values, val);
        }
        if (val !== undefined) {
          // log(`expense for todays value ${showObj(e)}`);
          todaysExpenseValues.set(e.NAME, {
            expenseVal: val,
            expenseFreq: e.RECURRENCE,
            category: e.CATEGORY,
          });
        } else {
          // log(`don't report undefined today's value for ${e.NAME}`);
        }
      });
      model.settings.forEach(s => {
        const val = values.get(s.NAME);
        if (val !== undefined) {
          todaysSettingValues.set(s.NAME, { settingVal: `${val}` });
        } else {
          // log(`don't report undefined today's value for ${s.NAME}`);
        }
      });
    }

    // Each moment we process is in dated order.
    // log(`popped moment is ${showObj(moment)}, `+
    //   `${datedMoments.length} moments left`);

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
      // Log quantities for assets which have them; needed for setting value.
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
            '19', //callerID
          );
        }
        const matchingAsset: Asset[] = model.assets.filter(a => {
          return a.NAME === moment.name;
        });
        if (matchingAsset.length === 1) {
          const a = matchingAsset[0];
          // log(`matched asset for start`);
          logPurchaseValues(a, values, evaluations, model);
          if (a.CATEGORY === rsu) {
            // log(`found vesting RSUs ${a.NAME}`);
            const l = a.LIABILITY;
            const liabilityWords = l.split(separator);
            liabilityWords.forEach(lw => {
              if (!lw.endsWith(incomeTax) && !lw.endsWith(nationalInsurance)) {
                return;
              }
              const val = traceEvaluation(a.VALUE, values, 'source');
              const qty = traceEvaluation(a.QUANTITY, values, 'source');
              // log(`val = ${val}, qty = ${qty}`);
              if (val === undefined || qty === undefined) {
                throw new Error('!!');
              } else {
                const amountDueForIncomeTax = val * qty;
                // log(`amountDueForIncomeTax = ${amountDueForIncomeTax}`)
                if (lw.endsWith(incomeTax)) {
                  accumulateLiability(
                    lw,
                    incomeTax,
                    amountDueForIncomeTax,
                    liableIncomeInTaxYear,
                  );
                }
                if (lw.endsWith(nationalInsurance)) {
                  accumulateLiability(
                    lw,
                    nationalInsurance,
                    amountDueForIncomeTax,
                    liableIncomeInTaxYear,
                  );
                }
                setValue(
                  values,
                  evaluations,
                  moment.date,
                  `${vestedEval}${a.NAME}`,
                  val,
                  model,
                  `Vesting${a.NAME}`,
                  '30', //callerID
                );
                setValue(
                  values,
                  evaluations,
                  moment.date,
                  `${vestedNum}${a.NAME}`,
                  qty,
                  model,
                  `Vesting${a.NAME}`,
                  '30', //callerID
                );
              }
            });
          }
        } else {
          throw new Error(`BUG!!! '${moment.name}' doesn't match one asset`);
        }
      }
      const startValue = moment.setValue;
      // log(`in getEvaluations starting something: ${moment.name} with value ${startValue}`);
      setValue(
        values,
        evaluations,
        moment.date,
        moment.name,
        startValue,
        model,
        moment.name, // e.g. Cash (it's just the starting value)
        '20', //callerID
      );
      if (moment.type === momentType.incomeStart) {
        const numberVal = traceEvaluation(startValue, values, moment.name);
        if (numberVal !== undefined) {
          handleIncome(
            numberVal,
            moment,
            values,
            evaluations,
            model,
            pensionTransactions,
            liabilitiesMap,
            liableIncomeInTaxYear,
            moment.name,
          );
        } else {
          throw new Error(`can't interpret ${startValue} as a number`);
        }
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
      let numberVal: string | number | undefined = traceEvaluation(
        moment.name,
        values,
        moment.name,
      );
      // log(`value of ${moment.name} is ${numberVal}`);
      if (numberVal === undefined) {
        const val = values.get(moment.name);
        if (val !== undefined) {
          setValue(
            values,
            evaluations,
            moment.date,
            moment.name,
            val,
            model,
            growth,
            '21', //callerID
          );
        }
      } else {
        const inf = getGrowth(moment.name, growths);
        if (printDebug()) {
          log(`change = numberVal * inf = ${numberVal * inf}`);
        }
        const change = numberVal * inf;
        numberVal += change;

        let val: string | number = numberVal;
        if (change === 0) {
          const storedVal = values.get(moment.name);
          if (storedVal !== undefined) {
            val = storedVal;
          }
        }

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
          val,
          model,
          growth,
          '22', //callerID
        );
        // }
        if (moment.type === momentType.asset) {
          // some assets experience growth which is
          // liable for tax
          // log(`asset moment for growth : ${moment.date}, ${moment.name}`);
          if (moment.name.startsWith(crystallizedPension) && change > 0) {
            // log(`skip asset moment for growth : ${moment.date}, ${moment.name}, ${change}`);
          } else {
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
          }
        } else if (moment.type === momentType.income) {
          handleIncome(
            numberVal,
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
          adjustCash(
            -val,
            moment.date,
            values,
            evaluations,
            model,
            moment.name,
          );
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
    reportData: values.getReport(),
  };
  // log(`result.reportData.length = ${result.reportData.length}`);
  return result;
}
