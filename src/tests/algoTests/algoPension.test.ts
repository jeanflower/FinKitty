import {
  nationalInsurance,
  separator,
  incomeTax,
  pension,
  autogen,
  CASH_ASSET_NAME,
  pensionSS,
  crystallizedPension,
  pensionDB,
  cpi,
  constType,
  annually,
  chartAdditions,
  chartDeltas,
  chartReductions,
  chartVals,
  chartViewType,
  coarse,
  fine,
  viewDetail,
  viewFrequency,
  liquidateAsset,
  allItems,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleIncome,
  simpleTransaction,
  simpleAsset,
  defaultModelSettings,
  definedBenefitsPension,
  definedContributionsPension,
  getTestModel,
  pensionExampleData,
} from '../../models/exampleModels';
import { setROI, setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import {
  Context,
  printDebug,
  suppressLogs,
  unSuppressLogs,
} from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
  expectChartData,
  getnetincLabel,
  getNILabel,
  getICLabel,
  getModelCrystallizedPension,
  getMinimalModelCopySettings,
  getModelTwoCrystallizedPensions,
} from './algoTestUtils';

describe('pension tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it('pay into defined contributions pension simplest', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'Contribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, '-PEN Pnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, '-PEN Pnsh', 'Sat Mar 10 2018', 1500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, '-PEN Pnsh', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 27569.58, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 930.42, 2);
    expectEvals(evals, 9, 'Joe income (net)', 'Thu Apr 05 2018', 29069.58, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 24369.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 12, 'Joe income (net)', 'Thu Apr 05 2018', 25869.58, 2);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 24369.58, 2);
    expectEvals(evals, 14, '-PEN Pnsh', 'Tue May 01 2018', 1500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24369.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-PEN Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25869.58, 2);
    }

    expect(result.taxData[2].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }

    done();
  });

  it('pay one-off pension and employee pension contribution', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'OneOff pension contribution', //
          FROM: 'Cash',
          FROM_VALUE: '1500', // a one-off payment
          TO: pension + 'Pnsh1', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from cash goes
          DATE: 'March 20 2018', // match the income start date
        },
        {
          // when you fill in a tax return...
          ...simpleTransaction,
          NAME: `Reduction in income liability`, //
          FROM: 'Joe' + incomeTax, // an income - reduce the liability
          FROM_VALUE: '1500', // a one-off payment
          DATE: 'March 20 2018',
        },
        {
          ...simpleTransaction,
          NAME: pension + 'Contribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh2', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh1',
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh2',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, '-PEN Pnsh1', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, '-PEN Pnsh2', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 4, '-PEN Pnsh2', 'Sat Mar 10 2018', 1500, -1);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 6, 'Cash', 'Tue Mar 20 2018', 27000, -1);
    expectEvals(evals, 7, '-PEN Pnsh1', 'Tue Mar 20 2018', 1500, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 27000, -1);
    expectEvals(evals, 9, '-PEN Pnsh1', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 10, '-PEN Pnsh2', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 05 2018', 26069.58, 2);
    expectEvals(evals, 12, '(NI)', 'Thu Apr 05 2018', 930.42, 2);
    expectEvals(
      evals,
      13,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      29069.58,
      2,
    );
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', 22869.58, 2);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      16,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      25869.58,
      2,
    );
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', 22869.58, 2);
    expectEvals(evals, 18, '-PEN Pnsh1', 'Tue May 01 2018', 1500, -1);
    expectEvals(evals, 19, '-PEN Pnsh2', 'Tue May 01 2018', 1500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 27000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22869.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-PEN Pnsh1');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-PEN Pnsh2');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25869.58, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }

    done();
  });

  it('pay into two defined contributions pension schemes', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'Jan 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'Feb 9 2018',
        },
        {
          NAME: 'cppStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'cppStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'cppStartTrigger',
          END: 'cppStopTrigger',
          NAME: 'cpp',
          VALUE: '36000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'ContributionJava', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh1', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
        {
          ...simpleTransaction,
          NAME: pension + 'ContributionCpp', // kicks in when we see income java
          FROM: 'cpp', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh2', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from income goes
          DATE: 'cppStartTrigger', // match the income start date
          STOP_DATE: 'cppStopTrigger', // match the income stop date
          TYPE: autogen,
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
          NAME: pension + 'Pnsh1',
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh2',
          START: 'January 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(29);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, '-PEN Pnsh1', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, '-PEN Pnsh2', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'java', 'Wed Jan 10 2018', 30000, -1);
    expectEvals(evals, 4, '-PEN Pnsh1', 'Wed Jan 10 2018', 1500, -1);
    expectEvals(evals, 5, 'Cash', 'Wed Jan 10 2018', 28500, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 28500, -1);
    expectEvals(evals, 7, '-PEN Pnsh1', 'Thu Feb 01 2018', 1500, -1);
    expectEvals(evals, 8, '-PEN Pnsh2', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', 27569.58, 2);
    expectEvals(evals, 10, 'Cash', 'Mon Feb 05 2018', 16202.92, 2);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 16202.92, 2);
    expectEvals(evals, 12, '-PEN Pnsh1', 'Thu Mar 01 2018', 1500, -1);
    expectEvals(evals, 13, '-PEN Pnsh2', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 14, 'cpp', 'Sat Mar 10 2018', 36000, -1);
    expectEvals(evals, 15, '-PEN Pnsh2', 'Sat Mar 10 2018', 1800, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Mar 10 2018', 50402.92, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 50402.92, 2);
    expectEvals(evals, 18, '-PEN Pnsh1', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 19, '-PEN Pnsh2', 'Sun Apr 01 2018', 1800, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', 49352.5, 2);
    expectEvals(evals, 21, '(NI)', 'Thu Apr 05 2018', 1980.84, 2);
    expectEvals(
      evals,
      22,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      64019.16,
      2,
    );
    expectEvals(evals, 23, 'Cash', 'Thu Apr 05 2018', 48139.16, 2);
    expectEvals(evals, 24, '(incomeTax)', 'Thu Apr 05 2018', 12580, -1);
    expectEvals(
      evals,
      25,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      51439.16,
      2,
    );
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 48139.16, 2);
    expectEvals(evals, 27, '-PEN Pnsh1', 'Tue May 01 2018', 1500, -1);
    expectEvals(evals, 28, '-PEN Pnsh2', 'Tue May 01 2018', 1800, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('cpp');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 36000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 16202.92, 2);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 50402.92, 2);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 48139.16, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-PEN Pnsh1');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 1500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-PEN Pnsh2');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1800, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1800, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1980.84, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 51439.16, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12580, -1);
    }

    done();
  });

  it('pay into defined contributions pension with employer contribution', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'Contribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, `${pension}Pnsh`, 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, `${pension}Pnsh`, 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, `${pension}Pnsh`, 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 27569.58, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 930.42, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      29069.58,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 24369.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      25869.58,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 24369.58, 2);
    expectEvals(evals, 14, `${pension}Pnsh`, 'Tue May 01 2018', 4500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24369.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pension}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 25869.58, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }

    done();
  });

  it('pay monthly pay into defined contributions pension with employer contribution', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'April 7 2017',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 4 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '2500', // monthly payments
          VALUE_SET: 'January 1 2017',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'Contribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2017',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh',
          START: 'March 1 2017',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(94);
    expectEvals(evals, 0, 'Cash', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 1, `${pension}Pnsh`, 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 3, `${pension}Pnsh`, 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 4, 'java', 'Fri Apr 07 2017', 2500, -1);
    expectEvals(evals, 5, `${pension}Pnsh`, 'Fri Apr 07 2017', 375, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Apr 07 2017', 2375, -1);
    expectEvals(evals, 7, 'Cash', 'Mon May 01 2017', 2375, -1);
    expectEvals(evals, 8, `${pension}Pnsh`, 'Mon May 01 2017', 375, -1);
    expectEvals(evals, 9, 'Cash', 'Fri May 05 2017', 2161.28, 2);
    expectEvals(evals, 10, 'Cash', 'Fri May 05 2017', 1894.62, 2);
    expectEvals(evals, 11, 'java', 'Sun May 07 2017', 2500, -1);
    expectEvals(evals, 12, `${pension}Pnsh`, 'Sun May 07 2017', 750, -1);
    expectEvals(evals, 13, 'Cash', 'Sun May 07 2017', 4269.62, 2);
    expectEvals(evals, 14, 'Cash', 'Thu Jun 01 2017', 4269.62, 2);
    expectEvals(evals, 15, `${pension}Pnsh`, 'Thu Jun 01 2017', 750, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Jun 05 2017', 4055.9, 2);
    expectEvals(evals, 17, 'Cash', 'Mon Jun 05 2017', 3789.24, 2);
    expectEvals(evals, 18, 'java', 'Wed Jun 07 2017', 2500, -1);
    expectEvals(evals, 19, `${pension}Pnsh`, 'Wed Jun 07 2017', 1125, -1);
    expectEvals(evals, 20, 'Cash', 'Wed Jun 07 2017', 6164.24, 2);
    expectEvals(evals, 21, 'Cash', 'Sat Jul 01 2017', 6164.24, 2);
    expectEvals(evals, 22, `${pension}Pnsh`, 'Sat Jul 01 2017', 1125, -1);
    expectEvals(evals, 23, 'Cash', 'Wed Jul 05 2017', 5950.52, 2);
    expectEvals(evals, 24, 'Cash', 'Wed Jul 05 2017', 5683.86, 2);
    expectEvals(evals, 25, 'java', 'Fri Jul 07 2017', 2500, -1);
    expectEvals(evals, 26, `${pension}Pnsh`, 'Fri Jul 07 2017', 1500, -1);
    expectEvals(evals, 27, 'Cash', 'Fri Jul 07 2017', 8058.86, 2);
    expectEvals(evals, 28, 'Cash', 'Tue Aug 01 2017', 8058.86, 2);
    expectEvals(evals, 29, `${pension}Pnsh`, 'Tue Aug 01 2017', 1500, -1);
    expectEvals(evals, 30, 'Cash', 'Sat Aug 05 2017', 7845.14, 2);
    expectEvals(evals, 31, 'Cash', 'Sat Aug 05 2017', 7578.48, 2);
    expectEvals(evals, 32, 'java', 'Mon Aug 07 2017', 2500, -1);
    expectEvals(evals, 33, `${pension}Pnsh`, 'Mon Aug 07 2017', 1875, -1);
    expectEvals(evals, 34, 'Cash', 'Mon Aug 07 2017', 9953.48, 2);
    expectEvals(evals, 35, 'Cash', 'Fri Sep 01 2017', 9953.48, 2);
    expectEvals(evals, 36, `${pension}Pnsh`, 'Fri Sep 01 2017', 1875, -1);
    expectEvals(evals, 37, 'Cash', 'Tue Sep 05 2017', 9739.76, 2);
    expectEvals(evals, 38, 'Cash', 'Tue Sep 05 2017', 9473.1, 2);
    expectEvals(evals, 39, 'java', 'Thu Sep 07 2017', 2500, -1);
    expectEvals(evals, 40, `${pension}Pnsh`, 'Thu Sep 07 2017', 2250, -1);
    expectEvals(evals, 41, 'Cash', 'Thu Sep 07 2017', 11848.1, 2);
    expectEvals(evals, 42, 'Cash', 'Sun Oct 01 2017', 11848.1, 2);
    expectEvals(evals, 43, `${pension}Pnsh`, 'Sun Oct 01 2017', 2250, -1);
    expectEvals(evals, 44, 'Cash', 'Thu Oct 05 2017', 11634.38, 2);
    expectEvals(evals, 45, 'Cash', 'Thu Oct 05 2017', 11367.72, 2);
    expectEvals(evals, 46, 'java', 'Sat Oct 07 2017', 2500, -1);
    expectEvals(evals, 47, `${pension}Pnsh`, 'Sat Oct 07 2017', 2625, -1);
    expectEvals(evals, 48, 'Cash', 'Sat Oct 07 2017', 13742.72, 2);
    expectEvals(evals, 49, 'Cash', 'Wed Nov 01 2017', 13742.72, 2);
    expectEvals(evals, 50, `${pension}Pnsh`, 'Wed Nov 01 2017', 2625, -1);
    expectEvals(evals, 51, 'Cash', 'Sun Nov 05 2017', 13529.0, 2);
    expectEvals(evals, 52, 'Cash', 'Sun Nov 05 2017', 13262.34, 2);
    expectEvals(evals, 53, 'java', 'Tue Nov 07 2017', 2500, -1);
    expectEvals(evals, 54, `${pension}Pnsh`, 'Tue Nov 07 2017', 3000, -1);
    expectEvals(evals, 55, 'Cash', 'Tue Nov 07 2017', 15637.34, 2);
    expectEvals(evals, 56, 'Cash', 'Fri Dec 01 2017', 15637.34, 2);
    expectEvals(evals, 57, `${pension}Pnsh`, 'Fri Dec 01 2017', 3000, -1);
    expectEvals(evals, 58, 'Cash', 'Tue Dec 05 2017', 15423.62, 2);
    expectEvals(evals, 59, 'Cash', 'Tue Dec 05 2017', 15156.96, 2);
    expectEvals(evals, 60, 'java', 'Thu Dec 07 2017', 2500, -1);
    expectEvals(evals, 61, `${pension}Pnsh`, 'Thu Dec 07 2017', 3375, -1);
    expectEvals(evals, 62, 'Cash', 'Thu Dec 07 2017', 17531.96, 2);
    expectEvals(evals, 63, 'Cash', 'Fri Jan 05 2018', 17318.24, 2);
    expectEvals(evals, 64, 'Cash', 'Fri Jan 05 2018', 17051.58, 2);
    expectEvals(evals, 65, 'Cash', 'Mon Jan 01 2018', 17051.58, 2);
    expectEvals(evals, 66, `${pension}Pnsh`, 'Mon Jan 01 2018', 3375, -1);
    expectEvals(evals, 67, 'java', 'Sun Jan 07 2018', 2500, -1);
    expectEvals(evals, 68, `${pension}Pnsh`, 'Sun Jan 07 2018', 3750, -1);
    expectEvals(evals, 69, 'Cash', 'Sun Jan 07 2018', 19426.58, 2);
    expectEvals(evals, 70, 'Cash', 'Thu Feb 01 2018', 19426.58, 2);
    expectEvals(evals, 71, `${pension}Pnsh`, 'Thu Feb 01 2018', 3750, -1);
    expectEvals(evals, 72, 'Cash', 'Mon Feb 05 2018', 19212.86, 2);
    expectEvals(evals, 73, 'Cash', 'Mon Feb 05 2018', 18946.2, 2);
    expectEvals(evals, 74, 'java', 'Wed Feb 07 2018', 2500, -1);
    expectEvals(evals, 75, `${pension}Pnsh`, 'Wed Feb 07 2018', 4125, -1);
    expectEvals(evals, 76, 'Cash', 'Wed Feb 07 2018', 21321.2, 2);
    expectEvals(evals, 77, 'Cash', 'Thu Mar 01 2018', 21321.2, 2);
    expectEvals(evals, 78, `${pension}Pnsh`, 'Thu Mar 01 2018', 4125, -1);
    expectEvals(evals, 79, 'Cash', 'Mon Mar 05 2018', 21107.48, 2);
    expectEvals(evals, 80, 'Cash', 'Mon Mar 05 2018', 20840.82, 2);
    expectEvals(evals, 81, 'java', 'Wed Mar 07 2018', 2500, -1);
    expectEvals(evals, 82, `${pension}Pnsh`, 'Wed Mar 07 2018', 4500, -1);
    expectEvals(evals, 83, 'Cash', 'Wed Mar 07 2018', 23215.82, 2);
    expectEvals(evals, 84, 'Cash', 'Sun Apr 01 2018', 23215.82, 2);
    expectEvals(evals, 85, `${pension}Pnsh`, 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 86, 'Cash', 'Thu Apr 05 2018', 23002.1, 2);
    expectEvals(evals, 87, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 88, 'Joe income (net)', 'Thu Apr 05 2018', 27435.36, 2);
    expectEvals(evals, 89, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 90, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 91, 'Joe income (net)', 'Thu Apr 05 2018', 24235.36, 2);
    expectEvals(evals, 92, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 93, `${pension}Pnsh`, 'Tue May 01 2018', 4500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 2500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 2500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 21321.2, 2);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 23215.82, 2);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pension}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 4125, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 2564.64, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24235.36, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }

    done();
  });

  it('pay into defined contributions pension with salary sacrifice', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionSS + 'Contribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: pension + 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, `${pension}Pnsh`, 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, `${pension}Pnsh`, 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, `${pension}Pnsh`, 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 27599.58, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 900.42, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27599.58,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 24399.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      24399.58,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 24399.58, 2);
    expectEvals(evals, 14, `${pension}Pnsh`, 'Tue May 01 2018', 4500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24399.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pension}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 900.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24399.58, 2);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }

    done();
  });

  ///// this is giving the wrong answer

  // should be rather like the "pay pension contributions simplest"
  // test - this involves a manual pension contribution
  // where that was siphoned off at source
  it('pay one-off pension contribution', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'OneOff pension contribution', //
          FROM: 'Cash',
          FROM_VALUE: '1500', // a one-off payment
          TO: pension + 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from cash goes
          DATE: 'March 20 2018', // match the income start date
        },
        {
          // when you fill in a tax return...
          ...simpleTransaction,
          NAME: 'Reduction in income liability', //
          FROM: 'Joe' + incomeTax, // an income - reduce the liability
          FROM_VALUE: '1500', // a one-off payment
          DATE: 'March 20 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: pension + 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, `${pension}Pnsh`, 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Cash', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Tue Mar 20 2018', 28500, -1);
    expectEvals(evals, 5, `${pension}Pnsh`, 'Tue Mar 20 2018', 1500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 7, `${pension}Pnsh`, 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 27569.58, 2);
    expectEvals(evals, 9, '(NI)', 'Thu Apr 05 2018', 930.42, 2);
    expectEvals(
      evals,
      10,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      29069.58,
      2,
    );
    expectEvals(evals, 11, 'Cash', 'Thu Apr 05 2018', 24069.58, 2);
    expectEvals(evals, 12, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(
      evals,
      13,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      25569.58,
      2,
    );
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 24069.58, 2);
    expectEvals(evals, 15, `${pension}Pnsh`, 'Tue May 01 2018', 1500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24069.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pension}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
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

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on one off crystallized pension 1', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'April 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'get some pension', //
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_VALUE: '30000', // a one-off payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'March 20 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = `${crystallizedPension}Joe.PNN`;

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, cpj, 'Thu Mar 01 2018', 60000, -1);
    expectEvals(evals, 2, cpj, 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 3, 'Cash', 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 5, cpj, 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 7, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);

    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }
    done();
  });

  it('pay into defined benefits pension simplest', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + 'NorwichBenefitAccrual', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49 / 12, // monthly pension accrual proportion
          TO: pensionDB + 'incomeFromNorwich', // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = `${pensionDB}incomeFromNorwich`;

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pdbfn, 'Sat Feb 10 2018', 50, -1);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pdbfn, 'Sat Mar 10 2018', 50, -1);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 490000, -1);
    expectEvals(evals, 4, pdbfn, 'Sat Mar 10 2018', 883.33, 2);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 465500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 465500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 455369.58, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 10130.42, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      479869.58,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 263394.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      287894.58,
      2,
    );
    expectEvals(evals, 13, pdbfn, 'Tue Apr 10 2018', 883.33, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 263394.58, 2);
    expectEvals(evals, 15, pdbfn, 'Thu May 10 2018', 883.33, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 263394.58, 2);
    expectEvals(evals, 17, pdbfn, 'Sun Jun 10 2018', 883.33, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 264277.91, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 264277.91, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 264277.91, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 490000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe(pdbfn);
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 883.33, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 465500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 263394.58, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 263394.58, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 264277.91, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 264277.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 10130.42, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 287894.58, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 191975, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    done();
  });

  it('pay into defined benefits pension salary sacrifice', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionSS + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + 'NorwichBenefitAccrual', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49 / 12, // pension accrual proportion
          TO: pensionDB + 'incomeFromNorwich', // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = `${pensionDB}incomeFromNorwich`;

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pdbfn, 'Sat Feb 10 2018', 50, -1);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pdbfn, 'Sat Mar 10 2018', 50, -1);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 490000, -1);
    expectEvals(evals, 4, pdbfn, 'Sat Mar 10 2018', 883.33, 2);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 465500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 465500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 455859.58, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 9640.42, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      455859.58,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 263884.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      263884.58,
      2,
    );
    expectEvals(evals, 13, pdbfn, 'Tue Apr 10 2018', 883.33, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 263884.58, 2);
    expectEvals(evals, 15, pdbfn, 'Thu May 10 2018', 883.33, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 263884.58, 2);
    expectEvals(evals, 17, pdbfn, 'Sun Jun 10 2018', 883.33, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 264767.91, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 264767.91, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 264767.91, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 490000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe(pdbfn);
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 883.33, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 465500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 263884.58, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 263884.58, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 264767.91, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 264767.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 9640.42, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 263884.58, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 191975, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    done();
  });

  it('pay into defined benefits pension apply cpi', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + 'NorwichBenefitAccrual', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49 / 12, // pension accrual proportion
          TO: pensionDB + 'incomeFromNorwich', // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = `${pensionDB}incomeFromNorwich`;

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pdbfn, 'Sat Feb 10 2018', 50.47, 2);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pdbfn, 'Sat Mar 10 2018', 50.95, 2);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 499343.14, 2);
    expectEvals(evals, 4, pdbfn, 'Sat Mar 10 2018', 900.66, 2);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 474375.98, 2);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 474375.98, 2);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 464058.7, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 10317.28, 2);
    expectEvals(evals, 9, 'Joe income (net)', 'Thu Apr 05 2018', 489025.86, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 268089.51, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 195969.19, 2);
    expectEvals(evals, 12, 'Joe income (net)', 'Thu Apr 05 2018', 293056.66, 2);
    expectEvals(evals, 13, pdbfn, 'Tue Apr 10 2018', 900.66, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 270633.35, 2);
    expectEvals(evals, 15, pdbfn, 'Thu May 10 2018', 909.21, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 273201.34, 2);
    expectEvals(evals, 17, pdbfn, 'Sun Jun 10 2018', 917.83, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 274119.17, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 276720.23, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 279345.97, 2);
    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 499343.14, 2);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe(pdbfn);
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 917.83, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 474375.98, 2);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 270633.35, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 273201.34, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 276720.23, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 279345.97, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 10317.28, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 293056.66, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[2].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 195969.19, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    done();
  });

  it('pay into defined benefits pension cant have TO equal cash', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + 'NorwichBenefitAccrual', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49, // pension accrual proportion
          TO: CASH_ASSET_NAME, // should fail checks - we expect a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('pay into defined benefits pension cant have TO equal an arbitrary income', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + 'NorwichBenefitAccrual', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49, // pension accrual proportion
          TO: 'java', // should fail checks - we expect a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('pay into defined benefits pension transaction must begin pensionDB', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: 'March 10 2018',
        },
        {
          NAME: 'javaStopTrigger',
          DATE: 'April 9 2018',
        },
        {
          NAME: 'pensionStartDraw',
          DATE: 'June 10 2018',
        },
        {
          NAME: 'pensionStopDraw',
          DATE: 'July 9 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'javaStartTrigger',
          END: 'javaStopTrigger',
          NAME: 'java',
          VALUE: '490000', // absurdly high single payment to trigger tax
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            'Joe' + nationalInsurance + separator + '' + 'Joe' + incomeTax,
        },
        {
          ...simpleIncome,
          START: 'pensionStartDraw',
          END: 'pensionStopDraw',
          NAME: pensionDB + 'incomeFromNorwich',
          VALUE: '50',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pension + 'NorwichContribution', // kicks in when we see income java
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income offered up to pension
          TO: '', // Defined benefits schemes do not transfer amount into an asset
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: 'NorwichBenefitAccrual', // Should trigger failure
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '' + 1.0 / 49, // pension accrual proportion
          TO: pensionDB + 'incomeFromNorwich', // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(0);
    done();
  });

  it('asset view pension transfers additions', (done) => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    //log(`model is  ${showObj(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setViewSetting(viewDetail, fine);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(viewDetail, coarse);
    viewSettings.setViewSetting(chartViewType, chartAdditions);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('D/B');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', 24500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('MoveRemainingPension/B');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', 73500, -1);
    }
    done();
  });

  it('asset view pension transfers reductions', (done) => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setViewSetting(viewDetail, fine);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(viewDetail, coarse);
    viewSettings.setViewSetting(chartViewType, chartReductions);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('D/B');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -25000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(
      'MoveRemainingPension' + separator + 'B',
    );
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -75000, -1);
    }

    done();
  });

  it('asset view pension transfers deltas', (done) => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setViewSetting(viewDetail, fine);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(viewDetail, coarse);
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('D/B');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('MoveRemainingPension/B');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -1500, -1);
    }

    done();
  });

  it('pay income tax on conditional absolute crystallized pension', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_VALUE: '50000', // a one-off absolute-value payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Buy food', //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '30010', // a one-off payment
          DATE: 'Jan 21 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '10',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = `${crystallizedPension}Joe.PNN`;

    expect(evals.length).toBe(24);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, cpj, 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, cpj, 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 6, cpj, 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 7, cpj, 'Sat Feb 03 2018', 30000, -1);
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -12041.66, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -12041.66, 2);
    expectEvals(evals, 11, cpj, 'Thu Mar 01 2018', 30000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -12041.66, 2);
    expectEvals(evals, 13, cpj, 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 16, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(evals, 18, cpj, 'Tue May 01 2018', 30000, -1);
    expectEvals(evals, 19, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(evals, 20, cpj, 'Fri Jun 01 2018', 30000, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(evals, 22, cpj, 'Fri Apr 05 2019', 17500, -1);
    expectEvals(evals, 23, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 10, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -30000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -12041.66, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -12041.66, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(cpj);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 30000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 30000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 30000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 26500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    done();
  });

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on one off crystallized pension 2', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'April 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'get some pension', //
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_VALUE: '30000', // a one-off payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'March 20 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    const cpj = `${crystallizedPension}Joe.PNN`;

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, cpj, 'Thu Mar 01 2018', 60000, -1);
    expectEvals(evals, 2, cpj, 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 3, 'Cash', 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 5, cpj, 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 7, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);

    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }
    done();
  });

  it('pay income tax on conditional categorized crystallized pension', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: 'TaxablePensions', // a category
          FROM_VALUE: '15000', // a one-off absolute-value payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Buy food', //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '30010', // a one-off payment
          DATE: 'Jan 21 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '10',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN',
          START: 'Dec 1, 2017',
          VALUE: '60000',
          CATEGORY: 'TaxablePensions',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Jake.PNN',
          START: 'Dec 1, 2017',
          VALUE: '50000',
          CATEGORY: 'TaxablePensions',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = `${crystallizedPension}Joe.PNN`;
    const cpjk = `${crystallizedPension}Jake.PNN`;

    expect(evals.length).toBe(40);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, cpjk, 'Fri Dec 01 2017', 50000, -1);
    expectEvals(evals, 2, cpj, 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 4, cpjk, 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 5, cpj, 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 8, cpjk, 'Thu Feb 01 2018', 50000, -1);
    expectEvals(evals, 9, cpj, 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 10, cpj, 'Sat Feb 03 2018', 45000, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -15000, -1);
    expectEvals(evals, 12, cpjk, 'Sat Feb 03 2018', 35000, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Feb 05 2018', -5291.66, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Feb 05 2018', -10583.32, 2);
    expectEvals(evals, 16, 'Cash', 'Thu Mar 01 2018', -10583.32, 2);
    expectEvals(evals, 17, cpjk, 'Thu Mar 01 2018', 35000, -1);
    expectEvals(evals, 18, cpj, 'Thu Mar 01 2018', 45000, -1);
    expectEvals(evals, 19, 'Cash', 'Sun Apr 01 2018', -10583.32, 2);
    expectEvals(evals, 20, cpjk, 'Sun Apr 01 2018', 35000, -1);
    expectEvals(evals, 21, cpj, 'Sun Apr 01 2018', 45000, -1);
    expectEvals(evals, 22, 'Cash', 'Thu Apr 05 2018', -5791.66, 2);
    expectEvals(evals, 23, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 24, 'Cash', 'Thu Apr 05 2018', -1000, -1);
    expectEvals(evals, 25, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 26, 'Jake income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 27, getnetincLabel('Joe'), 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', -1000, -1);
    expectEvals(evals, 29, cpjk, 'Tue May 01 2018', 35000, -1);
    expectEvals(evals, 30, cpj, 'Tue May 01 2018', 45000, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Jun 01 2018', -1000, -1);
    expectEvals(evals, 32, cpjk, 'Fri Jun 01 2018', 35000, -1);
    expectEvals(evals, 33, cpj, 'Fri Jun 01 2018', 45000, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Apr 05 2019', 11500, -1);
    expectEvals(evals, 35, cpjk, 'Fri Apr 05 2019', 22500, -1);
    expectEvals(evals, 36, 'Cash', 'Fri Apr 05 2019', 24000, -1);
    expectEvals(evals, 37, cpj, 'Fri Apr 05 2019', 32500, -1);
    expectEvals(evals, 38, 'Jake income (net)', 'Fri Apr 05 2019', 12500, -1);
    expectEvals(evals, 39, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 10, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -30000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -10583.32, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -10583.32, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -1000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -1000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(cpj);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 45000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 45000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 45000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 45000, -1);
    }

    expect(result.assetData[2].item.NAME).toBe(cpjk);
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 50000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 50000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 50000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 35000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 35000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 35000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 35000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(4);
    expect(result.taxData[0].item.NAME).toBe('Jake income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[2].item.NAME).toBe('Jake income (net)');
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 14500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[3].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[3].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 14500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    done();
  });

  it('pay income tax on conditional proportional crystallized pension', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0', // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Buy food', //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '30010', // a one-off payment
          DATE: 'Jan 21 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '10',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(24);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, '-CPTaxable Joe.PNN', 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN', 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 6, '-CPTaxable Joe.PNN', 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 7, '-CPTaxable Joe.PNN', 'Sat Feb 03 2018', 30000, -1);
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -12041.66, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -12041.66, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -12041.66, 2);
    expectEvals(evals, 13, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 16, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 30000, -1);
    expectEvals(evals, 19, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(evals, 20, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 30000, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 17500, -1);
    expectEvals(evals, 23, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 10, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -30000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -12041.66, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -12041.66, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 30000, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 30000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 30000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 26500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    done();
  });

  it('pay income tax on recurring conditional proportional crystallized pension', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0', // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          STOP_DATE: 'April 3 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Buy food', //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '30010', // a one-off payment
          DATE: 'Jan 21 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '10',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, '-CPTaxable Joe.PNN', 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN', 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 6, '-CPTaxable Joe.PNN', 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 7, '-CPTaxable Joe.PNN', 'Sat Feb 03 2018', 30000, -1);
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -12041.66, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -12041.66, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30000, -1);
    expectEvals(
      evals,
      12,
      '-CPTaxable Joe.PNN',
      'Sat Mar 03 2018',
      17958.34,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Mar 05 2018', -3983.33, 2);
    expectEvals(evals, 15, 'Cash', 'Sun Apr 01 2018', -3983.33, 2);
    expectEvals(
      evals,
      16,
      '-CPTaxable Joe.PNN',
      'Sun Apr 01 2018',
      17958.34,
      2,
    );
    expectEvals(evals, 17, 'Cash', 'Thu Apr 05 2018', 6133.33, 2);
    expectEvals(evals, 18, '(incomeTax)', 'Thu Apr 05 2018', 5908.33, 2);
    expectEvals(
      evals,
      19,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      36133.33,
      2,
    );
    expectEvals(evals, 20, 'Cash', 'Tue May 01 2018', 6133.33, 2);
    expectEvals(
      evals,
      21,
      '-CPTaxable Joe.PNN',
      'Tue May 01 2018',
      17958.34,
      2,
    );
    expectEvals(evals, 22, 'Cash', 'Fri Jun 01 2018', 6133.33, 2);
    expectEvals(
      evals,
      23,
      '-CPTaxable Joe.PNN',
      'Fri Jun 01 2018',
      17958.34,
      2,
    );
    expectEvals(evals, 24, 'Cash', 'Fri Apr 05 2019', 18633.33, 2);
    expectEvals(evals, 25, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 5458.34, 2);
    expectEvals(evals, 26, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 10, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -30000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -12041.66, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -3983.33, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 6133.33, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 6133.33, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30000, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 17958.34, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 17958.34, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 17958.34, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5908.33, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 36133.33, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    done();
  });

  it('pay income tax on list member recurring conditional proportional crystallized pension', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: 'Stocks' + separator + '' + crystallizedPension + 'Joe.PNN', // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0', // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          STOP_DATE: 'April 3 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
        {
          ...simpleTransaction,
          NAME: 'Buy food', //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '30010', // a one-off payment
          DATE: 'Jan 21 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '10',
        },
        {
          ...simpleAsset,
          NAME: 'Stocks',
          START: 'Dec 1, 2017',
          VALUE: '50',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(36);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, 'Stocks', 'Fri Dec 01 2017', 50, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN', 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 4, 'Stocks', 'Mon Jan 01 2018', 50, -1);
    expectEvals(evals, 5, '-CPTaxable Joe.PNN', 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 8, 'Stocks', 'Thu Feb 01 2018', 50, -1);
    expectEvals(evals, 9, '-CPTaxable Joe.PNN', 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 10, 'Stocks', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -29950, -1);
    expectEvals(evals, 12, '-CPTaxable Joe.PNN', 'Sat Feb 03 2018', 30050, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Feb 05 2018', -12019.16, 2);
    expectEvals(evals, 15, 'Cash', 'Thu Mar 01 2018', -12019.16, 2);
    expectEvals(evals, 16, 'Stocks', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 17, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30050, -1);
    expectEvals(
      evals,
      18,
      '-CPTaxable Joe.PNN',
      'Sat Mar 03 2018',
      18030.84,
      2,
    );
    expectEvals(evals, 19, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Mar 05 2018', -3974.33, 2);
    expectEvals(evals, 21, 'Cash', 'Sun Apr 01 2018', -3974.33, 2);
    expectEvals(evals, 22, 'Stocks', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      23,
      '-CPTaxable Joe.PNN',
      'Sun Apr 01 2018',
      18030.84,
      2,
    );
    expectEvals(evals, 24, 'Cash', 'Thu Apr 05 2018', 6125.33, 2);
    expectEvals(evals, 25, '(incomeTax)', 'Thu Apr 05 2018', 5893.83, 2);
    expectEvals(
      evals,
      26,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      36075.33,
      2,
    );
    expectEvals(evals, 27, 'Cash', 'Tue May 01 2018', 6125.33, 2);
    expectEvals(evals, 28, 'Stocks', 'Tue May 01 2018', 0, -1);
    expectEvals(
      evals,
      29,
      '-CPTaxable Joe.PNN',
      'Tue May 01 2018',
      18030.84,
      2,
    );
    expectEvals(evals, 30, 'Cash', 'Fri Jun 01 2018', 6125.33, 2);
    expectEvals(evals, 31, 'Stocks', 'Fri Jun 01 2018', 0, -1);
    expectEvals(
      evals,
      32,
      '-CPTaxable Joe.PNN',
      'Fri Jun 01 2018',
      18030.84,
      2,
    );
    expectEvals(evals, 33, 'Cash', 'Fri Apr 05 2019', 18625.33, 2);
    expectEvals(evals, 34, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 5530.84, 2);
    expectEvals(evals, 35, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 10, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -30000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -12019.16, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -3974.33, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 6125.33, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 6125.33, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 50, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 50, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 50, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-CPTaxable Joe.PNN');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30050, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 18030.84, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 18030.84, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 18030.84, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5893.83, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 36075.33, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }

    done();
  });

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on monthly crystallized pension', (done) => {
    const roi = {
      start: 'April 6, 2018 00:00:00',
      end: 'April 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Each month GetSomePension', //
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_VALUE: '2500', // a monthly payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'April 7 2018',
          STOP_DATE: 'April 4 2019',
          RECURRENCE: '1m',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 6 2018',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'April 6 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(62);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 1, '-CPTaxable Joe.PNN', 'Fri Apr 06 2018', 60000, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN', 'Sat Apr 07 2018', 57500, -1);
    expectEvals(evals, 3, 'Cash', 'Sat Apr 07 2018', 2500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat May 05 2018', 2208.34, 2);
    expectEvals(evals, 5, 'Cash', 'Sun May 06 2018', 2208.34, 2);
    expectEvals(evals, 6, '-CPTaxable Joe.PNN', 'Sun May 06 2018', 57500, -1);
    expectEvals(evals, 7, '-CPTaxable Joe.PNN', 'Mon May 07 2018', 55000, -1);
    expectEvals(evals, 8, 'Cash', 'Mon May 07 2018', 4708.34, 2);
    expectEvals(evals, 9, 'Cash', 'Tue Jun 05 2018', 4416.68, 2);
    expectEvals(evals, 10, 'Cash', 'Wed Jun 06 2018', 4416.68, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Wed Jun 06 2018', 55000, -1);
    expectEvals(evals, 12, '-CPTaxable Joe.PNN', 'Thu Jun 07 2018', 52500, -1);
    expectEvals(evals, 13, 'Cash', 'Thu Jun 07 2018', 6916.68, 2);
    expectEvals(evals, 14, 'Cash', 'Thu Jul 05 2018', 6625.02, 2);
    expectEvals(evals, 15, 'Cash', 'Fri Jul 06 2018', 6625.02, 2);
    expectEvals(evals, 16, '-CPTaxable Joe.PNN', 'Fri Jul 06 2018', 52500, -1);
    expectEvals(evals, 17, '-CPTaxable Joe.PNN', 'Sat Jul 07 2018', 50000, -1);
    expectEvals(evals, 18, 'Cash', 'Sat Jul 07 2018', 9125.02, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Aug 05 2018', 8833.36, 2);
    expectEvals(evals, 20, 'Cash', 'Mon Aug 06 2018', 8833.36, 2);
    expectEvals(evals, 21, '-CPTaxable Joe.PNN', 'Mon Aug 06 2018', 50000, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Tue Aug 07 2018', 47500, -1);
    expectEvals(evals, 23, 'Cash', 'Tue Aug 07 2018', 11333.36, 2);
    expectEvals(evals, 24, 'Cash', 'Wed Sep 05 2018', 11041.7, 2);
    expectEvals(evals, 25, 'Cash', 'Thu Sep 06 2018', 11041.7, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN', 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.PNN', 'Fri Sep 07 2018', 45000, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Sep 07 2018', 13541.7, 2);
    expectEvals(evals, 29, 'Cash', 'Fri Oct 05 2018', 13250.04, 2);
    expectEvals(evals, 30, 'Cash', 'Sat Oct 06 2018', 13250.04, 2);
    expectEvals(evals, 31, '-CPTaxable Joe.PNN', 'Sat Oct 06 2018', 45000, -1);
    expectEvals(evals, 32, '-CPTaxable Joe.PNN', 'Sun Oct 07 2018', 42500, -1);
    expectEvals(evals, 33, 'Cash', 'Sun Oct 07 2018', 15750.04, 2);
    expectEvals(evals, 34, 'Cash', 'Mon Nov 05 2018', 15458.38, 2);
    expectEvals(evals, 35, 'Cash', 'Tue Nov 06 2018', 15458.38, 2);
    expectEvals(evals, 36, '-CPTaxable Joe.PNN', 'Tue Nov 06 2018', 42500, -1);
    expectEvals(evals, 37, '-CPTaxable Joe.PNN', 'Wed Nov 07 2018', 40000, -1);
    expectEvals(evals, 38, 'Cash', 'Wed Nov 07 2018', 17958.38, 2);
    expectEvals(evals, 39, 'Cash', 'Wed Dec 05 2018', 17666.72, 2);
    expectEvals(evals, 40, 'Cash', 'Thu Dec 06 2018', 17666.72, 2);
    expectEvals(evals, 41, '-CPTaxable Joe.PNN', 'Thu Dec 06 2018', 40000, -1);
    expectEvals(evals, 42, '-CPTaxable Joe.PNN', 'Fri Dec 07 2018', 37500, -1);
    expectEvals(evals, 43, 'Cash', 'Fri Dec 07 2018', 20166.72, 2);
    expectEvals(evals, 44, 'Cash', 'Sat Jan 05 2019', 19875.06, 2);
    expectEvals(evals, 45, 'Cash', 'Sun Jan 06 2019', 19875.06, 2);
    expectEvals(evals, 46, '-CPTaxable Joe.PNN', 'Sun Jan 06 2019', 37500, -1);
    expectEvals(evals, 47, '-CPTaxable Joe.PNN', 'Mon Jan 07 2019', 35000, -1);
    expectEvals(evals, 48, 'Cash', 'Mon Jan 07 2019', 22375.06, 2);
    expectEvals(evals, 49, 'Cash', 'Tue Feb 05 2019', 22083.4, 2);
    expectEvals(evals, 50, 'Cash', 'Wed Feb 06 2019', 22083.4, 2);
    expectEvals(evals, 51, '-CPTaxable Joe.PNN', 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 52, '-CPTaxable Joe.PNN', 'Thu Feb 07 2019', 32500, -1);
    expectEvals(evals, 53, 'Cash', 'Thu Feb 07 2019', 24583.4, 2);
    expectEvals(evals, 54, 'Cash', 'Tue Mar 05 2019', 24291.74, 2);
    expectEvals(evals, 55, 'Cash', 'Wed Mar 06 2019', 24291.74, 2);
    expectEvals(evals, 56, '-CPTaxable Joe.PNN', 'Wed Mar 06 2019', 32500, -1);
    expectEvals(evals, 57, '-CPTaxable Joe.PNN', 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 58, 'Cash', 'Thu Mar 07 2019', 26791.74, 2);
    expectEvals(evals, 59, 'Cash', 'Fri Apr 05 2019', 26500, -1);
    expectEvals(evals, 60, '(incomeTax)', 'Fri Apr 05 2019', 3500, -1);
    expectEvals(evals, 61, 'Joe income (net)', 'Fri Apr 05 2019', 26500, -1);

    const viewSettings = defaultTestViewSettings();

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
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Fri Apr 06 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun May 06 2018', 2208.34, 2);
      expectChartData(chartPts, 2, 'Wed Jun 06 2018', 4416.68, 2);
      expectChartData(chartPts, 3, 'Fri Jul 06 2018', 6625.02, 2);
      expectChartData(chartPts, 4, 'Mon Aug 06 2018', 8833.36, 2);
      expectChartData(chartPts, 5, 'Thu Sep 06 2018', 11041.7, 2);
      expectChartData(chartPts, 6, 'Sat Oct 06 2018', 13250.04, 2);
      expectChartData(chartPts, 7, 'Tue Nov 06 2018', 15458.38, 2);
      expectChartData(chartPts, 8, 'Thu Dec 06 2018', 17666.72, 2);
      expectChartData(chartPts, 9, 'Sun Jan 06 2019', 19875.06, 2);
      expectChartData(chartPts, 10, 'Wed Feb 06 2019', 22083.4, 2);
      expectChartData(chartPts, 11, 'Wed Mar 06 2019', 24291.74, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Fri Apr 06 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun May 06 2018', 57500, -1);
      expectChartData(chartPts, 2, 'Wed Jun 06 2018', 55000, -1);
      expectChartData(chartPts, 3, 'Fri Jul 06 2018', 52500, -1);
      expectChartData(chartPts, 4, 'Mon Aug 06 2018', 50000, -1);
      expectChartData(chartPts, 5, 'Thu Sep 06 2018', 47500, -1);
      expectChartData(chartPts, 6, 'Sat Oct 06 2018', 45000, -1);
      expectChartData(chartPts, 7, 'Tue Nov 06 2018', 42500, -1);
      expectChartData(chartPts, 8, 'Thu Dec 06 2018', 40000, -1);
      expectChartData(chartPts, 9, 'Sun Jan 06 2019', 37500, -1);
      expectChartData(chartPts, 10, 'Wed Feb 06 2019', 35000, -1);
      expectChartData(chartPts, 11, 'Wed Mar 06 2019', 32500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('use up income tax allowance from crystallized pension', (done) => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 2, 2018 00:00:00',
          END: 'March 3, 2018 00:00:00',
          NAME: 'PRnd',
          VALUE: '50000',
          VALUE_SET: 'January 1 2018',
          GROWTH: '0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleIncome,
          START: 'April 10, 2018 00:00:00',
          END: 'April 11, 2018 00:00:00',
          NAME: 'java',
          VALUE: '10000',
          VALUE_SET: 'January 1 2018',
          GROWTH: '0',
          CPI_IMMUNE: true,
          LIABILITY: 'Joe' + incomeTax, // no liability so doesn't affect allowance
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = `${crystallizedPension}Joe.PNN`;

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, cpj, 'Thu Mar 01 2018', 60000, -1);
    expectEvals(evals, 2, 'PRnd', 'Fri Mar 02 2018', 50000, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Mar 02 2018', 50000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50000, -1);
    expectEvals(evals, 5, cpj, 'Sun Apr 01 2018', 60000, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 62500, -1);
    expectEvals(evals, 7, cpj, 'Thu Apr 05 2018', 47500, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Thu Apr 05 2018', 12500, -1);
    expectEvals(evals, 9, 'java', 'Tue Apr 10 2018', 10000, -1);
    expectEvals(evals, 10, 'Cash', 'Tue Apr 10 2018', 72500, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 72500, -1);
    expectEvals(evals, 12, cpj, 'Tue May 01 2018', 47500, -1);
    expectEvals(evals, 13, 'Cash', 'Fri Apr 05 2019', 75000, -1);
    expectEvals(evals, 14, cpj, 'Fri Apr 05 2019', 45000, -1);
    expectEvals(evals, 15, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

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
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 50000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 10000, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 50000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 72500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe.PNN');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 47500, -1);
    }
    done();
  });

  it('Defined Benefits Pension evaluations', (done) => {
    const roi = {
      start: 'Dec 1, 2019',
      end: 'May 02 2021',
    };
    const model: ModelData = getTestModel(definedBenefitsPension);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model, false); // todo reinstate extrachecks
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(119);

    const viewSettings = getMinimalModelCopySettings();
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('TeachingJob');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 2500, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 2504.13, 2);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 2508.26, 2);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 2512.41, 2);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 2516.56, 2);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 2520.71, 2);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 2524.88, 2);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 2529.05, 2);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 2533.22, 2);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 2537.41, 2);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 2541.6, 2);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 2545.8, 2);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2550.0, 2);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 2554.21, 2);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 2558.43, 2);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 2562.66, 2);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 2566.89, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 2500, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 4498.75, 2);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 6500.31, 2);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 8504.7, 2);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 10806.06, 2); /////????? was 11683.52
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 12816.1, 2);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 14828.98, 2);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 16844.68, 2);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 18863.24, 2);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 20884.63, 2);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 22908.89, 2);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 24936.0, 2);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 26965.97, 2);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 28998.8, 2);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 31034.51, 2);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 33073.08, 2);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 35114.48, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 9166.96, 2);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 24258.09, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 857.84, 2);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 2621.52, 2);
    }

    expect(result.taxData[2].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 3594.9, 2);
    }

    done();
  });

  it('Defined Contributions Pension evaluations', (done) => {
    // TODO : check
    const roi = {
      start: 'Dec 1, 2019',
      end: 'May 02 2021',
    };
    const model: ModelData = getTestModel(definedContributionsPension);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model, false); // todo reinstate extrachecks
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(108);

    const viewSettings = getMinimalModelCopySettings();
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('javaJob1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2550.0, 2);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 2554.21, 2);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 2558.43, 2);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 2562.66, 2);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 2566.89, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2422.5, 2);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 4353.12, 2);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 6286.45, 2);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 8222.48, 2);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 10439.8, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);

    expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 8832.13, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 5, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 6, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 7, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 8, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 9, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 10, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 14, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 15, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 16, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 17, 'Sat May 01 2021', 881.9, 2);
    }

    done();
  });

  it('Transferring pensions to others', (done) => {
    const roi = {
      start: 'Dec 1, 2019',
      end: 'May 02 2031',
    };
    const model: ModelData = getTestModel(pensionExampleData);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);

    // const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    const viewSettings = getMinimalModelCopySettings();
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.toggleViewFilter(Context.Asset, allItems);
    // log(`viewSettings = ${showObj(viewSettings)}`);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(11);
    expect(result.incomesData[0].item.NAME).toBe('JoeBasic');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 12600, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12600, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('JenBasic');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 12600, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12600, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe('JeffBasic');
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 12600, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12600, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[3].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[3].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 36000, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[4].item.NAME).toBe('JaneBasic');
    {
      const chartPts = result.incomesData[4].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 12600, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12600, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[5].item.NAME).toBe('JakeBasic');
    {
      const chartPts = result.incomesData[5].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 12600, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12600, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[6].item.NAME).toBe('cpp');
    {
      const chartPts = result.incomesData[6].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 48000, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[7].item.NAME).toBe('-PT javaPensh');
    {
      const chartPts = result.incomesData[7].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 360, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[8].item.NAME).toBe('-PT cppPensh');
    {
      const chartPts = result.incomesData[8].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 480, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[9].item.NAME).toBe('-PDB javaPensh');
    {
      const chartPts = result.incomesData[9].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 720, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.incomesData[10].item.NAME).toBe('-PDB cppPensh');
    {
      const chartPts = result.incomesData[10].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 960, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData.length).toBe(9);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 60732.4, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 143749.2, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 233166.06, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 292950.05, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 353219.05, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 413488.05, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 475129.05, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 536000.05, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 596255.05, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 656524.05, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 662596.5, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('-PEN javaDCP');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 3600, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 3600, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-PEN cppDCP');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 4800, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 4800, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('-CPTaxFree javaDCP');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 900, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 900, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 900, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 900, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 900, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 900, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 900, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 900, -1);
    }

    expect(result.assetData[4].item.NAME).toBe('-CPTaxFree cppDCP');
    {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 1200, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 1200, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1200, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1200, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1200, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1200, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1200, -1);
    }

    expect(result.assetData[5].item.NAME).toBe('-CPTaxable Joe.javaDCP');
    {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 2700, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData[6].item.NAME).toBe('-CPTaxable Joe.cppDCP');
    {
      const chartPts = result.assetData[6].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 3600, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData[7].item.NAME).toBe('-CPTaxable Jen.cppDCP');
    {
      const chartPts = result.assetData[7].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 3600, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 3600, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 3600, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 3600, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 3600, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.assetData[8].item.NAME).toBe('-CPTaxable Jane.javaDCP');
    {
      const chartPts = result.assetData[8].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 2700, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 2700, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 2700, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 2700, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 2700, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 2700, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(15);
    expect(result.taxData[0].item.NAME).toBe('Jake income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.8, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.8, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.8, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.8, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12149.8, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12309.8, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.8, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.2, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.8, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.8, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.8, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.8, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12053.8, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.8, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.8, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 10749.2, 2);
    }

    expect(result.taxData[2].item.NAME).toBe('Jeff income (net)');
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.8, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.8, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.8, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.8, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12125.8, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12245.8, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.8, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.2, 2);
    }

    expect(result.taxData[3].item.NAME).toBe('Jen income (net)');
    {
      const chartPts = result.taxData[3].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.8, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.8, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.8, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.8, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12053.8, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.8, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.8, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 11649.2, 2);
    }

    expect(result.taxData[4].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[4].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 19303.36, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 36456.56, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 31560.2, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.8, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.8, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12501.8, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12949.8, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.8, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.8, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.2, 2);
    }

    expect(result.taxData[5].item.NAME).toBe('Jake income (NI)');
    {
      const chartPts = result.taxData[5].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.2, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.2, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.2, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.2, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.2, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.2, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.2, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.8, 2);
    }

    expect(result.taxData[6].item.NAME).toBe('Jane income (NI)');
    {
      const chartPts = result.taxData[6].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.2, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.2, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.2, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.2, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.2, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.2, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.2, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.8, 2);
    }

    expect(result.taxData[7].item.NAME).toBe('Jeff income (NI)');
    {
      const chartPts = result.taxData[7].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.2, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.2, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.2, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.2, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.2, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.2, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.2, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.8, 2);
    }

    expect(result.taxData[8].item.NAME).toBe('Jen income (NI)');
    {
      const chartPts = result.taxData[8].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.2, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.2, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.2, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.2, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.2, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.2, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.2, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.8, 2);
    }

    expect(result.taxData[9].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[9].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 1916.64, 2);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 4923.44, 2);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 4059.8, 2);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.2, 2);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.2, 2);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.2, 2);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.2, 2);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.2, 2);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.2, 2);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.8, 2);
    }

    expect(result.taxData[10].item.NAME).toBe('Jake income (incomeTax)');
    {
      const chartPts = result.taxData[10].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 20, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 20, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 20, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 20, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 44, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 84, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 20, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.taxData[11].item.NAME).toBe('Jane income (incomeTax)');
    {
      const chartPts = result.taxData[11].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 20, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 20, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 20, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 20, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 20, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 20, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 20, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.taxData[12].item.NAME).toBe('Jeff income (incomeTax)');
    {
      const chartPts = result.taxData[12].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 20, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 20, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 20, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 20, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 38, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 68, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 20, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.taxData[13].item.NAME).toBe('Jen income (incomeTax)');
    {
      const chartPts = result.taxData[13].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 20, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 20, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 20, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 20, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 20, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 20, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 20, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    expect(result.taxData[14].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[14].chartDataPoints;
      expect(chartPts.length).toBe(12);
      expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Wed Dec 01 2021', 2180, -1);
      expectChartData(chartPts, 3, 'Thu Dec 01 2022', 7220, -1);
      expectChartData(chartPts, 4, 'Fri Dec 01 2023', 5780, -1);
      expectChartData(chartPts, 5, 'Sun Dec 01 2024', 20, -1);
      expectChartData(chartPts, 6, 'Mon Dec 01 2025', 20, -1);
      expectChartData(chartPts, 7, 'Tue Dec 01 2026', 132, -1);
      expectChartData(chartPts, 8, 'Wed Dec 01 2027', 244, -1);
      expectChartData(chartPts, 9, 'Fri Dec 01 2028', 20, -1);
      expectChartData(chartPts, 10, 'Sat Dec 01 2029', 20, -1);
      expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }

    done();
  });

  it('unused allowances', (done) => {
    const modelAndRoi = getModelTwoCrystallizedPensions();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(100);
    expectEvals(evals, 0, 'Cash', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 1, '-CPTaxable Joe.A', 'Fri Mar 01 2019', 13500, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.B', 'Fri Mar 01 2019', 13500, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 4, '-CPTaxable Joe.A', 'Mon Apr 01 2019', 13500, -1);
    expectEvals(evals, 5, '-CPTaxable Joe.B', 'Mon Apr 01 2019', 13500, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Apr 05 2019', 12500, -1);
    expectEvals(evals, 7, '-CPTaxable Joe.A', 'Fri Apr 05 2019', 1000, -1);
    expectEvals(evals, 8, 'Cash', 'Fri Apr 05 2019', 12500, -1);
    expectEvals(evals, 9, '-CPTaxable Joe.B', 'Fri Apr 05 2019', 13500, -1);
    expectEvals(evals, 10, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    expectEvals(evals, 11, 'Cash', 'Wed May 01 2019', 12500, -1);
    expectEvals(evals, 12, '-CPTaxable Joe.A', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 13, '-CPTaxable Joe.B', 'Wed May 01 2019', 13500, -1);
    expectEvals(evals, 14, 'Cash', 'Sat Jun 01 2019', 12500, -1);
    expectEvals(evals, 15, '-CPTaxable Joe.A', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 16, '-CPTaxable Joe.B', 'Sat Jun 01 2019', 13500, -1);
    expectEvals(evals, 17, 'Cash', 'Mon Jul 01 2019', 12500, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.A', 'Mon Jul 01 2019', 1000, -1);
    expectEvals(evals, 19, '-CPTaxable Joe.B', 'Mon Jul 01 2019', 13500, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Aug 01 2019', 12500, -1);
    expectEvals(evals, 21, '-CPTaxable Joe.A', 'Thu Aug 01 2019', 1000, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.B', 'Thu Aug 01 2019', 13500, -1);
    expectEvals(evals, 23, 'Cash', 'Sun Sep 01 2019', 12500, -1);
    expectEvals(evals, 24, '-CPTaxable Joe.A', 'Sun Sep 01 2019', 1000, -1);
    expectEvals(evals, 25, '-CPTaxable Joe.B', 'Sun Sep 01 2019', 13500, -1);
    expectEvals(evals, 26, 'Cash', 'Tue Oct 01 2019', 12500, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.A', 'Tue Oct 01 2019', 1000, -1);
    expectEvals(evals, 28, '-CPTaxable Joe.B', 'Tue Oct 01 2019', 13500, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Nov 01 2019', 12500, -1);
    expectEvals(evals, 30, '-CPTaxable Joe.A', 'Fri Nov 01 2019', 1000, -1);
    expectEvals(evals, 31, '-CPTaxable Joe.B', 'Fri Nov 01 2019', 13500, -1);
    expectEvals(evals, 32, 'Cash', 'Sun Dec 01 2019', 12500, -1);
    expectEvals(evals, 33, '-CPTaxable Joe.A', 'Sun Dec 01 2019', 1000, -1);
    expectEvals(evals, 34, '-CPTaxable Joe.B', 'Sun Dec 01 2019', 13500, -1);
    expectEvals(evals, 35, 'Cash', 'Wed Jan 01 2020', 12500, -1);
    expectEvals(evals, 36, '-CPTaxable Joe.A', 'Wed Jan 01 2020', 1000, -1);
    expectEvals(evals, 37, '-CPTaxable Joe.B', 'Wed Jan 01 2020', 13500, -1);
    expectEvals(evals, 38, 'Cash', 'Sat Feb 01 2020', 12500, -1);
    expectEvals(evals, 39, '-CPTaxable Joe.A', 'Sat Feb 01 2020', 1000, -1);
    expectEvals(evals, 40, '-CPTaxable Joe.B', 'Sat Feb 01 2020', 13500, -1);
    expectEvals(evals, 41, 'Cash', 'Sun Mar 01 2020', 12500, -1);
    expectEvals(evals, 42, '-CPTaxable Joe.A', 'Sun Mar 01 2020', 1000, -1);
    expectEvals(evals, 43, '-CPTaxable Joe.B', 'Sun Mar 01 2020', 13500, -1);
    expectEvals(evals, 44, 'Cash', 'Wed Apr 01 2020', 12500, -1);
    expectEvals(evals, 45, '-CPTaxable Joe.A', 'Wed Apr 01 2020', 1000, -1);
    expectEvals(evals, 46, '-CPTaxable Joe.B', 'Wed Apr 01 2020', 13500, -1);
    expectEvals(evals, 47, 'Cash', 'Sun Apr 05 2020', 13500, -1);
    expectEvals(evals, 48, '-CPTaxable Joe.A', 'Sun Apr 05 2020', 0, -1);
    expectEvals(evals, 49, 'Cash', 'Sun Apr 05 2020', 25000, -1);
    expectEvals(evals, 50, '-CPTaxable Joe.B', 'Sun Apr 05 2020', 2000, -1);
    expectEvals(evals, 51, getnetincLabel('Joe'), 'Sun Apr 05 2020', 12500, -1);
    expectEvals(evals, 52, 'Cash', 'Fri May 01 2020', 25000, -1);
    expectEvals(evals, 53, '-CPTaxable Joe.A', 'Fri May 01 2020', 0, -1);
    expectEvals(evals, 54, '-CPTaxable Joe.B', 'Fri May 01 2020', 2000, -1);
    expectEvals(evals, 55, 'Cash', 'Mon Jun 01 2020', 25000, -1);
    expectEvals(evals, 56, '-CPTaxable Joe.A', 'Mon Jun 01 2020', 0, -1);
    expectEvals(evals, 57, '-CPTaxable Joe.B', 'Mon Jun 01 2020', 2000, -1);
    expectEvals(evals, 58, 'Cash', 'Wed Jul 01 2020', 25000, -1);
    expectEvals(evals, 59, '-CPTaxable Joe.A', 'Wed Jul 01 2020', 0, -1);
    expectEvals(evals, 60, '-CPTaxable Joe.B', 'Wed Jul 01 2020', 2000, -1);
    expectEvals(evals, 61, 'Cash', 'Sat Aug 01 2020', 25000, -1);
    expectEvals(evals, 62, '-CPTaxable Joe.A', 'Sat Aug 01 2020', 0, -1);
    expectEvals(evals, 63, '-CPTaxable Joe.B', 'Sat Aug 01 2020', 2000, -1);
    expectEvals(evals, 64, 'Cash', 'Tue Sep 01 2020', 25000, -1);
    expectEvals(evals, 65, '-CPTaxable Joe.A', 'Tue Sep 01 2020', 0, -1);
    expectEvals(evals, 66, '-CPTaxable Joe.B', 'Tue Sep 01 2020', 2000, -1);
    expectEvals(evals, 67, 'Cash', 'Thu Oct 01 2020', 25000, -1);
    expectEvals(evals, 68, '-CPTaxable Joe.A', 'Thu Oct 01 2020', 0, -1);
    expectEvals(evals, 69, '-CPTaxable Joe.B', 'Thu Oct 01 2020', 2000, -1);
    expectEvals(evals, 70, 'Cash', 'Sun Nov 01 2020', 25000, -1);
    expectEvals(evals, 71, '-CPTaxable Joe.A', 'Sun Nov 01 2020', 0, -1);
    expectEvals(evals, 72, '-CPTaxable Joe.B', 'Sun Nov 01 2020', 2000, -1);
    expectEvals(evals, 73, 'Cash', 'Tue Dec 01 2020', 25000, -1);
    expectEvals(evals, 74, '-CPTaxable Joe.A', 'Tue Dec 01 2020', 0, -1);
    expectEvals(evals, 75, '-CPTaxable Joe.B', 'Tue Dec 01 2020', 2000, -1);
    expectEvals(evals, 76, 'Cash', 'Fri Jan 01 2021', 25000, -1);
    expectEvals(evals, 77, '-CPTaxable Joe.A', 'Fri Jan 01 2021', 0, -1);
    expectEvals(evals, 78, '-CPTaxable Joe.B', 'Fri Jan 01 2021', 2000, -1);
    expectEvals(evals, 79, 'Cash', 'Mon Feb 01 2021', 25000, -1);
    expectEvals(evals, 80, '-CPTaxable Joe.A', 'Mon Feb 01 2021', 0, -1);
    expectEvals(evals, 81, '-CPTaxable Joe.B', 'Mon Feb 01 2021', 2000, -1);
    expectEvals(evals, 82, 'Cash', 'Mon Mar 01 2021', 25000, -1);
    expectEvals(evals, 83, '-CPTaxable Joe.A', 'Mon Mar 01 2021', 0, -1);
    expectEvals(evals, 84, '-CPTaxable Joe.B', 'Mon Mar 01 2021', 2000, -1);
    expectEvals(evals, 85, 'Cash', 'Thu Apr 01 2021', 25000, -1);
    expectEvals(evals, 86, '-CPTaxable Joe.A', 'Thu Apr 01 2021', 0, -1);
    expectEvals(evals, 87, '-CPTaxable Joe.B', 'Thu Apr 01 2021', 2000, -1);
    expectEvals(evals, 88, 'Cash', 'Mon Apr 05 2021', 25000, -1);
    expectEvals(evals, 89, '-CPTaxable Joe.A', 'Mon Apr 05 2021', 0, -1);
    expectEvals(evals, 90, 'Cash', 'Mon Apr 05 2021', 27000, -1);
    expectEvals(evals, 91, '-CPTaxable Joe.B', 'Mon Apr 05 2021', 0, -1);
    expectEvals(evals, 92, getnetincLabel('Joe'), 'Mon Apr 05 2021', 2000, -1);
    expectEvals(evals, 93, 'Cash', 'Sat May 01 2021', 27000, -1);
    expectEvals(evals, 94, '-CPTaxable Joe.A', 'Sat May 01 2021', 0, -1);
    expectEvals(evals, 95, '-CPTaxable Joe.B', 'Sat May 01 2021', 0, -1);
    expectEvals(evals, 96, 'Cash', 'Tue Apr 05 2022', 27000, -1);
    expectEvals(evals, 97, '-CPTaxable Joe.A', 'Tue Apr 05 2022', 0, -1);
    expectEvals(evals, 98, 'Cash', 'Tue Apr 05 2022', 27000, -1);
    expectEvals(evals, 99, '-CPTaxable Joe.B', 'Tue Apr 05 2022', 0, -1);

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
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 2, 'Wed May 01 2019', 12500, -1);
      expectChartData(chartPts, 3, 'Sat Jun 01 2019', 12500, -1);
      expectChartData(chartPts, 4, 'Mon Jul 01 2019', 12500, -1);
      expectChartData(chartPts, 5, 'Thu Aug 01 2019', 12500, -1);
      expectChartData(chartPts, 6, 'Sun Sep 01 2019', 12500, -1);
      expectChartData(chartPts, 7, 'Tue Oct 01 2019', 12500, -1);
      expectChartData(chartPts, 8, 'Fri Nov 01 2019', 12500, -1);
      expectChartData(chartPts, 9, 'Sun Dec 01 2019', 12500, -1);
      expectChartData(chartPts, 10, 'Wed Jan 01 2020', 12500, -1);
      expectChartData(chartPts, 11, 'Sat Feb 01 2020', 12500, -1);
      expectChartData(chartPts, 12, 'Sun Mar 01 2020', 12500, -1);
      expectChartData(chartPts, 13, 'Wed Apr 01 2020', 12500, -1);
      expectChartData(chartPts, 14, 'Fri May 01 2020', 25000, -1);
      expectChartData(chartPts, 15, 'Mon Jun 01 2020', 25000, -1);
      expectChartData(chartPts, 16, 'Wed Jul 01 2020', 25000, -1);
      expectChartData(chartPts, 17, 'Sat Aug 01 2020', 25000, -1);
      expectChartData(chartPts, 18, 'Tue Sep 01 2020', 25000, -1);
      expectChartData(chartPts, 19, 'Thu Oct 01 2020', 25000, -1);
      expectChartData(chartPts, 20, 'Sun Nov 01 2020', 25000, -1);
      expectChartData(chartPts, 21, 'Tue Dec 01 2020', 25000, -1);
      expectChartData(chartPts, 22, 'Fri Jan 01 2021', 25000, -1);
      expectChartData(chartPts, 23, 'Mon Feb 01 2021', 25000, -1);
      expectChartData(chartPts, 24, 'Mon Mar 01 2021', 25000, -1);
      expectChartData(chartPts, 25, 'Thu Apr 01 2021', 25000, -1);
      expectChartData(chartPts, 26, 'Sat May 01 2021', 27000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.A');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Fri Mar 01 2019', 13500, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2019', 13500, -1);
      expectChartData(chartPts, 2, 'Wed May 01 2019', 1000, -1);
      expectChartData(chartPts, 3, 'Sat Jun 01 2019', 1000, -1);
      expectChartData(chartPts, 4, 'Mon Jul 01 2019', 1000, -1);
      expectChartData(chartPts, 5, 'Thu Aug 01 2019', 1000, -1);
      expectChartData(chartPts, 6, 'Sun Sep 01 2019', 1000, -1);
      expectChartData(chartPts, 7, 'Tue Oct 01 2019', 1000, -1);
      expectChartData(chartPts, 8, 'Fri Nov 01 2019', 1000, -1);
      expectChartData(chartPts, 9, 'Sun Dec 01 2019', 1000, -1);
      expectChartData(chartPts, 10, 'Wed Jan 01 2020', 1000, -1);
      expectChartData(chartPts, 11, 'Sat Feb 01 2020', 1000, -1);
      expectChartData(chartPts, 12, 'Sun Mar 01 2020', 1000, -1);
      expectChartData(chartPts, 13, 'Wed Apr 01 2020', 1000, -1);
      expectChartData(chartPts, 14, 'Fri May 01 2020', 0, -1);
      expectChartData(chartPts, 15, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 16, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 17, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 18, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 19, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 20, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 21, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 22, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 23, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 24, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 25, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 26, 'Sat May 01 2021', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-CPTaxable Joe.B');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Fri Mar 01 2019', 13500, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2019', 13500, -1);
      expectChartData(chartPts, 2, 'Wed May 01 2019', 13500, -1);
      expectChartData(chartPts, 3, 'Sat Jun 01 2019', 13500, -1);
      expectChartData(chartPts, 4, 'Mon Jul 01 2019', 13500, -1);
      expectChartData(chartPts, 5, 'Thu Aug 01 2019', 13500, -1);
      expectChartData(chartPts, 6, 'Sun Sep 01 2019', 13500, -1);
      expectChartData(chartPts, 7, 'Tue Oct 01 2019', 13500, -1);
      expectChartData(chartPts, 8, 'Fri Nov 01 2019', 13500, -1);
      expectChartData(chartPts, 9, 'Sun Dec 01 2019', 13500, -1);
      expectChartData(chartPts, 10, 'Wed Jan 01 2020', 13500, -1);
      expectChartData(chartPts, 11, 'Sat Feb 01 2020', 13500, -1);
      expectChartData(chartPts, 12, 'Sun Mar 01 2020', 13500, -1);
      expectChartData(chartPts, 13, 'Wed Apr 01 2020', 13500, -1);
      expectChartData(chartPts, 14, 'Fri May 01 2020', 2000, -1);
      expectChartData(chartPts, 15, 'Mon Jun 01 2020', 2000, -1);
      expectChartData(chartPts, 16, 'Wed Jul 01 2020', 2000, -1);
      expectChartData(chartPts, 17, 'Sat Aug 01 2020', 2000, -1);
      expectChartData(chartPts, 18, 'Tue Sep 01 2020', 2000, -1);
      expectChartData(chartPts, 19, 'Thu Oct 01 2020', 2000, -1);
      expectChartData(chartPts, 20, 'Sun Nov 01 2020', 2000, -1);
      expectChartData(chartPts, 21, 'Tue Dec 01 2020', 2000, -1);
      expectChartData(chartPts, 22, 'Fri Jan 01 2021', 2000, -1);
      expectChartData(chartPts, 23, 'Mon Feb 01 2021', 2000, -1);
      expectChartData(chartPts, 24, 'Mon Mar 01 2021', 2000, -1);
      expectChartData(chartPts, 25, 'Thu Apr 01 2021', 2000, -1);
      expectChartData(chartPts, 26, 'Sat May 01 2021', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(1);
    expect(result.taxData[0].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 2, 'Wed May 01 2019', 12500, -1);
      expectChartData(chartPts, 3, 'Sat Jun 01 2019', 0, -1);
      expectChartData(chartPts, 4, 'Mon Jul 01 2019', 0, -1);
      expectChartData(chartPts, 5, 'Thu Aug 01 2019', 0, -1);
      expectChartData(chartPts, 6, 'Sun Sep 01 2019', 0, -1);
      expectChartData(chartPts, 7, 'Tue Oct 01 2019', 0, -1);
      expectChartData(chartPts, 8, 'Fri Nov 01 2019', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 01 2019', 0, -1);
      expectChartData(chartPts, 10, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 11, 'Sat Feb 01 2020', 0, -1);
      expectChartData(chartPts, 12, 'Sun Mar 01 2020', 0, -1);
      expectChartData(chartPts, 13, 'Wed Apr 01 2020', 0, -1);
      expectChartData(chartPts, 14, 'Fri May 01 2020', 12500, -1);
      expectChartData(chartPts, 15, 'Mon Jun 01 2020', 0, -1);
      expectChartData(chartPts, 16, 'Wed Jul 01 2020', 0, -1);
      expectChartData(chartPts, 17, 'Sat Aug 01 2020', 0, -1);
      expectChartData(chartPts, 18, 'Tue Sep 01 2020', 0, -1);
      expectChartData(chartPts, 19, 'Thu Oct 01 2020', 0, -1);
      expectChartData(chartPts, 20, 'Sun Nov 01 2020', 0, -1);
      expectChartData(chartPts, 21, 'Tue Dec 01 2020', 0, -1);
      expectChartData(chartPts, 22, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 23, 'Mon Feb 01 2021', 0, -1);
      expectChartData(chartPts, 24, 'Mon Mar 01 2021', 0, -1);
      expectChartData(chartPts, 25, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 26, 'Sat May 01 2021', 2000, -1);
    }

    done();
  });
});
