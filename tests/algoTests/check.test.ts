import { simpleSetting } from "../../models/exampleSettings";
import { getMinimalModelCopy } from "../../models/minimalModel";
import { defaultModelSettings, getTestModel } from "../../models/testModel";
import {
  adjustableType,
  bondModel,
  CASH_ASSET_NAME,
  conditional,
  cpi,
  crystallizedPension,
  custom,
  debtChartFocus,
  incomeTax,
  liquidateAsset,
  nationalInsurance,
  payOffDebt,
  revalue,
  revalueAsset,
  revalueDebt,
  revalueExp,
  revalueInc,
  revalueSetting,
  viewFrequency,
  generatorTypeDCPRevalue,
  dcpRevalueBatchCategoryPrefix,
} from "../../localization/stringConstants";
import { expectedDCPRevalueTransactionNamePrefixFromCategory } from "../../models/dcpRevalueExpand";
import {
  checkModel,
  isValidValue,
  checkAsset,
  checkIncomeLiability,
  checkIncome,
  checkExpense,
  checkTrigger,
  checkSettings,
  checkTransaction,
  checkGenerator,
  resolveNumericSettingValue,
} from "../../models/checks";
import { processGenerators } from "../../models/evaluations";
import {
  emptyModel,
  simpleAsset,
  simpleIncome,
  definedBenefitsPension,
  simpleExpense,
  simpleTransaction,
} from "../../models/exampleModels";
import { Generator, ModelData } from "../../types/interfaces";
import { log, suppressLogs, unSuppressLogs } from "../../utils/utils";

log;

describe("checks tests", () => {
  it("check asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: "savings",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
          LIABILITY: "nonsense",
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    expect(checkModel(model).message).toEqual(
      `Asset 'savings' liability 'nonsense' should end with (CGT) or (incomeTax)`,
    );
    suppressLogs();
    expect(isValidValue("", model)).toBe(false);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
          LIABILITY: "nonsense",
        },
        model,
      ),
    ).toEqual("Asset name should be not empty");
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a/b",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "12",
          LIABILITY: "nonsense",
        },
        model,
      ),
    ).toEqual(`Asset 'a/b' should not contain '/'`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          START: "January 1 2018",
          VALUE: "500",
          GROWTH: "",
          LIABILITY: "",
        },
        model,
      ),
    ).toEqual(`Asset 'a' growth set to ''
        but no corresponding setting found`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          START: "January 1 2018",
          VALUE: "cpi", // something that is not a number directly
          QUANTITY: "3",
          GROWTH: "0.1",
        },
        model,
      ),
    ).toEqual(`Asset 'a' value 'cpi' may not have nonzero growth`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          START: "January 1 2018",
          VALUE: "cpi", // something that is not a number directly
          QUANTITY: "3",
          CPI_IMMUNE: false,
        },
        model,
      ),
    ).toEqual(`Asset 'a' value 'cpi' may not grow with CPI`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          START: "January 1 2018",
          VALUE: "cpi",
          PURCHASE_PRICE: "nonsense",
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(
      `Asset 'a' purchase price 'nonsense' should be a numerical or setting value`,
    );
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          START: "nonsense",
          VALUE: "500",
          GROWTH: "12",
        },
        model,
      ),
    ).toEqual(`Asset 'a' start date doesn't make sense :
      "nonsense"`);
    model.settings.push({
      ...simpleSetting,
      VALUE: "nonense",
      NAME: "wordSetting",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "wordSetting", // there is a setting called wordSetting with a word-style value
        },
        model,
      ),
    ).toEqual(`Asset 'a' value set to 'wordSetting'
      but no suitable setting evaluation is possible`);
    model.settings.push({
      ...simpleSetting,
      VALUE: "wordSetting",
      NAME: "x",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "x", // there is a setting called x with a value which is another setting
        },
        model,
      ),
    ).toEqual(`Asset 'a' value set to 'x'
      but no suitable setting evaluation is possible`);
    model.settings.push({
      ...simpleSetting,
      VALUE: "10",
      NAME: "ten",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "ten", // can be evaluated
        },
        model,
      ),
    ).toEqual(`Asset 'a' value 'ten' may not grow with CPI`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "ten", // can be evaluated
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");
    model.settings.push({
      ...simpleSetting,
      VALUE: "ten",
      NAME: "tenLevel1",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "tenLevel1", // can be evaluated recursively
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");
    model.settings.push({
      ...simpleSetting,
      VALUE: "tenLevel1",
      NAME: "tenLevel2",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "tenLevel2", // can be evaluated recursively
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");
    model.settings.push({
      ...simpleSetting,
      VALUE: "tenLevel2",
      NAME: "tenLevel3",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "tenLevel3", // can be evaluated recursively
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");
    model.settings.push({
      ...simpleSetting,
      VALUE: "tenLevel3",
      NAME: "tenLevel4",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "tenLevel4", // can be evaluated recursively
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");
    model.settings.push({
      ...simpleSetting,
      VALUE: "tenLevel4",
      NAME: "tenLevel5",
    });
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: "a",
          VALUE: "tenLevel5", // can be evaluated recursively
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual("");

    const model2 = { ...emptyModel };
    model2.settings.push({
      ...simpleSetting,
      VALUE: "monthly",
      NAME: viewFrequency,
    });
    model2.settings.push({
      ...simpleSetting,
      NAME: "Beginning of view range",
      VALUE: "1 Jan 2017",
      HINT: "Date at the start of range to be plotted",
      TYPE: "view",
    });
    model2.settings.push({
      ...simpleSetting,
      NAME: "End of view range",
      VALUE: "1 Jan 2018",
      HINT: "Date at the end of range to be plotted",
      TYPE: "view",
    });
    model2.settings.push({
      ...simpleSetting,
      NAME: cpi,
      VALUE: "0.0",
      HINT: "",
      TYPE: "adjustable",
    });
    expect(checkModel(model2).message).toEqual(
      `"View frequency" setting should not be present`,
    );
    unSuppressLogs();
  });
  it("check income", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2017",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          LIABILITY: "nonsense",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };
    suppressLogs();
    expect(checkIncomeLiability("nonsense")).toEqual(
      `liability 'nonsense' should end with ` +
        `'${incomeTax}' or '${nationalInsurance}'`,
    );
    expect(checkIncomeLiability("")).toEqual("");
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "",
        },
        model,
      ),
    ).toEqual("Income name needs some characters");
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a/b/c/d",
        },
        model,
      ),
    ).toEqual(
      `Income liability for 'a' has parts 'a,b,c,d' ` +
        `but should contain at most three parts`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a/b/c",
        },
        model,
      ),
    ).toEqual(
      `Income liability for 'a' has parts 'a,b,c' ` +
        `but the part 'a' should end with ` +
        `'${incomeTax}' or '${nationalInsurance}'`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a(NI)/b/c",
        },
        model,
      ),
    ).toEqual(
      `Income liability for 'a' has parts 'a(NI),b,c' ` +
        `but the part 'b' should end with ` +
        `'${incomeTax}' or '${nationalInsurance}'`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a(NI)",
        },
        model,
      ),
    ).toEqual("");
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a(NI)/a(incomeTax)",
        },
        model,
      ),
    ).toEqual("");
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a(NI)/b(incomeTax)",
        },
        model,
      ),
    ).toEqual(
      `Income liability for 'a' has parts 'a(NI),b(incomeTax)' ` +
        `but it should be the same person liable for NI and income tax'`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE: "nonsense",
        },
        model,
      ),
    ).toEqual(`Income 'a' value 'nonsense' does not make sense`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE: "x", // a setting-resolvable value may now grow with CPI
          CPI_IMMUNE: false,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE: "x",
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE: "2x",
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE: CASH_ASSET_NAME, // an asset name: not setting-resolvable
          CPI_IMMUNE: false, // a non-setting value still may not grow with CPI
        },
        model,
      ),
    ).toEqual(`Income 'a' value 'Cash' may not grow with CPI`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          START: "nonsense",
        },
        model,
      ),
    ).toEqual(`Income 'a' start date doesn't make sense : \"nonsense\"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE_SET: "1 Jan 1970",
          START: "1 Jan 1970",
        },
        model,
      ),
    ).toEqual(
      `Income 'a' start date must be after cash starts; 01 Jan 1970 is before 01 Jan 2017`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE_SET: "nonsense",
        },
        model,
      ),
    ).toEqual(`Income 'a' value set date doesn't make sense : "nonsense"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          END: "nonsense",
        },
        model,
      ),
    ).toEqual(`Income 'a' end date doesn't make sense : "nonsense"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          VALUE_SET: "1 Jan 2021",
          START: "1 Jan 2020",
        },
        model,
      ),
    )
      .toEqual(`Income 'a' value must be set on or before the start of the income.
      Start is 01 Jan 2020 and
      value is set 01 Jan 2021.`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          RECURRENCE: "nonsense",
        },
        model,
      ),
    ).toEqual(`Income 'NoName' recurrence 'nonsense' must end in w, m or y`);

    model.assets.push({
      ...simpleAsset,
      NAME: "TaxPot",
    });
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: "a",
          LIABILITY: "a(NI)",
        },
        model,
      ),
    ).toEqual(`We don't need taxPot any more`);

    unSuppressLogs();
  });

  it("check transaction", () => {
    const model = getTestModel(definedBenefitsPension);

    suppressLogs();
    expect(checkModel(model).message).toEqual(``);
    model.transactions[0].RECURRENCE = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' recurrence ` +
        `'nonsense' must end in w, m or y`,
    );
    model.transactions[0].RECURRENCE = "am";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' recurrence ` +
        `'am' must be a number ending in w, m or y`,
    );
    model.transactions[0].RECURRENCE = "2m";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' is not in a ` +
        `recognised auto-generated format`,
    );
    model.transactions[0].RECURRENCE = "";
    expect(checkModel(model).message).toEqual(``);

    const oldStop = model.transactions[0].STOP_DATE;
    model.transactions[0].STOP_DATE = "junk";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme'  has bad stop date : "junk"`,
    );
    model.transactions[0].STOP_DATE = oldStop;

    model.transactions[2].RECURRENCE = "2m";
    expect(checkModel(model).message).toEqual(
      `Pension transaction '-PDB TeachersPensionScheme' gets frequency from income, should not have recurrence '2m' defined`,
    );
    model.transactions[2].RECURRENCE = "";
    expect(checkModel(model).message).toEqual(``);

    model.transactions[0].FROM_VALUE = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' 'from' value must be numbers ` +
        `or a setting, not 'nonsense'`,
    );
    model.transactions[0].FROM_VALUE = "1.0";
    expect(checkModel(model).message).toEqual(``);

    let oldName = model.transactions[0].NAME;
    model.transactions[0].NAME = "";
    expect(checkModel(model).message).toEqual(
      `Transaction name needs some characters`,
    );
    model.transactions[0].NAME = oldName;
    expect(checkModel(model).message).toEqual(``);

    oldName = model.transactions[1].NAME;
    model.transactions[1].NAME = `${conditional}nonsense`;
    expect(checkModel(model).message).toEqual(
      `Conditional Transaction 'Conditionalnonsense'  needs a 'To' asset defined`,
    );
    model.transactions[1].NAME = oldName;
    expect(checkModel(model).message).toEqual(``);

    oldName = model.transactions[2].NAME;
    model.transactions[2].NAME = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction 'nonsense' from unrecognised asset (could be typo or before asset start date?) : \"TeachingJob\"`,
    );
    model.transactions[2].NAME = oldName;

    const oldType = model.transactions[0].TYPE;
    oldName = model.transactions[0].NAME;
    model.transactions[0].TYPE = revalueDebt;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' revalue debt type not in a recognised format`,
    );
    model.transactions[0].NAME = `${revalue} ${oldName}`;
    expect(checkModel(model).message).toEqual(
      `Transaction ' -PT TeachersPensionScheme' from unrecognised asset (could be typo or before asset start date?) : \"-PDB TeachersPensionScheme\"`,
    );
    model.transactions[0].NAME = oldName;
    model.transactions[0].TYPE = revalueAsset;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' revalue asset type of not in a recognised format`,
    );
    model.transactions[0].TYPE = revalueInc;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' revalue income type not in a recognised format`,
    );
    model.transactions[0].TYPE = revalueExp;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' revalue expense type not in a recognised format`,
    );
    model.transactions[0].TYPE = revalueSetting;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' revalue setting type not in a recognised format`,
    );
    model.transactions[0].TYPE = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' type  nonsense for -PT TeachersPensionScheme ` +
        `is not one of allowed types - internal bug`,
    );
    model.transactions[0].TYPE = liquidateAsset;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' has liquidating type not in a recognised format`,
    );
    model.transactions[0].TYPE = payOffDebt;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' has payoff debt type not in a recognised format`,
    );
    const oldFrom = model.transactions[0].FROM;
    model.transactions[0].FROM = CASH_ASSET_NAME;
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' has payoff debt type not in a recognised format`,
    );
    model.transactions[0].FROM = oldFrom;
    model.transactions[0].TYPE = oldType;

    const oldDate = model.transactions[0].DATE;
    model.transactions[0].DATE = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme'  has bad date : \"nonsense\"`,
    );
    model.transactions[0].DATE = oldDate;

    const oldFromValue = model.transactions[0].FROM_VALUE;
    model.transactions[0].FROM_VALUE = "";
    expect(checkModel(model).message).toEqual(
      `Transaction from -PDB TeachersPensionScheme needs a non-empty from value`,
    );
    model.transactions[0].FROM_VALUE = oldFromValue;

    const oldTo = model.transactions[0].TO;
    model.transactions[0].TO = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme to unrecognised thing : nonsense`,
    );
    model.transactions[0].TO = oldTo;

    model.assets.push({
      ...simpleAsset,
      NAME: "a",
      START: "1 Jan 2019",
      CATEGORY: "cat",
    });

    model.transactions[0].TO = "cat";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme to unrecognised thing : cat`,
    );
    model.transactions[0].TO = oldTo;

    const oldToValue = model.transactions[0].TO_VALUE;
    model.transactions[0].TO_VALUE = "";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' needs a non-empty to value`,
    );
    model.transactions[0].TO_VALUE = "nonsense";
    expect(checkModel(model).message).toEqual(
      `Transaction '-PT TeachersPensionScheme' to value 'nonsense' isn't a number or setting`,
    );
    model.transactions[0].TO_VALUE = oldToValue;

    expect(checkModel(model).message).toEqual(``);

    const model2 = getMinimalModelCopy();
    model2.assets.push({
      ...simpleAsset,
      NAME: "a",
      START: "1 Jan 2019",
    });
    model2.assets.push({
      ...simpleAsset,
      NAME: "d",
      START: "1 Jan 2019",
      IS_A_DEBT: true,
    });
    model2.incomes.push({
      ...simpleIncome,
      NAME: "i",
      START: "1 Jan 2019",
    });
    model2.expenses.push({
      ...simpleExpense,
      NAME: "e",
      START: "1 Jan 2019",
      END: "1 Jan 2020",
    });
    model2.settings.push({
      ...simpleSetting,
      NAME: "s",
      VALUE: "val",
    });
    model2.transactions.push({
      ...simpleTransaction,
      NAME: "t",
      DATE: "1 Jan 2018",
    });
    expect(checkModel(model2).message).toEqual(``);
    model2.transactions[0].TO = "a";
    expect(checkModel(model2).message).toEqual(
      `Transaction 't' dated before start of affected asset : 'a'`,
    );
    model2.transactions[0].TO = "i";
    expect(checkModel(model2).message).toEqual(
      `Transaction 't' to an income must begin 'Revalue' or '-PDB  or -PT `,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkModel(model2).message).toEqual(
      `Transaction 'Revaluet' dated before start of affected income : 'i'`,
    );
    model2.transactions[0].NAME = `t`;
    model2.transactions[0].TO = "e";
    expect(checkModel(model2).message).toEqual(
      `Transaction 't' to an expense must begin 'Revalue'`,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkModel(model2).message).toEqual(
      `Transaction 'Revaluet' dated before start of affected expense : 'e'`,
    );
    model2.transactions[0].DATE = `1 Jan 2021`;
    expect(checkModel(model2).message).toEqual(
      `Transaction 'Revaluet' dated after end of affected expense : 'e'`,
    );
    model2.transactions[0].NAME = `t`;
    model2.transactions[0].TO = "s";
    expect(checkModel(model2).message).toEqual(
      `Transaction 't' to a setting must begin 'Revalue'`,
    );
    model2.transactions[0].TO = "d";
    model2.transactions[0].TYPE = revalueDebt;
    expect(checkModel(model2).message).toEqual(
      `Transaction 't' revalue debt type not in a recognised format`,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkModel(model2).message).toEqual(``);

    model2.transactions[0].TYPE = custom;

    model2.incomes[0].NAME = "";
    expect(checkModel(model2).message).toEqual(
      `Income name needs some characters`,
    );
    model2.incomes[0].NAME = "i";

    model2.expenses[0].NAME = "";
    expect(checkModel(model2).message).toEqual(
      `Expense name needs some characters`,
    );
    model2.expenses[0].NAME = "e";

    const preName = model2.name;
    model2.name = "";
    expect(checkModel(model2).message).toEqual(`model name = ''`);
    model2.name = preName;

    expect(checkModel(model2).message).toEqual(``);

    unSuppressLogs();
  });
  it("check expense", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "April 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2017",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          LIABILITY: "nonsense",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: "x",
          ERA: undefined,
          VALUE: "1.00",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
        {
          NAME: "A",
          ERA: undefined,
          VALUE: "0",
          HINT: "growthValue",
          TYPE: adjustableType,
        },
      ],
    };
    suppressLogs();
    expect(
      checkExpense(
        {
          ...simpleExpense,
          NAME: "",
        },
        model,
      ),
    ).toEqual("Expense name needs some characters");
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: "nonsense",
        },
        model,
      ),
    ).toEqual(`Expense 'NoName' value 'nonsense' is not a number`);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: "x", // this is a setting name
          CPI_IMMUNE: true, // defined by setting => OK as long as doesn't grow by CPI
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          NAME: "Run car",
          VALUE: "A+700+A",
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: "2x", // this is a setting name
          CPI_IMMUNE: true, // defined by setting => OK as long as doesn't grow by CPI
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: "x", // this is a setting name
          CPI_IMMUNE: false, // a setting-resolvable value may now grow with CPI
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: CASH_ASSET_NAME, // an asset name: not setting-resolvable
          CPI_IMMUNE: false, // a non-setting value still may not grow with CPI
        },
        model,
      ),
    ).toEqual(`Expense 'NoName' value 'Cash' may not grow with CPI`);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          START: "nonsense",
        },
        model,
      ),
    ).toEqual(
      `Expense 'NoName' start date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE_SET: "nonsense",
        },
        model,
      ),
    ).toEqual(
      `Expense 'NoName' value set date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          END: "nonsense",
        },
        model,
      ),
    ).toEqual(
      `Expense 'NoName' end date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE_SET: "1 Jan 2018",
          START: "1 Jan 2017",
        },
        model,
      ),
    ).toEqual(
      `Expense 'NoName' value must be set on or before the start of the income.
      Start is 01 Jan 2017 and
      value is set 01 Jan 2018.`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          RECURRENCE: "nonsense",
        },
        model,
      ),
    ).toEqual(`Expense 'NoName' recurrence 'nonsense' must end in w, m or y`);

    unSuppressLogs();
  });
  it("check trigger", () => {
    const model = getMinimalModelCopy();
    expect(
      checkTrigger(
        {
          NAME: "",
          ERA: undefined,
          DATE: "1 Jan 2018",
        },
        model,
      ),
    ).toEqual("Date name needs some characters");
    expect(
      checkTrigger(
        {
          NAME: "today",
          ERA: undefined,
          DATE: "1 Jan 2018",
        },
        model,
      ),
    ).toEqual(`Date today name prohibited as a special word`);
    expect(
      checkTrigger(
        {
          NAME: "zzz",
          ERA: undefined,
          DATE: "nonsense",
        },
        model,
      ),
    ).toEqual(`Date 'zzz' is not valid : 'nonsense'`);
  });

  it("has proportional transaction blocked for string-valued asset", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Sell all Stff",
          FROM: "Stff",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "MyCa",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Stff",
          START: "January 2 2018",
          VALUE: "222",
          GROWTH: "12",
        },
        {
          ...simpleAsset,
          NAME: "MyCa",
          START: "January 1 2018",
          VALUE: "MyCarValue",
          GROWTH: "12",
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "MyCarValue",
          VALUE: "10",
        },
      ],
    };

    suppressLogs();

    expect(checkModel(model).message).toEqual(
      `Transaction 'Sell all Stff we dont allow a proportional ` +
        `transaction to a word-valued asset`,
    );

    unSuppressLogs();
  });

  it("allows proportional transaction to asset with binary expression value", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "VanPurchaseFunds",
          FROM: "Van",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "Cash",
          TO_ABSOLUTE: false,
          TO_VALUE: "1",
          DATE: "January 3 2018",
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: "Van",
          START: "January 2 2018",
          VALUE: "1000",
          GROWTH: "0",
        },
        {
          ...simpleAsset,
          NAME: "Cash",
          START: "January 1 2018",
          VALUE: "222+X",
          GROWTH: "0",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "X",
          VALUE: "10",
        },
      ],
    };

    expect(checkModel(model).message).toEqual("");
  });

  it("has proportional transaction blocked for string-valued income", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue PRound",
          FROM: "",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "PRound",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          NAME: "PRound",
          START: "January 2 2018",
          VALUE: "PRoundValue",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "PRoundValue",
          VALUE: "10",
        },
      ],
    };

    suppressLogs();

    expect(checkModel(model).message).toEqual(
      `Transaction 'Revalue PRound don't allow a proportional ` +
        `transaction to a word-valued income`,
    );

    unSuppressLogs();
  });
  it("has proportional transaction blocked for string-valued expense", () => {
    const roi = {
      start: "Dec 1, 2017 00:00:00",
      end: "March 1, 2018 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Revalue Dogs",
          FROM: "",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "Dogs",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.5",
          DATE: "January 3 2018",
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          NAME: "Dogs",
          START: "January 2 2018",
          END: "January 4 2018",
          VALUE: "DogsValue",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: "DogsValue",
          VALUE: "10",
        },
      ],
    };

    suppressLogs();

    expect(checkModel(model).message).toEqual(
      `Transaction 'Revalue Dogs don't allow a proportional ` +
        `transaction to a word-valued expense`,
    );

    unSuppressLogs();
  });

  it("accepts income value with scaled setting One suffix", () => {
    const roi = {
      start: "Dec 1, 2018 00:00:00",
      end: "March 1, 2019 00:00:00",
    };
    const model: ModelData = {
      ...emptyModel,
      incomes: [
        {
          ...simpleIncome,
          START: "January 1 2019",
          END: "July 1 2019",
          NAME: "PRnd",
          VALUE: "2xOne",
          VALUE_SET: "January 1 2018",
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        { ...simpleSetting, NAME: "x", VALUE: "5" },
        { ...simpleSetting, NAME: "One", VALUE: "1" },
      ],
    };
    expect(isValidValue("2xOne", model)).toBe(true);
    expect(checkIncome(model.incomes[0], model)).toBe("");
  });

  it('notices whitespace in settings values', () => {
    {
    const model = getMinimalModelCopy();
    model.settings.push({
      VALUE: " 111",
      HINT: "",
      TYPE: "",
      NAME: "startsWithSpace",
      ERA: undefined
    });
    const checkResponse = checkSettings(
      model,
    );
    expect(checkResponse?.message).toEqual("Setting value for startsWithSpace begins with a space");
    }
    {
    const model = getMinimalModelCopy();
    model.settings.push({
      VALUE: "111 ",
      HINT: "",
      TYPE: "",
      NAME: "endsWithSpace",
      ERA: undefined
    });
    const checkResponse = checkSettings(
      model,
    );
    expect(checkResponse?.message).toEqual("Setting value for endsWithSpace ends with a space");
    }

    {
      const model = getMinimalModelCopy();
      const message = checkTransaction({
        FROM: "",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: "cpi",
        TO_ABSOLUTE: true,
        TO_VALUE: "222 ",
        DATE: "1 Jan 2024",
        STOP_DATE: "",
        RECURRENCE: "",
        TYPE: revalueSetting,
        CATEGORY: "",
        NAME: "Revaluecpi 99",
        ERA: undefined
      }, model);
      expect(message).toEqual("Transaction 'cpi 99' revalues to something ending with whitespace");
      }

      {
        const model = getMinimalModelCopy();
        const message = checkTransaction({
          FROM: "",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: "cpi",
          TO_ABSOLUTE: true,
          TO_VALUE: " 222",
          DATE: "1 Jan 2024",
          STOP_DATE: "",
          RECURRENCE: "",
          TYPE: revalueSetting,
          CATEGORY: "",
          NAME: "Revaluecpi 99",
          ERA: undefined
        }, model);
        expect(message).toEqual("Transaction 'cpi 99' revalues to something beginning with whitespace");
        }
  });

  it("checkSettings rejects setting values that reference missing settings (numeric expression)", () => {
    const model = getMinimalModelCopy();
    model.settings.push({
      ...simpleSetting,
      NAME: "s2",
      VALUE: "2apple",
      TYPE: adjustableType,
      ERA: 0,
    });
    const checkResponse = checkSettings(model);
    expect(checkResponse?.message).toEqual(
      `Setting 's2' has value '2apple' that does not ` +
        `resolve to a number (missing or non-numeric setting reference)`,
    );

    model.settings.push({
      ...simpleSetting,
      NAME: "apple",
      VALUE: "3",
      TYPE: adjustableType,
      ERA: 0,
    });
    expect(checkSettings(model)).toBeUndefined();
  });

  it("checkSettings rejects binary setting values that reference missing settings", () => {
    const model = getMinimalModelCopy();
    model.settings.push({
      ...simpleSetting,
      NAME: "s3",
      VALUE: "x + apple",
      TYPE: adjustableType,
      ERA: 0,
    });
    model.settings.push({
      ...simpleSetting,
      NAME: "x",
      VALUE: "5",
      TYPE: adjustableType,
      ERA: 0,
    });
    const checkResponse = checkSettings(model);
    expect(checkResponse?.message).toEqual(
      `Setting 's3' has value 'x + apple' that does not ` +
        `resolve to a number (missing or non-numeric setting reference)`,
    );

    model.settings.push({
      ...simpleSetting,
      NAME: "apple",
      VALUE: "3",
      TYPE: adjustableType,
      ERA: 0,
    });
    expect(checkSettings(model)).toBeUndefined();
  });

  it("DCP withdrawal generator accepts setting names for VALUE and tax-free prop", () => {
    const model = getMinimalModelCopy();
    model.settings.push({
      NAME: "wAmount",
      VALUE: "5000",
      HINT: "",
      TYPE: "adjustable",
      ERA: 0,
    });
    model.settings.push({
      NAME: "tfProp",
      VALUE: "0.25",
      HINT: "",
      TYPE: "adjustable",
      ERA: 0,
    });
    const dcDetails = {
      VALUE: "1",
      GROWS_WITH_CPI: "n",
      GROWTH: "0",
      TAX_LIABILITY: "Joe(incomeTax)",
      CATEGORY: "",
      START: "01 Jan 2025",
      STOP: "",
      CRYSTALLIZE: "01 Jan 2030",
      SS: "n",
      INCOME_SOURCE: "",
      CONTRIBUTION_AMOUNT: "",
      EMP_CONTRIBUTION_AMOUNT: "",
      TRANSFER_TO: "",
      TRANSFER_DATE: "",
    };
    model.generators.push({
      NAME: "Pension1",
      TYPE: "Defined Contributions",
      ERA: 0,
      DETAILS: dcDetails,
    });
    const withdrawalGen: Generator = {
      NAME: "pull",
      TYPE: "DCPWithdrawal",
      ERA: 0,
      DETAILS: {
        FROM: "Pension1",
        TO: CASH_ASSET_NAME,
        DATE: "01 Jan 2026",
        VALUE: "wAmount",
        TAX_FREE_PROP: "tfProp",
        RECURRENCE: "",
        RECURRENCE_STOP: "",
      },
    };
    expect(checkGenerator(withdrawalGen, model)).toBe("");
    expect(resolveNumericSettingValue("wAmount", model)).toBe(5000);
    expect(resolveNumericSettingValue("tfProp", model)).toBe(0.25);
  });

  it("processGenerators resolves DCP withdrawal VALUE and tax-free prop from settings", () => {
    const model = getMinimalModelCopy();
    model.name = "temporary copy";
    model.settings.push({
      NAME: "wAmount",
      VALUE: "5000",
      HINT: "",
      TYPE: "adjustable",
      ERA: 0,
    });
    model.settings.push({
      NAME: "tfProp",
      VALUE: "0.25",
      HINT: "",
      TYPE: "adjustable",
      ERA: 0,
    });
    const dcDetails = {
      VALUE: "1",
      GROWS_WITH_CPI: "n",
      GROWTH: "0",
      TAX_LIABILITY: "Joe(incomeTax)",
      CATEGORY: "",
      START: "01 Jan 2025",
      STOP: "",
      CRYSTALLIZE: "01 Jan 2030",
      SS: "n",
      INCOME_SOURCE: "",
      CONTRIBUTION_AMOUNT: "",
      EMP_CONTRIBUTION_AMOUNT: "",
      TRANSFER_TO: "",
      TRANSFER_DATE: "",
    };
    model.generators.push({
      NAME: "Pension1",
      TYPE: "Defined Contributions",
      ERA: 0,
      DETAILS: dcDetails,
    });
    model.generators.push({
      NAME: "pull",
      TYPE: "DCPWithdrawal",
      ERA: 0,
      DETAILS: {
        FROM: "Pension1",
        TO: CASH_ASSET_NAME,
        DATE: "01 Jan 2026",
        VALUE: "wAmount",
        TAX_FREE_PROP: "tfProp",
        RECURRENCE: "",
        RECURRENCE_STOP: "",
      },
    });
    expect(processGenerators(model)).toBe("");
  });

  it("DCP withdrawal generator rejects multiplied setting syntax in VALUE", () => {
    const model = getMinimalModelCopy();
    model.settings.push({
      NAME: "Apple",
      VALUE: "10",
      HINT: "",
      TYPE: "adjustable",
      ERA: 0,
    });
    const dcDetails = {
      VALUE: "1",
      GROWS_WITH_CPI: "n",
      GROWTH: "0",
      TAX_LIABILITY: "Joe(incomeTax)",
      CATEGORY: "",
      START: "01 Jan 2025",
      STOP: "",
      CRYSTALLIZE: "01 Jan 2030",
      SS: "n",
      INCOME_SOURCE: "",
      CONTRIBUTION_AMOUNT: "",
      EMP_CONTRIBUTION_AMOUNT: "",
      TRANSFER_TO: "",
      TRANSFER_DATE: "",
    };
    model.generators.push({
      NAME: "Pension1",
      TYPE: "Defined Contributions",
      ERA: 0,
      DETAILS: dcDetails,
    });
    const withdrawalGen: Generator = {
      NAME: "pull",
      TYPE: "DCPWithdrawal",
      ERA: 0,
      DETAILS: {
        FROM: "Pension1",
        TO: CASH_ASSET_NAME,
        DATE: "01 Jan 2026",
        VALUE: "2Apple",
        TAX_FREE_PROP: "0.25",
        RECURRENCE: "",
        RECURRENCE_STOP: "",
      },
    };
    expect(checkGenerator(withdrawalGen, model)).toContain(
      "should not include a leading multiplier",
    );
  });

  it("DCP revalue generator rejects missing Defined Contributions FROM", () => {
    const model = getMinimalModelCopy();
    const revGen: Generator = {
      NAME: "rev1",
      TYPE: generatorTypeDCPRevalue,
      ERA: 0,
      DETAILS: {
        FROM: "MissingPension",
        DATE: "01 Jan 2027",
        VALUE: "30000",
      },
    };
    expect(checkGenerator(revGen, model)).toContain(
      "no matching Defined Contributions",
    );
  });

  it("DCP batch transaction NAME prefix is derived from category for sibling matching", () => {
    expect(
      expectedDCPRevalueTransactionNamePrefixFromCategory(
        `${dcpRevalueBatchCategoryPrefix}rev1`,
      ),
    ).toBe(`${revalue}rev1 `);
    expect(
      expectedDCPRevalueTransactionNamePrefixFromCategory("not a batch category"),
    ).toBeUndefined();
    expect(
      expectedDCPRevalueTransactionNamePrefixFromCategory(
        dcpRevalueBatchCategoryPrefix,
      ),
    ).toBeUndefined();
  });

  it("DCP revalue generator checks and expands via processGenerators", () => {
    const model = getMinimalModelCopy();
    model.name = "temporary copy";
    const dcDetails = {
      VALUE: "10000",
      GROWS_WITH_CPI: "n",
      GROWTH: "0",
      TAX_LIABILITY: "Joe(incomeTax)",
      CATEGORY: "",
      START: "01 Jan 2025",
      STOP: "",
      CRYSTALLIZE: "01 Jan 2030",
      SS: "n",
      INCOME_SOURCE: "",
      CONTRIBUTION_AMOUNT: "",
      EMP_CONTRIBUTION_AMOUNT: "",
      TRANSFER_TO: "",
      TRANSFER_DATE: "",
    };
    model.generators.push({
      NAME: "Pension1",
      TYPE: "Defined Contributions",
      ERA: 0,
      DETAILS: dcDetails,
    });
    const revGen: Generator = {
      NAME: "rev1",
      TYPE: generatorTypeDCPRevalue,
      ERA: 0,
      DETAILS: {
        FROM: "Pension1",
        DATE: "01 Jan 2027",
        VALUE: "30000",
      },
    };
    expect(checkGenerator(revGen, model)).toBe("");
    model.generators.push(revGen);
    expect(processGenerators(model)).toBe("");
    const revals = model.transactions.filter((t) => {
      return (
        t.TYPE === revalueAsset &&
        t.CATEGORY.startsWith(dcpRevalueBatchCategoryPrefix)
      );
    });
    expect(revals.length).toBe(3);
  });
});
