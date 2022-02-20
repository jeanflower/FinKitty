import {
  Item,
  Trigger,
  Income,
  Expense,
  Asset,
  Transaction,
  Setting,
  ModelData,
} from './types/interfaces';
import { log, printDebug, showObj } from './utils';

function diffItem(i1: Item, i2: Item): string {
  if (i1.NAME !== i2.NAME) {
    return `name ${i1.NAME}`;
  }
  return '';
}
function diffTriggers(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const t1 = it1 as Trigger;
  const t2 = it2 as Trigger;
  if (t1.DATE !== t2.DATE) {
    return `${it1.NAME}: date ${t1.DATE} !== ${t2.DATE}`;
  }
  return '';
}
function diffIncomes(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const i1 = it1 as Income;
  const i2 = it2 as Income;
  if (i1.START !== i2.START) {
    return `${it1.NAME}: start date ${i1.START} !== ${i2.START}`;
  }
  if (i1.END !== i2.END) {
    return `${it1.NAME}: end date ${i1.END} !== ${i2.END}`;
  }
  if (i1.VALUE !== i2.VALUE) {
    return `${it1.NAME}: value ${i1.VALUE} !== ${i2.VALUE}`;
  }
  if (i1.VALUE_SET !== i2.VALUE_SET) {
    return `${it1.NAME}: value set date ${i1.VALUE_SET} !== ${i2.VALUE_SET}`;
  }
  if (i1.GROWTH !== i2.GROWTH) {
    return `${it1.NAME}: growth ${i1.GROWTH} !== ${i2.GROWTH}`;
  }
  if (i1.CPI_IMMUNE !== i2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${i1.CPI_IMMUNE} !== ${i2.CPI_IMMUNE}`;
  }
  if (i1.LIABILITY !== i2.LIABILITY) {
    return `${it1.NAME}: liability ${i1.LIABILITY} !== ${i2.LIABILITY}`;
  }
  if (i1.CATEGORY !== i2.CATEGORY) {
    return `${it1.NAME}: category ${i1.CATEGORY} !== ${i2.CATEGORY}`;
  }
  return '';
}
function diffExpenses(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const e1 = it1 as Expense;
  const e2 = it2 as Expense;
  if (e1.START !== e2.START) {
    return `${it1.NAME}: start date ${e1.START} !== ${e2.START}`;
  }
  if (e1.END !== e2.END) {
    return `${it1.NAME}: end date ${e1.END} !== ${e2.END}`;
  }
  if (e1.VALUE !== e2.VALUE) {
    return `${it1.NAME}: value ${e1.VALUE} !== ${e2.VALUE}`;
  }
  if (e1.VALUE_SET !== e2.VALUE_SET) {
    return `${it1.NAME}: value set date ${e1.VALUE_SET} !== ${e2.VALUE_SET}`;
  }
  if (e1.GROWTH !== e2.GROWTH) {
    return `${it1.NAME}: growth ${e1.GROWTH} !== ${e2.VALUE}`;
  }
  if (e1.CPI_IMMUNE !== e2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${e1.CPI_IMMUNE} !== ${e2.CPI_IMMUNE}`;
  }
  if (e1.RECURRENCE !== e2.RECURRENCE) {
    return `${it1.NAME}: recurrence ${e1.RECURRENCE} !== ${e2.RECURRENCE}`;
  }
  if (e1.CATEGORY !== e2.CATEGORY) {
    return `${it1.NAME}: category ${e1.CATEGORY} !== ${e2.CATEGORY}`;
  }
  return '';
}
function diffAssets(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const a1 = it1 as Asset;
  const a2 = it2 as Asset;
  if (a1.START !== a2.START) {
    return `${it1.NAME}: start date ${a1.START} !== ${a2.START}`;
  }
  if (a1.VALUE !== a2.VALUE) {
    return `${it1.NAME}: value ${a1.VALUE} !== ${a2.START}`;
  }
  if (a1.QUANTITY !== a2.QUANTITY) {
    return `${it1.NAME}: quantity ${a1.QUANTITY} !== ${a2.START}`;
  }
  if (a1.CAN_BE_NEGATIVE !== a2.CAN_BE_NEGATIVE) {
    return `${it1.NAME}: negativity ${a1.CAN_BE_NEGATIVE} !== ${a2.CAN_BE_NEGATIVE}`;
  }
  if (a1.IS_A_DEBT !== a2.IS_A_DEBT) {
    return `${it1.NAME}: is-debt ${a1.IS_A_DEBT} !== ${a2.IS_A_DEBT}`;
  }
  if (a1.GROWTH !== a2.GROWTH) {
    return `${it1.NAME}: growth ${a1.GROWTH} !== ${a2.GROWTH}`;
  }
  if (a1.CPI_IMMUNE !== a2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${a1.CPI_IMMUNE} !== ${a2.CPI_IMMUNE}`;
  }
  if (a1.PURCHASE_PRICE !== a2.PURCHASE_PRICE) {
    return `${it1.NAME}: purchase price ${a1.PURCHASE_PRICE} !== ${a2.PURCHASE_PRICE}`;
  }
  if (a1.CATEGORY !== a2.CATEGORY) {
    return `${it1.NAME}: category ${a1.CATEGORY} !== ${a2.CATEGORY}`;
  }
  return '';
}

function diffTransactions(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const t1 = it1 as Transaction;
  const t2 = it2 as Transaction;
  if (t1.DATE !== t2.DATE) {
    return `${it1.NAME}: date ${t1.DATE} !== ${t2.DATE}`;
  }
  if (t1.STOP_DATE !== t2.STOP_DATE) {
    return `${it1.NAME}: end date ${t1.STOP_DATE} !== ${t2.STOP_DATE}`;
  }
  if (t1.TO !== t2.TO) {
    return `${it1.NAME}: to ${t1.TO} !== ${t2.DATE}`;
  }
  if (t1.TO_VALUE !== t2.TO_VALUE) {
    return `${it1.NAME}: to value ${t1.TO_VALUE} !== ${t2.TO_VALUE}`;
  }
  if (t1.FROM !== t2.FROM) {
    return `${it1.NAME}: from ${t1.FROM} !== ${t2.FROM}`;
  }
  if (t1.FROM_ABSOLUTE !== t2.FROM_ABSOLUTE) {
    return `${it1.NAME}: from absolute date ${t1.FROM_ABSOLUTE} !== ${t2.FROM_ABSOLUTE}`;
  }
  if (t1.FROM_VALUE !== t2.FROM_VALUE) {
    //log(`${showObj(t1)}, \n${showObj(t2)}`); // Sometimes 0 and 0.0...
    return `${it1.NAME}: from value ${t1.FROM_VALUE} !== ${t2.FROM_VALUE}`;
  }
  if (t1.TO_ABSOLUTE !== t2.TO_ABSOLUTE) {
    return `${it1.NAME}: to absolute ${t1.TO_ABSOLUTE} !== ${t2.TO_ABSOLUTE}`;
  }
  if (t1.TYPE !== t2.TYPE) {
    return `${it1.NAME}: type ${t1.TYPE} !== ${t2.TYPE}`;
  }
  if (t1.RECURRENCE !== t2.RECURRENCE) {
    return `${it1.NAME}: recurrence ${t1.RECURRENCE} !== ${t2.RECURRENCE}`;
  }
  if (t1.CATEGORY !== t2.CATEGORY) {
    return `${it1.NAME}: category ${t1.CATEGORY} !== ${t2.CATEGORY}`;
  }
  return '';
}
function diffSettings(it1: Item, it2: Item): string {
  const s = diffItem(it1, it2);
  if (s.length > 0) {
    return s;
  }
  const s1 = it1 as Setting;
  const s2 = it2 as Setting;
  if (s1.VALUE !== s2.VALUE) {
    return `${it1.NAME}: value ${s1.VALUE} !== ${s1.NAME}`;
  }
  if (s1.HINT !== s2.HINT) {
    return `${it1.NAME}: hint ${s1.HINT} !== ${s1.HINT}`;
  }
  if (s1.TYPE !== s2.TYPE) {
    return `${it1.NAME}: type ${s1.TYPE} !== ${s1.TYPE}`;
  }
  return '';
}
function diffItems(
  is1: Item[],
  is2: Item[],
  diffFn: (i1: Item, i2: Item, quickExit: boolean) => string,
  quickExit: boolean,
  model1Name: string,
  model2Name: string,
): string[] {
  // log(`diffItems between ${showObj(is1)} and ${showObj(is2)}`);

  const matchedNames: string[] = [];
  const result: string[] = [];
  for (const i1 of is1) {
    if (result.length > 0 && quickExit) {
      break;
    }
    const matchedItems = is2.filter((i2) => {
      // log(`compare ${i1.NAME} and ${i2.NAME}`);
      return i1.NAME === i2.NAME;
    });
    if (matchedItems.length === 0) {
      result.push(`${i1.NAME} in ${model1Name} but not in ${model2Name}`);
    } else if (matchedItems.length > 1) {
      result.push(`duplicated name ${i1.NAME} present in ${model2Name}`);
    } else {
      const s = diffFn(i1, matchedItems[0], quickExit);
      // log(`comparison of ${i1.NAME} found diff ${s}`);
      if (s.length > 0) {
        result.push(s);
        if (quickExit) {
          break;
        }
      } else {
        matchedNames.push(i1.NAME);
      }
    }
  }
  if (result.length > 0 && quickExit) {
    return result;
  }
  if (printDebug()) {
    log(`matchedNames = ${showObj(matchedNames)}`);
  }
  if (!quickExit || result.length === 0) {
    is2.forEach((i2) => {
      if (
        matchedNames.find((m) => {
          return m === i2.NAME;
        })
      ) {
        return;
      }
      result.push(`${i2.NAME} is in ${model2Name} but not in ${model1Name}`);
    });
  }
  return result;
}

export function diffModels(
  m1: ModelData | undefined,
  m2: ModelData | undefined,
  quickExit: boolean,
  model1Name: string,
  model2Name: string,
): string[] {
  // log(`diff models ${m1} and ${m2}`);
  if (m1 === undefined) {
    if (m2 === undefined) {
      return [];
    } else {
      return [`one model undefined, other defined`];
    }
  } else if (m2 === undefined) {
    return [`one model defined, other undefined`];
  }
  let s = diffItems(
    m1.triggers,
    m2.triggers,
    diffTriggers,
    quickExit,
    model1Name,
    model2Name,
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  s = s.concat(
    diffItems(
      m1.incomes,
      m2.incomes,
      diffIncomes,
      quickExit,
      model1Name,
      model2Name,
    ),
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  s = s.concat(
    diffItems(
      m1.expenses,
      m2.expenses,
      diffExpenses,
      quickExit,
      model1Name,
      model2Name,
    ),
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  s = s.concat(
    diffItems(
      m1.assets,
      m2.assets,
      diffAssets,
      quickExit,
      model1Name,
      model2Name,
    ),
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  s = s.concat(
    diffItems(
      m1.transactions,
      m2.transactions,
      diffTransactions,
      quickExit,
      model1Name,
      model2Name,
    ),
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  s = s.concat(
    diffItems(
      m1.settings,
      m2.settings,
      diffSettings,
      quickExit,
      model1Name,
      model2Name,
    ),
  );
  if (s.length > 0 && quickExit) {
    return s;
  }
  return s;
}
