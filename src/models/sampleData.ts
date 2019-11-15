import {
  allItems,
  annually,
  assetChartHint,
  assetChartVal,
  assetChartView,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  incomeTax,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../stringConstants';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbSetting,
  DbTransaction,
  DbTrigger,
} from '../types/interfaces';
const simpleAsset: DbAsset = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  VALUE: '0',
  GROWTH: '0',
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};
const simpleExpense: DbExpense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
};
const simpleIncome: DbIncome = {
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
const simpleTransaction: DbTransaction = {
  NAME: 'NoName',
  FROM: '',
  FROM_ABSOLUTE: true,
  FROM_VALUE: '0',
  TO: '',
  TO_ABSOLUTE: true,
  TO_VALUE: '0',
  DATE: '1 Jan 2017',
  STOP_DATE: '', // for regular transactions
  RECURRENCE: '',
  CATEGORY: '',
};

export const sampleTriggers: DbTrigger[] = [
  {
    NAME: 'TransferMortgage',
    DATE: new Date('Jan 01 2028'),
  },
  {
    NAME: 'StopMainWork',
    DATE: new Date('Dec 31 2050'),
  },
  {
    NAME: 'GetRidOfCar',
    DATE: new Date('Dec 31 2025'),
  },
];

export const sampleExpenses: DbExpense[] = [
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

export const sampleIncomes: DbIncome[] = [
  {
    ...simpleIncome,
    NAME: 'Main income',
    VALUE: '3500',
    VALUE_SET: '1 March 2018',
    START: '1 March 2018',
    END: 'StopMainWork',
    GROWTH: '2',
    LIABILITY: `${incomeTax}Joe`, // 'IncomeTaxJoe'
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

export const sampleAssets: DbAsset[] = [
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
  },
  {
    ...simpleAsset,
    NAME: 'LateMortgage',
    START: '1 January 2018',
    GROWTH: '4.66', // after rate goes up (excl cpi)
    CATEGORY: 'mortgage',
  },
];

export const sampleTransactions: DbTransaction[] = [
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
export const sampleSettings: DbSetting[] = [
  {
    NAME: roiStart,
    VALUE: '1 Jan 2019',
    HINT: roiStartHint,
  },
  {
    NAME: roiEnd,
    VALUE: '1 Jan 2042',
    HINT: roiEndHint,
  },
  {
    NAME: assetChartView,
    VALUE: assetChartVal, // could be 'deltas'
    HINT: assetChartHint,
  },
  {
    NAME: viewFrequency,
    VALUE: annually, // could be 'Monthly'
    HINT: viewFrequencyHint,
  },
  {
    NAME: viewDetail,
    VALUE: fine, // could be coarse
    HINT: viewDetailHint,
  },
  {
    NAME: cpi,
    VALUE: '2.5',
    HINT: cpiHint,
  },
  {
    NAME: 'stockMarketGrowth',
    VALUE: '6.236',
    HINT: 'Custom setting for stock market growth',
  },
  {
    NAME: assetChartFocus,
    VALUE: allItems,
    HINT: assetChartFocusHint,
  },
  {
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
];
