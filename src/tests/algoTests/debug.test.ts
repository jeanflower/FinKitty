import {
  viewFrequency,
  chartViewType,
  chartDeltas,
  annually,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {} from '../../models/exampleModels';
import { makeModelFromJSON } from '../../models/modelUtils';
import { log, printDebug } from '../../utils/utils';
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

    const model = makeModelFromJSON(json);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(410);

    const viewSettings = defaultTestViewSettings();

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
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', -7260.0, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', -7260.0, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', -7260.0, 2);
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
      expectChartData(chartPts, 3, 'Wed Apr 10 2024', 11692.3, 2);
      expectChartData(chartPts, 4, 'Thu Apr 10 2025', 11692.3, 2);
      expectChartData(chartPts, 5, 'Fri Apr 10 2026', 11692.3, 2);
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
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', -11692.3, 2);
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
      expectChartData(chartPts, 8, 'Tue Apr 10 2029', 11692.3, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });
});
