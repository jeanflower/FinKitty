import {
  viewFrequency,
  chartViewType,
  chartDeltas,
  allItems,
  birthDate,
  constType,
  cpi,
  monthly,
  viewType,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleAsset,
  simpleTransaction,
  defaultModelSettings,
} from '../../models/exampleModels';
import { makeModelFromJSON, setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { Context, log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  expectEvals,
  expectChartData,
  printTestCodeForChart,
  defaultTestViewSettings,
  getTestEvaluations,
} from './algoTestUtils';

expectEvals;
expectChartData;
printTestCodeForChart;
makeModelFromJSON;

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debug test', (done) => {
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

    done();
  });
});
