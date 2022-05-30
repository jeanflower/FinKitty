import {
  viewFrequency,
  annually,
  chartViewType,
  chartVals,
  viewDetail,
  fineDetail,
  assetChartFocus,
  allItems,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  ViewType,
  assetsView,
  debtsView,
  expensesView,
  homeView,
  incomesView,
  overview,
  reportView,
  settingsView,
  taxView,
  transactionsView,
  triggersView,
  optimizerView,
} from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';
import { log } from './utils';

export function getDefaultViewSettings(): ViewSettings {
  const result = new ViewSettings([
    {
      NAME: viewFrequency,
      VALUE: annually,
    },
    {
      NAME: chartViewType,
      VALUE: chartVals,
    },
    {
      NAME: viewDetail,
      VALUE: fineDetail,
    },
    {
      NAME: assetChartFocus,
      VALUE: allItems,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusPerson,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusType,
      VALUE: allItems,
    },
    {
      NAME: taxChartShowNet,
      VALUE: 'Y',
    },
  ]);
  return result;
}

export const views = new Map<
  ViewType,
  {
    display: boolean;
  }
>([
  [
    homeView,
    {
      display: true,
    },
  ],
  [
    overview,
    {
      display: false,
    },
  ],
  [
    incomesView,
    {
      display: false,
    },
  ],
  [
    expensesView,
    {
      display: false,
    },
  ],
  [
    assetsView,
    {
      display: false,
    },
  ],
  [
    debtsView,
    {
      display: false,
    },
  ],
  [
    taxView,
    {
      display: false,
    },
  ],
  [
    triggersView,
    {
      display: false,
    },
  ],
  [
    transactionsView,
    {
      display: false,
    },
  ],
  [
    reportView,
    {
      display: false,
    },
  ],
  [
    optimizerView,
    {
      display: false,
    },
  ],
  [
    settingsView,
    {
      display: false,
    },
  ],
]);

export function getDisplay(type: ViewType): boolean {
  const view = views.get(type);
  /* istanbul ignore if */
  if (view === undefined) {
    log(`Error : unrecognised view ${type}`);
    return false;
  }
  const result = view.display;
  return result;
}

// from https://coolors.co
const colors = [
  '4E81BC',
  'C0504E',
  '9CBB58',
  '23BFAA',
  '8064A1',
  '4BACC5',
  'F79647',
  '7F6084',
  '77A032',
  '33558B',
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  /* istanbul ignore else */
  if (result !== null) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  } else {
    log('Error: hex value not understood');
    return {
      r: 30,
      g: 30,
      b: 100,
    };
  }
}

export function getColor(index: number) {
  return hexToRgb(colors[index % colors.length]);
}
