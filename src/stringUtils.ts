import moment from 'moment';
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
  pension,
  moveTaxFreePart,
  crystallizedPension,
  transferCrystallizedPension,
  pensionAllowance,
} from './localization/stringConstants';
import { isSetting } from './models/modelUtils';
import { Setting, ModelData, Trigger } from './types/interfaces';
import { log, showObj } from './utils';

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
  let dateMomentObject = moment(input, 'DD/MM/YYYY');
  let dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }
  dateMomentObject = moment(input, 'DD/MM/YY');
  dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }

  const result = new Date(input);
  return result;
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
    log(`Error: name ${name} can't contain ${separator}`);
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
export function makePensionAllowanceTag(person: string) {
  return person + ' ' + pensionAllowance;
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
  isPensionAllowance: boolean;
  isNationalInsurance: boolean;
  isNet: boolean;
  isCGT: boolean;
  person: string;
} {
  const result = {
    isIncome: false,
    isGain: false,
    isIncomeTax: false,
    isPensionAllowance: false,
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
  } else if (s.includes(pensionAllowance)) {
    result.isPensionAllowance = true;
    s = s.substring(0, s.length - pensionAllowance.length - 1);
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

export function makeGrowthFromString(input: string, settings: Setting[]) {
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

export function makeStringFromGrowth(input: string, settings: Setting[]) {
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

export function getStartQuantity(w: string, model: ModelData) {
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
  model: ModelData,
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
export function makeStringFromCashValue(
  input: string,
  currency: string,
) {
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
    return `-${currency}${s}`;
  } else {
    return `${currency}${s}`;
  }
}
export function makeStringFromFromToValue(
  input: string,
) {
  if (input === '') {
    return '';
  }
  if (input.substring(input.length - 6, input.length) === ' units') {
    // TODO
    return input;
  } else if (input[input.length - 1] === '%') {
    return input;
  } else {
    return makeStringFromCashValue(input, '£');
  }
}

function parseTriggerForOperator(
  triggerName: string, 
  opSymbol: string, 
  triggers: Trigger[],
  recursionLevel: number,
){
  let numChange = 0;
  if(opSymbol === '-'){
    numChange = -1;
  } else if(opSymbol === '+'){
    numChange = 1;
  } else {
    return undefined;
  }

  const parts = triggerName.split(opSymbol);
  if(parts.length === 2){
    const secondPartNW = getNumberAndWordParts(parts[1]);
    if(secondPartNW.numberPart !== undefined &&
      (secondPartNW.wordPart === 'd' ||
      secondPartNW.wordPart === 'm' ||
      secondPartNW.wordPart === 'y')) {

      const firstPartDate: Date | undefined = findMatchedTriggerDate(
        parts[0], 
        triggers,
        recursionLevel + 1,
      );
      if(firstPartDate !== undefined){
        if(secondPartNW.wordPart === 'd'){
          firstPartDate.setDate(firstPartDate.getDate() + numChange * secondPartNW.numberPart);
        } else if(secondPartNW.wordPart === 'm'){
          firstPartDate.setMonth(firstPartDate.getMonth() + numChange *  secondPartNW.numberPart);
        } else if(secondPartNW.wordPart === 'y'){
          firstPartDate.setFullYear(firstPartDate.getFullYear() + numChange *  secondPartNW.numberPart);
        }
        // log(`converted ${triggerName} into ${firstPartDate.toDateString()}`);
        return firstPartDate;
      }
    }
  }
}

// returns a date for a trigger, or undefined
function findMatchedTriggerDate(
  triggerName: string, 
  triggers: Trigger[],
  recursionLevel: number,
) : Date | undefined {
  if(recursionLevel > 100){
    //log(`infinite or too-complex recursion for dates - emergency stop`);
    return undefined;
  }
  const minusOp = parseTriggerForOperator(triggerName, '-', triggers, recursionLevel);
  if(minusOp !== undefined){
    return minusOp;
  }
  const plusOp = parseTriggerForOperator(triggerName, '+', triggers, recursionLevel);
  if(plusOp !== undefined){
    return plusOp;
  }
  // log('look for '+triggerName+'in '+triggers.map(showObj))
  const matched = triggers.filter(trigger => trigger.NAME === triggerName);
  // log('matched = '+showObj(matched));
  let result = undefined;
  if (matched.length !== 0) {
    result = checkTriggerDateRecursive(
      matched[0].DATE, 
      triggers,
      recursionLevel + 1,
    );
    // log(`converted ${triggerName} into ${result.toDateString()}`);
  }
  return result;
}

// returns a date for a trigger or for a date string, or undefined for junk
export function checkTriggerDate(
  input: string, triggers: Trigger[]
) {
  return checkTriggerDateRecursive(input, triggers, 0);
}

function checkTriggerDateRecursive(
  input: string, 
  triggers: Trigger[],
  recursionLevel: number,
) {
  // log('first look for '+input+'in '+showObj(triggers));
  const matched = findMatchedTriggerDate(
    input, 
    triggers,
    recursionLevel,
  );
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
export function getTriggerDate(triggerName: string, triggers: Trigger[]) {
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
} as const;

// returns a date string for a trigger, or '' for date or junk
export function makeDateTooltip(input: string, triggers: Trigger[]) {
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

function usesWholeWord(existing: string, checkWord: string) {
  if (existing === checkWord) {
    return true;
  }
  return false;
}
function usesNumberValueWord(existing: string, checkWord: string) {
  const parsed = getNumberAndWordParts(existing);
  if (parsed.wordPart && parsed.wordPart === checkWord) {
    return true;
  }
  return false;
}
function usesSeparatedString(existing: string, checkWord: string) {
  const parts = existing.split(separator);
  let numMatches = 0;
  parts.forEach(obj => {
    if (obj === checkWord) {
      numMatches += 1;
    }
  });
  return numMatches > 0;
}

export function getSpecialWord(name: string): string {
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
  if (name.startsWith(pension)) {
    return pension;
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
  return '';
}

export function checkForWordClashInModel(
  model: ModelData,
  replacement: string,
  messageWord: string,
): string {
  const settingMessages = model.settings
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Setting '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Setting '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const triggerMessages = model.triggers
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Trigger '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const assetMessages = model.assets
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Asset '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Asset '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Asset '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.QUANTITY, replacement)) {
        return `Asset '${obj.NAME}' has quantity ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Asset '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return `Asset '${obj.NAME}' has liability ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.PURCHASE_PRICE, replacement)) {
        return `Asset '${obj.NAME}' has purchase price ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const incomeMessages = model.incomes
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Income '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Income '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.END, replacement)) {
        return `Income '${obj.NAME}' has end ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Income '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return `Income '${obj.NAME}' has value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Income '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return `Income '${obj.NAME}' has liability ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const expenseMessages = model.expenses
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Expense '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Expense '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.END, replacement)) {
        return `Expense '${obj.NAME}' has end ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Expense '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return `Expense '${obj.NAME}' has value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Expense '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const transactionMessages = model.transactions
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Transaction '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.FROM, replacement)) {
        return `Transaction '${obj.NAME}' has from ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.FROM_VALUE, replacement)) {
        return `Transaction '${obj.NAME}' has from value ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.TO, replacement)) {
        return `Transaction '${obj.NAME}' has to ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.TO_VALUE, replacement)) {
        return `Transaction '${obj.NAME}' has to value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.DATE, replacement)) {
        return `Transaction '${obj.NAME}' has date ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.STOP_DATE, replacement)) {
        return `Transaction '${obj.NAME}' has stop date ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  let message = `${settingMessages} ${triggerMessages} ${assetMessages} ${incomeMessages} ${expenseMessages} ${transactionMessages}`;
  if (message.length <= 7) {
    message = '';
  }
  return message;
}

export function replaceNumberValueString(
  value: string,
  old: string,
  replacement: string,
) {
  const parsed = getNumberAndWordParts(value);
  if (parsed.wordPart === '') {
    return value;
  } else if (parsed.wordPart === old) {
    return value.substring(0, value.length - old.length) + replacement;
  } else {
    return value;
  }
}

export function replaceSeparatedString(
  value: string,
  old: string,
  replacement: string,
) {
  const parts = value.split(separator);
  let result = '';
  parts.forEach(obj => {
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
