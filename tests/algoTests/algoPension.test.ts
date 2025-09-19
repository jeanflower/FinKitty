import { defaultModelSettings, getTestModel } from "../../models/testModel";
import {
  nationalInsurance,
  separator,
  incomeTax,
  pensionPrefix,
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
  coarseDetail,
  fineDetail,
  viewDetail,
  viewFrequency,
  liquidateAsset,
  allItems,
  viewType,
} from "../../localization/stringConstants";
import { makeChartDataFromEvaluations } from "../../models/charting";
import {
  emptyModel,
  simpleIncome,
  simpleTransaction,
  simpleAsset,
  definedBenefitsPension,
  definedContributionsPension,
  pensionExampleData,
} from "../../models/exampleModels";
import { setROI, setSetting } from "../../models/modelUtils";
import { ModelData } from "../../types/interfaces";
import { lessThan } from "../../utils/stringUtils";
import {
  Context,
  printAllLogs,
  printDebug,
  suppressLogs,
  unSuppressLogs,
} from "../../utils/utils";
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
  printTestCodeForChart,
} from "./algoTestUtils";
import { makeModelFromJSONString } from "../../models/modelFromJSON";

printTestCodeForChart;

describe("pension tests", () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it("pay into defined contributions pension simplest", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "Contribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh",
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, "-PEN Pnsh", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "java", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 3, "-PEN Pnsh", "Sat Mar 10 2018", 1500, -1);
    expectEvals(evals, 4, "Cash", "Sat Mar 10 2018", 28500, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 28500, -1);
    expectEvals(evals, 6, "-PEN Pnsh", "Sun Apr 01 2018", 1500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 27569.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 24369.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 3200, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 25300, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 930.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 24369.58, 2);
    expectEvals(evals, 13, "Cash", "Tue May 01 2018", 24369.58, 2);
    expectEvals(evals, 14, "-PEN Pnsh", "Tue May 01 2018", 1500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 28500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24369.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("-PEN Pnsh");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 1500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 1500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe("Joe income (NI)");
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe("Joe income (net)");
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24369.58, 2); // ???
    }

    expect(result.taxData[0].item.NAME).toBe("Joe income (incomeTax)");
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 3200, -1);
    }
  });

  it("pay one-off pension and employee pension contribution", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "OneOff pension contribution", //
          FROM: "Cash",
          FROM_VALUE: "1500", // a one-off payment
          TO: pensionPrefix + "Pnsh1", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from cash goes
          DATE: "March 20 2018", // match the income start date
        },
        {
          // when you fill in a tax return...
          ...simpleTransaction,
          NAME: `Reduction in income liability`, //
          FROM: "Joe" + incomeTax, // an income - reduce the liability
          FROM_VALUE: "1500", // a one-off payment
          DATE: "March 20 2018",
        },
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "Contribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh2", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh1",
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh2",
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(20);
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, "-PEN Pnsh1", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "-PEN Pnsh2", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 3, "java", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 4, "-PEN Pnsh2", "Sat Mar 10 2018", 1500, -1);
    expectEvals(evals, 5, "Cash", "Sat Mar 10 2018", 28500, -1);
    expectEvals(evals, 6, "Cash", "Tue Mar 20 2018", 27000, -1);
    expectEvals(evals, 7, "-PEN Pnsh1", "Tue Mar 20 2018", 1500, -1);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 27000, -1);
    expectEvals(evals, 9, "-PEN Pnsh1", "Sun Apr 01 2018", 1500, -1);
    expectEvals(evals, 10, "-PEN Pnsh2", "Sun Apr 01 2018", 1500, -1);
    expectEvals(evals, 11, "Cash", "Thu Apr 05 2018", 26069.58, 2);
    expectEvals(evals, 12, "Cash", "Thu Apr 05 2018", 22869.58, 2);
    expectEvals(evals, 13, "(incomeTax)", "Thu Apr 05 2018", 3200, -1);
    expectEvals(evals, 14, "Joe income (net)", "Thu Apr 05 2018", 25300, -1);
    expectEvals(evals, 15, "(NI)", "Thu Apr 05 2018", 930.42, 2);
    expectEvals(evals, 16, "Joe income (net)", "Thu Apr 05 2018", 24369.58, 2); // ???
    expectEvals(evals, 17, "Cash", "Tue May 01 2018", 22869.58, 2);
    expectEvals(evals, 18, "-PEN Pnsh1", "Tue May 01 2018", 1500, -1);
    expectEvals(evals, 19, "-PEN Pnsh2", "Tue May 01 2018", 1500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 27000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 22869.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("-PEN Pnsh1");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 1500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 1500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("-PEN Pnsh2");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 1500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 1500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24369.58, 2);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 3200, -1);
    }
  });

  it("pay into two defined contributions pension schemes", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "Jan 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "Feb 9 2018",
        },
        {
          NAME: "cppStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "cppStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "cppStartTrigger",
          END: "cppStopTrigger",
          NAME: "cpp",
          VALUE: "36000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "ContributionJava", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh1", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "ContributionCpp", // kicks in when we see income java
          FROM: "cpp", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh2", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from income goes
          DATE: "cppStartTrigger", // match the income start date
          STOP_DATE: "cppStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh1",
          START: "January 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh2",
          START: "January 1 2018",
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
    expectEvals(evals, 10, 'Cash', 'Mon Feb 05 2018', 20336.25, 2);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 20336.25, 2);
    expectEvals(evals, 12, '-PEN Pnsh1', 'Thu Mar 01 2018', 1500, -1);
    expectEvals(evals, 13, '-PEN Pnsh2', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 14, 'cpp', 'Sat Mar 10 2018', 36000, -1);
    expectEvals(evals, 15, '-PEN Pnsh2', 'Sat Mar 10 2018', 1800, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Mar 10 2018', 54536.25, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 54536.25, 2);
    expectEvals(evals, 18, '-PEN Pnsh1', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 19, '-PEN Pnsh2', 'Sun Apr 01 2018', 1800, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', 53485.83, 2);
    expectEvals(evals, 21, 'Cash', 'Thu Apr 05 2018', 48139.16, 2);
    expectEvals(evals, 22, '(incomeTax)', 'Thu Apr 05 2018', 12580, -1);
    expectEvals(evals, 23, 'Joe income (net)', 'Thu Apr 05 2018', 50120, -1);
    expectEvals(evals, 24, '(NI)', 'Thu Apr 05 2018', 1980.84, 2);
    expectEvals(evals, 25, 'Joe income (net)', 'Thu Apr 05 2018', 48139.16, 2);
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
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 20336.25, 2);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 54536.25, 2);
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
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 12580, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 48139.16, 2);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 1980.84, 2);
    }
  });

  it("pay into defined contributions pension with employer contribution", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "Contribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "3.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh",
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, "-PEN Pnsh", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "java", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 3, "-PEN Pnsh", "Sat Mar 10 2018", 4500, -1);
    expectEvals(evals, 4, "Cash", "Sat Mar 10 2018", 28500, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 28500, -1);
    expectEvals(evals, 6, "-PEN Pnsh", "Sun Apr 01 2018", 4500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 27569.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 24369.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 3200, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 25300, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 930.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 24369.58, 2);
    expectEvals(evals, 13, "Cash", "Tue May 01 2018", 24369.58, 2);
    expectEvals(evals, 14, "-PEN Pnsh", "Tue May 01 2018", 4500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 28500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24369.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pensionPrefix}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 4500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 4500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24369.58, 2); // ???
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 3200, -1);
    }
  });

  it("pay monthly pay into defined contributions pension with employer contribution", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "April 7 2017",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 4 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "2500", // monthly payments
          VALUE_SET: "January 1 2017",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "Contribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "3.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2017",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh",
          START: "March 1 2017",
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
    expectEvals(evals, 1, '-PEN Pnsh', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 3, '-PEN Pnsh', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 4, 'java', 'Fri Apr 07 2017', 2500, -1);
    expectEvals(evals, 5, '-PEN Pnsh', 'Fri Apr 07 2017', 375, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Apr 07 2017', 2375, -1);
    expectEvals(evals, 7, 'Cash', 'Mon May 01 2017', 2375, -1);
    expectEvals(evals, 8, '-PEN Pnsh', 'Mon May 01 2017', 375, -1);
    expectEvals(evals, 9, 'Cash', 'Fri May 05 2017', 2161.28, 2);
    expectEvals(evals, 10, 'Cash', 'Fri May 05 2017', 1894.62, 2);
    expectEvals(evals, 11, 'java', 'Sun May 07 2017', 2500, -1);
    expectEvals(evals, 12, '-PEN Pnsh', 'Sun May 07 2017', 750, -1);
    expectEvals(evals, 13, 'Cash', 'Sun May 07 2017', 4269.62, 2);
    expectEvals(evals, 14, 'Cash', 'Thu Jun 01 2017', 4269.62, 2);
    expectEvals(evals, 15, '-PEN Pnsh', 'Thu Jun 01 2017', 750, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Jun 05 2017', 4055.90, 2);
    expectEvals(evals, 17, 'Cash', 'Mon Jun 05 2017', 3789.24, 2);
    expectEvals(evals, 18, 'java', 'Wed Jun 07 2017', 2500, -1);
    expectEvals(evals, 19, '-PEN Pnsh', 'Wed Jun 07 2017', 1125, -1);
    expectEvals(evals, 20, 'Cash', 'Wed Jun 07 2017', 6164.24, 2);
    expectEvals(evals, 21, 'Cash', 'Sat Jul 01 2017', 6164.24, 2);
    expectEvals(evals, 22, '-PEN Pnsh', 'Sat Jul 01 2017', 1125, -1);
    expectEvals(evals, 23, 'Cash', 'Wed Jul 05 2017', 5950.52, 2);
    expectEvals(evals, 24, 'Cash', 'Wed Jul 05 2017', 5683.86, 2);
    expectEvals(evals, 25, 'java', 'Fri Jul 07 2017', 2500, -1);
    expectEvals(evals, 26, '-PEN Pnsh', 'Fri Jul 07 2017', 1500, -1);
    expectEvals(evals, 27, 'Cash', 'Fri Jul 07 2017', 8058.86, 2);
    expectEvals(evals, 28, 'Cash', 'Tue Aug 01 2017', 8058.86, 2);
    expectEvals(evals, 29, '-PEN Pnsh', 'Tue Aug 01 2017', 1500, -1);
    expectEvals(evals, 30, 'Cash', 'Sat Aug 05 2017', 7845.14, 2);
    expectEvals(evals, 31, 'Cash', 'Sat Aug 05 2017', 7578.48, 2);
    expectEvals(evals, 32, 'java', 'Mon Aug 07 2017', 2500, -1);
    expectEvals(evals, 33, '-PEN Pnsh', 'Mon Aug 07 2017', 1875, -1);
    expectEvals(evals, 34, 'Cash', 'Mon Aug 07 2017', 9953.48, 2);
    expectEvals(evals, 35, 'Cash', 'Fri Sep 01 2017', 9953.48, 2);
    expectEvals(evals, 36, '-PEN Pnsh', 'Fri Sep 01 2017', 1875, -1);
    expectEvals(evals, 37, 'Cash', 'Tue Sep 05 2017', 9739.76, 2);
    expectEvals(evals, 38, 'Cash', 'Tue Sep 05 2017', 9473.09, 2);
    expectEvals(evals, 39, 'java', 'Thu Sep 07 2017', 2500, -1);
    expectEvals(evals, 40, '-PEN Pnsh', 'Thu Sep 07 2017', 2250, -1);
    expectEvals(evals, 41, 'Cash', 'Thu Sep 07 2017', 11848.09, 2);
    expectEvals(evals, 42, 'Cash', 'Sun Oct 01 2017', 11848.09, 2);
    expectEvals(evals, 43, '-PEN Pnsh', 'Sun Oct 01 2017', 2250, -1);
    expectEvals(evals, 44, 'Cash', 'Thu Oct 05 2017', 11634.37, 2);
    expectEvals(evals, 45, 'Cash', 'Thu Oct 05 2017', 11367.70, 2);
    expectEvals(evals, 46, 'java', 'Sat Oct 07 2017', 2500, -1);
    expectEvals(evals, 47, '-PEN Pnsh', 'Sat Oct 07 2017', 2625, -1);
    expectEvals(evals, 48, 'Cash', 'Sat Oct 07 2017', 13742.70, 2);
    expectEvals(evals, 49, 'Cash', 'Wed Nov 01 2017', 13742.70, 2);
    expectEvals(evals, 50, '-PEN Pnsh', 'Wed Nov 01 2017', 2625, -1);
    expectEvals(evals, 51, 'Cash', 'Sun Nov 05 2017', 13528.98, 2);
    expectEvals(evals, 52, 'Cash', 'Sun Nov 05 2017', 13262.31, 2);
    expectEvals(evals, 53, 'java', 'Tue Nov 07 2017', 2500, -1);
    expectEvals(evals, 54, '-PEN Pnsh', 'Tue Nov 07 2017', 3000, -1);
    expectEvals(evals, 55, 'Cash', 'Tue Nov 07 2017', 15637.31, 2);
    expectEvals(evals, 56, 'Cash', 'Fri Dec 01 2017', 15637.31, 2);
    expectEvals(evals, 57, '-PEN Pnsh', 'Fri Dec 01 2017', 3000, -1);
    expectEvals(evals, 58, 'Cash', 'Tue Dec 05 2017', 15423.59, 2);
    expectEvals(evals, 59, 'Cash', 'Tue Dec 05 2017', 15156.92, 2);
    expectEvals(evals, 60, 'java', 'Thu Dec 07 2017', 2500, -1);
    expectEvals(evals, 61, '-PEN Pnsh', 'Thu Dec 07 2017', 3375, -1);
    expectEvals(evals, 62, 'Cash', 'Thu Dec 07 2017', 17531.92, 2);
    expectEvals(evals, 63, 'Cash', 'Fri Jan 05 2018', 17318.20, 2);
    expectEvals(evals, 64, 'Cash', 'Fri Jan 05 2018', 17051.53, 2);
    expectEvals(evals, 65, 'Cash', 'Mon Jan 01 2018', 17051.53, 2);
    expectEvals(evals, 66, '-PEN Pnsh', 'Mon Jan 01 2018', 3375, -1);
    expectEvals(evals, 67, 'java', 'Sun Jan 07 2018', 2500, -1);
    expectEvals(evals, 68, '-PEN Pnsh', 'Sun Jan 07 2018', 3750, -1);
    expectEvals(evals, 69, 'Cash', 'Sun Jan 07 2018', 19426.53, 2);
    expectEvals(evals, 70, 'Cash', 'Thu Feb 01 2018', 19426.53, 2);
    expectEvals(evals, 71, '-PEN Pnsh', 'Thu Feb 01 2018', 3750, -1);
    expectEvals(evals, 72, 'Cash', 'Mon Feb 05 2018', 19212.81, 2);
    expectEvals(evals, 73, 'Cash', 'Mon Feb 05 2018', 18946.14, 2);
    expectEvals(evals, 74, 'java', 'Wed Feb 07 2018', 2500, -1);
    expectEvals(evals, 75, '-PEN Pnsh', 'Wed Feb 07 2018', 4125, -1);
    expectEvals(evals, 76, 'Cash', 'Wed Feb 07 2018', 21321.14, 2);
    expectEvals(evals, 77, 'Cash', 'Thu Mar 01 2018', 21321.14, 2);
    expectEvals(evals, 78, '-PEN Pnsh', 'Thu Mar 01 2018', 4125, -1);
    expectEvals(evals, 79, 'Cash', 'Mon Mar 05 2018', 21107.42, 2);
    expectEvals(evals, 80, 'Cash', 'Mon Mar 05 2018', 20840.75, 2);
    expectEvals(evals, 81, 'java', 'Wed Mar 07 2018', 2500, -1);
    expectEvals(evals, 82, '-PEN Pnsh', 'Wed Mar 07 2018', 4500, -1);
    expectEvals(evals, 83, 'Cash', 'Wed Mar 07 2018', 23215.75, 2);
    expectEvals(evals, 84, 'Cash', 'Sun Apr 01 2018', 23215.75, 2);
    expectEvals(evals, 85, '-PEN Pnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 86, 'Cash', 'Thu Apr 05 2018', 23002.03, 2);
    expectEvals(evals, 87, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 88, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 89, 'Joe income (net)', 'Thu Apr 05 2018', 25300, -1);
    expectEvals(evals, 90, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 91, 'Joe income (net)', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 92, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 93, '-PEN Pnsh', 'Tue May 01 2018', 4500, -1);

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
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 21321.14, 2);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 23215.75, 2);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('-PEN Pnsh');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 4125, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 3200, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 2564.64, 2);
    }
  });

  it("pay into defined contributions pension with salary sacrifice", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionSS + "Contribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income transferred to pension
          TO: pensionPrefix + "Pnsh", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "3.0", // all of what is removed from income goes
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh",
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, "-PEN Pnsh", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "java", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 3, "-PEN Pnsh", "Sat Mar 10 2018", 4500, -1);
    expectEvals(evals, 4, "Cash", "Sat Mar 10 2018", 28500, -1);
    expectEvals(evals, 5, "Cash", "Sun Apr 01 2018", 28500, -1);
    expectEvals(evals, 6, "-PEN Pnsh", "Sun Apr 01 2018", 4500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 27599.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 24399.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 3200, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 25300, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 900.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 24399.58, 2);
    expectEvals(evals, 13, "Cash", "Tue May 01 2018", 24399.58, 2);
    expectEvals(evals, 14, "-PEN Pnsh", "Tue May 01 2018", 4500, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 28500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24399.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pensionPrefix}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 4500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 4500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 900.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24399.58, 2);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 3200, -1);
    }
  });

  ///// this is giving the wrong answer

  // should be rather like the "pay pension contributions simplest"
  // test - this involves a manual pension contribution
  // where that was siphoned off at source
  it("pay one-off pension contribution", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "30000", // single payment
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "OneOff pension contribution", //
          FROM: "Cash",
          FROM_VALUE: "1500", // a one-off payment
          TO: pensionPrefix + "Pnsh", // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed from cash goes
          DATE: "March 20 2018", // match the income start date
        },
        {
          // when you fill in a tax return...
          ...simpleTransaction,
          NAME: "Reduction in income liability", //
          FROM: "Joe" + incomeTax, // an income - reduce the liability
          FROM_VALUE: "1500", // a one-off payment
          DATE: "March 20 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: pensionPrefix + "Pnsh",
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, "-PEN Pnsh", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "java", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 3, "Cash", "Sat Mar 10 2018", 30000, -1);
    expectEvals(evals, 4, "Cash", "Tue Mar 20 2018", 28500, -1);
    expectEvals(evals, 5, "-PEN Pnsh", "Tue Mar 20 2018", 1500, -1);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 28500, -1);
    expectEvals(evals, 7, "-PEN Pnsh", "Sun Apr 01 2018", 1500, -1);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 27569.58, 2);
    expectEvals(evals, 9, "Cash", "Thu Apr 05 2018", 24069.58, 2);
    expectEvals(evals, 10, "(incomeTax)", "Thu Apr 05 2018", 3500, -1);
    expectEvals(evals, 11, "Joe income (net)", "Thu Apr 05 2018", 26500, -1);
    expectEvals(evals, 12, "(NI)", "Thu Apr 05 2018", 930.42, 2);
    expectEvals(evals, 13, "Joe income (net)", "Thu Apr 05 2018", 25569.58, 2);
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 24069.58, 2);
    expectEvals(evals, 15, "-PEN Pnsh", "Tue May 01 2018", 1500, -1);
    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 28500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 24069.58, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(`${pensionPrefix}Pnsh`);
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 1500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 1500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 930.42, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 25569.58, 2);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 3500, -1);
    }
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on one off crystallized pension 1", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "April 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "get some pension", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "30000", // a one-off payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "March 20 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "March 1 2018",
          VALUE: "60000",
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
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, cpj, "Thu Mar 01 2018", 60000, -1);
    expectEvals(evals, 2, cpj, "Tue Mar 20 2018", 30000, -1);
    expectEvals(evals, 3, "Cash", "Tue Mar 20 2018", 30000, -1);
    expectEvals(evals, 4, "Cash", "Sun Apr 01 2018", 30000, -1);
    expectEvals(evals, 5, cpj, "Sun Apr 01 2018", 30000, -1);
    expectEvals(evals, 6, "Cash", "Thu Apr 05 2018", 26500, -1);
    expectEvals(evals, 7, "(incomeTax)", "Thu Apr 05 2018", 3500, -1);
    expectEvals(evals, 8, getnetincLabel("Joe"), "Thu Apr 05 2018", 26500, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + "Joe.PNN");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 60000, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
    }
  });

  it("pay into defined benefits pension simplest", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + "NorwichBenefitAccrual", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49 / 12, // monthly pension accrual proportion
          TO: pensionDB + "incomeFromNorwich", // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = `${pensionDB}incomeFromNorwich`;

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "-PDB incomeFromNorwich", "Sat Feb 10 2018", 50, -1);
    expectEvals(evals, 1, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "-PDB incomeFromNorwich", "Sat Mar 10 2018", 50, -1);
    expectEvals(evals, 3, "java", "Sat Mar 10 2018", 490000, -1);
    expectEvals(
      evals,
      4,
      "-PDB incomeFromNorwich",
      "Sat Mar 10 2018",
      883.33,
      2,
    );
expectEvals(evals, 5, "Cash", "Sat Mar 10 2018", 465500, -1);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 465500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 455369.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 263394.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 191975, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 273525, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 10130.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 263394.58, 2); // ???
    expectEvals(
      evals,
      13,
      "-PDB incomeFromNorwich",
      "Tue Apr 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 263394.58, 2);
    expectEvals(
      evals,
      15,
      "-PDB incomeFromNorwich",
      "Thu May 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 16, "Cash", "Fri Jun 01 2018", 263394.58, 2);
    expectEvals(
      evals,
      17,
      "-PDB incomeFromNorwich",
      "Sun Jun 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 18, "Cash", "Sun Jun 10 2018", 264277.91, 2);
    expectEvals(evals, 19, "Cash", "Sun Jul 01 2018", 264277.91, 2);
    expectEvals(evals, 20, "Cash", "Wed Aug 01 2018", 264277.91, 2);
    expectEvals(evals, 21, "Joe income (net)", "Fri Apr 05 2019", 883.33, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 490000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe(pdbfn);
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 883.33, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 465500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 263394.58, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 263394.58, 2);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 264277.91, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 264277.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 10130.42, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 263394.58, 2); // ???
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 191975, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }
  });

  it("pay into defined benefits pension salary sacrifice", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionSS + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + "NorwichBenefitAccrual", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49 / 12, // pension accrual proportion
          TO: pensionDB + "incomeFromNorwich", // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = `${pensionDB}incomeFromNorwich`;

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "-PDB incomeFromNorwich", "Sat Feb 10 2018", 50, -1);
    expectEvals(evals, 1, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "-PDB incomeFromNorwich", "Sat Mar 10 2018", 50, -1);
    expectEvals(evals, 3, "java", "Sat Mar 10 2018", 490000, -1);
    expectEvals(
      evals,
      4,
      "-PDB incomeFromNorwich",
      "Sat Mar 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 5, "Cash", "Sat Mar 10 2018", 465500, -1);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 465500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 455859.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 263884.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 191975, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 273525, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 9640.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 263884.58, 2);
    expectEvals(
      evals,
      13,
      "-PDB incomeFromNorwich",
      "Tue Apr 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 263884.58, 2);
    expectEvals(
      evals,
      15,
      "-PDB incomeFromNorwich",
      "Thu May 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 16, "Cash", "Fri Jun 01 2018", 263884.58, 2);
    expectEvals(
      evals,
      17,
      "-PDB incomeFromNorwich",
      "Sun Jun 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 18, "Cash", "Sun Jun 10 2018", 264767.91, 2);
    expectEvals(evals, 19, "Cash", "Sun Jul 01 2018", 264767.91, 2);
    expectEvals(evals, 20, "Cash", "Wed Aug 01 2018", 264767.91, 2);
    expectEvals(evals, 21, "Joe income (net)", "Fri Apr 05 2019", 883.33, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 490000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe(pdbfn);
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 883.33, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 465500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 263884.58, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 263884.58, 2);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 264767.91, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 264767.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe(getNILabel("Joe"));
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 9640.42, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 263884.58, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 191975, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }
  });

  it("pay into defined benefits pension apply cpi", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + "NorwichBenefitAccrual", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49 / 12, // pension accrual proportion
          TO: pensionDB + "incomeFromNorwich", // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "-PDB incomeFromNorwich", "Sat Feb 10 2018", 50, -1);
    expectEvals(evals, 1, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 2, "-PDB incomeFromNorwich", "Sat Mar 10 2018", 50, -1);
    expectEvals(evals, 3, "java", "Sat Mar 10 2018", 490000, -1);
    expectEvals(
      evals,
      4,
      "-PDB incomeFromNorwich",
      "Sat Mar 10 2018",
      883.33,
      2,
    );
    expectEvals(evals, 5, "Cash", "Sat Mar 10 2018", 465500, -1);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 465500, -1);
    expectEvals(evals, 7, "Cash", "Thu Apr 05 2018", 455369.58, 2);
    expectEvals(evals, 8, "Cash", "Thu Apr 05 2018", 263394.58, 2);
    expectEvals(evals, 9, "(incomeTax)", "Thu Apr 05 2018", 191975, -1);
    expectEvals(evals, 10, "Joe income (net)", "Thu Apr 05 2018", 273525, -1);
    expectEvals(evals, 11, "(NI)", "Thu Apr 05 2018", 10130.42, 2);
    expectEvals(evals, 12, "Joe income (net)", "Thu Apr 05 2018", 263394.58, 2);
    expectEvals(
      evals,
      13,
      "-PDB incomeFromNorwich",
      "Tue Apr 10 2018",
      989.33,
      2,
    );
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 265893.88, 2);
    expectEvals(
      evals,
      15,
      "-PDB incomeFromNorwich",
      "Thu May 10 2018",
      989.33,
      2,
    );
    expectEvals(evals, 16, "Cash", "Fri Jun 01 2018", 268416.89, 2);
    expectEvals(
      evals,
      17,
      "-PDB incomeFromNorwich",
      "Sun Jun 10 2018",
      989.33,
      2,
    );
    expectEvals(evals, 18, "Cash", "Sun Jun 10 2018", 269406.22, 2);
    expectEvals(evals, 19, "Cash", "Sun Jul 01 2018", 271962.56, 2);
    expectEvals(evals, 20, "Cash", "Wed Aug 01 2018", 274543.16, 2);
    expectEvals(evals, 21, "Joe income (net)", "Fri Apr 05 2019", 989.33, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 490000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("-PDB incomeFromNorwich");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 989.33, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 465500, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 265893.88, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 268416.89, 2);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 271962.56, 2);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 274543.16, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);

    expect(result.taxData[2].item.NAME).toBe("Joe income (NI)");
    {
      const chartPts = result.taxData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 10130.42, 2);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe("Joe income (net)");
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 263394.58, 2); // ???
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }

    expect(result.taxData[0].item.NAME).toBe("Joe income (incomeTax)");
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 191975, -1);
      expectChartData(chartPts, 3, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Wed Aug 01 2018", 0, -1);
    }
  });

  it("pay into defined benefits pension cant have TO equal cash", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + "NorwichBenefitAccrual", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49, // pension accrual proportion
          TO: CASH_ASSET_NAME, // should fail checks - we expect a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
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
  });

  it("pay into defined benefits pension cant have TO equal an arbitrary income", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: pensionDB + "NorwichBenefitAccrual", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49, // pension accrual proportion
          TO: "java", // should fail checks - we expect a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
          TYPE: autogen,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
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
  });

  it("pay into defined benefits pension transaction must begin pensionDB", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "August 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "javaStartTrigger",
          ERA: undefined,
          DATE: "March 10 2018",
        },
        {
          NAME: "javaStopTrigger",
          ERA: undefined,
          DATE: "April 9 2018",
        },
        {
          NAME: "pensionStartDraw",
          ERA: undefined,
          DATE: "June 10 2018",
        },
        {
          NAME: "pensionStopDraw",
          ERA: undefined,
          DATE: "July 9 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "javaStartTrigger",
          END: "javaStopTrigger",
          NAME: "java",
          VALUE: "490000", // absurdly high single payment to trigger tax
          VALUE_SET: "January 1 2018",
          LIABILITY:
            "Joe" + nationalInsurance + separator + "" + "Joe" + incomeTax,
        },
        {
          ...simpleIncome,
          START: "pensionStartDraw",
          END: "pensionStopDraw",
          NAME: pensionDB + "incomeFromNorwich",
          VALUE: "50",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: pensionPrefix + "NorwichContribution", // kicks in when we see income java
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.05", // percentage of income offered up to pension
          TO: "", // Defined benefits schemes do not transfer amount into an asset
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
        {
          ...simpleTransaction,
          NAME: "NorwichBenefitAccrual", // Should trigger failure
          FROM: "java", // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: "" + 1.0 / 49, // pension accrual proportion
          TO: pensionDB + "incomeFromNorwich", // not an asset but a DB income!!
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "javaStartTrigger", // match the income start date
          STOP_DATE: "javaStopTrigger", // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
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
  });

  it("asset view pension transfers additions", () => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    //log(`model is  ${showObj(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setDetailViewSetting(coarseDetail);

    let result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("B");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 100000, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 100000, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", 98000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    viewSettings.setViewSetting(chartViewType, chartAdditions);
    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("D/B");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", 24500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("MoveRemainingPension/B");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", 73500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    viewSettings.setViewSetting(chartViewType, chartReductions);
    result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("D/B");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -25000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("MoveRemainingPension/B");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -75000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("asset view pension transfers reductions", () => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setDetailViewSetting(fineDetail);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setDetailViewSetting(coarseDetail);
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
    expect(result.assetData[0].item.NAME).toBe("D/B");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -25000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("MoveRemainingPension/B");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -75000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("asset view pension transfers deltas", () => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(chartViewType, chartVals);
    viewSettings.setDetailViewSetting(fineDetail);
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setDetailViewSetting(coarseDetail);
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
    expect(result.assetData[0].item.NAME).toBe("D/B");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("MoveRemainingPension/B");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Apr 01 2023", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2024", 0, -1);
      expectChartData(chartPts, 2, "Tue Apr 01 2025", -1500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("pay income tax on conditional absolute crystallized pension", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Conditional get some pension", // if cash needs it
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "50000", // a one-off absolute-value payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "Feb 3 2018",
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Buy food", //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "30010", // a one-off payment
          DATE: "Jan 21 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "10",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "Dec 1, 2017",
          VALUE: "60000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // In Fri Apr 05 2019 the code to Optmize for income
    // tax kicks in, so we transfer 12500 from pension to cash
    // to make the most of the 12500 personal allowance.

    // printTestCodeForEvals(evals);

    const cpj = `${crystallizedPension}Joe.PNN`;

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
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -7833.33, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -7833.33, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -7833.33, 2);
    expectEvals(evals, 13, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 16, 'Joe income (net)', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 30000, -1);
    expectEvals(evals, 19, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(evals, 20, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 30000, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 17500, -1);
    expectEvals(evals, 23, 'Joe income (net)', 'Fri Apr 05 2019', 12500, -1);

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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -7833.33, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -7833.33, 2);
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
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
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
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
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
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on one off crystallized pension 2", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "April 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "get some pension", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "30000", // a one-off payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "March 20 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "March 1 2018",
          VALUE: "60000",
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
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, cpj, "Thu Mar 01 2018", 60000, -1);
    expectEvals(evals, 2, cpj, "Tue Mar 20 2018", 30000, -1);
    expectEvals(evals, 3, "Cash", "Tue Mar 20 2018", 30000, -1);
    expectEvals(evals, 4, "Cash", "Sun Apr 01 2018", 30000, -1);
    expectEvals(evals, 5, cpj, "Sun Apr 01 2018", 30000, -1);
    expectEvals(evals, 6, "Cash", "Thu Apr 05 2018", 26500, -1);
    expectEvals(evals, 7, "(incomeTax)", "Thu Apr 05 2018", 3500, -1);
    expectEvals(evals, 8, getnetincLabel("Joe"), "Thu Apr 05 2018", 26500, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + "Joe.PNN");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 60000, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 30000, -1);
    }
  });

  it("pay income tax on conditional categorized crystallized pension", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Conditional get some pension", // if cash needs it
          FROM: "TaxablePensions", // a category
          FROM_VALUE: "15000", // a one-off absolute-value payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "Feb 3 2018",
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Buy food", //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "30010", // a one-off payment
          DATE: "Jan 21 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "10",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN",
          START: "Dec 1, 2017",
          VALUE: "60000",
          CATEGORY: "TaxablePensions",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Jake.PNN",
          START: "Dec 1, 2017",
          VALUE: "50000",
          CATEGORY: "TaxablePensions",
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
    expectEvals(evals, 1, '-CPTaxable Jake.PNN', 'Fri Dec 01 2017', 50000, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN', 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 4, '-CPTaxable Jake.PNN', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 5, '-CPTaxable Joe.PNN', 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 8, '-CPTaxable Jake.PNN', 'Thu Feb 01 2018', 50000, -1);
    expectEvals(evals, 9, '-CPTaxable Joe.PNN', 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 10, '-CPTaxable Joe.PNN', 'Sat Feb 03 2018', 45000, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -15000, -1);
    expectEvals(evals, 12, '-CPTaxable Jake.PNN', 'Sat Feb 03 2018', 35000, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Feb 05 2018', -2166.66, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Feb 05 2018', -4333.32, 2);
    expectEvals(evals, 16, 'Cash', 'Thu Mar 01 2018', -4333.32, 2);
    expectEvals(evals, 17, '-CPTaxable Jake.PNN', 'Thu Mar 01 2018', 35000, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 45000, -1);
    expectEvals(evals, 19, 'Cash', 'Sun Apr 01 2018', -4333.32, 2);
    expectEvals(evals, 20, '-CPTaxable Jake.PNN', 'Sun Apr 01 2018', 35000, -1);
    expectEvals(evals, 21, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 45000, -1);
    expectEvals(evals, 22, 'Cash', 'Thu Apr 05 2018', -2666.66, 2);
    expectEvals(evals, 23, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 24, 'Cash', 'Thu Apr 05 2018', -1000, -1);
    expectEvals(evals, 25, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 26, 'Jake income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 27, 'Joe income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 28, 'Cash', 'Tue May 01 2018', -1000, -1);
    expectEvals(evals, 29, '-CPTaxable Jake.PNN', 'Tue May 01 2018', 35000, -1);
    expectEvals(evals, 30, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 45000, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Jun 01 2018', -1000, -1);
    expectEvals(evals, 32, '-CPTaxable Jake.PNN', 'Fri Jun 01 2018', 35000, -1);
    expectEvals(evals, 33, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 45000, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Apr 05 2019', 11500, -1);
    expectEvals(evals, 35, '-CPTaxable Jake.PNN', 'Fri Apr 05 2019', 22500, -1);
    expectEvals(evals, 36, 'Cash', 'Fri Apr 05 2019', 24000, -1);
    expectEvals(evals, 37, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 32500, -1);
    expectEvals(evals, 38, 'Jake income (net)', 'Fri Apr 05 2019', 12500, -1);
    expectEvals(evals, 39, 'Joe income (net)', 'Fri Apr 05 2019', 12500, -1);

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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -4333.32, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -4333.32, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', -1000, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', -1000, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN');
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
    
    expect(result.assetData[2].item.NAME).toBe('-CPTaxable Jake.PNN');
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
    
    expect(result.taxData[1].item.NAME).toBe('Jake income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 14500, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 500, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
    
    expect(result.taxData[3].item.NAME).toBe('Joe income (net)');
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
  });

  it("pay income tax on conditional proportional crystallized pension", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Conditional get some pension", // if cash needs it
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0", // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "Feb 3 2018",
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Buy food", //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "30010", // a one-off payment
          DATE: "Jan 21 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "10",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "Dec 1, 2017",
          VALUE: "60000",
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
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -7833.33, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -7833.33, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -7833.33, 2);
    expectEvals(evals, 13, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 16, 'Joe income (net)', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 30000, -1);
    expectEvals(evals, 19, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(evals, 20, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 30000, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 17500, -1);
    expectEvals(evals, 23, 'Joe income (net)', 'Fri Apr 05 2019', 12500, -1);

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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -7833.33, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -7833.33, 2);
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
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
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
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
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
  });

  ///////////// NOT SURE ABOUT THIS ONE /////////////////
  it("pay income tax on recurring conditional proportional crystallized pension", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Conditional get some pension", // if cash needs it
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0", // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "Feb 3 2018",
          STOP_DATE: "April 3 2018",
          RECURRENCE: "1m",
          TYPE: liquidateAsset,
        },
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Buy food", //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "30010", // a one-off payment
          DATE: "Jan 21 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "10",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "Dec 1, 2017",
          VALUE: "60000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(26);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, '-CPTaxable Joe.PNN', 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN', 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 6, '-CPTaxable Joe.PNN', 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 7, '-CPTaxable Joe.PNN', 'Sat Feb 03 2018', 30000, -1);
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Mon Feb 05 2018', -7833.33, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -7833.33, 2);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30000, -1);
    expectEvals(evals, 12, '-CPTaxable Joe.PNN', 'Sat Mar 03 2018', 22166.67, 2);
    expectEvals(evals, 13, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 15, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 22166.67, 2);
    expectEvals(evals, 16, 'Cash', 'Thu Apr 05 2018', 2766.66, 2);
    expectEvals(evals, 17, '(incomeTax)', 'Thu Apr 05 2018', 5066.67, 2);
    expectEvals(evals, 18, 'Joe income (net)', 'Thu Apr 05 2018', 32766.66, 2);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 2766.66, 2);
    expectEvals(evals, 20, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 22166.67, 2);
    expectEvals(evals, 21, 'Cash', 'Fri Jun 01 2018', 2766.66, 2);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 22166.67, 2);
    expectEvals(evals, 23, 'Cash', 'Fri Apr 05 2019', 15266.66, 2);
    expectEvals(evals, 24, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 9666.67, 2);
    expectEvals(evals, 25, 'Joe income (net)', 'Fri Apr 05 2019', 12500, -1);

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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -7833.33, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 2766.66, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 2766.66, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30000, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 22166.67, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 22166.67, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 22166.67, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 5066.67, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 32766.66, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
  });

  it("pay income tax on list member recurring conditional proportional crystallized pension", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Conditional get some pension", // if cash needs it
          FROM: "Stocks" + separator + "" + crystallizedPension + "Joe.PNN", // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0", // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "Feb 3 2018",
          STOP_DATE: "April 3 2018",
          RECURRENCE: "1m",
          TYPE: liquidateAsset,
        },
        {
          ...simpleTransaction,
          NAME: "Buy food", //
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "30010", // a one-off payment
          DATE: "Jan 21 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "10",
        },
        {
          ...simpleAsset,
          NAME: "Stocks",
          START: "Dec 1, 2017",
          VALUE: "50",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "Dec 1, 2017",
          VALUE: "60000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(35);
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
    expectEvals(evals, 14, 'Cash', 'Mon Feb 05 2018', -7813.33, 2);
    expectEvals(evals, 15, 'Cash', 'Thu Mar 01 2018', -7813.33, 2);
    expectEvals(evals, 16, 'Stocks', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 17, '-CPTaxable Joe.PNN', 'Thu Mar 01 2018', 30050, -1);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Sat Mar 03 2018', 22236.67, 2);
    expectEvals(evals, 19, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 21, 'Stocks', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 22236.67, 2);
    expectEvals(evals, 23, 'Cash', 'Thu Apr 05 2018', 2760.66, 2);
    expectEvals(evals, 24, '(incomeTax)', 'Thu Apr 05 2018', 5052.67, 2);
    expectEvals(evals, 25, 'Joe income (net)', 'Thu Apr 05 2018', 32710.66, 2);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', 2760.66, 2);
    expectEvals(evals, 27, 'Stocks', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 28, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 22236.67, 2);
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', 2760.66, 2);
    expectEvals(evals, 30, 'Stocks', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 31, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 22236.67, 2);
    expectEvals(evals, 32, 'Cash', 'Fri Apr 05 2019', 15260.66, 2);
    expectEvals(evals, 33, '-CPTaxable Joe.PNN', 'Fri Apr 05 2019', 9736.67, 2);
    expectEvals(evals, 34, 'Joe income (net)', 'Fri Apr 05 2019', 12500, -1);

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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -7813.33, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 2760.66, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 2760.66, 2);
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
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 22236.67, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 22236.67, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 22236.67, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 5052.67, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(7);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 32710.66, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    }
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on monthly crystallized pension to cash", () => {
    const roi = {
      start: "April 6, 2018 00:00:00",
      end: "April 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "2500", // a monthly payment
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes to cash
          DATE: "April 7 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "April 6 2018",
          VALUE: "60000",
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
    expectEvals(evals, 24, 'Cash', 'Wed Sep 05 2018', 11041.69, 2);
    expectEvals(evals, 25, 'Cash', 'Thu Sep 06 2018', 11041.69, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN', 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.PNN', 'Fri Sep 07 2018', 45000, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Sep 07 2018', 13541.69, 2);
    expectEvals(evals, 29, 'Cash', 'Fri Oct 05 2018', 13250.02, 2);
    expectEvals(evals, 30, 'Cash', 'Sat Oct 06 2018', 13250.02, 2);
    expectEvals(evals, 31, '-CPTaxable Joe.PNN', 'Sat Oct 06 2018', 45000, -1);
    expectEvals(evals, 32, '-CPTaxable Joe.PNN', 'Sun Oct 07 2018', 42500, -1);
    expectEvals(evals, 33, 'Cash', 'Sun Oct 07 2018', 15750.02, 2);
    expectEvals(evals, 34, 'Cash', 'Mon Nov 05 2018', 15458.35, 2);
    expectEvals(evals, 35, 'Cash', 'Tue Nov 06 2018', 15458.35, 2);
    expectEvals(evals, 36, '-CPTaxable Joe.PNN', 'Tue Nov 06 2018', 42500, -1);
    expectEvals(evals, 37, '-CPTaxable Joe.PNN', 'Wed Nov 07 2018', 40000, -1);
    expectEvals(evals, 38, 'Cash', 'Wed Nov 07 2018', 17958.35, 2);
    expectEvals(evals, 39, 'Cash', 'Wed Dec 05 2018', 17666.68, 2);
    expectEvals(evals, 40, 'Cash', 'Thu Dec 06 2018', 17666.68, 2);
    expectEvals(evals, 41, '-CPTaxable Joe.PNN', 'Thu Dec 06 2018', 40000, -1);
    expectEvals(evals, 42, '-CPTaxable Joe.PNN', 'Fri Dec 07 2018', 37500, -1);
    expectEvals(evals, 43, 'Cash', 'Fri Dec 07 2018', 20166.68, 2);
    expectEvals(evals, 44, 'Cash', 'Sat Jan 05 2019', 19875.01, 2);
    expectEvals(evals, 45, 'Cash', 'Sun Jan 06 2019', 19875.01, 2);
    expectEvals(evals, 46, '-CPTaxable Joe.PNN', 'Sun Jan 06 2019', 37500, -1);
    expectEvals(evals, 47, '-CPTaxable Joe.PNN', 'Mon Jan 07 2019', 35000, -1);
    expectEvals(evals, 48, 'Cash', 'Mon Jan 07 2019', 22375.01, 2);
    expectEvals(evals, 49, 'Cash', 'Tue Feb 05 2019', 22083.34, 2);
    expectEvals(evals, 50, 'Cash', 'Wed Feb 06 2019', 22083.34, 2);
    expectEvals(evals, 51, '-CPTaxable Joe.PNN', 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 52, '-CPTaxable Joe.PNN', 'Thu Feb 07 2019', 32500, -1);
    expectEvals(evals, 53, 'Cash', 'Thu Feb 07 2019', 24583.34, 2);
    expectEvals(evals, 54, 'Cash', 'Tue Mar 05 2019', 24291.67, 2);
    expectEvals(evals, 55, 'Cash', 'Wed Mar 06 2019', 24291.67, 2);
    expectEvals(evals, 56, '-CPTaxable Joe.PNN', 'Wed Mar 06 2019', 32500, -1);
    expectEvals(evals, 57, '-CPTaxable Joe.PNN', 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 58, 'Cash', 'Thu Mar 07 2019', 26791.67, 2);
    expectEvals(evals, 59, 'Cash', 'Fri Apr 05 2019', 26500.00, 2);
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
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 11041.69, 2);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 13250.02, 2);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 15458.35, 2);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 17666.68, 2);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 19875.01, 2);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 22083.34, 2);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 24291.67, 2);
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
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on monthly crystallized pension to savings monthly transfers", () => {
    const roi = {
      start: "April 6, 2018 00:00:00",
      end: "April 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take out from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "2500", // a monthly payment
          TO: "Savings",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes
          DATE: "April 7 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: "Savings",
          CAN_BE_NEGATIVE: false,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "April 6 2018",
          VALUE: "60000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(74);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 1, 'Savings', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN', 'Fri Apr 06 2018', 60000, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN', 'Sat Apr 07 2018', 57500, -1);
    expectEvals(evals, 4, 'Savings', 'Sat Apr 07 2018', 2500, -1);
    expectEvals(evals, 5, 'Savings', 'Sat May 05 2018', 2208.34, 2);
    expectEvals(evals, 6, 'Cash', 'Sun May 06 2018', 0, -1);
    expectEvals(evals, 7, 'Savings', 'Sun May 06 2018', 2208.34, 2);
    expectEvals(evals, 8, '-CPTaxable Joe.PNN', 'Sun May 06 2018', 57500, -1);
    expectEvals(evals, 9, '-CPTaxable Joe.PNN', 'Mon May 07 2018', 55000, -1);
    expectEvals(evals, 10, 'Savings', 'Mon May 07 2018', 4708.34, 2);
    expectEvals(evals, 11, 'Savings', 'Tue Jun 05 2018', 4416.68, 2);
    expectEvals(evals, 12, 'Cash', 'Wed Jun 06 2018', 0, -1);
    expectEvals(evals, 13, 'Savings', 'Wed Jun 06 2018', 4416.68, 2);
    expectEvals(evals, 14, '-CPTaxable Joe.PNN', 'Wed Jun 06 2018', 55000, -1);
    expectEvals(evals, 15, '-CPTaxable Joe.PNN', 'Thu Jun 07 2018', 52500, -1);
    expectEvals(evals, 16, 'Savings', 'Thu Jun 07 2018', 6916.68, 2);
    expectEvals(evals, 17, 'Savings', 'Thu Jul 05 2018', 6625.02, 2);
    expectEvals(evals, 18, 'Cash', 'Fri Jul 06 2018', 0, -1);
    expectEvals(evals, 19, 'Savings', 'Fri Jul 06 2018', 6625.02, 2);
    expectEvals(evals, 20, '-CPTaxable Joe.PNN', 'Fri Jul 06 2018', 52500, -1);
    expectEvals(evals, 21, '-CPTaxable Joe.PNN', 'Sat Jul 07 2018', 50000, -1);
    expectEvals(evals, 22, 'Savings', 'Sat Jul 07 2018', 9125.02, 2);
    expectEvals(evals, 23, 'Savings', 'Sun Aug 05 2018', 8833.36, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Aug 06 2018', 0, -1);
    expectEvals(evals, 25, 'Savings', 'Mon Aug 06 2018', 8833.36, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN', 'Mon Aug 06 2018', 50000, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.PNN', 'Tue Aug 07 2018', 47500, -1);
    expectEvals(evals, 28, 'Savings', 'Tue Aug 07 2018', 11333.36, 2);
    expectEvals(evals, 29, 'Savings', 'Wed Sep 05 2018', 11041.69, 2);
    expectEvals(evals, 30, 'Cash', 'Thu Sep 06 2018', 0, -1);
    expectEvals(evals, 31, 'Savings', 'Thu Sep 06 2018', 11041.69, 2);
    expectEvals(evals, 32, '-CPTaxable Joe.PNN', 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 33, '-CPTaxable Joe.PNN', 'Fri Sep 07 2018', 45000, -1);
    expectEvals(evals, 34, 'Savings', 'Fri Sep 07 2018', 13541.69, 2);
    expectEvals(evals, 35, 'Savings', 'Fri Oct 05 2018', 13250.02, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Oct 06 2018', 0, -1);
    expectEvals(evals, 37, 'Savings', 'Sat Oct 06 2018', 13250.02, 2);
    expectEvals(evals, 38, '-CPTaxable Joe.PNN', 'Sat Oct 06 2018', 45000, -1);
    expectEvals(evals, 39, '-CPTaxable Joe.PNN', 'Sun Oct 07 2018', 42500, -1);
    expectEvals(evals, 40, 'Savings', 'Sun Oct 07 2018', 15750.02, 2);
    expectEvals(evals, 41, 'Savings', 'Mon Nov 05 2018', 15458.35, 2);
    expectEvals(evals, 42, 'Cash', 'Tue Nov 06 2018', 0, -1);
    expectEvals(evals, 43, 'Savings', 'Tue Nov 06 2018', 15458.35, 2);
    expectEvals(evals, 44, '-CPTaxable Joe.PNN', 'Tue Nov 06 2018', 42500, -1);
    expectEvals(evals, 45, '-CPTaxable Joe.PNN', 'Wed Nov 07 2018', 40000, -1);
    expectEvals(evals, 46, 'Savings', 'Wed Nov 07 2018', 17958.35, 2);
    expectEvals(evals, 47, 'Savings', 'Wed Dec 05 2018', 17666.68, 2);
    expectEvals(evals, 48, 'Cash', 'Thu Dec 06 2018', 0, -1);
    expectEvals(evals, 49, 'Savings', 'Thu Dec 06 2018', 17666.68, 2);
    expectEvals(evals, 50, '-CPTaxable Joe.PNN', 'Thu Dec 06 2018', 40000, -1);
    expectEvals(evals, 51, '-CPTaxable Joe.PNN', 'Fri Dec 07 2018', 37500, -1);
    expectEvals(evals, 52, 'Savings', 'Fri Dec 07 2018', 20166.68, 2);
    expectEvals(evals, 53, 'Savings', 'Sat Jan 05 2019', 19875.01, 2);
    expectEvals(evals, 54, 'Cash', 'Sun Jan 06 2019', 0, -1);
    expectEvals(evals, 55, 'Savings', 'Sun Jan 06 2019', 19875.01, 2);
    expectEvals(evals, 56, '-CPTaxable Joe.PNN', 'Sun Jan 06 2019', 37500, -1);
    expectEvals(evals, 57, '-CPTaxable Joe.PNN', 'Mon Jan 07 2019', 35000, -1);
    expectEvals(evals, 58, 'Savings', 'Mon Jan 07 2019', 22375.01, 2);
    expectEvals(evals, 59, 'Savings', 'Tue Feb 05 2019', 22083.34, 2);
    expectEvals(evals, 60, 'Cash', 'Wed Feb 06 2019', 0, -1);
    expectEvals(evals, 61, 'Savings', 'Wed Feb 06 2019', 22083.34, 2);
    expectEvals(evals, 62, '-CPTaxable Joe.PNN', 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 63, '-CPTaxable Joe.PNN', 'Thu Feb 07 2019', 32500, -1);
    expectEvals(evals, 64, 'Savings', 'Thu Feb 07 2019', 24583.34, 2);
    expectEvals(evals, 65, 'Savings', 'Tue Mar 05 2019', 24291.67, 2);
    expectEvals(evals, 66, 'Cash', 'Wed Mar 06 2019', 0, -1);
    expectEvals(evals, 67, 'Savings', 'Wed Mar 06 2019', 24291.67, 2);
    expectEvals(evals, 68, '-CPTaxable Joe.PNN', 'Wed Mar 06 2019', 32500, -1);
    expectEvals(evals, 69, '-CPTaxable Joe.PNN', 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 70, 'Savings', 'Thu Mar 07 2019', 26791.67, 2);
    expectEvals(evals, 71, 'Cash', 'Fri Apr 05 2019', -291.67, 2); // why were tax estimates out?
    expectEvals(evals, 72, '(incomeTax)', 'Fri Apr 05 2019', 3500, -1);
    expectEvals(evals, 73, 'Joe income (net)', 'Fri Apr 05 2019', 26500, -1);

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
    expect(result.assetData[0].item.NAME).toBe('Savings');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Fri Apr 06 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun May 06 2018', 2208.34, 2);
    expectChartData(chartPts, 2, 'Wed Jun 06 2018', 4416.68, 2);
    expectChartData(chartPts, 3, 'Fri Jul 06 2018', 6625.02, 2);
    expectChartData(chartPts, 4, 'Mon Aug 06 2018', 8833.36, 2);
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 11041.69, 2);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 13250.02, 2);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 15458.35, 2);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 17666.68, 2);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 19875.01, 2);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 22083.34, 2);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 24291.67, 2);
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
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on monthly crystallized pension to savings fortnight transfers", () => {
    const roi = {
      start: "April 6, 2018 00:00:00",
      end: "April 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take out from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension batch1", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "1500", // a monthly payment
          TO: "Savings",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes
          DATE: "April 7 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
                {
          // when you take out from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension batch2", //
          FROM: crystallizedPension + "Joe.PNN", // name is important
          FROM_VALUE: "1000", // a monthly payment
          TO: "Savings",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes
          DATE: "April 10 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: "Savings",
          CAN_BE_NEGATIVE: false,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "April 6 2018",
          VALUE: "60000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(98);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 1, 'Savings', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN', 'Fri Apr 06 2018', 60000, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN', 'Sat Apr 07 2018', 58500, -1);
    expectEvals(evals, 4, 'Savings', 'Sat Apr 07 2018', 1500, -1);
    expectEvals(evals, 5, '-CPTaxable Joe.PNN', 'Tue Apr 10 2018', 57500, -1);
    expectEvals(evals, 6, 'Savings', 'Tue Apr 10 2018', 2500, -1);
    expectEvals(evals, 7, 'Savings', 'Sat May 05 2018', 2208.34, 2);
    expectEvals(evals, 8, 'Cash', 'Sun May 06 2018', 0, -1);
    expectEvals(evals, 9, 'Savings', 'Sun May 06 2018', 2208.34, 2);
    expectEvals(evals, 10, '-CPTaxable Joe.PNN', 'Sun May 06 2018', 57500, -1);
    expectEvals(evals, 11, '-CPTaxable Joe.PNN', 'Mon May 07 2018', 56000, -1);
    expectEvals(evals, 12, 'Savings', 'Mon May 07 2018', 3708.34, 2);
    expectEvals(evals, 13, '-CPTaxable Joe.PNN', 'Thu May 10 2018', 55000, -1);
    expectEvals(evals, 14, 'Savings', 'Thu May 10 2018', 4708.34, 2);
    expectEvals(evals, 15, 'Savings', 'Tue Jun 05 2018', 4416.68, 2);
    expectEvals(evals, 16, 'Cash', 'Wed Jun 06 2018', 0, -1);
    expectEvals(evals, 17, 'Savings', 'Wed Jun 06 2018', 4416.68, 2);
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Wed Jun 06 2018', 55000, -1);
    expectEvals(evals, 19, '-CPTaxable Joe.PNN', 'Thu Jun 07 2018', 53500, -1);
    expectEvals(evals, 20, 'Savings', 'Thu Jun 07 2018', 5916.68, 2);
    expectEvals(evals, 21, '-CPTaxable Joe.PNN', 'Sun Jun 10 2018', 52500, -1);
    expectEvals(evals, 22, 'Savings', 'Sun Jun 10 2018', 6916.68, 2);
    expectEvals(evals, 23, 'Savings', 'Thu Jul 05 2018', 6625.02, 2);
    expectEvals(evals, 24, 'Cash', 'Fri Jul 06 2018', 0, -1);
    expectEvals(evals, 25, 'Savings', 'Fri Jul 06 2018', 6625.02, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN', 'Fri Jul 06 2018', 52500, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.PNN', 'Sat Jul 07 2018', 51000, -1);
    expectEvals(evals, 28, 'Savings', 'Sat Jul 07 2018', 8125.02, 2);
    expectEvals(evals, 29, '-CPTaxable Joe.PNN', 'Tue Jul 10 2018', 50000, -1);
    expectEvals(evals, 30, 'Savings', 'Tue Jul 10 2018', 9125.02, 2);
    expectEvals(evals, 31, 'Savings', 'Sun Aug 05 2018', 8833.36, 2);
    expectEvals(evals, 32, 'Cash', 'Mon Aug 06 2018', 0, -1);
    expectEvals(evals, 33, 'Savings', 'Mon Aug 06 2018', 8833.36, 2);
    expectEvals(evals, 34, '-CPTaxable Joe.PNN', 'Mon Aug 06 2018', 50000, -1);
    expectEvals(evals, 35, '-CPTaxable Joe.PNN', 'Tue Aug 07 2018', 48500, -1);
    expectEvals(evals, 36, 'Savings', 'Tue Aug 07 2018', 10333.36, 2);
    expectEvals(evals, 37, '-CPTaxable Joe.PNN', 'Fri Aug 10 2018', 47500, -1);
    expectEvals(evals, 38, 'Savings', 'Fri Aug 10 2018', 11333.36, 2);
    expectEvals(evals, 39, 'Savings', 'Wed Sep 05 2018', 11041.69, 2);
    expectEvals(evals, 40, 'Cash', 'Thu Sep 06 2018', 0, -1);
    expectEvals(evals, 41, 'Savings', 'Thu Sep 06 2018', 11041.69, 2);
    expectEvals(evals, 42, '-CPTaxable Joe.PNN', 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 43, '-CPTaxable Joe.PNN', 'Fri Sep 07 2018', 46000, -1);
    expectEvals(evals, 44, 'Savings', 'Fri Sep 07 2018', 12541.69, 2);
    expectEvals(evals, 45, '-CPTaxable Joe.PNN', 'Mon Sep 10 2018', 45000, -1);
    expectEvals(evals, 46, 'Savings', 'Mon Sep 10 2018', 13541.69, 2);
    expectEvals(evals, 47, 'Savings', 'Fri Oct 05 2018', 13250.02, 2);
    expectEvals(evals, 48, 'Cash', 'Sat Oct 06 2018', 0, -1);
    expectEvals(evals, 49, 'Savings', 'Sat Oct 06 2018', 13250.02, 2);
    expectEvals(evals, 50, '-CPTaxable Joe.PNN', 'Sat Oct 06 2018', 45000, -1);
    expectEvals(evals, 51, '-CPTaxable Joe.PNN', 'Sun Oct 07 2018', 43500, -1);
    expectEvals(evals, 52, 'Savings', 'Sun Oct 07 2018', 14750.02, 2);
    expectEvals(evals, 53, '-CPTaxable Joe.PNN', 'Wed Oct 10 2018', 42500, -1);
    expectEvals(evals, 54, 'Savings', 'Wed Oct 10 2018', 15750.02, 2);
    expectEvals(evals, 55, 'Savings', 'Mon Nov 05 2018', 15458.35, 2);
    expectEvals(evals, 56, 'Cash', 'Tue Nov 06 2018', 0, -1);
    expectEvals(evals, 57, 'Savings', 'Tue Nov 06 2018', 15458.35, 2);
    expectEvals(evals, 58, '-CPTaxable Joe.PNN', 'Tue Nov 06 2018', 42500, -1);
    expectEvals(evals, 59, '-CPTaxable Joe.PNN', 'Wed Nov 07 2018', 41000, -1);
    expectEvals(evals, 60, 'Savings', 'Wed Nov 07 2018', 16958.35, 2);
    expectEvals(evals, 61, '-CPTaxable Joe.PNN', 'Sat Nov 10 2018', 40000, -1);
    expectEvals(evals, 62, 'Savings', 'Sat Nov 10 2018', 17958.35, 2);
    expectEvals(evals, 63, 'Savings', 'Wed Dec 05 2018', 17666.68, 2);
    expectEvals(evals, 64, 'Cash', 'Thu Dec 06 2018', 0, -1);
    expectEvals(evals, 65, 'Savings', 'Thu Dec 06 2018', 17666.68, 2);
    expectEvals(evals, 66, '-CPTaxable Joe.PNN', 'Thu Dec 06 2018', 40000, -1);
    expectEvals(evals, 67, '-CPTaxable Joe.PNN', 'Fri Dec 07 2018', 38500, -1);
    expectEvals(evals, 68, 'Savings', 'Fri Dec 07 2018', 19166.68, 2);
    expectEvals(evals, 69, '-CPTaxable Joe.PNN', 'Mon Dec 10 2018', 37500, -1);
    expectEvals(evals, 70, 'Savings', 'Mon Dec 10 2018', 20166.68, 2);
    expectEvals(evals, 71, 'Savings', 'Sat Jan 05 2019', 19875.01, 2);
    expectEvals(evals, 72, 'Cash', 'Sun Jan 06 2019', 0, -1);
    expectEvals(evals, 73, 'Savings', 'Sun Jan 06 2019', 19875.01, 2);
    expectEvals(evals, 74, '-CPTaxable Joe.PNN', 'Sun Jan 06 2019', 37500, -1);
    expectEvals(evals, 75, '-CPTaxable Joe.PNN', 'Mon Jan 07 2019', 36000, -1);
    expectEvals(evals, 76, 'Savings', 'Mon Jan 07 2019', 21375.01, 2);
    expectEvals(evals, 77, '-CPTaxable Joe.PNN', 'Thu Jan 10 2019', 35000, -1);
    expectEvals(evals, 78, 'Savings', 'Thu Jan 10 2019', 22375.01, 2);
    expectEvals(evals, 79, 'Savings', 'Tue Feb 05 2019', 22083.34, 2);
    expectEvals(evals, 80, 'Cash', 'Wed Feb 06 2019', 0, -1);
    expectEvals(evals, 81, 'Savings', 'Wed Feb 06 2019', 22083.34, 2);
    expectEvals(evals, 82, '-CPTaxable Joe.PNN', 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 83, '-CPTaxable Joe.PNN', 'Thu Feb 07 2019', 33500, -1);
    expectEvals(evals, 84, 'Savings', 'Thu Feb 07 2019', 23583.34, 2);
    expectEvals(evals, 85, '-CPTaxable Joe.PNN', 'Sun Feb 10 2019', 32500, -1);
    expectEvals(evals, 86, 'Savings', 'Sun Feb 10 2019', 24583.34, 2);
    expectEvals(evals, 87, 'Savings', 'Tue Mar 05 2019', 24291.67, 2);
    expectEvals(evals, 88, 'Cash', 'Wed Mar 06 2019', 0, -1);
    expectEvals(evals, 89, 'Savings', 'Wed Mar 06 2019', 24291.67, 2);
    expectEvals(evals, 90, '-CPTaxable Joe.PNN', 'Wed Mar 06 2019', 32500, -1);
    expectEvals(evals, 91, '-CPTaxable Joe.PNN', 'Thu Mar 07 2019', 31000, -1);
    expectEvals(evals, 92, 'Savings', 'Thu Mar 07 2019', 25791.67, 2);
    expectEvals(evals, 93, '-CPTaxable Joe.PNN', 'Sun Mar 10 2019', 30000, -1);
    expectEvals(evals, 94, 'Savings', 'Sun Mar 10 2019', 26791.67, 2);
    expectEvals(evals, 95, 'Cash', 'Fri Apr 05 2019', -291.67, 2);
    expectEvals(evals, 96, '(incomeTax)', 'Fri Apr 05 2019', 3500, -1);
    expectEvals(evals, 97, 'Joe income (net)', 'Fri Apr 05 2019', 26500, -1);

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
    expect(result.assetData[0].item.NAME).toBe('Savings');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Fri Apr 06 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun May 06 2018', 2208.34, 2);
    expectChartData(chartPts, 2, 'Wed Jun 06 2018', 4416.68, 2);
    expectChartData(chartPts, 3, 'Fri Jul 06 2018', 6625.02, 2);
    expectChartData(chartPts, 4, 'Mon Aug 06 2018', 8833.36, 2);
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 11041.69, 2);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 13250.02, 2);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 15458.35, 2);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 17666.68, 2);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 19875.01, 2);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 22083.34, 2);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 24291.67, 2);
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
  });

  // transfers from crystallized pensions are liable to Income tax
  it("pay income tax on monthly crystallized pensions to savings", () => {
    const roi = {
      start: "April 6, 2018 00:00:00",
      end: "April 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take out from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension batch1", //
          FROM: crystallizedPension + "Joe.PNN1", // name is important
          FROM_VALUE: "1500", // a monthly payment
          TO: "Savings",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes
          DATE: "April 7 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
                {
          // when you take out from your pension pot
          ...simpleTransaction,
          NAME: "Each month GetSomePension batch2", //
          FROM: crystallizedPension + "Joe.PNN2", // name is important
          FROM_VALUE: "1000", // a monthly payment
          TO: "Savings",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0", // all of what is removed goes
          DATE: "April 10 2018",
          STOP_DATE: "April 4 2019",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: "Savings",
          CAN_BE_NEGATIVE: false,
          START: "April 6 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN1", // name is important - will be '+incomeTax+'Joe
          START: "April 6 2018",
          VALUE: "30000",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN2", // name is important - will be '+incomeTax+'Joe
          START: "April 6 2018",
          VALUE: "30000",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(118);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 1, 'Savings', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 2, '-CPTaxable Joe.PNN1', 'Fri Apr 06 2018', 30000, -1);
    expectEvals(evals, 3, '-CPTaxable Joe.PNN2', 'Fri Apr 06 2018', 30000, -1);
    expectEvals(evals, 4, '-CPTaxable Joe.PNN1', 'Sat Apr 07 2018', 28500, -1);
    expectEvals(evals, 5, 'Savings', 'Sat Apr 07 2018', 1500, -1);
    expectEvals(evals, 6, '-CPTaxable Joe.PNN2', 'Tue Apr 10 2018', 29000, -1);
    expectEvals(evals, 7, 'Savings', 'Tue Apr 10 2018', 2500, -1);
    expectEvals(evals, 8, 'Savings', 'Sat May 05 2018', 2391.67, 2);
    expectEvals(evals, 9, 'Savings', 'Sat May 05 2018', 2266.67, 2);
    expectEvals(evals, 10, 'Cash', 'Sun May 06 2018', 0, -1);
    expectEvals(evals, 11, 'Savings', 'Sun May 06 2018', 2266.67, 2);
    expectEvals(evals, 12, '-CPTaxable Joe.PNN1', 'Sun May 06 2018', 28500, -1);
    expectEvals(evals, 13, '-CPTaxable Joe.PNN2', 'Sun May 06 2018', 29000, -1);
    expectEvals(evals, 14, '-CPTaxable Joe.PNN1', 'Mon May 07 2018', 27000, -1);
    expectEvals(evals, 15, 'Savings', 'Mon May 07 2018', 3766.67, 2);
    expectEvals(evals, 16, '-CPTaxable Joe.PNN2', 'Thu May 10 2018', 28000, -1);
    expectEvals(evals, 17, 'Savings', 'Thu May 10 2018', 4766.67, 2);
    expectEvals(evals, 18, 'Savings', 'Tue Jun 05 2018', 4651.52, 2);
    expectEvals(evals, 19, 'Savings', 'Tue Jun 05 2018', 4490.92, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Jun 06 2018', 0, -1);
    expectEvals(evals, 21, 'Savings', 'Wed Jun 06 2018', 4490.92, 2);
    expectEvals(evals, 22, '-CPTaxable Joe.PNN1', 'Wed Jun 06 2018', 27000, -1);
    expectEvals(evals, 23, '-CPTaxable Joe.PNN2', 'Wed Jun 06 2018', 28000, -1);
    expectEvals(evals, 24, '-CPTaxable Joe.PNN1', 'Thu Jun 07 2018', 25500, -1);
    expectEvals(evals, 25, 'Savings', 'Thu Jun 07 2018', 5990.92, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN2', 'Sun Jun 10 2018', 27000, -1);
    expectEvals(evals, 27, 'Savings', 'Sun Jun 10 2018', 6990.92, 2);
    expectEvals(evals, 28, 'Savings', 'Thu Jul 05 2018', 6871.83, 2);
    expectEvals(evals, 29, 'Savings', 'Thu Jul 05 2018', 6672.74, 2);
    expectEvals(evals, 30, 'Cash', 'Fri Jul 06 2018', 0, -1);
    expectEvals(evals, 31, 'Savings', 'Fri Jul 06 2018', 6672.74, 2);
    expectEvals(evals, 32, '-CPTaxable Joe.PNN1', 'Fri Jul 06 2018', 25500, -1);
    expectEvals(evals, 33, '-CPTaxable Joe.PNN2', 'Fri Jul 06 2018', 27000, -1);
    expectEvals(evals, 34, '-CPTaxable Joe.PNN1', 'Sat Jul 07 2018', 24000, -1);
    expectEvals(evals, 35, 'Savings', 'Sat Jul 07 2018', 8172.74, 2);
    expectEvals(evals, 36, '-CPTaxable Joe.PNN2', 'Tue Jul 10 2018', 26000, -1);
    expectEvals(evals, 37, 'Savings', 'Tue Jul 10 2018', 9172.74, 2);
    expectEvals(evals, 38, 'Savings', 'Sun Aug 05 2018', 9053.55, 2);
    expectEvals(evals, 39, 'Savings', 'Sun Aug 05 2018', 8812.14, 2);
    expectEvals(evals, 40, 'Cash', 'Mon Aug 06 2018', 0, -1);
    expectEvals(evals, 41, 'Savings', 'Mon Aug 06 2018', 8812.14, 2);
    expectEvals(evals, 42, '-CPTaxable Joe.PNN1', 'Mon Aug 06 2018', 24000, -1);
    expectEvals(evals, 43, '-CPTaxable Joe.PNN2', 'Mon Aug 06 2018', 26000, -1);
    expectEvals(evals, 44, '-CPTaxable Joe.PNN1', 'Tue Aug 07 2018', 22500, -1);
    expectEvals(evals, 45, 'Savings', 'Tue Aug 07 2018', 10312.14, 2);
    expectEvals(evals, 46, '-CPTaxable Joe.PNN2', 'Fri Aug 10 2018', 25000, -1);
    expectEvals(evals, 47, 'Savings', 'Fri Aug 10 2018', 11312.14, 2);
    expectEvals(evals, 48, 'Savings', 'Wed Sep 05 2018', 11198.13, 2);
    expectEvals(evals, 49, 'Savings', 'Wed Sep 05 2018', 10909.12, 2);
    expectEvals(evals, 50, 'Cash', 'Thu Sep 06 2018', 0, -1);
    expectEvals(evals, 51, 'Savings', 'Thu Sep 06 2018', 10909.12, 2);
    expectEvals(evals, 52, '-CPTaxable Joe.PNN1', 'Thu Sep 06 2018', 22500, -1);
    expectEvals(evals, 53, '-CPTaxable Joe.PNN2', 'Thu Sep 06 2018', 25000, -1);
    expectEvals(evals, 54, '-CPTaxable Joe.PNN1', 'Fri Sep 07 2018', 21000, -1);
    expectEvals(evals, 55, 'Savings', 'Fri Sep 07 2018', 12409.12, 2);
    expectEvals(evals, 56, '-CPTaxable Joe.PNN2', 'Mon Sep 10 2018', 24000, -1);
    expectEvals(evals, 57, 'Savings', 'Mon Sep 10 2018', 13409.12, 2);
    expectEvals(evals, 58, 'Savings', 'Fri Oct 05 2018', 13307.82, 2);
    expectEvals(evals, 59, 'Savings', 'Fri Oct 05 2018', 12963.66, 2);
    expectEvals(evals, 60, 'Cash', 'Sat Oct 06 2018', 0, -1);
    expectEvals(evals, 61, 'Savings', 'Sat Oct 06 2018', 12963.66, 2);
    expectEvals(evals, 62, '-CPTaxable Joe.PNN1', 'Sat Oct 06 2018', 21000, -1);
    expectEvals(evals, 63, '-CPTaxable Joe.PNN2', 'Sat Oct 06 2018', 24000, -1);
    expectEvals(evals, 64, '-CPTaxable Joe.PNN1', 'Sun Oct 07 2018', 19500, -1);
    expectEvals(evals, 65, 'Savings', 'Sun Oct 07 2018', 14463.66, 2);
    expectEvals(evals, 66, '-CPTaxable Joe.PNN2', 'Wed Oct 10 2018', 23000, -1);
    expectEvals(evals, 67, 'Savings', 'Wed Oct 10 2018', 15463.66, 2);
    expectEvals(evals, 68, 'Savings', 'Mon Nov 05 2018', 15386.39, 2);
    expectEvals(evals, 69, 'Savings', 'Mon Nov 05 2018', 14975.78, 2);
    expectEvals(evals, 70, 'Cash', 'Tue Nov 06 2018', 0, -1);
    expectEvals(evals, 71, 'Savings', 'Tue Nov 06 2018', 14975.78, 2);
    expectEvals(evals, 72, '-CPTaxable Joe.PNN1', 'Tue Nov 06 2018', 19500, -1);
    expectEvals(evals, 73, '-CPTaxable Joe.PNN2', 'Tue Nov 06 2018', 23000, -1);
    expectEvals(evals, 74, '-CPTaxable Joe.PNN1', 'Wed Nov 07 2018', 18000, -1);
    expectEvals(evals, 75, 'Savings', 'Wed Nov 07 2018', 16475.78, 2);
    expectEvals(evals, 76, '-CPTaxable Joe.PNN2', 'Sat Nov 10 2018', 22000, -1);
    expectEvals(evals, 77, 'Savings', 'Sat Nov 10 2018', 17475.78, 2);
    expectEvals(evals, 78, 'Savings', 'Wed Dec 05 2018', 17440.63, 2);
    expectEvals(evals, 79, 'Savings', 'Wed Dec 05 2018', 16945.48, 2);
    expectEvals(evals, 80, 'Cash', 'Thu Dec 06 2018', 0, -1);
    expectEvals(evals, 81, 'Savings', 'Thu Dec 06 2018', 16945.48, 2);
    expectEvals(evals, 82, '-CPTaxable Joe.PNN1', 'Thu Dec 06 2018', 18000, -1);
    expectEvals(evals, 83, '-CPTaxable Joe.PNN2', 'Thu Dec 06 2018', 22000, -1);
    expectEvals(evals, 84, '-CPTaxable Joe.PNN1', 'Fri Dec 07 2018', 16500, -1);
    expectEvals(evals, 85, 'Savings', 'Fri Dec 07 2018', 18445.48, 2);
    expectEvals(evals, 86, '-CPTaxable Joe.PNN2', 'Mon Dec 10 2018', 21000, -1);
    expectEvals(evals, 87, 'Savings', 'Mon Dec 10 2018', 19445.48, 2);
    expectEvals(evals, 88, 'Savings', 'Sat Jan 05 2019', 18709.11, 2);
    expectEvals(evals, 89, 'Cash', 'Sun Jan 06 2019', 0, -1);
    expectEvals(evals, 90, 'Savings', 'Sun Jan 06 2019', 18709.11, 2);
    expectEvals(evals, 91, '-CPTaxable Joe.PNN1', 'Sun Jan 06 2019', 16500, -1);
    expectEvals(evals, 92, '-CPTaxable Joe.PNN2', 'Sun Jan 06 2019', 21000, -1);
    expectEvals(evals, 93, '-CPTaxable Joe.PNN1', 'Mon Jan 07 2019', 15000, -1);
    expectEvals(evals, 94, 'Savings', 'Mon Jan 07 2019', 20209.11, 2);
    expectEvals(evals, 95, '-CPTaxable Joe.PNN2', 'Thu Jan 10 2019', 20000, -1);
    expectEvals(evals, 96, 'Savings', 'Thu Jan 10 2019', 21209.11, 2);
    expectEvals(evals, 97, 'Savings', 'Tue Feb 05 2019', 20139.41, 2);
    expectEvals(evals, 98, 'Cash', 'Wed Feb 06 2019', 0, -1);
    expectEvals(evals, 99, 'Savings', 'Wed Feb 06 2019', 20139.41, 2);
    expectEvals(evals, 100, '-CPTaxable Joe.PNN1', 'Wed Feb 06 2019', 15000, -1);
    expectEvals(evals, 101, '-CPTaxable Joe.PNN2', 'Wed Feb 06 2019', 20000, -1);
    expectEvals(evals, 102, '-CPTaxable Joe.PNN1', 'Thu Feb 07 2019', 13500, -1);
    expectEvals(evals, 103, 'Savings', 'Thu Feb 07 2019', 21639.41, 2);
    expectEvals(evals, 104, '-CPTaxable Joe.PNN2', 'Sun Feb 10 2019', 19000, -1);
    expectEvals(evals, 105, 'Savings', 'Sun Feb 10 2019', 22639.41, 2);
    expectEvals(evals, 106, 'Savings', 'Tue Mar 05 2019', 21069.71, 2);
    expectEvals(evals, 107, 'Cash', 'Wed Mar 06 2019', 0, -1);
    expectEvals(evals, 108, 'Savings', 'Wed Mar 06 2019', 21069.71, 2);
    expectEvals(evals, 109, '-CPTaxable Joe.PNN1', 'Wed Mar 06 2019', 13500, -1);
    expectEvals(evals, 110, '-CPTaxable Joe.PNN2', 'Wed Mar 06 2019', 19000, -1);
    expectEvals(evals, 111, '-CPTaxable Joe.PNN1', 'Thu Mar 07 2019', 12000, -1);
    expectEvals(evals, 112, 'Savings', 'Thu Mar 07 2019', 22569.71, 2);
    expectEvals(evals, 113, '-CPTaxable Joe.PNN2', 'Sun Mar 10 2019', 18000, -1);
    expectEvals(evals, 114, 'Savings', 'Sun Mar 10 2019', 23569.71, 2);
    expectEvals(evals, 115, 'Cash', 'Fri Apr 05 2019', 2930.29, 2); // why rebate here?
    expectEvals(evals, 116, '(incomeTax)', 'Fri Apr 05 2019', 3500, -1);
    expectEvals(evals, 117, 'Joe income (net)', 'Fri Apr 05 2019', 26500, -1);

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
    expect(result.assetData[0].item.NAME).toBe('Savings');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Fri Apr 06 2018', 0, -1);
    expectChartData(chartPts, 1, 'Sun May 06 2018', 2266.67, 2);
    expectChartData(chartPts, 2, 'Wed Jun 06 2018', 4490.92, 2);
    expectChartData(chartPts, 3, 'Fri Jul 06 2018', 6672.74, 2);
    expectChartData(chartPts, 4, 'Mon Aug 06 2018', 8812.14, 2);
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 10909.12, 2);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 12963.66, 2);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 14975.78, 2);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 16945.48, 2);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 18709.11, 2);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 20139.41, 2);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 21069.71, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('-CPTaxable Joe.PNN1');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Fri Apr 06 2018', 30000, -1);
    expectChartData(chartPts, 1, 'Sun May 06 2018', 28500, -1);
    expectChartData(chartPts, 2, 'Wed Jun 06 2018', 27000, -1);
    expectChartData(chartPts, 3, 'Fri Jul 06 2018', 25500, -1);
    expectChartData(chartPts, 4, 'Mon Aug 06 2018', 24000, -1);
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 22500, -1);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 21000, -1);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 19500, -1);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 18000, -1);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 16500, -1);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 15000, -1);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 13500, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('-CPTaxable Joe.PNN2');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Fri Apr 06 2018', 30000, -1);
    expectChartData(chartPts, 1, 'Sun May 06 2018', 29000, -1);
    expectChartData(chartPts, 2, 'Wed Jun 06 2018', 28000, -1);
    expectChartData(chartPts, 3, 'Fri Jul 06 2018', 27000, -1);
    expectChartData(chartPts, 4, 'Mon Aug 06 2018', 26000, -1);
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 25000, -1);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 24000, -1);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 23000, -1);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 22000, -1);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 21000, -1);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 20000, -1);
    expectChartData(chartPts, 11, 'Wed Mar 06 2019', 19000, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("use up income tax allowance from crystallized pension", () => {
    const roi = {
      start: "March 1, 2018 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "March 2, 2018 00:00:00",
          END: "March 3, 2018 00:00:00",
          NAME: "PRnd",
          VALUE: "50000",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
        {
          ...simpleIncome,
          START: "April 10, 2018 00:00:00",
          END: "April 11, 2018 00:00:00",
          NAME: "java",
          VALUE: "10000",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
          LIABILITY: "Joe" + incomeTax, // no liability so doesn't affect allowance
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "March 1 2018",
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + "Joe.PNN", // name is important - will be '+incomeTax+'Joe
          START: "March 1 2018",
          VALUE: "60000",
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
    expectEvals(evals, 0, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 1, cpj, "Thu Mar 01 2018", 60000, -1);
    expectEvals(evals, 2, "PRnd", "Fri Mar 02 2018", 50000, -1);
    expectEvals(evals, 3, "Cash", "Fri Mar 02 2018", 50000, -1);
    expectEvals(evals, 4, "Cash", "Sun Apr 01 2018", 50000, -1);
    expectEvals(evals, 5, cpj, "Sun Apr 01 2018", 60000, -1);
    expectEvals(evals, 6, "Cash", "Thu Apr 05 2018", 62500, -1);
    expectEvals(evals, 7, cpj, "Thu Apr 05 2018", 47500, -1);
    expectEvals(evals, 8, getnetincLabel("Joe"), "Thu Apr 05 2018", 12500, -1);
    expectEvals(evals, 9, "java", "Tue Apr 10 2018", 10000, -1);
    expectEvals(evals, 10, "Cash", "Tue Apr 10 2018", 72500, -1);
    expectEvals(evals, 11, "Cash", "Tue May 01 2018", 72500, -1);
    expectEvals(evals, 12, cpj, "Tue May 01 2018", 47500, -1);
    expectEvals(evals, 13, "Cash", "Fri Apr 05 2019", 75000, -1);
    expectEvals(evals, 14, cpj, "Fri Apr 05 2019", 45000, -1);
    expectEvals(evals, 15, getnetincLabel("Joe"), "Fri Apr 05 2019", 12500, -1);

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
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 50000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 10000, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 50000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 72500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + "Joe.PNN");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Thu Mar 01 2018", 60000, -1);
      expectChartData(chartPts, 1, "Sun Apr 01 2018", 60000, -1);
      expectChartData(chartPts, 2, "Tue May 01 2018", 47500, -1);
    }
  });

  it("Defined Benefits Pension evaluations", () => {
    const roi = {
      start: "Dec 1, 2019",
      end: "May 02 2021",
    };
    const viewSettings = getMinimalModelCopySettings();
    const model: ModelData = getTestModel(definedBenefitsPension);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(115);

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
    expectChartData(chartPts, 2, 'Sat Feb 01 2020', 2500, -1);
    expectChartData(chartPts, 3, 'Sun Mar 01 2020', 2500, -1);
    expectChartData(chartPts, 4, 'Wed Apr 01 2020', 2500, -1);
    expectChartData(chartPts, 5, 'Fri May 01 2020', 2500, -1);
    expectChartData(chartPts, 6, 'Mon Jun 01 2020', 2500, -1);
    expectChartData(chartPts, 7, 'Wed Jul 01 2020', 2500, -1);
    expectChartData(chartPts, 8, 'Sat Aug 01 2020', 2500, -1);
    expectChartData(chartPts, 9, 'Tue Sep 01 2020', 2500, -1);
    expectChartData(chartPts, 10, 'Thu Oct 01 2020', 2500, -1);
    expectChartData(chartPts, 11, 'Sun Nov 01 2020', 2500, -1);
    expectChartData(chartPts, 12, 'Tue Dec 01 2020', 2500, -1);
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2500, -1);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 2500, -1);
    expectChartData(chartPts, 15, 'Mon Mar 01 2021', 2500, -1);
    expectChartData(chartPts, 16, 'Thu Apr 01 2021', 2500, -1);
    expectChartData(chartPts, 17, 'Sat May 01 2021', 2500, -1);
    }
    
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Wed Jan 01 2020', 2500, -1);
    expectChartData(chartPts, 2, 'Sat Feb 01 2020', 4786.28, 2);
    expectChartData(chartPts, 3, 'Sun Mar 01 2020', 7072.56, 2);
    expectChartData(chartPts, 4, 'Wed Apr 01 2020', 9358.84, 2);
    expectChartData(chartPts, 5, 'Fri May 01 2020', 11645.12, 2);
    expectChartData(chartPts, 6, 'Mon Jun 01 2020', 13639.74, 2);
    expectChartData(chartPts, 7, 'Wed Jul 01 2020', 15634.36, 2);
    expectChartData(chartPts, 8, 'Sat Aug 01 2020', 17628.98, 2);
    expectChartData(chartPts, 9, 'Tue Sep 01 2020', 19623.60, 2);
    expectChartData(chartPts, 10, 'Thu Oct 01 2020', 21618.21, 2);
    expectChartData(chartPts, 11, 'Sun Nov 01 2020', 23612.82, 2);
    expectChartData(chartPts, 12, 'Tue Dec 01 2020', 25607.43, 2);
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 27602.04, 2);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 29596.65, 2);
    expectChartData(chartPts, 15, 'Mon Mar 01 2021', 31591.26, 2);
    expectChartData(chartPts, 16, 'Thu Apr 01 2021', 33585.87, 2);
    expectChartData(chartPts, 17, 'Sat May 01 2021', 35580.48, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 3500, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
    expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
    expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
    expectChartData(chartPts, 5, 'Fri May 01 2020', 9145.12, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 23935.36, 2);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Sat Feb 01 2020', 0, -1);
    expectChartData(chartPts, 3, 'Sun Mar 01 2020', 0, -1);
    expectChartData(chartPts, 4, 'Wed Apr 01 2020', 0, -1);
    expectChartData(chartPts, 5, 'Fri May 01 2020', 854.88, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 2564.64, 2);
    }
  });

  it("Defined Contributions Pension evaluations", () => {
    // TODO : check
    const roi = {
      start: "Dec 1, 2019",
      end: "May 02 2021",
    };
    const viewSettings = getMinimalModelCopySettings();
    const model: ModelData = getTestModel(definedContributionsPension);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model, false); // todo reinstate extrachecks
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(104);

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
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2500, -1);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 2500, -1);
    expectChartData(chartPts, 15, 'Mon Mar 01 2021', 2500, -1);
    expectChartData(chartPts, 16, 'Thu Apr 01 2021', 2500, -1);
    expectChartData(chartPts, 17, 'Sat May 01 2021', 2500, -1);
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
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2375, -1);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 4536.28, 2);
    expectChartData(chartPts, 15, 'Mon Mar 01 2021', 6697.56, 2);
    expectChartData(chartPts, 16, 'Thu Apr 01 2021', 8858.84, 2);
    expectChartData(chartPts, 17, 'Sat May 01 2021', 11020.12, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 8645.12, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 854.88, 2);
    }
  });

  it("Transferring pensions to others", () => {
    const roi = {
      start: "Dec 1, 2019",
      end: "May 02 2031",
    };
    const viewSettings = getMinimalModelCopySettings();
    const model: ModelData = getTestModel(pensionExampleData);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);

    // const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

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
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 60757.15, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 141324.55, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 229729.47, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 294479.74, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 355817.74, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 418102.14, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 482634.04, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 546054.37, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 608943.34, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 671903.74, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 678200.44, 2);
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
    expect(result.taxData[0].item.NAME).toBe('Jake income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 6, -1);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 6, -1);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 6, -1);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 6, -1);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 30, -1);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 70, -1);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 6, -1);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Jake income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12233.64, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12267.60, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12267.60, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12592.08, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12688.08, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12848.08, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12592.08, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8398.72, 2);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Jake income (NI)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 360.36, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 326.40, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 326.40, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1.92, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1.92, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1.92, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1.92, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1.28, 2);
    }
    
    expect(result.taxData[3].item.NAME).toBe('Jane income (incomeTax)');
    {
    const chartPts = result.taxData[3].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 6, -1);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 6, -1);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 6, -1);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 6, -1);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 6, -1);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 6, -1);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 6, -1);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }
    
    expect(result.taxData[4].item.NAME).toBe('Jane income (net)');
    {
    const chartPts = result.taxData[4].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12233.64, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12267.60, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12267.60, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12592.08, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12592.08, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12592.08, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12592.08, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 11098.72, 2);
    }
    
    expect(result.taxData[5].item.NAME).toBe('Jane income (NI)');
    {
    const chartPts = result.taxData[5].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 360.36, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 326.40, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 326.40, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1.92, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1.92, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1.92, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1.92, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1.28, 2);
    }
    
    expect(result.taxData[6].item.NAME).toBe('Jeff income (incomeTax)');
    {
    const chartPts = result.taxData[6].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 6, -1);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 6, -1);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 6, -1);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 6, -1);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 24, -1);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 54, -1);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 6, -1);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }
    
    expect(result.taxData[7].item.NAME).toBe('Jeff income (net)');
    {
    const chartPts = result.taxData[7].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12233.64, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12267.60, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12267.60, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12592.08, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12664.08, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12784.08, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12592.08, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8398.72, 2);
    }
    
    expect(result.taxData[8].item.NAME).toBe('Jeff income (NI)');
    {
    const chartPts = result.taxData[8].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 360.36, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 326.40, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 326.40, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1.92, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1.92, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1.92, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1.92, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1.28, 2);
    }
    
    expect(result.taxData[9].item.NAME).toBe('Jen income (incomeTax)');
    {
    const chartPts = result.taxData[9].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 20, -1);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 20, -1);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 6, -1);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 6, -1);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 6, -1);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 6, -1);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 6, -1);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 6, -1);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 6, -1);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }
    
    expect(result.taxData[10].item.NAME).toBe('Jen income (net)');
    {
    const chartPts = result.taxData[10].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12233.64, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12267.60, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12267.60, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12592.08, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12592.08, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12592.08, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12592.08, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 11998.72, 2);
    }
    
    expect(result.taxData[11].item.NAME).toBe('Jen income (NI)');
    {
    const chartPts = result.taxData[11].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 360.36, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 326.40, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 326.40, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1.92, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1.92, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1.92, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1.92, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1.28, 2);
    }
    
    expect(result.taxData[12].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[12].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 0, -1);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 2180, -1);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 7220, -1);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 5766, -1);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 6, -1);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 6, -1);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 118, -1);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 230, -1);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 6, -1);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 6, -1);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 0, -1);
    }
    
    expect(result.taxData[13].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[13].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 19303.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 36456.56, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 31722.28, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12267.60, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12267.60, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 13040.08, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 13488.08, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12592.08, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12592.08, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8398.72, 2);
    }
    
    expect(result.taxData[14].item.NAME).toBe('Joe income (NI)');
    {
    const chartPts = result.taxData[14].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 1916.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 4923.44, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 3911.72, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 326.40, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 326.40, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 1.92, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 1.92, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 1.92, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 1.92, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 1.28, 2);
    }
  });

  it("unused allowances", () => {
    const modelAndRoi = getModelTwoCrystallizedPensions();
    const model = modelAndRoi.model;

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(100);
    expectEvals(evals, 0, "Cash", "Fri Mar 01 2019", 0, -1);
    expectEvals(evals, 1, "-CPTaxable Joe.A", "Fri Mar 01 2019", 13500, -1);
    expectEvals(evals, 2, "-CPTaxable Joe.B", "Fri Mar 01 2019", 13500, -1);
    expectEvals(evals, 3, "Cash", "Mon Apr 01 2019", 0, -1);
    expectEvals(evals, 4, "-CPTaxable Joe.A", "Mon Apr 01 2019", 13500, -1);
    expectEvals(evals, 5, "-CPTaxable Joe.B", "Mon Apr 01 2019", 13500, -1);
    expectEvals(evals, 6, "Cash", "Fri Apr 05 2019", 12500, -1);
    expectEvals(evals, 7, "-CPTaxable Joe.A", "Fri Apr 05 2019", 1000, -1);
    expectEvals(evals, 8, "Cash", "Fri Apr 05 2019", 12500, -1);
    expectEvals(evals, 9, "-CPTaxable Joe.B", "Fri Apr 05 2019", 13500, -1);
    expectEvals(evals, 10, getnetincLabel("Joe"), "Fri Apr 05 2019", 12500, -1);
    expectEvals(evals, 11, "Cash", "Wed May 01 2019", 12500, -1);
    expectEvals(evals, 12, "-CPTaxable Joe.A", "Wed May 01 2019", 1000, -1);
    expectEvals(evals, 13, "-CPTaxable Joe.B", "Wed May 01 2019", 13500, -1);
    expectEvals(evals, 14, "Cash", "Sat Jun 01 2019", 12500, -1);
    expectEvals(evals, 15, "-CPTaxable Joe.A", "Sat Jun 01 2019", 1000, -1);
    expectEvals(evals, 16, "-CPTaxable Joe.B", "Sat Jun 01 2019", 13500, -1);
    expectEvals(evals, 17, "Cash", "Mon Jul 01 2019", 12500, -1);
    expectEvals(evals, 18, "-CPTaxable Joe.A", "Mon Jul 01 2019", 1000, -1);
    expectEvals(evals, 19, "-CPTaxable Joe.B", "Mon Jul 01 2019", 13500, -1);
    expectEvals(evals, 20, "Cash", "Thu Aug 01 2019", 12500, -1);
    expectEvals(evals, 21, "-CPTaxable Joe.A", "Thu Aug 01 2019", 1000, -1);
    expectEvals(evals, 22, "-CPTaxable Joe.B", "Thu Aug 01 2019", 13500, -1);
    expectEvals(evals, 23, "Cash", "Sun Sep 01 2019", 12500, -1);
    expectEvals(evals, 24, "-CPTaxable Joe.A", "Sun Sep 01 2019", 1000, -1);
    expectEvals(evals, 25, "-CPTaxable Joe.B", "Sun Sep 01 2019", 13500, -1);
    expectEvals(evals, 26, "Cash", "Tue Oct 01 2019", 12500, -1);
    expectEvals(evals, 27, "-CPTaxable Joe.A", "Tue Oct 01 2019", 1000, -1);
    expectEvals(evals, 28, "-CPTaxable Joe.B", "Tue Oct 01 2019", 13500, -1);
    expectEvals(evals, 29, "Cash", "Fri Nov 01 2019", 12500, -1);
    expectEvals(evals, 30, "-CPTaxable Joe.A", "Fri Nov 01 2019", 1000, -1);
    expectEvals(evals, 31, "-CPTaxable Joe.B", "Fri Nov 01 2019", 13500, -1);
    expectEvals(evals, 32, "Cash", "Sun Dec 01 2019", 12500, -1);
    expectEvals(evals, 33, "-CPTaxable Joe.A", "Sun Dec 01 2019", 1000, -1);
    expectEvals(evals, 34, "-CPTaxable Joe.B", "Sun Dec 01 2019", 13500, -1);
    expectEvals(evals, 35, "Cash", "Wed Jan 01 2020", 12500, -1);
    expectEvals(evals, 36, "-CPTaxable Joe.A", "Wed Jan 01 2020", 1000, -1);
    expectEvals(evals, 37, "-CPTaxable Joe.B", "Wed Jan 01 2020", 13500, -1);
    expectEvals(evals, 38, "Cash", "Sat Feb 01 2020", 12500, -1);
    expectEvals(evals, 39, "-CPTaxable Joe.A", "Sat Feb 01 2020", 1000, -1);
    expectEvals(evals, 40, "-CPTaxable Joe.B", "Sat Feb 01 2020", 13500, -1);
    expectEvals(evals, 41, "Cash", "Sun Mar 01 2020", 12500, -1);
    expectEvals(evals, 42, "-CPTaxable Joe.A", "Sun Mar 01 2020", 1000, -1);
    expectEvals(evals, 43, "-CPTaxable Joe.B", "Sun Mar 01 2020", 13500, -1);
    expectEvals(evals, 44, "Cash", "Wed Apr 01 2020", 12500, -1);
    expectEvals(evals, 45, "-CPTaxable Joe.A", "Wed Apr 01 2020", 1000, -1);
    expectEvals(evals, 46, "-CPTaxable Joe.B", "Wed Apr 01 2020", 13500, -1);
    expectEvals(evals, 47, "Cash", "Sun Apr 05 2020", 13500, -1);
    expectEvals(evals, 48, "-CPTaxable Joe.A", "Sun Apr 05 2020", 0, -1);
    expectEvals(evals, 49, "Cash", "Sun Apr 05 2020", 25000, -1);
    expectEvals(evals, 50, "-CPTaxable Joe.B", "Sun Apr 05 2020", 2000, -1);
    expectEvals(evals, 51, getnetincLabel("Joe"), "Sun Apr 05 2020", 12500, -1);
    expectEvals(evals, 52, "Cash", "Fri May 01 2020", 25000, -1);
    expectEvals(evals, 53, "-CPTaxable Joe.A", "Fri May 01 2020", 0, -1);
    expectEvals(evals, 54, "-CPTaxable Joe.B", "Fri May 01 2020", 2000, -1);
    expectEvals(evals, 55, "Cash", "Mon Jun 01 2020", 25000, -1);
    expectEvals(evals, 56, "-CPTaxable Joe.A", "Mon Jun 01 2020", 0, -1);
    expectEvals(evals, 57, "-CPTaxable Joe.B", "Mon Jun 01 2020", 2000, -1);
    expectEvals(evals, 58, "Cash", "Wed Jul 01 2020", 25000, -1);
    expectEvals(evals, 59, "-CPTaxable Joe.A", "Wed Jul 01 2020", 0, -1);
    expectEvals(evals, 60, "-CPTaxable Joe.B", "Wed Jul 01 2020", 2000, -1);
    expectEvals(evals, 61, "Cash", "Sat Aug 01 2020", 25000, -1);
    expectEvals(evals, 62, "-CPTaxable Joe.A", "Sat Aug 01 2020", 0, -1);
    expectEvals(evals, 63, "-CPTaxable Joe.B", "Sat Aug 01 2020", 2000, -1);
    expectEvals(evals, 64, "Cash", "Tue Sep 01 2020", 25000, -1);
    expectEvals(evals, 65, "-CPTaxable Joe.A", "Tue Sep 01 2020", 0, -1);
    expectEvals(evals, 66, "-CPTaxable Joe.B", "Tue Sep 01 2020", 2000, -1);
    expectEvals(evals, 67, "Cash", "Thu Oct 01 2020", 25000, -1);
    expectEvals(evals, 68, "-CPTaxable Joe.A", "Thu Oct 01 2020", 0, -1);
    expectEvals(evals, 69, "-CPTaxable Joe.B", "Thu Oct 01 2020", 2000, -1);
    expectEvals(evals, 70, "Cash", "Sun Nov 01 2020", 25000, -1);
    expectEvals(evals, 71, "-CPTaxable Joe.A", "Sun Nov 01 2020", 0, -1);
    expectEvals(evals, 72, "-CPTaxable Joe.B", "Sun Nov 01 2020", 2000, -1);
    expectEvals(evals, 73, "Cash", "Tue Dec 01 2020", 25000, -1);
    expectEvals(evals, 74, "-CPTaxable Joe.A", "Tue Dec 01 2020", 0, -1);
    expectEvals(evals, 75, "-CPTaxable Joe.B", "Tue Dec 01 2020", 2000, -1);
    expectEvals(evals, 76, "Cash", "Fri Jan 01 2021", 25000, -1);
    expectEvals(evals, 77, "-CPTaxable Joe.A", "Fri Jan 01 2021", 0, -1);
    expectEvals(evals, 78, "-CPTaxable Joe.B", "Fri Jan 01 2021", 2000, -1);
    expectEvals(evals, 79, "Cash", "Mon Feb 01 2021", 25000, -1);
    expectEvals(evals, 80, "-CPTaxable Joe.A", "Mon Feb 01 2021", 0, -1);
    expectEvals(evals, 81, "-CPTaxable Joe.B", "Mon Feb 01 2021", 2000, -1);
    expectEvals(evals, 82, "Cash", "Mon Mar 01 2021", 25000, -1);
    expectEvals(evals, 83, "-CPTaxable Joe.A", "Mon Mar 01 2021", 0, -1);
    expectEvals(evals, 84, "-CPTaxable Joe.B", "Mon Mar 01 2021", 2000, -1);
    expectEvals(evals, 85, "Cash", "Thu Apr 01 2021", 25000, -1);
    expectEvals(evals, 86, "-CPTaxable Joe.A", "Thu Apr 01 2021", 0, -1);
    expectEvals(evals, 87, "-CPTaxable Joe.B", "Thu Apr 01 2021", 2000, -1);
    expectEvals(evals, 88, "Cash", "Mon Apr 05 2021", 25000, -1);
    expectEvals(evals, 89, "-CPTaxable Joe.A", "Mon Apr 05 2021", 0, -1);
    expectEvals(evals, 90, "Cash", "Mon Apr 05 2021", 27000, -1);
    expectEvals(evals, 91, "-CPTaxable Joe.B", "Mon Apr 05 2021", 0, -1);
    expectEvals(evals, 92, getnetincLabel("Joe"), "Mon Apr 05 2021", 2000, -1);
    expectEvals(evals, 93, "Cash", "Sat May 01 2021", 27000, -1);
    expectEvals(evals, 94, "-CPTaxable Joe.A", "Sat May 01 2021", 0, -1);
    expectEvals(evals, 95, "-CPTaxable Joe.B", "Sat May 01 2021", 0, -1);
    expectEvals(evals, 96, "Cash", "Tue Apr 05 2022", 27000, -1);
    expectEvals(evals, 97, "-CPTaxable Joe.A", "Tue Apr 05 2022", 0, -1);
    expectEvals(evals, 98, "Cash", "Tue Apr 05 2022", 27000, -1);
    expectEvals(evals, 99, "-CPTaxable Joe.B", "Tue Apr 05 2022", 0, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, "Fri Mar 01 2019", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2019", 0, -1);
      expectChartData(chartPts, 2, "Wed May 01 2019", 12500, -1);
      expectChartData(chartPts, 3, "Sat Jun 01 2019", 12500, -1);
      expectChartData(chartPts, 4, "Mon Jul 01 2019", 12500, -1);
      expectChartData(chartPts, 5, "Thu Aug 01 2019", 12500, -1);
      expectChartData(chartPts, 6, "Sun Sep 01 2019", 12500, -1);
      expectChartData(chartPts, 7, "Tue Oct 01 2019", 12500, -1);
      expectChartData(chartPts, 8, "Fri Nov 01 2019", 12500, -1);
      expectChartData(chartPts, 9, "Sun Dec 01 2019", 12500, -1);
      expectChartData(chartPts, 10, "Wed Jan 01 2020", 12500, -1);
      expectChartData(chartPts, 11, "Sat Feb 01 2020", 12500, -1);
      expectChartData(chartPts, 12, "Sun Mar 01 2020", 12500, -1);
      expectChartData(chartPts, 13, "Wed Apr 01 2020", 12500, -1);
      expectChartData(chartPts, 14, "Fri May 01 2020", 25000, -1);
      expectChartData(chartPts, 15, "Mon Jun 01 2020", 25000, -1);
      expectChartData(chartPts, 16, "Wed Jul 01 2020", 25000, -1);
      expectChartData(chartPts, 17, "Sat Aug 01 2020", 25000, -1);
      expectChartData(chartPts, 18, "Tue Sep 01 2020", 25000, -1);
      expectChartData(chartPts, 19, "Thu Oct 01 2020", 25000, -1);
      expectChartData(chartPts, 20, "Sun Nov 01 2020", 25000, -1);
      expectChartData(chartPts, 21, "Tue Dec 01 2020", 25000, -1);
      expectChartData(chartPts, 22, "Fri Jan 01 2021", 25000, -1);
      expectChartData(chartPts, 23, "Mon Feb 01 2021", 25000, -1);
      expectChartData(chartPts, 24, "Mon Mar 01 2021", 25000, -1);
      expectChartData(chartPts, 25, "Thu Apr 01 2021", 25000, -1);
      expectChartData(chartPts, 26, "Sat May 01 2021", 27000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("-CPTaxable Joe.A");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, "Fri Mar 01 2019", 13500, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2019", 13500, -1);
      expectChartData(chartPts, 2, "Wed May 01 2019", 1000, -1);
      expectChartData(chartPts, 3, "Sat Jun 01 2019", 1000, -1);
      expectChartData(chartPts, 4, "Mon Jul 01 2019", 1000, -1);
      expectChartData(chartPts, 5, "Thu Aug 01 2019", 1000, -1);
      expectChartData(chartPts, 6, "Sun Sep 01 2019", 1000, -1);
      expectChartData(chartPts, 7, "Tue Oct 01 2019", 1000, -1);
      expectChartData(chartPts, 8, "Fri Nov 01 2019", 1000, -1);
      expectChartData(chartPts, 9, "Sun Dec 01 2019", 1000, -1);
      expectChartData(chartPts, 10, "Wed Jan 01 2020", 1000, -1);
      expectChartData(chartPts, 11, "Sat Feb 01 2020", 1000, -1);
      expectChartData(chartPts, 12, "Sun Mar 01 2020", 1000, -1);
      expectChartData(chartPts, 13, "Wed Apr 01 2020", 1000, -1);
      expectChartData(chartPts, 14, "Fri May 01 2020", 0, -1);
      expectChartData(chartPts, 15, "Mon Jun 01 2020", 0, -1);
      expectChartData(chartPts, 16, "Wed Jul 01 2020", 0, -1);
      expectChartData(chartPts, 17, "Sat Aug 01 2020", 0, -1);
      expectChartData(chartPts, 18, "Tue Sep 01 2020", 0, -1);
      expectChartData(chartPts, 19, "Thu Oct 01 2020", 0, -1);
      expectChartData(chartPts, 20, "Sun Nov 01 2020", 0, -1);
      expectChartData(chartPts, 21, "Tue Dec 01 2020", 0, -1);
      expectChartData(chartPts, 22, "Fri Jan 01 2021", 0, -1);
      expectChartData(chartPts, 23, "Mon Feb 01 2021", 0, -1);
      expectChartData(chartPts, 24, "Mon Mar 01 2021", 0, -1);
      expectChartData(chartPts, 25, "Thu Apr 01 2021", 0, -1);
      expectChartData(chartPts, 26, "Sat May 01 2021", 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("-CPTaxable Joe.B");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, "Fri Mar 01 2019", 13500, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2019", 13500, -1);
      expectChartData(chartPts, 2, "Wed May 01 2019", 13500, -1);
      expectChartData(chartPts, 3, "Sat Jun 01 2019", 13500, -1);
      expectChartData(chartPts, 4, "Mon Jul 01 2019", 13500, -1);
      expectChartData(chartPts, 5, "Thu Aug 01 2019", 13500, -1);
      expectChartData(chartPts, 6, "Sun Sep 01 2019", 13500, -1);
      expectChartData(chartPts, 7, "Tue Oct 01 2019", 13500, -1);
      expectChartData(chartPts, 8, "Fri Nov 01 2019", 13500, -1);
      expectChartData(chartPts, 9, "Sun Dec 01 2019", 13500, -1);
      expectChartData(chartPts, 10, "Wed Jan 01 2020", 13500, -1);
      expectChartData(chartPts, 11, "Sat Feb 01 2020", 13500, -1);
      expectChartData(chartPts, 12, "Sun Mar 01 2020", 13500, -1);
      expectChartData(chartPts, 13, "Wed Apr 01 2020", 13500, -1);
      expectChartData(chartPts, 14, "Fri May 01 2020", 2000, -1);
      expectChartData(chartPts, 15, "Mon Jun 01 2020", 2000, -1);
      expectChartData(chartPts, 16, "Wed Jul 01 2020", 2000, -1);
      expectChartData(chartPts, 17, "Sat Aug 01 2020", 2000, -1);
      expectChartData(chartPts, 18, "Tue Sep 01 2020", 2000, -1);
      expectChartData(chartPts, 19, "Thu Oct 01 2020", 2000, -1);
      expectChartData(chartPts, 20, "Sun Nov 01 2020", 2000, -1);
      expectChartData(chartPts, 21, "Tue Dec 01 2020", 2000, -1);
      expectChartData(chartPts, 22, "Fri Jan 01 2021", 2000, -1);
      expectChartData(chartPts, 23, "Mon Feb 01 2021", 2000, -1);
      expectChartData(chartPts, 24, "Mon Mar 01 2021", 2000, -1);
      expectChartData(chartPts, 25, "Thu Apr 01 2021", 2000, -1);
      expectChartData(chartPts, 26, "Sat May 01 2021", 0, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(1);
    expect(result.taxData[0].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(27);
      expectChartData(chartPts, 0, "Fri Mar 01 2019", 0, -1);
      expectChartData(chartPts, 1, "Mon Apr 01 2019", 0, -1);
      expectChartData(chartPts, 2, "Wed May 01 2019", 12500, -1);
      expectChartData(chartPts, 3, "Sat Jun 01 2019", 0, -1);
      expectChartData(chartPts, 4, "Mon Jul 01 2019", 0, -1);
      expectChartData(chartPts, 5, "Thu Aug 01 2019", 0, -1);
      expectChartData(chartPts, 6, "Sun Sep 01 2019", 0, -1);
      expectChartData(chartPts, 7, "Tue Oct 01 2019", 0, -1);
      expectChartData(chartPts, 8, "Fri Nov 01 2019", 0, -1);
      expectChartData(chartPts, 9, "Sun Dec 01 2019", 0, -1);
      expectChartData(chartPts, 10, "Wed Jan 01 2020", 0, -1);
      expectChartData(chartPts, 11, "Sat Feb 01 2020", 0, -1);
      expectChartData(chartPts, 12, "Sun Mar 01 2020", 0, -1);
      expectChartData(chartPts, 13, "Wed Apr 01 2020", 0, -1);
      expectChartData(chartPts, 14, "Fri May 01 2020", 12500, -1);
      expectChartData(chartPts, 15, "Mon Jun 01 2020", 0, -1);
      expectChartData(chartPts, 16, "Wed Jul 01 2020", 0, -1);
      expectChartData(chartPts, 17, "Sat Aug 01 2020", 0, -1);
      expectChartData(chartPts, 18, "Tue Sep 01 2020", 0, -1);
      expectChartData(chartPts, 19, "Thu Oct 01 2020", 0, -1);
      expectChartData(chartPts, 20, "Sun Nov 01 2020", 0, -1);
      expectChartData(chartPts, 21, "Tue Dec 01 2020", 0, -1);
      expectChartData(chartPts, 22, "Fri Jan 01 2021", 0, -1);
      expectChartData(chartPts, 23, "Mon Feb 01 2021", 0, -1);
      expectChartData(chartPts, 24, "Mon Mar 01 2021", 0, -1);
      expectChartData(chartPts, 25, "Thu Apr 01 2021", 0, -1);
      expectChartData(chartPts, 26, "Sat May 01 2021", 2000, -1);
    }
  });

  it('handle PDB generator low income SS no cpi', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    viewSettings.setViewSetting(viewFrequency, annually);

    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[
        {"NAME":"javaJob1",
        "ERA":0,
        "VALUE":"250",
        "VALUE_SET":"02 April 2020",
        "START":"02 April 2021",
        "END":"02 April 2022",
        "CPI_IMMUNE":true,
        "LIABILITY":"Joe(incomeTax)/Joe(NI)",
        "RECURRENCE":"1m",
        "CATEGORY":"programming"
      }
      ],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"0.0",
          "QUANTITY":"",
          "GROWTH":"0.0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "LIABILITY":"",
          "PURCHASE_PRICE":"0.0",
          "ERA":0
        }
      ],
      "transactions":[],
      "settings":[
        {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

        {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},
  
        {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
        {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},
  
        {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
        {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
      ],
      "monitors":[],
      "triggers":[],
      "generators":[
        {
          "NAME":"TeachersPensionScheme",
          "ERA":0,
          "TYPE":"Defined Benefits",
          "DETAILS":{
            "VALUE":"10",
            "VALUE_SET":"1 Jan 2021",
 
            "INCOME_SOURCE":"javaJob1",
            "SALARY_SACRIFICED":"Y",
            "CONTRIBUTION_AMOUNT":"0.5",
            "ACCRUAL":"0.02",
 
            "STOP_SOURCE":"1 Jan 2025",
            "START":"2 April 2023",
            "END":"2 April 2024",
            "GROWS_WITH_CPI":"N",

            "TRANSFER_TO":"Jack",
            "TRANSFER_PROPORTION":"0.5",
            "TRANSFERRED_STOP":"2 May 2025",
 
            "TAX_LIABILITY":"Joe",
            "CATEGORY":"pension"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSONString(modelString);

    setSetting(
      model.settings,
      `Beginning of view range`,
      "April 1 2021",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "April 1 2027",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(
      model,
    );

    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);

    // printTestCodeForEvals(evalsAndValues.evaluations);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(3);
    expect(result.incomesData[0].item.NAME).toBe('javaJob1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 3000, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 180.00, 2);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 90.00, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 7.50, 2);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 1500, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 180, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 82.50, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 7.50, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 90.00, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 125, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 1375, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 15.00, 2);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 165.00, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }
  });

  it('handle PDB generator low income SS with cpi', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(chartViewType, chartDeltas);
    viewSettings.setViewSetting(viewFrequency, annually);

    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[
        {"NAME":"javaJob1",
        "ERA":0,
        "VALUE":"250",
        "VALUE_SET":"02 April 2020",
        "START":"02 April 2021",
        "END":"02 April 2022",
        "CPI_IMMUNE":true,
        "LIABILITY":"Joe(incomeTax)/Joe(NI)",
        "RECURRENCE":"1m",
        "CATEGORY":"programming"
      }
      ],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"0.0",
          "QUANTITY":"",
          "GROWTH":"0.0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "LIABILITY":"",
          "PURCHASE_PRICE":"0.0",
          "ERA":0
        }
      ],
      "transactions":[],
      "settings":[
        {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

        {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},
  
        {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
        {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},
  
        {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
        {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
      ],
      "monitors":[],
      "triggers":[],
      "generators":[
        {
          "NAME":"TeachersPensionScheme",
          "ERA":0,
          "TYPE":"Defined Benefits",
          "DETAILS":{
            "VALUE":"10",
            "VALUE_SET":"1 Jan 2021",
 
            "INCOME_SOURCE":"javaJob1",
            "SALARY_SACRIFICED":"Y",
            "CONTRIBUTION_AMOUNT":"0.5",
            "ACCRUAL":"0.02",
 
            "STOP_SOURCE":"1 Jan 2025",
            "START":"2 April 2023",
            "END":"2 April 2024",
            "GROWS_WITH_CPI":"Y",

            "TRANSFER_TO":"Jack",
            "TRANSFER_PROPORTION":"0.5",
            "TRANSFERRED_STOP":"2 May 2025",
 
            "TAX_LIABILITY":"Joe",
            "CATEGORY":"pension"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSONString(modelString);

    setSetting(
      model.settings,
      `Beginning of view range`,
      "April 1 2021",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "April 1 2027",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(
      model,
    );

    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);

    // printTestCodeForEvals(evalsAndValues.evaluations);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    // printAllLogs();

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(3);
    expect(result.incomesData[0].item.NAME).toBe('javaJob1');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 3000, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 192.00, 2);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 98.40, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 8.22, 2);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 1500, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 192.00, 2);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 90.39, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 8.22, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 98.60, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
      expectChartData(chartPts, 1, 'Fri Apr 01 2022', 125, -1);
      expectChartData(chartPts, 2, 'Sat Apr 01 2023', 1375, -1);
      expectChartData(chartPts, 3, 'Mon Apr 01 2024', 15.64, 2);
      expectChartData(chartPts, 4, 'Tue Apr 01 2025', 176.36, 2);
      expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
    }
  });
});

it('handle PDB generator NI income no SS with cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"900",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2021",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"TeachersPensionScheme",
        "ERA":0,
        "TYPE":"Defined Benefits",
        "DETAILS":{
          "VALUE":"10",
          "VALUE_SET":"1 Jan 2021",

          "INCOME_SOURCE":"javaJob1",
          "SALARY_SACRIFICED":"N",
          "CONTRIBUTION_AMOUNT":"0.5",
          "ACCRUAL":"0.02",

          "STOP_SOURCE":"1 Jan 2025",
          "START":"2 April 2023",
          "END":"2 April 2024",
          "GROWS_WITH_CPI":"Y",

          "TRANSFER_TO":"Jack",
          "TRANSFER_PROPORTION":"0.5",
          "TRANSFERRED_STOP":"2 May 2025",

          "TAX_LIABILITY":"Joe",
          "CATEGORY":"pension"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2021",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2027",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

  const result = makeChartDataFromEvaluations(
    model,
    viewSettings,
    evalsAndValues,
  );

  // printTestCodeForChart(result);

  // printAllLogs();

  expect(result.expensesData.length).toBe(0);
  expect(result.incomesData.length).toBe(3);
  expect(result.incomesData[0].item.NAME).toBe('javaJob1');
  {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 10800, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
  {
    const chartPts = result.incomesData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 355.91, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
  {
    const chartPts = result.incomesData[2].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 182.40, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 15.23, 2);
  }

  expect(result.assetData.length).toBe(4);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 5400, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', -260.64, 2);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.assetData[2].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
  {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 355.91, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.assetData[3].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
  {
    const chartPts = result.assetData[3].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 167.54, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 15.23, 2);
  }

  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(3);
  expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
  {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 182.78, 2);
  }

  expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
  {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 428.28, 2);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 4711.08, 2);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 28.99, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 326.92, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
  {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 21.72, 2);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 238.92, 2);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
});

it('handle PDB generator NI income SS with cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"900",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2021",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"TeachersPensionScheme",
        "ERA":0,
        "TYPE":"Defined Benefits",
        "DETAILS":{
          "VALUE":"10",
          "VALUE_SET":"1 Jan 2021",

          "INCOME_SOURCE":"javaJob1",
          "SALARY_SACRIFICED":"Y",
          "CONTRIBUTION_AMOUNT":"0.5",
          "ACCRUAL":"0.02",

          "STOP_SOURCE":"1 Jan 2025",
          "START":"2 April 2023",
          "END":"2 April 2024",
          "GROWS_WITH_CPI":"Y",

          "TRANSFER_TO":"Jack",
          "TRANSFER_PROPORTION":"0.5",
          "TRANSFERRED_STOP":"2 May 2025",

          "TAX_LIABILITY":"Joe",
          "CATEGORY":"pension"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2021",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2027",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

  const result = makeChartDataFromEvaluations(
    model,
    viewSettings,
    evalsAndValues,
  );

  // printTestCodeForChart(result);

  // printAllLogs();

  expect(result.expensesData.length).toBe(0);
  expect(result.incomesData.length).toBe(3);
  expect(result.incomesData[0].item.NAME).toBe('javaJob1');
  {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 10800, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
  {
    const chartPts = result.incomesData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 355.91, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
  {
    const chartPts = result.incomesData[2].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 182.40, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 15.23, 2);
  }

  expect(result.assetData.length).toBe(3);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 5400, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.assetData[1].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
  {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 355.91, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }

  expect(result.assetData[2].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
  {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 167.54, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 15.23, 2);
  }

  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(2);
  expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
  {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 182.78, 2);
  }

  expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
  {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
    expectChartData(chartPts, 1, 'Fri Apr 01 2022', 450, -1);
    expectChartData(chartPts, 2, 'Sat Apr 01 2023', 4950, -1);
    expectChartData(chartPts, 3, 'Mon Apr 01 2024', 28.99, 2);
    expectChartData(chartPts, 4, 'Tue Apr 01 2025', 326.92, 2);
    expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
});

it('handle PDB generator tax income SS with cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"4000",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2021",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"TeachersPensionScheme",
        "ERA":0,
        "TYPE":"Defined Benefits",
        "DETAILS":{
          "VALUE":"10",
          "VALUE_SET":"1 Jan 2021",

          "INCOME_SOURCE":"javaJob1",
          "SALARY_SACRIFICED":"Y",
          "CONTRIBUTION_AMOUNT":"0.5",
          "ACCRUAL":"0.02",

          "STOP_SOURCE":"1 Jan 2025",
          "START":"2 April 2023",
          "END":"2 April 2024",
          "GROWS_WITH_CPI":"Y",

          "TRANSFER_TO":"Jack",
          "TRANSFER_PROPORTION":"0.5",
          "TRANSFERRED_STOP":"2 May 2025",

          "TAX_LIABILITY":"Joe",
          "CATEGORY":"pension"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2021",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2027",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

  const result = makeChartDataFromEvaluations(
    model,
    viewSettings,
    evalsAndValues,
  );

  // printTestCodeForChart(result);

  // printAllLogs();

  expect(result.expensesData.length).toBe(0);
  expect(result.incomesData.length).toBe(3);
  expect(result.incomesData[0].item.NAME).toBe('javaJob1');
  {
  const chartPts = result.incomesData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 48000, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
  {
  const chartPts = result.incomesData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 1137.61, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
  {
  const chartPts = result.incomesData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 583.03, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 48.68, 2);
  }
  
  expect(result.assetData.length).toBe(5);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 24000, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', -1844.64, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('Joe(incomeTax)/Cash');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', -2108.33, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 208.33, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 1137.61, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 535.53, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 48.68, 2);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(4);
  expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 584.21, 2);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (incomeTax)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 1900, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.taxData[2].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 1846.28, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 18409.08, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 92.68, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 1044.93, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.taxData[3].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[3].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 153.72, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 1690.92, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
});

it('handle PDB generator tax income no SS with cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"4000",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2021",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"TeachersPensionScheme",
        "ERA":0,
        "TYPE":"Defined Benefits",
        "DETAILS":{
          "VALUE":"10",
          "VALUE_SET":"1 Jan 2021",

          "INCOME_SOURCE":"javaJob1",
          "SALARY_SACRIFICED":"N",
          "CONTRIBUTION_AMOUNT":"0.5",
          "ACCRUAL":"0.02",

          "STOP_SOURCE":"1 Jan 2025",
          "START":"2 April 2023",
          "END":"2 April 2024",
          "GROWS_WITH_CPI":"Y",

          "TRANSFER_TO":"Jack",
          "TRANSFER_PROPORTION":"0.5",
          "TRANSFERRED_STOP":"2 May 2025",

          "TAX_LIABILITY":"Joe",
          "CATEGORY":"pension"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2021",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2027",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

  const result = makeChartDataFromEvaluations(
    model,
    viewSettings,
    evalsAndValues,
  );

  // printTestCodeForChart(result);

  // printAllLogs();

  expect(result.expensesData.length).toBe(0);
  expect(result.incomesData.length).toBe(3);
  expect(result.incomesData[0].item.NAME).toBe('javaJob1');
  {
  const chartPts = result.incomesData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 48000, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.incomesData[1].item.NAME).toBe('-PDB TeachersPensionScheme');
  {
  const chartPts = result.incomesData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 1137.61, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.incomesData[2].item.NAME).toBe('-PT TeachersPensionScheme');
  {
  const chartPts = result.incomesData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 583.03, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 48.68, 2);
  }
  
  expect(result.assetData.length).toBe(5);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 24000, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', -4724.64, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('Joe(incomeTax)/Cash');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', -2108.33, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 208.33, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-PDB TeachersPensionScheme/Cash');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 1137.61, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-PT TeachersPensionScheme/Cash');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 535.53, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 48.68, 2);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(4);
  expect(result.taxData[0].item.NAME).toBe('Jack income (net)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 584.21, 2);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (incomeTax)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 1900, -1);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.taxData[2].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[2].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 1606.28, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 15769.08, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 92.68, 2);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 1044.93, 2);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
  
  expect(result.taxData[3].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[3].chartDataPoints;
  expect(chartPts.length).toBe(6);
  expectChartData(chartPts, 0, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 1, 'Fri Apr 01 2022', 393.72, 2);
  expectChartData(chartPts, 2, 'Sat Apr 01 2023', 4330.92, 2);
  expectChartData(chartPts, 3, 'Mon Apr 01 2024', 0, -1);
  expectChartData(chartPts, 4, 'Tue Apr 01 2025', 0, -1);
  expectChartData(chartPts, 5, 'Wed Apr 01 2026', 0, -1);
  }
});

it('handle PDC generator low income no cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"250",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2020",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"ScottishWidows",
        "ERA":0,
        "TYPE":"Defined Contributions",
        "DETAILS":{
          "GROWS_WITH_CPI": "N",
          "GROWTH": "0",
          "VALUE": "1000",
          "TAX_LIABILITY": "Joe",
          "CATEGORY": "pension",
          "START": "2 April 2021",
          "STOP": "2 April 2022",
          "CRYSTALLIZE": "2 April 2023",
          "SS": "n",
          "INCOME_SOURCE": "javaJob1",
          "CONTRIBUTION_AMOUNT": "0.05",
          "EMP_CONTRIBUTION_AMOUNT": "0.05",
          "TRANSFER_TO": "Jack",
          "TRANSFER_DATE": "2 April 2024"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2020",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2025",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

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
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 3000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 3000, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData.length).toBe(8);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 3000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 2850, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('-PEN ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 1300, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -325, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-CPTaxFree ScottishWidows');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 325, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-CPTaxable ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -975, -1);
  }
  
  expect(result.assetData[5].item.NAME).toBe('-CPTaxable ScottishWidows/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[5].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 975, -1);
  }
  
  expect(result.assetData[6].item.NAME).toBe('-CPTaxable Joe.ScottishWidows/Cash');
  {
  const chartPts = result.assetData[6].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 975, -1);
  }
  
  expect(result.assetData[7].item.NAME).toBe('Joe(incomeTax)/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[7].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -975, -1);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(1);
  expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 250, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 2987.50, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 2612.50, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 975, -1);
  }  
});


it('handle PDC generator NI income no cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"900",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2020",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"ScottishWidows",
        "ERA":0,
        "TYPE":"Defined Contributions",
        "DETAILS":{
          "GROWS_WITH_CPI": "N",
          "GROWTH": "0",
          "VALUE": "1000",
          "TAX_LIABILITY": "Joe",
          "CATEGORY": "pension",
          "START": "2 April 2021",
          "STOP": "2 April 2022",
          "CRYSTALLIZE": "2 April 2023",
          "SS": "n",
          "INCOME_SOURCE": "javaJob1",
          "CONTRIBUTION_AMOUNT": "0.05",
          "EMP_CONTRIBUTION_AMOUNT": "0.05",
          "TRANSFER_TO": "Jack",
          "TRANSFER_DATE": "2 April 2024"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2020",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2025",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

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
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 10800, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10800, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData.length).toBe(9);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 10800, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10260, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -260.64, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -260.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('-PEN ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 2080, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -520, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-CPTaxFree ScottishWidows');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 520, -1);
  }
  
  expect(result.assetData[5].item.NAME).toBe('-CPTaxable ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[5].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1560, -1);
  }
  
  expect(result.assetData[6].item.NAME).toBe('-CPTaxable ScottishWidows/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[6].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.assetData[7].item.NAME).toBe('-CPTaxable Joe.ScottishWidows/Cash');
  {
  const chartPts = result.assetData[7].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.assetData[8].item.NAME).toBe('Joe(incomeTax)/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[8].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1560, -1);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(2);
  expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 878.28, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10494.36, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 9166.08, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 21.72, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 260.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 238.92, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }  
});

it('handle PDC generator NI income SS no cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"900",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2020",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"ScottishWidows",
        "ERA":0,
        "TYPE":"Defined Contributions",
        "DETAILS":{
          "GROWS_WITH_CPI": "N",
          "GROWTH": "0",
          "VALUE": "1000",
          "TAX_LIABILITY": "Joe",
          "CATEGORY": "pension",
          "START": "2 April 2021",
          "STOP": "2 April 2022",
          "CRYSTALLIZE": "2 April 2023",
          "SS": "y",
          "INCOME_SOURCE": "javaJob1",
          "CONTRIBUTION_AMOUNT": "0.05",
          "EMP_CONTRIBUTION_AMOUNT": "0.05",
          "TRANSFER_TO": "Jack",
          "TRANSFER_DATE": "2 April 2024"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2020",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2025",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

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
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 10800, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10800, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData.length).toBe(10);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 10800, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10260.00, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -260.64, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -195.84, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('-PEN ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 1000, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-PSS ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 1080, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -520, -1);
  }
  
  expect(result.assetData[5].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-CPTaxFree ScottishWidows');
  {
  const chartPts = result.assetData[5].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 520, -1);
  }
  
  expect(result.assetData[6].item.NAME).toBe('-CPTaxable ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[6].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1560, -1);
  }
  
  expect(result.assetData[7].item.NAME).toBe('-CPTaxable ScottishWidows/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[7].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.assetData[8].item.NAME).toBe('-CPTaxable Joe.ScottishWidows/Cash');
  {
  const chartPts = result.assetData[8].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.assetData[9].item.NAME).toBe('Joe(incomeTax)/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[9].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1560, -1);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(2);
  expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 878.28, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 10499.76, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 9225.48, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1560, -1);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 21.72, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 255.24, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 179.52, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
});


it('handle PDC generator tax income SS no cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"4000",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2020",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"ScottishWidows",
        "ERA":0,
        "TYPE":"Defined Contributions",
        "DETAILS":{
          "GROWS_WITH_CPI": "N",
          "GROWTH": "0",
          "VALUE": "1000",
          "TAX_LIABILITY": "Joe",
          "CATEGORY": "pension",
          "START": "2 April 2021",
          "STOP": "2 April 2022",
          "CRYSTALLIZE": "2 April 2023",
          "SS": "y",
          "INCOME_SOURCE": "javaJob1",
          "CONTRIBUTION_AMOUNT": "0.05",
          "EMP_CONTRIBUTION_AMOUNT": "0.05",
          "TRANSFER_TO": "Jack",
          "TRANSFER_DATE": "2 April 2024"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2020",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2025",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

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
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 48000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 48000, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData.length).toBe(11);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 48000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 45600.00, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -4724.64, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -4436.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('Joe(incomeTax)/Cash');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -6508.33, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -6620, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 208.33, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-PEN ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 1000, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-PSS ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 4800, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[5].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[5].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1450, -1);
  }
  
  expect(result.assetData[6].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-CPTaxFree ScottishWidows');
  {
  const chartPts = result.assetData[6].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1450, -1);
  }
  
  expect(result.assetData[7].item.NAME).toBe('-CPTaxable ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[7].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -4350, -1);
  }
  
  expect(result.assetData[8].item.NAME).toBe('-CPTaxable ScottishWidows/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[8].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.assetData[9].item.NAME).toBe('-CPTaxable Joe.ScottishWidows/Cash');
  {
  const chartPts = result.assetData[9].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.assetData[10].item.NAME).toBe('Joe(incomeTax)/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[10].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -4350, -1);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(3);
  expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 7060, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 5860, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 3606.28, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 36039.36, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 31873.08, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 393.72, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 4700.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 4066.92, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
});

it('handle PDC generator tax income no SS no cpi', () => {
  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(chartViewType, chartDeltas);
  viewSettings.setViewSetting(viewFrequency, annually);

  const modelString = `
  {
    "name":"DPBModel",
    "expenses":[],
    "incomes":[
      {"NAME":"javaJob1",
      "ERA":0,
      "VALUE":"4000",
      "VALUE_SET":"02 April 2020",
      "START":"02 April 2020",
      "END":"02 April 2022",
      "CPI_IMMUNE":true,
      "LIABILITY":"Joe(incomeTax)/Joe(NI)",
      "RECURRENCE":"1m",
      "CATEGORY":"programming"
    }
    ],
    "assets":[
      {
        "NAME":"Cash",
        "CATEGORY":"",
        "START":"01 Jan 2017",
        "VALUE":"0.0",
        "QUANTITY":"",
        "GROWTH":"0.0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0.0",
        "ERA":0
      }
    ],
    "transactions":[],
    "settings":[
      {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
      {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},

      {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},

      {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
      {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},

      {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
    ],
    "monitors":[],
    "triggers":[],
    "generators":[
      {
        "NAME":"ScottishWidows",
        "ERA":0,
        "TYPE":"Defined Contributions",
        "DETAILS":{
          "GROWS_WITH_CPI": "N",
          "GROWTH": "0",
          "VALUE": "1000",
          "TAX_LIABILITY": "Joe",
          "CATEGORY": "pension",
          "START": "2 April 2021",
          "STOP": "2 April 2022",
          "CRYSTALLIZE": "2 April 2023",
          "SS": "n",
          "INCOME_SOURCE": "javaJob1",
          "CONTRIBUTION_AMOUNT": "0.05",
          "EMP_CONTRIBUTION_AMOUNT": "0.05",
          "TRANSFER_TO": "Jack",
          "TRANSFER_DATE": "2 April 2024"
        }
      }
    ],
    "version":13
  }
  `;
  const model = makeModelFromJSONString(modelString);

  setSetting(
    model.settings,
    `Beginning of view range`,
    "April 1 2020",
    viewType,
  );
  setSetting(
    model.settings,
    `End of view range`,
    "April 1 2025",
    viewType,
  );

  const evalsAndValues = getTestEvaluations(
    model,
  );

  // log(evalsAndValues.todaysAssetValues);
  // log(evalsAndValues.todaysDebtValues);
  // log(evalsAndValues.todaysExpenseValues);
  // log(evalsAndValues.todaysIncomeValues);
  // log(evalsAndValues.todaysSettingValues);

  // printTestCodeForEvals(evalsAndValues.evaluations);

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
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 48000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 48000, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData.length).toBe(10);
  expect(result.assetData[0].item.NAME).toBe('javaJob1/Cash');
  {
  const chartPts = result.assetData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 48000, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 45600.00, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[1].item.NAME).toBe('Joe(NI)/Cash');
  {
  const chartPts = result.assetData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -4724.64, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -4724.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[2].item.NAME).toBe('Joe(incomeTax)/Cash');
  {
  const chartPts = result.assetData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', -6508.33, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', -6620, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 208.33, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[3].item.NAME).toBe('-PEN ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[3].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 5800, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.assetData[4].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[4].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -1450, -1);
  }
  
  expect(result.assetData[5].item.NAME).toBe('-CPTaxFreeM ScottishWidows/-CPTaxFree ScottishWidows');
  {
  const chartPts = result.assetData[5].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 1450, -1);
  }
  
  expect(result.assetData[6].item.NAME).toBe('-CPTaxable ScottishWidows/-PEN ScottishWidows');
  {
  const chartPts = result.assetData[6].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -4350, -1);
  }
  
  expect(result.assetData[7].item.NAME).toBe('-CPTaxable ScottishWidows/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[7].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.assetData[8].item.NAME).toBe('-CPTaxable Joe.ScottishWidows/Cash');
  {
  const chartPts = result.assetData[8].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.assetData[9].item.NAME).toBe('Joe(incomeTax)/-CPTaxable Joe.ScottishWidows');
  {
  const chartPts = result.assetData[9].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 0, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 0, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', -4350, -1);
  }
  
  expect(result.debtData.length).toBe(0);
  expect(result.taxData.length).toBe(3);
  expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
  {
  const chartPts = result.taxData[0].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 0, -1);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 7060, -1);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 5860, -1);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
  
  expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
  {
  const chartPts = result.taxData[1].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 3606.28, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 36015.36, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 31609.08, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 4350, -1);
  }
  
  expect(result.taxData[2].item.NAME).toBe('Joe income (NI)');
  {
  const chartPts = result.taxData[2].chartDataPoints;
  expect(chartPts.length).toBe(5);
  expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
  expectChartData(chartPts, 1, 'Thu Apr 01 2021', 393.72, 2);
  expectChartData(chartPts, 2, 'Fri Apr 01 2022', 4724.64, 2);
  expectChartData(chartPts, 3, 'Sat Apr 01 2023', 4330.92, 2);
  expectChartData(chartPts, 4, 'Mon Apr 01 2024', 0, -1);
  }
});
