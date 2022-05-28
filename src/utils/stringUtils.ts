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
  bondMaturity,
  bondInvest,
} from '../localization/stringConstants';
import { isSetting } from '../models/modelUtils';
import { Setting, ModelData, Trigger } from '../types/interfaces';
import { log, printDebug, showObj } from './utils';

showObj;

export function lessThan(a: string, b: string) {
  if (a.startsWith('-') && !b.startsWith('-')) {
    return 1;
  }
  if (!a.startsWith('-') && b.startsWith('-')) {
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

export function makeDateFromString(input: string) {
  // special-case parsing for DD/MM/YYYY
  let regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (input.match(regex) !== null) {
    const dateMomentObject = moment(input, 'DD/MM/YYYY');
    const dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
    if (!Number.isNaN(dateObject.getTime())) {
      // log(`converted ${input} into ${dateObject.toDateString()}`);
      return dateObject;
    }
  } else {
    // process '12 May 2021' format
    regex = /^\d{1,2} [a-zA-Z]* \d{2,4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'Sat 12 May 2021' format
    regex = /^[a-zA-Z]* \d{1,2} [a-zA-Z]* \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'Sat May 12 2021' format
    regex = /^[a-zA-Z]* [a-zA-Z]* \d{1,2} \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 12 2021' , 'May 12, 2021' format
    regex = /^[a-zA-Z]* \d{1,2},{0,1} \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 2021' format
    regex = /^[a-zA-Z]* \d{4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 1, 2018 00:00:00'
    regex = /^[a-zA-Z]* \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process '9 September 2021 8:00'
    regex = /^\d{1,2} [a-zA-Z]* \d{4} \d{1,2}:\d{2}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }

    // process '2021' format - dangerous but common for e.g. start / end of view
    regex = /^\d{4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
  }

  // console.log(`Invalid Date : ${input}`);
  return new Date('Invalid Date');
}

export function stringFromDate(d: Date): string {
  try {
    const dateString = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(d);
    // log(`dateString = ${dateString}`);
    return dateString.replaceAll(',', '');
  } catch (e) {
    // log(`error from date ${d} = ${e}`);
    /* istanbul ignore next */
    return '';
  }
}

export function getNumberAndWordParts(input: string): {
  numberPart: number | undefined;
  wordPart: string;
} {
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

// if there's no leading number part, this returns undefined
export function removeNumberPart(input: string) {
  const parts = getNumberAndWordParts(input);
  if (parts.numberPart === undefined) {
    return undefined;
  } else {
    return parts.wordPart;
  }
}

export function makeIncomeLiabilityFromNameAndNI(
  name: string,
  NI: boolean,
  printOnError = true,
) {
  if (name === '') {
    return '';
  }
  if (name.includes(separator)) {
    /* istanbul ignore if  */
    if (printOnError) {
      log(`Error: name ${name} can't contain ${separator}`);
    }
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
  const a = model.assets.filter((a) => {
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
export function makeStringFromCashValue(input: string, currency: string) {
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
    return makeStringFromCashValue(input, '£');
  }
}

/*
function parseTriggerForOperator(
  triggerName: string,
  opSymbol: string,
  triggers: Trigger[],
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
) {
  if (opSymbol === '?') {
    const parts = triggerName.split('?');
    if (parts.length !== 2) {
      return undefined;
    }
    const parts2 = parts[1].split(':');
    if (parts2.length !== 2) {
      return undefined;
    }
    const condition = parts[0];
    const ifTrue = parts2[0];
    const ifFalse = parts2[1];
    const parts3 = condition.split('<');
    if (parts3.length !== 2) {
      return undefined;
    }
    
    const earlierDate: Date | undefined = checkTriggerDateRecursive(
      parts3[0],
      triggers,
      recursionLevel + 1,
      cleanedUp,
    );
    const laterDate: Date | undefined = checkTriggerDateRecursive(
      parts3[1],
      triggers,
      recursionLevel + 1,
      cleanedUp,
    );
    if (earlierDate === undefined || laterDate === undefined) {
      return undefined;
    }
    if (earlierDate.getTime() < laterDate.getTime()) {
      return checkTriggerDateRecursive(
        ifTrue,
        triggers,
        recursionLevel + 1,
        cleanedUp,
      );
    } else {
      return checkTriggerDateRecursive(
        ifFalse,
        triggers,
        recursionLevel + 1,
        cleanedUp,
      );
    }
  } else if (opSymbol === '+' || opSymbol === '-') {
    const parts = triggerName.split(opSymbol);
    if (parts.length < 2) {
      return undefined;
    }
    // concantenate all early parts into one, process the last part
    parts[0] = triggerName.substring(
      0,
      triggerName.length - parts[parts.length - 1].length - 1,
    );
    parts[1] = parts[parts.length - 1];

    let numChange = 0;
    if (opSymbol === '-') {
      numChange = -1;
    } else if (opSymbol === '+') {
      numChange = 1;
    } else {
      return undefined;
    }
    const secondPartNW = getNumberAndWordParts(parts[1]);
    if (secondPartNW.numberPart === undefined) {
      return undefined;
    }
    if (
      secondPartNW.wordPart !== 'd' &&
      secondPartNW.wordPart !== 'm' &&
      secondPartNW.wordPart !== 'y'
    ) {
      return undefined;
    }

    //no-use-before-define
    const cleanedUpFirstPart = cleanedUp ? {
      cleaned: ''
    } : undefined;
    const firstPartDate: Date | undefined = checkTriggerDateRecursive(
      parts[0],
      triggers,
      recursionLevel + 1,
      cleanedUpFirstPart,
    );
    if(cleanedUp){
      cleanedUp.cleaned = `${cleanedUpFirstPart?.cleaned}${opSymbol}${parts[1]}`;
    }

    if (firstPartDate !== undefined) {
      if (secondPartNW.wordPart === 'd') {
        firstPartDate.setDate(
          firstPartDate.getDate() + numChange * secondPartNW.numberPart,
        );
      } else if (secondPartNW.wordPart === 'm') {
        firstPartDate.setMonth(
          firstPartDate.getMonth() + numChange * secondPartNW.numberPart,
        );
      } else if (secondPartNW.wordPart === 'y') {
        firstPartDate.setFullYear(
          firstPartDate.getFullYear() + numChange * secondPartNW.numberPart,
        );
      }
      // log(`converted ${triggerName} into ${firstPartDate.toDateString()}`);
      return firstPartDate;
    } else {
      if (printDebug()) {
        log(`Error: can't understand ${triggerName}`);
      }
    }
  }
}
*/

function parseTriggerForOperator(
  triggerName: string,
  opSymbol: string,
  triggers: Trigger[],
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
) {
  let numChange = 0;
  if (opSymbol === '?') {
    const parts = triggerName.split(opSymbol);
    if (parts.length === 2) {
      const partsLessThan = parts[0].split('<');
      const partsElse = parts[1].split(':');
      if (partsLessThan.length === 2 && partsElse.length === 2) {
        const cleaned1 = {
          cleaned: '',
        };
        const cleaned2 = {
          cleaned: '',
        };
        const cleaned3 = {
          cleaned: '',
        };
        const cleaned4 = {
          cleaned: '',
        };
        const date1: Date | undefined = findMatchedTriggerDate(
          partsLessThan[0],
          triggers,
          recursionLevel + 1,
          cleaned1,
        );
        const date2: Date | undefined = findMatchedTriggerDate(
          partsLessThan[1],
          triggers,
          recursionLevel + 1,
          cleaned2,
        );
        const date3: Date | undefined = findMatchedTriggerDate(
          partsElse[0],
          triggers,
          recursionLevel + 1,
          cleaned3,
        );
        const date4: Date | undefined = findMatchedTriggerDate(
          partsElse[1],
          triggers,
          recursionLevel + 1,
          cleaned4,
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

  if (opSymbol === '-') {
    numChange = -1;
  } else if (opSymbol === '+') {
    numChange = 1;
  } else {
    /* istanbul ignore next  */
    return undefined;
  }

  const parts = triggerName.split(opSymbol);
  if (parts.length === 2) {
    const secondPartNW = getNumberAndWordParts(parts[1]);
    if (
      secondPartNW.numberPart !== undefined &&
      (secondPartNW.wordPart === 'd' ||
        secondPartNW.wordPart === 'm' ||
        secondPartNW.wordPart === 'y')
    ) {
      //no-use-before-define
      /* eslint-disable */
      const firstPartDate: Date | undefined = findMatchedTriggerDate(
        parts[0],
        triggers,
        recursionLevel + 1,
        cleanedUp,
      );
      /* eslint-enable */
      if (firstPartDate !== undefined) {
        if (secondPartNW.wordPart === 'd') {
          firstPartDate.setDate(
            firstPartDate.getDate() + numChange * secondPartNW.numberPart,
          );
        } else if (secondPartNW.wordPart === 'm') {
          firstPartDate.setMonth(
            firstPartDate.getMonth() + numChange * secondPartNW.numberPart,
          );
        } else if (secondPartNW.wordPart === 'y') {
          firstPartDate.setFullYear(
            firstPartDate.getFullYear() + numChange * secondPartNW.numberPart,
          );
        }
        // log(`converted ${triggerName} into ${firstPartDate.toDateString()}`);
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

// returns a date for a trigger, or undefined
function findMatchedTriggerDate(
  triggerName: string,
  triggers: Trigger[],
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
): Date | undefined {
  // log(`findMatchedTriggerDate recursionLevel = ${recursionLevel}, triggerName = ${triggerName}`)
  if (recursionLevel > 10) {
    //log(`infinite or too-complex recursion for dates - emergency stop`);
    return undefined;
  }
  const conditionalOp = parseTriggerForOperator(
    triggerName,
    '?',
    triggers,
    recursionLevel,
    cleanedUp,
  );
  if (conditionalOp !== undefined) {
    return conditionalOp;
  }
  const minusOp = parseTriggerForOperator(
    triggerName,
    '-',
    triggers,
    recursionLevel,
    cleanedUp,
  );
  if (minusOp !== undefined) {
    return minusOp;
  }
  const plusOp = parseTriggerForOperator(
    triggerName,
    '+',
    triggers,
    recursionLevel,
    cleanedUp,
  );
  if (plusOp !== undefined) {
    return plusOp;
  }
  // log('look for '+triggerName+'in '+triggers.map(showObj))
  const matched = triggers.filter((trigger) => trigger.NAME === triggerName);
  // log(`matched trigger = ${showObj(matched)}`);
  let result = undefined;
  if (matched.length !== 0) {
    // no-use-before-define
    /* eslint-disable */
    const cleaned5 = {
      cleaned: '',
    }
    result = checkTriggerDateRecursive(
      matched[0].DATE,
      triggers,
      recursionLevel + 1,
      undefined,
    );
    if(cleanedUp !== undefined){
      cleanedUp.cleaned = triggerName;
    }
    /* eslint-enable */

    // log(`converted ${triggerName} into ${result.toDateString()}`);
  }

  if (result === undefined) {
    const dateTry = makeDateFromString(triggerName);
    if (dateTry.getTime()) {
      result = dateTry;
      if (cleanedUp) {
        const shortString = dateTry.toDateString();
        const shortStringDate = new Date(shortString);
        if (shortStringDate.getTime() === dateTry.getTime()) {
          cleanedUp.cleaned = shortString;
        } else {
          cleanedUp.cleaned = triggerName;
        }
      }
    } else {
      //log(`BUG : unrecognised date!!! ${input}, `
      // `${showObj(triggers.length)}`);
      if (cleanedUp) {
        cleanedUp.cleaned = `Invalid Date ${triggerName}`;
      }
      result = undefined;
    }
  }
  // log(`date for ${input} is ${result}`);
  return result;
}

function checkTriggerDateRecursive(
  input: string,
  triggers: Trigger[],
  recursionLevel: number,
  cleanedUp: { cleaned: string } | undefined,
) {
  // log(`checkTriggerDateRecursive recursionLevel = ${recursionLevel}, input = ${input}`);
  // log('first look for '+input+'in '+showObj(triggers));
  /* eslint-disable no-use-before-define*/ // recursion
  const matched = findMatchedTriggerDate(
    input,
    triggers,
    recursionLevel,
    cleanedUp,
  );
  /* eslint-enable no-use-before-define*/

  // log(`matched = ${showObj(matched)}`);
  return matched;
}

// returns a date for a trigger or for a date string, or undefined for junk
export function checkTriggerDate(
  input: string,
  triggers: Trigger[],
  cleanedUp: { cleaned: string } | undefined = undefined,
) {
  // log(`checking input ${input}`);
  const result = checkTriggerDateRecursive(input, triggers, 0, cleanedUp);
  // log(`checking input ${input} got result = ${result}`);
  return result;
}

// Suppresses any not-understood values and returns new Date('Invalid Date')
export function getTriggerDate(triggerName: string, triggers: Trigger[]): Date {
  // log(`triggers length is ${triggers.length}`);
  const checkResult = checkTriggerDate(triggerName, triggers);
  if (checkResult !== undefined) {
    return checkResult;
  }
  return new Date('Invalid Date');
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
  if (!(endDateName.startsWith('+') || endDateName.startsWith('-'))) {
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
    breakDown.wordPart === 'm' ||
    breakDown.wordPart === 'd' ||
    breakDown.wordPart === 'y';
  if (hasLetter) {
    // log(`${dateName} is dependent upon ${dependent}`);
  } else {
    // log(`${dateName} does not have d/m/y after ${dependent}`);
  }
  return hasLetter;
}

export function hasDependentDate(t: Trigger, model: ModelData): boolean {
  // console.log(`see if this model depends on ${t.NAME}`);
  const name = t.NAME;
  // log(`trigger name is ${name}`);
  // is there a transaction date which begins with name
  // and appends some date algebra
  if (
    model.triggers.find((t) => {
      // console.log(`see if trigger ${t.DATE} depends on ${name}`);
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
  if (name.startsWith(bondMaturity)) {
    return bondMaturity;
  }
  if (
    model.transactions.find((t) => {
      const result = t.FROM_VALUE === bondMaturity + name;
      // log(`does t TO ${t.FROM_VALUE} block change of name from ${name}? ${result}`);
      return result;
    }) !== undefined
  ) {
    return bondMaturity;
  }
  let durationEnding = '';
  if (name.endsWith('5y')) {
    durationEnding = '5y';
  } else if (name.endsWith('4y')) {
    durationEnding = '4y';
  } else if (name.endsWith('3y')) {
    durationEnding = '3y';
  } else if (name.endsWith('2y')) {
    durationEnding = '2y';
  } else if (name.endsWith('1y')) {
    durationEnding = '1y';
  } else if (name.endsWith('1m')) {
    durationEnding = '1m';
  }

  if (durationEnding !== '') {
    // this might be a bond investment - take care!
    const sourceTransaction = model.transactions.find((t) => {
      if (t.TYPE !== bondInvest) {
        return false;
      }
      if (!t.NAME.endsWith(durationEnding)) {
        return false;
      }
      // there is an investment with this duration
      return true;
    });
    if (sourceTransaction === undefined) {
      return '';
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
      return 'dateAlgebra';
    }
  }
  return '';
}

export function checkForWordClashInModel(
  model: ModelData,
  replacement: string,
  messageWord: string,
): string {
  const settingMessages = model.settings
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Setting '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Setting '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const triggerMessages = model.triggers
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Trigger '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const assetMessages = model.assets
    .map((obj) => {
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
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return `Asset '${obj.NAME}' has category ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const incomeMessages = model.incomes
    .map((obj) => {
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
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return `Income '${obj.NAME}' has liability ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return `Income '${obj.NAME}' has category ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const expenseMessages = model.expenses
    .map((obj) => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Expense '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.CATEGORY, replacement)) {
        return `Expense '${obj.NAME}' has category ${messageWord} called ${replacement}`;
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
      return '';
    })
    .filter((obj) => {
      return obj.length > 0;
    });
  const transactionMessages = model.transactions
    .map((obj) => {
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
        return `Transaction '${obj.NAME}' has to value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.DATE, replacement)) {
        return `Transaction '${obj.NAME}' has date ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.STOP_DATE, replacement)) {
        return `Transaction '${obj.NAME}' has stop date ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter((obj) => {
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
