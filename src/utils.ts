import {
  DbSetting,
  DbTrigger,
  DbModelData,
  DbAsset,
  DbExpense,
  DbIncome,
  DbTransaction,
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
  taxChartFocusPerson,
  taxChartFocusPersonHint,
  taxChartFocusType,
  taxChartFocusTypeHint,
  taxChartShowNet,
  taxChartShowNetHint,
  annually,
} from './localization/stringConstants';

import moment from 'moment';
import { getTestModel } from './models/exampleModels';

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

export function getCurrentVersion() {
  // return 0; // may not include assets or settings in minimalModel
  // return 1; // may not include expense recurrence, asset/debt,
  //           // asset quantity, transaction and settings types
  // return 2; // could use taxPot as an asset
  // return 3; // doesn't include tax view focus settings
  return 4;
}

function makeModelFromJSONString(input: string): DbModelData {
  const matches = input.match(/PensionDBC/g);
  if (matches !== null && matches.length > 0) {
    log(`Old string 'PensionDBC' in loaded data!!`);
  }

  let result = JSON.parse(input);
  // log(`parsed JSON and found ${showObj(result)}`);
  if (result.testName !== undefined) {
    // log("this isn't JSON but refers to test data we can look up");
    result = getTestModel(result.testName);
  }

  // log(`loaded model, version =${result.version}`);

  if (result.version === undefined) {
    // log(`missing version, setting as 0`);
    result.version = 0;
  }

  // log(`result from makeModelFromJSON = ${showObj(result)}`);
  return result;
}

// note JSON stringify and back for serialisation is OK but
// breaks dates (and functions too but we don't have these)
function cleanUpDates(modelFromJSON: DbModelData): DbModelData {
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
  const model: DbModelData = makeModelFromJSONString(input);
  return cleanUpDates(model);
}

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
    // tax chart focus added during migration of versions
    {
      NAME: taxChartFocusPerson,
      VALUE: allItems,
      HINT: taxChartFocusPersonHint,
      TYPE: viewType,
    },
    {
      NAME: taxChartFocusType,
      VALUE: allItems,
      HINT: taxChartFocusTypeHint,
      TYPE: viewType,
    },
    {
      NAME: taxChartShowNet,
      VALUE: 'Y',
      HINT: taxChartShowNetHint,
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
  version: getCurrentVersion(),
  undoModel: undefined,
};

export function getMinimalModelCopy(): DbModelData {
  // log('in getMinimalModelCopy');
  return makeCleanedModelFromJSON(JSON.stringify(minimalModel));
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

const showMigrationLogs = false;

function migrateOldVersions(model: DbModelData) {
  if (showMigrationLogs) {
    log(`in migrateOldVersions, model has ${model.settings.length} settings`);
    // log(`in migrateOldVersions, model has ${model.settings.map(showObj)}`);
  }
  if (model.version === 0) {
    // log(`in migrateOldVersions at v0, model has ${model.settings.length} settings`);
    // use getMinimalModelCopy and scan over all settings and assets
    const minimalModel = getMinimalModelCopy();
    minimalModel.settings.forEach(x => {
      if (
        model.settings.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        // log(`model needs insertion of missing data ${showObj(x)}`);
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
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v1, model has ${model.settings.length} settings`,
      );
    }
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
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v2, model has ${model.assets.length} assets`,
      );
      log(
        `${model.assets.map(x => {
          return x.NAME;
        })}`,
      );
    }
    // remove any asset called taxPot
    let index = model.assets.findIndex(a => {
      return a.NAME === taxPot;
    });
    if (index >= 0) {
      // log(`found taxPot at index = ${index}!`);
      model.assets.splice(index, 1);
      // log(
      //  `${model.assets.map(x => {
      //    return x.NAME;
      //  })}`,
      // );
      // log(
      //  `in migrateOldVersions at v2, model now has ${model.assets.length} assets`,
      // );
    }
    index = model.assets.findIndex(a => {
      return a.NAME === taxPot;
    });
    if (index >= 0) {
      log(`still found taxPot!`);
      model.assets.splice(index, 1);
    }
    model.version = 3;
  }
  if (model.version === 3) {
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v3, model has ${model.settings.length} settings`,
      );
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartFocusPerson;
      }) === -1
    ) {
      model.settings.push({
        NAME: taxChartFocusPerson,
        VALUE: allItems,
        HINT: taxChartFocusPersonHint,
        TYPE: viewType,
      });
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartFocusType;
      }) === -1
    ) {
      model.settings.push({
        NAME: taxChartFocusType,
        VALUE: allItems,
        HINT: taxChartFocusTypeHint,
        TYPE: viewType,
      });
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartShowNet;
      }) === -1
    ) {
      model.settings.push({
        NAME: taxChartShowNet,
        VALUE: 'Y',
        HINT: taxChartShowNetHint,
        TYPE: viewType,
      });
    }
    model.version = 4;
  }

  // should throw immediately to alert of problems
  if (model.version !== getCurrentVersion()) {
    throw new Error('code not properly handling versions');
  }
}

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
export function deconstructTaxTag(
  tag: string,
): {
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
    person: '',
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
  return result;
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

export const simpleSetting: DbSetting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};

export const viewSetting: DbSetting = {
  ...simpleSetting,
  TYPE: viewType,
};

export const browserTestSettings: DbSetting[] = [
  {
    ...viewSetting,
    NAME: roiStart,
    VALUE: '1 Jan 2019',
    HINT: roiStartHint,
  },
  {
    ...viewSetting,
    NAME: roiEnd,
    VALUE: '1 Feb 2019',
    HINT: roiEndHint,
  },
  {
    ...viewSetting,
    NAME: assetChartView,
    VALUE: assetChartVal, // could be 'deltas'
    HINT: assetChartHint,
  },
  {
    ...viewSetting,
    NAME: viewFrequency,
    VALUE: annually, // could be 'Monthly'
    HINT: viewFrequencyHint,
  },
  {
    ...viewSetting,
    NAME: viewDetail,
    VALUE: fine, // could be coarse
    HINT: viewDetailHint,
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: '2.5',
    HINT: cpiHint,
  },
  {
    ...simpleSetting,
    NAME: 'stockMarketGrowth',
    VALUE: '6.236',
    HINT: 'Custom setting for stock market growth',
  },
  {
    ...viewSetting,
    NAME: assetChartFocus,
    VALUE: CASH_ASSET_NAME,
    HINT: assetChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
  {
    ...viewSetting,
    NAME: valueFocusDate,
    VALUE: '',
    HINT: valueFocusDateHint,
  },
];

export const simpleAsset: DbAsset = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  VALUE: '0',
  QUANTITY: '',
  GROWTH: '0',
  CPI_IMMUNE: false,
  CAN_BE_NEGATIVE: false,
  IS_A_DEBT: false,
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};
export const simpleExpense: DbExpense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0.0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0.0',
  RECURRENCE: '1m',
};
export const simpleIncome: DbIncome = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
  LIABILITY: '',
};
export const simpleTransaction: DbTransaction = {
  NAME: 'NoName',
  FROM: '',
  FROM_ABSOLUTE: true,
  FROM_VALUE: '0.0',
  TO: '',
  TO_ABSOLUTE: true,
  TO_VALUE: '0.0',
  DATE: '1 Jan 2017',
  STOP_DATE: '', // for regular transactions
  RECURRENCE: '',
  CATEGORY: '',
  TYPE: custom,
};

export const emptyModel: DbModelData = {
  triggers: [],
  incomes: [],
  expenses: [],
  transactions: [],
  assets: [],
  settings: [],
  version: 0,
  undoModel: undefined,
};
export const defaultSettings: DbSetting[] = [
  { ...viewSetting, NAME: viewFrequency, VALUE: monthly },
  { ...viewSetting, NAME: viewDetail, VALUE: fine },
  { ...viewSetting, NAME: assetChartView, VALUE: assetChartVal },
  { ...viewSetting, NAME: debtChartView, VALUE: debtChartVal },
  {
    ...viewSetting,
    NAME: assetChartFocus,
    VALUE: allItems,
    HINT: assetChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: debtChartFocus,
    VALUE: allItems,
    HINT: debtChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: taxChartFocusPerson,
    VALUE: allItems,
    HINT: taxChartFocusPersonHint,
    TYPE: viewType,
  },
  {
    NAME: taxChartFocusType,
    VALUE: allItems,
    HINT: taxChartFocusTypeHint,
    TYPE: viewType,
  },
  {
    NAME: taxChartShowNet,
    VALUE: 'Y',
    HINT: taxChartShowNetHint,
    TYPE: viewType,
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: '0.0',
    HINT: cpiHint,
  },
  {
    ...viewSetting,
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
  {
    ...viewSetting,
    NAME: valueFocusDate,
    VALUE: '',
    HINT: valueFocusDateHint,
  },
];

export function setROI(
  model: DbModelData,
  roi: { start: string; end: string },
) {
  setSetting(model.settings, roiStart, roi.start, viewType);
  setSetting(model.settings, roiEnd, roi.end, viewType);
}

export function makeModelFromJSON(
  input: string,
): DbModelData {
  // log('in makeModelFromJSON');
  const model: DbModelData = makeModelFromJSONString(input);
  migrateOldVersions(model);
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

export function getLiabilityPeople(model: DbModelData): string[] {
  const liabilityPeople: string[] = [];
  if (model.assets === undefined) {
    return [];
  }
  // console.log(`model for tax buttons is ${showObj(model)}`);
  model.assets.forEach(obj => {
    const words = obj.LIABILITY.split(separator);
    for (const word of words) {
      // console.log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(cgt)) {
        person = word.substring(0, word.length - cgt.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  model.incomes.forEach(obj => {
    const words = obj.LIABILITY.split(separator);
    // log(`words = ${words}`);
    for (const word of words) {
      // log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(nationalInsurance)) {
        person = word.substring(0, word.length - nationalInsurance.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  return liabilityPeople;
}

export function markForUndo(model: DbModelData){
  const modelClone = makeModelFromJSON(JSON.stringify(model));
  model.undoModel = modelClone;
}
export function convertToUndoModel(model: DbModelData): boolean{
  if(model.undoModel !== undefined){
    const tmpModel = model.undoModel;
    model.assets = [];
    model.expenses = [];
    model.incomes = [];
    model.settings = [];
    model.transactions = [];
    model.triggers = [];
    model.undoModel = undefined;
    model.version = 0;
    Object.assign(model, tmpModel);
    return true;
  }
  return false;
}
