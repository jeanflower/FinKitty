import {
  CASH_ASSET_NAME,
  incomeTax,
  roiEnd,
  roiStart,
  payOffDebt,
  revalueAsset,
  viewType,
  viewDetail,
  coarse,
} from '../../localization/stringConstants';
import { DbModelData } from '../../types/interfaces';
import {
  setSetting,
  makeDateFromString,
  getMinimalModelCopy,
} from '../../utils';
import { browserTestSettings } from './browserBaseTypes';
import {
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
} from './../../types/simple';
import { defaultSettings, emptyModel, setROI } from '../testUtils';

export function getTestModel01() {
  const model: DbModelData = {
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
        LIABILITY: `Joe${incomeTax}`,
      },
    ],
    assets: [
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
        IS_A_DEBT: true,
        GROWTH: '2.33', // good rate for early part of deal (excl cpi)
        CATEGORY: 'mortgage',
        CAN_BE_NEGATIVE: true,
      },
      {
        ...simpleAsset,
        NAME: 'LateMortgage',
        START: '1 January 2018',
        GROWTH: '4.66', // after rate goes up (excl cpi)
        IS_A_DEBT: true,
        CATEGORY: 'mortgage',
      },
    ],
    transactions: [
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
        TYPE: payOffDebt,
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
        TYPE: payOffDebt,
      },
    ],
    settings: [...browserTestSettings],
    triggers: [
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
    ],
  };
  setSetting(model.settings, roiStart, '1 Jan 2019', viewType);
  setSetting(model.settings, roiEnd, '1 Feb 2019', viewType);
  return { model, roi: { start: '1 Jan 2018', end: '1 Fed 2018' } };
}

export function getModelCoarseAndFine() {
  const roi = {
    start: 'April 1, 2018',
    end: 'July 10, 2018',
  };
  const model: DbModelData = {
    ...emptyModel,
    incomes: [
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn1',
        VALUE: '10',
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'PRn2',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn3',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: 'April 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
      {
        ...simpleAsset,
        NAME: 'stocks',
        START: 'April 1 2018',
        VALUE: '500',
      },
      {
        ...simpleAsset,
        NAME: 'savings',
        START: 'June 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
    ],
    settings: [...defaultSettings],
    expenses: [
      {
        ...simpleExpense,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'Phon',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'February 1 2018',
        END: 'June 2 2018',
        NAME: 'broadband',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'pet food',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
      },
    ],
  };

  setROI(model, roi);
  setSetting(model.settings, viewDetail, coarse, viewType);

  return {
    model,
    roi,
  };
}

export function getModelFutureExpense() {
  const roi = {
    start: 'Dec 1, 2016 00:00:00',
    end: 'March 1, 2017 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: DbModelData = {
    ...minimalModel,
    expenses: [
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'Phon',
        VALUE: '99',
        VALUE_SET: 'January 1 2018',
        GROWTH: '12.0',
      },
    ],
    settings: [...defaultSettings],
  };
  setROI(model, roi);
  return { roi, model };
}
