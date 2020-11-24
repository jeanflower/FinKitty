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
import { showObj } from './utils';

function diffItem(i1: Item, i2: Item): string {
  if (i1.NAME !== i2.NAME) {
    return `different names ${i1.NAME} !== ${i2.NAME}`;
  }
  return '';
}
function diffTriggers(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  const d1 = (i1 as Trigger).DATE;
  const d2 = (i2 as Trigger).DATE;
  if (d1.toDateString() !== d2.toDateString()) {
    return `different dates ${d1} !== ${d2}`;
  }
  return '';
}
function diffIncomes(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as Income).START;
  let x2: string | boolean = (i2 as Income).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).END;
  x2 = (i2 as Income).END;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).VALUE;
  x2 = (i2 as Income).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).VALUE_SET;
  x2 = (i2 as Income).VALUE_SET;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).GROWTH;
  x2 = (i2 as Income).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).CPI_IMMUNE;
  x2 = (i2 as Income).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Income).LIABILITY;
  x2 = (i2 as Income).LIABILITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffExpenses(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as Expense).START;
  let x2: string | boolean = (i2 as Expense).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).END;
  x2 = (i2 as Expense).END;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).VALUE;
  x2 = (i2 as Expense).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).VALUE_SET;
  x2 = (i2 as Expense).VALUE_SET;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).GROWTH;
  x2 = (i2 as Expense).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).CPI_IMMUNE;
  x2 = (i2 as Expense).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Expense).RECURRENCE;
  x2 = (i2 as Expense).RECURRENCE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffAssets(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as Asset).START;
  let x2: string | boolean = (i2 as Asset).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).VALUE;
  x2 = (i2 as Asset).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).QUANTITY;
  x2 = (i2 as Asset).QUANTITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).GROWTH;
  x2 = (i2 as Asset).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).CPI_IMMUNE;
  x2 = (i2 as Asset).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).CAN_BE_NEGATIVE;
  x2 = (i2 as Asset).CAN_BE_NEGATIVE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).IS_A_DEBT;
  x2 = (i2 as Asset).IS_A_DEBT;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).LIABILITY;
  x2 = (i2 as Asset).LIABILITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Asset).PURCHASE_PRICE;
  x2 = (i2 as Asset).PURCHASE_PRICE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffTransactions(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as Transaction).FROM;
  let x2: string | boolean = (i2 as Transaction).FROM;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).FROM_ABSOLUTE;
  x2 = (i2 as Transaction).FROM_ABSOLUTE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).FROM_VALUE;
  x2 = (i2 as Transaction).FROM_VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).TO;
  x2 = (i2 as Transaction).TO;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).TO_ABSOLUTE;
  x2 = (i2 as Transaction).TO_ABSOLUTE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).TO_VALUE;
  x2 = (i2 as Transaction).TO_VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).DATE;
  x2 = (i2 as Transaction).DATE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).STOP_DATE;
  x2 = (i2 as Transaction).STOP_DATE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).RECURRENCE;
  x2 = (i2 as Transaction).RECURRENCE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Transaction).TYPE;
  x2 = (i2 as Transaction).TYPE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffSettings(i1: Item, i2: Item): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as Setting).VALUE;
  let x2: string | boolean = (i2 as Setting).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Setting).HINT;
  x2 = (i2 as Setting).HINT;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as Setting).TYPE;
  x2 = (i2 as Setting).TYPE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffItems(
  is1: Item[],
  is2: Item[],
  diffFn: (i1: Item, i2: Item) => string,
): string {
  // log(`diffItems between ${showObj(is1)} and ${showObj(is2)}`);

  const matchedNames: string[] = [];
  let result = '';
  is1.forEach(i1 => {
    if (result.length > 0) {
      return;
    }
    const matchedItems = is2.filter(i2 => {
      // log(`compare ${i1.NAME} and ${i2.NAME}`);
      return i1.NAME === i2.NAME;
    });
    if (matchedItems.length === 0) {
      result = `unmatched name ${i1.NAME}`;
    } else if (matchedItems.length > 1) {
      result = `duplicated name ${i1.NAME}`;
    } else {
      const s = diffFn(i1, matchedItems[0]);
      if (s.length > 0) {
        result = s;
      } else {
        matchedNames.push(i1.NAME);
      }
    }
  });
  if (result.length > 0) {
    return result;
  }
  // log(`matchedNames = ${showObj(matchedNames)}`);
  is2.forEach(i2 => {
    if (
      matchedNames.find(m => {
        return m === i2.NAME;
      })
    ) {
      return;
    }
    result = `unmatched name ${i2.NAME} in ${showObj(is1)} and ${showObj(is2)}`;
  });
  return result;
}

export function diffModels(
  m1: ModelData | undefined,
  m2: ModelData | undefined,
): string {
  // log(`diff models ${m1} and ${m2}`);
  if (m1 === undefined) {
    if (m2 === undefined) {
      return '';
    } else {
      return `one model undefined, other defined`;
    }
  } else if (m2 === undefined) {
    return `one model defined, other undefined`;
  }
  let s = diffItems(m1.triggers, m2.triggers, diffTriggers);
  if (s.length > 0) {
    return s;
  }
  s = diffItems(m1.incomes, m2.incomes, diffIncomes);
  if (s.length > 0) {
    return s;
  }
  s = diffItems(m1.expenses, m2.expenses, diffExpenses);
  if (s.length > 0) {
    return s;
  }
  s = diffItems(m1.assets, m2.assets, diffAssets);
  if (s.length > 0) {
    return s;
  }
  s = diffItems(m1.transactions, m2.transactions, diffTransactions);
  if (s.length > 0) {
    return s;
  }
  s = diffItems(m1.settings, m2.settings, diffSettings);
  if (s.length > 0) {
    return s;
  }
  return '';
}
