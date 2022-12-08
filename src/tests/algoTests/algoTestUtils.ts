import {
  CASH_ASSET_NAME,
  pensionDB,
  pension,
  taxFree,
  crystallizedPension,
  pensionTransfer,
  revalue,
  conditional,
  pensionSS,
  moveTaxFreePart,
  transferCrystallizedPension,
  custom,
  birthDate,
  viewType,
  viewFrequency,
  monthly,
  chartViewType,
  chartVals,
  viewDetail,
  fineDetail,
  assetChartFocus,
  debtChartFocus,
  allItems,
  expenseChartFocus,
  incomeChartFocus,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  valueFocusDate,
  cpi,
  cpiHint,
  birthDateHint,
  valueFocusDateHint,
} from '../../localization/stringConstants';
import { ViewSettings } from '../../models/charting';
import { getEvaluations } from '../../models/evaluations';
import {
  minimalModel,
  emptyModel,
  simpleExpense,
  defaultModelSettings,
  simpleAsset,
  viewSetting,
  simpleSetting,
} from '../../models/exampleModels';
import {
  attemptRenameLong,
  revertToUndoModel,
  makeModelFromJSONString,
  setSetting,
} from '../../models/modelUtils';
import {
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetIncomeTag,
  makeNetGainTag,
  hasDependentDate,
  dateAsString,
} from '../../utils/stringUtils';
import {
  Evaluation,
  ChartDataPoint,
  DataForView,
  ModelData,
  AssetOrDebtVal,
  IncomeVal,
  ExpenseVal,
  SettingVal,
  Setting,
  Expense,
  Income,
  Asset,
} from '../../types/interfaces';
import { log } from '../../utils/utils';
import { diffModels } from '../../models/diffModels';

export function expectEvals(
  evals: Evaluation[],
  i: number,
  name: string,
  dateString: string,
  value: number,
  numDigits: number,
) {
  expect(evals[i].name).toBe(name);
  expect(dateAsString(evals[i].date)).toBe(dateString);
  if (numDigits < 0) {
    expect(evals[i].value).toBe(value);
  } else {
    expect(evals[i].value).toBeCloseTo(value, numDigits);
  }
}

export function printTestCodeForEvals(evals: Evaluation[]) {
  let result = '';
  result += `expect(evals.length).toBe(${evals.length});\n`;
  for (let i = 0; i < evals.length; i += 1) {
    // log(`evals[${i}] is ${showObj(evals[i])}`);
    result +=
      `expectEvals(evals, ${i}, ` +
      `'${evals[i].name}', '${dateAsString(evals[i].date)}', `;
    if (evals[i].value.toFixed(0) === `${evals[i].value}`) {
      result += `${evals[i].value}, -1);\n`;
    } else {
      result += `${evals[i].value.toFixed(2)}, 2);\n`;
    }
  }
  log(result);
}

export function expectChartData(
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

export function printTestCodeForChart(result: DataForView) {
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

export function getTestEvaluations(
  model: ModelData,
  renamingChecks = true,
  diffChecks = false,
  frequency = monthly,
): {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
} {
  const emptyResult = {
    evaluations: [],
    todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
    todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
    todaysIncomeValues: new Map<Income, IncomeVal>(),
    todaysExpenseValues: new Map<Expense, ExpenseVal>(),
    todaysSettingValues: new Map<Setting, SettingVal>(),
  };

  if (renamingChecks) {
    // only rename if new model makes sense
    const doChecks = true;
    let oldModelCopy: ModelData | undefined = undefined;
    if (diffChecks) {
      // log(`model = ${JSON.stringify(model)}`);
      oldModelCopy = JSON.parse(JSON.stringify(model));
      // log(`oldModelCopy = ${JSON.stringify(oldModelCopy)}`);
      const diffResult = diffModels(
        model,
        oldModelCopy,
        false,
        'model',
        'oldModelCopy',
      );
      /* istanbul ignore if */
      if (diffResult.length !== 0) {
        log(`Error: expect copy to match original, got ${diffResult}`);
        return emptyResult;
      } else {
        // log(`Good: copy matches original`);
      }
    }

    // hijack to try some renaming
    model.triggers.forEach((obj) => {
      // dont rename a trigger if there's a dependence
      if (hasDependentDate(obj, model)) {
        // dont attempt rename of a trigger if there's
        // dependent date
        // e.g. "start+1y"
        // log(`don't rename trigger ${obj.NAME}`);
        return;
      }
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, doChecks, oldName, 'abcd');
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, 'abcd', oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.assets.forEach((obj) => {
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

      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.incomes.forEach((obj) => {
      const oldName = obj.NAME;
      let newName = 'abcd';
      if (oldName.startsWith(pensionDB)) {
        newName = pensionDB + newName;
      } else if (oldName.startsWith(pensionTransfer)) {
        newName = pensionTransfer + newName;
      }
      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.expenses.forEach((obj) => {
      const oldName = obj.NAME;
      let message = attemptRenameLong(model, doChecks, oldName, 'abcd');
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, 'abcd', oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.transactions.forEach((obj) => {
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
      } else if (oldName.endsWith('5y')) {
        newName = newName + '5y';
      } else if (oldName.endsWith('4y')) {
        newName = newName + '4y';
      } else if (oldName.endsWith('3y')) {
        newName = newName + '3y';
      } else if (oldName.endsWith('2y')) {
        newName = newName + '2y';
      } else if (oldName.endsWith('1y')) {
        newName = newName + '1y';
      }
      // log(`transaction oldName ${obj.NAME} -> ${newName}`);

      let message = attemptRenameLong(model, doChecks, oldName, newName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `${newName} in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      message = attemptRenameLong(model, doChecks, newName, oldName);
      if (message.length > 0) {
        throw new Error(`rename failed with message '${message}'`);
      }
      revertToUndoModel(model);
      revertToUndoModel(model);
    });
    model.settings.forEach((obj) => {
      if (
        minimalModel.settings.find((s) => {
          return s.NAME === obj.NAME;
        }) !== undefined
      ) {
        return;
      }
      const oldName = obj.NAME;
      const newName = 'abcd';
      let message = attemptRenameLong(model, doChecks, oldName, newName);
      let renamedToNew = true;
      if (message.length > 0) {
        if (message === 'Must maintain special formatting using BMV') {
          renamedToNew = false;
        } else {
          throw new Error(`rename failed with message '${message}'`);
        }
      }
      if (diffChecks) {
        const diffResult = diffModels(
          model,
          oldModelCopy,
          false,
          'model',
          'oldModelCopy',
        );
        // log(`After renaming '${oldName}' to 'abcd': diffResult = ${diffResult}`);
        const diff1 = diffResult.find((s) => {
          return s === `abcd in model but not in oldModelCopy`;
        });
        const diff2 = diffResult.find((s) => {
          return s === `${oldName} is in oldModelCopy but not matched in model`;
        });
        /* istanbul ignore if */
        if (
          diffResult.length < 2 ||
          diff1 === undefined ||
          diff2 === undefined
        ) {
          log(`Error: diffResult = ${diffResult}`);
          return emptyResult;
        } else {
          // log(`Good: copy matches original`);
        }
      }
      if (renamedToNew) {
        message = attemptRenameLong(model, doChecks, newName, oldName);
        if (message.length > 0) {
          throw new Error(`rename failed with message '${message}'`);
        }
        revertToUndoModel(model);
        revertToUndoModel(model);
      }
    });
  }

  let evalnsAndVals;
  if (!renamingChecks) {
    evalnsAndVals = getEvaluations(
      model,
      undefined, // no key for a values report
    );
  } else {
    const copyModel = makeModelFromJSONString(JSON.stringify(model));
    const reporter = () =>
      //name: string, // name of thing which has a value
      //val: number | string, // value of the thing
      //date: Date,
      //source: string,
      {
        return true;
      };
    evalnsAndVals = getEvaluations(copyModel, {
      frequency: frequency,
      reporter: reporter,
      maxReportSize: 100,
    });
  }
  return evalnsAndVals;
}
export function getICLabel(person: string) {
  return makeIncomeTaxTag(person);
}
export function getNILabel(person: string) {
  return makeNationalInsuranceTag(person);
}
export function getCGTLabel(person: string) {
  return makeCGTTag(person);
}
export function getnetincLabel(person: string) {
  return makeNetIncomeTag(person);
}
export function getnetgainLabel(person: string) {
  return makeNetGainTag(person);
}

export function getModelFutureExpense2() {
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
      },
    ],
    settings: [...defaultModelSettings(roi)],
  };
  return { roi, model };
}

export function getModelCrystallizedPension() {
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
        FAVOURITE: undefined,
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
        FAVOURITE: undefined,
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

export function getModelTwoCrystallizedPensions() {
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

export function getMinimalModelCopySettings(): ViewSettings {
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
      VALUE: fineDetail,
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

export function defaultTestViewSettings(): ViewSettings {
  const result = new ViewSettings([
    { ...viewSetting, NAME: viewFrequency, VALUE: monthly },
    { ...viewSetting, NAME: viewDetail, VALUE: fineDetail },
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
