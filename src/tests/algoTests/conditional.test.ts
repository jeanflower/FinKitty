import {
  CASH_ASSET_NAME,
  liquidateAsset,
  separator,
  assetChartFocus,
  allItems,
  chartViewType,
  chartDeltas,
  constType,
  payOffDebt,
  revalue,
  revalueSetting,
  viewType,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleExpense,
  simpleTransaction,
  simpleAsset,
  defaultModelSettings,
  simpleSetting,
  getMinimalModelCopy,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { printDebug, Context, log } from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
  expectChartData,
} from './algoTestUtils';

log;

describe('conditional tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it('conditional transaction stops negative cash absolute', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stff',
          FROM_VALUE: '50',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '50',
          DATE: 'February 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(28);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Fri Feb 02 2018', 222, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 5, 'Stff', 'Fri Mar 02 2018', 222, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stff', 'Mon Apr 02 2018', 222, -1);
    expectEvals(evals, 8, 'Food', 'Tue Apr 03 2018', 10, -1);
    // After paying for Food, Cash is reduced to 5.
    expectEvals(evals, 9, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 11, 'Stff', 'Wed May 02 2018', 222, -1);
    expectEvals(evals, 12, 'Food', 'Thu May 03 2018', 10, -1);
    // After paying for Food, Cash is reduced to -5.
    expectEvals(evals, 13, 'Cash', 'Thu May 03 2018', -5, -1);
    expectEvals(evals, 14, 'Cash', 'Sat Jun 02 2018', -5, -1);
    expectEvals(evals, 15, 'Stff', 'Sat Jun 02 2018', 222, -1);
    // Recognise that Cash is negative and take action.
    // Sell some Stff.
    expectEvals(evals, 16, 'Stff', 'Sat Jun 02 2018', 172, -1);
    // See a Cash injection.
    expectEvals(evals, 17, 'Cash', 'Sat Jun 02 2018', 45, -1);
    expectEvals(evals, 18, 'Food', 'Sun Jun 03 2018', 10, -1);
    // Pay for Food again.
    expectEvals(evals, 19, 'Cash', 'Sun Jun 03 2018', 35, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Jul 02 2018', 35, -1);
    expectEvals(evals, 21, 'Stff', 'Mon Jul 02 2018', 172, -1);
    expectEvals(evals, 22, 'Food', 'Tue Jul 03 2018', 10, -1);
    // Pay for Food again.
    expectEvals(evals, 23, 'Cash', 'Tue Jul 03 2018', 25, -1);
    expectEvals(evals, 24, 'Cash', 'Thu Aug 02 2018', 25, -1);
    expectEvals(evals, 25, 'Stff', 'Thu Aug 02 2018', 172, -1);
    expectEvals(evals, 26, 'Cash', 'Sun Sep 02 2018', 25, -1);
    expectEvals(evals, 27, 'Stff', 'Sun Sep 02 2018', 172, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 222, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 222, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 222, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 222, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 222, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 172, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 172, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 172, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 15, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -5, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 35, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 25, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 25, -1);
    }
    done();
  });

  it('conditional transaction stops negative cash proportional', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stff',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(32);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Fri Feb 02 2018', 222, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 5, 'Stff', 'Fri Mar 02 2018', 222, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stff', 'Mon Apr 02 2018', 222, -1);
    expectEvals(evals, 8, 'Food', 'Tue Apr 03 2018', 10, -1);
    // Buy 10 food drops cash from 15 to 5
    expectEvals(evals, 9, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 11, 'Stff', 'Wed May 02 2018', 222, -1);
    expectEvals(evals, 12, 'Food', 'Thu May 03 2018', 10, -1);
    // Buy 10 food drops cash from 5 to -5
    expectEvals(evals, 13, 'Cash', 'Thu May 03 2018', -5, -1);
    expectEvals(evals, 14, 'Cash', 'Sat Jun 02 2018', -5, -1);
    // Notice cash is negative
    expectEvals(evals, 15, 'Stff', 'Sat Jun 02 2018', 222, -1);
    // Liquidate 100% of the debt - i.e. sell 5 Stff
    expectEvals(evals, 16, 'Stff', 'Sat Jun 02 2018', 217, -1);
    // inject 5 to Cash
    expectEvals(evals, 17, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 18, 'Food', 'Sun Jun 03 2018', 10, -1);
    expectEvals(evals, 19, 'Cash', 'Sun Jun 03 2018', -10, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Jul 02 2018', -10, -1);
    expectEvals(evals, 21, 'Stff', 'Mon Jul 02 2018', 217, -1);
    expectEvals(evals, 22, 'Stff', 'Mon Jul 02 2018', 207, -1);
    expectEvals(evals, 23, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 24, 'Food', 'Tue Jul 03 2018', 10, -1);
    expectEvals(evals, 25, 'Cash', 'Tue Jul 03 2018', -10, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Aug 02 2018', -10, -1);
    expectEvals(evals, 27, 'Stff', 'Thu Aug 02 2018', 207, -1);
    expectEvals(evals, 28, 'Stff', 'Thu Aug 02 2018', 197, -1);
    expectEvals(evals, 29, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 30, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 31, 'Stff', 'Sun Sep 02 2018', 197, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 222, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 222, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 222, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 222, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 222, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 217, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 207, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 197, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 15, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -5, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }
    done();
  });

  it('conditional transaction stops negative cash abs->proportional', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stff',
          FROM_VALUE: '20',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(32);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Fri Feb 02 2018', 222, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 5, 'Stff', 'Fri Mar 02 2018', 222, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stff', 'Mon Apr 02 2018', 222, -1);
    expectEvals(evals, 8, 'Food', 'Tue Apr 03 2018', 10, -1);
    // Buy 10 food drops cash from 15 to 5
    expectEvals(evals, 9, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 11, 'Stff', 'Wed May 02 2018', 222, -1);
    expectEvals(evals, 12, 'Food', 'Thu May 03 2018', 10, -1);
    // Buy 10 food drops cash from 5 to -5
    expectEvals(evals, 13, 'Cash', 'Thu May 03 2018', -5, -1);
    expectEvals(evals, 14, 'Cash', 'Sat Jun 02 2018', -5, -1);
    // Notice cash is negative
    expectEvals(evals, 15, 'Stff', 'Sat Jun 02 2018', 222, -1);
    // Liquidate 100% of the debt - i.e. sell 5 Stff
    expectEvals(evals, 16, 'Stff', 'Sat Jun 02 2018', 217, -1);
    // inject 5 to Cash
    expectEvals(evals, 17, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 18, 'Food', 'Sun Jun 03 2018', 10, -1);
    expectEvals(evals, 19, 'Cash', 'Sun Jun 03 2018', -10, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Jul 02 2018', -10, -1);
    expectEvals(evals, 21, 'Stff', 'Mon Jul 02 2018', 217, -1);
    expectEvals(evals, 22, 'Stff', 'Mon Jul 02 2018', 207, -1);
    expectEvals(evals, 23, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 24, 'Food', 'Tue Jul 03 2018', 10, -1);
    expectEvals(evals, 25, 'Cash', 'Tue Jul 03 2018', -10, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Aug 02 2018', -10, -1);
    expectEvals(evals, 27, 'Stff', 'Thu Aug 02 2018', 207, -1);
    expectEvals(evals, 28, 'Stff', 'Thu Aug 02 2018', 197, -1);
    expectEvals(evals, 29, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 30, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 31, 'Stff', 'Sun Sep 02 2018', 197, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 222, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 222, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 222, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 222, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 222, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 217, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 207, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 197, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 15, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -5, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }
    done();
  });

  it('conditional transaction transfers more than once', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '30.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff more than once if I need to',
          FROM: 'Stff',
          FROM_VALUE: '50',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '50',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(32);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Fri Feb 02 2018', 222, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 5, 'Stff', 'Fri Mar 02 2018', 222, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stff', 'Mon Apr 02 2018', 222, -1);
    expectEvals(evals, 8, 'Food', 'Tue Apr 03 2018', 30, -1);
    // pay for Food
    expectEvals(evals, 9, 'Cash', 'Tue Apr 03 2018', -15, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 02 2018', -15, -1);
    expectEvals(evals, 11, 'Stff', 'Wed May 02 2018', 222, -1);
    // sell some stuff
    expectEvals(evals, 12, 'Stff', 'Wed May 02 2018', 172, -1);
    // get cash injection
    expectEvals(evals, 13, 'Cash', 'Wed May 02 2018', 35, -1);
    expectEvals(evals, 14, 'Food', 'Thu May 03 2018', 30, -1);
    // pay for Food
    expectEvals(evals, 15, 'Cash', 'Thu May 03 2018', 5, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Jun 02 2018', 5, -1);
    expectEvals(evals, 17, 'Stff', 'Sat Jun 02 2018', 172, -1);
    expectEvals(evals, 18, 'Food', 'Sun Jun 03 2018', 30, -1);
    // pay for Food
    expectEvals(evals, 19, 'Cash', 'Sun Jun 03 2018', -25, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Jul 02 2018', -25, -1);
    expectEvals(evals, 21, 'Stff', 'Mon Jul 02 2018', 172, -1);
    // sell some stuff
    expectEvals(evals, 22, 'Stff', 'Mon Jul 02 2018', 122, -1);
    // get cash injection
    expectEvals(evals, 23, 'Cash', 'Mon Jul 02 2018', 25, -1);
    expectEvals(evals, 24, 'Food', 'Tue Jul 03 2018', 30, -1);
    // pay for Food
    expectEvals(evals, 25, 'Cash', 'Tue Jul 03 2018', -5, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Aug 02 2018', -5, -1);
    expectEvals(evals, 27, 'Stff', 'Thu Aug 02 2018', 122, -1);
    // sell some stuff
    expectEvals(evals, 28, 'Stff', 'Thu Aug 02 2018', 72, -1);
    // get cash injection
    expectEvals(evals, 29, 'Cash', 'Thu Aug 02 2018', 45, -1);
    expectEvals(evals, 30, 'Cash', 'Sun Sep 02 2018', 45, -1);
    expectEvals(evals, 31, 'Stff', 'Sun Sep 02 2018', 72, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart( result );

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 30, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 30, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 30, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 30, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 222, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 222, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 222, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 222, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 172, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 172, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 122, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 72, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 15, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -15, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 5, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -25, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -5, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 45, -1);
    }
    done();
  });

  it('conditional transaction transfers stop when funds run out abs to', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '30.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff more than once if I need to',
          FROM: 'Stff',
          FROM_VALUE: '50',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '50',
          DATE: 'March 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'March 2 2018',
          VALUE: '72',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(26);
    expectEvals(evals, 0, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Fri Mar 02 2018', 72, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Mon Apr 02 2018', 72, -1);
    expectEvals(evals, 4, 'Food', 'Tue Apr 03 2018', 30, -1);
    // Pay for Food.
    expectEvals(evals, 5, 'Cash', 'Tue Apr 03 2018', -15, -1);
    expectEvals(evals, 6, 'Cash', 'Wed May 02 2018', -15, -1);
    expectEvals(evals, 7, 'Stff', 'Wed May 02 2018', 72, -1);
    // Sell some asset.
    expectEvals(evals, 8, 'Stff', 'Wed May 02 2018', 22, -1);
    // Get a cash injection.
    expectEvals(evals, 9, 'Cash', 'Wed May 02 2018', 35, -1);
    expectEvals(evals, 10, 'Food', 'Thu May 03 2018', 30, -1);
    // Pay for Food.
    expectEvals(evals, 11, 'Cash', 'Thu May 03 2018', 5, -1);
    expectEvals(evals, 12, 'Cash', 'Sat Jun 02 2018', 5, -1);
    expectEvals(evals, 13, 'Stff', 'Sat Jun 02 2018', 22, -1);
    expectEvals(evals, 14, 'Food', 'Sun Jun 03 2018', 30, -1);
    // Pay for Food.
    expectEvals(evals, 15, 'Cash', 'Sun Jun 03 2018', -25, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Jul 02 2018', -25, -1);
    // Cash is negative sell remaining stff
    expectEvals(evals, 17, 'Stff', 'Mon Jul 02 2018', 22, -1);
    // sell 22
    expectEvals(evals, 18, 'Stff', 'Mon Jul 02 2018', 0, -1);
    // add 50 !! we made a profit !! because 50 was absolute !!
    expectEvals(evals, 19, 'Cash', 'Mon Jul 02 2018', 25, -1);
    expectEvals(evals, 20, 'Food', 'Tue Jul 03 2018', 30, -1);
    expectEvals(evals, 21, 'Cash', 'Tue Jul 03 2018', -5, -1);
    expectEvals(evals, 22, 'Cash', 'Thu Aug 02 2018', -5, -1);
    expectEvals(evals, 23, 'Stff', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 24, 'Cash', 'Sun Sep 02 2018', -5, -1);
    expectEvals(evals, 25, 'Stff', 'Sun Sep 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 30, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 30, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 30, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 30, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 72, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 72, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 22, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 22, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -15, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 5, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -25, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', -5, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', -5, -1);
    }
    done();
  });

  it('conditional transaction transfers stop when funds run out prop to', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '30.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff more than once if I need to',
          FROM: 'Stff',
          FROM_VALUE: '50',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'March 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'March 2 2018',
          VALUE: '72',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(28);
    expectEvals(evals, 0, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stff', 'Fri Mar 02 2018', 72, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 3, 'Stff', 'Mon Apr 02 2018', 72, -1);
    expectEvals(evals, 4, 'Food', 'Tue Apr 03 2018', 30, -1);
    expectEvals(evals, 5, 'Cash', 'Tue Apr 03 2018', -15, -1);
    expectEvals(evals, 6, 'Cash', 'Wed May 02 2018', -15, -1);
    expectEvals(evals, 7, 'Stff', 'Wed May 02 2018', 72, -1);
    // sell 15 - just what we need to clear cash debt
    expectEvals(evals, 8, 'Stff', 'Wed May 02 2018', 57, -1);
    expectEvals(evals, 9, 'Cash', 'Wed May 02 2018', 0, -1);
    expectEvals(evals, 10, 'Food', 'Thu May 03 2018', 30, -1);
    expectEvals(evals, 11, 'Cash', 'Thu May 03 2018', -30, -1);
    expectEvals(evals, 12, 'Cash', 'Sat Jun 02 2018', -30, -1);
    expectEvals(evals, 13, 'Stff', 'Sat Jun 02 2018', 57, -1);
    // sell 30 - just what we need to clear cash debt
    expectEvals(evals, 14, 'Stff', 'Sat Jun 02 2018', 27, -1);
    expectEvals(evals, 15, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 16, 'Food', 'Sun Jun 03 2018', 30, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Jun 03 2018', -30, -1);
    expectEvals(evals, 18, 'Cash', 'Mon Jul 02 2018', -30, -1);
    expectEvals(evals, 19, 'Stff', 'Mon Jul 02 2018', 27, -1);
    // sell 27 - that's all we have left
    expectEvals(evals, 20, 'Stff', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 21, 'Cash', 'Mon Jul 02 2018', -3, -1);
    expectEvals(evals, 22, 'Food', 'Tue Jul 03 2018', 30, -1);
    expectEvals(evals, 23, 'Cash', 'Tue Jul 03 2018', -33, -1);
    expectEvals(evals, 24, 'Cash', 'Thu Aug 02 2018', -33, -1);
    expectEvals(evals, 25, 'Stff', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 26, 'Cash', 'Sun Sep 02 2018', -33, -1);
    expectEvals(evals, 27, 'Stff', 'Sun Sep 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 30, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 30, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 30, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 30, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 72, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 72, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 57, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 27, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -15, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -30, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -30, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', -33, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', -33, -1);
    }
    done();
  });

  it('conditional transaction granular transfers stop when funds run out prop to', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '30.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff more than once if I need to',
          FROM: 'Stff',
          FROM_VALUE: '50',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'March 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'March 2 2018',
          VALUE: '72',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 2 2018',
          VALUE: '15',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'Grain',
          VALUE: '10',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(29);
    expectEvals(evals, 0, 'Grain', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 1, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 2, 'Stff', 'Fri Mar 02 2018', 72, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 4, 'Stff', 'Mon Apr 02 2018', 72, -1);
    expectEvals(evals, 5, 'Food', 'Tue Apr 03 2018', 30, -1);
    expectEvals(evals, 6, 'Cash', 'Tue Apr 03 2018', -15, -1);
    expectEvals(evals, 7, 'Cash', 'Wed May 02 2018', -15, -1);
    expectEvals(evals, 8, 'Stff', 'Wed May 02 2018', 72, -1);
    // sell 20 - we need at least 15
    expectEvals(evals, 9, 'Stff', 'Wed May 02 2018', 52, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 11, 'Food', 'Thu May 03 2018', 30, -1);
    expectEvals(evals, 12, 'Cash', 'Thu May 03 2018', -25, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Jun 02 2018', -25, -1);
    expectEvals(evals, 14, 'Stff', 'Sat Jun 02 2018', 52, -1);
    expectEvals(evals, 15, 'Stff', 'Sat Jun 02 2018', 22, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Jun 02 2018', 5, -1);
    expectEvals(evals, 17, 'Food', 'Sun Jun 03 2018', 30, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 03 2018', -25, -1);
    expectEvals(evals, 19, 'Cash', 'Mon Jul 02 2018', -25, -1);
    expectEvals(evals, 20, 'Stff', 'Mon Jul 02 2018', 22, -1);
    expectEvals(evals, 21, 'Stff', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 22, 'Cash', 'Mon Jul 02 2018', -3, -1);
    expectEvals(evals, 23, 'Food', 'Tue Jul 03 2018', 30, -1);
    expectEvals(evals, 24, 'Cash', 'Tue Jul 03 2018', -33, -1);
    expectEvals(evals, 25, 'Cash', 'Thu Aug 02 2018', -33, -1);
    expectEvals(evals, 26, 'Stff', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 27, 'Cash', 'Sun Sep 02 2018', -33, -1);
    expectEvals(evals, 28, 'Stff', 'Sun Sep 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 30, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 30, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 30, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 30, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 72, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 72, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 52, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 22, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 15, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -15, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -25, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -25, -1);
      expectChartData(chartPts, 4, 'Wed Aug 01 2018', -33, -1);
      expectChartData(chartPts, 5, 'Sat Sep 01 2018', -33, -1);
    }
    done();
  });

  it('conditional transaction from multiple sources simple', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf1' + separator + 'Stf2',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf1',
          START: 'January 2 2018',
          VALUE: '7',
        },
        {
          ...simpleAsset,
          NAME: 'Stf2',
          START: 'January 2 2018',
          VALUE: '100',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const x = model.settings.find((s) => {
      return s.NAME === assetChartFocus;
    });
    if (x !== undefined) {
      x.VALUE = CASH_ASSET_NAME;
    }

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(43);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stf1', 'Tue Jan 02 2018', 7, -1);
    expectEvals(evals, 2, 'Stf2', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 4, 'Stf1', 'Fri Feb 02 2018', 7, -1);
    expectEvals(evals, 5, 'Stf2', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stf1', 'Fri Mar 02 2018', 7, -1);
    expectEvals(evals, 8, 'Stf2', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 10, 'Stf1', 'Mon Apr 02 2018', 7, -1);
    expectEvals(evals, 11, 'Stf2', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Food', 'Tue Apr 03 2018', 10, -1);
    expectEvals(evals, 13, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 14, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 15, 'Stf1', 'Wed May 02 2018', 7, -1);
    expectEvals(evals, 16, 'Stf2', 'Wed May 02 2018', 100, -1);
    expectEvals(evals, 17, 'Food', 'Thu May 03 2018', 10, -1);
    expectEvals(evals, 18, 'Cash', 'Thu May 03 2018', -5, -1);
    // notice that cash has become negative
    expectEvals(evals, 19, 'Cash', 'Sat Jun 02 2018', -5, -1);
    expectEvals(evals, 20, 'Stf1', 'Sat Jun 02 2018', 7, -1);
    expectEvals(evals, 21, 'Stf2', 'Sat Jun 02 2018', 100, -1);
    // sell enough Stf1 to clear the cash debt
    expectEvals(evals, 22, 'Stf1', 'Sat Jun 02 2018', 2, -1);
    expectEvals(evals, 23, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 24, 'Food', 'Sun Jun 03 2018', 10, -1);
    expectEvals(evals, 25, 'Cash', 'Sun Jun 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 26, 'Cash', 'Mon Jul 02 2018', -10, -1);
    expectEvals(evals, 27, 'Stf1', 'Mon Jul 02 2018', 2, -1);
    // sell all Stf1 even though it's not enough to clear the cash debt
    expectEvals(evals, 28, 'Stf2', 'Mon Jul 02 2018', 100, -1);
    expectEvals(evals, 29, 'Stf1', 'Mon Jul 02 2018', 0, -1);
    // notice that cash is still negative
    expectEvals(evals, 30, 'Cash', 'Mon Jul 02 2018', -8, -1);
    // sell enough Stf2 to clear the remaining cash debt
    expectEvals(evals, 31, 'Stf2', 'Mon Jul 02 2018', 92, -1);
    expectEvals(evals, 32, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 33, 'Food', 'Tue Jul 03 2018', 10, -1);
    expectEvals(evals, 34, 'Cash', 'Tue Jul 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 35, 'Cash', 'Thu Aug 02 2018', -10, -1);
    expectEvals(evals, 36, 'Stf1', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 37, 'Stf2', 'Thu Aug 02 2018', 92, -1);
    // sell enough Stf2 to clear the cash debt
    expectEvals(evals, 38, 'Stf2', 'Thu Aug 02 2018', 82, -1);
    expectEvals(evals, 39, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 41, 'Stf1', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 42, 'Stf2', 'Sun Sep 02 2018', 82, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, CASH_ASSET_NAME);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Food/Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe(' Sell Stff if I need to/Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 5, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('conditional transaction from multiple sources by quantity', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf1' + separator + 'Stf2',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf1',
          START: 'January 2 2018',
          VALUE: 'pound',
          CPI_IMMUNE: true,
          QUANTITY: '7',
        },
        {
          ...simpleAsset,
          NAME: 'Stf2',
          START: 'January 2 2018',
          VALUE: 'pound',
          CPI_IMMUNE: true,
          QUANTITY: '100',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'pound',
          VALUE: '1.0',
          HINT: 'a setting for a currency',
          TYPE: constType,
        },
      ],
    };

    const x = model.settings.find((s) => {
      return s.NAME === assetChartFocus;
    });
    if (x !== undefined) {
      x.VALUE = CASH_ASSET_NAME;
    }

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(51);
    expectEvals(evals, 0, 'pound', 'Tue Jan 02 2018', 1, -1);
    expectEvals(evals, 1, 'pound', 'Tue Jan 02 2018', 1, -1); // ??
    expectEvals(evals, 2, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 3, 'quantityStf1', 'Tue Jan 02 2018', 7, -1);
    expectEvals(evals, 4, 'Stf1', 'Tue Jan 02 2018', 7, -1);
    expectEvals(evals, 5, 'quantityStf2', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 6, 'Stf2', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 8, 'Stf1', 'Fri Feb 02 2018', 7, -1);
    expectEvals(evals, 9, 'Stf2', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 11, 'Stf1', 'Fri Mar 02 2018', 7, -1);
    expectEvals(evals, 12, 'Stf2', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 13, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 14, 'Stf1', 'Mon Apr 02 2018', 7, -1);
    expectEvals(evals, 15, 'Stf2', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 16, 'Food', 'Tue Apr 03 2018', 10, -1);
    expectEvals(evals, 17, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 18, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 19, 'Stf1', 'Wed May 02 2018', 7, -1);
    expectEvals(evals, 20, 'Stf2', 'Wed May 02 2018', 100, -1);
    expectEvals(evals, 21, 'Food', 'Thu May 03 2018', 10, -1);
    expectEvals(evals, 22, 'Cash', 'Thu May 03 2018', -5, -1);
    // notice that cash has become negative
    expectEvals(evals, 23, 'Cash', 'Sat Jun 02 2018', -5, -1);
    expectEvals(evals, 24, 'Stf1', 'Sat Jun 02 2018', 7, -1);
    expectEvals(evals, 25, 'Stf2', 'Sat Jun 02 2018', 100, -1);
    // sell enough Stf1 to clear the cash debt
    expectEvals(evals, 26, 'quantityStf1', 'Sat Jun 02 2018', 2, -1);
    expectEvals(evals, 27, 'Stf1', 'Sat Jun 02 2018', 2, -1);
    expectEvals(evals, 28, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 29, 'Food', 'Sun Jun 03 2018', 10, -1);
    expectEvals(evals, 30, 'Cash', 'Sun Jun 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 31, 'Cash', 'Mon Jul 02 2018', -10, -1);
    expectEvals(evals, 32, 'Stf1', 'Mon Jul 02 2018', 2, -1);
    expectEvals(evals, 33, 'Stf2', 'Mon Jul 02 2018', 100, -1);
    // sell all Stf1 even though it's not enough to clear the cash debt
    expectEvals(evals, 34, 'quantityStf1', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 35, 'Stf1', 'Mon Jul 02 2018', 0, -1);
    // notice that cash is still negative
    expectEvals(evals, 36, 'Cash', 'Mon Jul 02 2018', -8, -1);
    // sell enough Stf2 to clear the remaining cash debt
    expectEvals(evals, 37, 'quantityStf2', 'Mon Jul 02 2018', 92, -1);
    expectEvals(evals, 38, 'Stf2', 'Mon Jul 02 2018', 92, -1);
    expectEvals(evals, 39, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 40, 'Food', 'Tue Jul 03 2018', 10, -1);
    expectEvals(evals, 41, 'Cash', 'Tue Jul 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 42, 'Cash', 'Thu Aug 02 2018', -10, -1);
    expectEvals(evals, 43, 'Stf1', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 44, 'Stf2', 'Thu Aug 02 2018', 92, -1);
    // sell enough Stf2 to clear the cash debt
    expectEvals(evals, 45, 'quantityStf2', 'Thu Aug 02 2018', 82, -1);
    expectEvals(evals, 46, 'Stf2', 'Thu Aug 02 2018', 82, -1);
    expectEvals(evals, 47, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 48, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 49, 'Stf1', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 50, 'Stf2', 'Sun Sep 02 2018', 82, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, CASH_ASSET_NAME);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Food/Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe(' Sell Stff if I need to/Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 5, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('conditional transaction from multiple sources by category', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'August 2 2018',
          NAME: 'Food',
          VALUE: '10.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'things',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf1',
          START: 'January 2 2018',
          VALUE: '7',
          CATEGORY: 'things',
        },
        {
          ...simpleAsset,
          NAME: 'Stf2',
          START: 'January 2 2018',
          VALUE: '100',
          CATEGORY: 'things',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const x = model.settings.find((s) => {
      return s.NAME === assetChartFocus;
    });
    if (x !== undefined) {
      x.VALUE = CASH_ASSET_NAME;
    }

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(43);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 1, 'Stf1', 'Tue Jan 02 2018', 7, -1);
    expectEvals(evals, 2, 'Stf2', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Feb 02 2018', 15, -1);
    expectEvals(evals, 4, 'Stf1', 'Fri Feb 02 2018', 7, -1);
    expectEvals(evals, 5, 'Stf2', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 15, -1);
    expectEvals(evals, 7, 'Stf1', 'Fri Mar 02 2018', 7, -1);
    expectEvals(evals, 8, 'Stf2', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Apr 02 2018', 15, -1);
    expectEvals(evals, 10, 'Stf1', 'Mon Apr 02 2018', 7, -1);
    expectEvals(evals, 11, 'Stf2', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Food', 'Tue Apr 03 2018', 10, -1);
    expectEvals(evals, 13, 'Cash', 'Tue Apr 03 2018', 5, -1);
    expectEvals(evals, 14, 'Cash', 'Wed May 02 2018', 5, -1);
    expectEvals(evals, 15, 'Stf1', 'Wed May 02 2018', 7, -1);
    expectEvals(evals, 16, 'Stf2', 'Wed May 02 2018', 100, -1);
    expectEvals(evals, 17, 'Food', 'Thu May 03 2018', 10, -1);
    expectEvals(evals, 18, 'Cash', 'Thu May 03 2018', -5, -1);
    // notice that cash has become negative
    expectEvals(evals, 19, 'Cash', 'Sat Jun 02 2018', -5, -1);
    expectEvals(evals, 20, 'Stf1', 'Sat Jun 02 2018', 7, -1);
    expectEvals(evals, 21, 'Stf2', 'Sat Jun 02 2018', 100, -1);
    // sell enough Stf1 to clear the cash debt
    expectEvals(evals, 22, 'Stf1', 'Sat Jun 02 2018', 2, -1);
    expectEvals(evals, 23, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 24, 'Food', 'Sun Jun 03 2018', 10, -1);
    expectEvals(evals, 25, 'Cash', 'Sun Jun 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 26, 'Cash', 'Mon Jul 02 2018', -10, -1);
    expectEvals(evals, 27, 'Stf1', 'Mon Jul 02 2018', 2, -1);
    // sell all Stf1 even though it's not enough to clear the cash debt
    expectEvals(evals, 28, 'Stf2', 'Mon Jul 02 2018', 100, -1);
    expectEvals(evals, 29, 'Stf1', 'Mon Jul 02 2018', 0, -1);
    // notice that cash is still negative
    expectEvals(evals, 30, 'Cash', 'Mon Jul 02 2018', -8, -1);
    // sell enough Stf2 to clear the remaining cash debt
    expectEvals(evals, 31, 'Stf2', 'Mon Jul 02 2018', 92, -1);
    expectEvals(evals, 32, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 33, 'Food', 'Tue Jul 03 2018', 10, -1);
    expectEvals(evals, 34, 'Cash', 'Tue Jul 03 2018', -10, -1);
    // notice that cash has become negative
    expectEvals(evals, 35, 'Cash', 'Thu Aug 02 2018', -10, -1);
    expectEvals(evals, 36, 'Stf1', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 37, 'Stf2', 'Thu Aug 02 2018', 92, -1);
    // sell enough Stf2 to clear the cash debt
    expectEvals(evals, 38, 'Stf2', 'Thu Aug 02 2018', 82, -1);
    expectEvals(evals, 39, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 40, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 41, 'Stf1', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 42, 'Stf2', 'Sun Sep 02 2018', 82, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, CASH_ASSET_NAME);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 15, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Food/Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -10, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -10, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -10, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe(' Sell Stff if I need to/Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 5, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 10, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('conditional transaction from multiple sources abs->prop', (done) => {
    const roi = {
      start: 'March 15, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'April 3 2018',
          END: 'June 2 2018',
          NAME: 'Food',
          VALUE: '140.0',
          VALUE_SET: 'April 3 2018',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf1' + separator + 'Stf2',
          FROM_VALUE: '100',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf1',
          START: 'January 2 2018',
          VALUE: '151',
        },
        {
          ...simpleAsset,
          NAME: 'Stf2',
          START: 'January 2 2018',
          VALUE: '152',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '5',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(39);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 5, -1);
    expectEvals(evals, 1, 'Stf1', 'Tue Jan 02 2018', 151, -1);
    expectEvals(evals, 2, 'Stf2', 'Tue Jan 02 2018', 152, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Feb 02 2018', 5, -1);
    expectEvals(evals, 4, 'Stf1', 'Fri Feb 02 2018', 151, -1);
    expectEvals(evals, 5, 'Stf2', 'Fri Feb 02 2018', 152, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 5, -1);
    expectEvals(evals, 7, 'Stf1', 'Fri Mar 02 2018', 151, -1);
    expectEvals(evals, 8, 'Stf2', 'Fri Mar 02 2018', 152, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Apr 02 2018', 5, -1);
    expectEvals(evals, 10, 'Stf1', 'Mon Apr 02 2018', 151, -1);
    expectEvals(evals, 11, 'Stf2', 'Mon Apr 02 2018', 152, -1);
    // buy food
    expectEvals(evals, 12, 'Food', 'Tue Apr 03 2018', 140, -1);
    // go overdrawn
    expectEvals(evals, 13, 'Cash', 'Tue Apr 03 2018', -135, -1);
    // still overdrawn
    expectEvals(evals, 14, 'Cash', 'Wed May 02 2018', -135, -1);
    expectEvals(evals, 15, 'Stf1', 'Wed May 02 2018', 151, -1);
    expectEvals(evals, 16, 'Stf2', 'Wed May 02 2018', 152, -1);
    // sell 100 of Stf1
    expectEvals(evals, 17, 'Stf1', 'Wed May 02 2018', 51, -1);
    // after an injection from Stf1
    expectEvals(evals, 18, 'Cash', 'Wed May 02 2018', -35, -1);
    // after an injection from Stf2
    expectEvals(evals, 19, 'Stf2', 'Wed May 02 2018', 117, -1); /// BUG!!
    // Cash has recovered to 0
    expectEvals(evals, 20, 'Cash', 'Wed May 02 2018', 0, -1);
    expectEvals(evals, 21, 'Food', 'Thu May 03 2018', 140, -1);
    expectEvals(evals, 22, 'Cash', 'Thu May 03 2018', -140, -1);
    expectEvals(evals, 23, 'Cash', 'Sat Jun 02 2018', -140, -1);
    expectEvals(evals, 24, 'Stf1', 'Sat Jun 02 2018', 51, -1);
    expectEvals(evals, 25, 'Stf2', 'Sat Jun 02 2018', 117, -1);
    expectEvals(evals, 26, 'Stf1', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 27, 'Cash', 'Sat Jun 02 2018', -89, -1);
    expectEvals(evals, 28, 'Stf2', 'Sat Jun 02 2018', 28, -1);
    expectEvals(evals, 29, 'Cash', 'Sat Jun 02 2018', 0, -1);
    expectEvals(evals, 30, 'Cash', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 31, 'Stf1', 'Mon Jul 02 2018', 0, -1);
    expectEvals(evals, 32, 'Stf2', 'Mon Jul 02 2018', 28, -1);
    expectEvals(evals, 33, 'Cash', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 34, 'Stf1', 'Thu Aug 02 2018', 0, -1);
    expectEvals(evals, 35, 'Stf2', 'Thu Aug 02 2018', 28, -1);
    expectEvals(evals, 36, 'Cash', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 37, 'Stf1', 'Sun Sep 02 2018', 0, -1);
    expectEvals(evals, 38, 'Stf2', 'Sun Sep 02 2018', 28, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Food');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Thu Mar 15 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 15 2018', 140, -1);
      expectChartData(chartPts, 2, 'Tue May 15 2018', 140, -1);
      expectChartData(chartPts, 3, 'Fri Jun 15 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 15 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 15 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 15 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Stf1');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Thu Mar 15 2018', 151, -1);
      expectChartData(chartPts, 1, 'Sun Apr 15 2018', 151, -1);
      expectChartData(chartPts, 2, 'Tue May 15 2018', 51, -1);
      expectChartData(chartPts, 3, 'Fri Jun 15 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 15 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 15 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 15 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Stf2');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Thu Mar 15 2018', 152, -1);
      expectChartData(chartPts, 1, 'Sun Apr 15 2018', 152, -1);
      expectChartData(chartPts, 2, 'Tue May 15 2018', 117, -1);
      expectChartData(chartPts, 3, 'Fri Jun 15 2018', 28, -1);
      expectChartData(chartPts, 4, 'Sun Jul 15 2018', 28, -1);
      expectChartData(chartPts, 5, 'Wed Aug 15 2018', 28, -1);
      expectChartData(chartPts, 6, 'Sat Sep 15 2018', 28, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Thu Mar 15 2018', 5, -1);
      expectChartData(chartPts, 1, 'Sun Apr 15 2018', -135, -1);
      expectChartData(chartPts, 2, 'Tue May 15 2018', -140, -1);
      expectChartData(chartPts, 3, 'Fri Jun 15 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 15 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 15 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 15 2018', 0, -1);
    }

    done();
  });

  it('conditional transaction from abs to half, asset runs out', (done) => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf',
          FROM_VALUE: '100',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf',
          START: 'January 2 2018',
          VALUE: '163',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-117',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', -117, -1);
    expectEvals(evals, 1, 'Stf', 'Tue Jan 02 2018', 163, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', -117, -1);
    expectEvals(evals, 3, 'Stf', 'Fri Feb 02 2018', 163, -1);
    expectEvals(evals, 4, 'Stf', 'Fri Feb 02 2018', 63, -1);
    expectEvals(evals, 5, 'Cash', 'Fri Feb 02 2018', -67, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', -67, -1);
    expectEvals(evals, 7, 'Stf', 'Fri Mar 02 2018', 63, -1);
    expectEvals(evals, 8, 'Stf', 'Fri Mar 02 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Fri Mar 02 2018', -35.5, 2);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', -35.5, 2);
    expectEvals(evals, 11, 'Stf', 'Mon Apr 02 2018', 0, -1);
    expectEvals(evals, 12, 'Cash', 'Wed May 02 2018', -35.5, 2);
    expectEvals(evals, 13, 'Stf', 'Wed May 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stf');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', 163, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', 63, -1);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Apr 15 2018', 0, -1);
      expectChartData(chartPts, 4, 'Tue May 15 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', -117, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', -67, -1);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', -35.5, 2);
      expectChartData(chartPts, 3, 'Sun Apr 15 2018', -35.5, 2);
      expectChartData(chartPts, 4, 'Tue May 15 2018', -35.5, 2);
    }

    done();
  });

  it('conditional transaction from abs to half, cash is zerod', (done) => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf',
          FROM_VALUE: '100',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf',
          START: 'January 2 2018',
          VALUE: '263',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-117',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', -117, -1);
    expectEvals(evals, 1, 'Stf', 'Tue Jan 02 2018', 263, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', -117, -1);
    expectEvals(evals, 3, 'Stf', 'Fri Feb 02 2018', 263, -1);
    expectEvals(evals, 4, 'Stf', 'Fri Feb 02 2018', 163, -1);
    expectEvals(evals, 5, 'Cash', 'Fri Feb 02 2018', -67, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', -67, -1);
    expectEvals(evals, 7, 'Stf', 'Fri Mar 02 2018', 163, -1);
    expectEvals(evals, 8, 'Stf', 'Fri Mar 02 2018', 63, -1);
    expectEvals(evals, 9, 'Cash', 'Fri Mar 02 2018', -17, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', -17, -1);
    expectEvals(evals, 11, 'Stf', 'Mon Apr 02 2018', 63, -1);
    expectEvals(evals, 12, 'Stf', 'Mon Apr 02 2018', 29, -1);
    expectEvals(evals, 13, 'Cash', 'Mon Apr 02 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Wed May 02 2018', 0, -1);
    expectEvals(evals, 15, 'Stf', 'Wed May 02 2018', 29, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stf');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', 263, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', 163, -1);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', 63, -1);
      expectChartData(chartPts, 3, 'Sun Apr 15 2018', 29, -1);
      expectChartData(chartPts, 4, 'Tue May 15 2018', 29, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', -117, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', -67, -1);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', -17, -1);
      expectChartData(chartPts, 3, 'Sun Apr 15 2018', 0, -1);
      expectChartData(chartPts, 4, 'Tue May 15 2018', 0, -1);
    }

    done();
  });

  it('conditional transaction from prop to half, cash reduces', (done) => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.5', // want to clear 0.5 of debt
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '0.8', // 0.8 of money from is money to
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf',
          START: 'January 2 2018',
          VALUE: '400',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-117',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', -117, -1);
    expectEvals(evals, 1, 'Stf', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', -117, -1);
    expectEvals(evals, 3, 'Stf', 'Fri Feb 02 2018', 400, -1);
    expectEvals(evals, 4, 'Stf', 'Fri Feb 02 2018', 326.88, 2);
    expectEvals(evals, 5, 'Cash', 'Fri Feb 02 2018', -58.5, 2);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', -58.5, 2);
    expectEvals(evals, 7, 'Stf', 'Fri Mar 02 2018', 326.88, 2);
    expectEvals(evals, 8, 'Stf', 'Fri Mar 02 2018', 290.31, 2);
    expectEvals(evals, 9, 'Cash', 'Fri Mar 02 2018', -29.25, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stf');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', 400, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', 326.88, 2);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', 290.31, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', -117, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', -58.5, 2);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', -29.25, 2);
    }

    done();
  });

  it('conditional transaction from prop to half, asset runs out', (done) => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional Sell Stff if I need to',
          FROM: 'Stf',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.5', // want to clear 0.5 of debt
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '0.8', // 0.8 of money from is money to
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stf',
          START: 'January 2 2018',
          VALUE: '400',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-617',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', -617, -1);
    expectEvals(evals, 1, 'Stf', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', -617, -1);
    expectEvals(evals, 3, 'Stf', 'Fri Feb 02 2018', 400, -1);
    expectEvals(evals, 4, 'Stf', 'Fri Feb 02 2018', 14.375, 3);
    expectEvals(evals, 5, 'Cash', 'Fri Feb 02 2018', -308.5, 2);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', -308.5, 2);
    expectEvals(evals, 7, 'Stf', 'Fri Mar 02 2018', 14.375, 3);
    expectEvals(evals, 8, 'Stf', 'Fri Mar 02 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Fri Mar 02 2018', -297, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stf');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', 400, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', 14.375, 3);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Mon Jan 15 2018', -617, -1);
      expectChartData(chartPts, 1, 'Thu Feb 15 2018', -308.5, 2);
      expectChartData(chartPts, 2, 'Thu Mar 15 2018', -297, -1);
    }

    done();
  });
  it('pay off mortgage, conditional, to absolute', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional pay off mortgage',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '50',
          TO: 'Mortgage',
          TO_VALUE: '50',
          DATE: 'February 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: payOffDebt,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Mortgage',
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-70',
          IS_A_DEBT: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '150',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, `Today's value focus date`, 'Jan 1 2018', viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    /*
    log(evalsAndValues.todaysAssetValues);
    log(evalsAndValues.todaysDebtValues);
    log(evalsAndValues.todaysExpenseValues);
    log(evalsAndValues.todaysIncomeValues);
    log(evalsAndValues.todaysSettingValues);
    */    
    expect(evalsAndValues.todaysAssetValues.size).toEqual(1);
    expect(evalsAndValues.todaysAssetValues.get('Cash')).toEqual(
      { assetVal: 0, assetQ: undefined, category: '' }
    );
    expect(evalsAndValues.todaysDebtValues.size).toEqual(1);
    expect(evalsAndValues.todaysDebtValues.get('Mortgage')).toEqual(
      { debtVal: 0, category: '' }
    );
    expect(evalsAndValues.todaysExpenseValues.size).toEqual(0);
    expect(evalsAndValues.todaysIncomeValues.size).toEqual(0);
    expect(evalsAndValues.todaysSettingValues.size).toEqual(1);
    expect(evalsAndValues.todaysSettingValues.get('cpi')).toEqual(
      { settingVal: '0' }
    );

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 150, -1);
    expectEvals(evals, 1, 'Mortgage', 'Tue Jan 02 2018', -70, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 150, -1);
    expectEvals(evals, 3, 'Mortgage', 'Fri Feb 02 2018', -70, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 5, 'Mortgage', 'Fri Feb 02 2018', -20, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 7, 'Mortgage', 'Fri Mar 02 2018', -20, -1);
    expectEvals(evals, 8, 'Cash', 'Fri Mar 02 2018', 50, -1);
    expectEvals(evals, 9, 'Mortgage', 'Fri Mar 02 2018', 30, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', 50, -1);
    expectEvals(evals, 11, 'Mortgage', 'Mon Apr 02 2018', 30, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 100, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 50, -1);
    }

    expect(result.debtData.length).toBe(1);
    expect(result.debtData[0].item.NAME).toBe('Mortgage');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 70, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -30, -1);
    }
    done();
  });
  it('pay off mortgage, conditional, to not absolute', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional pay off mortgage',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '50',
          TO: 'Mortgage',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'February 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: payOffDebt,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Mortgage',
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-70',
          IS_A_DEBT: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '150',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 150, -1);
    expectEvals(evals, 1, 'Mortgage', 'Tue Jan 02 2018', -70, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 150, -1);
    expectEvals(evals, 3, 'Mortgage', 'Fri Feb 02 2018', -70, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 5, 'Mortgage', 'Fri Feb 02 2018', -20, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 7, 'Mortgage', 'Fri Mar 02 2018', -20, -1);
    expectEvals(evals, 8, 'Cash', 'Fri Mar 02 2018', 80, -1);
    expectEvals(evals, 9, 'Mortgage', 'Fri Mar 02 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', 80, -1);
    expectEvals(evals, 11, 'Mortgage', 'Mon Apr 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 100, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 80, -1);
    }

    expect(result.debtData.length).toBe(1);
    expect(result.debtData[0].item.NAME).toBe('Mortgage');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 70, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    }
    done();
  });

  it('pay off loan, conditional, to absolute', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional pay off loan',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '50',
          TO: 'Loan',
          TO_VALUE: '50',
          DATE: 'February 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: payOffDebt,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Loan',
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-70',
          IS_A_DEBT: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '150',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 150, -1);
    expectEvals(evals, 1, 'Loan', 'Tue Jan 02 2018', -70, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 150, -1);
    expectEvals(evals, 3, 'Loan', 'Fri Feb 02 2018', -70, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 5, 'Loan', 'Fri Feb 02 2018', -20, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 7, 'Loan', 'Fri Mar 02 2018', -20, -1);
    expectEvals(evals, 8, 'Cash', 'Fri Mar 02 2018', 50, -1);
    expectEvals(evals, 9, 'Loan', 'Fri Mar 02 2018', 30, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', 50, -1);
    expectEvals(evals, 11, 'Loan', 'Mon Apr 02 2018', 30, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 100, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 50, -1);
    }

    expect(result.debtData.length).toBe(1);
    expect(result.debtData[0].item.NAME).toBe('Loan');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 70, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -30, -1);
    }
    done();
  });

  it('pay off loan, conditional, to not absolute', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional pay off mortgage',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '50',
          TO: 'Loan',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'February 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: payOffDebt,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Loan',
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '-70',
          IS_A_DEBT: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '150',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 02 2018', 150, -1);
    expectEvals(evals, 1, 'Loan', 'Tue Jan 02 2018', -70, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 02 2018', 150, -1);
    expectEvals(evals, 3, 'Loan', 'Fri Feb 02 2018', -70, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Feb 02 2018', 100, -1);
    expectEvals(evals, 5, 'Loan', 'Fri Feb 02 2018', -20, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Mar 02 2018', 100, -1);
    expectEvals(evals, 7, 'Loan', 'Fri Mar 02 2018', -20, -1);
    expectEvals(evals, 8, 'Cash', 'Fri Mar 02 2018', 80, -1);
    expectEvals(evals, 9, 'Loan', 'Fri Mar 02 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', 80, -1);
    expectEvals(evals, 11, 'Loan', 'Mon Apr 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);

    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 100, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 80, -1);
    }

    expect(result.debtData.length).toBe(1);
    expect(result.debtData[0].item.NAME).toBe('Loan');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 70, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    }

    done();
  });

  it('conditionally sell some cars need all', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: '100',
          QUANTITY: '3',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-1000'; // need to sell a lot of cars!

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', -1000, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', -1000, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', -1000, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', -715, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', -715, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 0, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', -715, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -715, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -715, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    done();
  });

  it('conditionally sell some cars need two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: '100',
          QUANTITY: '3',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-150'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', -150, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', -150, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', -150, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', 40, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 40, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 40, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -150, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -150, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 40, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 40, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some cars need exactly two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: '100',
          QUANTITY: '3',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0', // no fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-200'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', -200, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', -200, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', -200, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -200, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -200, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -200, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some cars fees matter', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: '100',
          QUANTITY: '3',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.5', // big fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-75'; // less than one car but two considering fees

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', -75, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', -75, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', -75, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', 25, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 25, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 25, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -75, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -75, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -75, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 25, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 25, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some mini cars need all', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'mini',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-1000'; // need to sell a lot of cars!

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', -1000, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -1000, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', -1000, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', -715, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', -715, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 0, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', -715, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -715, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -715, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    done();
  });

  it('conditionally sell some mini cars need two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'mini',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-150'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', -150, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -150, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', -150, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 40, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 40, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 40, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -150, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -150, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 40, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 40, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some mini cars need exactly two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'mini',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cal in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0', // no fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-200'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', -200, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -200, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', -200, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -200, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -200, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -200, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some mini cars fees matter', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'mini',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // cap in £
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.5', // big fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-75'; // less than one car but two considering fees

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', -75, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -75, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', -75, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 25, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 25, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 25, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -75, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -75, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -75, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 25, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 25, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some chrysler cars need all', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // max amount in ££
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-1000'; // need to sell a lot of cars!

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -1000, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -1000, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -1000, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', -715, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -715, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -715, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 0, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -715, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -715, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    done();
  });

  it('conditionally sell some chrysler cars need two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // max amount in £ to sell
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-150'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -150, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -150, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -150, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 40, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 40, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 40, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -150, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -150, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 40, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 40, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some chrysler cars need exactly two', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // max amount in £ to sell
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0', // no fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-200'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -200, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -200, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -200, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -200, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -200, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -200, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some chrysler cars capped', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '111', // max amount in £ to sell
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.5', // big fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-500';

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -500, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -500, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -500, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', -444.5, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -444.5, 2);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -444.5, 2);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -500, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -500, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -444.5, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -444.5, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('conditionally sell some chrysler cars fees matter', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // max amount in £ to sell
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.5', // big fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-75'; // less than one car but two considering fees

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -75, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -75, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -75, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 25, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 25, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 25, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 100, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -75, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -75, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -75, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 25, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 25, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
    }

    done();
  });

  it('conditionally sell some chrysler cars then revalue chrysler', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '300', // max amount in £ to sell
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
        {
          ...simpleTransaction,
          NAME: revalue + ' chrysler',
          FROM: '',
          FROM_VALUE: '',
          TO: 'chrysler',
          TO_VALUE: '0.5',
          TO_ABSOLUTE: false,
          DATE: 'March 25 2018',
          TYPE: revalueSetting,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-150'; // need to sell two cars

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', -150, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -150, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -150, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 40, -1);
    expectEvals(evals, 12, 'chrysler', 'Sun Mar 25 2018', 50, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 40, -1);
    expectEvals(evals, 14, 'Cars', 'Mon Apr 02 2018', 50, -1);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', 40, -1);
    expectEvals(evals, 16, 'Cars', 'Wed May 02 2018', 50, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -150, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -150, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -150, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 40, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 40, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 50, -1);
    }

    done();
  });

  it('conditionally sell some chrysler fleets need some', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Fleet1',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          CPI_IMMUNE: true,
          QUANTITY: '10',
        },
        {
          ...simpleAsset,
          NAME: 'Fleet2',
          START: 'January 2 2018',
          VALUE: 'chrysler',
          CPI_IMMUNE: true,
          QUANTITY: '15',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Conditional sell some cars',
          FROM: `Fleet1${separator}Fleet2`,
          FROM_VALUE: '200', // max amount in ££
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
          TYPE: liquidateAsset,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].VALUE = '-1000'; // need to sell a lot of cars!

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 3, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 4, 'Cash', 'Mon Jan 01 2018', -1000, -1);
    expectEvals(evals, 5, 'quantityFleet1', 'Tue Jan 02 2018', 10, -1);
    expectEvals(evals, 6, 'Fleet1', 'Tue Jan 02 2018', 1000, -1);
    expectEvals(evals, 7, 'quantityFleet2', 'Tue Jan 02 2018', 15, -1);
    expectEvals(evals, 8, 'Fleet2', 'Tue Jan 02 2018', 1500, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Feb 01 2018', -1000, -1);
    expectEvals(evals, 10, 'Fleet1', 'Fri Feb 02 2018', 1000, -1);
    expectEvals(evals, 11, 'Fleet2', 'Fri Feb 02 2018', 1500, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Mar 01 2018', -1000, -1);
    expectEvals(evals, 13, 'Fleet1', 'Fri Mar 02 2018', 1000, -1);
    expectEvals(evals, 14, 'Fleet2', 'Fri Mar 02 2018', 1500, -1);
    expectEvals(evals, 15, 'quantityFleet1', 'Sat Mar 10 2018', 8, -1);
    expectEvals(evals, 16, 'Fleet1', 'Sat Mar 10 2018', 800, -1);
    expectEvals(evals, 17, 'Cash', 'Sat Mar 10 2018', -810, -1);
    expectEvals(evals, 18, 'quantityFleet2', 'Sat Mar 10 2018', 13, -1);
    expectEvals(evals, 19, 'Fleet2', 'Sat Mar 10 2018', 1300, -1);
    expectEvals(evals, 20, 'Cash', 'Sat Mar 10 2018', -620, -1);
    expectEvals(evals, 21, 'Cash', 'Sun Apr 01 2018', -620, -1);
    expectEvals(evals, 22, 'Fleet1', 'Mon Apr 02 2018', 800, -1);
    expectEvals(evals, 23, 'Fleet2', 'Mon Apr 02 2018', 1300, -1);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', -620, -1);
    expectEvals(evals, 25, 'Fleet1', 'Wed May 02 2018', 800, -1);
    expectEvals(evals, 26, 'Fleet2', 'Wed May 02 2018', 1300, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -620, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -620, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Fleet1');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 800, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 800, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('Fleet2');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1500, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1500, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1300, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });
});
