import {
  crystallizedPension,
  dot,
  generatedRecurrence,
  pensionPrefix,
  taxFree,
} from "../../localization/stringConstants";
import { getNameForChart } from "../../utils/viewUtils";
import {
  chartAssetNameFromAssetName,
  recurrentBondAssetNameToChartAssetName,
} from "../../utils/chartAssetGrouping";
import { ModelData } from "../../types/interfaces";

describe("chartAssetGrouping", () => {
  it("recurrentBondAssetNameToChartAssetName removes evaluation-time bond instance tail", () => {
    expect(
      recurrentBondAssetNameToChartAssetName(`MyBondApr24${generatedRecurrence}2025`),
    ).toBe("MyBond");
    expect(recurrentBondAssetNameToChartAssetName("PlainBond")).toBe("PlainBond");
    expect(
      recurrentBondAssetNameToChartAssetName(`NoDateSuffix${generatedRecurrence}2025`),
    ).toBe(`NoDateSuffix${generatedRecurrence}2025`);
  });

  it("chartAssetNameFromAssetName maps DCP family assets to chartAsset name", () => {
    expect(chartAssetNameFromAssetName(`${pensionPrefix}WorkDC`)).toBe("WorkDC");
    expect(chartAssetNameFromAssetName(`${taxFree}WorkDC`)).toBe("WorkDC");
    expect(
      chartAssetNameFromAssetName(`${crystallizedPension}IncomeTaxJoe${dot}WorkDC`),
    ).toBe("WorkDC");
  });

  it("getNameForChart maps recurrent bond instances to chartAsset name", () => {
    const model: ModelData = {
      assets: [
        {
          NAME: `RollBondJan25${generatedRecurrence}2025`,
          ERA: 0,
          START: "",
          VALUE: "0",
          QUANTITY: "",
          GROWTH: "",
          CPI_IMMUNE: true,
          CAN_BE_NEGATIVE: false,
          IS_A_DEBT: false,
          LIABILITY: "",
          PURCHASE_PRICE: "0",
          CATEGORY: "c",
        },
        {
          NAME: `RollBondFeb25${generatedRecurrence}2026`,
          ERA: 0,
          START: "",
          VALUE: "0",
          QUANTITY: "",
          GROWTH: "",
          CPI_IMMUNE: true,
          CAN_BE_NEGATIVE: false,
          IS_A_DEBT: false,
          LIABILITY: "",
          PURCHASE_PRICE: "0",
          CATEGORY: "c",
        },
      ],
    } as unknown as ModelData;

    expect(getNameForChart(`RollBondJan25${generatedRecurrence}2025`, model)).toBe(
      "RollBond",
    );
    expect(getNameForChart(`RollBondFeb25${generatedRecurrence}2026`, model)).toBe(
      "RollBond",
    );
  });
});
