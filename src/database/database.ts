import { DbModelData } from './../types/interfaces';
import {
  allItems,
  assetChartFocus,
  assetChartFocusHint,
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
  monthly,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../localization/stringConstants';

import { AWSDB } from './aws_db';
import { RESTDB } from './REST_db';

export interface DbInterface {
  getModelNames(userID: string): Promise<string[]>;
  loadModel(userID: string, modelName: string): Promise<DbModelData>;
  ensureModel(userID: string, modelName: string): any;
  saveModel(userID: string, modelName: string, model: DbModelData): any;
  deleteModel(userID: string, modelName: string): any;
}

export const minimalModel: DbModelData = {
  assets: [
    {
      NAME: CASH_ASSET_NAME,
      CATEGORY: '',
      START: '1 Jan 1990',
      VALUE: '0.0',
      GROWTH: '0.0',
      CPI_IMMUNE: false,
      CAN_BE_NEGATIVE: true,
      LIABILITY: '',
      PURCHASE_PRICE: '0.0',
    },
  ],
  incomes: [],
  expenses: [],
  triggers: [],
  settings: [
    {
      NAME: cpi,
      VALUE: '2.5',
      HINT: cpiHint,
    },
    {
      NAME: assetChartView,
      VALUE: assetChartVal,
      HINT: assetChartHint,
    },
    {
      NAME: viewFrequency,
      VALUE: monthly,
      HINT: viewFrequencyHint,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
    },
    {
      NAME: roiStart,
      VALUE: '1 Jan 2017',
      HINT: roiStartHint,
    },
    {
      NAME: roiEnd,
      VALUE: '1 Jan 2020',
      HINT: roiEndHint,
    },
    {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
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
  ],
  transactions: [],
};

const awsdb = new AWSDB();
const restdb = new RESTDB();

export function getDB(): DbInterface {
  if (process.env.REACT_APP_USE_AWS_NOT_SECRET === 'true') {
    return awsdb;
  } else {
    return restdb;
  }
}
