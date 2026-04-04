import {
  getYearOfTaxYear,
  momentType,
  sortByDate,
} from "../../models/evaluations";
import {
  CASH_ASSET_NAME,
  conditional,
} from "../../localization/stringConstants";
import { DatedThing } from "../../types/interfaces";
import { makeDateFromString } from "../../utils/utils";

describe("sortByDate", () => {
  it("should sort empty list", () => {
    const arr: DatedThing[] = [];
    sortByDate(arr);
    expect(arr.length).toBe(0);
  });

  it("should sort list length 1", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const arr = [x1];
    sortByDate(arr);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(x1);
  });

  it("later Date comes first", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 3, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("later Date prioritised over name (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 3, 2018 00:00:00"),
      name: "B",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("later Date prioritised over name (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "B",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 3, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });
  it("later Date prioritised over type (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 3, 2018 00:00:00"),
      name: "A",
      type: "Y",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });
  it("later Date prioritised over type (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "Y",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 3, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("later name comes first", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "B",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("later name prioritised over type (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "B",
      type: "Y",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });
  it("later name prioritised over type (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "Y",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "B",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });
  it("later type comes first", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "Y",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("CASH assets come last (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: CASH_ASSET_NAME,
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "A",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("CASH assets come last (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: CASH_ASSET_NAME,
      type: "X",
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "Z",
      type: "X",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("Asset starts come last (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.assetStart,
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: "A",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("Asset starts come last (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.assetStart,
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: "Z",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("AssetStarts come after Assets", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.assetStart,
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.asset,
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("Assets come last (1)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.asset,
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: "A",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("Assets come last (2)", () => {
    const x1: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: momentType.asset,
    };
    const x2: DatedThing = {
      date: makeDateFromString("May 2, 2018 00:00:00"),
      name: "X",
      type: "Z",
    };
    const arr1 = [x1, x2];
    sortByDate(arr1);
    const arr2 = [x2, x1];
    sortByDate(arr2);
    expect(arr1.length).toBe(2);
    expect(arr1[0]).toBe(x2);
    expect(arr1[1]).toBe(x1);
    expect(arr2.length).toBe(2);
    expect(arr2[0]).toBe(x2);
    expect(arr2[1]).toBe(x1);
  });

  it("conditional transactions sort before same-date non-transaction moments (run later via pop)", () => {
    const d = makeDateFromString("May 2, 2018 00:00:00");
    const expense: DatedThing = {
      date: d,
      name: "Rent",
      type: momentType.expense,
    };
    const condTxn: DatedThing = {
      date: d,
      name: `${conditional} top up cash`,
      type: momentType.transaction,
    };
    const arr1 = [expense, condTxn];
    sortByDate(arr1);
    const arr2 = [condTxn, expense];
    sortByDate(arr2);
    expect(arr1[0]).toBe(condTxn);
    expect(arr1[1]).toBe(expense);
    expect(arr2[0]).toBe(condTxn);
    expect(arr2[1]).toBe(expense);
  });

  it("two conditional transactions at same instant: alphabetical execution order (smaller name first via pop)", () => {
    const d = makeDateFromString("May 2, 2018 00:00:00");
    const condB: DatedThing = {
      date: d,
      name: `${conditional}B`,
      type: momentType.transaction,
    };
    const condA: DatedThing = {
      date: d,
      name: `${conditional}A`,
      type: momentType.transaction,
    };
    const arr1 = [condA, condB];
    sortByDate(arr1);
    const arr2 = [condB, condA];
    sortByDate(arr2);
    expect(arr1[0]).toBe(condB);
    expect(arr1[1]).toBe(condA);
    expect(arr2[0]).toBe(condB);
    expect(arr2[1]).toBe(condA);
  });
});

describe("getYearOfTaxYear", () => {
  it("should handle early dates", () => {
    const d = makeDateFromString("Jan 2, 2018 00:00:00");
    expect(getYearOfTaxYear(d)).toBe(2017);
  });
  it("should handle early April dates", () => {
    const d = makeDateFromString("April 5, 2018 00:00:00");
    expect(getYearOfTaxYear(d)).toBe(2017);
  });
  it("should handle late April dates", () => {
    const d = makeDateFromString("April 6, 2018 00:00:00");
    expect(getYearOfTaxYear(d)).toBe(2018);
  });
  it("should handle late dates", () => {
    const d = makeDateFromString("December 6, 2018 00:00:00");
    expect(getYearOfTaxYear(d)).toBe(2018);
  });
});
