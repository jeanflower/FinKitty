import {
  allItems,
  annually,
  chartDeltas,
  chartViewType,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  incomeTax,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  assetChartFocus,
  viewDetail,
  viewFrequency,
  revalueAsset,
  constType,
  viewType,
  valueFocusDate,
  valueFocusDateHint,
} from '../../localization/stringConstants';
import {
  Asset,
  Expense,
  Income,
  Setting,
  Transaction,
  Trigger,
} from '../../types/interfaces';
import {
  makeDateFromString,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
} from '../../utils';

export const testTriggers01: Trigger[] = [
  {
    NAME: 'TransferMortgage',
    DATE: makeDateFromString('Jan 01 2028'),
  },
  {
    NAME: 'StopMainWork',
    DATE: makeDateFromString('Dec 31 2050'),
  },
  {
    NAME: 'GetRidOfCar',
    DATE: makeDateFromString('Dec 31 2025'),
  },
];

export const testExpenses01: Expense[] = [
  {
    ...simpleExpense,
    NAME: 'Look after dogs',
    VALUE: '500',
    VALUE_SET: '1 April 2018',
    START: '1 April 2018',
    END: '2 February 2047',
    GROWTH: '2',
    CATEGORY: 'living costs',
  },
  {
    ...simpleExpense,
    NAME: 'Run car',
    VALUE: '700',
    VALUE_SET: '1 April 2018',
    START: '1 April 2018',
    END: 'GetRidOfCar',
    GROWTH: '5',
    CATEGORY: 'living costs',
  },
  {
    ...simpleExpense,
    NAME: 'Run house',
    VALUE: '1300',
    VALUE_SET: '1 April 2018',
    START: '1 April 2018',
    END: '2 February 2099',
    GROWTH: '2',
    CATEGORY: 'living costs',
  },
];

export const testIncomes01: Income[] = [
  {
    ...simpleIncome,
    NAME: 'Main income',
    VALUE: '3500',
    VALUE_SET: '1 March 2018',
    START: '1 March 2018',
    END: 'StopMainWork',
    GROWTH: '2',
    LIABILITY: `Joe${incomeTax}`,
  },
  {
    ...simpleIncome,
    NAME: 'Side hustle income',
    VALUE: '1500',
    VALUE_SET: '1 March 2018',
    START: '1 March 2018',
    END: '2 April 2025',
    CATEGORY: 'hustle',
  },
  {
    ...simpleIncome,
    NAME: 'Side hustle income later',
    VALUE: '1500',
    VALUE_SET: '1 March 2018',
    START: '2 April 2025',
    END: '2 April 2029',
    CATEGORY: 'hustle',
  },
];

export const testAssets01: Asset[] = [
  {
    ...simpleAsset,
    NAME: CASH_ASSET_NAME,
    START: 'December 2017',
    VALUE: '2000',
  },
  {
    ...simpleAsset,
    NAME: 'Stocks',
    START: 'December 2017',
    VALUE: '4000',
    GROWTH: 'stockMarketGrowth',
    CATEGORY: 'stock',
  },
  {
    ...simpleAsset,
    NAME: 'ISAs',
    START: 'December 2019',
    VALUE: '2000',
    GROWTH: 'stockMarketGrowth',
    CATEGORY: 'stock',
  },
  {
    ...simpleAsset,
    NAME: 'EarlyMortgage',
    START: '1 January 2018',
    VALUE: '-234000', // how much was borrowed
    GROWTH: '2.33', // good rate for early part of deal (excl cpi)
    CATEGORY: 'mortgage',
    CAN_BE_NEGATIVE: true,
  },
  {
    ...simpleAsset,
    NAME: 'LateMortgage',
    START: '1 January 2018',
    GROWTH: '4.66', // after rate goes up (excl cpi)
    CATEGORY: 'mortgage',
  },
];

export const testTransactions01: Transaction[] = [
  {
    ...simpleTransaction,
    NAME: 'Each month buy food',
    FROM: CASH_ASSET_NAME,
    FROM_VALUE: '200',
    DATE: 'January 2 2018',
    RECURRENCE: '1m',
    CATEGORY: 'living costs',
  },
  {
    ...simpleTransaction,
    NAME: 'Revalue stocks after loss in 2020 market crash',
    TO: 'Stocks',
    TO_ABSOLUTE: true,
    TO_VALUE: '3000',
    DATE: 'January 2 2020',
    TYPE: revalueAsset,
  },
  {
    ...simpleTransaction,
    NAME: 'SellCar',
    TO: CASH_ASSET_NAME,
    TO_ABSOLUTE: true,
    TO_VALUE: '1000',
    DATE: 'GetRidOfCar',
  },
  {
    ...simpleTransaction,
    NAME: 'switchMortgage', // at a predetermined time, rate switched
    FROM: 'EarlyMortgage',
    FROM_ABSOLUTE: false,
    FROM_VALUE: '1', // all of debt at old rate
    TO: 'LateMortgage',
    TO_ABSOLUTE: false,
    TO_VALUE: '1', // becomes all of debt at new rate
    DATE: 'TransferMortgage',
  },
  {
    ...simpleTransaction,
    NAME: 'Conditional pay early mortgage',
    FROM: CASH_ASSET_NAME,
    FROM_VALUE: '1500', // a regular monthly payment
    TO: 'EarlyMortgage',
    TO_ABSOLUTE: false,
    TO_VALUE: '1', // all of amount paid goes to mortgage
    DATE: '1 January 2018',
    STOP_DATE: 'TransferMortgage',
    RECURRENCE: '1m',
    CATEGORY: 'pay mortgage',
  },
  {
    ...simpleTransaction,
    NAME: 'Conditional pay late mortgage',
    FROM: CASH_ASSET_NAME,
    FROM_VALUE: '1500',
    TO: 'LateMortgage',
    TO_ABSOLUTE: false,
    TO_VALUE: '1',
    DATE: 'TransferMortgage',
    STOP_DATE: '1 January 2040',
    RECURRENCE: '1m',
    CATEGORY: 'pay mortgage',
  },
];
const simpleSetting: Setting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};
const viewSetting: Setting = {
  ...simpleSetting,
  TYPE: viewType,
};
export const testSettings01: Setting[] = [
  {
    ...viewSetting,
    NAME: roiStart,
    VALUE: '1 Jan 2019',
    HINT: roiStartHint,
  },
  {
    ...viewSetting,
    NAME: roiEnd,
    VALUE: '1 Jan 2042',
    HINT: roiEndHint,
  },
  {
    ...viewSetting,
    NAME: chartViewType,
    VALUE: chartDeltas, // could be 'val'
  },
  {
    ...viewSetting,
    NAME: viewFrequency,
    VALUE: annually, // could be 'Monthly'
  },
  {
    ...viewSetting,
    NAME: viewDetail,
    VALUE: fine, // could be coarse
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
  },
  {
    ...viewSetting,
    NAME: expenseChartFocus,
    VALUE: allItems,
  },
  {
    ...viewSetting,
    NAME: incomeChartFocus,
    VALUE: allItems,
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
