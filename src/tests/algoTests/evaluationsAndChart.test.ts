// to allow final-scoping blocks for auto-generated code
/* eslint-disable no-lone-blocks */

import {
  CASH_ASSET_NAME,
  allItems,
  annually,
  chartAdditions,
  chartDeltas,
  assetChartFocus,
  chartReductions,
  chartVals,
  chartViewType,
  autogen,
  birthDate,
  birthDateHint,
  cgt,
  coarse,
  conditional,
  constType,
  cpi,
  cpiHint,
  crystallizedPension,
  custom,
  debtChartFocus,
  expenseChartFocus,
  fine,
  growth,
  incomeChartFocus,
  incomeTax,
  liquidateAsset,
  monthly,
  moveTaxFreePart,
  nationalInsurance,
  payOffDebt,
  pension,
  pensionDB,
  pensionSS,
  pensionTransfer,
  revalue,
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
  taxFree,
  taxableBenefit,
  total,
  transferCrystallizedPension,
  valueFocusDate,
  valueFocusDateHint,
  viewDetail,
  viewFrequency,
  viewType,
  adjustableType,
} from '../../localization/stringConstants';
import {
  AssetVal,
  ChartDataPoint,
  DataForView,
  ModelData,
  DebtVal,
  ExpenseVal,
  IncomeVal,
  SettingVal,
} from '../../types/interfaces';
import {
  Context,
  log,
  printDebug,
  suppressLogs,
  unSuppressLogs,
} from '../../utils';
import {
  attemptRenameLong,
  makeModelFromJSON,
  makeModelFromJSONString,
  revertToUndoModel,
  setROI,
  setSetting,
} from '../../models/modelUtils';
import {
  makeCGTTag,
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeNetGainTag,
  makeNetIncomeTag,
} from '../../stringUtils';
import {
  defaultModelSettings,
  definedBenefitsPension,
  definedContributionsPension,
  emptyModel,
  getMinimalModelCopy,
  getModelCoarseAndFine,
  getTestModel,
  getThreeChryslerModel,
  minimalModel,
  pensionExampleData,
  simpleAsset,
  simpleExampleData,
  simpleExpense,
  simpleIncome,
  simpleSetting,
  simpleTransaction,
  viewSetting,
} from '../../models/exampleModels';

import { Evaluation } from '../../types/interfaces';
import { getEvaluations } from '../../models/evaluations';
import {
  makeChartDataFromEvaluations,
  ViewSettings,
} from '../../models/charting';

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
        toPrint += `${chartPts[j].y}, -1);\n`;
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
        toPrint += `${chartPts[j].y}, -1);\n`;
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
        toPrint += `${chartPts[j].y}, -1);\n`;
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
        toPrint += `${chartPts[j].y}, -1);\n`;
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
        toPrint += `${chartPts[j].y}, -1);\n`;
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
  model: ModelData,
  extraChecks = true,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<string, AssetVal>;
  todaysDebtValues: Map<string, DebtVal>;
  todaysIncomeValues: Map<string, IncomeVal>;
  todaysExpenseValues: Map<string, ExpenseVal>;
  todaysSettingValues: Map<string, SettingVal>;
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
      } else if (oldName.startsWith(taxFree)) {
        newName = taxFree + newName;
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
    evalnsAndVals = getEvaluations(
      model,
      undefined, // no key for a values report
    );
  } else {
    const copyModel = makeModelFromJSONString(JSON.stringify(model));
    evalnsAndVals = getEvaluations(
      copyModel,
      undefined, // no key for a values report
    );
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
  const model: ModelData = {
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
    settings: [...defaultModelSettings(roi)],
  };
  return { roi, model };
}

function getModelCrystallizedPension() {
  const roi = {
    start: '1 April 2023',
    end: '1 April 2026',
  };
  const model: ModelData = {
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
        NAME: crystallizedPension + 'Joe.PNN',
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
    settings: [...defaultModelSettings(roi)],
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
        TO: crystallizedPension + 'Joe.PNN',
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

  // log(`getModelCrystallizedPension created ${showObj(model)}`);

  setSetting(model.settings, birthDate, '', viewType);
  return {
    model,
    roi,
  };
}

function getModelTwoCrystallizedPensions() {
  const roi = {
    start: '1 March 2019',
    end: '10 May 2021',
  };
  const model: ModelData = {
    ...minimalModel,
    incomes: [],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: '1 March 2019',
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + 'Joe.A',
        START: '1 March 2019',
        CATEGORY: 'B',
        VALUE: '13500',
      },
      {
        ...simpleAsset,
        NAME: crystallizedPension + 'Joe.B',
        START: '1 March 2019',
        CATEGORY: 'B',
        VALUE: '13500',
      },
    ],
    settings: [...defaultModelSettings(roi)],
    expenses: [],
  };

  setSetting(model.settings, birthDate, '', viewType);
  return {
    model,
    roi,
  };
}

function getMinimalModelCopySettings(): ViewSettings {
  const result = new ViewSettings([
    {
      NAME: viewFrequency,
      VALUE: monthly,
    },
    {
      NAME: chartViewType,
      VALUE: chartVals,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
    },
    {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
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
      VALUE: 'Y',
    },
    {
      NAME: valueFocusDate,
      VALUE: '',
    },
  ]);
  return result;
}

function defaultTestViewSettings(): ViewSettings {
  const result = new ViewSettings([
    { ...viewSetting, NAME: viewFrequency, VALUE: monthly },
    { ...viewSetting, NAME: viewDetail, VALUE: fine },
    { ...viewSetting, NAME: chartViewType, VALUE: chartVals },
    {
      ...viewSetting,
      NAME: assetChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: debtChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: incomeChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: taxChartFocusPerson,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: taxChartFocusType,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: taxChartShowNet,
      VALUE: 'Y',
    },
    {
      ...simpleSetting,
      NAME: cpi,
      VALUE: '0.0',
      HINT: cpiHint,
    },
    {
      ...viewSetting,
      NAME: birthDate,
      VALUE: '',
      HINT: birthDateHint,
    },
    {
      ...viewSetting,
      NAME: valueFocusDate,
      VALUE: '',
      HINT: valueFocusDateHint,
    },
  ]);
  return result;
}

/* eslint-disable */
describe('evaluations tests', () => {
  it('should ignore future expenses A', async done => {
    const modelAndRoi = getModelFutureExpense2();
    const model = modelAndRoi.model;

    const evalsAndValues = getEvaluations(
      makeModelFromJSONString(JSON.stringify(model)),
      undefined, // no key for a values report
    );

    // log(showObj(evals));
    expect(evalsAndValues.evaluations.length).toBe(0);

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
    done();
  });

  it('should apply growth to next expense', async done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<string, AssetVal>(),
      todaysDebtValues: new Map<string, DebtVal>(),
      todaysIncomeValues: new Map<string, IncomeVal>(),
      todaysExpenseValues: new Map<string, ExpenseVal>(),
      todaysSettingValues: new Map<string, SettingVal>(),
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

  it('should apply cpi to next expense', async done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2018',
          NAME: 'Phon',
          VALUE: '1',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
      ],
    };
    setSetting(model.settings, cpi, '12.0', constType); // approx 1% per month

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 1.01, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<string, AssetVal>(),
      todaysDebtValues: new Map<string, DebtVal>(),
      todaysIncomeValues: new Map<string, IncomeVal>(),
      todaysExpenseValues: new Map<string, ExpenseVal>(),
      todaysSettingValues: new Map<string, SettingVal>(),
    });

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1.01, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });  

  it('should ignore future expenses B', async done => {
    const roi = {
      start: 'Dec 1, 2016 00:00:00',
      end: 'March 1, 2017 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(0);
    // log(showObj(evals));

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(model, viewSettings, {
      evaluations: evals,
      todaysAssetValues: new Map<string, AssetVal>(),
      todaysDebtValues: new Map<string, DebtVal>(),
      todaysIncomeValues: new Map<string, IncomeVal>(),
      todaysExpenseValues: new Map<string, ExpenseVal>(),
      todaysSettingValues: new Map<string, SettingVal>(),
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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

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
    done();
  });

  it('annual accumulation for chart more than one year', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2019 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
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
    // You may ask: why is this not double the increase we saw in the growth test?
    // 12.12*(1.24)^(1/12) = 12.34 to 2 dp
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.34, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(1);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Mar 01 2018', 12.56, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 01 2019', 15.03, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '5.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Even though the value was set for 2017, the value persists into these 2018
    // dates because the expense is cpi-immune.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.12, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '5.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'valueSetTrigger',
          DATE: 'January 1 2017',
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // The value of this expense was set using a trigger, which evaluated to 2017.
    // See here that the values in 2018 are appropriately increased from its initial value.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // Note growth has been applied once.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);
    // Note growth has been applied a second time.
    expectEvals(evals, 2, 'Phon', 'Thu Mar 01 2018', 12.35, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Note growth has been applied to show an increase in income.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Note growth has already been applied.
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    // Note growth is applied again.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5, -1);
    // Even though income has growth, the next income is the same
    // as it's cpi-immune.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

  it('should understand cpi income', done => {
    const roi = {
      start: 'Dec 1, 2018 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2019',
          END: 'July 1 2019',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    
    //printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.60, 2);
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);
    expectEvals(evals, 2, 'PRnd', 'Fri Mar 01 2019', 5.71, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Sat Dec 01 2018', 0, -1);
    expectChartData(chartPts, 1, 'Tue Jan 01 2019', 5.60, 2);
    expectChartData(chartPts, 2, 'Fri Feb 01 2019', 5.65, 2);
    expectChartData(chartPts, 3, 'Fri Mar 01 2019', 5.71, 2);
    }
    
    expect(result.assetData.length).toBe(0);
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });


  it('should apply growth to next two incomes', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Income increases by growth.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    // Income increases again by growth.
    expectEvals(evals, 2, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    // Evaluations are ordered so that Cash goes first.
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'Acash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 2, 'Zcash', 'Mon Jan 01 2018', 500, -1);

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
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

  it('transact from cash into cpi-affected asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },        
        {
          ...simpleAsset,
          NAME: 'Svgs',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Saaa',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'invest',
          FROM: 'Cash',
          FROM_VALUE: '1',
          TO: 'Svgs',
          TO_VALUE: '1',
          DATE: 'January 10 2018',
          RECURRENCE: '1m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Saaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Svgs', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 3, 'Cash', 'Wed Jan 10 2018', 99, -1);
    expectEvals(evals, 4, 'Svgs', 'Wed Jan 10 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 99, -1);
    expectEvals(evals, 6, 'Saaa', 'Thu Feb 01 2018', 100.95, 2); // includes a CPI jump
    expectEvals(evals, 7, 'Svgs', 'Thu Feb 01 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 8, 'Cash', 'Sat Feb 10 2018', 98, -1);
    expectEvals(evals, 9, 'Svgs', 'Sat Feb 10 2018', 103.92, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', 98, -1);
    expectEvals(evals, 11, 'Saaa', 'Thu Mar 01 2018', 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 12, 'Svgs', 'Thu Mar 01 2018', 103.92, 2);  // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 13, 'Cash', 'Sat Mar 10 2018', 97, -1);
    expectEvals(evals, 14, 'Svgs', 'Sat Mar 10 2018', 105.90, 2); // includes 3 CPI jumps and 3 £1 investments

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
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 99, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 98, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('Svgs');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 101.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 103.92, 2);
    }
    
    expect(result.assetData[2].item.NAME).toBe('Saaa');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 101.91, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });


  it('transact zero from cash into cpi-affected asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Svgs',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Saaa',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'invest',
          FROM: 'Saaa',
          FROM_VALUE: '0',
          TO: 'Svgs',
          TO_VALUE: '0',
          DATE: 'January 10 2018',
          RECURRENCE: '1m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Saaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Svgs', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Saaa', 'Wed Jan 10 2018', 100.95, 2);
    expectEvals(evals, 3, 'Svgs', 'Wed Jan 10 2018', 100.95, 2);
    expectEvals(evals, 4, 'Saaa', 'Thu Feb 01 2018', 100.95, 2);
    expectEvals(evals, 5, 'Svgs', 'Thu Feb 01 2018', 100.95, 2);
    expectEvals(evals, 6, 'Saaa', 'Sat Feb 10 2018', 101.91, 2);
    expectEvals(evals, 7, 'Svgs', 'Sat Feb 10 2018', 101.91, 2);
    expectEvals(evals, 8, 'Saaa', 'Thu Mar 01 2018', 101.91, 2);
    expectEvals(evals, 9, 'Svgs', 'Thu Mar 01 2018', 101.91, 2);
    expectEvals(evals, 10, 'Saaa', 'Sat Mar 10 2018', 102.87, 2);
    expectEvals(evals, 11, 'Svgs', 'Sat Mar 10 2018', 102.87, 2);

    done();
  });  

  it('transact from cpi-affected cash into cpi-affected asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },        
        {
          ...simpleAsset,
          NAME: 'Svgs',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Saaa',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'invest',
          FROM: 'Cash',
          FROM_VALUE: '1',
          TO: 'Svgs',
          TO_VALUE: '1',
          DATE: 'January 10 2018',
          RECURRENCE: '1m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Saaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Svgs', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 3, 'Cash', 'Wed Jan 10 2018', 99.95, 2); // includes a CPI jump and a £1 drop
    expectEvals(evals, 4, 'Svgs', 'Wed Jan 10 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 99.95, 2);
    expectEvals(evals, 6, 'Saaa', 'Thu Feb 01 2018', 100.95, 2); // includes a CPI jump
    expectEvals(evals, 7, 'Svgs', 'Thu Feb 01 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 8, 'Cash', 'Sat Feb 10 2018', 99.90, 2);  // includes 2 CPI jumps and 2 £1 drops
    expectEvals(evals, 9, 'Svgs', 'Sat Feb 10 2018', 103.92, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', 99.90, 2);
    expectEvals(evals, 11, 'Saaa', 'Thu Mar 01 2018', 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 12, 'Svgs', 'Thu Mar 01 2018', 103.92, 2);  // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 13, 'Cash', 'Sat Mar 10 2018', 99.85, 2);
    expectEvals(evals, 14, 'Svgs', 'Sat Mar 10 2018', 105.90, 2); // includes 3 CPI jumps and 3 £1 investments

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
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 99.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 99.90, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('Svgs');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 101.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 103.92, 2);
    }
    
    expect(result.assetData[2].item.NAME).toBe('Saaa');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 101.91, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('transact zero into cpi-affected asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'July 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },        
        {
          ...simpleAsset,
          NAME: `${crystallizedPension} Svgs`,
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Conditional moveZero',
          FROM: `${crystallizedPension} Svgs`,
          FROM_VALUE: '0.0',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.98',
          TO_ABSOLUTE: false,          
          DATE: 'January 10 2018',
          RECURRENCE: '1m',
          TYPE: liquidateAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    printTestCodeForEvals(evals);




    done();
  });


  it('transact from nowhere into cpi-affected asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },        
        {
          ...simpleAsset,
          NAME: 'Svgs',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Saaa',
          START: 'January 1 2018',
          VALUE: '100',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'invest',
          TO: 'Svgs',
          TO_VALUE: '1',
          DATE: 'January 10 2018',
          RECURRENCE: '1m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Saaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Svgs', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 3, 'Svgs', 'Wed Jan 10 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 5, 'Saaa', 'Thu Feb 01 2018', 100.95, 2); // includes a CPI jump
    expectEvals(evals, 6, 'Svgs', 'Thu Feb 01 2018', 101.95, 2); // includes a CPI jump and a £1 investment
    expectEvals(evals, 7, 'Svgs', 'Sat Feb 10 2018', 103.92, 2);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 9, 'Saaa', 'Thu Mar 01 2018', 101.91, 2); // includes 2 CPI jumps
    expectEvals(evals, 10, 'Svgs', 'Thu Mar 01 2018', 103.92, 2);  // includes 2 CPI jumps and 2 £1 investments
    expectEvals(evals, 11, 'Svgs', 'Sat Mar 10 2018', 105.90, 2); // includes 3 CPI jumps and 3 £1 investments

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
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 100, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('Svgs');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 101.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 103.92, 2);
    }
    
    expect(result.assetData[2].item.NAME).toBe('Saaa');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 100, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 100.95, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 101.91, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });  

  it('should understand CPI_IMMUNE for growing assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
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

  it('should apply growth and cpi for growing assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12.0',
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth+cpi
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 509.044, 2);
    // Goes up for growth+cpi again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 518.25, 2);

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
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
      expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500, -1);
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 509.044, 2);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 518.25, 2);
    }
    done();
  });

  it('should keep no-growth CPI_IMMUNE assets fixed', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
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
    const model: ModelData = {
      ...emptyModel,
      triggers: [
        {
          NAME: 'then',
          DATE: 'January 1 2018',
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Asset started yusing a string trigger which has been converted into a date.
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    // Phon and PRnd both appear in date order.
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 02 2018', 12.12, 2);
    expectEvals(evals, 2, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 3, 'Phon', 'Fri Feb 02 2018', 12.24, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

  it('has transaction adding cash', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'April 1, 2020',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'windfall',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1000',
          DATE: 'January 2 2020',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'Dec 1, 2017',
          VALUE: '500',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(29);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 500, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'Cash', 'Thu Mar 01 2018', 514.37, 2);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 519.25, 2);
    expectEvals(evals, 5, 'Cash', 'Tue May 01 2018', 524.18, 2);
    expectEvals(evals, 6, 'Cash', 'Fri Jun 01 2018', 529.15, 2);
    expectEvals(evals, 7, 'Cash', 'Sun Jul 01 2018', 534.17, 2);
    expectEvals(evals, 8, 'Cash', 'Wed Aug 01 2018', 539.24, 2);
    expectEvals(evals, 9, 'Cash', 'Sat Sep 01 2018', 544.36, 2);
    expectEvals(evals, 10, 'Cash', 'Mon Oct 01 2018', 549.52, 2);
    expectEvals(evals, 11, 'Cash', 'Thu Nov 01 2018', 554.74, 2);
    expectEvals(evals, 12, 'Cash', 'Sat Dec 01 2018', 560.00, 2);
    expectEvals(evals, 13, 'Cash', 'Tue Jan 01 2019', 565.31, 2);
    expectEvals(evals, 14, 'Cash', 'Fri Feb 01 2019', 570.68, 2);
    expectEvals(evals, 15, 'Cash', 'Fri Mar 01 2019', 576.09, 2);
    expectEvals(evals, 16, 'Cash', 'Mon Apr 01 2019', 581.56, 2);
    expectEvals(evals, 17, 'Cash', 'Wed May 01 2019', 587.08, 2);
    expectEvals(evals, 18, 'Cash', 'Sat Jun 01 2019', 592.65, 2);
    expectEvals(evals, 19, 'Cash', 'Mon Jul 01 2019', 598.27, 2);
    expectEvals(evals, 20, 'Cash', 'Thu Aug 01 2019', 603.95, 2);
    expectEvals(evals, 21, 'Cash', 'Sun Sep 01 2019', 609.68, 2);
    expectEvals(evals, 22, 'Cash', 'Tue Oct 01 2019', 615.46, 2);
    expectEvals(evals, 23, 'Cash', 'Fri Nov 01 2019', 621.30, 2);
    expectEvals(evals, 24, 'Cash', 'Sun Dec 01 2019', 627.20, 2);
    expectEvals(evals, 25, 'Cash', 'Wed Jan 01 2020', 633.15, 2);
    expectEvals(evals, 26, 'Cash', 'Thu Jan 02 2020', 1639.16, 2);
    expectEvals(evals, 27, 'Cash', 'Sat Feb 01 2020', 1639.16, 2);
    expectEvals(evals, 28, 'Cash', 'Sun Mar 01 2020', 1654.71, 2);

    done();
  });

  it('has transaction adding cash and savings', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'April 1, 2020',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'invest',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '1000',
          TO: 'savings',
          TO_VALUE: '1000',
          DATE: 'January 2 2020',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'Dec 1, 2017',
          VALUE: '500000',
        },
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'Dec 1, 2017',
          VALUE: '50',
        },        
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12.0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(58);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 500000, -1);
    expectEvals(evals, 1, 'savings', 'Fri Dec 01 2017', 50, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 504744.40, 2);
    expectEvals(evals, 3, 'savings', 'Mon Jan 01 2018', 50.47, 2);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 509533.81, 2);
    expectEvals(evals, 5, 'savings', 'Thu Feb 01 2018', 50.95, 2);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 514368.67, 2);
    expectEvals(evals, 7, 'savings', 'Thu Mar 01 2018', 51.44, 2);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 519249.41, 2);
    expectEvals(evals, 9, 'savings', 'Sun Apr 01 2018', 51.92, 2);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 524176.46, 2);
    expectEvals(evals, 11, 'savings', 'Tue May 01 2018', 52.42, 2);
    expectEvals(evals, 12, 'Cash', 'Fri Jun 01 2018', 529150.26, 2);
    expectEvals(evals, 13, 'savings', 'Fri Jun 01 2018', 52.92, 2);
    expectEvals(evals, 14, 'Cash', 'Sun Jul 01 2018', 534171.26, 2);
    expectEvals(evals, 15, 'savings', 'Sun Jul 01 2018', 53.42, 2);
    expectEvals(evals, 16, 'Cash', 'Wed Aug 01 2018', 539239.90, 2);
    expectEvals(evals, 17, 'savings', 'Wed Aug 01 2018', 53.92, 2);
    expectEvals(evals, 18, 'Cash', 'Sat Sep 01 2018', 544356.64, 2);
    expectEvals(evals, 19, 'savings', 'Sat Sep 01 2018', 54.44, 2);
    expectEvals(evals, 20, 'Cash', 'Mon Oct 01 2018', 549521.92, 2);
    expectEvals(evals, 21, 'savings', 'Mon Oct 01 2018', 54.95, 2);
    expectEvals(evals, 22, 'Cash', 'Thu Nov 01 2018', 554736.22, 2);
    expectEvals(evals, 23, 'savings', 'Thu Nov 01 2018', 55.47, 2);
    expectEvals(evals, 24, 'Cash', 'Sat Dec 01 2018', 560000.00, 2);
    expectEvals(evals, 25, 'savings', 'Sat Dec 01 2018', 56.00, 2);
    expectEvals(evals, 26, 'Cash', 'Tue Jan 01 2019', 565313.72, 2);
    expectEvals(evals, 27, 'savings', 'Tue Jan 01 2019', 56.53, 2);
    expectEvals(evals, 28, 'Cash', 'Fri Feb 01 2019', 570677.87, 2);
    expectEvals(evals, 29, 'savings', 'Fri Feb 01 2019', 57.07, 2);
    expectEvals(evals, 30, 'Cash', 'Fri Mar 01 2019', 576092.91, 2);
    expectEvals(evals, 31, 'savings', 'Fri Mar 01 2019', 57.61, 2);
    expectEvals(evals, 32, 'Cash', 'Mon Apr 01 2019', 581559.34, 2);
    expectEvals(evals, 33, 'savings', 'Mon Apr 01 2019', 58.16, 2);
    expectEvals(evals, 34, 'Cash', 'Wed May 01 2019', 587077.64, 2);
    expectEvals(evals, 35, 'savings', 'Wed May 01 2019', 58.71, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Jun 01 2019', 592648.29, 2);
    expectEvals(evals, 37, 'savings', 'Sat Jun 01 2019', 59.26, 2);
    expectEvals(evals, 38, 'Cash', 'Mon Jul 01 2019', 598271.81, 2);
    expectEvals(evals, 39, 'savings', 'Mon Jul 01 2019', 59.83, 2);
    expectEvals(evals, 40, 'Cash', 'Thu Aug 01 2019', 603948.69, 2);
    expectEvals(evals, 41, 'savings', 'Thu Aug 01 2019', 60.39, 2);
    expectEvals(evals, 42, 'Cash', 'Sun Sep 01 2019', 609679.43, 2);
    expectEvals(evals, 43, 'savings', 'Sun Sep 01 2019', 60.97, 2);
    expectEvals(evals, 44, 'Cash', 'Tue Oct 01 2019', 615464.55, 2);
    expectEvals(evals, 45, 'savings', 'Tue Oct 01 2019', 61.55, 2);
    expectEvals(evals, 46, 'Cash', 'Fri Nov 01 2019', 621304.57, 2);
    expectEvals(evals, 47, 'savings', 'Fri Nov 01 2019', 62.13, 2);
    expectEvals(evals, 48, 'Cash', 'Sun Dec 01 2019', 627200.00, 2);
    expectEvals(evals, 49, 'savings', 'Sun Dec 01 2019', 62.72, 2);
    expectEvals(evals, 50, 'Cash', 'Wed Jan 01 2020', 633151.37, 2);
    expectEvals(evals, 51, 'savings', 'Wed Jan 01 2020', 63.32, 2);
    expectEvals(evals, 52, 'Cash', 'Thu Jan 02 2020', 638159.21, 2);
    expectEvals(evals, 53, 'savings', 'Thu Jan 02 2020', 1063.92, 2);
    expectEvals(evals, 54, 'Cash', 'Sat Feb 01 2020', 638159.21, 2);
    expectEvals(evals, 55, 'savings', 'Sat Feb 01 2020', 1063.92, 2);
    expectEvals(evals, 56, 'Cash', 'Sun Mar 01 2020', 644214.57, 2);
    expectEvals(evals, 57, 'savings', 'Sun Mar 01 2020', 1074.01, 2);

    done();
  });

  it('has transaction impacting asset value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Mar 01 2018', 400, -1);

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

  it('has transaction setting as from_value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'buy food',
          FROM: 'MyCa',
          FROM_VALUE: 'amountFrom',
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
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'amountFrom',
          VALUE: '100',
          HINT: '',
          TYPE: custom,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'amountFrom', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 1, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 2, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 4, 'MyCa', 'Thu Mar 01 2018', 400, -1);

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

  it('has transaction derived setting as from_value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'buy food',
          FROM: 'MyCa',
          FROM_VALUE: 'amountFrom',
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
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'amountFrom',
          VALUE: '10x',
          HINT: '',
          TYPE: custom,
        },
        {
          NAME: 'x',
          VALUE: '10',
          HINT: '',
          TYPE: custom,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'x', 'Tue Jan 02 2018', 10, -1);
    expectEvals(evals, 1, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 2, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 4, 'MyCa', 'Thu Mar 01 2018', 400, -1);
    
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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

  it('conditional transaction stops negative cash proportional', done => {
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

  it('conditional transaction stops negative cash abs->proportional', done => {
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

  it('conditional transaction transfers more than once', done => {
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

  it('conditional transaction transfers stop when funds run out abs to', done => {
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

  it('conditional transaction transfers stop when funds run out prop to', done => {
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

  it('conditional transaction granular transfers stop when funds run out prop to', done => {
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
      settings: [...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'Grain',
          VALUE: '10',
        }
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

  it('conditional transaction from multiple sources simple', done => {
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

  it('conditional transaction from multiple sources by quantity', done => {
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

  it('conditional transaction from multiple sources by category', done => {
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

  it('conditional transaction from multiple sources abs->prop', done => {
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

  it('income  growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const assetName = 'sthg';
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    model.settings.forEach(s => {
      if (s.NAME === assetChartFocus) {
        s.VALUE = allItems;
      }
    });

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'sthg', 'Sun Dec 31 2017', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 2, 'sthg', 'Wed Jan 31 2018', 504.74, 2);
    expectEvals(evals, 3, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 4, getnetincLabel('Joe'), 'Thu Apr 05 2018', 10.05, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
  it('income over multiple Aprils', done => {
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

  it('payLowTax on single income payment', done => {
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

  it('tax exempt on single income payment', done => {
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

  it('payHighTax on single income payment', done => {
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

  it('tax allowance reduces for high earners', done => {
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

  it('payTopTax on single income payment', done => {
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

  it('taxBands grow with cpi', done => {
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
    const evals = evalsAndValues.evaluations;

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
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1042.50, 2);
    expectChartData(chartPts, 1, 'Fri May 01 2020', 1042.50, 2);
    expectChartData(chartPts, 2, 'Mon Jun 01 2020', 1042.50, 2);
    expectChartData(chartPts, 3, 'Wed Jul 01 2020', 1042.50, 2);
    expectChartData(chartPts, 4, 'Sat Aug 01 2020', 1042.50, 2);
    expectChartData(chartPts, 5, 'Tue Sep 01 2020', 1042.50, 2);
    expectChartData(chartPts, 6, 'Thu Oct 01 2020', 1042.50, 2);
    expectChartData(chartPts, 7, 'Sun Nov 01 2020', 1042.50, 2);
    expectChartData(chartPts, 8, 'Tue Dec 01 2020', 1042.50, 2);
    expectChartData(chartPts, 9, 'Fri Jan 01 2021', 1042.50, 2);
    expectChartData(chartPts, 10, 'Mon Feb 01 2021', 1042.50, 2);
    expectChartData(chartPts, 11, 'Mon Mar 01 2021', 1042.50, 2);
    expectChartData(chartPts, 12, 'Thu Apr 01 2021', 1042.50, 2);
    expectChartData(chartPts, 13, 'Sat May 01 2021', 1042.50, 2);
    expectChartData(chartPts, 14, 'Tue Jun 01 2021', 1042.50, 2);
    expectChartData(chartPts, 15, 'Thu Jul 01 2021', 1042.50, 2);
    expectChartData(chartPts, 16, 'Sun Aug 01 2021', 1042.50, 2);
    expectChartData(chartPts, 17, 'Wed Sep 01 2021', 1042.50, 2);
    expectChartData(chartPts, 18, 'Fri Oct 01 2021', 1042.50, 2);
    expectChartData(chartPts, 19, 'Mon Nov 01 2021', 1042.50, 2);
    expectChartData(chartPts, 20, 'Wed Dec 01 2021', 1042.50, 2);
    expectChartData(chartPts, 21, 'Sat Jan 01 2022', 1042.50, 2);
    expectChartData(chartPts, 22, 'Tue Feb 01 2022', 1042.50, 2);
    expectChartData(chartPts, 23, 'Tue Mar 01 2022', 1042.50, 2);
    expectChartData(chartPts, 24, 'Fri Apr 01 2022', 1042.50, 2);
    expectChartData(chartPts, 25, 'Sun May 01 2022', 1042.50, 2);
    expectChartData(chartPts, 26, 'Wed Jun 01 2022', 1042.50, 2);
    expectChartData(chartPts, 27, 'Fri Jul 01 2022', 1042.50, 2);
    expectChartData(chartPts, 28, 'Mon Aug 01 2022', 1042.50, 2);
    expectChartData(chartPts, 29, 'Thu Sep 01 2022', 1042.50, 2);
    expectChartData(chartPts, 30, 'Sat Oct 01 2022', 1042.50, 2);
    expectChartData(chartPts, 31, 'Tue Nov 01 2022', 1042.50, 2);
    expectChartData(chartPts, 32, 'Thu Dec 01 2022', 1042.50, 2);
    expectChartData(chartPts, 33, 'Sun Jan 01 2023', 1042.50, 2);
    expectChartData(chartPts, 34, 'Wed Feb 01 2023', 1042.50, 2);
    expectChartData(chartPts, 35, 'Wed Mar 01 2023', 1042.50, 2);
    expectChartData(chartPts, 36, 'Sat Apr 01 2023', 1042.50, 2);
    expectChartData(chartPts, 37, 'Mon May 01 2023', 1042.50, 2);
    expectChartData(chartPts, 38, 'Thu Jun 01 2023', 1042.50, 2);
    expectChartData(chartPts, 39, 'Sat Jul 01 2023', 1042.50, 2);
    expectChartData(chartPts, 40, 'Tue Aug 01 2023', 1042.50, 2);
    expectChartData(chartPts, 41, 'Fri Sep 01 2023', 1042.50, 2);
    expectChartData(chartPts, 42, 'Sun Oct 01 2023', 1042.50, 2);
    expectChartData(chartPts, 43, 'Wed Nov 01 2023', 1042.50, 2);
    expectChartData(chartPts, 44, 'Fri Dec 01 2023', 1042.50, 2);
    expectChartData(chartPts, 45, 'Mon Jan 01 2024', 1042.50, 2);
    expectChartData(chartPts, 46, 'Thu Feb 01 2024', 1042.50, 2);
    expectChartData(chartPts, 47, 'Fri Mar 01 2024', 1042.50, 2);
    expectChartData(chartPts, 48, 'Mon Apr 01 2024', 1042.50, 2);
    expectChartData(chartPts, 49, 'Wed May 01 2024', 1042.50, 2);
    expectChartData(chartPts, 50, 'Sat Jun 01 2024', 1042.50, 2);
    expectChartData(chartPts, 51, 'Mon Jul 01 2024', 1042.50, 2);
    expectChartData(chartPts, 52, 'Thu Aug 01 2024', 1042.50, 2);
    expectChartData(chartPts, 53, 'Sun Sep 01 2024', 1042.50, 2);
    expectChartData(chartPts, 54, 'Tue Oct 01 2024', 1042.50, 2);
    expectChartData(chartPts, 55, 'Fri Nov 01 2024', 1042.50, 2);
    expectChartData(chartPts, 56, 'Sun Dec 01 2024', 1042.50, 2);
    expectChartData(chartPts, 57, 'Wed Jan 01 2025', 1042.50, 2);
    expectChartData(chartPts, 58, 'Sat Feb 01 2025', 1042.50, 2);
    expectChartData(chartPts, 59, 'Sat Mar 01 2025', 1042.50, 2);
    expectChartData(chartPts, 60, 'Tue Apr 01 2025', 1042.50, 2);
    expectChartData(chartPts, 61, 'Thu May 01 2025', 1042.50, 2);
    expectChartData(chartPts, 62, 'Sun Jun 01 2025', 1042.50, 2);
    expectChartData(chartPts, 63, 'Tue Jul 01 2025', 1042.50, 2);
    expectChartData(chartPts, 64, 'Fri Aug 01 2025', 1042.50, 2);
    expectChartData(chartPts, 65, 'Mon Sep 01 2025', 1042.50, 2);
    expectChartData(chartPts, 66, 'Wed Oct 01 2025', 1042.50, 2);
    expectChartData(chartPts, 67, 'Sat Nov 01 2025', 1042.50, 2);
    expectChartData(chartPts, 68, 'Mon Dec 01 2025', 1042.50, 2);
    expectChartData(chartPts, 69, 'Thu Jan 01 2026', 1042.50, 2);
    expectChartData(chartPts, 70, 'Sun Feb 01 2026', 1042.50, 2);
    expectChartData(chartPts, 71, 'Sun Mar 01 2026', 1042.50, 2);
    expectChartData(chartPts, 72, 'Wed Apr 01 2026', 1042.50, 2);
    }
    
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(73);
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1542.50, 2);
    expectChartData(chartPts, 1, 'Fri May 01 2020', 2585.06, 2);
    expectChartData(chartPts, 2, 'Mon Jun 01 2020', 3627.51, 2);
    expectChartData(chartPts, 3, 'Wed Jul 01 2020', 4670.00, 2);
    expectChartData(chartPts, 4, 'Sat Aug 01 2020', 5712.54, 2);
    expectChartData(chartPts, 5, 'Tue Sep 01 2020', 6755.12, 2);
    expectChartData(chartPts, 6, 'Thu Oct 01 2020', 7797.74, 2);
    expectChartData(chartPts, 7, 'Sun Nov 01 2020', 8840.40, 2);
    expectChartData(chartPts, 8, 'Tue Dec 01 2020', 9883.11, 2);
    expectChartData(chartPts, 9, 'Fri Jan 01 2021', 10925.86, 2);
    expectChartData(chartPts, 10, 'Mon Feb 01 2021', 11968.66, 2);
    expectChartData(chartPts, 11, 'Mon Mar 01 2021', 13011.50, 2);
    expectChartData(chartPts, 12, 'Thu Apr 01 2021', 14054.38, 2);
    expectChartData(chartPts, 13, 'Sat May 01 2021', 15097.22, 2);
    expectChartData(chartPts, 14, 'Tue Jun 01 2021', 16140.19, 2);
    expectChartData(chartPts, 15, 'Thu Jul 01 2021', 17183.20, 2);
    expectChartData(chartPts, 16, 'Sun Aug 01 2021', 18226.26, 2);
    expectChartData(chartPts, 17, 'Wed Sep 01 2021', 19269.36, 2);
    expectChartData(chartPts, 18, 'Fri Oct 01 2021', 20312.50, 2);
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
    expectChartData(chartPts, 35, 'Wed Mar 01 2023', 38052.50, 2);
    expectChartData(chartPts, 36, 'Sat Apr 01 2023', 39096.42, 2);
    expectChartData(chartPts, 37, 'Mon May 01 2023', 40141.56, 2);
    expectChartData(chartPts, 38, 'Thu Jun 01 2023', 41185.68, 2);
    expectChartData(chartPts, 39, 'Sat Jul 01 2023', 42229.86, 2);
    expectChartData(chartPts, 40, 'Tue Aug 01 2023', 43274.09, 2);
    expectChartData(chartPts, 41, 'Fri Sep 01 2023', 44318.37, 2);
    expectChartData(chartPts, 42, 'Sun Oct 01 2023', 45362.71, 2);
    expectChartData(chartPts, 43, 'Wed Nov 01 2023', 46407.09, 2);
    expectChartData(chartPts, 44, 'Fri Dec 01 2023', 47451.52, 2);
    expectChartData(chartPts, 45, 'Mon Jan 01 2024', 48496.00, 2);
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
    expectChartData(chartPts, 67, 'Sat Nov 01 2025', 71485.50, 2);
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
    expectChartData(chartPts, 1, 'Fri May 01 2020', 1042.50, 2);
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

  it('payLowTax on combined income payment', done => {
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

  it('payHighTax on combined income payment', done => {
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

  it('payTopTax on two income payments', done => {
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

  it('payLowTax on separate income payments', done => {
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

  it('payHighTax on separate income payments', done => {
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

  it('payTopTax on separate income payments', done => {
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
  it('too low NI income', done => {
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
          VALUE: `${8628/12}`, // 8628 is free of NI liability
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
  it('pay low rate NI income', done => {
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
          VALUE: `${8728/12}`, // 8628 is free of NI liability, expect 12 to be paid
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
    expectEvals(evals, 11, 'Cash', 'Sat Jun 09 2018', 2680.00, 2);
    expectEvals(evals, 12, 'Cash', 'Sun Jul 01 2018', 2680.00, 2);
    expectEvals(evals, 13, 'Cash', 'Thu Jul 05 2018', 2679.00, 2);
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
    expectEvals(evals, 35, 'Cash', 'Sun Dec 09 2018', 7038.00, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Jan 05 2019', 7037.00, 2);
    expectEvals(evals, 37, 'Cash', 'Tue Jan 01 2019', 7037.00, 2);
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
    expectEvals(evals, 51, 'Joe income (net)', 'Fri Apr 05 2019', 8716.00, 2);
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
    expectChartData(chartPts, 4, 'Sun Jul 01 2018', 2680.00, 2);
    expectChartData(chartPts, 5, 'Wed Aug 01 2018', 3406.33, 2);
    expectChartData(chartPts, 6, 'Sat Sep 01 2018', 4132.67, 2);
    expectChartData(chartPts, 7, 'Mon Oct 01 2018', 4859, -1);
    expectChartData(chartPts, 8, 'Thu Nov 01 2018', 5585.33, 2);
    expectChartData(chartPts, 9, 'Sat Dec 01 2018', 6311.67, 2);
    expectChartData(chartPts, 10, 'Tue Jan 01 2019', 7037.00, 2);
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
    expectChartData(chartPts, 14, 'Wed May 01 2019', 8716.00, 2);
    }

    done();
  });

  // NI payable at high rate
  it('pay high rate NI income', done => {
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
          VALUE: `${50104/12}`, // 50004 is bottom of high rate band, expect 2 + 4965.12 to be paid
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
    expectEvals(evals, 23, 'Cash', 'Sun Sep 09 2018', 23482.40, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 23482.40, 2);
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
    expectChartData(chartPts, 7, 'Mon Oct 01 2018', 23482.40, 2);
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
  it('pay NI and income tax', done => {
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
    expectEvals(evals, 6, getnetincLabel('Joe'), 'Thu Apr 05 2018', 29069.58, 2);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26069.58, 2);
    expectEvals(evals, 8, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 25569.58, 2);
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

  it('has monthly transaction creating cash debt', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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

  it('pay one-off pension and employee pension contribution', done => {
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
    expectEvals(evals, 13, getnetincLabel('Joe'), 'Thu Apr 05 2018', 29069.58, 2);
    expectEvals(evals, 14, 'Cash', 'Thu Apr 05 2018', 22869.58, 2);
    expectEvals(evals, 15, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 16, getnetincLabel('Joe'), 'Thu Apr 05 2018', 25869.58, 2);
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


  it('pay into two defined contributions pension schemes', done => {
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
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', 49352.50, 2);
    expectEvals(evals, 21, '(NI)', 'Thu Apr 05 2018', 1980.84, 2);
    expectEvals(evals, 22, getnetincLabel('Joe'), 'Thu Apr 05 2018', 64019.16, 2);
    expectEvals(evals, 23, 'Cash', 'Thu Apr 05 2018', 48139.16, 2);
    expectEvals(evals, 24, '(incomeTax)', 'Thu Apr 05 2018', 12580, -1);
    expectEvals(evals, 25, getnetincLabel('Joe'), 'Thu Apr 05 2018', 51439.16, 2);
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

  it('pay into defined contributions pension with employer contribution', done => {
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
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 29069.58, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 24369.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 25869.58, 2);
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

  it('pay monthly pay into defined contributions pension with employer contribution', done => {
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

    //printTestCodeForEvals(evals);

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
    expectEvals(evals, 16, 'Cash', 'Mon Jun 05 2017', 4055.90, 2);
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
    expectEvals(evals, 38, 'Cash', 'Tue Sep 05 2017', 9473.10, 2);
    expectEvals(evals, 39, 'java', 'Thu Sep 07 2017', 2500, -1);
    expectEvals(evals, 40, `${pension}Pnsh`, 'Thu Sep 07 2017', 2250, -1);
    expectEvals(evals, 41, 'Cash', 'Thu Sep 07 2017', 11848.10, 2);
    expectEvals(evals, 42, 'Cash', 'Sun Oct 01 2017', 11848.10, 2);
    expectEvals(evals, 43, `${pension}Pnsh`, 'Sun Oct 01 2017', 2250, -1);
    expectEvals(evals, 44, 'Cash', 'Thu Oct 05 2017', 11634.38, 2);
    expectEvals(evals, 45, 'Cash', 'Thu Oct 05 2017', 11367.72, 2);
    expectEvals(evals, 46, 'java', 'Sat Oct 07 2017', 2500, -1);
    expectEvals(evals, 47, `${pension}Pnsh`, 'Sat Oct 07 2017', 2625, -1);
    expectEvals(evals, 48, 'Cash', 'Sat Oct 07 2017', 13742.72, 2);
    expectEvals(evals, 49, 'Cash', 'Wed Nov 01 2017', 13742.72, 2);
    expectEvals(evals, 50, `${pension}Pnsh`, 'Wed Nov 01 2017', 2625, -1);
    expectEvals(evals, 51, 'Cash', 'Sun Nov 05 2017', 13529.00, 2);
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
    expectEvals(evals, 73, 'Cash', 'Mon Feb 05 2018', 18946.20, 2);
    expectEvals(evals, 74, 'java', 'Wed Feb 07 2018', 2500, -1);
    expectEvals(evals, 75, `${pension}Pnsh`, 'Wed Feb 07 2018', 4125, -1);
    expectEvals(evals, 76, 'Cash', 'Wed Feb 07 2018', 21321.20, 2);
    expectEvals(evals, 77, 'Cash', 'Thu Mar 01 2018', 21321.20, 2);
    expectEvals(evals, 78, `${pension}Pnsh`, 'Thu Mar 01 2018', 4125, -1);
    expectEvals(evals, 79, 'Cash', 'Mon Mar 05 2018', 21107.48, 2);
    expectEvals(evals, 80, 'Cash', 'Mon Mar 05 2018', 20840.82, 2);
    expectEvals(evals, 81, 'java', 'Wed Mar 07 2018', 2500, -1);
    expectEvals(evals, 82, `${pension}Pnsh`, 'Wed Mar 07 2018', 4500, -1);
    expectEvals(evals, 83, 'Cash', 'Wed Mar 07 2018', 23215.82, 2);
    expectEvals(evals, 84, 'Cash', 'Sun Apr 01 2018', 23215.82, 2);
    expectEvals(evals, 85, `${pension}Pnsh`, 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 86, 'Cash', 'Thu Apr 05 2018', 23002.10, 2);
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
    expectChartData(chartPts, 0, 'Thu Mar 01 2018', 21321.20, 2);
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

  it('pay into defined contributions pension with salary sacrifice', done => {
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
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 27599.58, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 24399.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 3200, -1);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 24399.58, 2);
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
  it('pay one-off pension contribution', done => {
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
    expectEvals(evals, 10, getnetincLabel('Joe'), 'Thu Apr 05 2018', 29069.58, 2);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 05 2018', 24069.58, 2);
    expectEvals(evals, 12, '(incomeTax)', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 13, getnetincLabel('Joe'), 'Thu Apr 05 2018', 25569.58, 2);
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
  it('pay income tax on one off crystallized pension 1', done => {
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

  it('pay income tax on conditional absolute crystallized pension', done => {
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
  it('pay income tax on one off crystallized pension 2', done => {
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
    expectEvals(
      evals,
      1,
      cpj,
      'Thu Mar 01 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      2,
      cpj,
      'Tue Mar 20 2018',
      30000,
      -1,
    );
    expectEvals(evals, 3, 'Cash', 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(
      evals,
      5,
      cpj,
      'Sun Apr 01 2018',
      30000,
      -1,
    );
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

  it('pay income tax on conditional categorized crystallized pension', done => {
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

  it('pay income tax on conditional proportional crystallized pension', done => {
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

  it('pay income tax on recurring conditional proportional crystallized pension', done => {
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
    const cpj = `${crystallizedPension}Joe.PNN`;

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
    expectEvals(evals, 12, '-CPTaxable Joe.PNN', 'Sat Mar 03 2018', 17958.34, 2);
    expectEvals(evals, 13, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Mar 05 2018', -3983.33, 2);
    expectEvals(evals, 15, 'Cash', 'Sun Apr 01 2018', -3983.33, 2);
    expectEvals(evals, 16, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 17958.34, 2);
    expectEvals(evals, 17, 'Cash', 'Thu Apr 05 2018', 6133.33, 2);
    expectEvals(evals, 18, '(incomeTax)', 'Thu Apr 05 2018', 5908.33, 2);
    expectEvals(evals, 19, getnetincLabel('Joe'), 'Thu Apr 05 2018', 36133.33, 2);
    expectEvals(evals, 20, 'Cash', 'Tue May 01 2018', 6133.33, 2);
    expectEvals(evals, 21, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 17958.34, 2);
    expectEvals(evals, 22, 'Cash', 'Fri Jun 01 2018', 6133.33, 2);
    expectEvals(evals, 23, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 17958.34, 2);
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

  it('pay income tax on list member recurring conditional proportional crystallized pension', done => {
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

    const cpj = `${crystallizedPension}Joe.PNN`;

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
    expectEvals(evals, 18, '-CPTaxable Joe.PNN', 'Sat Mar 03 2018', 18030.84, 2);
    expectEvals(evals, 19, 'Cash', 'Sat Mar 03 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Mon Mar 05 2018', -3974.33, 2);
    expectEvals(evals, 21, 'Cash', 'Sun Apr 01 2018', -3974.33, 2);
    expectEvals(evals, 22, 'Stocks', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 23, '-CPTaxable Joe.PNN', 'Sun Apr 01 2018', 18030.84, 2);
    expectEvals(evals, 24, 'Cash', 'Thu Apr 05 2018', 6125.33, 2);
    expectEvals(evals, 25, '(incomeTax)', 'Thu Apr 05 2018', 5893.83, 2);
    expectEvals(evals, 26, getnetincLabel('Joe'), 'Thu Apr 05 2018', 36075.33, 2);
    expectEvals(evals, 27, 'Cash', 'Tue May 01 2018', 6125.33, 2);
    expectEvals(evals, 28, 'Stocks', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 29, '-CPTaxable Joe.PNN', 'Tue May 01 2018', 18030.84, 2);
    expectEvals(evals, 30, 'Cash', 'Fri Jun 01 2018', 6125.33, 2);
    expectEvals(evals, 31, 'Stocks', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 32, '-CPTaxable Joe.PNN', 'Fri Jun 01 2018', 18030.84, 2);
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
  it('pay income tax on monthly crystallized pension', done => {
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

    const cpj = `${crystallizedPension}Joe.PNN`;

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
    expectEvals(evals, 24, 'Cash', 'Wed Sep 05 2018', 11041.70, 2);
    expectEvals(evals, 25, 'Cash', 'Thu Sep 06 2018', 11041.70, 2);
    expectEvals(evals, 26, '-CPTaxable Joe.PNN', 'Thu Sep 06 2018', 47500, -1);
    expectEvals(evals, 27, '-CPTaxable Joe.PNN', 'Fri Sep 07 2018', 45000, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Sep 07 2018', 13541.70, 2);
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
    expectEvals(evals, 49, 'Cash', 'Tue Feb 05 2019', 22083.40, 2);
    expectEvals(evals, 50, 'Cash', 'Wed Feb 06 2019', 22083.40, 2);
    expectEvals(evals, 51, '-CPTaxable Joe.PNN', 'Wed Feb 06 2019', 35000, -1);
    expectEvals(evals, 52, '-CPTaxable Joe.PNN', 'Thu Feb 07 2019', 32500, -1);
    expectEvals(evals, 53, 'Cash', 'Thu Feb 07 2019', 24583.40, 2);
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
    expectChartData(chartPts, 5, 'Thu Sep 06 2018', 11041.70, 2);
    expectChartData(chartPts, 6, 'Sat Oct 06 2018', 13250.04, 2);
    expectChartData(chartPts, 7, 'Tue Nov 06 2018', 15458.38, 2);
    expectChartData(chartPts, 8, 'Thu Dec 06 2018', 17666.72, 2);
    expectChartData(chartPts, 9, 'Sun Jan 06 2019', 19875.06, 2);
    expectChartData(chartPts, 10, 'Wed Feb 06 2019', 22083.40, 2);
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

  it('use up income tax allowance from crystallized pension', done => {
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

  it('pay into defined benefits pension simplest', done => {
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
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 479869.58, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 263394.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 287894.58, 2);
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

  it('pay into defined benefits pension salary sacrifice', done => {
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
    expectEvals(evals, 9, getnetincLabel('Joe'), 'Thu Apr 05 2018', 455859.58, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 263884.58, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 191975, -1);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 263884.58, 2);
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

  it('pay into defined benefits pension apply cpi', done => {
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
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 464058.70, 2);
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

  it('pay into defined benefits pension cant have TO equal cash', done => {
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

  it('pay into defined benefits pension cant have TO equal an arbitrary income', done => {
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

  it('pay into defined benefits pension transaction must begin pensionDB', done => {
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

  it('should apply income tax to some asset growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'savings', 'Mon Jan 01 2018', 500000, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 3, 'savings', 'Thu Feb 01 2018', 504744.40, 2);
    expectEvals(evals, 4, 'Cash', 'Mon Feb 05 2018', -856.09, 2);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', -856.09, 2);
    expectEvals(evals, 6, 'savings', 'Thu Mar 01 2018', 509533.81, 2);
    expectEvals(evals, 7, 'Cash', 'Mon Mar 05 2018', -1730.18, 2);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', -1730.18, 2);
    expectEvals(evals, 9, 'savings', 'Sun Apr 01 2018', 514368.67, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', -373.73, 2);
    expectEvals(evals, 11, '(incomeTax)', 'Thu Apr 05 2018', 373.73, 2);
    expectEvals(evals, 12, getnetincLabel('Joe'), 'Thu Apr 05 2018', 13994.94, 2);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', -373.73, 2);
    expectEvals(evals, 14, 'savings', 'Tue May 01 2018', 519249.41, 2);
    expectEvals(evals, 15, getnetincLabel('Joe'), 'Fri Apr 05 2019', 4880.74, 2);

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
    expect(result.assetData[0].item.NAME).toBe('savings');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 500000, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 504744.40, 2);
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
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -856.09, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -1730.18, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', -373.73, 2);
    }
    
    expect(result.debtData.length).toBe(0);
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

  it('use a setting to define purchase price', done => {
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

  it('use a revalued setting to define purchase price', done => {
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

  it('use a setting for purchase price and quantity', done => {
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

  it('gain a quantity of CGT-liable assets', done => {
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

  it('dispose of two parts of an asset liable to CGT', done => {
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

  it('dispose of two categorized assets liable to CGT', done => {
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

  it('have two assets share the same growth rate', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
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
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'shareGrowth',
          VALUE: '100.0',
        },
      ],
    };
    model.settings.forEach(s => {
      if (s.NAME === assetChartFocus) {
        s.VALUE = allItems;
      }
    });

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
      settings: [...defaultModelSettings(roi)],
    };

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

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

  it('should revalue expense by proportion', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'July 2, 2018 00:00:00',
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
          NAME: 'Revalue of phone bill',
          TO: 'Phon',
          TO_VALUE: '2.00',
          TO_ABSOLUTE: false,
          RECURRENCE: '1m',
          DATE: 'February 5 2018',
          TYPE: revalueExp,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'April 2 2018',
          NAME: 'Phon',
          VALUE: '1.00',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'Phon', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', -1, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', -1, -1);
    expectEvals(evals, 5, 'Phon', 'Thu Feb 01 2018', 1, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', -2, -1);
    expectEvals(evals, 7, 'Phon', 'Mon Feb 05 2018', 2, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', -2, -1);
    expectEvals(evals, 9, 'Phon', 'Thu Mar 01 2018', 2, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -4, -1);
    expectEvals(evals, 11, 'Phon', 'Mon Mar 05 2018', 4, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -4, -1);
    expectEvals(evals, 13, 'Phon', 'Sun Apr 01 2018', 4, -1);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 01 2018', -8, -1);
    expectEvals(evals, 15, 'Phon', 'Thu Apr 05 2018', 8, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', -8, -1);
    expectEvals(evals, 17, 'Phon', 'Sat May 05 2018', 16, -1);
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', -8, -1);
    expectEvals(evals, 19, 'Phon', 'Tue Jun 05 2018', 32, -1);
    expectEvals(evals, 20, 'Cash', 'Sun Jul 01 2018', -8, -1);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(8);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 2, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 4, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 0, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(8);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', -2, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -4, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -8, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', -8, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', -8, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', -8, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
    done();
  });

  it('should revalue expense by setting proportion', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'July 2, 2019 00:00:00',
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
          NAME: 'Revalue of phone bill',
          TO: 'Phon',
          TO_VALUE: 'g',
          TO_ABSOLUTE: false,
          RECURRENCE: '1m',
          DATE: 'May 5 2018',
          TYPE: revalueExp,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue of g',
          TO: 'g',
          TO_VALUE: '1.1',
          DATE: 'August 4 2018',
          TYPE: revalueSetting,
        },        
      ],
      expenses: [
        {
          ...simpleExpense,
          START: 'Jan 1 2018',
          END: 'April 2 2019',
          NAME: 'Phon',
          VALUE: '1.00',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'g',
          VALUE: '2.00',
          HINT: 'growthValue',
          TYPE: adjustableType,
        }
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, 'g', 'Sat Aug 04 2018', 2, -1);
    expectEvals(evals, 1, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'Phon', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 4, 'Cash', 'Mon Jan 01 2018', -1, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -1, -1);
    expectEvals(evals, 6, 'Phon', 'Thu Feb 01 2018', 1, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -2, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', -2, -1);
    expectEvals(evals, 9, 'Phon', 'Thu Mar 01 2018', 1, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', -3, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', -3, -1);
    expectEvals(evals, 12, 'Phon', 'Sun Apr 01 2018', 1, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', -4, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -4, -1);
    expectEvals(evals, 15, 'Phon', 'Tue May 01 2018', 1, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', -5, -1);
    expectEvals(evals, 17, 'Phon', 'Sat May 05 2018', 2, -1);
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', -5, -1);
    expectEvals(evals, 19, 'Phon', 'Fri Jun 01 2018', 2, -1);
    expectEvals(evals, 20, 'Cash', 'Fri Jun 01 2018', -7, -1);
    expectEvals(evals, 21, 'Phon', 'Tue Jun 05 2018', 4, -1);
    expectEvals(evals, 22, 'Cash', 'Sun Jul 01 2018', -7, -1);
    expectEvals(evals, 23, 'Phon', 'Sun Jul 01 2018', 4, -1);
    expectEvals(evals, 24, 'Cash', 'Sun Jul 01 2018', -11, -1);
    expectEvals(evals, 25, 'Phon', 'Thu Jul 05 2018', 8, -1);
    expectEvals(evals, 26, 'Cash', 'Wed Aug 01 2018', -11, -1);
    expectEvals(evals, 27, 'Phon', 'Wed Aug 01 2018', 8, -1);
    expectEvals(evals, 28, 'Cash', 'Wed Aug 01 2018', -19, -1);
    expectEvals(evals, 29, 'g', 'Sat Aug 04 2018', 1.10, 2);
    expectEvals(evals, 30, 'Phon', 'Sun Aug 05 2018', 8.80, 2);
    expectEvals(evals, 31, 'Cash', 'Sat Sep 01 2018', -19, -1);
    expectEvals(evals, 32, 'Phon', 'Sat Sep 01 2018', 8.80, 2);
    expectEvals(evals, 33, 'Cash', 'Sat Sep 01 2018', -27.80, 2);
    expectEvals(evals, 34, 'Phon', 'Wed Sep 05 2018', 9.68, 2);
    expectEvals(evals, 35, 'Cash', 'Mon Oct 01 2018', -27.80, 2);
    expectEvals(evals, 36, 'Phon', 'Mon Oct 01 2018', 9.68, 2);
    expectEvals(evals, 37, 'Cash', 'Mon Oct 01 2018', -37.48, 2);
    expectEvals(evals, 38, 'Phon', 'Fri Oct 05 2018', 10.65, 2);
    expectEvals(evals, 39, 'Cash', 'Thu Nov 01 2018', -37.48, 2);
    expectEvals(evals, 40, 'Phon', 'Thu Nov 01 2018', 10.65, 2);
    expectEvals(evals, 41, 'Cash', 'Thu Nov 01 2018', -48.13, 2);
    expectEvals(evals, 42, 'Phon', 'Mon Nov 05 2018', 11.71, 2);
    expectEvals(evals, 43, 'Cash', 'Sat Dec 01 2018', -48.13, 2);
    expectEvals(evals, 44, 'Phon', 'Sat Dec 01 2018', 11.71, 2);
    expectEvals(evals, 45, 'Cash', 'Sat Dec 01 2018', -59.84, 2);
    expectEvals(evals, 46, 'Phon', 'Wed Dec 05 2018', 12.88, 2);
    expectEvals(evals, 47, 'Cash', 'Tue Jan 01 2019', -59.84, 2);
    expectEvals(evals, 48, 'Phon', 'Tue Jan 01 2019', 12.88, 2);
    expectEvals(evals, 49, 'Cash', 'Tue Jan 01 2019', -72.72, 2);
    expectEvals(evals, 50, 'Phon', 'Sat Jan 05 2019', 14.17, 2);
    expectEvals(evals, 51, 'Cash', 'Fri Feb 01 2019', -72.72, 2);
    expectEvals(evals, 52, 'Phon', 'Fri Feb 01 2019', 14.17, 2);
    expectEvals(evals, 53, 'Cash', 'Fri Feb 01 2019', -86.90, 2);
    expectEvals(evals, 54, 'Phon', 'Tue Feb 05 2019', 15.59, 2);
    expectEvals(evals, 55, 'Cash', 'Fri Mar 01 2019', -86.90, 2);
    expectEvals(evals, 56, 'Phon', 'Fri Mar 01 2019', 15.59, 2);
    expectEvals(evals, 57, 'Cash', 'Fri Mar 01 2019', -102.49, 2);
    expectEvals(evals, 58, 'Phon', 'Tue Mar 05 2019', 17.15, 2);
    expectEvals(evals, 59, 'Cash', 'Mon Apr 01 2019', -102.49, 2);
    expectEvals(evals, 60, 'Phon', 'Mon Apr 01 2019', 17.15, 2);
    expectEvals(evals, 61, 'Cash', 'Mon Apr 01 2019', -119.64, 2);
    expectEvals(evals, 62, 'Phon', 'Fri Apr 05 2019', 18.86, 2);
    expectEvals(evals, 63, 'Cash', 'Wed May 01 2019', -119.64, 2);
    expectEvals(evals, 64, 'Phon', 'Sun May 05 2019', 20.75, 2);
    expectEvals(evals, 65, 'Cash', 'Sat Jun 01 2019', -119.64, 2);
    expectEvals(evals, 66, 'Phon', 'Wed Jun 05 2019', 22.82, 2);
    expectEvals(evals, 67, 'Cash', 'Mon Jul 01 2019', -119.64, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(20);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 1, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 2, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 4, -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8, -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 8.80, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 9.68, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 10.65, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 11.71, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 12.88, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 14.17, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 15.59, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 17.15, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 0, -1);
    expectChartData(chartPts, 18, 'Sat Jun 01 2019', 0, -1);
    expectChartData(chartPts, 19, 'Mon Jul 01 2019', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(20);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', -1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', -2, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', -3, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -4, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', -5, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', -7, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', -11, -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', -19, -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', -27.80, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', -37.48, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', -48.13, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', -59.84, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', -72.72, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', -86.90, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', -102.49, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', -119.64, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', -119.64, 2);
    expectChartData(chartPts, 18, 'Sat Jun 01 2019', -119.64, 2);
    expectChartData(chartPts, 19, 'Mon Jul 01 2019', -119.64, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('should revalue income by setting proportion', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'July 2, 2019 00:00:00',
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
          NAME: 'Revalue of phone bill',
          TO: 'Phon',
          TO_VALUE: 'g',
          TO_ABSOLUTE: false,
          RECURRENCE: '1m',
          DATE: 'May 5 2018',
          TYPE: revalueInc,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue of g',
          TO: 'g',
          TO_VALUE: '1.1',
          DATE: 'August 4 2018',
          TYPE: revalueSetting,
        },        
      ],
      incomes: [
        {
          ...simpleIncome,
          START: 'Jan 1 2018',
          END: 'April 2 2019',
          NAME: 'Phon',
          VALUE: '1.00',
          VALUE_SET: 'January 1 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'g',
          VALUE: '2.00',
          HINT: 'growthValue',
          TYPE: adjustableType,
        }
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, 'g', 'Sat Aug 04 2018', 2, -1);
    expectEvals(evals, 1, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'Phon', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 4, 'Cash', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1, -1);
    expectEvals(evals, 6, 'Phon', 'Thu Feb 01 2018', 1, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', 2, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 2, -1);
    expectEvals(evals, 9, 'Phon', 'Thu Mar 01 2018', 1, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', 3, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 3, -1);
    expectEvals(evals, 12, 'Phon', 'Sun Apr 01 2018', 1, -1);
    expectEvals(evals, 13, 'Cash', 'Sun Apr 01 2018', 4, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 4, -1);
    expectEvals(evals, 15, 'Phon', 'Tue May 01 2018', 1, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', 5, -1);
    expectEvals(evals, 17, 'Phon', 'Sat May 05 2018', 2, -1);
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', 5, -1);
    expectEvals(evals, 19, 'Phon', 'Fri Jun 01 2018', 2, -1);
    expectEvals(evals, 20, 'Cash', 'Fri Jun 01 2018', 7, -1);
    expectEvals(evals, 21, 'Phon', 'Tue Jun 05 2018', 4, -1);
    expectEvals(evals, 22, 'Cash', 'Sun Jul 01 2018', 7, -1);
    expectEvals(evals, 23, 'Phon', 'Sun Jul 01 2018', 4, -1);
    expectEvals(evals, 24, 'Cash', 'Sun Jul 01 2018', 11, -1);
    expectEvals(evals, 25, 'Phon', 'Thu Jul 05 2018', 8, -1);
    expectEvals(evals, 26, 'Cash', 'Wed Aug 01 2018', 11, -1);
    expectEvals(evals, 27, 'Phon', 'Wed Aug 01 2018', 8, -1);
    expectEvals(evals, 28, 'Cash', 'Wed Aug 01 2018', 19, -1);
    expectEvals(evals, 29, 'g', 'Sat Aug 04 2018', 1.10, 2);
    expectEvals(evals, 30, 'Phon', 'Sun Aug 05 2018', 8.80, 2);
    expectEvals(evals, 31, 'Cash', 'Sat Sep 01 2018', 19, -1);
    expectEvals(evals, 32, 'Phon', 'Sat Sep 01 2018', 8.80, 2);
    expectEvals(evals, 33, 'Cash', 'Sat Sep 01 2018', 27.80, 2);
    expectEvals(evals, 34, 'Phon', 'Wed Sep 05 2018', 9.68, 2);
    expectEvals(evals, 35, 'Cash', 'Mon Oct 01 2018', 27.80, 2);
    expectEvals(evals, 36, 'Phon', 'Mon Oct 01 2018', 9.68, 2);
    expectEvals(evals, 37, 'Cash', 'Mon Oct 01 2018', 37.48, 2);
    expectEvals(evals, 38, 'Phon', 'Fri Oct 05 2018', 10.65, 2);
    expectEvals(evals, 39, 'Cash', 'Thu Nov 01 2018', 37.48, 2);
    expectEvals(evals, 40, 'Phon', 'Thu Nov 01 2018', 10.65, 2);
    expectEvals(evals, 41, 'Cash', 'Thu Nov 01 2018', 48.13, 2);
    expectEvals(evals, 42, 'Phon', 'Mon Nov 05 2018', 11.71, 2);
    expectEvals(evals, 43, 'Cash', 'Sat Dec 01 2018', 48.13, 2);
    expectEvals(evals, 44, 'Phon', 'Sat Dec 01 2018', 11.71, 2);
    expectEvals(evals, 45, 'Cash', 'Sat Dec 01 2018', 59.84, 2);
    expectEvals(evals, 46, 'Phon', 'Wed Dec 05 2018', 12.88, 2);
    expectEvals(evals, 47, 'Cash', 'Tue Jan 01 2019', 59.84, 2);
    expectEvals(evals, 48, 'Phon', 'Tue Jan 01 2019', 12.88, 2);
    expectEvals(evals, 49, 'Cash', 'Tue Jan 01 2019', 72.72, 2);
    expectEvals(evals, 50, 'Phon', 'Sat Jan 05 2019', 14.17, 2);
    expectEvals(evals, 51, 'Cash', 'Fri Feb 01 2019', 72.72, 2);
    expectEvals(evals, 52, 'Phon', 'Fri Feb 01 2019', 14.17, 2);
    expectEvals(evals, 53, 'Cash', 'Fri Feb 01 2019', 86.90, 2);
    expectEvals(evals, 54, 'Phon', 'Tue Feb 05 2019', 15.59, 2);
    expectEvals(evals, 55, 'Cash', 'Fri Mar 01 2019', 86.90, 2);
    expectEvals(evals, 56, 'Phon', 'Fri Mar 01 2019', 15.59, 2);
    expectEvals(evals, 57, 'Cash', 'Fri Mar 01 2019', 102.49, 2);
    expectEvals(evals, 58, 'Phon', 'Tue Mar 05 2019', 17.15, 2);
    expectEvals(evals, 59, 'Cash', 'Mon Apr 01 2019', 102.49, 2);
    expectEvals(evals, 60, 'Phon', 'Mon Apr 01 2019', 17.15, 2);
    expectEvals(evals, 61, 'Cash', 'Mon Apr 01 2019', 119.64, 2);
    expectEvals(evals, 62, 'Phon', 'Fri Apr 05 2019', 18.86, 2);
    expectEvals(evals, 63, 'Cash', 'Wed May 01 2019', 119.64, 2);
    expectEvals(evals, 64, 'Phon', 'Sun May 05 2019', 20.75, 2);
    expectEvals(evals, 65, 'Cash', 'Sat Jun 01 2019', 119.64, 2);
    expectEvals(evals, 66, 'Phon', 'Wed Jun 05 2019', 22.82, 2);
    expectEvals(evals, 67, 'Cash', 'Mon Jul 01 2019', 119.64, 2);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(20);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 1, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 2, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 4, -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8, -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 8.80, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 9.68, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 10.65, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 11.71, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 12.88, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 14.17, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 15.59, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 17.15, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 0, -1);
    expectChartData(chartPts, 18, 'Sat Jun 01 2019', 0, -1);
    expectChartData(chartPts, 19, 'Mon Jul 01 2019', 0, -1);
    }
    
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(20);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 2, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 3, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 4, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 5, -1);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 7, -1);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 11, -1);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 19, -1);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 27.80, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 37.48, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 48.13, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 59.84, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 72.72, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 86.90, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 102.49, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 119.64, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 119.64, 2);
    expectChartData(chartPts, 18, 'Sat Jun 01 2019', 119.64, 2);
    expectChartData(chartPts, 19, 'Mon Jul 01 2019', 119.64, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('should apply growth and one-off pay revalue to income', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
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
      settings: [...defaultModelSettings(roi)],
    };
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

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Mon Mar 05 2018', 300, -1);
    expectEvals(evals, 4, 'savings', 'Sun Apr 01 2018', 302.85, 2);

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Mon Mar 05 2018', 254.77, 2);
    expectEvals(evals, 4, 'savings', 'Sun Apr 01 2018', 257.18, 2);

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
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

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarse);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, total);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, fine);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, CASH_ASSET_NAME);
    viewSettings.setViewSetting(viewDetail, coarse);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, coarse);
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

    done();
  });

  it('filter chart data into single uncategorised asset, coarse', done => {
    const model = getModelCoarseAndFine();
    // log(`model - ${showObj(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'stocks');
    viewSettings.setViewSetting(viewDetail, coarse);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'savings');
    viewSettings.setViewSetting(viewDetail, coarse);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, fine);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarse);
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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarse);
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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewDetail, coarse);
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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, coarse);
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

    const evalsAndValues = getTestEvaluations(model);
    // const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    viewSettings.toggleViewFilter(Context.Asset, allItems);
    viewSettings.toggleViewFilter(Context.Asset, 'Accessible');
    viewSettings.setViewSetting(viewDetail, fine);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

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

  it('asset view pension transfers reductions', done => {
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

  it('asset view pension transfers deltas', done => {
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

  function checkSettingValue(key: string, value: string){
    const modelAndRoi = getModelCrystallizedPension();

    const model = modelAndRoi.model;

    setSetting(model.settings, key, value, viewType);

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);  
  }

  it('check nonsense settings', done => {
    const settingsKeys = [
      birthDate, // '' or a string date
      viewFrequency, // monthly or annual
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
      checkSettingValue( key, 'nonsense');
    }

    done();
  });

  it('unused allowances', done => {
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

  it('asset growth should be a number or a numerical setting', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    suppressLogs();
    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('trigger name cant have +', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'January 1 2018',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a+',
          DATE: '1 Jan 2018',
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

  it('trigger name cant have -', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'January 1 2018',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a-',
          DATE: '1 Jan 2018',
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

  it('trigger 1 day before', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a-1d',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '2 Jan 2018',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger 1 day after', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a+1d',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '31 Dec 2017',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger 1 month before', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a-1m',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '1 Feb 2018',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger 1 month after', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a+1m',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '1 Dec 2017',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger 1 year before', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a-1y',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '1 Jan 2019',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger 1 year after', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'a+1y',
          VALUE: '1.0',
        },          
      ],
      settings: [...defaultModelSettings(roi)],
      triggers: [
        {
          NAME: 'a',
          DATE: '1 Jan 2017',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger defined 1 day before', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'b',
          VALUE: '1.0',
        },          
      ],
      settings: [
        ...defaultModelSettings(roi),
      ],
      triggers: [
        {
          NAME: 'a',
          DATE: '3 Jan 2018',
        },
        {
          NAME: 'b',
          DATE: 'a-2d',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 1, 'Shr1', 'Thu Feb 01 2018', 1, -1);

    done();
  });

  it('trigger defined infinite recursion', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Shr1',
          START: 'b',
          VALUE: '1.0',
        },          
      ],
      settings: [
        ...defaultModelSettings(roi),
      ],
      triggers: [
        {
          NAME: 'a',
          DATE: 'b-1d',
        },
        {
          NAME: 'b',
          DATE: 'a-2d',
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model, false);
    const evals = evalsAndValues.evaluations;
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });

  it('conditional transaction from abs to half, asset runs out', done => {
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

  it('conditional transaction from abs to half, cash is zerod', done => {
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

  it('conditional transaction from prop to half, cash reduces', done => {
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

  it('conditional transaction from prop to half, asset runs out', done => {
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
  it('pay off mortgage, conditional, to absolute', done => {
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
  it('pay off mortgage, conditional, to not absolute', done => {
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

  it('pay off loan, conditional, to absolute', done => {
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

  it('pay off loan, conditional, to not absolute', done => {
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

  it('negative value for asset which cant be negative', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

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
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'aaaa', 'Tue Jan 02 2018', 50, -1);
    expectEvals(evals, 1, 'bbbb', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 2, 'aaaa', 'Tue Jan 02 2018', -50, -1);
    expectEvals(evals, 3, 'bbbb', 'Tue Jan 02 2018', 100, -1);

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

    done();
  });

  it('negative value not allowed for from asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'February 1, 2018 00:00:00',
    };
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };
    model.settings.forEach(s => {
      if (s.NAME === assetChartFocus) {
        s.VALUE = allItems;
      }
    });

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'aaaa', 'Tue Jan 02 2018', 50, -1);
    expectEvals(evals, 1, 'bbbb', 'Tue Jan 02 2018', 0, -1);
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

    done();
  });

  it('define three cars', done => {
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
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy three for this price
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('be given some cars', done => {
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
          NAME: 'Be given some cars',
          TO: 'Cars',
          TO_VALUE: '3', // be given 3
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 6, -1);
    expectEvals(evals, 8, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 9, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cars', 'Wed May 02 2018', 600, -1);

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
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 300, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 300, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 300, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 600, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });


  it('be given some US cars', done => {
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
          VALUE: '100USD',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Be given some cars',
          TO: 'Cars',
          TO_VALUE: '3', // be given 3
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi),
        {
          NAME: 'USD',
          VALUE: '0.88', // exchange rate
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },        
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 0.88, 2);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 3, 'Cars', 'Tue Jan 02 2018', 264, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cars', 'Fri Feb 02 2018', 264, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'Cars', 'Fri Mar 02 2018', 264, -1);
    expectEvals(evals, 8, 'quantityCars', 'Sat Mar 10 2018', 6, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cars', 'Mon Apr 02 2018', 528, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cars', 'Wed May 02 2018', 528, -1);

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
    expect(result.assetData[0].item.NAME).toBe('Cars');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 264, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 264, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 264, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 528, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('simple sell some cars', done => {
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
          NAME: 'Sell some cars',
          FROM: 'Cars',
          FROM_VALUE: '2', // selling 2 of our fleet of 3
          TO: CASH_ASSET_NAME,
          TO_VALUE: '0.95', // sacrifice a fee
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
    model.assets.filter(a => {
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

  it('conditionally sell some cars need all', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some cars need two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some cars need exactly two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some cars fees matter', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('can use income tax on asset for taxable benefits', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const assetName = `${taxableBenefit} medical`;
    const model: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, `${assetName}`, 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 3, `${assetName}`, 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 5, `${assetName}`, 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, `${assetName}`, 'Mon Mar 05 2018', 100000, -1);
    expectEvals(evals, 7, 'Cash', 'Mon Mar 05 2018', -43541.66, 2);
    expectEvals(evals, 8, `${assetName}`, 'Tue Mar 06 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', -43541.66, 2);
    expectEvals(evals, 10, `${assetName}`, 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 05 2018', -27500, -1);
    expectEvals(evals, 12, '(incomeTax)', 'Thu Apr 05 2018', 27500, -1);
    expectEvals(evals, 13, getnetincLabel('Joe'), 'Thu Apr 05 2018', 72500, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -27500, -1);
    expectEvals(evals, 15, `${assetName}`, 'Tue May 01 2018', 0, -1);

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
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', -43541.66, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', -27500, -1);
    }
    
    expect(result.debtData.length).toBe(0);
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
    expectChartData(chartPts, 5, 'Tue May 01 2018', 27500, -1);
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
    expectChartData(chartPts, 5, 'Tue May 01 2018', 72500, -1);
    }

    done();
  });

  it('an asset can be a quantity of things', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const model: ModelData = {
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
        ...defaultModelSettings(roi),
        {
          NAME: thingName,
          VALUE: '123',
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };

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
    const model: ModelData = {
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
        ...defaultModelSettings(roi),
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

  it('sell more things than we have', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'things',
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
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Sell all things',
          FROM: 'things',
          FROM_VALUE: '12',
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: thingName,
          VALUE: '123',
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'thing', 'Mon Jan 01 2018', 123, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantitythings', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, 'things', 'Mon Jan 01 2018', 1230, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'things', 'Thu Feb 01 2018', 1230, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'things', 'Thu Mar 01 2018', 1230, -1);
    expectEvals(evals, 8, 'quantitythings', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 9, 'things', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 1230, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 1230, -1);
    expectEvals(evals, 12, 'things', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 1230, -1);
    expectEvals(evals, 14, 'things', 'Tue May 01 2018', 0, -1);

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
    expect(result.assetData[0].item.NAME).toBe('things');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1230, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1230, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1230, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1230, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 1230, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('sell 100% of a quantity of things', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'things',
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
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Sell all things',
          FROM: 'things',
          FROM_VALUE: '1.0',
          FROM_ABSOLUTE: false,
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: thingName,
          VALUE: '123',
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'thing', 'Mon Jan 01 2018', 123, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantitythings', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, 'things', 'Mon Jan 01 2018', 1230, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'things', 'Thu Feb 01 2018', 1230, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'things', 'Thu Mar 01 2018', 1230, -1);
    expectEvals(evals, 8, 'quantitythings', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 9, 'things', 'Sat Mar 10 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 1230, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 1230, -1);
    expectEvals(evals, 12, 'things', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 1230, -1);
    expectEvals(evals, 14, 'things', 'Tue May 01 2018', 0, -1);

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
    expect(result.assetData[0].item.NAME).toBe('things');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1230, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1230, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1230, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1230, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 1230, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('sell 99% of a quantity of things', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const thingName = `thing`;
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'things',
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
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Sell all things',
          FROM: 'things',
          FROM_VALUE: '0.99',
          FROM_ABSOLUTE: false,
          TO: CASH_ASSET_NAME,
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: thingName,
          VALUE: '123',
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);
 
    expect(evals.length).toBe(15);
    expectEvals(evals, 0, 'thing', 'Mon Jan 01 2018', 123, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'quantitythings', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 3, 'things', 'Mon Jan 01 2018', 1230, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'things', 'Thu Feb 01 2018', 1230, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 7, 'things', 'Thu Mar 01 2018', 1230, -1);
    expectEvals(evals, 8, 'quantitythings', 'Sat Mar 10 2018', 1, -1);
    expectEvals(evals, 9, 'things', 'Sat Mar 10 2018', 123, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', 1107, -1);
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 1107, -1);
    expectEvals(evals, 12, 'things', 'Sun Apr 01 2018', 123, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 1107, -1);
    expectEvals(evals, 14, 'things', 'Tue May 01 2018', 123, -1);

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
    expect(result.assetData[0].item.NAME).toBe('things');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 1230, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1230, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 1230, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 123, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 123, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 1107, -1);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 1107, -1);
    }

    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('define three mini cars', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy 3 for this price
          DATE: 'Mar 10 2018',
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
        ...defaultModelSettings(roi),
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some mini cars need two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some mini cars need exactly two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some mini cars fees matter', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('define three chrysler cars', done => {
    const model = getThreeChryslerModel();

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
          NAME: 'Revalue cars',
          TO: 'Cars',
          TO_VALUE: '50', // unit revaluation!!!
          DATE: 'Mar 10 2018',
          TYPE: revalueAsset,
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
          NAME: 'Buy some cars',
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: '333', // this was the price for all three
          TO: 'Cars',
          TO_VALUE: '3', // buy 3 for this price
          DATE: 'Mar 10 2018',
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
          TYPE: 'adjustable',
        },
      ],
    };
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some chrysler cars need two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some chrysler cars need exactly two', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some chrysler cars capped', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some chrysler cars fees matter', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('conditionally sell some chrysler cars then revalue chrysler', done => {
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('define three daimler cars', done => {
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
          VALUE: 'daimler',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
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
    const model: ModelData = {
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
        ...defaultModelSettings(roi),
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
    const model: ModelData = {
      ...minimalModel,
      triggers: [
        {
          NAME: 'carStartDate',
          DATE: 'January 2 2018',
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
        ...defaultModelSettings(roi),
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
    model.assets.filter(a => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

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

  it('define three cadillac cars', done => {
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
          NAME: 'Cadillac',
          START: 'January 2 2018',
          VALUE: '100USD',
          CPI_IMMUNE: true,
          QUANTITY: '3',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
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
    const model: ModelData = {
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
        ...defaultModelSettings(roi),
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

    const model: ModelData = {
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
        ...defaultModelSettings(roi),
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
      end: '1 May 2019',
    };

    const model = makeModelFromJSON(`{
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
    }`);

    model.transactions.push({
      NAME: 'Revalue a setting',
      FROM: '',
      FROM_ABSOLUTE: true,
      FROM_VALUE: '',
      TO: 'stockMarketGrowth',
      TO_ABSOLUTE: true,
      TO_VALUE: '0.0',
      DATE: 'March 2019',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'revalueSetting',
      CATEGORY: '',
    });

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'stockMarketGrowth', 'Fri Dec 28 2018', 12, -1);
    expectEvals(evals, 1, 'Cash', 'Fri Dec 28 2018', 100, -1);
    expectEvals(evals, 2, 'ISAs', 'Fri Dec 28 2018', 100, -1);
    expectEvals(evals, 3, 'Stks', 'Fri Dec 28 2018', 100, -1);
    expectEvals(evals, 4, 'Cash', 'Mon Jan 28 2019', 100.95, 2); // go up by CPI
    expectEvals(evals, 5, 'ISAs', 'Mon Jan 28 2019', 100.95, 2); // go up by growth
    expectEvals(evals, 6, 'Stks', 'Mon Jan 28 2019', 101.81, 2); // go up by both
    expectEvals(evals, 7, 'Cash', 'Thu Feb 28 2019', 101.91, 2);
    expectEvals(evals, 8, 'ISAs', 'Thu Feb 28 2019', 101.91, 2);
    expectEvals(evals, 9, 'Stks', 'Thu Feb 28 2019', 103.65, 2);
    expectEvals(evals, 10, 'stockMarketGrowth', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 28 2019', 102.87, 2);
    expectEvals(evals, 12, 'ISAs', 'Thu Mar 28 2019', 101.91, 2); // don't go up noe
    expectEvals(evals, 13, 'Stks', 'Thu Mar 28 2019', 104.63, 2);
    expectEvals(evals, 14, 'Cash', 'Sun Apr 28 2019', 103.85, 2); // by CPI
    expectEvals(evals, 15, 'ISAs', 'Sun Apr 28 2019', 101.91, 2); // don't go up noe
    expectEvals(evals, 16, 'Stks', 'Sun Apr 28 2019', 105.63, 2); // only CPI

    const viewSettings = defaultTestViewSettings();

    // viewSettings.setViewSetting(viewFrequency, annually);
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
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Tue Jan 01 2019', 100, -1);
    expectChartData(chartPts, 1, 'Fri Feb 01 2019', 100.95, 2);
    expectChartData(chartPts, 2, 'Fri Mar 01 2019', 101.91, 2);
    expectChartData(chartPts, 3, 'Mon Apr 01 2019', 102.87, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('ISAs');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Tue Jan 01 2019', 100, -1);
    expectChartData(chartPts, 1, 'Fri Feb 01 2019', 100.95, 2);
    expectChartData(chartPts, 2, 'Fri Mar 01 2019', 101.91, 2);
    expectChartData(chartPts, 3, 'Mon Apr 01 2019', 101.91, 2);
    }
    
    expect(result.assetData[2].item.NAME).toBe('Stks');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(4);
    expectChartData(chartPts, 0, 'Tue Jan 01 2019', 100, -1);
    expectChartData(chartPts, 1, 'Fri Feb 01 2019', 101.81, 2);
    expectChartData(chartPts, 2, 'Fri Mar 01 2019', 103.65, 2);
    expectChartData(chartPts, 3, 'Mon Apr 01 2019', 104.63, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);

    done();
  });

  it('revalue a setting 02', done => {
    const revalueData = `
    {
    "triggers":[
    {"NAME":"TransferMortgage","DATE":"2028-01-01"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"}
    ],
    "expenses":[
    ],
    "incomes":[
    ],
    "assets":[
    {"NAME":"thing","VALUE":"stockvalue","QUANTITY":"100","START":"2019","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
    {"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}
    ],
    "transactions":[
    {"DATE":"2026","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 3","TO":"stockvalue","TO_ABSOLUTE":true,"TO_VALUE":"2026EUR","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueSetting","CATEGORY":""},
    {"NAME":"Revalue stockvalue 2","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"2024","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
    {"DATE":"2030","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"Revalue stockvalue 1","TO":"stockvalue","TO_ABSOLUTE":false,"TO_VALUE":"0.9","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
    {"NAME":"Revalue EUR 1","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"EUR","TO_ABSOLUTE":true,"TO_VALUE":"1.6","DATE":"2028","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""}],
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
        NAME: 'View frequency',
        VALUE: 'Annually',
      },
      {
        NAME: 'View detail',
        VALUE: 'Detailed view',
      },
      {
        NAME: 'Type of view for debt chart',
        VALUE: 'val',
      },
      {
        NAME: 'Type of view for chart',
        VALUE: 'val',
      },
      {
        NAME: 'Focus of incomes chart',
        VALUE: 'All',
      },
      {
        NAME: 'Focus of expenses chart',
        VALUE: 'All',
      },
      {
        NAME: 'Focus of debts chart',
        VALUE: 'All',
      },
      {
        NAME: 'Focus of assets chart',
        VALUE: 'thing',
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
        VALUE: 'Y',
      },
    ]);

    const model = makeModelFromJSON(revalueData);

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
  it('revalue a setting cpi for asset growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'July 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '100.0',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'saaaaaa',
          START: 'January 1 2018',
          VALUE: '100.0',
          GROWTH: 'rises',
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: 'sbbbbbb',
          START: 'January 1 2018',
          VALUE: '100.0',
          GROWTH: 'x',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'scccccc',
          START: 'January 1 2018',
          VALUE: '100.0',
          GROWTH: 'rises',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: 'Revalue grow cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '100.0',
          DATE: 'May 2018',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue drop cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '0.0',
          DATE: 'May 2019',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue grow x',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'x',
          TO_ABSOLUTE: true,
          TO_VALUE: '100.0',
          DATE: 'May 2018',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue drop x',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'x',
          TO_ABSOLUTE: true,
          TO_VALUE: '0.0',
          DATE: 'May 2019',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue grow rises',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'rises',
          TO_ABSOLUTE: true,
          TO_VALUE: '100.0',
          DATE: 'March 2018',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue drop rises',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'rises',
          TO_ABSOLUTE: true,
          TO_VALUE: '0.0',
          DATE: 'March 2019',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        }
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'x', '0', constType);
    setSetting(model.settings, 'rises', '0', constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(85);
    expectEvals(evals, 0, 'cpi', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 1, 'x', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'rises', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 3, 'saaaaaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 4, 'savings', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 5, 'sbbbbbb', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 6, 'scccccc', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 7, 'saaaaaa', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 8, 'savings', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 9, 'sbbbbbb', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 10, 'scccccc', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 11, 'saaaaaa', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 12, 'savings', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 13, 'sbbbbbb', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 14, 'scccccc', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 15, 'rises', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 16, 'saaaaaa', 'Sun Apr 01 2018', 105.95, 2);
    expectEvals(evals, 17, 'savings', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 18, 'sbbbbbb', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 19, 'scccccc', 'Sun Apr 01 2018', 105.95, 2);
    expectEvals(evals, 20, 'saaaaaa', 'Tue May 01 2018', 112.25, 2);
    expectEvals(evals, 21, 'savings', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 22, 'sbbbbbb', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 23, 'scccccc', 'Tue May 01 2018', 112.25, 2);
    expectEvals(evals, 24, 'cpi', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 25, 'x', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 26, 'saaaaaa', 'Fri Jun 01 2018', 118.92, 2);
    expectEvals(evals, 27, 'savings', 'Fri Jun 01 2018', 105.95, 2);
    expectEvals(evals, 28, 'sbbbbbb', 'Fri Jun 01 2018', 109.59, 2);
    expectEvals(evals, 29, 'scccccc', 'Fri Jun 01 2018', 123.01, 2);
    expectEvals(evals, 30, 'saaaaaa', 'Sun Jul 01 2018', 125.99, 2);
    expectEvals(evals, 31, 'savings', 'Sun Jul 01 2018', 112.25, 2);
    expectEvals(evals, 32, 'sbbbbbb', 'Sun Jul 01 2018', 120.09, 2);
    expectEvals(evals, 33, 'scccccc', 'Sun Jul 01 2018', 134.80, 2);
    expectEvals(evals, 34, 'saaaaaa', 'Wed Aug 01 2018', 133.48, 2);
    expectEvals(evals, 35, 'savings', 'Wed Aug 01 2018', 118.92, 2);
    expectEvals(evals, 36, 'sbbbbbb', 'Wed Aug 01 2018', 131.61, 2);
    expectEvals(evals, 37, 'scccccc', 'Wed Aug 01 2018', 147.72, 2);
    expectEvals(evals, 38, 'saaaaaa', 'Sat Sep 01 2018', 141.42, 2);
    expectEvals(evals, 39, 'savings', 'Sat Sep 01 2018', 125.99, 2);
    expectEvals(evals, 40, 'sbbbbbb', 'Sat Sep 01 2018', 144.22, 2);
    expectEvals(evals, 41, 'scccccc', 'Sat Sep 01 2018', 161.89, 2);
    expectEvals(evals, 42, 'saaaaaa', 'Mon Oct 01 2018', 149.83, 2);
    expectEvals(evals, 43, 'savings', 'Mon Oct 01 2018', 133.48, 2);
    expectEvals(evals, 44, 'sbbbbbb', 'Mon Oct 01 2018', 158.05, 2);
    expectEvals(evals, 45, 'scccccc', 'Mon Oct 01 2018', 177.41, 2);
    expectEvals(evals, 46, 'saaaaaa', 'Thu Nov 01 2018', 158.74, 2);
    expectEvals(evals, 47, 'savings', 'Thu Nov 01 2018', 141.42, 2);
    expectEvals(evals, 48, 'sbbbbbb', 'Thu Nov 01 2018', 173.21, 2);
    expectEvals(evals, 49, 'scccccc', 'Thu Nov 01 2018', 194.42, 2);
    expectEvals(evals, 50, 'saaaaaa', 'Sat Dec 01 2018', 168.18, 2);
    expectEvals(evals, 51, 'savings', 'Sat Dec 01 2018', 149.83, 2);
    expectEvals(evals, 52, 'sbbbbbb', 'Sat Dec 01 2018', 189.81, 2);
    expectEvals(evals, 53, 'scccccc', 'Sat Dec 01 2018', 213.06, 2);
    expectEvals(evals, 54, 'saaaaaa', 'Tue Jan 01 2019', 178.18, 2);
    expectEvals(evals, 55, 'savings', 'Tue Jan 01 2019', 158.74, 2);
    expectEvals(evals, 56, 'sbbbbbb', 'Tue Jan 01 2019', 208.01, 2);
    expectEvals(evals, 57, 'scccccc', 'Tue Jan 01 2019', 233.48, 2);
    expectEvals(evals, 58, 'saaaaaa', 'Fri Feb 01 2019', 188.77, 2);
    expectEvals(evals, 59, 'savings', 'Fri Feb 01 2019', 168.18, 2);
    expectEvals(evals, 60, 'sbbbbbb', 'Fri Feb 01 2019', 227.95, 2);
    expectEvals(evals, 61, 'scccccc', 'Fri Feb 01 2019', 255.87, 2);
    expectEvals(evals, 62, 'saaaaaa', 'Fri Mar 01 2019', 200.00, 2);
    expectEvals(evals, 63, 'savings', 'Fri Mar 01 2019', 178.18, 2);
    expectEvals(evals, 64, 'sbbbbbb', 'Fri Mar 01 2019', 249.80, 2);
    expectEvals(evals, 65, 'scccccc', 'Fri Mar 01 2019', 280.40, 2);
    expectEvals(evals, 66, 'rises', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 67, 'saaaaaa', 'Mon Apr 01 2019', 200.00, 2);
    expectEvals(evals, 68, 'savings', 'Mon Apr 01 2019', 188.77, 2);
    expectEvals(evals, 69, 'sbbbbbb', 'Mon Apr 01 2019', 273.75, 2);
    expectEvals(evals, 70, 'scccccc', 'Mon Apr 01 2019', 297.07, 2);
    expectEvals(evals, 71, 'saaaaaa', 'Wed May 01 2019', 200.00, 2);
    expectEvals(evals, 72, 'savings', 'Wed May 01 2019', 200.00, 2);
    expectEvals(evals, 73, 'sbbbbbb', 'Wed May 01 2019', 300.00, 2);
    expectEvals(evals, 74, 'scccccc', 'Wed May 01 2019', 314.73, 2);
    expectEvals(evals, 75, 'cpi', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 76, 'x', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 77, 'saaaaaa', 'Sat Jun 01 2019', 200.00, 2);
    expectEvals(evals, 78, 'savings', 'Sat Jun 01 2019', 200.00, 2);
    expectEvals(evals, 79, 'sbbbbbb', 'Sat Jun 01 2019', 300.00, 2);
    expectEvals(evals, 80, 'scccccc', 'Sat Jun 01 2019', 314.73, 2);
    expectEvals(evals, 81, 'saaaaaa', 'Mon Jul 01 2019', 200.00, 2);
    expectEvals(evals, 82, 'savings', 'Mon Jul 01 2019', 200.00, 2);
    expectEvals(evals, 83, 'sbbbbbb', 'Mon Jul 01 2019', 300.00, 2);
    expectEvals(evals, 84, 'scccccc', 'Mon Jul 01 2019', 314.73, 2);
    // this value 314.73 is right;
    // if 1yr of cpi and rises are coincident then the asset triples
    // if 1yr of cpi and rises are separated then the asset quadruples
    // if 1yr of cpi and rises partially overlap then the asset increases
    // by some value between 3 and 4.
    // 10 months of overlap and 2 * 2 months of non-overlap makes for
    // 3^(10/12)*2^(2*2/12) = 3.1473...
    
    done();
  });

  it('revalue a setting cpi for income growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'August 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,

      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'PRnd',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'Paaa',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '100.0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'Pccc',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '100.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: 'Revalue grow cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '100.0',
          DATE: 'May 2018',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue drop cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '0.0',
          DATE: 'May 2019',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(63);
    expectEvals(evals, 0, 'cpi', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Paaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 3, 'Pccc', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 4, 'PRnd', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 5, 'Paaa', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 6, 'Pccc', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 7, 'PRnd', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 8, 'Paaa', 'Thu Mar 01 2018', 112.25, 2);
    expectEvals(evals, 9, 'Pccc', 'Thu Mar 01 2018', 112.25, 2);
    expectEvals(evals, 10, 'PRnd', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 11, 'Paaa', 'Sun Apr 01 2018', 118.92, 2);
    expectEvals(evals, 12, 'Pccc', 'Sun Apr 01 2018', 118.92, 2);
    expectEvals(evals, 13, 'PRnd', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 14, 'Paaa', 'Tue May 01 2018', 125.99, 2);
    expectEvals(evals, 15, 'Pccc', 'Tue May 01 2018', 125.99, 2);
    expectEvals(evals, 16, 'cpi', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 17, 'PRnd', 'Fri Jun 01 2018', 105.95, 2);
    expectEvals(evals, 18, 'Paaa', 'Fri Jun 01 2018', 133.48, 2);
    expectEvals(evals, 19, 'Pccc', 'Fri Jun 01 2018', 138.07, 2);
    expectEvals(evals, 20, 'PRnd', 'Sun Jul 01 2018', 112.25, 2);
    expectEvals(evals, 21, 'Paaa', 'Sun Jul 01 2018', 141.42, 2);
    expectEvals(evals, 22, 'Pccc', 'Sun Jul 01 2018', 151.31, 2);
    expectEvals(evals, 23, 'PRnd', 'Wed Aug 01 2018', 118.92, 2);
    expectEvals(evals, 24, 'Paaa', 'Wed Aug 01 2018', 149.83, 2);
    expectEvals(evals, 25, 'Pccc', 'Wed Aug 01 2018', 165.81, 2);
    expectEvals(evals, 26, 'PRnd', 'Sat Sep 01 2018', 125.99, 2);
    expectEvals(evals, 27, 'Paaa', 'Sat Sep 01 2018', 158.74, 2);
    expectEvals(evals, 28, 'Pccc', 'Sat Sep 01 2018', 181.71, 2);
    expectEvals(evals, 29, 'PRnd', 'Mon Oct 01 2018', 133.48, 2);
    expectEvals(evals, 30, 'Paaa', 'Mon Oct 01 2018', 168.18, 2);
    expectEvals(evals, 31, 'Pccc', 'Mon Oct 01 2018', 199.13, 2);
    expectEvals(evals, 32, 'PRnd', 'Thu Nov 01 2018', 141.42, 2);
    expectEvals(evals, 33, 'Paaa', 'Thu Nov 01 2018', 178.18, 2);
    expectEvals(evals, 34, 'Pccc', 'Thu Nov 01 2018', 218.22, 2);
    expectEvals(evals, 35, 'PRnd', 'Sat Dec 01 2018', 149.83, 2);
    expectEvals(evals, 36, 'Paaa', 'Sat Dec 01 2018', 188.77, 2);
    expectEvals(evals, 37, 'Pccc', 'Sat Dec 01 2018', 239.15, 2);
    expectEvals(evals, 38, 'PRnd', 'Tue Jan 01 2019', 158.74, 2);
    expectEvals(evals, 39, 'Paaa', 'Tue Jan 01 2019', 200.00, 2);
    expectEvals(evals, 40, 'Pccc', 'Tue Jan 01 2019', 262.07, 2);
    expectEvals(evals, 41, 'PRnd', 'Fri Feb 01 2019', 168.18, 2);
    expectEvals(evals, 42, 'Paaa', 'Fri Feb 01 2019', 211.89, 2);
    expectEvals(evals, 43, 'Pccc', 'Fri Feb 01 2019', 287.20, 2);
    expectEvals(evals, 44, 'PRnd', 'Fri Mar 01 2019', 178.18, 2);
    expectEvals(evals, 45, 'Paaa', 'Fri Mar 01 2019', 224.49, 2);
    expectEvals(evals, 46, 'Pccc', 'Fri Mar 01 2019', 314.73, 2);
    expectEvals(evals, 47, 'PRnd', 'Mon Apr 01 2019', 188.77, 2);
    expectEvals(evals, 48, 'Paaa', 'Mon Apr 01 2019', 237.84, 2);
    expectEvals(evals, 49, 'Pccc', 'Mon Apr 01 2019', 344.91, 2);
    expectEvals(evals, 50, 'PRnd', 'Wed May 01 2019', 200.00, 2);
    expectEvals(evals, 51, 'Paaa', 'Wed May 01 2019', 251.98, 2);
    expectEvals(evals, 52, 'Pccc', 'Wed May 01 2019', 377.98, 2);
    expectEvals(evals, 53, 'cpi', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 54, 'PRnd', 'Sat Jun 01 2019', 200.00, 2);
    expectEvals(evals, 55, 'Paaa', 'Sat Jun 01 2019', 266.97, 2);
    expectEvals(evals, 56, 'Pccc', 'Sat Jun 01 2019', 400.45, 2);
    expectEvals(evals, 57, 'PRnd', 'Mon Jul 01 2019', 200.00, 2);
    expectEvals(evals, 58, 'Paaa', 'Mon Jul 01 2019', 282.84, 2);
    expectEvals(evals, 59, 'Pccc', 'Mon Jul 01 2019', 424.26, 2);
    expectEvals(evals, 60, 'PRnd', 'Thu Aug 01 2019', 200.00, 2);
    expectEvals(evals, 61, 'Paaa', 'Thu Aug 01 2019', 299.66, 2);
    expectEvals(evals, 62, 'Pccc', 'Thu Aug 01 2019', 449.49, 2);
    // this is right;
    // 2^(19/12) = 2.9966...
    // 2^(7/12)*3 = 4.494...

    const viewSettings = defaultTestViewSettings();

    viewSettings.setViewSetting(viewFrequency, annually);
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    done();
  });

  it('revalue a setting cpi for expense growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'August 2, 2019 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'PHon',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'Paaa',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '100.0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 1 2025',
          NAME: 'Pccc',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2018',
          GROWTH: '100.0',
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          NAME: 'Revalue grow cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '100.0',
          DATE: 'May 2018',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        },
        {
          NAME: 'Revalue drop cpi',
          FROM: '',
          FROM_ABSOLUTE: true,
          FROM_VALUE: '',
          TO: 'cpi',
          TO_ABSOLUTE: true,
          TO_VALUE: '0.0',
          DATE: 'May 2019',
          STOP_DATE: '',
          RECURRENCE: '',
          TYPE: 'revalueSetting',
          CATEGORY: '',
        }
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);

    setROI(model, roi);
    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(63);
    expectEvals(evals, 0, 'cpi', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 1, 'PHon', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 2, 'Paaa', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 3, 'Pccc', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 4, 'PHon', 'Thu Feb 01 2018', 100, -1);
    expectEvals(evals, 5, 'Paaa', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 6, 'Pccc', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 7, 'PHon', 'Thu Mar 01 2018', 100, -1);
    expectEvals(evals, 8, 'Paaa', 'Thu Mar 01 2018', 112.25, 2);
    expectEvals(evals, 9, 'Pccc', 'Thu Mar 01 2018', 112.25, 2);
    expectEvals(evals, 10, 'PHon', 'Sun Apr 01 2018', 100, -1);
    expectEvals(evals, 11, 'Paaa', 'Sun Apr 01 2018', 118.92, 2);
    expectEvals(evals, 12, 'Pccc', 'Sun Apr 01 2018', 118.92, 2);
    expectEvals(evals, 13, 'PHon', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 14, 'Paaa', 'Tue May 01 2018', 125.99, 2);
    expectEvals(evals, 15, 'Pccc', 'Tue May 01 2018', 125.99, 2);
    expectEvals(evals, 16, 'cpi', 'Tue May 01 2018', 100, -1);
    expectEvals(evals, 17, 'PHon', 'Fri Jun 01 2018', 105.95, 2);
    expectEvals(evals, 18, 'Paaa', 'Fri Jun 01 2018', 133.48, 2);
    expectEvals(evals, 19, 'Pccc', 'Fri Jun 01 2018', 138.07, 2);
    expectEvals(evals, 20, 'PHon', 'Sun Jul 01 2018', 112.25, 2);
    expectEvals(evals, 21, 'Paaa', 'Sun Jul 01 2018', 141.42, 2);
    expectEvals(evals, 22, 'Pccc', 'Sun Jul 01 2018', 151.31, 2);
    expectEvals(evals, 23, 'PHon', 'Wed Aug 01 2018', 118.92, 2);
    expectEvals(evals, 24, 'Paaa', 'Wed Aug 01 2018', 149.83, 2);
    expectEvals(evals, 25, 'Pccc', 'Wed Aug 01 2018', 165.81, 2);
    expectEvals(evals, 26, 'PHon', 'Sat Sep 01 2018', 125.99, 2);
    expectEvals(evals, 27, 'Paaa', 'Sat Sep 01 2018', 158.74, 2);
    expectEvals(evals, 28, 'Pccc', 'Sat Sep 01 2018', 181.71, 2);
    expectEvals(evals, 29, 'PHon', 'Mon Oct 01 2018', 133.48, 2);
    expectEvals(evals, 30, 'Paaa', 'Mon Oct 01 2018', 168.18, 2);
    expectEvals(evals, 31, 'Pccc', 'Mon Oct 01 2018', 199.13, 2);
    expectEvals(evals, 32, 'PHon', 'Thu Nov 01 2018', 141.42, 2);
    expectEvals(evals, 33, 'Paaa', 'Thu Nov 01 2018', 178.18, 2);
    expectEvals(evals, 34, 'Pccc', 'Thu Nov 01 2018', 218.22, 2);
    expectEvals(evals, 35, 'PHon', 'Sat Dec 01 2018', 149.83, 2);
    expectEvals(evals, 36, 'Paaa', 'Sat Dec 01 2018', 188.77, 2);
    expectEvals(evals, 37, 'Pccc', 'Sat Dec 01 2018', 239.15, 2);
    expectEvals(evals, 38, 'PHon', 'Tue Jan 01 2019', 158.74, 2);
    expectEvals(evals, 39, 'Paaa', 'Tue Jan 01 2019', 200.00, 2);
    expectEvals(evals, 40, 'Pccc', 'Tue Jan 01 2019', 262.07, 2);
    expectEvals(evals, 41, 'PHon', 'Fri Feb 01 2019', 168.18, 2);
    expectEvals(evals, 42, 'Paaa', 'Fri Feb 01 2019', 211.89, 2);
    expectEvals(evals, 43, 'Pccc', 'Fri Feb 01 2019', 287.20, 2);
    expectEvals(evals, 44, 'PHon', 'Fri Mar 01 2019', 178.18, 2);
    expectEvals(evals, 45, 'Paaa', 'Fri Mar 01 2019', 224.49, 2);
    expectEvals(evals, 46, 'Pccc', 'Fri Mar 01 2019', 314.73, 2);
    expectEvals(evals, 47, 'PHon', 'Mon Apr 01 2019', 188.77, 2);
    expectEvals(evals, 48, 'Paaa', 'Mon Apr 01 2019', 237.84, 2);
    expectEvals(evals, 49, 'Pccc', 'Mon Apr 01 2019', 344.91, 2);
    expectEvals(evals, 50, 'PHon', 'Wed May 01 2019', 200.00, 2);
    expectEvals(evals, 51, 'Paaa', 'Wed May 01 2019', 251.98, 2);
    expectEvals(evals, 52, 'Pccc', 'Wed May 01 2019', 377.98, 2);
    expectEvals(evals, 53, 'cpi', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 54, 'PHon', 'Sat Jun 01 2019', 200.00, 2);
    expectEvals(evals, 55, 'Paaa', 'Sat Jun 01 2019', 266.97, 2);
    expectEvals(evals, 56, 'Pccc', 'Sat Jun 01 2019', 400.45, 2);
    expectEvals(evals, 57, 'PHon', 'Mon Jul 01 2019', 200.00, 2);
    expectEvals(evals, 58, 'Paaa', 'Mon Jul 01 2019', 282.84, 2);
    expectEvals(evals, 59, 'Pccc', 'Mon Jul 01 2019', 424.26, 2);
    expectEvals(evals, 60, 'PHon', 'Thu Aug 01 2019', 200.00, 2);
    expectEvals(evals, 61, 'Paaa', 'Thu Aug 01 2019', 299.66, 2);
    expectEvals(evals, 62, 'Pccc', 'Thu Aug 01 2019', 449.49, 2);
    // this is right;
    // 2^(19/12) = 2.9966...
    // 2^(7/12)*3 = 4.494...

    done();
  });

  it('Generate taxable income from asset', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'May 02 2019',
    };
    const minimalModel = getMinimalModelCopy();
    const model: ModelData = {
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

    expect(evals.length).toBe(84);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 0, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 2, 'NSI', 'Tue Jan 02 2018', 1000000, -1);
    expectEvals(evals, 3, 'NSIinterest', 'Tue Jan 02 2018', 1241.40, 2);
    expectEvals(evals, 4, 'Cash', 'Tue Jan 02 2018', 1241.40, 2);
    expectEvals(evals, 5, 'Cash', 'Fri Jan 05 2018', 1203.51, 2);
    expectEvals(evals, 6, 'Cash', 'Thu Feb 01 2018', 1203.51, 2);
    expectEvals(evals, 7, 'NSI', 'Fri Feb 02 2018', 1003273.74, 2);
    expectEvals(evals, 8, 'NSIinterest', 'Fri Feb 02 2018', 1245.46, 2);
    expectEvals(evals, 9, 'Cash', 'Fri Feb 02 2018', 2448.97, 2);
    expectEvals(evals, 10, 'Cash', 'Mon Feb 05 2018', 2412.27, 2);
    expectEvals(evals, 11, 'Cash', 'Thu Mar 01 2018', 2412.27, 2);
    expectEvals(evals, 12, 'NSI', 'Fri Mar 02 2018', 1006558.20, 2);
    expectEvals(evals, 13, 'NSIinterest', 'Fri Mar 02 2018', 1249.54, 2);
    expectEvals(evals, 14, 'Cash', 'Fri Mar 02 2018', 3661.81, 2);
    expectEvals(evals, 15, 'Cash', 'Mon Mar 05 2018', 3626.29, 2);
    expectEvals(evals, 16, 'Cash', 'Sun Apr 01 2018', 3626.29, 2);
    expectEvals(evals, 17, 'NSI', 'Mon Apr 02 2018', 1009853.41, 2);
    expectEvals(evals, 18, 'NSIinterest', 'Mon Apr 02 2018', 1253.63, 2);
    expectEvals(evals, 19, 'Cash', 'Mon Apr 02 2018', 4879.92, 2);
    expectEvals(evals, 20, 'Joe income (net)', 'Thu Apr 05 2018', 4990.04, 2);
    expectEvals(evals, 21, 'Cash', 'Tue May 01 2018', 4887.98, 2);
    expectEvals(evals, 22, 'NSI', 'Wed May 02 2018', 1013159.40, 2);
    expectEvals(evals, 23, 'NSIinterest', 'Wed May 02 2018', 1257.74, 2);
    expectEvals(evals, 24, 'Cash', 'Wed May 02 2018', 6145.72, 2);
    expectEvals(evals, 25, 'Cash', 'Sat May 05 2018', 6112.66, 2);
    expectEvals(evals, 26, 'Cash', 'Fri Jun 01 2018', 6112.66, 2);
    expectEvals(evals, 27, 'NSI', 'Sat Jun 02 2018', 1016476.22, 2);
    expectEvals(evals, 28, 'NSIinterest', 'Sat Jun 02 2018', 1261.85, 2);
    expectEvals(evals, 29, 'Cash', 'Sat Jun 02 2018', 7374.51, 2);
    expectEvals(evals, 30, 'Cash', 'Tue Jun 05 2018', 7342.66, 2);
    expectEvals(evals, 31, 'Cash', 'Sun Jul 01 2018', 7342.66, 2);
    expectEvals(evals, 32, 'NSI', 'Mon Jul 02 2018', 1019803.90, 2);
    expectEvals(evals, 33, 'NSIinterest', 'Mon Jul 02 2018', 1265.98, 2);
    expectEvals(evals, 34, 'Cash', 'Mon Jul 02 2018', 8608.64, 2);
    expectEvals(evals, 35, 'Cash', 'Thu Jul 05 2018', 8578.00, 2);
    expectEvals(evals, 36, 'Cash', 'Wed Aug 01 2018', 8578.00, 2);
    expectEvals(evals, 37, 'NSI', 'Thu Aug 02 2018', 1023142.48, 2);
    expectEvals(evals, 38, 'NSIinterest', 'Thu Aug 02 2018', 1270.13, 2);
    expectEvals(evals, 39, 'Cash', 'Thu Aug 02 2018', 9848.13, 2);
    expectEvals(evals, 40, 'Cash', 'Sun Aug 05 2018', 9818.71, 2);
    expectEvals(evals, 41, 'Cash', 'Sat Sep 01 2018', 9818.71, 2);
    expectEvals(evals, 42, 'NSI', 'Sun Sep 02 2018', 1026491.98, 2);
    expectEvals(evals, 43, 'NSIinterest', 'Sun Sep 02 2018', 1274.29, 2);
    expectEvals(evals, 44, 'Cash', 'Sun Sep 02 2018', 11092.99, 2);
    expectEvals(evals, 45, 'Cash', 'Wed Sep 05 2018', 11064.79, 2);
    expectEvals(evals, 46, 'Cash', 'Mon Oct 01 2018', 11064.79, 2);
    expectEvals(evals, 47, 'NSI', 'Tue Oct 02 2018', 1029852.45, 2);
    expectEvals(evals, 48, 'NSIinterest', 'Tue Oct 02 2018', 1278.46, 2);
    expectEvals(evals, 49, 'Cash', 'Tue Oct 02 2018', 12343.25, 2);
    expectEvals(evals, 50, 'Cash', 'Fri Oct 05 2018', 12316.29, 2);
    expectEvals(evals, 51, 'Cash', 'Thu Nov 01 2018', 12316.29, 2);
    expectEvals(evals, 52, 'NSI', 'Fri Nov 02 2018', 1033223.91, 2);
    expectEvals(evals, 53, 'NSIinterest', 'Fri Nov 02 2018', 1282.64, 2);
    expectEvals(evals, 54, 'Cash', 'Fri Nov 02 2018', 13598.93, 2);
    expectEvals(evals, 55, 'Cash', 'Mon Nov 05 2018', 13573.20, 2);
    expectEvals(evals, 56, 'Cash', 'Sat Dec 01 2018', 13573.20, 2);
    expectEvals(evals, 57, 'NSI', 'Sun Dec 02 2018', 1036606.42, 2);
    expectEvals(evals, 58, 'NSIinterest', 'Sun Dec 02 2018', 1286.84, 2);
    expectEvals(evals, 59, 'Cash', 'Sun Dec 02 2018', 14860.05, 2);
    expectEvals(evals, 60, 'Cash', 'Wed Dec 05 2018', 14835.56, 2);
    expectEvals(evals, 61, 'Cash', 'Tue Jan 01 2019', 14835.56, 2);
    expectEvals(evals, 62, 'NSI', 'Wed Jan 02 2019', 1040000.00, 2);
    expectEvals(evals, 63, 'NSIinterest', 'Wed Jan 02 2019', 1291.06, 2);
    expectEvals(evals, 64, 'Cash', 'Wed Jan 02 2019', 16126.61, 2);
    expectEvals(evals, 65, 'Cash', 'Sat Jan 05 2019', 16103.38, 2);
    expectEvals(evals, 66, 'Cash', 'Fri Feb 01 2019', 16103.38, 2);
    expectEvals(evals, 67, 'NSI', 'Sat Feb 02 2019', 1043404.69, 2);
    expectEvals(evals, 68, 'NSIinterest', 'Sat Feb 02 2019', 1295.28, 2);
    expectEvals(evals, 69, 'Cash', 'Sat Feb 02 2019', 17398.66, 2);
    expectEvals(evals, 70, 'Cash', 'Tue Feb 05 2019', 17376.68, 2);
    expectEvals(evals, 71, 'Cash', 'Fri Mar 01 2019', 17376.68, 2);
    expectEvals(evals, 72, 'NSI', 'Sat Mar 02 2019', 1046820.52, 2);
    expectEvals(evals, 73, 'NSIinterest', 'Sat Mar 02 2019', 1299.52, 2);
    expectEvals(evals, 74, 'Cash', 'Sat Mar 02 2019', 18676.20, 2);
    expectEvals(evals, 75, 'Cash', 'Tue Mar 05 2019', 18655.47, 2);
    expectEvals(evals, 76, 'Cash', 'Mon Apr 01 2019', 18655.47, 2);
    expectEvals(evals, 77, 'NSI', 'Tue Apr 02 2019', 1050247.54, 2);
    expectEvals(evals, 78, 'NSIinterest', 'Tue Apr 02 2019', 1303.78, 2);
    expectEvals(evals, 79, 'Cash', 'Tue Apr 02 2019', 19959.25, 2);
    expectEvals(evals, 80, 'Cash', 'Fri Apr 05 2019', 19939.74, 2);
    expectEvals(evals, 81, '(incomeTax)', 'Fri Apr 05 2019', 573.52, 2);
    expectEvals(evals, 82, 'Joe income (net)', 'Fri Apr 05 2019', 14794.06, 2);
    expectEvals(evals, 83, 'Cash', 'Wed May 01 2019', 19939.74, 2);

    const viewSettings = getMinimalModelCopySettings();
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('NSIinterest');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(18);
    expectChartData(chartPts, 0, 'Fri Dec 01 2017', 0, -1);
    expectChartData(chartPts, 1, 'Mon Jan 01 2018', 0, -1);
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1241.40, 2);
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
    expectChartData(chartPts, 2, 'Thu Feb 01 2018', 1203.51, 2);
    expectChartData(chartPts, 3, 'Thu Mar 01 2018', 2412.27, 2);
    expectChartData(chartPts, 4, 'Sun Apr 01 2018', 3626.29, 2);
    expectChartData(chartPts, 5, 'Tue May 01 2018', 4887.98, 2);
    expectChartData(chartPts, 6, 'Fri Jun 01 2018', 6112.66, 2);
    expectChartData(chartPts, 7, 'Sun Jul 01 2018', 7342.66, 2);
    expectChartData(chartPts, 8, 'Wed Aug 01 2018', 8578.00, 2);
    expectChartData(chartPts, 9, 'Sat Sep 01 2018', 9818.71, 2);
    expectChartData(chartPts, 10, 'Mon Oct 01 2018', 11064.79, 2);
    expectChartData(chartPts, 11, 'Thu Nov 01 2018', 12316.29, 2);
    expectChartData(chartPts, 12, 'Sat Dec 01 2018', 13573.20, 2);
    expectChartData(chartPts, 13, 'Tue Jan 01 2019', 14835.56, 2);
    expectChartData(chartPts, 14, 'Fri Feb 01 2019', 16103.38, 2);
    expectChartData(chartPts, 15, 'Fri Mar 01 2019', 17376.68, 2);
    expectChartData(chartPts, 16, 'Mon Apr 01 2019', 18655.47, 2);
    expectChartData(chartPts, 17, 'Wed May 01 2019', 19939.74, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(2);
    expect(result.taxData[0].item.NAME).toBe(getnetincLabel('Joe'));
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
    expectChartData(chartPts, 17, 'Wed May 01 2019', 14794.06, 2);
    }
    
    expect(result.taxData[1].item.NAME).toBe(getICLabel('Joe'));
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
    expectChartData(chartPts, 17, 'Wed May 01 2019', 573.52, 2);
    }

    done();
  });

  it('Defined Benefits Pension evaluations', done => {
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
    expectChartData(chartPts, 11, 'Sun Nov 01 2020', 2541.60, 2);
    expectChartData(chartPts, 12, 'Tue Dec 01 2020', 2545.80, 2);
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2550.00, 2);
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
    expectChartData(chartPts, 4, 'Wed Apr 01 2020', 8504.70, 2);
    expectChartData(chartPts, 5, 'Fri May 01 2020', 10806.06, 2); /////????? was 11683.52
    expectChartData(chartPts, 6, 'Mon Jun 01 2020', 12816.10, 2);
    expectChartData(chartPts, 7, 'Wed Jul 01 2020', 14828.98, 2);
    expectChartData(chartPts, 8, 'Sat Aug 01 2020', 16844.68, 2);
    expectChartData(chartPts, 9, 'Tue Sep 01 2020', 18863.24, 2);
    expectChartData(chartPts, 10, 'Thu Oct 01 2020', 20884.63, 2);
    expectChartData(chartPts, 11, 'Sun Nov 01 2020', 22908.89, 2);
    expectChartData(chartPts, 12, 'Tue Dec 01 2020', 24936.00, 2);
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 26965.97, 2);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 28998.80, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 3594.90, 2);
    }

    done();
  });

  it('Defined Contributions Pension evaluations', done => { // TODO : check
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
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2550.00, 2);
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
    expectChartData(chartPts, 13, 'Fri Jan 01 2021', 2422.50, 2);
    expectChartData(chartPts, 14, 'Mon Feb 01 2021', 4353.12, 2);
    expectChartData(chartPts, 15, 'Mon Mar 01 2021', 6286.45, 2);
    expectChartData(chartPts, 16, 'Thu Apr 01 2021', 8222.48, 2);
    expectChartData(chartPts, 17, 'Sat May 01 2021', 10439.80, 2);
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
    expectChartData(chartPts, 17, 'Sat May 01 2021', 881.90, 2);
    }

    done();
  });

  it('Transferring pensions to others', done => {
    const roi = {
      start: 'Dec 1, 2019',
      end: 'May 02 2031',
    };
    const model: ModelData = getTestModel(pensionExampleData);

    setROI(model, roi);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

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
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 60732.40, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 143749.20, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 233166.06, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 292950.05, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 353219.05, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 413488.05, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 475129.05, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 536000.05, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 596255.05, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 656524.05, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 662596.50, 2);
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
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.80, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.80, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.80, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.80, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12149.80, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12309.80, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.80, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.20, 2);
    }
    
    expect(result.taxData[1].item.NAME).toBe('Jane income (net)');
    {
    const chartPts = result.taxData[1].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.80, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.80, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.80, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.80, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12053.80, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.80, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.80, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 10749.20, 2);
    }
    
    expect(result.taxData[2].item.NAME).toBe('Jeff income (net)');
    {
    const chartPts = result.taxData[2].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.80, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.80, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.80, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.80, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12125.80, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12245.80, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.80, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.20, 2);
    }
    
    expect(result.taxData[3].item.NAME).toBe('Jen income (net)');
    {
    const chartPts = result.taxData[3].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 12103.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 12103.36, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 12053.80, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.80, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.80, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12053.80, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12053.80, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.80, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.80, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 11649.20, 2);
    }
    
    expect(result.taxData[4].item.NAME).toBe('Joe income (net)');
    {
    const chartPts = result.taxData[4].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 4041.12, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 19303.36, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 36456.56, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 31560.20, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 12053.80, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 12053.80, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 12501.80, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 12949.80, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 12053.80, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 12053.80, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 8049.20, 2);
    }
    
    expect(result.taxData[5].item.NAME).toBe('Jake income (NI)');
    {
    const chartPts = result.taxData[5].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.20, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.20, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.20, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.20, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.20, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.20, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.20, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.80, 2);
    }
    
    expect(result.taxData[6].item.NAME).toBe('Jane income (NI)');
    {
    const chartPts = result.taxData[6].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.20, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.20, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.20, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.20, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.20, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.20, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.20, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.80, 2);
    }
    
    expect(result.taxData[7].item.NAME).toBe('Jeff income (NI)');
    {
    const chartPts = result.taxData[7].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.20, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.20, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.20, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.20, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.20, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.20, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.20, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.80, 2);
    }
    
    expect(result.taxData[8].item.NAME).toBe('Jen income (NI)');
    {
    const chartPts = result.taxData[8].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 476.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 476.64, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 526.20, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.20, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.20, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.20, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.20, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.20, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.20, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.80, 2);
    }
    
    expect(result.taxData[9].item.NAME).toBe('Joe income (NI)');
    {
    const chartPts = result.taxData[9].chartDataPoints;
    expect(chartPts.length).toBe(12);
    expectChartData(chartPts, 0, 'Sun Dec 01 2019', 0, -1);
    expectChartData(chartPts, 1, 'Tue Dec 01 2020', 158.88, 2);
    expectChartData(chartPts, 2, 'Wed Dec 01 2021', 1916.64, 2);
    expectChartData(chartPts, 3, 'Thu Dec 01 2022', 4923.44, 2);
    expectChartData(chartPts, 4, 'Fri Dec 01 2023', 4059.80, 2);
    expectChartData(chartPts, 5, 'Sun Dec 01 2024', 526.20, 2);
    expectChartData(chartPts, 6, 'Mon Dec 01 2025', 526.20, 2);
    expectChartData(chartPts, 7, 'Tue Dec 01 2026', 526.20, 2);
    expectChartData(chartPts, 8, 'Wed Dec 01 2027', 526.20, 2);
    expectChartData(chartPts, 9, 'Fri Dec 01 2028', 526.20, 2);
    expectChartData(chartPts, 10, 'Sat Dec 01 2029', 526.20, 2);
    expectChartData(chartPts, 11, 'Sun Dec 01 2030', 350.80, 2);
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
  // CGT on selling some cars ???
});
