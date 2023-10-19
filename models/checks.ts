import {
  CASH_ASSET_NAME,
  assetChartFocus,
  chartViewType,
  autogen,
  birthDate,
  cgt,
  conditional,
  cpi,
  crystallizedPension,
  custom,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  incomeTax,
  liquidateAsset,
  moveTaxFreePart,
  nationalInsurance,
  payOffDebt,
  pension,
  pensionDB,
  pensionSS,
  pensionTransfer,
  purchase,
  quantity,
  revalue,
  revalueAsset,
  revalueDebt,
  revalueExp,
  revalueInc,
  revalueSetting,
  roiEnd,
  roiStart,
  separator,
  taxChartFocusType,
  taxFree,
  taxPot,
  transferCrystallizedPension,
  viewDetail,
  viewFrequency,
  bondMaturity,
  bondInvest,
  bondMature,
} from '../localization/stringConstants';

import { Context, DateFormatType, getMaturityDate, log, makeDateFromString, showObj } from '../utils/utils';

import {
  getTriggerDate,
  getNumberAndWordParts,
  checkTriggerDate,
  dateAsString,
  getDisplayName,
} from '../utils/stringUtils';
import { getSettings, getVarVal, isADebt, isASetting, isAnAssetOrAssets, isAnExpense, isAnIncome, isNumberString, replaceCategoryWithAssetNames } from './modelQueries';
import { Asset, Evaluation, Expense, Income, ModelData, Setting, Transaction, Trigger } from '../types/interfaces';

export const evaluationType = {
  expense: 'Expense',
  income: 'Income',
  asset: 'Asset',
  setting: 'Setting',
  taxLiability: 'TaxLiability',
};

function checkTransactionWords(
  name: string,
  word: string,
  date: string,
  model: ModelData,
) {
  // log(`date for check = ${getTriggerDate(date, triggers)}`);
  const triggers = model.triggers;
  const v = getVarVal(model.settings);
  const a = model.assets.find(
    (as) =>
      (as.NAME === word || as.CATEGORY === word) &&
      getTriggerDate(as.START, triggers, v) <=
        getTriggerDate(date, triggers, v),
  );
  if (a !== undefined) {
    return true;
  }

  // log(`name = ${name} and transaction from word ${word}`);
  // maybe t.FROM is the name of an income
  let i = model.incomes.find(
    (is) =>
      is.NAME === word &&
      (name.startsWith(pensionDB) ||
        name.startsWith(pensionSS) ||
        getTriggerDate(is.START, triggers, v) <=
          getTriggerDate(date, triggers, v)),
  );
  if (i !== undefined) {
    // the word is an income
    // this only happens for transactions called Pension*
    if (
      !name.startsWith(pension) && // transfer out of income to pension
      !name.startsWith(pensionSS) && // transfer out of income for contribution
      !name.startsWith(pensionDB) && // transfer from income to pension benefit
      !name.startsWith(pensionTransfer) // transfer from one pension to another
    ) {
      log(`Transaction '${name}' from income 
        ${word} must be pension-related`);
      return false;
    }
    return true;
  }

  // maybe t.FROM is an income liability
  i = model.incomes.find(
    (is) =>
      is.LIABILITY.includes(word) &&
      getTriggerDate(is.START, triggers, v) <=
        getTriggerDate(date, triggers, v),
  );
  if (i !== undefined) {
    // the word is an income liability
    return true;
  }

  return false;
}
function checkDate(d: Date) {
  // log(`checking date ${d}, of type ${typeof d}`);
  if (
    Number.isNaN(d.getTime()) ||
    d < makeDateFromString('1 Jan 1870') ||
    d > makeDateFromString('1 Jan 2199')
  ) {
    return false;
  }
  return true;
}
export function checkAssetLiability(l: string) {
  if (l.length > 0 && !l.endsWith(cgt) && !l.endsWith(incomeTax)) {
    return `liability '${l}' should end with ${cgt} or ${incomeTax}`;
  }
  return '';
}

export function isValidValueInternal(
  value: string,
  model: ModelData,
  iterationDepth: number,
): boolean {
  if (value.length === 0) {
    return false;
  }
  if (isNumberString(value)) {
    return true;
  }
  if (iterationDepth > 10) {
    // TODO : how low can iteration get?
    /* istanbul ignore next */
    return false;
  }

  const parsed = getNumberAndWordParts(value);
  if (parsed.wordPart !== undefined) {
    const settingVal = getSettings(
      model.settings,
      parsed.wordPart,
      'missing',
      false,
    );
    if (settingVal !== 'missing') {
      // log(`does setting ${settingVal} makes sense for a value...`);
      const recursiveVal = isValidValueInternal(
        settingVal,
        model,
        iterationDepth + 1,
      );
      if (!recursiveVal) {
        log(`${settingVal} is not a valid value`);
      }
      return recursiveVal;
    }
    if (isAnAssetOrAssets(parsed.wordPart, model)) {
      return true; // could be appropriate ... TODO always workable?
    }
  }
  return false;
}
export function isValidValue(value: string, model: ModelData): boolean {
  return isValidValueInternal(value, model, 1);
}
export function checkAsset(a: Asset, model: ModelData): string {
  // log(`checkAsset ${showObj(a)}`);
  if (a.NAME.length === 0) {
    return 'Asset name should be not empty';
  }
  if (a.NAME.split(separator).length !== 1) {
    return `Asset '${a.NAME}' should not contain '${separator}'`;
  }
  const val = parseFloat(a.VALUE);
  // log(`asset value is ${val}`);
  if (val < 0 && !a.CAN_BE_NEGATIVE) {
    return `Asset '${a.NAME}' can't be negative but has negative value '${a.VALUE}'`;
  }
  if (a.LIABILITY.length > 0) {
    // log(`checking ${a.LIABILITY}`);
    const words = a.LIABILITY.split(separator);
    for (let idx = 0; idx < words.length; idx += 1) {
      const word = words[idx];
      const x = checkAssetLiability(word);
      if (x.length > 0) {
        return `Asset '${a.NAME}' ${x}`;
      }
    }
  }

  if (!isNumberString(a.GROWTH)) {
    const settingVal = getSettings(model.settings, a.GROWTH, 'missing', false);
    if (settingVal === 'missing') {
      return `Asset '${a.NAME}' growth set to '${a.GROWTH}'
        but no corresponding setting found`;
    }
    if (!isNumberString(settingVal)) {
      const settingVal2 = getSettings(
        model.settings,
        settingVal,
        'missing',
        false,
      );
      if (settingVal2 === 'missing') {
        return `Asset '${a.NAME}' growth set to '${a.GROWTH}'
          but corresponding setting not a number`;
      }
    }
  }

  if (!isValidValue(a.VALUE, model)) {
    return `Asset '${a.NAME}' value set to '${a.VALUE}'
      but no suitable setting evaluation is possible`;
  }
  if (!isNumberString(a.VALUE)) {
    if (parseFloat(a.GROWTH) !== 0.0) {
      return `Asset '${a.NAME}' value '${a.VALUE}' may not have nonzero growth`;
    }
    if (!a.CPI_IMMUNE) {
      return `Asset '${a.NAME}' value '${a.VALUE}' may not grow with CPI`;
    }
  }

  const isANumber = isNumberString(a.PURCHASE_PRICE);
  if (!isANumber) {
    const setting = getSettings(
      model.settings,
      a.PURCHASE_PRICE,
      '',
      false, // allow for it not being there
    );
    if (setting === '') {
      return `Asset '${a.NAME}' purchase price '${a.PURCHASE_PRICE}' should be a numerical or setting value`;
    }
  }

  const d = checkTriggerDate(
    a.START,
    model.triggers,
    getVarVal(model.settings),
  );
  if (d === undefined || !checkDate(d)) {
    return `Asset '${a.NAME}' start date doesn't make sense :
      ${showObj(a.START)}`;
  }
  return '';
}

export function checkIncomeLiability(l: string) {
  if (
    l.length > 0 &&
    !l.endsWith(incomeTax) &&
    !l.endsWith(nationalInsurance)
  ) {
    return (
      `liability '${l}' should end with ` +
      `'${incomeTax}' or '${nationalInsurance}'`
    );
  }
  return '';
}

function checkRecurrence(rec: string) {
  const lastChar = rec.substring(rec.length - 1);
  // log(`lastChar of ${rec} = ${lastChar}`);
  if (!(lastChar === 'm' || lastChar === 'y' || lastChar === 'w')) {
    return `recurrence '${rec}' must end in w, m or y`;
  }
  const firstPart = rec.substring(0, rec.length - 1);
  // log(`firstPart of ${rec} = ${firstPart}`);

  const val = parseFloat(firstPart);
  // log(`val from ${rec} = ${val}`);
  if (Number.isNaN(val)) {
    return `recurrence '${rec}' must be a number ending in w, m or y`;
  }
  return '';
}

export function checkIncome(i: Income, model: ModelData): string {
  if (i.NAME.length === 0) {
    return 'Income name needs some characters';
  }
  // log(`checking ${showObj(i)}`);
  const parts = i.LIABILITY.split(separator);
  if (parts.length > 3) {
    return (
      `Income liability for '${i.NAME}' has parts '${parts}' ` +
      `but should contain at most three parts`
    );
  }
  let incomeTaxName = '';
  let niName = '';
  for (const l of parts) {
    /* eslint-disable-line no-restricted-syntax */
    const x = checkIncomeLiability(l);
    if (x.length > 0) {
      return (
        `Income liability for '${i.NAME}' has parts '${parts}' ` +
        `but the part '${l}' should end with ` +
        `'${incomeTax}' or '${nationalInsurance}'`
      );
    }
    if (l.endsWith(incomeTax)) {
      incomeTaxName = l.substring(0, l.length - incomeTax.length);
    } else if (l.endsWith(nationalInsurance)) {
      niName = l.substring(0, l.length - nationalInsurance.length);
    }
    if (incomeTaxName !== '' && niName !== '' && incomeTaxName !== niName) {
      return (
        `Income liability for '${i.NAME}' has parts '${parts}' ` +
        `but it should be the same person liable for NI and income tax'`
      );
    }
  }
  if (!isValidValue(i.VALUE, model)) {
    return `Income '${i.NAME}' value '${i.VALUE}' does not make sense`;
  }
  if (!isNumberString(i.VALUE)) {
    if (!i.CPI_IMMUNE) {
      return `Income '${i.NAME}' value '${i.VALUE}' may not grow with CPI`;
    }
  }
  const v = getVarVal(model.settings);
  const startDate = checkTriggerDate(i.START, model.triggers, v);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Income '${i.NAME}' start date doesn't make sense : ${showObj(
      i.START,
    )}`;
  }
  const cashAssets = model.assets.filter((m) => {
    return m.NAME === CASH_ASSET_NAME;
  });
  if (cashAssets.length > 0) {
    const cashStarts = getTriggerDate(cashAssets[0].START, model.triggers, v);
    if (startDate < cashStarts) {
      return `Income '${
        i.NAME
      }' start date must be after cash starts; ${dateAsString(
        DateFormatType.View,
        startDate,
      )} is before ${dateAsString(DateFormatType.View, cashStarts)}`;
    }
  }
  const taxAssets = model.assets.filter((m) => {
    return m.NAME === taxPot;
  });
  if (taxAssets.length > 0) {
    return `We don't need taxPot any more`;
  }
  const valueSetDate = checkTriggerDate(i.VALUE_SET, model.triggers, v);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Income '${i.NAME}' value set date doesn't make sense : ${showObj(
      i.VALUE_SET,
    )}`;
  }
  const endDate = checkTriggerDate(i.END, model.triggers, v);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Income '${i.NAME}' end date doesn't make sense : ${showObj(i.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Income '${
      i.NAME
    }' value must be set on or before the start of the income.
      Start is ${dateAsString(DateFormatType.View, startDate)} and
      value is set ${dateAsString(DateFormatType.View, valueSetDate)}.`;
  }
  const checkRec = checkRecurrence(i.RECURRENCE);
  if (checkRec !== '') {
    return `Income '${i.NAME}' ${checkRec}`;
  }
  return '';
}

export function checkExpense(e: Expense, model: ModelData): string {
  if (e.NAME.length === 0) {
    return 'Expense name needs some characters';
  }
  if (!isValidValue(e.VALUE, model)) {
    return `Expense '${e.NAME}' value '${e.VALUE}' is not a number`;
  }
  if (!isNumberString(e.VALUE)) {
    if (!e.CPI_IMMUNE) {
      return `Expense '${e.NAME}' value '${e.VALUE}' may not grow with CPI`;
    }
  }
  const v = getVarVal(model.settings);
  const startDate = checkTriggerDate(e.START, model.triggers, v);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Expense '${e.NAME}' start date doesn't make sense :
      ${showObj(e.START)}`;
  }
  const valueSetDate = checkTriggerDate(e.VALUE_SET, model.triggers, v);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Expense '${e.NAME}' value set date doesn't make sense :
      ${showObj(e.VALUE_SET)}`;
  }
  const endDate = checkTriggerDate(e.END, model.triggers, v);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Expense '${e.NAME}' end date doesn't make sense :
      ${showObj(e.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Expense '${
      e.NAME
    }' value must be set on or before the start of the income.
      Start is ${dateAsString(DateFormatType.View, startDate)} and
      value is set ${dateAsString(DateFormatType.View, valueSetDate)}.`;
  }

  if (valueSetDate < startDate) {
    const cpiSetting = model.settings.find((s) => {
      return s.NAME === cpi;
    });
    if (cpiSetting) {
      const val = parseFloat(cpiSetting.VALUE);
      if (val > 0.0) {
        // return 'expense needs to grow!';
      }
    }
  }

  const checkRec = checkRecurrence(e.RECURRENCE);
  if (checkRec !== '') {
    return `Expense '${e.NAME}' ${checkRec}`;
  }
  return '';
}
function checkTransactionFrom(word: string, settings: Setting[]) {
  let matched = settings.find((s) => s.NAME === word);
  if (matched !== undefined) {
    // the FROM value is a setting - assume that it
    // will evaluate to a number without further checks
    return '';
  }
  if (word.startsWith(bondMaturity)) {
    const trimmedWord = word.substring(bondMaturity.length);
    matched = settings.find((s) => {
      const result = s.NAME === trimmedWord;
      // log(`compare ${trimmedWord} against setting ${s.NAME}; match ${result}`);
      return result;
    });
    if (matched !== undefined) {
      // the FROM value is `${bondMaturity}${setting}` - assume that the setting
      // part will evaluate to a bond target value number without
      // further checks
      // log(`checks OK`);
      return '';
    }
  }
  return `'from' value must be numbers or a setting, not '${word}'`;
}

function checkTransactionTo(word: string, t: Transaction, model: ModelData) {
  const v = getVarVal(model.settings);
  const triggers = model.triggers;
  const a = model.assets.find((as) => as.NAME === word || as.CATEGORY === word);
  if (a !== undefined) {
    if (t.NAME.startsWith(pensionDB)) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}'' should have TO an income not an asset : ${a.NAME}`;
    }
    if (
      getTriggerDate(a.START, triggers, v) > getTriggerDate(t.DATE, triggers, v)
    ) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' dated before start ` +
        `of affected asset : '${a.NAME}'`
      );
    }
    return '';
  }

  const i = model.incomes.find((ic) => ic.NAME === word);
  if (i !== undefined) {
    if (
      !t.NAME.startsWith(revalue) &&
      !t.NAME.startsWith(pensionDB) &&
      !t.NAME.startsWith(pensionTransfer)
    ) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' to an income ` +
        `must begin '${revalue}' ` +
        `or '${pensionDB} or ${pensionTransfer}`
      );
    }
    if (t.NAME.startsWith(pensionDB)) {
      if (!i.NAME.startsWith(pensionDB)) {
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )}' must have TO income ${t.TO} named starting ${pensionDB}`;
      }
    }
    // transacting on an income - check dates
    if (!t.NAME.startsWith(pensionDB)) {
      if (
        getTriggerDate(i.START, triggers, v) >
        getTriggerDate(t.DATE, triggers, v)
      ) {
        return (
          `Transaction '${getDisplayName(
            t.NAME,
            t.TYPE,
          )}' dated before start ` + `of affected income : '${i.NAME}'`
        );
      }
    }
    return '';
  }

  const exp = model.expenses.find((e) => e.NAME === word);
  if (exp !== undefined) {
    // transacting on an expense - must be a revaluation
    if (!t.NAME.startsWith(revalue)) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ` +
        `to an expense must begin '${revalue}'`
      );
    }
    // transacting on an expense - check dates
    if (
      getTriggerDate(exp.START, triggers, v) >
      getTriggerDate(t.DATE, triggers, v)
    ) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' dated before start ` +
        `of affected expense : '${exp.NAME}'`
      );
    }
    if (
      getTriggerDate(exp.END, triggers, v) < getTriggerDate(t.DATE, triggers, v)
    ) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' dated after end ` +
        `of affected expense : '${exp.NAME}'`
      );
    }
    return '';
  }

  const s = model.settings.find((s) => s.NAME === word);
  if (s !== undefined) {
    // transacting on an setting - must be a revaluation
    if (!t.NAME.startsWith(revalue)) {
      return (
        `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ` +
        `to a setting must begin '${revalue}'`
      );
    }
    return '';
  }
  return `Transaction '${getDisplayName(
    t.NAME,
    t.TYPE,
  )} to unrecognised thing : ${word}`;
}

function isAutogenType(t: Transaction, model: ModelData) {
  // log(`check Transaction '${getDisplayName(t.NAME, t.TYPE)}'`);
  let recognised = false;
  /*
    const contributions: Transaction = {
      NAME: (parseYNSS.value ? pensionSS : pension) + this.state.NAME,
      FROM: this.state.DCP_INCOME_SOURCE,
      FROM_ABSOLUTE: false,
      FROM_VALUE: this.state.DCP_CONTRIBUTION_AMOUNT,
      TO: asset1Name,
      TO_ABSOLUTE: false,
      TO_VALUE: `${toProp}`,
      DATE: this.state.START, // match the income start date
      STOP_DATE: this.state.DCP_STOP, // match the income stop date
      RECURRENCE: '',
      CATEGORY: this.state.CATEGORY,
      TYPE: autogen,
    };
*/
  // A defined contributions pension
  // takes money out of an income
  // could be salary sacrifice, could be not,
  // and puts it into an asset called pension*
  if (
    (t.NAME.startsWith(pension) || t.NAME.startsWith(pensionSS)) &&
    (t.FROM === '' || isAnIncome(t.FROM, model)) &&
    t.TO_ABSOLUTE === false &&
    t.TO.startsWith(pension) &&
    t.FROM_ABSOLUTE === false &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
    /*    
  } else {
    log(`for ${t.NAME}`);
    if(!(t.NAME.startsWith(pension) || t.NAME.startsWith(pensionSS))){
      log('not a DCP name');
    }
    if(!isAnIncome(t.FROM, model)){
      log('not a DCP FROM');
    }
    if(t.TO_ABSOLUTE !== false){
      log('not a DCP TO_ABSOLUTE');      
    }
    if(!t.TO.startsWith(pension)){
      log('not a DCP TO');      
    }
    if(t.FROM_ABSOLUTE !== false){
      log('not a DCP FROM_ABSOLUTE');          
    }
    if(t.RECURRENCE !== ''){
      log('not a DCP RECURRENCE');            
    }
*/
  }
  /*
      NAME: moveTaxFreePart + this.state.NAME,
      FROM: asset1Name,
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.25', // TODO move hard coded value out of UI code
      TO: asset2Name,
      TO_ABSOLUTE: false,
      TO_VALUE: `1.0`,
      DATE: this.state.DCP_CRYSTALLIZE,
      STOP_DATE: '',
      RECURRENCE: '',
      CATEGORY: this.state.CATEGORY,
      TYPE: autogen,
*/
  // A defined contributions pension
  // moves a tax free amount from the asset called pension*
  // into another asset called TaxFree*
  if (
    !recognised &&
    t.NAME.startsWith(moveTaxFreePart) &&
    t.FROM.startsWith(pension) &&
    t.FROM_ABSOLUTE === false &&
    t.TO.startsWith(taxFree) &&
    t.TO_ABSOLUTE === false &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
  }
  /*
      NAME: crystallizedPension + this.state.NAME,
      FROM: asset1Name,
      FROM_ABSOLUTE: false,
      FROM_VALUE: '1.0',
      TO: asset3Name,
      TO_ABSOLUTE: false,
      TO_VALUE: `1.0`,
      DATE: this.state.DCP_CRYSTALLIZE, // +1 sec
      STOP_DATE: '',
      RECURRENCE: '',
      CATEGORY: this.state.CATEGORY,
      TYPE: autogen,
*/

  // A defined contributions pension
  // after taking a tax free part,
  // moves the rest of from the asset called pension*
  // into another asset called crystallized*
  if (
    !recognised &&
    t.NAME.startsWith(crystallizedPension) &&
    t.FROM.startsWith(pension) &&
    // asNumber(t.FROM_VALUE) === 1.0 &&
    t.FROM_ABSOLUTE === false &&
    t.TO.startsWith(crystallizedPension) &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
    /*
  } else {
    log(`t.NAME.startsWith(crystallizedPension) = ${t.NAME.startsWith(crystallizedPension)}`);
    log(`t.FROM.startsWith(pension) = ${t.FROM.startsWith(pension)}`);
    log(`t.FROM_ABSOLUTE === false = ${t.FROM_ABSOLUTE === false}`);
    log(`t.FROM_ABSOLUTE === false = ${t.FROM_ABSOLUTE === false}`);
    log(`t.TO.startsWith(crystallizedPension) = ${t.TO.startsWith(crystallizedPension)}`);
    log(`t.RECURRENCE === '' = ${t.RECURRENCE === ''}`);
*/
  }
  /*
    Transfer DB pension
        transfer = {
          NAME: transferCrystallizedPension + this.state.NAME,
          FROM: asset3Name, // crystallized for one person
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: asset4Name, // crystallized for another person
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: this.state.DCP_TRANSFER_DATE, 
          STOP_DATE: '',
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
  */
  if (
    !recognised &&
    t.NAME.startsWith(transferCrystallizedPension) &&
    t.FROM.startsWith(crystallizedPension) &&
    // asNumber(t.FROM_VALUE) === 1.0 &&
    t.FROM_ABSOLUTE === false &&
    t.TO.startsWith(crystallizedPension) &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
    /*
  } else {
    log(`t.NAME.startsWith(transferCrystallizedPension) = ${t.NAME.startsWith(transferCrystallizedPension)}`);
    log(`t.FROM.startsWith(crystallizedPension) = ${t.FROM.startsWith(crystallizedPension)}`);
    log(`t.FROM_ABSOLUTE === false = ${t.FROM_ABSOLUTE === false}`);
    log(`t.TO.startsWith(crystallizedPension) = ${t.TO.startsWith(crystallizedPension)}`);
    log(`t.RECURRENCE === '' = ${t.RECURRENCE === ''}`);
*/
  }

  /*
      const pensionDbptran1: Transaction = {
        NAME: (parseYNDBSS.value ? pensionSS : pension) + this.state.NAME,
        FROM: this.state.DB_INCOME_SOURCE,
        FROM_ABSOLUTE: false,
        FROM_VALUE: this.state.DB_CONTRIBUTION_AMOUNT,
        TO: '',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.0',
        DATE: this.state.VALUE_SET, // match the income start date
        STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
*/
  // A defined benefits pension
  // takes money from an income
  // (optionally salary sacrifice)
  // to nothing
  if (
    (t.NAME.startsWith(pension) || t.NAME.startsWith(pensionSS)) &&
    isAnIncome(t.FROM, model) &&
    t.FROM_ABSOLUTE === false &&
    t.TO === '' &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
    /*
  } else {
    log(`for ${t.NAME}`);
    log(`t.NAME.startsWith(pension) || t.NAME.startsWith(pensionSS) = 
      ${t.NAME.startsWith(pension) || t.NAME.startsWith(pensionSS)}`);
    log(`isAnIncome(t.FROM, model) = ${isAnIncome(t.FROM, model)}`);
    log(`t.FROM_ABSOLUTE === false  = ${t.FROM_ABSOLUTE === false}`);
    log(`t.TO === ''  =${t.TO === ''}`);
    log(`t.RECURRENCE === '' =${t.RECURRENCE === ''}`);
  */
  }
  /*
        NAME: newIncomeName1, // kicks in when we see income java
        FROM: this.state.DB_INCOME_SOURCE,
        FROM_ABSOLUTE: false,
        FROM_VALUE: monthlyAccrualValue, // percentage of income offered up to pension
        TO: newIncomeName1,
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: this.state.VALUE_SET, // match the income start date
        STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
*/
  // A defined benefits pension
  // accrues an amount to an income pensionDB*
  if (
    t.NAME.startsWith(pensionDB) &&
    isAnIncome(t.FROM, model) &&
    t.FROM_ABSOLUTE === false &&
    t.TO_ABSOLUTE === false &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
  }

  /*
          NAME: newIncomeName2,
          FROM: newIncomeName1,
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: newIncomeName2,
          TO_ABSOLUTE: false,
          TO_VALUE: this.state.DB_TRANSFER_PROPORTION,
          DATE: this.state.DB_END,
          STOP_DATE: this.state.DB_TRANSFERRED_STOP,
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
*/
  // A defined benefits pension can be transferred to someone else
  if (
    t.NAME.startsWith(pensionTransfer) &&
    isAnIncome(t.FROM, model) &&
    t.FROM.startsWith(pensionDB) &&
    t.FROM_ABSOLUTE === false &&
    t.TO.startsWith(pensionTransfer) &&
    t.TO_ABSOLUTE === false &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
  }
  //if(!recognised){
  //  log(`bad transaction ${showObj(t)}`);
  //}
  return recognised;
}

function isLiquidateAssetType(t: Transaction) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (t.NAME.startsWith(conditional) && t.TO === CASH_ASSET_NAME) {
    recognised = true;
  }
  return recognised;
}

function isRevalueDebtType(t: Transaction, model: ModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (t.NAME.startsWith(revalue) && isADebt(t.TO, model) && t.CATEGORY === '') {
    // log(`for ${t.NAME} is a revalueDebt`);
    recognised = true;
    /*
  } else {
    log(`for ${t.NAME}`);
    log(`t.NAME.startsWith(revalue) is ${t.NAME.startsWith(revalue)}`);
    log(`isAnAssetOrAssets(t.TO, model) is ${isAnAssetOrAssets(t.TO, model)}`);
    log(`t.RECURRENCE === '' is ${t.RECURRENCE === ''}`);
    log(`t.CATEGORY === '' is ${t.CATEGORY === ''}`);
*/
  }
  return recognised;
}

function isRevalueAssetType(t: Transaction, model: ModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isAnAssetOrAssets(t.TO, model) &&
    t.CATEGORY === ''
  ) {
    // log(`for ${t.NAME} is a revalueAsset`);
    recognised = true;
    /*
  } else {
    log(`for ${t.NAME}`);
    log(`t.NAME.startsWith(revalue) is ${t.NAME.startsWith(revalue)}`);
    log(`isAnAssetOrAssets(t.TO, model) is ${isAnAssetOrAssets(t.TO, model)}`);
    log(`t.RECURRENCE === '' is ${t.RECURRENCE === ''}`);
    log(`t.CATEGORY === '' is ${t.CATEGORY === ''}`);
    */
  }
  return recognised;
}

function isRevalueIncomeType(t: Transaction, model: ModelData) {
  // log(`check Transaction '${getDisplayName(t.NAME, t.TYPE)}'`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isAnIncome(t.TO, model) &&
    t.CATEGORY === ''
  ) {
    recognised = true;
  }
  return recognised;
}

function isRevalueExpenseType(t: Transaction, model: ModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isAnExpense(t.TO, model) &&
    t.CATEGORY === ''
  ) {
    recognised = true;
    /*    
  } else {
    log(`for ${t.NAME}`);
    log(`t.NAME.startsWith(revalue) =  ${t.NAME.startsWith(revalue)}`);
    log(`t.RECURRENCE === '' ${t.RECURRENCE === ''}`);
    log(`t.CATEGORY === '' ${t.CATEGORY === ''}`);
*/
  }
  return recognised;
}

function isRevalueSettingType(t: Transaction, model: ModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isASetting(t.TO, model) &&
    t.CATEGORY === ''
  ) {
    recognised = true;
    /*    
  } else {
    log(`for ${t.NAME}`);
    log(`t.NAME.startsWith(revalue) =  ${t.NAME.startsWith(revalue)}`);
    log(`t.RECURRENCE === '' ${t.RECURRENCE === ''}`);
    log(`t.CATEGORY === '' ${t.CATEGORY === ''}`);
*/
  }
  return recognised;
}

function isCustomType(t: Transaction) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    !t.NAME.startsWith(conditional) &&
    !t.NAME.startsWith(crystallizedPension) &&
    !t.NAME.startsWith(pensionDB)
    //!t.NAME.startsWith(pensionSS)
  ) {
    recognised = true;
  }
  return recognised;
}

function isPayOffDebtType(t: Transaction, model: ModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(conditional) &&
    t.FROM === CASH_ASSET_NAME &&
    isADebt(t.TO, model)
  ) {
    recognised = true;
  }
  return recognised;
}

export function checkTransaction(t: Transaction, model: ModelData): string {
  // log(`checking transaction ${showObj(t)}`);
  const { triggers, settings } = model;
  if (t.NAME.length === 0) {
    return 'Transaction name needs some characters';
  }
  if (t.NAME.startsWith(conditional) && t.TO === '') {
    return `Conditional Transaction '${getDisplayName(
      t.NAME,
      t.TYPE,
    )}'  needs a 'To' asset defined`;
  }
  const d = checkTriggerDate(t.DATE, triggers, getVarVal(model.settings));
  if (d === undefined || !checkDate(d)) {
    return `Transaction '${getDisplayName(
      t.NAME,
      t.TYPE,
    )}'  has bad date : ${showObj(t.DATE)}`;
  }
  if (t.STOP_DATE !== '') {
    const stopD = checkTriggerDate(
      t.STOP_DATE,
      triggers,
      getVarVal(model.settings),
    );
    if (stopD === undefined || !checkDate(stopD)) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}'  has bad stop date : ${showObj(t.STOP_DATE)}`;
    }
  }
  // log(`transaction date ${getTriggerDate(t.DATE, triggers)}`);
  if (t.FROM !== '') {
    if (!checkTransactionWords(t.NAME, t.FROM, t.DATE, model)) {
      // log(`split up t.FROM ${t.FROM}`);
      const words = t.FROM.split(separator);
      // log(`words ${showObj(words)}`);
      const arrayLength = words.length;
      for (let i = 0; i < arrayLength; i += 1) {
        const word = words[i];
        // log(`word to check is ${word}`);
        if (!checkTransactionWords(t.NAME, word, t.DATE, model)) {
          // flag a problem
          return (
            `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ` +
            `from unrecognised asset (could ` +
            `be typo or before asset start date?) : ${showObj(word)}`
          );
        }
      }
    }
    if (t.FROM.startsWith(crystallizedPension)) {
      if (t.TO.startsWith(crystallizedPension)) {
        // ok we can transfer from one CP to another
      } else if (t.TO === CASH_ASSET_NAME) {
        // ok we will trigger income tax on this
      } else {
        // flag a problem
        return (
          `Transaction '${getDisplayName(t.NAME, t.TYPE)}'` +
          ` needs to go to ${CASH_ASSET_NAME}` +
          ` for proper income tax calculation`
        );
      }
    }
    if (t.FROM_VALUE === '') {
      return `Transaction from ${t.FROM} needs a non-empty from value`;
    } else if (!isNumberString(t.FROM_VALUE)) {
      const outcome = checkTransactionFrom(t.FROM_VALUE, settings);
      if (outcome !== '') {
        return `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ${outcome}`;
      }
    }
  }
  if (t.TO !== '') {
    if (t.NAME.startsWith(revalue)) {
      let words = t.TO.split(separator);
      // log(`check transaction to words : ${words}`);
      words = replaceCategoryWithAssetNames(words, model);
      // log(`transaction to words as assets : ${words}`);
      for (let idx = 0; idx < words.length; idx += 1) {
        const w = words[idx];
        const outcome = checkTransactionTo(w, t, model);
        if (outcome.length > 0) {
          return outcome;
        }
      }
      /*
      // Don't try this.
      // Some revaluations are of type custom
      // because we want to be able to type them in
      // and see them appear on the Transactions page
      // At least for now, because automated tests can't edit tables
      // so we can't automate recurring revaluations of settings
      // unless the action happens as a new Transaction
      if(t.TYPE !== revalueAsset
         && t.TYPE !== revalueDebt
         && t.TYPE !== revalueExp
         && t.TYPE !== revalueInc
         && t.TYPE !== revalueSetting){
        return `Revalue transaction has unexpected type ${t.TYPE}`;
      }
      */
    } else {
      const outcome = checkTransactionTo(t.TO, t, model);
      if (outcome.length > 0) {
        return outcome;
      }
    }
    if (t.TYPE === revalueSetting) {
      // log(`anything goes!`);
    } else if (t.TO_VALUE === '') {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' needs a non-empty to value`;
    } else if (!isValidValue(t.TO_VALUE, model)) {
      return `Transaction '${getDisplayName(t.NAME, t.TYPE)}' to value '${
        t.TO_VALUE
      }' isn't a number or setting`;
    }
  }
  if (t.RECURRENCE.length > 0) {
    if (
      t.NAME.startsWith(pension) ||
      t.NAME.startsWith(pensionSS) ||
      t.NAME.startsWith(pensionDB)
    ) {
      return (
        `Pension transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )}' gets frequency from income, ` +
        `should not have recurrence '${t.RECURRENCE}' defined`
      );
    }

    const checkRec = checkRecurrence(t.RECURRENCE);
    if (checkRec !== '') {
      return `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ${checkRec}`;
    }
  }
  if (
    t.TYPE !== autogen &&
    t.TYPE !== custom &&
    t.TYPE !== liquidateAsset &&
    t.TYPE !== payOffDebt &&
    t.TYPE !== bondInvest &&
    t.TYPE !== bondMature &&
    t.TYPE !== revalueAsset &&
    t.TYPE !== revalueDebt &&
    t.TYPE !== revalueInc &&
    t.TYPE !== revalueExp &&
    t.TYPE !== revalueSetting
  ) {
    return (
      `Transaction '${getDisplayName(t.NAME, t.TYPE)}' ` +
      `type  ${t.TYPE} for ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} is not one of allowed types - internal bug`
    );
  }
  if (t.TYPE === autogen) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isAutogenType(t, model);
    if (!recognised) {
      log(`bad transaction ${showObj(t)} in model ${showObj(model)}`);
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' is not in a recognised auto-generated format`;
    }
  }
  if (t.TYPE === liquidateAsset) {
    const recognised = isLiquidateAssetType(t);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' has liquidating type not in a recognised format`;
    }
  }
  if (t.TYPE === payOffDebt) {
    const recognised = isPayOffDebtType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' has payoff debt type not in a recognised format`;
    }
  }
  if (t.TYPE === bondInvest) {
    if (t.FROM !== CASH_ASSET_NAME) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' may only invest in Bond from ${CASH_ASSET_NAME}`;
    }
    if (!t.FROM_VALUE.startsWith(bondMaturity)) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' investment in Bond needs ${bondMaturity} as start of from value`;
    }
    // The bondInvest value should be BMV + a setting which is revalued at least once
    // and all revalues finish before the date of the investment
    const trimmedFromValue = t.FROM_VALUE.substring(bondMaturity.length);
    // this should be the name of a setting
    const matchedSettings = model.settings.filter((s) => {
      return s.NAME === trimmedFromValue;
    });
    if (matchedSettings.length === 0) {
      /* istanbul ignore next */ // triggers Transaction 'from' value must be numbers or a setting
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' may only invest into Bond if there's a setting ${trimmedFromValue}`;
    } else if (matchedSettings.length > 1) {
      /* istanbul ignore next */ // don't expect duplicate settings
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' may only invest into Bond if there's a unique setting ${trimmedFromValue}`;
    }
    // This setting should be revalued and only revalued before the investment
    const matchedRevalues = model.transactions.filter((rev) => {
      if (rev.TYPE !== revalueSetting) {
        return false;
      }
      if (rev.TO !== trimmedFromValue) {
        return false;
      }
      return true;
    });
    if (matchedRevalues.length === 0) {
      return (
        `'${getDisplayName(
          t.NAME,
          t.TYPE,
        )}' may only invest into Bond if the setting ${trimmedFromValue} is revalued ` +
        `(so we capture the revalue date)`
      );
    }
    const tooLateRevalues = matchedRevalues.filter((late) => {
      return new Date(late.DATE) > new Date(t.DATE);
    });
    if (tooLateRevalues.length > 0) {
      return (
        `'${getDisplayName(
          t.NAME,
          t.TYPE,
        )}' may only invest into Bond if the setting ${trimmedFromValue} is not revalued ` +
        `after investment date`
      );
    }
  } else if (t.TYPE === bondMature) {
    if (!t.FROM_VALUE.startsWith(bondMaturity)) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' maturing Bond needs ${bondMaturity} as start of from value`;
    }
    const v = getVarVal(model.settings);
    // every bondMature transaction needs a partner bondInvest transaction.
    const invests = model.transactions.filter((tInvest) => {
      if (tInvest.TYPE !== bondInvest) {
        return false;
      }
      if (tInvest.FROM_VALUE !== t.FROM_VALUE) {
        return false;
      }
      if (tInvest.RECURRENCE !== t.RECURRENCE) {
        return false;
      }
      // log(`considering ${tInvest.NAME} as investment transaction...`);
      const md = getMaturityDate(
        new Date(getTriggerDate(tInvest.DATE, model.triggers, v)),
        tInvest.NAME,
      );
      const mdDS = dateAsString(DateFormatType.Data, md);
      const tDS = dateAsString(
        DateFormatType.Data,
        new Date(getTriggerDate(t.DATE, model.triggers, v)),
      );
      if (mdDS !== tDS) {
        // log(`maturity date = ${mdDS} !== ${tDS}`);
        return false;
      }
      if (tInvest.STOP_DATE !== '' || t.STOP_DATE !== '') {
        const sd = getMaturityDate(
          new Date(getTriggerDate(tInvest.STOP_DATE, model.triggers, v)),
          tInvest.NAME,
        );
        const sdDS = dateAsString(DateFormatType.Data, sd);
        const tsDS = dateAsString(
          DateFormatType.Data,
          new Date(getTriggerDate(t.STOP_DATE, model.triggers, v)),
        );
        if (sdDS !== tsDS) {
          // log(`stop date = ${sdDS} !== ${tsDS}`);
          return false;
        }
      }
      return true;
    });
    if (invests.length !== 1) {
      if (invests.length === 0) {
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )} bond maturation requires an investment`;
      } else {
        /* istanbul ignore next */ // don't test models with multiple investments
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )} bond maturation requires only one investment`;
      }
    }
  } else {
    // log(`checking ${t.NAME} for use of ${bondMaturity} out of context in ${t.FROM_VALUE}`);
    if (t.FROM_VALUE.startsWith(bondMaturity)) {
      // log(`from value begins ${bondMaturity}!`);
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' only ${bondInvest} and ${bondMature} types use ${bondMaturity}`;
    }
  }
  if (t.TYPE === revalueAsset) {
    const recognised = isRevalueAssetType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' revalue asset type of not in a recognised format`;
      //} else {
      //  log(`revalue asset type of Transaction '${getDisplayName(t.NAME, t.TYPE)}' is a recognised format`);
      //}
    }
  }
  if (t.TYPE === revalueDebt) {
    const recognised = isRevalueDebtType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' revalue debt type not in a recognised format`;
    }
  }
  if (t.TYPE === revalueInc) {
    const recognised = isRevalueIncomeType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' revalue income type not in a recognised format`;
    }
  }
  if (t.TYPE === revalueExp) {
    const recognised = isRevalueExpenseType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' revalue expense type not in a recognised format`;
    }
  }
  if (t.TYPE === revalueSetting) {
    const recognised = isRevalueSettingType(t, model);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' revalue setting type not in a recognised format`;
    }
  }
  if (t.TYPE === custom) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isCustomType(t);
    if (!recognised) {
      return `Transaction '${getDisplayName(
        t.NAME,
        t.TYPE,
      )}' custom type not in a recognised format`;
    }
  }

  const tToValue = parseFloat(t.TO_VALUE);
  const tFromValue = parseFloat(t.FROM_VALUE);
  // log(`transaction ${showObj(t)} appears OK`);
  if (!t.FROM_ABSOLUTE && tFromValue > 1.0) {
    /* istanbul ignore next */
    log(`WARNING : not-absolute value from ${tFromValue} > 1.0`);
  }
  if (!t.TO_ABSOLUTE) {
    const targetAsset = model.assets.find((a) => {
      return a.NAME === t.TO;
    });
    if (targetAsset) {
      const wordsAndNum = getNumberAndWordParts(targetAsset.VALUE);
      if (wordsAndNum.wordPart !== '') {
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )} we dont allow a proportional transaction to a word-valued asset`;
      }
    }
    const targetIncome = model.incomes.find((i) => {
      return i.NAME === t.TO;
    });
    if (targetIncome) {
      const wordsAndNum = getNumberAndWordParts(targetIncome.VALUE);
      if (wordsAndNum.wordPart !== '') {
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )} don't allow a proportional transaction to a word-valued income`;
      }
    }
    const targetExpense = model.expenses.find((i) => {
      return i.NAME === t.TO;
    });
    if (targetExpense) {
      const wordsAndNum = getNumberAndWordParts(targetExpense.VALUE);
      if (wordsAndNum.wordPart !== '') {
        return `Transaction '${getDisplayName(
          t.NAME,
          t.TYPE,
        )} don't allow a proportional transaction to a word-valued expense`;
      }
    }
  }

  if (
    !t.TO_ABSOLUTE &&
    tToValue > 1.0 &&
    !t.NAME.startsWith(pension) && // pensions can have employer contributions
    !t.NAME.startsWith(pensionSS) &&
    t.TYPE !== revalueAsset &&
    t.TYPE !== revalueExp &&
    t.TYPE !== revalueInc &&
    t.TYPE !== revalueSetting
  ) {
    /* istanbul ignore next */
    log(`WARNING : ${t.NAME} has not-absolute value to ${tToValue} > 1.0`);
  }
  // log(`checkTransaction is OK for ${t.NAME}`);
  return '';
}

function checkTriggerName(tName: string): string {
  if (tName.length === 0) {
    return 'Date name needs some characters';
  }
  if (tName === 'today') {
    return `Date ${tName} name prohibited as a special word`;
  }
  if (tName.includes('+')) {
    return `Date ${tName} cannot contain a '+' character`;
  }
  if (tName.includes('-')) {
    return `Date ${tName} cannot contain a '-' character`;
  }
  return '';
}

export function checkTrigger(t: Trigger, model: ModelData): string {
  // log(`check trigger ${showObj(t)}`);
  const nameCheck = checkTriggerName(t.NAME);
  if (nameCheck.length > 0) {
    return nameCheck;
  }
  if (!checkTriggerDate(t.DATE, model.triggers, getVarVal(model.settings))) {
    return `Date '${t.NAME}' is not valid : '${t.DATE}'`;
  }
  return '';
}
function checkSettingAbsent(settings: Setting[], name: string) {
  const vf = getSettings(settings, name, 'noneFound', false);
  if (vf !== 'noneFound') {
    return `"${name}" setting should not be present`;
  }
  return '';
}
function checkViewROI(settings: Setting[], triggers: Trigger[]) {
  // log(`check settings ${showObj(settings)}`);

  const start = getSettings(settings, roiStart, 'noneFound');
  if (start === 'noneFound') {
    return `"${roiStart}" should be present in settings (value is a date)`;
  }
  const startDate = checkTriggerDate(start, triggers, getVarVal(settings));
  if (startDate === undefined || !checkDate(startDate)) {
    return `Setting "${roiStart}" should be a valid date string (e.g. 1 April 2018)`;
  }

  const end = getSettings(settings, roiEnd, 'noneFound');
  if (end === 'noneFound') {
    return `"${roiEnd}" should be present in settings (value is a date)`;
  }

  const endDate = checkTriggerDate(end, triggers, getVarVal(settings));
  if (endDate === undefined || !checkDate(endDate)) {
    return `Setting "${roiEnd}" should be a valid date string (e.g. 1 April 2018)`;
  }

  if (endDate < startDate) {
    return `Setting "${roiEnd}" should be after setting "${roiStart}"`;
  }
  return '';
}

function checkDateOfBirth(settings: Setting[]): string {
  const dob = getSettings(settings, birthDate, '');
  if (dob === '') {
    return '';
  }
  const d = makeDateFromString(dob);
  if (!checkDate(d)) {
    return `Date of birth ${dob} should parse and be reasonable`;
  }
  return '';
}
function checkCpi(settings: Setting[]): string {
  const stringVal = getSettings(settings, cpi, '');
  const val = parseFloat(stringVal);
  if (Number.isNaN(val)) {
    return 'Setting for CPI should be a number';
  }
  return '';
}

function checkNames(model: ModelData): string {
  let names = model.assets.map((a) => {
    return a.NAME;
  });
  names = names.concat(
    model.incomes.map((a) => {
      return a.NAME;
    }),
    model.expenses.map((a) => {
      return a.NAME;
    }),
    model.transactions.map((a) => {
      return a.NAME;
    }),
    model.triggers.map((a) => {
      return a.NAME;
    }),
    model.settings.map((a) => {
      return a.NAME;
    }),
  );

  if (names.find((n) => n === 'base')) {
    return `'base' as name is reserved`;
  }

  const counts: Map<string, number> = names
    .filter((n) => {
      return !n.startsWith(pension);
    })
    .filter((n) => {
      return !n.startsWith(pensionTransfer);
    })
    .filter((n) => {
      return !n.startsWith(pensionDB);
    })
    .reduce((acc: Map<string, number>, b: string) => {
      const existingCount = acc.get(b);
      if (existingCount === undefined) {
        acc.set(b, 1);
      } else {
        acc.set(b, existingCount + 1);
      }
      return acc;
    }, new Map<string, number>());

  for (const [key, value] of counts) {
    // log(`key = ${key}, value = ${value}`);
    if (value > 1) {
      return `duplicate name ${key}`;
    }
  }
  return '';
}

export interface CheckResult {
  type: Context | undefined;
  itemName: string | undefined;
  message: string;
}

export function checkData(model: ModelData): CheckResult {
  if (model.name === 'Unnamed' || model.name === '') {
    return {
      type: undefined,
      itemName: undefined,
      message: `model name = '${model.name}'`,
    };
  }
  // log(`checking data ${showObj(model)}`);
  // log(`check settings`);
  let message = checkNames(model);
  if (message.length > 0) {
    return {
      type: undefined,
      itemName: undefined,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, viewFrequency);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: viewFrequency,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, viewDetail);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: viewDetail,
      message: message,
    };
  }
  message = checkViewROI(model.settings, model.triggers);
  if (message.length > 0) {
    return {
      type: undefined,
      itemName: undefined,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, chartViewType);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: chartViewType,
      message: message,
    };
  }
  message = checkDateOfBirth(model.settings);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: birthDate,
      message: message,
    };
  }
  message = checkCpi(model.settings);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: cpi,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, assetChartFocus);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: assetChartFocus,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, debtChartFocus);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: debtChartFocus,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, expenseChartFocus);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: expenseChartFocus,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, incomeChartFocus);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: incomeChartFocus,
      message: message,
    };
  }
  message = checkSettingAbsent(model.settings, taxChartFocusType);
  if (message.length > 0) {
    return {
      type: Context.Setting,
      itemName: taxChartFocusType,
      message: message,
    };
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
  // log(`check transactions`);
  for (const t of model.transactions) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTransaction(t, model);
    if (message.length > 0) {
      return {
        type: Context.Transaction,
        itemName: t.NAME,
        message: message,
      };
    }
  }
  // log(`check assets`);
  for (const a of model.assets) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkAsset(a, model);
    if (message.length > 0) {
      return {
        type: Context.Asset,
        itemName: a.NAME,
        message: message,
      };
    }
  }
  // log(`check incomes`);
  for (const i of model.incomes) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkIncome(i, model);
    if (message.length > 0) {
      return {
        type: Context.Income,
        itemName: i.NAME,
        message: message,
      };
    }
  }
  // log(`check expenses`);
  for (const e of model.expenses) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkExpense(e, model);
    if (message.length > 0) {
      return {
        type: Context.Expense,
        itemName: e.NAME,
        message: message,
      };
    }
  }
  // log(`check triggers`);
  for (const t of model.triggers) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTrigger(t, model);
    if (message.length > 0) {
      return {
        type: Context.Trigger,
        itemName: t.NAME,
        message: message,
      };
    }
  }
  return {
    type: undefined,
    itemName: undefined,
    message: '',
  };
}

export function checkEvalnType(
  evaln: Evaluation,
  nameToTypeMap: Map<string, string>,
) {
  // expect 'PurchaseAssetName' as valuation for cgt purposes
  if (evaln.name.startsWith(purchase)) {
    const evalnType = nameToTypeMap.get(evaln.name.substring(purchase.length));
    if (evalnType === evaluationType.asset) {
      // don't process this evaluation
      // it was just logged to track CGT liability
      return;
    }
    /* istanbul ignore next */
    if (evalnType === undefined) {
      /* istanbul ignore next */
      throw new Error(
        `BUG!! purchase evaluation of an unknown type: ${showObj(evaln)}`,
      );
      //return;
    }
    /* istanbul ignore next */
    log(`BUG!! Purchase of non-asset? : ${showObj(evaln)}`);
  } else if (evaln.name.startsWith(quantity)) {
    // expect 'quantity' as keeping track of discrete assets
    const evalnType = nameToTypeMap.get(evaln.name.substring(quantity.length));
    /* istanbul ignore else */
    if (evalnType === evaluationType.asset) {
      return;
    } else {
      log(`Error: unexpected map re evaln expense ${evaln.name}`);
    }
  } else if (evaln.name.startsWith(bondMaturity)) {
    // expect 'BMV' as keeping track of amounts for bonds maturing
    const shortenedName = evaln.name
      .substring(bondMaturity.length)
      .split(separator)[0];
    const evalnType = nameToTypeMap.get(shortenedName);
    /* istanbul ignore else */
    if (evalnType === evaluationType.setting) {
      return;
    } else {
      log(`Error: unexpected map re evaln name ${evaln.name}`);
    }
  } else {
    /* istanbul ignore next */
    throw new Error(`BUG!! evaluation of an unknown type: ${showObj(evaln)}`);
  }
}
