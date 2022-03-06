import {
  incomeTax,
  CASH_ASSET_NAME,
  cpi,
  constType,
  nationalInsurance,
  separator,
  cgt,
  custom,
  revalueSetting,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleIncome,
  simpleAsset,
  defaultModelSettings,
  getMinimalModelCopy,
  simpleSetting,
  simpleTransaction,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { printDebug } from '../../utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  getnetincLabel,
  defaultTestViewSettings,
  expectChartData,
  getICLabel,
  getNILabel,
  getnetgainLabel,
  getCGTLabel,
} from './algoTestUtils';

describe('tax tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  // income tax is evident on liable income
  // one income was liable, one was not
  it('two incomes straddling April', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
        },
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'May 9 2018',
          NAME: 'java',
          VALUE: '12505', // two payments in two tax years
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 4, 'PRnd', 'Sun Apr 01 2018', 5, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 13010, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 13009, -1);
    expectEvals(evals, 7, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12504, -1);
    expectEvals(evals, 9, 'java', 'Tue Apr 10 2018', 12505, -1);
    expectEvals(evals, 10, 'Cash', 'Tue Apr 10 2018', 25514, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 25514, -1);
    expectEvals(evals, 12, 'Cash', 'Fri Apr 05 2019', 25513, -1);
    expectEvals(evals, 13, '(incomeTax)', 'Fri Apr 05 2019', 1, -1);
    expectEvals(evals, 14, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12504, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 5, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 12505, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12505, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 13010, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25514, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12504, -1);
    }

    done();
  });

  // income tax is evident on liable income
  // one income was liable, one was not
  it('income over multiple Aprils', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2020 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'May 9 2018',
          NAME: 'java',
          VALUE: '12505', // two payments in two tax years
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(38);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 13004, -1);
    expectEvals(evals, 5, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 6, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12504, -1);
    expectEvals(evals, 7, 'java', 'Tue Apr 10 2018', 12505, -1);
    expectEvals(evals, 8, 'Cash', 'Tue Apr 10 2018', 25509, -1);
    expectEvals(evals, 9, 'Cash', 'Tue May 01 2018', 25509, -1);
    expectEvals(evals, 10, 'Cash', 'Sat May 05 2018', 21340.09, 2);
    expectEvals(evals, 11, 'Cash', 'Fri Jun 01 2018', 21340.09, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', 21340.09, 2);
    expectEvals(evals, 13, 'Cash', 'Wed Aug 01 2018', 21340.09, 2);
    expectEvals(evals, 14, 'Cash', 'Sat Sep 01 2018', 21340.09, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Oct 01 2018', 21340.09, 2);
    expectEvals(evals, 16, 'Cash', 'Thu Nov 01 2018', 21340.09, 2);
    expectEvals(evals, 17, 'Cash', 'Sat Dec 01 2018', 21340.09, 2);
    expectEvals(evals, 18, 'Cash', 'Tue Jan 01 2019', 21340.09, 2);
    expectEvals(evals, 19, 'Cash', 'Fri Feb 01 2019', 21340.09, 2);
    expectEvals(evals, 20, 'Cash', 'Fri Mar 01 2019', 21340.09, 2);
    expectEvals(evals, 21, 'Cash', 'Mon Apr 01 2019', 21340.09, 2);
    expectEvals(evals, 22, 'Cash', 'Fri Apr 05 2019', 25508, -1);
    expectEvals(evals, 23, '(incomeTax)', 'Fri Apr 05 2019', 1, -1);
    expectEvals(evals, 24, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12504, -1);
    expectEvals(evals, 25, 'Cash', 'Wed May 01 2019', 25508, -1);
    expectEvals(evals, 26, 'Cash', 'Sat Jun 01 2019', 25508, -1);
    expectEvals(evals, 27, 'Cash', 'Mon Jul 01 2019', 25508, -1);
    expectEvals(evals, 28, 'Cash', 'Thu Aug 01 2019', 25508, -1);
    expectEvals(evals, 29, 'Cash', 'Sun Sep 01 2019', 25508, -1);
    expectEvals(evals, 30, 'Cash', 'Tue Oct 01 2019', 25508, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Nov 01 2019', 25508, -1);
    expectEvals(evals, 32, 'Cash', 'Sun Dec 01 2019', 25508, -1);
    expectEvals(evals, 33, 'Cash', 'Wed Jan 01 2020', 25508, -1);
    expectEvals(evals, 34, 'Cash', 'Sat Feb 01 2020', 25508, -1);
    expectEvals(evals, 35, 'Cash', 'Sun Mar 01 2020', 25508, -1);
    expectEvals(evals, 36, 'Cash', 'Wed Apr 01 2020', 25508, -1);
    expectEvals(evals, 37, 'Cash', 'Fri May 01 2020', 25508, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 12505, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12505, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 0, -1);
      expectChartData(chartPts, 15, 'Sat Jun 01 2019', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jul 01 2019', 0, -1);
      expectChartData(chartPts, 17, 'Thu Aug 01 2019', 0, -1);
      expectChartData(chartPts, 18, 'Sun Sep 01 2019', 0, -1);
      expectChartData(chartPts, 19, 'Tue Oct 01 2019', 0, -1);
      expectChartData(chartPts, 20, 'Fri Nov 01 2019', 0, -1);
      expectChartData(chartPts, 21, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 22, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 23, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 24, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 25, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 26, 'Fri May 01 2020', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 13005, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25509, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 21340.09, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 21340.09, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 21340.09, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 21340.09, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 21340.09, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 21340.09, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 21340.09, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 21340.09, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 21340.09, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 21340.09, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 21340.09, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 25508, -1);
      expectChartData(chartPts, 15, 'Sat Jun 01 2019', 25508, -1);
      expectChartData(chartPts, 16, 'Mon Jul 01 2019', 25508, -1);
      expectChartData(chartPts, 17, 'Thu Aug 01 2019', 25508, -1);
      expectChartData(chartPts, 18, 'Sun Sep 01 2019', 25508, -1);
      expectChartData(chartPts, 19, 'Tue Oct 01 2019', 25508, -1);
      expectChartData(chartPts, 20, 'Fri Nov 01 2019', 25508, -1);
      expectChartData(chartPts, 21, 'Sun Dec 01 2019', 25508, -1);
      expectChartData(chartPts, 22, 'Wed Jan 01 2020', 25508, -1);
      expectChartData(chartPts, 23, 'Sat Feb 01 2020', 25508, -1);
      expectChartData(chartPts, 24, 'Sun Mar 01 2020', 25508, -1);
      expectChartData(chartPts, 25, 'Wed Apr 01 2020', 25508, -1);
      expectChartData(chartPts, 26, 'Fri May 01 2020', 25508, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 1, -1);
      expectChartData(chartPts, 15, 'Sat Jun 01 2019', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jul 01 2019', 0, -1);
      expectChartData(chartPts, 17, 'Thu Aug 01 2019', 0, -1);
      expectChartData(chartPts, 18, 'Sun Sep 01 2019', 0, -1);
      expectChartData(chartPts, 19, 'Tue Oct 01 2019', 0, -1);
      expectChartData(chartPts, 20, 'Fri Nov 01 2019', 0, -1);
      expectChartData(chartPts, 21, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 22, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 23, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 24, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 25, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 26, 'Fri May 01 2020', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12504, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 12504, -1);
      expectChartData(chartPts, 15, 'Sat Jun 01 2019', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jul 01 2019', 0, -1);
      expectChartData(chartPts, 17, 'Thu Aug 01 2019', 0, -1);
      expectChartData(chartPts, 18, 'Sun Sep 01 2019', 0, -1);
      expectChartData(chartPts, 19, 'Tue Oct 01 2019', 0, -1);
      expectChartData(chartPts, 20, 'Fri Nov 01 2019', 0, -1);
      expectChartData(chartPts, 21, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 22, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 23, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 24, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 25, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 26, 'Fri May 01 2020', 0, -1);
    }

    done();
  });

  it('payLowTax on single income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 13004, -1);
    expectEvals(evals, 4, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 5, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12504, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 13004, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(12505);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(13005);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(13004);
    }
    done();
  });

  it('tax exempt on single income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '12505', // single payment
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
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Tue May 01 2018', 13005, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(12505);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(13005);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(13005);
    }
    done();
  });

  it('payHighTax on single income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '50100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 50100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 4, '(incomeTax)', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 5, getnetincLabel('Joe'), 'Thu Apr 05 2018', 42560, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 43060, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(50100);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(50600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(43060);
    }
    done();
  });

  it('tax allowance reduces for high earners', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '100100',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 100100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 100600, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 73050, -1);
    expectEvals(evals, 4, '(incomeTax)', 'Thu Apr 05 2018', 27550, -1);
    expectEvals(evals, 5, getnetincLabel('Joe'), 'Thu Apr 05 2018', 72550, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 73050, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 100100, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 100600, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 73050, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 27550, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 72550, -1);
    }
    done();
  });

  it('payTopTax on single income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '150100',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 150100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 100555, -1);
    expectEvals(evals, 4, '(incomeTax)', 'Thu Apr 05 2018', 50045.0, 2);
    expectEvals(evals, 5, getnetincLabel('Joe'), 'Thu Apr 05 2018', 100055, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 100555, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(150100);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(150600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(100555);
    }
    done();
  });

  it('taxBands grow with cpi', (done) => {
    const roi = {
      start: 'April 1, 2020 00:00:00',
      end: 'April 10, 2026 00:00:00',
    };
    const smallCPI = 0.05; // non zero cpi ensures tax bands grow over time
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2020',
          END: 'April 2 2026',
          NAME: 'PRnd',
          VALUE: '1042.5', // will be taxable in 1st year but after tax bands adjust, won't be
          VALUE_SET: 'January 1 2018',
          CPI_IMMUNE: true, // fix the income and it becomes not-taxable as cpi is non zero
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2020',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, `${smallCPI}`, constType);

    const evalsAndValues = getTestEvaluations(model);

    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // printTestCodeForEvals(evals);
    // expect(evals.length).toBe(198);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    //printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(73);
      expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1042.5, 2);
      expectChartData(chartPts, 1, 'Fri May 01 2020', 1042.5, 2);
      expectChartData(chartPts, 2, 'Mon Jun 01 2020', 1042.5, 2);
      expectChartData(chartPts, 3, 'Wed Jul 01 2020', 1042.5, 2);
      expectChartData(chartPts, 4, 'Sat Aug 01 2020', 1042.5, 2);
      expectChartData(chartPts, 5, 'Tue Sep 01 2020', 1042.5, 2);
      expectChartData(chartPts, 6, 'Thu Oct 01 2020', 1042.5, 2);
      expectChartData(chartPts, 7, 'Sun Nov 01 2020', 1042.5, 2);
      expectChartData(chartPts, 8, 'Tue Dec 01 2020', 1042.5, 2);
      expectChartData(chartPts, 9, 'Fri Jan 01 2021', 1042.5, 2);
      expectChartData(chartPts, 10, 'Mon Feb 01 2021', 1042.5, 2);
      expectChartData(chartPts, 11, 'Mon Mar 01 2021', 1042.5, 2);
      expectChartData(chartPts, 12, 'Thu Apr 01 2021', 1042.5, 2);
      expectChartData(chartPts, 13, 'Sat May 01 2021', 1042.5, 2);
      expectChartData(chartPts, 14, 'Tue Jun 01 2021', 1042.5, 2);
      expectChartData(chartPts, 15, 'Thu Jul 01 2021', 1042.5, 2);
      expectChartData(chartPts, 16, 'Sun Aug 01 2021', 1042.5, 2);
      expectChartData(chartPts, 17, 'Wed Sep 01 2021', 1042.5, 2);
      expectChartData(chartPts, 18, 'Fri Oct 01 2021', 1042.5, 2);
      expectChartData(chartPts, 19, 'Mon Nov 01 2021', 1042.5, 2);
      expectChartData(chartPts, 20, 'Wed Dec 01 2021', 1042.5, 2);
      expectChartData(chartPts, 21, 'Sat Jan 01 2022', 1042.5, 2);
      expectChartData(chartPts, 22, 'Tue Feb 01 2022', 1042.5, 2);
      expectChartData(chartPts, 23, 'Tue Mar 01 2022', 1042.5, 2);
      expectChartData(chartPts, 24, 'Fri Apr 01 2022', 1042.5, 2);
      expectChartData(chartPts, 25, 'Sun May 01 2022', 1042.5, 2);
      expectChartData(chartPts, 26, 'Wed Jun 01 2022', 1042.5, 2);
      expectChartData(chartPts, 27, 'Fri Jul 01 2022', 1042.5, 2);
      expectChartData(chartPts, 28, 'Mon Aug 01 2022', 1042.5, 2);
      expectChartData(chartPts, 29, 'Thu Sep 01 2022', 1042.5, 2);
      expectChartData(chartPts, 30, 'Sat Oct 01 2022', 1042.5, 2);
      expectChartData(chartPts, 31, 'Tue Nov 01 2022', 1042.5, 2);
      expectChartData(chartPts, 32, 'Thu Dec 01 2022', 1042.5, 2);
      expectChartData(chartPts, 33, 'Sun Jan 01 2023', 1042.5, 2);
      expectChartData(chartPts, 34, 'Wed Feb 01 2023', 1042.5, 2);
      expectChartData(chartPts, 35, 'Wed Mar 01 2023', 1042.5, 2);
      expectChartData(chartPts, 36, 'Sat Apr 01 2023', 1042.5, 2);
      expectChartData(chartPts, 37, 'Mon May 01 2023', 1042.5, 2);
      expectChartData(chartPts, 38, 'Thu Jun 01 2023', 1042.5, 2);
      expectChartData(chartPts, 39, 'Sat Jul 01 2023', 1042.5, 2);
      expectChartData(chartPts, 40, 'Tue Aug 01 2023', 1042.5, 2);
      expectChartData(chartPts, 41, 'Fri Sep 01 2023', 1042.5, 2);
      expectChartData(chartPts, 42, 'Sun Oct 01 2023', 1042.5, 2);
      expectChartData(chartPts, 43, 'Wed Nov 01 2023', 1042.5, 2);
      expectChartData(chartPts, 44, 'Fri Dec 01 2023', 1042.5, 2);
      expectChartData(chartPts, 45, 'Mon Jan 01 2024', 1042.5, 2);
      expectChartData(chartPts, 46, 'Thu Feb 01 2024', 1042.5, 2);
      expectChartData(chartPts, 47, 'Fri Mar 01 2024', 1042.5, 2);
      expectChartData(chartPts, 48, 'Mon Apr 01 2024', 1042.5, 2);
      expectChartData(chartPts, 49, 'Wed May 01 2024', 1042.5, 2);
      expectChartData(chartPts, 50, 'Sat Jun 01 2024', 1042.5, 2);
      expectChartData(chartPts, 51, 'Mon Jul 01 2024', 1042.5, 2);
      expectChartData(chartPts, 52, 'Thu Aug 01 2024', 1042.5, 2);
      expectChartData(chartPts, 53, 'Sun Sep 01 2024', 1042.5, 2);
      expectChartData(chartPts, 54, 'Tue Oct 01 2024', 1042.5, 2);
      expectChartData(chartPts, 55, 'Fri Nov 01 2024', 1042.5, 2);
      expectChartData(chartPts, 56, 'Sun Dec 01 2024', 1042.5, 2);
      expectChartData(chartPts, 57, 'Wed Jan 01 2025', 1042.5, 2);
      expectChartData(chartPts, 58, 'Sat Feb 01 2025', 1042.5, 2);
      expectChartData(chartPts, 59, 'Sat Mar 01 2025', 1042.5, 2);
      expectChartData(chartPts, 60, 'Tue Apr 01 2025', 1042.5, 2);
      expectChartData(chartPts, 61, 'Thu May 01 2025', 1042.5, 2);
      expectChartData(chartPts, 62, 'Sun Jun 01 2025', 1042.5, 2);
      expectChartData(chartPts, 63, 'Tue Jul 01 2025', 1042.5, 2);
      expectChartData(chartPts, 64, 'Fri Aug 01 2025', 1042.5, 2);
      expectChartData(chartPts, 65, 'Mon Sep 01 2025', 1042.5, 2);
      expectChartData(chartPts, 66, 'Wed Oct 01 2025', 1042.5, 2);
      expectChartData(chartPts, 67, 'Sat Nov 01 2025', 1042.5, 2);
      expectChartData(chartPts, 68, 'Mon Dec 01 2025', 1042.5, 2);
      expectChartData(chartPts, 69, 'Thu Jan 01 2026', 1042.5, 2);
      expectChartData(chartPts, 70, 'Sun Feb 01 2026', 1042.5, 2);
      expectChartData(chartPts, 71, 'Sun Mar 01 2026', 1042.5, 2);
      expectChartData(chartPts, 72, 'Wed Apr 01 2026', 1042.5, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(73);
      expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1542.5, 2);
      expectChartData(chartPts, 1, 'Fri May 01 2020', 2585.06, 2);
      expectChartData(chartPts, 2, 'Mon Jun 01 2020', 3627.51, 2);
      expectChartData(chartPts, 3, 'Wed Jul 01 2020', 4670.0, 2);
      expectChartData(chartPts, 4, 'Sat Aug 01 2020', 5712.54, 2);
      expectChartData(chartPts, 5, 'Tue Sep 01 2020', 6755.12, 2);
      expectChartData(chartPts, 6, 'Thu Oct 01 2020', 7797.74, 2);
      expectChartData(chartPts, 7, 'Sun Nov 01 2020', 8840.4, 2);
      expectChartData(chartPts, 8, 'Tue Dec 01 2020', 9883.11, 2);
      expectChartData(chartPts, 9, 'Fri Jan 01 2021', 10925.86, 2);
      expectChartData(chartPts, 10, 'Mon Feb 01 2021', 11968.66, 2);
      expectChartData(chartPts, 11, 'Mon Mar 01 2021', 13011.5, 2);
      expectChartData(chartPts, 12, 'Thu Apr 01 2021', 14054.38, 2);
      expectChartData(chartPts, 13, 'Sat May 01 2021', 15097.22, 2);
      expectChartData(chartPts, 14, 'Tue Jun 01 2021', 16140.19, 2);
      expectChartData(chartPts, 15, 'Thu Jul 01 2021', 17183.2, 2);
      expectChartData(chartPts, 16, 'Sun Aug 01 2021', 18226.26, 2);
      expectChartData(chartPts, 17, 'Wed Sep 01 2021', 19269.36, 2);
      expectChartData(chartPts, 18, 'Fri Oct 01 2021', 20312.5, 2);
      expectChartData(chartPts, 19, 'Mon Nov 01 2021', 21355.69, 2);
      expectChartData(chartPts, 20, 'Wed Dec 01 2021', 22398.92, 2);
      expectChartData(chartPts, 21, 'Sat Jan 01 2022', 23442.19, 2);
      expectChartData(chartPts, 22, 'Tue Feb 01 2022', 24485.51, 2);
      expectChartData(chartPts, 23, 'Tue Mar 01 2022', 25528.87, 2);
      expectChartData(chartPts, 24, 'Fri Apr 01 2022', 26572.27, 2);
      expectChartData(chartPts, 25, 'Sun May 01 2022', 27615.64, 2);
      expectChartData(chartPts, 26, 'Wed Jun 01 2022', 28659.13, 2);
      expectChartData(chartPts, 27, 'Fri Jul 01 2022', 29702.66, 2);
      expectChartData(chartPts, 28, 'Mon Aug 01 2022', 30746.24, 2);
      expectChartData(chartPts, 29, 'Thu Sep 01 2022', 31789.86, 2);
      expectChartData(chartPts, 30, 'Sat Oct 01 2022', 32833.52, 2);
      expectChartData(chartPts, 31, 'Tue Nov 01 2022', 33877.23, 2);
      expectChartData(chartPts, 32, 'Thu Dec 01 2022', 34920.98, 2);
      expectChartData(chartPts, 33, 'Sun Jan 01 2023', 35964.78, 2);
      expectChartData(chartPts, 34, 'Wed Feb 01 2023', 37008.62, 2);
      expectChartData(chartPts, 35, 'Wed Mar 01 2023', 38052.5, 2);
      expectChartData(chartPts, 36, 'Sat Apr 01 2023', 39096.42, 2);
      expectChartData(chartPts, 37, 'Mon May 01 2023', 40141.56, 2);
      expectChartData(chartPts, 38, 'Thu Jun 01 2023', 41185.68, 2);
      expectChartData(chartPts, 39, 'Sat Jul 01 2023', 42229.86, 2);
      expectChartData(chartPts, 40, 'Tue Aug 01 2023', 43274.09, 2);
      expectChartData(chartPts, 41, 'Fri Sep 01 2023', 44318.37, 2);
      expectChartData(chartPts, 42, 'Sun Oct 01 2023', 45362.71, 2);
      expectChartData(chartPts, 43, 'Wed Nov 01 2023', 46407.09, 2);
      expectChartData(chartPts, 44, 'Fri Dec 01 2023', 47451.52, 2);
      expectChartData(chartPts, 45, 'Mon Jan 01 2024', 48496.0, 2);
      expectChartData(chartPts, 46, 'Thu Feb 01 2024', 49540.52, 2);
      expectChartData(chartPts, 47, 'Fri Mar 01 2024', 50585.08, 2);
      expectChartData(chartPts, 48, 'Mon Apr 01 2024', 51629.69, 2);
      expectChartData(chartPts, 49, 'Wed May 01 2024', 52674.34, 2);
      expectChartData(chartPts, 50, 'Sat Jun 01 2024', 53719.03, 2);
      expectChartData(chartPts, 51, 'Mon Jul 01 2024', 54763.77, 2);
      expectChartData(chartPts, 52, 'Thu Aug 01 2024', 55808.55, 2);
      expectChartData(chartPts, 53, 'Sun Sep 01 2024', 56853.38, 2);
      expectChartData(chartPts, 54, 'Tue Oct 01 2024', 57898.25, 2);
      expectChartData(chartPts, 55, 'Fri Nov 01 2024', 58943.16, 2);
      expectChartData(chartPts, 56, 'Sun Dec 01 2024', 59988.11, 2);
      expectChartData(chartPts, 57, 'Wed Jan 01 2025', 61033.11, 2);
      expectChartData(chartPts, 58, 'Sat Feb 01 2025', 62078.15, 2);
      expectChartData(chartPts, 59, 'Sat Mar 01 2025', 63123.24, 2);
      expectChartData(chartPts, 60, 'Tue Apr 01 2025', 64168.37, 2);
      expectChartData(chartPts, 61, 'Thu May 01 2025', 65213.54, 2);
      expectChartData(chartPts, 62, 'Sun Jun 01 2025', 66258.76, 2);
      expectChartData(chartPts, 63, 'Tue Jul 01 2025', 67304.02, 2);
      expectChartData(chartPts, 64, 'Fri Aug 01 2025', 68349.32, 2);
      expectChartData(chartPts, 65, 'Mon Sep 01 2025', 69394.67, 2);
      expectChartData(chartPts, 66, 'Wed Oct 01 2025', 70440.06, 2);
      expectChartData(chartPts, 67, 'Sat Nov 01 2025', 71485.5, 2);
      expectChartData(chartPts, 68, 'Mon Dec 01 2025', 72530.97, 2);
      expectChartData(chartPts, 69, 'Thu Jan 01 2026', 73576.49, 2);
      expectChartData(chartPts, 70, 'Sun Feb 01 2026', 74622.06, 2);
      expectChartData(chartPts, 71, 'Sun Mar 01 2026', 75667.67, 2);
      expectChartData(chartPts, 72, 'Wed Apr 01 2026', 76713.32, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(73);
      expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 1, 'Fri May 01 2020', 1042.5, 2);
      expectChartData(chartPts, 2, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 10, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 11, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 12, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 13, 'Sat May 01 2021', 12508, -1);
      expectChartData(chartPts, 14, 'Tue Jun 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Thu Jul 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Sun Aug 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Wed Sep 01 2021', 0, -1);
      expectChartData(chartPts, 18, 'Fri Oct 01 2021', 0, -1);
      expectChartData(chartPts, 19, 'Mon Nov 01 2021', 0, -1);
      expectChartData(chartPts, 20, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 21, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 22, 'Tue Feb 01 2022', 0, -1);
      expectChartData(chartPts, 23, 'Tue Mar 01 2022', 0, -1);
      expectChartData(chartPts, 24, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 25, 'Sun May 01 2022', 12508, -1);
      expectChartData(chartPts, 26, 'Wed Jun 01 2022', 0, -1);
      expectChartData(chartPts, 27, 'Fri Jul 01 2022', 0, -1);
      expectChartData(chartPts, 28, 'Mon Aug 01 2022', 0, -1);
      expectChartData(chartPts, 29, 'Thu Sep 01 2022', 0, -1);
      expectChartData(chartPts, 30, 'Sat Oct 01 2022', 0, -1);
      expectChartData(chartPts, 31, 'Tue Nov 01 2022', 0, -1);
      expectChartData(chartPts, 32, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 33, 'Sun Jan 01 2023', 0, -1);
      expectChartData(chartPts, 34, 'Wed Feb 01 2023', 0, -1);
      expectChartData(chartPts, 35, 'Wed Mar 01 2023', 0, -1);
      expectChartData(chartPts, 36, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 37, 'Mon May 01 2023', 12509.25, 2);
      expectChartData(chartPts, 38, 'Thu Jun 01 2023', 0, -1);
      expectChartData(chartPts, 39, 'Sat Jul 01 2023', 0, -1);
      expectChartData(chartPts, 40, 'Tue Aug 01 2023', 0, -1);
      expectChartData(chartPts, 41, 'Fri Sep 01 2023', 0, -1);
      expectChartData(chartPts, 42, 'Sun Oct 01 2023', 0, -1);
      expectChartData(chartPts, 43, 'Wed Nov 01 2023', 0, -1);
      expectChartData(chartPts, 44, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 45, 'Mon Jan 01 2024', 0, -1);
      expectChartData(chartPts, 46, 'Thu Feb 01 2024', 0, -1);
      expectChartData(chartPts, 47, 'Fri Mar 01 2024', 0, -1);
      expectChartData(chartPts, 48, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 49, 'Wed May 01 2024', 12510, -1);
      expectChartData(chartPts, 50, 'Sat Jun 01 2024', 0, -1);
      expectChartData(chartPts, 51, 'Mon Jul 01 2024', 0, -1);
      expectChartData(chartPts, 52, 'Thu Aug 01 2024', 0, -1);
      expectChartData(chartPts, 53, 'Sun Sep 01 2024', 0, -1);
      expectChartData(chartPts, 54, 'Tue Oct 01 2024', 0, -1);
      expectChartData(chartPts, 55, 'Fri Nov 01 2024', 0, -1);
      expectChartData(chartPts, 56, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 57, 'Wed Jan 01 2025', 0, -1);
      expectChartData(chartPts, 58, 'Sat Feb 01 2025', 0, -1);
      expectChartData(chartPts, 59, 'Sat Mar 01 2025', 0, -1);
      expectChartData(chartPts, 60, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 61, 'Thu May 01 2025', 12510, -1);
      expectChartData(chartPts, 62, 'Sun Jun 01 2025', 0, -1);
      expectChartData(chartPts, 63, 'Tue Jul 01 2025', 0, -1);
      expectChartData(chartPts, 64, 'Fri Aug 01 2025', 0, -1);
      expectChartData(chartPts, 65, 'Mon Sep 01 2025', 0, -1);
      expectChartData(chartPts, 66, 'Wed Oct 01 2025', 0, -1);
      expectChartData(chartPts, 67, 'Sat Nov 01 2025', 0, -1);
      expectChartData(chartPts, 68, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 69, 'Thu Jan 01 2026', 0, -1);
      expectChartData(chartPts, 70, 'Sun Feb 01 2026', 0, -1);
      expectChartData(chartPts, 71, 'Sun Mar 01 2026', 0, -1);
      expectChartData(chartPts, 72, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(73);
      expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 1, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 10, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 11, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 12, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 13, 'Sat May 01 2021', 2, -1);
      expectChartData(chartPts, 14, 'Tue Jun 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Thu Jul 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Sun Aug 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Wed Sep 01 2021', 0, -1);
      expectChartData(chartPts, 18, 'Fri Oct 01 2021', 0, -1);
      expectChartData(chartPts, 19, 'Mon Nov 01 2021', 0, -1);
      expectChartData(chartPts, 20, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 21, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 22, 'Tue Feb 01 2022', 0, -1);
      expectChartData(chartPts, 23, 'Tue Mar 01 2022', 0, -1);
      expectChartData(chartPts, 24, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 25, 'Sun May 01 2022', 2, -1);
      expectChartData(chartPts, 26, 'Wed Jun 01 2022', 0, -1);
      expectChartData(chartPts, 27, 'Fri Jul 01 2022', 0, -1);
      expectChartData(chartPts, 28, 'Mon Aug 01 2022', 0, -1);
      expectChartData(chartPts, 29, 'Thu Sep 01 2022', 0, -1);
      expectChartData(chartPts, 30, 'Sat Oct 01 2022', 0, -1);
      expectChartData(chartPts, 31, 'Tue Nov 01 2022', 0, -1);
      expectChartData(chartPts, 32, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 33, 'Sun Jan 01 2023', 0, -1);
      expectChartData(chartPts, 34, 'Wed Feb 01 2023', 0, -1);
      expectChartData(chartPts, 35, 'Wed Mar 01 2023', 0, -1);
      expectChartData(chartPts, 36, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 37, 'Mon May 01 2023', 0.75, 2);
      expectChartData(chartPts, 38, 'Thu Jun 01 2023', 0, -1);
      expectChartData(chartPts, 39, 'Sat Jul 01 2023', 0, -1);
      expectChartData(chartPts, 40, 'Tue Aug 01 2023', 0, -1);
      expectChartData(chartPts, 41, 'Fri Sep 01 2023', 0, -1);
      expectChartData(chartPts, 42, 'Sun Oct 01 2023', 0, -1);
      expectChartData(chartPts, 43, 'Wed Nov 01 2023', 0, -1);
      expectChartData(chartPts, 44, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 45, 'Mon Jan 01 2024', 0, -1);
      expectChartData(chartPts, 46, 'Thu Feb 01 2024', 0, -1);
      expectChartData(chartPts, 47, 'Fri Mar 01 2024', 0, -1);
      expectChartData(chartPts, 48, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 49, 'Wed May 01 2024', 0, -1);
      expectChartData(chartPts, 50, 'Sat Jun 01 2024', 0, -1);
      expectChartData(chartPts, 51, 'Mon Jul 01 2024', 0, -1);
      expectChartData(chartPts, 52, 'Thu Aug 01 2024', 0, -1);
      expectChartData(chartPts, 53, 'Sun Sep 01 2024', 0, -1);
      expectChartData(chartPts, 54, 'Tue Oct 01 2024', 0, -1);
      expectChartData(chartPts, 55, 'Fri Nov 01 2024', 0, -1);
      expectChartData(chartPts, 56, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 57, 'Wed Jan 01 2025', 0, -1);
      expectChartData(chartPts, 58, 'Sat Feb 01 2025', 0, -1);
      expectChartData(chartPts, 59, 'Sat Mar 01 2025', 0, -1);
      expectChartData(chartPts, 60, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 61, 'Thu May 01 2025', 0, -1);
      expectChartData(chartPts, 62, 'Sun Jun 01 2025', 0, -1);
      expectChartData(chartPts, 63, 'Tue Jul 01 2025', 0, -1);
      expectChartData(chartPts, 64, 'Fri Aug 01 2025', 0, -1);
      expectChartData(chartPts, 65, 'Mon Sep 01 2025', 0, -1);
      expectChartData(chartPts, 66, 'Wed Oct 01 2025', 0, -1);
      expectChartData(chartPts, 67, 'Sat Nov 01 2025', 0, -1);
      expectChartData(chartPts, 68, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 69, 'Thu Jan 01 2026', 0, -1);
      expectChartData(chartPts, 70, 'Sun Feb 01 2026', 0, -1);
      expectChartData(chartPts, 71, 'Sun Mar 01 2026', 0, -1);
      expectChartData(chartPts, 72, 'Wed Apr 01 2026', 0, -1);
    }

    done();
  });

  it('payLowTax on combined income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '6505',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '6000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 6505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 7005, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 6000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 13004, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 7, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12504, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 13004, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 6505, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 6000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(13005);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(13004);
    }
    done();
  });

  it('payHighTax on combined income payment', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '25100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '25000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax, // same as PRn1
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 25100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 25600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 25000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 7, getnetincLabel('Joe'), 'Thu Apr 05 2018', 42560, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 43060, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(25100);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }
    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(25000);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(50600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(43060);
    }
    done();
  });

  it('payTopTax on two income payments', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '75100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '75000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 75100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 75600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 75000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 100555, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 50045.0, 2);
    expectEvals(evals, 7, getnetincLabel('Joe'), 'Thu Apr 05 2018', 100055, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 100555, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 75100, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 75000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(150600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(100555);
    }
    done();
  });

  it('payLowTax on separate income payments', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Jane' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '1000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13505, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 26010, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 26009, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26008, -1);
    expectEvals(evals, 8, '(incomeTax)', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12504, -1);
    expectEvals(
      evals,
      10,
      getnetincLabel('Jane'),
      'Thu Apr 05 2018',
      12504,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 26008, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12505, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12505, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 26010, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 26008, -1);
    }
    done();
  });

  it('payHighTax on separate income payments', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '25100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '25000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax, // same as PRn1
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 25100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 25600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 25000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 7, getnetincLabel('Joe'), 'Thu Apr 05 2018', 42560, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 43060, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(25100);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }
    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(25000);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(0);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(50600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(43060);
    }
    done();
  });

  it('payTopTax on separate income payments', (done) => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '75100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '75000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 75100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 75600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 75000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 100555, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 50045.0, 2);
    expectEvals(evals, 7, getnetincLabel('Joe'), 'Thu Apr 05 2018', 100055, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 100555, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRn1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 75100, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('PRn2');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 75000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expect(chartPts[0].label).toBe('Sun Apr 01 2018');
      expect(chartPts[0].y).toBe(150600);
      expect(chartPts[1].label).toBe('Tue May 01 2018');
      expect(chartPts[1].y).toBe(100555);
    }
    done();
  });

  // NI payable on income but income too low
  it('too low NI income', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 9 2018',
          END: 'March 10 2019',
          NAME: 'java',
          VALUE: `${8628 / 12}`, // 8628 is free of NI liability
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + nationalInsurance,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(40);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'java', 'Mon Apr 09 2018', 719, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Apr 09 2018', 1219, -1);
    expectEvals(evals, 4, 'Cash', 'Tue May 01 2018', 1219, -1);
    expectEvals(evals, 5, 'java', 'Wed May 09 2018', 719, -1);
    expectEvals(evals, 6, 'Cash', 'Wed May 09 2018', 1938, -1);
    expectEvals(evals, 7, 'Cash', 'Fri Jun 01 2018', 1938, -1);
    expectEvals(evals, 8, 'java', 'Sat Jun 09 2018', 719, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Jun 09 2018', 2657, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Jul 01 2018', 2657, -1);
    expectEvals(evals, 11, 'java', 'Mon Jul 09 2018', 719, -1);
    expectEvals(evals, 12, 'Cash', 'Mon Jul 09 2018', 3376, -1);
    expectEvals(evals, 13, 'Cash', 'Wed Aug 01 2018', 3376, -1);
    expectEvals(evals, 14, 'java', 'Thu Aug 09 2018', 719, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Aug 09 2018', 4095, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Sep 01 2018', 4095, -1);
    expectEvals(evals, 17, 'java', 'Sun Sep 09 2018', 719, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Sep 09 2018', 4814, -1);
    expectEvals(evals, 19, 'Cash', 'Mon Oct 01 2018', 4814, -1);
    expectEvals(evals, 20, 'java', 'Tue Oct 09 2018', 719, -1);
    expectEvals(evals, 21, 'Cash', 'Tue Oct 09 2018', 5533, -1);
    expectEvals(evals, 22, 'Cash', 'Thu Nov 01 2018', 5533, -1);
    expectEvals(evals, 23, 'java', 'Fri Nov 09 2018', 719, -1);
    expectEvals(evals, 24, 'Cash', 'Fri Nov 09 2018', 6252, -1);
    expectEvals(evals, 25, 'Cash', 'Sat Dec 01 2018', 6252, -1);
    expectEvals(evals, 26, 'java', 'Sun Dec 09 2018', 719, -1);
    expectEvals(evals, 27, 'Cash', 'Sun Dec 09 2018', 6971, -1);
    expectEvals(evals, 28, 'Cash', 'Tue Jan 01 2019', 6971, -1);
    expectEvals(evals, 29, 'java', 'Wed Jan 09 2019', 719, -1);
    expectEvals(evals, 30, 'Cash', 'Wed Jan 09 2019', 7690, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Feb 01 2019', 7690, -1);
    expectEvals(evals, 32, 'java', 'Sat Feb 09 2019', 719, -1);
    expectEvals(evals, 33, 'Cash', 'Sat Feb 09 2019', 8409, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 8409, -1);
    expectEvals(evals, 35, 'java', 'Sat Mar 09 2019', 719, -1);
    expectEvals(evals, 36, 'Cash', 'Sat Mar 09 2019', 9128, -1);
    expectEvals(evals, 37, 'Cash', 'Mon Apr 01 2019', 9128, -1);
    expectEvals(evals, 38, getnetincLabel('Joe'), 'Fri Apr 05 2019', 8628, -1);
    expectEvals(evals, 39, 'Cash', 'Wed May 01 2019', 9128, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 719, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 719, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 719, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 719, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 719, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 719, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 719, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 719, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 719, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 719, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 719, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 719, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1219, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 1938, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 2657, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 3376, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 4095, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 4814, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 5533, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 6252, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 6971, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 7690, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 8409, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 9128, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 9128, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(1);
    expect(result.taxData[0].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 8628, -1);
    }

    done();
  });

  // NI payable at low rate
  it('pay low rate NI income', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 9 2018',
          END: 'March 10 2019',
          NAME: 'java',
          VALUE: `${8728 / 12}`, // 8628 is free of NI liability, expect 12 to be paid
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + nationalInsurance,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(53);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'java', 'Mon Apr 09 2018', 727.33, 2);
    expectEvals(evals, 3, 'Cash', 'Mon Apr 09 2018', 1227.33, 2);
    expectEvals(evals, 4, 'Cash', 'Tue May 01 2018', 1227.33, 2);
    expectEvals(evals, 5, 'Cash', 'Sat May 05 2018', 1226.33, 2);
    expectEvals(evals, 6, 'java', 'Wed May 09 2018', 727.33, 2);
    expectEvals(evals, 7, 'Cash', 'Wed May 09 2018', 1953.67, 2);
    expectEvals(evals, 8, 'Cash', 'Fri Jun 01 2018', 1953.67, 2);
    expectEvals(evals, 9, 'Cash', 'Tue Jun 05 2018', 1952.67, 2);
    expectEvals(evals, 10, 'java', 'Sat Jun 09 2018', 727.33, 2);
    expectEvals(evals, 11, 'Cash', 'Sat Jun 09 2018', 2680.0, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', 2680.0, 2);
    expectEvals(evals, 13, 'Cash', 'Thu Jul 05 2018', 2679.0, 2);
    expectEvals(evals, 14, 'java', 'Mon Jul 09 2018', 727.33, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Jul 09 2018', 3406.33, 2);
    expectEvals(evals, 16, 'Cash', 'Wed Aug 01 2018', 3406.33, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Aug 05 2018', 3405.33, 2);
    expectEvals(evals, 18, 'java', 'Thu Aug 09 2018', 727.33, 2);
    expectEvals(evals, 19, 'Cash', 'Thu Aug 09 2018', 4132.67, 2);
    expectEvals(evals, 20, 'Cash', 'Sat Sep 01 2018', 4132.67, 2);
    expectEvals(evals, 21, 'Cash', 'Wed Sep 05 2018', 4131.67, 2);
    expectEvals(evals, 22, 'java', 'Sun Sep 09 2018', 727.33, 2);
    expectEvals(evals, 23, 'Cash', 'Sun Sep 09 2018', 4859, -1);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 4859, -1);
    expectEvals(evals, 25, 'Cash', 'Fri Oct 05 2018', 4858, -1);
    expectEvals(evals, 26, 'java', 'Tue Oct 09 2018', 727.33, 2);
    expectEvals(evals, 27, 'Cash', 'Tue Oct 09 2018', 5585.33, 2);
    expectEvals(evals, 28, 'Cash', 'Thu Nov 01 2018', 5585.33, 2);
    expectEvals(evals, 29, 'Cash', 'Mon Nov 05 2018', 5584.33, 2);
    expectEvals(evals, 30, 'java', 'Fri Nov 09 2018', 727.33, 2);
    expectEvals(evals, 31, 'Cash', 'Fri Nov 09 2018', 6311.67, 2);
    expectEvals(evals, 32, 'Cash', 'Sat Dec 01 2018', 6311.67, 2);
    expectEvals(evals, 33, 'Cash', 'Wed Dec 05 2018', 6310.67, 2);
    expectEvals(evals, 34, 'java', 'Sun Dec 09 2018', 727.33, 2);
    expectEvals(evals, 35, 'Cash', 'Sun Dec 09 2018', 7038.0, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Jan 05 2019', 7037.0, 2);
    expectEvals(evals, 37, 'Cash', 'Tue Jan 01 2019', 7037.0, 2);
    expectEvals(evals, 38, 'java', 'Wed Jan 09 2019', 727.33, 2);
    expectEvals(evals, 39, 'Cash', 'Wed Jan 09 2019', 7764.33, 2);
    expectEvals(evals, 40, 'Cash', 'Fri Feb 01 2019', 7764.33, 2);
    expectEvals(evals, 41, 'Cash', 'Tue Feb 05 2019', 7763.33, 2);
    expectEvals(evals, 42, 'java', 'Sat Feb 09 2019', 727.33, 2);
    expectEvals(evals, 43, 'Cash', 'Sat Feb 09 2019', 8490.67, 2);
    expectEvals(evals, 44, 'Cash', 'Fri Mar 01 2019', 8490.67, 2);
    expectEvals(evals, 45, 'Cash', 'Tue Mar 05 2019', 8489.67, 2);
    expectEvals(evals, 46, 'java', 'Sat Mar 09 2019', 727.33, 2);
    expectEvals(evals, 47, 'Cash', 'Sat Mar 09 2019', 9217, -1);
    expectEvals(evals, 48, 'Cash', 'Mon Apr 01 2019', 9217, -1);
    expectEvals(evals, 49, 'Cash', 'Fri Apr 05 2019', 9216, -1);
    expectEvals(evals, 50, '(NI)', 'Fri Apr 05 2019', 12, -1);
    expectEvals(evals, 51, 'Joe income (net)', 'Fri Apr 05 2019', 8716.0, 2);
    expectEvals(evals, 52, 'Cash', 'Wed May 01 2019', 9216, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 727.33, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 727.33, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 727.33, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 727.33, 2);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 727.33, 2);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 727.33, 2);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 727.33, 2);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 727.33, 2);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 727.33, 2);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 727.33, 2);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 727.33, 2);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 727.33, 2);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1227.33, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 1953.67, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 2680.0, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 3406.33, 2);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 4132.67, 2);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 4859, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 5585.33, 2);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 6311.67, 2);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 7037.0, 2);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 7764.33, 2);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 8490.67, 2);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 9217, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 9216, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 12, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 8716.0, 2);
    }

    done();
  });

  // NI payable at high rate
  it('pay high rate NI income', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 9 2018',
          END: 'March 10 2019',
          NAME: 'java',
          VALUE: `${50104 / 12}`, // 50004 is bottom of high rate band, expect 2 + 4965.12 to be paid
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + nationalInsurance,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(53);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'java', 'Mon Apr 09 2018', 4175.33, 2);
    expectEvals(evals, 3, 'Cash', 'Mon Apr 09 2018', 4675.33, 2);
    expectEvals(evals, 4, 'Cash', 'Tue May 01 2018', 4675.33, 2);
    expectEvals(evals, 5, 'Cash', 'Sat May 05 2018', 4261.41, 2);
    expectEvals(evals, 6, 'java', 'Wed May 09 2018', 4175.33, 2);
    expectEvals(evals, 7, 'Cash', 'Wed May 09 2018', 8436.75, 2);
    expectEvals(evals, 8, 'Cash', 'Fri Jun 01 2018', 8436.75, 2);
    expectEvals(evals, 9, 'Cash', 'Tue Jun 05 2018', 8022.83, 2);
    expectEvals(evals, 10, 'java', 'Sat Jun 09 2018', 4175.33, 2);
    expectEvals(evals, 11, 'Cash', 'Sat Jun 09 2018', 12198.16, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', 12198.16, 2);
    expectEvals(evals, 13, 'Cash', 'Thu Jul 05 2018', 11784.24, 2);
    expectEvals(evals, 14, 'java', 'Mon Jul 09 2018', 4175.33, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Jul 09 2018', 15959.57, 2);
    expectEvals(evals, 16, 'Cash', 'Wed Aug 01 2018', 15959.57, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Aug 05 2018', 15545.65, 2);
    expectEvals(evals, 18, 'java', 'Thu Aug 09 2018', 4175.33, 2);
    expectEvals(evals, 19, 'Cash', 'Thu Aug 09 2018', 19720.99, 2);
    expectEvals(evals, 20, 'Cash', 'Sat Sep 01 2018', 19720.99, 2);
    expectEvals(evals, 21, 'Cash', 'Wed Sep 05 2018', 19307.07, 2);
    expectEvals(evals, 22, 'java', 'Sun Sep 09 2018', 4175.33, 2);
    expectEvals(evals, 23, 'Cash', 'Sun Sep 09 2018', 23482.4, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 23482.4, 2);
    expectEvals(evals, 25, 'Cash', 'Fri Oct 05 2018', 23068.48, 2);
    expectEvals(evals, 26, 'java', 'Tue Oct 09 2018', 4175.33, 2);
    expectEvals(evals, 27, 'Cash', 'Tue Oct 09 2018', 27243.81, 2);
    expectEvals(evals, 28, 'Cash', 'Thu Nov 01 2018', 27243.81, 2);
    expectEvals(evals, 29, 'Cash', 'Mon Nov 05 2018', 26829.89, 2);
    expectEvals(evals, 30, 'java', 'Fri Nov 09 2018', 4175.33, 2);
    expectEvals(evals, 31, 'Cash', 'Fri Nov 09 2018', 31005.23, 2);
    expectEvals(evals, 32, 'Cash', 'Sat Dec 01 2018', 31005.23, 2);
    expectEvals(evals, 33, 'Cash', 'Wed Dec 05 2018', 30591.31, 2);
    expectEvals(evals, 34, 'java', 'Sun Dec 09 2018', 4175.33, 2);
    expectEvals(evals, 35, 'Cash', 'Sun Dec 09 2018', 34766.64, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Jan 05 2019', 34352.72, 2);
    expectEvals(evals, 37, 'Cash', 'Tue Jan 01 2019', 34352.72, 2);
    expectEvals(evals, 38, 'java', 'Wed Jan 09 2019', 4175.33, 2);
    expectEvals(evals, 39, 'Cash', 'Wed Jan 09 2019', 38528.05, 2);
    expectEvals(evals, 40, 'Cash', 'Fri Feb 01 2019', 38528.05, 2);
    expectEvals(evals, 41, 'Cash', 'Tue Feb 05 2019', 38114.13, 2);
    expectEvals(evals, 42, 'java', 'Sat Feb 09 2019', 4175.33, 2);
    expectEvals(evals, 43, 'Cash', 'Sat Feb 09 2019', 42289.47, 2);
    expectEvals(evals, 44, 'Cash', 'Fri Mar 01 2019', 42289.47, 2);
    expectEvals(evals, 45, 'Cash', 'Tue Mar 05 2019', 41875.55, 2);
    expectEvals(evals, 46, 'java', 'Sat Mar 09 2019', 4175.33, 2);
    expectEvals(evals, 47, 'Cash', 'Sat Mar 09 2019', 46050.88, 2);
    expectEvals(evals, 48, 'Cash', 'Mon Apr 01 2019', 46050.88, 2);
    expectEvals(evals, 49, 'Cash', 'Fri Apr 05 2019', 45636.96, 2);
    expectEvals(evals, 50, '(NI)', 'Fri Apr 05 2019', 4967.04, 2);
    expectEvals(evals, 51, 'Joe income (net)', 'Fri Apr 05 2019', 45136.96, 2);
    expectEvals(evals, 52, 'Cash', 'Wed May 01 2019', 45636.96, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4175.33, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 4175.33, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 4175.33, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 4175.33, 2);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 4175.33, 2);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 4175.33, 2);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 4175.33, 2);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 4175.33, 2);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 4175.33, 2);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 4175.33, 2);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 4175.33, 2);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 4175.33, 2);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4675.33, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 8436.75, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 12198.16, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 15959.57, 2);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 19720.99, 2);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 23482.4, 2);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 27243.81, 2);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 31005.23, 2);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 34352.72, 2);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 38528.05, 2);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 42289.47, 2);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 46050.88, 2);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 45636.96, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 4967.04, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Wed May 01 2019', 45136.96, 2);
    }
    done();
  });

  // income liable to both NI and Income tax
  it('pay NI and income tax', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(11);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 30500, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 30500, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 29569.58, 2);
    expectEvals(evals, 5, '(NI)', 'Thu Apr 05 2018', 930.42, 2);
    expectEvals(
      evals,
      6,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      29069.58,
      2,
    );
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26069.58, 2);
    expectEvals(evals, 8, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      25569.58,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 26069.58, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 26069.58, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25569.58, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3500, -1);
    }

    done();
  });

  it('sell some cars incurring capital gains', (done) => {
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
          VALUE: '150000', // value for each car
          QUANTITY: '3',
          PURCHASE_PRICE: '50000', // value for each car
          LIABILITY: 'Joe(CGT)',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '2', // selling 2 of our fleet of 3
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(19);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'PurchaseCars', 'Tue Jan 02 2018', 150000, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 450000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 450000, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 450000, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'PurchaseCars', 'Sat Mar 10 2018', 50000, 2);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 150000, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 300000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 300000, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 150000, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', 262400, 2);
    expectEvals(evals, 15, '(CGT)', 'Thu Apr 05 2018', 37600, 2);
    expectEvals(
      evals,
      16,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      162400,
      2,
    );
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', 262400, 2);
    expectEvals(evals, 18, 'Cars', 'Wed May 02 2018', 150000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 262400, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 450000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 450000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 150000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 150000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 37600, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 162400, 2);
    }

    done();
  });

  it('gain a quantity of CGT-liable assets', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'gain some shares',
          TO: 'Shrs',
          TO_VALUE: '1000', // gain 1000 shares!!
          DATE: 'January 2 2018',
        },
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '1000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 3 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300',
          QUANTITY: '1000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: 'purchasePriceSetting',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, 'purchasePriceSetting', '299', custom);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(evals, 0, 'purchasePriceSetting', 'Fri Dec 01 2017', 299, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityShrs', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'PurchaseShrs', 'Mon Jan 01 2018', 299000, -1);
    expectEvals(evals, 4, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 5, 'quantityShrs', 'Tue Jan 02 2018', 2000, -1);
    expectEvals(evals, 6, 'PurchaseShrs', 'Tue Jan 02 2018', 598000, -1);
    expectEvals(evals, 7, 'quantityShrs', 'Wed Jan 03 2018', 1000, -1);
    expectEvals(evals, 8, 'PurchaseShrs', 'Wed Jan 03 2018', 299000, -1);
    expectEvals(evals, 9, 'Shrs', 'Wed Jan 03 2018', 300000, -1);
    expectEvals(evals, 10, 'Cash', 'Wed Jan 03 2018', 300000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Feb 01 2018', 300000, -1);
    expectEvals(evals, 12, 'Shrs', 'Thu Feb 01 2018', 300000, -1);
    expectEvals(evals, 13, 'Cash', 'Thu Mar 01 2018', 300000, -1);
    expectEvals(evals, 14, 'Shrs', 'Thu Mar 01 2018', 300000, -1);
    expectEvals(evals, 15, 'Cash', 'Sun Apr 01 2018', 300000, -1);
    expectEvals(evals, 16, 'Shrs', 'Sun Apr 01 2018', 300000, -1);
    expectEvals(evals, 17, 'Joe gain (net)', 'Thu Apr 05 2018', 1000, -1);
    expectEvals(evals, 18, 'Cash', 'Tue May 01 2018', 300000, -1);
    expectEvals(evals, 19, 'Shrs', 'Tue May 01 2018', 300000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(1);
    expect(result.taxData[0].item.NAME).toBe('Joe gain (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1000, -1);
    }

    done();
  });

  it('dispose of two parts of an asset liable to CGT', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '20000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
        {
          ...simpleTransaction,
          NAME: 'sell some more shares',
          FROM: 'Shrs',
          FROM_VALUE: '20000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 3 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: '50000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 2, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 3, 'PurchaseShrs', 'Tue Jan 02 2018', 46666.67, 2);
    expectEvals(evals, 4, 'Shrs', 'Tue Jan 02 2018', 280000, -1);
    expectEvals(evals, 5, 'Cash', 'Tue Jan 02 2018', 20000, -1);
    expectEvals(evals, 6, 'PurchaseShrs', 'Wed Jan 03 2018', 43333.33, 2);
    expectEvals(evals, 7, 'Shrs', 'Wed Jan 03 2018', 260000, -1);
    expectEvals(evals, 8, 'Cash', 'Wed Jan 03 2018', 40000, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Feb 01 2018', 40000, -1);
    expectEvals(evals, 10, 'Shrs', 'Thu Feb 01 2018', 260000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 40000, -1);
    expectEvals(evals, 12, 'Shrs', 'Thu Mar 01 2018', 260000, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 40000, -1);
    expectEvals(evals, 14, 'Shrs', 'Sun Apr 01 2018', 260000, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Apr 05 2018', 35733.33, 2);
    expectEvals(evals, 16, '(CGT)', 'Thu Apr 05 2018', 4266.67, 2);
    expectEvals(
      evals,
      17,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      29066.67,
      2,
    );
    expectEvals(evals, 18, 'Cash', 'Tue May 01 2018', 35733.33, 2);
    expectEvals(evals, 19, 'Shrs', 'Tue May 01 2018', 260000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 40000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 40000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 40000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 35733.33, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 260000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 260000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 260000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 260000, -1);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 4266.67, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 29066.67, 2);
    }

    done();
  });

  it('dispose of two categorized assets liable to CGT', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some cars',
          FROM: 'Cars',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Mini1',
          START: 'January 1 2018',
          VALUE: '20001',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: '1',
          CATEGORY: 'Cars',
        },
        {
          ...simpleAsset,
          NAME: 'Mini2',
          START: 'January 1 2018',
          VALUE: '30001',
          LIABILITY: `Jake${cgt}`,
          PURCHASE_PRICE: '1',
          CATEGORY: 'Cars',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(29);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'PurchaseMini1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 2, 'Mini1', 'Mon Jan 01 2018', 20001, -1);
    expectEvals(evals, 3, 'PurchaseMini2', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 4, 'Mini2', 'Mon Jan 01 2018', 30001, -1);
    expectEvals(evals, 5, 'PurchaseMini1', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 6, 'Mini1', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 7, 'Cash', 'Tue Jan 02 2018', 20001, -1);
    expectEvals(evals, 8, 'PurchaseMini2', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 9, 'Mini2', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Tue Jan 02 2018', 50002, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Feb 01 2018', 50002, -1);
    expectEvals(evals, 12, 'Mini1', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 13, 'Mini2', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Mar 01 2018', 50002, -1);
    expectEvals(evals, 15, 'Mini1', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 16, 'Mini2', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 50002, -1);
    expectEvals(evals, 18, 'Mini1', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 19, 'Mini2', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', 48402, -1);
    expectEvals(evals, 21, '(CGT)', 'Thu Apr 05 2018', 1600.0, 2);
    expectEvals(evals, 22, 'Cash', 'Thu Apr 05 2018', 44802, -1);
    expectEvals(evals, 23, '(CGT)', 'Thu Apr 05 2018', 3600.0, 2);
    expectEvals(
      evals,
      24,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      18400,
      -1,
    );
    expectEvals(
      evals,
      25,
      getnetgainLabel('Jake'),
      'Thu Apr 05 2018',
      26400,
      -1,
    );
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 44802, -1);
    expectEvals(evals, 27, 'Mini1', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 28, 'Mini2', 'Tue May 01 2018', 0, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 50002, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 50002, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 50002, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 44802, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Mini1');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 20001, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('Mini2');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 30001, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(4);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1600.0, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getCGTLabel('Jake'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 3600.0, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 18400, -1);
    }

    expect(result.taxData[3].item.NAME).toBe(getnetgainLabel('Jake'));
    {
      const chartPts = result.taxData[3].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 26400, -1);
    }

    done();
  });
  it('dispose of part of an asset liable to CGT', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '20000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: '50000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 2, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 3, 'PurchaseShrs', 'Tue Jan 02 2018', 46666.67, 2);
    expectEvals(evals, 4, 'Shrs', 'Tue Jan 02 2018', 280000, -1);
    expectEvals(evals, 5, 'Cash', 'Tue Jan 02 2018', 20000, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 20000, -1);
    expectEvals(evals, 7, 'Shrs', 'Thu Feb 01 2018', 280000, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 20000, -1);
    expectEvals(evals, 9, 'Shrs', 'Thu Mar 01 2018', 280000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 20000, -1);
    expectEvals(evals, 11, 'Shrs', 'Sun Apr 01 2018', 280000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 05 2018', 19066.67, 2);
    expectEvals(evals, 13, '(CGT)', 'Thu Apr 05 2018', 933.33, 2);
    expectEvals(
      evals,
      14,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      15733.33,
      2,
    );
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', 19066.67, 2);
    expectEvals(evals, 16, 'Shrs', 'Tue May 01 2018', 280000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 19066.67, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 280000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 280000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 280000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 280000, -1);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 933.33, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 15733.33, 2);
    }

    done();
  });

  it('use a setting to define purchase price', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '20000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: 'purchasePriceSetting',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'purchasePriceSetting',
          VALUE: '50000',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(18);
    expectEvals(evals, 0, 'purchasePriceSetting', 'Fri Dec 01 2017', 50000, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 3, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 4, 'PurchaseShrs', 'Tue Jan 02 2018', 46666.67, 2);
    expectEvals(evals, 5, 'Shrs', 'Tue Jan 02 2018', 280000, -1);
    expectEvals(evals, 6, 'Cash', 'Tue Jan 02 2018', 20000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', 20000, -1);
    expectEvals(evals, 8, 'Shrs', 'Thu Feb 01 2018', 280000, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 20000, -1);
    expectEvals(evals, 10, 'Shrs', 'Thu Mar 01 2018', 280000, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 20000, -1);
    expectEvals(evals, 12, 'Shrs', 'Sun Apr 01 2018', 280000, -1);
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', 19066.67, 2);
    expectEvals(evals, 14, '(CGT)', 'Thu Apr 05 2018', 933.33, 2);
    expectEvals(
      evals,
      15,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      15733.33,
      2,
    );
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', 19066.67, 2);
    expectEvals(evals, 17, 'Shrs', 'Tue May 01 2018', 280000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 19066.67, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 280000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 280000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 280000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 280000, -1);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 933.33, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 15733.33, 2);
    }

    done();
  });

  it('use a revalued setting to define purchase price', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        // at start of model, purchasePriceSetting
        // is 300000
        // just before start of asset, set purchasePriceSetting
        // to 50000
        {
          ...simpleTransaction,
          NAME: 'Revalue of purchase price 1',
          TO: 'purchasePriceSetting',
          TO_VALUE: '50000',
          DATE: 'December 31 2017',
          TYPE: revalueSetting,
        },
        // just after start of asset, set purchasePriceSetting
        // to 300000
        {
          ...simpleTransaction,
          NAME: 'Revalue of purchase price 2',
          TO: 'purchasePriceSetting',
          TO_VALUE: '300000',
          DATE: 'January 2 2018',
          TYPE: revalueSetting,
        },
        // when asset is sold, purchasePriceSetting is 300000
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '20000',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 3 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: 'purchasePriceSetting',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, 'purchasePriceSetting', '300000', custom);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(
      evals,
      0,
      'purchasePriceSetting',
      'Fri Dec 01 2017',
      300000,
      -1,
    );
    expectEvals(evals, 1, 'purchasePriceSetting', 'Sun Dec 31 2017', 50000, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 4, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(
      evals,
      5,
      'purchasePriceSetting',
      'Tue Jan 02 2018',
      300000,
      -1,
    );
    expectEvals(evals, 6, 'PurchaseShrs', 'Wed Jan 03 2018', 46666.67, 2);
    expectEvals(evals, 7, 'Shrs', 'Wed Jan 03 2018', 280000, -1);
    expectEvals(evals, 8, 'Cash', 'Wed Jan 03 2018', 20000, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Feb 01 2018', 20000, -1);
    expectEvals(evals, 10, 'Shrs', 'Thu Feb 01 2018', 280000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 20000, -1);
    expectEvals(evals, 12, 'Shrs', 'Thu Mar 01 2018', 280000, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 20000, -1);
    expectEvals(evals, 14, 'Shrs', 'Sun Apr 01 2018', 280000, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Apr 05 2018', 19066.67, 2);
    expectEvals(evals, 16, '(CGT)', 'Thu Apr 05 2018', 933.33, 2);
    expectEvals(
      evals,
      17,
      getnetgainLabel('Joe'),
      'Thu Apr 05 2018',
      15733.33,
      2,
    );
    expectEvals(evals, 18, 'Cash', 'Tue May 01 2018', 19066.67, 2);
    expectEvals(evals, 19, 'Shrs', 'Tue May 01 2018', 280000, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 19066.67, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 280000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 280000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 280000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 280000, -1);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 933.33, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 15733.33, 2);
    }

    done();
  });

  it('use a setting for purchase price and quantity', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some shares',
          FROM: 'Shrs',
          FROM_VALUE: '67',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300',
          QUANTITY: '1000',
          LIABILITY: `Joe${cgt}`,
          PURCHASE_PRICE: 'purchasePriceSetting',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, 'purchasePriceSetting', '50', custom);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(evals, 0, 'purchasePriceSetting', 'Fri Dec 01 2017', 50, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityShrs', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 4, 'Shrs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 5, 'quantityShrs', 'Tue Jan 02 2018', 933, -1);
    expectEvals(evals, 6, 'PurchaseShrs', 'Tue Jan 02 2018', 46650, 2);
    expectEvals(evals, 7, 'Shrs', 'Tue Jan 02 2018', 279900, -1);
    expectEvals(evals, 8, 'Cash', 'Tue Jan 02 2018', 20100, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Feb 01 2018', 20100, -1);
    expectEvals(evals, 10, 'Shrs', 'Thu Feb 01 2018', 279900, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 20100, -1);
    expectEvals(evals, 12, 'Shrs', 'Thu Mar 01 2018', 279900, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 20100, -1);
    expectEvals(evals, 14, 'Shrs', 'Sun Apr 01 2018', 279900, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Apr 05 2018', 19150, 2);
    expectEvals(evals, 16, '(CGT)', 'Thu Apr 05 2018', 950.0, 2);
    expectEvals(evals, 17, getnetgainLabel('Joe'), 'Thu Apr 05 2018', 15800, 2);
    expectEvals(evals, 18, 'Cash', 'Tue May 01 2018', 19150, 2);
    expectEvals(evals, 19, 'Shrs', 'Tue May 01 2018', 279900, -1);

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
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20100, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20100, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20100, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 19150, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shrs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 279900, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 279900, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 279900, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 279900, -1);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getCGTLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 950, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetgainLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 15800, 2);
    }

    done();
  });

  // CGT on selling some cars ???
});
