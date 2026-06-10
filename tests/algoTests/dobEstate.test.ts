import { describe, it, expect } from "@jest/globals";
import {
  birthDate,
  monthly,
  viewType,
  CASH_ASSET_NAME,
  adjustableType,
  constType,
  cpi,
} from "../../localization/stringConstants";
import {
  getEvaluations,
  processGenerators,
  EvaluationHelper,
  computeBondInvestFromValues,
} from "../../models/evaluations";
import { makeModelFromJSON } from "../../models/modelFromJSON";
import { setSetting } from "../../models/modelUtils";
import {
  getVariableDateExampleData,
  simpleExampleData,
  emptyModel,
  simpleAsset,
  simpleTransaction,
  simpleExpense,
} from "../../models/exampleModels";
import { defaultModelSettings } from "../../models/testModel";
import { ModelData } from "../../types/interfaces";

function estateFromModel(modelInput: ModelData, dob: string) {
  const model = makeModelFromJSON(JSON.stringify(modelInput));
  setSetting(model.settings, birthDate, dob, viewType, "");
  model.name = "ready to be processed";
  const err = processGenerators(model);
  expect(err).toBe("");
  model.name = "has been processed";
  const helper = new EvaluationHelper(undefined, 100, monthly);
  const result = getEvaluations(model, helper);
  const estate = result.reportData.find((d) => d.name === "Estate final value");
  return estate?.newVal as number | undefined;
}

describe("Date of birth must not change Estate", () => {
  const dobs = ["", "1 Feb 1980", "31 August 1973"];

  it("variableDateExampleData estate unchanged by DOB", () => {
    const base = getVariableDateExampleData();
    const baseline = estateFromModel(base, "");
    expect(baseline).toBeDefined();
    for (const dob of dobs.slice(1)) {
      expect(estateFromModel(base, dob)).toBe(baseline);
    }
  });

  it("simpleExampleData estate unchanged by DOB if present", () => {
    const base = makeModelFromJSON(simpleExampleData, "simple");
    const without = estateFromModel(base, "");
    const withDob = estateFromModel(base, "31 August 1973");
    expect(withDob).toBe(without);
  });

  it("Estate model with short setting name A unchanged by DOB", () => {
    const roi = { start: "1 Jan 2019", end: "1 Jan 2020" };
    const base: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2019",
          VALUE: "1000",
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
      transactions: [
        {
          ...simpleTransaction,
          NAME: "makeEstate",
          DATE: "1 Nov 2019",
          FROM: CASH_ASSET_NAME,
          FROM_VALUE: "1",
          TO: "Estate",
          TO_VALUE: "1",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(base.settings, cpi, "2.5", constType);
    setSetting(base.settings, "A", "0", adjustableType);
    const without = estateFromModel(base, "");
    const withDob = estateFromModel(base, "31 August 1973");
    expect(withDob).toBe(without);
  });

  it("bond GenFor invest amounts unchanged by DOB", () => {
    const roi = { start: "Dec 30 2020", end: "Dec 30 2030" };
    const base: ModelData = {
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
      settings: [...defaultModelSettings(roi)],
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
    };

    const bondInvestForDob = (dob: string) => {
      const model = makeModelFromJSON(JSON.stringify(base));
      setSetting(model.settings, birthDate, dob, viewType, "");
      model.name = "ready to be processed";
      const err = processGenerators(model);
      expect(err).toBe("");
      model.name = "has been processed";
      const helper = new EvaluationHelper(undefined, 100, monthly);
      return computeBondInvestFromValues(model, helper);
    };

    const withoutDob = bondInvestForDob("");
    const withDob = bondInvestForDob("31 August 1973");
    expect(withoutDob.length).toBeGreaterThan(0);
    expect(withDob).toEqual(withoutDob);
  });

});
