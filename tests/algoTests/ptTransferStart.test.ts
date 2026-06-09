import { expect, test } from "@jest/globals";
import { makeModelFromJSONString } from "../../models/modelFromJSON";
import { makeChartDataFromEvaluations } from "../../models/charting";
import {
  getTestEvaluations,
  defaultTestViewSettings,
} from "./algoTestUtils";
import {
  pensionTransfer,
  viewFrequency,
  weekly,
} from "../../localization/stringConstants";
import { defaultModelSettings } from "../../models/testModel";

test("-PT pays on transfer day and income chart skips transfer setValue eval", () => {
  const roi = { start: "March 1 2024", end: "July 1 2026" };
  const model = makeModelFromJSONString(
    JSON.stringify({
      name: "DPBModel",
      expenses: [],
      incomes: [
        {
          NAME: "javaJob1",
          ERA: 0,
          VALUE: "250",
          VALUE_SET: "02 April 2020",
          START: "02 April 2021",
          END: "02 April 2022",
          CPI_IMMUNE: true,
          LIABILITY: "Joe(incomeTax)/Joe(NI)",
          RECURRENCE: "1m",
          CATEGORY: "programming",
        },
      ],
      assets: [
        {
          NAME: "Cash",
          CATEGORY: "",
          START: "01 Jan 2017",
          VALUE: "0.0",
          QUANTITY: "",
          GROWTH: "0.0",
          CPI_IMMUNE: true,
          CAN_BE_NEGATIVE: true,
          IS_A_DEBT: false,
          LIABILITY: "",
          PURCHASE_PRICE: "0.0",
          ERA: 0,
        },
      ],
      transactions: [],
      settings: defaultModelSettings(roi),
      monitors: [],
      triggers: [],
      generators: [
        {
          NAME: "TeachersPensionScheme",
          ERA: 0,
          TYPE: "Defined Benefits",
          DETAILS: {
            VALUE: "10",
            VALUE_SET: "1 Jan 2021",
            INCOME_SOURCE: "javaJob1",
            SALARY_SACRIFICED: "Y",
            CONTRIBUTION_AMOUNT: "0.5",
            ACCRUAL: "0.02",
            STOP_SOURCE: "1 Jan 2025",
            START: "2 April 2023",
            END: "2 April 2024",
            GROWS_WITH_CPI: "N",
            TRANSFER_TO: "Jack",
            TRANSFER_PROPORTION: "0.5",
            TRANSFERRED_STOP: "2 April 2026",
            TAX_LIABILITY: "Joe",
            CATEGORY: "pension",
          },
        },
      ],
      version: 13,
    }),
  );

  const pt = pensionTransfer + "TeachersPensionScheme";
  const evals = getTestEvaluations(model);

  const transferDayCash = evals.evaluations.find(
    (e) =>
      e.name === "Cash" &&
      e.source === pt &&
      e.date.d.getFullYear() === 2024 &&
      e.date.d.getMonth() === 3 &&
      e.date.d.getDate() === 2,
  );
  expect(transferDayCash).toBeDefined();
  expect(transferDayCash!.value - transferDayCash!.oldValue).toBeCloseTo(7.5, 1);

  const transferDayIncomeEvals = evals.evaluations.filter(
    (e) =>
      e.name === pt &&
      e.date.d.getFullYear() === 2024 &&
      e.date.d.getMonth() === 3 &&
      e.date.d.getDate() === 2,
  );
  expect(transferDayIncomeEvals.some((e) => e.source === pt)).toBe(true);
  expect(transferDayIncomeEvals.some((e) => e.source === "growth")).toBe(true);

  const viewSettings = defaultTestViewSettings();
  viewSettings.setViewSetting(viewFrequency, weekly);
  const chart = makeChartDataFromEvaluations(model, viewSettings, evals);
  const firstBar = chart.incomesData
    .find((i) => i.item.NAME === pt)!
    .chartDataPoints.find((p) => p.y > 0);
  expect(firstBar).toBeDefined();
  expect(firstBar!.y).toBeCloseTo(7.5, 1);
});
