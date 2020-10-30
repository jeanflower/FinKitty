// to allow final-scoping blocks for auto-generated code
/* eslint-disable no-lone-blocks */

import { makeChartDataFromEvaluations } from '../../models/charting';
import { getEvaluations } from '../../models/evaluations';
import {
  annually,
  assetChartAdditions,
  assetChartDeltas,
  assetChartFocus,
  assetChartHint,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  CASH_ASSET_NAME,
  cgt,
  coarse,
  cpi,
  crystallizedPension,
  debtChartHint,
  debtChartView,
  debtChartVal,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  incomeTax,
  monthly,
  nationalInsurance,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  separator,
  viewDetail,
  viewFrequency,
  growth,
  pension,
  pensionSS,
  pensionDB,
  total,
  custom,
  liquidateAsset,
  payOffDebt,
  autogen,
  revalueExp,
  revalueInc,
  revalueAsset,
  taxableBenefit,
  constType,
  viewType,
  revalueSetting,
  revalue,
  allItems,
  taxFree,
  conditional,
  moveTaxFreePart,
  pensionTransfer,
  transferCrystallizedPension,
  cpiHint,
} from '../../localization/stringConstants';
import {
  ChartDataPoint,
  DataForView,
  DbModelData,
} from '../../types/interfaces';
import { Evaluation } from '../../types/interfaces';
import {
  getMinimalModelCopy,
  log,
  makeDateFromString,
  printDebug,
  setSetting,
  suppressLogs,
  unSuppressLogs,
  minimalModel,
  makeModelFromJSON,
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetIncomeTag,
  makeNetGainTag,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
  defaultSettings,
  emptyModel,
  setROI,
  simpleSetting,
  viewSetting,
  makeModelFromJSONString,
  attemptRenameLong,
  revertToUndoModel,
  // showObj,
} from '../../utils';
import {
  getModelCoarseAndFine,
  getThreeChryslerModel,
  simpleExampleData,
} from '../../models/exampleModels';

/* global it */
/* global expect */
/* global describe */

function expectEvals(
  evals: Evaluation[],
  i: number,
  name: string,
  dateString: string,
  value: number,
  numDigits: number,
) {
  expect(evals[i].name).toBe(name);
  expect(evals[i].date.toDateString()).toBe(dateString);
  if (numDigits < 0) {
    expect(evals[i].value).toBe(value);
  } else {
    expect(evals[i].value).toBeCloseTo(value, numDigits);
  }
}

function printTestCodeForEvals(evals: Evaluation[]) {
  let result = '';
  result += `expect(evals.length).toBe(${evals.length});\n`;
  for (let i = 0; i < evals.length; i += 1) {
    // log(`evals[${i}] is ${showObj(evals[i])}`);
    result +=
      `expectEvals(evals, ${i}, ` +
      `'${evals[i].name}', '${evals[i].date.toDateString()}', `;
    if (evals[i].value.toFixed(0) === `${evals[i].value}`) {
      result += `${evals[i].value}, -1);\n`;
    } else {
      result += `${evals[i].value.toFixed(2)}, 2);\n`;
    }
  }
  log(result);
}

function expectChartData(
  pts: ChartDataPoint[],
  i: number,
  date: string,
  val: number,
  numDigits: number,
) {
  expect(pts[i].label).toBe(date);
  if (numDigits < 0) {
    expect(pts[i].y).toBeCloseTo(val, undefined);
  } else {
    expect(pts[i].y).toBeCloseTo(val, numDigits);
  }
}

function printTestCodeForChart(result: DataForView) {
  let toPrint = '';
  toPrint += `expect(result.expensesData.length).toBe(${result.expensesData.length});\n`;
  for (let i = 0; i < result.expensesData.length; i += 1) {
    toPrint +=
      `expect(result.expensesData[${i}].item.NAME).toBe(` +
      `'${result.expensesData[i].item.NAME}');\n`;
    toPrint += '{\n';
    toPrint += `const chartPts = result.expensesData[${i}].chartDataPoints;\n`;
    const chartPts = result.expensesData[i].chartDataPoints;
    toPrint += `expect(chartPts.length).toBe(${chartPts.length});\n`;
    for (let j = 0; j < chartPts.length; j += 1) {
      toPrint += `expectChartData(chartPts, ${j}, '${chartPts[j].label}', `;
      if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
        toPrint += `${chartPts[j].y},    -1);\n`;
      } else {
        toPrint += `${chartPts[j].y.toFixed(2)}, 2);\n`;
      }
    }
    toPrint += '}\n';
    toPrint += '\n';
  }
  toPrint +=
    'expect(result.incomesData.length).toBe(' +
    `${result.incomesData.length});\n`;
  for (let i = 0; i < result.incomesData.length; i += 1) {
    toPrint +=
      `expect(result.incomesData[${i}].item.NAME).toBe(` +
      `'${result.incomesData[i].item.NAME}');\n`;
    toPrint += '{\n';
    toPrint += `const chartPts = result.incomesData[${i}].chartDataPoints;\n`;
    const chartPts = result.incomesData[i].chartDataPoints;
    toPrint += `expect(chartPts.length).toBe(${chartPts.length});\n`;
    for (let j = 0; j < chartPts.length; j += 1) {
      toPrint += `expectChartData(chartPts, ${j}, '${chartPts[j].label}', `;
      if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
        toPrint += `${chartPts[j].y},    -1);\n`;
      } else {
        toPrint += `${chartPts[j].y.toFixed(2)}, 2);\n`;
      }
    }
    toPrint += '}\n';
    toPrint += '\n';
  }
  toPrint +=
    'expect(result.assetData.length).toBe(' + `${result.assetData.length});\n`;
  for (let i = 0; i < result.assetData.length; i += 1) {
    toPrint +=
      `expect(result.assetData[${i}].item.NAME).toBe(` +
      `'${result.assetData[i].item.NAME}');\n`;
    toPrint += '{\n';
    toPrint += `const chartPts = result.assetData[${i}].chartDataPoints;\n`;
    const chartPts = result.assetData[i].chartDataPoints;
    toPrint += `expect(chartPts.length).toBe(${chartPts.length});\n`;
    for (let j = 0; j < chartPts.length; j += 1) {
      toPrint += `expectChartData(chartPts, ${j}, '${chartPts[j].label}', `;
      if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
        toPrint += `${chartPts[j].y},    -1);\n`;
      } else {
        toPrint += `${chartPts[j].y.toFixed(2)}, 2);\n`;
      }
    }
    toPrint += '}\n';
    toPrint += '\n';
  }
  toPrint +=
    'expect(result.debtData.length).toBe(' + `${result.debtData.length});\n`;
  for (let i = 0; i < result.debtData.length; i += 1) {
    toPrint +=
      `expect(result.debtData[${i}].item.NAME).toBe(` +
      `'${result.debtData[i].item.NAME}');\n`;
    toPrint += '{\n';
    toPrint += `const chartPts = result.debtData[${i}].chartDataPoints;\n`;
    const chartPts = result.debtData[i].chartDataPoints;
    toPrint += `expect(chartPts.length).toBe(${chartPts.length});\n`;
    for (let j = 0; j < chartPts.length; j += 1) {
      toPrint += `expectChartData(chartPts, ${j}, '${chartPts[j].label}', `;
      if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
        toPrint += `${chartPts[j].y},    -1);\n`;
      } else {
        toPrint += `${chartPts[j].y.toFixed(2)}, 2);\n`;
      }
    }
    toPrint += '}\n';
    toPrint += '\n';
  }
  toPrint +=
    'expect(result.taxData.length).toBe(' + `${result.taxData.length});\n`;
  for (let i = 0; i < result.taxData.length; i += 1) {
    toPrint +=
      `expect(result.taxData[${i}].item.NAME).toBe(` +
      `'${result.taxData[i].item.NAME}');\n`;
    toPrint += '{\n';
    toPrint += `const chartPts = result.taxData[${i}].chartDataPoints;\n`;
    const chartPts = result.taxData[i].chartDataPoints;
    toPrint += `expect(chartPts.length).toBe(${chartPts.length});\n`;
    for (let j = 0; j < chartPts.length; j += 1) {
      toPrint += `expectChartData(chartPts, ${j}, '${chartPts[j].label}', `;
      if (chartPts[j].y.toFixed(0) === `${chartPts[j].y}`) {
        toPrint += `${chartPts[j].y},    -1);\n`;
      } else {
        toPrint += `${chartPts[j].y.toFixed(2)}, 2);\n`;
      }
    }
    toPrint += '}\n';
    toPrint += '\n';
  }
  log(toPrint);
}

function getTestEvaluations(
  model: DbModelData,
  extraChecks = true,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<string, number>;
  todaysDebtValues: Map<string, number>;
  todaysIncomeValues: Map<string, number>;
  todaysExpenseValues: Map<string, number>;
  todaysSettingValues: Map<string, string>;
} {
  if (extraChecks) {
    // hijack to try some renaming
    model.triggers.forEach(obj => {
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, oldName, 'abcd');
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, 'abcd', oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.assets.forEach(obj => {
      const oldName = obj.NAME;
      if (oldName === CASH_ASSET_NAME) {
        return;
      }
      let newName = 'abcd';
      if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pension)) {
        newName = pension + newName;
      } else if (oldName.endsWith(taxFree)) {
        newName = newName + taxFree;
      } else if (oldName.startsWith(crystallizedPension)) {
        newName = crystallizedPension + newName;
      }
      let message = attemptRenameLong(model, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.incomes.forEach(obj => {
      const oldName = obj.NAME;
      let newName = 'abcd';
      if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pensionTransfer)) {
        newName = pensionTransfer + newName;
      }
      let message = attemptRenameLong(model, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.expenses.forEach(obj => {
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, oldName, 'abcd');
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, 'abcd', oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.transactions.forEach(obj => {
      const oldName = obj.NAME;
      let newName = 'abcd';
      if (oldName.startsWith(revalue)) {
        newName = revalue + newName;
      } else if (oldName.startsWith(conditional)) {
        newName = conditional + newName;
      } else if (oldName.startsWith(pensionSS)) {
        newName = pensionSS + newName;
      } else if (oldName.startsWith(pensionTransfer)) {
        newName = pensionTransfer + newName;
      } else if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pension)) {
        newName = pension + newName;
      } else if (oldName.startsWith(moveTaxFreePart)) {
        newName = moveTaxFreePart + newName;
      } else if (oldName.startsWith(crystallizedPension)) {
        newName = crystallizedPension + newName;
      } else if (oldName.startsWith(transferCrystallizedPension)) {
        newName = transferCrystallizedPension + newName;
      }
      // log(`transaction oldName ${obj.NAME} -> ${newName}`);

      let message = attemptRenameLong(model, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.settings.forEach(obj => {
      if (
        minimalModel.settings.find(s => {
          return s.NAME === obj.NAME;
        }) !== undefined
      ) {
        return;
      }
      const oldName = obj.NAME;
      const newName = 'abcd';
      let message = attemptRenameLong(model, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      message = attemptRenameLong(model, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
  }

  let evalnsAndVals;
  if (!extraChecks) {
    evalnsAndVals = getEvaluations(model);
  } else {
    const copyModel = makeModelFromJSONString(JSON.stringify(model));
    evalnsAndVals = getEvaluations(copyModel);
  }
  return evalnsAndVals;
}
function getICLabel(person: string) {
  return makeIncomeTaxTag(person);
}
function getNILabel(person: string) {
  return makeNationalInsuranceTag(person);
}
function getCGTLabel(person: string) {
  return makeCGTTag(person);
}
function getnetincLabel(person: string) {
  return makeNetIncomeTag(person);
}
function getnetgainLabel(person: string) {
  return makeNetGainTag(person);
}

function getModelFutureExpense2() {
  const roi = {
    start: 'Dec 1, 2016 00:00:00',
    end: 'March 1, 2017 00:00:00',
  };
  const model: DbModelData = {
    ...emptyModel,
    expenses: [
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'Phon',
        VALUE: '99',
        VALUE_SET: 'January 1 2018',
        GROWTH: '12.0',
      },
    ],
    settings: [...defaultSettings],
  };
  setROI(model, roi);
  return { roi, model };
}

function getModelCrystallizedPension() {
  const roi = {
    start: '1 April 2023',
    end: '1 April 2026',
  };
  const model: DbModelData = {
    ...minimalModel,
    incomes: [],
    assets: [
      {
        ...simpleAsset,
        NAME: 'AvailablePensionTaxFree',
        START: 'Apr 06 2019',
        CATEGORY: 'B',
      },
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: 'Apr 06 2019',
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + 'Joe',
        START: 'Apr 06 2019',
        CATEGORY: 'B',
      },
      {
        ...simpleAsset,
        NAME: 'EmploymentPension',
        START: 'Apr 06 2019',
        VALUE: '100000',
        CATEGORY: 'B',
      },
    ],
    settings: [
      ...defaultSettings,
      {
        ...viewSetting,
        NAME: roiStart,
        VALUE: roi.start,
        HINT: roiStartHint,
      },
      {
        ...viewSetting,
        NAME: roiEnd,
        VALUE: roi.end,
        HINT: roiEndHint,
      },
    ],
    expenses: [],
    transactions: [
      {
        NAME: 'MoveQuarterPension',
        FROM: 'EmploymentPension',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.25',
        TO: 'AvailablePensionTaxFree',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.98',
        DATE: 'Oct 04 2024',
        STOP_DATE: '1 January 2018',
        RECURRENCE: '',
        CATEGORY: 'D',
        TYPE: custom,
      },
      {
        NAME: 'MoveRemainingPension',
        FROM: 'EmploymentPension',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1',
        TO: crystallizedPension + 'Joe',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.98',
        DATE: 'Oct 05 2024',
        STOP_DATE: '1 January 2018',
        RECURRENCE: '',
        CATEGORY: '',
        TYPE: custom,
      },
    ],
  };

  setSetting(model.settings, debtChartView, debtChartVal, debtChartHint);
  setSetting(model.settings, assetChartView, assetChartVal, assetChartHint);
  setSetting(model.settings, viewDetail, fine, viewType);
  setSetting(model.settings, viewFrequency, annually, viewType);
  setSetting(model.settings, birthDate, '', viewType);
  return {
    model,
    roi,
  };
}

describe('evaluations tests', () => {
  it('should ignore future expenses A', async done => {
    const modelAndRoi = getModelFutureExpense2();
    const model = modelAndRoi.model;

    const evalsAndValues = getEvaluations(
      makeModelFromJSONString(JSON.stringify(model)),
    );

    // log(showObj(evals));
    expect(evalsAndValues.evaluations.length).toBe(0);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth to next expense', async done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // this clumsy block is to allow printTestCodeForEvals to be "used"
    if (false) {
      // eslint-disable-line no-constant-condition
      if (printDebug()) {
        log('generating test code');
      }
      printTestCodeForEvals(evals);
    }

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(model, {
      evaluations: evals,
      todaysAssetValues: new Map<string, number>(),
      todaysDebtValues: new Map<string, number>(),
      todaysIncomeValues: new Map<string, number>(),
      todaysExpenseValues: new Map<string, number>(),
      todaysSettingValues: new Map<string, string>(),
    });

    // this clumsy block is to allow printTestCodeForChart to be "used"
    if (false) {
      // eslint-disable-line no-constant-condition
      if (printDebug()) {
        log('generating test code');
      }
      printTestCodeForChart(result);
    }

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.24, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should ignore future expenses B', async done => {
    const roi = {
      start: 'Dec 1, 2016 00:00:00',
      end: 'March 1, 2017 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(0);
    // log(showObj(evals));

    const result = makeChartDataFromEvaluations(model, {
      evaluations: evals,
      todaysAssetValues: new Map<string, number>(),
      todaysDebtValues: new Map<string, number>(),
      todaysIncomeValues: new Map<string, number>(),
      todaysExpenseValues: new Map<string, number>(),
      todaysSettingValues: new Map<string, string>(),
    });

    // log(showObj(result));

    expect(result.expensesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    done();
  });

  it('annual accumulation for chart less than one year', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, viewFrequency, annually, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('annual accumulation for chart more than one year', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, viewFrequency, annually, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Sat Dec 01 2018', 24.36, 2); // two payments
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth+CPI to next expense', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that next month's increase includes an increment for both growth and CPI
    // 12% in a year is _approximately_ 1% per month.
    // TODO : why is this not double the increase we saw in the growth test?
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.34, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.34, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should one expense for 6m recurrence', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2019',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          RECURRENCE: '6m',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(1);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should two expense for 2m recurrence', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2019',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          RECURRENCE: '2m',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Mar 01 2018', 12.56, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 12.56, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should two expense for 1y recurrence', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2019',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          RECURRENCE: '1y',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 01 2019', 15.03, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 15.03, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    done();
  });

  it("shouldn't see effect of cpi for cpi-immune expense", done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2017',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, cpi, '5.0', constType);
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Even though the value was set for 2017, the value persists into these 2018
    // dates because the expense is cpi-immune.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.12, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      // roi begins before the lifetime of the expense
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.12, 2);
      // roi extends beyond the lifetime of the expense
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('expense should grow even if CPI_IMMUNE', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2017',
          GROWTH: '12.0',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, cpi, '5.0', constType);
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      // roi begins before the lifetime of the expense
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 13.57, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 13.7, 2);
      // roi extends beyond the lifetime of the expense
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should understand trigger for start value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'valueSetTrigger',
          DATE: makeDateFromString('January 1 2017'),
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'valueSetTrigger',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // The value of this expense was set using a trigger, which evaluated to 2017.
    // See here that the values in 2018 are appropriately increased from its initial value.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 13.57, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 13.7, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth to next two expenses', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // Note growth has been applied once.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);
    // Note growth has been applied a second time.
    expectEvals(evals, 2, 'Phon', 'Thu Mar 01 2018', 12.35, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.24, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 12.35, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth to next income', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
          LIABILITY: '',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Note growth has been applied to show an increase in income.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 5, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 5.05, 2);
    }

    expect(result.assetData.length).toBe(0);
    done();
  });

  it('annual accumulation for incomes', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, viewFrequency, annually, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 2, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);
    expectEvals(evals, 3, 'PRnd', 'Sun Apr 01 2018', 5.14, 2);
    expectEvals(evals, 4, 'PRnd', 'Tue May 01 2018', 5.19, 2);
    expectEvals(evals, 5, 'PRnd', 'Fri Jun 01 2018', 5.24, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Sat Dec 01 2018', 30.72, 2);
    }
    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth to get first income', done => {
    const roi = {
      start: 'Dec 1, 2018 00:00:00',
      end: 'March 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2019',
          END: 'July 1 2019',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Note growth has already been applied.
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    // Note growth is applied again.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');

    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(3);
    expect(chartPts[0].label).toBe('Sat Dec 01 2018');
    expect(chartPts[0].y).toBe(0.0);
    expect(chartPts[1].label).toBe('Tue Jan 01 2019');
    expect(chartPts[1].y).toBeCloseTo(5.6, 2);
    expect(chartPts[2].label).toBe('Fri Feb 01 2019');
    expect(chartPts[2].y).toBeCloseTo(5.65, 2);

    expect(result.assetData.length).toBe(0);
    expect(result.expensesData.length).toBe(0);
    done();
  });

  it('should understand cpi-immune income no growth', done => {
    const roi = {
      start: 'Dec 1, 2018 00:00:00',
      end: 'March 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2019',
          END: 'July 1 2019',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '0',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5, -1);
    // Even though income has growth, the next income is the same
    // as it's cpi-immune.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue Jan 01 2019', 5, -1);
      expectChartData(chartPts, 2, 'Fri Feb 01 2019', 5, -1);
    }

    expect(result.assetData.length).toBe(0);
    done();
  });
  it('should understand cpi-immune income with growth', done => {
    const roi = {
      start: 'Dec 1, 2018 00:00:00',
      end: 'March 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2019',
          END: 'July 1 2019',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue Jan 01 2019', 5.6, 2);
      expectChartData(chartPts, 2, 'Fri Feb 01 2019', 5.65, 2);
    }

    expect(result.assetData.length).toBe(0);
    done();
  });

  it('should apply growth to next two incomes', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Income increases by growth.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    // Income increases again by growth.
    expectEvals(evals, 2, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 5, -1);
      // goes up by growth
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 5.05, 2);
      // goes up by growth again
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 5.1, 2);
    }

    expect(result.assetData.length).toBe(0);
    done();
  });

  it('cash goes first', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Acash',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: 'Zcash',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    // Evaluations are ordered so that Cash goes first.
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'Acash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 2, 'Zcash', 'Mon Jan 01 2018', 500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Acash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('Zcash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
    }
    done();
  });

  it('should apply growth to next two assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509.53, 2);
    }
    done();
  });

  it('should apply cpi to next two assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '0.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509.53, 2);
    }
    done();
  });

  it('should understand CPI_IMMUNE for growing assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12.0',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509.53, 2);
    }
    done();
  });

  it('should keep no-growth CPI_IMMUNE assets fixed', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 500, -1);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 500, -1);
    }
    done();
  });

  it('annual chart data for assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, assetChartFocus, 'savings', viewType);
    setSetting(model.settings, viewFrequency, annually, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Sat Dec 01 2018', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(growth + separator + 'savings');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Sat Dec 01 2018', 54.74, 2);
    }
    done();
  });

  it('should understand triggers', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'then',
          DATE: makeDateFromString('January 1 2018'),
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'then',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Asset started yusing a string trigger which has been converted into a date.
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
    }
    done();
  });

  it('should mix expense and income', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 2 2018',
          END: 'July 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    // Phon and PRnd both appear in date order.
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 02 2018', 12.12, 2);
    expectEvals(evals, 2, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 3, 'Phon', 'Fri Feb 02 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.12, 2);
    }

    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 5, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 5.05, 2);
    }

    expect(result.assetData.length).toBe(0);
    done();
  });

  it('has transaction impacting asset value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    //  printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Mar 01 2018', 400, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 400, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 400, -1);
    }
    done();
  });

  it('has regular transaction impacting asset value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Each month buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          DATE: 'January 2 2018',
          RECURRENCE: '1m',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 4, 'MyCa', 'Thu Mar 01 2018', 300, -1);
    expectEvals(evals, 5, 'MyCa', 'Fri Mar 02 2018', 200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 400, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
    }
    done();
  });

  it('has regular transaction every 2 months', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Each month buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          DATE: 'January 2 2018',
          RECURRENCE: '2m',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Mar 01 2018', 400, -1);
    expectEvals(evals, 4, 'MyCa', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 5, 'MyCa', 'Sun Apr 01 2018', 300, -1);
    expectEvals(evals, 6, 'MyCa', 'Tue May 01 2018', 300, -1);
    expectEvals(evals, 7, 'MyCa', 'Wed May 02 2018', 200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 400, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 400, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }
    done();
  });

  it('has regular transaction every 2 years', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2023 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Each month buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          DATE: 'January 2 2018',
          RECURRENCE: '2y',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    setSetting(model.settings, viewFrequency, monthly, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 25, 'MyCa', 'Wed Jan 01 2020', 400, -1);
    expectEvals(evals, 26, 'MyCa', 'Thu Jan 02 2020', 300, -1);
    expectEvals(evals, 50, 'MyCa', 'Sat Jan 01 2022', 300, -1);
    expectEvals(evals, 51, 'MyCa', 'Sun Jan 02 2022', 200, -1);
    expectEvals(evals, 67, 'MyCa', 'Mon May 01 2023', 200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(66);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 400, -1);
      expectChartData(chartPts, 25, 'Wed Jan 01 2020', 400, -1);
      expectChartData(chartPts, 26, 'Sat Feb 01 2020', 300, -1);
      expectChartData(chartPts, 49, 'Sat Jan 01 2022', 300, -1);
      expectChartData(chartPts, 50, 'Tue Feb 01 2022', 200, -1);
      expectChartData(chartPts, 65, 'Mon May 01 2023', 200, -1);
    }
    done();
  });

  it('has regular transaction stop at stop date', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Monthly buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          TO: 'Food',
          TO_VALUE: '80',
          DATE: 'January 2 2018',
          STOP_DATE: 'March 1 2018',
          RECURRENCE: '1m',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '320',
        },
        {
          ...simpleAsset,
          NAME: 'Food',
          START: 'January 1 2018',
          VALUE: '20',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Food', 'Mon Jan 01 2018', 20, -1);
    expectEvals(evals, 1, 'MyCa', 'Mon Jan 01 2018', 320, -1);
    // apply regular transaction
    expectEvals(evals, 2, 'MyCa', 'Tue Jan 02 2018', 220, -1);
    expectEvals(evals, 3, 'Food', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 4, 'Food', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 5, 'MyCa', 'Thu Feb 01 2018', 220, -1);
    // apply regular transaction
    expectEvals(evals, 6, 'MyCa', 'Fri Feb 02 2018', 120, -1);
    expectEvals(evals, 7, 'Food', 'Fri Feb 02 2018', 180, -1);
    expectEvals(evals, 8, 'Food', 'Thu Mar 01 2018', 180, -1);
    expectEvals(evals, 9, 'MyCa', 'Thu Mar 01 2018', 120, -1);
    // regular transaction has stopped
    expectEvals(evals, 10, 'Food', 'Sun Apr 01 2018', 180, -1);
    expectEvals(evals, 11, 'MyCa', 'Sun Apr 01 2018', 120, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 320, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 220, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 120, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 120, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Food');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 20, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 180, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 180, -1);
    }
    done();
  });

  it('has regular transaction stop when funds run out', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Each month buy food',
          FROM: 'MyCa',
          FROM_VALUE: '100',
          TO: 'Food',
          TO_VALUE: '80',
          DATE: 'January 2 2018',
          STOP_DATE: '',
          RECURRENCE: '1m',
        },
        {
          ...simpleTransaction,
          NAME: 'get paid',
          FROM_VALUE: '100',
          TO: 'MyCa',
          TO_VALUE: '200',
          DATE: 'April 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '220',
        },
        {
          ...simpleAsset,
          NAME: 'Food',
          START: 'January 1 2018',
          VALUE: '20',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'Food', 'Mon Jan 01 2018', 20, -1);
    expectEvals(evals, 1, 'MyCa', 'Mon Jan 01 2018', 220, -1);
    // apply regular payment
    expectEvals(evals, 2, 'MyCa', 'Tue Jan 02 2018', 120, -1);
    expectEvals(evals, 3, 'Food', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 4, 'Food', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 5, 'MyCa', 'Thu Feb 01 2018', 120, -1);
    // apply regular payment
    expectEvals(evals, 6, 'MyCa', 'Fri Feb 02 2018', 20, -1);
    expectEvals(evals, 7, 'Food', 'Fri Feb 02 2018', 180, -1);
    expectEvals(evals, 8, 'Food', 'Thu Mar 01 2018', 180, -1);
    expectEvals(evals, 9, 'MyCa', 'Thu Mar 01 2018', 20, -1);
    // do not apply regular payment
    expectEvals(evals, 10, 'Food', 'Sun Apr 01 2018', 180, -1);
    expectEvals(evals, 11, 'MyCa', 'Sun Apr 01 2018', 20, -1);
    // get paid
    expectEvals(evals, 12, 'MyCa', 'Mon Apr 02 2018', 220, -1);
    expectEvals(evals, 13, 'Food', 'Tue May 01 2018', 180, -1);
    expectEvals(evals, 14, 'MyCa', 'Tue May 01 2018', 220, -1);
    // apply regular payment
    expectEvals(evals, 15, 'MyCa', 'Wed May 02 2018', 120, -1);
    expectEvals(evals, 16, 'Food', 'Wed May 02 2018', 260, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 220, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 120, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 220, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Food');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 20, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 180, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 180, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 180, -1);
    }
    done();
  });

  it('has proportional transaction impacting asset value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Sell all Stff',
          FROM: 'Stff',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: 'MyCa',
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'January 3 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: '10',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    // Lose 100% of MyCa
    expectEvals(evals, 2, 'Stff', 'Wed Jan 03 2018', 0, -1);
    // Gain 50% of the transaction amount in MyCa
    expectEvals(evals, 3, 'MyCa', 'Wed Jan 03 2018', 121, -1);
    expectEvals(evals, 4, 'MyCa', 'Thu Feb 01 2018', 122.15, 2);
    expectEvals(evals, 5, 'Stff', 'Fri Feb 02 2018', 0, -1);

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
    done();
  });

  it('transaction between assets at exact starts of assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Sell all Stff',
          FROM: 'Stff',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.5',
          TO: 'MyCa',
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 2 2018',
          VALUE: '10',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'MyCa', 'Tue Jan 02 2018', 10, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Stff', 'Tue Jan 02 2018', 111, -1);
    expectEvals(evals, 3, 'MyCa', 'Tue Jan 02 2018', 121, -1);
    expectEvals(evals, 4, 'MyCa', 'Fri Feb 02 2018', 122.15, 2);
    expectEvals(evals, 5, 'Stff', 'Fri Feb 02 2018', 112.05, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 111, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('MyCa');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 121, -1);
    }
    done();
  });

  it('conditional transaction stops negative cash absolute', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction stops negative cash proportional', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction stops negative cash abs->proportional', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction transfers more than once', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction transfers stop when funds run out abs to', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction transfers stop when funds run out prop to', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction from multiple sources simple', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, assetChartFocus, CASH_ASSET_NAME, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

    const x = model.settings.find(s => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    expect(result.assetData.length).toBe(4);

    expect(result.assetData[0].item.NAME).toBe('Cash' + separator + 'Cash');
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

    expect(result.assetData[1].item.NAME).toBe('Food' + separator + 'Cash');
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

    expect(result.assetData[2].item.NAME).toBe('Stf1' + separator + 'Cash');
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
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 2, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('Stf2' + separator + 'Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }
    done();
  });

  it('conditional transaction from multiple sources by quantity', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          NAME: 'pound',
          VALUE: '1.0',
          HINT: 'a setting for a currency',
          TYPE: constType,
        },
      ],
    };
    setROI(model, roi);
    setSetting(model.settings, assetChartFocus, CASH_ASSET_NAME, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

    const x = model.settings.find(s => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    expect(result.assetData.length).toBe(4);

    expect(result.assetData[0].item.NAME).toBe('Cash' + separator + 'Cash');
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

    expect(result.assetData[1].item.NAME).toBe('Food' + separator + 'Cash');
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

    expect(result.assetData[2].item.NAME).toBe('Stf1' + separator + 'Cash');
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
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 2, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('Stf2' + separator + 'Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }
    done();
  });

  it('conditional transaction from multiple sources by category', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, assetChartFocus, CASH_ASSET_NAME, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

    const x = model.settings.find(s => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    expect(result.assetData.length).toBe(4);

    expect(result.assetData[0].item.NAME).toBe('Cash' + separator + 'Cash');
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

    expect(result.assetData[1].item.NAME).toBe('Food' + separator + 'Cash');
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

    expect(result.assetData[2].item.NAME).toBe('Stf1' + separator + 'Cash');
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
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 2, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('Stf2' + separator + 'Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10, -1);
    }
    done();
  });

  it('conditional transaction from multiple sources abs->prop', done => {
    const roi = {
      start: 'March 15, 2018 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    //printTestCodeForChart(result);

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

  it('income  growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const assetName = 'sthg';
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: assetName,
          START: 'December 31 2017',
          VALUE: '500',
          GROWTH: '12',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'sthg', 'Sun Dec 31 2017', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 2, 'sthg', 'Wed Jan 31 2018', 504.74, 2);
    expectEvals(evals, 3, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 4, getnetincLabel('Joe'), 'Thu Apr 05 2018', 10.05, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    let chartPts = result.incomesData[0].chartDataPoints;
    {
      expect(chartPts.length).toBe(3);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(5);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBeCloseTo(5.05);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('sthg');
    {
      chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(500);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(504.7443964672915);
    }
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('two expenses impact cash', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 2 2018',
          END: 'February 1 2018',
          NAME: 'Phon',
          VALUE: '100',
          VALUE_SET: 'January 1 2018',
        },
        {
          ...simpleExpense,
          START: 'January 3 2018',
          END: 'February 2 2018',
          NAME: 'Cars',
          VALUE: '10',
          VALUE_SET: 'January 1 2018',
        },
      ],
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 3, 'Cars', 'Wed Jan 03 2018', 10, -1);
    expectEvals(evals, 4, 'Cash', 'Wed Jan 03 2018', 390, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 390, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 390, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(2);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(100);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.expensesData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(10);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(500);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(390);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(390);
    }
    done();
  });

  it('two incomes impact cash', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'January 2 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
        },
        {
          ...simpleExpense,
          START: 'January 10 2018',
          END: 'March 9 2018',
          NAME: 'java',
          VALUE: '500',
          VALUE_SET: 'January 1 2018',
          LIABILITY: 'Joe' + incomeTax,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 505, -1);
    expectEvals(evals, 3, 'java', 'Wed Jan 10 2018', 500, -1);
    expectEvals(evals, 4, 'Cash', 'Wed Jan 10 2018', 1005, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1005, -1);
    expectEvals(evals, 6, 'java', 'Sat Feb 10 2018', 500, -1);
    expectEvals(evals, 7, 'Cash', 'Sat Feb 10 2018', 1505, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1505, -1);
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 1000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(5);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(0);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(0);
    }

    expect(result.incomesData[1].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(0);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(500);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(500);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expect(chartPts[0].label).toBe('Fri Dec 01 2017');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Mon Jan 01 2018');
      expect(chartPts[1].y).toBe(505);
      expect(chartPts[2].label).toBe('Thu Feb 01 2018');
      expect(chartPts[2].y).toBe(1005);
      expect(chartPts[3].label).toBe('Thu Mar 01 2018');
      expect(chartPts[3].y).toBe(1505);
    }
    done();
  });

  // income tax is evident on liable income
  // one income was liable, one was not
  it('two incomes straddling April', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
  it('income over multiple Aprils', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2020 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(37);
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
    expectEvals(evals, 10, 'Cash', 'Fri Jun 01 2018', 25509, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Jul 01 2018', 25509, -1);
    expectEvals(evals, 12, 'Cash', 'Wed Aug 01 2018', 25509, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Sep 01 2018', 25509, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Oct 01 2018', 25509, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Nov 01 2018', 25509, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Dec 01 2018', 25509, -1);
    expectEvals(evals, 17, 'Cash', 'Tue Jan 01 2019', 25509, -1);
    expectEvals(evals, 18, 'Cash', 'Fri Feb 01 2019', 25509, -1);
    expectEvals(evals, 19, 'Cash', 'Fri Mar 01 2019', 25509, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Apr 01 2019', 25509, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Apr 05 2019', 25508, -1);
    expectEvals(evals, 22, '(incomeTax)', 'Fri Apr 05 2019', 1, -1);
    expectEvals(evals, 23, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12504, -1);
    expectEvals(evals, 24, 'Cash', 'Wed May 01 2019', 25508, -1);
    expectEvals(evals, 25, 'Cash', 'Sat Jun 01 2019', 25508, -1);
    expectEvals(evals, 26, 'Cash', 'Mon Jul 01 2019', 25508, -1);
    expectEvals(evals, 27, 'Cash', 'Thu Aug 01 2019', 25508, -1);
    expectEvals(evals, 28, 'Cash', 'Sun Sep 01 2019', 25508, -1);
    expectEvals(evals, 29, 'Cash', 'Tue Oct 01 2019', 25508, -1);
    expectEvals(evals, 30, 'Cash', 'Fri Nov 01 2019', 25508, -1);
    expectEvals(evals, 31, 'Cash', 'Sun Dec 01 2019', 25508, -1);
    expectEvals(evals, 32, 'Cash', 'Wed Jan 01 2020', 25508, -1);
    expectEvals(evals, 33, 'Cash', 'Sat Feb 01 2020', 25508, -1);
    expectEvals(evals, 34, 'Cash', 'Sun Mar 01 2020', 25508, -1);
    expectEvals(evals, 35, 'Cash', 'Wed Apr 01 2020', 25508, -1);
    expectEvals(evals, 36, 'Cash', 'Fri May 01 2020', 25508, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 25509, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 25509, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 25509, -1);
      expectChartData(chartPts, 6, 'Sat Sep 01 2018', 25509, -1);
      expectChartData(chartPts, 7, 'Mon Oct 01 2018', 25509, -1);
      expectChartData(chartPts, 8, 'Thu Nov 01 2018', 25509, -1);
      expectChartData(chartPts, 9, 'Sat Dec 01 2018', 25509, -1);
      expectChartData(chartPts, 10, 'Tue Jan 01 2019', 25509, -1);
      expectChartData(chartPts, 11, 'Fri Feb 01 2019', 25509, -1);
      expectChartData(chartPts, 12, 'Fri Mar 01 2019', 25509, -1);
      expectChartData(chartPts, 13, 'Mon Apr 01 2019', 25509, -1);
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

  it('payLowTax on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('tax exempt on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Tue May 01 2018', 13005, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payHighTax on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('tax allowance reduces for high earners', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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
    expectEvals(evals, 5, 'Joe income (net)', 'Thu Apr 05 2018', 72550, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 73050, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 27550, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 72550, -1);
    }
    done();
  });

  it('payTopTax on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('taxBands grow with cpi', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'April 10, 2021 00:00:00',
    };
    const smallCPI = 0.05; // non zero cpi ensures tax bands grow over time
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2021',
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
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };
    setSetting(model.settings, cpi, `${smallCPI}`, constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(117);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 1042.5, 2);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 1542.5, 2);
    expectEvals(evals, 3, getnetincLabel('Joe'), 'Thu Apr 05 2018', 1042.5, 2);
    expectEvals(evals, 4, 'Cash', 'Tue May 01 2018', 1542.56, 2);
    expectEvals(evals, 5, 'PRnd', 'Tue May 01 2018', 1042.5, 2);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 2585.06, 2);
    expectEvals(evals, 7, 'Cash', 'Fri Jun 01 2018', 2585.17, 2);
    expectEvals(evals, 8, 'PRnd', 'Fri Jun 01 2018', 1042.5, 2);
    expectEvals(evals, 9, 'Cash', 'Fri Jun 01 2018', 3627.67, 2);
    expectEvals(evals, 10, 'Cash', 'Sun Jul 01 2018', 3627.82, 2);
    expectEvals(evals, 11, 'PRnd', 'Sun Jul 01 2018', 1042.5, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', 4670.32, 2);
    expectEvals(evals, 13, 'Cash', 'Wed Aug 01 2018', 4670.52, 2);
    expectEvals(evals, 14, 'PRnd', 'Wed Aug 01 2018', 1042.5, 2);
    expectEvals(evals, 15, 'Cash', 'Wed Aug 01 2018', 5713.02, 2);
    expectEvals(evals, 16, 'Cash', 'Sat Sep 01 2018', 5713.26, 2);
    expectEvals(evals, 17, 'PRnd', 'Sat Sep 01 2018', 1042.5, 2);
    expectEvals(evals, 18, 'Cash', 'Sat Sep 01 2018', 6755.76, 2);
    expectEvals(evals, 19, 'Cash', 'Mon Oct 01 2018', 6756.04, 2);
    expectEvals(evals, 20, 'PRnd', 'Mon Oct 01 2018', 1042.5, 2);
    expectEvals(evals, 21, 'Cash', 'Mon Oct 01 2018', 7798.54, 2);
    expectEvals(evals, 22, 'Cash', 'Thu Nov 01 2018', 7798.86, 2);
    expectEvals(evals, 23, 'PRnd', 'Thu Nov 01 2018', 1042.5, 2);
    expectEvals(evals, 24, 'Cash', 'Thu Nov 01 2018', 8841.36, 2);
    expectEvals(evals, 25, 'Cash', 'Sat Dec 01 2018', 8841.73, 2);
    expectEvals(evals, 26, 'PRnd', 'Sat Dec 01 2018', 1042.5, 2);
    expectEvals(evals, 27, 'Cash', 'Sat Dec 01 2018', 9884.23, 2);
    expectEvals(evals, 28, 'Cash', 'Tue Jan 01 2019', 9884.64, 2);
    expectEvals(evals, 29, 'PRnd', 'Tue Jan 01 2019', 1042.5, 2);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 10927.14, 2);
    expectEvals(evals, 31, 'Cash', 'Fri Feb 01 2019', 10927.6, 2);
    expectEvals(evals, 32, 'PRnd', 'Fri Feb 01 2019', 1042.5, 2);
    expectEvals(evals, 33, 'Cash', 'Fri Feb 01 2019', 11970.1, 2);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 11970.6, 2);
    expectEvals(evals, 35, 'PRnd', 'Fri Mar 01 2019', 1042.5, 2);
    expectEvals(evals, 36, 'Cash', 'Fri Mar 01 2019', 13013.1, 2);
    expectEvals(evals, 37, 'Cash', 'Mon Apr 01 2019', 13013.64, 2);
    expectEvals(evals, 38, 'PRnd', 'Mon Apr 01 2019', 1042.5, 2);
    expectEvals(evals, 39, 'Cash', 'Mon Apr 01 2019', 14056.14, 2);
    expectEvals(evals, 40, 'Cash', 'Fri Apr 05 2019', 14055.39, 2);
    expectEvals(evals, 41, '(incomeTax)', 'Fri Apr 05 2019', 0.75, 2);
    expectEvals(
      evals,
      42,
      getnetincLabel('Joe'),
      'Fri Apr 05 2019',
      12509.25,
      2,
    );
    expectEvals(evals, 43, 'Cash', 'Wed May 01 2019', 14055.97, 2);
    expectEvals(evals, 44, 'PRnd', 'Wed May 01 2019', 1042.5, 2);
    expectEvals(evals, 45, 'Cash', 'Wed May 01 2019', 15098.47, 2);
    expectEvals(evals, 46, 'Cash', 'Sat Jun 01 2019', 15099.1, 2);
    expectEvals(evals, 47, 'PRnd', 'Sat Jun 01 2019', 1042.5, 2);
    expectEvals(evals, 48, 'Cash', 'Sat Jun 01 2019', 16141.6, 2);
    expectEvals(evals, 49, 'Cash', 'Mon Jul 01 2019', 16142.27, 2);
    expectEvals(evals, 50, 'PRnd', 'Mon Jul 01 2019', 1042.5, 2);
    expectEvals(evals, 51, 'Cash', 'Mon Jul 01 2019', 17184.77, 2);
    expectEvals(evals, 52, 'Cash', 'Thu Aug 01 2019', 17185.49, 2);
    expectEvals(evals, 53, 'PRnd', 'Thu Aug 01 2019', 1042.5, 2);
    expectEvals(evals, 54, 'Cash', 'Thu Aug 01 2019', 18227.99, 2);
    expectEvals(evals, 55, 'Cash', 'Sun Sep 01 2019', 18228.75, 2);
    expectEvals(evals, 56, 'PRnd', 'Sun Sep 01 2019', 1042.5, 2);
    expectEvals(evals, 57, 'Cash', 'Sun Sep 01 2019', 19271.25, 2);
    expectEvals(evals, 58, 'Cash', 'Tue Oct 01 2019', 19272.05, 2);
    expectEvals(evals, 59, 'PRnd', 'Tue Oct 01 2019', 1042.5, 2);
    expectEvals(evals, 60, 'Cash', 'Tue Oct 01 2019', 20314.55, 2);
    expectEvals(evals, 61, 'Cash', 'Fri Nov 01 2019', 20315.4, 2);
    expectEvals(evals, 62, 'PRnd', 'Fri Nov 01 2019', 1042.5, 2);
    expectEvals(evals, 63, 'Cash', 'Fri Nov 01 2019', 21357.9, 2);
    expectEvals(evals, 64, 'Cash', 'Sun Dec 01 2019', 21358.79, 2);
    expectEvals(evals, 65, 'PRnd', 'Sun Dec 01 2019', 1042.5, 2);
    expectEvals(evals, 66, 'Cash', 'Sun Dec 01 2019', 22401.29, 2);
    expectEvals(evals, 67, 'Cash', 'Wed Jan 01 2020', 22402.22, 2);
    expectEvals(evals, 68, 'PRnd', 'Wed Jan 01 2020', 1042.5, 2);
    expectEvals(evals, 69, 'Cash', 'Wed Jan 01 2020', 23444.72, 2);
    expectEvals(evals, 70, 'Cash', 'Sat Feb 01 2020', 23445.7, 2);
    expectEvals(evals, 71, 'PRnd', 'Sat Feb 01 2020', 1042.5, 2);
    expectEvals(evals, 72, 'Cash', 'Sat Feb 01 2020', 24488.2, 2);
    expectEvals(evals, 73, 'Cash', 'Sun Mar 01 2020', 24489.22, 2);
    expectEvals(evals, 74, 'PRnd', 'Sun Mar 01 2020', 1042.5, 2);
    expectEvals(evals, 75, 'Cash', 'Sun Mar 01 2020', 25531.72, 2);
    expectEvals(evals, 76, 'Cash', 'Wed Apr 01 2020', 25532.78, 2);
    expectEvals(evals, 77, 'PRnd', 'Wed Apr 01 2020', 1042.5, 2);
    expectEvals(evals, 78, 'Cash', 'Wed Apr 01 2020', 26575.28, 2);
    expectEvals(evals, 79, getnetincLabel('Joe'), 'Sun Apr 05 2020', 12510, -1);
    expectEvals(evals, 80, 'Cash', 'Fri May 01 2020', 26576.39, 2);
    expectEvals(evals, 81, 'PRnd', 'Fri May 01 2020', 1042.5, 2);
    expectEvals(evals, 82, 'Cash', 'Fri May 01 2020', 27618.89, 2);
    expectEvals(evals, 83, 'Cash', 'Mon Jun 01 2020', 27620.04, 2);
    expectEvals(evals, 84, 'PRnd', 'Mon Jun 01 2020', 1042.5, 2);
    expectEvals(evals, 85, 'Cash', 'Mon Jun 01 2020', 28662.54, 2);
    expectEvals(evals, 86, 'Cash', 'Wed Jul 01 2020', 28663.73, 2);
    expectEvals(evals, 87, 'PRnd', 'Wed Jul 01 2020', 1042.5, 2);
    expectEvals(evals, 88, 'Cash', 'Wed Jul 01 2020', 29706.23, 2);
    expectEvals(evals, 89, 'Cash', 'Sat Aug 01 2020', 29707.47, 2);
    expectEvals(evals, 90, 'PRnd', 'Sat Aug 01 2020', 1042.5, 2);
    expectEvals(evals, 91, 'Cash', 'Sat Aug 01 2020', 30749.97, 2);
    expectEvals(evals, 92, 'Cash', 'Tue Sep 01 2020', 30751.25, 2);
    expectEvals(evals, 93, 'PRnd', 'Tue Sep 01 2020', 1042.5, 2);
    expectEvals(evals, 94, 'Cash', 'Tue Sep 01 2020', 31793.75, 2);
    expectEvals(evals, 95, 'Cash', 'Thu Oct 01 2020', 31795.08, 2);
    expectEvals(evals, 96, 'PRnd', 'Thu Oct 01 2020', 1042.5, 2);
    expectEvals(evals, 97, 'Cash', 'Thu Oct 01 2020', 32837.58, 2);
    expectEvals(evals, 98, 'Cash', 'Sun Nov 01 2020', 32838.94, 2);
    expectEvals(evals, 99, 'PRnd', 'Sun Nov 01 2020', 1042.5, 2);
    expectEvals(evals, 100, 'Cash', 'Sun Nov 01 2020', 33881.44, 2);
    expectEvals(evals, 101, 'Cash', 'Tue Dec 01 2020', 33882.86, 2);
    expectEvals(evals, 102, 'PRnd', 'Tue Dec 01 2020', 1042.5, 2);
    expectEvals(evals, 103, 'Cash', 'Tue Dec 01 2020', 34925.36, 2);
    expectEvals(evals, 104, 'Cash', 'Fri Jan 01 2021', 34926.81, 2);
    expectEvals(evals, 105, 'PRnd', 'Fri Jan 01 2021', 1042.5, 2);
    expectEvals(evals, 106, 'Cash', 'Fri Jan 01 2021', 35969.31, 2);
    expectEvals(evals, 107, 'Cash', 'Mon Feb 01 2021', 35970.81, 2);
    expectEvals(evals, 108, 'PRnd', 'Mon Feb 01 2021', 1042.5, 2);
    expectEvals(evals, 109, 'Cash', 'Mon Feb 01 2021', 37013.31, 2);
    expectEvals(evals, 110, 'Cash', 'Mon Mar 01 2021', 37014.85, 2);
    expectEvals(evals, 111, 'PRnd', 'Mon Mar 01 2021', 1042.5, 2);
    expectEvals(evals, 112, 'Cash', 'Mon Mar 01 2021', 38057.35, 2);
    expectEvals(evals, 113, 'Cash', 'Thu Apr 01 2021', 38058.94, 2);
    expectEvals(evals, 114, 'PRnd', 'Thu Apr 01 2021', 1042.5, 2);
    expectEvals(evals, 115, 'Cash', 'Thu Apr 01 2021', 39101.44, 2);
    expectEvals(
      evals,
      116,
      getnetincLabel('Joe'),
      'Mon Apr 05 2021',
      12510,
      -1,
    );

    done();
  });

  it('payLowTax on combined income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payHighTax on combined income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payTopTax on two income payments', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payLowTax on separate income payments', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payHighTax on separate income payments', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('payTopTax on separate income payments', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
  it('too low NI income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'May 9 2018',
          NAME: 'java',
          VALUE: '8628', // 8628 is free of NI liability
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 8628, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 9128, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 9128, -1);
    expectEvals(evals, 4, getnetincLabel('Joe'), 'Thu Apr 05 2018', 8628, -1);
    expectEvals(evals, 5, 'java', 'Tue Apr 10 2018', 8628, -1);
    expectEvals(evals, 6, 'Cash', 'Tue Apr 10 2018', 17756, -1);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 17756, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Fri Apr 05 2019', 8628, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 8628, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 8628, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 9128, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 17756, -1);
    }
    done();
  });

  // NI payable at low rate
  it('pay low rate NI income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '8728', // 8628 is free of NI liability, expect 12 to be paid
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 8728, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 9228, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 9228, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 9216, -1);
    expectEvals(evals, 5, '(NI)', 'Thu Apr 05 2018', 12.0, 2);
    expectEvals(evals, 6, getnetincLabel('Joe'), 'Thu Apr 05 2018', 8716, -1);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 9216, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 8728, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 9228, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 9216, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 12.0, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 8716, -1);
    }

    done();
  });

  // NI payable at high rate
  it('pay high rate NI income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '50104', // 50004 is bottom of high rate band, expect 2 + 4965.12 to be paid
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 50104, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 50604, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 50604, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 45636.88, 2);
    expectEvals(evals, 5, '(NI)', 'Thu Apr 05 2018', 4967.12, 2);
    expectEvals(
      evals,
      6,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      45136.88,
      2,
    );
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 45636.88, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 50104, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 50604, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 45636.88, 2);
    }
    done();
  });

  // income liable to both NI and Income tax
  it('pay NI and income tax', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(11);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 30500, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 30500, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 27935.36, 2);
    expectEvals(evals, 5, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(
      evals,
      6,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27435.36,
      2,
    );
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 24435.36, 2);
    expectEvals(evals, 8, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      23935.36,
      -1,
    );
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 24435.36, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24435.36, 2);
    }
    done();
  });

  it('pay no tax with RSUs', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '12000', // single payment  below allowance
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'oldRSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2017',
          VALUE: 'MyShare',
          QUANTITY: '120', //below tax allowance, no other income this year
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '120', //below tax allowance
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`, // Jane is not Joe
        },
        {
          ...simpleAsset,
          NAME: 'FutureRSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2019',
          VALUE: 'MyShare',
          QUANTITY: '500',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(30);
    expectEvals(evals, 0, 'MyShare', 'Sat Apr 01 2017', 100, -1);
    expectEvals(evals, 1, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 2, 'MyShare', 'Mon Apr 01 2019', 100, -1);
    expectEvals(evals, 3, 'quantityoldRSUasset', 'Sat Apr 01 2017', 120, -1);
    expectEvals(evals, 4, 'VestedEvaloldRSUasset', 'Sat Apr 01 2017', 100, -1);
    expectEvals(evals, 5, 'oldRSUasset', 'Sat Apr 01 2017', 12000, -1);
    expectEvals(evals, 6, 'Joe income (net)', 'Wed Apr 05 2017', 12000, -1);
    expectEvals(evals, 7, 'oldRSUasset', 'Mon May 01 2017', 12000, -1);
    expectEvals(evals, 8, 'oldRSUasset', 'Thu Jun 01 2017', 12000, -1);
    expectEvals(evals, 9, 'oldRSUasset', 'Sat Jul 01 2017', 12000, -1);
    expectEvals(evals, 10, 'oldRSUasset', 'Tue Aug 01 2017', 12000, -1);
    expectEvals(evals, 11, 'oldRSUasset', 'Fri Sep 01 2017', 12000, -1);
    expectEvals(evals, 12, 'oldRSUasset', 'Sun Oct 01 2017', 12000, -1);
    expectEvals(evals, 13, 'oldRSUasset', 'Wed Nov 01 2017', 12000, -1);
    expectEvals(evals, 14, 'oldRSUasset', 'Fri Dec 01 2017', 12000, -1);
    expectEvals(evals, 15, 'oldRSUasset', 'Mon Jan 01 2018', 12000, -1);
    expectEvals(evals, 16, 'oldRSUasset', 'Thu Feb 01 2018', 12000, -1);
    expectEvals(evals, 17, 'oldRSUasset', 'Thu Mar 01 2018', 12000, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 19, 'quantityRSUasset', 'Sun Apr 01 2018', 120, -1);
    expectEvals(evals, 20, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 21, 'RSUasset', 'Sun Apr 01 2018', 12000, -1);
    expectEvals(evals, 22, 'oldRSUasset', 'Sun Apr 01 2018', 12000, -1);
    expectEvals(evals, 23, 'PRnd', 'Sun Apr 01 2018', 12000, -1);
    expectEvals(evals, 24, 'Cash', 'Sun Apr 01 2018', 12500, -1);
    expectEvals(evals, 25, 'Joe income (net)', 'Thu Apr 05 2018', 12000, -1);
    expectEvals(evals, 26, 'Jane income (net)', 'Thu Apr 05 2018', 12000, -1);
    expectEvals(evals, 27, 'Cash', 'Tue May 01 2018', 12500, -1);
    expectEvals(evals, 28, 'RSUasset', 'Tue May 01 2018', 12000, -1);
    expectEvals(evals, 29, 'oldRSUasset', 'Tue May 01 2018', 12000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('oldRSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12000, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12000, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12000, -1);
    }

    done();
  });

  it('pay low tax with one RSU', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '150', //above tax allowance
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    //printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 150, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 15000, -1);
    expectEvals(evals, 5, 'quantityRSUasset', 'Thu Apr 05 2018', 145, -1);
    expectEvals(evals, 6, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 7, 'Jane income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 9, 'RSUasset', 'Tue May 01 2018', 14500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 15000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 14500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jane income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 14500, -1);
    }

    done();
  });

  it('pay low tax with two matching RSUs', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset1',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50', //above tax allowance
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset2',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '100',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 3, 'quantityRSUasset1', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 4, 'VestedEvalRSUasset1', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 5, 'RSUasset1', 'Sun Apr 01 2018', 5000, -1);
    expectEvals(evals, 6, 'quantityRSUasset2', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 7, 'VestedEvalRSUasset2', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 8, 'RSUasset2', 'Sun Apr 01 2018', 10000, -1);
    expectEvals(evals, 9, 'quantityRSUasset1', 'Thu Apr 05 2018', 45, -1);
    expectEvals(evals, 10, 'quantityRSUasset2', 'Thu Apr 05 2018', 100, -1);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 12, 'Jane income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 14, 'RSUasset1', 'Tue May 01 2018', 4500, -1);
    expectEvals(evals, 15, 'RSUasset2', 'Tue May 01 2018', 10000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 500,    -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUasset1');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 4500,    -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('RSUasset2');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10000,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 10000,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jane income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 500,    -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 14500,    -1);
    }

    done();
  });

  it('pay no tax with one revalued RSU', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'April 1 2018',
          VALUE: '500',
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '150',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '10.00',
          // this price is what governs income tax
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of share value',
          TO: 'MyShare',
          TO_VALUE: '100.0',
          // if they had been this price on vest
          // we would have bee liable to income tax
          DATE: 'April 2 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 150, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 10, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 5, 'MyShare', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 6, 'Jane income (net)', 'Thu Apr 05 2018', 1500, -1);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 8, 'RSUasset', 'Tue May 01 2018', 15000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 15000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(1);
    expect(result.taxData[0].item.NAME).toBe('Jane income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 1500, -1);
    }

    done();
  });

  it('pay low tax with one revalued RSU', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'June 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'March 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '150', //above tax allowance
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of share value early',
          TO: 'MyShare',
          TO_VALUE: '10.0',
          // price crash between vest and tax due
          DATE: 'March 2 2018',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue of share value late',
          TO: 'MyShare',
          TO_VALUE: '100.0',
          // price rise just after tax due
          DATE: 'May 6 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'MyShare', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Thu Mar 01 2018', 150, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Thu Mar 01 2018', 15000, -1);
    expectEvals(evals, 5, 'MyShare', 'Fri Mar 02 2018', 10, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 7, 'RSUasset', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 8, 'quantityRSUasset', 'Thu Apr 05 2018', 145, -1);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 10, 'Jane income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 12, 'RSUasset', 'Tue May 01 2018', 1450, -1);
    expectEvals(evals, 13, 'MyShare', 'Sun May 06 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 15, 'RSUasset', 'Fri Jun 01 2018', 14500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 15000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1450, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 14500, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jane income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 14500, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
    }
    done();
  });

  it('pay low tax with two revalued RSUs', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'June 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
          VALUE: '500',
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset1',
          CATEGORY: 'RSU',
          START: 'March 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '100',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset2',
          CATEGORY: 'RSU',
          START: 'March 3 2018',
          VALUE: 'MyShare',
          QUANTITY: '100',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of share value early',
          TO: 'MyShare',
          TO_VALUE: '50.0',
          DATE: 'March 2 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(23);
    expectEvals(evals, 0, 'MyShare', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 1, 'MyShare', 'Sat Mar 03 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 3, 'quantityRSUasset1', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 4, 'VestedEvalRSUasset1', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 5, 'RSUasset1', 'Thu Mar 01 2018', 10000, -1);
    expectEvals(evals, 6, 'MyShare', 'Fri Mar 02 2018', 50, -1);
    expectEvals(evals, 7, 'quantityRSUasset2', 'Sat Mar 03 2018', 100, -1);
    expectEvals(evals, 8, 'VestedEvalRSUasset2', 'Sat Mar 03 2018', 50, -1);
    expectEvals(evals, 9, 'RSUasset2', 'Sat Mar 03 2018', 5000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 11, 'RSUasset1', 'Sun Apr 01 2018', 5000, -1);
    expectEvals(evals, 12, 'RSUasset2', 'Tue Apr 03 2018', 5000, -1);
    expectEvals(evals, 13, 'quantityRSUasset1', 'Thu Apr 05 2018', 95, -1);
    expectEvals(evals, 14, 'quantityRSUasset2', 'Thu Apr 05 2018', 100, -1);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 16, 'Jane income (net)', 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', 500, -1);
    expectEvals(evals, 18, 'RSUasset1', 'Tue May 01 2018', 4750, -1);
    expectEvals(evals, 19, 'RSUasset2', 'Thu May 03 2018', 5000, -1);
    expectEvals(evals, 20, 'Cash', 'Fri Jun 01 2018', 500, -1);
    expectEvals(evals, 21, 'RSUasset1', 'Fri Jun 01 2018', 4750, -1);
    expectEvals(evals, 22, 'RSUasset2', 'Sun Jun 03 2018', 5000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 500,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 500,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 500,    -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUasset1');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 10000,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 4750,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 4750,    -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('RSUasset2');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 5000,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 5000,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jane income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 500,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0,    -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 14500,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0,    -1);
    }

    done();
  });

  it('payLowTax with RSU+Income', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '11500', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 5000, -1); // qty 50  * val 100 = 5000
    expectEvals(evals, 5, 'PRnd', 'Sun Apr 01 2018', 11500, -1); // 1000 short of allowance
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 12000, -1); //
    expectEvals(evals, 7, 'quantityRSUasset', 'Thu Apr 05 2018', 42, -1);
    // total 16500 = 12500 + 4000
    //  = 12500 + 80% * 4000 + 20% * 4000
    //  = 12500 + 80% * 4000 + 800
    //  = 12500 + 80% * 4000 + qty8 * val 100
    // we had 50 RSUs sell 8 of them to settle income tax
    expectEvals(evals, 8, '(incomeTax)', 'Thu Apr 05 2018', 800, -1);
    expectEvals(evals, 9, 'Joe income (net)', 'Thu Apr 05 2018', 15700, -1);
    // same value cash
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 12000, -1);
    expectEvals(evals, 11, 'RSUasset', 'Tue May 01 2018', 4200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 11500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 12000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 4200, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 800, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 15700, -1);
    }

    done();
  });

  it('pay low tax with two revalued RSUs + Income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'June 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '12500', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Jane${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset1',
          CATEGORY: 'RSU',
          START: 'March 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '100',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset2',
          CATEGORY: 'RSU',
          START: 'March 3 2018',
          VALUE: 'MyShare',
          QUANTITY: '100',
          CPI_IMMUNE: true,
          LIABILITY: `Jane${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of share value early',
          TO: 'MyShare',
          TO_VALUE: '50.0',
          DATE: 'March 2 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(25);
    expectEvals(evals, 0, 'MyShare', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 1, 'MyShare', 'Sat Mar 03 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 3, 'quantityRSUasset1', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 4, 'VestedEvalRSUasset1', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 5, 'RSUasset1', 'Thu Mar 01 2018', 10000, -1);
    expectEvals(evals, 6, 'MyShare', 'Fri Mar 02 2018', 50, -1);
    expectEvals(evals, 7, 'quantityRSUasset2', 'Sat Mar 03 2018', 100, -1);
    expectEvals(evals, 8, 'VestedEvalRSUasset2', 'Sat Mar 03 2018', 50, -1);
    expectEvals(evals, 9, 'RSUasset2', 'Sat Mar 03 2018', 5000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 11, 'RSUasset1', 'Sun Apr 01 2018', 5000, -1);
    expectEvals(evals, 12, 'PRnd', 'Sun Apr 01 2018', 12500, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 13000, -1);
    expectEvals(evals, 14, 'RSUasset2', 'Tue Apr 03 2018', 5000, -1);
    expectEvals(evals, 15, 'quantityRSUasset1', 'Thu Apr 05 2018', 80, -1);
    expectEvals(evals, 16, 'quantityRSUasset2', 'Thu Apr 05 2018', 80, -1);
    expectEvals(evals, 17, '(incomeTax)', 'Thu Apr 05 2018', 3000, -1);
    expectEvals(evals, 18, 'Jane income (net)', 'Thu Apr 05 2018', 24500, -1);
    expectEvals(evals, 19, 'Cash', 'Tue May 01 2018', 13000, -1);
    expectEvals(evals, 20, 'RSUasset1', 'Tue May 01 2018', 4000, -1);
    expectEvals(evals, 21, 'RSUasset2', 'Thu May 03 2018', 4000, -1);
    expectEvals(evals, 22, 'Cash', 'Fri Jun 01 2018', 13000, -1);
    expectEvals(evals, 23, 'RSUasset1', 'Fri Jun 01 2018', 4000, -1);
    expectEvals(evals, 24, 'RSUasset2', 'Sun Jun 03 2018', 4000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));
    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 12500,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 0,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0,    -1);
    }
    
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 500,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 13000,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 13000,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 13000,    -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUasset1');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 10000,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 4000,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 4000,    -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('RSUasset2');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 5000,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 4000,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Jane income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 3000,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0,    -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Tue May 01 2018', 24500,    -1);
    expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0,    -1);
    }
    
    done();
  });

  it('payLowTax with two RSUs + Income', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '11500', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset1',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '25',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
        {
          ...simpleAsset,
          NAME: 'RSUasset2',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '25',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(18);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 3, 'quantityRSUasset1', 'Sun Apr 01 2018', 25, -1);
    expectEvals(evals, 4, 'VestedEvalRSUasset1', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 5, 'RSUasset1', 'Sun Apr 01 2018', 2500, -1);
    expectEvals(evals, 6, 'quantityRSUasset2', 'Sun Apr 01 2018', 25, -1);
    expectEvals(evals, 7, 'VestedEvalRSUasset2', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 8, 'RSUasset2', 'Sun Apr 01 2018', 2500, -1);
    expectEvals(evals, 9, 'PRnd', 'Sun Apr 01 2018', 11500, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 12000, -1);
    expectEvals(evals, 11, 'quantityRSUasset1', 'Thu Apr 05 2018', 20, -1);
    expectEvals(evals, 12, 'quantityRSUasset2', 'Thu Apr 05 2018', 22, -1);
    expectEvals(evals, 13, '(incomeTax)', 'Thu Apr 05 2018', 800, -1);
    expectEvals(evals, 14, 'Joe income (net)', 'Thu Apr 05 2018', 15700, -1);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', 12000, -1);
    expectEvals(evals, 16, 'RSUasset1', 'Tue May 01 2018', 2000, -1);
    expectEvals(evals, 17, 'RSUasset2', 'Tue May 01 2018', 2200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    //printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 11500,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 0,    -1);
    }
    
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 12000,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 12000,    -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUasset1');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 2500,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 2000,    -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('RSUasset2');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 2500,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 2200,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 800,    -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 15700,    -1);
    }

    done();
  });

  it('payLowTax with RSU+BiggerIncome', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '13500', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 5000, -1); // qty 50  * val 100 = 5000
    expectEvals(evals, 5, 'PRnd', 'Sun Apr 01 2018', 13500, -1); // 1000 over allowance
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 14000, -1); //
    expectEvals(evals, 7, 'quantityRSUasset', 'Thu Apr 05 2018', 40, -1);
    // total 18500 = 12500 + 6000
    //  = 12500 + 80% * 6000 + 20% * 6000
    //  = 12500 + 80% * 6000 + 1200
    //  = 12500 + 80% * 6000 + qty10 * val 100 + 200
    // we had 50 RSUs sell 10 of them plus 200 cash to settle income tax
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 13800, -1);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 1200, -1);
    expectEvals(evals, 10, 'Joe income (net)', 'Thu Apr 05 2018', 17300, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 13800, -1);
    expectEvals(evals, 12, 'RSUasset', 'Tue May 01 2018', 4000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 13500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 14000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 13800, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 4000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 1200, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 17300, -1);
    }

    done();
  });

  it('payLowHighTax with RSU+BiggestIncome', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '49000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 5000, -1); // qty 50  * val 100 = 5000
    expectEvals(evals, 5, 'PRnd', 'Sun Apr 01 2018', 49000, -1); // 1000 below high band
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 49500, -1);
    expectEvals(evals, 7, 'quantityRSUasset', 'Thu Apr 05 2018', 32, -1);
    // total 54000 = 12500 + 37500 + 4000
    //  = 12500 + 80% * 37500 + 20% * 37500 + 60% * 4000 + 40% * 4000
    //  = 12500 + 80% * 37500 + 7500 + 60% * 4000 + 1600
    //  = 12500 + 80% * 37500 + qty2 * val 100 + 7300 cash + 60% * 4000 + qty16 * val100

    // we had 50 RSUs sell 18 of them plus 7300 cash to settle income tax
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 42200, -1);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 9100, -1);
    expectEvals(evals, 10, 'Joe income (net)', 'Thu Apr 05 2018', 44900, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 42200, -1);
    expectEvals(evals, 12, 'RSUasset', 'Tue May 01 2018', 3200, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 49000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 49500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 42200, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 3200, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 9100, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 44900, -1);
    }

    done();
  });

  it('payHighTax with RSU+Income', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '51000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 5000, -1); // qty 50  * val 100 = 5000
    expectEvals(evals, 5, 'PRnd', 'Sun Apr 01 2018', 51000, -1); // 1000 below high band
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 51500, -1);
    expectEvals(evals, 7, 'quantityRSUasset', 'Thu Apr 05 2018', 30, -1);
    // total 56000 = 12500 + 37500 + 6000
    //  = 12500 + 80% * 37500 + 20% * 37500 + 60% * 6000 + 40% * 6000
    //  = 12500 + 80% * 37500 + 7500 + 60% * 6000 + 2400
    //  = 12500 + 80% * 37500 + 7500 cash + 60% * 6000 + qty20 * val100 + 400 cash

    // we had 50 RSUs sell 18 of them plus 7300 cash to settle income tax
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 43600, -1);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 9900, -1);
    expectEvals(evals, 10, 'Joe income (net)', 'Thu Apr 05 2018', 46100, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 43600, -1);
    expectEvals(evals, 12, 'RSUasset', 'Tue May 01 2018', 3000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 51000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 51500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 43600, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 3000, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 9900, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 46100, -1);
    }

    done();
  });

  it('payHighTopTax with RSU+Income', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '149000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: `Joe${incomeTax}`,
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
        {
          ...simpleAsset,
          NAME: 'RSUasset',
          CATEGORY: 'RSU',
          START: 'April 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '50',
          CPI_IMMUNE: true,
          LIABILITY: `Joe${incomeTax}`,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'MyShare',
          VALUE: '100.00',
          HINT: 'RUSs granted in these',
          TYPE: custom,
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'MyShare', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 2, 'quantityRSUasset', 'Sun Apr 01 2018', 50, -1);
    expectEvals(evals, 3, 'VestedEvalRSUasset', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 4, 'RSUasset', 'Sun Apr 01 2018', 5000, -1); // qty 50  * val 100 = 5000
    expectEvals(evals, 5, 'PRnd', 'Sun Apr 01 2018', 149000, -1); // 1000 below high band
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 149500, -1);
    expectEvals(evals, 7, 'quantityRSUasset', 'Thu Apr 05 2018', 28, -1);
    // total 154000 = 0 + 50000 + 100000 + 4000
    //  = 0 + 80% * 50000 + 20% * 50000 + 60% * 100000 + 40% * 100000 + 55% * 4000 + 45% * 4000
    //  = 0 + 80% * 50000 + 10000 +      60% * 100000 + 40000 + 55% * 4000 + 1800
    //  = 0 + 80% * 50000 + 10000 cash + 60% * 100000 + 4qty * 100val + 39600 cash + 55% * 4000 + qty18 * 100val 
    //  = 0 + 80% * 50000 + 60% * 100000 + 55% * 4000 + 22qty * 100val + 49600 cash

    // we had 50 RSUs sell 18 of them plus 7300 cash to settle income tax
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 99900, -1);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 51800.00, 2);
    expectEvals(evals, 10, 'Joe income (net)', 'Thu Apr 05 2018', 102200, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 99900, -1);
    expectEvals(evals, 12, 'RSUasset', 'Tue May 01 2018', 2800, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 149000,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 0,    -1);
    }
    
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 149500,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 99900,    -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUasset');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 5000,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 2800,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 51800.00, 2);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(2);
    expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 1, 'Tue May 01 2018', 102200,    -1);
    }

    done();
  });

  it('has monthly transaction creating cash debt', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Each month buy food',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '100',
          DATE: 'January 2 2018',
          RECURRENCE: '1m',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(30);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'Cash', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Mar 01 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Fri Mar 02 2018', 200, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 200, -1);
    expectEvals(evals, 7, 'Cash', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Wed May 02 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Jun 02 2018', -100, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', -100, -1);
    expectEvals(evals, 13, 'Cash', 'Mon Jul 02 2018', -200, -1);
    expectEvals(evals, 14, 'Cash', 'Wed Aug 01 2018', -200, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Aug 02 2018', -300, -1);
    expectEvals(evals, 16, 'Cash', 'Sat Sep 01 2018', -300, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Sep 02 2018', -400, -1);
    expectEvals(evals, 18, 'Cash', 'Mon Oct 01 2018', -400, -1);
    expectEvals(evals, 19, 'Cash', 'Tue Oct 02 2018', -500, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Nov 01 2018', -500, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Nov 02 2018', -600, -1);
    expectEvals(evals, 22, 'Cash', 'Sat Dec 01 2018', -600, -1);
    expectEvals(evals, 23, 'Cash', 'Sun Dec 02 2018', -700, -1);
    expectEvals(evals, 24, 'Cash', 'Tue Jan 01 2019', -700, -1);
    expectEvals(evals, 25, 'Cash', 'Wed Jan 02 2019', -800, -1);
    expectEvals(evals, 26, 'Cash', 'Fri Feb 01 2019', -800, -1);
    expectEvals(evals, 27, 'Cash', 'Sat Feb 02 2019', -900, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Mar 01 2019', -900, -1);
    expectEvals(evals, 29, 'Cash', 'Sat Mar 02 2019', -1000, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(16);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 400, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 200, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 100, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', -100, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', -200, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', -300, -1);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', -400, -1);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', -500, -1);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', -600, -1);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', -700, -1);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', -800, -1);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', -900, -1);
    }
    done();
  });

  it('pay into defined contributions pension simplest', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'PensionPnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'PensionPnsh', 'Sat Mar 10 2018', 1500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'PensionPnsh', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27435.36,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      24235.36,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 14, 'PensionPnsh', 'Tue May 01 2018', 1500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(pension + 'Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }
    done();
  });

  it('pay into defined contributions pension with employer contribution', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'PensionPnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'PensionPnsh', 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'PensionPnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27435.36,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      24235.36,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 14, 'PensionPnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(pension + 'Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    done();
  });

  it('pay monthly pay into defined contributions pension with employer contribution', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('April 7 2017'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 4 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(72);
    expectEvals(evals, 0, 'Cash', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 1, 'PensionPnsh', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 3, 'PensionPnsh', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 4, 'java', 'Fri Apr 07 2017', 2500, -1);
    expectEvals(evals, 5, 'PensionPnsh', 'Fri Apr 07 2017', 375, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Apr 07 2017', 2375, -1);
    expectEvals(evals, 7, 'Cash', 'Mon May 01 2017', 2375, -1);
    expectEvals(evals, 8, 'PensionPnsh', 'Mon May 01 2017', 375, -1);
    expectEvals(evals, 9, 'java', 'Sun May 07 2017', 2500, -1);
    expectEvals(evals, 10, 'PensionPnsh', 'Sun May 07 2017', 750, -1);
    expectEvals(evals, 11, 'Cash', 'Sun May 07 2017', 4750, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Jun 01 2017', 4750, -1);
    expectEvals(evals, 13, 'PensionPnsh', 'Thu Jun 01 2017', 750, -1);
    expectEvals(evals, 14, 'java', 'Wed Jun 07 2017', 2500, -1);
    expectEvals(evals, 15, 'PensionPnsh', 'Wed Jun 07 2017', 1125, -1);
    expectEvals(evals, 16, 'Cash', 'Wed Jun 07 2017', 7125, -1);
    expectEvals(evals, 17, 'Cash', 'Sat Jul 01 2017', 7125, -1);
    expectEvals(evals, 18, 'PensionPnsh', 'Sat Jul 01 2017', 1125, -1);
    expectEvals(evals, 19, 'java', 'Fri Jul 07 2017', 2500, -1);
    expectEvals(evals, 20, 'PensionPnsh', 'Fri Jul 07 2017', 1500, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Jul 07 2017', 9500, -1);
    expectEvals(evals, 22, 'Cash', 'Tue Aug 01 2017', 9500, -1);
    expectEvals(evals, 23, 'PensionPnsh', 'Tue Aug 01 2017', 1500, -1);
    expectEvals(evals, 24, 'java', 'Mon Aug 07 2017', 2500, -1);
    expectEvals(evals, 25, 'PensionPnsh', 'Mon Aug 07 2017', 1875, -1);
    expectEvals(evals, 26, 'Cash', 'Mon Aug 07 2017', 11875, -1);
    expectEvals(evals, 27, 'Cash', 'Fri Sep 01 2017', 11875, -1);
    expectEvals(evals, 28, 'PensionPnsh', 'Fri Sep 01 2017', 1875, -1);
    expectEvals(evals, 29, 'java', 'Thu Sep 07 2017', 2500, -1);
    expectEvals(evals, 30, 'PensionPnsh', 'Thu Sep 07 2017', 2250, -1);
    expectEvals(evals, 31, 'Cash', 'Thu Sep 07 2017', 14250, -1);
    expectEvals(evals, 32, 'Cash', 'Sun Oct 01 2017', 14250, -1);
    expectEvals(evals, 33, 'PensionPnsh', 'Sun Oct 01 2017', 2250, -1);
    expectEvals(evals, 34, 'java', 'Sat Oct 07 2017', 2500, -1);
    expectEvals(evals, 35, 'PensionPnsh', 'Sat Oct 07 2017', 2625, -1);
    expectEvals(evals, 36, 'Cash', 'Sat Oct 07 2017', 16625, -1);
    expectEvals(evals, 37, 'Cash', 'Wed Nov 01 2017', 16625, -1);
    expectEvals(evals, 38, 'PensionPnsh', 'Wed Nov 01 2017', 2625, -1);
    expectEvals(evals, 39, 'java', 'Tue Nov 07 2017', 2500, -1);
    expectEvals(evals, 40, 'PensionPnsh', 'Tue Nov 07 2017', 3000, -1);
    expectEvals(evals, 41, 'Cash', 'Tue Nov 07 2017', 19000, -1);
    expectEvals(evals, 42, 'Cash', 'Fri Dec 01 2017', 19000, -1);
    expectEvals(evals, 43, 'PensionPnsh', 'Fri Dec 01 2017', 3000, -1);
    expectEvals(evals, 44, 'java', 'Thu Dec 07 2017', 2500, -1);
    expectEvals(evals, 45, 'PensionPnsh', 'Thu Dec 07 2017', 3375, -1);
    expectEvals(evals, 46, 'Cash', 'Thu Dec 07 2017', 21375, -1);
    expectEvals(evals, 47, 'Cash', 'Mon Jan 01 2018', 21375, -1);
    expectEvals(evals, 48, 'PensionPnsh', 'Mon Jan 01 2018', 3375, -1);
    expectEvals(evals, 49, 'java', 'Sun Jan 07 2018', 2500, -1);
    expectEvals(evals, 50, 'PensionPnsh', 'Sun Jan 07 2018', 3750, -1);
    expectEvals(evals, 51, 'Cash', 'Sun Jan 07 2018', 23750, -1);
    expectEvals(evals, 52, 'Cash', 'Thu Feb 01 2018', 23750, -1);
    expectEvals(evals, 53, 'PensionPnsh', 'Thu Feb 01 2018', 3750, -1);
    expectEvals(evals, 54, 'java', 'Wed Feb 07 2018', 2500, -1);
    expectEvals(evals, 55, 'PensionPnsh', 'Wed Feb 07 2018', 4125, -1);
    expectEvals(evals, 56, 'Cash', 'Wed Feb 07 2018', 26125, -1);
    expectEvals(evals, 57, 'Cash', 'Thu Mar 01 2018', 26125, -1);
    expectEvals(evals, 58, 'PensionPnsh', 'Thu Mar 01 2018', 4125, -1);
    expectEvals(evals, 59, 'java', 'Wed Mar 07 2018', 2500, -1);
    expectEvals(evals, 60, 'PensionPnsh', 'Wed Mar 07 2018', 4500, -1);
    expectEvals(evals, 61, 'Cash', 'Wed Mar 07 2018', 28500, -1);
    expectEvals(evals, 62, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 63, 'PensionPnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 64, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 65, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(
      evals,
      66,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27435.36,
      2,
    );
    expectEvals(evals, 67, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 68, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      69,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      24235.36,
      2,
    );
    expectEvals(evals, 70, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 71, 'PensionPnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 26125, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(pension + 'Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 4125, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    done();
  });

  it('pay into defined contributions pension with salary sacrifice', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'PensionPnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'PensionPnsh', 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'PensionPnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26115.36, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 2384.64, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      26115.36,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 22915.36, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      22915.36,
      2,
    );
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 22915.36, 2);
    expectEvals(evals, 14, 'PensionPnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22915.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(pension + 'Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    done();
  });

  // should be rather like the "pay pension contributions simplest"
  // test - this involves a manual pension contribution
  // where that was siphoned off at source
  it('pay one-off pension contribution', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'PensionPnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Cash', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Tue Mar 20 2018', 28500, -1);
    expectEvals(evals, 5, 'PensionPnsh', 'Tue Mar 20 2018', 1500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 7, 'PensionPnsh', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 9, '(NI)', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(
      evals,
      10,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      27435.36,
      2,
    );
    expectEvals(evals, 11, 'Cash', 'Thu Apr 05 2018', 22435.36, 2);
    expectEvals(evals, 12, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(
      evals,
      13,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      23935.36,
      2,
    );
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 22435.36, 2);
    expectEvals(evals, 15, 'PensionPnsh', 'Tue May 01 2018', 1500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22435.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe(pension + 'Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }

    done();
  });

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on one off crystallized pension', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'April 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'get some pension', //
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = 'CrystallizedPensionJoe';

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }
    done();
  });

  it('pay income tax on conditional absolute crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(23);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      'CrystallizedPensionJoe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      'CrystallizedPensionJoe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      'CrystallizedPensionJoe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      7,
      'CrystallizedPensionJoe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      'CrystallizedPensionJoe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      'CrystallizedPensionJoe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      17,
      'CrystallizedPensionJoe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      19,
      'CrystallizedPensionJoe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 20, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      21,
      'CrystallizedPensionJoe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );
    expectEvals(evals, 22, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);
    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
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
    done();
  });

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on one off crystallized pension', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'April 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'get some pension', //
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      1,
      'CrystallizedPensionJoe',
      'Thu Mar 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      2,
      'CrystallizedPensionJoe',
      'Tue Mar 20 2018',
      30000,
      -1,
    );
    expectEvals(evals, 3, 'Cash', 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(
      evals,
      5,
      'CrystallizedPensionJoe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 7, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 8, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(2);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 30000, -1);
    }
    done();
  });

  it('pay income tax on conditional categorized crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
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
          NAME: crystallizedPension + 'Joe',
          START: 'Dec 1, 2017',
          VALUE: '60000',
          CATEGORY: 'TaxablePensions',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Jake',
          START: 'Dec 1, 2017',
          VALUE: '50000',
          CATEGORY: 'TaxablePensions',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(38);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      'CrystallizedPensionJake',
      'Fri Dec 01 2017',
      50000,
      -1,
    );
    expectEvals(
      evals,
      2,
      'CrystallizedPensionJoe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      4,
      'CrystallizedPensionJake',
      'Mon Jan 01 2018',
      50000,
      -1,
    );
    expectEvals(
      evals,
      5,
      'CrystallizedPensionJoe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      8,
      'CrystallizedPensionJake',
      'Thu Feb 01 2018',
      50000,
      -1,
    );
    expectEvals(
      evals,
      9,
      'CrystallizedPensionJoe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      10,
      'CrystallizedPensionJoe',
      'Sat Feb 03 2018',
      45000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -15000, -1);
    expectEvals(
      evals,
      12,
      'CrystallizedPensionJake',
      'Sat Feb 03 2018',
      35000,
      -1,
    );
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      15,
      'CrystallizedPensionJake',
      'Thu Mar 01 2018',
      35000,
      -1,
    );
    expectEvals(
      evals,
      16,
      'CrystallizedPensionJoe',
      'Thu Mar 01 2018',
      45000,
      -1,
    );
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      18,
      'CrystallizedPensionJake',
      'Sun Apr 01 2018',
      35000,
      -1,
    );
    expectEvals(
      evals,
      19,
      'CrystallizedPensionJoe',
      'Sun Apr 01 2018',
      45000,
      -1,
    );
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', -500, -1);
    expectEvals(evals, 21, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(evals, 22, 'Cash', 'Thu Apr 05 2018', -1000, -1);
    expectEvals(evals, 23, '(incomeTax)', 'Thu Apr 05 2018', 500, -1);
    expectEvals(
      evals,
      24,
      getnetincLabel('Jake'),
      'Thu Apr 05 2018',
      14500,
      -1,
    );
    expectEvals(evals, 25, getnetincLabel('Joe'), 'Thu Apr 05 2018', 14500, -1);
    expectEvals(evals, 26, 'Cash', 'Tue May 01 2018', -1000, -1);
    expectEvals(
      evals,
      27,
      'CrystallizedPensionJake',
      'Tue May 01 2018',
      35000,
      -1,
    );
    expectEvals(
      evals,
      28,
      'CrystallizedPensionJoe',
      'Tue May 01 2018',
      45000,
      -1,
    );
    expectEvals(evals, 29, 'Cash', 'Fri Jun 01 2018', -1000, -1);
    expectEvals(
      evals,
      30,
      'CrystallizedPensionJake',
      'Fri Jun 01 2018',
      35000,
      -1,
    );
    expectEvals(
      evals,
      31,
      'CrystallizedPensionJoe',
      'Fri Jun 01 2018',
      45000,
      -1,
    );
    expectEvals(evals, 32, 'Cash', 'Fri Apr 05 2019', 11500, -1);
    expectEvals(
      evals,
      33,
      'CrystallizedPensionJake',
      'Fri Apr 05 2019',
      22500,
      -1,
    );
    expectEvals(evals, 34, 'Cash', 'Fri Apr 05 2019', 24000, -1);
    expectEvals(
      evals,
      35,
      'CrystallizedPensionJoe',
      'Fri Apr 05 2019',
      32500,
      -1,
    );
    expectEvals(
      evals,
      36,
      getnetincLabel('Jake'),
      'Fri Apr 05 2019',
      12500,
      -1,
    );
    expectEvals(evals, 37, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -1000, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -1000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('CrystallizedPensionJoe');
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

    expect(result.assetData[2].item.NAME).toBe('CrystallizedPensionJake');
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

    done();
  });

  it('pay income tax on conditional proportional crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(23);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      'CrystallizedPensionJoe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      'CrystallizedPensionJoe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      'CrystallizedPensionJoe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      7,
      'CrystallizedPensionJoe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      'CrystallizedPensionJoe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      'CrystallizedPensionJoe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      17,
      'CrystallizedPensionJoe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      19,
      'CrystallizedPensionJoe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 20, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      21,
      'CrystallizedPensionJoe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );
    expectEvals(evals, 22, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
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
    done();
  });

  it('pay income tax on recurring conditional proportional crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(23);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      'CrystallizedPensionJoe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      'CrystallizedPensionJoe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      'CrystallizedPensionJoe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      7,
      'CrystallizedPensionJoe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      'CrystallizedPensionJoe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      'CrystallizedPensionJoe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      17,
      'CrystallizedPensionJoe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      19,
      'CrystallizedPensionJoe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 20, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      21,
      'CrystallizedPensionJoe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );
    expectEvals(evals, 22, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3500, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
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
    done();
  });

  it('pay income tax on list member recurring conditional proportional crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM: 'Stocks' + separator + '' + crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'Dec 1, 2017',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    //printTestCodeForEvals(evals);

    const cpj = 'CrystallizedPensionJoe';

    expect(evals.length).toBe(32);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(evals, 1, 'Stocks', 'Fri Dec 01 2017', 50, -1);
    expectEvals(evals, 2, cpj, 'Fri Dec 01 2017', 60000, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 4, 'Stocks', 'Mon Jan 01 2018', 50, -1);
    expectEvals(evals, 5, cpj, 'Mon Jan 01 2018', 60000, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(evals, 8, 'Stocks', 'Thu Feb 01 2018', 50, -1);
    expectEvals(evals, 9, cpj, 'Thu Feb 01 2018', 60000, -1);
    expectEvals(evals, 10, 'Stocks', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -29950, -1);
    expectEvals(evals, 12, cpj, 'Sat Feb 03 2018', 30050, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 15, 'Stocks', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 16, cpj, 'Thu Mar 01 2018', 30050, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 18, 'Stocks', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 19, cpj, 'Sun Apr 01 2018', 30050, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', -3490, -1);
    expectEvals(evals, 21, '(incomeTax)', 'Thu Apr 05 2018', 3490, -1);
    expectEvals(evals, 22, getnetincLabel('Joe'), 'Thu Apr 05 2018', 26460, -1);
    expectEvals(evals, 23, 'Cash', 'Tue May 01 2018', -3490, -1);
    expectEvals(evals, 24, 'Stocks', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 25, cpj, 'Tue May 01 2018', 30050, -1);
    expectEvals(evals, 26, 'Cash', 'Fri Jun 01 2018', -3490, -1);
    expectEvals(evals, 27, 'Stocks', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 28, cpj, 'Fri Jun 01 2018', 30050, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Apr 05 2019', 9010, -1);
    expectEvals(evals, 30, cpj, 'Fri Apr 05 2019', 17550, -1);
    expectEvals(evals, 31, getnetincLabel('Joe'), 'Fri Apr 05 2019', 12500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -3490, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', -3490, -1);
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

    expect(result.assetData[2].item.NAME).toBe(crystallizedPension + 'Joe');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(7);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 60000, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 60000, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 30050, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 30050, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 30050, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 30050, -1);
    }
    done();
  });

  // transfers from crystallized pensions are liable to Income tax
  it('pay income tax on monthly crystallized pension', done => {
    const roi = {
      start: 'April 6, 2018 00:00:00',
      end: 'April 2, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Each month GetSomePension', //
          FROM: crystallizedPension + 'Joe', // name is important
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'April 6 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    //  printTestCodeForEvals(evals);

    const cpj = 'CrystallizedPensionJoe';

    expect(evals.length).toBe(51);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(evals, 1, cpj, 'Fri Apr 06 2018', 60000, -1);
    expectEvals(evals, 2, cpj, 'Sat Apr 07 2018', 57500, -1);
    expectEvals(evals, 3, 'Cash', 'Sat Apr 07 2018', 2500, -1);
    expectEvals(evals, 4, 'Cash', 'Sun May 06 2018', 2500, -1);
    expectEvals(evals, 5, cpj, 'Sun May 06 2018', 57500, -1);
    expectEvals(evals, 6, cpj, 'Mon May 07 2018', 55000, -1);
    expectEvals(evals, 7, 'Cash', 'Mon May 07 2018', 5000, -1);
    expectEvals(evals, 8, 'Cash', 'Wed Jun 06 2018', 5000, -1);
    expectEvals(evals, 9, cpj, 'Wed Jun 06 2018', 55000, -1);
    expectEvals(evals, 10, cpj, 'Thu Jun 07 2018', 52500, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Jun 07 2018', 7500, -1);
    expectEvals(evals, 12, 'Cash', 'Fri Jul 06 2018', 7500, -1);
    expectEvals(evals, 13, cpj, 'Fri Jul 06 2018', 52500, -1);
    expectEvals(evals, 14, cpj, 'Sat Jul 07 2018', 50000, -1);
    expectEvals(evals, 15, 'Cash', 'Sat Jul 07 2018', 10000, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Aug 06 2018', 10000, -1);
    expectEvals(evals, 17, cpj, 'Mon Aug 06 2018', 50000, -1);
    expectEvals(evals, 18, cpj, 'Tue Aug 07 2018', 47500, -1);
    expectEvals(evals, 19, 'Cash', 'Tue Aug 07 2018', 12500, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Sep 06 2018', 12500, -1);
    expectEvals(evals, 21, cpj, 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 22, cpj, 'Fri Sep 07 2018', 45000, -1);
    expectEvals(evals, 23, 'Cash', 'Fri Sep 07 2018', 15000, -1);
    expectEvals(evals, 24, 'Cash', 'Sat Oct 06 2018', 15000, -1);
    expectEvals(evals, 25, cpj, 'Sat Oct 06 2018', 45000, -1);
    expectEvals(evals, 26, cpj, 'Sun Oct 07 2018', 42500, -1);
    expectEvals(evals, 27, 'Cash', 'Sun Oct 07 2018', 17500, -1);
    expectEvals(evals, 28, 'Cash', 'Tue Nov 06 2018', 17500, -1);
    expectEvals(evals, 29, cpj, 'Tue Nov 06 2018', 42500, -1);
    expectEvals(evals, 30, cpj, 'Wed Nov 07 2018', 40000, -1);
    expectEvals(evals, 31, 'Cash', 'Wed Nov 07 2018', 20000, -1);
    expectEvals(evals, 32, 'Cash', 'Thu Dec 06 2018', 20000, -1);
    expectEvals(evals, 33, cpj, 'Thu Dec 06 2018', 40000, -1);
    expectEvals(evals, 34, cpj, 'Fri Dec 07 2018', 37500, -1);
    expectEvals(evals, 35, 'Cash', 'Fri Dec 07 2018', 22500, -1);
    expectEvals(evals, 36, 'Cash', 'Sun Jan 06 2019', 22500, -1);
    expectEvals(evals, 37, cpj, 'Sun Jan 06 2019', 37500, -1);
    expectEvals(evals, 38, cpj, 'Mon Jan 07 2019', 35000, -1);
    expectEvals(evals, 39, 'Cash', 'Mon Jan 07 2019', 25000, -1);
    expectEvals(evals, 40, 'Cash', 'Wed Feb 06 2019', 25000, -1);
    expectEvals(evals, 41, cpj, 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 42, cpj, 'Thu Feb 07 2019', 32500, -1);
    expectEvals(evals, 43, 'Cash', 'Thu Feb 07 2019', 27500, -1);
    expectEvals(evals, 44, 'Cash', 'Wed Mar 06 2019', 27500, -1);
    expectEvals(evals, 45, cpj, 'Wed Mar 06 2019', 32500, -1);
    expectEvals(evals, 46, cpj, 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 47, 'Cash', 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 48, 'Cash', 'Fri Apr 05 2019', 26500, -1);
    expectEvals(evals, 49, '(incomeTax)', 'Fri Apr 05 2019', 3500, -1);
    expectEvals(evals, 50, getnetincLabel('Joe'), 'Fri Apr 05 2019', 26500, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 1, 'Sun May 06 2018', 2500, -1);
      expectChartData(chartPts, 2, 'Wed Jun 06 2018', 5000, -1);
      expectChartData(chartPts, 3, 'Fri Jul 06 2018', 7500, -1);
      expectChartData(chartPts, 4, 'Mon Aug 06 2018', 10000, -1);
      expectChartData(chartPts, 5, 'Thu Sep 06 2018', 12500, -1);
      expectChartData(chartPts, 6, 'Sat Oct 06 2018', 15000, -1);
      expectChartData(chartPts, 7, 'Tue Nov 06 2018', 17500, -1);
      expectChartData(chartPts, 8, 'Thu Dec 06 2018', 20000, -1);
      expectChartData(chartPts, 9, 'Sun Jan 06 2019', 22500, -1);
      expectChartData(chartPts, 10, 'Wed Feb 06 2019', 25000, -1);
      expectChartData(chartPts, 11, 'Wed Mar 06 2019', 27500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
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
    done();
  });

  it('use up income tax allowance from crystallized pension', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
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
          NAME: crystallizedPension + 'Joe', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const cpj = 'CrystallizedPensionJoe';

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    expect(result.assetData[1].item.NAME).toBe(crystallizedPension + 'Joe');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 60000, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 60000, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 47500, -1);
    }
    done();
  });

  it('pay into defined benefits pension simplest', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    //printTestCodeForEvals(evals);

    const pdbfn = 'PensionDBincomeFromNorwich';

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pdbfn, 'Sat Feb 10 2018', 50, -1);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pdbfn, 'Sat Mar 10 2018', 50, -1);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 490000, -1);
    expectEvals(evals, 4, pdbfn, 'Sat Mar 10 2018', 10050, -1);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 465500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 465500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 451734.96, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 13765.04, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      476234.96,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 259759.96, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      284259.96,
      2,
    );
    expectEvals(evals, 13, pdbfn, 'Tue Apr 10 2018', 10050, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 259759.96, 2);
    expectEvals(evals, 15, pdbfn, 'Thu May 10 2018', 10050, -1);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 259759.96, 2);
    expectEvals(evals, 17, pdbfn, 'Sun Jun 10 2018', 10050, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 269809.96, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 269809.96, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 269809.96, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    expect(result.incomesData[1].item.NAME).toBe('PensionDBincomeFromNorwich');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 10050, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 465500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 259759.96, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 259759.96, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 269809.96, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 269809.96, 2);
    }
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 13765.04, 2);
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 284259.96, 2);
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

  it('pay into defined benefits pension salary sacrifice', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
          FROM_VALUE: '' + 1.0 / 49, // pension accrual proportion
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pdbfn = 'PensionDBincomeFromNorwich';

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pdbfn, 'Sat Feb 10 2018', 50, -1);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pdbfn, 'Sat Mar 10 2018', 50, -1);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 490000, -1);
    expectEvals(evals, 4, pdbfn, 'Sat Mar 10 2018', 10050, -1);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 465500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 465500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 452224.96, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 13275.04, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      452224.96,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 260249.96, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      260249.96,
      2,
    );
    expectEvals(evals, 13, pdbfn, 'Tue Apr 10 2018', 10050, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 260249.96, 2);
    expectEvals(evals, 15, pdbfn, 'Thu May 10 2018', 10050, -1);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 260249.96, 2);
    expectEvals(evals, 17, pdbfn, 'Sun Jun 10 2018', 10050, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 270299.96, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 270299.96, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 270299.96, 2);
    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    //printTestCodeForChart(result);

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
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 10050, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 465500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 260249.96, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 260249.96, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 270299.96, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 270299.96, 2);
    }
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe(getNILabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 13275.04, 2);
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 260249.96, 2);
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

  it('pay into defined benefits pension apply cpi', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const pbdfn = 'PensionDBincomeFromNorwich';

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, pbdfn, 'Sat Feb 10 2018', 50.47, 2);
    expectEvals(evals, 1, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, pbdfn, 'Sat Mar 10 2018', 50.95, 2);
    expectEvals(evals, 3, 'java', 'Sat Mar 10 2018', 499343.14, 2);
    expectEvals(evals, 4, pbdfn, 'Sat Mar 10 2018', 10241.63, 2);
    expectEvals(evals, 5, 'Cash', 'Sat Mar 10 2018', 474375.98, 2);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 478877.23, 2);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 464925.33, 2);
    expectEvals(evals, 8, '(NI)', 'Thu Apr 05 2018', 13951.9, 2);
    expectEvals(
      evals,
      9,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      485391.23,
      2,
    );
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 268956.14, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 195969.19, 2);
    expectEvals(
      evals,
      12,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      289422.04,
      2,
    );
    expectEvals(evals, 13, pbdfn, 'Tue Apr 10 2018', 10338.81, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 271508.21, 2);
    expectEvals(evals, 15, pbdfn, 'Thu May 10 2018', 10436.91, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 274084.5, 2);
    expectEvals(evals, 17, pbdfn, 'Sun Jun 10 2018', 10535.95, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jun 10 2018', 284620.44, 2);
    expectEvals(evals, 19, 'Cash', 'Sun Jul 01 2018', 287321.15, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 290047.48, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    expect(result.incomesData[1].item.NAME).toBe('PensionDBincomeFromNorwich');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 10535.95, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 478877.23, 2);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 271508.21, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 274084.5, 2);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 287321.15, 2);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 290047.48, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(3);
    expect(result.taxData[0].item.NAME).toBe('Joe income (NI)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 13951.9, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 289422.04, 2);
      expectChartData(chartPts, 3, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Wed Aug 01 2018', 0, -1);
    }

    expect(result.taxData[2].item.NAME).toBe('Joe income (incomeTax)');
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

  it('pay into defined benefits pension cant have TO equal cash', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('pay into defined benefits pension cant have TO equal an arbitrary income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('pay into defined benefits pension transaction must begin pensionDB', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'August 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: makeDateFromString('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: makeDateFromString('April 9 2018'),
        },
        {
          NAME: 'pensionStartDraw',
          DATE: makeDateFromString('June 10 2018'),
        },
        {
          NAME: 'pensionStopDraw',
          DATE: makeDateFromString('July 9 2018'),
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(0);
    done();
  });

  it('should apply income tax to some asset growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500000',
          GROWTH: '12',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'savings', 'Mon Jan 01 2018', 500000, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 3, 'savings', 'Thu Feb 01 2018', 504744.4, 2);
    expectEvals(evals, 4, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 5, 'savings', 'Thu Mar 01 2018', 509533.81, 2);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 7, 'savings', 'Sun Apr 01 2018', 514368.67, 2);
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', -373.73, 2);
    expectEvals(evals, 9, '(incomeTax)', 'Thu Apr 05 2018', 373.73, 2);
    expectEvals(
      evals,
      10,
      getnetincLabel('Joe'),
      'Thu Apr 05 2018',
      13994.94,
      2,
    );
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', -373.73, 2);
    expectEvals(evals, 12, 'savings', 'Tue May 01 2018', 519249.41, 2);
    expectEvals(
      evals,
      13,
      getnetincLabel('Joe'),
      'Fri Apr 05 2019',
      4880.74,
      2,
    );

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500000, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504744.4, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509533.81, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 514368.67, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 519249.41, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -373.73, 2);
    }
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getICLabel('Joe'));
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 373.73, 2);
    }

    expect(result.taxData[1].item.NAME).toBe(getnetincLabel('Joe'));
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 13994.94, 2);
    }
    done();
  });

  it('dispose of part of an asset liable to CGT', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('use a setting to define purchase price', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: 'purchasePriceSetting',
          VALUE: '50000',
        },
      ],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('use a revalued setting to define purchase price', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('use a setting for purchase price and quantity', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('use a setting for value and quantity', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'sell some shares1',
          FROM: 'RSUs',
          FROM_VALUE: '67',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'January 2 2018',
        },
        {
          ...simpleTransaction,
          NAME: 'sell some shares2',
          FROM: 'RSUs',
          FROM_VALUE: '67',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'June 2 2018',
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
          NAME: 'RSUs',
          START: 'January 1 2018',
          VALUE: 'MyShare',
          QUANTITY: '1000',
          LIABILITY: `Joe${cgt}${separator}Joe${incomeTax}`,
          PURCHASE_PRICE: '50',
          CPI_IMMUNE: true,
          CATEGORY: 'RSU',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    setSetting(model.settings, 'MyShare', '300', custom);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(58);
    expectEvals(evals, 0, 'MyShare', 'Mon Jan 01 2018', 300, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityRSUs', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'PurchaseRSUs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 4, 'VestedEvalRSUs', 'Mon Jan 01 2018', 300, -1);
    expectEvals(evals, 5, 'RSUs', 'Mon Jan 01 2018', 300000, -1);
    expectEvals(evals, 6, 'quantityRSUs', 'Tue Jan 02 2018', 933, -1);
    expectEvals(evals, 7, 'PurchaseRSUs', 'Tue Jan 02 2018', 46650, -1);
    expectEvals(evals, 8, 'RSUs', 'Tue Jan 02 2018', 279900, -1);
    expectEvals(evals, 9, 'Cash', 'Tue Jan 02 2018', 20100, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Feb 01 2018', 20100, -1);
    expectEvals(evals, 11, 'RSUs', 'Thu Feb 01 2018', 279900, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Mar 01 2018', 20100, -1);
    expectEvals(evals, 13, 'RSUs', 'Thu Mar 01 2018', 279900, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', 20100, -1);
    expectEvals(evals, 15, 'RSUs', 'Sun Apr 01 2018', 279900, -1);
    expectEvals(evals, 16, 'quantityRSUs', 'Thu Apr 05 2018', 555, -1);
    expectEvals(evals, 17, 'PurchaseRSUs', 'Thu Apr 05 2018', 27750, -1);
    expectEvals(evals, 18, 'Cash', 'Thu Apr 05 2018', 16000.00, 2);
    expectEvals(evals, 19, '(incomeTax)', 'Thu Apr 05 2018', 117500, -1);
    expectEvals(evals, 20, 'Joe income (net)', 'Thu Apr 05 2018', 182500, -1);
    expectEvals(evals, 21, 'Cash', 'Thu Apr 05 2018', 15050.00, 2);
    expectEvals(evals, 22, '(CGT)', 'Thu Apr 05 2018', 950.00, 2);
    expectEvals(evals, 23, 'Joe income (net)', 'Thu Apr 05 2018', 182500, -1);
    expectEvals(evals, 24, 'Joe gain (net)', 'Thu Apr 05 2018', 15800.00, 2);
    expectEvals(evals, 25, 'Cash', 'Tue May 01 2018', 15050.00, 2);
    expectEvals(evals, 26, 'RSUs', 'Tue May 01 2018', 166500, -1);
    expectEvals(evals, 27, 'Cash', 'Fri Jun 01 2018', 15050.00, 2);
    expectEvals(evals, 28, 'RSUs', 'Fri Jun 01 2018', 166500, -1);
    expectEvals(evals, 29, 'quantityRSUs', 'Sat Jun 02 2018', 488, -1);
    expectEvals(evals, 30, 'PurchaseRSUs', 'Sat Jun 02 2018', 24400, -1);
    expectEvals(evals, 31, 'RSUs', 'Sat Jun 02 2018', 146400, -1);
    expectEvals(evals, 32, 'Cash', 'Sat Jun 02 2018', 35150.00, 2);
    expectEvals(evals, 33, 'Cash', 'Sun Jul 01 2018', 35150.00, 2);
    expectEvals(evals, 34, 'RSUs', 'Sun Jul 01 2018', 146400, -1);
    expectEvals(evals, 35, 'Cash', 'Wed Aug 01 2018', 35150.00, 2);
    expectEvals(evals, 36, 'RSUs', 'Wed Aug 01 2018', 146400, -1);
    expectEvals(evals, 37, 'Cash', 'Sat Sep 01 2018', 35150.00, 2);
    expectEvals(evals, 38, 'RSUs', 'Sat Sep 01 2018', 146400, -1);
    expectEvals(evals, 39, 'Cash', 'Mon Oct 01 2018', 35150.00, 2);
    expectEvals(evals, 40, 'RSUs', 'Mon Oct 01 2018', 146400, -1);
    expectEvals(evals, 41, 'Cash', 'Thu Nov 01 2018', 35150.00, 2);
    expectEvals(evals, 42, 'RSUs', 'Thu Nov 01 2018', 146400, -1);
    expectEvals(evals, 43, 'Cash', 'Sat Dec 01 2018', 35150.00, 2);
    expectEvals(evals, 44, 'RSUs', 'Sat Dec 01 2018', 146400, -1);
    expectEvals(evals, 45, 'Cash', 'Tue Jan 01 2019', 35150.00, 2);
    expectEvals(evals, 46, 'RSUs', 'Tue Jan 01 2019', 146400, -1);
    expectEvals(evals, 47, 'Cash', 'Fri Feb 01 2019', 35150.00, 2);
    expectEvals(evals, 48, 'RSUs', 'Fri Feb 01 2019', 146400, -1);
    expectEvals(evals, 49, 'Cash', 'Fri Mar 01 2019', 35150.00, 2);
    expectEvals(evals, 50, 'RSUs', 'Fri Mar 01 2019', 146400, -1);
    expectEvals(evals, 51, 'Cash', 'Mon Apr 01 2019', 35150.00, 2);
    expectEvals(evals, 52, 'RSUs', 'Mon Apr 01 2019', 146400, -1);
    expectEvals(evals, 53, 'Cash', 'Fri Apr 05 2019', 34200.00, 2);
    expectEvals(evals, 54, '(CGT)', 'Fri Apr 05 2019', 950.00, 2);
    expectEvals(evals, 55, 'Joe gain (net)', 'Fri Apr 05 2019', 15800.00, 2);
    expectEvals(evals, 56, 'Cash', 'Wed May 01 2019', 34200.00, 2);
    expectEvals(evals, 57, 'RSUs', 'Wed May 01 2019', 146400, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20100,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20100,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20100,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 15050.00, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 15050.00, 2);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 35150.00, 2);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 35150.00, 2);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 35150.00, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 35150.00, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 35150.00, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 35150.00, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 35150.00, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 35150.00, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 35150.00, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 35150.00, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 34200.00, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('RSUs');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 300000,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 279900,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 279900,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 279900,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 166500,    -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 166500,    -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 146400,    -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 146400,    -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 146400,    -1);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 146400,    -1);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 146400,    -1);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 146400,    -1);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 146400,    -1);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 146400,    -1);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 146400,    -1);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 146400,    -1);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 146400,    -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(4);
    expect(result.taxData[0].item.NAME).toBe('Joe income (incomeTax)');
    {
    const chartPts = result.taxData[0].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 117500,    -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0,    -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0,    -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0,    -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0,    -1);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0,    -1);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0,    -1);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0,    -1);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0,    -1);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0,    -1);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0,    -1);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0,    -1);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 0,    -1);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 182500,    -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0,    -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0,    -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0,    -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0,    -1);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0,    -1);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0,    -1);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0,    -1);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0,    -1);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0,    -1);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0,    -1);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0,    -1);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 0,    -1);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Joe gain (CGT)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 950.00, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0,    -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0,    -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0,    -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0,    -1);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0,    -1);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0,    -1);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0,    -1);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0,    -1);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0,    -1);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0,    -1);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0,    -1);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 950.00, 2);
    }
    
    expect(result.taxData[3].item.NAME).toBe('Joe gain (net)');
    {
    const chartPts = result.taxData[3].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0,    -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0,    -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0,    -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0,    -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0,    -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 15800.00, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0,    -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0,    -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0,    -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0,    -1);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0,    -1);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0,    -1);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0,    -1);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0,    -1);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0,    -1);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0,    -1);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0,    -1);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 15800.00, 2);
    }

    done();
  });  

  it('dispose of two parts of an asset liable to CGT', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('dispose of two categorized assets liable to CGT', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('have two assets share the same growth rate', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: 'shareGrowth',
        },
        {
          ...simpleAsset,
          NAME: 'Shr2',
          START: 'January 1 2018',
          VALUE: '200',
          GROWTH: 'shareGrowth',
        },
        {
          ...simpleAsset,
          NAME: 'Shr3',
          START: 'January 1 2018',
          VALUE: '200',
          GROWTH: '1.0',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
        {
          ...simpleSetting,
          NAME: 'shareGrowth',
          VALUE: '100.0',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'shareGrowth', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Shr1', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Shr2', 'Mon Jan 01 2018', 200, -1);
    expectEvals(evals, 3, 'Shr3', 'Mon Jan 01 2018', 200, -1);
    expectEvals(evals, 4, 'Shr1', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 5, 'Shr2', 'Thu Feb 01 2018', 211.89, 2);
    expectEvals(evals, 6, 'Shr3', 'Thu Feb 01 2018', 200.17, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Shr1');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 105.95, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Shr2');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 200, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 211.89, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('Shr3');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 200, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 200.17, 2);
    }
    done();
  });

  it('should apply growth and revalue expense', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 2, 2018 00:00:00',
    };
    const model: DbModelData = {
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
          NAME: 'Revalue of phone bill',
          TO: 'Phon',
          TO_VALUE: '5',
          DATE: 'March 5 2018',
          TYPE: revalueExp,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'April 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', -12.12, 2);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -12.12, 2);
    expectEvals(evals, 5, 'Phon', 'Thu Feb 01 2018', 12.24, 2);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', -24.36, 2);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', -24.36, 2);
    expectEvals(evals, 8, 'Phon', 'Thu Mar 01 2018', 12.35, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', -36.71, 2);
    expectEvals(evals, 10, 'Phon', 'Mon Mar 05 2018', 5, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', -36.71, 2);
    expectEvals(evals, 12, 'Phon', 'Sun Apr 01 2018', 5.05, 2);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', -41.75, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 12.24, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 12.35, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 5.05, 2);
    }

    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', -12.12, 2);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', -24.36, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', -36.71, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -41.75, 2);
    }
    done();
  });

  it('should apply growth and one-off pay revalue to income', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of paper round',
          TO: 'PRnd',
          TO_VALUE: '10', // pay rise!
          DATE: 'March 5 2018',
          TYPE: revalueInc,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 5, -1);
    expectEvals(evals, 5, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 10.05, 2);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 10.05, 2);
    expectEvals(evals, 8, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 15.14, 2);
    expectEvals(evals, 10, 'PRnd', 'Mon Mar 05 2018', 10, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 15.14, 2);
    expectEvals(evals, 12, 'PRnd', 'Sun Apr 01 2018', 10.09, 2);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 25.24, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 25.24, 2);
    expectEvals(evals, 15, 'PRnd', 'Tue May 01 2018', 10.19, 2);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', 35.43, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 5, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 5.05, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 5.1, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 10.09, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10.19, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 5, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 10.05, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 15.14, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 25.24, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 35.43, 2);
    }
    done();
  });

  it('should apply growth and absolute-revalue asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of savings',
          TO: 'savings',
          TO_VALUE: '300', // market crash!
          DATE: 'March 5 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Mon Mar 05 2018', 300, -1);
    expectEvals(evals, 4, 'savings', 'Sun Apr 01 2018', 302.85, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509.53, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 302.85, 2);
    }
    done();
  });

  it('should apply growth and proportional-revalue asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of savings',
          TO: 'savings',
          TO_VALUE: '0.5', // market crash!
          TO_ABSOLUTE: false,
          DATE: 'March 5 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Mon Mar 05 2018', 254.77, 2);
    expectEvals(evals, 4, 'savings', 'Sun Apr 01 2018', 257.18, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504.74, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 509.53, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 257.18, 2);
    }
    done();
  });

  it('should apply growth and proportional-revalue multiple assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savingsA',
          START: 'January 1 2018',
          VALUE: '600',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: 'savingsB',
          START: 'January 1 2018',
          VALUE: '400',
          GROWTH: '12',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of savings',
          TO: `savingsA${separator}savingsB`,
          TO_VALUE: '0.5', // market crash!
          TO_ABSOLUTE: false,
          DATE: 'March 5 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'savingsA', 'Mon Jan 01 2018', 600, -1);
    expectEvals(evals, 1, 'savingsB', 'Mon Jan 01 2018', 400, -1);
    expectEvals(evals, 2, 'savingsA', 'Thu Feb 01 2018', 605.69, 2);
    expectEvals(evals, 3, 'savingsB', 'Thu Feb 01 2018', 403.8, 2);
    expectEvals(evals, 4, 'savingsA', 'Thu Mar 01 2018', 611.44, 2);
    expectEvals(evals, 5, 'savingsB', 'Thu Mar 01 2018', 407.63, 2);
    expectEvals(evals, 6, 'savingsA', 'Mon Mar 05 2018', 305.72, 2);
    expectEvals(evals, 7, 'savingsB', 'Mon Mar 05 2018', 203.81, 2);
    expectEvals(evals, 8, 'savingsA', 'Sun Apr 01 2018', 308.62, 2);
    expectEvals(evals, 9, 'savingsB', 'Sun Apr 01 2018', 205.75, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('savingsA');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 600, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 605.69, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 611.44, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 308.62, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('savingsB');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 400, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 403.8, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 407.63, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 205.75, 2);
    }

    done();
  });

  it('should apply growth and proportional-revalue category of assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savingsA',
          START: 'January 1 2018',
          VALUE: '600',
          GROWTH: '12',
          CATEGORY: 'savings',
        },
        {
          ...simpleAsset,
          NAME: 'savingsB',
          START: 'January 1 2018',
          VALUE: '400',
          GROWTH: '12',
          CATEGORY: 'savings',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of savings',
          TO: 'savings',
          TO_VALUE: '0.5', // market crash!
          TO_ABSOLUTE: false,
          DATE: 'March 5 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'savingsA', 'Mon Jan 01 2018', 600, -1);
    expectEvals(evals, 1, 'savingsB', 'Mon Jan 01 2018', 400, -1);
    expectEvals(evals, 2, 'savingsA', 'Thu Feb 01 2018', 605.69, 2);
    expectEvals(evals, 3, 'savingsB', 'Thu Feb 01 2018', 403.8, 2);
    expectEvals(evals, 4, 'savingsA', 'Thu Mar 01 2018', 611.44, 2);
    expectEvals(evals, 5, 'savingsB', 'Thu Mar 01 2018', 407.63, 2);
    expectEvals(evals, 6, 'savingsA', 'Mon Mar 05 2018', 305.72, 2);
    expectEvals(evals, 7, 'savingsB', 'Mon Mar 05 2018', 203.81, 2);
    expectEvals(evals, 8, 'savingsA', 'Sun Apr 01 2018', 308.62, 2);
    expectEvals(evals, 9, 'savingsB', 'Sun Apr 01 2018', 205.75, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('savingsA');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 600, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 605.69, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 611.44, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 308.62, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('savingsB');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(5);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 400, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 403.8, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 407.63, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 205.75, 2);
    }

    done();
  });

  it('Check coarse, categorised, chart data data', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, coarse, viewType);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    done();
  });

  it('Check totalled, chart data data', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, total, viewType);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    done();
  });

  it('Check fine, uncategorised, chart data data', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, fine, viewType);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
    done();
  });

  it('Coarse asset view for cash asset, vals, +, -, +- data1', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, assetChartFocus, CASH_ASSET_NAME, viewType);
    setSetting(model.settings, viewDetail, coarse, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    //printTestCodeForEvals(evals);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single category, coarse', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, assetChartFocus, 'Accessible', viewType);
    setSetting(model.settings, viewDetail, coarse, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single uncategorised asset, coarse', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, assetChartFocus, 'stocks', viewType);
    setSetting(model.settings, viewDetail, coarse, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single categorised asset, coarse', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, assetChartFocus, 'savings', viewType);
    setSetting(model.settings, viewDetail, coarse, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single category, fine', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, assetChartFocus, 'Accessible', viewType);
    setSetting(model.settings, viewDetail, fine, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('asset view type deltas', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('asset view type reductions', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartReductions, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('asset view type additions', done => {
    const model = getModelCoarseAndFine();

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartAdditions, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single category with transfer, coarse', done => {
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

    setSetting(model.settings, assetChartFocus, 'Accessible', viewType);
    setSetting(model.settings, viewDetail, coarse, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('filter chart data into single category with income, fine', done => {
    const model = getModelCoarseAndFine();

    // set the category of an income to match
    // the category of some assets
    // test that this income doesn't appear in the assets graph!
    model.incomes[0].CATEGORY = 'Accessible';

    setSetting(model.settings, assetChartFocus, 'Accessible', viewType);
    setSetting(model.settings, viewDetail, fine, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

    done();
  });

  it('asset view pension transfers additions', done => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartAdditions, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('asset view pension transfers reductions', done => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartReductions, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('asset view pension transfers deltas', done => {
    const modelAndRoi = getModelCrystallizedPension();
    const model = modelAndRoi.model;

    setSetting(model.settings, viewDetail, coarse, viewType);
    setSetting(model.settings, assetChartView, assetChartDeltas, viewType);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('check nonsense settings', done => {
    const settingsKeys = [
      birthDate, // '' or a string date
      viewFrequency, // monthly or annual
      viewDetail, // coarse or fine
      roiStart,
      roiEnd,
      assetChartView,
      cpi,
      assetChartFocus,
      expenseChartFocus,
      incomeChartFocus,
    ];

    for (const key of settingsKeys) {
      const modelAndRoi = getModelCrystallizedPension();
      const model = modelAndRoi.model;

      setSetting(model.settings, key, 'nonsense', viewType);

      suppressLogs();
      const evalsAndValues = getTestEvaluations(model, false);
      const evals = evalsAndValues.evaluations;
      unSuppressLogs();
      // log(`evals = ${showObj(evals)}`);
      // don't assert evaluations - already done in another test

      // printTestCodeForEvals(evals);
      expect(evals.length).toBe(0);
    }

    done();
  });

  it('asset growth should be a number or a numerical setting', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: 'shareGrowth',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    let evals = evalsAndValues.evaluations;

    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    setSetting(model.settings, 'shareGrowth', 'nonsense', constType);

    suppressLogs();
    evals = getTestEvaluations(model, false).evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });
  it('asset value should be a number', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'January 1 2018',
          VALUE: 'nonsense',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          ...simpleSetting,
          NAME: roiStart,
          VALUE: roi.start,
        },
        {
          ...simpleSetting,
          NAME: roiEnd,
          VALUE: roi.end,
        },
      ],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('conditional transaction from abs to half, asset runs out', done => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction from abs to half, cash is zerod', done => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction from prop to half, cash reduces', done => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditional transaction from prop to half, asset runs out', done => {
    const roi = {
      start: 'January 15, 2018 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
  it('pay off mortgage, conditional, to absolute', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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
    expectEvals(evals, 8, 'Cash', 'Fri Mar 02 2018', 50, -1);
    expectEvals(evals, 9, 'Mortgage', 'Fri Mar 02 2018', 30, -1);
    expectEvals(evals, 10, 'Cash', 'Mon Apr 02 2018', 50, -1);
    expectEvals(evals, 11, 'Mortgage', 'Mon Apr 02 2018', 30, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
  it('pay off mortgage, conditional, to not absolute', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('pay off loan, conditional, to absolute', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('pay off loan, conditional, to not absolute', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('negative value for asset which cant be negative', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Loan',
          CAN_BE_NEGATIVE: false,
          START: 'January 2 2018',
          VALUE: '-70',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '150',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0); // failure of checks!

    done();
  });

  it('negative value allowed for from asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Move',
          FROM: 'aaaa',
          FROM_VALUE: '100',
          TO: 'bbbb',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'aaaa',
          CAN_BE_NEGATIVE: true,
          START: 'January 2 2018',
          VALUE: '50',
        },
        {
          ...simpleAsset,
          NAME: 'bbbb',
          START: 'January 2 2018',
          VALUE: '0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'aaaa', 'Tue Jan 02 2018', 50, -1);
    expectEvals(evals, 1, 'bbbb', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 2, 'aaaa', 'Tue Jan 02 2018', -50, -1);
    expectEvals(evals, 3, 'bbbb', 'Tue Jan 02 2018', 100, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    //printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);

    done();
  });

  it('negative value not allowed for from asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...emptyModel,
      expenses: [],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Move',
          FROM: 'aaaa',
          FROM_VALUE: '100',
          TO: 'bbbb',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'January 2 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'aaaa',
          START: 'January 2 2018',
          VALUE: '50',
        },
        {
          ...simpleAsset,
          NAME: 'bbbb',
          START: 'January 2 2018',
          VALUE: '0',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'aaaa', 'Tue Jan 02 2018', 50, -1);
    expectEvals(evals, 1, 'bbbb', 'Tue Jan 02 2018', 0, -1);
    // transaction does not occur

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    //printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);

    done();
  });

  it('define three cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(11);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Mon Apr 02 2018', 300, -1);
    expectEvals(evals, 9, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Wed May 02 2018', 300, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }

    done();
  });

  it('revalue three cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cars', 'Sat Mar 10 2018', 150, -1); // three at 50 each
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cars', 'Mon Apr 02 2018', 150, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Wed May 02 2018', 150, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 150, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 150, -1);
    }

    done();
  });

  it('simple buy some cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy three for this price
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 6, -1); // now own six
    expectEvals(evals, 8, 'Cash', 'Sat Mar 10 2018', -333, -1); // spent this money!
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 600, -1); // value scaled up
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', -333, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', -333, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 600, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -333, -1); // spent money
      expectChartData(chartPts, 5, 'Tue May 01 2018', -333, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 600, -1); // gain in asset value
      expectChartData(chartPts, 5, 'Tue May 01 2018', 600, -1);
    }

    done();
  });

  it('simple sell some cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '2', // selling 2 of our fleet of 3
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', 190, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 190, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 190, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 100, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 190, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 190, -1);
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

  it('sell some cars incurring capital gains', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some cars need all', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some cars need two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some cars need exactly two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some cars fees matter', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [...defaultSettings],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('can use income tax on asset for taxable benefits', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const assetName = `${taxableBenefit} medical`;
    const model: DbModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of medical',
          TO: assetName,
          TO_VALUE: '100000',
          DATE: 'March 5 2018',
          TYPE: revalueAsset,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue medical asset',
          TO: assetName,
          TO_ABSOLUTE: false,
          TO_VALUE: '0',
          DATE: 'March 6 2018',
          TYPE: revalueAsset,
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: assetName,
          START: 'January 1 2018',
          VALUE: '0',
          GROWTH: '12',
          LIABILITY: 'Joe' + incomeTax,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, `${assetName}`, 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 3, `${assetName}`, 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 5, `${assetName}`, 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, `${assetName}`, 'Mon Mar 05 2018', 100000, -1);
    expectEvals(evals, 7, `${assetName}`, 'Tue Mar 06 2018', 0, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 9, `${assetName}`, 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', -27500, -1);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 27500, -1);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 72500, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', -27500, -1);
    expectEvals(evals, 14, `${assetName}`, 'Tue May 01 2018', 0, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', -27500, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('an asset can be a quantity of things', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'stringThings',
          START: 'January 1 2018',
          VALUE: thingName,
          QUANTITY: '10',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: thingName,
          VALUE: '123',
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'thing', 'Mon Jan 01 2018', 123, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantitystringThings', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, 'stringThings', 'Mon Jan 01 2018', 1230, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'stringThings', 'Thu Feb 01 2018', 1230, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'stringThings', 'Thu Mar 01 2018', 1230, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 9, 'stringThings', 'Sun Apr 01 2018', 1230, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 11, 'stringThings', 'Tue May 01 2018', 1230, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('stringThings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1230, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1230, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1230, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1230, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1230, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('an asset can be a quantity of dollar-priced things', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const dollar = `USD`;
    const model: DbModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'stringThings',
          START: 'January 1 2018',
          VALUE: thingName,
          QUANTITY: '5',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: thingName,
          VALUE: '10' + dollar,
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
        {
          NAME: dollar,
          VALUE: '0.88', // exchange rate
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };
    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Mon Jan 01 2018', 0.88, 2);
    expectEvals(evals, 1, 'thing', 'Mon Jan 01 2018', 8.8, 2);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantitystringThings', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 4, 'stringThings', 'Mon Jan 01 2018', 44, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'stringThings', 'Thu Feb 01 2018', 44, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'stringThings', 'Thu Mar 01 2018', 44, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'stringThings', 'Sun Apr 01 2018', 44, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'stringThings', 'Tue May 01 2018', 44, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('stringThings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 44, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 44, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 44, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 44, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 44, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('define three mini cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cars', 'Mon Apr 02 2018', 300, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Wed May 02 2018', 300, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }

    done();
  });

  it('revalue three mini cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'Cars', 'Sat Mar 10 2018', 150, -1); // three at 50 each
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 150, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 150, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 150, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 150, -1);
    }

    done();
  });

  it('simple buy some mini cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy 3 for this price
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 6, -1); // now own six
    expectEvals(evals, 9, 'Cash', 'Sat Mar 10 2018', -333, -1); // spent this money!
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 600, -1); // value scaled up
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', -333, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', -333, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 600, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -333, -1); // spent money
      expectChartData(chartPts, 5, 'Tue May 01 2018', -333, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 600, -1); // gain in asset value
      expectChartData(chartPts, 5, 'Tue May 01 2018', 600, -1);
    }

    done();
  });

  it('simple sell some mini cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '2', // selling 2 of our fleet of 3
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'mini', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 190, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 190, -1);
    expectEvals(evals, 12, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 190, -1);
    expectEvals(evals, 14, 'Cars', 'Wed May 02 2018', 100, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 190, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 190, -1);
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

  it('conditionally sell some mini cars need all', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some mini cars need two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some mini cars need exactly two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some mini cars fees matter', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
        {
          NAME: 'mini',
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('define three chrysler cars', done => {
    const model = getThreeChryslerModel();

    setSetting(model.settings, assetChartFocus, allItems, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 300, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 300, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }

    done();
  });

  it('revalue three chrysler cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'Cars', 'Sat Mar 10 2018', 150, -1); // three at 50 each
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 150, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 150, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 150, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 150, -1);
    }

    done();
  });

  it('simple buy some chrysler cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy 3 for this price
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultSettings,
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
          TYPE: 'adjustable',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 6, -1); // now own six
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', -333, -1); // spent this money!
    expectEvals(evals, 11, 'Cars', 'Sat Mar 10 2018', 600, -1); // value scaled up
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -333, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -333, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 600, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', -333, -1); // spent money
      expectChartData(chartPts, 5, 'Tue May 01 2018', -333, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 600, -1); // gain in asset value
      expectChartData(chartPts, 5, 'Tue May 01 2018', 600, -1);
    }

    done();
  });

  it('simple sell some chrysler cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
          NAME: 'Sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '2', // selling 2 of our fleet of 3
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 10, 'Cars', 'Sat Mar 10 2018', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Mar 10 2018', 190, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 190, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 190, -1);
    expectEvals(evals, 15, 'Cars', 'Wed May 02 2018', 100, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 190, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 190, -1);
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

  it('conditionally sell some chrysler cars need all', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some chrysler cars need two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some chrysler cars need exactly two', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some chrysler cars capped', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some chrysler cars fees matter', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('conditionally sell some chrysler cars then revalue chrysler', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('define three daimler cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'daimler',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'daimler',
          VALUE: '0.25USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '400',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 1, 'daimler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 300, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 300, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }

    done();
  });

  it('define three ford cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'January 2 2018',
          VALUE: 'ford',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'ford',
          VALUE: '400USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '0.25',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 0.25, -1);
    expectEvals(evals, 1, 'ford', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 300, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 300, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }

    done();
  });

  it('revalue chrysler cars for USD change', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [
        ...defaultSettings,
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
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Revalue of USD',
          TO: 'USD',
          TO_VALUE: '2.5',
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'USD', 'Mon Mar 05 2018', 2.5, 2);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 375, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 375, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 375, -1);
    }

    done();
  });

  it('revalue chrysler cars for crysler val change', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
      settings: [
        ...defaultSettings,
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
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Revalue of chrysler',
          TO: 'chrysler',
          TO_VALUE: '62.50USD',
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'chrysler', 'Mon Mar 05 2018', 125, 2);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Mon Apr 02 2018', 375, -1);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cars', 'Wed May 02 2018', 375, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 375, -1);
    }

    done();
  });

  it('revalue chrysler cars from number to expression', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      triggers: [
        {
          NAME: 'carStartDate',
          DATE: makeDateFromString('January 2 2018'),
        },
      ],
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cars',
          START: 'carStartDate',
          VALUE: '100',
          QUANTITY: '3',
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'USD',
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Revalue of chrysler',
          TO: 'Cars',
          TO_VALUE: '100USD',
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Mon Mar 05 2018', 2, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 8, 'Cars', 'Mon Mar 05 2018', 600, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 600, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 600, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 600, -1);
    }

    done();
  });

  it('conditionally sell some chrysler fleets need some', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
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
        ...defaultSettings,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    model.assets.filter(a => {
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

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

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

  it('define three cadillac cars', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cadillac',
          START: 'January 2 2018',
          VALUE: '100USD',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'USD',
          VALUE: '0.25',
          HINT: '',
          TYPE: 'const',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of USD',
          TO: 'USD',
          TO_VALUE: '1.1',
          TO_ABSOLUTE: false,
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
          RECURRENCE: '1m',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 0.25, 2);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCadillac', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cadillac', 'Tue Jan 02 2018', 75, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cadillac', 'Fri Feb 02 2018', 75, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cadillac', 'Fri Mar 02 2018', 75, -1);
    expectEvals(evals, 8, 'USD', 'Mon Mar 05 2018', 0.275, 2);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cadillac', 'Mon Apr 02 2018', 82.5, 2);
    expectEvals(evals, 11, 'USD', 'Thu Apr 05 2018', 0.3, 2);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cadillac', 'Wed May 02 2018', 90.75, 2);
    expectEvals(evals, 14, 'USD', 'Sat May 05 2018', 0.33, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cadillac');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 75, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 75, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 75, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 82.5, 2);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('define two cadillac cars deeper indirection', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cadillac',
          START: 'January 2 2018',
          VALUE: '10fourUSD',
          CPI_IMMUNE: true,
          QUANTITY: '2',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'fourUSD',
          VALUE: '2twoUSD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'twoUSD',
          VALUE: '2USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '0.25',
          HINT: '',
          TYPE: 'const',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Revalue of USD',
          TO: 'USD',
          TO_VALUE: '0.5',
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 0.25, 2);
    expectEvals(evals, 1, 'twoUSD', 'Tue Jan 02 2018', 0.5, 2);
    expectEvals(evals, 2, 'fourUSD', 'Tue Jan 02 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 4, 'quantityCadillac', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 5, 'Cadillac', 'Tue Jan 02 2018', 20, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cadillac', 'Fri Feb 02 2018', 20, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cadillac', 'Fri Mar 02 2018', 20, -1);
    expectEvals(evals, 10, 'USD', 'Mon Mar 05 2018', 0.5, 2);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cadillac', 'Mon Apr 02 2018', 40, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 14, 'Cadillac', 'Wed May 02 2018', 40, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cadillac');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 40, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('define two cadillac cars double formula', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        ...minimalModel.assets,
        {
          ...simpleAsset,
          NAME: 'Cadillac',
          START: 'January 2 2018',
          VALUE: '10someUSD',
          CPI_IMMUNE: true,
          QUANTITY: '2',
        },
      ],
      settings: [
        ...defaultSettings,
        {
          NAME: 'someUSD',
          VALUE: '2twoUSD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'twoUSD',
          VALUE: '2USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          VALUE: '0.25',
          HINT: '',
          TYPE: 'const',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Revalue of someUSD',
          TO: 'someUSD',
          TO_VALUE: '0.5',
          TO_ABSOLUTE: false,
          DATE: 'March 5 2018',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue of USD',
          TO: 'USD',
          TO_VALUE: '0.9',
          TO_ABSOLUTE: false,
          DATE: 'April 5 2018',
          TYPE: revalueSetting,
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 0.25, 2);
    expectEvals(evals, 1, 'twoUSD', 'Tue Jan 02 2018', 0.5, 2);
    expectEvals(evals, 2, 'someUSD', 'Tue Jan 02 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 4, 'quantityCadillac', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 5, 'Cadillac', 'Tue Jan 02 2018', 20, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cadillac', 'Fri Feb 02 2018', 20, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cadillac', 'Fri Mar 02 2018', 20, -1);
    expectEvals(evals, 10, 'someUSD', 'Mon Mar 05 2018', 0.5, 2);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cadillac', 'Mon Apr 02 2018', 10, -1);
    expectEvals(evals, 13, 'USD', 'Thu Apr 05 2018', 0.225, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 15, 'Cadillac', 'Wed May 02 2018', 9, -1);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cadillac');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(6);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 20, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 20, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 20, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 10, -1);
    }

    expect(result.debtData.length).toBe(0);

    done();
  });

  it('revalue a setting 01', done => {
    const roi = {
      start: '1 Jan 2019',
      end: '1 Jan 2042',
    };

    const model = makeModelFromJSON(simpleExampleData);

    model.transactions.push({
      NAME: 'Revalue a setting',
      FROM: '',
      FROM_ABSOLUTE: true,
      FROM_VALUE: '',
      TO: 'stockMarketGrowth',
      TO_ABSOLUTE: true,
      TO_VALUE: '0.0',
      DATE: '2029',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'revalueSetting',
      CATEGORY: '',
    });

    setROI(model, roi);
    setSetting(model.settings, viewFrequency, annually, viewType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    //printTestCodeForEvals(evals);

    expect(evals.length).toBe(4332);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // apprintTestCodeForChart(result);

    expect(result.expensesData.length).toBe(3);
    expect(result.expensesData[0].item.NAME).toBe('Look after dogs');
    {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 5083.5, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 6351.52, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 6637.34, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 6936.02, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 7248.14, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 7574.31, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 7915.15, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 8271.34, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 8643.55, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 9032.51, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 9438.97, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 9863.72, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 10307.59, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 10771.43, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 11256.15, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 11762.67, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 12291.99, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 12845.13, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 13423.16, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 14027.21, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 14658.43, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 15318.06, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 16007.37, 2);
    }

    expect(result.expensesData[1].item.NAME).toBe('Run car');
    {
      const chartPts = result.expensesData[1].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 7193.52, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 9224.49, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 9916.33, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 10660.06, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 11459.56, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 12319.03, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 13242.95, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 13010.11, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 0, -1);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 0, -1);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 0, -1);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 0, -1);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 0, -1);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 0, -1);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 0, -1);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 0, -1);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 0, -1);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 0, -1);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 0, -1);
    }

    expect(result.expensesData[2].item.NAME).toBe('Run house');
    {
      const chartPts = result.expensesData[2].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 13217.1, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 16513.96, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 17257.09, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 18033.66, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 18845.17, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 19693.21, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 20579.4, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 21505.47, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 22473.22, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 23484.52, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 24541.32, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 25645.68, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 26799.73, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 28005.72, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 29265.98, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 30582.95, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 31959.18, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 33397.34, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 34900.23, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 36470.74, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 38111.92, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 39826.95, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 41619.17, 2);
    }

    expect(result.incomesData.length).toBe(3);
    expect(result.incomesData[0].item.NAME).toBe('Main income');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 39215.26, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 44624.05, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 46632.13, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 48730.58, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 50923.46, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 53215.01, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 55609.69, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 58112.12, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 60727.17, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 63459.89, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 66315.59, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 69299.79, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 72418.28, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 75677.1, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 79082.57, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 82641.29, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 86360.14, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 90246.35, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 94307.44, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 98551.27, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 102986.08, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 107620.45, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 112463.37, 2);
    }

    expect(result.incomesData[1].item.NAME).toBe('Side hustle income');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 16670.99, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 18622.11, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 19087.66, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 19564.85, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 20053.97, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 20555.32, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 21069.2, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 5349.09, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 0, -1);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 0, -1);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 0, -1);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 0, -1);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 0, -1);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 0, -1);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 0, -1);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 0, -1);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 0, -1);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 0, -1);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 0, -1);
    }

    expect(result.incomesData[2].item.NAME).toBe('Side hustle income later');
    {
      const chartPts = result.incomesData[2].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 16213.44, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 22090.33, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 22642.59, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 23208.65, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 5892.26, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 0, -1);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 0, -1);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 0, -1);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 0, -1);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 0, -1);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 0, -1);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 0, -1);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 0, -1);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 0, -1);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 0, -1);
    }

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 10610.88, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 15562.48, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 21068.72, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 27131.15, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 33748.95, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 40918.66, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 48633.84, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 59112.87, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 83417.94, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 111276.76, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 139798.34, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 152242.1, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 159695.82, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 168086.22, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 177461.92, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 190924.49, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 220706.87, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 252090.62, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 285144.89, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 319941.6, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 356555.62, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 395064.83, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 435550.28, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('ISAs');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 2014.01, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 2189.95, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 2381.27, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 2589.29, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 2815.49, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 3061.45, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 3328.9, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 3619.72, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 3935.94, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 4279.78, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 4653.66, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 5060.2, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 5502.26, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 5982.94, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 6505.61, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 7073.94, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 7691.92, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 8363.89, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 9094.56, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 9889.06, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 10752.96, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 11692.34, 2);
    }

    expect(result.assetData[2].item.NAME).toBe('Stocks');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 4379.9, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 4762.53, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 3262.08, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 3547.06, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 3856.93, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 4193.87, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 4560.24, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 4958.63, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 5391.81, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 5862.84, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 6375.02, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 6931.94, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 7537.51, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 8195.99, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 8911.99, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 9690.54, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 10537.11, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 11457.63, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 12458.57, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 13546.95, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 14730.41, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 16017.26, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 17416.53, 2);
    }

    expect(result.debtData.length).toBe(2);
    expect(result.debtData[0].item.NAME).toBe('EarlyMortgage');
    {
      const chartPts = result.debtData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 219725.82, 2);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 206654.01, 2);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 193277.62, 2);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 179589.57, 2);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 165582.58, 2);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 151249.23, 2);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 136581.91, 2);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 121572.84, 2);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 106214.06, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 0, -1);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 0, -1);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 0, -1);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 0, -1);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 0, -1);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 0, -1);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 0, -1);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 0, -1);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 0, -1);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 0, -1);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 0, -1);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 0, -1);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 0, -1);
    }

    expect(result.debtData[1].item.NAME).toBe('LateMortgage');
    {
      const chartPts = result.debtData[1].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 0, -1);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 0, -1);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 0, -1);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 0, -1);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 0, -1);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 0, -1);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 0, -1);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 91997.42, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 77903.22, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 63152.22, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 47713.82, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 31556.0, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 14645.22, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 0, -1);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 0, -1);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 0, -1);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 0, -1);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 0, -1);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 0, -1);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 0, -1);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 0, -1);
    }

    done();
  });

  it('revalue a setting 02', done => {
    const revalueData =
      '{"triggers":[{"NAME":"TransferMortgage","DATE":"2028-01-01T00:00:00.000Z"},{"NAME":"StopMainWork","DATE":"2050-12-31T00:00:00.000Z"},{"NAME":"GetRidOfCar","DATE":"2025-12-31T00:00:00.000Z"}],"expenses":[],"incomes":[],"assets":[{"NAME":"thing","VALUE":"stockvalue","QUANTITY":"100","START":"2019","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],"transactions":[{"DATE":"2026","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 3","TO":"stockvalue","TO_ABSOLUTE":true,"TO_VALUE":"2026EUR","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},{"NAME":"Revalue stockvalue 2","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"2024","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},{"DATE":"2030","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 1","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.9","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},{"NAME":"Revalue EUR 1","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"EUR","TO_ABSOLUTE":true,"TO_VALUE":"1.6","DATE":"2028","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""}],"settings":[{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted `monthly` or `annually`","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail (`Categorised view` or `Detailed view`)","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"Today\'s value focus date","VALUE":"","HINT":"Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE":"view"},{"NAME":"stockvalue","VALUE":"1000EUR","HINT":"","TYPE":"adjustable"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or `All`","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or `All`","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or `All`","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"thing","HINT":"Assets chart can display a category, a single asset, or `All`","TYPE":"view"},{"NAME":"EUR","VALUE":"0.95","HINT":"","TYPE":"adjustable"},{"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}]}';
    const model = makeModelFromJSON(revalueData);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(583);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('thing');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(23);
      expectChartData(chartPts, 0, 'Tue Jan 01 2019', 95000, -1);
      expectChartData(chartPts, 1, 'Wed Jan 01 2020', 95000, -1);
      expectChartData(chartPts, 2, 'Fri Jan 01 2021', 95000, -1);
      expectChartData(chartPts, 3, 'Sat Jan 01 2022', 95000, -1);
      expectChartData(chartPts, 4, 'Sun Jan 01 2023', 95000, -1);
      expectChartData(chartPts, 5, 'Mon Jan 01 2024', 95000, -1);
      expectChartData(chartPts, 6, 'Wed Jan 01 2025', 47500, -1);
      expectChartData(chartPts, 7, 'Thu Jan 01 2026', 47500, -1);
      expectChartData(chartPts, 8, 'Fri Jan 01 2027', 192470.0, 2);
      expectChartData(chartPts, 9, 'Sat Jan 01 2028', 192470.0, 2);
      expectChartData(chartPts, 10, 'Mon Jan 01 2029', 324160.0, 2);
      expectChartData(chartPts, 11, 'Tue Jan 01 2030', 324160.0, 2);
      expectChartData(chartPts, 12, 'Wed Jan 01 2031', 291744.0, 2);
      expectChartData(chartPts, 13, 'Thu Jan 01 2032', 262569.6, 2);
      expectChartData(chartPts, 14, 'Sat Jan 01 2033', 236312.64, 2);
      expectChartData(chartPts, 15, 'Sun Jan 01 2034', 212681.38, 2);
      expectChartData(chartPts, 16, 'Mon Jan 01 2035', 191413.24, 2);
      expectChartData(chartPts, 17, 'Tue Jan 01 2036', 172271.91, 2);
      expectChartData(chartPts, 18, 'Thu Jan 01 2037', 155044.72, 2);
      expectChartData(chartPts, 19, 'Fri Jan 01 2038', 139540.25, 2);
      expectChartData(chartPts, 20, 'Sat Jan 01 2039', 125586.23, 2);
      expectChartData(chartPts, 21, 'Sun Jan 01 2040', 113027.6, 2);
      expectChartData(chartPts, 22, 'Tue Jan 01 2041', 101724.84, 2);
    }

    expect(result.debtData.length).toBe(0);
    done();
  });

  it('Generate taxable income from asset', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'May 02 2019',
    };
    const minimalModel = getMinimalModelCopy();
    const model: DbModelData = {
      ...minimalModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'Dec 1, 2017',
          VALUE: '0',
        },
        {
          ...simpleAsset,
          NAME: 'NSI',
          START: 'January 2 2018',
          VALUE: '1000000', // enough to trigger income tax
          GROWTH: '2',
          CPI_IMMUNE: false,
        },
      ],
      incomes: [
        ...minimalModel.incomes,
        {
          ...simpleIncome,
          NAME: 'NSIinterest',
          START: 'January 2 2018',
          END: 'June 1, 2021',
          VALUE: '0.0012414NSI', // compounds to 0.015 over 12 months
          LIABILITY: `Joe${incomeTax}`,
          CPI_IMMUNE: true,
        },
      ],
    };

    setROI(model, roi);
    setSetting(model.settings, cpi, '2.0', cpiHint);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(70);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'NSI', 'Tue Jan 02 2018', 1000000, -1);
    expectEvals(evals, 3, 'NSIinterest', 'Tue Jan 02 2018', 1241.4, 2);
    expectEvals(evals, 4, 'Cash', 'Tue Jan 02 2018', 1241.4, 2);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1243.45, 2);
    expectEvals(evals, 6, 'NSI', 'Fri Feb 02 2018', 1003273.74, 2);
    expectEvals(evals, 7, 'NSIinterest', 'Fri Feb 02 2018', 1245.46, 2);
    expectEvals(evals, 8, 'Cash', 'Fri Feb 02 2018', 2488.91, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 2493.02, 2);
    expectEvals(evals, 10, 'NSI', 'Fri Mar 02 2018', 1006558.2, 2);
    expectEvals(evals, 11, 'NSIinterest', 'Fri Mar 02 2018', 1249.54, 2);
    expectEvals(evals, 12, 'Cash', 'Fri Mar 02 2018', 3742.57, 2);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 3748.75, 2);
    expectEvals(evals, 14, 'NSI', 'Mon Apr 02 2018', 1009853.41, 2);
    expectEvals(evals, 15, 'NSIinterest', 'Mon Apr 02 2018', 1253.63, 2);
    expectEvals(evals, 16, 'Cash', 'Mon Apr 02 2018', 5002.38, 2);
    expectEvals(evals, 17, 'Joe income (net)', 'Thu Apr 05 2018', 4990.04, 2);
    expectEvals(evals, 18, 'Cash', 'Tue May 01 2018', 5010.64, 2);
    expectEvals(evals, 19, 'NSI', 'Wed May 02 2018', 1013159.4, 2);
    expectEvals(evals, 20, 'NSIinterest', 'Wed May 02 2018', 1257.74, 2);
    expectEvals(evals, 21, 'Cash', 'Wed May 02 2018', 6268.38, 2);
    expectEvals(evals, 22, 'Cash', 'Fri Jun 01 2018', 6278.73, 2);
    expectEvals(evals, 23, 'NSI', 'Sat Jun 02 2018', 1016476.22, 2);
    expectEvals(evals, 24, 'NSIinterest', 'Sat Jun 02 2018', 1261.85, 2);
    expectEvals(evals, 25, 'Cash', 'Sat Jun 02 2018', 7540.58, 2);
    expectEvals(evals, 26, 'Cash', 'Sun Jul 01 2018', 7553.04, 2);
    expectEvals(evals, 27, 'NSI', 'Mon Jul 02 2018', 1019803.9, 2);
    expectEvals(evals, 28, 'NSIinterest', 'Mon Jul 02 2018', 1265.98, 2);
    expectEvals(evals, 29, 'Cash', 'Mon Jul 02 2018', 8819.02, 2);
    expectEvals(evals, 30, 'Cash', 'Wed Aug 01 2018', 8833.59, 2);
    expectEvals(evals, 31, 'NSI', 'Thu Aug 02 2018', 1023142.48, 2);
    expectEvals(evals, 32, 'NSIinterest', 'Thu Aug 02 2018', 1270.13, 2);
    expectEvals(evals, 33, 'Cash', 'Thu Aug 02 2018', 10103.72, 2);
    expectEvals(evals, 34, 'Cash', 'Sat Sep 01 2018', 10120.4, 2);
    expectEvals(evals, 35, 'NSI', 'Sun Sep 02 2018', 1026491.98, 2);
    expectEvals(evals, 36, 'NSIinterest', 'Sun Sep 02 2018', 1274.29, 2);
    expectEvals(evals, 37, 'Cash', 'Sun Sep 02 2018', 11394.69, 2);
    expectEvals(evals, 38, 'Cash', 'Mon Oct 01 2018', 11413.51, 2);
    expectEvals(evals, 39, 'NSI', 'Tue Oct 02 2018', 1029852.45, 2);
    expectEvals(evals, 40, 'NSIinterest', 'Tue Oct 02 2018', 1278.46, 2);
    expectEvals(evals, 41, 'Cash', 'Tue Oct 02 2018', 12691.97, 2);
    expectEvals(evals, 42, 'Cash', 'Thu Nov 01 2018', 12712.93, 2);
    expectEvals(evals, 43, 'NSI', 'Fri Nov 02 2018', 1033223.91, 2);
    expectEvals(evals, 44, 'NSIinterest', 'Fri Nov 02 2018', 1282.64, 2);
    expectEvals(evals, 45, 'Cash', 'Fri Nov 02 2018', 13995.57, 2);
    expectEvals(evals, 46, 'Cash', 'Sat Dec 01 2018', 14018.69, 2);
    expectEvals(evals, 47, 'NSI', 'Sun Dec 02 2018', 1036606.42, 2);
    expectEvals(evals, 48, 'NSIinterest', 'Sun Dec 02 2018', 1286.84, 2);
    expectEvals(evals, 49, 'Cash', 'Sun Dec 02 2018', 15305.53, 2);
    expectEvals(evals, 50, 'Cash', 'Tue Jan 01 2019', 15330.81, 2);
    expectEvals(evals, 51, 'NSI', 'Wed Jan 02 2019', 1040000.0, 2);
    expectEvals(evals, 52, 'NSIinterest', 'Wed Jan 02 2019', 1291.06, 2);
    expectEvals(evals, 53, 'Cash', 'Wed Jan 02 2019', 16621.87, 2);
    expectEvals(evals, 54, 'Cash', 'Fri Feb 01 2019', 16649.32, 2);
    expectEvals(evals, 55, 'NSI', 'Sat Feb 02 2019', 1043404.69, 2);
    expectEvals(evals, 56, 'NSIinterest', 'Sat Feb 02 2019', 1295.28, 2);
    expectEvals(evals, 57, 'Cash', 'Sat Feb 02 2019', 17944.6, 2);
    expectEvals(evals, 58, 'Cash', 'Fri Mar 01 2019', 17974.24, 2);
    expectEvals(evals, 59, 'NSI', 'Sat Mar 02 2019', 1046820.52, 2);
    expectEvals(evals, 60, 'NSIinterest', 'Sat Mar 02 2019', 1299.52, 2);
    expectEvals(evals, 61, 'Cash', 'Sat Mar 02 2019', 19273.76, 2);
    expectEvals(evals, 62, 'Cash', 'Mon Apr 01 2019', 19305.59, 2);
    expectEvals(evals, 63, 'NSI', 'Tue Apr 02 2019', 1050247.54, 2);
    expectEvals(evals, 64, 'NSIinterest', 'Tue Apr 02 2019', 1303.78, 2);
    expectEvals(evals, 65, 'Cash', 'Tue Apr 02 2019', 20609.37, 2);
    expectEvals(evals, 66, 'Cash', 'Fri Apr 05 2019', 20085.86, 2);
    expectEvals(evals, 67, '(incomeTax)', 'Fri Apr 05 2019', 523.52, 2);
    expectEvals(evals, 68, 'Joe income (net)', 'Fri Apr 05 2019', 14844.06, 2);
    expectEvals(evals, 69, 'Cash', 'Wed May 01 2019', 20119.03, 2);

    const result = makeChartDataFromEvaluations(model, evalsAndValues);

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('NSIinterest');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1241.4, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1245.46, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1249.54, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 1253.63, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 1257.74, 2);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 1261.85, 2);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 1265.98, 2);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 1270.13, 2);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 1274.29, 2);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 1278.46, 2);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 1282.64, 2);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 1286.84, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 1291.06, 2);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 1295.28, 2);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 1299.52, 2);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 1303.78, 2);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1243.45, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 2493.02, 2);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 3748.75, 2);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 5010.64, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 6278.73, 2);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 7553.04, 2);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8833.59, 2);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 10120.4, 2);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 11413.51, 2);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 12712.93, 2);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 14018.69, 2);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 15330.81, 2);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 16649.32, 2);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 17974.24, 2);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 19305.59, 2);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 20119.03, 2);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe('Joe income (net)');
    {
      const chartPts = result.taxData[0].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 4990.04, 2);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 14844.06, 2);
    }

    expect(result.taxData[1].item.NAME).toBe('Joe income (incomeTax)');
    {
      const chartPts = result.taxData[1].chartDataPoints;
      expect(chartPts.length).toBe(18);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
      expectChartData(chartPts, 8, 'Wed Aug 01 2018', 0, -1);
      expectChartData(chartPts, 9, 'Sat Sep 01 2018', 0, -1);
      expectChartData(chartPts, 10, 'Mon Oct 01 2018', 0, -1);
      expectChartData(chartPts, 11, 'Thu Nov 01 2018', 0, -1);
      expectChartData(chartPts, 12, 'Sat Dec 01 2018', 0, -1);
      expectChartData(chartPts, 13, 'Tue Jan 01 2019', 0, -1);
      expectChartData(chartPts, 14, 'Fri Feb 01 2019', 0, -1);
      expectChartData(chartPts, 15, 'Fri Mar 01 2019', 0, -1);
      expectChartData(chartPts, 16, 'Mon Apr 01 2019', 0, -1);
      expectChartData(chartPts, 17, 'Wed May 01 2019', 523.52, 2);
    }

    done();
  });
  // CGT on selling some cars ???
});
