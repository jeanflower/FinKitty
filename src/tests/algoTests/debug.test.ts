import {
  viewFrequency,
  annually,
  chartViewType,
  chartDeltas,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
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

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debug test', (done) => {
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
    const model = makeModelFromJSON(json);

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
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Share/Share');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 1, 'Sun Jan 01 2023', 100, -1);
      expectChartData(chartPts, 2, 'Mon Jan 01 2024', 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });
});
