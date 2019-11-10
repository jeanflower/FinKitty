import {
  allAssets,
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
  expenseChartFocusAll,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusAll,
  incomeChartFocusHint,
  incomeTax,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  singleAssetName,
  singleAssetNameHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../stringConstants';
import {
  IDbAsset,
  IDbExpense,
  IDbIncome,
  IDbSetting,
  IDbTransaction,
  IDbTrigger,
} from '../types/interfaces';
const simpleAsset: IDbAsset = {
  NAME: 'NoName',
  CATEGORY: '',
  ASSET_START: '1 Jan 2017',
  ASSET_VALUE: '0',
  ASSET_GROWTH: '0',
  ASSET_LIABILITY: '',
  ASSET_PURCHASE_PRICE: '0',
};
const simpleExpense: IDbExpense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
};
const simpleIncome: IDbIncome = {
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
const simpleTransaction: IDbTransaction = {
  NAME: 'NoName',
  TRANSACTION_FROM: '',
  TRANSACTION_FROM_ABSOLUTE: true,
  TRANSACTION_FROM_VALUE: '0',
  TRANSACTION_TO: '',
  TRANSACTION_TO_ABSOLUTE: true,
  TRANSACTION_TO_VALUE: '0',
  TRANSACTION_DATE: '1 Jan 2017',
  TRANSACTION_STOP_DATE: '', // for regular transactions
  TRANSACTION_RECURRENCE: '',
  CATEGORY: '',
};

export const sampleTriggers: IDbTrigger[] = [
  {
    NAME: 'TransferMortgage',
    TRIGGER_DATE: new Date('Jan 01 2028'),
  },
  {
    NAME: 'StopMainWork',
    TRIGGER_DATE: new Date('Dec 31 2050'),
  },
  {
    NAME: 'GetRidOfCar',
    TRIGGER_DATE: new Date('Dec 31 2025'),
  },
];

export const sampleExpenses: IDbExpense[] = [
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

export const sampleIncomes: IDbIncome[] = [
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

export const sampleAssets: IDbAsset[] = [
  {
    ...simpleAsset,
    NAME: CASH_ASSET_NAME,
    ASSET_START: 'December 2017',
    ASSET_VALUE: '2000',
  },
  {
    ...simpleAsset,
    NAME: 'Stocks',
    ASSET_START: 'December 2017',
    ASSET_VALUE: '4000',
    ASSET_GROWTH: 'stockMarketGrowth',
    CATEGORY: 'stock',
  },
  {
    ...simpleAsset,
    NAME: 'ISAs',
    ASSET_START: 'December 2019',
    ASSET_VALUE: '2000',
    ASSET_GROWTH: 'stockMarketGrowth',
    CATEGORY: 'stock',
  },
  {
    ...simpleAsset,
    NAME: 'EarlyMortgage',
    ASSET_START: '1 January 2018',
    ASSET_VALUE: '-234000', // how much was borrowed
    ASSET_GROWTH: '2.33', // good rate for early part of deal (excl cpi)
    CATEGORY: 'mortgage',
  },
  {
    ...simpleAsset,
    NAME: 'LateMortgage',
    ASSET_START: '1 January 2018',
    ASSET_GROWTH: '4.66', // after rate goes up (excl cpi)
    CATEGORY: 'mortgage',
  },
];

export const sampleTransactions: IDbTransaction[] = [
  {
    ...simpleTransaction,
    NAME: 'Each month buy food',
    TRANSACTION_FROM: CASH_ASSET_NAME,
    TRANSACTION_FROM_VALUE: '200',
    TRANSACTION_DATE: 'January 2 2018',
    TRANSACTION_RECURRENCE: '1m',
    CATEGORY: 'living costs',
  },
  {
    ...simpleTransaction,
    NAME: 'Revalue stocks after loss in 2020 market crash',
    TRANSACTION_TO: 'Stocks',
    TRANSACTION_TO_ABSOLUTE: true,
    TRANSACTION_TO_VALUE: '3000',
    TRANSACTION_DATE: 'January 2 2020',
  },
  {
    ...simpleTransaction,
    NAME: 'SellCar',
    TRANSACTION_TO: CASH_ASSET_NAME,
    TRANSACTION_TO_ABSOLUTE: true,
    TRANSACTION_TO_VALUE: '1000',
    TRANSACTION_DATE: 'GetRidOfCar',
  },
  {
    ...simpleTransaction,
    NAME: 'switchMortgage', // at a predetermined time, rate switched
    TRANSACTION_FROM: 'EarlyMortgage',
    TRANSACTION_FROM_ABSOLUTE: false,
    TRANSACTION_FROM_VALUE: '1', // all of debt at old rate
    TRANSACTION_TO: 'LateMortgage',
    TRANSACTION_TO_ABSOLUTE: false,
    TRANSACTION_TO_VALUE: '1', // becomes all of debt at new rate
    TRANSACTION_DATE: 'TransferMortgage',
  },
  {
    ...simpleTransaction,
    NAME: 'Conditional pay early mortgage',
    TRANSACTION_FROM: CASH_ASSET_NAME,
    TRANSACTION_FROM_VALUE: '1500', // a regular monthly payment
    TRANSACTION_TO: 'EarlyMortgage',
    TRANSACTION_TO_ABSOLUTE: false,
    TRANSACTION_TO_VALUE: '1', // all of amount paid goes to mortgage
    TRANSACTION_DATE: '1 January 2018',
    TRANSACTION_STOP_DATE: 'TransferMortgage',
    TRANSACTION_RECURRENCE: '1m',
    CATEGORY: 'pay mortgage',
  },
  {
    ...simpleTransaction,
    NAME: 'Conditional pay late mortgage',
    TRANSACTION_FROM: CASH_ASSET_NAME,
    TRANSACTION_FROM_VALUE: '1500',
    TRANSACTION_TO: 'LateMortgage',
    TRANSACTION_TO_ABSOLUTE: false,
    TRANSACTION_TO_VALUE: '1',
    TRANSACTION_DATE: 'TransferMortgage',
    TRANSACTION_STOP_DATE: '1 January 2040',
    TRANSACTION_RECURRENCE: '1m',
    CATEGORY: 'pay mortgage',
  },
];
export const sampleSettings: IDbSetting[] = [
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
    NAME: singleAssetName,
    VALUE: allAssets,
    HINT: singleAssetNameHint,
  },
  {
    NAME: expenseChartFocus,
    VALUE: expenseChartFocusAll,
    HINT: expenseChartFocusHint,
  },
  {
    NAME: incomeChartFocus,
    VALUE: incomeChartFocusAll,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
];
