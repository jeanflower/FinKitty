import {
  revalueAsset,
  adjustableType,
  currentAssetValue,
} from "../../localization/stringConstants";
import {
  checkTransaction,
  isValidRevalueAssetToValue,
  isValidValue,
} from "../../models/checks";
import { getMinimalModelCopy } from "../../models/minimalModel";
import {
  emptyModel,
  simpleAsset,
  simpleTransaction,
} from "../../models/exampleModels";
import { defaultModelSettings } from "../../models/testModel";
import { ModelData } from "../../types/interfaces";
import { makeValueAbsPropFromString } from "../../utils/stringUtils";
import { getTestEvaluations } from "./algoTestUtils";

describe("revalue asset TO_VALUE expressions", () => {
  it("accepts asset name minus setting", () => {
    const model = getMinimalModelCopy();
    model.assets.push({
      ...simpleAsset,
      NAME: "MyAsset",
      VALUE: "1000",
      START: "01 Jan 2017",
    });
    model.settings.push({
      NAME: "Deduction",
      VALUE: "200",
      HINT: "",
      TYPE: adjustableType,
      ERA: 0,
    });
    const expr = "MyAsset - Deduction";
    expect(makeValueAbsPropFromString(expr, model.settings).checksOK).toBe(true);
    expect(isValidRevalueAssetToValue(expr, model)).toBe(true);
    expect(
      checkTransaction(
        {
          ...simpleTransaction,
          NAME: "Revalue MyAsset 1",
          TO: "MyAsset",
          TO_VALUE: expr,
          TO_ABSOLUTE: true,
          DATE: "01 Jan 2020",
          TYPE: revalueAsset,
        },
        model,
      ),
    ).toBe("");
  });

  it("evaluates asset name minus setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2020 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "MyAsset",
          VALUE: "1000",
          START: "01 Jan 2018",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "Deduction",
          VALUE: "200",
          HINT: "",
          TYPE: adjustableType,
          ERA: 0,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue MyAsset 1",
          TO: "MyAsset",
          TO_VALUE: "MyAsset - Deduction",
          TO_ABSOLUTE: true,
          DATE: "01 Jan 2020",
          TYPE: revalueAsset,
        },
      ],
    };
    const evals = getTestEvaluations(model).evaluations;
    const myAssetEvals = evals.filter((e) => e.name === "MyAsset");
    expect(myAssetEvals[myAssetEvals.length - 1].value).toBe(800);
  });

  it("accepts and evaluates CurrentAssetValue minus setting", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "May 1, 2020 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "MyAsset",
          VALUE: "1000",
          START: "01 Jan 2018",
          GROWTH: "0",
        },
        {
          ...simpleAsset,
          NAME: "OtherAsset",
          VALUE: "500",
          START: "01 Jan 2018",
          GROWTH: "0",
          CATEGORY: "holdings",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "Deduction",
          VALUE: "200",
          HINT: "",
          TYPE: adjustableType,
          ERA: 0,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue holdings 1",
          TO: "holdings",
          TO_VALUE: `${currentAssetValue} - Deduction`,
          TO_ABSOLUTE: true,
          DATE: "01 Jan 2020",
          TYPE: revalueAsset,
        },
      ],
    };
    const expr = `${currentAssetValue} - Deduction`;
    expect(isValidRevalueAssetToValue(expr, model)).toBe(true);
    expect(isValidValue(expr, model)).toBe(false);
    expect(
      checkTransaction(
        {
          ...simpleTransaction,
          NAME: "Revalue holdings 1",
          TO: "holdings",
          TO_VALUE: expr,
          TO_ABSOLUTE: true,
          DATE: "01 Jan 2020",
          TYPE: revalueAsset,
        },
        model,
      ),
    ).toBe("");

    const evals = getTestEvaluations(model).evaluations;
    const otherAssetEvals = evals.filter((e) => e.name === "OtherAsset");
    expect(otherAssetEvals[otherAssetEvals.length - 1].value).toBe(300);
  });
});
