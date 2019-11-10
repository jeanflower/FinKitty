import {
  CASH_ASSET_NAME,
  incomeTax,
  roiEnd,
  roiStart,
} from '../../stringConstants';
import {
  IDbModelData,
} from '../../types/interfaces';
import { setSetting } from '../../utils';
import {
  browserTestSettings, simpleAsset, simpleExpense, simpleIncome, simpleTransaction,
} from './browserBaseTypes';

export function getTestModel01() {
  const model: IDbModelData = {
    expenses: [
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
    ],
    incomes: [
      {
        ...simpleIncome,
        NAME: 'Main income',
        VALUE: '3500',
        VALUE_SET: '1 March 2018',
        START: '1 March 2018',
        END: 'StopMainWork',
        GROWTH: '2',
        LIABILITY: `${incomeTax}Joe`,
      },
    ],
    assets: [
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
    ],
    transactions: [
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
    ],
    settings: [
      ...browserTestSettings,
    ],
    triggers: [
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
    ],
  };
  setSetting(model.settings, roiStart, '1 Jan 2019');
  setSetting(model.settings, roiEnd, '1 Feb 2019');
  return { model, roi: { start: '1 Jan 2018', end: '1 Fed 2018' } };
}
