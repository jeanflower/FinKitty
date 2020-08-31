import {
  DbSetting,
  DbTrigger,
  DbModelData,
  DbModelDataWithVersion,
} from './types/interfaces';
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
  constType,
  viewType,
  valueFocusDate,
  valueFocusDateHint,
  taxPot,
  income,
  net,
  gain,
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
      CPI_IMMUNE: true,
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
      TYPE: constType,
    },
    {
      NAME: assetChartView,
      VALUE: assetChartVal,
      HINT: assetChartHint,
      TYPE: viewType,
    },
    {
      NAME: debtChartView,
      VALUE: debtChartVal,
      HINT: debtChartHint,
      TYPE: viewType,
    },
    {
      NAME: viewFrequency,
      VALUE: monthly,
      HINT: viewFrequencyHint,
      TYPE: viewType,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
      TYPE: viewType,
    },
    {
      NAME: roiStart,
      VALUE: '1 Jan 2017',
      HINT: roiStartHint,
      TYPE: viewType,
    },
    {
      NAME: roiEnd,
      VALUE: '1 Jan 2020',
      HINT: roiEndHint,
      TYPE: viewType,
    },
    {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
      HINT: assetChartFocusHint,
      TYPE: viewType,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
      HINT: debtChartFocusHint,
      TYPE: viewType,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
      HINT: expenseChartFocusHint,
      TYPE: viewType,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
      HINT: incomeChartFocusHint,
      TYPE: viewType,
    },
    {
      NAME: birthDate,
      VALUE: '',
      HINT: birthDateHint,
      TYPE: viewType,
    },
    {
      NAME: valueFocusDate,
      VALUE: '',
      HINT: valueFocusDateHint,
      TYPE: viewType,
    },
  ],
  transactions: [],
};

export function lessThan(a: string, b: string) {
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

export function getNumberAndWordParts(
  input: string,
): { numberPart: number | undefined; wordPart: string } {
  // strip away any number part from the front of the
  // string
  const re = new RegExp('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)');
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

export function removeNumberPart(input: string) {
  const parts = getNumberAndWordParts(input);
  if (parts.numberPart === undefined) {
    return undefined;
  } else {
    return parts.wordPart;
  }
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
    return name + incomeTax + separator + name + nationalInsurance;
  } else {
    return name + incomeTax;
  }
}

export function makeIncomeTaxTag(person: string) {
  return person + ' ' + income + ' ' + incomeTax;
}
export function makeNationalInsuranceTag(person: string) {
  return person + ' ' + income + ' ' + nationalInsurance;
}
export function makeNetIncomeTag(person: string) {
  return person + ' ' + income + ' ' + net;
}
export function makeCGTTag(person: string) {
  return person + ' ' + gain + ' ' + cgt;
}
export function makeNetGainTag(person: string) {
  return person + ' ' + gain + ' ' + net;
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
  const wordAndNumber = getNumberAndWordParts(input);
  if (wordAndNumber.wordPart !== '') {
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
  const numWordSplit = getNumberAndWordParts(input);
  // log(`from ${input}, lastPartForUnits = ${lastPartForUnits}`);
  // log(`from ${input}, numWordSplit = ${showObj(numWordSplit)}`);
  if (lastPartForUnits === ' units') {
    const numberPart = input.substring(0, input.length - 6);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.value = numberPart;
    } else {
      result.checksOK = false;
    }
  } else if (
    numWordSplit.numberPart !== undefined &&
    numWordSplit.wordPart !== '%' &&
    numWordSplit.wordPart !== ''
  ) {
    result.value = input;
    result.checksOK = true;
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
  // log(`value = ${value}`);
  if (value.length === 0) {
    return '0.0';
  } else if (
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
  // log('first look for '+input+'in '+showObj(triggers));
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
      //log(`BUG : unrecognised date!!! ${input}, `
      // `${showObj(triggers.length)}`);
      result = undefined;
    }
  }
  // log(`date for ${triggerName} is ${result.toDateString()}`);
  return result;
}

// Suppresses any not-understood values and returns new Date()
export function getTriggerDate(triggerName: string, triggers: DbTrigger[]) {
  // log(`triggers length is ${triggers.length}`);
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

export const dateFormatOptions = {
  weekday: undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// returns a date string for a trigger, or '' for date or junk
export function makeDateTooltip(input: string, triggers: DbTrigger[]) {
  // log(`triggers.length = ${triggers.length}`);
  let result = '';
  if (input !== '') {
    const date = checkTriggerDate(input, triggers);
    if (date !== undefined) {
      result = date.toLocaleDateString(undefined, dateFormatOptions);
    }
  }
  // log(`make date tooltip for ${input}: ${result}`);
  return result;
}

export function getSettings(
  settings: DbSetting[],
  key: string,
  fallbackVal: string,
  expectValue = true,
) {
  const searchResult = isSetting(key, settings);
  if (searchResult.numFound === 1) {
    return searchResult.value;
  }
  if (searchResult.numFound === 0) {
    if (expectValue) {
      log(`BUG!!! '${key}' value not found in settings list`);
      // throw new Error(`BUG!!! '${key}' value not found in settings list`);
    }
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
  type: string,
  hint = '',
) {
  const idx = settings.findIndex(x => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  }
}

// might be today or might be set using a setting
export function getTodaysDate(model: DbModelData) {
  let today = new Date();
  if (model.settings.length === 0) {
    return today;
  }
  const todaysDate = getSettings(model.settings, valueFocusDate, '');
  if (todaysDate !== '') {
    today = new Date(todaysDate);
  }
  return today;
}

function makeModelFromJSONString(input: string): DbModelDataWithVersion {
  const matches = input.match(/PensionDBC/g);
  if (matches !== null && matches.length > 0) {
    log(`Old string 'PensionDBC' in loaded data!!`);
  }
  const result = JSON.parse(input);
  // log(`loaded model, version =${result.version}`);

  if (result.version === undefined) {
    // log(`missing version, setting as 0`);
    result.version = 0;
  }

  // log(`result from makeModelFromJSON = ${showObj(result)}`);
  return result;
}

const map = new Map([
  [roiEnd, viewType],
  [roiStart, viewType],
  [birthDate, viewType],
  [viewFrequency, viewType],
  [monthly, viewType],
  [viewDetail, viewType],
  [assetChartFocus, viewType],
  [debtChartFocus, viewType],
  [expenseChartFocus, viewType],
  [incomeChartFocus, viewType],
  [assetChartView, viewType],
  [debtChartView, viewType],
  [cpi, constType],
]);

function getGuessSettingType(name: string) {
  const mapResult = map.get(name);
  if (mapResult !== undefined) {
    return mapResult;
  }
  return constType;
}

// note JSON stringify and back for serialisation is OK but
// breaks dates (and functions too but we don't have these)
function cleanUpDates(modelFromJSON: DbModelDataWithVersion): DbModelData {
  const result = modelFromJSON;
  for (const t of result.triggers) {
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
    t.DATE = new Date(t.DATE);
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
  }
  // log(`cleaned up model assets ${showObj(result.assets)}`);
  return result;
}

export function makeCleanedModelFromJSON(input: string) {
  // log('in makeCleanedModelFromJSON');
  const model: DbModelDataWithVersion = makeModelFromJSONString(input);
  return cleanUpDates(model);
}

export function getMinimalModelCopy(): DbModelData {
  // log('in getMinimalModelCopy');
  return makeCleanedModelFromJSON(JSON.stringify(minimalModel));
}

export function getCurrentVersion() {
  // return 0; // may not include assets or settings in minimalModel
  // return 1; // may not include expense recurrence, asset/debt,
  //           // asset quantity, transaction and settings types
  // return 2; // don't use taxPot as an asset
  return 3;
}

function migrateOldVersions(modelName: string, model: DbModelDataWithVersion) {
  // log('in addRequiredEntries');
  if (model.version === 0) {
    // use getMinimalModelCopy and scan over all settings and assets
    const minimalModel = getMinimalModelCopy();
    minimalModel.settings.forEach(x => {
      if (
        model.settings.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        // log(`${modelName} needs insertion of missing data ${showObj(x)}`);
        model.settings.push(x);
        // throw new Error(`inserting missing data ${showObj(x)}`);
      }
    });
    minimalModel.assets.forEach(x => {
      if (
        model.assets.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        //log(`inserting missing data ${showObj(x)}`);
        model.assets.push(x);
        // throw new Error(`inserting missing data ${showObj(x)}`);
      }
    });
    model.version = 1;
  }
  if (model.version === 1) {
    for (const e of model.expenses) {
      if (e.RECURRENCE === undefined) {
        e.RECURRENCE = '1m';
      }
    }
    for (const a of model.assets) {
      if (a.IS_A_DEBT === undefined) {
        a.IS_A_DEBT = false;
      }
      if (a.QUANTITY === undefined) {
        a.QUANTITY = '';
      }
    }
    for (const t of model.transactions) {
      if (t.TYPE === undefined) {
        t.TYPE = custom;
      }
    }
    for (const s of model.settings) {
      if (s.TYPE === undefined) {
        s.TYPE = getGuessSettingType(s.NAME);
      }
    }
    model.version = 2;
  }
  if (model.version === 2) {
    // remove any asset called taxPot
    const index = model.assets.findIndex(a => {
      return a.NAME === taxPot;
    });
    if (index >= 0) {
      model.assets.splice(index, 1);
    }
    model.version = 3;
  }

  // should throw immediately to alert of problems
  if (model.version !== getCurrentVersion()) {
    throw new Error('code not properly handling versions');
  }
}

export function makeModelFromJSON(
  modelName: string,
  input: string,
): DbModelData {
  // log('in makeModelFromJSON');
  const model: DbModelDataWithVersion = makeModelFromJSONString(input);
  migrateOldVersions(modelName, model);
  return cleanUpDates(model);
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
function isAnAsset(name: string, model: DbModelData) {
  return (
    model.assets.filter(a => a.NAME === name || a.CATEGORY === name).length > 0
  );
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
export function isATransaction(name: string, model: DbModelData) {
  return model.transactions.filter(t => t.NAME === name).length > 0;
}

export function replaceCategoryWithAssetNames(
  words: string[],
  model: DbModelData,
) {
  // log(`start replaceCategoryWithAssetNames with words = ${showObj(words)}`);
  let wordsNew: string[] = [];
  words.forEach(w => {
    // log(`look at word "${w}" - is it a category?`);
    // if w is a category of one or more assets
    // then remove w from the list and
    // if the assets are not already on the list
    // then add the asset Names.
    const assetsWithCategory = model.assets.filter(a => {
      return a.CATEGORY === w;
    });
    if (assetsWithCategory.length === 0) {
      wordsNew.push(w);
    } else {
      wordsNew = wordsNew.concat(
        assetsWithCategory.map(a => {
          return a.NAME;
        }),
      );
    }
  });
  // log(`return from replaceCategoryWithAssetNames with wordsNew = ${showObj(wordsNew)}`);
  return wordsNew;
}
