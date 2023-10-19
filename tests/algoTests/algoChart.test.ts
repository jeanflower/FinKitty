import { makeModelFromJSON } from '../../models/modelFromJSON';
import { defaultModelSettings, getModelCoarseAndFine, getTestModel } from '../../models/testModel';
import {
  viewFrequency,
  annually,
  allItems,
  CASH_ASSET_NAME,
  chartAdditions,
  chartDeltas,
  chartReductions,
  chartViewType,
  coarseDetail,
  fineDetail,
  growth,
  separator,
  totalDetail,
  viewDetail,
  birthDate,
  viewType,
  cpi,
  monthly,
  bondModel,
  constType,
  weekly,
  homeView,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleExpense,
  simpleAsset,
  simpleTransaction,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { Context, log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
  expectChartData,
  printTestCodeForChart,
} from './algoTestUtils';

printTestCodeForChart;
log;

describe(' chart data tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it('annual accumulation for chart less than one year', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.12, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it('annual accumulation for chart more than one year', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.12, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Sat Dec 01 2018', 24.24, 2); // two payments
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it('annual chart data for assets deltas', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, '1 Feb 1980', viewType, '');

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Sun Apr 01 2018', 514.37, 2);
    expectEvals(evals, 4, 'savings', 'Tue May 01 2018', 519.25, 2);
    expectEvals(evals, 5, 'savings', 'Fri Jun 01 2018', 524.18, 2);
    expectEvals(evals, 6, 'savings', 'Sun Jul 01 2018', 529.15, 2);
    expectEvals(evals, 7, 'savings', 'Wed Aug 01 2018', 534.17, 2);
    expectEvals(evals, 8, 'savings', 'Sat Sep 01 2018', 539.24, 2);
    expectEvals(evals, 9, 'savings', 'Mon Oct 01 2018', 544.36, 2);
    expectEvals(evals, 10, 'savings', 'Thu Nov 01 2018', 549.52, 2);
    expectEvals(evals, 11, 'savings', 'Sat Dec 01 2018', 554.74, 2);
    expectEvals(evals, 12, 'savings', 'Tue Jan 01 2019', 560.0, 2);
    expectEvals(evals, 13, 'savings', 'Fri Feb 01 2019', 565.31, 2);
    expectEvals(evals, 14, 'savings', 'Fri Mar 01 2019', 570.68, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);

    // savings detailed reports on an initial setting
    // and a second evaluation for growth
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe(
      'savings' + separator + 'savings',
    );
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '38', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(growth + separator + 'savings');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '38', 54.74, 2);
    }
  });

  it('annual chart data for assets computed monthly', () => {
    const roi = {
      start: 'Jan 1, 2017 00:00:00',
      end: 'April 1, 2020 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Sun Apr 01 2018', 514.37, 2);
    expectEvals(evals, 4, 'savings', 'Tue May 01 2018', 519.25, 2);
    expectEvals(evals, 5, 'savings', 'Fri Jun 01 2018', 524.18, 2);
    expectEvals(evals, 6, 'savings', 'Sun Jul 01 2018', 529.15, 2);
    expectEvals(evals, 7, 'savings', 'Wed Aug 01 2018', 534.17, 2);
    expectEvals(evals, 8, 'savings', 'Sat Sep 01 2018', 539.24, 2);
    expectEvals(evals, 9, 'savings', 'Mon Oct 01 2018', 544.36, 2);
    expectEvals(evals, 10, 'savings', 'Thu Nov 01 2018', 549.52, 2);
    expectEvals(evals, 11, 'savings', 'Sat Dec 01 2018', 554.74, 2);
    expectEvals(evals, 12, 'savings', 'Tue Jan 01 2019', 560.0, 2);
    expectEvals(evals, 13, 'savings', 'Fri Feb 01 2019', 565.31, 2);
    expectEvals(evals, 14, 'savings', 'Fri Mar 01 2019', 570.68, 2);
    expectEvals(evals, 15, 'savings', 'Mon Apr 01 2019', 576.09, 2);
    expectEvals(evals, 16, 'savings', 'Wed May 01 2019', 581.56, 2);
    expectEvals(evals, 17, 'savings', 'Sat Jun 01 2019', 587.08, 2);
    expectEvals(evals, 18, 'savings', 'Mon Jul 01 2019', 592.65, 2);
    expectEvals(evals, 19, 'savings', 'Thu Aug 01 2019', 598.27, 2);
    expectEvals(evals, 20, 'savings', 'Sun Sep 01 2019', 603.95, 2);
    expectEvals(evals, 21, 'savings', 'Tue Oct 01 2019', 609.68, 2);
    expectEvals(evals, 22, 'savings', 'Fri Nov 01 2019', 615.46, 2);
    expectEvals(evals, 23, 'savings', 'Sun Dec 01 2019', 621.3, 2);
    expectEvals(evals, 24, 'savings', 'Wed Jan 01 2020', 627.2, 2);
    expectEvals(evals, 25, 'savings', 'Sat Feb 01 2020', 633.15, 2);
    expectEvals(evals, 26, 'savings', 'Sun Mar 01 2020', 639.16, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Jan 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue Jan 01 2019', 560.0, 2);
      expectChartData(chartPts, 3, 'Wed Jan 01 2020', 627.2, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('weekly chart data for assets', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model, true, false, weekly);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Mon Jan 08 2018', 500, -1);
    expectEvals(evals, 2, 'savings', 'Mon Jan 15 2018', 500, -1);
    expectEvals(evals, 3, 'savings', 'Mon Jan 22 2018', 500, -1);
    expectEvals(evals, 4, 'savings', 'Mon Jan 29 2018', 500, -1);
    expectEvals(evals, 5, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 6, 'savings', 'Mon Feb 05 2018', 504.74, 2);
    expectEvals(evals, 7, 'savings', 'Mon Feb 12 2018', 504.74, 2);
    expectEvals(evals, 8, 'savings', 'Mon Feb 19 2018', 504.74, 2);
    expectEvals(evals, 9, 'savings', 'Mon Feb 26 2018', 504.74, 2);
    expectEvals(evals, 10, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 11, 'savings', 'Mon Mar 05 2018', 509.53, 2);
    expectEvals(evals, 12, 'savings', 'Mon Mar 12 2018', 509.53, 2);
    expectEvals(evals, 13, 'savings', 'Mon Mar 19 2018', 509.53, 2);
    expectEvals(evals, 14, 'savings', 'Mon Mar 26 2018', 509.53, 2);
    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewFrequency, weekly);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Fri Dec 08 2017', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 15 2017', 0, -1);
      expectChartData(chartPts, 3, 'Fri Dec 22 2017', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 29 2017', 0, -1);
      expectChartData(chartPts, 5, 'Fri Jan 05 2018', 500, -1);
      expectChartData(chartPts, 6, 'Fri Jan 12 2018', 500, -1);
      expectChartData(chartPts, 7, 'Fri Jan 19 2018', 500, -1);
      expectChartData(chartPts, 8, 'Fri Jan 26 2018', 500, -1);
      expectChartData(chartPts, 9, 'Fri Feb 02 2018', 504.74, 2);
      expectChartData(chartPts, 10, 'Fri Feb 09 2018', 504.74, 2);
      expectChartData(chartPts, 11, 'Fri Feb 16 2018', 504.74, 2);
      expectChartData(chartPts, 12, 'Fri Feb 23 2018', 504.74, 2);
      expectChartData(chartPts, 13, 'Fri Mar 02 2018', 509.53, 2);
      expectChartData(chartPts, 14, 'Fri Mar 09 2018', 509.53, 2);
      expectChartData(chartPts, 15, 'Fri Mar 16 2018', 509.53, 2);
      expectChartData(chartPts, 16, 'Fri Mar 23 2018', 509.53, 2);
      expectChartData(chartPts, 17, 'Fri Mar 30 2018', 509.53, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('annual chart data for assets displayed annually', () => {
    const roi = {
      start: 'Jan 1, 2017 00:00:00',
      end: 'April 1, 2020 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model, true, false, annually);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Sun Apr 01 2018', 514.37, 2);
    expectEvals(evals, 4, 'savings', 'Tue May 01 2018', 519.25, 2);
    expectEvals(evals, 5, 'savings', 'Fri Jun 01 2018', 524.18, 2);
    expectEvals(evals, 6, 'savings', 'Sun Jul 01 2018', 529.15, 2);
    expectEvals(evals, 7, 'savings', 'Wed Aug 01 2018', 534.17, 2);
    expectEvals(evals, 8, 'savings', 'Sat Sep 01 2018', 539.24, 2);
    expectEvals(evals, 9, 'savings', 'Mon Oct 01 2018', 544.36, 2);
    expectEvals(evals, 10, 'savings', 'Thu Nov 01 2018', 549.52, 2);
    expectEvals(evals, 11, 'savings', 'Sat Dec 01 2018', 554.74, 2);
    expectEvals(evals, 12, 'savings', 'Tue Jan 01 2019', 560.0, 2);
    expectEvals(evals, 13, 'savings', 'Fri Feb 01 2019', 565.31, 2);
    expectEvals(evals, 14, 'savings', 'Fri Mar 01 2019', 570.68, 2);
    expectEvals(evals, 15, 'savings', 'Mon Apr 01 2019', 576.09, 2);
    expectEvals(evals, 16, 'savings', 'Wed May 01 2019', 581.56, 2);
    expectEvals(evals, 17, 'savings', 'Sat Jun 01 2019', 587.08, 2);
    expectEvals(evals, 18, 'savings', 'Mon Jul 01 2019', 592.65, 2);
    expectEvals(evals, 19, 'savings', 'Thu Aug 01 2019', 598.27, 2);
    expectEvals(evals, 20, 'savings', 'Sun Sep 01 2019', 603.95, 2);
    expectEvals(evals, 21, 'savings', 'Tue Oct 01 2019', 609.68, 2);
    expectEvals(evals, 22, 'savings', 'Fri Nov 01 2019', 615.46, 2);
    expectEvals(evals, 23, 'savings', 'Sun Dec 01 2019', 621.3, 2);
    expectEvals(evals, 24, 'savings', 'Wed Jan 01 2020', 627.2, 2);
    expectEvals(evals, 25, 'savings', 'Sat Feb 01 2020', 633.15, 2);
    expectEvals(evals, 26, 'savings', 'Sun Mar 01 2020', 639.16, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Jan 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue Jan 01 2019', 560.0, 2);
      expectChartData(chartPts, 3, 'Wed Jan 01 2020', 627.2, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('delta chart data for cpi assets', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some',
          FROM: 'savings',
          FROM_VALUE: '100',
          DATE: 'January 2 2019',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, '1 Feb 1980', viewType, '');
    setSetting(model.settings, cpi, '12.0', constType); // approx 1% per month

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 509.04, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 518.25, 2);
    expectEvals(evals, 3, 'savings', 'Sun Apr 01 2018', 527.63, 2);
    expectEvals(evals, 4, 'savings', 'Tue May 01 2018', 537.17, 2);
    expectEvals(evals, 5, 'savings', 'Fri Jun 01 2018', 546.88, 2);
    expectEvals(evals, 6, 'savings', 'Sun Jul 01 2018', 556.78, 2);
    expectEvals(evals, 7, 'savings', 'Wed Aug 01 2018', 566.85, 2);
    expectEvals(evals, 8, 'savings', 'Sat Sep 01 2018', 577.1, 2);
    expectEvals(evals, 9, 'savings', 'Mon Oct 01 2018', 587.54, 2);
    expectEvals(evals, 10, 'savings', 'Thu Nov 01 2018', 598.17, 2);
    expectEvals(evals, 11, 'savings', 'Sat Dec 01 2018', 608.98, 2);
    expectEvals(evals, 12, 'savings', 'Tue Jan 01 2019', 620.0, 2);
    expectEvals(evals, 13, 'savings', 'Wed Jan 02 2019', 525.88, 2);
    expectEvals(evals, 14, 'savings', 'Fri Feb 01 2019', 530.36, 2);
    expectEvals(evals, 15, 'savings', 'Fri Mar 01 2019', 539.96, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewFrequency, monthly);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(4);
    expect(result.assetData[0].item.NAME).toBe('savings/savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '37', 500, -1);
      expectChartData(chartPts, 2, '38', 0, -1);
      expectChartData(chartPts, 3, '38', 0, -1);
      expectChartData(chartPts, 4, '38', 0, -1);
      expectChartData(chartPts, 5, '38', 0, -1);
      expectChartData(chartPts, 6, '38', 0, -1);
      expectChartData(chartPts, 7, '38', 0, -1);
      expectChartData(chartPts, 8, '38', 0, -1);
      expectChartData(chartPts, 9, '38', 0, -1);
      expectChartData(chartPts, 10, '38', 0, -1);
      expectChartData(chartPts, 11, '38', 0, -1);
      expectChartData(chartPts, 12, '38', 0, -1);
      expectChartData(chartPts, 13, '38', 0, -1);
      expectChartData(chartPts, 14, '39', 0, -1);
      expectChartData(chartPts, 15, '39', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('unidentified/savings');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '37', 0, -1);
      expectChartData(chartPts, 2, '38', 4.74, 2);
      expectChartData(chartPts, 3, '38', 4.83, 2);
      expectChartData(chartPts, 4, '38', 4.92, 2);
      expectChartData(chartPts, 5, '38', 5.01, 2);
      expectChartData(chartPts, 6, '38', 5.1, 2);
      expectChartData(chartPts, 7, '38', 5.19, 2);
      expectChartData(chartPts, 8, '38', 5.28, 2);
      expectChartData(chartPts, 9, '38', 5.38, 2);
      expectChartData(chartPts, 10, '38', 5.48, 2);
      expectChartData(chartPts, 11, '38', 5.58, 2);
      expectChartData(chartPts, 12, '38', 5.68, 2);
      expectChartData(chartPts, 13, '38', 5.78, 2);
      expectChartData(chartPts, 14, '39', 5.88, 2);
      expectChartData(chartPts, 15, '39', 5.03, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('growth/savings');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '37', 0, -1);
      expectChartData(chartPts, 2, '38', 4.3, 2);
      expectChartData(chartPts, 3, '38', 4.38, 2);
      expectChartData(chartPts, 4, '38', 4.46, 2);
      expectChartData(chartPts, 5, '38', 4.54, 2);
      expectChartData(chartPts, 6, '38', 4.62, 2);
      expectChartData(chartPts, 7, '38', 4.7, 2);
      expectChartData(chartPts, 8, '38', 4.79, 2);
      expectChartData(chartPts, 9, '38', 4.87, 2);
      expectChartData(chartPts, 10, '38', 4.96, 2);
      expectChartData(chartPts, 11, '38', 5.05, 2);
      expectChartData(chartPts, 12, '38', 5.14, 2);
      expectChartData(chartPts, 13, '38', 5.24, 2);
      expectChartData(chartPts, 14, '39', 4.48, 2);
      expectChartData(chartPts, 15, '39', 4.56, 2);
    }

    expect(result.assetData[3].item.NAME).toBe('sell some/savings');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '37', 0, -1);
      expectChartData(chartPts, 2, '38', 0, -1);
      expectChartData(chartPts, 3, '38', 0, -1);
      expectChartData(chartPts, 4, '38', 0, -1);
      expectChartData(chartPts, 5, '38', 0, -1);
      expectChartData(chartPts, 6, '38', 0, -1);
      expectChartData(chartPts, 7, '38', 0, -1);
      expectChartData(chartPts, 8, '38', 0, -1);
      expectChartData(chartPts, 9, '38', 0, -1);
      expectChartData(chartPts, 10, '38', 0, -1);
      expectChartData(chartPts, 11, '38', 0, -1);
      expectChartData(chartPts, 12, '38', 0, -1);
      expectChartData(chartPts, 13, '38', 0, -1);
      expectChartData(chartPts, 14, '39', -100, -1);
      expectChartData(chartPts, 15, '39', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('annual chart data for debts', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'mortgage',
          START: 'January 1 2018',
          VALUE: '-500',
          GROWTH: '12',
          IS_A_DEBT: true,
          CAN_BE_NEGATIVE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, '1 Feb 1980', viewType, '');

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mortgage', 'Mon Jan 01 2018', -500, -1);
    expectEvals(evals, 1, 'mortgage', 'Thu Feb 01 2018', -504.74, 2);
    expectEvals(evals, 2, 'mortgage', 'Thu Mar 01 2018', -509.53, 2);
    expectEvals(evals, 3, 'mortgage', 'Sun Apr 01 2018', -514.37, 2);
    expectEvals(evals, 4, 'mortgage', 'Tue May 01 2018', -519.25, 2);
    expectEvals(evals, 5, 'mortgage', 'Fri Jun 01 2018', -524.18, 2);
    expectEvals(evals, 6, 'mortgage', 'Sun Jul 01 2018', -529.15, 2);
    expectEvals(evals, 7, 'mortgage', 'Wed Aug 01 2018', -534.17, 2);
    expectEvals(evals, 8, 'mortgage', 'Sat Sep 01 2018', -539.24, 2);
    expectEvals(evals, 9, 'mortgage', 'Mon Oct 01 2018', -544.36, 2);
    expectEvals(evals, 10, 'mortgage', 'Thu Nov 01 2018', -549.52, 2);
    expectEvals(evals, 11, 'mortgage', 'Sat Dec 01 2018', -554.74, 2);
    expectEvals(evals, 12, 'mortgage', 'Tue Jan 01 2019', -560.0, 2);
    expectEvals(evals, 13, 'mortgage', 'Fri Feb 01 2019', -565.31, 2);
    expectEvals(evals, 14, 'mortgage', 'Fri Mar 01 2019', -570.68, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Debt, allItems);
    viewSettings.toggleViewFilter(Context.Debt, 'mortgage');
    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(1);
    expect(result.debtData[0].item.NAME).toBe('mortgage');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, '37', 0, -1);
      expectChartData(chartPts, 1, '38', 554.74, 2);
    }

    expect(result.taxData.length).toBe(0);
  });

  it('Check coarse, categorised, chart data data', () => {
    const model = getModelCoarseAndFine();
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, 'pet food', 'Mon Jan 01 2018', 12, -1);
    expectEvals(evals, 1, 'broadband', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 2, 'pet food', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 3, 'broadband', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 4, 'pet food', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 6, 'stocks', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 7, 'PRn1', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 510, -1);
    expectEvals(evals, 9, 'PRn2', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 520, -1);
    expectEvals(evals, 11, 'PRn3', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 530, -1);
    expectEvals(evals, 13, 'Phon', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 518, -1);
    expectEvals(evals, 15, 'broadband', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 16, 'Cash', 'Sun Apr 01 2018', 506, -1);
    expectEvals(evals, 17, 'pet food', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Apr 01 2018', 494, -1);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 494, -1);
    expectEvals(evals, 20, 'stocks', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 21, 'PRn2', 'Tue May 01 2018', 10, -1);
    expectEvals(evals, 22, 'Cash', 'Tue May 01 2018', 504, -1);
    expectEvals(evals, 23, 'Phon', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', 492, -1);
    expectEvals(evals, 25, 'broadband', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 480, -1);
    expectEvals(evals, 27, 'pet food', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', 468, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', 468, -1);
    expectEvals(evals, 30, 'savings', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 31, 'stocks', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 32, 'PRn2', 'Fri Jun 01 2018', 10, -1);
    expectEvals(evals, 33, 'Cash', 'Fri Jun 01 2018', 478, -1);
    expectEvals(evals, 34, 'Phon', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 35, 'Cash', 'Fri Jun 01 2018', 466, -1);
    expectEvals(evals, 36, 'broadband', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 37, 'Cash', 'Fri Jun 01 2018', 454, -1);
    expectEvals(evals, 38, 'pet food', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Jun 01 2018', 442, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Jul 01 2018', 442, -1);
    expectEvals(evals, 41, 'savings', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 42, 'stocks', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 43, 'pet food', 'Sun Jul 01 2018', 12, -1);
    expectEvals(evals, 44, 'Cash', 'Sun Jul 01 2018', 430, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarseDetail);
    let result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe('comms');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe('pet food');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 942, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 930, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }

    viewSettings.toggleViewFilter(Context.Income, 'PaperRound');

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    viewSettings.toggleViewFilter(Context.Income, 'PRn2');

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    viewSettings.toggleViewFilter(Context.Expense, 'pet food');

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('comms');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 942, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 930, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('Check totalled, chart data data', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, 'pet food', 'Mon Jan 01 2018', 12, -1);
    expectEvals(evals, 1, 'broadband', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 2, 'pet food', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 3, 'broadband', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 4, 'pet food', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 6, 'stocks', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 7, 'PRn1', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 510, -1);
    expectEvals(evals, 9, 'PRn2', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 520, -1);
    expectEvals(evals, 11, 'PRn3', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 530, -1);
    expectEvals(evals, 13, 'Phon', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 518, -1);
    expectEvals(evals, 15, 'broadband', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 16, 'Cash', 'Sun Apr 01 2018', 506, -1);
    expectEvals(evals, 17, 'pet food', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Apr 01 2018', 494, -1);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 494, -1);
    expectEvals(evals, 20, 'stocks', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 21, 'PRn2', 'Tue May 01 2018', 10, -1);
    expectEvals(evals, 22, 'Cash', 'Tue May 01 2018', 504, -1);
    expectEvals(evals, 23, 'Phon', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', 492, -1);
    expectEvals(evals, 25, 'broadband', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 480, -1);
    expectEvals(evals, 27, 'pet food', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', 468, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', 468, -1);
    expectEvals(evals, 30, 'savings', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 31, 'stocks', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 32, 'PRn2', 'Fri Jun 01 2018', 10, -1);
    expectEvals(evals, 33, 'Cash', 'Fri Jun 01 2018', 478, -1);
    expectEvals(evals, 34, 'Phon', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 35, 'Cash', 'Fri Jun 01 2018', 466, -1);
    expectEvals(evals, 36, 'broadband', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 37, 'Cash', 'Fri Jun 01 2018', 454, -1);
    expectEvals(evals, 38, 'pet food', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Jun 01 2018', 442, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Jul 01 2018', 442, -1);
    expectEvals(evals, 41, 'savings', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 42, 'stocks', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 43, 'pet food', 'Sun Jul 01 2018', 12, -1);
    expectEvals(evals, 44, 'Cash', 'Sun Jul 01 2018', 430, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, totalDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Total');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 36, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 36, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 36, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('Total');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 30, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Total');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 994, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 968, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 1442, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 1430, -1);
    }
  });

  it('Check fine, uncategorised, chart data data', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, 'pet food', 'Mon Jan 01 2018', 12, -1);
    expectEvals(evals, 1, 'broadband', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 2, 'pet food', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 3, 'broadband', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 4, 'pet food', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 6, 'stocks', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 7, 'PRn1', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 510, -1);
    expectEvals(evals, 9, 'PRn2', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 520, -1);
    expectEvals(evals, 11, 'PRn3', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 530, -1);
    expectEvals(evals, 13, 'Phon', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 518, -1);
    expectEvals(evals, 15, 'broadband', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 16, 'Cash', 'Sun Apr 01 2018', 506, -1);
    expectEvals(evals, 17, 'pet food', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Apr 01 2018', 494, -1);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 494, -1);
    expectEvals(evals, 20, 'stocks', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 21, 'PRn2', 'Tue May 01 2018', 10, -1);
    expectEvals(evals, 22, 'Cash', 'Tue May 01 2018', 504, -1);
    expectEvals(evals, 23, 'Phon', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', 492, -1);
    expectEvals(evals, 25, 'broadband', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 480, -1);
    expectEvals(evals, 27, 'pet food', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', 468, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', 468, -1);
    expectEvals(evals, 30, 'savings', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 31, 'stocks', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 32, 'PRn2', 'Fri Jun 01 2018', 10, -1);
    expectEvals(evals, 33, 'Cash', 'Fri Jun 01 2018', 478, -1);
    expectEvals(evals, 34, 'Phon', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 35, 'Cash', 'Fri Jun 01 2018', 466, -1);
    expectEvals(evals, 36, 'broadband', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 37, 'Cash', 'Fri Jun 01 2018', 454, -1);
    expectEvals(evals, 38, 'pet food', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Jun 01 2018', 442, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Jul 01 2018', 442, -1);
    expectEvals(evals, 41, 'savings', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 42, 'stocks', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 43, 'pet food', 'Sun Jul 01 2018', 12, -1);
    expectEvals(evals, 44, 'Cash', 'Sun Jul 01 2018', 430, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, fineDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(3);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe('broadband');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[2].item.NAME).toBe('pet food');
    {
      const chartPts = result.expensesData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(3);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 442, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }
  });

  it('Coarse asset view for cash asset, vals, +, -, +- data1', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, 'pet food', 'Mon Jan 01 2018', 12, -1);
    expectEvals(evals, 1, 'broadband', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 2, 'pet food', 'Thu Feb 01 2018', 12, -1);
    expectEvals(evals, 3, 'broadband', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 4, 'pet food', 'Thu Mar 01 2018', 12, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 6, 'stocks', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 7, 'PRn1', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 510, -1);
    expectEvals(evals, 9, 'PRn2', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 520, -1);
    expectEvals(evals, 11, 'PRn3', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 530, -1);
    expectEvals(evals, 13, 'Phon', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 518, -1);
    expectEvals(evals, 15, 'broadband', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 16, 'Cash', 'Sun Apr 01 2018', 506, -1);
    expectEvals(evals, 17, 'pet food', 'Sun Apr 01 2018', 12, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Apr 01 2018', 494, -1);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 494, -1);
    expectEvals(evals, 20, 'stocks', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 21, 'PRn2', 'Tue May 01 2018', 10, -1);
    expectEvals(evals, 22, 'Cash', 'Tue May 01 2018', 504, -1);
    expectEvals(evals, 23, 'Phon', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', 492, -1);
    expectEvals(evals, 25, 'broadband', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 480, -1);
    expectEvals(evals, 27, 'pet food', 'Tue May 01 2018', 12, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', 468, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', 468, -1);
    expectEvals(evals, 30, 'savings', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 31, 'stocks', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 32, 'PRn2', 'Fri Jun 01 2018', 10, -1);
    expectEvals(evals, 33, 'Cash', 'Fri Jun 01 2018', 478, -1);
    expectEvals(evals, 34, 'Phon', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 35, 'Cash', 'Fri Jun 01 2018', 466, -1);
    expectEvals(evals, 36, 'broadband', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 37, 'Cash', 'Fri Jun 01 2018', 454, -1);
    expectEvals(evals, 38, 'pet food', 'Fri Jun 01 2018', 12, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Jun 01 2018', 442, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Jul 01 2018', 442, -1);
    expectEvals(evals, 41, 'savings', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 42, 'stocks', 'Sun Jul 01 2018', 500, -1);
    expectEvals(evals, 43, 'pet food', 'Sun Jul 01 2018', 12, -1);
    expectEvals(evals, 44, 'Cash', 'Sun Jul 01 2018', 430, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, CASH_ASSET_NAME);
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe('comms');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe('pet food');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 442, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 430, -1);
    }
  });

  // NEEDS migrateViewSettingString
  /*
  it('filter chart data into single category, coarse', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    // log(`go to call migrateViewSettingString`);
    expect(
      viewSettings.migrateViewSettingString(assetChartFocus, 'nonsense'),
    ).toBe(false);
    expect(
      viewSettings.migrateViewSettingString(assetChartFocus, allItems),
    ).toBe(true);
    expect(
      viewSettings.migrateViewSettingString(
        `${viewFrequency}${homeView.lc}`,
        monthly,
      ),
    ).toBe(true);
    expect(viewSettings.migrateViewSettingString(cpi, '12.0')).toBe(true);
    expect(viewSettings.migrateViewSettingString('nonsense', '12.0')).toBe(
      false,
    );

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 942, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 930, -1);
    }
  });
  */

  it('filter chart data into single uncategorised asset, coarse', () => {
    const model = getModelCoarseAndFine();
    // log(`model - ${showObj(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'stocks');
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe('comms');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe('pet food');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('stocks');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }
  });

  it('filter chart data into single categorised asset, coarse', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe('comms');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe('pet food');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PaperRound');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn3');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }
  });

  it('filter chart data into single category, fine', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, fineDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 442, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }
  });

  it('asset view type deltas', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarseDetail);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    // don't assert about income or expense charts
    // tested elsewhere

    expect(result.assetData.length).toBe(6);
    expect(result.assetData[0].item.NAME).toBe('Accessible/Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks/stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('PaperRound/Accessible');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('PRn3/Accessible');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[4].item.NAME).toBe('comms/Accessible');
    {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[5].item.NAME).toBe('pet food/Accessible');
    {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -12, -1);
    }
  });

  it('asset view type reductions', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarseDetail);
    viewSettings.setViewSetting(chartViewType, chartReductions);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    // don't assert about income or expense charts

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('comms/Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -24, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -24, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -24, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('pet food/Accessible');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -12, -1);
    }
  });

  it('asset view type additions', () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarseDetail);
    viewSettings.setViewSetting(chartViewType, chartAdditions);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    // don't assert about income or expense charts
    expect(result.assetData.length).toBe(4);
    expect(result.assetData[0].item.NAME).toBe('Accessible/Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks/stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('PaperRound/Accessible');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('PRn3/Accessible');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }
  });

  it('filter chart data into single category with transfer, coarse', () => {
    const model = getModelCoarseAndFine();

    model.transactions = [
      ...[
        {
          ...simpleTransaction,
          NAME: 'move money',
          FROM: 'stocks',
          FROM_VALUE: '100',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '100',
          DATE: 'May 1, 2018',
        },
      ],
    ];

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Accessible');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 568, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 1042, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 1030, -1);
    }
  });

  it('filter chart data into single category with income, fine', () => {
    const model = getModelCoarseAndFine();

    // set the category of an income to match
    // the category of some assets
    // test that this income doesn't appear in the assets graph!
    model.incomes[0].CATEGORY = 'Accessible';

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, fineDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 494, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 468, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 442, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 500, -1);
    }
  });
  it('bond test charts', () => {

    const viewSettings = defaultTestViewSettings();
    const model = getTestModel(bondModel, viewSettings);

    const evalsAndValues = getTestEvaluations(model);

    //const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    //printTestCodeForEvals(evals);


    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(162);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1010, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1018.05, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1026.17, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1034.35, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1042.6, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 1050.92, 2);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 1059.3, 2);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 1067.74, 2);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 1076.26, 2);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 1084.84, 2);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 1093.49, 2);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 1102.21, 2);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 1037.13, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 1045.4, 2);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 1053.73, 2);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 1062.14, 2);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 1070.61, 2);
      expectChartData(chartPts, 18, 'Sat Jun 01 2019', 1079.14, 2);
      expectChartData(chartPts, 19, 'Mon Jul 01 2019', 1087.75, 2);
      expectChartData(chartPts, 20, 'Thu Aug 01 2019', 1096.42, 2);
      expectChartData(chartPts, 21, 'Sun Sep 01 2019', 1105.17, 2);
      expectChartData(chartPts, 22, 'Tue Oct 01 2019', 1113.98, 2);
      expectChartData(chartPts, 23, 'Fri Nov 01 2019', 1122.86, 2);
      expectChartData(chartPts, 24, 'Sun Dec 01 2019', 1131.82, 2);
      expectChartData(chartPts, 25, 'Wed Jan 01 2020', 1133.45, 2);
      expectChartData(chartPts, 26, 'Sat Feb 01 2020', 1142.49, 2);
      expectChartData(chartPts, 27, 'Sun Mar 01 2020', 1151.6, 2);
      expectChartData(chartPts, 28, 'Wed Apr 01 2020', 1160.79, 2);
      expectChartData(chartPts, 29, 'Fri May 01 2020', 1170.04, 2);
      expectChartData(chartPts, 30, 'Mon Jun 01 2020', 1179.37, 2);
      expectChartData(chartPts, 31, 'Wed Jul 01 2020', 1188.78, 2);
      expectChartData(chartPts, 32, 'Sat Aug 01 2020', 1198.26, 2);
      expectChartData(chartPts, 33, 'Tue Sep 01 2020', 1207.81, 2);
      expectChartData(chartPts, 34, 'Thu Oct 01 2020', 1217.44, 2);
      expectChartData(chartPts, 35, 'Sun Nov 01 2020', 1227.15, 2);
      expectChartData(chartPts, 36, 'Tue Dec 01 2020', 1236.94, 2);
      expectChartData(chartPts, 37, 'Fri Jan 01 2021', 1238.67, 2);
      expectChartData(chartPts, 38, 'Mon Feb 01 2021', 1248.55, 2);
      expectChartData(chartPts, 39, 'Mon Mar 01 2021', 1258.51, 2);
      expectChartData(chartPts, 40, 'Thu Apr 01 2021', 1268.54, 2);
      expectChartData(chartPts, 41, 'Sat May 01 2021', 1278.66, 2);
      expectChartData(chartPts, 42, 'Tue Jun 01 2021', 1288.85, 2);
      expectChartData(chartPts, 43, 'Thu Jul 01 2021', 1299.13, 2);
      expectChartData(chartPts, 44, 'Sun Aug 01 2021', 1309.49, 2);
      expectChartData(chartPts, 45, 'Wed Sep 01 2021', 1319.93, 2);
      expectChartData(chartPts, 46, 'Fri Oct 01 2021', 1330.46, 2);
      expectChartData(chartPts, 47, 'Mon Nov 01 2021', 1341.07, 2);
      expectChartData(chartPts, 48, 'Wed Dec 01 2021', 1351.76, 2);
      expectChartData(chartPts, 49, 'Sat Jan 01 2022', 1353.6, 2);
      expectChartData(chartPts, 50, 'Tue Feb 01 2022', 1364.4, 2);
      expectChartData(chartPts, 51, 'Tue Mar 01 2022', 1375.28, 2);
      expectChartData(chartPts, 52, 'Fri Apr 01 2022', 1386.24, 2);
      expectChartData(chartPts, 53, 'Sun May 01 2022', 1397.3, 2);
      expectChartData(chartPts, 54, 'Wed Jun 01 2022', 1408.44, 2);
      expectChartData(chartPts, 55, 'Fri Jul 01 2022', 1419.67, 2);
      expectChartData(chartPts, 56, 'Mon Aug 01 2022', 1430.99, 2);
      expectChartData(chartPts, 57, 'Thu Sep 01 2022', 1442.4, 2);
      expectChartData(chartPts, 58, 'Sat Oct 01 2022', 1453.9, 2);
      expectChartData(chartPts, 59, 'Tue Nov 01 2022', 1465.5, 2);
      expectChartData(chartPts, 60, 'Thu Dec 01 2022', 1477.18, 2);
      expectChartData(chartPts, 61, 'Sun Jan 01 2023', 1479.13, 2);
      expectChartData(chartPts, 62, 'Wed Feb 01 2023', 1490.93, 2);
      expectChartData(chartPts, 63, 'Wed Mar 01 2023', 1502.81, 2);
      expectChartData(chartPts, 64, 'Sat Apr 01 2023', 1514.8, 2);
      expectChartData(chartPts, 65, 'Mon May 01 2023', 1526.88, 2);
      expectChartData(chartPts, 66, 'Thu Jun 01 2023', 1539.05, 2);
      expectChartData(chartPts, 67, 'Sat Jul 01 2023', 1551.32, 2);
      expectChartData(chartPts, 68, 'Tue Aug 01 2023', 1563.7, 2);
      expectChartData(chartPts, 69, 'Fri Sep 01 2023', 1576.16, 2);
      expectChartData(chartPts, 70, 'Sun Oct 01 2023', 1588.73, 2);
      expectChartData(chartPts, 71, 'Wed Nov 01 2023', 1601.4, 2);
      expectChartData(chartPts, 72, 'Fri Dec 01 2023', 1614.17, 2);
      expectChartData(chartPts, 73, 'Mon Jan 01 2024', 1616.23, 2);
      expectChartData(chartPts, 74, 'Thu Feb 01 2024', 1629.12, 2);
      expectChartData(chartPts, 75, 'Fri Mar 01 2024', 1642.11, 2);
      expectChartData(chartPts, 76, 'Mon Apr 01 2024', 1655.2, 2);
      expectChartData(chartPts, 77, 'Wed May 01 2024', 1668.4, 2);
      expectChartData(chartPts, 78, 'Sat Jun 01 2024', 1681.7, 2);
      expectChartData(chartPts, 79, 'Mon Jul 01 2024', 1695.11, 2);
      expectChartData(chartPts, 80, 'Thu Aug 01 2024', 1708.63, 2);
      expectChartData(chartPts, 81, 'Sun Sep 01 2024', 1722.26, 2);
      expectChartData(chartPts, 82, 'Tue Oct 01 2024', 1735.99, 2);
      expectChartData(chartPts, 83, 'Fri Nov 01 2024', 1749.83, 2);
      expectChartData(chartPts, 84, 'Sun Dec 01 2024', 1763.79, 2);
      expectChartData(chartPts, 85, 'Wed Jan 01 2025', 1797.34, 2);
      expectChartData(chartPts, 86, 'Sat Feb 01 2025', 1811.67, 2);
      expectChartData(chartPts, 87, 'Sat Mar 01 2025', 1826.12, 2);
      expectChartData(chartPts, 88, 'Tue Apr 01 2025', 1840.68, 2);
      expectChartData(chartPts, 89, 'Thu May 01 2025', 1855.36, 2);
      expectChartData(chartPts, 90, 'Sun Jun 01 2025', 1870.15, 2);
      expectChartData(chartPts, 91, 'Tue Jul 01 2025', 1885.06, 2);
      expectChartData(chartPts, 92, 'Fri Aug 01 2025', 1900.1, 2);
      expectChartData(chartPts, 93, 'Mon Sep 01 2025', 1915.25, 2);
      expectChartData(chartPts, 94, 'Wed Oct 01 2025', 1930.52, 2);
      expectChartData(chartPts, 95, 'Sat Nov 01 2025', 1945.91, 2);
      expectChartData(chartPts, 96, 'Mon Dec 01 2025', 1961.43, 2);
      expectChartData(chartPts, 97, 'Thu Jan 01 2026', 1998.51, 2);
      expectChartData(chartPts, 98, 'Sun Feb 01 2026', 2014.44, 2);
      expectChartData(chartPts, 99, 'Sun Mar 01 2026', 2030.51, 2);
      expectChartData(chartPts, 100, 'Wed Apr 01 2026', 2046.7, 2);
      expectChartData(chartPts, 101, 'Fri May 01 2026', 2063.02, 2);
      expectChartData(chartPts, 102, 'Mon Jun 01 2026', 2079.47, 2);
      expectChartData(chartPts, 103, 'Wed Jul 01 2026', 2096.05, 2);
      expectChartData(chartPts, 104, 'Sat Aug 01 2026', 2112.77, 2);
      expectChartData(chartPts, 105, 'Tue Sep 01 2026', 2129.61, 2);
      expectChartData(chartPts, 106, 'Thu Oct 01 2026', 2146.6, 2);
      expectChartData(chartPts, 107, 'Sun Nov 01 2026', 2163.71, 2);
      expectChartData(chartPts, 108, 'Tue Dec 01 2026', 2180.97, 2);
      expectChartData(chartPts, 109, 'Fri Jan 01 2027', 2221.94, 2);
      expectChartData(chartPts, 110, 'Mon Feb 01 2027', 2239.66, 2);
      expectChartData(chartPts, 111, 'Mon Mar 01 2027', 2257.51, 2);
      expectChartData(chartPts, 112, 'Thu Apr 01 2027', 2275.52, 2);
      expectChartData(chartPts, 113, 'Sat May 01 2027', 2293.66, 2);
      expectChartData(chartPts, 114, 'Tue Jun 01 2027', 2311.95, 2);
      expectChartData(chartPts, 115, 'Thu Jul 01 2027', 2330.39, 2);
      expectChartData(chartPts, 116, 'Sun Aug 01 2027', 2348.97, 2);
      expectChartData(chartPts, 117, 'Wed Sep 01 2027', 2367.7, 2);
      expectChartData(chartPts, 118, 'Fri Oct 01 2027', 2386.58, 2);
      expectChartData(chartPts, 119, 'Mon Nov 01 2027', 2405.61, 2);
      expectChartData(chartPts, 120, 'Wed Dec 01 2027', 2424.8, 2);
      expectChartData(chartPts, 121, 'Sat Jan 01 2028', 2470.07, 2);
      expectChartData(chartPts, 122, 'Tue Feb 01 2028', 2489.77, 2);
      expectChartData(chartPts, 123, 'Wed Mar 01 2028', 2509.62, 2);
      expectChartData(chartPts, 124, 'Sat Apr 01 2028', 2529.63, 2);
      expectChartData(chartPts, 125, 'Mon May 01 2028', 2549.8, 2);
      expectChartData(chartPts, 126, 'Thu Jun 01 2028', 2570.14, 2);
      expectChartData(chartPts, 127, 'Sat Jul 01 2028', 2590.63, 2);
      expectChartData(chartPts, 128, 'Tue Aug 01 2028', 2611.29, 2);
      expectChartData(chartPts, 129, 'Fri Sep 01 2028', 2632.11, 2);
      expectChartData(chartPts, 130, 'Sun Oct 01 2028', 2653.1, 2);
      expectChartData(chartPts, 131, 'Wed Nov 01 2028', 2674.26, 2);
      expectChartData(chartPts, 132, 'Fri Dec 01 2028', 2695.58, 2);
      expectChartData(chartPts, 133, 'Mon Jan 01 2029', 2745.61, 2);
      expectChartData(chartPts, 134, 'Thu Feb 01 2029', 2767.5, 2);
      expectChartData(chartPts, 135, 'Thu Mar 01 2029', 2789.57, 2);
      expectChartData(chartPts, 136, 'Sun Apr 01 2029', 2811.81, 2);
      expectChartData(chartPts, 137, 'Tue May 01 2029', 2834.24, 2);
      expectChartData(chartPts, 138, 'Fri Jun 01 2029', 2856.84, 2);
      expectChartData(chartPts, 139, 'Sun Jul 01 2029', 2879.62, 2);
      expectChartData(chartPts, 140, 'Wed Aug 01 2029', 2902.58, 2);
      expectChartData(chartPts, 141, 'Sat Sep 01 2029', 2925.72, 2);
      expectChartData(chartPts, 142, 'Mon Oct 01 2029', 2949.05, 2);
      expectChartData(chartPts, 143, 'Thu Nov 01 2029', 2972.57, 2);
      expectChartData(chartPts, 144, 'Sat Dec 01 2029', 2996.27, 2);
      expectChartData(chartPts, 145, 'Tue Jan 01 2030', 3020.17, 2);
      expectChartData(chartPts, 146, 'Fri Feb 01 2030', 3044.25, 2);
      expectChartData(chartPts, 147, 'Fri Mar 01 2030', 3068.53, 2);
      expectChartData(chartPts, 148, 'Mon Apr 01 2030', 3092.99, 2);
      expectChartData(chartPts, 149, 'Wed May 01 2030', 3117.66, 2);
      expectChartData(chartPts, 150, 'Sat Jun 01 2030', 3142.52, 2);
      expectChartData(chartPts, 151, 'Mon Jul 01 2030', 3167.58, 2);
      expectChartData(chartPts, 152, 'Thu Aug 01 2030', 3192.84, 2);
      expectChartData(chartPts, 153, 'Sun Sep 01 2030', 3218.3, 2);
      expectChartData(chartPts, 154, 'Tue Oct 01 2030', 3243.96, 2);
      expectChartData(chartPts, 155, 'Fri Nov 01 2030', 3269.83, 2);
      expectChartData(chartPts, 156, 'Sun Dec 01 2030', 3295.9, 2);
      expectChartData(chartPts, 157, 'Wed Jan 01 2031', 3322.18, 2);
      expectChartData(chartPts, 158, 'Sat Feb 01 2031', 3348.68, 2);
      expectChartData(chartPts, 159, 'Sat Mar 01 2031', 3375.38, 2);
      expectChartData(chartPts, 160, 'Tue Apr 01 2031', 3402.29, 2);
      expectChartData(chartPts, 161, 'Thu May 01 2031', 3429.42, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('CPI.');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(162);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1007.97, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1016.01, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1024.11, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1032.28, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 1040.51, 2);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 1048.81, 2);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 1057.17, 2);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 1065.6, 2);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 1074.1, 2);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 1082.66, 2);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 1091.3, 2);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 1100.0, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 1108.77, 2);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 1117.61, 2);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 1126.53, 2);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 1135.51, 2);
      expectChartData(chartPts, 18, 'Sat Jun 01 2019', 1144.56, 2);
      expectChartData(chartPts, 19, 'Mon Jul 01 2019', 1153.69, 2);
      expectChartData(chartPts, 20, 'Thu Aug 01 2019', 1162.89, 2);
      expectChartData(chartPts, 21, 'Sun Sep 01 2019', 1172.16, 2);
      expectChartData(chartPts, 22, 'Tue Oct 01 2019', 1181.51, 2);
      expectChartData(chartPts, 23, 'Fri Nov 01 2019', 1190.93, 2);
      expectChartData(chartPts, 24, 'Sun Dec 01 2019', 1200.43, 2);
      expectChartData(chartPts, 25, 'Wed Jan 01 2020', 1210.0, 2);
      expectChartData(chartPts, 26, 'Sat Feb 01 2020', 1219.65, 2);
      expectChartData(chartPts, 27, 'Sun Mar 01 2020', 1229.37, 2);
      expectChartData(chartPts, 28, 'Wed Apr 01 2020', 1239.18, 2);
      expectChartData(chartPts, 29, 'Fri May 01 2020', 1249.06, 2);
      expectChartData(chartPts, 30, 'Mon Jun 01 2020', 1259.02, 2);
      expectChartData(chartPts, 31, 'Wed Jul 01 2020', 1269.06, 2);
      expectChartData(chartPts, 32, 'Sat Aug 01 2020', 1279.18, 2);
      expectChartData(chartPts, 33, 'Tue Sep 01 2020', 1289.38, 2);
      expectChartData(chartPts, 34, 'Thu Oct 01 2020', 1299.66, 2);
      expectChartData(chartPts, 35, 'Sun Nov 01 2020', 1310.02, 2);
      expectChartData(chartPts, 36, 'Tue Dec 01 2020', 1320.47, 2);
      expectChartData(chartPts, 37, 'Fri Jan 01 2021', 1331.0, 2);
      expectChartData(chartPts, 38, 'Mon Feb 01 2021', 1341.61, 2);
      expectChartData(chartPts, 39, 'Mon Mar 01 2021', 1352.31, 2);
      expectChartData(chartPts, 40, 'Thu Apr 01 2021', 1363.1, 2);
      expectChartData(chartPts, 41, 'Sat May 01 2021', 1373.96, 2);
      expectChartData(chartPts, 42, 'Tue Jun 01 2021', 1384.92, 2);
      expectChartData(chartPts, 43, 'Thu Jul 01 2021', 1395.96, 2);
      expectChartData(chartPts, 44, 'Sun Aug 01 2021', 1407.1, 2);
      expectChartData(chartPts, 45, 'Wed Sep 01 2021', 1418.32, 2);
      expectChartData(chartPts, 46, 'Fri Oct 01 2021', 1429.63, 2);
      expectChartData(chartPts, 47, 'Mon Nov 01 2021', 1441.03, 2);
      expectChartData(chartPts, 48, 'Wed Dec 01 2021', 1452.52, 2);
      expectChartData(chartPts, 49, 'Sat Jan 01 2022', 1464.1, 2);
      expectChartData(chartPts, 50, 'Tue Feb 01 2022', 1475.77, 2);
      expectChartData(chartPts, 51, 'Tue Mar 01 2022', 1487.54, 2);
      expectChartData(chartPts, 52, 'Fri Apr 01 2022', 1499.4, 2);
      expectChartData(chartPts, 53, 'Sun May 01 2022', 1511.36, 2);
      expectChartData(chartPts, 54, 'Wed Jun 01 2022', 1523.41, 2);
      expectChartData(chartPts, 55, 'Fri Jul 01 2022', 1535.56, 2);
      expectChartData(chartPts, 56, 'Mon Aug 01 2022', 1547.81, 2);
      expectChartData(chartPts, 57, 'Thu Sep 01 2022', 1560.15, 2);
      expectChartData(chartPts, 58, 'Sat Oct 01 2022', 1572.59, 2);
      expectChartData(chartPts, 59, 'Tue Nov 01 2022', 1585.13, 2);
      expectChartData(chartPts, 60, 'Thu Dec 01 2022', 1597.77, 2);
      expectChartData(chartPts, 61, 'Sun Jan 01 2023', 1610.51, 2);
      expectChartData(chartPts, 62, 'Wed Feb 01 2023', 1623.35, 2);
      expectChartData(chartPts, 63, 'Wed Mar 01 2023', 1636.3, 2);
      expectChartData(chartPts, 64, 'Sat Apr 01 2023', 1649.35, 2);
      expectChartData(chartPts, 65, 'Mon May 01 2023', 1662.5, 2);
      expectChartData(chartPts, 66, 'Thu Jun 01 2023', 1675.75, 2);
      expectChartData(chartPts, 67, 'Sat Jul 01 2023', 1689.12, 2);
      expectChartData(chartPts, 68, 'Tue Aug 01 2023', 1702.59, 2);
      expectChartData(chartPts, 69, 'Fri Sep 01 2023', 1716.16, 2);
      expectChartData(chartPts, 70, 'Sun Oct 01 2023', 1729.85, 2);
      expectChartData(chartPts, 71, 'Wed Nov 01 2023', 1743.64, 2);
      expectChartData(chartPts, 72, 'Fri Dec 01 2023', 1757.55, 2);
      expectChartData(chartPts, 73, 'Mon Jan 01 2024', 1771.56, 2);
      expectChartData(chartPts, 74, 'Thu Feb 01 2024', 1785.69, 2);
      expectChartData(chartPts, 75, 'Fri Mar 01 2024', 1799.93, 2);
      expectChartData(chartPts, 76, 'Mon Apr 01 2024', 1814.28, 2);
      expectChartData(chartPts, 77, 'Wed May 01 2024', 1828.75, 2);
      expectChartData(chartPts, 78, 'Sat Jun 01 2024', 1843.33, 2);
      expectChartData(chartPts, 79, 'Mon Jul 01 2024', 1858.03, 2);
      expectChartData(chartPts, 80, 'Thu Aug 01 2024', 1872.85, 2);
      expectChartData(chartPts, 81, 'Sun Sep 01 2024', 1887.78, 2);
      expectChartData(chartPts, 82, 'Tue Oct 01 2024', 1902.83, 2);
      expectChartData(chartPts, 83, 'Fri Nov 01 2024', 1918.01, 2);
      expectChartData(chartPts, 84, 'Sun Dec 01 2024', 1933.3, 2);
      expectChartData(chartPts, 85, 'Wed Jan 01 2025', 1948.72, 2);
      expectChartData(chartPts, 86, 'Sat Feb 01 2025', 1964.26, 2);
      expectChartData(chartPts, 87, 'Sat Mar 01 2025', 1979.92, 2);
      expectChartData(chartPts, 88, 'Tue Apr 01 2025', 1995.71, 2);
      expectChartData(chartPts, 89, 'Thu May 01 2025', 2011.62, 2);
      expectChartData(chartPts, 90, 'Sun Jun 01 2025', 2027.66, 2);
      expectChartData(chartPts, 91, 'Tue Jul 01 2025', 2043.83, 2);
      expectChartData(chartPts, 92, 'Fri Aug 01 2025', 2060.13, 2);
      expectChartData(chartPts, 93, 'Mon Sep 01 2025', 2076.56, 2);
      expectChartData(chartPts, 94, 'Wed Oct 01 2025', 2093.12, 2);
      expectChartData(chartPts, 95, 'Sat Nov 01 2025', 2109.81, 2);
      expectChartData(chartPts, 96, 'Mon Dec 01 2025', 2126.63, 2);
      expectChartData(chartPts, 97, 'Thu Jan 01 2026', 2143.59, 2);
      expectChartData(chartPts, 98, 'Sun Feb 01 2026', 2160.68, 2);
      expectChartData(chartPts, 99, 'Sun Mar 01 2026', 2177.91, 2);
      expectChartData(chartPts, 100, 'Wed Apr 01 2026', 2195.28, 2);
      expectChartData(chartPts, 101, 'Fri May 01 2026', 2212.78, 2);
      expectChartData(chartPts, 102, 'Mon Jun 01 2026', 2230.43, 2);
      expectChartData(chartPts, 103, 'Wed Jul 01 2026', 2248.21, 2);
      expectChartData(chartPts, 104, 'Sat Aug 01 2026', 2266.14, 2);
      expectChartData(chartPts, 105, 'Tue Sep 01 2026', 2284.21, 2);
      expectChartData(chartPts, 106, 'Thu Oct 01 2026', 2302.43, 2);
      expectChartData(chartPts, 107, 'Sun Nov 01 2026', 2320.79, 2);
      expectChartData(chartPts, 108, 'Tue Dec 01 2026', 2339.29, 2);
      expectChartData(chartPts, 109, 'Fri Jan 01 2027', 2357.95, 2);
      expectChartData(chartPts, 110, 'Mon Feb 01 2027', 2376.75, 2);
      expectChartData(chartPts, 111, 'Mon Mar 01 2027', 2395.7, 2);
      expectChartData(chartPts, 112, 'Thu Apr 01 2027', 2414.81, 2);
      expectChartData(chartPts, 113, 'Sat May 01 2027', 2434.06, 2);
      expectChartData(chartPts, 114, 'Tue Jun 01 2027', 2453.47, 2);
      expectChartData(chartPts, 115, 'Thu Jul 01 2027', 2473.04, 2);
      expectChartData(chartPts, 116, 'Sun Aug 01 2027', 2492.76, 2);
      expectChartData(chartPts, 117, 'Wed Sep 01 2027', 2512.63, 2);
      expectChartData(chartPts, 118, 'Fri Oct 01 2027', 2532.67, 2);
      expectChartData(chartPts, 119, 'Mon Nov 01 2027', 2552.87, 2);
      expectChartData(chartPts, 120, 'Wed Dec 01 2027', 2573.22, 2);
      expectChartData(chartPts, 121, 'Sat Jan 01 2028', 2593.74, 2);
      expectChartData(chartPts, 122, 'Tue Feb 01 2028', 2614.43, 2);
      expectChartData(chartPts, 123, 'Wed Mar 01 2028', 2635.27, 2);
      expectChartData(chartPts, 124, 'Sat Apr 01 2028', 2656.29, 2);
      expectChartData(chartPts, 125, 'Mon May 01 2028', 2677.47, 2);
      expectChartData(chartPts, 126, 'Thu Jun 01 2028', 2698.82, 2);
      expectChartData(chartPts, 127, 'Sat Jul 01 2028', 2720.34, 2);
      expectChartData(chartPts, 128, 'Tue Aug 01 2028', 2742.03, 2);
      expectChartData(chartPts, 129, 'Fri Sep 01 2028', 2763.9, 2);
      expectChartData(chartPts, 130, 'Sun Oct 01 2028', 2785.94, 2);
      expectChartData(chartPts, 131, 'Wed Nov 01 2028', 2808.15, 2);
      expectChartData(chartPts, 132, 'Fri Dec 01 2028', 2830.55, 2);
      expectChartData(chartPts, 133, 'Mon Jan 01 2029', 2853.12, 2);
      expectChartData(chartPts, 134, 'Thu Feb 01 2029', 2875.87, 2);
      expectChartData(chartPts, 135, 'Thu Mar 01 2029', 2898.8, 2);
      expectChartData(chartPts, 136, 'Sun Apr 01 2029', 2921.92, 2);
      expectChartData(chartPts, 137, 'Tue May 01 2029', 2945.22, 2);
      expectChartData(chartPts, 138, 'Fri Jun 01 2029', 2968.7, 2);
      expectChartData(chartPts, 139, 'Sun Jul 01 2029', 2992.37, 2);
      expectChartData(chartPts, 140, 'Wed Aug 01 2029', 3016.24, 2);
      expectChartData(chartPts, 141, 'Sat Sep 01 2029', 3040.29, 2);
      expectChartData(chartPts, 142, 'Mon Oct 01 2029', 3064.53, 2);
      expectChartData(chartPts, 143, 'Thu Nov 01 2029', 3088.97, 2);
      expectChartData(chartPts, 144, 'Sat Dec 01 2029', 3113.6, 2);
      expectChartData(chartPts, 145, 'Tue Jan 01 2030', 3138.43, 2);
      expectChartData(chartPts, 146, 'Fri Feb 01 2030', 3163.45, 2);
      expectChartData(chartPts, 147, 'Fri Mar 01 2030', 3188.68, 2);
      expectChartData(chartPts, 148, 'Mon Apr 01 2030', 3214.11, 2);
      expectChartData(chartPts, 149, 'Wed May 01 2030', 3239.74, 2);
      expectChartData(chartPts, 150, 'Sat Jun 01 2030', 3265.57, 2);
      expectChartData(chartPts, 151, 'Mon Jul 01 2030', 3291.61, 2);
      expectChartData(chartPts, 152, 'Thu Aug 01 2030', 3317.86, 2);
      expectChartData(chartPts, 153, 'Sun Sep 01 2030', 3344.32, 2);
      expectChartData(chartPts, 154, 'Tue Oct 01 2030', 3370.98, 2);
      expectChartData(chartPts, 155, 'Fri Nov 01 2030', 3397.87, 2);
      expectChartData(chartPts, 156, 'Sun Dec 01 2030', 3424.96, 2);
      expectChartData(chartPts, 157, 'Wed Jan 01 2031', 3452.27, 2);
      expectChartData(chartPts, 158, 'Sat Feb 01 2031', 3479.8, 2);
      expectChartData(chartPts, 159, 'Sat Mar 01 2031', 3507.55, 2);
      expectChartData(chartPts, 160, 'Tue Apr 01 2031', 3535.52, 2);
      expectChartData(chartPts, 161, 'Thu May 01 2031', 3563.71, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('Bond');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(162);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 1000, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 1000, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 1000, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 1000, -1);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 1000, -1);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 1000, -1);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 1000, -1);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 1073.87, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 1073.87, 2);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 1073.87, 2);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 1073.87, 2);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 1073.87, 2);
      expectChartData(chartPts, 18, 'Sat Jun 01 2019', 1073.87, 2);
      expectChartData(chartPts, 19, 'Mon Jul 01 2019', 1073.87, 2);
      expectChartData(chartPts, 20, 'Thu Aug 01 2019', 1073.87, 2);
      expectChartData(chartPts, 21, 'Sun Sep 01 2019', 1073.87, 2);
      expectChartData(chartPts, 22, 'Tue Oct 01 2019', 1073.87, 2);
      expectChartData(chartPts, 23, 'Fri Nov 01 2019', 1073.87, 2);
      expectChartData(chartPts, 24, 'Sun Dec 01 2019', 1073.87, 2);
      expectChartData(chartPts, 25, 'Wed Jan 01 2020', 1081.26, 2);
      expectChartData(chartPts, 26, 'Sat Feb 01 2020', 1081.26, 2);
      expectChartData(chartPts, 27, 'Sun Mar 01 2020', 1081.26, 2);
      expectChartData(chartPts, 28, 'Wed Apr 01 2020', 1081.26, 2);
      expectChartData(chartPts, 29, 'Fri May 01 2020', 1081.26, 2);
      expectChartData(chartPts, 30, 'Mon Jun 01 2020', 1081.26, 2);
      expectChartData(chartPts, 31, 'Wed Jul 01 2020', 1081.26, 2);
      expectChartData(chartPts, 32, 'Sat Aug 01 2020', 1081.26, 2);
      expectChartData(chartPts, 33, 'Tue Sep 01 2020', 1081.26, 2);
      expectChartData(chartPts, 34, 'Thu Oct 01 2020', 1081.26, 2);
      expectChartData(chartPts, 35, 'Sun Nov 01 2020', 1081.26, 2);
      expectChartData(chartPts, 36, 'Tue Dec 01 2020', 1081.26, 2);
      expectChartData(chartPts, 37, 'Fri Jan 01 2021', 1089.38, 2);
      expectChartData(chartPts, 38, 'Mon Feb 01 2021', 1089.38, 2);
      expectChartData(chartPts, 39, 'Mon Mar 01 2021', 1089.38, 2);
      expectChartData(chartPts, 40, 'Thu Apr 01 2021', 1089.38, 2);
      expectChartData(chartPts, 41, 'Sat May 01 2021', 1089.38, 2);
      expectChartData(chartPts, 42, 'Tue Jun 01 2021', 1089.38, 2);
      expectChartData(chartPts, 43, 'Thu Jul 01 2021', 1089.38, 2);
      expectChartData(chartPts, 44, 'Sun Aug 01 2021', 1089.38, 2);
      expectChartData(chartPts, 45, 'Wed Sep 01 2021', 1089.38, 2);
      expectChartData(chartPts, 46, 'Fri Oct 01 2021', 1089.38, 2);
      expectChartData(chartPts, 47, 'Mon Nov 01 2021', 1089.38, 2);
      expectChartData(chartPts, 48, 'Wed Dec 01 2021', 1089.38, 2);
      expectChartData(chartPts, 49, 'Sat Jan 01 2022', 1098.32, 2);
      expectChartData(chartPts, 50, 'Tue Feb 01 2022', 1098.32, 2);
      expectChartData(chartPts, 51, 'Tue Mar 01 2022', 1098.32, 2);
      expectChartData(chartPts, 52, 'Fri Apr 01 2022', 1098.32, 2);
      expectChartData(chartPts, 53, 'Sun May 01 2022', 1098.32, 2);
      expectChartData(chartPts, 54, 'Wed Jun 01 2022', 1098.32, 2);
      expectChartData(chartPts, 55, 'Fri Jul 01 2022', 1098.32, 2);
      expectChartData(chartPts, 56, 'Mon Aug 01 2022', 1098.32, 2);
      expectChartData(chartPts, 57, 'Thu Sep 01 2022', 1098.32, 2);
      expectChartData(chartPts, 58, 'Sat Oct 01 2022', 1098.32, 2);
      expectChartData(chartPts, 59, 'Tue Nov 01 2022', 1098.32, 2);
      expectChartData(chartPts, 60, 'Thu Dec 01 2022', 1098.32, 2);
      expectChartData(chartPts, 61, 'Sun Jan 01 2023', 1108.16, 2);
      expectChartData(chartPts, 62, 'Wed Feb 01 2023', 1108.16, 2);
      expectChartData(chartPts, 63, 'Wed Mar 01 2023', 1108.16, 2);
      expectChartData(chartPts, 64, 'Sat Apr 01 2023', 1108.16, 2);
      expectChartData(chartPts, 65, 'Mon May 01 2023', 1108.16, 2);
      expectChartData(chartPts, 66, 'Thu Jun 01 2023', 1108.16, 2);
      expectChartData(chartPts, 67, 'Sat Jul 01 2023', 1108.16, 2);
      expectChartData(chartPts, 68, 'Tue Aug 01 2023', 1108.16, 2);
      expectChartData(chartPts, 69, 'Fri Sep 01 2023', 1108.16, 2);
      expectChartData(chartPts, 70, 'Sun Oct 01 2023', 1108.16, 2);
      expectChartData(chartPts, 71, 'Wed Nov 01 2023', 1108.16, 2);
      expectChartData(chartPts, 72, 'Fri Dec 01 2023', 1108.16, 2);
      expectChartData(chartPts, 73, 'Mon Jan 01 2024', 1118.97, 2);
      expectChartData(chartPts, 74, 'Thu Feb 01 2024', 1118.97, 2);
      expectChartData(chartPts, 75, 'Fri Mar 01 2024', 1118.97, 2);
      expectChartData(chartPts, 76, 'Mon Apr 01 2024', 1118.97, 2);
      expectChartData(chartPts, 77, 'Wed May 01 2024', 1118.97, 2);
      expectChartData(chartPts, 78, 'Sat Jun 01 2024', 1118.97, 2);
      expectChartData(chartPts, 79, 'Mon Jul 01 2024', 1118.97, 2);
      expectChartData(chartPts, 80, 'Thu Aug 01 2024', 1118.97, 2);
      expectChartData(chartPts, 81, 'Sun Sep 01 2024', 1118.97, 2);
      expectChartData(chartPts, 82, 'Tue Oct 01 2024', 1118.97, 2);
      expectChartData(chartPts, 83, 'Fri Nov 01 2024', 1118.97, 2);
      expectChartData(chartPts, 84, 'Sun Dec 01 2024', 1118.97, 2);
      expectChartData(chartPts, 85, 'Wed Jan 01 2025', 1099.48, 2);
      expectChartData(chartPts, 86, 'Sat Feb 01 2025', 1099.48, 2);
      expectChartData(chartPts, 87, 'Sat Mar 01 2025', 1099.48, 2);
      expectChartData(chartPts, 88, 'Tue Apr 01 2025', 1099.48, 2);
      expectChartData(chartPts, 89, 'Thu May 01 2025', 1099.48, 2);
      expectChartData(chartPts, 90, 'Sun Jun 01 2025', 1099.48, 2);
      expectChartData(chartPts, 91, 'Tue Jul 01 2025', 1099.48, 2);
      expectChartData(chartPts, 92, 'Fri Aug 01 2025', 1099.48, 2);
      expectChartData(chartPts, 93, 'Mon Sep 01 2025', 1099.48, 2);
      expectChartData(chartPts, 94, 'Wed Oct 01 2025', 1099.48, 2);
      expectChartData(chartPts, 95, 'Sat Nov 01 2025', 1099.48, 2);
      expectChartData(chartPts, 96, 'Mon Dec 01 2025', 1099.48, 2);
      expectChartData(chartPts, 97, 'Thu Jan 01 2026', 1078.05, 2);
      expectChartData(chartPts, 98, 'Sun Feb 01 2026', 1078.05, 2);
      expectChartData(chartPts, 99, 'Sun Mar 01 2026', 1078.05, 2);
      expectChartData(chartPts, 100, 'Wed Apr 01 2026', 1078.05, 2);
      expectChartData(chartPts, 101, 'Fri May 01 2026', 1078.05, 2);
      expectChartData(chartPts, 102, 'Mon Jun 01 2026', 1078.05, 2);
      expectChartData(chartPts, 103, 'Wed Jul 01 2026', 1078.05, 2);
      expectChartData(chartPts, 104, 'Sat Aug 01 2026', 1078.05, 2);
      expectChartData(chartPts, 105, 'Tue Sep 01 2026', 1078.05, 2);
      expectChartData(chartPts, 106, 'Thu Oct 01 2026', 1078.05, 2);
      expectChartData(chartPts, 107, 'Sun Nov 01 2026', 1078.05, 2);
      expectChartData(chartPts, 108, 'Tue Dec 01 2026', 1078.05, 2);
      expectChartData(chartPts, 109, 'Fri Jan 01 2027', 1054.47, 2);
      expectChartData(chartPts, 110, 'Mon Feb 01 2027', 1054.47, 2);
      expectChartData(chartPts, 111, 'Mon Mar 01 2027', 1054.47, 2);
      expectChartData(chartPts, 112, 'Thu Apr 01 2027', 1054.47, 2);
      expectChartData(chartPts, 113, 'Sat May 01 2027', 1054.47, 2);
      expectChartData(chartPts, 114, 'Tue Jun 01 2027', 1054.47, 2);
      expectChartData(chartPts, 115, 'Thu Jul 01 2027', 1054.47, 2);
      expectChartData(chartPts, 116, 'Sun Aug 01 2027', 1054.47, 2);
      expectChartData(chartPts, 117, 'Wed Sep 01 2027', 1054.47, 2);
      expectChartData(chartPts, 118, 'Fri Oct 01 2027', 1054.47, 2);
      expectChartData(chartPts, 119, 'Mon Nov 01 2027', 1054.47, 2);
      expectChartData(chartPts, 120, 'Wed Dec 01 2027', 1054.47, 2);
      expectChartData(chartPts, 121, 'Sat Jan 01 2028', 1028.53, 2);
      expectChartData(chartPts, 122, 'Tue Feb 01 2028', 1028.53, 2);
      expectChartData(chartPts, 123, 'Wed Mar 01 2028', 1028.53, 2);
      expectChartData(chartPts, 124, 'Sat Apr 01 2028', 1028.53, 2);
      expectChartData(chartPts, 125, 'Mon May 01 2028', 1028.53, 2);
      expectChartData(chartPts, 126, 'Thu Jun 01 2028', 1028.53, 2);
      expectChartData(chartPts, 127, 'Sat Jul 01 2028', 1028.53, 2);
      expectChartData(chartPts, 128, 'Tue Aug 01 2028', 1028.53, 2);
      expectChartData(chartPts, 129, 'Fri Sep 01 2028', 1028.53, 2);
      expectChartData(chartPts, 130, 'Sun Oct 01 2028', 1028.53, 2);
      expectChartData(chartPts, 131, 'Wed Nov 01 2028', 1028.53, 2);
      expectChartData(chartPts, 132, 'Fri Dec 01 2028', 1028.53, 2);
      expectChartData(chartPts, 133, 'Mon Jan 01 2029', 1000.0, 2);
      expectChartData(chartPts, 134, 'Thu Feb 01 2029', 1000.0, 2);
      expectChartData(chartPts, 135, 'Thu Mar 01 2029', 1000.0, 2);
      expectChartData(chartPts, 136, 'Sun Apr 01 2029', 1000.0, 2);
      expectChartData(chartPts, 137, 'Tue May 01 2029', 1000.0, 2);
      expectChartData(chartPts, 138, 'Fri Jun 01 2029', 1000.0, 2);
      expectChartData(chartPts, 139, 'Sun Jul 01 2029', 1000.0, 2);
      expectChartData(chartPts, 140, 'Wed Aug 01 2029', 1000.0, 2);
      expectChartData(chartPts, 141, 'Sat Sep 01 2029', 1000.0, 2);
      expectChartData(chartPts, 142, 'Mon Oct 01 2029', 1000.0, 2);
      expectChartData(chartPts, 143, 'Thu Nov 01 2029', 1000.0, 2);
      expectChartData(chartPts, 144, 'Sat Dec 01 2029', 1000.0, 2);
      expectChartData(chartPts, 145, 'Tue Jan 01 2030', 1000.0, 2);
      expectChartData(chartPts, 146, 'Fri Feb 01 2030', 1000.0, 2);
      expectChartData(chartPts, 147, 'Fri Mar 01 2030', 1000.0, 2);
      expectChartData(chartPts, 148, 'Mon Apr 01 2030', 1000.0, 2);
      expectChartData(chartPts, 149, 'Wed May 01 2030', 1000.0, 2);
      expectChartData(chartPts, 150, 'Sat Jun 01 2030', 1000.0, 2);
      expectChartData(chartPts, 151, 'Mon Jul 01 2030', 1000.0, 2);
      expectChartData(chartPts, 152, 'Thu Aug 01 2030', 1000.0, 2);
      expectChartData(chartPts, 153, 'Sun Sep 01 2030', 1000.0, 2);
      expectChartData(chartPts, 154, 'Tue Oct 01 2030', 1000.0, 2);
      expectChartData(chartPts, 155, 'Fri Nov 01 2030', 1000.0, 2);
      expectChartData(chartPts, 156, 'Sun Dec 01 2030', 1000.0, 2);
      expectChartData(chartPts, 157, 'Wed Jan 01 2031', 1000.0, 2);
      expectChartData(chartPts, 158, 'Sat Feb 01 2031', 1000.0, 2);
      expectChartData(chartPts, 159, 'Sat Mar 01 2031', 1000.0, 2);
      expectChartData(chartPts, 160, 'Tue Apr 01 2031', 1000.0, 2);
      expectChartData(chartPts, 161, 'Thu May 01 2031', 1000.0, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('display quantised deltas', () => {
    const json = `{
      "name":"quantised deltas",
      "assets":[{
        "NAME":"Share","VALUE":"1","QUANTITY":"100","START":"Sat Jun 18 2022","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0","LIABILITY":""}],
      "incomes":[],
      "expenses":[],
      "triggers":[],
      "settings":[{
        "NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},{
        "NAME":"End of view range","VALUE":"2025","HINT":"Date at the end of range to be plotted","TYPE":"view"},{
        "NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{
        "NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{
        "NAME":"Beginning of view range","VALUE":"1 Jan 2022","HINT":"Date at the start of range to be plotted","TYPE":"view"}],"transactions":[{
        "NAME":"GetRich","CATEGORY":"","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0","TO":"Share","TO_ABSOLUTE":true,"TO_VALUE":"100","DATE":"Sat Jun 18 2023","STOP_DATE":"2025","RECURRENCE":"1y","TYPE":"custom"}],"version":9}`;

    const viewSettings = defaultTestViewSettings();
    const model = makeModelFromJSON(json, viewSettings);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(34);
    expectEvals(evals, 0, 'quantityShare', 'Sat Jun 18 2022', 100, -1);
    expectEvals(evals, 1, 'Share', 'Sat Jun 18 2022', 100, -1);
    expectEvals(evals, 2, 'Share', 'Mon Jul 18 2022', 100, -1);
    expectEvals(evals, 3, 'Share', 'Thu Aug 18 2022', 100, -1);
    expectEvals(evals, 4, 'Share', 'Sun Sep 18 2022', 100, -1);
    expectEvals(evals, 5, 'Share', 'Tue Oct 18 2022', 100, -1);
    expectEvals(evals, 6, 'Share', 'Fri Nov 18 2022', 100, -1);
    expectEvals(evals, 7, 'Share', 'Sun Dec 18 2022', 100, -1);
    expectEvals(evals, 8, 'Share', 'Wed Jan 18 2023', 100, -1);
    expectEvals(evals, 9, 'Share', 'Sat Feb 18 2023', 100, -1);
    expectEvals(evals, 10, 'Share', 'Sat Mar 18 2023', 100, -1);
    expectEvals(evals, 11, 'Share', 'Tue Apr 18 2023', 100, -1);
    expectEvals(evals, 12, 'Share', 'Thu May 18 2023', 100, -1);
    expectEvals(evals, 13, 'Share', 'Sun Jun 18 2023', 100, -1);
    expectEvals(evals, 14, 'quantityShare', 'Sun Jun 18 2023', 200, -1);
    expectEvals(evals, 15, 'Share', 'Tue Jul 18 2023', 200, -1);
    expectEvals(evals, 16, 'Share', 'Fri Aug 18 2023', 200, -1);
    expectEvals(evals, 17, 'Share', 'Mon Sep 18 2023', 200, -1);
    expectEvals(evals, 18, 'Share', 'Wed Oct 18 2023', 200, -1);
    expectEvals(evals, 19, 'Share', 'Sat Nov 18 2023', 200, -1);
    expectEvals(evals, 20, 'Share', 'Mon Dec 18 2023', 200, -1);
    expectEvals(evals, 21, 'Share', 'Thu Jan 18 2024', 200, -1);
    expectEvals(evals, 22, 'Share', 'Sun Feb 18 2024', 200, -1);
    expectEvals(evals, 23, 'Share', 'Mon Mar 18 2024', 200, -1);
    expectEvals(evals, 24, 'Share', 'Thu Apr 18 2024', 200, -1);
    expectEvals(evals, 25, 'Share', 'Sat May 18 2024', 200, -1);
    expectEvals(evals, 26, 'Share', 'Tue Jun 18 2024', 200, -1);
    expectEvals(evals, 27, 'quantityShare', 'Tue Jun 18 2024', 300, -1);
    expectEvals(evals, 28, 'Share', 'Thu Jul 18 2024', 300, -1);
    expectEvals(evals, 29, 'Share', 'Sun Aug 18 2024', 300, -1);
    expectEvals(evals, 30, 'Share', 'Wed Sep 18 2024', 300, -1);
    expectEvals(evals, 31, 'Share', 'Fri Oct 18 2024', 300, -1);
    expectEvals(evals, 32, 'Share', 'Mon Nov 18 2024', 300, -1);
    expectEvals(evals, 33, 'Share', 'Wed Dec 18 2024', 300, -1);

    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Share/Share');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 1, 'Sun Jan 01 2023', 100, -1);
      expectChartData(chartPts, 2, 'Mon Jan 01 2024', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('unidentified/Share');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 1, 'Sun Jan 01 2023', 0, -1);
      expectChartData(chartPts, 2, 'Mon Jan 01 2024', 100, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('delayed view start date - early', () => {
    const json = `{
      "triggers":[{"NAME":"Start","DATE":"Sat Apr 06 2019"}],
      "expenses":[],
      "incomes":[],
      "transactions":[
        {"NAME":"Revaluecpi 6","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"0","DATE":"6 April 2027","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
        {"DATE":"Wed Apr 01 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revaluecpi 1","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"10","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondSmallTargetValue 1","TO":"BondSmallTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"1000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondMediumTargetValue 1","TO":"BondMediumTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"5000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondBigTargetVal 1","TO":"BondBigTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"6000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"1 October 2028","FROM":"FixedTermBonds","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"MatureBondFlat5y","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"bondMature","CATEGORY":""},
        {"DATE":"2032","FROM":"Cash/Bonds","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CreateEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},
        {"DATE":"1 October 2023","FROM":"Cash","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"BuyBondFlat5y","TO":"FixedTermBonds","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"bondInvest","CATEGORY":""}],
      "assets":[
        {"NAME":"FixedTermBonds","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":"Bonds"},
        {"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
        {"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],
      "settings":[
        {"NAME":"variableLow","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"variableHigh","VALUE":"5","HINT":"","TYPE":"adjustable"},
        {"NAME":"variableCount","VALUE":"2","HINT":"","TYPE":"adjustable"},
        {"NAME":"variable","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"USD","VALUE":"1","HINT":"","TYPE":"const"},
        {"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
        {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
        {"NAME":"End of view range","VALUE":"2034","HINT":"Date at the end of range to be plotted","TYPE":"view"},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
        {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
        {"NAME":"BondSmallTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"BondMediumTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"bondInterest","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"BondBigTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"Beginning of view range","VALUE":"10 April 2021+variable1y","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
      "version":9,
      "name":"Test"}`;

      const viewSettings = defaultTestViewSettings();
      const model = makeModelFromJSON(json, viewSettings);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(548);


    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('FixedTermBonds');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(13);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 11785.54, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 11785.54, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 11785.54, 2);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 11785.54, 2);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 11785.54, 2);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 0, -1);
      expectChartData(chartPts, 9, 'Wed Apr 10 2030', 0, -1);
      expectChartData(chartPts, 10, 'Thu Apr 10 2031', 0, -1);
      expectChartData(chartPts, 11, 'Sat Apr 10 2032', 0, -1);
      expectChartData(chartPts, 12, 'Sun Apr 10 2033', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Estate');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(13);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 0, -1);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 0, -1);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 0, -1);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 0, -1);
      expectChartData(chartPts, 9, 'Wed Apr 10 2030', 0, -1);
      expectChartData(chartPts, 10, 'Thu Apr 10 2031', 0, -1);
      expectChartData(chartPts, 11, 'Sat Apr 10 2032', 4467.65, 2);
      expectChartData(chartPts, 12, 'Sun Apr 10 2033', 4467.65, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(13);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', -7317.89, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', -7317.89, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', -7317.89, 2);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', -7317.89, 2);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', -7317.89, 2);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 4467.65, 2);
      expectChartData(chartPts, 9, 'Wed Apr 10 2030', 4467.65, 2);
      expectChartData(chartPts, 10, 'Thu Apr 10 2031', 4467.65, 2);
      expectChartData(chartPts, 11, 'Sat Apr 10 2032', 0, -1);
      expectChartData(chartPts, 12, 'Sun Apr 10 2033', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('delayed view start date - late', () => {
    const json = `{
      "triggers":[{"NAME":"Start","DATE":"Sat Apr 06 2019"}],
      "expenses":[],
      "incomes":[],
      "transactions":[
        {"NAME":"Revaluecpi 6","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"0","DATE":"6 April 2027","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
        {"DATE":"Wed Apr 01 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revaluecpi 1","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"10","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondSmallTargetValue 1","TO":"BondSmallTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"1000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondMediumTargetValue 1","TO":"BondMediumTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"5000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondBigTargetVal 1","TO":"BondBigTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"6000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"1 October 2028","FROM":"FixedTermBonds","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"MatureBondFlat5y","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"bondMature","CATEGORY":""},
        {"DATE":"2032","FROM":"Cash/Bonds","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CreateEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},
        {"DATE":"1 October 2023","FROM":"Cash","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"BuyBondFlat5y","TO":"FixedTermBonds","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"bondInvest","CATEGORY":""}],
      "assets":[
        {"NAME":"FixedTermBonds","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":"Bonds"},
        {"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
        {"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],
      "settings":[
        {"NAME":"variableLow","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"variableHigh","VALUE":"5","HINT":"","TYPE":"adjustable"},
        {"NAME":"variableCount","VALUE":"2","HINT":"","TYPE":"adjustable"},
        {"NAME":"variable","VALUE":"5","HINT":"","TYPE":"adjustable"},
        {"NAME":"USD","VALUE":"1","HINT":"","TYPE":"const"},
        {"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
        {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
        {"NAME":"End of view range","VALUE":"2034","HINT":"Date at the end of range to be plotted","TYPE":"view"},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
        {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
        {"NAME":"BondSmallTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"BondMediumTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"bondInterest","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"BondBigTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
        {"NAME":"Beginning of view range","VALUE":"10 April 2021+variable1y","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
      "version":9,
      "name":"Test"}`;

    const viewSettings = defaultTestViewSettings();
    const model = makeModelFromJSON(json, viewSettings);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(548);

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('FixedTermBonds');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, 'Fri Apr 10 2026', 11785.54, 2);
      expectChartData(chartPts, 1, 'Sat Apr 10 2027', 11785.54, 2);
      expectChartData(chartPts, 2, 'Mon Apr 10 2028', 11785.54, 2);
      expectChartData(chartPts, 3, 'Tue Apr 10 2029', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 10 2030', 0, -1);
      expectChartData(chartPts, 5, 'Thu Apr 10 2031', 0, -1);
      expectChartData(chartPts, 6, 'Sat Apr 10 2032', 0, -1);
      expectChartData(chartPts, 7, 'Sun Apr 10 2033', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Estate');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, 'Fri Apr 10 2026', 0, -1);
      expectChartData(chartPts, 1, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 3, 'Tue Apr 10 2029', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 10 2030', 0, -1);
      expectChartData(chartPts, 5, 'Thu Apr 10 2031', 0, -1);
      expectChartData(chartPts, 6, 'Sat Apr 10 2032', 4467.65, 2);
      expectChartData(chartPts, 7, 'Sun Apr 10 2033', 4467.65, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, 'Fri Apr 10 2026', -7317.89, 2);
      expectChartData(chartPts, 1, 'Sat Apr 10 2027', -7317.89, 2);
      expectChartData(chartPts, 2, 'Mon Apr 10 2028', -7317.89, 2);
      expectChartData(chartPts, 3, 'Tue Apr 10 2029', 4467.65, 2);
      expectChartData(chartPts, 4, 'Wed Apr 10 2030', 4467.65, 2);
      expectChartData(chartPts, 5, 'Thu Apr 10 2031', 4467.65, 2);
      expectChartData(chartPts, 6, 'Sat Apr 10 2032', 0, -1);
      expectChartData(chartPts, 7, 'Sun Apr 10 2033', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('early view end date', () => {
    const json = `{
      "triggers":[{"NAME":"Start","DATE":"Sat Apr 06 2019"}],
      "expenses":[],
      "incomes":[],
      "transactions":[
        {"NAME":"Revaluecpi 6","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"0","DATE":"6 April 2027","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
        {"DATE":"Wed Apr 01 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revaluecpi 1","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"10","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondSmallTargetValue 1","TO":"BondSmallTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"1000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondMediumTargetValue 1","TO":"BondMediumTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"5000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"Start","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueBondBigTargetVal 1","TO":"BondBigTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"6000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
        {"DATE":"1 October 2028","FROM":"FixedTermBonds","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"MatureBond5y","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"2031","RECURRENCE":"1y","TYPE":"bondMature","CATEGORY":""},
        {"DATE":"2032","FROM":"Cash/Bonds","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CreateEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},{"DATE":"1 October 2023","FROM":"Cash","FROM_VALUE":"BMVBondBigTargetValue","FROM_ABSOLUTE":true,"NAME":"BuyBond5y","TO":"FixedTermBonds","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"2026","RECURRENCE":"1y","TYPE":"bondInvest","CATEGORY":""}],
      "assets":[{"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
      {"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
      {"NAME":"FixedTermBonds","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":"Bonds"}],
      "settings":[{"NAME":"variableLow","VALUE":"0","HINT":"","TYPE":"adjustable"},{"NAME":"variableHigh","VALUE":"5","HINT":"","TYPE":"adjustable"},
      {"NAME":"variableCount","VALUE":"2","HINT":"","TYPE":"adjustable"},{"NAME":"variable","VALUE":"0","HINT":"","TYPE":"adjustable"},
      {"NAME":"USD","VALUE":"1","HINT":"","TYPE":"const"},
      {"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
      {"NAME":"End of view range","VALUE":"Tue Jan 01 2030","HINT":"Date at the end of range to be plotted","TYPE":"view"},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
      {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
      {"NAME":"BondSmallTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
      {"NAME":"BondMediumTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
      {"NAME":"bondInterest","VALUE":"0","HINT":"","TYPE":"adjustable"},
      {"NAME":"BondBigTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
      {"NAME":"Beginning of view range","VALUE":"10 April 2021+variable1y","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
      "version":9,
      "name":"bonds"
      }`;

    const viewSettings = defaultTestViewSettings();
    const model = makeModelFromJSON(json, viewSettings);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(410);

    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(4);
    expect(result.assetData[0].item.NAME).toBe('BuyBond5y/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(9);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', -7317.89, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', -7317.89, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', -7317.89, 2);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('BuyBond5y/FixedTermBonds');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(9);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 11785.54, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 11785.54, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 11785.54, 2);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('MatureBond5y/FixedTermBonds');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(9);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 0, -1);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 0, -1);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 0, -1);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', -11785.54, 2);
    }

    expect(result.assetData[3].item.NAME).toBe('MatureBond5y/Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(9);
      expectChartData(chartPts, 0, 'Sat Apr 10 2021', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 10 2022', 0, -1);
      expectChartData(chartPts, 2, 'Mon Apr 10 2023', 0, -1);
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 0, -1);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 0, -1);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 0, -1);
      expectChartData(chartPts, 6, 'Sat Apr 10 2027', 0, -1);
      expectChartData(chartPts, 7, 'Mon Apr 10 2028', 0, -1);
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 11785.54, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });
});
