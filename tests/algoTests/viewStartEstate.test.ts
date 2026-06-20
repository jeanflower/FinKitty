import { describe, it, expect } from "@jest/globals";
import {
  CASH_ASSET_NAME,
  monthly,
  roiEnd,
  roiStart,
  viewType,
} from "../../localization/stringConstants";
import {
  EvaluationHelper,
  computeBondInvestFromValues,
  processGenerators,
} from "../../models/evaluations";
import { makeModelFromJSON } from "../../models/modelFromJSON";
import { setSetting } from "../../models/modelUtils";
import {
  emptyModel,
  simpleAsset,
  simpleExpense,
} from "../../models/exampleModels";
import { defaultModelSettings } from "../../models/testModel";
import { ModelData } from "../../types/interfaces";

function bondPlanningModel(viewStart: string, viewEnd: string): ModelData {
  const model = makeModelFromJSON(
    JSON.stringify({
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "01 Jan 2017",
          VALUE: "100000",
          GROWTH: "0",
          CPI_IMMUNE: true,
          CAN_BE_NEGATIVE: true,
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          START: "January 1 2025",
          END: "January 1 2028",
          NAME: "Phon",
          VALUE: "100",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
          CATEGORY: "Basic",
        },
      ],
      settings: [...defaultModelSettings({ start: viewStart, end: viewEnd })],
      generators: [
        {
          NAME: "MyFirstBond",
          ERA: "0",
          TYPE: "Bonds",
          DETAILS: {
            VALUE: "100",
            GROWTH: "10",
            CATEGORY: "Bonds",
            START: "01 Jul 2021",
            DURATION: "4y",
            SOURCE: CASH_ASSET_NAME,
            TARGET: CASH_ASSET_NAME,
            YEAR: "2026",
            RECURRENCE: "1y",
            RECURRENCE_STOP: "2 Jul 2024",
          },
        },
      ],
    }),
  );
  setSetting(model.settings, roiStart, viewStart, viewType);
  setSetting(model.settings, roiEnd, viewEnd, viewType);
  model.name = "ready to be processed";
  expect(processGenerators(model)).toBe("");
  model.name = "has been processed";
  return model;
}

function bondInvestForViewStart(viewStart: string, viewEnd: string) {
  const model = bondPlanningModel(viewStart, viewEnd);
  const helper = new EvaluationHelper(undefined, 100, monthly);
  return computeBondInvestFromValues(model, helper);
}

describe("view start must not change bond planning invest amounts", () => {
  const viewEnd = "31 Dec 2034";
  const starts = ["31 Dec 2025", "18 Jun 2026"];

  it("GenFor bond invest amounts unchanged when view start moves", () => {
    const a = bondInvestForViewStart(starts[0], viewEnd);
    const b = bondInvestForViewStart(starts[1], viewEnd);
    expect(a.length).toBeGreaterThan(0);
    expect(b).toEqual(a);
  });
});
