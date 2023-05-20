import {
  CASH_ASSET_NAME,
  constType,
  revalueAsset,
  revalueSetting,
} from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleAsset,
  defaultModelSettings,
  minimalModel,
  simpleTransaction,
  getMinimalModelCopy,
  getThreeChryslerModel,
} from '../../models/exampleModels';
import { ModelData } from '../../types/interfaces';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
  expectChartData,
  printTestCodeForChart,
} from './algoTestUtils';

printTestCodeForChart;

describe('quantity tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    printTestCodeForEvals;
    log;
  }

  it('an asset can be a quantity of things', () => {
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
          ERA: undefined,
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
  });

  it('an asset can be a quantity of dollar-priced things', () => {
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
          ERA: undefined,
          VALUE: '10' + dollar,
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
        {
          NAME: dollar,
          ERA: undefined,
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
  });

  it('sell 100% of a quantity of things', () => {
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
          ERA: undefined,
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
  });

  it('sell 99% of a quantity of things', () => {
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
          ERA: undefined,
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
  });

  it('define three mini cars', () => {
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
          ERA: undefined,
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('revalue three mini cars', () => {
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
          ERA: undefined,
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('simple buy some mini cars', () => {
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
          ERA: undefined,
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('simple sell some mini cars', () => {
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
          ERA: undefined,
          VALUE: '100',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('define three chrysler cars', () => {
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
  });

  it('revalue three chrysler cars', () => {
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
          ERA: undefined,
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('simple buy some chrysler cars', () => {
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
        {
          ...simpleTransaction,
          NAME: 'Revalue of USD',
          TO: 'USD',
          TO_VALUE: '2.5',
          DATE: 'April 10 2018',
          TYPE: revalueSetting,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'chrysler',
          ERA: undefined,
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '2',
          HINT: '',
          TYPE: 'adjustable',
        },
      ],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(evals, 0, 'USD', 'Tue Jan 02 2018', 2, -1);
    expectEvals(evals, 1, 'chrysler', 'Tue Jan 02 2018', 100, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'quantityCars', 'Tue Jan 02 2018', 3, -1);
    expectEvals(evals, 4, 'Cars', 'Tue Jan 02 2018', 300, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Feb 02 2018', 300, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Cars', 'Fri Mar 02 2018', 300, -1);
    expectEvals(evals, 9, 'quantityCars', 'Sat Mar 10 2018', 6, -1);
    expectEvals(evals, 10, 'Cash', 'Sat Mar 10 2018', -333, -1);
    expectEvals(evals, 11, 'Cars', 'Sat Mar 10 2018', 600, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', -333, -1);
    expectEvals(evals, 13, 'Cars', 'Mon Apr 02 2018', 600, -1);
    expectEvals(evals, 14, 'USD', 'Tue Apr 10 2018', 2.5, 2);
    expectEvals(evals, 15, 'Cash', 'Tue May 01 2018', -333, -1);
    expectEvals(evals, 16, 'Cars', 'Wed May 02 2018', 750, -1);

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
  });

  it('simple sell some chrysler cars', () => {
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
          ERA: undefined,
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '2',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('define three daimler cars', () => {
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
          ERA: undefined,
          VALUE: '0.25USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '400',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('define three ford cars', () => {
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
          ERA: undefined,
          VALUE: '400USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '0.25',
          HINT: '',
          TYPE: 'const',
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('revalue chrysler cars for USD change', () => {
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
          ERA: undefined,
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
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
    model.assets.filter((a) => {
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
  });

  it('revalue chrysler cars for crysler val change', () => {
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
          ERA: undefined,
          VALUE: '50USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
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
    model.assets.filter((a) => {
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
  });

  it('revalue chrysler cars from number to expression', () => {
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
          ERA: undefined,
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
          ERA: undefined,
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
          TYPE: revalueAsset,
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('define three cadillac cars', () => {
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
          ERA: undefined,
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
    model.assets.filter((a) => {
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
  });

  it('define two cadillac cars deeper indirection', () => {
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
          ERA: undefined,
          VALUE: '2twoUSD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'twoUSD',
          ERA: undefined,
          VALUE: '2USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
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
    model.assets.filter((a) => {
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
  });

  it('define two cadillac cars double formula', () => {
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
          ERA: undefined,
          VALUE: '2twoUSD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'twoUSD',
          ERA: undefined,
          VALUE: '2USD',
          HINT: '',
          TYPE: 'const',
        },
        {
          NAME: 'USD',
          ERA: undefined,
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
    model.assets.filter((a) => {
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
  });

  it('define three cars', () => {
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
    model.assets.filter((a) => {
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
  });

  it('revalue three cars', () => {
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
    model.assets.filter((a) => {
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
  });

  it('simple buy some cars', () => {
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
    model.assets.filter((a) => {
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
  });

  it('simple get first cars', () => {
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
          QUANTITY: '0',
        },
      ],
      transactions: [
        ...minimalModel.transactions,
        {
          ...simpleTransaction,
          NAME: 'Get some cars',
          TO: 'Cars',
          TO_VALUE: '3', // get three
          DATE: 'Mar 10 2018',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    model.assets.filter((a) => {
      return a.NAME === CASH_ASSET_NAME;
    })[0].START = '1 Jan 2018';

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(12);
    expectEvals(evals, 0, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 1, 'quantityCars', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 2, 'Cars', 'Tue Jan 02 2018', 0, -1);
    expectEvals(evals, 3, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 4, 'Cars', 'Fri Feb 02 2018', 0, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 6, 'Cars', 'Fri Mar 02 2018', 0, -1);
    expectEvals(evals, 7, 'quantityCars', 'Sat Mar 10 2018', 3, -1);
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
      expectChartData(chartPts, 2, 'Thu Feb 01 2018', 0, -1);
      expectChartData(chartPts, 3, 'Thu Mar 01 2018', 0, -1);
      expectChartData(chartPts, 4, 'Sun Apr 01 2018', 0, -1);
      expectChartData(chartPts, 5, 'Tue May 01 2018', 300, -1);
    }
  });

  it('be given some cars', () => {
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
    model.assets.filter((a) => {
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
  });

  it('be given some US cars', () => {
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
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'USD',
          ERA: undefined,
          VALUE: '0.88', // exchange rate
          HINT: 'something',
          TYPE: constType, // eventually we will want to adjust...
        },
      ],
    };
    model.assets.filter((a) => {
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
  });

  it('simple sell some cars', () => {
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
    model.assets.filter((a) => {
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
  });
});
