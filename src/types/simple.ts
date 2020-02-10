import { DbAsset, DbExpense, DbIncome, DbTransaction } from './interfaces';
import { custom } from '../localization/stringConstants';

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
