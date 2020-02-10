import { DbSetting, DbTrigger, DbModelData } from './types/interfaces';
import {
  cgt,
  incomeTax,
  nationalInsurance,
  separator,
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  assetChartView,
  assetChartVal,
  assetChartHint,
  viewFrequency,
  monthly,
  viewFrequencyHint,
  viewDetail,
  fine,
  viewDetailHint,
  roiStart,
  roiStartHint,
  roiEnd,
  roiEndHint,
  assetChartFocus,
  assetChartFocusHint,
  debtChartFocus,
  allItems,
  debtChartFocusHint,
  expenseChartFocus,
  expenseChartFocusHint,
  incomeChartFocus,
  incomeChartFocusHint,
  birthDate,
  birthDateHint,
  debtChartView,
  debtChartVal,
  debtChartHint,
  revalue,
  custom,
} from './localization/stringConstants';

import moment from 'moment';

export const minimalModel: DbModelData = {
  assets: [
    {
      NAME: CASH_ASSET_NAME,
      CATEGORY: '',
      START: '1 Jan 1990',
      VALUE: '0.0',
      QUANTITY: '',
      GROWTH: '0.0',
      CPI_IMMUNE: false,
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: false,
      LIABILITY: '',
      PURCHASE_PRICE: '0.0',
    },
  ],
  incomes: [],
  expenses: [],
  triggers: [],
  settings: [
    {
      NAME: cpi,
      VALUE: '2.5',
      HINT: cpiHint,
    },
    {
      NAME: assetChartView,
      VALUE: assetChartVal,
      HINT: assetChartHint,
    },
    {
      NAME: debtChartView,
      VALUE: debtChartVal,
      HINT: debtChartHint,
    },
    {
      NAME: viewFrequency,
      VALUE: monthly,
      HINT: viewFrequencyHint,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
    },
    {
      NAME: roiStart,
      VALUE: '1 Jan 2017',
      HINT: roiStartHint,
    },
    {
      NAME: roiEnd,
      VALUE: '1 Jan 2020',
      HINT: roiEndHint,
    },
    {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
      HINT: assetChartFocusHint,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
      HINT: debtChartFocusHint,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
      HINT: expenseChartFocusHint,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
      HINT: incomeChartFocusHint,
    },
    {
      NAME: birthDate,
      VALUE: '',
      HINT: birthDateHint,
    },
  ],
  transactions: [],
};

export function makeDateFromString(input: string) {
  // special-case parsing for DD/MM/YYYY
  let dateMomentObject = moment(input, 'DD/MM/YYYY'); // 1st argument - string, 2nd argument - format
  let dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }
  dateMomentObject = moment(input, 'DD/MM/YY'); // 1st argument - string, 2nd argument - format
  dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }

  const result = new Date(input);
  // log(`converted ${input} into ${result.toDateString()}`);
  return result;
}

export function printDebug(): boolean {
  return false;
}

export function showObj(obj: any) {
  return JSON.stringify(obj, null, 4);
}

export function endOfTime() {
  return makeDateFromString('2100');
}

let doLog = true;
export function log(obj: any) {
  if (doLog) {
    /* eslint-disable no-console */ // all console calls routed through here
    // tslint:disable-next-line:no-console
    console.log(obj);
    /* eslint-enable no-console */
  }
}
export function suppressLogs() {
  doLog = false;
}
export function unSuppressLogs() {
  doLog = true;
}

export function makeIncomeLiabilityFromNameAndNI(name: string, NI: boolean) {
  if (name === '') {
    return '';
  }
  if (name.includes(separator)) {
    console.log(`Error: name ${name} can't contain ${separator}`);
    return '';
  }
  if (NI) {
    return incomeTax + name + separator + nationalInsurance + name;
  } else {
    return incomeTax + name;
  }
}

export function makeBooleanFromString(s: string) {
  const result = s === 'T' || s === 't' || s === 'True' || s === 'true';
  // log(`convert ${s} to boolean and get ${result}`);
  return result;
}

export function makeStringFromBoolean(b: boolean) {
  if (b) {
    return 'T';
  }
  return 'F';
}

export function makeBooleanFromYesNo(input: string) {
  const result = {
    value: true,
    checksOK: true,
  };
  const lcInput = input.toLowerCase();
  if (lcInput === 'y' || lcInput === 'yes') {
    result.value = true;
  } else if (lcInput === 'n' || lcInput === 'no') {
    result.value = false;
  } else {
    result.checksOK = false;
  }
  return result;
}

export function makeYesNoFromBoolean(b: boolean) {
  if (b) {
    return 'Yes';
  }
  return 'No';
}

function isNumber(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  const num = parseFloat(input);
  if (num === undefined || Number.isNaN(num)) {
    result.checksOK = false;
    return result;
  }

  result.value = num;
  return result;
}

function isSetting(input: string, settings: DbSetting[]) {
  const result = {
    value: '',
    numFound: 1,
  };
  const x = settings.filter(pr => pr.NAME === input);
  if (x.length === 1) {
    // log(`got setting ${showObj(result)}`);
    result.value = x[0].VALUE;
  } else {
    result.numFound = x.length;
    if (result.numFound > 1) {
      log(`multiple settings: ${showObj(x)}`);
    }
  }
  return result;
}

export function makeGrowthFromString(input: string, settings: DbSetting[]) {
  // log(`make growth value from string ${input}`);
  const result = {
    value: '',
    checksOK: true,
  };
  if (input === '') {
    result.checksOK = false;
    return result;
  }
  const parseSetting = isSetting(input, settings);
  if (parseSetting.numFound === 1) {
    result.value = input;
    return result;
  }
  const x = input.replace('%', '');
  const num = isNumber(x);
  if (!num.checksOK) {
    result.checksOK = false;
    return result;
  }
  result.value = `${num.value}`;
  return result;
}

export function makeStringFromGrowth(input: string, settings: DbSetting[]) {
  // log(`format growth as string; input is ${input}`);
  const parseGrowth = isSetting(input, settings);
  if (parseGrowth.numFound === 1) {
    return input;
  }
  const parseNum = isNumber(input);
  if (parseNum.checksOK) {
    return `${parseFloat(input)}%`;
  }
  return input;
}

export function makeCashValueFromString(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  let x = input.replace('£', '');
  x = x.replace(',', '');
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
    value: '',
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

export function makeValueAbsPropFromString(input: string) {
  const result = {
    absolute: true,
    value: input,
    checksOK: true,
  };
  if (input === '') {
    result.value = '0.0';
    return result;
  }
  const lastPartForUnits = input.substring(input.length - 6, input.length);
  // log(`lastPartForUnits = ${lastPartForUnits}`);
  if (lastPartForUnits === ' units') {
    const numberPart = input.substring(0, input.length - 6);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.value = numberPart;
    } else {
      result.checksOK = false;
    }
  } else if (input[input.length - 1] === '%') {
    const numberPart = input.substring(0, input.length - 1);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.absolute = false;
      result.value = `${num / 100.0}`;
    } else {
      result.checksOK = false;
    }
  } else {
    const noCommas = input.replace(',', '');
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

export function getStartQuantity(w: string, model: DbModelData) {
  // log(`try to get a quantity for ${w}`);
  const a = model.assets.filter(a => {
    return a.NAME === w;
  })[0];
  if (a === undefined) {
    // log(`no matched asset found`);
    return undefined;
  }
  if (a.QUANTITY === '') {
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
  model: DbModelData,
  tname: string,
) {
  let result = '';
  if (
    !tname.startsWith(revalue) &&
    getStartQuantity(assetName, model) !== undefined
  ) {
    // value should be an integer
    result = value + ' units'; // TODO const string 'units'
  } else if (!absolute) {
    const pcVal = parseFloat(value) * 100;
    let strVal = `${pcVal}`;
    //log(`${strVal.substring(0, strVal.length - 1)}`);
    if (
      strVal.substring(0, strVal.length - 1).endsWith('0000000') ||
      strVal.substring(0, strVal.length - 1).endsWith('9999999')
    ) {
      strVal = makeTwoDP(pcVal);
      if (strVal.endsWith('.00')) {
        strVal = strVal.substring(0, strVal.length - 3);
      } else if (strVal.endsWith('0')) {
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
export function makeStringFromCashValue(input: string) {
  // formatting from 34567.23 as £34,567.23
  // log(`formatting ${input} as a cash value`);
  if (input === '') {
    return '';
  }
  let n = parseFloat(input);
  const negative = n < 0;
  if (negative) {
    n *= -1;
  }
  let s = n.toFixed(2);
  if (s.length > 6) {
    s =
      s.substring(0, s.length - 6) + ',' + s.substring(s.length - 6, s.length);
  }
  if (s.length > 10) {
    s =
      s.substring(0, s.length - 10) +
      ',' +
      s.substring(s.length - 10, s.length);
  }
  if (negative) {
    return `-£${s}`;
  } else {
    return `£${s}`;
  }
}
export function makeStringFromFromToValue(input: string) {
  if (input === '') {
    return '';
  }
  if (input.substring(input.length - 6, input.length) === ' units') {
    // TODO
    return input;
  } else if (input[input.length - 1] === '%') {
    return input;
  } else {
    return makeStringFromCashValue(input);
  }
}

export function getMonthlyGrowth(annualPercentage: number) {
  // log(`annual_percentage = ${annualPercentage}`);
  const annualProportion = annualPercentage / 100.0;
  const annualScale = annualProportion + 1.0;
  const logAnnualScale = Math.log(annualScale);
  const monthlyGrowth = Math.exp(logAnnualScale / 12.0) - 1.0;
  // log(`calculated monthly growth = ${monthlyGrowth}`);
  return monthlyGrowth;
}

// returns a date for a trigger, or undefined
function findMatchedTriggerDate(triggerName: string, triggers: DbTrigger[]) {
  // log('look for '+triggerName+'in '+triggers.map(showObj))
  const matched = triggers.filter(trigger => trigger.NAME === triggerName);
  // log('matched = '+showObj(matched));
  let result = undefined;
  if (matched.length !== 0) {
    result = new Date(matched[0].DATE); // copy
  }
  return result;
}

// returns a date for a trigger or for a date string, or undefined for junk
export function checkTriggerDate(input: string, triggers: DbTrigger[]) {
  // log('first look for '+input+'in '+triggers.map(showObj))
  const matched = findMatchedTriggerDate(input, triggers);
  // log('matched = '+showObj(matched));
  let result;
  if (matched !== undefined) {
    result = matched; // copy
  } else {
    const dateTry = makeDateFromString(input);
    if (dateTry.getTime()) {
      result = dateTry;
    } else {
      // log(`BUG : unrecognised date!!! ${input}`);
      result = undefined;
    }
  }
  // log(`date for ${triggerName} is ${result.toDateString()}`);
  return result;
}

// Suppresses any not-understood values and returns new Date()
export function getTriggerDate(triggerName: string, triggers: DbTrigger[]) {
  const checkResult = checkTriggerDate(triggerName, triggers);
  if (checkResult !== undefined) {
    return checkResult;
  }
  return new Date();
}
export function makeStringFromPurchasePrice(input: string, liability: string) {
  if (!liability.includes(cgt)) {
    return ''; // don't display irrelevant purchae price
  } else {
    return input;
  }
}
export function makePurchasePriceFromString(input: string) {
  if (input === '') {
    return '0';
  } else {
    return input;
  }
}
// returns a string for the value of a setting growth
export function makeGrowthTooltip(input: string, settings: DbSetting[]) {
  if (input === '') {
    return '';
  }
  const value = isSetting(input, settings);
  //log(`from ${input}, got settings value ${value}`);
  if (value.numFound !== 1) {
    return '';
  }
  if (isNumber(value.value)) {
    return `${value.value}%`;
  }
  return '';
}
// returns a date string for a trigger, or '' for date or junk
export function makeDateTooltip(input: string, triggers: DbTrigger[]) {
  // log(`triggers.length = ${triggers.length}`);
  let result = '';
  if (input !== '') {
    const date = checkTriggerDate(input, triggers);
    if (date !== undefined) {
      result = date.toDateString();
    }
  }
  // log(`make date tooltip for ${input}: ${result}`);
  return result;
}

export function getSettings(
  settings: DbSetting[],
  key: string,
  fallbackVal: string,
) {
  const searchResult = isSetting(key, settings);
  if (searchResult.numFound === 1) {
    return searchResult.value;
  }
  if (searchResult.numFound === 0) {
    log(`BUG!!! '${key}' value not found in settings list`);
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    return fallbackVal;
  }
  if (searchResult.numFound > 1) {
    log(`BUG!!! multiple '${key}' values found in settings list`);
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    throw new Error(); // serious!! shows failure in browser!!
    //return fallbackVal;
  }
  return fallbackVal;
}

export function setSetting(
  settings: DbSetting[],
  key: string,
  val: string,
  hint = '',
) {
  const idx = settings.findIndex(x => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      VALUE: val,
      HINT: hint,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      VALUE: val,
      HINT: hint,
    });
  }
}

function makeModelFromJSONFixDates(input: string) {
  const result: DbModelData = JSON.parse(input);
  for (const t of result.triggers) {
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
    t.DATE = new Date(t.DATE);
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
  }
  for (const a of result.assets) {
    if (a.IS_A_DEBT === undefined) {
      a.IS_A_DEBT = false;
    }
  }
  for (const t of result.transactions) {
    if (t.TYPE === undefined) {
      t.TYPE = custom;
    }
  }
  return result;
}

// note JSON stringify and back for serialisation is OK but
// breaks dates (and functions too but we don't have these)
function cleanUp(modelFromJSON: any): DbModelData {
  return {
    ...modelFromJSON,
    expenses: modelFromJSON.expenses.map((e: any) => {
      if (e.RECURRENCE === undefined) {
        return {
          ...e,
          RECURRENCE: '1m',
        };
      } else {
        return e;
      }
    }),
    assets: modelFromJSON.assets.map((a: any) => {
      if (a.QUANTITY === undefined) {
        return {
          ...a,
          QUANTITY: '',
        };
      } else {
        return a;
      }
    }),
    triggers: modelFromJSON.triggers.map((t: any) => {
      return {
        ...t,
        DATE: new Date(t['DATE']), // This is required!
      };
    }),
  };
}

export function makeCleanedModelFromJSON(input: string) {
  const model = makeModelFromJSONFixDates(input);
  return cleanUp(model);
}

export function getMinimalModelCopy(): DbModelData {
  return makeCleanedModelFromJSON(JSON.stringify(minimalModel));
}

export function addRequiredEntries(model: DbModelData) {
  const minimalModel = getMinimalModelCopy();
  minimalModel.settings.forEach(x => {
    if (
      model.settings.filter(existing => {
        return existing.NAME === x.NAME;
      }).length === 0
    ) {
      log(`inserting missing data ${showObj(x)}`);
      model.settings.push(x);
    }
  });
  minimalModel.assets.forEach(x => {
    if (
      model.assets.filter(existing => {
        return existing.NAME === x.NAME;
      }).length === 0
    ) {
      log(`inserting missing data ${showObj(x)}`);
      model.assets.push(x);
    }
  });
}

export function makeModelFromJSON(input: string) {
  const model = makeModelFromJSONFixDates(input);
  addRequiredEntries(model);
  return cleanUp(model);
}

export function isADebt(name: string, model: DbModelData) {
  const matchingAsset = model.assets.find(a => {
    return a.NAME === name;
  });
  if (matchingAsset === undefined) {
    return false;
  }
  return matchingAsset.IS_A_DEBT;
}
export function isAnIncome(name: string, model: DbModelData) {
  return model.incomes.filter(a => a.NAME === name).length > 0;
}
export function isAnExpense(name: string, model: DbModelData) {
  return model.expenses.filter(a => a.NAME === name).length > 0;
}
export function isAnAsset(name: string, model: DbModelData) {
  return model.assets.filter(a => a.NAME === name).length > 0;
}
export function isAnAssetOrAssets(name: string, model: DbModelData) {
  const words = name.split(separator);
  let ok = true;
  words.forEach(word => {
    if (!isAnAsset(word, model)) {
      ok = false;
    }
  });
  return ok;
}
