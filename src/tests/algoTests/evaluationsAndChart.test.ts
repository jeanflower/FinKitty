// to allow final-scoping blocks for auto-generated code
/* eslint-disable no-lone-blocks */

import { makeChartDataFromEvaluations } from '../../charting';
import { getEvaluations } from '../../evaluations';
import {
  allItems,
  annually,
  assetChartAdditions,
  assetChartDeltas,
  assetChartHint,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cgt,
  coarse,
  cpi,
  cpiHint,
  crystallizedPension,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  incomeTax,
  monthly,
  nationalInsurance,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  separator,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
} from '../../stringConstants';
import {
  ChartDataPoint,
  DataForView,
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
} from '../../types/interfaces';
import { Evaluation } from '../../types/interfaces';
import {
  log,
  printDebug,
  setSetting,
  suppressLogs,
  unSuppressLogs,
  // showObj,
} from '../../utils';

/* global it */
/* global expect */
/* global describe */

const simpleAsset: DbAsset = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  VALUE: '0',
  GROWTH: '0',
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};
const simpleExpense: DbExpense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
};
const simpleIncome: DbIncome = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
  LIABILITY: '',
};
const simpleModel: DbModelData = {
  triggers: [],
  incomes: [],
  expenses: [],
  transactions: [],
  assets: [],
  settings: [],
};
const simpleSetting: DbSetting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
};
const defaultSettings: DbSetting[] = [
  { ...simpleSetting, NAME: viewFrequency, VALUE: monthly },
  { ...simpleSetting, NAME: viewDetail, VALUE: fine },
  { ...simpleSetting, NAME: assetChartView, VALUE: assetChartVal },
  {
    NAME: assetChartFocus,
    VALUE: allItems,
    HINT: assetChartFocusHint,
  },
  {
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: cpi,
    VALUE: '0.0',
    HINT: cpiHint,
  },
  {
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
];
const simpleTransaction: DbTransaction = {
  NAME: 'NoName',
  FROM: '',
  FROM_ABSOLUTE: true,
  FROM_VALUE: '0',
  TO: '',
  TO_ABSOLUTE: true,
  TO_VALUE: '0',
  DATE: '1 Jan 2017',
  STOP_DATE: '', // for regular transactions
  RECURRENCE: '',
  CATEGORY: '',
};

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
    expect(pts[i].y).toBe(val);
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
  log(toPrint);
}

export function getModelFutureExpense() {
  const roi = {
    start: 'Dec 1, 2016 00:00:00',
    end: 'March 1, 2017 00:00:00',
  };
  const model: DbModelData = {
    ...simpleModel,
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
  setSetting(model.settings, roiStart, roi.start);
  setSetting(model.settings, roiEnd, roi.end);

  return { roi, model };
}

export function getModelCoarseAndFine() {
  const roi = {
    start: 'April 1, 2018',
    end: 'July 10, 2018',
  };
  const model: DbModelData = {
    ...simpleModel,
    incomes: [
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn1',
        VALUE: '10',
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'PRn2',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn3',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: 'April 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
      {
        ...simpleAsset,
        NAME: 'stocks',
        START: 'April 1 2018',
        VALUE: '500',
      },
      {
        ...simpleAsset,
        NAME: 'savings',
        START: 'June 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
    ],
    settings: [...defaultSettings],
    expenses: [
      {
        ...simpleExpense,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'Phon',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'February 1 2018',
        END: 'June 2 2018',
        NAME: 'broadband',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'pet food',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
      },
    ],
  };

  setSetting(model.settings, roiStart, roi.start);
  setSetting(model.settings, roiEnd, roi.end);
  setSetting(model.settings, viewDetail, coarse);

  return {
    model,
    roi,
  };
}

export function getModelCrystallizedPension() {
  const roi = {
    start: '1 April 2023',
    end: '1 April 2026',
  };
  const model: DbModelData = {
    ...simpleModel,
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
      {
        NAME: assetChartFocus,
        VALUE: allItems,
        HINT: assetChartFocusHint,
      },
      {
        NAME: roiStart,
        VALUE: roi.start,
        HINT: roiStartHint,
      },
      {
        NAME: roiEnd,
        VALUE: roi.end,
        HINT: roiEndHint,
      },
      {
        NAME: expenseChartFocus,
        VALUE: allItems,
        HINT: expenseChartFocusHint,
      },
      {
        NAME: incomeChartFocus,
        VALUE: allItems,
        HINT: incomeChartFocusHint,
      },
      {
        NAME: assetChartView,
        VALUE: assetChartVal,
        HINT: assetChartHint,
      },
      {
        NAME: viewDetail,
        VALUE: fine,
        HINT: viewDetailHint,
      },
      {
        NAME: cpi,
        VALUE: '0',
        HINT: cpiHint,
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
      },
    ],
  };
  setSetting(model.settings, viewFrequency, annually);
  setSetting(model.settings, birthDate, '');
  return {
    model,
    roi,
  };
}

describe('evaluations tests', () => {
  it('should ignore future expenses A', async done => {
    const modelAndRoi = getModelFutureExpense();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    const evals: Evaluation[] = getEvaluations(model);

    expect(evals.length).toBe(0);
    // log(showObj(evals));

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    expect(evals.length).toBe(0);
    // log(showObj(evals));

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    setSetting(model.settings, viewFrequency, annually);

    const evals: Evaluation[] = getEvaluations(model);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    setSetting(model.settings, viewFrequency, annually);

    const evals: Evaluation[] = getEvaluations(model);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that the next occurrence of the expense one month later has increased a bit.
    // 12% in a year is _approximately_ 1% per month and this is approximately 0.12 increase.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, cpi, '12.0');

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // notice that next month's increase includes an increment for both growth and CPI
    // 12% in a year is _approximately_ 1% per month.
    // TODO : why is this not double the increase we saw in the growth test?
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.34, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it("shouldn't see effect of cpi for cpi-immune expense", done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, cpi, '5.0');
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Even though the value was set for 2017, the value persists into these 2018
    // dates because the expense is cpi-immune.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.12, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('should grow even if CPI_IMMUNE', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, cpi, '5.0');
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      triggers: [
        {
          NAME: 'valueSetTrigger',
          DATE: new Date('January 1 2017'),
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // The value of this expense was set using a trigger, which evaluated to 2017.
    // See here that the values in 2018 are appropriately increased from its initial value.
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 13.57, 2);
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 13.7, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'July 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);
    // Note growth has been applied once.
    expectEvals(evals, 1, 'Phon', 'Thu Feb 01 2018', 12.24, 2);
    // Note growth has been applied a second time.
    expectEvals(evals, 2, 'Phon', 'Thu Mar 01 2018', 12.35, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
          CPI_IMMUNE: false,
          LIABILITY: '',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Note growth has been applied to show an increase in income.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    setSetting(model.settings, viewFrequency, annually);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 2, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);
    expectEvals(evals, 3, 'PRnd', 'Sun Apr 01 2018', 5.14, 2);
    expectEvals(evals, 4, 'PRnd', 'Tue May 01 2018', 5.19, 2);
    expectEvals(evals, 5, 'PRnd', 'Fri Jun 01 2018', 5.24, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Note growth has already been applied.
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    // Note growth is applied again.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5, -1);
    // Even though income has growth, the next income is the same
    // as it's cpi-immune.
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    expectEvals(evals, 0, 'PRnd', 'Tue Jan 01 2019', 5.6, 2);
    expectEvals(evals, 1, 'PRnd', 'Fri Feb 01 2019', 5.65, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('should apply growth to next two incomes', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    // Income increases by growth.
    expectEvals(evals, 1, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    // Income increases again by growth.
    expectEvals(evals, 2, 'PRnd', 'Thu Mar 01 2018', 5.1, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    // Evaluations are ordered so that Cash goes first.
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'Acash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 2, 'Zcash', 'Mon Jan 01 2018', 500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(3);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    // Goes up for growth
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    // Goes up for growth again
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('annual chart data for assets', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    setSetting(model.settings, assetChartFocus, 'savings');
    setSetting(model.settings, viewFrequency, annually);
    setSetting(model.settings, assetChartView, assetChartDeltas);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

    expect(result.assetData[1].item.NAME).toBe(
      'growth' + separator + 'savings',
    );
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
      ...simpleModel,
      triggers: [
        {
          NAME: 'then',
          DATE: new Date('January 1 2018'),
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(2);
    // Asset started yusing a string trigger which has been converted into a date.
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 2 2018',
          END: 'July 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          CPI_IMMUNE: false,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    // Phon and PRnd both appear in date order.
    expectEvals(evals, 0, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 1, 'Phon', 'Tue Jan 02 2018', 12.12, 2);
    expectEvals(evals, 2, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);
    expectEvals(evals, 3, 'Phon', 'Fri Feb 02 2018', 12.24, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('has transaction impacting asset value', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Thu Mar 01 2018', 400, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 2, 'MyCa', 'Thu Feb 01 2018', 400, -1);
    expectEvals(evals, 3, 'MyCa', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 4, 'MyCa', 'Thu Mar 01 2018', 300, -1);
    expectEvals(evals, 5, 'MyCa', 'Fri Mar 02 2018', 200, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    setSetting(model.settings, viewFrequency, monthly);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(68);
    expectEvals(evals, 0, 'MyCa', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'MyCa', 'Tue Jan 02 2018', 400, -1);
    expectEvals(evals, 25, 'MyCa', 'Wed Jan 01 2020', 400, -1);
    expectEvals(evals, 26, 'MyCa', 'Thu Jan 02 2020', 300, -1);
    expectEvals(evals, 50, 'MyCa', 'Sat Jan 01 2022', 300, -1);
    expectEvals(evals, 51, 'MyCa', 'Sun Jan 02 2022', 200, -1);
    expectEvals(evals, 67, 'MyCa', 'Mon May 01 2023', 200, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'MyCa', 'Tue Jan 02 2018', 10, -1);
    expectEvals(evals, 1, 'Stff', 'Tue Jan 02 2018', 222, -1);
    expectEvals(evals, 2, 'Stff', 'Tue Jan 02 2018', 111, -1);
    expectEvals(evals, 3, 'MyCa', 'Tue Jan 02 2018', 121, -1);
    expectEvals(evals, 4, 'MyCa', 'Fri Feb 02 2018', 122.15, 2);
    expectEvals(evals, 5, 'Stff', 'Fri Feb 02 2018', 112.05, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'March 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'March 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('conditional transaction from multiple sources', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'October 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 2 2018',
          VALUE: '15',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    setSetting(model.settings, assetChartFocus, CASH_ASSET_NAME);
    setSetting(model.settings, assetChartView, assetChartDeltas);

    const x = model.settings.find(s => {
      return s.NAME === assetChartFocus;
    });
    if (x !== undefined) {
      x.VALUE = CASH_ASSET_NAME;
    }

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
          FROM_ABSOLUTE: true,
          FROM_VALUE: '100',
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: 'February 2 2018',
          RECURRENCE: '1m',
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
          START: 'January 2 2018',
          VALUE: '5',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

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
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'July 1 2018',
          NAME: 'PRnd',
          VALUE: '5',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12',
          LIABILITY: incomeTax + 'Joe',
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'sthg', 'Sun Dec 31 2017', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 2, 'sthg', 'Wed Jan 31 2018', 504.74, 2);
    expectEvals(evals, 3, 'PRnd', 'Thu Feb 01 2018', 5.05, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    done();
  });

  it('two expenses impact cash', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Mon Jan 01 2018', 5, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 505, -1);
    expectEvals(evals, 3, 'java', 'Wed Jan 10 2018', 500, -1);
    expectEvals(evals, 4, 'Cash', 'Wed Jan 10 2018', 1005, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1005, -1);
    expectEvals(evals, 6, 'java', 'Sat Feb 10 2018', 500, -1);
    expectEvals(evals, 7, 'Cash', 'Sat Feb 10 2018', 1505, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1505, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 4, 'PRnd', 'Sun Apr 01 2018', 5, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 13010, -1);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 13009, -1);
    expectEvals(evals, 7, 'TaxPot', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 8, 'java', 'Tue Apr 10 2018', 12505, -1);
    expectEvals(evals, 9, 'Cash', 'Tue Apr 10 2018', 25514, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 25514, -1);
    expectEvals(evals, 11, 'Cash', 'Fri Apr 05 2019', 25513, -1);
    expectEvals(evals, 12, 'TaxPot', 'Fri Apr 05 2019', 2, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(2);
    expect(result.incomesData[0].item.NAME).toBe('PRnd');
    {
      const chartPts = result.incomesData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expect(chartPts[0].label).toBe('Thu Mar 01 2018');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Sun Apr 01 2018');
      expect(chartPts[1].y).toBe(5);
      expect(chartPts[2].label).toBe('Tue May 01 2018');
      expect(chartPts[2].y).toBe(0);
    }

    expect(result.incomesData[1].item.NAME).toBe('java');
    {
      const chartPts = result.incomesData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expect(chartPts[0].label).toBe('Thu Mar 01 2018');
      expect(chartPts[0].y).toBe(0);
      expect(chartPts[1].label).toBe('Sun Apr 01 2018');
      expect(chartPts[1].y).toBe(12505);
      expect(chartPts[2].label).toBe('Tue May 01 2018');
      expect(chartPts[2].y).toBe(12505);
    }

    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expect(chartPts[0].label).toBe('Thu Mar 01 2018');
      expect(chartPts[0].y).toBe(500);
      expect(chartPts[1].label).toBe('Sun Apr 01 2018');
      expect(chartPts[1].y).toBe(13010);
      expect(chartPts[2].label).toBe('Tue May 01 2018');
      expect(chartPts[2].y).toBe(25514);
    }
    done();
  });

  it('payLowTax on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 13004, -1);
    expectEvals(evals, 4, 'TaxPot', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 5, 'Cash', 'Tue May 01 2018', 13004, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(4);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 3, 'Cash', 'Tue May 01 2018', 13005, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '50100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 50100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 4, 'TaxPot', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 5, 'Cash', 'Tue May 01 2018', 43060, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('payTopTax on single income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRnd',
          VALUE: '150100',
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 150100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Apr 05 2018', 103055, -1);
    expectEvals(evals, 4, 'TaxPot', 'Thu Apr 05 2018', 47545.0, 2);
    expectEvals(evals, 5, 'Cash', 'Tue May 01 2018', 103055, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expect(chartPts[1].y).toBe(103055);
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
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2021',
          NAME: 'PRnd',
          VALUE: '1042.5', // will be taxable in 1st year but after tax bands adjust, won't be
          VALUE_SET: 'January 1 2018',
          CPI_IMMUNE: true, // fix the income and it becomes not-taxable as cpi is non zero
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
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
    setSetting(model.settings, cpi, `${smallCPI}`);

    const evals: Evaluation[] = getEvaluations(model);

    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(113);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRnd', 'Sun Apr 01 2018', 1042.5, 2);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 1542.5, 2);
    expectEvals(evals, 3, 'Cash', 'Tue May 01 2018', 1542.56, 2);
    expectEvals(evals, 4, 'PRnd', 'Tue May 01 2018', 1042.5, 2);
    expectEvals(evals, 5, 'Cash', 'Tue May 01 2018', 2585.06, 2);
    expectEvals(evals, 6, 'Cash', 'Fri Jun 01 2018', 2585.17, 2);
    expectEvals(evals, 7, 'PRnd', 'Fri Jun 01 2018', 1042.5, 2);
    expectEvals(evals, 8, 'Cash', 'Fri Jun 01 2018', 3627.67, 2);
    expectEvals(evals, 9, 'Cash', 'Sun Jul 01 2018', 3627.82, 2);
    expectEvals(evals, 10, 'PRnd', 'Sun Jul 01 2018', 1042.5, 2);
    expectEvals(evals, 11, 'Cash', 'Sun Jul 01 2018', 4670.32, 2);
    expectEvals(evals, 12, 'Cash', 'Wed Aug 01 2018', 4670.52, 2);
    expectEvals(evals, 13, 'PRnd', 'Wed Aug 01 2018', 1042.5, 2);
    expectEvals(evals, 14, 'Cash', 'Wed Aug 01 2018', 5713.02, 2);
    expectEvals(evals, 15, 'Cash', 'Sat Sep 01 2018', 5713.26, 2);
    expectEvals(evals, 16, 'PRnd', 'Sat Sep 01 2018', 1042.5, 2);
    expectEvals(evals, 17, 'Cash', 'Sat Sep 01 2018', 6755.76, 2);
    expectEvals(evals, 18, 'Cash', 'Mon Oct 01 2018', 6756.04, 2);
    expectEvals(evals, 19, 'PRnd', 'Mon Oct 01 2018', 1042.5, 2);
    expectEvals(evals, 20, 'Cash', 'Mon Oct 01 2018', 7798.54, 2);
    expectEvals(evals, 21, 'Cash', 'Thu Nov 01 2018', 7798.86, 2);
    expectEvals(evals, 22, 'PRnd', 'Thu Nov 01 2018', 1042.5, 2);
    expectEvals(evals, 23, 'Cash', 'Thu Nov 01 2018', 8841.36, 2);
    expectEvals(evals, 24, 'Cash', 'Sat Dec 01 2018', 8841.73, 2);
    expectEvals(evals, 25, 'PRnd', 'Sat Dec 01 2018', 1042.5, 2);
    expectEvals(evals, 26, 'Cash', 'Sat Dec 01 2018', 9884.23, 2);
    expectEvals(evals, 27, 'Cash', 'Tue Jan 01 2019', 9884.64, 2);
    expectEvals(evals, 28, 'PRnd', 'Tue Jan 01 2019', 1042.5, 2);
    expectEvals(evals, 29, 'Cash', 'Tue Jan 01 2019', 10927.14, 2);
    expectEvals(evals, 30, 'Cash', 'Fri Feb 01 2019', 10927.6, 2);
    expectEvals(evals, 31, 'PRnd', 'Fri Feb 01 2019', 1042.5, 2);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 11970.1, 2);
    expectEvals(evals, 33, 'Cash', 'Fri Mar 01 2019', 11970.6, 2);
    expectEvals(evals, 34, 'PRnd', 'Fri Mar 01 2019', 1042.5, 2);
    expectEvals(evals, 35, 'Cash', 'Fri Mar 01 2019', 13013.1, 2);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 13013.64, 2);
    expectEvals(evals, 37, 'PRnd', 'Mon Apr 01 2019', 1042.5, 2);
    expectEvals(evals, 38, 'Cash', 'Mon Apr 01 2019', 14056.14, 2);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 05 2019', 14055.39, 2);
    expectEvals(evals, 40, 'TaxPot', 'Fri Apr 05 2019', 0.75, 2);
    expectEvals(evals, 41, 'Cash', 'Wed May 01 2019', 14055.97, 2);
    expectEvals(evals, 42, 'PRnd', 'Wed May 01 2019', 1042.5, 2);
    expectEvals(evals, 43, 'Cash', 'Wed May 01 2019', 15098.47, 2);
    expectEvals(evals, 44, 'Cash', 'Sat Jun 01 2019', 15099.1, 2);
    expectEvals(evals, 45, 'PRnd', 'Sat Jun 01 2019', 1042.5, 2);
    expectEvals(evals, 46, 'Cash', 'Sat Jun 01 2019', 16141.6, 2);
    expectEvals(evals, 47, 'Cash', 'Mon Jul 01 2019', 16142.27, 2);
    expectEvals(evals, 48, 'PRnd', 'Mon Jul 01 2019', 1042.5, 2);
    expectEvals(evals, 49, 'Cash', 'Mon Jul 01 2019', 17184.77, 2);
    expectEvals(evals, 50, 'Cash', 'Thu Aug 01 2019', 17185.49, 2);
    expectEvals(evals, 51, 'PRnd', 'Thu Aug 01 2019', 1042.5, 2);
    expectEvals(evals, 52, 'Cash', 'Thu Aug 01 2019', 18227.99, 2);
    expectEvals(evals, 53, 'Cash', 'Sun Sep 01 2019', 18228.75, 2);
    expectEvals(evals, 54, 'PRnd', 'Sun Sep 01 2019', 1042.5, 2);
    expectEvals(evals, 55, 'Cash', 'Sun Sep 01 2019', 19271.25, 2);
    expectEvals(evals, 56, 'Cash', 'Tue Oct 01 2019', 19272.05, 2);
    expectEvals(evals, 57, 'PRnd', 'Tue Oct 01 2019', 1042.5, 2);
    expectEvals(evals, 58, 'Cash', 'Tue Oct 01 2019', 20314.55, 2);
    expectEvals(evals, 59, 'Cash', 'Fri Nov 01 2019', 20315.4, 2);
    expectEvals(evals, 60, 'PRnd', 'Fri Nov 01 2019', 1042.5, 2);
    expectEvals(evals, 61, 'Cash', 'Fri Nov 01 2019', 21357.9, 2);
    expectEvals(evals, 62, 'Cash', 'Sun Dec 01 2019', 21358.79, 2);
    expectEvals(evals, 63, 'PRnd', 'Sun Dec 01 2019', 1042.5, 2);
    expectEvals(evals, 64, 'Cash', 'Sun Dec 01 2019', 22401.29, 2);
    expectEvals(evals, 65, 'Cash', 'Wed Jan 01 2020', 22402.22, 2);
    expectEvals(evals, 66, 'PRnd', 'Wed Jan 01 2020', 1042.5, 2);
    expectEvals(evals, 67, 'Cash', 'Wed Jan 01 2020', 23444.72, 2);
    expectEvals(evals, 68, 'Cash', 'Sat Feb 01 2020', 23445.7, 2);
    expectEvals(evals, 69, 'PRnd', 'Sat Feb 01 2020', 1042.5, 2);
    expectEvals(evals, 70, 'Cash', 'Sat Feb 01 2020', 24488.2, 2);
    expectEvals(evals, 71, 'Cash', 'Sun Mar 01 2020', 24489.22, 2);
    expectEvals(evals, 72, 'PRnd', 'Sun Mar 01 2020', 1042.5, 2);
    expectEvals(evals, 73, 'Cash', 'Sun Mar 01 2020', 25531.72, 2);
    expectEvals(evals, 74, 'Cash', 'Wed Apr 01 2020', 25532.78, 2);
    expectEvals(evals, 75, 'PRnd', 'Wed Apr 01 2020', 1042.5, 2);
    expectEvals(evals, 76, 'Cash', 'Wed Apr 01 2020', 26575.28, 2);
    expectEvals(evals, 77, 'Cash', 'Fri May 01 2020', 26576.39, 2);
    expectEvals(evals, 78, 'PRnd', 'Fri May 01 2020', 1042.5, 2);
    expectEvals(evals, 79, 'Cash', 'Fri May 01 2020', 27618.89, 2);
    expectEvals(evals, 80, 'Cash', 'Mon Jun 01 2020', 27620.04, 2);
    expectEvals(evals, 81, 'PRnd', 'Mon Jun 01 2020', 1042.5, 2);
    expectEvals(evals, 82, 'Cash', 'Mon Jun 01 2020', 28662.54, 2);
    expectEvals(evals, 83, 'Cash', 'Wed Jul 01 2020', 28663.73, 2);
    expectEvals(evals, 84, 'PRnd', 'Wed Jul 01 2020', 1042.5, 2);
    expectEvals(evals, 85, 'Cash', 'Wed Jul 01 2020', 29706.23, 2);
    expectEvals(evals, 86, 'Cash', 'Sat Aug 01 2020', 29707.47, 2);
    expectEvals(evals, 87, 'PRnd', 'Sat Aug 01 2020', 1042.5, 2);
    expectEvals(evals, 88, 'Cash', 'Sat Aug 01 2020', 30749.97, 2);
    expectEvals(evals, 89, 'Cash', 'Tue Sep 01 2020', 30751.25, 2);
    expectEvals(evals, 90, 'PRnd', 'Tue Sep 01 2020', 1042.5, 2);
    expectEvals(evals, 91, 'Cash', 'Tue Sep 01 2020', 31793.75, 2);
    expectEvals(evals, 92, 'Cash', 'Thu Oct 01 2020', 31795.08, 2);
    expectEvals(evals, 93, 'PRnd', 'Thu Oct 01 2020', 1042.5, 2);
    expectEvals(evals, 94, 'Cash', 'Thu Oct 01 2020', 32837.58, 2);
    expectEvals(evals, 95, 'Cash', 'Sun Nov 01 2020', 32838.94, 2);
    expectEvals(evals, 96, 'PRnd', 'Sun Nov 01 2020', 1042.5, 2);
    expectEvals(evals, 97, 'Cash', 'Sun Nov 01 2020', 33881.44, 2);
    expectEvals(evals, 98, 'Cash', 'Tue Dec 01 2020', 33882.86, 2);
    expectEvals(evals, 99, 'PRnd', 'Tue Dec 01 2020', 1042.5, 2);
    expectEvals(evals, 100, 'Cash', 'Tue Dec 01 2020', 34925.36, 2);
    expectEvals(evals, 101, 'Cash', 'Fri Jan 01 2021', 34926.81, 2);
    expectEvals(evals, 102, 'PRnd', 'Fri Jan 01 2021', 1042.5, 2);
    expectEvals(evals, 103, 'Cash', 'Fri Jan 01 2021', 35969.31, 2);
    expectEvals(evals, 104, 'Cash', 'Mon Feb 01 2021', 35970.81, 2);
    expectEvals(evals, 105, 'PRnd', 'Mon Feb 01 2021', 1042.5, 2);
    expectEvals(evals, 106, 'Cash', 'Mon Feb 01 2021', 37013.31, 2);
    expectEvals(evals, 107, 'Cash', 'Mon Mar 01 2021', 37014.85, 2);
    expectEvals(evals, 108, 'PRnd', 'Mon Mar 01 2021', 1042.5, 2);
    expectEvals(evals, 109, 'Cash', 'Mon Mar 01 2021', 38057.35, 2);
    expectEvals(evals, 110, 'Cash', 'Thu Apr 01 2021', 38058.94, 2);
    expectEvals(evals, 111, 'PRnd', 'Thu Apr 01 2021', 1042.5, 2);
    expectEvals(evals, 112, 'Cash', 'Thu Apr 01 2021', 39101.44, 2);
    done();
  });

  it('payLowTax on combined income payment', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '6505',
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '6000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 6505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 7005, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 6000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 13005, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 13004, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 13004, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '25100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '25000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe', // same as PRn1
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 25100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 25600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 25000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 43060, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '75100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '75000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 75100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 75600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 75000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 103055, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 47545.0, 2);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 103055, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expect(chartPts[1].y).toBe(103055);
    }
    done();
  });

  it('payLowTax on separate income payments', done => {
    const roi = {
      start: 'April 1, 2018 00:00:00',
      end: 'May 10, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '12505', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Jane',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '1000',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(10);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 13505, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 12505, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 26010, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 26009, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 1, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26008, -1);
    expectEvals(evals, 8, 'TaxPot', 'Thu Apr 05 2018', 2, -1);
    expectEvals(evals, 9, 'Cash', 'Tue May 01 2018', 26008, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '25100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '25000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe', // same as PRn1
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 25100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 25600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 25000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 43060, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 7540.0, 2);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 43060, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn1',
          VALUE: '75100', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleIncome,
          START: 'April 1 2018',
          END: 'April 2 2018',
          NAME: 'PRn2',
          VALUE: '75000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY: incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'April 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Sun Apr 01 2018', 500, -1);
    expectEvals(evals, 1, 'PRn1', 'Sun Apr 01 2018', 75100, -1);
    expectEvals(evals, 2, 'Cash', 'Sun Apr 01 2018', 75600, -1);
    expectEvals(evals, 3, 'PRn2', 'Sun Apr 01 2018', 75000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 150600, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Apr 05 2018', 103055, -1);
    expectEvals(evals, 6, 'TaxPot', 'Thu Apr 05 2018', 47545.0, 2);
    expectEvals(evals, 7, 'Cash', 'Tue May 01 2018', 103055, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expect(chartPts[1].y).toBe(103055);
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
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'May 9 2018',
          NAME: 'java',
          VALUE: '8628', // 8628 is free of NI liability
          VALUE_SET: 'January 1 2018',
          LIABILITY: nationalInsurance + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 8628, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 9128, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 9128, -1);
    expectEvals(evals, 4, 'java', 'Tue Apr 10 2018', 8628, -1);
    expectEvals(evals, 5, 'Cash', 'Tue Apr 10 2018', 17756, -1);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 17756, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

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
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '8728', // 8628 is free of NI liability, expect 12 to be paid
          VALUE_SET: 'January 1 2018',
          LIABILITY: nationalInsurance + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 8728, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 9228, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 9228, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 9216, -1);
    expectEvals(evals, 5, 'TaxPot', 'Thu Apr 05 2018', 12.0, 2);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 9216, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    done();
  });

  // NI payable at high rate
  it('pay high rate NI income', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '50104', // 50004 is bottom of high rate band, expect 2 + 4965.12 to be paid
          VALUE_SET: 'January 1 2018',
          LIABILITY: nationalInsurance + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(7);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 50104, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 50604, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 50604, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 45636.88, 2);
    expectEvals(evals, 5, 'TaxPot', 'Thu Apr 05 2018', 4967.12, 2);
    expectEvals(evals, 6, 'Cash', 'Tue May 01 2018', 45636.88, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
      incomes: [
        {
          ...simpleIncome,
          START: 'March 10 2018',
          END: 'April 9 2018',
          NAME: 'java',
          VALUE: '30000', // single payment
          VALUE_SET: 'January 1 2018',
          LIABILITY:
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(9);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 500, -1);
    expectEvals(evals, 1, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Mar 10 2018', 30500, -1);
    expectEvals(evals, 3, 'Cash', 'Sun Apr 01 2018', 30500, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Apr 05 2018', 27935.36, 2);
    expectEvals(evals, 5, 'TaxPot', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 24435.36, 2);
    expectEvals(evals, 7, 'TaxPot', 'Thu Apr 05 2018', 6064.64, 2);
    expectEvals(evals, 8, 'Cash', 'Tue May 01 2018', 24435.36, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 24435.36, 2);
    }
    done();
  });

  it('has monthly transaction creating cash debt', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2019 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 1 2018',
          VALUE: '500',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('pay pension contributions simplest', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: new Date('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: new Date('April 9 2018'),
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
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'PensionContribution', // kicks in when we see income tagged '+incomeTax+'Joe
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'Pnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Pnsh', 'Sat Mar 10 2018', 1500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'Pnsh', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 8, 'TaxPot', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 10, 'TaxPot', 'Thu Apr 05 2018', 5764.64, 2);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 12, 'Pnsh', 'Tue May 01 2018', 1500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 1500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 1500, -1);
    }
    done();
  });

  it('pay pension contributions with employer contribution', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: new Date('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: new Date('April 9 2018'),
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
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'PensionContribution', // kicks in when we see income tagged '+incomeTax+'Joe
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'Pnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Pnsh', 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'Pnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 8, 'TaxPot', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 10, 'TaxPot', 'Thu Apr 05 2018', 5764.64, 2);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 12, 'Pnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    done();
  });

  it('pay monthly pension contributions with employer contribution', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: new Date('April 7 2017'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: new Date('April 4 2018'),
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
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'PensionContribution', // kicks in when we see income tagged '+incomeTax+'Joe
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2017',
        },
        {
          ...simpleAsset,
          NAME: 'Pnsh',
          START: 'March 1 2017',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(70);
    expectEvals(evals, 0, 'Cash', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 1, 'Pnsh', 'Wed Mar 01 2017', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 3, 'Pnsh', 'Sat Apr 01 2017', 0, -1);
    expectEvals(evals, 4, 'java', 'Fri Apr 07 2017', 2500, -1);
    expectEvals(evals, 5, 'Pnsh', 'Fri Apr 07 2017', 375, -1);
    expectEvals(evals, 6, 'Cash', 'Fri Apr 07 2017', 2375, -1);
    expectEvals(evals, 7, 'Cash', 'Mon May 01 2017', 2375, -1);
    expectEvals(evals, 8, 'Pnsh', 'Mon May 01 2017', 375, -1);
    expectEvals(evals, 9, 'java', 'Sun May 07 2017', 2500, -1);
    expectEvals(evals, 10, 'Pnsh', 'Sun May 07 2017', 750, -1);
    expectEvals(evals, 11, 'Cash', 'Sun May 07 2017', 4750, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Jun 01 2017', 4750, -1);
    expectEvals(evals, 13, 'Pnsh', 'Thu Jun 01 2017', 750, -1);
    expectEvals(evals, 14, 'java', 'Wed Jun 07 2017', 2500, -1);
    expectEvals(evals, 15, 'Pnsh', 'Wed Jun 07 2017', 1125, -1);
    expectEvals(evals, 16, 'Cash', 'Wed Jun 07 2017', 7125, -1);
    expectEvals(evals, 17, 'Cash', 'Sat Jul 01 2017', 7125, -1);
    expectEvals(evals, 18, 'Pnsh', 'Sat Jul 01 2017', 1125, -1);
    expectEvals(evals, 19, 'java', 'Fri Jul 07 2017', 2500, -1);
    expectEvals(evals, 20, 'Pnsh', 'Fri Jul 07 2017', 1500, -1);
    expectEvals(evals, 21, 'Cash', 'Fri Jul 07 2017', 9500, -1);
    expectEvals(evals, 22, 'Cash', 'Tue Aug 01 2017', 9500, -1);
    expectEvals(evals, 23, 'Pnsh', 'Tue Aug 01 2017', 1500, -1);
    expectEvals(evals, 24, 'java', 'Mon Aug 07 2017', 2500, -1);
    expectEvals(evals, 25, 'Pnsh', 'Mon Aug 07 2017', 1875, -1);
    expectEvals(evals, 26, 'Cash', 'Mon Aug 07 2017', 11875, -1);
    expectEvals(evals, 27, 'Cash', 'Fri Sep 01 2017', 11875, -1);
    expectEvals(evals, 28, 'Pnsh', 'Fri Sep 01 2017', 1875, -1);
    expectEvals(evals, 29, 'java', 'Thu Sep 07 2017', 2500, -1);
    expectEvals(evals, 30, 'Pnsh', 'Thu Sep 07 2017', 2250, -1);
    expectEvals(evals, 31, 'Cash', 'Thu Sep 07 2017', 14250, -1);
    expectEvals(evals, 32, 'Cash', 'Sun Oct 01 2017', 14250, -1);
    expectEvals(evals, 33, 'Pnsh', 'Sun Oct 01 2017', 2250, -1);
    expectEvals(evals, 34, 'java', 'Sat Oct 07 2017', 2500, -1);
    expectEvals(evals, 35, 'Pnsh', 'Sat Oct 07 2017', 2625, -1);
    expectEvals(evals, 36, 'Cash', 'Sat Oct 07 2017', 16625, -1);
    expectEvals(evals, 37, 'Cash', 'Wed Nov 01 2017', 16625, -1);
    expectEvals(evals, 38, 'Pnsh', 'Wed Nov 01 2017', 2625, -1);
    expectEvals(evals, 39, 'java', 'Tue Nov 07 2017', 2500, -1);
    expectEvals(evals, 40, 'Pnsh', 'Tue Nov 07 2017', 3000, -1);
    expectEvals(evals, 41, 'Cash', 'Tue Nov 07 2017', 19000, -1);
    expectEvals(evals, 42, 'Cash', 'Fri Dec 01 2017', 19000, -1);
    expectEvals(evals, 43, 'Pnsh', 'Fri Dec 01 2017', 3000, -1);
    expectEvals(evals, 44, 'java', 'Thu Dec 07 2017', 2500, -1);
    expectEvals(evals, 45, 'Pnsh', 'Thu Dec 07 2017', 3375, -1);
    expectEvals(evals, 46, 'Cash', 'Thu Dec 07 2017', 21375, -1);
    expectEvals(evals, 47, 'Cash', 'Mon Jan 01 2018', 21375, -1);
    expectEvals(evals, 48, 'Pnsh', 'Mon Jan 01 2018', 3375, -1);
    expectEvals(evals, 49, 'java', 'Sun Jan 07 2018', 2500, -1);
    expectEvals(evals, 50, 'Pnsh', 'Sun Jan 07 2018', 3750, -1);
    expectEvals(evals, 51, 'Cash', 'Sun Jan 07 2018', 23750, -1);
    expectEvals(evals, 52, 'Cash', 'Thu Feb 01 2018', 23750, -1);
    expectEvals(evals, 53, 'Pnsh', 'Thu Feb 01 2018', 3750, -1);
    expectEvals(evals, 54, 'java', 'Wed Feb 07 2018', 2500, -1);
    expectEvals(evals, 55, 'Pnsh', 'Wed Feb 07 2018', 4125, -1);
    expectEvals(evals, 56, 'Cash', 'Wed Feb 07 2018', 26125, -1);
    expectEvals(evals, 57, 'Cash', 'Thu Mar 01 2018', 26125, -1);
    expectEvals(evals, 58, 'Pnsh', 'Thu Mar 01 2018', 4125, -1);
    expectEvals(evals, 59, 'java', 'Wed Mar 07 2018', 2500, -1);
    expectEvals(evals, 60, 'Pnsh', 'Wed Mar 07 2018', 4500, -1);
    expectEvals(evals, 61, 'Cash', 'Wed Mar 07 2018', 28500, -1);
    expectEvals(evals, 62, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 63, 'Pnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 64, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 65, 'TaxPot', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 66, 'Cash', 'Thu Apr 05 2018', 22735.36, 2);
    expectEvals(evals, 67, 'TaxPot', 'Thu Apr 05 2018', 5764.64, 2);
    expectEvals(evals, 68, 'Cash', 'Tue May 01 2018', 22735.36, 2);
    expectEvals(evals, 69, 'Pnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 26125, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 28500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22735.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Pnsh');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Thu Mar 01 2018', 4125, -1);
      expectChartData(chartPts, 1, 'Sun Apr 01 2018', 4500, -1);
      expectChartData(chartPts, 2, 'Tue May 01 2018', 4500, -1);
    }
    done();
  });

  it('pay pension contributions with salary sacrifice', done => {
    const roi = {
      start: 'March 1, 2018 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: new Date('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: new Date('April 9 2018'),
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
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'PensionSSContribution', // kicks in when we see income tagged '+incomeTax+'Joe
          FROM: 'java', // not an asset but an income!!
          FROM_ABSOLUTE: false,
          FROM_VALUE: '0.05', // percentage of income transferred to pension
          TO: 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '3.0', // all of what is removed from income goes
          DATE: 'javaStartTrigger', // match the income start date
          STOP_DATE: 'javaStopTrigger', // match the income stop date
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(13);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'Pnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Pnsh', 'Sat Mar 10 2018', 4500, -1);
    expectEvals(evals, 4, 'Cash', 'Sat Mar 10 2018', 28500, -1);
    expectEvals(evals, 5, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 6, 'Pnsh', 'Sun Apr 01 2018', 4500, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Apr 05 2018', 26115.36, 2);
    expectEvals(evals, 8, 'TaxPot', 'Thu Apr 05 2018', 2384.64, 2);
    expectEvals(evals, 9, 'Cash', 'Thu Apr 05 2018', 22915.36, 2);
    expectEvals(evals, 10, 'TaxPot', 'Thu Apr 05 2018', 5584.64, 2);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 22915.36, 2);
    expectEvals(evals, 12, 'Pnsh', 'Tue May 01 2018', 4500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22915.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Pnsh');
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
      ...simpleModel,
      triggers: [
        {
          NAME: 'javaStartTrigger',
          DATE: new Date('March 10 2018'),
        },
        {
          NAME: 'javaStopTrigger',
          DATE: new Date('April 9 2018'),
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
            nationalInsurance + 'Joe' + separator + '' + incomeTax + 'Joe',
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'OneOff pension contribution', //
          FROM: 'Cash',
          FROM_VALUE: '1500', // a one-off payment
          TO: 'Pnsh', // name of pension (an asset)
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed from cash goes
          DATE: 'March 20 2018', // match the income start date
        },
        {
          // when you fill in a tax return...
          ...simpleTransaction,
          NAME: 'Reduction in income liability', //
          FROM: incomeTax + 'Joe', // an income - reduce the liability
          FROM_ABSOLUTE: true,
          FROM_VALUE: '1500', // a one-off payment
          DATE: 'March 20 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Pnsh',
          START: 'March 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 1, 'Pnsh', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 2, 'java', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 3, 'Cash', 'Sat Mar 10 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Tue Mar 20 2018', 28500, -1);
    expectEvals(evals, 5, 'Pnsh', 'Tue Mar 20 2018', 1500, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 28500, -1);
    expectEvals(evals, 7, 'Pnsh', 'Sun Apr 01 2018', 1500, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', 25935.36, 2);
    expectEvals(evals, 9, 'TaxPot', 'Thu Apr 05 2018', 2564.64, 2);
    expectEvals(evals, 10, 'Cash', 'Thu Apr 05 2018', 22435.36, 2);
    expectEvals(evals, 11, 'TaxPot', 'Thu Apr 05 2018', 6064.64, 2);
    expectEvals(evals, 12, 'Cash', 'Tue May 01 2018', 22435.36, 2);
    expectEvals(evals, 13, 'Pnsh', 'Tue May 01 2018', 1500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      expectChartData(chartPts, 2, 'Tue May 01 2018', 22435.36, 2);
    }

    expect(result.assetData[1].item.NAME).toBe('Pnsh');
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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(8);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      60000,
      -1,
    );
    // transfer some money
    expectEvals(
      evals,
      2,
      crystallizedPension + 'Joe',
      'Tue Mar 20 2018',
      30000,
      -1,
    );
    expectEvals(evals, 3, 'Cash', 'Tue Mar 20 2018', 30000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 30000, -1);
    expectEvals(
      evals,
      5,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    // pay income tax
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 26500, -1);
    expectEvals(evals, 7, 'TaxPot', 'Thu Apr 05 2018', 3500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      crystallizedPension + 'Joe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    // make a purchase
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      crystallizedPension + 'Joe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    // inject amount from CrystallizedPension because condition is met
    expectEvals(
      evals,
      7,
      crystallizedPension + 'Joe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    // income tax is due and paid out of cash
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, 'TaxPot', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      16,
      crystallizedPension + 'Joe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 17, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      18,
      crystallizedPension + 'Joe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    // next tax year we didn't use allowance any other way so move
    // money from CrystallizedPensionJoe into Cash up to allowance
    expectEvals(evals, 19, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      20,
      crystallizedPension + 'Joe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('pay income tax on conditional proportional crystallized pension', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      crystallizedPension + 'Joe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    // make a purchase
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      crystallizedPension + 'Joe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    // inject amount from CrystallizedPension because condition is met
    expectEvals(
      evals,
      7,
      crystallizedPension + 'Joe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    // income tax is due and paid out of cash
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, 'TaxPot', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      16,
      crystallizedPension + 'Joe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 17, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      18,
      crystallizedPension + 'Joe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    // next tax year we didn't use allowance any other way so move
    // money from CrystallizedPensionJoe into Cash up to allowance
    expectEvals(evals, 19, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      20,
      crystallizedPension + 'Joe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(21);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      3,
      crystallizedPension + 'Joe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    // make a purchase
    expectEvals(evals, 4, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      6,
      crystallizedPension + 'Joe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    // inject amount from CrystallizedPension because condition is met
    expectEvals(
      evals,
      7,
      crystallizedPension + 'Joe',
      'Sat Feb 03 2018',
      30000,
      -1,
    );
    expectEvals(evals, 8, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 9, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      10,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      12,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      30000,
      -1,
    );
    // income tax is due and paid out of cash
    expectEvals(evals, 13, 'Cash', 'Thu Apr 05 2018', -3500, -1);
    expectEvals(evals, 14, 'TaxPot', 'Thu Apr 05 2018', 3500, -1);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', -3500, -1);
    expectEvals(
      evals,
      16,
      crystallizedPension + 'Joe',
      'Tue May 01 2018',
      30000,
      -1,
    );
    expectEvals(evals, 17, 'Cash', 'Fri Jun 01 2018', -3500, -1);
    expectEvals(
      evals,
      18,
      crystallizedPension + 'Joe',
      'Fri Jun 01 2018',
      30000,
      -1,
    );
    // next tax year we didn't use allowance any other way so move
    // money from CrystallizedPensionJoe into Cash up to allowance
    expectEvals(evals, 19, 'Cash', 'Fri Apr 05 2019', 9000, -1);
    expectEvals(
      evals,
      20,
      crystallizedPension + 'Joe',
      'Fri Apr 05 2019',
      17500,
      -1,
    );

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'Conditional get some pension', // if cash needs it
          FROM:
            'Stocks' + separator + '' + crystallizedPension + 'Joe', // name is important
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0', // whatever is needed
          TO: CASH_ASSET_NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'Feb 3 2018',
          STOP_DATE: 'April 3 2018',
          RECURRENCE: '1m',
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(30);
    expectEvals(evals, 0, 'Cash', 'Fri Dec 01 2017', 10, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Fri Dec 01 2017',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'Stocks', 'Fri Dec 01 2017', 50, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 10, -1);
    expectEvals(
      evals,
      4,
      crystallizedPension + 'Joe',
      'Mon Jan 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 5, 'Stocks', 'Mon Jan 01 2018', 50, -1);
    expectEvals(evals, 6, 'Cash', 'Sun Jan 21 2018', -30000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', -30000, -1);
    expectEvals(
      evals,
      8,
      crystallizedPension + 'Joe',
      'Thu Feb 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 9, 'Stocks', 'Thu Feb 01 2018', 50, -1);
    expectEvals(evals, 10, 'Stocks', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Feb 03 2018', -29950, -1);
    expectEvals(
      evals,
      12,
      crystallizedPension + 'Joe',
      'Sat Feb 03 2018',
      30050,
      -1,
    );
    expectEvals(evals, 13, 'Cash', 'Sat Feb 03 2018', 0, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      15,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      30050,
      -1,
    );
    expectEvals(evals, 16, 'Stocks', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(
      evals,
      18,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      30050,
      -1,
    );
    expectEvals(evals, 19, 'Stocks', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Apr 05 2018', -3490, -1);
    expectEvals(evals, 21, 'TaxPot', 'Thu Apr 05 2018', 3490, -1);
    expectEvals(evals, 22, 'Cash', 'Tue May 01 2018', -3490, -1);
    expectEvals(
      evals,
      23,
      crystallizedPension + 'Joe',
      'Tue May 01 2018',
      30050,
      -1,
    );
    expectEvals(evals, 24, 'Stocks', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 25, 'Cash', 'Fri Jun 01 2018', -3490, -1);
    expectEvals(
      evals,
      26,
      crystallizedPension + 'Joe',
      'Fri Jun 01 2018',
      30050,
      -1,
    );
    expectEvals(evals, 27, 'Stocks', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Apr 05 2019', 9010, -1);
    expectEvals(
      evals,
      29,
      crystallizedPension + 'Joe',
      'Fri Apr 05 2019',
      17550,
      -1,
    );

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(50);
    expectEvals(evals, 0, 'Cash', 'Fri Apr 06 2018', 0, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Fri Apr 06 2018',
      60000,
      -1,
    );
    expectEvals(
      evals,
      2,
      crystallizedPension + 'Joe',
      'Sat Apr 07 2018',
      57500,
      -1,
    );
    expectEvals(evals, 3, 'Cash', 'Sat Apr 07 2018', 2500, -1);
    expectEvals(evals, 4, 'Cash', 'Sun May 06 2018', 2500, -1);
    expectEvals(
      evals,
      5,
      crystallizedPension + 'Joe',
      'Sun May 06 2018',
      57500,
      -1,
    );
    expectEvals(
      evals,
      6,
      crystallizedPension + 'Joe',
      'Mon May 07 2018',
      55000,
      -1,
    );
    expectEvals(evals, 7, 'Cash', 'Mon May 07 2018', 5000, -1);
    expectEvals(evals, 8, 'Cash', 'Wed Jun 06 2018', 5000, -1);
    expectEvals(
      evals,
      9,
      crystallizedPension + 'Joe',
      'Wed Jun 06 2018',
      55000,
      -1,
    );
    expectEvals(
      evals,
      10,
      crystallizedPension + 'Joe',
      'Thu Jun 07 2018',
      52500,
      -1,
    );
    expectEvals(evals, 11, 'Cash', 'Thu Jun 07 2018', 7500, -1);
    expectEvals(evals, 12, 'Cash', 'Fri Jul 06 2018', 7500, -1);
    expectEvals(
      evals,
      13,
      crystallizedPension + 'Joe',
      'Fri Jul 06 2018',
      52500,
      -1,
    );
    expectEvals(
      evals,
      14,
      crystallizedPension + 'Joe',
      'Sat Jul 07 2018',
      50000,
      -1,
    );
    expectEvals(evals, 15, 'Cash', 'Sat Jul 07 2018', 10000, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Aug 06 2018', 10000, -1);
    expectEvals(
      evals,
      17,
      crystallizedPension + 'Joe',
      'Mon Aug 06 2018',
      50000,
      -1,
    );
    expectEvals(
      evals,
      18,
      crystallizedPension + 'Joe',
      'Tue Aug 07 2018',
      47500,
      -1,
    );
    expectEvals(evals, 19, 'Cash', 'Tue Aug 07 2018', 12500, -1);
    expectEvals(evals, 20, 'Cash', 'Thu Sep 06 2018', 12500, -1);
    expectEvals(
      evals,
      21,
      crystallizedPension + 'Joe',
      'Thu Sep 06 2018',
      47500,
      -1,
    );
    expectEvals(
      evals,
      22,
      crystallizedPension + 'Joe',
      'Fri Sep 07 2018',
      45000,
      -1,
    );
    expectEvals(evals, 23, 'Cash', 'Fri Sep 07 2018', 15000, -1);
    expectEvals(evals, 24, 'Cash', 'Sat Oct 06 2018', 15000, -1);
    expectEvals(
      evals,
      25,
      crystallizedPension + 'Joe',
      'Sat Oct 06 2018',
      45000,
      -1,
    );
    expectEvals(
      evals,
      26,
      crystallizedPension + 'Joe',
      'Sun Oct 07 2018',
      42500,
      -1,
    );
    expectEvals(evals, 27, 'Cash', 'Sun Oct 07 2018', 17500, -1);
    expectEvals(evals, 28, 'Cash', 'Tue Nov 06 2018', 17500, -1);
    expectEvals(
      evals,
      29,
      crystallizedPension + 'Joe',
      'Tue Nov 06 2018',
      42500,
      -1,
    );
    expectEvals(
      evals,
      30,
      crystallizedPension + 'Joe',
      'Wed Nov 07 2018',
      40000,
      -1,
    );
    expectEvals(evals, 31, 'Cash', 'Wed Nov 07 2018', 20000, -1);
    expectEvals(evals, 32, 'Cash', 'Thu Dec 06 2018', 20000, -1);
    expectEvals(
      evals,
      33,
      crystallizedPension + 'Joe',
      'Thu Dec 06 2018',
      40000,
      -1,
    );
    expectEvals(
      evals,
      34,
      crystallizedPension + 'Joe',
      'Fri Dec 07 2018',
      37500,
      -1,
    );
    expectEvals(evals, 35, 'Cash', 'Fri Dec 07 2018', 22500, -1);
    expectEvals(evals, 36, 'Cash', 'Sun Jan 06 2019', 22500, -1);
    expectEvals(
      evals,
      37,
      crystallizedPension + 'Joe',
      'Sun Jan 06 2019',
      37500,
      -1,
    );
    expectEvals(
      evals,
      38,
      crystallizedPension + 'Joe',
      'Mon Jan 07 2019',
      35000,
      -1,
    );
    expectEvals(evals, 39, 'Cash', 'Mon Jan 07 2019', 25000, -1);
    expectEvals(evals, 40, 'Cash', 'Wed Feb 06 2019', 25000, -1);
    expectEvals(
      evals,
      41,
      crystallizedPension + 'Joe',
      'Wed Feb 06 2019',
      35000,
      -1,
    );
    expectEvals(
      evals,
      42,
      crystallizedPension + 'Joe',
      'Thu Feb 07 2019',
      32500,
      -1,
    );
    expectEvals(evals, 43, 'Cash', 'Thu Feb 07 2019', 27500, -1);
    expectEvals(evals, 44, 'Cash', 'Wed Mar 06 2019', 27500, -1);
    expectEvals(
      evals,
      45,
      crystallizedPension + 'Joe',
      'Wed Mar 06 2019',
      32500,
      -1,
    );
    expectEvals(
      evals,
      46,
      crystallizedPension + 'Joe',
      'Thu Mar 07 2019',
      30000,
      -1,
    );
    expectEvals(evals, 47, 'Cash', 'Thu Mar 07 2019', 30000, -1);
    expectEvals(evals, 48, 'Cash', 'Fri Apr 05 2019', 26500, -1);
    expectEvals(evals, 49, 'TaxPot', 'Fri Apr 05 2019', 3500, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
      ...simpleModel,
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
          LIABILITY: incomeTax + 'Joe', // no liability so doesn't affect allowance
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
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
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(14);
    expectEvals(evals, 0, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(
      evals,
      1,
      crystallizedPension + 'Joe',
      'Thu Mar 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 2, 'PRnd', 'Fri Mar 02 2018', 50000, -1);
    expectEvals(evals, 3, 'Cash', 'Fri Mar 02 2018', 50000, -1);
    expectEvals(evals, 4, 'Cash', 'Sun Apr 01 2018', 50000, -1);
    expectEvals(
      evals,
      5,
      crystallizedPension + 'Joe',
      'Sun Apr 01 2018',
      60000,
      -1,
    );
    expectEvals(evals, 6, 'Cash', 'Thu Apr 05 2018', 62500, -1);
    expectEvals(
      evals,
      7,
      crystallizedPension + 'Joe',
      'Thu Apr 05 2018',
      47500,
      -1,
    );
    expectEvals(evals, 8, 'java', 'Tue Apr 10 2018', 10000, -1);
    expectEvals(evals, 9, 'Cash', 'Tue Apr 10 2018', 72500, -1);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', 72500, -1);
    expectEvals(
      evals,
      11,
      crystallizedPension + 'Joe',
      'Tue May 01 2018',
      47500,
      -1,
    );
    expectEvals(evals, 12, 'Cash', 'Fri Apr 05 2019', 75000, -1);
    expectEvals(
      evals,
      13,
      crystallizedPension + 'Joe',
      'Fri Apr 05 2019',
      45000,
      -1,
    );

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('should apply income tax to some asset growth', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 2, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      transactions: [],
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500000',
          GROWTH: '12',
          LIABILITY: incomeTax + 'Joe',
        },
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: 'January 1 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'savings', 'Mon Jan 01 2018', 500000, -1);
    expectEvals(evals, 2, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 3, 'savings', 'Thu Feb 01 2018', 504744.4, 2);
    expectEvals(evals, 4, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 5, 'savings', 'Thu Mar 01 2018', 509533.81, 2);
    expectEvals(evals, 6, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 7, 'savings', 'Sun Apr 01 2018', 514368.67, 2);
    expectEvals(evals, 8, 'Cash', 'Thu Apr 05 2018', -373.73, 2);
    expectEvals(evals, 9, 'TaxPot', 'Thu Apr 05 2018', 373.73, 2);
    expectEvals(evals, 10, 'Cash', 'Tue May 01 2018', -373.73, 2);
    expectEvals(evals, 11, 'savings', 'Tue May 01 2018', 519249.41, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    done();
  });

  it('dispose of part of an asset liable to CGT', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `${cgt}Joe`,
          PURCHASE_PRICE: '50000',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(16);
    expectEvals(evals, 0, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
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
    expectEvals(evals, 13, 'TaxPot', 'Thu Apr 05 2018', 933.33, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 19066.67, 2);
    expectEvals(evals, 15, 'Shrs', 'Tue May 01 2018', 280000, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    done();
  });

  it('dispose of two parts of an asset liable to CGT', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
          START: 'January 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'Shrs',
          START: 'January 1 2018',
          VALUE: '300000',
          LIABILITY: `${cgt}Joe`,
          PURCHASE_PRICE: '50000',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(19);
    expectEvals(evals, 0, 'PurchaseShrs', 'Mon Jan 01 2018', 50000, -1);
    expectEvals(evals, 1, 'Cash', 'Mon Jan 01 2018', 0, -1);
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
    expectEvals(evals, 16, 'TaxPot', 'Thu Apr 05 2018', 4266.67, 2);
    expectEvals(evals, 17, 'Cash', 'Tue May 01 2018', 35733.33, 2);
    expectEvals(evals, 18, 'Shrs', 'Tue May 01 2018', 260000, -1);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    done();
  });

  it('have two assets share the same growth rate', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'Feb 7, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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

    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(6);
    expectEvals(evals, 0, 'Shr1', 'Mon Jan 01 2018', 100, -1);
    expectEvals(evals, 1, 'Shr2', 'Mon Jan 01 2018', 200, -1);
    expectEvals(evals, 2, 'Shr3', 'Mon Jan 01 2018', 200, -1);
    expectEvals(evals, 3, 'Shr1', 'Thu Feb 01 2018', 105.95, 2);
    expectEvals(evals, 4, 'Shr2', 'Thu Feb 01 2018', 211.89, 2);
    expectEvals(evals, 5, 'Shr3', 'Thu Feb 01 2018', 200.17, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const model: DbModelData = {
      ...simpleModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
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
        },
      ],
      expenses: [
        {
          ...simpleIncome,
          START: 'January 1 2018',
          END: 'April 2 2018',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'January 1 2018',
          GROWTH: '12.0',
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);

    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('should apply growth and one-off pay revalue to income', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'June 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
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
          CPI_IMMUNE: false,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of paper round',
          TO: 'PRnd',
          TO_VALUE: '10', // pay rise!
          DATE: 'March 5 2018',
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    const evals: Evaluation[] = getEvaluations(model);

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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('should apply growth and revalue asset', done => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'May 1, 2018 00:00:00',
    };
    const model: DbModelData = {
      ...simpleModel,
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
        },
      ],
      settings: [...defaultSettings],
    };
    setSetting(model.settings, roiStart, roi.start);
    setSetting(model.settings, roiEnd, roi.end);
    const evals: Evaluation[] = getEvaluations(model);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(5);
    expectEvals(evals, 0, 'savings', 'Mon Jan 01 2018', 500, -1);
    expectEvals(evals, 1, 'savings', 'Thu Feb 01 2018', 504.74, 2);
    expectEvals(evals, 2, 'savings', 'Thu Mar 01 2018', 509.53, 2);
    expectEvals(evals, 3, 'savings', 'Mon Mar 05 2018', 300, -1);
    expectEvals(evals, 4, 'savings', 'Sun Apr 01 2018', 302.85, 2);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('combine chart data into categories', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);

    const evals: Evaluation[] = getEvaluations(model);
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

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('filter chart data into single category, coarse', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, assetChartFocus, 'Accessible');
    setSetting(model.settings, viewDetail, coarse);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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

  it('filter chart data into single category, fine', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, assetChartFocus, 'Accessible');
    setSetting(model.settings, viewDetail, fine);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartDeltas);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // printTestCodeForChart(result);

    // don't assert about income or expense charts
    // tested elsewhere

    expect(result.assetData.length).toBe(9);
    expect(result.assetData[0].item.NAME).toBe('Cash' + separator + 'Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks' + separator + 'stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('PRn1' + separator + 'Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('PRn2' + separator + 'Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[4].item.NAME).toBe('PRn3' + separator + 'Cash');
    {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[5].item.NAME).toBe('Phon' + separator + 'Cash');
    {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[6].item.NAME).toBe(
      'broadband' + separator + 'Cash',
    );
    {
      const chartPts = result.assetData[6].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[7].item.NAME).toBe('pet food' + separator + 'Cash');
    {
      const chartPts = result.assetData[7].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -12, -1);
    }

    expect(result.assetData[8].item.NAME).toBe(
      'savings' + separator + 'savings',
    );
    {
      const chartPts = result.assetData[8].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }
    done();
  });

  it('asset view type reductions', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartReductions);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    // don't assert about income or expense charts

    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Phon' + separator + 'Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(
      'broadband' + separator + 'Cash',
    );
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('pet food' + separator + 'Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', -12, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', -12, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', -12, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', -12, -1);
    }
    done();
  });

  it('asset view type additions', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartAdditions);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // log(showObj(result));

    // printTestCodeForChart(result);

    // don't assert about income or expense charts
    expect(result.assetData.length).toBe(6);
    expect(result.assetData[0].item.NAME).toBe('Cash' + separator + 'Cash');
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[1].item.NAME).toBe('stocks' + separator + 'stocks');
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 500, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[2].item.NAME).toBe('PRn1' + separator + 'Cash');
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[3].item.NAME).toBe('PRn2' + separator + 'Cash');
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 10, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 10, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[4].item.NAME).toBe('PRn3' + separator + 'Cash');
    {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 10, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }

    expect(result.assetData[5].item.NAME).toBe(
      'savings' + separator + 'savings',
    );
    {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(4);
      expectChartData(chartPts, 0, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 1, 'Tue May 01 2018', 0, -1);
      expectChartData(chartPts, 2, 'Fri Jun 01 2018', 500, -1);
      expectChartData(chartPts, 3, 'Sun Jul 01 2018', 0, -1);
    }
    done();
  });

  it('filter chart data into single category with transfer, coarse', done => {
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

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

    setSetting(model.settings, assetChartFocus, 'Accessible');
    setSetting(model.settings, viewDetail, coarse);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const modelAndRoi = getModelCoarseAndFine();
    const model = modelAndRoi.model;
    const roi = modelAndRoi.roi;

    // set the category of an income to match
    // the category of some assets
    // test that this income doesn't appear in the assets graph!
    model.incomes[0].CATEGORY = 'Accessible';

    setSetting(model.settings, assetChartFocus, 'Accessible');
    setSetting(model.settings, viewDetail, fine);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
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
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartAdditions);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe(
      'MoveQuarterPension' + separator + 'AvailablePensionTaxFree',
    );
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', 24500, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(
      'MoveRemainingPension' + separator + crystallizedPension + 'Joe',
    );
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
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartReductions);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe(
      'MoveQuarterPension' + separator + 'EmploymentPension',
    );
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -25000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(
      'MoveRemainingPension' + separator + 'EmploymentPension',
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
    const roi = modelAndRoi.roi;

    setSetting(model.settings, viewDetail, coarse);
    setSetting(model.settings, assetChartView, assetChartDeltas);

    const evals: Evaluation[] = getEvaluations(model);
    // log(`evals = ${showObj(evals)}`);
    // don't assert evaluations - already done in another test

    const result = makeChartDataFromEvaluations(
      { start: new Date(roi.start), end: new Date(roi.end) },
      model,
      evals,
    );

    // printTestCodeForChart(result);

    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(4);
    expect(result.assetData[0].item.NAME).toBe(
      'MoveQuarterPension' + separator + 'EmploymentPension',
    );
    {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -25000, -1);
    }

    expect(result.assetData[1].item.NAME).toBe(
      'MoveQuarterPension' + separator + 'AvailablePensionTaxFree',
    );
    {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', 24500, -1);
    }

    expect(result.assetData[2].item.NAME).toBe(
      'MoveRemainingPension' + separator + 'EmploymentPension',
    );
    {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', -75000, -1);
    }

    expect(result.assetData[3].item.NAME).toBe(
      'MoveRemainingPension' + separator + crystallizedPension + 'Joe',
    );
    {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(3);
      expectChartData(chartPts, 0, 'Sat Apr 01 2023', 0, -1);
      expectChartData(chartPts, 1, 'Mon Apr 01 2024', 0, -1);
      expectChartData(chartPts, 2, 'Tue Apr 01 2025', 73500, -1);
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

      setSetting(model.settings, key, 'nonsense');

      suppressLogs();
      const evals: Evaluation[] = getEvaluations(model);
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
      ...simpleModel,
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
    let evals: Evaluation[] = getEvaluations(model);
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    setSetting(model.settings, 'shareGrowth', 'nonsense');

    suppressLogs();
    evals = getEvaluations(model);
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
      ...simpleModel,
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
    const evals: Evaluation[] = getEvaluations(model);
    unSuppressLogs();
    // printTestCodeForEvals(evals);
    expect(evals.length).toBe(0);

    done();
  });
});
