/**
 * Expression symmetry is **parked** by default (see EXPRESSION_SYMMETRY_PROBE.md).
 * Enable with npm run test:algo:symmetry or FINKITTY_EXPR_SYMMETRY_ENABLE=1.
 */
import {
  CASH_ASSET_NAME,
  adjustableType,
  cpi,
  constType,
  revalueAsset,
} from "../../localization/stringConstants";
import {
  emptyModel,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
} from "../../models/exampleModels";
import { simpleSetting } from "../../models/exampleSettings";
import { defaultModelSettings } from "../../models/testModel";
import { setSetting } from "../../models/modelUtils";
import { ModelData } from "../../types/interfaces";
import { getTestEvaluations } from "./algoTestUtils";
import {
  addProbeZeroAndOneSettings,
  applyExpressionProbeTransform,
  assertZeroIdentitySymmetry,
  interleaveOneOnNumericTerms,
  interleaveZeroInExpression,
  isExpressionSymmetryAutoCheckEnabled,
  shouldTransformAssetValue,
  shouldTransformFromValue,
  shouldTransformSettingValue,
  shouldTransformToValue,
  shouldTransformValue,
  wrapProbeValue,
} from "./expressionProbe";

function makeProbeSampleModel(expenseValue: string): ModelData {
  const roi = {
    start: "1 Jan 2019",
    end: "1 Jan 2020",
  };
  const model: ModelData = {
    ...emptyModel,
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: "1 Jan 2019",
        VALUE: "0",
        GROWTH: "0",
        CPI_IMMUNE: true,
      },
      {
        ...simpleAsset,
        NAME: "Estate",
        START: "2019",
        VALUE: "0",
        GROWTH: "0",
        CPI_IMMUNE: true,
      },
    ],
    expenses: [
      {
        ...simpleExpense,
        NAME: "Run car",
        START: "1 Feb 2019",
        END: "1 Dec 2019",
        VALUE: expenseValue,
        VALUE_SET: "1 Feb 2019",
        CPI_IMMUNE: false,
        RECURRENCE: "1m",
      },
    ],
    transactions: [
      {
        ...simpleTransaction,
        NAME: "makeEstate",
        DATE: "1 Nov 2019",
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: "1",
        FROM_ABSOLUTE: false,
        TO: "Estate",
        TO_VALUE: "1",
        TO_ABSOLUTE: false,
      },
    ],
    settings: [...defaultModelSettings(roi)],
  };
  setSetting(model.settings, cpi, "2.5", constType);
  return model;
}

describe("expression symmetry probe (automatic via getTestEvaluations)", () => {
  it("getTestEvaluations runs zero-identity checks without throwing on a numeric expense", () => {
    if (!isExpressionSymmetryAutoCheckEnabled()) {
      return;
    }
    expect(() => {
      getTestEvaluations(makeProbeSampleModel("68"), false);
    }).not.toThrow();
  });

  it("getTestEvaluations runs zero-identity checks without throwing on A+700+A", () => {
    if (!isExpressionSymmetryAutoCheckEnabled()) {
      return;
    }
    const model = makeProbeSampleModel("A+700+A");
    setSetting(model.settings, "A", "0", adjustableType);
    expect(() => {
      getTestEvaluations(model, false);
    }).not.toThrow();
  });

  it("applyExpressionProbeTransform rewrites values for manual stress mode", () => {
    const model = makeProbeSampleModel("68");
    applyExpressionProbeTransform(model, "suffixOne");
    expect(model.expenses[0].VALUE).toBe("68One");
    addProbeZeroAndOneSettings(model);
    expect(
      model.settings.find((s) => {
        return s.NAME === "Zero";
      })?.VALUE,
    ).toBe("0");
  });

  it("applyExpressionProbeTransform wraps Zero+value+One for plain numbers only", () => {
    const numeric = makeProbeSampleModel("68");
    applyExpressionProbeTransform(numeric, "prefixZeroSuffixOne");
    expect(numeric.expenses[0].VALUE).toBe("Zero+68One");
    expect(numeric.transactions[0].TO_VALUE).toBe("Zero+1One");

    const symbolic = makeProbeSampleModel("A+700+A");
    setSetting(symbolic.settings, "A", "0", adjustableType);
    applyExpressionProbeTransform(symbolic, "prefixZeroSuffixOne");
    expect(symbolic.expenses[0].VALUE).toBe("A+700+A");
  });

  it("quantised setting-alias guard on TO_VALUE and FROM_VALUE", () => {
    const quantisedAliasAsset = {
      ...simpleAsset,
      NAME: "Shrs",
      VALUE: "ShareVal",
      QUANTITY: "100",
      CPI_IMMUNE: true,
    };
    const aliasNoQuantityAsset = {
      ...simpleAsset,
      NAME: "Cars",
      VALUE: "mini",
      QUANTITY: "",
      CPI_IMMUNE: true,
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [quantisedAliasAsset, aliasNoQuantityAsset],
      settings: [
        { ...simpleSetting, NAME: "ShareVal", VALUE: "100", TYPE: adjustableType },
        { ...simpleSetting, NAME: "mini", VALUE: "100", TYPE: adjustableType },
      ],
    };
    const buyShares = {
      ...simpleTransaction,
      NAME: "Buy",
      TO: "Shrs",
      TO_ABSOLUTE: true,
      TO_VALUE: "100",
    };
    const sellShares = {
      ...simpleTransaction,
      NAME: "Sell",
      FROM: "Shrs",
      FROM_ABSOLUTE: true,
      FROM_VALUE: "100",
    };
    const revalueUnitPrice = {
      ...simpleTransaction,
      NAME: "Revalue cars",
      TO: "Shrs",
      TO_ABSOLUTE: true,
      TO_VALUE: "50",
      TYPE: revalueAsset,
    };
    const scaledToCars = {
      ...simpleTransaction,
      NAME: "scale",
      TO: "Cars",
      TO_ABSOLUTE: false,
      TO_VALUE: "2x",
    };
    const absoluteToCars = {
      ...simpleTransaction,
      NAME: "abs",
      TO: "Cars",
      TO_ABSOLUTE: true,
      TO_VALUE: "3",
    };

    expect(
      shouldTransformToValue(buyShares, "prefixZero", model),
    ).toBe(false);
    expect(
      shouldTransformFromValue(sellShares, "suffixOne", model),
    ).toBe(false);
    expect(
      shouldTransformFromValue(sellShares, "prefixZero", model),
    ).toBe(false);
    expect(
      shouldTransformToValue(revalueUnitPrice, "prefixZero", model),
    ).toBe(true);
    expect(
      shouldTransformToValue(scaledToCars, "prefixZero", model),
    ).toBe(true);
    expect(
      shouldTransformToValue(absoluteToCars, "prefixZero", model),
    ).toBe(true);
  });

  it("getTestEvaluations runs one-identity checks on a numeric expense", () => {
    expect(() => {
      getTestEvaluations(makeProbeSampleModel("68"), false);
    }).not.toThrow();
  });

  it("novel zero expression shapes rewrite as expected", () => {
    expect(wrapProbeValue("68", "suffixZeroMinus")).toBe("68-Zero");
    expect(wrapProbeValue("68", "sandwichZeroPlusMinus")).toBe("Zero+68-Zero");
    expect(wrapProbeValue("68", "suffixZeroPlusMinus")).toBe("68+Zero-Zero");
    expect(wrapProbeValue("68", "suffixDoubleZero")).toBe("68+Zero+Zero");
    expect(wrapProbeValue("68", "prefixDoubleZero")).toBe("Zero+Zero+68");
    expect(interleaveZeroInExpression("A+700+A")).toBe("A+Zero+700+Zero+A");
    expect(interleaveZeroInExpression("2x-y")).toBe("2x+Zero-y");
    expect(interleaveZeroInExpression("68")).toBeUndefined();
  });

  it("novel one expression shapes rewrite as expected", () => {
    expect(wrapProbeValue("68", "suffixOne")).toBe("68One");
    expect(shouldTransformValue("2x", "suffixOne")).toBe(false);
    expect(shouldTransformValue("2cadillac", "suffixOne")).toBe(false);
    expect(interleaveOneOnNumericTerms("A+700+A")).toBe("A+700One+A");
    expect(interleaveOneOnNumericTerms("2x-y")).toBe("2x-y");
    expect(shouldTransformValue("2x-y", "interleaveOneOnNumbers")).toBe(false);
    expect(interleaveOneOnNumericTerms("68")).toBeUndefined();
  });

  it("applyExpressionProbeTransform covers asset, setting, and FROM_VALUE fields", () => {
    const roi = { start: "1 Jan 2019", end: "1 Jan 2020" };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "Cars",
          START: "1 Jan 2019",
          VALUE: "mini",
          GROWTH: "0",
          PURCHASE_PRICE: "500",
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: "NSI",
          START: "1 Jan 2019",
          VALUE: "1000",
          GROWTH: "2",
          PURCHASE_PRICE: "0",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          NAME: "Inc",
          START: "1 Feb 2019",
          END: "1 Dec 2019",
          VALUE: "68",
          VALUE_SET: "1 Feb 2019",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "moveCash",
          DATE: "1 Nov 2019",
          FROM: "Cash",
          FROM_VALUE: "1",
          FROM_ABSOLUTE: false,
          TO: "Cars",
          TO_VALUE: "2x",
          TO_ABSOLUTE: false,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        { ...simpleSetting, NAME: "mini", VALUE: "100", TYPE: adjustableType },
        { ...simpleSetting, NAME: "x", VALUE: "5", TYPE: adjustableType },
      ],
    };
    setSetting(model.settings, "x", "5", adjustableType);

    applyExpressionProbeTransform(model, "suffixZero");
    expect(model.incomes[0].VALUE).toBe("68+Zero");
    expect(model.assets[0].VALUE).toBe("mini");
    expect(model.assets[0].PURCHASE_PRICE).toBe("500");
    expect(model.assets[1].VALUE).toBe("1000");
    expect(shouldTransformAssetValue(model.assets[0], "suffixZero")).toBe(false);
    expect(shouldTransformAssetValue(model.assets[1], "suffixZero")).toBe(
      false,
    );
    expect(model.transactions[0].TO_VALUE).toBe("2x+Zero");
    expect(model.transactions[0].FROM_VALUE).toBe("1");
    expect(
      model.settings.find((s) => {
        return s.NAME === "x";
      })?.VALUE,
    ).toBe("5");

    const oneModel = JSON.parse(JSON.stringify(model)) as ModelData;
    applyExpressionProbeTransform(oneModel, "suffixOne");
    expect(oneModel.transactions[0].FROM_VALUE).toBe("1One");
    expect(oneModel.assets[0].PURCHASE_PRICE).toBe("500");
    expect(oneModel.assets[0].VALUE).toBe("mini");
    expect(oneModel.assets[1].VALUE).toBe("1000");
    expect(shouldTransformAssetValue(oneModel.assets[1], "suffixOne")).toBe(
      false,
    );
    expect(
      shouldTransformAssetValue(
        { ...simpleAsset, VALUE: "100", GROWTH: "shareGrowth" },
        "suffixOne",
      ),
    ).toBe(false);
    expect(
      shouldTransformAssetValue(
        { ...simpleAsset, VALUE: "-70", GROWTH: "0" },
        "suffixOne",
      ),
    ).toBe(false);

    const cashAsset = {
      ...simpleAsset,
      NAME: CASH_ASSET_NAME,
      START: "1 Jan 2019",
      VALUE: "0",
      GROWTH: "0",
      CPI_IMMUNE: true,
    };
    const exprAsset = {
      ...simpleAsset,
      NAME: "MyAsset",
      START: "1 Jan 2019",
      VALUE: "MySetting+50",
      GROWTH: "0",
      CPI_IMMUNE: true,
    };
    const oneExprModel: ModelData = {
      ...emptyModel,
      assets: [cashAsset, exprAsset],
      settings: [
        ...defaultModelSettings(roi),
        { ...simpleSetting, NAME: "MySetting", VALUE: "100", TYPE: adjustableType },
      ],
    };
    expect(
      shouldTransformAssetValue(oneExprModel.assets[1], "interleaveOneOnNumbers"),
    ).toBe(true);
    applyExpressionProbeTransform(oneExprModel, "interleaveOneOnNumbers");
    expect(oneExprModel.assets[1].VALUE).toBe("MySetting+50One");

    const plainFromTx = {
      ...simpleTransaction,
      FROM: "Cars",
      FROM_VALUE: "amountFrom",
    };
    const numericFromTx = {
      ...simpleTransaction,
      FROM: CASH_ASSET_NAME,
      FROM_VALUE: "1",
    };
    expect(
      shouldTransformFromValue(plainFromTx, "suffixZero", model),
    ).toBe(false);
    expect(
      shouldTransformFromValue(numericFromTx, "suffixOne", model),
    ).toBe(true);
    expect(
      shouldTransformAssetValue(model.assets[1], "suffixZero"),
    ).toBe(false);
    expect(
      shouldTransformSettingValue(
        { ...simpleSetting, NAME: "cpi", VALUE: "2", TYPE: "const" },
        "suffixZero",
        oneModel,
      ),
    ).toBe(false);
    expect(
      shouldTransformSettingValue(
        { ...simpleSetting, NAME: cpi, VALUE: "0", TYPE: adjustableType },
        "prefixZero",
        oneModel,
      ),
    ).toBe(false);
    expect(
      shouldTransformSettingValue(
        { ...simpleSetting, NAME: "USD", VALUE: "2", TYPE: adjustableType },
        "suffixZero",
        {
          ...emptyModel,
          settings: [
            {
              ...simpleSetting,
              NAME: "chrysler",
              VALUE: "50USD",
              TYPE: "const",
            },
          ],
        },
      ),
    ).toBe(false);
  });

  it("getTestEvaluations runs one-identity checks on asset expression VALUE", () => {
    const roi = { start: "Dec 1, 2017", end: "March 1, 2018" };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "Dec 1, 2017",
          VALUE: "1000",
          GROWTH: "0",
        },
        {
          ...simpleAsset,
          NAME: "MyAsset",
          START: "Jan 1 2018",
          VALUE: "MySetting+X",
          GROWTH: "0",
          CPI_IMMUNE: true,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, "0.0", constType);
    setSetting(model.settings, "MySetting", "100", adjustableType);
    setSetting(model.settings, "X", "50", adjustableType);
    expect(() => {
      getTestEvaluations(model, false);
    }).not.toThrow();
  });

  it("getTestEvaluations runs extended contexts without throwing", () => {
    const roi = { start: "1 Jan 2019", end: "1 Jan 2020" };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2019",
          VALUE: "0",
          GROWTH: "0",
        },
        {
          ...simpleAsset,
          NAME: "Cars",
          START: "1 Jan 2019",
          VALUE: "mini",
          GROWTH: "0",
          PURCHASE_PRICE: "100",
          CPI_IMMUNE: true,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          NAME: "Run car",
          START: "1 Feb 2019",
          END: "1 Dec 2019",
          VALUE: "68",
          VALUE_SET: "1 Feb 2019",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "buy",
          DATE: "1 Nov 2019",
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "1",
          FROM_ABSOLUTE: false,
          TO: "Cars",
          TO_VALUE: "100",
          TO_ABSOLUTE: false,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        { ...simpleSetting, NAME: "mini", VALUE: "100", TYPE: adjustableType },
      ],
    };
    setSetting(model.settings, cpi, "2.5", constType);
    expect(() => {
      getTestEvaluations(model, false);
    }).not.toThrow();
  });

  it("getTestEvaluations runs widened shapes on A+700+A and 2x-y", () => {
    const exprModel = makeProbeSampleModel("A+700+A");
    setSetting(exprModel.settings, "A", "0", adjustableType);
    expect(() => {
      getTestEvaluations(exprModel, false);
    }).not.toThrow();

    const scaledModel = makeProbeSampleModel("2x-y");
    scaledModel.expenses[0].CPI_IMMUNE = true;
    setSetting(scaledModel.settings, "x", "10", adjustableType);
    expect(() => {
      getTestEvaluations(scaledModel, false);
    }).not.toThrow();
  });
});
