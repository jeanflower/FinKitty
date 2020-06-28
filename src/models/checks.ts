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
  CASH_ASSET_NAME,
  conditional,
  pensionSS,
  pensionDB,
  pensionTransfer,
  debtChartFocus,
  quantity,
  total,
  autogen,
  custom,
  liquidateAsset,
  payOffDebt,
  crystallizedPension,
  revalueAsset,
  revalueDebt,
  revalueInc,
  revalueExp,
  revalueSetting,
} from '../localization/stringConstants';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  Evaluation,
} from '../types/interfaces';
import {
  checkTriggerDate,
  getSettings,
  getTriggerDate,
  log,
  showObj,
  makeDateFromString,
  isADebt,
  isAnIncome,
  isAnAssetOrAssets,
  isAnExpense,
  getNumberAndWordParts,
} from '../utils';
import { getDisplayName } from '../views/tablePages';

export function isNumberString(input: string) {
  if (input === '' || input === undefined) {
    return false;
  }
  const re = new RegExp('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$');
  const result = input.replace(re, '');
  return result === '';
}
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
      (as.NAME === word || as.CATEGORY === word) &&
      getTriggerDate(as.START, triggers) <= getTriggerDate(date, triggers),
  );
  if (a !== undefined) {
    return true;
  }

  // log(`name = ${name} and transaction from word ${word}`);
  // maybe t.FROM is the name of an income
  let i = incomes.find(
    is =>
      is.NAME === word &&
      (name.startsWith(pensionDB) ||
        name.startsWith(pensionSS) ||
        getTriggerDate(is.START, triggers) <= getTriggerDate(date, triggers)),
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
    d < makeDateFromString('1 Jan 1870') ||
    d > makeDateFromString('1 Jan 2199')
  ) {
    return false;
  }
  return true;
}
export function checkAssetLiability(l: string) {
  if (l.length > 0 && !l.endsWith(cgt) && !l.endsWith(incomeTax)) {
    return `Asset liability ${l} should end with ${cgt} or ${incomeTax}`;
  }
  return '';
}

export function isValidValue(value: string, model: DbModelData): boolean {
  if (isNumberString(value)) {
    return true;
  }

  const parsed = getNumberAndWordParts(value);
  if (parsed.wordPart !== undefined) {
    const settingVal = getSettings(model.settings, parsed.wordPart, 'missing');
    if (settingVal !== 'missing') {
      // log(`guess setting ${settingVal} makes sense for a value...`);
      return true; // still a guess as we don't know...
    }
  }
  return false;
}

export function checkAsset(a: DbAsset, model: DbModelData): string {
  // log(`checkAsset ${showObj(a)}`);
  if (a.NAME.length === 0) {
    return 'Asset name needs some characters';
  }
  if (a.NAME.split(separator).length !== 1) {
    return `Asset name '${a.NAME}' should not contain '${separator}'`;
  }
  const val = parseFloat(a.VALUE);
  // log(`asset value is ${val}`);
  if (val < 0 && !a.CAN_BE_NEGATIVE) {
    return `Asset '${a.NAME}' can't be negative but has negative value '${a.VALUE}'`;
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

  if (!isNumberString(a.GROWTH)) {
    const settingVal = getSettings(model.settings, a.GROWTH, 'missing');
    if (settingVal === 'missing') {
      return `Asset growth set to '${a.GROWTH}'
        but no corresponding setting found`;
    }
    if (!isNumberString(settingVal)) {
      return `Asset growth set to '${a.GROWTH}'
        but corresponding setting not a number`;
    }
  }

  if (!isValidValue(a.VALUE, model)) {
    return `Asset value set to '${a.VALUE}'
      but no corresponding setting found`;
  }

  if (!isNumberString(a.PURCHASE_PRICE)) {
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
    !l.endsWith(incomeTax) &&
    !l.endsWith(nationalInsurance)
  ) {
    return (
      `Income liability '${l}' should end with ` +
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
  if (parts.length > 3) {
    return (
      `Income liability for '${i.NAME}' has parts '${parts}' ` +
      `but should contain at most two parts`
    );
  }
  let incomeTaxName = '';
  let niName = '';
  for (const l of parts) {
    /* eslint-disable-line no-restricted-syntax */
    if (
      l.length > 0 &&
      !l.endsWith(incomeTax) &&
      !l.endsWith(nationalInsurance)
    ) {
      const x = checkIncomeLiability(l);
      if (x.length > 0) {
        return (
          `Income liability for '${i.NAME}' has parts '${parts}' ` +
          `but the part '${l}' should end with ` +
          `'${incomeTax}' or '${nationalInsurance}'`
        );
      }
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
  if (!isNumberString(i.VALUE)) {
    return `Income value '${i.VALUE}' is not a number`;
  }
  if (!isNumberString(i.GROWTH)) {
    return `Income growth '${i.GROWTH}' is not a number`;
  }
  const startDate = checkTriggerDate(i.START, model.triggers);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Income start date doesn't make sense : ${showObj(i.START)}`;
  }
  const cashAssets = model.assets.filter(m => {
    return m.NAME === CASH_ASSET_NAME;
  });
  if (cashAssets.length > 0) {
    const cashStarts = getTriggerDate(cashAssets[0].START, model.triggers);
    if (startDate < cashStarts) {
      return `Income start date must be after cash starts; ${cashStarts.toDateString()}`;
    }
  }
  const taxAssets = model.assets.filter(m => {
    return m.NAME === taxPot;
  });
  if (taxAssets.length > 0) {
    const taxStarts = getTriggerDate(taxAssets[0].START, model.triggers);
    if (startDate < taxStarts) {
      return `Income start date must be after taxPot starts; ${taxAssets[0].START}`;
    }
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
  return '';
}

function checkRecurrence(rec: string) {
  const lastChar = rec.substring(rec.length - 1);
  // log(`lastChar of ${rec} = ${lastChar}`);
  if (!(lastChar === 'm' || lastChar === 'y')) {
    return `transaction recurrence '${rec}' must end in m or y`;
  }
  const firstPart = rec.substring(0, rec.length - 1);
  // log(`firstPart of ${rec} = ${firstPart}`);

  const val = parseFloat(firstPart);
  // log(`val from ${rec} = ${val}`);
  if (Number.isNaN(val)) {
    return `transaction recurrence '${rec}' must be a number ending in m or y`;
  }
  return '';
}

export function checkExpense(e: DbExpense, model: DbModelData): string {
  if (e.NAME.length === 0) {
    return 'Expense name needs some characters';
  }
  if (!isNumberString(e.VALUE)) {
    return `Expense value '${e.VALUE}' is not a number`;
  }
  if (!isNumberString(e.GROWTH)) {
    return `Expense growth '${e.GROWTH}' is not a number`;
  }
  const startDate = checkTriggerDate(e.START, model.triggers);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Expense start date doesn't make sense :
      ${showObj(e.START)}`;
  }
  const valueSetDate = checkTriggerDate(e.VALUE_SET, model.triggers);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Expense value set date doesn't make sense :
      ${showObj(e.VALUE_SET)}`;
  }
  const endDate = checkTriggerDate(e.END, model.triggers);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Expense end date doesn't make sense :
      ${showObj(e.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Expense value must be set on or before the start of the income.
      Here, start is ${startDate.toDateString()} and
      value is set ${valueSetDate.toDateString()}.`;
  }
  const checkRec = checkRecurrence(e.RECURRENCE);
  if (checkRec !== '') {
    return checkRec;
  }
  return '';
}

function checkTransactionTo(
  word: string,
  t: DbTransaction,
  assetsForChecking: DbAsset[],
  incomes: DbIncome[],
  expenses: DbExpense[],
  triggers: DbTrigger[],
  settings: DbSetting[],
) {
  const a = assetsForChecking.find(
    as => as.NAME === word || as.CATEGORY === word,
  );
  if (a !== undefined) {
    if (t.NAME.startsWith(pensionDB)) {
      return `Transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} should have TO an income not an asset : ${a.NAME}`;
    }
    if (getTriggerDate(a.START, triggers) > getTriggerDate(t.DATE, triggers)) {
      return (
        `Transaction ${getDisplayName(t.NAME, t.TYPE)} dated before start ` +
        `of affected asset : ${a.NAME}`
      );
    }
    return '';
  }

  const i = incomes.find(ic => ic.NAME === word);
  if (i !== undefined) {
    if (
      !t.NAME.startsWith(revalue) &&
      !t.NAME.startsWith(pensionDB) &&
      !t.NAME.startsWith(pensionTransfer)
    ) {
      return (
        `Transactions to incomes must begin '${revalue}' ` +
        `or '${pensionDB} or ${pensionTransfer}`
      );
    }
    if (t.NAME.startsWith(pensionDB)) {
      if (!i.NAME.startsWith(pensionDB)) {
        return `Transaction ${getDisplayName(
          t.NAME,
          t.TYPE,
        )} must have TO income ${t.TO} named starting ${pensionDB}`;
      }
    }
    // transacting on an income - check dates
    if (!t.NAME.startsWith(pensionDB)) {
      if (
        getTriggerDate(i.START, triggers) > getTriggerDate(t.DATE, triggers)
      ) {
        return (
          `Transaction ${getDisplayName(t.NAME, t.TYPE)} dated before start ` +
          `of affected income : ${i.NAME}`
        );
      }
    }
    return '';
  }

  const exp = expenses.find(e => e.NAME === word);
  if (exp !== undefined) {
    // transacting on an expense - must be a revaluation
    if (!t.NAME.startsWith(revalue)) {
      return `Transactions to expenses must begin '${revalue}'`;
    }
    // transacting on an expense - check dates
    if (
      getTriggerDate(exp.START, triggers) > getTriggerDate(t.DATE, triggers)
    ) {
      return (
        `Transaction ${getDisplayName(t.NAME, t.TYPE)} dated before start ` +
        `of affected expense : ${exp.NAME}`
      );
    }
    return '';
  }

  const s = settings.find(s => s.NAME === word);
  if (s !== undefined) {
    // transacting on an setting - must be a revaluation
    if (!t.NAME.startsWith(revalue)) {
      return `Transactions to setting must begin '${revalue}'`;
    }
    return '';
  }
  return `Transaction ${getDisplayName(
    t.NAME,
    t.TYPE,
  )} to unrecognised thing : ${word}`;
}

function isAutogenType(t: DbTransaction, model: DbModelData) {
  // log(`check transaction ${getDisplayName(t.NAME, t.TYPE)}`);
  let recognised = false;
  /*
    const contributions: DbTransaction = {
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
      NAME: 'MoveTaxFreePart' + this.state.NAME,
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
    t.NAME.startsWith('MoveTaxFreePart') &&
    t.FROM.startsWith(pension) &&
    t.FROM_ABSOLUTE === false &&
    t.TO.endsWith('TaxFree') &&
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
  }
  /*
    Transfer DB pension
        transfer = {
          NAME: 'Transfer' + crystallizedPension + this.state.NAME,
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
    t.NAME.startsWith('Transfer' + crystallizedPension) &&
    t.FROM.startsWith(crystallizedPension) &&
    // asNumber(t.FROM_VALUE) === 1.0 &&
    t.FROM_ABSOLUTE === false &&
    t.TO.startsWith(crystallizedPension) &&
    t.RECURRENCE === ''
  ) {
    recognised = true;
    /*
  } else {
    log(`t.NAME.startsWith('Transfer'+crystallizedPension) = ${t.NAME.startsWith('transfer'+crystallizedPension)}`);
    log(`t.FROM.startsWith(crystallizedPension) = ${t.FROM.startsWith(crystallizedPension)}`);
    log(`t.FROM_ABSOLUTE === false = ${t.FROM_ABSOLUTE === false}`);
    log(`t.TO.startsWith(crystallizedPension) = ${t.TO.startsWith(crystallizedPension)}`);
    log(`t.RECURRENCE === '' = ${t.RECURRENCE === ''}`);
*/
  }

  /*
      const pensionDbctran1: DbTransaction = {
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
    t.TO === t.NAME &&
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
  return recognised;
}

function isLiquidateAssetType(t: DbTransaction) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (t.NAME.startsWith(conditional) && t.TO === CASH_ASSET_NAME) {
    recognised = true;
  }
  return recognised;
}

function isRevalueDebtType(t: DbTransaction, model: DbModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isADebt(t.TO, model) &&
    t.RECURRENCE === '' &&
    t.CATEGORY === ''
  ) {
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

function isRevalueAssetType(t: DbTransaction, model: DbModelData) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isAnAssetOrAssets(t.TO, model) &&
    t.RECURRENCE === '' &&
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

function isRevalueIncomeType(t: DbTransaction, model: DbModelData) {
  // log(`check transaction ${getDisplayName(t.NAME, t.TYPE)}`);
  let recognised = false;
  if (
    t.NAME.startsWith(revalue) &&
    isAnIncome(t.TO, model) &&
    t.RECURRENCE === '' &&
    t.CATEGORY === ''
  ) {
    recognised = true;
  }
  return recognised;
}

function isRevalueExpenseType(t: DbTransaction, model: DbModelData) {
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

function isCustomType(t: DbTransaction) {
  // log(`check transaction ${t.NAME}`);
  let recognised = false;
  if (
    !t.NAME.startsWith(conditional) &&
    !t.NAME.startsWith(crystallizedPension) &&
    !t.NAME.startsWith(pensionDB) &&
    //!t.NAME.startsWith(pensionSS) &&
    !t.NAME.startsWith(revalue)
  ) {
    recognised = true;
  }
  if (!recognised && t.NAME.startsWith(revalue)) {
    recognised = true;
  }
  return recognised;
}

function isPayOffDebtType(t: DbTransaction, model: DbModelData) {
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

export function checkTransaction(t: DbTransaction, model: DbModelData): string {
  // log(`checking transaction ${showObj(t)}`);
  const { assets, incomes, expenses, triggers, settings } = model;
  const assetsForChecking = assets.filter(a => a.NAME !== taxPot);
  if (t.NAME.length === 0) {
    return 'Transaction name needs some characters';
  }
  if (t.NAME.startsWith(conditional) && t.TO === '') {
    return 'conditional transactions need a To asset defined';
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
    } else if (!isNumberString(t.FROM_VALUE)) {
      return `Transaction from value ${t.FROM_VALUE} isn't a number`;
    }
  }
  if (t.TO !== '') {
    if (t.NAME.startsWith(revalue)) {
      const words = t.TO.split(separator);
      for (let idx = 0; idx < words.length; idx += 1) {
        const w = words[idx];
        const outcome = checkTransactionTo(
          w,
          t,
          assetsForChecking,
          incomes,
          expenses,
          triggers,
          settings,
        );
        if (outcome.length > 0) {
          return outcome;
        }
      }
    } else {
      const outcome = checkTransactionTo(
        t.TO,
        t,
        assetsForChecking,
        incomes,
        expenses,
        triggers,
        settings,
      );
      if (outcome.length > 0) {
        return outcome;
      }
    }
    if (t.TO_VALUE === '') {
      return `Transaction to ${t.TO} needs a non-empty to value`;
    } else if (!isValidValue(t.TO_VALUE, model)) {
      return `Transaction to value ${t.TO_VALUE} isn't a number or setting`;
    }
  }
  if (t.RECURRENCE.length > 0) {
    if (
      t.NAME.startsWith(pension) ||
      t.NAME.startsWith(pensionSS) ||
      t.NAME.startsWith(pensionDB)
    ) {
      return (
        `Pension transaction ${getDisplayName(
          t.NAME,
          t.TYPE,
        )} gets frequency from income, ` +
        `should not have recurrence ${t.RECURRENCE} defined`
      );
    }

    const checkRec = checkRecurrence(t.RECURRENCE);
    if (checkRec !== '') {
      return checkRec;
    }
  }
  if (
    t.TYPE !== autogen &&
    t.TYPE !== custom &&
    t.TYPE !== liquidateAsset &&
    t.TYPE !== payOffDebt &&
    t.TYPE !== revalueAsset &&
    t.TYPE !== revalueDebt &&
    t.TYPE !== revalueInc &&
    t.TYPE !== revalueExp &&
    t.TYPE !== revalueSetting
  ) {
    return `transaction type  ${t.TYPE} for ${getDisplayName(
      t.NAME,
      t.TYPE,
    )} is not one of allowed types - internal bug`;
  }
  if (t.TYPE === autogen) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isAutogenType(t, model);
    if (!recognised) {
      return `autogenerated type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === liquidateAsset) {
    const recognised = isLiquidateAssetType(t);
    if (!recognised) {
      return `liquidating type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === payOffDebt) {
    const recognised = isPayOffDebtType(t, model);
    if (!recognised) {
      return `payoff debt type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === revalueAsset) {
    const recognised = isRevalueAssetType(t, model);
    if (!recognised) {
      return `revalue asset type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
      //} else {
      //  log(`revalue asset type of transaction ${getDisplayName(t.NAME, t.TYPE)} is a recognised format`);
      //}
    }
  }
  if (t.TYPE === revalueDebt) {
    const recognised = isRevalueDebtType(t, model);
    if (!recognised) {
      return `revalue debt type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === revalueInc) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isRevalueIncomeType(t, model);
    if (!recognised) {
      return `revalue income type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === revalueExp) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isRevalueExpenseType(t, model);
    if (!recognised) {
      return `revalue expense type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }
  if (t.TYPE === custom) {
    // there are a known set of type of
    // autogenerated transactions - we should be one of these
    const recognised = isCustomType(t);
    if (!recognised) {
      return `custom type of transaction ${getDisplayName(
        t.NAME,
        t.TYPE,
      )} not a recognised format`;
    }
  }

  const tToValue = parseFloat(t.TO_VALUE);
  const tFromValue = parseFloat(t.FROM_VALUE);
  // log(`transaction ${showObj(t)} appears OK`);
  if (!t.FROM_ABSOLUTE && tFromValue > 1.0) {
    log(`WARNING : not-absolute value from ${tFromValue} > 1.0`);
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
    log(`WARNING : ${t.NAME} has not-absolute value to ${tToValue} > 1.0`);
  }
  // log(`checkTransaction is OK for ${t.NAME}`);
  return '';
}

export function checkTrigger(t: DbTrigger): string {
  // log(`check trigger ${showObj(t)}`);
  if (t.NAME.length === 0) {
    return 'Date name needs some characters';
  }
  if (!checkDate(t.DATE)) {
    return `Your important date is not valid : ${t.DATE}`;
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
      vf.substring(0, 4).toLowerCase() !== fine.substring(0, 4).toLowerCase() &&
      vf.substring(0, 4).toLowerCase() !== total.substring(0, 4).toLowerCase()
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
  const startDate = makeDateFromString(start);
  if (Number.isNaN(startDate.getTime())) {
    return `Setting "${roiStart}" should be a valid date string (e.g. 1 April 2018)`;
  }
  const end = getSettings(settings, roiEnd, 'noneFound');
  if (end === 'noneFound') {
    return `"${roiEnd}" should be present in settings (value is a date)`;
  }
  const endDate = makeDateFromString(end);
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
function checkCpi(settings: DbSetting[]): string {
  const stringVal = getSettings(settings, cpi, '');
  const val = parseFloat(stringVal);
  if (Number.isNaN(val)) {
    return 'Setting for CPI should be a number';
  }
  return '';
}
function checkAssetChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, assetChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.assets.filter(
      a => !a.IS_A_DEBT && (a.NAME === val || a.CATEGORY === val),
    ).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${assetChartFocus}' should be '${allItems}'` +
    ` or one of the asset names or one of the asset categories (not ${val})`
  );
}
function checkDebtChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, debtChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.assets.filter(
      a => a.IS_A_DEBT && (a.NAME === val || a.CATEGORY === val),
    ).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${debtChartFocus}' should be '${allItems}'` +
    ` or one of the debt names or one of the debt categories (not ${val})`
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
  // log(`checking data ${showObj(model)}`);
  // log(`check settings`);
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
  message = checkAssetChartFocus(model);
  if (message.length > 0) {
    return message;
  }
  message = checkDebtChartFocus(model);
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
  // log(`check transactions`);
  for (const t of model.transactions) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTransaction(t, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check assets`);
  for (const a of model.assets) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkAsset(a, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check incomes`);
  for (const i of model.incomes) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkIncome(i, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check expenses`);
  for (const e of model.expenses) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkExpense(e, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check triggers`);
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
    // TODO codify Purchase as a const string
    const evalnType = nameToTypeMap.get(evaln.name.substr(8)); // TODO 8 = length purchase
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
  } else if (evaln.name.startsWith(quantity)) {
    // expect 'quantity' as keeping track of discrete assets
    const evalnType = nameToTypeMap.get(evaln.name.substr(quantity.length));
    if (evalnType === evaluationType.asset) {
      // don't process this evaluation
      // it was just logged to track CGT liability
      return;
    }
  } else {
    log(`BUG!!! evaluation of an unknown type: ${showObj(evaln)}`);
  }
}
