import { describe, it, expect } from "@jest/globals";
import { monthly } from "../../localization/stringConstants";
import {
  EvaluationHelper,
  getEvaluations,
  processGenerators,
} from "../../models/evaluations";
import { getROI } from "../../models/modelUtils";
import {
  getAnnualPlanningAssetData,
  getPlanningTableData,
} from "../../models/planningData";
import { getMinimalModelCopy } from "../../models/minimalModel";
import { makeBarData } from "../../views/chartPages";
import { makeChartData } from "../../models/charting";
import { getDefaultViewSettings } from "../../utils/viewUtils";

describe("getPlanningTableData row labels", () => {
  it("uses planning chart values aligned to view range start year rows", () => {
    const model = getMinimalModelCopy();
    model.name = "ready to be processed";
    model.expenses.push({
      NAME: "BasicLiving",
      CATEGORY: "Basic",
      START: "1 Jan 2020",
      END: "01 Jan 2030",
      VALUE: "1000",
      VALUE_SET: "1 Jan 2020",
      GROWTH: "0",
      CPI_IMMUNE: false,
      RECURRENCE: "1m",
      ERA: 0,
    });
    const roiStartSetting = model.settings.find((s) => {
      return s.NAME === "Beginning of view range";
    });
    if (roiStartSetting !== undefined) {
      roiStartSetting.VALUE = "31 Dec 2025";
    }
    expect(processGenerators(model)).toBe("");
    model.name = "has been processed";

    const helper = new EvaluationHelper(() => false, 100, monthly);
    const evals = getEvaluations(model, helper);
    const planningData = getAnnualPlanningAssetData(model, evals);
    const viewRangeStart = getROI(model).start.d;

    const viewSettings = getDefaultViewSettings();
    viewSettings.setModel(model);
    const mainChart = makeChartData(model, viewSettings, evals);
    const mainExpensesChartData = makeBarData(
      mainChart.labels,
      mainChart.expensesData,
    );

    const tableData = getPlanningTableData(
      planningData.planningExpensesChartData,
      planningData.planningAssetsChartData,
      evals.reportData,
      viewRangeStart,
    );

    expect(tableData.length).toBeGreaterThan(0);
    expect(String(tableData[0].DATE)).toContain("2025");
    expect(
      tableData.some((row) => {
        return new Date(String(row.DATE)).getFullYear() < 2025;
      }),
    ).toBe(false);
    // £1000/month Basic expense, zero growth → 12 × 1000 for calendar year 2025
    expect(parseFloat(tableData[0].BASIC)).toBeCloseTo(12000, 0);

    // View-range labels start at 2025; planning labels start earlier (anchor ROI).
    expect(mainExpensesChartData.labels[0]).toContain("2025");
    expect(planningData.planningExpensesChartData.labels[0]).not.toContain(
      "2025",
    );
  });
});
