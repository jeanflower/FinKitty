import {
  Item,
  Trigger,
  Income,
  Expense,
  Asset,
  Transaction,
  Setting,
  ModelData,
} from '../types/interfaces';
import { log, printDebug, showObj } from '../utils/utils';

function diffTriggers(it1: Item, it2: Item): string {
  const i1 = it1 as Trigger;
  const i2 = it2 as Trigger;
  if (i1.DATE !== i2.DATE) {
    return `${it1.NAME}: date ${i1.DATE} !== ${i2.DATE}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
  }
  return '';
}
function diffIncomes(it1: Item, it2: Item): string {
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
  if (i1.CPI_IMMUNE !== i2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${i1.CPI_IMMUNE} !== ${i2.CPI_IMMUNE}`;
  }
  if (i1.LIABILITY !== i2.LIABILITY) {
    return `${it1.NAME}: liability ${i1.LIABILITY} !== ${i2.LIABILITY}`;
  }
  if (i1.CATEGORY !== i2.CATEGORY) {
    return `${it1.NAME}: category ${i1.CATEGORY} !== ${i2.CATEGORY}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
  }

  return '';
}
function diffExpenses(it1: Item, it2: Item): string {
  const i1 = it1 as Expense;
  const i2 = it2 as Expense;
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
  if (i1.CPI_IMMUNE !== i2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${i1.CPI_IMMUNE} !== ${i2.CPI_IMMUNE}`;
  }
  if (i1.RECURRENCE !== i2.RECURRENCE) {
    return `${it1.NAME}: recurrence ${i1.RECURRENCE} !== ${i2.RECURRENCE}`;
  }
  if (i1.CATEGORY !== i2.CATEGORY) {
    return `${it1.NAME}: category ${i1.CATEGORY} !== ${i2.CATEGORY}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
  }

  return '';
}
function diffAssets(it1: Item, it2: Item): string {
  const i1 = it1 as Asset;
  const i2 = it2 as Asset;
  if (i1.START !== i2.START) {
    return `${it1.NAME}: start date ${i1.START} !== ${i2.START}`;
  }
  if (i1.VALUE !== i2.VALUE) {
    return `${it1.NAME}: value ${i1.VALUE} !== ${i2.VALUE}`;
  }
  if (i1.QUANTITY !== i2.QUANTITY) {
    return `${it1.NAME}: quantity ${i1.QUANTITY} !== ${i2.QUANTITY}`;
  }
  if (i1.CAN_BE_NEGATIVE !== i2.CAN_BE_NEGATIVE) {
    return `${it1.NAME}: negativity ${i1.CAN_BE_NEGATIVE} !== ${i2.CAN_BE_NEGATIVE}`;
  }
  if (i1.IS_A_DEBT !== i2.IS_A_DEBT) {
    return `${it1.NAME}: is-debt ${i1.IS_A_DEBT} !== ${i2.IS_A_DEBT}`;
  }
  if (i1.GROWTH !== i2.GROWTH) {
    return `${it1.NAME}: growth ${i1.GROWTH} !== ${i2.GROWTH}`;
  }
  if (i1.CPI_IMMUNE !== i2.CPI_IMMUNE) {
    return `${it1.NAME}: cpi-immunity ${i1.CPI_IMMUNE} !== ${i2.CPI_IMMUNE}`;
  }
  if (i1.PURCHASE_PRICE !== i2.PURCHASE_PRICE) {
    return `${it1.NAME}: purchase price ${i1.PURCHASE_PRICE} !== ${i2.PURCHASE_PRICE}`;
  }
  if (i1.CATEGORY !== i2.CATEGORY) {
    return `${it1.NAME}: category ${i1.CATEGORY} !== ${i2.CATEGORY}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
  }

  return '';
}

function diffTransactions(it1: Item, it2: Item): string {
  const i1 = it1 as Transaction;
  const i2 = it2 as Transaction;
  if (i1.DATE !== i2.DATE) {
    return `${it1.NAME}: date ${i1.DATE} !== ${i2.DATE}`;
  }
  if (i1.STOP_DATE !== i2.STOP_DATE) {
    return `${it1.NAME}: end date ${i1.STOP_DATE} !== ${i2.STOP_DATE}`;
  }
  if (i1.TO !== i2.TO) {
    return `${it1.NAME}: to ${i1.TO} !== ${i2.TO}`;
  }
  if (i1.TO_VALUE !== i2.TO_VALUE) {
    return `${it1.NAME}: to value ${i1.TO_VALUE} !== ${i2.TO_VALUE}`;
  }
  if (i1.FROM !== i2.FROM) {
    return `${it1.NAME}: from ${i1.FROM} !== ${i2.FROM}`;
  }
  if (i1.FROM_ABSOLUTE !== i2.FROM_ABSOLUTE) {
    return `${it1.NAME}: from absolute ${i1.FROM_ABSOLUTE} !== ${i2.FROM_ABSOLUTE}`;
  }
  if (i1.FROM_VALUE !== i2.FROM_VALUE) {
    //log(`${showObj(t1)}, \n${showObj(t2)}`); // Sometimes 0 and 0.0...
    return `${it1.NAME}: from value ${i1.FROM_VALUE} !== ${i2.FROM_VALUE}`;
  }
  if (i1.TO_ABSOLUTE !== i2.TO_ABSOLUTE) {
    return `${it1.NAME}: to absolute ${i1.TO_ABSOLUTE} !== ${i2.TO_ABSOLUTE}`;
  }
  if (i1.TYPE !== i2.TYPE) {
    return `${it1.NAME}: type ${i1.TYPE} !== ${i2.TYPE}`;
  }
  if (i1.RECURRENCE !== i2.RECURRENCE) {
    return `${it1.NAME}: recurrence ${i1.RECURRENCE} !== ${i2.RECURRENCE}`;
  }
  if (i1.CATEGORY !== i2.CATEGORY) {
    return `${it1.NAME}: category ${i1.CATEGORY} !== ${i2.CATEGORY}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
  }

  return '';
}
function diffSettings(it1: Item, it2: Item): string {
  const i1 = it1 as Setting;
  const i2 = it2 as Setting;
  if (i1.VALUE !== i2.VALUE) {
    return `${it1.NAME}: value ${i1.VALUE} !== ${i2.VALUE}`;
  }
  if (i1.HINT !== i2.HINT) {
    return `${it1.NAME}: hint ${i1.HINT} !== ${i2.HINT}`;
  }
  if (i1.TYPE !== i2.TYPE) {
    return `${it1.NAME}: type ${i1.TYPE} !== ${i2.TYPE}`;
  }
  if (i1.ERA != i2.ERA) {
    return `${it1.NAME}: changed era`;
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
    /* istanbul ignore else */
    if (matchedItems.length === 0) {
      result.push(`${i1.NAME} in ${model1Name} but not in ${model2Name}`);
    } else if (matchedItems.length == 1) {
      matchedNames.push(i1.NAME);
      const s = diffFn(i1, matchedItems[0], quickExit);
      // log(`comparison of ${i1.NAME} found diff ${s}`);
      if (s.length > 0) {
        result.push(s);
        if (quickExit) {
          break;
        }
      }
    } else {
      result.push(`duplicated name ${i1.NAME} present in ${model2Name}`);
    }
  }
  if (result.length > 0 && quickExit) {
    return result;
  }
  /* istanbul ignore if  */
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
      result.push(
        `${i2.NAME} is in ${model2Name} but not matched in ${model1Name}`,
      );
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
  return s;
}
