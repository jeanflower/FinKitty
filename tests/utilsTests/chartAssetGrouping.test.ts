import { generatedRecurrence } from "../../localization/stringConstants";
import { getNameForChart } from "../../utils/viewUtils";
import { stripRecurrentBondInstanceSuffix } from "../../utils/chartAssetGrouping";
import { ModelData } from "../../types/interfaces";

describe("chartAssetGrouping", () => {
  it("stripRecurrentBondInstanceSuffix removes evaluation-time bond instance tail", () => {
    expect(stripRecurrentBondInstanceSuffix(`MyBondApr24${generatedRecurrence}2025`)).toBe(
      "MyBond",
    );
    expect(stripRecurrentBondInstanceSuffix("PlainBond")).toBe("PlainBond");
    expect(stripRecurrentBondInstanceSuffix(`NoDateSuffix${generatedRecurrence}2025`)).toBe(
      `NoDateSuffix${generatedRecurrence}2025`,
    );
  });

  it("getNameForChart maps recurrent bond instances to generator name", () => {
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
