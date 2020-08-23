import {
  DbItem,
  DbTrigger,
  DbIncome,
  DbExpense,
  DbAsset,
  DbTransaction,
  DbSetting,
  DbModelData,
} from './types/interfaces';
import { showObj } from './utils';

function diffItem(i1: DbItem, i2: DbItem): string {
  if (i1.NAME !== i2.NAME) {
    return `different names ${i1.NAME} !== ${i2.NAME}`;
  }
  return '';
}
function diffTriggers(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  const d1 = (i1 as DbTrigger).DATE;
  const d2 = (i2 as DbTrigger).DATE;
  if (d1.toDateString() !== d2.toDateString()) {
    return `different dates ${d1} !== ${d2}`;
  }
  return '';
}
function diffIncomes(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as DbIncome).START;
  let x2: string | boolean = (i2 as DbIncome).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).END;
  x2 = (i2 as DbIncome).END;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).VALUE;
  x2 = (i2 as DbIncome).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).VALUE_SET;
  x2 = (i2 as DbIncome).VALUE_SET;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).GROWTH;
  x2 = (i2 as DbIncome).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).CPI_IMMUNE;
  x2 = (i2 as DbIncome).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbIncome).LIABILITY;
  x2 = (i2 as DbIncome).LIABILITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffExpenses(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as DbExpense).START;
  let x2: string | boolean = (i2 as DbExpense).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).END;
  x2 = (i2 as DbExpense).END;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).VALUE;
  x2 = (i2 as DbExpense).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).VALUE_SET;
  x2 = (i2 as DbExpense).VALUE_SET;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).GROWTH;
  x2 = (i2 as DbExpense).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).CPI_IMMUNE;
  x2 = (i2 as DbExpense).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbExpense).RECURRENCE;
  x2 = (i2 as DbExpense).RECURRENCE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffAssets(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as DbAsset).START;
  let x2: string | boolean = (i2 as DbAsset).START;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).VALUE;
  x2 = (i2 as DbAsset).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).QUANTITY;
  x2 = (i2 as DbAsset).QUANTITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).GROWTH;
  x2 = (i2 as DbAsset).GROWTH;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).CPI_IMMUNE;
  x2 = (i2 as DbAsset).CPI_IMMUNE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).CAN_BE_NEGATIVE;
  x2 = (i2 as DbAsset).CAN_BE_NEGATIVE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).IS_A_DEBT;
  x2 = (i2 as DbAsset).IS_A_DEBT;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).LIABILITY;
  x2 = (i2 as DbAsset).LIABILITY;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbAsset).PURCHASE_PRICE;
  x2 = (i2 as DbAsset).PURCHASE_PRICE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffTransactions(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as DbTransaction).FROM;
  let x2: string | boolean = (i2 as DbTransaction).FROM;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).FROM_ABSOLUTE;
  x2 = (i2 as DbTransaction).FROM_ABSOLUTE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).FROM_VALUE;
  x2 = (i2 as DbTransaction).FROM_VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).TO;
  x2 = (i2 as DbTransaction).TO;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).TO_ABSOLUTE;
  x2 = (i2 as DbTransaction).TO_ABSOLUTE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).TO_VALUE;
  x2 = (i2 as DbTransaction).TO_VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).DATE;
  x2 = (i2 as DbTransaction).DATE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).STOP_DATE;
  x2 = (i2 as DbTransaction).STOP_DATE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).RECURRENCE;
  x2 = (i2 as DbTransaction).RECURRENCE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbTransaction).TYPE;
  x2 = (i2 as DbTransaction).TYPE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffSettings(i1: DbItem, i2: DbItem): string {
  const s = diffItem(i1, i2);
  if (s.length > 0) {
    return s;
  }
  let x1: string | boolean = (i1 as DbSetting).VALUE;
  let x2: string | boolean = (i2 as DbSetting).VALUE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbSetting).HINT;
  x2 = (i2 as DbSetting).HINT;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  x1 = (i1 as DbSetting).TYPE;
  x2 = (i2 as DbSetting).TYPE;
  if (x1 !== x2) {
    return `different dates ${showObj(i1)} !== ${showObj(i2)}`;
  }
  return '';
}
function diffItems(
  is1: DbItem[],
  is2: DbItem[],
  diffFn: (i1: DbItem, i2: DbItem) => string,
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
  m1: DbModelData | undefined,
  m2: DbModelData | undefined,
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
