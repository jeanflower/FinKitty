// to allow final-scoping blocks for auto-generated code
/* eslint-disable no-lone-blocks */

import {
  CASH_ASSET_NAME,
  allItems,
  annually,
  assetChartFocus,
  chartViewType,
  birthDate,
  constType,
  cpi,
  cpiHint,
  crystallizedPension,
  custom,
  expenseChartFocus,
  incomeChartFocus,
  incomeTax,
  liquidateAsset,
  monthly,
  revalueAsset,
  revalueExp,
  revalueInc,
  revalueSetting,
  roiEnd,
  roiStart,
  separator,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxableBenefit,
  viewDetail,
  viewFrequency,
  viewType,
  adjustableType,
} from "../../localization/stringConstants";
import {
  AssetOrDebtVal,
  ModelData,
  ExpenseVal,
  IncomeVal,
  SettingVal,
  Setting,
  Expense,
  Income,
  Asset,
  Item,
} from "../../types/interfaces";
import {
  log,
  printDebug,
  showObj,
  suppressLogs,
  unSuppressLogs,
} from "../../utils/utils";
import {
  isHistorical,
  makeRevalueName,
  markForUndo,
  revertToUndoModel,
  setNonsenseSetting,
  setROI,
  setSetting,
} from "../../models/modelUtils";
import {
  billAndBenExampleData,
  emptyModel,
  mortgageSwitchExampleData,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
  transactionFromUndefinedModel,
  transactionToUndefinedModel,
} from "../../models/exampleModels";
import { makeChartDataFromEvaluations } from "../../models/charting";
import {
  getModelFutureExpense2,
  defaultTestViewSettings,
  getTestEvaluations,
  printTestCodeForEvals,
  expectEvals,
  printTestCodeForChart,
  expectChartData,
  getnetincLabel,
  getICLabel,
  getModelCrystallizedPension,
  getMinimalModelCopySettings,
} from "./algoTestUtils";
import { getCategory } from "../../models/category";
import { simpleSetting } from "../../models/exampleSettings";
import { minimalModel, getMinimalModelCopy } from "../../models/minimalModel";
import { defaultModelSettings } from "../../models/testModel";
import {
  makeModelFromJSON,
} from "../../models/modelFromJSON";
import { ViewSettings } from "../../utils/viewUtils";
import { deleteItemsFromModelInternal } from "../../utils/appActions";
import { isATransaction } from "../../models/modelQueries";

/* global it */
/* global expect */
/* global describe */

log;
printDebug;
printTestCodeForEvals;
printTestCodeForChart;
showObj;

describe("evaluations tests", () => {
  it("should ignore future expenses A", () => {
    const modelAndRoi = getModelFutureExpense2();
    const model = modelAndRoi.model;
    const viewSettings = defaultTestViewSettings();

    setSetting(
      model.settings,
      `Today's value focus date`,
      "Jan 1 2017",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(model);
    /*
    log(evalsAndValues.todaysAssetValues);
    log(evalsAndValues.todaysDebtValues);
    log(evalsAndValues.todaysExpenseValues);
    log(evalsAndValues.todaysIncomeValues);
    log(evalsAndValues.todaysSettingValues);
    */

    expect(evalsAndValues.todaysAssetValues.size).toEqual(0);
    expect(evalsAndValues.todaysDebtValues.size).toEqual(0);
    expect(evalsAndValues.todaysExpenseValues.size).toEqual(1);
    const PhonE = [...evalsAndValues.todaysExpenseValues.keys()].find((s) => {
      return s.NAME === "Phon";
    });
    expect(PhonE).toBeDefined();
    if (PhonE) {
      expect(evalsAndValues.todaysExpenseValues.get(PhonE)).toEqual({
        expenseVal: 0,
        category: "",
        expenseFreq: "1m",
        hasStarted: false,
        hasEnded: false,
      });
    }
    expect(evalsAndValues.todaysIncomeValues.size).toEqual(0);
    expect(evalsAndValues.todaysSettingValues.size).toEqual(7);

    const cpiS = [...evalsAndValues.todaysSettingValues.keys()].find((s) => {
      return s.NAME === "cpi";
    });
    expect(cpiS).toBeDefined();
    if (cpiS) {
      expect(evalsAndValues.todaysSettingValues.get(cpiS)).toEqual({
        settingVal: "0",
      });
    }
    // log(showObj(evals));
    expect(evalsAndValues.evaluations.length).toBe(0);

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

  it("should apply cpi to next expense", () => {
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
          VALUE: "1",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month
    setSetting(
      model.settings,
      `Today's value focus date`,
      "Feb 3 2018",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    /*
    log(evalsAndValues.todaysAssetValues);
    log(evalsAndValues.todaysDebtValues);
    log(evalsAndValues.todaysExpenseValues);
    log(evalsAndValues.todaysIncomeValues);
    log(evalsAndValues.todaysSettingValues);
    */

    expect(evalsAndValues.todaysAssetValues.size).toEqual(0);
    expect(evalsAndValues.todaysDebtValues.size).toEqual(0);
    expect(evalsAndValues.todaysExpenseValues.size).toEqual(1);
    expect(evalsAndValues.todaysExpenseValues.size).toEqual(1);
    const PhonE = [...evalsAndValues.todaysExpenseValues.keys()].find((s) => {
      return s.NAME === "Phon";
    });
    expect(PhonE).toBeDefined();
    if (PhonE) {
      expect(
        evalsAndValues.todaysExpenseValues.get(PhonE)?.expenseVal,
      ).toBeCloseTo(1.01907);
      expect(evalsAndValues.todaysExpenseValues.get(PhonE)?.category).toEqual(
        "",
      );
      expect(
        evalsAndValues.todaysExpenseValues.get(PhonE)?.expenseFreq,
      ).toEqual("1m");
      expect(evalsAndValues.todaysExpenseValues.get(PhonE)?.hasStarted).toEqual(
        true,
      );
      expect(evalsAndValues.todaysExpenseValues.get(PhonE)?.hasEnded).toEqual(
        true,
      );
    }
    expect(evalsAndValues.todaysIncomeValues.size).toEqual(0);
    expect(evalsAndValues.todaysSettingValues.size).toEqual(7);
    const cpiS = [...evalsAndValues.todaysSettingValues.keys()].find((s) => {
      return s.NAME === "cpi";
    });
    expect(cpiS).toBeDefined();
    if (cpiS) {
      expect(evalsAndValues.todaysSettingValues.get(cpiS)).toEqual({
        settingVal: "12",
      });
    }

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Phon", "Thu Feb 01 2018", 1.01, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
      todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
      todaysIncomeValues: new Map<Income, IncomeVal>(),
      todaysExpenseValues: new Map<Expense, ExpenseVal>(),
      todaysSettingValues: new Map<Setting, SettingVal>(),
    });

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1.01, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should allow a zero expense", () => {
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
          VALUE: "1",
          VALUE_SET: "January 1 2018",
        },
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "February 2 2018",
          NAME: "Hols",
          VALUE: "0",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month
    setSetting(
      model.settings,
      `Today's value focus date`,
      "Feb 3 2018",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    /*
    log(evalsAndValues.todaysAssetValues);
    log(evalsAndValues.todaysDebtValues);
    log(evalsAndValues.todaysExpenseValues);
    log(evalsAndValues.todaysIncomeValues);
    log(evalsAndValues.todaysSettingValues);
    */

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "Hols", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 1, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 2, "Hols", "Thu Feb 01 2018", 0, -1);
    expectEvals(evals, 3, "Phon", "Thu Feb 01 2018", 1.01, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
      todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
      todaysIncomeValues: new Map<Income, IncomeVal>(),
      todaysExpenseValues: new Map<Expense, ExpenseVal>(),
      todaysSettingValues: new Map<Setting, SettingVal>(),
    });

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1.01, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should apply cpi to next 2m expense", () => {
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
          END: "March 2 2018",
          NAME: "Phon",
          VALUE: "1",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month
    setSetting(
      model.settings,
      `Today's value focus date`,
      "Feb 3 2018",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);

    expect(evalsAndValues.todaysAssetValues.size).toEqual(0);
    expect(evalsAndValues.todaysDebtValues.size).toEqual(0);
    expect(evalsAndValues.todaysExpenseValues.size).toEqual(1);
    const PhonE = [...evalsAndValues.todaysExpenseValues.keys()].find((s) => {
      return s.NAME === "Phon";
    });
    expect(PhonE).toBeDefined();
    if (PhonE) {
      expect(evalsAndValues.todaysExpenseValues.get(PhonE)).toEqual({
        expenseVal: 1.0190676230605213,
        category: "",
        expenseFreq: "2m",
        hasStarted: true,
        hasEnded: false,
      });
    }
    expect(evalsAndValues.todaysIncomeValues.size).toEqual(0);
    
    // for (const [key, value] of evalsAndValues.todaysSettingValues) {
    //   log(`evalsAndValues.todaysSettingValues contains entry ${showObj(key)} ${showObj(value)}`);
    // }

    expect(evalsAndValues.todaysSettingValues.size).toEqual(7);
    const cpiS = [...evalsAndValues.todaysSettingValues.keys()].find((s) => {
      return s.NAME === "cpi";
    });
    expect(cpiS).toBeDefined();
    if (cpiS) {
      expect(evalsAndValues.todaysSettingValues.get(cpiS)).toEqual({
        settingVal: "12",
      });
    }

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Phon", "Thu Mar 01 2018", 1.02, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
      todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
      todaysIncomeValues: new Map<Income, IncomeVal>(),
      todaysExpenseValues: new Map<Expense, ExpenseVal>(),
      todaysSettingValues: new Map<Setting, SettingVal>(),
    });

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1.019, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should apply cpi and absolute-revalue expense", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Phon",
          VALUE: "2",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of phone bill",
          TO: "Phon",
          TO_VALUE: "3.00",
          TO_ABSOLUTE: true,
          DATE: "March 1 2018",
          TYPE: revalueExp,
        },
        {
          NAME: "Revalue cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "Feb 02 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
      ],
    };
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, "cpi", "Fri Feb 02 2018", 12, -1);
    expectEvals(evals, 1, "Phon", "Mon Jan 01 2018", 2, -1);
    expectEvals(evals, 2, "Phon", "Thu Feb 01 2018", 2.02, 2);
    expectEvals(evals, 3, "cpi", "Fri Feb 02 2018", 0, -1);
    expectEvals(evals, 4, "Phon", "Thu Mar 01 2018", 2.04, 2);
    expectEvals(evals, 5, "Phon", "Thu Mar 01 2018", 3, -1);
    expectEvals(evals, 6, "Phon", "Sun Apr 01 2018", 3, -1);
  });

  it("should apply cpi and proportional-revalue expense", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Phon",
          VALUE: "2",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of phone bill",
          TO: "Phon",
          TO_VALUE: "3.00",
          TO_ABSOLUTE: false,
          DATE: "March 1 2018",
          TYPE: revalueExp,
        },
        {
          NAME: "Revalue cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "Feb 02 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
      ],
    };
    setSetting(model.settings, cpi, "12.0", constType); // approx 1% per month

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, "cpi", "Fri Feb 02 2018", 12, -1); // date?
    expectEvals(evals, 1, "Phon", "Mon Jan 01 2018", 2, -1);
    expectEvals(evals, 2, "Phon", "Thu Feb 01 2018", 2.02, 2);
    expectEvals(evals, 3, "cpi", "Fri Feb 02 2018", 0, -1);
    expectEvals(evals, 4, "Phon", "Thu Mar 01 2018", 2.04, 2);
    expectEvals(evals, 5, "Phon", "Thu Mar 01 2018", 6.11, 2);
    expectEvals(evals, 6, "Phon", "Sun Apr 01 2018", 6.11, 2);
  });

  it("should ignore future expenses B", () => {
    const roi = {
      start: "Dec 1, 2016 00:00:00",
      end: "March 1, 2017 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "July 2 2018",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(0);
    // log(showObj(evals));

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
      todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
      todaysIncomeValues: new Map<Income, IncomeVal>(),
      todaysExpenseValues: new Map<Expense, ExpenseVal>(),
      todaysSettingValues: new Map<Setting, SettingVal>(),
    });

    // log(showObj(result));

    expect(result.expensesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
  });

  it("should one expense for 6m recurrence", () => {
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
          END: "February 2 2019",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "6m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(1);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.12, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it("should one expense for 6w recurrence", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "February 2 2019",
          NAME: "Phon",
          VALUE: "1.00",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "6w",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Phon", "Mon Feb 12 2018", 1.02, 2);
    expectEvals(evals, 2, "Phon", "Mon Mar 26 2018", 1.03, 2);
    expectEvals(evals, 3, "Phon", "Mon May 07 2018", 1.05, 2);
    expectEvals(evals, 4, "Phon", "Mon Jun 18 2018", 1.06, 2);
    expectEvals(evals, 5, "Phon", "Mon Jul 30 2018", 1.07, 2);
    expectEvals(evals, 6, "Phon", "Mon Sep 10 2018", 1.09, 2);
    expectEvals(evals, 7, "Phon", "Mon Oct 22 2018", 1.1, 2);
    expectEvals(evals, 8, "Phon", "Mon Dec 03 2018", 1.12, 2);
    expectEvals(evals, 9, "Phon", "Mon Jan 14 2019", 1.13, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(15);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1.02, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 1.03, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 1.05, 2);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 1.06, 2);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 1.07, 2);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 0, -1);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 1.09, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 1.1, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 1.12, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 1.13, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should one expense 6m recurrence set displaced", () => {
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
          END: "February 2 2019",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2017",
          RECURRENCE: "6m",
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultModelSettings(roi)],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of cpi 1",
          TO: "cpi",
          TO_VALUE: "10",
          DATE: "1 March 2017",
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: "Revalue of cpi 2",
          TO: "cpi",
          TO_VALUE: "0",
          DATE: "1 July 2017",
          TYPE: revalueSetting,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "cpi", "Wed Mar 01 2017", 0, -1);
    expectEvals(evals, 1, "cpi", "Wed Mar 01 2017", 10, -1);
    expectEvals(evals, 2, "cpi", "Sat Jul 01 2017", 0, -1);
    expectEvals(evals, 3, "Phon", "Mon Jan 01 2018", 12.51, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.51, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should two expense for 2m recurrence", () => {
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
          END: "February 2 2019",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    expectEvals(evals, 1, "Phon", "Thu Mar 01 2018", 12.35, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.12, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 12.35, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it("should two expense for 1y recurrence", () => {
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
          END: "February 2 2019",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "1y",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    expectEvals(evals, 1, "Phon", "Tue Jan 01 2019", 13.57, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.12, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 0, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 0, -1);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 0, -1);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 0, -1);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 13.57, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 0, -1);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
  });

  it(`shouldn't see effect of cpi for cpi-immune expense`, () => {
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
          VALUE_SET: "January 1 2017",
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "5.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Even though the value was set for 2017, the value persists into these 2018
    // dates because the expense is cpi-immune.
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    expectEvals(evals, 1, "Phon", "Thu Feb 01 2018", 12.12, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(4);
      // roi begins before the lifetime of the expense
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.12, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 12.12, 2);
      // roi extends beyond the lifetime of the expense
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it("should understand trigger for start value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "valueSetTrigger",
          ERA: undefined,
          DATE: "January 1 2017",
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "February 2 2018",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "valueSetTrigger",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Phon", "Mon Jan 01 2018", 12.12, 2);
    expectEvals(evals, 1, "Phon", "Thu Feb 01 2018", 12.12, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 12.12, 2);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 12.12, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
  });

  it("weekly incomes", () => {
    const numbers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ];
    const model: ModelData = {
      triggers: numbers
        .map((n) => {
          return {
            NAME: `J${n}StatePensionAge`,
            DATE: `${n} Apr 2036`,
            ERA: 1,
          };
        })
        .concat([
          { NAME: "Start", DATE: "06 Apr 2019", ERA: 1 },
          { NAME: "End", DATE: "01 Jan 2064", ERA: 1 },
        ]),
      expenses: [],
      incomes: numbers.map((n) => {
        return {
          NAME: `J${n}StatePension`,
          CATEGORY: "Pension",
          START: `J${n}StatePensionAge`,
          END: "End",
          VALUE: "203.85",
          VALUE_SET: "Wed Apr 06 2023",
          CPI_IMMUNE: false,
          RECURRENCE: "1w",
          LIABILITY: "J1(incomeTax)",
          ERA: 1,
        };
      }),
      transactions: [],
      assets: [
        {
          NAME: "Cash",
          START: "Start",
          VALUE: "15600",
          GROWTH: "-1.5",
          CPI_IMMUNE: true,
          CAN_BE_NEGATIVE: true,
          LIABILITY: "",
          PURCHASE_PRICE: "0",
          CATEGORY: "",
          IS_A_DEBT: false,
          QUANTITY: "",
          ERA: 1,
        },
      ],
      settings: [
        ...defaultModelSettings({
          start: "30 Dec 2020",
          end: "01 Jan 2025"
        }),
      ],
      monitors: [],
      generators: [],
      version: 11,
      name: "NeoTest",
      undoModel: undefined,
      redoModel: undefined,
    };

    const evalsAndValues = getTestEvaluations(model);

    // const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    /*
    for (const [key, val] of evalsAndValues.todaysIncomeValues) {
      console.log(
        `evalsAndValues.todaysIncome ${JSON.stringify(key)} ${JSON.stringify(val)}` 
      );
    }
    */
    //console.log(JSON.stringify(Array.from(evalsAndValues.todaysIncomeValues.keys())));
    //console.log(JSON.stringify(Array.from(evalsAndValues.todaysIncomeValues.values())));

    expect(Array.from(evalsAndValues.todaysIncomeValues.keys()).length).toEqual(
      numbers.length,
    );
    for (const [key, val] of evalsAndValues.todaysIncomeValues) {
      // if we shift the start moment forward too far some of these become 0
      // and we display 0 for 'today's value' in the table
      key;
      expect(val.incomeVal).toBe(203.85);
      // console.log(`val.incomeVal) = ${val.incomeVal}`);
    }
  });

  it("annual accumulation for incomes", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 1, "PRnd", "Thu Feb 01 2018", 5, -1);
    expectEvals(evals, 2, "PRnd", "Thu Mar 01 2018", 5, -1);
    expectEvals(evals, 3, "PRnd", "Sun Apr 01 2018", 5, -1);
    expectEvals(evals, 4, "PRnd", "Tue May 01 2018", 5, -1);
    expectEvals(evals, 5, "PRnd", "Fri Jun 01 2018", 5, -1);

    const viewSettings = defaultTestViewSettings();
    expect(viewSettings.setViewSetting(viewFrequency, annually)).toBe(true);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Sat Dec 01 2018", 30, 2);
    }
    expect(result.assetData.length).toBe(0);
  });

  it("recurrence at 2m for incomes", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 1, "PRnd", "Thu Mar 01 2018", 5, -1);
    expectEvals(evals, 2, "PRnd", "Tue May 01 2018", 5, -1);

    const viewSettings = defaultTestViewSettings();
    expect(viewSettings.setViewSetting(viewFrequency, annually)).toBe(true);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Sat Dec 01 2018", 15, 2);
    }
    expect(result.assetData.length).toBe(0);
  });

  it("income starts tomorrow", () => {
    const roi = {
      start: new Date().toDateString(),
      end: "tomorrow+2m",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "tomorrow",
          END: "tomorrow+2m",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: new Date().toDateString(),
          RECURRENCE: "1m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    //printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expect(evals[0].name).toBe("PRnd");
    expect(evals[1].name).toBe("PRnd");
    expect(evals[0].value).toBe(5);
    expect(evals[1].value).toBe(5);
  });

  it("recurrence at 2w for incomes", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2w",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForChart(result);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 1, "PRnd", "Mon Jan 15 2018", 5, -1);
    expectEvals(evals, 2, "PRnd", "Mon Jan 29 2018", 5, -1);
    expectEvals(evals, 3, "PRnd", "Mon Feb 12 2018", 5, -1);
    expectEvals(evals, 4, "PRnd", "Mon Feb 26 2018", 5, -1);
    expectEvals(evals, 5, "PRnd", "Mon Mar 12 2018", 5, -1);
    expectEvals(evals, 6, "PRnd", "Mon Mar 26 2018", 5, -1);
    expectEvals(evals, 7, "PRnd", "Mon Apr 09 2018", 5, -1);
    expectEvals(evals, 8, "PRnd", "Mon Apr 23 2018", 5, -1);
    expectEvals(evals, 9, "PRnd", "Mon May 07 2018", 5, -1);
    expectEvals(evals, 10, "PRnd", "Mon May 21 2018", 5, -1);
    expectEvals(evals, 11, "PRnd", "Mon Jun 04 2018", 5, -1);
    expectEvals(evals, 12, "PRnd", "Mon Jun 18 2018", 5, -1);

    const viewSettings = defaultTestViewSettings();
    expect(viewSettings.setViewSetting(viewFrequency, annually)).toBe(true);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Sat Dec 01 2018", 65, 2);
    }
    expect(result.assetData.length).toBe(0);
  });

  it("recurrence at 2y for incomes", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2025 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2y",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 1, "PRnd", "Wed Jan 01 2020", 5, -1);
    expectEvals(evals, 2, "PRnd", "Sat Jan 01 2022", 5, -1);
    expectEvals(evals, 3, "PRnd", "Mon Jan 01 2024", 5, -1);

    const viewSettings = defaultTestViewSettings();
    expect(viewSettings.setViewSetting(viewFrequency, annually)).toBe(true);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Sat Dec 01 2018", 5, -1);
      expectChartData(chartPts, 2, "Sun Dec 01 2019", 0, -1);
      expectChartData(chartPts, 3, "Tue Dec 01 2020", 5, -1);
      expectChartData(chartPts, 4, "Wed Dec 01 2021", 0, -1);
      expectChartData(chartPts, 5, "Thu Dec 01 2022", 5, -1);
      expectChartData(chartPts, 6, "Fri Dec 01 2023", 0, -1);
      expectChartData(chartPts, 7, "Sun Dec 01 2024", 5, -1);
    }

    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should understand cpi-immune income no growth", () => {
    const roi = {
      start: "Dec 1, 2018 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2019",
          END: "July 1 2019",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "PRnd", "Tue Jan 01 2019", 5, -1);
    // Even though income has growth, the next income is the same
    // as it's cpi-immune.
    expectEvals(evals, 1, "PRnd", "Fri Feb 01 2019", 5, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue Jan 01 2019", 5, -1);
      expectChartData(chartPts, 2, "Fri Feb 01 2019", 5, -1);
    }

    expect(result.assetData.length).toBe(0);
  });

  it("should understand cpi-impacted expense no growth", () => {
    const roi = {
      start: "Dec 1, 2018 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2019",
          END: "July 1 2019",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "PRnd", "Tue Jan 01 2019", 5.6, 2);
    expectEvals(evals, 1, "PRnd", "Fri Feb 01 2019", 5.65, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue Jan 01 2019", 5.6, 2);
      expectChartData(chartPts, 2, "Fri Feb 01 2019", 5.65, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should understand cpi income", () => {
    const roi = {
      start: "Dec 1, 2018 00:00:00",
      end: "June 1, 2020 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2019",
          END: "July 1 2021",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, "PRnd", "Tue Jan 01 2019", 5.6, 2);
    expectEvals(evals, 1, "PRnd", "Fri Feb 01 2019", 5.6, 2);
    expectEvals(evals, 2, "PRnd", "Fri Mar 01 2019", 5.6, 2);
    expectEvals(evals, 3, "PRnd", "Mon Apr 01 2019", 5.6, 2);
    expectEvals(evals, 4, "PRnd", "Wed May 01 2019", 6.27, 2);
    expectEvals(evals, 5, "PRnd", "Sat Jun 01 2019", 6.27, 2);
    expectEvals(evals, 6, "PRnd", "Mon Jul 01 2019", 6.27, 2);
    expectEvals(evals, 7, "PRnd", "Thu Aug 01 2019", 6.27, 2);
    expectEvals(evals, 8, "PRnd", "Sun Sep 01 2019", 6.27, 2);
    expectEvals(evals, 9, "PRnd", "Tue Oct 01 2019", 6.27, 2);
    expectEvals(evals, 10, "PRnd", "Fri Nov 01 2019", 6.27, 2);
    expectEvals(evals, 11, "PRnd", "Sun Dec 01 2019", 6.27, 2);
    expectEvals(evals, 12, "PRnd", "Wed Jan 01 2020", 6.27, 2);
    expectEvals(evals, 13, "PRnd", "Sat Feb 01 2020", 6.27, 2);
    expectEvals(evals, 14, "PRnd", "Sun Mar 01 2020", 6.27, 2);
    expectEvals(evals, 15, "PRnd", "Wed Apr 01 2020", 6.27, 2);
    expectEvals(evals, 16, "PRnd", "Fri May 01 2020", 7.02, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue Jan 01 2019", 5.6, 2);
      expectChartData(chartPts, 2, "Fri Feb 01 2019", 5.6, 2);
      expectChartData(chartPts, 3, "Fri Mar 01 2019", 5.6, 2);
      expectChartData(chartPts, 4, "Mon Apr 01 2019", 5.6, 2);
      expectChartData(chartPts, 5, "Wed May 01 2019", 6.27, 2);
      expectChartData(chartPts, 6, "Sat Jun 01 2019", 6.27, 2);
      expectChartData(chartPts, 7, "Mon Jul 01 2019", 6.27, 2);
      expectChartData(chartPts, 8, "Thu Aug 01 2019", 6.27, 2);
      expectChartData(chartPts, 9, "Sun Sep 01 2019", 6.27, 2);
      expectChartData(chartPts, 10, "Tue Oct 01 2019", 6.27, 2);
      expectChartData(chartPts, 11, "Fri Nov 01 2019", 6.27, 2);
      expectChartData(chartPts, 12, "Sun Dec 01 2019", 6.27, 2);
      expectChartData(chartPts, 13, "Wed Jan 01 2020", 6.27, 2);
      expectChartData(chartPts, 14, "Sat Feb 01 2020", 6.27, 2);
      expectChartData(chartPts, 15, "Sun Mar 01 2020", 6.27, 2);
      expectChartData(chartPts, 16, "Wed Apr 01 2020", 6.27, 2);
      expectChartData(chartPts, 17, "Fri May 01 2020", 7.02, 2);
    }

    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should understand cpi 2m income", () => {
    const roi = {
      start: "Dec 1, 2018 00:00:00",
      end: "June 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2019",
          END: "July 1 2019",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
          RECURRENCE: "2m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "PRnd", "Tue Jan 01 2019", 5.6, 2);
    expectEvals(evals, 1, "PRnd", "Fri Mar 01 2019", 5.6, 2);
    expectEvals(evals, 2, "PRnd", "Wed May 01 2019", 6.27, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 1, "Tue Jan 01 2019", 5.6, 2);
      expectChartData(chartPts, 2, "Fri Feb 01 2019", 0, -1);
      expectChartData(chartPts, 3, "Fri Mar 01 2019", 5.6, 2);
      expectChartData(chartPts, 4, "Mon Apr 01 2019", 0, -1);
      expectChartData(chartPts, 5, "Wed May 01 2019", 6.27, 2);
    }

    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("cash goes first", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "February 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Acash",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: "Zcash",
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

    expect(evals.length).toBe(3);
    // Evaluations are ordered so that Cash goes first.
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "Acash", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 2, "Zcash", "Mon Jan 01 2018", 500, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Acash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe("Zcash");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
    }
  });

  it("should apply growth to next two assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Estate",
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

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "Estate", "Mon Jan 01 2018", 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, "Estate", "Thu Feb 01 2018", 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, "Estate", "Thu Mar 01 2018", 509.53, 2);

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
    expect(result.assetData[0].item.NAME).toBe("Estate");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509.53, 2);
    }
  });

  it("should apply cpi to next two assets", () => {
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
          GROWTH: "0.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509.53, 2);
    }
  });

  it("transact from cash into cpi-affected asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Cash",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: "Svgs",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Saaa",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          FROM: "Cash",
          FROM_VALUE: "1",
          TO: "Svgs",
          TO_VALUE: "1",
          DATE: "January 10 2018",
          RECURRENCE: "1m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    expect(isATransaction("invest", model)).toBe(true);
    expect(isATransaction("invest2", model)).toBe(false);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "Saaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Svgs", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Cash", "Wed Jan 10 2018", 99, -1);
    expectEvals(evals, 4, "Svgs", "Wed Jan 10 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 99, -1);
    expectEvals(evals, 6, "Saaa", "Thu Feb 01 2018", 100.95, 2); // includes a CPI jump
    expectEvals(evals, 7, "Svgs", "Thu Feb 01 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 8, "Cash", "Sat Feb 10 2018", 98, -1);
    expectEvals(evals, 9, "Svgs", "Sat Feb 10 2018", 103.92, 2);
    expectEvals(evals, 10, "Cash", "Thu Mar 01 2018", 98, -1);
    expectEvals(evals, 11, "Saaa", "Thu Mar 01 2018", 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 12, "Svgs", "Thu Mar 01 2018", 103.92, 2); // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 13, "Cash", "Sat Mar 10 2018", 97, -1);
    expectEvals(evals, 14, "Svgs", "Sat Mar 10 2018", 105.9, 2); // includes 3 CPI jumps and 3 £1 investments

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 99, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 98, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Svgs");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 101.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 103.92, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("Saaa");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 101.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("transact zero from cash into cpi-affected asset monthly", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Svgs",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Saaa",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          FROM: "Saaa",
          FROM_VALUE: "0",
          TO: "Svgs",
          TO_VALUE: "0",
          DATE: "January 10 2018",
          RECURRENCE: "1m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, "Saaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "Svgs", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Saaa", "Wed Jan 10 2018", 100.95, 2);
    expectEvals(evals, 3, "Svgs", "Wed Jan 10 2018", 100.95, 2);
    expectEvals(evals, 4, "Saaa", "Thu Feb 01 2018", 100.95, 2);
    expectEvals(evals, 5, "Svgs", "Thu Feb 01 2018", 100.95, 2);
    expectEvals(evals, 6, "Saaa", "Sat Feb 10 2018", 101.91, 2);
    expectEvals(evals, 7, "Svgs", "Sat Feb 10 2018", 101.91, 2);
    expectEvals(evals, 8, "Saaa", "Thu Mar 01 2018", 101.91, 2);
    expectEvals(evals, 9, "Svgs", "Thu Mar 01 2018", 101.91, 2);
    expectEvals(evals, 10, "Saaa", "Sat Mar 10 2018", 102.87, 2);
    expectEvals(evals, 11, "Svgs", "Sat Mar 10 2018", 102.87, 2);
  });

  it("transact zero from cash into cpi-affected asset weekly", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Jan 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Svgs",
          START: "Dec 1 2017",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Saaa",
          START: "Dec 1 2017",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          FROM: "Saaa",
          FROM_VALUE: "10",
          TO: "Svgs",
          TO_VALUE: "10",
          DATE: "December 8 2017",
          RECURRENCE: "1w",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, "Saaa", "Fri Dec 01 2017", 100, -1);
    expectEvals(evals, 1, "Svgs", "Fri Dec 01 2017", 100, -1);
    expectEvals(evals, 2, "Saaa", "Fri Dec 08 2017", 90.95, 2);
    expectEvals(evals, 3, "Svgs", "Fri Dec 08 2017", 110.95, 2);
    expectEvals(evals, 4, "Saaa", "Fri Dec 15 2017", 80.95, 2);
    expectEvals(evals, 5, "Svgs", "Fri Dec 15 2017", 120.95, 2);
    expectEvals(evals, 6, "Saaa", "Fri Dec 22 2017", 70.95, 2);
    expectEvals(evals, 7, "Svgs", "Fri Dec 22 2017", 130.95, 2);
    expectEvals(evals, 8, "Saaa", "Fri Dec 29 2017", 60.95, 2);
    expectEvals(evals, 9, "Svgs", "Fri Dec 29 2017", 140.95, 2);
  });

  it("transact from cpi-affected cash into cpi-affected asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Cash",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Svgs",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Saaa",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          FROM: "Cash",
          FROM_VALUE: "1",
          TO: "Svgs",
          TO_VALUE: "1",
          DATE: "January 10 2018",
          RECURRENCE: "1m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "Saaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Svgs", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Cash", "Wed Jan 10 2018", 99.95, 2); // includes a CPI jump and a £1 drop
    expectEvals(evals, 4, "Svgs", "Wed Jan 10 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 99.95, 2);
    expectEvals(evals, 6, "Saaa", "Thu Feb 01 2018", 100.95, 2); // includes a CPI jump
    expectEvals(evals, 7, "Svgs", "Thu Feb 01 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 8, "Cash", "Sat Feb 10 2018", 99.9, 2); // includes 2 CPI jumps and 2 £1 drops
    expectEvals(evals, 9, "Svgs", "Sat Feb 10 2018", 103.92, 2);
    expectEvals(evals, 10, "Cash", "Thu Mar 01 2018", 99.9, 2);
    expectEvals(evals, 11, "Saaa", "Thu Mar 01 2018", 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 12, "Svgs", "Thu Mar 01 2018", 103.92, 2); // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 13, "Cash", "Sat Mar 10 2018", 99.85, 2);
    expectEvals(evals, 14, "Svgs", "Sat Mar 10 2018", 105.9, 2); // includes 3 CPI jumps and 3 £1 investments

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 99.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 99.9, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("Svgs");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 101.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 103.92, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("Saaa");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 101.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("transact zero into cpi-affected asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Cash",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: `${crystallizedPension} Svgs`,
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Conditional moveZero",
          FROM: `${crystallizedPension} Svgs`,
          FROM_VALUE: "0.0",
          TO: CASH_ASSET_NAME,
          TO_VALUE: "0.98",
          TO_ABSOLUTE: false,
          DATE: "January 10 2018",
          RECURRENCE: "1m",
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);

    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "-CPTaxable  Svgs", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Cash", "Thu Feb 01 2018", 100.95, 2);
    expectEvals(evals, 3, "-CPTaxable  Svgs", "Thu Feb 01 2018", 100.95, 2);
    expectEvals(evals, 4, "Cash", "Thu Mar 01 2018", 101.91, 2);
    expectEvals(evals, 5, "-CPTaxable  Svgs", "Thu Mar 01 2018", 101.91, 2);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 102.87, 2);
    expectEvals(evals, 7, "-CPTaxable  Svgs", "Sun Apr 01 2018", 102.87, 2);
    expectEvals(evals, 8, "Cash", "Tue May 01 2018", 103.85, 2);
    expectEvals(evals, 9, "-CPTaxable  Svgs", "Tue May 01 2018", 103.85, 2);
    expectEvals(evals, 10, "Cash", "Fri Jun 01 2018", 104.84, 2);
    expectEvals(evals, 11, "-CPTaxable  Svgs", "Fri Jun 01 2018", 104.84, 2);
  });

  it("transact from nowhere into cpi-affected asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Cash",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: "Svgs",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "Saaa",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          TO: "Svgs",
          TO_VALUE: "1",
          DATE: "January 10 2018",
          RECURRENCE: "1m",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "Saaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Svgs", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Svgs", "Wed Jan 10 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 4, "Cash", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 5, "Saaa", "Thu Feb 01 2018", 100.95, 2); // includes a CPI jump
    expectEvals(evals, 6, "Svgs", "Thu Feb 01 2018", 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 7, "Svgs", "Sat Feb 10 2018", 103.92, 2);
    expectEvals(evals, 8, "Cash", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 9, "Saaa", "Thu Mar 01 2018", 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 10, "Svgs", "Thu Mar 01 2018", 103.92, 2); // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 11, "Svgs", "Sat Mar 10 2018", 105.9, 2); // includes 3 CPI jumps and 3 £1 investments

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 100, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Svgs");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 101.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 103.92, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("Saaa");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100.95, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 101.91, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should understand CPI_IMMUNE for growing assets", () => {
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
          GROWTH: "12.0",
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509.53, 2);
    }
  });

  it("should apply growth and cpi for growing assets", () => {
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
          GROWTH: "12.0",
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    // Goes up for growth+cpi
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 509.044, 2);
    // Goes up for growth+cpi again
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 518.25, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 509.044, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 518.25, 2);
    }
  });

  it("should keep no-growth CPI_IMMUNE assets fixed", () => {
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
          GROWTH: "0.0",
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 500, -1);
    // Goes up for growth again
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 500, -1);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 500, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 500, -1);
    }
  });

  it("should understand triggers", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: "then",
          ERA: undefined,
          DATE: "January 1 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "then",
          VALUE: "500",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Asset started yusing a string trigger which has been converted into a date.
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
    }
  });

  it("should mix expense and income", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 2 2018",
          END: "July 2 2018",
          NAME: "Phon",
          VALUE: "12.12",
          VALUE_SET: "January 1 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    // Phon and PRnd both appear in date order.
    expectEvals(evals, 0, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 1, "Phon", "Tue Jan 02 2018", 12.12, 2);
    expectEvals(evals, 2, "PRnd", "Thu Feb 01 2018", 5, 2);
    expectEvals(evals, 3, "Phon", "Fri Feb 02 2018", 12.12, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 12.12, 2);
    }

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 5, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 5, -1);
    }

    expect(result.assetData.length).toBe(0);
  });

  it("has transaction adding cash", () => {
    const roi = {
      start: "Dec 1, 2017",
      end: "April 1, 2020",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "windfall",
          TO: CASH_ASSET_NAME,
          TO_VALUE: "1000",
          DATE: "January 2 2020",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "Dec 1, 2017",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(29);
    expectEvals(evals, 0, "Cash", "Fri Dec 01 2017", 500, -1);
    expectEvals(evals, 1, "Cash", "Mon Jan 01 2018", 504.74, 2);
    expectEvals(evals, 2, "Cash", "Thu Feb 01 2018", 509.53, 2);
    expectEvals(evals, 3, "Cash", "Thu Mar 01 2018", 514.37, 2);
    expectEvals(evals, 4, "Cash", "Sun Apr 01 2018", 519.25, 2);
    expectEvals(evals, 5, "Cash", "Tue May 01 2018", 524.18, 2);
    expectEvals(evals, 6, "Cash", "Fri Jun 01 2018", 529.15, 2);
    expectEvals(evals, 7, "Cash", "Sun Jul 01 2018", 534.17, 2);
    expectEvals(evals, 8, "Cash", "Wed Aug 01 2018", 539.24, 2);
    expectEvals(evals, 9, "Cash", "Sat Sep 01 2018", 544.36, 2);
    expectEvals(evals, 10, "Cash", "Mon Oct 01 2018", 549.52, 2);
    expectEvals(evals, 11, "Cash", "Thu Nov 01 2018", 554.74, 2);
    expectEvals(evals, 12, "Cash", "Sat Dec 01 2018", 560.0, 2);
    expectEvals(evals, 13, "Cash", "Tue Jan 01 2019", 565.31, 2);
    expectEvals(evals, 14, "Cash", "Fri Feb 01 2019", 570.68, 2);
    expectEvals(evals, 15, "Cash", "Fri Mar 01 2019", 576.09, 2);
    expectEvals(evals, 16, "Cash", "Mon Apr 01 2019", 581.56, 2);
    expectEvals(evals, 17, "Cash", "Wed May 01 2019", 587.08, 2);
    expectEvals(evals, 18, "Cash", "Sat Jun 01 2019", 592.65, 2);
    expectEvals(evals, 19, "Cash", "Mon Jul 01 2019", 598.27, 2);
    expectEvals(evals, 20, "Cash", "Thu Aug 01 2019", 603.95, 2);
    expectEvals(evals, 21, "Cash", "Sun Sep 01 2019", 609.68, 2);
    expectEvals(evals, 22, "Cash", "Tue Oct 01 2019", 615.46, 2);
    expectEvals(evals, 23, "Cash", "Fri Nov 01 2019", 621.3, 2);
    expectEvals(evals, 24, "Cash", "Sun Dec 01 2019", 627.2, 2);
    expectEvals(evals, 25, "Cash", "Wed Jan 01 2020", 633.15, 2);
    expectEvals(evals, 26, "Cash", "Thu Jan 02 2020", 1639.16, 2);
    expectEvals(evals, 27, "Cash", "Sat Feb 01 2020", 1639.16, 2);
    expectEvals(evals, 28, "Cash", "Sun Mar 01 2020", 1654.71, 2);
  });

  it("has transaction adding cash and savings", () => {
    const roi = {
      start: "Dec 1, 2017",
      end: "April 1, 2020",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "invest",
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "1000",
          TO: "savings",
          TO_VALUE: "1000",
          DATE: "January 2 2020",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "Dec 1, 2017",
          VALUE: "500000",
        },
        {
          ...simpleAsset,
          NAME: "savings",
          START: "Dec 1, 2017",
          VALUE: "50",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "12.0", constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(58);
    expectEvals(evals, 0, "Cash", "Fri Dec 01 2017", 500000, 2);
    expectEvals(evals, 1, "savings", "Fri Dec 01 2017", 50, 2);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 504744.4, 2);
    expectEvals(evals, 3, "savings", "Mon Jan 01 2018", 50.47, 2);
    expectEvals(evals, 4, "Cash", "Thu Feb 01 2018", 509533.81, 2);
    expectEvals(evals, 5, "savings", "Thu Feb 01 2018", 50.95, 2);
    expectEvals(evals, 6, "Cash", "Thu Mar 01 2018", 514368.67, 2);
    expectEvals(evals, 7, "savings", "Thu Mar 01 2018", 51.44, 2);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", 519249.41, 2);
    expectEvals(evals, 9, "savings", "Sun Apr 01 2018", 51.92, 2);
    expectEvals(evals, 10, "Cash", "Tue May 01 2018", 524176.46, 2);
    expectEvals(evals, 11, "savings", "Tue May 01 2018", 52.42, 2);
    expectEvals(evals, 12, "Cash", "Fri Jun 01 2018", 529150.26, 2);
    expectEvals(evals, 13, "savings", "Fri Jun 01 2018", 52.92, 2);
    expectEvals(evals, 14, "Cash", "Sun Jul 01 2018", 534171.26, 2);
    expectEvals(evals, 15, "savings", "Sun Jul 01 2018", 53.42, 2);
    expectEvals(evals, 16, "Cash", "Wed Aug 01 2018", 539239.9, 2);
    expectEvals(evals, 17, "savings", "Wed Aug 01 2018", 53.92, 2);
    expectEvals(evals, 18, "Cash", "Sat Sep 01 2018", 544356.64, 2);
    expectEvals(evals, 19, "savings", "Sat Sep 01 2018", 54.44, 2);
    expectEvals(evals, 20, "Cash", "Mon Oct 01 2018", 549521.92, 2);
    expectEvals(evals, 21, "savings", "Mon Oct 01 2018", 54.95, 2);
    expectEvals(evals, 22, "Cash", "Thu Nov 01 2018", 554736.22, 2);
    expectEvals(evals, 23, "savings", "Thu Nov 01 2018", 55.47, 2);
    expectEvals(evals, 24, "Cash", "Sat Dec 01 2018", 560000.0, 2);
    expectEvals(evals, 25, "savings", "Sat Dec 01 2018", 56.0, 2);
    expectEvals(evals, 26, "Cash", "Tue Jan 01 2019", 565313.72, 2);
    expectEvals(evals, 27, "savings", "Tue Jan 01 2019", 56.53, 2);
    expectEvals(evals, 28, "Cash", "Fri Feb 01 2019", 570677.87, 2);
    expectEvals(evals, 29, "savings", "Fri Feb 01 2019", 57.07, 2);
    expectEvals(evals, 30, "Cash", "Fri Mar 01 2019", 576092.91, 2);
    expectEvals(evals, 31, "savings", "Fri Mar 01 2019", 57.61, 2);
    expectEvals(evals, 32, "Cash", "Mon Apr 01 2019", 581559.34, 2);
    expectEvals(evals, 33, "savings", "Mon Apr 01 2019", 58.16, 2);
    expectEvals(evals, 34, "Cash", "Wed May 01 2019", 587077.64, 2);
    expectEvals(evals, 35, "savings", "Wed May 01 2019", 58.71, 2);
    expectEvals(evals, 36, "Cash", "Sat Jun 01 2019", 592648.29, 2);
    expectEvals(evals, 37, "savings", "Sat Jun 01 2019", 59.26, 2);
    expectEvals(evals, 38, "Cash", "Mon Jul 01 2019", 598271.81, 2);
    expectEvals(evals, 39, "savings", "Mon Jul 01 2019", 59.83, 2);
    expectEvals(evals, 40, "Cash", "Thu Aug 01 2019", 603948.69, 2);
    expectEvals(evals, 41, "savings", "Thu Aug 01 2019", 60.39, 2);
    expectEvals(evals, 42, "Cash", "Sun Sep 01 2019", 609679.43, 2);
    expectEvals(evals, 43, "savings", "Sun Sep 01 2019", 60.97, 2);
    expectEvals(evals, 44, "Cash", "Tue Oct 01 2019", 615464.55, 2);
    expectEvals(evals, 45, "savings", "Tue Oct 01 2019", 61.55, 2);
    expectEvals(evals, 46, "Cash", "Fri Nov 01 2019", 621304.57, 2);
    expectEvals(evals, 47, "savings", "Fri Nov 01 2019", 62.13, 2);
    expectEvals(evals, 48, "Cash", "Sun Dec 01 2019", 627200.0, 2);
    expectEvals(evals, 49, "savings", "Sun Dec 01 2019", 62.72, 2);
    expectEvals(evals, 50, "Cash", "Wed Jan 01 2020", 633151.37, 2);
    expectEvals(evals, 51, "savings", "Wed Jan 01 2020", 63.32, 2);
    expectEvals(evals, 52, "Cash", "Thu Jan 02 2020", 638159.21, 2);
    expectEvals(evals, 53, "savings", "Thu Jan 02 2020", 1063.92, 2);
    expectEvals(evals, 54, "Cash", "Sat Feb 01 2020", 638159.21, 2);
    expectEvals(evals, 55, "savings", "Sat Feb 01 2020", 1063.92, 2);
    expectEvals(evals, 56, "Cash", "Sun Mar 01 2020", 644214.57, 2);
    expectEvals(evals, 57, "savings", "Sun Mar 01 2020", 1074.01, 2);
  });

  it("has transaction impacting asset value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 2, "MyCa", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 3, "MyCa", "Thu Mar 01 2018", 400, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 400, -1);
    }
  });

  it("has transaction setting as from_value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "buy food",
          FROM: "MyCa",
          FROM_VALUE: "amountFrom",
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "amountFrom",
          ERA: undefined,
          VALUE: "100",
          HINT: "",
          TYPE: custom,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, "amountFrom", "Tue Jan 02 2018", 100, -1);
    expectEvals(evals, 1, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 2, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 3, "MyCa", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 4, "MyCa", "Thu Mar 01 2018", 400, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 400, -1);
    }
  });

  it("has transaction derived setting as from_value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "buy food",
          FROM: "MyCa",
          FROM_VALUE: "amountFrom",
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "amountFrom",
          ERA: undefined,
          VALUE: "10x",
          HINT: "",
          TYPE: custom,
        },
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "10",
          HINT: "",
          TYPE: custom,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, "x", "Tue Jan 02 2018", 10, -1);
    expectEvals(evals, 1, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 2, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 3, "MyCa", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 4, "MyCa", "Thu Mar 01 2018", 400, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 400, -1);
    }
  });

  it("has regular transaction impacting asset value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          DATE: "January 2 2018",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 2, "MyCa", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 3, "MyCa", "Fri Feb 02 2018", 300, -1);
    expectEvals(evals, 4, "MyCa", "Thu Mar 01 2018", 300, -1);
    expectEvals(evals, 5, "MyCa", "Fri Mar 02 2018", 200, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 300, -1);
    }
  });

  it("has regular transaction every 2 months", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          DATE: "January 2 2018",
          RECURRENCE: "2m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 2, "MyCa", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 3, "MyCa", "Thu Mar 01 2018", 400, -1);
    expectEvals(evals, 4, "MyCa", "Fri Mar 02 2018", 300, -1);
    expectEvals(evals, 5, "MyCa", "Sun Apr 01 2018", 300, -1);
    expectEvals(evals, 6, "MyCa", "Tue May 01 2018", 300, -1);
    expectEvals(evals, 7, "MyCa", "Wed May 02 2018", 200, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 400, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 300, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 300, -1);
    }
  });

  it("has regular transaction every 2 weeks", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          DATE: "January 2 2018",
          RECURRENCE: "2w",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 2, "MyCa", "Tue Jan 16 2018", 300, -1);
    expectEvals(evals, 3, "MyCa", "Tue Jan 30 2018", 200, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("has regular transaction every 2 years", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 1, 2023 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          DATE: "January 2 2018",
          RECURRENCE: "2y",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "MyCa", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 25, "MyCa", "Wed Jan 01 2020", 400, -1);
    expectEvals(evals, 26, "MyCa", "Thu Jan 02 2020", 300, -1);
    expectEvals(evals, 50, "MyCa", "Sat Jan 01 2022", 300, -1);
    expectEvals(evals, 51, "MyCa", "Sun Jan 02 2022", 200, -1);
    expectEvals(evals, 67, "MyCa", "Mon May 01 2023", 200, -1);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, monthly);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(66);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 25, "Wed Jan 01 2020", 400, -1);
      expectChartData(chartPts, 26, "Sat Feb 01 2020", 300, -1);
      expectChartData(chartPts, 49, "Sat Jan 01 2022", 300, -1);
      expectChartData(chartPts, 50, "Tue Feb 01 2022", 200, -1);
      expectChartData(chartPts, 65, "Mon May 01 2023", 200, -1);
    }
  });

  it("has regular transaction stop at stop date", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Monthly buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          TO: "Food",
          TO_VALUE: "80",
          DATE: "January 2 2018",
          STOP_DATE: "March 1 2018",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "320",
        },
        {
          ...simpleAsset,
          NAME: "Food",
          START: "January 1 2018",
          VALUE: "20",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, "Food", "Mon Jan 01 2018", 20, -1);
    expectEvals(evals, 1, "MyCa", "Mon Jan 01 2018", 320, -1);
    // apply regular transaction
    expectEvals(evals, 2, "MyCa", "Tue Jan 02 2018", 220, -1);
    expectEvals(evals, 3, "Food", "Tue Jan 02 2018", 100, -1);
    expectEvals(evals, 4, "Food", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 5, "MyCa", "Thu Feb 01 2018", 220, -1);
    // apply regular transaction
    expectEvals(evals, 6, "MyCa", "Fri Feb 02 2018", 120, -1);
    expectEvals(evals, 7, "Food", "Fri Feb 02 2018", 180, -1);
    expectEvals(evals, 8, "Food", "Thu Mar 01 2018", 180, -1);
    expectEvals(evals, 9, "MyCa", "Thu Mar 01 2018", 120, -1);
    // regular transaction has stopped
    expectEvals(evals, 10, "Food", "Sun Apr 01 2018", 180, -1);
    expectEvals(evals, 11, "MyCa", "Sun Apr 01 2018", 120, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 320, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 220, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 120, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 120, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Food");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 20, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 180, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 180, -1);
    }
  });

  it("has regular transaction stop when funds run out", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: "MyCa",
          FROM_VALUE: "100",
          TO: "Food",
          TO_VALUE: "80",
          DATE: "January 2 2018",
          STOP_DATE: "",
          RECURRENCE: "1m",
        },
        {
          ...simpleTransaction,
          NAME: "get paid",
          FROM_VALUE: "100",
          TO: "MyCa",
          TO_VALUE: "200",
          DATE: "April 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "220",
        },
        {
          ...simpleAsset,
          NAME: "Food",
          START: "January 1 2018",
          VALUE: "20",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, "Food", "Mon Jan 01 2018", 20, -1);
    expectEvals(evals, 1, "MyCa", "Mon Jan 01 2018", 220, -1);
    // apply regular payment
    expectEvals(evals, 2, "MyCa", "Tue Jan 02 2018", 120, -1);
    expectEvals(evals, 3, "Food", "Tue Jan 02 2018", 100, -1);
    expectEvals(evals, 4, "Food", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 5, "MyCa", "Thu Feb 01 2018", 120, -1);
    // apply regular payment
    expectEvals(evals, 6, "MyCa", "Fri Feb 02 2018", 20, -1);
    expectEvals(evals, 7, "Food", "Fri Feb 02 2018", 180, -1);
    expectEvals(evals, 8, "Food", "Thu Mar 01 2018", 180, -1);
    expectEvals(evals, 9, "MyCa", "Thu Mar 01 2018", 20, -1);
    // do not apply regular payment
    expectEvals(evals, 10, "Food", "Sun Apr 01 2018", 180, -1);
    expectEvals(evals, 11, "MyCa", "Sun Apr 01 2018", 20, -1);
    // get paid
    expectEvals(evals, 12, "MyCa", "Mon Apr 02 2018", 220, -1);
    expectEvals(evals, 13, "Food", "Tue May 01 2018", 180, -1);
    expectEvals(evals, 14, "MyCa", "Tue May 01 2018", 220, -1);
    // apply regular payment
    expectEvals(evals, 15, "MyCa", "Wed May 02 2018", 120, -1);
    expectEvals(evals, 16, "Food", "Wed May 02 2018", 260, -1);

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
    expect(result.assetData[0].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 220, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 120, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 20, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 20, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 220, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Food");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 20, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 100, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 180, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 180, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 180, -1);
    }
  });

  it("has 100% transaction from X to X", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "Stff",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "Stff", "Tue Jan 02 2018", 222, -1);
    expectEvals(evals, 1, "Stff", "Wed Jan 03 2018", 0, -1);
    expectEvals(evals, 2, "Stff", "Wed Jan 03 2018", 222, -1);
    expectEvals(evals, 3, "Stff", "Fri Feb 02 2018", 222, -1);
  });

  it("has 50% transaction from X to X", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "Stff",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "Stff", "Tue Jan 02 2018", 222, -1);
    expectEvals(evals, 1, "Stff", "Wed Jan 03 2018", 0, -1);
    expectEvals(evals, 2, "Stff", "Wed Jan 03 2018", 111, -1);
    expectEvals(evals, 3, "Stff", "Fri Feb 02 2018", 111, -1);
  });

  it("has 50%-sqrd transaction from X to X", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.5",
          TO: "Stff",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "Stff", "Tue Jan 02 2018", 222, -1);
    expectEvals(evals, 1, "Stff", "Wed Jan 03 2018", 111, -1);
    expectEvals(evals, 2, "Stff", "Wed Jan 03 2018", 166.5, -1);
    expectEvals(evals, 3, "Stff", "Fri Feb 02 2018", 166.5, -1);
  });

  it("has proportional transaction impacting asset value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "MyCa",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "10",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, "MyCa", "Mon Jan 01 2018", 10, -1);
    expectEvals(evals, 1, "Stff", "Tue Jan 02 2018", 222, -1);
    // Lose 100% of MyCa
    expectEvals(evals, 2, "Stff", "Wed Jan 03 2018", 0, -1);
    // Gain 50% of the transaction amount in MyCa
    expectEvals(evals, 3, "MyCa", "Wed Jan 03 2018", 121, -1);
    expectEvals(evals, 4, "MyCa", "Thu Feb 01 2018", 122.15, 2);
    expectEvals(evals, 5, "Stff", "Fri Feb 02 2018", 0, -1);

    // log(showObj(evals));
    /*
    const result = makeChartDataFromEvaluations(
      { start: makeDateFromString(roi.start), end: makeDateFromString(roi.end) },
      model,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Stff');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      // Stff appeared Jan2, sold Jan3, so never has a non-zero value in the chart.
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 122.15, 2);
    }
*/
  });

  it("transaction between assets at exact starts of assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "0.5",
          TO: "MyCa",
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 2 2018",
          VALUE: "10",
          GROWTH: "12",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, "MyCa", "Tue Jan 02 2018", 10, -1);
    expectEvals(evals, 1, "Stff", "Tue Jan 02 2018", 222, -1);
    expectEvals(evals, 2, "Stff", "Tue Jan 02 2018", 111, -1);
    expectEvals(evals, 3, "MyCa", "Tue Jan 02 2018", 121, -1);
    expectEvals(evals, 4, "MyCa", "Fri Feb 02 2018", 122.15, 2);
    expectEvals(evals, 5, "Stff", "Fri Feb 02 2018", 112.05, 2);

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
    expect(result.assetData[0].item.NAME).toBe("Stff");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 111, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("MyCa");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 121, -1);
    }
  });

  it("two expenses impact cash", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 2 2018",
          END: "February 1 2018",
          NAME: "Phon",
          VALUE: "100",
          VALUE_SET: "January 1 2018",
        },
        {
          ...simpleExpense,
          START: "January 3 2018",
          END: "February 2 2018",
          NAME: "Cars",
          VALUE: "10",
          VALUE_SET: "January 1 2018",
        },
      ],
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "Phon", "Tue Jan 02 2018", 100, -1);
    expectEvals(evals, 2, "Cash", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 3, "Cars", "Wed Jan 03 2018", 10, -1);
    expectEvals(evals, 4, "Cash", "Wed Jan 03 2018", 390, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 390, -1);
    expectEvals(evals, 6, "Cash", "Thu Mar 01 2018", 390, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe("Phon");
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(100);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.expensesData[1].item.NAME).toBe("Cars");
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(10);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(500);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(390);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(390);
    }
  });

  it("two incomes impact cash", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "January 2 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
        },
        {
          ...simpleExpense,
          START: "January 10 2018",
          END: "March 9 2018",
          NAME: "java",
          VALUE: "500",
          VALUE_SET: "January 1 2018",
          LIABILITY: "Joe" + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 505, -1);
    expectEvals(evals, 3, "java", "Wed Jan 10 2018", 500, -1);
    expectEvals(evals, 4, "Cash", "Wed Jan 10 2018", 1005, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 1005, -1);
    expectEvals(evals, 6, "java", "Sat Feb 10 2018", 500, -1);
    expectEvals(evals, 7, "Cash", "Sat Feb 10 2018", 1505, -1);
    expectEvals(evals, 8, "Cash", "Thu Mar 01 2018", 1505, -1);
    expectEvals(evals, 9, getnetincLabel("Joe"), "Thu Apr 05 2018", 1000, -1);

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
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(5);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(0);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.incomesData[1].item.NAME).toBe("java");
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(500);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(500);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe("Fri Dec 01 2017");
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe("Mon Jan 01 2018");
      expect(chartPts[1].y).toBe(505);
      expect(chartPts[2].label).toBe("Thu Feb 01 2018");
      expect(chartPts[2].y).toBe(1005);
      expect(chartPts[3].label).toBe("Thu Mar 01 2018");
      expect(chartPts[3].y).toBe(1505);
    }
  });

  it("has monthly transaction creating cash debt", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Each month buy food",
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "100",
          DATE: "January 2 2018",
          RECURRENCE: "1m",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
          VALUE: "500",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(30);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "Cash", "Tue Jan 02 2018", 400, -1);
    expectEvals(evals, 2, "Cash", "Thu Feb 01 2018", 400, -1);
    expectEvals(evals, 3, "Cash", "Fri Feb 02 2018", 300, -1);
    expectEvals(evals, 4, "Cash", "Thu Mar 01 2018", 300, -1);
    expectEvals(evals, 5, "Cash", "Fri Mar 02 2018", 200, -1);
    expectEvals(evals, 6, "Cash", "Sun Apr 01 2018", 200, -1);
    expectEvals(evals, 7, "Cash", "Mon Apr 02 2018", 100, -1);
    expectEvals(evals, 8, "Cash", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 9, "Cash", "Wed May 02 2018", 0, -1);
    expectEvals(evals, 10, "Cash", "Fri Jun 01 2018", 0, -1);
    expectEvals(evals, 11, "Cash", "Sat Jun 02 2018", -100, -1);
    expectEvals(evals, 12, "Cash", "Sun Jul 01 2018", -100, -1);
    expectEvals(evals, 13, "Cash", "Mon Jul 02 2018", -200, -1);
    expectEvals(evals, 14, "Cash", "Wed Aug 01 2018", -200, -1);
    expectEvals(evals, 15, "Cash", "Thu Aug 02 2018", -300, -1);
    expectEvals(evals, 16, "Cash", "Sat Sep 01 2018", -300, -1);
    expectEvals(evals, 17, "Cash", "Sun Sep 02 2018", -400, -1);
    expectEvals(evals, 18, "Cash", "Mon Oct 01 2018", -400, -1);
    expectEvals(evals, 19, "Cash", "Tue Oct 02 2018", -500, -1);
    expectEvals(evals, 20, "Cash", "Thu Nov 01 2018", -500, -1);
    expectEvals(evals, 21, "Cash", "Fri Nov 02 2018", -600, -1);
    expectEvals(evals, 22, "Cash", "Sat Dec 01 2018", -600, -1);
    expectEvals(evals, 23, "Cash", "Sun Dec 02 2018", -700, -1);
    expectEvals(evals, 24, "Cash", "Tue Jan 01 2019", -700, -1);
    expectEvals(evals, 25, "Cash", "Wed Jan 02 2019", -800, -1);
    expectEvals(evals, 26, "Cash", "Fri Feb 01 2019", -800, -1);
    expectEvals(evals, 27, "Cash", "Sat Feb 02 2019", -900, -1);
    expectEvals(evals, 28, "Cash", "Fri Mar 01 2019", -900, -1);
    expectEvals(evals, 29, "Cash", "Sat Mar 02 2019", -1000, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 400, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 300, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 200, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 100, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", -100, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", -200, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", -300, -1);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", -400, -1);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", -500, -1);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", -600, -1);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", -700, -1);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", -800, -1);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", -900, -1);
    }
  });

  it("should apply income tax to some asset growth", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500000",
          GROWTH: "12",
          LIABILITY: "Joe" + incomeTax,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 1, "savings", "Mon Jan 01 2018", 500000, -1);
    expectEvals(evals, 2, "Cash", "Thu Feb 01 2018", 0, -1);
    expectEvals(evals, 3, "savings", "Thu Feb 01 2018", 504744.4, 2);
    expectEvals(evals, 4, "Cash", "Mon Feb 05 2018", -856.09, 2);
    expectEvals(evals, 5, "Cash", "Thu Mar 01 2018", -856.09, 2);
    expectEvals(evals, 6, "savings", "Thu Mar 01 2018", 509533.81, 2);
    expectEvals(evals, 7, "Cash", "Mon Mar 05 2018", -1730.18, 2);
    expectEvals(evals, 8, "Cash", "Sun Apr 01 2018", -1730.18, 2);
    expectEvals(evals, 9, "savings", "Sun Apr 01 2018", 514368.67, 2);
    expectEvals(evals, 10, "Cash", "Thu Apr 05 2018", -373.73, 2);
    expectEvals(evals, 11, "(incomeTax)", "Thu Apr 05 2018", 373.73, 2);
    expectEvals(
      evals,
      12,
      getnetincLabel("Joe"),
      "Thu Apr 05 2018",
      13994.94,
      2,
    );
    expectEvals(evals, 13, "Cash", "Tue May 01 2018", -373.73, 2);
    expectEvals(evals, 14, "savings", "Tue May 01 2018", 519249.41, 2);
    expectEvals(
      evals,
      15,
      getnetincLabel("Joe"),
      "Fri Apr 05 2019",
      4880.74,
      2,
    );

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500000, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504744.4, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509533.81, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 514368.67, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", 519249.41, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", -856.09, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -1730.18, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", -373.73, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 373.73, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 13994.94, 2);
    }
  });

  it("have two assets share the same growth rate", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "shareGrowth",
        },
        {
          ...simpleAsset,
          NAME: "Shr2",
          START: "January 1 2018",
          VALUE: "200",
          GROWTH: "shareGrowth",
        },
        {
          ...simpleAsset,
          NAME: "Shr3",
          START: "January 1 2018",
          VALUE: "200",
          GROWTH: "1.0",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "shareGrowth",
          VALUE: "100.0",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, "shareGrowth", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 1, "Shr1", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Shr2", "Mon Jan 01 2018", 200, -1);
    expectEvals(evals, 3, "Shr3", "Mon Jan 01 2018", 200, -1);
    expectEvals(evals, 4, "Shr1", "Thu Feb 01 2018", 105.95, 2);
    expectEvals(evals, 5, "Shr2", "Thu Feb 01 2018", 211.89, 2);
    expectEvals(evals, 6, "Shr3", "Thu Feb 01 2018", 200.17, 2);

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
    expect(result.assetData[0].item.NAME).toBe("Shr1");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 105.95, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("Shr2");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 200, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 211.89, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("Shr3");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 200, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 200.17, 2);
    }
  });

  it("have an asset use an indirect growth rate", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "shareGrowth",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "shareGrowth",
          VALUE: "shareGrowthVal",
        },
        {
          ...simpleSetting,
          NAME: "shareGrowthVal",
          VALUE: "100.0",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, "shareGrowthVal", "Fri Dec 01 2017", 100, -1);
    expectEvals(evals, 1, "shareGrowth", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "shareGrowthVal", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Shr1", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 4, "Shr1", "Thu Feb 01 2018", 105.95, 2);

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
    expect(result.assetData[0].item.NAME).toBe("Shr1");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 100, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 105.95, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue expense by proportion", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of phone bill",
          TO: "Phon",
          TO_VALUE: "2.00",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "February 5 2018",
          TYPE: revalueExp,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Phon",
          VALUE: "1.00",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 1, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 3, "Cash", "Mon Jan 01 2018", -1, -1);
    expectEvals(evals, 4, "Cash", "Thu Feb 01 2018", -1, -1);
    expectEvals(evals, 5, "Phon", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 6, "Cash", "Thu Feb 01 2018", -2, -1);
    expectEvals(evals, 7, "Phon", "Mon Feb 05 2018", 2, -1);
    expectEvals(evals, 8, "Cash", "Thu Mar 01 2018", -2, -1);
    expectEvals(evals, 9, "Phon", "Thu Mar 01 2018", 2, -1);
    expectEvals(evals, 10, "Cash", "Thu Mar 01 2018", -4, -1);
    expectEvals(evals, 11, "Phon", "Mon Mar 05 2018", 4, -1);
    expectEvals(evals, 12, "Cash", "Sun Apr 01 2018", -4, -1);
    expectEvals(evals, 13, "Phon", "Sun Apr 01 2018", 4, -1);
    expectEvals(evals, 14, "Cash", "Sun Apr 01 2018", -8, -1);
    expectEvals(evals, 15, "Phon", "Thu Apr 05 2018", 8, -1);
    expectEvals(evals, 16, "Cash", "Tue May 01 2018", -8, -1);
    expectEvals(evals, 17, "Phon", "Sat May 05 2018", 16, -1);
    expectEvals(evals, 18, "Cash", "Fri Jun 01 2018", -8, -1);
    expectEvals(evals, 19, "Phon", "Tue Jun 05 2018", 32, -1);
    expectEvals(evals, 20, "Cash", "Sun Jul 01 2018", -8, -1);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 2, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 4, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", -1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", -2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", -4, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -8, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", -8, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", -8, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", -8, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue income defined by setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of x",
          TO: "x",
          TO_VALUE: "2.00",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "February 5 2018",
          TYPE: revalueSetting,
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Incm",
          VALUE: "x",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "x", "Mon Feb 05 2018", 1, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Incm", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 6, "Incm", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", 2, -1);
    expectEvals(evals, 8, "x", "Mon Feb 05 2018", 2, -1);
    expectEvals(evals, 9, "Cash", "Thu Mar 01 2018", 2, -1);
    expectEvals(evals, 10, "Incm", "Thu Mar 01 2018", 2, -1);
    expectEvals(evals, 11, "Cash", "Thu Mar 01 2018", 4, -1);
    expectEvals(evals, 12, "x", "Mon Mar 05 2018", 4, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", 4, -1);
    expectEvals(evals, 14, "Incm", "Sun Apr 01 2018", 4, -1);
    expectEvals(evals, 15, "Cash", "Sun Apr 01 2018", 8, -1);
    expectEvals(evals, 16, "x", "Thu Apr 05 2018", 8, -1);
    expectEvals(evals, 17, "Cash", "Tue May 01 2018", 8, -1);
    expectEvals(evals, 18, "x", "Sat May 05 2018", 16, -1);
    expectEvals(evals, 19, "Cash", "Fri Jun 01 2018", 8, -1);
    expectEvals(evals, 20, "x", "Tue Jun 05 2018", 32, -1);
    expectEvals(evals, 21, "Cash", "Sun Jul 01 2018", 8, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("Incm");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 2, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 4, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 4, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 8, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 8, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 8, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 8, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue income defined by double setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of x",
          TO: "x",
          TO_VALUE: "2.00",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "February 5 2018",
          TYPE: revalueSetting,
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Incm",
          VALUE: "2x",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "x", "Mon Feb 05 2018", 1, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Incm", "Mon Jan 01 2018", 2, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", 2, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 2, -1);
    expectEvals(evals, 6, "Incm", "Thu Feb 01 2018", 2, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", 4, -1);
    expectEvals(evals, 8, "x", "Mon Feb 05 2018", 2, -1);
    expectEvals(evals, 9, "Cash", "Thu Mar 01 2018", 4, -1);
    expectEvals(evals, 10, "Incm", "Thu Mar 01 2018", 4, -1);
    expectEvals(evals, 11, "Cash", "Thu Mar 01 2018", 8, -1);
    expectEvals(evals, 12, "x", "Mon Mar 05 2018", 4, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", 8, -1);
    expectEvals(evals, 14, "Incm", "Sun Apr 01 2018", 8, -1);
    expectEvals(evals, 15, "Cash", "Sun Apr 01 2018", 16, -1);
    expectEvals(evals, 16, "x", "Thu Apr 05 2018", 8, -1);
    expectEvals(evals, 17, "Cash", "Tue May 01 2018", 16, -1);
    expectEvals(evals, 18, "x", "Sat May 05 2018", 16, -1);
    expectEvals(evals, 19, "Cash", "Fri Jun 01 2018", 16, -1);
    expectEvals(evals, 20, "x", "Tue Jun 05 2018", 32, -1);
    expectEvals(evals, 21, "Cash", "Sun Jul 01 2018", 16, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("Incm");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 2, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 4, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 8, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.expensesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 2, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 4, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 8, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 16, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 16, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 16, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 16, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue expense defined by setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of x",
          TO: "x",
          TO_VALUE: "2.00",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "February 5 2018",
          TYPE: revalueSetting,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Phon",
          VALUE: "x",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "x", "Fri Dec 01 2017", 1, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", -1, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", -1, -1);
    expectEvals(evals, 6, "Phon", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", -2, -1);
    expectEvals(evals, 8, "x", "Mon Feb 05 2018", 2, -1);
    expectEvals(evals, 9, "Cash", "Thu Mar 01 2018", -2, -1);
    expectEvals(evals, 10, "Phon", "Thu Mar 01 2018", 2, -1);
    expectEvals(evals, 11, "Cash", "Thu Mar 01 2018", -4, -1);
    expectEvals(evals, 12, "x", "Mon Mar 05 2018", 4, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", -4, -1);
    expectEvals(evals, 14, "Phon", "Sun Apr 01 2018", 4, -1);
    expectEvals(evals, 15, "Cash", "Sun Apr 01 2018", -8, -1);
    expectEvals(evals, 16, "x", "Thu Apr 05 2018", 8, -1);
    expectEvals(evals, 17, "Cash", "Tue May 01 2018", -8, -1);
    expectEvals(evals, 18, "x", "Sat May 05 2018", 16, -1);
    expectEvals(evals, 19, "Cash", "Fri Jun 01 2018", -8, -1);
    expectEvals(evals, 20, "x", "Tue Jun 05 2018", 32, -1);
    expectEvals(evals, 21, "Cash", "Sun Jul 01 2018", -8, -1);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 2, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 4, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", -1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", -2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", -4, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -8, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", -8, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", -8, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", -8, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue expense defined by double setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of x",
          TO: "x",
          TO_VALUE: "2.00",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "February 5 2018",
          TYPE: revalueSetting,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "April 2 2018",
          NAME: "Phon",
          VALUE: "2x",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(22);
    expectEvals(evals, 0, "x", "Fri Dec 01 2017", 1, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Phon", "Mon Jan 01 2018", 2, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", -2, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", -2, -1);
    expectEvals(evals, 6, "Phon", "Thu Feb 01 2018", 2, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", -4, -1);
    expectEvals(evals, 8, "x", "Mon Feb 05 2018", 2, -1);
    expectEvals(evals, 9, "Cash", "Thu Mar 01 2018", -4, -1);
    expectEvals(evals, 10, "Phon", "Thu Mar 01 2018", 4, -1);
    expectEvals(evals, 11, "Cash", "Thu Mar 01 2018", -8, -1);
    expectEvals(evals, 12, "x", "Mon Mar 05 2018", 4, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", -8, -1);
    expectEvals(evals, 14, "Phon", "Sun Apr 01 2018", 8, -1);
    expectEvals(evals, 15, "Cash", "Sun Apr 01 2018", -16, -1);
    expectEvals(evals, 16, "x", "Thu Apr 05 2018", 8, -1);
    expectEvals(evals, 17, "Cash", "Tue May 01 2018", -16, -1);
    expectEvals(evals, 18, "x", "Sat May 05 2018", 16, -1);
    expectEvals(evals, 19, "Cash", "Fri Jun 01 2018", -16, -1);
    expectEvals(evals, 20, "x", "Tue Jun 05 2018", 32, -1);
    expectEvals(evals, 21, "Cash", "Sun Jul 01 2018", -16, -1);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 2, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 4, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 8, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(8);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", -2, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", -4, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", -8, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -16, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", -16, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", -16, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", -16, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue expense by setting proportion", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of phone bill",
          TO: "Phon",
          TO_VALUE: "g",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "May 5 2018",
          TYPE: revalueExp,
        },
        {
          ...simpleTransaction,
          NAME: "Revalue of g",
          TO: "g",
          TO_VALUE: "1.1",
          DATE: "August 4 2018",
          TYPE: revalueSetting,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "Jan 1 2018",
          END: "April 2 2019",
          NAME: "Phon",
          VALUE: "1.00",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "g",
          ERA: undefined,
          VALUE: "2.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, "g", "Sat May 05 2018", 2, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Phon", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", -1, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", -1, -1);
    expectEvals(evals, 6, "Phon", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", -2, -1);
    expectEvals(evals, 8, "Cash", "Thu Mar 01 2018", -2, -1);
    expectEvals(evals, 9, "Phon", "Thu Mar 01 2018", 1, -1);
    expectEvals(evals, 10, "Cash", "Thu Mar 01 2018", -3, -1);
    expectEvals(evals, 11, "Cash", "Sun Apr 01 2018", -3, -1);
    expectEvals(evals, 12, "Phon", "Sun Apr 01 2018", 1, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", -4, -1);
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", -4, -1);
    expectEvals(evals, 15, "Phon", "Tue May 01 2018", 1, -1);
    expectEvals(evals, 16, "Cash", "Tue May 01 2018", -5, -1);
    expectEvals(evals, 17, "Phon", "Sat May 05 2018", 2, -1);
    expectEvals(evals, 18, "Cash", "Fri Jun 01 2018", -5, -1);
    expectEvals(evals, 19, "Phon", "Fri Jun 01 2018", 2, -1);
    expectEvals(evals, 20, "Cash", "Fri Jun 01 2018", -7, -1);
    expectEvals(evals, 21, "Phon", "Tue Jun 05 2018", 4, -1);
    expectEvals(evals, 22, "Cash", "Sun Jul 01 2018", -7, -1);
    expectEvals(evals, 23, "Phon", "Sun Jul 01 2018", 4, -1);
    expectEvals(evals, 24, "Cash", "Sun Jul 01 2018", -11, -1);
    expectEvals(evals, 25, "Phon", "Thu Jul 05 2018", 8, -1);
    expectEvals(evals, 26, "Cash", "Wed Aug 01 2018", -11, -1);
    expectEvals(evals, 27, "Phon", "Wed Aug 01 2018", 8, -1);
    expectEvals(evals, 28, "Cash", "Wed Aug 01 2018", -19, -1);
    expectEvals(evals, 29, "g", "Sat Aug 04 2018", 1.1, 2);
    expectEvals(evals, 30, "Phon", "Sun Aug 05 2018", 8.8, 2);
    expectEvals(evals, 31, "Cash", "Sat Sep 01 2018", -19, -1);
    expectEvals(evals, 32, "Phon", "Sat Sep 01 2018", 8.8, 2);
    expectEvals(evals, 33, "Cash", "Sat Sep 01 2018", -27.8, 2);
    expectEvals(evals, 34, "Phon", "Wed Sep 05 2018", 9.68, 2);
    expectEvals(evals, 35, "Cash", "Mon Oct 01 2018", -27.8, 2);
    expectEvals(evals, 36, "Phon", "Mon Oct 01 2018", 9.68, 2);
    expectEvals(evals, 37, "Cash", "Mon Oct 01 2018", -37.48, 2);
    expectEvals(evals, 38, "Phon", "Fri Oct 05 2018", 10.65, 2);
    expectEvals(evals, 39, "Cash", "Thu Nov 01 2018", -37.48, 2);
    expectEvals(evals, 40, "Phon", "Thu Nov 01 2018", 10.65, 2);
    expectEvals(evals, 41, "Cash", "Thu Nov 01 2018", -48.13, 2);
    expectEvals(evals, 42, "Phon", "Mon Nov 05 2018", 11.71, 2);
    expectEvals(evals, 43, "Cash", "Sat Dec 01 2018", -48.13, 2);
    expectEvals(evals, 44, "Phon", "Sat Dec 01 2018", 11.71, 2);
    expectEvals(evals, 45, "Cash", "Sat Dec 01 2018", -59.84, 2);
    expectEvals(evals, 46, "Phon", "Wed Dec 05 2018", 12.88, 2);
    expectEvals(evals, 47, "Cash", "Tue Jan 01 2019", -59.84, 2);
    expectEvals(evals, 48, "Phon", "Tue Jan 01 2019", 12.88, 2);
    expectEvals(evals, 49, "Cash", "Tue Jan 01 2019", -72.72, 2);
    expectEvals(evals, 50, "Phon", "Sat Jan 05 2019", 14.17, 2);
    expectEvals(evals, 51, "Cash", "Fri Feb 01 2019", -72.72, 2);
    expectEvals(evals, 52, "Phon", "Fri Feb 01 2019", 14.17, 2);
    expectEvals(evals, 53, "Cash", "Fri Feb 01 2019", -86.9, 2);
    expectEvals(evals, 54, "Phon", "Tue Feb 05 2019", 15.59, 2);
    expectEvals(evals, 55, "Cash", "Fri Mar 01 2019", -86.9, 2);
    expectEvals(evals, 56, "Phon", "Fri Mar 01 2019", 15.59, 2);
    expectEvals(evals, 57, "Cash", "Fri Mar 01 2019", -102.49, 2);
    expectEvals(evals, 58, "Phon", "Tue Mar 05 2019", 17.15, 2);
    expectEvals(evals, 59, "Cash", "Mon Apr 01 2019", -102.49, 2);
    expectEvals(evals, 60, "Phon", "Mon Apr 01 2019", 17.15, 2);
    expectEvals(evals, 61, "Cash", "Mon Apr 01 2019", -119.64, 2);
    expectEvals(evals, 62, "Phon", "Fri Apr 05 2019", 18.86, 2);
    expectEvals(evals, 63, "Cash", "Wed May 01 2019", -119.64, 2);
    expectEvals(evals, 64, "Phon", "Sun May 05 2019", 20.75, 2);
    expectEvals(evals, 65, "Cash", "Sat Jun 01 2019", -119.64, 2);
    expectEvals(evals, 66, "Phon", "Wed Jun 05 2019", 22.82, 2);
    expectEvals(evals, 67, "Cash", "Mon Jul 01 2019", -119.64, 2);

    const viewSettings = defaultTestViewSettings();

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
      expect(chartPts.length).toBe(20);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 1, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 1, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 2, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 4, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 8, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 8.8, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 9.68, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 10.65, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 11.71, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 12.88, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 14.17, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 15.59, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 17.15, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", 0, -1);
      expectChartData(chartPts, 18, "Sat Jun 01 2019", 0, -1);
      expectChartData(chartPts, 19, "Mon Jul 01 2019", 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(20);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", -1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", -2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", -3, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -4, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", -5, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", -7, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", -11, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", -19, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", -27.8, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", -37.48, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", -48.13, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", -59.84, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", -72.72, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", -86.9, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", -102.49, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", -119.64, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", -119.64, 2);
      expectChartData(chartPts, 18, "Sat Jun 01 2019", -119.64, 2);
      expectChartData(chartPts, 19, "Mon Jul 01 2019", -119.64, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should revalue income by setting proportion", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of income",
          TO: "Incm",
          TO_VALUE: "g",
          TO_ABSOLUTE: false,
          RECURRENCE: "1m",
          DATE: "May 5 2018",
          TYPE: revalueInc,
        },
        {
          ...simpleTransaction,
          NAME: "Revalue of g",
          TO: "g",
          TO_VALUE: "1.1",
          DATE: "August 4 2018",
          TYPE: revalueSetting,
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "Jan 1 2018",
          END: "April 2 2019",
          NAME: "Incm",
          VALUE: "1.00",
          VALUE_SET: "January 1 2018",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "g",
          ERA: undefined,
          VALUE: "2.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, "g", "Sat May 05 2018", 2, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 2, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "Incm", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 5, "Cash", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 6, "Incm", "Thu Feb 01 2018", 1, -1);
    expectEvals(evals, 7, "Cash", "Thu Feb 01 2018", 2, -1);
    expectEvals(evals, 8, "Cash", "Thu Mar 01 2018", 2, -1);
    expectEvals(evals, 9, "Incm", "Thu Mar 01 2018", 1, -1);
    expectEvals(evals, 10, "Cash", "Thu Mar 01 2018", 3, -1);
    expectEvals(evals, 11, "Cash", "Sun Apr 01 2018", 3, -1);
    expectEvals(evals, 12, "Incm", "Sun Apr 01 2018", 1, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", 4, -1);
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 4, -1);
    expectEvals(evals, 15, "Incm", "Tue May 01 2018", 1, -1);
    expectEvals(evals, 16, "Cash", "Tue May 01 2018", 5, -1);
    expectEvals(evals, 17, "Incm", "Sat May 05 2018", 2, -1);
    expectEvals(evals, 18, "Cash", "Fri Jun 01 2018", 5, -1);
    expectEvals(evals, 19, "Incm", "Fri Jun 01 2018", 2, -1);
    expectEvals(evals, 20, "Cash", "Fri Jun 01 2018", 7, -1);
    expectEvals(evals, 21, "Incm", "Tue Jun 05 2018", 4, -1);
    expectEvals(evals, 22, "Cash", "Sun Jul 01 2018", 7, -1);
    expectEvals(evals, 23, "Incm", "Sun Jul 01 2018", 4, -1);
    expectEvals(evals, 24, "Cash", "Sun Jul 01 2018", 11, -1);
    expectEvals(evals, 25, "Incm", "Thu Jul 05 2018", 8, -1);
    expectEvals(evals, 26, "Cash", "Wed Aug 01 2018", 11, -1);
    expectEvals(evals, 27, "Incm", "Wed Aug 01 2018", 8, -1);
    expectEvals(evals, 28, "Cash", "Wed Aug 01 2018", 19, -1);
    expectEvals(evals, 29, "g", "Sat Aug 04 2018", 1.1, 2);
    expectEvals(evals, 30, "Incm", "Sun Aug 05 2018", 8.8, 2);
    expectEvals(evals, 31, "Cash", "Sat Sep 01 2018", 19, -1);
    expectEvals(evals, 32, "Incm", "Sat Sep 01 2018", 8.8, 2);
    expectEvals(evals, 33, "Cash", "Sat Sep 01 2018", 27.8, 2);
    expectEvals(evals, 34, "Incm", "Wed Sep 05 2018", 9.68, 2);
    expectEvals(evals, 35, "Cash", "Mon Oct 01 2018", 27.8, 2);
    expectEvals(evals, 36, "Incm", "Mon Oct 01 2018", 9.68, 2);
    expectEvals(evals, 37, "Cash", "Mon Oct 01 2018", 37.48, 2);
    expectEvals(evals, 38, "Incm", "Fri Oct 05 2018", 10.65, 2);
    expectEvals(evals, 39, "Cash", "Thu Nov 01 2018", 37.48, 2);
    expectEvals(evals, 40, "Incm", "Thu Nov 01 2018", 10.65, 2);
    expectEvals(evals, 41, "Cash", "Thu Nov 01 2018", 48.13, 2);
    expectEvals(evals, 42, "Incm", "Mon Nov 05 2018", 11.71, 2);
    expectEvals(evals, 43, "Cash", "Sat Dec 01 2018", 48.13, 2);
    expectEvals(evals, 44, "Incm", "Sat Dec 01 2018", 11.71, 2);
    expectEvals(evals, 45, "Cash", "Sat Dec 01 2018", 59.84, 2);
    expectEvals(evals, 46, "Incm", "Wed Dec 05 2018", 12.88, 2);
    expectEvals(evals, 47, "Cash", "Tue Jan 01 2019", 59.84, 2);
    expectEvals(evals, 48, "Incm", "Tue Jan 01 2019", 12.88, 2);
    expectEvals(evals, 49, "Cash", "Tue Jan 01 2019", 72.72, 2);
    expectEvals(evals, 50, "Incm", "Sat Jan 05 2019", 14.17, 2);
    expectEvals(evals, 51, "Cash", "Fri Feb 01 2019", 72.72, 2);
    expectEvals(evals, 52, "Incm", "Fri Feb 01 2019", 14.17, 2);
    expectEvals(evals, 53, "Cash", "Fri Feb 01 2019", 86.9, 2);
    expectEvals(evals, 54, "Incm", "Tue Feb 05 2019", 15.59, 2);
    expectEvals(evals, 55, "Cash", "Fri Mar 01 2019", 86.9, 2);
    expectEvals(evals, 56, "Incm", "Fri Mar 01 2019", 15.59, 2);
    expectEvals(evals, 57, "Cash", "Fri Mar 01 2019", 102.49, 2);
    expectEvals(evals, 58, "Incm", "Tue Mar 05 2019", 17.15, 2);
    expectEvals(evals, 59, "Cash", "Mon Apr 01 2019", 102.49, 2);
    expectEvals(evals, 60, "Incm", "Mon Apr 01 2019", 17.15, 2);
    expectEvals(evals, 61, "Cash", "Mon Apr 01 2019", 119.64, 2);
    expectEvals(evals, 62, "Incm", "Fri Apr 05 2019", 18.86, 2);
    expectEvals(evals, 63, "Cash", "Wed May 01 2019", 119.64, 2);
    expectEvals(evals, 64, "Incm", "Sun May 05 2019", 20.75, 2);
    expectEvals(evals, 65, "Cash", "Sat Jun 01 2019", 119.64, 2);
    expectEvals(evals, 66, "Incm", "Wed Jun 05 2019", 22.82, 2);
    expectEvals(evals, 67, "Cash", "Mon Jul 01 2019", 119.64, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("Incm");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(20);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 1, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 1, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 2, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 4, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 8, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 8.8, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 9.68, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 10.65, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 11.71, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 12.88, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 14.17, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 15.59, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 17.15, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", 0, -1);
      expectChartData(chartPts, 18, "Sat Jun 01 2019", 0, -1);
      expectChartData(chartPts, 19, "Mon Jul 01 2019", 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(20);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 2, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 3, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 4, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 5, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 7, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 11, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 19, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 27.8, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 37.48, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 48.13, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 59.84, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 72.72, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 86.9, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 102.49, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 119.64, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", 119.64, 2);
      expectChartData(chartPts, 18, "Sat Jun 01 2019", 119.64, 2);
      expectChartData(chartPts, 19, "Mon Jul 01 2019", 119.64, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should apply growth and one-off pay revalue to income", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "June 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: roi.start,
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2018",
          NAME: "PRnd",
          VALUE: "5",
          VALUE_SET: "January 1 2018",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of paper round",
          TO: "PRnd",
          TO_VALUE: "10", // pay rise!
          DATE: "March 5 2018",
          TYPE: revalueInc,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 1, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "PRnd", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 3, "Cash", "Mon Jan 01 2018", 5, -1);
    expectEvals(evals, 4, "Cash", "Thu Feb 01 2018", 5, -1);
    expectEvals(evals, 5, "PRnd", "Thu Feb 01 2018", 5, -1);
    expectEvals(evals, 6, "Cash", "Thu Feb 01 2018", 10, -1);
    expectEvals(evals, 7, "Cash", "Thu Mar 01 2018", 10, -1);
    expectEvals(evals, 8, "PRnd", "Thu Mar 01 2018", 5, -1);
    expectEvals(evals, 9, "Cash", "Thu Mar 01 2018", 15, -1);
    expectEvals(evals, 10, "PRnd", "Mon Mar 05 2018", 10, -1);
    expectEvals(evals, 11, "Cash", "Sun Apr 01 2018", 15, -1);
    expectEvals(evals, 12, "PRnd", "Sun Apr 01 2018", 10, -1);
    expectEvals(evals, 13, "Cash", "Sun Apr 01 2018", 25, -1);
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", 25, -1);
    expectEvals(evals, 15, "PRnd", "Tue May 01 2018", 10, -1);
    expectEvals(evals, 16, "Cash", "Tue May 01 2018", 35, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("PRnd");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 5, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 5, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 5, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 10, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 10, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 5, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 10, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 15, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 25, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 35, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("should apply growth and absolute-revalue asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
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
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of savings",
          TO: "savings",
          TO_VALUE: "300", // market crash!
          DATE: "March 5 2018",
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 3, "savings", "Mon Mar 05 2018", 300, -1);
    expectEvals(evals, 4, "savings", "Sun Apr 01 2018", 302.85, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509.53, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 302.85, 2);
    }
  });

  it("should apply growth and proportional-revalue asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
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
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of savings",
          TO: "savings",
          TO_VALUE: "0.5", // market crash!
          TO_ABSOLUTE: false,
          DATE: "March 5 2018",
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, "savings", "Mon Jan 01 2018", 500, -1);
    expectEvals(evals, 1, "savings", "Thu Feb 01 2018", 504.74, 2);
    expectEvals(evals, 2, "savings", "Thu Mar 01 2018", 509.53, 2);
    expectEvals(evals, 3, "savings", "Mon Mar 05 2018", 254.77, 2);
    expectEvals(evals, 4, "savings", "Sun Apr 01 2018", 257.18, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savings");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 500, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 504.74, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 509.53, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 257.18, 2);
    }
  });

  it("should apply growth and proportional-revalue multiple assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savingsA",
          START: "January 1 2018",
          VALUE: "600",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: "savingsB",
          START: "January 1 2018",
          VALUE: "400",
          GROWTH: "12",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of savings",
          TO: `savingsA${separator}savingsB`,
          TO_VALUE: "0.5", // market crash!
          TO_ABSOLUTE: false,
          DATE: "March 5 2018",
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, "savingsA", "Mon Jan 01 2018", 600, -1);
    expectEvals(evals, 1, "savingsB", "Mon Jan 01 2018", 400, -1);
    expectEvals(evals, 2, "savingsA", "Thu Feb 01 2018", 605.69, 2);
    expectEvals(evals, 3, "savingsB", "Thu Feb 01 2018", 403.8, 2);
    expectEvals(evals, 4, "savingsA", "Thu Mar 01 2018", 611.44, 2);
    expectEvals(evals, 5, "savingsB", "Thu Mar 01 2018", 407.63, 2);
    expectEvals(evals, 6, "savingsA", "Mon Mar 05 2018", 305.72, 2);
    expectEvals(evals, 7, "savingsB", "Mon Mar 05 2018", 203.81, 2);
    expectEvals(evals, 8, "savingsA", "Sun Apr 01 2018", 308.62, 2);
    expectEvals(evals, 9, "savingsB", "Sun Apr 01 2018", 205.75, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savingsA");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 600, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 605.69, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 611.44, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 308.62, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("savingsB");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 400, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 403.8, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 407.63, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 205.75, 2);
    }
  });

  it("should apply growth and proportional-revalue category of assets", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savingsA",
          START: "January 1 2018",
          VALUE: "600",
          GROWTH: "12",
          CATEGORY: "savings",
        },
        {
          ...simpleAsset,
          NAME: "savingsB",
          START: "January 1 2018",
          VALUE: "400",
          GROWTH: "12",
          CATEGORY: "savings",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of savings",
          TO: "savings",
          TO_VALUE: "0.5", // market crash!
          TO_ABSOLUTE: false,
          DATE: "March 5 2018",
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, "savingsA", "Mon Jan 01 2018", 600, -1);
    expectEvals(evals, 1, "savingsB", "Mon Jan 01 2018", 400, -1);
    expectEvals(evals, 2, "savingsA", "Thu Feb 01 2018", 605.69, 2);
    expectEvals(evals, 3, "savingsB", "Thu Feb 01 2018", 403.8, 2);
    expectEvals(evals, 4, "savingsA", "Thu Mar 01 2018", 611.44, 2);
    expectEvals(evals, 5, "savingsB", "Thu Mar 01 2018", 407.63, 2);
    expectEvals(evals, 6, "savingsA", "Mon Mar 05 2018", 305.72, 2);
    expectEvals(evals, 7, "savingsB", "Mon Mar 05 2018", 203.81, 2);
    expectEvals(evals, 8, "savingsA", "Sun Apr 01 2018", 308.62, 2);
    expectEvals(evals, 9, "savingsB", "Sun Apr 01 2018", 205.75, 2);

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
    expect(result.assetData[0].item.NAME).toBe("savingsA");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 600, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 605.69, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 611.44, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 308.62, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("savingsB");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 400, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 403.8, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 407.63, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 205.75, 2);
    }
  });

  function checkNonsenseSettingValue(key: string, value: string) {
    const modelAndRoi = getModelCrystallizedPension();

    const model = modelAndRoi.model;

    setNonsenseSetting(model.settings, key, value, viewType);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
  }

  it("check nonsense settings", () => {
    const settingsKeys = [
      birthDate, // '' or a string date
      viewDetail, // coarse or fine
      roiStart,
      roiEnd,
      chartViewType,
      cpi,
      assetChartFocus,
      expenseChartFocus,
      incomeChartFocus,
    ];

    for (const key of settingsKeys) {
      checkNonsenseSettingValue(key, "nonsense");
    }
  });

  it("asset growth should be a number or a numerical setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "100",
          GROWTH: "shareGrowth",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    {
    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    let evals = evalsAndValues.evaluations;

    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
    }

    setSetting(model.settings, "shareGrowth", "nonsense", constType);

    {
    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    let evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
    }
  });
  it("asset value should be a number", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "nonsense",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
  });

  it("trigger name cant have +", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a+",
          ERA: undefined,
          DATE: "1 Jan 2018",
        },
      ],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
  });

  it("trigger name cant have -", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "January 1 2018",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a-",
          ERA: undefined,
          DATE: "1 Jan 2018",
        },
      ],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
  });

  it("trigger 1 day before", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a-1d",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "2 Jan 2018",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger 1 day after", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a+1d",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "31 Dec 2017",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger 1 month before", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a-1m",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "1 Feb 2018",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger 1 month after", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a+1m",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "1 Dec 2017",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger 1 year before", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a-1y",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "1 Jan 2019",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger 1 year after", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "a+1y",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "1 Jan 2017",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger defined 1 day before", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "b",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "3 Jan 2018",
        },
        {
          NAME: "b",
          ERA: undefined,
          DATE: "a-2d",
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "Shr1", "Mon Jan 01 2018", 1, -1);
    expectEvals(evals, 1, "Shr1", "Thu Feb 01 2018", 1, -1);
  });

  it("trigger defined infinite recursion", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "Feb 7, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Shr1",
          START: "b",
          VALUE: "1.0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: "a",
          ERA: undefined,
          DATE: "b-1d",
        },
        {
          NAME: "b",
          ERA: undefined,
          DATE: "a-2d",
        },
      ],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    unSuppressLogs();
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);
  });

  it("negative value for asset which cant be negative", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "February 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: "Loan",
          CAN_BE_NEGATIVE: false,
          START: "January 2 2018",
          VALUE: "-70",
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 2 2018",
          VALUE: "150",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0); // failure of checks!
  });

  it("negative value allowed for from asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "February 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Move",
          FROM: "aaaa",
          FROM_VALUE: "100",
          TO: "bbbb",
          TO_VALUE: "1.0",
          TO_ABSOLUTE: false,
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "aaaa",
          CAN_BE_NEGATIVE: true,
          START: "January 2 2018",
          VALUE: "50",
        },
        {
          ...simpleAsset,
          NAME: "bbbb",
          START: "January 2 2018",
          VALUE: "0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "aaaa", "Tue Jan 02 2018", 50, -1);
    expectEvals(evals, 1, "bbbb", "Tue Jan 02 2018", 0, -1);
    expectEvals(evals, 2, "aaaa", "Tue Jan 02 2018", -50, -1);
    expectEvals(evals, 3, "bbbb", "Tue Jan 02 2018", 100, -1);

    const viewSettings = defaultTestViewSettings();

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

  it("negative value not allowed for from asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "February 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Move",
          FROM: "aaaa",
          FROM_VALUE: "100",
          TO: "bbbb",
          TO_VALUE: "1.0",
          TO_ABSOLUTE: false,
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "aaaa",
          START: "January 2 2018",
          VALUE: "50",
        },
        {
          ...simpleAsset,
          NAME: "bbbb",
          START: "January 2 2018",
          VALUE: "0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, "aaaa", "Tue Jan 02 2018", 50, -1);
    expectEvals(evals, 1, "bbbb", "Tue Jan 02 2018", 0, -1);
    // transaction does not occur

    const viewSettings = defaultTestViewSettings();

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

  it("negative tiny approx value allowed for from asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "February 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Move",
          FROM: "aaaa",
          FROM_VALUE: "50.0000001",
          TO: "bbbb",
          TO_VALUE: "1.0",
          TO_ABSOLUTE: false,
          DATE: "January 2 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "aaaa",
          START: "January 2 2018",
          VALUE: "50",
        },
        {
          ...simpleAsset,
          NAME: "bbbb",
          START: "January 2 2018",
          VALUE: "0",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    //printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, "aaaa", "Tue Jan 02 2018", 50, -1);
    expectEvals(evals, 1, "bbbb", "Tue Jan 02 2018", 0, -1);
    expectEvals(evals, 2, "aaaa", "Tue Jan 02 2018", 0, -1);
    expectEvals(evals, 3, "bbbb", "Tue Jan 02 2018", 50, -1);
    // transaction does occur

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("can use income tax on asset for taxable benefits", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const assetName = `${taxableBenefit} medical`;
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue of medical",
          TO: assetName,
          TO_VALUE: "100000",
          DATE: "March 5 2018",
          TYPE: revalueAsset,
        },
        {
          ...simpleTransaction,
          NAME: "Revalue medical asset",
          TO: assetName,
          TO_ABSOLUTE: false,
          TO_VALUE: "0",
          DATE: "March 6 2018",
          TYPE: revalueAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: assetName,
          START: "January 1 2018",
          VALUE: "0",
          GROWTH: "12",
          LIABILITY: "Joe" + incomeTax,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 1, `${assetName}`, "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "Cash", "Thu Feb 01 2018", 0, -1);
    expectEvals(evals, 3, `${assetName}`, "Thu Feb 01 2018", 0, -1);
    expectEvals(evals, 4, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 5, `${assetName}`, "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 6, `${assetName}`, "Mon Mar 05 2018", 100000, -1);
    expectEvals(evals, 7, "Cash", "Mon Mar 05 2018", -43541.66, 2);
    expectEvals(evals, 8, `${assetName}`, "Tue Mar 06 2018", 0, -1);
    expectEvals(evals, 9, "Cash", "Sun Apr 01 2018", -43541.66, 2);
    expectEvals(evals, 10, `${assetName}`, "Sun Apr 01 2018", 0, -1);
    expectEvals(evals, 11, "Cash", "Thu Apr 05 2018", -27500, -1);
    expectEvals(evals, 12, "(incomeTax)", "Thu Apr 05 2018", 27500, -1);
    expectEvals(evals, 13, getnetincLabel("Joe"), "Thu Apr 05 2018", 72500, -1);
    expectEvals(evals, 14, "Cash", "Tue May 01 2018", -27500, -1);
    expectEvals(evals, 15, `${assetName}`, "Tue May 01 2018", 0, -1);

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
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", -43541.66, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", -27500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 27500, -1);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 72500, -1);
    }
  });

  it("sell more things than we have", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 2, 2018 00:00:00",
    };
    const thingName = `thing`;
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "things",
          START: "January 1 2018",
          VALUE: thingName,
          QUANTITY: "10",
          GROWTH: "0.0",
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "January 1 2018",
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: "Sell all things",
          FROM: "things",
          FROM_VALUE: "12",
          TO: CASH_ASSET_NAME,
          TO_VALUE: "1.0",
          TO_ABSOLUTE: false,
          DATE: "Mar 10 2018",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: thingName,
          ERA: undefined,
          VALUE: "123",
          HINT: "something",
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, "thing", "Mon Jan 01 2018", 123, -1);
    expectEvals(evals, 1, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "quantitythings", "Mon Jan 01 2018", 10, -1);
    expectEvals(evals, 3, "things", "Mon Jan 01 2018", 1230, -1);
    expectEvals(evals, 4, "Cash", "Thu Feb 01 2018", 0, -1);
    expectEvals(evals, 5, "things", "Thu Feb 01 2018", 1230, -1);
    expectEvals(evals, 6, "Cash", "Thu Mar 01 2018", 0, -1);
    expectEvals(evals, 7, "things", "Thu Mar 01 2018", 1230, -1);
    expectEvals(evals, 8, "quantitythings", "Sat Mar 10 2018", 0, -1);
    expectEvals(evals, 9, "things", "Sat Mar 10 2018", 0, -1);
    expectEvals(evals, 10, "Cash", "Sat Mar 10 2018", 1230, -1);
    expectEvals(evals, 11, "Cash", "Sun Apr 01 2018", 1230, -1);
    expectEvals(evals, 12, "things", "Sun Apr 01 2018", 0, -1);
    expectEvals(evals, 13, "Cash", "Tue May 01 2018", 1230, -1);
    expectEvals(evals, 14, "things", "Tue May 01 2018", 0, -1);

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
    expect(result.assetData[0].item.NAME).toBe("things");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 1230, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1230, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1230, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 1230, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 1230, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("revalue a setting 01", () => {
    const roi = {
      start: "1 Jan 2019",
      end: "1 May 2019",
    };
    const viewSettings = defaultTestViewSettings();

    const model = makeModelFromJSON(
      `{
      "triggers":[],
      "expenses":[],
      "incomes":[],
      "assets":[
        {"NAME":"Cash","CATEGORY":"","START":"28 December 2018","VALUE":"100","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
        {"NAME":"ISAs","CATEGORY":"stock","START":"28 December 2018","VALUE":"100","GROWTH":"stockMarketGrowth","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
        {"NAME":"Stks","CATEGORY":"stock","START":"28 December 2018","VALUE":"100","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}
      ],
      "transactions":[],
      "settings":[
        {"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"},
        {"NAME":"cpi","VALUE":"12.0","HINT":"Annual rate of inflation","TYPE":"const"},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
        {"NAME":"End of view range","VALUE":"1 Jan 2021","HINT":"Date at the end of range to be plotted","TYPE":"view"},
        {"NAME":"stockMarketGrowth","VALUE":"12.0","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
        {"NAME": "Today's value focus date","VALUE": "","HINT": "Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE": "view"}
      ]
    }`,
      "revalue a setting 01",
    );

    model.transactions.push({
      NAME: "Revalue a setting",
      ERA: undefined,
      FROM: "",
      FROM_ABSOLUTE: true,
      FROM_VALUE: "",
      TO: "stockMarketGrowth",
      TO_ABSOLUTE: true,
      TO_VALUE: "0.0",
      DATE: "March 2019",
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: "revalueSetting",
      CATEGORY: "",
    });

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, "stockMarketGrowth", "Fri Dec 28 2018", 12, -1);
    expectEvals(evals, 1, "Cash", "Fri Dec 28 2018", 100, -1);
    expectEvals(evals, 2, "ISAs", "Fri Dec 28 2018", 100, -1);
    expectEvals(evals, 3, "Stks", "Fri Dec 28 2018", 100, -1);
    expectEvals(evals, 4, "Cash", "Mon Jan 28 2019", 100.95, 2); // go up by CPI
    expectEvals(evals, 5, "ISAs", "Mon Jan 28 2019", 100.95, 2); // go up by growth
    expectEvals(evals, 6, "Stks", "Mon Jan 28 2019", 101.81, 2); // go up by both
    expectEvals(evals, 7, "Cash", "Thu Feb 28 2019", 101.91, 2);
    expectEvals(evals, 8, "ISAs", "Thu Feb 28 2019", 101.91, 2);
    expectEvals(evals, 9, "Stks", "Thu Feb 28 2019", 103.65, 2);
    expectEvals(evals, 10, "stockMarketGrowth", "Fri Mar 01 2019", 0, -1);
    expectEvals(evals, 11, "Cash", "Thu Mar 28 2019", 102.87, 2);
    expectEvals(evals, 12, "ISAs", "Thu Mar 28 2019", 101.91, 2); // don't go up noe
    expectEvals(evals, 13, "Stks", "Thu Mar 28 2019", 104.63, 2);
    expectEvals(evals, 14, "Cash", "Sun Apr 28 2019", 103.85, 2); // by CPI
    expectEvals(evals, 15, "ISAs", "Sun Apr 28 2019", 101.91, 2); // don't go up noe
    expectEvals(evals, 16, "Stks", "Sun Apr 28 2019", 105.63, 2); // only CPI

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
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Tue Jan 01 2019", 100, -1);
      expectChartData(chartPts, 1, "Fri Feb 01 2019", 100.95, 2);
      expectChartData(chartPts, 2, "Fri Mar 01 2019", 101.91, 2);
      expectChartData(chartPts, 3, "Mon Apr 01 2019", 102.87, 2);
    }

    expect(result.assetData[1].item.NAME).toBe("ISAs");
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Tue Jan 01 2019", 100, -1);
      expectChartData(chartPts, 1, "Fri Feb 01 2019", 100.95, 2);
      expectChartData(chartPts, 2, "Fri Mar 01 2019", 101.91, 2);
      expectChartData(chartPts, 3, "Mon Apr 01 2019", 101.91, 2);
    }

    expect(result.assetData[2].item.NAME).toBe("Stks");
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, "Tue Jan 01 2019", 100, -1);
      expectChartData(chartPts, 1, "Fri Feb 01 2019", 101.81, 2);
      expectChartData(chartPts, 2, "Fri Mar 01 2019", 103.65, 2);
      expectChartData(chartPts, 3, "Mon Apr 01 2019", 104.63, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it("revalue a setting 02", () => {
    const revalueData = `
    {
    "triggers":[
    {"NAME":"GetRidOfCar","DATE":"31 Dec 2025"},
    {"NAME":"StopMainWork","DATE":"31 Dec 2050"}
    ],
    "expenses":[
    ],
    "incomes":[
    ],
    "assets":[
    {"NAME":"thing","VALUE":"stockvalue","QUANTITY":"100","START":"1 Jan 2019","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
    {"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}
    ],
    "transactions":[
    {"DATE":"1 Jan 2026","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 3","TO":"stockvalue","TO_ABSOLUTE":true,"TO_VALUE":"2026EUR","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
    {"NAME":"Revalue stockvalue 2","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"1 Jan 2024","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
    {"DATE":"1 Jan 2030","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 1","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.9","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
    {"NAME":"Revalue EUR 1","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"EUR","TO_ABSOLUTE":true,"TO_VALUE":"1.6","DATE":"1 Jan 2028","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""}],
    "settings":
    [
    {"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},
    {"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},
    {"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Type of view for chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Today\'s value focus date","VALUE":"","HINT":"Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE":"view"},
    {"NAME":"stockvalue","VALUE":"1000EUR","HINT":"","TYPE":"adjustable"},
    {"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},
    {"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},
    {"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},
    {"NAME":"Focus of assets chart","VALUE":"thing","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},
    {"NAME":"EUR","VALUE":"0.95","HINT":"","TYPE":"adjustable"},
    {"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
    {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
    {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
    {"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}
    ]
    }`;
    const viewSettings: ViewSettings = new ViewSettings([
      {
        NAME: "View frequencyHome",
        VALUE: "Annually",
      },
      {
        NAME: "View detail",
        VALUE: "Detailed",
      },
      {
        NAME: "Type of view for debt chart",
        VALUE: "val",
      },
      {
        NAME: "Type of view for chart",
        VALUE: "val",
      },
      {
        NAME: "Focus of incomes chart",
        VALUE: "All",
      },
      {
        NAME: "Focus of expenses chart",
        VALUE: "All",
      },
      {
        NAME: "Focus of debts chart",
        VALUE: "All",
      },
      {
        NAME: "Focus of assets chart",
        VALUE: "thing",
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
        VALUE: "Y",
      },
    ]);

    const model = makeModelFromJSON(revalueData, "revalue a setting 02");

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(583);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("thing");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, "Tue Jan 01 2019", 95000, -1);
      expectChartData(chartPts, 1, "Wed Jan 01 2020", 95000, -1);
      expectChartData(chartPts, 2, "Fri Jan 01 2021", 95000, -1);
      expectChartData(chartPts, 3, "Sat Jan 01 2022", 95000, -1);
      expectChartData(chartPts, 4, "Sun Jan 01 2023", 95000, -1);
      expectChartData(chartPts, 5, "Mon Jan 01 2024", 95000, -1);
      expectChartData(chartPts, 6, "Wed Jan 01 2025", 47500, -1);
      expectChartData(chartPts, 7, "Thu Jan 01 2026", 47500, -1);
      expectChartData(chartPts, 8, "Fri Jan 01 2027", 192470.0, 2);
      expectChartData(chartPts, 9, "Sat Jan 01 2028", 192470.0, 2);
      expectChartData(chartPts, 10, "Mon Jan 01 2029", 324160.0, 2);
      expectChartData(chartPts, 11, "Tue Jan 01 2030", 324160.0, 2);
      expectChartData(chartPts, 12, "Wed Jan 01 2031", 291744.0, 2);
      expectChartData(chartPts, 13, "Thu Jan 01 2032", 262569.6, 2);
      expectChartData(chartPts, 14, "Sat Jan 01 2033", 236312.64, 2);
      expectChartData(chartPts, 15, "Sun Jan 01 2034", 212681.38, 2);
      expectChartData(chartPts, 16, "Mon Jan 01 2035", 191413.24, 2);
      expectChartData(chartPts, 17, "Tue Jan 01 2036", 172271.91, 2);
      expectChartData(chartPts, 18, "Thu Jan 01 2037", 155044.72, 2);
      expectChartData(chartPts, 19, "Fri Jan 01 2038", 139540.25, 2);
      expectChartData(chartPts, 20, "Sat Jan 01 2039", 125586.23, 2);
      expectChartData(chartPts, 21, "Sun Jan 01 2040", 113027.6, 2);
      expectChartData(chartPts, 22, "Tue Jan 01 2041", 101724.84, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });
  it("revalue a setting cpi for asset growth", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "July 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "100.0",
          GROWTH: "0.0",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "saaaaaa",
          START: "January 1 2018",
          VALUE: "100.0",
          GROWTH: "rises",
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: "sbbbbbb",
          START: "January 1 2018",
          VALUE: "100.0",
          GROWTH: "x",
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: "scccccc",
          START: "January 1 2018",
          VALUE: "100.0",
          GROWTH: "rises",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: "Revalue grow cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "100.0",
          DATE: "May 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue drop cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "May 2019",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue grow x",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "x",
          TO_ABSOLUTE: true,
          TO_VALUE: "100.0",
          DATE: "May 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue drop x",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "x",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "May 2019",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue grow rises",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "rises",
          TO_ABSOLUTE: true,
          TO_VALUE: "100.0",
          DATE: "March 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue drop rises",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "rises",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "March 2019",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "0", constType);
    setSetting(model.settings, "x", "0", constType);
    setSetting(model.settings, "rises", "0", constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(85);
    expectEvals(evals, 0, "cpi", "Tue May 01 2018", 0, -1);
    expectEvals(evals, 1, "x", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "rises", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 3, "saaaaaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 4, "savings", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 5, "sbbbbbb", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 6, "scccccc", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 7, "saaaaaa", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 8, "savings", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 9, "sbbbbbb", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 10, "scccccc", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 11, "saaaaaa", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 12, "savings", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 13, "sbbbbbb", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 14, "scccccc", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 15, "rises", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 16, "saaaaaa", "Sun Apr 01 2018", 105.95, 2);
    expectEvals(evals, 17, "savings", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 18, "sbbbbbb", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 19, "scccccc", "Sun Apr 01 2018", 105.95, 2);
    expectEvals(evals, 20, "saaaaaa", "Tue May 01 2018", 112.25, 2);
    expectEvals(evals, 21, "savings", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 22, "sbbbbbb", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 23, "scccccc", "Tue May 01 2018", 112.25, 2);
    expectEvals(evals, 24, "cpi", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 25, "x", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 26, "saaaaaa", "Fri Jun 01 2018", 118.92, 2);
    expectEvals(evals, 27, "savings", "Fri Jun 01 2018", 105.95, 2);
    expectEvals(evals, 28, "sbbbbbb", "Fri Jun 01 2018", 109.59, 2);
    expectEvals(evals, 29, "scccccc", "Fri Jun 01 2018", 123.01, 2);
    expectEvals(evals, 30, "saaaaaa", "Sun Jul 01 2018", 125.99, 2);
    expectEvals(evals, 31, "savings", "Sun Jul 01 2018", 112.25, 2);
    expectEvals(evals, 32, "sbbbbbb", "Sun Jul 01 2018", 120.09, 2);
    expectEvals(evals, 33, "scccccc", "Sun Jul 01 2018", 134.8, 2);
    expectEvals(evals, 34, "saaaaaa", "Wed Aug 01 2018", 133.48, 2);
    expectEvals(evals, 35, "savings", "Wed Aug 01 2018", 118.92, 2);
    expectEvals(evals, 36, "sbbbbbb", "Wed Aug 01 2018", 131.61, 2);
    expectEvals(evals, 37, "scccccc", "Wed Aug 01 2018", 147.72, 2);
    expectEvals(evals, 38, "saaaaaa", "Sat Sep 01 2018", 141.42, 2);
    expectEvals(evals, 39, "savings", "Sat Sep 01 2018", 125.99, 2);
    expectEvals(evals, 40, "sbbbbbb", "Sat Sep 01 2018", 144.22, 2);
    expectEvals(evals, 41, "scccccc", "Sat Sep 01 2018", 161.89, 2);
    expectEvals(evals, 42, "saaaaaa", "Mon Oct 01 2018", 149.83, 2);
    expectEvals(evals, 43, "savings", "Mon Oct 01 2018", 133.48, 2);
    expectEvals(evals, 44, "sbbbbbb", "Mon Oct 01 2018", 158.05, 2);
    expectEvals(evals, 45, "scccccc", "Mon Oct 01 2018", 177.41, 2);
    expectEvals(evals, 46, "saaaaaa", "Thu Nov 01 2018", 158.74, 2);
    expectEvals(evals, 47, "savings", "Thu Nov 01 2018", 141.42, 2);
    expectEvals(evals, 48, "sbbbbbb", "Thu Nov 01 2018", 173.21, 2);
    expectEvals(evals, 49, "scccccc", "Thu Nov 01 2018", 194.42, 2);
    expectEvals(evals, 50, "saaaaaa", "Sat Dec 01 2018", 168.18, 2);
    expectEvals(evals, 51, "savings", "Sat Dec 01 2018", 149.83, 2);
    expectEvals(evals, 52, "sbbbbbb", "Sat Dec 01 2018", 189.81, 2);
    expectEvals(evals, 53, "scccccc", "Sat Dec 01 2018", 213.06, 2);
    expectEvals(evals, 54, "saaaaaa", "Tue Jan 01 2019", 178.18, 2);
    expectEvals(evals, 55, "savings", "Tue Jan 01 2019", 158.74, 2);
    expectEvals(evals, 56, "sbbbbbb", "Tue Jan 01 2019", 208.01, 2);
    expectEvals(evals, 57, "scccccc", "Tue Jan 01 2019", 233.48, 2);
    expectEvals(evals, 58, "saaaaaa", "Fri Feb 01 2019", 188.77, 2);
    expectEvals(evals, 59, "savings", "Fri Feb 01 2019", 168.18, 2);
    expectEvals(evals, 60, "sbbbbbb", "Fri Feb 01 2019", 227.95, 2);
    expectEvals(evals, 61, "scccccc", "Fri Feb 01 2019", 255.87, 2);
    expectEvals(evals, 62, "saaaaaa", "Fri Mar 01 2019", 200.0, 2);
    expectEvals(evals, 63, "savings", "Fri Mar 01 2019", 178.18, 2);
    expectEvals(evals, 64, "sbbbbbb", "Fri Mar 01 2019", 249.8, 2);
    expectEvals(evals, 65, "scccccc", "Fri Mar 01 2019", 280.4, 2);
    expectEvals(evals, 66, "rises", "Fri Mar 01 2019", 0, -1);
    expectEvals(evals, 67, "saaaaaa", "Mon Apr 01 2019", 200.0, 2);
    expectEvals(evals, 68, "savings", "Mon Apr 01 2019", 188.77, 2);
    expectEvals(evals, 69, "sbbbbbb", "Mon Apr 01 2019", 273.75, 2);
    expectEvals(evals, 70, "scccccc", "Mon Apr 01 2019", 297.07, 2);
    expectEvals(evals, 71, "saaaaaa", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 72, "savings", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 73, "sbbbbbb", "Wed May 01 2019", 300.0, 2);
    expectEvals(evals, 74, "scccccc", "Wed May 01 2019", 314.73, 2);
    expectEvals(evals, 75, "cpi", "Wed May 01 2019", 0, -1);
    expectEvals(evals, 76, "x", "Wed May 01 2019", 0, -1);
    expectEvals(evals, 77, "saaaaaa", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 78, "savings", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 79, "sbbbbbb", "Sat Jun 01 2019", 300.0, 2);
    expectEvals(evals, 80, "scccccc", "Sat Jun 01 2019", 314.73, 2);
    expectEvals(evals, 81, "saaaaaa", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 82, "savings", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 83, "sbbbbbb", "Mon Jul 01 2019", 300.0, 2);
    expectEvals(evals, 84, "scccccc", "Mon Jul 01 2019", 314.73, 2);
    // this value 314.73 is right;
    // if 1yr of cpi and rises are coincident then the asset triples
    // if 1yr of cpi and rises are separated then the asset quadruples
    // if 1yr of cpi and rises partially overlap then the asset increases
    // by some value between 3 and 4.
    // 10 months of overlap and 2 * 2 months of non-overlap makes for
    // 3^(10/12)*2^(2*2/12) = 3.1473...
  });

  it("revalue a setting cpi for income growth", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "August 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,

      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "PRnd",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: false,
        },
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "Paaa",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
        {
          ...simpleIncome,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "Pccc",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: "Revalue grow cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "100.0",
          DATE: "May 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue drop cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "May 2019",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "0", constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(63);
    expectEvals(evals, 0, "cpi", "Tue May 01 2018", 0, -1);
    expectEvals(evals, 1, "PRnd", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Paaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Pccc", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 4, "PRnd", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 5, "Paaa", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 6, "Pccc", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 7, "PRnd", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 8, "Paaa", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 9, "Pccc", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 10, "PRnd", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 11, "Paaa", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 12, "Pccc", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 13, "PRnd", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 14, "Paaa", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 15, "Pccc", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 16, "cpi", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 17, "PRnd", "Fri Jun 01 2018", 100, -1);
    expectEvals(evals, 18, "Paaa", "Fri Jun 01 2018", 100, -1);
    expectEvals(evals, 19, "Pccc", "Fri Jun 01 2018", 100, -1);
    expectEvals(evals, 20, "PRnd", "Sun Jul 01 2018", 100, -1);
    expectEvals(evals, 21, "Paaa", "Sun Jul 01 2018", 100, -1);
    expectEvals(evals, 22, "Pccc", "Sun Jul 01 2018", 100, -1);
    expectEvals(evals, 23, "PRnd", "Wed Aug 01 2018", 100, -1);
    expectEvals(evals, 24, "Paaa", "Wed Aug 01 2018", 100, -1);
    expectEvals(evals, 25, "Pccc", "Wed Aug 01 2018", 100, -1);
    expectEvals(evals, 26, "PRnd", "Sat Sep 01 2018", 100, -1);
    expectEvals(evals, 27, "Paaa", "Sat Sep 01 2018", 100, -1);
    expectEvals(evals, 28, "Pccc", "Sat Sep 01 2018", 100, -1);
    expectEvals(evals, 29, "PRnd", "Mon Oct 01 2018", 100, -1);
    expectEvals(evals, 30, "Paaa", "Mon Oct 01 2018", 100, -1);
    expectEvals(evals, 31, "Pccc", "Mon Oct 01 2018", 100, -1);
    expectEvals(evals, 32, "PRnd", "Thu Nov 01 2018", 100, -1);
    expectEvals(evals, 33, "Paaa", "Thu Nov 01 2018", 100, -1);
    expectEvals(evals, 34, "Pccc", "Thu Nov 01 2018", 100, -1);
    expectEvals(evals, 35, "PRnd", "Sat Dec 01 2018", 100, -1);
    expectEvals(evals, 36, "Paaa", "Sat Dec 01 2018", 100, -1);
    expectEvals(evals, 37, "Pccc", "Sat Dec 01 2018", 100, -1);
    expectEvals(evals, 38, "PRnd", "Tue Jan 01 2019", 100, -1);
    expectEvals(evals, 39, "Paaa", "Tue Jan 01 2019", 100, -1);
    expectEvals(evals, 40, "Pccc", "Tue Jan 01 2019", 100, -1);
    expectEvals(evals, 41, "PRnd", "Fri Feb 01 2019", 100, -1);
    expectEvals(evals, 42, "Paaa", "Fri Feb 01 2019", 100, -1);
    expectEvals(evals, 43, "Pccc", "Fri Feb 01 2019", 100, -1);
    expectEvals(evals, 44, "PRnd", "Fri Mar 01 2019", 100, -1);
    expectEvals(evals, 45, "Paaa", "Fri Mar 01 2019", 100, -1);
    expectEvals(evals, 46, "Pccc", "Fri Mar 01 2019", 100, -1);
    expectEvals(evals, 47, "PRnd", "Mon Apr 01 2019", 100, -1);
    expectEvals(evals, 48, "Paaa", "Mon Apr 01 2019", 100, -1);
    expectEvals(evals, 49, "Pccc", "Mon Apr 01 2019", 100, -1);
    expectEvals(evals, 50, "PRnd", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 51, "Paaa", "Wed May 01 2019", 100, -1);
    expectEvals(evals, 52, "Pccc", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 53, "cpi", "Wed May 01 2019", 0, -1);
    expectEvals(evals, 54, "PRnd", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 55, "Paaa", "Sat Jun 01 2019", 100, -1);
    expectEvals(evals, 56, "Pccc", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 57, "PRnd", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 58, "Paaa", "Mon Jul 01 2019", 100, -1);
    expectEvals(evals, 59, "Pccc", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 60, "PRnd", "Thu Aug 01 2019", 200.0, 2);
    expectEvals(evals, 61, "Paaa", "Thu Aug 01 2019", 100, -1);
    expectEvals(evals, 62, "Pccc", "Thu Aug 01 2019", 200.0, 2);
  });

  it("revalue a setting cpi for expense growth", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "August 2, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "PHon",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: false,
        },
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "Paaa",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
        {
          ...simpleExpense,
          START: "January 1 2018",
          END: "July 1 2025",
          NAME: "Pccc",
          VALUE: "100.0",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: "Revalue grow cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "100.0",
          DATE: "May 2018",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
        {
          NAME: "Revalue drop cpi",
          ERA: undefined,
          FROM: "",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: "0.0",
          DATE: "May 2019",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: "revalueSetting",
          CATEGORY: "",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "0", constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(63);
    expectEvals(evals, 0, "cpi", "Tue May 01 2018", 0, -1);
    expectEvals(evals, 1, "PHon", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 2, "Paaa", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 3, "Pccc", "Mon Jan 01 2018", 100, -1);
    expectEvals(evals, 4, "PHon", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 5, "Paaa", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 6, "Pccc", "Thu Feb 01 2018", 100, -1);
    expectEvals(evals, 7, "PHon", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 8, "Paaa", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 9, "Pccc", "Thu Mar 01 2018", 100, -1);
    expectEvals(evals, 10, "PHon", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 11, "Paaa", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 12, "Pccc", "Sun Apr 01 2018", 100, -1);
    expectEvals(evals, 13, "PHon", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 14, "Paaa", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 15, "Pccc", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 16, "cpi", "Tue May 01 2018", 100, -1);
    expectEvals(evals, 17, "PHon", "Fri Jun 01 2018", 105.95, 2);
    expectEvals(evals, 18, "Paaa", "Fri Jun 01 2018", 100, -1);
    expectEvals(evals, 19, "Pccc", "Fri Jun 01 2018", 105.95, 2);
    expectEvals(evals, 20, "PHon", "Sun Jul 01 2018", 112.25, 2);
    expectEvals(evals, 21, "Paaa", "Sun Jul 01 2018", 100, -1);
    expectEvals(evals, 22, "Pccc", "Sun Jul 01 2018", 112.25, 2);
    expectEvals(evals, 23, "PHon", "Wed Aug 01 2018", 118.92, 2);
    expectEvals(evals, 24, "Paaa", "Wed Aug 01 2018", 100, -1);
    expectEvals(evals, 25, "Pccc", "Wed Aug 01 2018", 118.92, 2);
    expectEvals(evals, 26, "PHon", "Sat Sep 01 2018", 125.99, 2);
    expectEvals(evals, 27, "Paaa", "Sat Sep 01 2018", 100, -1);
    expectEvals(evals, 28, "Pccc", "Sat Sep 01 2018", 125.99, 2);
    expectEvals(evals, 29, "PHon", "Mon Oct 01 2018", 133.48, 2);
    expectEvals(evals, 30, "Paaa", "Mon Oct 01 2018", 100, -1);
    expectEvals(evals, 31, "Pccc", "Mon Oct 01 2018", 133.48, 2);
    expectEvals(evals, 32, "PHon", "Thu Nov 01 2018", 141.42, 2);
    expectEvals(evals, 33, "Paaa", "Thu Nov 01 2018", 100, -1);
    expectEvals(evals, 34, "Pccc", "Thu Nov 01 2018", 141.42, 2);
    expectEvals(evals, 35, "PHon", "Sat Dec 01 2018", 149.83, 2);
    expectEvals(evals, 36, "Paaa", "Sat Dec 01 2018", 100, -1);
    expectEvals(evals, 37, "Pccc", "Sat Dec 01 2018", 149.83, 2);
    expectEvals(evals, 38, "PHon", "Tue Jan 01 2019", 158.74, 2);
    expectEvals(evals, 39, "Paaa", "Tue Jan 01 2019", 100, -1);
    expectEvals(evals, 40, "Pccc", "Tue Jan 01 2019", 158.74, 2);
    expectEvals(evals, 41, "PHon", "Fri Feb 01 2019", 168.18, 2);
    expectEvals(evals, 42, "Paaa", "Fri Feb 01 2019", 100, -1);
    expectEvals(evals, 43, "Pccc", "Fri Feb 01 2019", 168.18, 2);
    expectEvals(evals, 44, "PHon", "Fri Mar 01 2019", 178.18, 2);
    expectEvals(evals, 45, "Paaa", "Fri Mar 01 2019", 100, -1);
    expectEvals(evals, 46, "Pccc", "Fri Mar 01 2019", 178.18, 2);
    expectEvals(evals, 47, "PHon", "Mon Apr 01 2019", 188.77, 2);
    expectEvals(evals, 48, "Paaa", "Mon Apr 01 2019", 100, -1);
    expectEvals(evals, 49, "Pccc", "Mon Apr 01 2019", 188.77, 2);
    expectEvals(evals, 50, "PHon", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 51, "Paaa", "Wed May 01 2019", 100, -1);
    expectEvals(evals, 52, "Pccc", "Wed May 01 2019", 200.0, 2);
    expectEvals(evals, 53, "cpi", "Wed May 01 2019", 0, -1);
    expectEvals(evals, 54, "PHon", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 55, "Paaa", "Sat Jun 01 2019", 100, -1);
    expectEvals(evals, 56, "Pccc", "Sat Jun 01 2019", 200.0, 2);
    expectEvals(evals, 57, "PHon", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 58, "Paaa", "Mon Jul 01 2019", 100, -1);
    expectEvals(evals, 59, "Pccc", "Mon Jul 01 2019", 200.0, 2);
    expectEvals(evals, 60, "PHon", "Thu Aug 01 2019", 200.0, 2);
    expectEvals(evals, 61, "Paaa", "Thu Aug 01 2019", 100, -1);
    expectEvals(evals, 62, "Pccc", "Thu Aug 01 2019", 200.0, 2);
  });

  it("Generate taxable income from asset", () => {
    const roi = {
      start: "Dec 1, 2017",
      end: "May 02 2019",
    };
    const viewSettings = getMinimalModelCopySettings();

    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
      ...minimalModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: "Dec 1, 2017",
          VALUE: "0",
        },
        {
          ...simpleAsset,
          NAME: "NSI",
          START: "January 2 2018",
          VALUE: "1000000", // enough to trigger income tax
          GROWTH: "2",
          CPI_IMMUNE: false,
        },
      ],
      incomes: [
        ...minimalModel.incomes,
        {
          ...simpleIncome,
          NAME: "NSIinterest",
          START: "January 2 2018",
          END: "June 1, 2021",
          VALUE: "0.0012414NSI", // compounds to 0.015 over 12 months
          LIABILITY: `Joe${incomeTax}`,
          CPI_IMMUNE: true,
        },
      ],
    };

    setROI(model, roi);
    setSetting(model.settings, cpi, "2.0", cpiHint);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(84);
    expectEvals(evals, 0, "Cash", "Fri Dec 01 2017", 0, -1);
    expectEvals(evals, 1, "Cash", "Mon Jan 01 2018", 0, -1);
    expectEvals(evals, 2, "NSI", "Tue Jan 02 2018", 1000000, -1);
    expectEvals(evals, 3, "NSIinterest", "Tue Jan 02 2018", 1241.4, 2);
    expectEvals(evals, 4, "Cash", "Tue Jan 02 2018", 1241.4, 2);
    expectEvals(evals, 5, "Cash", "Fri Jan 05 2018", 1203.51, 2);
    expectEvals(evals, 6, "Cash", "Thu Feb 01 2018", 1203.51, 2);
    expectEvals(evals, 7, "NSI", "Fri Feb 02 2018", 1003273.74, 2);
    expectEvals(evals, 8, "NSIinterest", "Fri Feb 02 2018", 1245.46, 2);
    expectEvals(evals, 9, "Cash", "Fri Feb 02 2018", 2448.97, 2);
    expectEvals(evals, 10, "Cash", "Mon Feb 05 2018", 2412.27, 2);
    expectEvals(evals, 11, "Cash", "Thu Mar 01 2018", 2412.27, 2);
    expectEvals(evals, 12, "NSI", "Fri Mar 02 2018", 1006558.2, 2);
    expectEvals(evals, 13, "NSIinterest", "Fri Mar 02 2018", 1249.54, 2);
    expectEvals(evals, 14, "Cash", "Fri Mar 02 2018", 3661.81, 2);
    expectEvals(evals, 15, "Cash", "Mon Mar 05 2018", 3626.29, 2);
    expectEvals(evals, 16, "Cash", "Sun Apr 01 2018", 3626.29, 2);
    expectEvals(evals, 17, "NSI", "Mon Apr 02 2018", 1009853.41, 2);
    expectEvals(evals, 18, "NSIinterest", "Mon Apr 02 2018", 1253.63, 2);
    expectEvals(evals, 19, "Cash", "Mon Apr 02 2018", 4879.92, 2);
    expectEvals(evals, 20, "Joe income (net)", "Thu Apr 05 2018", 4990.04, 2);
    expectEvals(evals, 21, "Cash", "Tue May 01 2018", 4887.98, 2);
    expectEvals(evals, 22, "NSI", "Wed May 02 2018", 1013159.4, 2);
    expectEvals(evals, 23, "NSIinterest", "Wed May 02 2018", 1257.74, 2);
    expectEvals(evals, 24, "Cash", "Wed May 02 2018", 6145.72, 2);
    expectEvals(evals, 25, "Cash", "Sat May 05 2018", 6112.66, 2);
    expectEvals(evals, 26, "Cash", "Fri Jun 01 2018", 6112.66, 2);
    expectEvals(evals, 27, "NSI", "Sat Jun 02 2018", 1016476.22, 2);
    expectEvals(evals, 28, "NSIinterest", "Sat Jun 02 2018", 1261.85, 2);
    expectEvals(evals, 29, "Cash", "Sat Jun 02 2018", 7374.51, 2);
    expectEvals(evals, 30, "Cash", "Tue Jun 05 2018", 7342.66, 2);
    expectEvals(evals, 31, "Cash", "Sun Jul 01 2018", 7342.66, 2);
    expectEvals(evals, 32, "NSI", "Mon Jul 02 2018", 1019803.9, 2);
    expectEvals(evals, 33, "NSIinterest", "Mon Jul 02 2018", 1265.98, 2);
    expectEvals(evals, 34, "Cash", "Mon Jul 02 2018", 8608.64, 2);
    expectEvals(evals, 35, "Cash", "Thu Jul 05 2018", 8578.0, 2);
    expectEvals(evals, 36, "Cash", "Wed Aug 01 2018", 8578.0, 2);
    expectEvals(evals, 37, "NSI", "Thu Aug 02 2018", 1023142.48, 2);
    expectEvals(evals, 38, "NSIinterest", "Thu Aug 02 2018", 1270.13, 2);
    expectEvals(evals, 39, "Cash", "Thu Aug 02 2018", 9848.13, 2);
    expectEvals(evals, 40, "Cash", "Sun Aug 05 2018", 9818.71, 2);
    expectEvals(evals, 41, "Cash", "Sat Sep 01 2018", 9818.71, 2);
    expectEvals(evals, 42, "NSI", "Sun Sep 02 2018", 1026491.98, 2);
    expectEvals(evals, 43, "NSIinterest", "Sun Sep 02 2018", 1274.29, 2);
    expectEvals(evals, 44, "Cash", "Sun Sep 02 2018", 11092.99, 2);
    expectEvals(evals, 45, "Cash", "Wed Sep 05 2018", 11064.79, 2);
    expectEvals(evals, 46, "Cash", "Mon Oct 01 2018", 11064.79, 2);
    expectEvals(evals, 47, "NSI", "Tue Oct 02 2018", 1029852.45, 2);
    expectEvals(evals, 48, "NSIinterest", "Tue Oct 02 2018", 1278.46, 2);
    expectEvals(evals, 49, "Cash", "Tue Oct 02 2018", 12343.25, 2);
    expectEvals(evals, 50, "Cash", "Fri Oct 05 2018", 12316.29, 2);
    expectEvals(evals, 51, "Cash", "Thu Nov 01 2018", 12316.29, 2);
    expectEvals(evals, 52, "NSI", "Fri Nov 02 2018", 1033223.91, 2);
    expectEvals(evals, 53, "NSIinterest", "Fri Nov 02 2018", 1282.64, 2);
    expectEvals(evals, 54, "Cash", "Fri Nov 02 2018", 13598.93, 2);
    expectEvals(evals, 55, "Cash", "Mon Nov 05 2018", 13573.2, 2);
    expectEvals(evals, 56, "Cash", "Sat Dec 01 2018", 13573.2, 2);
    expectEvals(evals, 57, "NSI", "Sun Dec 02 2018", 1036606.42, 2);
    expectEvals(evals, 58, "NSIinterest", "Sun Dec 02 2018", 1286.84, 2);
    expectEvals(evals, 59, "Cash", "Sun Dec 02 2018", 14860.05, 2);
    expectEvals(evals, 60, "Cash", "Wed Dec 05 2018", 14835.56, 2);
    expectEvals(evals, 61, "Cash", "Tue Jan 01 2019", 14835.56, 2);
    expectEvals(evals, 62, "NSI", "Wed Jan 02 2019", 1040000.0, 2);
    expectEvals(evals, 63, "NSIinterest", "Wed Jan 02 2019", 1291.06, 2);
    expectEvals(evals, 64, "Cash", "Wed Jan 02 2019", 16126.61, 2);
    expectEvals(evals, 65, "Cash", "Sat Jan 05 2019", 16103.38, 2);
    expectEvals(evals, 66, "Cash", "Fri Feb 01 2019", 16103.38, 2);
    expectEvals(evals, 67, "NSI", "Sat Feb 02 2019", 1043404.69, 2);
    expectEvals(evals, 68, "NSIinterest", "Sat Feb 02 2019", 1295.28, 2);
    expectEvals(evals, 69, "Cash", "Sat Feb 02 2019", 17398.66, 2);
    expectEvals(evals, 70, "Cash", "Tue Feb 05 2019", 17376.68, 2);
    expectEvals(evals, 71, "Cash", "Fri Mar 01 2019", 17376.68, 2);
    expectEvals(evals, 72, "NSI", "Sat Mar 02 2019", 1046820.52, 2);
    expectEvals(evals, 73, "NSIinterest", "Sat Mar 02 2019", 1299.52, 2);
    expectEvals(evals, 74, "Cash", "Sat Mar 02 2019", 18676.2, 2);
    expectEvals(evals, 75, "Cash", "Tue Mar 05 2019", 18655.47, 2);
    expectEvals(evals, 76, "Cash", "Mon Apr 01 2019", 18655.47, 2);
    expectEvals(evals, 77, "NSI", "Tue Apr 02 2019", 1050247.54, 2);
    expectEvals(evals, 78, "NSIinterest", "Tue Apr 02 2019", 1303.78, 2);
    expectEvals(evals, 79, "Cash", "Tue Apr 02 2019", 19959.25, 2);
    expectEvals(evals, 80, "Cash", "Fri Apr 05 2019", 19939.74, 2);
    expectEvals(evals, 81, "(incomeTax)", "Fri Apr 05 2019", 573.52, 2);
    expectEvals(evals, 82, "Joe income (net)", "Fri Apr 05 2019", 14794.06, 2);
    expectEvals(evals, 83, "Cash", "Wed May 01 2019", 19939.74, 2);

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe("NSIinterest");
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1241.4, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 1245.46, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 1249.54, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", 1253.63, 2);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 1257.74, 2);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 1261.85, 2);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 1265.98, 2);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 1270.13, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 1274.29, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 1278.46, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 1282.64, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 1286.84, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 1291.06, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 1295.28, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 1299.52, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", 1303.78, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe("Cash");
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 1203.51, 2);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 2412.27, 2);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 3626.29, 2);
      expectChartData(chartPts, 5, "Tue May 01 2018", 4887.98, 2);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 6112.66, 2);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 7342.66, 2);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 8578.0, 2);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 9818.71, 2);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 11064.79, 2);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 12316.29, 2);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 13573.2, 2);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 14835.56, 2);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 16103.38, 2);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 17376.68, 2);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 18655.47, 2);
      expectChartData(chartPts, 17, "Wed May 01 2019", 19939.74, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[1].item.NAME).toBe(getnetincLabel("Joe"));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 4990.04, 2);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 0, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 0, -1);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 0, -1);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 0, -1);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 0, -1);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 0, -1);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 0, -1);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 0, -1);
      expectChartData(chartPts, 17, "Wed May 01 2019", 14794.06, 2);
    }

    expect(result.taxData[0].item.NAME).toBe(getICLabel("Joe"));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, "Fri Dec 01 2017", 0, -1);
      expectChartData(chartPts, 1, "Mon Jan 01 2018", 0, -1);
      expectChartData(chartPts, 2, "Thu Feb 01 2018", 0, -1);
      expectChartData(chartPts, 3, "Thu Mar 01 2018", 0, -1);
      expectChartData(chartPts, 4, "Sun Apr 01 2018", 0, -1);
      expectChartData(chartPts, 5, "Tue May 01 2018", 0, -1);
      expectChartData(chartPts, 6, "Fri Jun 01 2018", 0, -1);
      expectChartData(chartPts, 7, "Sun Jul 01 2018", 0, -1);
      expectChartData(chartPts, 8, "Wed Aug 01 2018", 0, -1);
      expectChartData(chartPts, 9, "Sat Sep 01 2018", 0, -1);
      expectChartData(chartPts, 10, "Mon Oct 01 2018", 0, -1);
      expectChartData(chartPts, 11, "Thu Nov 01 2018", 0, -1);
      expectChartData(chartPts, 12, "Sat Dec 01 2018", 0, -1);
      expectChartData(chartPts, 13, "Tue Jan 01 2019", 0, -1);
      expectChartData(chartPts, 14, "Fri Feb 01 2019", 0, -1);
      expectChartData(chartPts, 15, "Fri Mar 01 2019", 0, -1);
      expectChartData(chartPts, 16, "Mon Apr 01 2019", 0, -1);
      expectChartData(chartPts, 17, "Wed May 01 2019", 573.52, 2);
    }
  });
  it("get category of asset, expense, income", () => {
    const categoryCache = new Map<string, string>();
    const model = makeModelFromJSON(billAndBenExampleData);
    expect(getCategory("", categoryCache, model)).toEqual("");
    expect(getCategory("nonsense", categoryCache, model)).toEqual("nonsense");
    expect(getCategory("CareCosts", categoryCache, model)).toEqual("Care");
    expect(getCategory("BenSalary", categoryCache, model)).toEqual("Salary");
    expect(getCategory("BillStocks", categoryCache, model)).toEqual(
      "Investment",
    );
    expect(getCategory("CareCosts", categoryCache, model)).toEqual("Care");
    expect(
      getCategory(
        "LeisureExpensesRetired/LeisureExpensesRetired",
        categoryCache,
        model,
      ),
    ).toEqual("Leisure/Leisure");
  });

  it("Autoname revaluation transactions", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2018 00:00:00",
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
      transactions: [],
      settings: [...defaultModelSettings(roi)],
    };

    model.transactions = [
      {
        ...simpleTransaction,
        NAME: "Revaluesavings",
        TO: "savings",
        TO_VALUE: "300", // market crash!
        DATE: "March 5 2018",
        TYPE: revalueAsset,
      },
    ];
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings 1");

    model.transactions[0].NAME = "Revaluesavings 1";
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings 2");

    model.transactions[0].NAME = "Revaluesavings1";
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings2");

    model.transactions[0].NAME = "Revaluesavings 01";
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings 02");

    model.transactions[0].NAME = "Revaluesavings01";
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings02");

    model.transactions[0].NAME = "Revaluesavings01";
    for (let i = 1; i < 10; i = i + 1) {
      model.transactions.push({
        ...simpleTransaction,
        NAME: `Revaluesavings0${i}`,
      });
    }
    expect(makeRevalueName("savings", model)).toEqual("Revaluesavings10");
  });

  it("models with undefined to/from", () => {
    {
      const model = transactionFromUndefinedModel();
      getTestEvaluations(model);
    }

    {
      const model = transactionToUndefinedModel();
      getTestEvaluations(model);
    }

    // printTestCodeForEvals(evals);
  });

  it("historical assessments", () => {
    const model = makeModelFromJSON(mortgageSwitchExampleData);
    expect(model.assets.length).toBe(5);
    expect(model.expenses.length).toBe(3);
    expect(model.incomes.length).toBe(3);
    expect(model.transactions.length).toBe(6);

    const filterForOld = (items: Item[]) => {
      return items.filter((x) => {
        return isHistorical(x, model);
      });
    };

    expect(filterForOld(model.assets).length).toBe(0);
    expect(filterForOld(model.expenses).length).toBe(0);

    model.settings[5].VALUE = "01 Jan 2050";
    expect(filterForOld(model.assets).length).toBe(0);
    expect(filterForOld(model.expenses).length).toBe(2);

    model.settings[5].VALUE = "01 Jan 2026";
    expect(filterForOld(model.incomes).length).toBe(1);

    model.settings[5].VALUE = "01 Jan 2026";
    expect(filterForOld(model.transactions).length).toBe(1);

    model.settings[5].VALUE = "01 Jan 2048";
    expect(filterForOld(model.transactions).length).toBe(2);

    model.transactions.push({
      DATE: "1 Jan 2049",
      FROM: "",
      FROM_VALUE: "0",
      FROM_ABSOLUTE: false,
      NAME: "Revalue dogs",
      TO: "Look after dogs",
      TO_ABSOLUTE: true,
      TO_VALUE: "1",
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: "revalueExpense",
      CATEGORY: "",
      ERA: -1,
    });
    expect(filterForOld(model.transactions).length).toBe(3);

    model.settings[5].VALUE = "01 Jan 2030";
    expect(filterForOld(model.transactions).length).toBe(2);

    model.transactions.push(
      {
        DATE: "1 Jan 2031",
        FROM: "",
        FROM_VALUE: "0",
        FROM_ABSOLUTE: false,
        NAME: "Revalue income",
        TO: "Main income",
        TO_ABSOLUTE: true,
        TO_VALUE: "11",
        STOP_DATE: "",
        RECURRENCE: "",
        TYPE: "revalueIncome",
        CATEGORY: "",
        ERA: -1,
      },
      {
        DATE: "1 Jan 2031",
        FROM: "",
        FROM_VALUE: "0",
        FROM_ABSOLUTE: false,
        NAME: "Revalue income",
        TO: "Side hustle income",
        TO_ABSOLUTE: true,
        TO_VALUE: "111",
        STOP_DATE: "",
        RECURRENCE: "",
        TYPE: "revalueIncome",
        CATEGORY: "",
        ERA: -1,
      },
      {
        DATE: "2 Jan 2031",
        FROM: "",
        FROM_VALUE: "0",
        FROM_ABSOLUTE: false,
        NAME: "Revalue income",
        TO: "Main income",
        TO_ABSOLUTE: true,
        TO_VALUE: "12",
        STOP_DATE: "",
        RECURRENCE: "",
        TYPE: "revalueIncome",
        CATEGORY: "",
        ERA: -1,
      },
      {
        DATE: "3 Jan 2032",
        FROM: "",
        FROM_VALUE: "0",
        FROM_ABSOLUTE: false,
        NAME: "Revalue income",
        TO: "Main income",
        TO_ABSOLUTE: true,
        TO_VALUE: "13",
        STOP_DATE: "",
        RECURRENCE: "",
        TYPE: "revalueIncome",
        CATEGORY: "",
        ERA: -1,
      },
    );
    expect(filterForOld(model.transactions).length).toBe(3);

    model.settings[5].VALUE = "01 Jan 2032";
    expect(filterForOld(model.transactions).length).toBe(4);

    expect(filterForOld(model.settings).length).toBe(0);
  });

  it("delete items from model should refuse to delete", async () => {
    const model = makeModelFromJSON(mortgageSwitchExampleData);
    // log(showObj(model));
    // can't delete things which don't exist in the model
    [
      model.assets,
      model.incomes,
      model.expenses,
      model.triggers,
      model.transactions,
      model.settings,
    ].map(async (items) => {
      const response = await deleteItemsFromModelInternal(
        ["nonsense"],
        items,
        model.name,
        model,
        true, // doChecks
        true, // allowRecursion
        () => { },
        async (a, b, c) => { },
      );
      expect(response.itemsDeleted.length).toBe(0);
      expect(response.message.length).not.toBe(0);
    });

    // can't delete CASH_ASSET_NAME from incomes
    let response = await deleteItemsFromModelInternal(
      [CASH_ASSET_NAME],
      model.incomes,
      model.name,
      model,
      true, // doChecks
      true, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.itemsDeleted.length).toBe(0);
    expect(response.message.length).not.toBe(0);

    // can't delete CASH_ASSET_NAME from assets
    // unless we also delete anything else interacting
    // with cash
    response = await deleteItemsFromModelInternal(
      [CASH_ASSET_NAME],
      model.assets,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.itemsDeleted.length).toBe(0);
    expect(response).not.toBe("");
  });

  it("delete items from model no recursion", async () => {
    const model = makeModelFromJSON(mortgageSwitchExampleData);
    // log(showObj(model));

    // log(showObj(model.assets.map((i)=>{return i.NAME})));

    expect(model.assets.length).toBe(5);
    markForUndo(model);
    let listForDelete = ["ISAs"];
    let response = await deleteItemsFromModelInternal(
      listForDelete,
      model.assets,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.assets.length).toBe(4);
    revertToUndoModel(model);
    expect(model.assets.length).toBe(5);

    listForDelete = ["ISAs", "Stocks"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.assets,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response).not.toBe("");

    // log(showObj(model.incomes.map((i)=>{return i.NAME})));

    expect(model.incomes.length).toBe(3);
    markForUndo(model);
    listForDelete = ["Side hustle income"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.incomes,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.incomes.length).toBe(2);
    revertToUndoModel(model);
    expect(model.incomes.length).toBe(3);

    expect(model.incomes.length).toBe(3);
    markForUndo(model);
    listForDelete = ["Side hustle income", "Side hustle income later"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.incomes,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);

    expect(model.incomes.length).toBe(1);
    revertToUndoModel(model);
    expect(model.incomes.length).toBe(3);

    // log(showObj(model.expenses.map((i)=>{return i.NAME})));

    expect(model.expenses.length).toBe(3);
    markForUndo(model);
    listForDelete = ["Look after dogs"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.expenses,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.expenses.length).toBe(2);
    revertToUndoModel(model);
    expect(model.expenses.length).toBe(3);

    expect(model.expenses.length).toBe(3);
    markForUndo(model);
    listForDelete = ["Look after dogs", "Run house"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.expenses,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.expenses.length).toBe(1);
    revertToUndoModel(model);
    expect(model.expenses.length).toBe(3);

    // log(showObj(model.transactions.map((i)=>{return i.NAME})));

    expect(model.transactions.length).toBe(6);
    markForUndo(model);
    listForDelete = ["SellCar"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.transactions.length).toBe(5);
    revertToUndoModel(model);
    expect(model.transactions.length).toBe(6);
    markForUndo(model);
    listForDelete = ["SellCar", "switchMortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.transactions.length).toBe(4);
    revertToUndoModel(model);
    expect(model.transactions.length).toBe(6);

    //log(showObj(model.triggers.map((i)=>{return i.NAME})));

    expect(model.triggers.length).toBe(3);
    markForUndo(model);
    listForDelete = ["TransferMortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.triggers,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response).not.toBe("");
    expect(model.triggers.length).toBe(3);

    listForDelete = ["Conditional pay early mortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["Each month buy food"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["Conditional pay late mortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["switchMortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["TransferMortgage"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.triggers,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.triggers.length).toBe(2);

    revertToUndoModel(model);
    expect(model.triggers.length).toBe(3);

    /*
    log(
      showObj(
        model.settings.map((i) => {
          return i.NAME;
        }),
      ),
    );
    */
    expect(model.settings.length).toBe(8);
    markForUndo(model);
    listForDelete = ["stockMarketGrowth"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.settings,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response).not.toBe("");
    expect(model.settings.length).toBe(8);
    listForDelete = ["Revalue stocks after loss in 2020 market crash"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.transactions,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["Stocks"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.assets,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["ISAs"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.assets,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    listForDelete = ["stockMarketGrowth"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.settings,
      model.name,
      model,
      true, // doChecks
      false, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    expect(response.message).toBe("");
    expect(response.itemsDeleted).toEqual(listForDelete);
    expect(model.settings.length).toBe(7);
    revertToUndoModel(model);
    expect(model.settings.length).toBe(8);
  });

  it("delete items from model with recursion", async () => {
    const model = makeModelFromJSON(mortgageSwitchExampleData);
    // log(showObj(model));
    // log(showObj(model.assets.map((i)=>{return i.NAME})));
    // log(showObj(model.expenses.map((i)=>{return i.NAME})));
    // log(showObj(model.transactions.map((i)=>{return i.NAME})));
    // log(showObj(model.triggers.map((i)=>{return i.NAME})));

    expect(model.triggers.length).toBe(3);
    expect(model.transactions.length).toBe(6);
    markForUndo(model);
    let listForDelete = ["TransferMortgage"];
    let response = await deleteItemsFromModelInternal(
      listForDelete,
      model.triggers,
      model.name,
      model,
      true, // doChecks
      true, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    // requires additional delete of
    // 'Conditional pay early mortgage',
    // 'Conditional pay late mortgage'
    // 'Each month buy food'
    // 'switchMortgage'
    expect(response.message).toBe("");
    // log(`response.itemsDeleted = ${response.itemsDeleted}`);
    expect(response.itemsDeleted).toEqual([
      "TransferMortgage",
      "Conditional pay early mortgage",
      "Conditional pay late mortgage",
      "switchMortgage",
    ]);
    expect(model.triggers.length).toBe(2); // switchMortgage
    expect(model.transactions.length).toBe(3); // Conditionals, food

    revertToUndoModel(model);
    expect(model.triggers.length).toBe(3);
    expect(model.transactions.length).toBe(6);

    /*
    log(
      showObj(
        model.settings.map((i) => {
          return i.NAME;
        }),
      ),
    );
    */
    expect(model.settings.length).toBe(8);
    expect(model.assets.length).toBe(5);
    expect(model.transactions.length).toBe(6);
    markForUndo(model);
    listForDelete = ["stockMarketGrowth"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.settings,
      model.name,
      model,
      true, // doChecks
      true, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    // requires additional delete of
    // 'Revalue stocks after loss in 2020 market crash'
    // 'Stocks'
    // 'ISAs'
    expect(response.message).toBe("");
    // log(`response.itemsDeleted = ${response.itemsDeleted}`);
    expect(response.itemsDeleted).toEqual([
      "stockMarketGrowth",
      "ISAs",
      "Stocks",
      "Revalue stocks after loss in 2020 market crash",
    ]);
    expect(model.settings.length).toBe(7);
    expect(model.assets.length).toBe(3);
    expect(model.transactions.length).toBe(5);

    revertToUndoModel(model);
    expect(model.settings.length).toBe(8);
    expect(model.assets.length).toBe(5);
    expect(model.transactions.length).toBe(6);

    model.settings.push({
      ...simpleSetting,
      NAME: "ten",
      VALUE: "10",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl1",
      VALUE: "ten",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl2",
      VALUE: "tenl1",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl3",
      VALUE: "tenl2",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl2a",
      VALUE: "tenl1",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl3a",
      VALUE: "tenl2",
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "tenl3b",
      VALUE: "tenl2a",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen3b",
      VALUE: "ten3b",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen3a",
      VALUE: "ten3a",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen2a",
      VALUE: "ten2a",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen3",
      VALUE: "ten3",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen2",
      VALUE: "ten2",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen1",
      VALUE: "ten1",
    });
    model.assets.push({
      ...simpleAsset,
      NAME: "valIsTen",
      VALUE: "ten",
    });

    expect(model.settings.length).toBe(15);
    expect(model.assets.length).toBe(12);
    listForDelete = ["ten"];
    response = await deleteItemsFromModelInternal(
      listForDelete,
      model.settings,
      model.name,
      model,
      true, // doChecks
      true, // allowRecursion
      () => {},
      async (a, b, c) => {},
    );
    // requires additional delete
    expect(response.message).toBe("");
    // log(`response.itemsDeleted = ${response.itemsDeleted}`);
    expect(response.itemsDeleted).toEqual([
      "ten",
      "valIsTen3b",
      "valIsTen3a",
      "valIsTen2a",
      "valIsTen3",
      "valIsTen2",
      "valIsTen1",
      "valIsTen",
    ]);
    expect(model.settings.length).toBe(14);
    expect(model.assets.length).toBe(5);
  });

  it(`RSU example`, () => {
    const viewSettings = defaultTestViewSettings();
    const modelFromJSON = makeModelFromJSON(
      `{
        "name":"RSUs example",
        "assets":[
        {"NAME":"RSUs",
          "ERA":0,
          "VALUE":"ADSK stock",
          "QUANTITY":"34",
          "START":"1 Jan 2023",
          "LIABILITY":"John(CGT)",
          "GROWTH":"0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":false,
          "IS_A_DEBT":false,
          "PURCHASE_PRICE":"1",
          "CATEGORY":""},
        {"NAME":"Cash",
          "ERA":0,"VALUE":"0",
          "QUANTITY":"",
          "START":"01 Jan 2023",
          "LIABILITY":"",
          "GROWTH":"0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "PURCHASE_PRICE":"0",
          "CATEGORY":""}],
        "incomes":[],
        "expenses":[],
        "triggers":[],
        "settings":[{"NAME":"USD",
          "ERA":0,"VALUE":"0.78",
          "HINT":"",
          "TYPE":"adjustable"},
        {"NAME":"Today's value focus date",
          "VALUE":"",
          "HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)",
          "TYPE":"view",
          "ERA":0},
        {"NAME":"RSU average purchase price",
          "ERA":0,"VALUE":"150",
          "HINT":"",
          "TYPE":"adjustable"},
        {"NAME":"ESPP average purchase price",
          "ERA":0,"VALUE":"130",
          "HINT":"",
          "TYPE":"adjustable"},
        {"NAME":"End of view range",
          "ERA":0,"VALUE":"01 Jan 2026",
          "HINT":"Date at the end of range to be plotted",
          "TYPE":"view"},
        {"NAME":"Date of birth",
          "VALUE":"",
          "HINT":"Date used for representing dates as ages",
          "TYPE":"view",
          "ERA":0},
        {"NAME":"cpi",
          "VALUE":"2.5",
          "HINT":"Annual rate of inflation",
          "TYPE":"const",
          "ERA":0},
        {"NAME":"Beginning of view range",
          "ERA":0,"VALUE":"01 Jan 2023",
          "HINT":"Date at the start of range to be plotted",
          "TYPE":"view"},
        {"NAME":"ADSK stock",
          "ERA":0,"VALUE":"204USD",
          "HINT":"",
          "TYPE":"adjustable"}],
        "transactions":[
        {"NAME":"RSUs vest April 2023",
          "ERA":0,"CATEGORY":"",
          "FROM":"",
          "FROM_ABSOLUTE":false,"FROM_VALUE":"",
          "TO":"RSUs",
          "TO_ABSOLUTE":true,"TO_VALUE":"10",
          "DATE":"10 April 2023",
          "STOP_DATE":"",
          "RECURRENCE":"",
          "TYPE":"custom"},
        {"NAME":"RevalueRSU average purchase price 1",
          "ERA":0,"FROM":"",
          "FROM_ABSOLUTE":false,"FROM_VALUE":"0.0",
          "TO":"RSU average purchase price",
          "TO_ABSOLUTE":true,"TO_VALUE":"155",
          "DATE":"10 April 2023",
          "TYPE":"revalueSetting",
          "RECURRENCE":"",
          "STOP_DATE":"",
          "CATEGORY":""},
        {"DATE":"1 Jan 2023",
          "FROM":"",
          "FROM_VALUE":"0",
          "FROM_ABSOLUTE":false,"NAME":"RevalueADSK stock 1",
          "ERA":0,"TO":"ADSK stock",
          "TO_ABSOLUTE":false,"TO_VALUE":"1.005",
          "STOP_DATE":"",
          "RECURRENCE":"1m",
          "TYPE":"revalueSetting",
          "CATEGORY":""}],
        "version":11
        }`,
    );
    const model = modelFromJSON;

    setSetting(
      model.settings,
      `Today's value focus date`,
      "Aug 10 2023",
      viewType,
    );

    const evalsAndValues = getTestEvaluations(
      makeModelFromJSON(JSON.stringify(model)),
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
  });
});
