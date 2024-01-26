import { makeModelFromJSON } from "../../models/modelFromJSON";
import {
  defaultModelSettings,
  getModelCoarseAndFine,
  getTestModel,
} from "../../models/testModel";
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
} from "../../localization/stringConstants";
import { makeChartDataFromEvaluations } from "../../models/charting";
import {
  emptyModel,
  simpleExpense,
  simpleAsset,
  simpleTransaction,
} from "../../models/exampleModels";
import { setSetting } from "../../models/modelUtils";
import { ModelData } from "../../types/interfaces";
import { Context, log, printDebug } from "../../utils/utils";
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
  expectChartData,
  printTestCodeForChart,
} from "./algoTestUtils";

printTestCodeForChart;
log;

describe(" chart data tests", () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it("annual accumulation for chart less than one year", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "February 2 2018",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, "Phon", "Thu Feb 01 2018", 12.12, 2);

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

  it("annual accumulation for chart more than one year", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "February 2 2018",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, "Phon", "Thu Feb 01 2018", 12.12, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Sat Dec 01 2018", 24.24, 2); // two payments
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it("annual chart data for assets deltas", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, "1 Feb 1980", viewType, "");

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 3, "savings", "Sun Apr 01 2018", 514.37, 2);
    expectEvals(evals, 4, "savings", "Tue May 01 2018", 519.25, 2);
    expectEvals(evals, 5, "savings", "Fri Jun 01 2018", 524.18, 2);
    expectEvals(evals, 6, "savings", "Sun Jul 01 2018", 529.15, 2);
    expectEvals(evals, 7, "savings", "Wed Aug 01 2018", 534.17, 2);
    expectEvals(evals, 8, "savings", "Sat Sep 01 2018", 539.24, 2);
    expectEvals(evals, 9, "savings", "Mon Oct 01 2018", 544.36, 2);
    expectEvals(evals, 10, "savings", "Thu Nov 01 2018", 549.52, 2);
    expectEvals(evals, 11, "savings", "Sat Dec 01 2018", 554.74, 2);
    expectEvals(evals, 12, "savings", "Tue Jan 01 2019", 560.0, 2);
    expectEvals(evals, 13, "savings", "Fri Feb 01 2019", 565.31, 2);
    expectEvals(evals, 14, "savings", "Fri Mar 01 2019", 570.68, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
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
      "savings" + separator + "savings",
    );
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "38", 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(growth + separator + "savings");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "38", 54.74, 2);
    }
  });

  it("annual chart data for assets computed monthly", () => {
    const roi = {
      start: "Jan 1, 2017 00:00:00",
      end: "April 1, 2020 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 3, "savings", "Sun Apr 01 2018", 514.37, 2);
    expectEvals(evals, 4, "savings", "Tue May 01 2018", 519.25, 2);
    expectEvals(evals, 5, "savings", "Fri Jun 01 2018", 524.18, 2);
    expectEvals(evals, 6, "savings", "Sun Jul 01 2018", 529.15, 2);
    expectEvals(evals, 7, "savings", "Wed Aug 01 2018", 534.17, 2);
    expectEvals(evals, 8, "savings", "Sat Sep 01 2018", 539.24, 2);
    expectEvals(evals, 9, "savings", "Mon Oct 01 2018", 544.36, 2);
    expectEvals(evals, 10, "savings", "Thu Nov 01 2018", 549.52, 2);
    expectEvals(evals, 11, "savings", "Sat Dec 01 2018", 554.74, 2);
    expectEvals(evals, 12, "savings", "Tue Jan 01 2019", 560.0, 2);
    expectEvals(evals, 13, "savings", "Fri Feb 01 2019", 565.31, 2);
    expectEvals(evals, 14, "savings", "Fri Mar 01 2019", 570.68, 2);
    expectEvals(evals, 15, "savings", "Mon Apr 01 2019", 576.09, 2);
    expectEvals(evals, 16, "savings", "Wed May 01 2019", 581.56, 2);
    expectEvals(evals, 17, "savings", "Sat Jun 01 2019", 587.08, 2);
    expectEvals(evals, 18, "savings", "Mon Jul 01 2019", 592.65, 2);
    expectEvals(evals, 19, "savings", "Thu Aug 01 2019", 598.27, 2);
    expectEvals(evals, 20, "savings", "Sun Sep 01 2019", 603.95, 2);
    expectEvals(evals, 21, "savings", "Tue Oct 01 2019", 609.68, 2);
    expectEvals(evals, 22, "savings", "Fri Nov 01 2019", 615.46, 2);
    expectEvals(evals, 23, "savings", "Sun Dec 01 2019", 621.3, 2);
    expectEvals(evals, 24, "savings", "Wed Jan 01 2020", 627.2, 2);
    expectEvals(evals, 25, "savings", "Sat Feb 01 2020", 633.15, 2);
    expectEvals(evals, 26, "savings", "Sun Mar 01 2020", 639.16, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Jan 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Tue Jan 01 2019", 560.0, 2);
      expectChartData(chartPts, 3, "Wed Jan 01 2020", 627.2, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("weekly chart data for assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model, true, false, weekly);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Mon Jan 08 2018", 500, -1);
    expectEvals(evals, 2, "savings", "Mon Jan 15 2018", 500, -1);
    expectEvals(evals, 3, "savings", "Mon Jan 22 2018", 500, -1);
    expectEvals(evals, 4, "savings", "Mon Jan 29 2018", 500, -1);
    expectEvals(evals, 5, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 6, "savings", "Mon Feb 05 2018", 504.74, 2);
    expectEvals(evals, 7, "savings", "Mon Feb 12 2018", 504.74, 2);
    expectEvals(evals, 8, "savings", "Mon Feb 19 2018", 504.74, 2);
    expectEvals(evals, 9, "savings", "Mon Feb 26 2018", 504.74, 2);
    expectEvals(evals, 10, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 11, "savings", "Mon Mar 05 2018", 509.53, 2);
    expectEvals(evals, 12, "savings", "Mon Mar 12 2018", 509.53, 2);
    expectEvals(evals, 13, "savings", "Mon Mar 19 2018", 509.53, 2);
    expectEvals(evals, 14, "savings", "Mon Mar 26 2018", 509.53, 2);
    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Fri Dec 08 2017", 0, -1);
      expectChartData(chartPts, 2, "Fri Dec 15 2017", 0, -1);
      expectChartData(chartPts, 3, "Fri Dec 22 2017", 0, -1);
      expectChartData(chartPts, 4, "Fri Dec 29 2017", 0, -1);
      expectChartData(chartPts, 5, "Fri Jan 05 2018", 500, -1);
      expectChartData(chartPts, 6, "Fri Jan 12 2018", 500, -1);
      expectChartData(chartPts, 7, "Fri Jan 19 2018", 500, -1);
      expectChartData(chartPts, 8, "Fri Jan 26 2018", 500, -1);
      expectChartData(chartPts, 9, "Fri Feb 02 2018", 504.74, 2);
      expectChartData(chartPts, 10, "Fri Feb 09 2018", 504.74, 2);
      expectChartData(chartPts, 11, "Fri Feb 16 2018", 504.74, 2);
      expectChartData(chartPts, 12, "Fri Feb 23 2018", 504.74, 2);
      expectChartData(chartPts, 13, "Fri Mar 02 2018", 509.53, 2);
      expectChartData(chartPts, 14, "Fri Mar 09 2018", 509.53, 2);
      expectChartData(chartPts, 15, "Fri Mar 16 2018", 509.53, 2);
      expectChartData(chartPts, 16, "Fri Mar 23 2018", 509.53, 2);
      expectChartData(chartPts, 17, "Fri Mar 30 2018", 509.53, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("annual chart data for assets displayed annually", () => {
    const roi = {
      start: "Jan 1, 2017 00:00:00",
      end: "April 1, 2020 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model, true, false, annually);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(27);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 3, "savings", "Sun Apr 01 2018", 514.37, 2);
    expectEvals(evals, 4, "savings", "Tue May 01 2018", 519.25, 2);
    expectEvals(evals, 5, "savings", "Fri Jun 01 2018", 524.18, 2);
    expectEvals(evals, 6, "savings", "Sun Jul 01 2018", 529.15, 2);
    expectEvals(evals, 7, "savings", "Wed Aug 01 2018", 534.17, 2);
    expectEvals(evals, 8, "savings", "Sat Sep 01 2018", 539.24, 2);
    expectEvals(evals, 9, "savings", "Mon Oct 01 2018", 544.36, 2);
    expectEvals(evals, 10, "savings", "Thu Nov 01 2018", 549.52, 2);
    expectEvals(evals, 11, "savings", "Sat Dec 01 2018", 554.74, 2);
    expectEvals(evals, 12, "savings", "Tue Jan 01 2019", 560.0, 2);
    expectEvals(evals, 13, "savings", "Fri Feb 01 2019", 565.31, 2);
    expectEvals(evals, 14, "savings", "Fri Mar 01 2019", 570.68, 2);
    expectEvals(evals, 15, "savings", "Mon Apr 01 2019", 576.09, 2);
    expectEvals(evals, 16, "savings", "Wed May 01 2019", 581.56, 2);
    expectEvals(evals, 17, "savings", "Sat Jun 01 2019", 587.08, 2);
    expectEvals(evals, 18, "savings", "Mon Jul 01 2019", 592.65, 2);
    expectEvals(evals, 19, "savings", "Thu Aug 01 2019", 598.27, 2);
    expectEvals(evals, 20, "savings", "Sun Sep 01 2019", 603.95, 2);
    expectEvals(evals, 21, "savings", "Tue Oct 01 2019", 609.68, 2);
    expectEvals(evals, 22, "savings", "Fri Nov 01 2019", 615.46, 2);
    expectEvals(evals, 23, "savings", "Sun Dec 01 2019", 621.3, 2);
    expectEvals(evals, 24, "savings", "Wed Jan 01 2020", 627.2, 2);
    expectEvals(evals, 25, "savings", "Sat Feb 01 2020", 633.15, 2);
    expectEvals(evals, 26, "savings", "Sun Mar 01 2020", 639.16, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Jan 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Tue Jan 01 2019", 560.0, 2);
      expectChartData(chartPts, 3, "Wed Jan 01 2020", 627.2, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("delta chart data for cpi assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "sell some",
          FROM: "savings",
          FROM_VALUE: "100",
          DATE: "January 2 2019",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, "1 Feb 1980", viewType, "");
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 509.04, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 518.25, 2);
    expectEvals(evals, 3, "savings", "Sun Apr 01 2018", 527.63, 2);
    expectEvals(evals, 4, "savings", "Tue May 01 2018", 537.17, 2);
    expectEvals(evals, 5, "savings", "Fri Jun 01 2018", 546.88, 2);
    expectEvals(evals, 6, "savings", "Sun Jul 01 2018", 556.78, 2);
    expectEvals(evals, 7, "savings", "Wed Aug 01 2018", 566.85, 2);
    expectEvals(evals, 8, "savings", "Sat Sep 01 2018", 577.1, 2);
    expectEvals(evals, 9, "savings", "Mon Oct 01 2018", 587.54, 2);
    expectEvals(evals, 10, "savings", "Thu Nov 01 2018", 598.17, 2);
    expectEvals(evals, 11, "savings", "Sat Dec 01 2018", 608.98, 2);
    expectEvals(evals, 12, "savings", "Tue Jan 01 2019", 620.0, 2);
    expectEvals(evals, 13, "savings", "Wed Jan 02 2019", 525.88, 2);
    expectEvals(evals, 14, "savings", "Fri Feb 01 2019", 530.36, 2);
    expectEvals(evals, 15, "savings", "Fri Mar 01 2019", 539.96, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
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
    expect(result.assetData[0].item.NAME).toBe("savings/savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "37", 500, -1);
      expectChartData(chartPts, 2, "38", 0, -1);
      expectChartData(chartPts, 3, "38", 0, -1);
      expectChartData(chartPts, 4, "38", 0, -1);
      expectChartData(chartPts, 5, "38", 0, -1);
      expectChartData(chartPts, 6, "38", 0, -1);
      expectChartData(chartPts, 7, "38", 0, -1);
      expectChartData(chartPts, 8, "38", 0, -1);
      expectChartData(chartPts, 9, "38", 0, -1);
      expectChartData(chartPts, 10, "38", 0, -1);
      expectChartData(chartPts, 11, "38", 0, -1);
      expectChartData(chartPts, 12, "38", 0, -1);
      expectChartData(chartPts, 13, "38", 0, -1);
      expectChartData(chartPts, 14, "39", 0, -1);
      expectChartData(chartPts, 15, "39", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("unidentified/savings");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "37", 0, -1);
      expectChartData(chartPts, 2, "38", 4.74, 2);
      expectChartData(chartPts, 3, "38", 4.83, 2);
      expectChartData(chartPts, 4, "38", 4.92, 2);
      expectChartData(chartPts, 5, "38", 5.01, 2);
      expectChartData(chartPts, 6, "38", 5.1, 2);
      expectChartData(chartPts, 7, "38", 5.19, 2);
      expectChartData(chartPts, 8, "38", 5.28, 2);
      expectChartData(chartPts, 9, "38", 5.38, 2);
      expectChartData(chartPts, 10, "38", 5.48, 2);
      expectChartData(chartPts, 11, "38", 5.58, 2);
      expectChartData(chartPts, 12, "38", 5.68, 2);
      expectChartData(chartPts, 13, "38", 5.78, 2);
      expectChartData(chartPts, 14, "39", 5.88, 2);
      expectChartData(chartPts, 15, "39", 5.03, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("growth/savings");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "37", 0, -1);
      expectChartData(chartPts, 2, "38", 4.3, 2);
      expectChartData(chartPts, 3, "38", 4.38, 2);
      expectChartData(chartPts, 4, "38", 4.46, 2);
      expectChartData(chartPts, 5, "38", 4.54, 2);
      expectChartData(chartPts, 6, "38", 4.62, 2);
      expectChartData(chartPts, 7, "38", 4.7, 2);
      expectChartData(chartPts, 8, "38", 4.79, 2);
      expectChartData(chartPts, 9, "38", 4.87, 2);
      expectChartData(chartPts, 10, "38", 4.96, 2);
      expectChartData(chartPts, 11, "38", 5.05, 2);
      expectChartData(chartPts, 12, "38", 5.14, 2);
      expectChartData(chartPts, 13, "38", 5.24, 2);
      expectChartData(chartPts, 14, "39", 4.48, 2);
      expectChartData(chartPts, 15, "39", 4.56, 2);
    }

    expect(result.assetData[3].item.NAME).toBe("sell some/savings");
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "37", 0, -1);
      expectChartData(chartPts, 2, "38", 0, -1);
      expectChartData(chartPts, 3, "38", 0, -1);
      expectChartData(chartPts, 4, "38", 0, -1);
      expectChartData(chartPts, 5, "38", 0, -1);
      expectChartData(chartPts, 6, "38", 0, -1);
      expectChartData(chartPts, 7, "38", 0, -1);
      expectChartData(chartPts, 8, "38", 0, -1);
      expectChartData(chartPts, 9, "38", 0, -1);
      expectChartData(chartPts, 10, "38", 0, -1);
      expectChartData(chartPts, 11, "38", 0, -1);
      expectChartData(chartPts, 12, "38", 0, -1);
      expectChartData(chartPts, 13, "38", 0, -1);
      expectChartData(chartPts, 14, "39", -100, -1);
      expectChartData(chartPts, 15, "39", 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("annual chart data for debts", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "mortgage",
          START: "January 1 2018",
          VALUE: "-500",
          GROWTH: "12",
          IS_A_DEBT: true,
          CAN_BE_NEGATIVE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, birthDate, "1 Feb 1980", viewType, "");

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "mortgage", "Mon Jan 01 2018", -500, -1);
    expectEvals(evals, 1, "mortgage", "Thu Feb 01 2018", -504.74, 2);
    expectEvals(evals, 2, "mortgage", "Thu Mar 01 2018", -509.53, 2);
    expectEvals(evals, 3, "mortgage", "Sun Apr 01 2018", -514.37, 2);
    expectEvals(evals, 4, "mortgage", "Tue May 01 2018", -519.25, 2);
    expectEvals(evals, 5, "mortgage", "Fri Jun 01 2018", -524.18, 2);
    expectEvals(evals, 6, "mortgage", "Sun Jul 01 2018", -529.15, 2);
    expectEvals(evals, 7, "mortgage", "Wed Aug 01 2018", -534.17, 2);
    expectEvals(evals, 8, "mortgage", "Sat Sep 01 2018", -539.24, 2);
    expectEvals(evals, 9, "mortgage", "Mon Oct 01 2018", -544.36, 2);
    expectEvals(evals, 10, "mortgage", "Thu Nov 01 2018", -549.52, 2);
    expectEvals(evals, 11, "mortgage", "Sat Dec 01 2018", -554.74, 2);
    expectEvals(evals, 12, "mortgage", "Tue Jan 01 2019", -560.0, 2);
    expectEvals(evals, 13, "mortgage", "Fri Feb 01 2019", -565.31, 2);
    expectEvals(evals, 14, "mortgage", "Fri Mar 01 2019", -570.68, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Debt, allItems);
    viewSettings.toggleViewFilter(Context.Debt, "mortgage");
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
    expect(result.debtData[0].item.NAME).toBe("mortgage");
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "37", 0, -1);
      expectChartData(chartPts, 1, "38", 554.74, 2);
    }

    expect(result.taxData.length).toBe(0);
  });

  it("Check coarse, categorised, chart data data", () => {
    const model = getModelCoarseAndFine();
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, "pet food", "Mon Jan 01 2018", 12, -1);
    expectEvals(evals, 1, "broadband", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 2, "pet food", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 3, "broadband", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 4, "pet food", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 6, "stocks", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 7, "PRn1", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 510, -1);
    expectEvals(evals, 9, "PRn2", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 10, "Cash", "Sun Apr 01 2018", 520, -1);
    expectEvals(evals, 11, "PRn3", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 12, "Cash", "Sun Apr 01 2018", 530, -1);
    expectEvals(evals, 13, "Phon", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 14, "Cash", "Sun Apr 01 2018", 518, -1);
    expectEvals(evals, 15, "broadband", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 16, "Cash", "Sun Apr 01 2018", 506, -1);
    expectEvals(evals, 17, "pet food", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 18, "Cash", "Sun Apr 01 2018", 494, -1);
    expectEvals(evals, 19, "Cash", "Tue May 01 2018", 494, -1);
    expectEvals(evals, 20, "stocks", "Tue May 01 2018", 500, -1);
    expectEvals(evals, 21, "PRn2", "Tue May 01 2018", 10, -1);
    expectEvals(evals, 22, "Cash", "Tue May 01 2018", 504, -1);
    expectEvals(evals, 23, "Phon", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 24, "Cash", "Tue May 01 2018", 492, -1);
    expectEvals(evals, 25, "broadband", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 26, "Cash", "Tue May 01 2018", 480, -1);
    expectEvals(evals, 27, "pet food", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 28, "Cash", "Tue May 01 2018", 468, -1);
    expectEvals(evals, 29, "Cash", "Fri Jun 01 2018", 468, -1);
    expectEvals(evals, 30, "savings", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 31, "stocks", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 32, "PRn2", "Fri Jun 01 2018", 10, -1);
    expectEvals(evals, 33, "Cash", "Fri Jun 01 2018", 478, -1);
    expectEvals(evals, 34, "Phon", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 35, "Cash", "Fri Jun 01 2018", 466, -1);
    expectEvals(evals, 36, "broadband", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 37, "Cash", "Fri Jun 01 2018", 454, -1);
    expectEvals(evals, 38, "pet food", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 39, "Cash", "Fri Jun 01 2018", 442, -1);
    expectEvals(evals, 40, "Cash", "Sun Jul 01 2018", 442, -1);
    expectEvals(evals, 41, "savings", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 42, "stocks", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 43, "pet food", "Sun Jul 01 2018", 12, -1);
    expectEvals(evals, 44, "Cash", "Sun Jul 01 2018", 430, -1);

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
    expect(result.expensesData[0].item.NAME).toBe("comms");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe("pet food");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 942, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 930, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("stocks");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }

    viewSettings.toggleViewFilter(Context.Income, "PaperRound");

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    viewSettings.toggleViewFilter(Context.Income, "PRn2");

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    viewSettings.toggleViewFilter(Context.Expense, "pet food");

    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("comms");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 942, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 930, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("stocks");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("Check totalled, chart data data", () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, "pet food", "Mon Jan 01 2018", 12, -1);
    expectEvals(evals, 1, "broadband", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 2, "pet food", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 3, "broadband", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 4, "pet food", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 6, "stocks", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 7, "PRn1", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 510, -1);
    expectEvals(evals, 9, "PRn2", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 10, "Cash", "Sun Apr 01 2018", 520, -1);
    expectEvals(evals, 11, "PRn3", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 12, "Cash", "Sun Apr 01 2018", 530, -1);
    expectEvals(evals, 13, "Phon", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 14, "Cash", "Sun Apr 01 2018", 518, -1);
    expectEvals(evals, 15, "broadband", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 16, "Cash", "Sun Apr 01 2018", 506, -1);
    expectEvals(evals, 17, "pet food", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 18, "Cash", "Sun Apr 01 2018", 494, -1);
    expectEvals(evals, 19, "Cash", "Tue May 01 2018", 494, -1);
    expectEvals(evals, 20, "stocks", "Tue May 01 2018", 500, -1);
    expectEvals(evals, 21, "PRn2", "Tue May 01 2018", 10, -1);
    expectEvals(evals, 22, "Cash", "Tue May 01 2018", 504, -1);
    expectEvals(evals, 23, "Phon", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 24, "Cash", "Tue May 01 2018", 492, -1);
    expectEvals(evals, 25, "broadband", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 26, "Cash", "Tue May 01 2018", 480, -1);
    expectEvals(evals, 27, "pet food", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 28, "Cash", "Tue May 01 2018", 468, -1);
    expectEvals(evals, 29, "Cash", "Fri Jun 01 2018", 468, -1);
    expectEvals(evals, 30, "savings", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 31, "stocks", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 32, "PRn2", "Fri Jun 01 2018", 10, -1);
    expectEvals(evals, 33, "Cash", "Fri Jun 01 2018", 478, -1);
    expectEvals(evals, 34, "Phon", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 35, "Cash", "Fri Jun 01 2018", 466, -1);
    expectEvals(evals, 36, "broadband", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 37, "Cash", "Fri Jun 01 2018", 454, -1);
    expectEvals(evals, 38, "pet food", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 39, "Cash", "Fri Jun 01 2018", 442, -1);
    expectEvals(evals, 40, "Cash", "Sun Jul 01 2018", 442, -1);
    expectEvals(evals, 41, "savings", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 42, "stocks", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 43, "pet food", "Sun Jul 01 2018", 12, -1);
    expectEvals(evals, 44, "Cash", "Sun Jul 01 2018", 430, -1);

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
    expect(result.expensesData[0].item.NAME).toBe("Total");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 36, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 36, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 36, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("Total");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 30, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Total");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 994, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 968, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 1442, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 1430, -1);
    }
  });

  it("Check fine, uncategorised, chart data data", () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, "pet food", "Mon Jan 01 2018", 12, -1);
    expectEvals(evals, 1, "broadband", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 2, "pet food", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 3, "broadband", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 4, "pet food", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 6, "stocks", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 7, "PRn1", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 510, -1);
    expectEvals(evals, 9, "PRn2", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 10, "Cash", "Sun Apr 01 2018", 520, -1);
    expectEvals(evals, 11, "PRn3", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 12, "Cash", "Sun Apr 01 2018", 530, -1);
    expectEvals(evals, 13, "Phon", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 14, "Cash", "Sun Apr 01 2018", 518, -1);
    expectEvals(evals, 15, "broadband", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 16, "Cash", "Sun Apr 01 2018", 506, -1);
    expectEvals(evals, 17, "pet food", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 18, "Cash", "Sun Apr 01 2018", 494, -1);
    expectEvals(evals, 19, "Cash", "Tue May 01 2018", 494, -1);
    expectEvals(evals, 20, "stocks", "Tue May 01 2018", 500, -1);
    expectEvals(evals, 21, "PRn2", "Tue May 01 2018", 10, -1);
    expectEvals(evals, 22, "Cash", "Tue May 01 2018", 504, -1);
    expectEvals(evals, 23, "Phon", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 24, "Cash", "Tue May 01 2018", 492, -1);
    expectEvals(evals, 25, "broadband", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 26, "Cash", "Tue May 01 2018", 480, -1);
    expectEvals(evals, 27, "pet food", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 28, "Cash", "Tue May 01 2018", 468, -1);
    expectEvals(evals, 29, "Cash", "Fri Jun 01 2018", 468, -1);
    expectEvals(evals, 30, "savings", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 31, "stocks", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 32, "PRn2", "Fri Jun 01 2018", 10, -1);
    expectEvals(evals, 33, "Cash", "Fri Jun 01 2018", 478, -1);
    expectEvals(evals, 34, "Phon", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 35, "Cash", "Fri Jun 01 2018", 466, -1);
    expectEvals(evals, 36, "broadband", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 37, "Cash", "Fri Jun 01 2018", 454, -1);
    expectEvals(evals, 38, "pet food", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 39, "Cash", "Fri Jun 01 2018", 442, -1);
    expectEvals(evals, 40, "Cash", "Sun Jul 01 2018", 442, -1);
    expectEvals(evals, 41, "savings", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 42, "stocks", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 43, "pet food", "Sun Jul 01 2018", 12, -1);
    expectEvals(evals, 44, "Cash", "Sun Jul 01 2018", 430, -1);

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
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe("broadband");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[2].item.NAME).toBe("pet food");
    {
      const chartPts = result.expensesData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(3);
    expect(result.incomesData[0].item.NAME).toBe("PRn1");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn2");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 442, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("stocks");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }
  });

  it("Coarse asset view for cash asset, vals, +, -, +- data1", () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(45);
    expectEvals(evals, 0, "pet food", "Mon Jan 01 2018", 12, -1);
    expectEvals(evals, 1, "broadband", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 2, "pet food", "Thu Feb 01 2018", 12, -1);
    expectEvals(evals, 3, "broadband", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 4, "pet food", "Thu Mar 01 2018", 12, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 6, "stocks", "Sun Apr 01 2018", 500, -1);
    expectEvals(evals, 7, "PRn1", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 510, -1);
    expectEvals(evals, 9, "PRn2", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 10, "Cash", "Sun Apr 01 2018", 520, -1);
    expectEvals(evals, 11, "PRn3", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 12, "Cash", "Sun Apr 01 2018", 530, -1);
    expectEvals(evals, 13, "Phon", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 14, "Cash", "Sun Apr 01 2018", 518, -1);
    expectEvals(evals, 15, "broadband", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 16, "Cash", "Sun Apr 01 2018", 506, -1);
    expectEvals(evals, 17, "pet food", "Sun Apr 01 2018", 12, -1);
    expectEvals(evals, 18, "Cash", "Sun Apr 01 2018", 494, -1);
    expectEvals(evals, 19, "Cash", "Tue May 01 2018", 494, -1);
    expectEvals(evals, 20, "stocks", "Tue May 01 2018", 500, -1);
    expectEvals(evals, 21, "PRn2", "Tue May 01 2018", 10, -1);
    expectEvals(evals, 22, "Cash", "Tue May 01 2018", 504, -1);
    expectEvals(evals, 23, "Phon", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 24, "Cash", "Tue May 01 2018", 492, -1);
    expectEvals(evals, 25, "broadband", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 26, "Cash", "Tue May 01 2018", 480, -1);
    expectEvals(evals, 27, "pet food", "Tue May 01 2018", 12, -1);
    expectEvals(evals, 28, "Cash", "Tue May 01 2018", 468, -1);
    expectEvals(evals, 29, "Cash", "Fri Jun 01 2018", 468, -1);
    expectEvals(evals, 30, "savings", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 31, "stocks", "Fri Jun 01 2018", 500, -1);
    expectEvals(evals, 32, "PRn2", "Fri Jun 01 2018", 10, -1);
    expectEvals(evals, 33, "Cash", "Fri Jun 01 2018", 478, -1);
    expectEvals(evals, 34, "Phon", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 35, "Cash", "Fri Jun 01 2018", 466, -1);
    expectEvals(evals, 36, "broadband", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 37, "Cash", "Fri Jun 01 2018", 454, -1);
    expectEvals(evals, 38, "pet food", "Fri Jun 01 2018", 12, -1);
    expectEvals(evals, 39, "Cash", "Fri Jun 01 2018", 442, -1);
    expectEvals(evals, 40, "Cash", "Sun Jul 01 2018", 442, -1);
    expectEvals(evals, 41, "savings", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 42, "stocks", "Sun Jul 01 2018", 500, -1);
    expectEvals(evals, 43, "pet food", "Sun Jul 01 2018", 12, -1);
    expectEvals(evals, 44, "Cash", "Sun Jul 01 2018", 430, -1);

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
    expect(result.expensesData[0].item.NAME).toBe("comms");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe("pet food");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 442, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 430, -1);
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

  it("filter chart data into single uncategorised asset, coarse", () => {
    const model = getModelCoarseAndFine();
    // log(`model - ${showObj(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "stocks");
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe("comms");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe("pet food");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("stocks");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }
  });

  it("filter chart data into single categorised asset, coarse", () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "savings");
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe("comms");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData[1].item.NAME).toBe("pet food");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 12, -1);
    }

    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("PaperRound");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("PRn3");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }
  });

  it("filter chart data into single category, fine", () => {
    const model = getModelCoarseAndFine();

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "Accessible");
    viewSettings.setViewSetting(viewDetail, fineDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 442, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }
  });

  it("asset view type deltas", () => {
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
    expect(result.assetData[0].item.NAME).toBe("Accessible/Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("stocks/stocks");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("PaperRound/Accessible");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe("PRn3/Accessible");
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[4].item.NAME).toBe("comms/Accessible");
    {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", -24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", -24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", -24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[5].item.NAME).toBe("pet food/Accessible");
    {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", -12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", -12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", -12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", -12, -1);
    }
  });

  it("asset view type reductions", () => {
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
    expect(result.assetData[0].item.NAME).toBe("comms/Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", -24, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", -24, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", -24, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("pet food/Accessible");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", -12, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", -12, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", -12, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", -12, -1);
    }
  });

  it("asset view type additions", () => {
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
    expect(result.assetData[0].item.NAME).toBe("Accessible/Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("stocks/stocks");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 500, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("PaperRound/Accessible");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 10, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe("PRn3/Accessible");
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 0, -1);
    }
  });

  it("filter chart data into single category with transfer, coarse", () => {
    const model = getModelCoarseAndFine();

    model.transactions = [
      ...[
        {
          ...simpleTransaction,
          NAME: "move money",
          FROM: "stocks",
          FROM_VALUE: "100",
          TO: CASH_ASSET_NAME,
          TO_VALUE: "100",
          DATE: "May 1, 2018",
        },
      ],
    ];

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "Accessible");
    viewSettings.setViewSetting(viewDetail, coarseDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Accessible");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 568, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 1042, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 1030, -1);
    }
  });

  it("filter chart data into single category with income, fine", () => {
    const model = getModelCoarseAndFine();

    // set the category of an income to match
    // the category of some assets
    // test that this income doesn't appear in the assets graph!
    model.incomes[0].CATEGORY = "Accessible";

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, "Accessible");
    viewSettings.setViewSetting(viewDetail, fineDetail);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 494, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 468, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 442, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 430, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Fri Jun 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Sun Jul 01 2018", 500, -1);
    }
  });

  it("display quantised deltas", () => {
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
    const model = makeModelFromJSON(json);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(34);
    expectEvals(evals, 0, "quantityShare", "Sat Jun 18 2022", 100, -1);
    expectEvals(evals, 1, "Share", "Sat Jun 18 2022", 100, -1);
    expectEvals(evals, 2, "Share", "Mon Jul 18 2022", 100, -1);
    expectEvals(evals, 3, "Share", "Thu Aug 18 2022", 100, -1);
    expectEvals(evals, 4, "Share", "Sun Sep 18 2022", 100, -1);
    expectEvals(evals, 5, "Share", "Tue Oct 18 2022", 100, -1);
    expectEvals(evals, 6, "Share", "Fri Nov 18 2022", 100, -1);
    expectEvals(evals, 7, "Share", "Sun Dec 18 2022", 100, -1);
    expectEvals(evals, 8, "Share", "Wed Jan 18 2023", 100, -1);
    expectEvals(evals, 9, "Share", "Sat Feb 18 2023", 100, -1);
    expectEvals(evals, 10, "Share", "Sat Mar 18 2023", 100, -1);
    expectEvals(evals, 11, "Share", "Tue Apr 18 2023", 100, -1);
    expectEvals(evals, 12, "Share", "Thu May 18 2023", 100, -1);
    expectEvals(evals, 13, "Share", "Sun Jun 18 2023", 100, -1);
    expectEvals(evals, 14, "quantityShare", "Sun Jun 18 2023", 200, -1);
    expectEvals(evals, 15, "Share", "Tue Jul 18 2023", 200, -1);
    expectEvals(evals, 16, "Share", "Fri Aug 18 2023", 200, -1);
    expectEvals(evals, 17, "Share", "Mon Sep 18 2023", 200, -1);
    expectEvals(evals, 18, "Share", "Wed Oct 18 2023", 200, -1);
    expectEvals(evals, 19, "Share", "Sat Nov 18 2023", 200, -1);
    expectEvals(evals, 20, "Share", "Mon Dec 18 2023", 200, -1);
    expectEvals(evals, 21, "Share", "Thu Jan 18 2024", 200, -1);
    expectEvals(evals, 22, "Share", "Sun Feb 18 2024", 200, -1);
    expectEvals(evals, 23, "Share", "Mon Mar 18 2024", 200, -1);
    expectEvals(evals, 24, "Share", "Thu Apr 18 2024", 200, -1);
    expectEvals(evals, 25, "Share", "Sat May 18 2024", 200, -1);
    expectEvals(evals, 26, "Share", "Tue Jun 18 2024", 200, -1);
    expectEvals(evals, 27, "quantityShare", "Tue Jun 18 2024", 300, -1);
    expectEvals(evals, 28, "Share", "Thu Jul 18 2024", 300, -1);
    expectEvals(evals, 29, "Share", "Sun Aug 18 2024", 300, -1);
    expectEvals(evals, 30, "Share", "Wed Sep 18 2024", 300, -1);
    expectEvals(evals, 31, "Share", "Fri Oct 18 2024", 300, -1);
    expectEvals(evals, 32, "Share", "Mon Nov 18 2024", 300, -1);
    expectEvals(evals, 33, "Share", "Wed Dec 18 2024", 300, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Share/Share");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Jan 01 2022", 0, -1);
      expectChartData(chartPts, 1, "Sun Jan 01 2023", 100, -1);
      expectChartData(chartPts, 2, "Mon Jan 01 2024", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("unidentified/Share");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Jan 01 2022", 0, -1);
      expectChartData(chartPts, 1, "Sun Jan 01 2023", 0, -1);
      expectChartData(chartPts, 2, "Mon Jan 01 2024", 100, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });


});
