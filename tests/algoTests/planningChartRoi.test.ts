import { describe, it, expect } from "@jest/globals";
import { snapPlanningChartRoiStart } from "../../models/planningData";
import { FinKittyDate } from "../../utils/utils";

describe("snapPlanningChartRoiStart", () => {
  it("keeps 31 Dec anchor unchanged", () => {
    const anchor = new FinKittyDate(new Date(2025, 11, 31));
    expect(snapPlanningChartRoiStart(anchor).getTestDescription()).toBe(
      "Wed Dec 31 2025",
    );
  });

  it("snaps mid-year anchor to prior 31 Dec", () => {
    const anchor = new FinKittyDate(new Date(2026, 5, 18));
    expect(snapPlanningChartRoiStart(anchor).getTestDescription()).toBe(
      "Wed Dec 31 2025",
    );
  });

  it("snaps 1 Jan anchor to prior 31 Dec", () => {
    const anchor = new FinKittyDate(new Date(2018, 0, 1));
    expect(snapPlanningChartRoiStart(anchor).getTestDescription()).toBe(
      "Sun Dec 31 2017",
    );
  });
});
