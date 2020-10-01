import { DbModelData, DbSetting } from '../types/interfaces';
import { setSetting } from '../utils';
import {
  roiStart,
  viewType,
  roiEnd,
  viewFrequency,
  monthly,
  viewDetail,
  fine,
  assetChartView,
  assetChartVal,
  debtChartView,
  debtChartVal,
  assetChartFocus,
  allItems,
  assetChartFocusHint,
  debtChartFocus,
  debtChartFocusHint,
  expenseChartFocus,
  expenseChartFocusHint,
  incomeChartFocus,
  incomeChartFocusHint,
  cpi,
  cpiHint,
  birthDate,
  birthDateHint,
  constType,
  valueFocusDateHint,
  valueFocusDate,
  taxChartFocusPerson,
  taxChartFocusPersonHint,
  taxChartFocusType,
  taxChartFocusTypeHint,
  taxChartShowNet,
  taxChartShowNetHint,
} from '../localization/stringConstants';

export function setROI(
  model: DbModelData,
  roi: { start: string; end: string },
) {
  setSetting(model.settings, roiStart, roi.start, viewType);
  setSetting(model.settings, roiEnd, roi.end, viewType);
}

export const simpleSetting: DbSetting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};
export const viewSetting: DbSetting = {
  ...simpleSetting,
  TYPE: viewType,
};

export const defaultSettings: DbSetting[] = [
  { ...viewSetting, NAME: viewFrequency, VALUE: monthly },
  { ...viewSetting, NAME: viewDetail, VALUE: fine },
  { ...viewSetting, NAME: assetChartView, VALUE: assetChartVal },
  { ...viewSetting, NAME: debtChartView, VALUE: debtChartVal },
  {
    ...viewSetting,
    NAME: assetChartFocus,
    VALUE: allItems,
    HINT: assetChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: debtChartFocus,
    VALUE: allItems,
    HINT: debtChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    ...viewSetting,
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: taxChartFocusPerson,
    VALUE: allItems,
    HINT: taxChartFocusPersonHint,
    TYPE: viewType,
  },
  {
    NAME: taxChartFocusType,
    VALUE: allItems,
    HINT: taxChartFocusTypeHint,
    TYPE: viewType,
  },
  {
    NAME: taxChartShowNet,
    VALUE: 'Y',
    HINT: taxChartShowNetHint,
    TYPE: viewType,
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: '0.0',
    HINT: cpiHint,
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

export const emptyModel: DbModelData = {
  triggers: [],
  incomes: [],
  expenses: [],
  transactions: [],
  assets: [],
  settings: [],
};
