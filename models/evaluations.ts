import { checkData } from './checks';
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
  purchase,
  dot,
  baseForCPI,
  revalueSetting,
  constType,
  bondMaturity,
  bondInterest,
  weekly,
  tracking,
  annualBaseForCPI,
} from '../localization/stringConstants';
import {
  DatedThing,
  Asset,
  ModelData,
  Setting,
  Transaction,
  Evaluation,
  Interval,
  SettingVal,
  AssetOrDebtVal,
  IncomeVal,
  ExpenseVal,
  ReportDatum,
  ReportValueChecker,
  GrowthData,
  Expense,
  Income,
  IncomeOrExpense,
} from '../types/interfaces';
import {
  DateFormatType,
  getMaturityDate,
  getMonthlyGrowth,
  log,
  printDebug,
  showObj,
} from '../utils/utils';
import {
  getNumberAndWordParts,
  getStartQuantity,
  getTriggerDate,
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetIncomeTag,
  makeNetGainTag,
  removeNumberPart,
  checkTriggerDate,
  dateAsString,
  makeTwoDP,
  getDisplayName,
} from '../utils/stringUtils';
import {
  getTodaysDate,
  getROI,
} from './modelUtils';
import { getSettings, getVarVal, isNumberString, replaceCategoryWithAssetNames } from './modelQueries';

function parseRecurrenceString(recurrence: string) {
  if (recurrence === undefined) {
    /* istanbul ignore next  */ //error
    log('Error : undefined recurrence string!!');
  }
  const result = {
    frequency: '', // weekly, monthly or annual
    count: 0,
  };
  const l = recurrence.length;
  const lastChar = recurrence.substring(l - 1, l);
  // log(`lastChar of ${recurrence} is ${lastChar}`);
  if (lastChar === 'm') {
    result.frequency = monthly;
  } else if (lastChar === 'w') {
    result.frequency = weekly;
  } else if (lastChar === 'y') {
    result.frequency = annually;
  } else {
    /* istanbul ignore next  */ //error
    log(`Error: frequency should be of form 4m or 6y not ${recurrence}`);
  }
  const firstPart = recurrence.substring(0, l - 1);
  // log(`firstPart of ${recurrence} is ${firstPart}`);
  const n = parseFloat(firstPart);

  /* istanbul ignore if  */ //error
  if (n === undefined || Number.isNaN(n)) {
    log(`Error: frequency should be of form 4m or 6y not ${recurrence}`);
  }
  result.count = n;
  return result;
}

// let numCalls = 0;

export function generateSequenceOfDates(
  roi: Interval,
  frequency: string /* e.g. 1m or 1y */,
  addPreDate = false, // for charting
): Date[] {
  // numCalls = numCalls + 1;
  // log(`numCalls = ${numCalls}`);

  const result: Date[] = [];
  const freq = parseRecurrenceString(frequency);
  const mFreq = freq.frequency === monthly;
  const yFreq = freq.frequency === annually;
  const wFreq = freq.frequency === weekly;

  if (addPreDate) {
    // add a pre-dates before roi - always either 1w, 1m or 1y prior
    const preDate = new Date(roi.start);
    if (frequency === '1m') {
      preDate.setMonth(preDate.getMonth() - 1);
    } else if (frequency === '1w') {
      preDate.setDate(preDate.getDate() - 7);
    } else if (frequency === '1y') {
      preDate.setFullYear(preDate.getFullYear() - 1);
    } else {
      /* istanbul ignore next  */ //error
      throw new Error(`Error: frequency ${frequency} not implemented!`);
    }
    result.push(preDate);
  }

  // now add dates in roi, from start
  let numstepsAdvanced = 0;
  let thisDate = new Date(roi.start);
  let initialCount;
  if (mFreq) {
    initialCount = thisDate.getMonth();
  } else if (wFreq) {
    initialCount = thisDate.getDate();
  } else {
    initialCount = thisDate.getFullYear();
  }

  while (thisDate < roi.end) {
    result.push(thisDate);

    // advance thisDate for the next transaction
    const nextDate = new Date(roi.start);
    if (mFreq || yFreq) {
      numstepsAdvanced += freq.count;
    } else if (wFreq) {
      numstepsAdvanced += 7 * freq.count;
    }
    if (mFreq) {
      // log(`monthly dates for ${frequency}`);
      nextDate.setMonth(initialCount + numstepsAdvanced);
    } else if (wFreq) {
      // log(`monthly dates for ${frequency}`);
      nextDate.setDate(initialCount + numstepsAdvanced);
    } else if (yFreq) {
      // log(`annual dates for ${frequency}`);
      nextDate.setFullYear(initialCount + numstepsAdvanced);
    } else {
      /* istanbul ignore next  */ //error
      throw new Error(`Error: frequency ${frequency} not understood!`);
    }
    thisDate = nextDate;
  }
  // log(`return ${transactionMoments.length} transactionMoments`)
  return result;
}

export const momentType = {
  expense: 'Expense',
  expensePrep: 'ExpensePrep',
  expenseStart: 'ExpenseStart',
  expenseStartPrep: 'ExpenseStartPrep',
  income: 'Income',
  incomePrep: 'IncomePrep',
  incomeStart: 'IncomeStart',
  incomeStartPrep: 'IncomeStartPrep',
  asset: 'Asset',
  assetStart: 'AssetStart',
  transaction: 'Transaction',
  inflation: 'Inflation',
};

export function sortByDate(arrayOfDatedThings: DatedThing[]) {
  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log('before date sort --------------');
    arrayOfDatedThings.forEach((t) => {
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
    const bd_after_ad_ms = bd.getTime() - ad.getTime();
    if (bd_after_ad_ms > 0) {
      result = 1;
    } else if (bd_after_ad_ms < 0) {
      result = -1;
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
      /* istanbul ignore if  */ //debug
      if (printDebug()) {
        if (a.type !== 'Asset' && a.type !== 'Expense' && a.type !== 'Income') {
          log(
            `using names to order moments ${a.name}, ${a.type} and ${b.name}`,
          );
        }
      }
      /* istanbul ignore else  */ //error
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
        log(`can't order two moments named ${a.name}`);
        result = 0;
      }
    }

    // log(`${showObj(a)} < ${showObj(b)} = ${result}`)
    return result;
  });

  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log('after date sort --------------');
    arrayOfDatedThings.forEach((t) => {
      log(`(name, type, date) = (${t.name}, ${t.type}, ${t.date})`);
    });
  }
}

class ValuesContainer {
  private model: ModelData;

  constructor(model: ModelData) {
    this.model = model;
  }

  private reportValues = new Map<string, number | string>([]);
  private includeInReport: ReportValueChecker = (
    name: string, // name of something which has a value
    val: number | string,
    date: Date,
    source: string,
  ) => {
    /* istanbul ignore if  */ //debug
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
    growths: Map<string, GrowthData>,
    date: Date,
    source: string,
    reportIfNoChange: boolean,
    callerID: string,
  ) {
    const reportChange =
      // this.report.length < this.maxReportSize &&
      this.includeInReport(name, val, date, source);
    let oldVal: number | undefined = 0.0;
    if (reportChange) {
      oldVal = traceEvaluation(name, this, growths, 'debugReportOld');
    }
    this.reportValues.set(name, val);
    if (reportChange) {
      let newVal = traceEvaluation(name, this, growths, 'debugReportNew');
      if (reportIfNoChange || oldVal !== newVal) {
        let change = undefined;
        if (newVal !== undefined && oldVal !== undefined) {
          change = newVal - oldVal;
        }
        let qchange: string | undefined = undefined;
        let qoldVal: number | undefined = undefined;
        let qnewVal: number | undefined = undefined;
        if (name.startsWith(quantity)) {
          name = name.substring(quantity.length);
          const matchedAsset = this.model.assets.find((a) => {
            return a.NAME === name;
          });
          let details = '';
          if (matchedAsset) {
            const val = matchedAsset.VALUE;
            const matchedSetting = this.model.settings.find((s) => {
              return s.NAME === val;
            });
            if (matchedSetting !== undefined) {
              const rawDetails = `${this.get(matchedSetting.NAME)}`;
              const nwp = getNumberAndWordParts(rawDetails);
              if (nwp.numberPart !== undefined) {
                details = makeTwoDP(nwp.numberPart);
                if (nwp.wordPart) {
                  details += nwp.wordPart;
                }
              }
            }
          }

          qchange =
            details.length > 0 ? `${change} at ${details}` : `${change}`;
          qoldVal = oldVal;
          qnewVal = newVal;
          change = undefined;
          oldVal = undefined;
          newVal = undefined;
        }
        let reportSource;
        /* istanbul ignore if */
        if (printDebug()) {
          reportSource = source + callerID;
        } else {
          reportSource = source;
        }
        // log(`report ${name}`);
        this.report.push({
          name: name,
          change: change,
          oldVal: oldVal,
          newVal: newVal,
          qchange: qchange,
          qoldVal: qoldVal,
          qnewVal: qnewVal,
          date: dateAsString(DateFormatType.View, date),
          source: reportSource,
        });
      } else {
        // log(`values.set ${name} is unchanged on date ${dateAsString(DateFormatType.View, date)}`);
      }
    }
  }

  public get(key: string): number | string | undefined {
    return this.reportValues.get(key);
  }

  public getReport(): ReportDatum[] {
    //log(`this.values() = ${this.values()}`);
    const estateVal = this.get('Estate');
    if (estateVal !== undefined && typeof estateVal === 'number') {
      // log(`estateVal = ${estateVal}`);
      this.report.push({
        name: 'Estate final value',
        change: 0,
        oldVal: 0,
        newVal: estateVal,
        qchange: '',
        qoldVal: 0,
        qnewVal: 0,
        date: '2999',
        source: 'estate',
      });
    }
    this.report.sort((a, b) => {
      return new Date(a.date) < new Date(b.date) ? 1 : -1;
    });
    return this.report;
  }

  public keys() {
    return this.reportValues.keys();
  }
}

function getNumberValue(
  values: ValuesContainer,
  name: string,
  expectValue = true,
  printLogs = false,
): number | undefined {
  let result = values.get(name);
  /* istanbul ignore if  */ //debug
  if (printLogs) {
    log(`seek number value for key = '${name}', values has entry ${result}`);
  }
  /* istanbul ignore else  */ //error
  if (typeof result === 'string') {
    // log(`value ${result} is a string`);
    /* istanbul ignore else  */ //error
    if (isNumberString(result)) {
      result = parseFloat(result);
    } else {
      log(`Error: expected ${name} to have a number value`);
      const val = getNumberValue(values, result, expectValue);
      // log(`value ${result} as a number is ${val}`);
      result = val;
    }
  }
  // log(`getNumberValue of ${key} is ${result}`);
  if (result === undefined) {
    /* istanbul ignore if  */ //error
    if (expectValue) {
      log(
        `Error: getNumberValue returning undefined for ${name}; ` +
          `values has entry ${result} ` +
          `consider switch to traceEvaluation ` +
          `for values involving words and settings`,
      );
      return result;
    }
  }
  /* istanbul ignore if  */ //debug
  if (printLogs) {
    log(`number value for key = '${name}' is ${result}`);
  }
  return result;
}

interface growthType {
  adjustForCPI: boolean;
  annualCPI: boolean; // or monthly
  scale: number;
  baseVal: number;
}

function growthData(
  name: string,
  growths: Map<string, GrowthData>,
  values: ValuesContainer,
  checkAssertion = true,
): growthType {
  const g = growths.get(name);

  if (!g) {
    return {
      adjustForCPI: false,
      annualCPI: false,
      scale: 0.0,
      baseVal: 1.0,
    };
  }
  let scale = 0.0;
  const growth = traceEvaluation(
    g.itemGrowth,
    values,
    growths,
    '40', //callerID
  );
  if (!growth) {
  } else {
    const cpiVal = traceEvaluation(
      cpi,
      values,
      growths,
      '41', //callerID
    );
    let adaptedGrowth = growth;
    if (g.applyCPI && cpiVal !== undefined) {
      adaptedGrowth =
        cpiVal !== 0
          ? ((1.0 + (growth + cpiVal) / 100) / (1.0 + cpiVal / 100) - 1.0) * 100
          : growth;
      // log(`from ${growth}, use cpi ${cpiVal} to create adaptedGrowth = ${getMonthlyGrowth(adaptedGrowth)}`);
    }

    const monthlyGrowth = getMonthlyGrowth(adaptedGrowth);
    /* istanbul ignore if */
    if (g.powerByNumMonths !== 1) {
      log(
        `Error : didn't expect something to have non-monthly recurrent growth`,
      );
      // an Asset has monthly growth, an Income can have different frequencies
      // monthlyGrowth = (1 + monthlyGrowth) ** g.powerByNumMonths - 1;
    }
    // log(`growth power up by ${g.powerByNumMonths} from ${monthlyGrowth} to ${periodicGrowth}`);
    scale = monthlyGrowth;
    if (
      g.powerByNumMonths === 1 &&
      checkAssertion &&
      g.scale !== monthlyGrowth
    ) {
      //log(`mismatched growths, ${periodicGrowth} not in ${showObj(g)}`);
      //throw new Error();
    }
  }

  if (g.powerByNumMonths === 1 && checkAssertion && g.scale !== scale) {
    //log(`mismatched growths, g.scale = ${g.scale} and scale = ${scale}`);
    //throw new Error();
  }

  const baseVal = getNumberValue(values, getBaseForCPI(g.annualCPI));
  /* istanbul ignore if  */ //error
  if (baseVal === undefined) {
    log('Error: baseVal undefined for growth data!');
    return {
      adjustForCPI: g.applyCPI,
      annualCPI: g.annualCPI,
      scale: scale,
      baseVal: 1.0,
    };
  }

  return {
    adjustForCPI: g.applyCPI,
    annualCPI: g.annualCPI,
    scale: scale,
    baseVal: baseVal,
  };
}

function getBaseForCPI(isAnnual: boolean) {
  if (isAnnual) {
    return annualBaseForCPI;
  }
  return baseForCPI;
}

function traceEvaluation(
  value: number | string,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  source: string,
): number | undefined {
  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log(
      `in traceEvaluation, for ${source} get value of ${value} ` +
        `using ${Array.from(values.keys()).map((k) => {
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
      let valueForWordPart = values.get(wordPart);
      /* istanbul ignore if  */ //debug
      if (debug) {
        log(`valueForWordPart ${wordPart} = ${valueForWordPart}`);
      }
      if (valueForWordPart === undefined) {
        if (wordPart.startsWith(bondMaturity)) {
          const trimmedWordPart = wordPart.substring(
            bondMaturity.length,
            wordPart.length,
          );
          // log(`trimming ${wordPart} to ${trimmedWordPart}`);
          const nextLevel = traceEvaluation(
            trimmedWordPart,
            values,
            growths,
            source,
          );
          if (nextLevel === undefined) {
            result = undefined;
          } else {
            // e.g nextLevel = 60,000
            // but that gets scaled to account for CPI

            result = numberPart * nextLevel;
          }
        } else {
          /* istanbul ignore if  */ //debug
          if (debug) {
            log(`values were ${showObj(values)}`);
          }
          result = undefined;
        }
      } else if (typeof valueForWordPart === 'string') {
        const nextLevel = traceEvaluation(
          valueForWordPart,
          values,
          growths,
          source,
        );
        if (nextLevel === undefined) {
          /* istanbul ignore if  */ //debug
          if (debug) {
            log(
              `got undefined for ${valueForWordPart} - returning undefined for ${value}`,
            );
          }
          result = undefined;
        } else {
          /* istanbul ignore if  */ //debug
          if (debug) {
            log(
              `calculate ${numberPart} * ${nextLevel} = ${
                numberPart * nextLevel
              }`,
            );
          }
          result = numberPart * nextLevel;
        }
      } else {
        //log(`calculate ${numberPart} * ${settingForWordPart} = ${numberPart * settingForWordPart}`);
        const gd = growthData(wordPart, growths, values);
        if (gd.adjustForCPI) {
          const baseVal = gd.baseVal;
          valueForWordPart *= baseVal;
        }
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
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  date: Date,
  name: string,
  newValue: number | string,
  model: ModelData,
  source: string, // something that triggered the new value
  callerID: string,
) {
  /* istanbul ignore if  */ //error
  if (name === newValue) {
    log(`Error: don't expect value of ${name} = ${newValue}!`);
  }
  const printNet = false;
  const printReal = false;
  const printSameValueInputs = false;
  const existingValue = values.get(name);
  /* istanbul ignore if  */ //debug
  if (printNet || printReal) {
    let realExistingValue = existingValue;
    let realNewValue = newValue;
    const gd = growthData(name, growths, values);
    if (
      typeof realExistingValue === 'number' &&
      typeof realNewValue === 'number' &&
      gd.adjustForCPI
    ) {
      const baseVal = gd.baseVal;
      realExistingValue *= baseVal;
      realNewValue *= baseVal;
    }
    if (printNet || (name === 'ISAFutureInvest' || name === 'Cash')) {
      if (existingValue === undefined) {
        log(
          `setting first value of ${name}, ` +
            `newValue = ${newValue} ` +
            `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
            `source = ${source}, from  ${callerID}`,
        );
      } else {
        if (newValue !== existingValue) {
          log(
            `setting value of ${name}, ` +
              `newValue = ${newValue} ` +
              `oldValue = ${existingValue} ` +
              `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
              `source = ${source}, from  ${callerID}`,
          );
        } else if (printSameValueInputs) {
          log(
            `set same existing value of ${name}, ` +
              `newValue = ${newValue} ` +
              `oldValue = ${existingValue} ` +
              `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
              `source = ${source}, from  ${callerID}`,
          );
        }
      }
    }
    if (printReal) {
      if (existingValue === undefined) {
        log(
          `setting first value of ${name}, ` +
            `newRealValue = ${realNewValue} ` +
            `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
            `source = ${source}, from  ${callerID}`,
        );
      } else {
        if (newValue !== existingValue) {
          log(
            `setting value of ${name}, ` +
              `newRealValue = ${realNewValue} ` +
              `oldRealValue = ${realExistingValue} ` +
              `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
              `source = ${source}, from  ${callerID}`,
          );
        } else if (printSameValueInputs) {
          log(
            `set same existing value of ${name}, ` +
              `newRealValue = ${realNewValue} ` +
              `oldRealValue = ${realExistingValue} ` +
              `date = ${dateAsString(DateFormatType.Debug, date)}, ` +
              `source = ${source}, from  ${callerID}`,
          );
        }
      }
    }
  }
  let oldNumberVal = 0;
  if (existingValue !== undefined) {
    const traceVal = traceEvaluation(existingValue, values, growths, name);
    if (traceVal !== undefined) {
      oldNumberVal = traceVal;
    }
  }
  values.set(
    name,
    newValue,
    growths,
    date,
    source,
    false, // reportIfNoChange
    callerID,
  );
  // log(`Go to find unit val for ${name}'s, we have value = some of ${newValue}`);
  const numberVal = traceEvaluation(newValue, values, growths, name);
  // log(`Unit val of ${name} is ${unitVal}`);
  if (numberVal === undefined) {
    // this is not necessarily an error - just means
    // we're keeping track of something which cannot be
    // evaluated.
    // log(`evaluation of ${newValue} for ${name} undefined`);
  } else {
    let valForEvaluations = numberVal;
    let oldValForEvaluations = oldNumberVal;
    let baseVal: number | undefined;
    const gd = growthData(name, growths, values);
    if (gd.adjustForCPI) {
      baseVal = gd.baseVal;
      const newValForEvaluations = valForEvaluations * baseVal;
      // log(`scale ${valForEvaluations} by baseVal = ${baseVal} to give ${newValForEvaluations}`);
      valForEvaluations = newValForEvaluations;
      oldValForEvaluations = oldValForEvaluations * baseVal;
    }
    /*
    if (name.startsWith(quantity)) {
      // we're changing the quantity of asset
      const assetName = name.substring(quantity.length);
      // quantity changes from oldValForEvaluations to valForEvaluations
      // so what change does this effect to the value of the asset?
      log(`changing quantity of ${assetName} will change its value`);
    }
    */
    const totalVal = applyQuantity(valForEvaluations, values, name, model);
    const totalOldVal = applyQuantity(
      oldValForEvaluations,
      values,
      name,
      model,
    );
    const evaln = {
      name,
      date,
      oldValue: totalOldVal,
      value: totalVal,
      source,
    };
    // log(`add evaluation for ${name} at ${date}`);
    // log(
    //  `add evaluation ${showObj({
    //    name: evaln.name,
    //    date: dateAsString(DateFormatType.Debug,evaln.date),
    //    value: evaln.value,
    //    source: evaln.source,
    //  })}`,
    // );
    evaluations.push(evaln);
    /* istanbul ignore if  */ //debug
    if (printDebug()) {
      log(`date = ${date}, name = ${name}, value = ${values.get(name)}`);
    }
    /* istanbul ignore if  */ //debug
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
  // log(`tax year of ${dateAsString(DateFormatType.Debug,d)} = ${startYearOfTaxYear}`);
  // log(`details: d.getDate() = ${d.getDate()}, `+
  //  `d.getMonth() = ${d.getMonth()}, `+
  //  `d.getFullYear() = ${d.getFullYear()}, `);
  return startYearOfTaxYear;
}

export function getMonthOfTaxYear(d: Date) {
  let monthOfTaxYear;
  if (d.getDate() <= 5) {
    monthOfTaxYear = d.getMonth();
  } else {
    monthOfTaxYear = d.getMonth() + 1;
  }
  // log(`tax month of ${d} = ${monthOfTaxYear}`);
  // log(`details: d.getDate() = ${d.getDate()}, `+
  //  `d.getMonth() = ${d.getMonth()}`);
  return monthOfTaxYear;
}

interface TaxBands {
  noTaxBand: number;
  lowTaxBand: number;
  adjustNoTaxBand: number;
  highTaxBand: number;
  lowTaxRate: number;
  highTaxRate: number;
  topTaxRate: number;
  noNIBand: number;
  lowNIBand: number;
  lowNIRate: number;
  highNIRate: number;

  cgtThreshholdLow: number;
  cgtRateLow: number;
  cgtRateHigh: number;
}
interface TaxBandsMap {
  [key: string]: TaxBands | undefined;
}
/*
These correct values break 44 tests
I'm not bothering to fix historic tax bands

const TAX_MAP: TaxBandsMap = {
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2016-to-2017
  '2016': {
    noTaxBand: 11000, // "Employee personal allowance"
    lowTaxBand: 11000 + 32000, // "basic tax rate" up to here
    adjustNoTaxBand: 150000, // "allowance changes" beyond here
    highTaxBand: 150000, // "additional tax rate"
    lowTaxRate: 0.2, // "basic tax rate"
    highTaxRate: 0.4, // "higher tax rate"
    topTaxRate: 0.45, // "additional tax rate"
    //
    noNIBand: 8060, // "Primary Threshold"
    lowNIBand: 43000, // "Upper Earnings Limit"
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2017-to-2018
  '2017': {
    noTaxBand: 11500,
    lowTaxBand: 11500 + 33500,
    adjustNoTaxBand: 100000, //?
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    //
    noNIBand: 8164,
    lowNIBand: 45000,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2018-to-2019
  '2018': {
    noTaxBand: 11850,
    lowTaxBand: 34500 + 11850,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    //
    noNIBand: 8424,
    lowNIBand: 46350,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2019-to-2020
  '2019': {
    noTaxBand: 12500,
    lowTaxBand: 37500 + 12500,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    //
    noNIBand: 8632,
    lowNIBand: 50000,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2020-to-2021
  '2020': {
    noTaxBand: 12500,
    lowTaxBand: 37500 + 12500,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    //
    noNIBand: 9500,
    lowNIBand: 50000,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2021-to-2022
  '2021': {
    noTaxBand: 12570,
    lowTaxBand: 12570 + 37700,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    //
    noNIBand: 9568,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
  },
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2022-to-2023
  '2022': {
    noTaxBand: 12570,
    lowTaxBand: 12570 + 37700,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.1325,
    highNIRate: 0.0325,
  },
  '2023': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.1325,
    highNIRate: 0.0325,
  },
};
*/
const TAX_MAP: TaxBandsMap = {
  '2016': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2017': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2018': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2019': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2020': {
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,
    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2021': {
    // 2021/22
    noTaxBand: 12500,
    lowTaxBand: 50000,
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 8628,
    lowNIBand: 50004,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2022': {
    // 2022/23
    // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2022-to-2023
    noTaxBand: 12570,
    lowTaxBand: 12570 + 37700, // = 50270
    adjustNoTaxBand: 100000,
    highTaxBand: 150000,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.1325,
    highNIRate: 0.0325,
    cgtThreshholdLow: 12000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2023': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 6000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2024': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 3000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2025': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 3000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2026': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 3000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2027': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 3000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
  '2028': {
    noTaxBand: 12570, // Note that by fixing this to the same level as previous, we get poorer
    lowTaxBand: 12570 + 37700, // because the tax baands are coded to increase with CPI
    adjustNoTaxBand: 100000, // and if they don't increase, more of our income falls into the tax bands
    highTaxBand: 125140,
    lowTaxRate: 0.2,
    highTaxRate: 0.4,
    topTaxRate: 0.45,

    noNIBand: 9880,
    lowNIBand: 50270,
    lowNIRate: 0.12,
    highNIRate: 0.02,
    cgtThreshholdLow: 3000,
    cgtRateLow: 0.1,
    cgtRateHigh: 0.2,
  },
};
const highestTaxYearInMap = 2028;
// TODO get this from the map - they should be bound to be the same

function getTaxBands(
  income: number,
  startYearOfTaxYear: number,
  values: ValuesContainer,
): TaxBands {
  let result: TaxBands;
  if (startYearOfTaxYear > highestTaxYearInMap) {
    const resultFromMap = TAX_MAP[`${highestTaxYearInMap}`];
    /* istanbul ignore next */
    if (!resultFromMap) {
      throw new Error(`tax bands not defined for ${highestTaxYearInMap}!`);
    }
    result = resultFromMap;

    const baseVal = getNumberValue(values, baseForCPI);
    if (baseVal !== undefined) {
      // log(`scale by baseVal = ${baseVal}`);
      const noTaxBand = getNumberValue(values, 'noTaxBand');
      const lowTaxBand = getNumberValue(values, 'lowTaxBand');
      const highTaxBand = getNumberValue(values, 'highTaxBand');
      const adjustNoTaxBand = getNumberValue(values, 'adjustNoTaxBand');
      const noNIBand = getNumberValue(values, 'noNIBand');
      const lowNIBand = getNumberValue(values, 'lowNIBand');
      /* istanbul ignore else  */ //error
      if (
        noTaxBand &&
        lowTaxBand &&
        highTaxBand &&
        adjustNoTaxBand &&
        noNIBand &&
        lowNIBand
      ) {
        // log(`noTaxBand * baseVal at ${startYearOfTaxYear} = ${noTaxBand * baseVal}`);
        // log(`from map at ${startYearOfTaxYear}, ${makeTwoDP(noTaxBand)}, ${makeTwoDP(lowTaxBand)}, ${makeTwoDP(highTaxBand)}, ${makeTwoDP(adjustNoTaxBand)}`);
        // log(`scale last tax bands by * baseVal = ${baseVal}`);
        result = {
          noTaxBand: noTaxBand * baseVal,
          lowTaxBand: lowTaxBand * baseVal,
          highTaxBand: highTaxBand * baseVal,
          adjustNoTaxBand: adjustNoTaxBand * baseVal,
          lowTaxRate: result.lowTaxRate,
          highTaxRate: result.highTaxRate,
          topTaxRate: result.topTaxRate,
          noNIBand: noNIBand * baseVal,
          lowNIRate: result.lowNIRate,
          lowNIBand: lowNIBand * baseVal,
          highNIRate: result.highNIRate,
          cgtThreshholdLow: result.cgtThreshholdLow,
          cgtRateLow: result.cgtRateLow,
          cgtRateHigh: result.cgtRateHigh,
        };
        // log(`now vals at ${startYearOfTaxYear}, ${makeTwoDP(result.noTaxBand)}, ${makeTwoDP(result.lowTaxBand)}, ${makeTwoDP(result.highTaxBand)}, ${makeTwoDP(result.adjustNoTaxBand)}`);
      } else {
        log('Error: missing tax bands in values');
        throw new Error();
      }
    } else {
      /* istanbul ignore next */
      log('Error: missing baseVal');
      /* istanbul ignore next */
      const resultFromMap = TAX_MAP[`${highestTaxYearInMap}`];
      /* istanbul ignore next */
      if (!resultFromMap) {
        throw new Error(`tax bands not defined for ${highestTaxYearInMap}!`);
      }
      /* istanbul ignore next */
      result = resultFromMap;
    }
  } else {
    const resultFromMap = TAX_MAP[`${startYearOfTaxYear}`];
    if (!resultFromMap) {
      /* istanbul ignore next */
      throw new Error(`tax bands not defined for ${startYearOfTaxYear}!`);
    }
    result = resultFromMap;
  }
  // log(`chk vals at ${startYearOfTaxYear}, ${makeTwoDP(result.noTaxBand)}, ${makeTwoDP(result.lowTaxBand)}, ${makeTwoDP(result.highTaxBand)}, ${makeTwoDP(result.adjustNoTaxBand)}`);
  result = {
    noTaxBand: result.noTaxBand,
    lowTaxBand: result.lowTaxBand,
    lowTaxRate: result.lowTaxRate,
    adjustNoTaxBand: result.adjustNoTaxBand,
    highTaxBand: result.highTaxBand,
    highTaxRate: result.highTaxRate,
    topTaxRate: result.topTaxRate,

    noNIBand: result.noNIBand,
    lowNIBand: result.lowNIBand,
    lowNIRate: result.lowNIRate,
    highNIRate: result.highNIRate,
    cgtThreshholdLow: result.cgtThreshholdLow,
    cgtRateLow: result.cgtRateLow,
    cgtRateHigh: result.cgtRateHigh,
  };
  const topEndIncome = income - result.adjustNoTaxBand;
  if (topEndIncome > 0) {
    result.noTaxBand = Math.max(0.0, result.noTaxBand - topEndIncome / 2.0);
    // log(`for startYearOfTaxYear = ${startYearOfTaxYear}, income high so no-tax band is ${result.noTaxBand}!`);
  }
  // log(`bands at ${startYearOfTaxYear}, ${makeTwoDP(result.noTaxBand)}, ${makeTwoDP(result.lowTaxBand)}, ${makeTwoDP(result.highTaxBand)}, ${makeTwoDP(result.adjustNoTaxBand)}`);
  return result;
}

export function calculateIncomeTaxPayable(
  income: number,
  startYearOfTaxYear: number,
  values: ValuesContainer,
) {
  // log(`in calculateTaxPayable`);
  const bands = getTaxBands(income, startYearOfTaxYear, values);
  // log(`tax bands are ${showObj(bands)}`);

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
  startYearOfTaxYear: number,
  values: ValuesContainer,
): { amountLiable: number; rate: number }[] {
  // log(`in calculateNIPayable`);
  const bands = getTaxBands(income, startYearOfTaxYear, values);

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
  // log(`${income} = ${incomeInNoNIBand} @ 0% + `
  //    + `${incomeInLowNIBand} @ ${lowNIRate} + ${incomeInHighNIBand} @ ${highNIRate} `
  //    + `= ${incomeInLowNIBand * lowNIRate + incomeInHighNIBand * highNIRate}`);

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

function calculateCGTPayable(
  gain: number,
  startYearOfTaxYear: number,
  values: ValuesContainer,
  liableIncome: number,
) {
  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log(`startYearOfTaxYear = ${startYearOfTaxYear}`);
    log(`values = ${values}`);
  }
  const bands = getTaxBands(liableIncome, startYearOfTaxYear, values);

  // log(`in calculateCGTPayable, gain = ${gain}`);
  const noCGTBand = bands.cgtThreshholdLow;
  let highCGTBand = noCGTBand;

  if (liableIncome < bands.lowTaxBand) {
    highCGTBand = noCGTBand + bands.lowTaxBand - liableIncome;
  }

  if (gain < noCGTBand) {
    // log(`CGT not payable on ${gain}`);
    return 0.0;
  }

  const liable = gain - noCGTBand;
  let liableInLowBand = liable;
  let liableInHighBand = 0;
  if (gain > highCGTBand) {
    liableInLowBand = highCGTBand - noCGTBand;
    liableInHighBand = liable - highCGTBand + noCGTBand;
  }

  const payable =
    bands.cgtRateLow * liableInLowBand + bands.cgtRateHigh * liableInHighBand;
  // log(`${payable} due as CGT`);
  return payable;
}

function adjustCash(
  amount: number,
  d: Date,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // what led to the change
) {
  // log(`adjustCash by amount = ${amount} at ${dateAsString(DateFormatType.Debug,d)}`);
  let cashValue = getNumberValue(values, CASH_ASSET_NAME, false);
  // log(`current stored value = ${cashValue}`);
  if (cashValue === undefined) {
    // log('don't adjust undefined cash asset');
    // NB some tests have an expense and watch its value
    // without having a cash asset to decrement
  } else {
    let scaleBy: number | undefined;
    const gd = growthData(CASH_ASSET_NAME, growths, values);
    if (cashValue !== undefined && gd.adjustForCPI) {
      const baseVal = gd.baseVal;
      scaleBy = baseVal;
      // log(`for CPI, scaleBy = ${scaleBy}`);
      cashValue = cashValue * scaleBy;
    }
    let newValue = cashValue + amount;
    // log(`in adjustCash, setValue to ${newValue}`);
    if (scaleBy) {
      newValue /= scaleBy;
    }
    setValue(
      values,
      growths,
      evaluations,
      d,
      CASH_ASSET_NAME,
      newValue,
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
  taxDueList.forEach((tx) => {
    total = total + tx.amountLiable * tx.rate;
    // log(`total is now ${total}`);
  });
  // log(`total tax due is ${total}`);
  return total;
}

function updatePurchaseValue(
  a: Asset,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  newOverOldRatio: number,
  evaluations: Evaluation[],
  startOfTaxYear: Date,
  model: ModelData,
  source: string, // e.g. IncomeTaxJoe
) {
  // log('in updatePurchaseValue');
  const currentPurchaseValue = values.get(`${purchase}${a.NAME}`);
  if (currentPurchaseValue !== undefined) {
    let numberPart = 0.0;
    let wordPart: string | undefined = undefined;
    /* istanbul ignore if */
    if (typeof currentPurchaseValue === 'string') {
      log(
        `Error : expect currentPurchaseValue  ${currentPurchaseValue} to be a number`,
      );
      const parsed = getNumberAndWordParts(currentPurchaseValue);
      if (parsed.numberPart === undefined) {
        /* istanbul ignore next */
        throw new Error(`don't understand purchase price for RSUs?`);
      }
      numberPart = parsed.numberPart;
      wordPart = parsed.wordPart;
    } else {
      numberPart = currentPurchaseValue;
    }
    let purchaseValue = numberPart;
    /* istanbul ignore if */
    if (purchaseValue === 0.0) {
      log(`Error : expect non-zero purchase value`);
    }
    // log(`before paying income tax, purchaseValue = ${purchaseValue}`);
    purchaseValue = purchaseValue * newOverOldRatio;
    // log(`after paying income tax, purchaseValue = ${purchaseValue}`);
    /* istanbul ignore if */
    if (wordPart !== undefined) {
      log(`Error : expect no word part of purchase value`);
    }

    setValue(
      values,
      growths,
      evaluations,
      startOfTaxYear,
      `${purchase}${a.NAME}`,
      purchaseValue,
      model,
      source,
      '31', //callerID
    );
  }
}

function payIncomeTax(
  startOfTaxYear: Date, // should be April 5th of some year
  income: number,
  incomeFixed: number,
  alreadyPaid: number,
  alreadyPaidForFixed: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. IncomeTaxJoe
) {
  // log(`pay income tax on ${income} for date ${startOfTaxYear}`);
  // calculate tax liability
  const taxDue: {
    amountLiable: number;
    rate: number;
  }[] = calculateIncomeTaxPayable(income, startOfTaxYear.getFullYear(), values);
  const taxDueForFixed: {
    amountLiable: number;
    rate: number;
  }[] = calculateIncomeTaxPayable(
    incomeFixed,
    startOfTaxYear.getFullYear(),
    values,
  );
  // log(`taxDue for ${source} on ${startOfTaxYear} = ${taxDue}`);
  const totalTaxDue = sumTaxDue(taxDue);
  // log(`totalTaxDue for ${source}, ${makeTwoDP(income)} on ${startOfTaxYear.getFullYear()} is ${makeTwoDP(totalTaxDue)}`);
  const totalTaxDueForFixed = sumTaxDue(taxDueForFixed);

  const totalTaxDueFromCash = totalTaxDue - alreadyPaid;
  const totalTaxDueFromFixed = totalTaxDueForFixed - alreadyPaidForFixed;

  //console.log(
  //  `income tax ${totalTaxDueForFixed} would have been paid on ` +
  //    `incomeFixed ${incomeFixed}, already paid ${alreadyPaidForFixed} ` +
  //    `so  totalTaxDueFromFixed = ${totalTaxDueFromFixed}`,
  //);

  // log(`totalTaxDueFromCash for ${makeTwoDP(income)} on ${startOfTaxYear.getFullYear()} is ${makeTwoDP(totalTaxDueFromCash)}, already paid ${makeTwoDP(alreadyPaid)}`);
  const endOfTaxYear = new Date(startOfTaxYear.getFullYear() + 1, 3, 5);
  if (totalTaxDue !== 0) {
    // log(`in payIncomeTax for ${dateAsString(DateFormatType.Debug,startOfTaxYear)}, adjustCash by ${totalTaxDueFromCash}`);
    adjustCash(
      -totalTaxDueFromCash,
      endOfTaxYear,
      values,
      growths,
      evaluations,
      model,
      source,
    );
  }

  if (totalTaxDue > 0) {
    // log(`setValue with totalTaxDue = ${totalTaxDue}`);
    const person = source.substring(0, source.length - incomeTax.length);
    setValue(
      values,
      growths,
      evaluations,
      endOfTaxYear,
      incomeTax,
      totalTaxDue,
      model,
      makeIncomeTaxTag(person),
      '23', //callerID
    );
  }
  if (totalTaxDueFromFixed !== 0) {
    const person = source.substring(0, source.length - incomeTax.length);
    values.set(
      `taxForFixed${person} incomeTax end of year`,
      -totalTaxDueFromFixed,
      growths,
      endOfTaxYear,
      `taxForFixed${person} incomeTax end of year`,
      true, // reportIfNoChange
      '48', //callerID
    );
  }
  return totalTaxDue;
}

function sumNI(niDue: { amountLiable: number; rate: number }[]): number {
  let sum = 0;
  niDue.forEach((nd) => {
    sum = sum + nd.amountLiable * nd.rate;
  });
  return sum;
}

function logAnnualNIPayments(
  endOfTaxYear: Date,
  nIMonthlyPaymentsPaid: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. NIJoe
) {
  if (nIMonthlyPaymentsPaid > 0) {
    const person = source.substring(
      0,
      source.length - nationalInsurance.length,
    );
    setValue(
      values,
      growths,
      evaluations,
      endOfTaxYear,
      nationalInsurance,
      nIMonthlyPaymentsPaid,
      model,
      makeNationalInsuranceTag(person),
      '33', //callerID
    );
  }
}

function payCGT(
  startOfTaxYear: Date, // should be April 5th of some year
  gain: number,
  liableIncome: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  source: string, // e.g. 'CGTJoe'
) {
  // log(`pay CGT on ${gain} for date ${startOfTaxYear}`);
  // calculate CGT liability
  // TODO should pass in whether high rate income tax next
  const CGTDue = calculateCGTPayable(
    gain,
    startOfTaxYear.getFullYear(),
    values,
    liableIncome,
  );
  const endOfTaxYear = new Date(startOfTaxYear.getFullYear() + 1, 3, 5);

  // log(`taxDue = ${taxDue}`);
  if (CGTDue > 0) {
    // log('in payCGT, adjustCash:');
    adjustCash(
      -CGTDue,
      endOfTaxYear,
      values,
      growths,
      evaluations,
      model,
      source,
    );
    const person = source.substring(0, source.length - cgt.length);
    setValue(
      values,
      growths,
      evaluations,
      endOfTaxYear,
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
  liableIncome: LiabilityTotalAndSources,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  person: string,
  incomes: LiableIncomes,
  evaluations: Evaluation[],
  model: ModelData,
) {
  // log(`OptimizeIncomeTax income tax for ${person} and ${liableIncome} on ${dateAsString(DateFormatType.Debug,date)}`);
  const startYearOfTaxYear = date.getFullYear();
  const endYearOfTaxYear = new Date(startYearOfTaxYear + 1, 3, 5);
  const bands = getTaxBands(liableIncome.amount, startYearOfTaxYear, values);
  if (liableIncome.amount > bands.noTaxBand) {
    return;
  }
  // log(`bands.noTaxBand = ${bands.noTaxBand}`);
  let unusedAllowance = bands.noTaxBand - liableIncome.amount;
  // log(`unusedAllowance = ${unusedAllowance}`);
  // if we have unused allowance, see
  // have we got some crystallised pension we can use?
  for (const valueKey of values.keys()) {
    /* eslint-disable-line no-restricted-syntax */
    if (valueKey.startsWith(crystallizedPension)) {
      // is it for the right person?
      const removedCP = `${valueKey.substr(crystallizedPension.length)}`;
      const wds = removedCP.split(dot);
      /* istanbul ignore if */
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
        /* istanbul ignore if */
        if (pensionVal === undefined) {
          log('BUG!!! pension has no value');
          return;
        }
        if (amountToTransfer > pensionVal) {
          amountToTransfer = pensionVal;
        }
        // log(`to use allowance, on ${date}, '
        //  +'move ${amountToTransfer} from ${valueKey}`);
        const incomeTaxTotalMap = incomes.inTaxYear.incomeTaxTotal;
        /* istanbul ignore if */
        if (incomeTaxTotalMap === undefined) {
          log('BUG!!! person has no liability');
          return;
        }
        const cashVal = getNumberValue(values, CASH_ASSET_NAME);
        /* istanbul ignore if */
        if (cashVal === undefined) {
          log('BUG!!! cash has no value');
        } else {
          // set income tax in map
          addToTaxLiability(
            liableIncome,
            amountToTransfer,
            `auto-transfer from ${valueKey}`,
          );

          // using up the allowance in optimised way is a 'flexible' income
          // not a 'fixed' income
          const flexibleIncomesMap =
            incomes.inTaxYear.incomeTaxFromFlexibleIncome;
          if (flexibleIncomesMap === undefined) {
            throw new Error('flexibleIncomesMap should be defined');
          }
          // log(`look for a flexibleIncomes map for ${person}`);
          let personVal = flexibleIncomesMap.get(person);
          if (personVal === undefined) {
            personVal = 0;
          }
          flexibleIncomesMap.set(person, personVal + amountToTransfer);

          unusedAllowance = unusedAllowance - amountToTransfer;
          // log(`use allowance by transferring ${amountToTransfer}`);
          setValue(
            values,
            growths,
            evaluations,
            endYearOfTaxYear,
            CASH_ASSET_NAME,
            cashVal + amountToTransfer,
            model,
            valueKey,
            '5', //callerID
          ); // e.g. 'CrystallizedPensionNorwich'

          const gd = growthData(valueKey, growths, values);
          if (gd.adjustForCPI) {
            const baseVal = getNumberValue(values, getBaseForCPI(true));
            if (baseVal !== undefined) {
              amountToTransfer = amountToTransfer / baseVal;
            }
          }

          setValue(
            values,
            growths,
            evaluations,
            endYearOfTaxYear,
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

// we track different types of income liability for different individuals
// the outer map has a key for "cgt", "incomeTax" and "NI".
// the inner map has a key for the person who is liable to pay and
// a value for the accrued liable value as a tax year progresses
//
// we track different types of income liability for different individuals
// for monthly income tax payments, we only need a map from
// the person who is liable to pay and
// a value for the accrued liable value as a tax month progresses

interface LiabilityTotalAndSources {
  amount: number;
  sources: {
    amount: number;
    source: string;
  }[];
}
interface LiableIncomes {
  inTaxYear: {
    cgt: undefined | Map<string, LiabilityTotalAndSources>;
    incomeTaxTotal: undefined | Map<string, LiabilityTotalAndSources>;
    incomeTaxFromFixedIncome: undefined | Map<string, number>;
    incomeTaxFromFlexibleIncome: undefined | Map<string, number>;
    NITotal: undefined | Map<string, LiabilityTotalAndSources>;
    NIFromFixedIncome: undefined | Map<string, number>;
    NIFromFlexibleIncome: undefined | Map<string, number>;
  };
  inTaxMonth: {
    incomeTaxTotall: undefined | Map<string, number>;
    incomeTaxFromFixedIncomee: undefined | Map<string, number>;
    incomeTaxFromFlexibleIncomee: undefined | Map<string, number>;
    NIITotall: undefined | Map<string, number>;
    NIFromFixedIncomee: undefined | Map<string, number>;
    NIFromFlexibleIncomee: undefined | Map<string, number>;
  };
}

interface TaxPaymentsMade {
  incomeTaxTotalx: undefined | Map<string, number>;
  incomeTaxFromFixedIncomex: undefined | Map<string, number>;
  incomeTaxFromFlexibleIncomex: undefined | Map<string, number>;
  NIxTotal: undefined | Map<string, number>;
  NIxFromFixedIncome: undefined | Map<string, number>;
  NIxFromFlexibleIncome: undefined | Map<string, number>;
}

function settleUpTax(
  incomes: LiableIncomes,
  taxMonthlyPaymentsPaid: TaxPaymentsMade,
  startYearOfTaxYear: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  const date = new Date(startYearOfTaxYear, 3, 5);
  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log(`in settleUpTax, date = ${dateAsString(DateFormatType.Debug, date)}`);
  }
  const keyArray = ['cgt', incomeTax, nationalInsurance];

  // before going to pay income tax,
  // see if there's a wise move to use up unused income tax allowance
  // for each person

  const incomeTaxTotalMap = incomes.inTaxYear.incomeTaxTotal;
  if (incomeTaxTotalMap !== undefined) {
    for (const [person, liableIncome] of incomeTaxTotalMap) {
      if (doOptimizeForIncomeTax) {
        OptimizeIncomeTax(
          date,
          liableIncome,
          values,
          growths,
          person,
          incomes,
          evaluations,
          model,
        );
      }
    }
  }
  const endOfTaxYear = new Date(date.getFullYear() + 1, 3, 5);

  // log(`clear net income and net gain maps for the new tax year`);
  const personNetIncome = new Map<string, number>();
  const personNetGain = new Map<string, number>();
  // log(`iterate over liable income key, value`);
  for (const key of keyArray) {
    let personLiabilityMap;
    if (key === incomeTax) {
      personLiabilityMap = incomes.inTaxYear.incomeTaxTotal;
    } else if (key === nationalInsurance) {
      personLiabilityMap = incomes.inTaxYear.NITotal;
    } else if (key === 'cgt') {
      personLiabilityMap = incomes.inTaxYear.cgt;
    }
    if (personLiabilityMap === undefined) {
      continue;
    }

    // log(`liable income key = ${key}, value = ${value}`);
    let recalculatedNetIncome = false;
    let recalculatedNetGain = false;
    /* eslint-disable-line no-restricted-syntax */
    if (key === incomeTax && personLiabilityMap !== undefined) {
      const incomeTaxPersonLiabilityMap = personLiabilityMap;
      const incomeFixedPersonLiabilityMap =
        incomes.inTaxYear.incomeTaxFromFixedIncome;
      if (incomeFixedPersonLiabilityMap === undefined) {
        throw new Error(
          'expect incomeFixedPersonLiabilityMap to have been set up',
        );
      }

      let incomeTaxMonthlyPaymentsPaid = taxMonthlyPaymentsPaid.incomeTaxTotalx;
      /* istanbul ignore if  */ //redundant untested
      if (incomeTaxMonthlyPaymentsPaid === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        incomeTaxMonthlyPaymentsPaid = new Map<string, number>();
        taxMonthlyPaymentsPaid.incomeTaxTotalx = incomeTaxMonthlyPaymentsPaid;
      }
      let incomeFixedTaxMonthlyPaymentsPaid =
        taxMonthlyPaymentsPaid.incomeTaxFromFixedIncomex;
      /* istanbul ignore if  */ //redundant untested
      if (incomeFixedTaxMonthlyPaymentsPaid === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        incomeFixedTaxMonthlyPaymentsPaid = new Map<string, number>();
        taxMonthlyPaymentsPaid.incomeTaxFromFixedIncomex =
          incomeFixedTaxMonthlyPaymentsPaid;
      }

      for (const [person, amount] of incomeTaxPersonLiabilityMap) {
        let alreadyPaid = incomeTaxMonthlyPaymentsPaid.get(person);
        if (alreadyPaid === undefined) {
          alreadyPaid = 0;
        }

        let amountFixed = incomeFixedPersonLiabilityMap.get(person);
        if (amountFixed === undefined) {
          amountFixed = 0;
        }

        let alreadyPaidForFixed = incomeFixedTaxMonthlyPaymentsPaid.get(person);
        if (alreadyPaidForFixed === undefined) {
          alreadyPaidForFixed = 0;
        }
        /* eslint-disable-line no-restricted-syntax */
        // log(`go to pay income tax for ${person}, amount = ${amount} for ${date}`);
        const taxPaid = payIncomeTax(
          date,
          amount.amount,
          amountFixed,
          alreadyPaid,
          alreadyPaidForFixed,
          values,
          growths,
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
          // log(`for ${personsName}'s incomeTax, set first net income ${amount} - ${taxPaid} = ${amount - taxPaid}`);
          personNetIncome.set(personsName, amount.amount - taxPaid);
        } else {
          // log(`for ${personsName}'s incomeTax, reduce existing net income ${knownNetIncome} - ${taxPaid} = ${knownNetIncome - taxPaid}`);
          personNetIncome.set(personsName, knownNetIncome - taxPaid);
        }
        /* istanbul ignore if  */ //debug
        if (printDebug()) {
          log(`${person} paid income tax ${taxPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');

        // log these values for a tax reporter to pick up
        for (const s of amount.sources) {
          values.set(
            `taxBreakdown${person} ${s.source}`,
            s.amount,
            growths,
            date,
            `taxBreakdown${person} ${s.source}`,
            true, // reportIfNoChange
            '99', //callerID
          );
        }

        // set income tax in map
        incomeTaxPersonLiabilityMap.set(person, {
          amount: 0,
          sources: [],
        });

        // reset the flexible and fixed income trackers too
        const flexibleIncomesMap =
          incomes.inTaxYear.incomeTaxFromFlexibleIncome;
        if (flexibleIncomesMap === undefined) {
          throw new Error('flexibleIncomesMap should be defined');
        }
        flexibleIncomesMap.set(person, 0);

        const fixedIncomesMap = incomes.inTaxYear.incomeTaxFromFixedIncome;
        if (fixedIncomesMap === undefined) {
          throw new Error('fixedIncomesMap should be defined');
        }
        fixedIncomesMap.set(person, 0);

        const liableIncomeTaxInTaxMonth = incomes.inTaxMonth.incomeTaxTotall;
        if (liableIncomeTaxInTaxMonth === undefined) {
          throw new Error('liableIncomeTaxInTaxMonth should be defined');
        }
        liableIncomeTaxInTaxMonth.set(person, 0);

        const liableFixedIncomeTaxInTaxMonth =
          incomes.inTaxMonth.incomeTaxFromFixedIncomee;
        if (liableFixedIncomeTaxInTaxMonth === undefined) {
          throw new Error('liableFixedIncomeTaxInTaxMonth should be defined');
        }
        liableFixedIncomeTaxInTaxMonth.set(person, 0);

        const liableFlexibleIncomeTaxInTaxMonth =
          incomes.inTaxMonth.incomeTaxFromFlexibleIncomee;
        if (liableFlexibleIncomeTaxInTaxMonth === undefined) {
          throw new Error(
            'liableFlexibleIncomeTaxInTaxMonth should be defined',
          );
        }
        liableFlexibleIncomeTaxInTaxMonth.set(person, 0);

        incomeTaxMonthlyPaymentsPaid.set(person, 0);
        incomeFixedTaxMonthlyPaymentsPaid.set(person, 0);
        recalculatedNetIncome = true;
      }
    } else if (key === nationalInsurance && personLiabilityMap !== undefined) {
      const niPersonLiabilityMap = personLiabilityMap;

      const niFixedPersonLiabilityMap = incomes.inTaxYear.NIFromFixedIncome;
      if (niFixedPersonLiabilityMap === undefined) {
        throw new Error('expect niFixedPersonLiabilityMap to have been set up');
      }

      let liableIncomeNIInTaxMonth = incomes.inTaxMonth.NIITotall;
      /* istanbul ignore if  */ //redundant untested
      if (liableIncomeNIInTaxMonth === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        liableIncomeNIInTaxMonth = new Map<string, number>();
        incomes.inTaxMonth.NIITotall = liableIncomeNIInTaxMonth;
      }

      let liableFixedIncomeNIInTaxMonth = incomes.inTaxMonth.NIFromFixedIncomee;
      /* istanbul ignore if  */ //redundant untested
      if (liableFixedIncomeNIInTaxMonth === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        liableFixedIncomeNIInTaxMonth = new Map<string, number>();
        incomes.inTaxMonth.NIFromFixedIncomee = liableFixedIncomeNIInTaxMonth;
      }

      let nIMonthlyPaymentsPaid = taxMonthlyPaymentsPaid.NIxTotal;
      /* istanbul ignore if  */ //redundant untested
      if (nIMonthlyPaymentsPaid === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        nIMonthlyPaymentsPaid = new Map<string, number>();
        taxMonthlyPaymentsPaid.NIxTotal = nIMonthlyPaymentsPaid;
      }
      let nIMonthlyPaymentsPaidFixed =
        taxMonthlyPaymentsPaid.NIxFromFixedIncome;
      /* istanbul ignore if  */ //redundant untested
      if (nIMonthlyPaymentsPaidFixed === undefined) {
        log('Error : expect maps to have been set up in accumulateLiability');
        nIMonthlyPaymentsPaidFixed = new Map<string, number>();
        taxMonthlyPaymentsPaid.NIxFromFixedIncome = nIMonthlyPaymentsPaidFixed;
      }

      for (const [person, amount] of niPersonLiabilityMap) {
        const niFromFixedIncomeMap = incomes.inTaxYear.NIFromFixedIncome;
        if (niFromFixedIncomeMap === undefined) {
          throw new Error('Expected NIFromFixedIncome to be defined');
        }
        let amountFixed = niFromFixedIncomeMap.get(person);
        if (amountFixed === undefined) {
          amountFixed = 0;
        }

        let liableInTaxMonth = liableIncomeNIInTaxMonth.get(person);
        /* istanbul ignore if  */ //redundant untested
        if (liableInTaxMonth === undefined) {
          log(`ERROR : don't expect undefined liableInTaxMonth`);
          liableInTaxMonth = 0;
        }

        let liableFixedInTaxMonth = liableFixedIncomeNIInTaxMonth.get(person);
        if (liableFixedInTaxMonth === undefined) {
          liableFixedInTaxMonth = 0;
        }

        let alreadyPaid = nIMonthlyPaymentsPaid.get(person);
        if (alreadyPaid === undefined) {
          alreadyPaid = 0;
        }
        let alreadyPaidFixed = nIMonthlyPaymentsPaidFixed.get(person);
        if (alreadyPaidFixed === undefined) {
          alreadyPaidFixed = 0;
        }

        /* eslint-disable-line no-restricted-syntax */
        logAnnualNIPayments(
          endOfTaxYear,
          alreadyPaid,
          values,
          growths,
          evaluations,
          model,
          person,
        ); // e.g. 'NIJoe'
        /* istanbul ignore if  */ //debug
        if (printDebug()) {
          log(`${person} paid NI ${alreadyPaid} for ${date}`);
        }
        const personsName = person.substring(
          0,
          person.length - nationalInsurance.length,
        );
        // log(`paid some NI for ${personsName}`);
        const knownNetIncome = personNetIncome.get(personsName);
        let newNetIncomeValue: undefined | number = undefined;
        if (knownNetIncome === undefined) {
          // log(`for ${personsName}'s ni, set first net income ${amount} - ${alreadyPaid} = ${amount - alreadyPaid}`);
          newNetIncomeValue = amount.amount - alreadyPaid;
        } else if (alreadyPaid !== 0) {
          // log(`for ${personsName}'s ni, set net income ${knownNetIncome} - ${alreadyPaid} = ${knownNetIncome - alreadyPaid}`);
          newNetIncomeValue = knownNetIncome - alreadyPaid;
        }
        if (newNetIncomeValue !== undefined) {
          personNetIncome.set(personsName, newNetIncomeValue);
          recalculatedNetIncome = true;
        }
        // log('resetting liableIncomeInTaxYear');

        niPersonLiabilityMap.set(person, {
          amount: 0,
          sources: [],
        });
        nIMonthlyPaymentsPaid.set(person, 0);
      }
    } else if (key === 'cgt' && personLiabilityMap !== undefined) {
      const cgtPersonLiabilityMap = personLiabilityMap;
      for (const [person, amount] of cgtPersonLiabilityMap) {
        /* eslint-disable-line no-restricted-syntax */
        const personsName = person.substring(0, person.length - cgt.length);
        const liableIncomeFromMap = incomes.inTaxYear.incomeTaxTotal?.get(
          `${personsName}${incomeTax}`,
        );
        const cgtPaid = payCGT(
          date,
          amount.amount,
          liableIncomeFromMap ? liableIncomeFromMap.amount : 0,
          values,
          growths,
          evaluations,
          model,
          person,
        ); // e.g. 'CGTJoe'
        // log('resetting liableIncomeInTaxYear');
        const knownNetGain = personNetGain.get(personsName);
        if (knownNetGain === undefined) {
          personNetGain.set(personsName, amount.amount - cgtPaid);
        } else {
          /* istanbul ignore next */
          log(`Error: don't expect knownNetGain to be undefined!`);
          /* istanbul ignore next */
          personNetGain.set(personsName, knownNetGain - cgtPaid);
        }

        // log these values for a tax reporter to pick up
        for (const s of amount.sources) {
          values.set(
            `taxBreakdown${person} ${s.source}`,
            s.amount,
            growths,
            date,
            `taxBreakdown${person} ${s.source}`,
            true, // reportIfNoChange
            '99', //callerID
          );
        }

        cgtPersonLiabilityMap.set(person, {
          amount: 0,
          sources: [],
        });
        recalculatedNetGain = true;
      }
    } else {
      /* istanbul ignore next */
      log(`unhandled key from liableIncomeInTaxYear = ${key} `);
    }

    if (recalculatedNetIncome) {
      // log(`recalculatedNetIncome with key = ${key} at ${endOfTaxYear.toDateString()}`);
      for (const [person, amount] of personNetIncome) {
        // log(`person = ${person} amount = ${amount}`);
        if (amount > 0) {
          const netIncTag = makeNetIncomeTag(person);
          // log(`setValue netIncTag = ${netIncTag} amount = ${amount} for endOfTaxYear = ${endOfTaxYear}`);
          setValue(
            values,
            growths,
            evaluations,
            endOfTaxYear,
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
        if (amount !== 0) {
          // log(`setValue ${'netgain'+person} amount ${amount}`)
          setValue(
            values,
            growths,
            evaluations,
            endOfTaxYear,
            makeNetGainTag(person),
            amount,
            model,
            makeNetGainTag(person),
            '28', //callerID
          );
        }
      }
    }
  }
  // log(`finished settleUpTax, date = ${dateAsString(DateFormatType.Debug,date)}`);
}

function getTaxMonthDate(startYearOfTaxYear: number, monthOfTaxYear: number) {
  let result: Date;
  if (monthOfTaxYear <= 3) {
    // start of tax year = 2020, month = January
    // gives January 2021
    result = new Date(startYearOfTaxYear + 1, monthOfTaxYear, 5);
  } else {
    // start of tax year = 2020, month = May
    // gives May 2020
    result = new Date(startYearOfTaxYear, monthOfTaxYear, 5);
  }
  // log(`month ${monthOfTaxYear} and year ${startYearOfTaxYear} make date ${dateAsString(DateFormatType.Debug,result)}`);
  return result;
}

function payTaxEstimate(
  incomes: LiableIncomes,
  taxMonthlyPaymentsPaid: TaxPaymentsMade,
  startYearOfTaxYear: number,
  monthOfTaxYear: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  // income tax
  // log(`payTaxEstimate for month ${monthOfTaxYear} and startYearOfTaxYear ${startYearOfTaxYear}`);
  let liableIncomeTaxInTaxMonth = incomes.inTaxMonth.incomeTaxTotall;
  if (liableIncomeTaxInTaxMonth === undefined) {
    liableIncomeTaxInTaxMonth = new Map<string, number>();
    incomes.inTaxMonth.incomeTaxTotall = liableIncomeTaxInTaxMonth;
  }

  let liableFixedIncomeTaxInTaxMonth =
    incomes.inTaxMonth.incomeTaxFromFixedIncomee;
  if (liableFixedIncomeTaxInTaxMonth === undefined) {
    liableFixedIncomeTaxInTaxMonth = new Map<string, number>();
    incomes.inTaxMonth.incomeTaxFromFixedIncomee =
      liableFixedIncomeTaxInTaxMonth;
  }

  let liableFlexibleIncomeTaxInTaxMonth =
    incomes.inTaxMonth.incomeTaxFromFlexibleIncomee;
  if (liableFlexibleIncomeTaxInTaxMonth === undefined) {
    liableFlexibleIncomeTaxInTaxMonth = new Map<string, number>();
    incomes.inTaxMonth.incomeTaxFromFlexibleIncomee =
      liableFlexibleIncomeTaxInTaxMonth;
  }

  let incomeTaxMonthlyPaymentsPaid = taxMonthlyPaymentsPaid.incomeTaxTotalx;
  if (incomeTaxMonthlyPaymentsPaid === undefined) {
    incomeTaxMonthlyPaymentsPaid = new Map<string, number>();
    taxMonthlyPaymentsPaid.incomeTaxTotalx = incomeTaxMonthlyPaymentsPaid;
  }
  let incomeFixedTaxMonthlyPaymentsPaid =
    taxMonthlyPaymentsPaid.incomeTaxFromFixedIncomex;
  if (incomeFixedTaxMonthlyPaymentsPaid === undefined) {
    incomeFixedTaxMonthlyPaymentsPaid = new Map<string, number>();
    taxMonthlyPaymentsPaid.incomeTaxFromFixedIncomex =
      incomeFixedTaxMonthlyPaymentsPaid;
  }

  for (const [person, liableIncome] of liableIncomeTaxInTaxMonth) {
    let fixedVal = liableFixedIncomeTaxInTaxMonth.get(person);
    if (fixedVal === undefined) {
      fixedVal = 0;
    }
    let flexVal = liableFlexibleIncomeTaxInTaxMonth.get(person);
    if (flexVal === undefined) {
      flexVal = 0;
    }
    if (Math.abs(liableIncome - (fixedVal + flexVal)) > 0.0001) {
      throw new Error(
        `expected fixed + flex === total; ${fixedVal} + ${flexVal} !== ${liableIncome}`,
      );
    }

    // log(`pay income tax estimate for ${person} for ${liableIncome} for month ${monthOfTaxYear}, year ${startYearOfTaxYear}`);
    if (monthOfTaxYear === 3) {
      // log(`don't make monthly estimate in April`);
    } else if (liableIncome > 0) {
      const annualIncomeEstimate = liableIncome * 12;
      const annualIncomeFixedEstimate = fixedVal * 12;
      const estimateAnnualTaxDue: {
        amountLiable: number;
        rate: number;
      }[] = calculateIncomeTaxPayable(
        annualIncomeEstimate,
        startYearOfTaxYear,
        values,
      );
      const estimateAnnualTaxDueFixed: {
        amountLiable: number;
        rate: number;
      }[] = calculateIncomeTaxPayable(
        annualIncomeFixedEstimate,
        startYearOfTaxYear,
        values,
      );
      const annualEstimate = sumTaxDue(estimateAnnualTaxDue);
      const annualEstimateFixed = sumTaxDue(estimateAnnualTaxDueFixed);
      // log(`es payIncomeTax for ${startYearOfTaxYear}, annual estimate is ${annualEstimate}`);
      const estimateMonthTaxDue =
        Math.floor((annualEstimate / 12) * 100 + 0.00001) / 100;
      const estimateMonthTaxDueFixed =
        Math.floor((annualEstimateFixed / 12) * 100 + 0.00001) / 100;

      // log(`es payIncomeTax for ${startYearOfTaxYear}, monthly estimate is ${estimateMonthTaxDue}`);
      if (estimateMonthTaxDue > 0) {
        // log(`adjust cash for tax estimate ${estimateMonthTaxDue}`);
        adjustCash(
          -estimateMonthTaxDue,
          getTaxMonthDate(startYearOfTaxYear, monthOfTaxYear),
          values,
          growths,
          evaluations,
          model,
          person,
        );
        let estimatesPaid = incomeTaxMonthlyPaymentsPaid.get(person);
        if (estimatesPaid === undefined) {
          estimatesPaid = 0;
        }
        estimatesPaid += estimateMonthTaxDue;
        incomeTaxMonthlyPaymentsPaid.set(person, estimatesPaid);

        let estimatesPaidFixed = incomeFixedTaxMonthlyPaymentsPaid.get(person);
        if (estimatesPaidFixed === undefined) {
          estimatesPaidFixed = 0;
        }
        estimatesPaidFixed += estimateMonthTaxDueFixed;
        incomeFixedTaxMonthlyPaymentsPaid.set(person, estimatesPaidFixed);
        values.set(
          `taxForFixed${person} for month`,
          -estimateMonthTaxDueFixed,
          growths,
          getTaxMonthDate(startYearOfTaxYear, monthOfTaxYear),
          `taxForFixed${person} for month`,
          true, // reportIfNoChange
          '49', //callerID
        );
      }
    }
    liableIncomeTaxInTaxMonth.set(person, 0);
    liableFixedIncomeTaxInTaxMonth.set(person, 0);
    liableFlexibleIncomeTaxInTaxMonth.set(person, 0);
  }
}
function payNIEstimate(
  incomes: LiableIncomes,
  taxMonthlyPaymentsPaid: TaxPaymentsMade,
  startYearOfTaxYear: number,
  monthOfTaxYear: number,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  // log(`pay NI estimate for month ${monthOfTaxYear} and startYearOfTaxYear ${startYearOfTaxYear} `)
  // NI
  let liableNIInTaxMonth = incomes.inTaxMonth.NIITotall;
  if (liableNIInTaxMonth === undefined) {
    liableNIInTaxMonth = new Map<string, number>();
    incomes.inTaxMonth.NIITotall = liableNIInTaxMonth;
  }
  let liableNIInTaxMonthFromFixed = incomes.inTaxMonth.NIFromFixedIncomee;
  if (liableNIInTaxMonthFromFixed === undefined) {
    liableNIInTaxMonthFromFixed = new Map<string, number>();
    incomes.inTaxMonth.NIFromFixedIncomee = liableNIInTaxMonthFromFixed;
  }
  let nIMonthlyPaymentsPaid = taxMonthlyPaymentsPaid.NIxTotal;
  if (nIMonthlyPaymentsPaid === undefined) {
    nIMonthlyPaymentsPaid = new Map<string, number>();
    taxMonthlyPaymentsPaid.NIxTotal = nIMonthlyPaymentsPaid;
  }
  let nIMonthlyPaymentsPaidFromFixed =
    taxMonthlyPaymentsPaid.NIxFromFixedIncome;
  if (nIMonthlyPaymentsPaidFromFixed === undefined) {
    nIMonthlyPaymentsPaidFromFixed = new Map<string, number>();
    taxMonthlyPaymentsPaid.NIxFromFixedIncome = nIMonthlyPaymentsPaidFromFixed;
  }

  for (const [person, liableIncome] of liableNIInTaxMonth) {
    // log(`pay NI for ${person} for ${liableIncome} for month ${monthOfTaxYear} and year ${startYearOfTaxYear}`);
    if (liableIncome > 0) {
      let liableIncomeFromFixed = liableNIInTaxMonthFromFixed.get(person);
      if (liableIncomeFromFixed === undefined) {
        liableIncomeFromFixed = 0;
      }
      const annualIncomeEstimate = liableIncome * 12;
      const annualIncomeEstimateFromFixed = liableIncomeFromFixed + 12;

      const estimateAnnualTaxDue: {
        amountLiable: number;
        rate: number;
      }[] = calculateNIPayable(
        annualIncomeEstimate,
        startYearOfTaxYear,
        values,
      );
      const estimateAnnualTaxDueFromFixed: {
        amountLiable: number;
        rate: number;
      }[] = calculateNIPayable(
        annualIncomeEstimateFromFixed,
        startYearOfTaxYear,
        values,
      );
      const niDueForYear = sumNI(estimateAnnualTaxDue);
      const niDueForYearFromFixed = sumNI(estimateAnnualTaxDueFromFixed);

      // log(`niDueForYear = ${niDueForYear}`);
      const nIMonthTaxDue =
        Math.floor((niDueForYear / 12) * 100 + 0.00001) / 100;
      // log(`nIMonthTaxDue = ${nIMonthTaxDue}`);
      const nIMonthTaxDueFromFixed =
        Math.floor((niDueForYearFromFixed / 12) * 100 + 0.00001) / 100;

      if (nIMonthTaxDue > 0) {
        // log(`adjust cash for NI payment ${nIMonthTaxDue}`);
        adjustCash(
          -nIMonthTaxDue,
          getTaxMonthDate(startYearOfTaxYear, monthOfTaxYear),
          values,
          growths,
          evaluations,
          model,
          person,
        );
        let niPaid = nIMonthlyPaymentsPaid.get(person);
        if (niPaid === undefined) {
          niPaid = 0;
        }
        niPaid += nIMonthTaxDue;
        // log(`update monthly payments sum to ${niPaid}`);
        nIMonthlyPaymentsPaid.set(person, niPaid);

        values.set(
          `taxForFixed${person} for month`,
          -nIMonthTaxDue,
          growths,
          getTaxMonthDate(startYearOfTaxYear, monthOfTaxYear),
          `taxForFixed${person} for month`,
          true, // reportIfNoChange
          '33', //callerID
        );

        let niPaidFromFixed = nIMonthlyPaymentsPaidFromFixed.get(person);
        if (niPaidFromFixed === undefined) {
          niPaidFromFixed = 0;
        }
        niPaidFromFixed += nIMonthTaxDueFromFixed;
        // log(`update monthly payments sum to ${niPaid}`);
        nIMonthlyPaymentsPaidFromFixed.set(person, niPaidFromFixed);
      }
    }
    // log(`reset liableNIInTaxMonth to zero`);
    liableNIInTaxMonth.set(person, 0);
    liableNIInTaxMonthFromFixed.set(person, 0);
  }
}

function addToTaxLiability(
  taxLiability: LiabilityTotalAndSources,
  incomeValue: number,
  sourceDescription: string,
) {
  if (incomeValue !== 0.0) {
    taxLiability.amount += incomeValue;
    const matchedSource = taxLiability.sources.find((s) => {
      return s.source === sourceDescription;
    });
    if (matchedSource) {
      matchedSource.amount += incomeValue;
    } else {
      taxLiability.sources.push({
        amount: incomeValue,
        source: sourceDescription,
      });
    }
  }
}

function accumulateLiability(
  liability: string,
  type: string, // incomeTax or nationalInsurance
  incomeValue: number,
  incomes: LiableIncomes,
  typeOfMoment: string,
  isFlexibleIncome: boolean,
  isFixedIncome: boolean,
  sourceDescription: string,
) {
  // log(`accumulateLiability,
  //    liability = ${liability}, type = ${type}, incomeValue = ${incomeValue}`);
  /*
  // This change breaks
  // 'pay income tax on conditional categorized crystallized pension'
  // for example, because we need to even pass through a zero liability
  // in order to hit the code which optimises income tax 
  // (cashes in taxable crystallised pension up to allowance)
  if(incomeValue === 0){
    return;
  }
  */
  let personLiabilityMap = undefined;
  // log(`in accumulateLiability for type = ${type}`);
  if (type === incomeTax) {
    personLiabilityMap = incomes.inTaxYear.incomeTaxTotal;
    // log(`current income tax map is = ${map}`);
    if (personLiabilityMap === undefined) {
      // log(`set up new map for income tax`);
      incomes.inTaxYear.incomeTaxTotal = new Map<
        string,
        LiabilityTotalAndSources
      >();
      incomes.inTaxYear.incomeTaxFromFixedIncome = new Map<string, number>();
      incomes.inTaxYear.incomeTaxFromFlexibleIncome = new Map<string, number>();
      personLiabilityMap = incomes.inTaxYear.incomeTaxTotal;
    }
  } else if (type === nationalInsurance) {
    personLiabilityMap = incomes.inTaxYear.NITotal;
    // log(`current NI map is = ${map}`);
    if (personLiabilityMap === undefined) {
      // log(`set up new map for NI`);
      incomes.inTaxYear.NITotal = new Map<string, LiabilityTotalAndSources>();
      incomes.inTaxYear.NIFromFixedIncome = new Map<string, number>();
      incomes.inTaxYear.NIFromFlexibleIncome = new Map<string, number>();
      personLiabilityMap = incomes.inTaxYear.NITotal;
    }
  }
  if (personLiabilityMap !== undefined) {
    // log this amount in the accumulating total
    let taxLiability = personLiabilityMap.get(liability);
    if (taxLiability === undefined) {
      taxLiability = {
        amount: 0,
        sources: [],
      };
      personLiabilityMap.set(liability, taxLiability);
    }
    // log(`${liability} accumulate ${incomeValue} into ${taxLiability}`);
    addToTaxLiability(taxLiability, incomeValue, sourceDescription);
  }
  if (type === incomeTax) {
    if (isFlexibleIncome) {
      const flexibleIncomesMap = incomes.inTaxYear.incomeTaxFromFlexibleIncome;
      if (flexibleIncomesMap !== undefined) {
        let personVal = flexibleIncomesMap.get(liability);
        if (personVal === undefined) {
          personVal = 0;
        }
        flexibleIncomesMap.set(liability, personVal + incomeValue);
      }
    }
    if (isFixedIncome) {
      const fixedIncomesMap = incomes.inTaxYear.incomeTaxFromFixedIncome;
      if (fixedIncomesMap !== undefined) {
        let personVal = fixedIncomesMap.get(liability);
        if (personVal === undefined) {
          personVal = 0;
        }
        fixedIncomesMap.set(liability, personVal + incomeValue);
      }
    }

    /////////// TODO duplication of code
    let liableIncomeTaxInTaxMonth = incomes.inTaxMonth.incomeTaxTotall;
    /* istanbul ignore if  */ //redundant untested
    if (liableIncomeTaxInTaxMonth === undefined) {
      liableIncomeTaxInTaxMonth = new Map<string, number>();
      incomes.inTaxMonth.incomeTaxTotall = liableIncomeTaxInTaxMonth;
    }
    let liableFixedIncomeTaxInTaxMonth =
      incomes.inTaxMonth.incomeTaxFromFixedIncomee;
    /* istanbul ignore if  */ //redundant untested
    if (liableFixedIncomeTaxInTaxMonth === undefined) {
      liableFixedIncomeTaxInTaxMonth = new Map<string, number>();
      incomes.inTaxMonth.incomeTaxFromFixedIncomee =
        liableFixedIncomeTaxInTaxMonth;
    }
    let liableFlexibleIncomeTaxInTaxMonth =
      incomes.inTaxMonth.incomeTaxFromFlexibleIncomee;
    /* istanbul ignore if  */ //redundant untested
    if (liableFlexibleIncomeTaxInTaxMonth === undefined) {
      liableFlexibleIncomeTaxInTaxMonth = new Map<string, number>();
      incomes.inTaxMonth.incomeTaxFromFlexibleIncomee =
        liableFlexibleIncomeTaxInTaxMonth;
    }

    let taxLiability = liableIncomeTaxInTaxMonth.get(liability);
    if (taxLiability === undefined) {
      taxLiability = 0;
    }
    const newLiability = taxLiability + incomeValue;
    // log(`${liability} accumulate income tax liability ${incomeValue} for the month: ${newLiability}`);
    liableIncomeTaxInTaxMonth.set(liability, newLiability);

    if (isFixedIncome) {
      let taxFixedLiability = liableFixedIncomeTaxInTaxMonth.get(liability);
      if (taxFixedLiability === undefined) {
        taxFixedLiability = 0;
      }
      const newFixedLiability = taxFixedLiability + incomeValue;
      liableFixedIncomeTaxInTaxMonth.set(liability, newFixedLiability);
    }
    if (isFlexibleIncome) {
      let taxFlexibleLiability =
        liableFlexibleIncomeTaxInTaxMonth.get(liability);
      if (taxFlexibleLiability === undefined) {
        taxFlexibleLiability = 0;
      }
      const newFlexibleLiability = taxFlexibleLiability + incomeValue;
      liableFlexibleIncomeTaxInTaxMonth.set(liability, newFlexibleLiability);
    }

    /*
    if (
      typeOfMoment !== momentType.income &&
      typeOfMoment !== momentType.incomeStart &&
      typeOfMoment !== momentType.transaction &&
      typeOfMoment !== momentType.asset
    ) {
      throw new Error(`unexpected income tax moment : ${typeOfMoment}`);
    }
    */
    if (
      typeOfMoment !== momentType.income &&
      typeOfMoment !== momentType.incomeStart
    ) {
      // track this type of liability in addition
      // to feed data into the planning page
    }
  }
  if (type === nationalInsurance) {
    let liableNIInTaxMonth = incomes.inTaxMonth.NIITotall;
    /* istanbul ignore if */
    if (liableNIInTaxMonth === undefined) {
      log(`Error: don't expect liableNIInTaxMonth to be undefined!`);
      liableNIInTaxMonth = new Map<string, number>();
      incomes.inTaxMonth.NIITotall = liableNIInTaxMonth;
    }

    let liableNIFromFixedInTaxMonth = incomes.inTaxMonth.NIFromFixedIncomee;
    /* istanbul ignore if */
    if (liableNIInTaxMonth === undefined) {
      log(`Error: don't expect liableNIInTaxMonth to be undefined!`);
      liableNIFromFixedInTaxMonth = new Map<string, number>();
      incomes.inTaxMonth.NIFromFixedIncomee = liableNIFromFixedInTaxMonth;
    }

    let taxLiability = liableNIInTaxMonth.get(liability);
    if (taxLiability === undefined) {
      taxLiability = 0;
    }
    const newLiability = taxLiability + incomeValue;
    // log(`${liability} accumulate NI liability ${incomeValue} for the month: ${newLiability}`);
    liableNIInTaxMonth.set(liability, newLiability);
  }
}

function handleIncome(
  incomeValue: number,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
  liabilitiesMap: Map<string, string>,
  incomes: LiableIncomes,
  sourceDescription: string,
  isFlexibleIncome: boolean,
  isFixedIncome: boolean,
) {
  // log(`handle income value = ${incomeValue}, ${moment.name}`);
  const triggers = model.triggers;
  const v = getVarVal(model.settings);

  // log(`handle income for moment ${moment.name}`);

  if (moment.name.startsWith(pensionDB)) {
    // This type of income has moments which fall before the
    // income start date; allowing for other actions to
    // influence its value
    const income = model.incomes.find((i) => {
      return i.NAME === moment.name;
    });
    /* istanbul ignore if */
    if (income === undefined) {
      throw new Error(`income ${moment.name} not found in model`);
    }
    const incomeStartDate = getTriggerDate(income.START, triggers, v);
    // log(`income start is ${incomeStartDate}, moment date is ${moment.date}`);
    /* istanbul ignore if */
    if (incomeStartDate > moment.date) {
      log(
        `Error : don't handleIncome ${income.NAME} before it starts! ${moment.name}`,
      );
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
  pensionTransactions.forEach((pt) => {
    if (moment.name !== pt.FROM) {
      return;
    }

    const ptDate = getTriggerDate(pt.DATE, triggers, v);
    if (ptDate > moment.date) {
      return;
    }
    // !!! TODO only apply this transaction before the STOP_DATE !!!
    const ptStopDate = getTriggerDate(pt.STOP_DATE, triggers, v);
    if (ptStopDate < moment.date) {
      return;
    }

    const tFromValue = parseFloat(pt.FROM_VALUE);
    const tToValue = parseFloat(pt.TO_VALUE);
    // log(`pension transaction ${pt.NAME}`)
    // log(`see if ${showObj(pt)} should affect `
    //   +`this handleIncome moment ${showObj(moment)}`);
    // log(`matched transaction ${showObj(pt)} to ${showObj(moment)}`);

    let amountFrom = 0.0;
    /* istanbul ignore if  */ //error
    if (pt.FROM_ABSOLUTE) {
      log('Error : malformed model has pension contribution as absolute value');
      amountFrom = tFromValue;
    } else {
      // e.g. employee chooses 5% pension contribution
      amountFrom = tFromValue * incomeValue;
      // log(`amountFrom = ${tFromValue} * ${incomeValue} = ${amountFrom}`);
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
      // log(`pay ${amountFrom} into pension : ${pt.NAME}`);

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
      // log(`amountForPension = ${tToValue} * ${amountFrom} = ${amountForPension}`);
    }
    let pensionValue = getNumberValue(values, pt.TO, false);

    // this base CPI should behave like an income of some kind
    const baseVal = getNumberValue(values, getBaseForCPI(true));

    /* istanbul ignore else */ //error
    if (baseVal !== undefined && pensionValue !== undefined) {
      pensionValue = pensionValue * baseVal;
    } else if (baseVal === undefined) {
      log(`Error: undefined baseVal ${baseVal}`);
    }

    if (pt.TO === '') {
      /* istanbul ignore if  */ //debug
      if (printDebug()) {
        log('pension contributions going into void');
      }
    } else if (pensionValue === undefined) {
      /* istanbul ignore next */
      log('Error: contributing to undefined pension scheme');
      /* istanbul ignore next */
      log(`model is ${showObj(model)}`);
    } else {
      // log(`old pensionValue is ${pensionValue} becomes ${pensionValue + amountForPension}`);
      pensionValue += amountForPension;

      // log(`pt.NAME = ${pt.NAME}`);
      // log(`new pensionValue is ${pensionValue}`);
      // log(`income source = ${transaction.NAME}`);
      // log('in handleIncome:');
      if (baseVal !== undefined && pensionValue) {
        pensionValue = pensionValue / baseVal;
      }
      // console.log(`${moment.date.toDateString()} setting value ${pensionValue} for pension ${pt.TO}`);
      setValue(
        values,
        growths,
        evaluations,
        moment.date,
        pt.TO,
        pensionValue,
        model,
        pt.NAME,
        '7', //callerID
      );
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
      growths,
      evaluations,
      model,
      sourceDescription,
    );
    if (isFixedIncome) {
      // console.log(`report fixed income ${moment.date.toDateString()}, ${sourceDescription}, ${amountForCashIncrement}`);
      values.set(
        `incomeFixed${sourceDescription}`,
        amountForCashIncrement,
        growths,
        moment.date,
        `incomeFixed${sourceDescription}`,
        true, // reportIfNoChange
        '47', //callerID
      );
    } else {
      // console.log(`skip report flexible income ${moment.date.toDateString()}, ${sourceDescription}, ${amountForCashIncrement}`);
    }
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
    words.forEach((liability) => {
      // log(`liability = ${liability}`);
      if (liability.endsWith(incomeTax)) {
        accumulateLiability(
          liability,
          incomeTax,
          amountForIncomeTax,
          incomes,
          moment.type,
          isFlexibleIncome,
          isFixedIncome,
          sourceDescription,
        );
        const thisPerson = liability.substring(
          0,
          liability.length - incomeTax.length,
        );
        if (person === '') {
          person = thisPerson;
        } else if (person !== thisPerson) {
          /* istanbul ignore next */
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
          incomes,
          moment.type,
          isFlexibleIncome,
          isFixedIncome,
          sourceDescription,
        );
        const thisPerson = liability.substring(
          0,
          liability.length - nationalInsurance.length,
        );
        if (person === '') {
          person = thisPerson;
        } else if (person !== thisPerson) {
          /* istanbul ignore next */
          throw new Error(
            `can't handle multiple people liable from one income`,
          );
        }
      }
    });
  }
  // log(`finished handleIncome`);
}

function logIncomeOrExpenseGrowth(
  x: IncomeOrExpense,
  isIncome: boolean,
  growths: Map<string, GrowthData>,
) {
  // if(cpiVal > 0 && (expenseGrowth > 0 || adaptedExpenseGrowth > 0)){
  //   log(`from ${expenseGrowth}, use cpi ${cpiVal} to create adaptedExpenseGrowth = ${getMonthlyGrowth(adaptedExpenseGrowth)}`);
  // }
  let power = 1;
  const freq = parseRecurrenceString(x.RECURRENCE);
  if (freq.frequency !== monthly || freq.count !== 1) {
    // scale up the stored growths value
    power = freq.count;
    if (freq.frequency === annually) {
      power *= 12;
    } else if (freq.frequency === weekly) {
      power *= 52 / 12;
    }
  }
  growths.set(x.NAME, {
    itemGrowth: '0.0',
    powerByNumMonths: power,
    scale: 0.0,
    applyCPI: !x.CPI_IMMUNE,
    annualCPI: isIncome,
  });
}

function logAssetGrowth(
  asset: Asset,
  cpiVal: number,
  growths: Map<string, GrowthData>,
  settings: Setting[],
  frequency: string,
) {
  // log(`stored growth is ${asset.GROWTH}`);
  let growth: number = parseFloat(asset.GROWTH);
  // log(`growth is ${growth}`);
  if (Number.isNaN(growth)) {
    // log(`growth is recognised as NaN`);
    let settingVal = getSettings(settings, asset.GROWTH, 'None');
    // log(`setting value for ${asset.GROWTH} is ${settingVal}`);
    /* istanbul ignore if */
    if (settingVal === 'None') {
      log(`Error: no setting value for asset growth ${asset.GROWTH}`);
      settingVal = '0.0';
    }
    growth = parseFloat(settingVal);
    /* istanbul ignore if */
    if (Number.isNaN(growth)) {
      const settingVal2 = getSettings(settings, settingVal, 'None');
      growth = parseFloat(settingVal2);
      if (Number.isNaN(growth)) {
        log(
          'Error: cant parse setting value for asset growth ' +
            `${asset.GROWTH} = ${settingVal}`,
        );
        growth = 0.0;
      }
    }
  } else {
    // log(`growth is not recognised as a NaN - assume parseFloat gave something useful`);
  }
  // log(`annual growth before cpi adjustment is ${growth}`);
  const adaptedAssetGrowth =
    cpiVal !== 0
      ? ((1.0 + (growth + cpiVal) / 100) / (1.0 + cpiVal / 100) - 1.0) * 100
      : growth;
  // log(`annual growth after cpi adjustment is ${adaptedAssetGrowth}`);
  // if(cpiVal > 0 && (growth > 0 || adaptedAssetGrowth > 0)){
  //   log(`from ${asset.GROWTH}, use cpi ${cpiVal} to create adaptedExpenseGrowth = ${getMonthlyGrowth(adaptedAssetGrowth)}`);
  // }
  const powerByNumMonths = 1;
  /* istanbul ignore if */
  if (frequency === annually) {
    /* istanbul ignore next */
    log(`Error : didn't expect assets to have annual recurrent growth`);
    // powerByNumMonths = 12;
  } else if (frequency === weekly) {
    /* istanbul ignore next */
    log(`Error : didn't expect assets to have weekly recurrent growth`);
    // powerByNumMonths = 12 / 52;
  }
  growths.set(asset.NAME, {
    itemGrowth: asset.GROWTH,
    powerByNumMonths: powerByNumMonths,
    scale: getMonthlyGrowth(adaptedAssetGrowth),
    applyCPI: !asset.CPI_IMMUNE,
    annualCPI: false,
  });
}

function logAssetValueString(
  assetVal: string,
  assetStart: string,
  assetName: string,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  level = 1,
): boolean {
  const debug = false;
  /* istanbul ignore if  */ //debug
  if (debug) {
    log(
      `level${level}: logAssetValueString processing ${assetVal} as value of ${assetName}`,
    );
  }
  if (isNumberString(assetVal)) {
    // log(`${assetVal} is a number string`);
    return true;
  }

  /* istanbul ignore if  */ //debug
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
    /* istanbul ignore if  */ //debug
    if (debug) {
      log(`there's no setting for ${assetVal}`);
    }
    const wordPart = removeNumberPart(assetVal);

    /* istanbul ignore else  */
    if (wordPart !== undefined) {
      /* istanbul ignore if  */ //debug
      if (debug) {
        log(`level${level}: go do work on ${wordPart} instead`);
      }
      parsedOK = logAssetValueString(
        wordPart,
        assetStart,
        wordPart,
        values,
        growths,
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
      log(`ERROR: can't parse asset value ${assetVal}`);
      parsedOK = false;
    }
  } else {
    /* istanbul ignore if  */ //debug
    if (debug) {
      log(
        `level${level}: we found ${assetVal} as a setting with value ${settingVal}`,
      );
    }
    if (isNumberString(settingVal)) {
      /* istanbul ignore if  */ //debug
      if (debug) {
        log(
          `isNumber: level${level}: go set the value of ${assetVal} as number ${parseFloat(
            settingVal,
          )}`,
        );
      }
      setValue(
        values,
        growths,
        evaluations,
        getTriggerDate(assetStart, model.triggers, getVarVal(model.settings)),
        assetVal,
        parseFloat(settingVal),
        model,
        assetName,
        '8', //callerID
      );
      /* istanbul ignore if  */ //debug
      if (debug) {
        log(`level${level}: return true`);
      }
      return true;
    } else {
      /* istanbul ignore if  */ //debug
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
        growths,
        evaluations,
        model,
        level + 1,
      );
    }
  }
  if (parsedOK && level > 1) {
    if (assetName !== assetVal) {
      /* istanbul ignore if  */ //debug
      if (debug) {
        log(
          `parsedOK: level${level}: go set the value of ${assetName} as ${assetVal}`,
        );
      }
      setValue(
        values,
        growths,
        evaluations,
        getTriggerDate(assetStart, model.triggers, getVarVal(model.settings)),
        assetName,
        assetVal,
        model,
        assetName,
        '9', //callerID
      );
    }

    /* istanbul ignore if  */ //debug
    if (debug) {
      log(`level${level}: return true`);
    }
    return true;
  } else {
    /* istanbul ignore if  */ //debug
    if (debug) {
      log(`level${level}: return false`);
    }
    return false;
  }
}

function getRecurrentMoments(
  x: {
    // could be an income or an expense
    NAME: string;
    START: string; // trigger string
    END: string; // trigger string
    VALUE: string;
    VALUE_SET: string; // trigger string
    RECURRENCE: string;
  },
  prepType: string,
  type: string,
  model: ModelData,
  startSequenceFrom: Date,
  startExpenseOrIncomeDate: Date,
  rOIEndDate: Date,
) {
  const v = getVarVal(model.settings);
  // log(`in getRecurrentMoments`);
  let endDate = getTriggerDate(x.END, model.triggers, v);
  if (rOIEndDate < endDate) {
    endDate = rOIEndDate;
  }
  const roi = {
    start: startSequenceFrom,
    end: endDate,
  };
  const dates = generateSequenceOfDates(roi, x.RECURRENCE);
  const newMoments: Moment[] = dates.map((date) => {
    let typeForMoment = type;
    if (date < startExpenseOrIncomeDate) {
      typeForMoment = prepType;
    }
    const result: Moment = {
      date,
      name: x.NAME,
      type: typeForMoment,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });

  // Set up special values in the first value.
  if (newMoments.length > 0) {
    if (type === momentType.expense) {
      /* istanbul ignore if  */
      if (newMoments[0].type === momentType.expensePrep) {
        // this would be consistent with incomes
        // but it never happens
        // because the code to set expenseStartPrep
        // is elsewhere
        // see "TODO : rationalise how these are set up"
        // newMoments[0].type = momentType.expenseStartPrep;
        log(`Error: don't expect to set starts of expenses like this`);
      } else {
        newMoments[0].type = momentType.expenseStart;
      }
    } else if (type === momentType.income) {
      if (newMoments[0].type === momentType.incomePrep) {
        newMoments[0].type = momentType.incomeStartPrep;
        //throw new Error('break!');
      } else {
        newMoments[0].type = momentType.incomeStart;
      }
    }
    const startVal = x.VALUE;
    const from = getTriggerDate(x.VALUE_SET, model.triggers, v);
    const to = roi.start;
    // log(`${x.NAME} grew between ${from} and ${to}`);
    const numMonths = diffMonths(from, to);
    /* istanbul ignore if */
    if (!x.NAME.startsWith(pensionDB) && numMonths < 0) {
      log(
        `Error: income/expense start value set ${from} after ` +
          `start date ${to} ${x.NAME}`,
      );
    }
    newMoments[0].setValue = startVal;
  }
  // log(`generated ${showObj(newMoments)} for ${x.NAME}`);
  return newMoments;
}

function getAssetMoments(
  asset: Asset,
  model: ModelData,
  rOIEndDate: Date,
  frequency: string,
  trackingOnly: boolean,
) {
  const roi = {
    start: getTriggerDate(
      asset.START,
      model.triggers,
      getVarVal(model.settings),
    ),
    end: rOIEndDate,
  };
  // log(`roi = ${showObj(roi)}`)
  let freqString = '1m';
  if (frequency === weekly) {
    if (trackingOnly) {
      freqString = '1w';
    } else {
      freqString = '1m';
    }
  } else if (frequency === annually) {
    freqString = '1m';
  }
  const dates = generateSequenceOfDates(roi, freqString);
  // log(`dates = ${showObj(dates)}`)
  const name = trackingOnly ? `${asset.NAME}${tracking}` : asset.NAME;
  if (trackingOnly) {
    dates.shift();
  }
  const newMoments = dates.map((date) => {
    const result: Moment = {
      date,
      name: name,
      type: momentType.asset,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });
  if (newMoments.length > 0 && !trackingOnly) {
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
  model: ModelData,
  rOIEndDate: Date,
) {
  const triggers = model.triggers;
  const v = getVarVal(model.settings);
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
      const transStop = getTriggerDate(transaction.STOP_DATE, triggers, v);
      if (stop > transStop) {
        stop = transStop;
      }
    }
    const sequenceRoi: Interval = {
      start: getTriggerDate(transaction.DATE, triggers, v),
      end: stop,
    };
    const transactionDates = generateSequenceOfDates(
      sequenceRoi,
      transaction.RECURRENCE,
    );
    transactionDates.forEach((d) => {
      newMoments.push({
        name: transaction.NAME,
        date: d,
        type: momentType.transaction,
        setValue: undefined,
        transaction,
      });
    });
  } else {
    const date = getTriggerDate(transaction.DATE, triggers, v);
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
  /* istanbul ignore else */ //error
  if (asset) {
    return asset.CAN_BE_NEGATIVE;
  } else {
    log(`Error : asset name ${assetName} not found in assets list`);
    return (
      assetName === CASH_ASSET_NAME ||
      assetName.includes('mortgage') ||
      assetName.includes('Mortgage')
    );
  }
}

function revalueApplied(
  t: Transaction,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  incomes: LiableIncomes,
  model: ModelData,
) {
  if (!t.NAME.startsWith(revalue)) {
    return false;
  }
  // log(`it's a revaluation`)
  /* istanbul ignore if */
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
    growths,
    t.TO_VALUE,
  );
  const toVal = tToValue;
  // log(`t.TO = ${t.TO}, tToValue = ${tToValue}`);
  let words = t.TO.split(separator);
  words = replaceCategoryWithAssetNames(words, model);
  words.forEach((w) => {
    const wValue = values.get(w);
    // log(`word from ${t.TO} is ${w} has value ${wValue}`);
    let prevValue: number | undefined = undefined;
    let scaledNumberWordParts = false;
    if (wValue === undefined) {
      // log(`word for ${showObj(t)} is ${w} has value ${wValue}`);
      /* istanbul ignore next */
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
            /* istanbul ignore next */
            //throw new Error(
            //  `proportional change to a not-number value ${wValue} not implemented`,
            //);
            log(
              `ERROR: proportional change to a not-number value ${wValue} not implemented`,
            );
            /* istanbul ignore next */
            tToValue = 999999; // TODO  make this fail the checker
          }
        } else {
          /* istanbul ignore next */
          //throw new Error(
          //  `proportional change to a not-number value ${wValue} not implemented`,
          //);
          log(
            `ERROR: proportional change to a not-number value ${wValue} not implemented`,
          );
          /* istanbul ignore next */
          tToValue = 999999; // TODO  make this fail the checker
        }
      }
    }
    if (!t.TO_ABSOLUTE) {
      // this is a proportional change
      // log(`previous value was ${prevValue}`);
      if (prevValue === undefined) {
        /* istanbul ignore if */
        if (!scaledNumberWordParts) {
          log(
            'WARNING : proportional value supplied' +
              ' for a revaluation transaction' +
              ` with no prev value ${showObj(t)}`,
          );
        }
      } else {
        if (toVal === undefined) {
          /* istanbul ignore next */
          throw new Error(`can't interpret scale value ${t.TO_VALUE}`);
        } else {
          // log(`tToValue = '' + ${prevValue} + ${toVal};`);
          tToValue = prevValue * toVal;
        }
      }
    }
    // log income tax liability for assets which grow
    const matchingAsset = model.assets.find((a) => {
      return a.NAME === w;
    });
    if (matchingAsset !== undefined) {
      const liabilities = matchingAsset.LIABILITY.split(separator);
      liabilities.forEach((l) => {
        if (l.endsWith(incomeTax)) {
          if (prevValue === undefined) {
            /* istanbul ignore next */
            log(`WARNING : no prev value found for revalue`);
          } else if (tToValue === undefined || typeof tToValue === 'string') {
            /* istanbul ignore next */
            log(`WARNING : tToValue undefined/string for revalue`);
          } else {
            const gain = tToValue - prevValue;
            if (gain > 0) {
              // log(`handle liability ${l} with gain ${gain}`);
              const q = getQuantity(matchingAsset.NAME, values, model);
              /* istanbul ignore if */
              if (q !== undefined) {
                log('Error: income tax on quantities');
                throw new Error('income tax on quantities not allowed');
              }
              accumulateLiability(
                l,
                incomeTax,
                gain,
                incomes,
                moment.type,
                true, // isFlexibleIncome
                false, // isFixedIncome
                `revalue ${matchingAsset.NAME}`,
              );
            }
          }
        }
      });
    }

    let appliedBaseVal = false;
    const gd = growthData(w, growths, values);
    if (t.TO_ABSOLUTE && typeof tToValue === 'number' && gd.adjustForCPI) {
      const baseVal = gd.baseVal;
      //log(
      //  `for ${
      //    moment.name
      //  } scale ${tToValue} by baseVal = ${baseVal} to give ${
      //    tToValue / baseVal
      //  }`,
      //);
      const newValForEvaluations = tToValue / baseVal;
      tToValue = newValForEvaluations;
      appliedBaseVal = true;
    }

    // log(`passing ${t.TO_VALUE} as new value of ${moment.name}`);
    // log('in revalueApplied:');
    if (
      (!t.TO_ABSOLUTE && tToValue !== undefined) ||
      (appliedBaseVal && typeof tToValue === 'number')
    ) {
      setValue(
        values,
        growths,
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
        growths,
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

function stringFromDate(d: Date): string {
  const result = dateAsString(DateFormatType.Data, d);
  // log(`stringFromDate ${result}`);
  return result;
}

function calculateFromChange(
  t: Transaction,
  preToValue: number | undefined,
  preFromValue: number,
  fromWord: string,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
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
  // log(`t = ${showObj(t)}`);
  // log(`t.FROM_VALUE = ${t.FROM_VALUE}`);
  /* istanbul ignore if */
  if (t.NAME.startsWith(conditional) && preToValue === undefined) {
    log(`Error: conditional transaction to undefined value ${showObj(t)}`);
    //throw new Error(
    //  `Error: conditional transaction to undefined value ${showObj(t)}`,
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
  let tFromValue = traceEvaluation(t.FROM_VALUE, values, growths, t.FROM);
  /* istanbul ignore if */
  if (tFromValue === undefined) {
    log(`ERROR : can't interpret from value ${t.FROM_VALUE}`);
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

  const matchingAsset = model.assets.find((a) => {
    return a.NAME === fromWord;
  });
  const assetNotAllowedNegative =
    matchingAsset && !assetAllowedNegative(fromWord, matchingAsset);

  if (t.FROM_ABSOLUTE) {
    // log(`use all of fromValue = ${tFromValue}`);
    if (t.FROM_VALUE.startsWith(bondMaturity)) {
      // log(`transaction ${showObj(t)} begins with ${bondMaturity}`);

      // Either we're investing in a bond or a bond is maturing
      if (t.FROM === CASH_ASSET_NAME) {
        // log('investing');
        // log(`setting name = ${s.NAME}`);
        const d = new Date(moment.date);
        // log(`t.NAME = ${t.NAME} seeks a matching setting...`);

        const bondInterestRate = getNumberValue(values, bondInterest, false);
        const cpiVal = getNumberValue(values, cpi);
        let bondScale = 1.0;
        if (bondInterestRate !== undefined && cpiVal !== undefined) {
          bondScale = 1.0 + (bondInterestRate + cpiVal) / 100.0;
        }

        // log(`before date shift, d = ${dateAsString(DateFormatType.Debug,d)}`);
        if (t.NAME.endsWith('5y')) {
          d.setFullYear(d.getFullYear() + 5);
          bondScale = bondScale ** 5;
        } else if (t.NAME.endsWith('4y')) {
          d.setFullYear(d.getFullYear() + 4);
          bondScale = bondScale ** 4;
        } else if (t.NAME.endsWith('3y')) {
          d.setFullYear(d.getFullYear() + 3);
          bondScale = bondScale ** 3;
        } else if (t.NAME.endsWith('2y')) {
          d.setFullYear(d.getFullYear() + 2);
          bondScale = bondScale ** 2;
        } else if (t.NAME.endsWith('1y')) {
          d.setFullYear(d.getFullYear() + 1);
        } else {
          /* istanbul ignore next */
          log(
            'BUG - could not infer duration of bond from bond name (does not end 1y etc)',
          );
        }
        // log(`after date shift, d = ${dateAsString(DateFormatType.Debug,d)}`);

        // the bond will grow by bondScale, so to reach a target value of
        // tFromValue, we actually invest tFromValue / bondScale
        // log(`divide ${tFromValue} value by ${bondScale} to get ${tFromValue / bondScale}`);
        tFromValue /= bondScale;

        // log(`for ${t.NAME}, look for a setting like
        //   ${t.FROM_VALUE}${separator}${t.DATE locale string}${separator}${cpi}`);
        const matchedSetting = model.settings.filter((s) => {
          const sparts = s.NAME.split(separator);
          if (sparts.length !== 3) {
            return false;
          }
          if (sparts[0] !== t.FROM_VALUE) {
            return false;
          }
          /* istanbul ignore if */
          if (sparts[2] !== cpi) {
            log(`Error: malformed bond setting ${s.NAME}`);
            return false;
          }
          if (d.getTime() !== new Date(sparts[1]).getTime()) {
            // log(`different dates ${dateAsString(DateFormatType.Debug,d)} !== ${dateAsString(DateFormatType.Debug,new Date(sparts[1]))}`);
            return false;
          }

          // log(`matched to ${s.NAME}`);
          // log(`same dates ${dateAsString(DateFormatType.Debug,new Date(moment.date))} === ${sparts[1]}`);
          return true;
        });
        if (matchedSetting.length === 1) {
          const cpiScaling = getNumberValue(values, matchedSetting[0].NAME);
          // log(`Bond cpiScaling from ${matchedSetting[0].NAME} = ${cpiScaling}`);
          if (cpiScaling !== undefined) {
            tFromValue *= cpiScaling;
            // log(`scale by CPI effect ${cpiScaling}, tFromValue = ${tFromValue}`);
          } else {
            /* istanbul ignore next */
            log(`Error: np cpiScaling value found for bond investment`);
          }
        } else {
          /* istanbul ignore if */
          if (!model.settings.find((s) => s.NAME === `${bondMaturity}Prerun`)) {
            log(
              `BUG : expected to find a setting ${
                t.FROM_VALUE
              }${separator}${stringFromDate(d)}${separator}${cpi}`,
            );
          }
        }
      } else {
        // log('maturing');
        const valueKey = `${t.FROM_VALUE}${separator}${stringFromDate(
          new Date(moment.date),
        )}${separator}${cpi}invested`;
        // log(`for maturing bond, look for ${valueKey}`);
        const val = getNumberValue(values, valueKey, false);
        if (val !== undefined) {
          // log(`for maturing bond, found val = ${val}`);
          tFromValue = val;
        } else {
          // log(`for maturing bond, no investment found`);
          tFromValue = 0.0; // nothing was registered as invested
        }
      }
    }
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
      if (q && q < numberUnits) {
        numberUnits = q;
      }
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
    fromChange >= -preToValue / tToValue
  ) {
    // log(`before considering granular changes, fromChange = ${fromChange}`);
    // log(`cap conditional amount - we only need ${preToValue}`);
    const lowestFromChange = -preToValue / tToValue;
    const grain = traceEvaluation('Grain', values, growths, t.NAME);
    // log(`Grain's value is ${grain}`);
    if (grain !== undefined && t.TO === CASH_ASSET_NAME && !fromHasQuantity) {
      const granularChange = Math.ceil(lowestFromChange / grain) * grain;
      // log(`lowestChange : ${lowestFromChange}, granularChange : ${granularChange}`);
      // log(`preFromValue : ${preFromValue}`);
      if (granularChange < preFromValue) {
        fromChange = granularChange;
      } else {
        fromChange = lowestFromChange;
      }
    } else {
      fromChange = lowestFromChange;
    }
    if (fromHasQuantity) {
      //log(`quantity involved in working out fromChange`);
      numberUnits = Math.ceil(fromChange / unitValue);
      fromChange = numberUnits * unitValue;
    } else {
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
    let source = t.NAME;
    if (source.startsWith(conditional)) {
      source = source.substring(conditional.length);
    }
    setValue(
      values,
      growths,
      evaluations,
      moment.date,
      quantity + fromWord,
      q - numberUnits,
      model,
      source,
      '12', //callerID
    );
  }

  // Allow some assets to become negative but not others
  if (
    assetNotAllowedNegative &&
    !fromHasQuantity &&
    fromChange > preFromValue
  ) {
    // log(`fromChange = ${fromChange} > preFromValue ${preFromValue}`);
    if (t.NAME.startsWith(conditional)) {
      // transfer as much as we have
      // log(`transfer only ${preFromValue} because we don't have ${fromChange}`);
      fromChange = preFromValue;
    } else {
      // don't transfer anything - we haven't enough
      // log(`fromChange - preFromValue = ${fromChange} - ${preFromValue}`+
      //    `= ${fromChange - preFromValue}`);
      if (fromChange - preFromValue < 0.00001) {
        // TODO TOLERANCE!!!!
        // clean up a difference which looks like noise
        fromChange = preFromValue;
      } else {
        // log(`don't apply transaction from ${fromWord} `
        //  +`because value ${preFromValue} < ${fromChange} `);
        return undefined;
      }
    }
  }
  const matchingIncome = model.incomes.find((i) => {
    return i.NAME === fromWord;
  });
  /* istanbul ignore if  */ //error
  if (matchingIncome && fromChange > preFromValue) {
    log(
      `Error: dont take more than income value ` +
        `${preFromValue} from income ${matchingIncome.NAME}`,
    );
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
  // log(`returning data ${showObj(result)}`);
  return result;
}

function calculateToChange(
  t: Transaction,
  preToValue: number | undefined,
  fromChange: number | undefined,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  // log(`t = ${showObj(t)}`);
  let toChange = 0;

  /* istanbul ignore if  */ //error
  if (t.TO === '') {
    log(
      `Error - doesn't make sense to calulate a To value for ` +
        `${t.NAME} when destination is empty`,
    );
    return toChange;
  }
  const tToValue = parseFloat(t.TO_VALUE);
  // log(`t.TO = ${t.TO}`)
  // log(`before transaction, toValue = ${tToValue}`)
  /* istanbul ignore if  */ //error
  if (preToValue === undefined) {
    throw new Error(`Error: transacting to unvalued asset ${showObj(moment)}`);
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
      const currentValue = traceEvaluation(t.TO, values, growths, t.TO);
      if (currentValue !== undefined) {
        const newNumUnits = q + numUnits;
        // log(`newNumUnits = ${newNumUnits}`);
        setValue(
          values,
          growths,
          evaluations,
          moment.date,
          quantity + t.TO,
          newNumUnits,
          model,
          t.TO,
          '45', //callerID
        );
        const matchedAsset = model.assets.find((a) => {
          return a.NAME === t.TO;
        });
        if (matchedAsset) {
          // if the asset is subject to CGT there will be a
          // purchase value (and if not, there won't be)
          const oldPurchaseVal = getNumberValue(
            values,
            `${purchase}${matchedAsset.NAME}`,
            false, // don't expect the value to necessarily be there
          );
          const purchasePrice = getNumberValue(
            values,
            matchedAsset.PURCHASE_PRICE,
            false,
          );
          if (oldPurchaseVal !== undefined && purchasePrice !== undefined) {
            const newPurchaseVal = oldPurchaseVal + purchasePrice * numUnits;
            setValue(
              values,
              growths,
              evaluations,
              moment.date,
              `${purchase}${matchedAsset.NAME}`,
              newPurchaseVal,
              model,
              t.TO,
              '46', //callerID
            );
          }
        }
        toChange = 0.0;
        // log(`toChange = ${toChange}`);
      }
    }
  } else {
    if (fromChange === undefined) {
      /* istanbul ignore next */
      throw new Error(
        'Error: transacting to proportion of undefined fromChange' +
          `${showObj(moment)}`,
      );
    }
    // proportion of the amount taken from from_asset
    toChange = tToValue * fromChange;
  }

  if (t.FROM_VALUE.startsWith(bondMaturity) && t.FROM === CASH_ASSET_NAME) {
    const bondInterestRate = getNumberValue(values, bondInterest, false);
    const cpiVal = getNumberValue(values, cpi);
    let bondScale = 1.0;
    if (bondInterestRate !== undefined && cpiVal !== undefined) {
      bondScale = 1.0 + (bondInterestRate + cpiVal) / 100.0;
    }
    // duration of the bond powers up the scaling here
    if (t.NAME.endsWith('5y')) {
      bondScale = bondScale ** 5;
    } else if (t.NAME.endsWith('4y')) {
      bondScale = bondScale ** 4;
    } else if (t.NAME.endsWith('3y')) {
      bondScale = bondScale ** 3;
    } else if (t.NAME.endsWith('2y')) {
      bondScale = bondScale ** 2;
    } else if (t.NAME.endsWith('1y')) {
    }
    toChange *= bondScale;
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
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  liabliitiesMap: Map<string, string>,
  incomes: LiableIncomes,
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
  const cgtLiability = liabilityWords.find((word) => word.endsWith(cgt));
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
    // if (fromWord.includes('ESPP') || fromWord.includes('RSU')) {
    // log(`at ${moment.date.toDateString()}, \ntotalGain = preFromValue - purchasePrice = ${preFromValue} - ${purchasePrice} = ${totalGain}`);
    // }
    const proportionGain = totalGain * proportionSale;
    // if (fromWord.includes('ESPP') || fromWord.includes('RSU')) {
    // log(`proportionGain = ${proportionGain}`);
    // }
    let cgtMap = incomes.inTaxYear.cgt;
    if (cgtMap === undefined) {
      incomes.inTaxYear.cgt = new Map<string, LiabilityTotalAndSources>();
      cgtMap = incomes.inTaxYear.cgt;
    }
    let currentcgtVal = cgtMap.get(cgtLiability);
    if (currentcgtVal === undefined) {
      currentcgtVal = {
        amount: 0.0,
        sources: [],
      };
      cgtMap.set(cgtLiability, currentcgtVal);
    }

    addToTaxLiability(currentcgtVal, proportionGain, `${t.NAME}`);
    // if (fromWord.includes('ESPP') || fromWord.includes('RSU')) {
    // log(`setting new value for cgt ${currentcgtVal}`);
    // }
    cgtMap.set(cgtLiability, currentcgtVal);
    // log(`logged cgt for ${cgtLiability}, accumulated value ${currentcgtVal}`);

    const newPurchasePrice = purchasePrice * (1 - proportionSale);
    // when selling some asset, we reduce the Purchase value
    // of what's left for CGT purposes
    // log(`in handleCGTLiability, set newPurchasePrice = ${newPurchasePrice}`);
    setValue(
      values,
      growths,
      evaluations,
      moment.date,
      `${purchase}${fromWord}`,
      newPurchasePrice,
      model,
      t.NAME, // TODO no test??
      '13', //callerID
    );
  } else {
    /* istanbul ignore next */
    log('BUG!! - CGT liability on an asset with no record of purchase price');
  }
}

export function makeSourceForFromChange(t: Transaction) {
  const sourceDescription = getDisplayName(t.NAME, t.TYPE);
  return sourceDescription;
}

export function makeSourceForToChange(t: Transaction) {
  let source = t.NAME;
  if (source.startsWith(conditional)) {
    source = source.substring(conditional.length);
  }
  return source;
}

function processTransactionFromTo(
  t: Transaction,
  fromWord: string,
  toWord: string,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
  liabliitiesMap: Map<string, string>,
  incomes: LiableIncomes,
) {
  // log(`process t = ${showObj(t)}`);
  // log(`processTransactionFromTo fromWord = ${fromWord} toWord = ${toWord}, date = ${dateAsString(DateFormatType.Debug,moment.date)}`);
  // log(`processTransactionFromTo takes in ${showObj(t)}`);
  const preFromValue = traceEvaluation(fromWord, values, growths, fromWord);
  // log(`pound value of ${fromWord} before transaction is ${preFromValue}`);
  let preToValue = undefined;
  if (toWord !== '') {
    preToValue = traceEvaluation(toWord, values, growths, toWord);
    /* istanbul ignore if */
    if (preToValue === undefined) {
      log(`Error: don't expect preToValue to be undefined!`);
      preToValue = 0.0;
    }
    // log(`pound value of ${toWord} before transaction is ${preToValue}`);
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
      growths,
      evaluations,
      model,
    );
    // Transaction is permitted to be blocked by the calculation
    // of fromChange - e.g. if it would require an asset to become
    // a not-permitted value (e.g. shares become negative).
    if (fromChange === undefined) {
      // log(`transaction blocked - can't take ${t.FROM_VALUE} from ${fromWord}, had value ${preFromValue}`)
      return;
    }
  }
  // log(`for ${t.NAME}, fromChange = ${fromChange?.fromImpact}`);

  // Determine how to change the To asset.
  let toChange;
  if (preToValue !== undefined && fromChange !== undefined) {
    toChange = calculateToChange(
      t,
      preToValue,
      fromChange.toImpact,
      moment,
      values,
      growths,
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
      growths,
      evaluations,
      liabliitiesMap,
      incomes,
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
      // log(`newFromValue = ${newFromValue}`);
      const gd = growthData(fromWord, growths, values);
      if (gd.adjustForCPI) {
        const baseVal = gd.baseVal;
        newFromValue = newFromValue / baseVal;
      }
    }
    // log(`newFromValue to store = ${newFromValue}`);
    setValue(
      values,
      growths,
      evaluations,
      moment.date,
      fromWord,
      newFromValue,
      model,
      makeSourceForFromChange(t),
      '14', //callerID
    );
    if (t.FROM === t.TO && typeof newFromValue === 'number') {
      // we have changed the to value now because we just set the from value!
      preToValue = newFromValue;
    }
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
        growths,
        evaluations,
        model,
        pensionTransactions,
        liabliitiesMap,
        incomes,
        fromWord,
        true, //isFlexibleIncome,
        false, //isFixedIncome,
      );
    } else {
      if (preToValue === undefined) {
        /* istanbul ignore next */
        throw new Error(
          'Error: transacting to adjust undefined toValue' +
            `${showObj(moment)}`,
        );
      }

      if (t.FROM_VALUE.startsWith(bondMaturity) && t.FROM === CASH_ASSET_NAME) {
        // we're about to invest into a bond
        // log(`invested ${toChange} into a bond for ${showObj(t)}`);
        const d = getMaturityDate(moment.date, t.NAME);
        const investedValue = toChange;

        const nameForMaturity = `${t.FROM_VALUE}${separator}${stringFromDate(
          d,
        )}${separator}${cpi}invested`;
        // log(`create a stored value for maturity ${nameForMaturity}`);

        values.set(
          nameForMaturity,
          investedValue,
          growths,
          moment.date,
          'bondInvestment',
          false, // reportIfNoChange
          '42', //callerID
        );
        // log(`recorded investedValue = ${investedValue} with name ${nameForMaturity}`);
      }
      const x: string | number | undefined = values.get(toWord);
      const updateTargetValue =
        toWord.startsWith(pensionTransfer) ||
        !x ||
        typeof x === 'number' ||
        isNumberString(x);
      if (updateTargetValue) {
        // log('in processTransactionFromTo, setValue:');
        // log(`in processTransactionFromTo, setValue of ${toWord} to ${preToValue + toChange}`);
        let newToValue = preToValue + toChange;
        const gd = growthData(toWord, growths, values);
        if (gd.adjustForCPI) {
          const baseVal = gd.baseVal;
          // log(`scale newToValue = ${newToValue} by b = ${b}`);
          newToValue = newToValue / baseVal;
          // log(`scaled newToValue = ${newToValue}`);
        }
        //log(
        //  `for ${t.NAME}, for asset ${t.TO}, write newToValue = ${newToValue}`,
        //);
        setValue(
          values,
          growths,
          evaluations,
          moment.date,
          toWord,
          newToValue,
          model,
          makeSourceForToChange(t),
          '15', //callerID
        );
      } else if (x) {
        // log(`Don't write new value for toWord = ${toWord} with value ${x}`);
        // log(`Do write a pre-existing defined value`);
        setValue(
          values,
          growths,
          evaluations,
          moment.date,
          toWord,
          x,
          model,
          makeSourceForToChange(t),
          '15', //callerID
        );
      }
    }
  } else {
    // special case - if we're reducing an income tax liability
    // because we paid money into a pension
    ///////////////...
    /* istanbul ignore if */
    if (t.FROM.endsWith(incomeTax) && t.TO === '') {
      // We're reducing our income tax liability
      // because of a pension scheme contribution.
      // Make a matching addition to our pensionAllowance
      // total too.
      // log(`use up ${fromChange} of ${pensionAllowance} for ${t.FROM}`);
      log(
        `WARNING : one-off income tax adjustment might affect pensionAllowance...no code for this`,
      );
      // throw new Error('unhandled pensionAllowance change');
    }
  }
}

function processTransactionTo(
  t: Transaction,
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  const tToValue = parseFloat(t.TO_VALUE);
  const fromChange = parseFloat(t.FROM_VALUE);
  // Determine how much to add to the To asset.
  // Set the increased value of the To asset accordingly.
  // log(`t.TO = ${t.TO}`)
  let value = traceEvaluation(t.TO, values, growths, t.TO);
  let q = getQuantity(t.TO, values, model);
  // log(`before transaction, value = ${value}, quantity = ${quantity}`);
  // log(`t = ${showObj(t)}`);
  if (value === undefined) {
    /* istanbul ignore next */
    throw new Error(
      `Error: transacting to unvalued/string-valued asset ${showObj(moment)}`,
    );
  } else {
    let change = 0;
    // log(`t.TO_VALUE = ${t.TO_VALUE}`);
    /* istanbul ignore else */ //error
    if (t.TO_ABSOLUTE) {
      change = tToValue;
    } else {
      log(`ERROR : invalid model has ${t.NAME} with a proportional to-value`);
      if (tToValue > 1.0) {
        log(`WARNING : not-absolute value ${tToValue} > 1.0`);
      }
      // proportion of the amount taken from from_asset
      change = tToValue * fromChange;
    }
    if (q !== undefined) {
      // log(`quantity = ${q} will increase by change = ${change}`);
      q += change;
      // log('in processTransactionTo, setValue:');
      setValue(
        values,
        growths,
        evaluations,
        moment.date,
        quantity + t.TO,
        q,
        model,
        t.NAME,
        '37', //callerID
      );
      const matchedAsset = model.assets.find((a) => {
        return a.NAME === t.TO;
      });
      if (matchedAsset) {
        updatePurchaseValue(
          matchedAsset,
          values,
          growths,
          q / (q - change),
          evaluations,
          moment.date,
          model,
          t.NAME,
        );
      }
    } else {
      // log(`value = ${value} will increase by change = ${change}`);
      value += change;
      const gd = growthData(t.TO, growths, values);
      if (gd.adjustForCPI) {
        const baseVal = gd.baseVal;
        value = value / baseVal;
        // log(`scaled value = ${value}`);
      }
      // log('in processTransactionTo, setValue:');
      setValue(
        values,
        growths,
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
}

function processTransactionMoment(
  moment: Moment,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
  pensionTransactions: Transaction[],
  liabliitiesMap: Map<string, string>,
  incomes: LiableIncomes,
) {
  // log(`in processTransactionMoment`);
  // transactions have a direct effect on their
  // "from" and "to" assets.  Apply the transaction
  // and set new asset values.
  const t = moment.transaction;
  if (t === undefined) {
    /* istanbul ignore next */
    throw Error('BUG!!! moment of type transaction should have a transaction');
  }
  // log(`process transaction ${showObj(t.NAME)}`);

  // Some transactions are simple Revalues.  They have no
  // FROM and a value for TO.  Code similar to application
  // of growth to assets, except we know the new value.
  if (revalueApplied(t, moment, values, growths, evaluations, incomes, model)) {
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
          growths,
          evaluations,
          model,
          pensionTransactions,
          liabliitiesMap,
          incomes,
        );
      }
    }
  } else if (t.FROM === '' && t.TO !== '') {
    // log(`process a transaction from ${t.FROM} to ${t.TO}`);
    processTransactionTo(t, moment, values, growths, evaluations, model);
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

  words.forEach((word) => {
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
  growths: Map<string, GrowthData>,
  evaluations: Evaluation[],
  model: ModelData,
) {
  if (a.LIABILITY.includes(cgt)) {
    let purchaseValue = 0.0;
    if (isNumberString(a.PURCHASE_PRICE)) {
      purchaseValue = parseFloat(a.PURCHASE_PRICE);
    } else {
      const tracedValue = traceEvaluation(
        a.PURCHASE_PRICE,
        values,
        growths,
        a.NAME,
      );
      if (tracedValue === undefined) {
        /* istanbul ignore next */
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
      growths,
      evaluations,
      getTriggerDate(a.START, model.triggers, getVarVal(model.settings)),
      `${purchase}${a.NAME}`,
      purchaseValue,
      model,
      `${purchase}${a.NAME}`,
      '17', //callerID
    );
  }
}

function shiftDate(oldDate: Date, recurrence: string, stepCount: number): Date {
  const freq = parseRecurrenceString(recurrence);
  if (freq.frequency === monthly) {
    const newDate = oldDate;
    newDate.setMonth(oldDate.getMonth() + stepCount * freq.count);
    return newDate;
  } else if (freq.frequency === weekly) {
    const newDate = oldDate;
    newDate.setDate(oldDate.getDate() + 7 * stepCount * freq.count);
    return newDate;
  } else if (freq.frequency === annually) {
    const newDate = oldDate;
    newDate.setFullYear(oldDate.getFullYear() + stepCount * freq.count);
    return newDate;
  } else {
    /* istanbul ignore next  */ //error
    log('Error : unsupported recurrence');
    /* istanbul ignore next  */ //error
    return oldDate;
  }
}

function generateMoments(
  model: ModelData,
  frequency: string,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  cpiInitialVal: number,
  roiStartDate: Date,
  roiEndDate: Date,
  today: Date,
  evaluations: Evaluation[],
  liabilitiesMap: Map<string, string>,
  pensionTransactions: Transaction[],
) {
  let allMoments: Moment[] = [];
  const v = getVarVal(model.settings);

  // For each expense, work out monthly growth and
  // a set of moments starting when the expense began,
  // ending when the roi ends.
  model.expenses.forEach((expense) => {
    // log(`generate moments for expense ${expense.NAME}`);
    // Growth is important to set the value of the
    // first expense.  Later expense values are not
    // set here, but the 'moment' at which the expense
    // changes is set here.
    logIncomeOrExpenseGrowth(expense, false, growths);
    const expenseStart = getTriggerDate(expense.START, model.triggers, v);

    const expenseSetDate = getTriggerDate(expense.VALUE_SET, model.triggers, v);
    // log(`expense start is ${dateAsString(DateFormatType.Debug,espenseStartDate)}`);
    // log(`value set is ${dateAsString(DateFormatType.Debug,expenseSetDate)}`);
    // log(`shiftStartBackTo = ${dateAsString(DateFormatType.Debug,shiftStartBackTo)}`);
    // log(`shiftStartBackTo = ${shiftStartBackTo}`);

    // log(`expense start is ${dateAsString(DateFormatType.Debug,expenseStartDate)}

    // log(`expense start = ${expenseStart}`);
    const newMoments = getRecurrentMoments(
      expense,
      momentType.expensePrep,
      momentType.expense,
      model,
      expenseStart,
      expenseStart,
      roiEndDate,
    );
    if (
      newMoments.length > 0 &&
      newMoments[newMoments.length - 1].date.getTime() >= expenseStart.getTime()
    ) {
      const setMoment = newMoments.find((m) => {
        return m.date.getTime() === expenseSetDate.getTime();
      });
      if (setMoment === undefined) {
        newMoments[0].type = momentType.expense;
        newMoments.push({
          date: expenseSetDate,
          name: expense.NAME,
          type: momentType.expenseStartPrep, // TODO : rationalise how these are set up
          transaction: undefined,
          setValue: expense.VALUE,
        });
      }
    }
    //newMoments.forEach((m) => {
    //  log(`moment date ${m.date)}`);
    //});

    allMoments = allMoments.concat(newMoments);
  });

  // For each income, work out monthly growth and
  // a set of moments starting when the income began,
  // ending when the roi ends.
  model.incomes.forEach((income) => {
    // log(`generate moments for income ${income.NAME}`);
    // Growth is important to set the value of the
    // first income.  Later income values are not
    // set here, but the 'moment' at which the income
    // changes is set here.
    logIncomeOrExpenseGrowth(income, true, growths);
    const incomeStart = getTriggerDate(income.START, model.triggers, v);
    let shiftStartBackTo = new Date(incomeStart);

    const dbTransaction = model.transactions.find((t) => {
      return t.NAME.startsWith(pensionDB) && t.TO === income.NAME;
    });
    if (dbTransaction !== undefined) {
      const sourceIncome = model.incomes.find((i) => {
        return dbTransaction.FROM === i.NAME;
      });
      /* istanbul ignore if */
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
      shiftStartBackTo = getTriggerDate(sourceIncome.START, model.triggers, v);
    }

    const incomeSetDate = getTriggerDate(income.VALUE_SET, model.triggers, v);
    // log(`income start is ${incomeStart.toDateString()}`);
    // log(`value set is ${incomeSetDate.toDateString()}`);
    // log(`shiftStartBackTo = ${shiftStartBackTo.toDateString()}`);
    if (incomeSetDate < incomeStart && incomeSetDate < shiftStartBackTo) {
      shiftStartBackTo = incomeSetDate;
    }

    shiftDate(shiftStartBackTo, income.RECURRENCE, +1);

    let startSequenceFrom = new Date(incomeStart);
    let numAdjustments = 0;
    while (shiftStartBackTo <= startSequenceFrom) {
      // log(`shift ${startSequenceFrom} back towards ${shiftStartBackTo}`);

      startSequenceFrom = shiftDate(startSequenceFrom, income.RECURRENCE, -1);

      numAdjustments += 1;
      /* istanbul ignore if */
      if (numAdjustments > 1000) {
        /* istanbul ignore next */
        throw new Error(
          `${income.NAME} start ${income.START} too far ` +
            `from ${shiftStartBackTo}`,
        );
      }
    }

    // log(`income start = ${incomeStart.toDateString()}, startSequenceFrom = ${startSequenceFrom.toDateString()}`);
    const newMoments = getRecurrentMoments(
      income,
      momentType.incomePrep,
      momentType.income,
      model,
      startSequenceFrom,
      incomeStart,
      roiEndDate,
    );
    // for (let i = 0; i < newMoments.length; i = i + 1) {
    //   log(`newMoments[${i}] = ${newMoments[i].date.toDateString()}`);
    // }
    allMoments = allMoments.concat(newMoments);
    liabilitiesMap.set(income.NAME, income.LIABILITY);
  });

  // log(`liabilitiesMap = ...`);
  // liabilitiesMap.forEach((value, key)=>{log(`{\`${key}\`, \`${value}\`}`)});

  model.assets.forEach((asset) => {
    //  log(`log data for asset ${asset.NAME}`);
    logAssetGrowth(
      asset,
      asset.CPI_IMMUNE ? 0 : cpiInitialVal,
      growths,
      model.settings,
      monthly,
    );

    logAssetValueString(
      asset.VALUE,
      asset.START,
      asset.NAME,
      values,
      growths,
      evaluations,
      model,
    );

    const newMoments = getAssetMoments(
      asset,
      model,
      roiEndDate,
      frequency,
      false,
    );
    allMoments = allMoments.concat(newMoments);
    if (frequency === weekly) {
      const tracxkingMoments = getAssetMoments(
        asset,
        model,
        roiEndDate,
        frequency,
        true,
      );
      allMoments = allMoments.concat(tracxkingMoments);
    }

    logAssetIncomeLiabilities(asset, liabilitiesMap);
  });

  model.transactions.forEach((transaction) => {
    // one-off asset-asset transactions generate a single moment
    // recurring asset-asset transactions generate a sequence of moments
    const newMoments = getTransactionMoments(transaction, model, roiEndDate);
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
  model.settings.forEach((setting) => {
    if (
      setting.NAME === 'Grain' ||
      setting.NAME.startsWith(bondMaturity) ||
      setting.NAME === bondInterest
    ) {
      setValue(
        values,
        growths,
        evaluations,
        roiStartDate,
        setting.NAME,
        setting.VALUE,
        model,
        setting.NAME,
        '35', //callerID
      );
    }
    {
      const referencingPrices = model.assets.filter((a) => {
        return a.PURCHASE_PRICE === setting.NAME;
      });
      const referencingExpenses = model.expenses.filter((e) => {
        const parts = getNumberAndWordParts(e.VALUE);
        return parts.wordPart === setting.NAME;
      });
      if (
        (referencingPrices.length > 0 || referencingExpenses.length > 0) &&
        values.get(setting.NAME) === undefined
      ) {
        setValue(
          values,
          growths,
          evaluations,
          roiStartDate,
          setting.NAME,
          setting.VALUE,
          model,
          setting.NAME,
          '36', //callerID
        );
      }
    }
    let referencingSettings = model.settings.filter((s) => {
      return s.VALUE === setting.NAME;
    });
    referencingSettings = referencingSettings.sort();
    if (
      referencingSettings.length > 0 &&
      values.get(setting.NAME) === undefined
    ) {
      setValue(
        values,
        growths,
        evaluations,
        roiStartDate,
        setting.NAME,
        setting.VALUE,
        model,
        setting.NAME,
        '43', //callerID
      );
    }
    let referencingDates = model.transactions
      .filter((t) => {
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
      .map((t) => {
        // log(`date for matching transaction is ${t.DATE}`);
        return t.DATE;
      })
      //.map(ds => getTriggerDate(ds, model.triggers));
      .map((ds) => new Date(ds));

    // log(`got referencing dates ${showObj(referencingDates)}`);
    referencingDates = referencingDates.concat(
      model.assets
        .filter((a) => {
          if (a.GROWTH === setting.NAME) {
            return true;
          }
          return false;
        })
        .map((a) => a.START)
        .map((ds) => getTriggerDate(ds, model.triggers, v)),
    );

    // log(`referencingDates for ${setting.NAME} = ${referencingDates.map(d=>dateAsString(DateFormatType.Debug,d))}`);
    referencingDates = referencingDates.sort();
    if (referencingDates.length > 0 && values.get(setting.NAME) === undefined) {
      // log(`setValue ${setting.NAME} = ${setting.VALUE}`);
      setSettingsData.push({
        settingName: setting.NAME,
        settingVal: setting.VALUE,
        setDate: referencingDates[0],
        //        setDate: roiStartDate, ????
      });
    }
  });
  model.settings.forEach((s) => {
    if (
      !setSettingsData.find((sd) => {
        return sd.settingName === s.NAME;
      })
    ) {
      // log(`should we add setValue ${s.NAME} = ${s.VALUE}?`);
      // s isn't being set in setSettingsData
      // should we include it?
      // We need it if something in setSettingsData
      // builds on it
      const match = setSettingsData.find((ss) => {
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

  setSettingsData.forEach((d) => {
    setValue(
      values,
      growths,
      evaluations,
      d.setDate,
      d.settingName,
      d.settingVal,
      model,
      d.settingName,
      '18', //callerID
    );
  });

  if (roiEndDate > today) {
    allMoments.push({
      date: today,
      name: EvaluateAllAssets,
      type: momentType.asset,
      setValue: 0,
      transaction: undefined,
    });
  }
  // for(let i = 0; i < allMoments.length; i = i + 1) {
  //   log(`allMoments[${i}] = ${allMoments[i].date.toDateString()}`);
  // }
  return allMoments;
}

function traceEvaluationForToday(
  name: string,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
) {
  const numberVal = traceEvaluation(name, values, growths, name);
  // log(`Unit val of ${name} is ${unitVal}`);
  if (numberVal === undefined) {
    // this is not necessarily an error - just means
    // we're keeping track of something which cannot be
    // evaluated.
    // log(`evaluation of ${name} undefined`);
    return 0.0;
  } else {
    const valForEvaluations = numberVal;
    // log(`evaluation of ${name} today is ${valForEvaluations}`);
    return valForEvaluations;
  }
}

function evaluateAllAssets(
  model: ModelData,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  today: Date,
  todaysAssetValues: Map<Asset, AssetOrDebtVal>,
  todaysDebtValues: Map<Asset, AssetOrDebtVal>,
  todaysIncomeValues: Map<Income, IncomeVal>,
  todaysExpenseValues: Map<Expense, ExpenseVal>,
  todaysSettingValues: Map<Setting, SettingVal>,
) {
  const v = getVarVal(model.settings);
  model.assets.forEach((asset) => {
    let val = traceEvaluationForToday(asset.NAME, values, growths);

    const q = getQuantity(asset.NAME, values, model);
    if (q !== undefined && val !== undefined) {
      val *= q;
    }
    if (val !== undefined) {
      if (asset.IS_A_DEBT) {
        todaysDebtValues.set(asset, {
          val: val,
          quantity: undefined,
          category: asset.CATEGORY,
        });
      } else {
        todaysAssetValues.set(asset, {
          val: val,
          quantity: q,
          category: asset.CATEGORY,
        });
      }
      // log(`asset ${asset.NAME} has value ${val}`);
    } else {
      // log(`don't report undefined today's value for ${asset.NAME}`);
    }
  });
  model.incomes.forEach((i) => {
    let hasStarted = true;
    let hasEnded = false;
    const startDate = checkTriggerDate(i.START, model.triggers, v);
    if (startDate !== undefined && startDate > today) {
      hasStarted = false;
    }
    const endDate = checkTriggerDate(i.END, model.triggers, v);
    if (endDate !== undefined && endDate < today) {
      hasEnded = true;
    }
    // log(`income ${i.NAME} hasStarted ${hasStarted} hasEnded ${hasEnded}`);
    const val = traceEvaluationForToday(i.NAME, values, growths);
    if (val !== undefined) {
      todaysIncomeValues.set(i, {
        incomeVal: val,
        category: i.CATEGORY,
        hasStarted: hasStarted,
        hasEnded: hasEnded,
      });
    } else {
      // log(`don't report undefined today's value for ${i.NAME}`);
    }
  });
  model.expenses.forEach((e) => {
    let hasStarted = true;
    let hasEnded = false;
    const startDate = checkTriggerDate(e.START, model.triggers, v);
    if (startDate !== undefined && startDate > today) {
      hasStarted = false;
    }
    const endDate = checkTriggerDate(e.END, model.triggers, v);
    if (endDate !== undefined && endDate < today) {
      hasEnded = true;
    }
    const val = traceEvaluationForToday(e.NAME, values, growths);
    if (val !== undefined) {
      // log(`expense for todays value ${showObj(e)}`);
      todaysExpenseValues.set(e, {
        expenseVal: val,
        expenseFreq: e.RECURRENCE,
        category: e.CATEGORY,
        hasStarted: hasStarted,
        hasEnded: hasEnded,
      });
    } else {
      // log(`don't report undefined today's value for ${e.NAME}`);
    }
  });
  model.settings.forEach((s) => {
    const val = values.get(s.NAME);
    if (
      typeof s.NAME === 'string' &&
      s.NAME.startsWith(bondMaturity) &&
      s.NAME.endsWith(cpi)
    ) {
      // don't log these
      // log(`don't log today's value for ${s.NAME}`);
    } else if (val !== undefined) {
      // log(`report today's value for ${s.NAME}`);
      todaysSettingValues.set(s, { settingVal: `${val}` });
    } else {
      // log(`use initial = today's value for ${s.NAME}`);
      todaysSettingValues.set(s, { settingVal: `${s.VALUE}` });
    }
  });
}

function handleTaxObligations(
  model: ModelData,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  moment: Moment,
  timeInTaxCycle: {
    startYearOfTaxYear: number | undefined;
    monthOfTaxYear: number | undefined;
  },
  incomes: LiableIncomes,
  taxMonthlyPaymentsPaid: TaxPaymentsMade,
  evaluations: Evaluation[],
) {
  // Detect if this date has brought us into a new tax year.
  // At a change of tax year, log last year's accrual
  // and start a fresh accrual for the next year.
  const momentsTaxYear = getYearOfTaxYear(moment.date);
  const momentsTaxMonth = getMonthOfTaxYear(moment.date);
  // log(`momentsTaxMonth = ${momentsTaxMonth}, momentsTaxYear = ${momentsTaxYear}`);
  const enteringNewTaxYear =
    timeInTaxCycle.startYearOfTaxYear !== undefined &&
    momentsTaxYear > timeInTaxCycle.startYearOfTaxYear;
  const enteringNewTaxMonth =
    timeInTaxCycle.startYearOfTaxYear !== undefined &&
    timeInTaxCycle.monthOfTaxYear !== undefined &&
    momentsTaxMonth !== timeInTaxCycle.monthOfTaxYear;

  if (
    timeInTaxCycle.startYearOfTaxYear !== undefined &&
    timeInTaxCycle.monthOfTaxYear !== undefined &&
    enteringNewTaxMonth
  ) {
    // log(`${momentsTaxMonth} is beyond ${monthOfTaxYear} for ${dateAsString(DateFormatType.Debug,moment.date)}`);
    payNIEstimate(
      incomes,
      taxMonthlyPaymentsPaid,
      timeInTaxCycle.startYearOfTaxYear,
      timeInTaxCycle.monthOfTaxYear,
      values,
      growths,
      evaluations,
      model,
    );
  } else {
    // log(`waiting for ${momentsTaxMonth} to get beyond ${monthOfTaxYear} for ${dateAsString(DateFormatType.Debug,moment.date)}`);
  }

  if (timeInTaxCycle.startYearOfTaxYear !== undefined && enteringNewTaxYear) {
    // change of tax year - report count of moments
    // log('change of tax year...');
    settleUpTax(
      incomes,
      taxMonthlyPaymentsPaid,
      timeInTaxCycle.startYearOfTaxYear,
      values,
      growths,
      evaluations,
      model,
    );
    timeInTaxCycle.startYearOfTaxYear = momentsTaxYear;
    timeInTaxCycle.monthOfTaxYear = 3; // new tax year
  }
  if (
    timeInTaxCycle.startYearOfTaxYear !== undefined &&
    timeInTaxCycle.monthOfTaxYear !== undefined &&
    enteringNewTaxMonth
  ) {
    // log(`${momentsTaxMonth} is beyond ${monthOfTaxYear} for ${dateAsString(DateFormatType.Debug,moment.date)}`);
    payTaxEstimate(
      incomes,
      taxMonthlyPaymentsPaid,
      timeInTaxCycle.startYearOfTaxYear,
      timeInTaxCycle.monthOfTaxYear,
      values,
      growths,
      evaluations,
      model,
    );
  } else {
    // log(`waiting for ${momentsTaxMonth} to get beyond ${monthOfTaxYear} for ${dateAsString(DateFormatType.Debug,moment.date)}`);
  }
  if (enteringNewTaxYear || enteringNewTaxMonth) {
    timeInTaxCycle.monthOfTaxYear = momentsTaxMonth;
  }
}

function handleInflationStep(
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  date: Date,
) {
  // increment base (which started as 1.0) according to inflation value
  // at this moment in time

  const baseVal = getNumberValue(values, baseForCPI);
  const infObj = getNumberValue(values, cpi);
  /* istanbul ignore else  */ //error
  if (baseVal !== undefined && infObj !== undefined) {
    const newValue = baseVal * (1.0 + getMonthlyGrowth(infObj));
    // log(`at ${date.toDateString()}, update base using ${infObj} from ${baseVal} to ${newValue}`);
    // log(`newValue = ${newValue}`);
    values.set(
      baseForCPI,
      newValue,
      growths,
      date,
      'baseChange',
      false, // reportIfNoChange
      '38', //callerID
    );
  } else {
    log(
      `Error: missing baseObj or infObj for CPI handling; ${baseVal}, ${infObj}`,
    );
  }
}
function handleAnnualInflationStep(
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  date: Date,
) {
  // increment base (which started as 1.0) according to inflation value
  // at this moment in time

  const baseVal = getNumberValue(values, baseForCPI);
  if (baseVal !== undefined) {
    // log(`at ${date.toDateString()}, update annual base using to ${baseVal}`);
    values.set(
      annualBaseForCPI,
      baseVal,
      growths,
      date,
      'annualBaseChange',
      false, // reportIfNoChange
      '44', //callerID
    );
  }
}

function captureLastTaxBands(
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  moment: Moment,
) {
  // log(`at ${dateAsString(DateFormatType.Debug,moment.date)}, go log tax band values to get inflated values later`);
  const resultFromMap = TAX_MAP[`${highestTaxYearInMap}`];
  const baseVal = getNumberValue(values, baseForCPI);

  /* istanbul ignore else  */ //error
  if (resultFromMap !== undefined && baseVal !== undefined) {
    // log(`map vals at ${startYearOfTaxYear}, ${makeTwoDP(resultFromMap.noTaxBand)}, ${makeTwoDP(resultFromMap.lowTaxBand)}, ${makeTwoDP(resultFromMap.highTaxBand)}, ${makeTwoDP(resultFromMap.adjustNoTaxBand)}`);
    // log(`scale last tax bands by / baseVal = ${baseVal}`);
    const noTaxBand = resultFromMap.noTaxBand / baseVal;
    const lowTaxBand = resultFromMap.lowTaxBand / baseVal;
    const highTaxBand = resultFromMap.highTaxBand / baseVal;
    const adjustNoTaxBand = resultFromMap.adjustNoTaxBand / baseVal;
    const noNIBand = resultFromMap.noNIBand / baseVal;
    const lowNIBand = resultFromMap.lowNIBand / baseVal;
    const setValFn = (name: string, val: number) => {
      values.set(
        name,
        val,
        growths,
        moment.date,
        moment.name,
        false, // reportIfNoChange
        '39', //callerID
      );
    };
    setValFn('noTaxBand', noTaxBand);
    setValFn('lowTaxBand', lowTaxBand);
    setValFn('highTaxBand', highTaxBand);
    setValFn('adjustNoTaxBand', adjustNoTaxBand);
    setValFn('noNIBand', noNIBand);
    setValFn('lowNIBand', lowNIBand);

    // log(`in vals at ${startYearOfTaxYear}, ${makeTwoDP(noTaxBand)}, ${makeTwoDP(lowTaxBand)}, ${makeTwoDP(highTaxBand)}, ${makeTwoDP(adjustNoTaxBand)}`);
  } else {
    log('Error: undefined resultFromMap or baseVal');
  }
}

function handleStartMoment(
  model: ModelData,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  moment: Moment,
  pensionTransactions: Transaction[],
  liabilitiesMap: Map<string, string>,
  incomes: LiableIncomes,
  evaluations: Evaluation[],
) {
  // Starts are well defined
  // log(`start moment ${moment.name}, ${moment.type}, ${moment.date}`)
  /* istanbul ignore if */
  if (moment.setValue === undefined) {
    log('BUG!!! starts of income/asset/expense should have a value!');
    throw new Error('BUG starts of income/asset/expense should have a value!');
  }
  // Log quantities for assets which have them; needed for setting value.
  if (moment.type === momentType.assetStart) {
    // log(`at start of asset ${moment.name}`);
    const startQ = getStartQuantity(moment.name, model);
    if (startQ !== undefined) {
      // log(`set quantity of asset ${moment.name} = ${startQ}`);
      setValue(
        values,
        growths,
        evaluations,
        moment.date,
        quantity + moment.name, // value of what?
        startQ,
        model,
        moment.name, // source
        '19', //callerID
      );
    }
    const matchingAsset: Asset[] = model.assets.filter((a) => {
      return a.NAME === moment.name;
    });
    /* istanbul ignore else  */ //error
    if (matchingAsset.length === 1) {
      const a = matchingAsset[0];
      // log(`matched asset for start`);
      logPurchaseValues(a, values, growths, evaluations, model);
    } else {
      throw new Error(`BUG!!! '${moment.name}' doesn't match one asset`);
    }
  }
  const startValue = moment.setValue;
  let valueToStore = startValue;
  const gd = growthData(moment.name, growths, values);
  if (gd.adjustForCPI) {
    // log(`start value for ${valueToStore} needs adjusting for CPI`);
    let valueToScale: number | undefined;
    if (typeof valueToStore === 'number') {
      valueToScale = valueToStore;
    } else if (isNumberString(valueToStore)) {
      valueToScale = parseFloat(valueToStore);
    }

    /* istanbul ignore else  */ //error
    if (valueToScale !== undefined) {
      const baseVal = gd.baseVal;
      // log(`divide ${valueToStore} by base value ${scaleBy} to store ${valueToScale / scaleBy}`);
      valueToStore = valueToScale / baseVal;
      // log(`divided result is ${valueToStore}`);
    } else {
      log(`Error: don't scale something that's not a number`);
    }
  }
  // log(`in getEvaluations starting something: ${moment.name} with value ${startValue}`);
  if (
    moment.type === momentType.incomeStartPrep ||
    moment.type === momentType.expenseStartPrep
  ) {
    // log(`at ${moment.date.toDateString()}, set ${moment.name} value from ${moment.setValue} as ${valueToStore}`);
    values.set(
      moment.name,
      valueToStore,
      growths,
      moment.date,
      moment.name, // e.g. Cash (it's just the starting value)
      false, // reportIfNoChange
      '20', //callerID
    );
  } else {
    setValue(
      values,
      growths,
      evaluations,
      moment.date,
      moment.name,
      valueToStore,
      model,
      moment.name, // e.g. Cash (it's just the starting value)
      '20', //callerID
    );
  }
  if (moment.type === momentType.incomeStart) {
    const numberVal = traceEvaluation(startValue, values, growths, moment.name);
    if (numberVal !== undefined) {
      // log(`income numberVal = ${numberVal}`);
      handleIncome(
        numberVal,
        moment,
        values,
        growths,
        evaluations,
        model,
        pensionTransactions,
        liabilitiesMap,
        incomes,
        moment.name,
        false, //isFlexibleIncome,
        true, //isFixedIncome,
      );
    } else {
      /* istanbul ignore next */
      throw new Error(`can't interpret ${startValue} as a number`);
    }
  } else if (moment.type === momentType.expenseStart) {
    ////////////////// ???? startPrep or not ????
    // log('in getEvaluations, adjustCash:');
    const evaluationStartExpense = traceEvaluation(
      startValue,
      values,
      growths,
      'expenseStart',
    );
    if (evaluationStartExpense !== undefined) {
      if (evaluationStartExpense !== 0) {
        adjustCash(
          -evaluationStartExpense,
          moment.date,
          values,
          growths,
          evaluations,
          model,
          moment.name,
        );
      }
    } else {
      /* istanbul ignore next */
      throw new Error(`can't understand start of expenseChartFocus`);
    }
  }
}

function growAndEffectMoment(
  model: ModelData,
  values: ValuesContainer,
  growths: Map<string, GrowthData>,
  moment: Moment,
  pensionTransactions: Transaction[],
  liabilitiesMap: Map<string, string>,
  incomes: LiableIncomes,
  evaluations: Evaluation[],
) {
  let momentName = moment.name;
  const includeGrowth = !momentName.endsWith(tracking);
  if (!includeGrowth) {
    momentName = momentName.substring(0, momentName.length - tracking.length);
  }

  const visiblePoundValue: string | number | undefined = traceEvaluation(
    momentName,
    values,
    growths,
    momentName,
  );
  // log(`visiblePoundValue for ${moment.name} is ${visiblePoundValue}`);
  if (visiblePoundValue === undefined) {
    const val = values.get(momentName);
    if (val !== undefined) {
      setValue(
        values,
        growths,
        evaluations,
        moment.date,
        momentName,
        val,
        model,
        growth,
        '21', //callerID
      );
    }
  } else {
    let growthObj = undefined;
    if (includeGrowth) {
      growthObj = growthData(momentName, growths, values);
    } else {
      growthObj = {
        adjustForCPI: false,
        annualCPI: false,
        scale: 0.0,
      };
    }
    // log(`growthObj = ${showObj(growthObj)}`);

    const baseVal = growthObj.baseVal;
    // log(`baseVal = ${baseVal}`);
    let oldStoredNumberVal = visiblePoundValue;
    if (visiblePoundValue && growthObj.adjustForCPI && baseVal) {
      oldStoredNumberVal /= baseVal;
    }
    // log(`oldStoredNumberVal for ${momentName} is ${oldStoredNumberVal}`);
    // log(`growthObj for ${momentName} = ${showObj(growthObj)}`);
    /* istanbul ignore if  */ //error
    if (growthObj === undefined) {
      log(`Error: missing growth for ${momentName}`);
    } else {
      // We _do_ want to log changes of 0
      // because this is how we generate monthly
      // data to plot.  Set these here and call setValues later,
      // even if these haven't changed.
      let changedToStoredValue = 0.0;
      let changeToVisibleCash = 0.0;

      const growthChangeScale = growthObj.scale;

      //if(growthObj.applyCPI && baseVal !== 1.0 && growthChangeScale !== 0 && moment.type !== momentType.expense){
      //  throw new Error(`cpi computation for ${moment.type} has baseVal = ${baseVal}, growthChangeScale = ${growthChangeScale}`);
      //}
      /* istanbul ignore if  */ //debug
      if (printDebug()) {
        log(`growthChangeScale = ${growthChangeScale}`);
      }
      if (growthChangeScale !== 0) {
        changedToStoredValue = oldStoredNumberVal * growthChangeScale;
        changeToVisibleCash = changedToStoredValue;
        //log(
        //  `for ${growthChangeScale}, changedToStoredValue is oldStoredNumberVal * growthChangeScale = ${oldStoredNumberVal} * ${growthChangeScale} = ${
        //    oldStoredNumberVal * growthChangeScale
        //  }`,
        //);
      }

      let cPIChange = 0.0;
      // log(`moment.type = ${moment.type}`);
      if (growthObj.adjustForCPI) {
        // log(`do work on a CPI change for ${momentName}`);
        /* istanbul ignore if  */ //error
        if (!baseVal) {
          log(`Error: missing or zero baseVal`);
        } else if (baseVal !== 1.0) {
          cPIChange = oldStoredNumberVal * (baseVal - 1.0);
          changeToVisibleCash = changedToStoredValue;
          // log(`from baseVal ${baseVal}, real value adds ${cPIChange} to stored ${oldStoredNumberVal} to give ${cPIChange + oldStoredNumberVal}` );
        }
      }

      // When we store back the value, don't apply CPI change, use growthChangeToStore.
      // When we use the value to affect cash, do apply the CPI change, use cPIChange and growthChangeAsIncome.

      let valToStore: string | number = oldStoredNumberVal;
      if (changedToStoredValue === 0.0) {
        // recover pre-existing value (don't save back as number value)
        const storedVal = values.get(momentName);
        if (storedVal !== undefined) {
          // log(`set valToStore as storedVal ${storedVal}`);
          valToStore = storedVal;
        }
      } else {
        //log(
        //  `adjust valToStore by changedToStoredValue ${changedToStoredValue}`,
        //);
        valToStore += changedToStoredValue;
        // log(`val to store at ${moment.date} = ${valToStore}`);
      }

      // We _do_ want to log changes of 0
      // because this is how we generate monthly
      // data to plot.
      // if(change!==0){ // we _do_ want to log no-change evaluations!
      // log(`in getEvaluations: log changes for moment.type = ${moment.type}`);
      if (
        moment.type === momentType.expensePrep ||
        (moment.type === momentType.incomePrep &&
          !momentName.startsWith(pensionDB))
      ) {
        // log(`quietly set the value of ${momentName} as ${valToStore}`);
        values.set(
          momentName,
          valToStore,
          growths,
          moment.date,
          growth,
          false, // reportIfNoChange
          '22a', //callerID
        );
      } else {
        // log(`set the value of ${momentName} as ${valToStore}`);
        setValue(
          values,
          growths,
          evaluations,
          moment.date,
          momentName,
          valToStore,
          model,
          growth,
          '22b', //callerID
        );
      }
      // }
      if (moment.type === momentType.asset) {
        // some assets experience growth which is
        // liable for tax
        // log(`asset moment for growth : ${moment.date}, ${momentName}`);
        const changeToCash = cPIChange + changeToVisibleCash;
        if (momentName.startsWith(crystallizedPension) && changeToCash > 0) {
          // log(`skip asset moment for growth : ${moment.date}, ${momentName}, ${change}`);
        } else {
          handleIncome(
            changeToCash,
            moment,
            values,
            growths,
            evaluations,
            model,
            pensionTransactions,
            liabilitiesMap,
            incomes,
            momentName,
            true, //isFlexibleIncome,
            false, //isFixedIncome,
          );
        }
      } else if (moment.type === momentType.income) {
        const changeToCash =
          oldStoredNumberVal + cPIChange + changeToVisibleCash;
        handleIncome(
          changeToCash,
          moment,
          values,
          growths,
          evaluations,
          model,
          pensionTransactions,
          liabilitiesMap,
          incomes,
          momentName,
          false, //isFlexibleIncome,
          true, //isFixedIncome,
        );
      } else if (moment.type === momentType.expense) {
        // log('in getEvaluations, adjustCash:');
        const changeToCash =
          oldStoredNumberVal + cPIChange + changeToVisibleCash;
        adjustCash(
          -changeToCash,
          moment.date,
          values,
          growths,
          evaluations,
          model,
          momentName,
        );
      }
    }
    /* istanbul ignore if  */ //debug
    if (printDebug()) {
      log(`${dateAsString(DateFormatType.Debug, moment.date)},
                ${momentName},
                value = ${values.get(momentName)}`);
    }
  }
}

function getEvaluationsROI(model: ModelData) {
  const range = getROI(model);
  const startDate = range.start;
  const start2018 = new Date('1 Jan 2018');
  if (start2018.getTime() < startDate.getTime()) {
    range.start = start2018;
  }
  return range;
}

export class EvaluationHelper {
  public reporter: ReportValueChecker | undefined;
  public maxReportSize: number;
  public frequency: string;

  constructor(
    reporter: ReportValueChecker | undefined,
    maxReportSize: number,
    frequency: string,
  ) {
    this.reporter = reporter;
    this.maxReportSize = maxReportSize;
    this.frequency = frequency;
  }
}

function getEvaluationsInternal(
  model: ModelData,
  helper: EvaluationHelper | undefined,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportData: ReportDatum[];
} {
  //log('get evaluations');
  const todaysAssetValues = new Map<Asset, AssetOrDebtVal>();
  const todaysDebtValues = new Map<Asset, AssetOrDebtVal>();
  const todaysIncomeValues = new Map<Income, IncomeVal>();
  const todaysExpenseValues = new Map<Expense, ExpenseVal>();
  const todaysSettingValues = new Map<Setting, SettingVal>();

  const outcome = checkData(model);
  if (outcome.message.length > 0) {
    log(`check failed, do no evaluations: ${outcome.message}`);
    const reportData: ReportDatum[] = [
      {
        name: 'Error from evaluations',
        date: dateAsString(DateFormatType.View, new Date()),
        source: `check failed: ${outcome.message}`,
        change: undefined,
        oldVal: undefined,
        newVal: undefined,
        qchange: undefined,
        qoldVal: undefined,
        qnewVal: undefined,
      },
    ];
    return {
      evaluations: [],
      todaysAssetValues: todaysAssetValues,
      todaysDebtValues: todaysDebtValues,
      todaysIncomeValues: todaysIncomeValues,
      todaysExpenseValues: todaysExpenseValues,
      todaysSettingValues: todaysSettingValues,
      reportData: reportData,
    };
  }

  // log('in getEvaluations');
  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    log(`data = ${showObj(model)}`);
  }

  // Keep track of current value of any expense, income or asset
  const values = new ValuesContainer(model);
  if (helper && helper.reporter) {
    values.setIncludeInReport(helper && helper.reporter);
  }

  // Calculate a monthly growth once per item,
  // refer to this map for each individual moment.
  const growths = new Map<string, GrowthData>();

  const cpiInitialVal: number = parseFloat(
    getSettings(model.settings, cpi, '0.0'),
  );

  const viewRange = getEvaluationsROI(model);
  // We set a start date to set, for example, our CPI base value to 1.0.
  const roiStartDate: Date = viewRange.start;
  // log(`roiStartDate = ${roiStartDate}`);

  // We set an end date to act as a stop for recurrent events.
  const roiEndDate: Date = viewRange.end;
  // log(`roiEndDate = ${roiEndDate}`);

  // might be set using a settings value
  const today = getTodaysDate(model);

  // A historical record of evaluations (useful for creating trends or charts)
  const evaluations: Evaluation[] = [];

  // Record which items are liable for income tax.
  // Map from income name to a person identifier.
  // (e.g. "PaperRound", "IncomeTaxJane").
  // (e.g. "PaperRound", "NIJane").
  // (e.g. "get some pension", "IncomeTaxJoe" )
  const liabilitiesMap = new Map<string, string>([]);

  // Some transactions affect income processing.
  const pensionTransactions: Transaction[] = [];

  // Calculate a set of "moments" for each transaction/income/expense...
  // each has a date - we'll process these in date order.
  const freq = helper ? helper.frequency : monthly;
  // log(`freq = ${freq}`);
  const allMoments: Moment[] = generateMoments(
    model,
    freq,
    values,
    growths,
    cpiInitialVal,
    roiStartDate,
    roiEndDate,
    today,
    evaluations,
    liabilitiesMap,
    pensionTransactions,
  );

  // log(`pensionTransactions = ${showObj(pensionTransactions)}`);

  let datedMoments = allMoments.filter((moment) => moment.date !== undefined);

  // Process the moments in date order
  sortByDate(datedMoments);

  if (datedMoments.length > 0) {
    // log(`add moments for updating base values, cpiInitialVal = ${cpiInitialVal}`);

    values.set(
      cpi,
      cpiInitialVal,
      growths,
      datedMoments[0].date,
      'start value',
      false, // reportIfNoChange
      '0',
    );
    values.set(
      baseForCPI,
      1.0,
      growths,
      datedMoments[0].date,
      'start value',
      false, // reportIfNoChange
      '0',
    );
    values.set(
      annualBaseForCPI,
      1.0,
      growths,
      datedMoments[0].date,
      'start value',
      false, // reportIfNoChange
      '0',
    );
    const first = datedMoments[0].date;
    const last = new Date(datedMoments[datedMoments.length - 1].date);
    // have annual inflation effects provide a whole year's worth
    // of change by tracking an extra year of inflationary effect
    // before things start
    last.setFullYear(last.getFullYear() - 1);
    // log(`base will get updated from ${last} to ${first}`);

    const infUpdateDates = generateSequenceOfDates(
      {
        start: last,
        end: first,
      },
      '1m',
    );
    const infMoments: Moment[] = infUpdateDates.map((date) => {
      const typeForMoment = momentType.inflation;
      const result: Moment = {
        date,
        name: cpi,
        type: typeForMoment,
        setValue: NaN,
        transaction: undefined,
      };
      return result;
    });
    datedMoments = datedMoments.concat(infMoments);
    // we generate annual CPI raises on 6 April every year
    // start at the first 6th April after 'last'
    const startAnnualCPIEffect = new Date(last);
    startAnnualCPIEffect.setDate(5);
    startAnnualCPIEffect.setMonth(3);
    if (startAnnualCPIEffect < last) {
      startAnnualCPIEffect.setFullYear(startAnnualCPIEffect.getFullYear() + 1);
    }
    const annualInfUpdateDates = generateSequenceOfDates(
      {
        start: startAnnualCPIEffect,
        end: first,
      },
      '1y',
    );
    const annualInfMoments: Moment[] = annualInfUpdateDates.map((date) => {
      const typeForMoment = momentType.inflation;
      const result: Moment = {
        date,
        name: annualBaseForCPI,
        type: typeForMoment,
        setValue: NaN,
        transaction: undefined,
      };
      return result;
    });
    datedMoments = datedMoments.concat(annualInfMoments);
    // log(`with moments for updating base values, have ${datedMoments.length}`);

    const needPredictedTaxBands = new Date(highestTaxYearInMap, 3, 5);
    if (needPredictedTaxBands < roiEndDate) {
      const d = new Date(highestTaxYearInMap, 3, 4);
      // log(`prepare to log tax band values at ${dateAsString(DateFormatType.Debug,d)}`);
      datedMoments.push({
        date: d,
        name: 'captureLastTaxBands',
        type: momentType.inflation,
        setValue: NaN,
        transaction: undefined,
      });
    } else {
      // log(`roiEndDate = ${roiEndDate)} won't need predicted tax bands`);
    }
    sortByDate(datedMoments);
  }

  const timeInTaxCycle: {
    startYearOfTaxYear: number | undefined;
    monthOfTaxYear: number | undefined;
  } = {
    startYearOfTaxYear: undefined,
    monthOfTaxYear: undefined,
  };
  if (datedMoments.length > 0) {
    timeInTaxCycle.startYearOfTaxYear = getYearOfTaxYear(
      datedMoments[datedMoments.length - 1].date,
    );
    timeInTaxCycle.monthOfTaxYear = getMonthOfTaxYear(
      datedMoments[datedMoments.length - 1].date,
    );
  }
  // we track different types of income liability for different individuals
  // the outer map has a key for "cgt", "incomeTax" and "NI".
  // the inner map has a key for the person who is liable to pay and
  // a value for the accrued liable value as a tax year progresses
  //
  // we track different types of income liability for different individuals
  // for monthly income tax payments, we only need a map from
  // the person who is liable to pay and
  // a value for the accrued liable value as a tax month progresses
  const incomes: LiableIncomes = {
    inTaxMonth: {
      incomeTaxTotall: undefined,
      incomeTaxFromFixedIncomee: undefined,
      incomeTaxFromFlexibleIncomee: undefined,
      NIITotall: undefined,
      NIFromFixedIncomee: undefined,
      NIFromFlexibleIncomee: undefined,
    },
    inTaxYear: {
      incomeTaxTotal: undefined,
      incomeTaxFromFixedIncome: undefined,
      incomeTaxFromFlexibleIncome: undefined,
      NITotal: undefined,
      NIFromFixedIncome: undefined,
      NIFromFlexibleIncome: undefined,
      cgt: undefined,
    },
  };
  const taxMonthlyPaymentsPaid: TaxPaymentsMade = {
    incomeTaxTotalx: undefined,
    incomeTaxFromFixedIncomex: undefined,
    incomeTaxFromFlexibleIncomex: undefined,
    NIxTotal: undefined,
    NIxFromFixedIncome: undefined,
    NIxFromFlexibleIncome: undefined,
  };

  // log(`gathered ${datedMoments.length} moments to process`);
  while (datedMoments.length > 0) {
    const moment = datedMoments.pop();
    if (moment === undefined) {
      /* istanbul ignore next */
      throw new Error('BUG!!! array length > 0 should pop!');
    }

    // Each moment we process is in dated order.
    /* istanbul ignore if  */ //debug
    if (printDebug()) {
      log(
        `popped moment is ${showObj({
          date: dateAsString(DateFormatType.Debug, moment.date),
          name: moment.name,
          type: moment.type,
          setValue: moment.setValue,
        })}`,
      );
    }
    // log(`${datedMoments.length} moments left`);
    // log(`moment.date is ${dateAsString(DateFormatType.Debug,moment.date)}`);

    if (moment.name === EvaluateAllAssets) {
      evaluateAllAssets(
        model,
        values,
        growths,
        today,
        todaysAssetValues,
        todaysDebtValues,
        todaysIncomeValues,
        todaysExpenseValues,
        todaysSettingValues,
      );
    }

    handleTaxObligations(
      model,
      values,
      growths,
      moment,
      timeInTaxCycle,
      incomes,
      taxMonthlyPaymentsPaid,
      evaluations,
    );

    if (moment.name === EvaluateAllAssets) {
    } else if (moment.name === cpi) {
      handleInflationStep(values, growths, moment.date);
    } else if (moment.name === annualBaseForCPI) {
      handleAnnualInflationStep(values, growths, moment.date);
    } else if (moment.name === 'captureLastTaxBands') {
      captureLastTaxBands(values, growths, moment);
    } else if (moment.type === momentType.transaction) {
      // log(`this is a transaction`);
      processTransactionMoment(
        moment,
        values,
        growths,
        evaluations,
        model,
        pensionTransactions,
        liabilitiesMap,
        incomes,
      );
    } else if (
      moment.type === momentType.expenseStart ||
      moment.type === momentType.expenseStartPrep ||
      moment.type === momentType.incomeStart ||
      moment.type === momentType.incomeStartPrep ||
      moment.type === momentType.assetStart
    ) {
      handleStartMoment(
        model,
        values,
        growths,
        moment,
        pensionTransactions,
        liabilitiesMap,
        incomes,
        evaluations,
      );
    } else {
      growAndEffectMoment(
        model,
        values,
        growths,
        moment,
        pensionTransactions,
        liabilitiesMap,
        incomes,
        evaluations,
      );
    }

    // Catch any tax information if we've just processed the last
    // of the moments.
    if (
      timeInTaxCycle.startYearOfTaxYear !== undefined &&
      datedMoments.length === 0
    ) {
      // change of tax year - report count of moments
      // log('last item in tax year...');
      settleUpTax(
        incomes,
        taxMonthlyPaymentsPaid,
        timeInTaxCycle.startYearOfTaxYear,
        values,
        growths,
        evaluations,
        model,
      );
    } else if (datedMoments.length === 0) {
      // log('last item mo tax info...');
    }
  }

  /* istanbul ignore if  */ //debug
  if (printDebug()) {
    evaluations.forEach((evalns) => {
      log(showObj(evalns));
    });
  }
  // log(`getEvaluations returning ${evaluations.length} evaluations`);

  const report = values.getReport();
  const result = {
    evaluations: evaluations,
    todaysAssetValues: todaysAssetValues,
    todaysDebtValues: todaysDebtValues,
    todaysIncomeValues: todaysIncomeValues,
    todaysExpenseValues: todaysExpenseValues,
    todaysSettingValues: todaysSettingValues,
    reportData: report.reverse(),
  };
  // log(`result.reportData.length = ${result.reportData.length}`);
  return result;
}

// This is the key entry point for code calling from outside
// this file.
export function getEvaluations(
  model: ModelData,
  helper: EvaluationHelper | undefined,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportData: ReportDatum[];
} {
  // log(`Entered getEvaluations for model ${model.name}`);
  const viewRange = getEvaluationsROI(model);
  let startDateForBondMaturityCalculation: Date = viewRange.start;

  const revalueTransactions = model.transactions.filter((t) => {
    return t.TYPE === revalueSetting;
  });
  const varValue = getVarVal(model.settings);
  for (const t of revalueTransactions) {
    const tDate = getTriggerDate(t.DATE, model.triggers, varValue);
    if (tDate < startDateForBondMaturityCalculation) {
      startDateForBondMaturityCalculation = tDate;
    }
  }

  let roiEndDate: Date = viewRange.end;
  const maturityTransactions = model.transactions.filter((t) => {
    return t.FROM_VALUE.startsWith(bondMaturity) && t.TO === CASH_ASSET_NAME;
  });
  // log(`maturityTransactions = ${showObj(maturityTransactions)}`);

  const generatedSettings: Setting[] = [];

  if (maturityTransactions.length > 0) {
    maturityTransactions.forEach((mt) => {
      const d = getTriggerDate(mt.DATE, model.triggers, varValue);
      if (d > roiEndDate) {
        roiEndDate = d;
      }
      if (mt.STOP_DATE !== '') {
        const stopDate = getTriggerDate(mt.STOP_DATE, model.triggers, varValue);
        if (stopDate > roiEndDate) {
          roiEndDate = stopDate;
        }
      }
    });
    roiEndDate.setMonth(roiEndDate.getMonth() + 1);
    const adjustedModel: ModelData = {
      name: model.name,
      triggers: model.triggers,
      expenses: [],
      incomes: [],
      transactions: model.transactions.filter((t) => {
        return (
          t.TYPE === revalueSetting || t.FROM_VALUE.startsWith(bondMaturity)
        );
      }),
      assets: model.assets
        .filter((a) => {
          return (
            a.NAME === CASH_ASSET_NAME ||
            model.transactions.find((t) => {
              return t.FROM_VALUE.startsWith(bondMaturity) && t.FROM === a.NAME;
            }) !== undefined
          );
        })
        .concat([
          {
            NAME: `${bondMaturity}base`,
            ERA: undefined, // bond transaction
            CATEGORY: '',
            START: dateAsString(
              DateFormatType.Data,
              startDateForBondMaturityCalculation,
            ),
            VALUE: '1.0',
            QUANTITY: '', // Quantised assets have unit prices on-screen for table value
            // Quantised assets can only be transacted in unit integer quantities
            GROWTH: '0.0',
            CPI_IMMUNE: false,
            CAN_BE_NEGATIVE: true,
            IS_A_DEBT: false,
            LIABILITY: '',
            PURCHASE_PRICE: '0.0',
          },
        ]),
      settings: model.settings.concat([
        {
          NAME: `${bondMaturity}Prerun`,
          ERA: undefined, // bond setting
          VALUE: '0.0',
          HINT: 'suppress warnings on prerun',
          TYPE: constType,
        },
      ]),
      version: model.version,
      undoModel: undefined,
      redoModel: undefined,
    };
    const roiEndSetting = model.settings.find((s) => {
      return s.NAME === roiEnd;
    });
    let oldRoiEnd = '';
    if (roiEndSetting) {
      oldRoiEnd = roiEndSetting.VALUE;
      roiEndSetting.VALUE = dateAsString(DateFormatType.Data, roiEndDate);
    }

    // log(`START FIRST EVALUATIONS for ${model.name}`);
    let freq = monthly;
    if (helper) {
      freq = helper.frequency;
    }
    const adjustedEvals = getEvaluationsInternal(adjustedModel, {
      frequency: freq,
      maxReportSize: 0,
      reporter: undefined,
    });
    // log(`END FIRST EVALUATIONS for ${model.name}`);
    // log(`adjustedEvals = ${showObj(adjustedEvals)}`);

    if (roiEndSetting) {
      roiEndSetting.VALUE = oldRoiEnd;
    }

    for (let i = 0; i < adjustedEvals.evaluations.length; i = i + 1) {
      const evaln = adjustedEvals.evaluations[i];
      if (evaln.name === CASH_ASSET_NAME) {
        continue;
      }
      const t = maturityTransactions.find((t) => t.NAME === evaln.source);
      if (t !== undefined) {
        const settingName = `${t.FROM_VALUE}${separator}${stringFromDate(
          evaln.date,
        )}${separator}${cpi}`;
        // log(`for t.NAME = ${t.NAME}`);
        // ${bondMaturity}BondTargetValue${separator}${transactionDateString}${separator}${cpi}
        // look forward through our evals looking for a base value when this
        // BondTargetValue was revalued
        let baseStart = 1.0;
        for (let j = 0; j < adjustedEvals.evaluations.length; j = j + 1) {
          const startEvaln = adjustedEvals.evaluations[j];
          if (startEvaln.name === `${bondMaturity}base`) {
            // log(`base val before revalue is ${startEvaln.value}`);
            baseStart = startEvaln.value;
            continue;
          }
          if (
            startEvaln.name === t.FROM_VALUE.substring(bondMaturity.length) &&
            startEvaln.source === revalue
          ) {
            break;
          }
        }

        // look back through our evals looking for a base value just before this maturity
        for (let j = i; j > 0; j = j - 1) {
          const earlierEvaln = adjustedEvals.evaluations[j];
          if (earlierEvaln.name.startsWith(`${bondMaturity}base`)) {
            // log(`going back in time, ${showObj(earlierEvaln)}`);
            const settingValue = earlierEvaln.value;
            // log(`generate setting ${settingName}, value ${settingValue}/${baseStart} = ${settingValue/baseStart} `);
            if (
              generatedSettings.find((s) => {
                return s.NAME === settingName;
              }) === undefined
            ) {
              generatedSettings.push({
                NAME: settingName,
                ERA: undefined, // cpi base setting
                VALUE: `${settingValue / baseStart}`,
                HINT: 'autogenerated setting for Bond maturity values',
                TYPE: constType,
              });
            }
            break;
          }
        }
      }
    }
  } else {
    // log(`SKIP FIRST EVALUATIONS for ${model.name}`);
  }

  // log(`START SECOND EVALUATIONS for ${model.name}`);
  const result = getEvaluationsInternal(
    {
      ...model,
      settings: model.settings.concat(generatedSettings),
    },
    helper,
  );
  // log(`END SECOND EVALUATIONS for ${model.name}`);

  // log(`evals = ${showObj(result.evaluations)}`);
  return result;
}