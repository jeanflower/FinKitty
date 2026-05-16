import {
  custom,
  constType,
  revalue,
  revalueAsset,
  revalueExp,
  revalueSetting,
} from "../../localization/stringConstants";
import { autoSetOldEra } from "../../models/autoSetOldEra";
import { checkModel } from "../../models/checks";
import { simpleExpense, simpleAsset } from "../../models/exampleModels";
import { getMinimalModelCopy } from "../../models/minimalModel";
import type { Generator, ModelData, Transaction } from "../../types/interfaces";

function baseModel(): ModelData {
  const m = getMinimalModelCopy();
  m.name = "AutoEraUnitTest";
  m.settings.push({
    NAME: "trackSetting",
    VALUE: "1",
    HINT: "",
    TYPE: constType,
    ERA: 0,
  });
  return m;
}

/** 15 Jan 2026 UTC — T ≈ 2025-01-15, 2T ≈ 2024-01-15 */
const ANCHOR = new Date(Date.UTC(2026, 0, 15));

describe("autoSetOldEra", () => {
  it("marks expenses whose END is before 2T", () => {
    const m = baseModel();
    m.expenses = [
      {
        ...simpleExpense,
        NAME: "EndedOld",
        RECURRENCE: "1m",
        START: "1 Jan 2015",
        END: "1 July 2023",
        VALUE_SET: "1 Jan 2015",
        VALUE: "10",
        ERA: 0,
      },
    ];
    expect(checkModel(m).message).toBe("");
    autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(m.expenses[0].ERA).toBe(-1);
    expect(checkModel(m).message).toBe("");
  });

  it("marks bond generators whose target YEAR is before 2T calendar year", () => {
    const m = baseModel();
    const g: Generator = {
      NAME: "OldBondGen",
      ERA: 0,
      TYPE: "Bonds",
      DETAILS: {
        VALUE: "5",
        GROWTH: "0",
        CATEGORY: "Bonds",
        START: "1 June 2022",
        DURATION: "1y",
        SOURCE: "Cash",
        TARGET: "Cash",
        YEAR: "2023",
        RECURRENCE: "",
        RECURRENCE_STOP: "",
      },
    };
    m.generators = [g];
    expect(checkModel(m).message).toBe("");
    autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(m.generators[0].ERA).toBe(-1);
  });

  it("marks obsolete revalueExp / revalueAsset when not latest and dates before 2T", () => {
    const m = baseModel();
    m.expenses = [
      {
        ...simpleExpense,
        NAME: "E",
        RECURRENCE: "1m",
        START: "1 Jan 2015",
        END: "1 Jan 2030",
        VALUE_SET: "1 Jan 2015",
        VALUE: "10",
        ERA: 0,
      },
    ];
    m.assets = [
      m.assets[0],
      {
        ...simpleAsset,
        NAME: "Stocks",
        CATEGORY: "Eq",
        START: "1 Jan 2017",
        VALUE: "1000",
        ERA: 0,
      },
    ];
    const revExpOld: Transaction = {
      NAME: `${revalue}E 1`,
      ERA: 0,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0",
      TO: "E",
      TO_ABSOLUTE: true,
      TO_VALUE: "10",
      DATE: "1 Jan 2022",
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: revalueExp,
      CATEGORY: "",
    };
    const revExpNew: Transaction = {
      ...revExpOld,
      NAME: `${revalue}E 2`,
      DATE: "1 Jan 2025",
      TO_VALUE: "20",
    };
    const revAstOld: Transaction = {
      NAME: `${revalue}Stocks 1`,
      ERA: 0,
      FROM: "",
      FROM_ABSOLUTE: true,
      FROM_VALUE: "0",
      TO: "Stocks",
      TO_ABSOLUTE: true,
      TO_VALUE: "500",
      DATE: "1 Jan 2022",
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: revalueAsset,
      CATEGORY: "",
    };
    const revAstNew: Transaction = {
      ...revAstOld,
      NAME: `${revalue}Stocks 2`,
      DATE: "1 Jan 2025",
      TO_VALUE: "600",
    };
    m.transactions = [revExpOld, revExpNew, revAstOld, revAstNew];
    expect(checkModel(m).message).toBe("");
    autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(revExpOld.ERA).toBe(-1);
    expect(revExpNew.ERA).toBe(0);
    expect(revAstOld.ERA).toBe(-1);
    expect(revAstNew.ERA).toBe(0);
  });

  it("marks custom transactions by T when non-recurring or recurring end before T", () => {
    const m = baseModel();
    const oldOnce: Transaction = {
      NAME: "custOld",
      ERA: 0,
      FROM: "Cash",
      FROM_ABSOLUTE: true,
      FROM_VALUE: "1",
      TO: "Cash",
      TO_ABSOLUTE: true,
      TO_VALUE: "0",
      DATE: "1 Jan 2023",
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: custom,
      CATEGORY: "",
    };
    const recentOnce: Transaction = {
      ...oldOnce,
      NAME: "custRecent",
      DATE: "1 June 2025",
    };
    const oldRec: Transaction = {
      ...oldOnce,
      NAME: "custRecOld",
      DATE: "1 Jan 2020",
      RECURRENCE: "1y",
      STOP_DATE: "1 June 2024",
    };
    m.transactions = [oldOnce, recentOnce, oldRec];
    expect(checkModel(m).message).toBe("");
    autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(oldOnce.ERA).toBe(-1);
    expect(recentOnce.ERA).toBe(0);
    expect(oldRec.ERA).toBe(-1);
  });

  it("keeps the two latest setting revaluations per TO (non-recurring)", () => {
    const m = baseModel();
    const mk = (name: string, date: string): Transaction => ({
      NAME: name,
      ERA: 0,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0",
      TO: "trackSetting",
      TO_ABSOLUTE: true,
      TO_VALUE: "1",
      DATE: date,
      STOP_DATE: "",
      RECURRENCE: "",
      TYPE: revalueSetting,
      CATEGORY: "",
    });
    m.transactions = [
      mk(`${revalue}trackSetting 1`, "1 Jan 2019"),
      mk(`${revalue}trackSetting 2`, "1 Jan 2020"),
      mk(`${revalue}trackSetting 3`, "1 Jan 2021"),
    ];
    expect(checkModel(m).message).toBe("");
    autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(m.transactions[0].ERA).toBe(-1);
    expect(m.transactions[1].ERA).toBe(0);
    expect(m.transactions[2].ERA).toBe(0);
  });

  it("counts only expenses whose ERA actually changed to -1", () => {
    const m = baseModel();
    const oldExpense = {
      ...simpleExpense,
      NAME: "AlreadyOld",
      RECURRENCE: "1m",
      START: "1 Jan 2015",
      END: "1 July 2023",
      VALUE_SET: "1 Jan 2015",
      VALUE: "10",
      ERA: -1 as number | undefined,
    };
    const newExpense = {
      ...simpleExpense,
      NAME: "NewlyOld",
      RECURRENCE: "1m",
      START: "1 Jan 2015",
      END: "1 July 2023",
      VALUE_SET: "1 Jan 2015",
      VALUE: "10",
      ERA: 0,
    };
    m.expenses = [oldExpense, newExpense];
    const r1 = autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(r1.checkMessage).toBe("");
    expect(r1.summary).toMatch(/\b1 expenses \(end before 2y\)/);
    const r2 = autoSetOldEra(m, { anchorDate: ANCHOR });
    expect(r2.checkMessage).toBe("");
    expect(r2.summary).toMatch(/\b0 expenses \(end before 2y\)/);
  });
});
