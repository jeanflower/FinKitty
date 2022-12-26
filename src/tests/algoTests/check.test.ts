import {
  adjustableType,
  bondInvest,
  bondModel,
  CASH_ASSET_NAME,
  conditional,
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
  taxChartFocusType,
} from '../../localization/stringConstants';
import {
  checkData,
  isValidValue,
  checkAsset,
  checkIncomeLiability,
  checkIncome,
  checkExpense,
  checkTrigger,
} from '../../models/checks';
import {
  emptyModel,
  simpleAsset,
  defaultModelSettings,
  simpleIncome,
  getTestModel,
  definedBenefitsPension,
  simpleExpense,
  getMinimalModelCopy,
  simpleTransaction,
  simpleSetting,
} from '../../models/exampleModels';
import { ModelData } from '../../types/interfaces';
import { log, suppressLogs, unSuppressLogs } from '../../utils/utils';

log;

describe('checks tests', () => {
  it('check asset', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'savings',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
          LIABILITY: 'nonsense',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    expect(checkData(model)).toEqual(
      'Asset liability nonsense should end with (CGT) or (incomeTax)',
    );
    suppressLogs();
    expect(isValidValue('', model)).toBe(false);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: '',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
          LIABILITY: 'nonsense',
        },
        model,
      ),
    ).toEqual('Name should be not empty');
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a/b',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '12',
          LIABILITY: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Asset name 'a/b' should not contain '/'`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a',
          START: 'January 1 2018',
          VALUE: '500',
          GROWTH: '',
          LIABILITY: '',
        },
        model,
      ),
    ).toEqual(`Asset growth set to ''
        but no corresponding setting found`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a',
          START: 'January 1 2018',
          VALUE: 'cpi', // something that is not a number directly
          QUANTITY: '3',
          GROWTH: '0.1',
        },
        model,
      ),
    ).toEqual(`Asset value 'cpi' may not have nonzero growth`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a',
          START: 'January 1 2018',
          VALUE: 'cpi', // something that is not a number directly
          QUANTITY: '3',
          CPI_IMMUNE: false,
        },
        model,
      ),
    ).toEqual(`Asset value 'cpi' may not grow with CPI`);
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a',
          START: 'January 1 2018',
          VALUE: 'cpi',
          PURCHASE_PRICE: 'nonsense',
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(
      `Purchase price 'nonsense' should be a numerical or setting value`,
    );
    expect(
      checkAsset(
        {
          ...simpleAsset,
          NAME: 'a',
          START: 'nonsense',
          VALUE: '500',
          GROWTH: '12',
        },
        model,
      ),
    ).toEqual(`Asset start date doesn't make sense :
      "nonsense"`);
    unSuppressLogs();
  });
  it('check income', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: '1 Jan 2017',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          LIABILITY: 'nonsense',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'x',
          FAVOURITE: undefined,
          VALUE: '1.00',
          HINT: 'growthValue',
          TYPE: adjustableType,
        },
      ],
    };
    suppressLogs();
    expect(checkIncomeLiability('nonsense')).toEqual(
      `Income liability 'nonsense' should end with ` +
        `'${incomeTax}' or '${nationalInsurance}'`,
    );
    expect(checkIncomeLiability('')).toEqual('');
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: '',
        },
        model,
      ),
    ).toEqual('Income name needs some characters');
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          LIABILITY: 'a/b/c/d',
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
          NAME: 'a',
          LIABILITY: 'a/b/c',
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
          NAME: 'a',
          LIABILITY: 'a(NI)/b/c',
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
          NAME: 'a',
          LIABILITY: 'a(NI)',
        },
        model,
      ),
    ).toEqual('');
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          LIABILITY: 'a(NI)/a(incomeTax)',
        },
        model,
      ),
    ).toEqual('');
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          LIABILITY: 'a(NI)/b(incomeTax)',
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
          NAME: 'a',
          VALUE: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Income value 'nonsense' does not make sense`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE: 'x',
          CPI_IMMUNE: false,
        },
        model,
      ),
    ).toEqual(`Income value 'x' may not grow with CPI`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE: 'x',
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE: '2x',
          CPI_IMMUNE: true,
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE: 'cpi',
          CPI_IMMUNE: false,
        },
        model,
      ),
    ).toEqual(`Income value 'cpi' may not grow with CPI`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          START: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Income start date doesn't make sense : \"nonsense\"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE_SET: '1 Jan 1970',
          START: '1 Jan 1970',
        },
        model,
      ),
    ).toEqual(
      `Income start date must be after cash starts; 01 Jan 1970 is before 01 Jan 2017`,
    );
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE_SET: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Income value set date doesn't make sense : "nonsense"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          END: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Income end date doesn't make sense : "nonsense"`);
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          VALUE_SET: '1 Jan 2021',
          START: '1 Jan 2020',
        },
        model,
      ),
    ).toEqual(`Income value must be set on or before the start of the income.
      For a, start is 01 Jan 2020 and
      value is set 01 Jan 2021.`);
    model.assets.push({
      ...simpleAsset,
      NAME: 'TaxPot',
    });
    expect(
      checkIncome(
        {
          ...simpleIncome,
          NAME: 'a',
          LIABILITY: 'a(NI)',
        },
        model,
      ),
    ).toEqual(`We don't need taxPot any more`);

    unSuppressLogs();
  });

  it('check transaction', () => {
    const model = getTestModel(definedBenefitsPension);

    suppressLogs();
    expect(checkData(model)).toEqual(``);
    model.transactions[0].RECURRENCE = 'nonsense';
    expect(checkData(model)).toEqual(
      `transaction recurrence 'nonsense' must end in w, m or y`,
    );
    model.transactions[0].RECURRENCE = 'am';
    expect(checkData(model)).toEqual(
      `transaction recurrence 'am' must be a number ending in w, m or y`,
    );
    model.transactions[0].RECURRENCE = '2m';
    expect(checkData(model)).toEqual(
      `autogenerated type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].RECURRENCE = '';
    expect(checkData(model)).toEqual(``);

    model.transactions[2].RECURRENCE = '2m';
    expect(checkData(model)).toEqual(
      `Pension transaction -PDB TeachersPensionScheme gets frequency from income, should not have recurrence 2m defined`,
    );
    model.transactions[2].RECURRENCE = '';

    model.transactions[0].FROM_VALUE = 'nonsense';
    expect(checkData(model)).toEqual(
      `Transaction 'from' value must be numbers or a setting, not nonsense`,
    );
    model.transactions[0].FROM_VALUE = '1.0';

    expect(checkData(model)).toEqual(``);

    let oldName = model.transactions[0].NAME;
    model.transactions[0].NAME = '';
    expect(checkData(model)).toEqual(`Transaction name needs some characters`);
    model.transactions[0].NAME = oldName;

    expect(checkData(model)).toEqual(``);

    oldName = model.transactions[1].NAME;
    model.transactions[1].NAME = `${conditional}nonsense`;
    expect(checkData(model)).toEqual(
      `Conditional transaction Conditionalnonsense needs a 'To' asset defined`,
    );
    model.transactions[1].NAME = oldName;

    expect(checkData(model)).toEqual(``);

    oldName = model.transactions[2].NAME;
    model.transactions[2].NAME = 'nonsense';
    expect(checkData(model)).toEqual(
      `Transaction nonsense from unrecognised asset (could be typo or before asset start date?) : \"TeachingJob\"`,
    );
    model.transactions[2].NAME = oldName;

    const oldType = model.transactions[0].TYPE;
    oldName = model.transactions[0].NAME;
    model.transactions[0].TYPE = revalueDebt;
    expect(checkData(model)).toEqual(
      `revalue debt type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].NAME = `${revalue} ${oldName}`;
    expect(checkData(model)).toEqual(
      `Transaction Revalue -PT TeachersPensionScheme from unrecognised asset (could be typo or before asset start date?) : \"-PDB TeachersPensionScheme\"`,
    );
    model.transactions[0].NAME = oldName;
    model.transactions[0].TYPE = revalueAsset;
    expect(checkData(model)).toEqual(
      `revalue asset type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = revalueInc;
    expect(checkData(model)).toEqual(
      `revalue income type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = revalueExp;
    expect(checkData(model)).toEqual(
      `revalue expense type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = revalueSetting;
    expect(checkData(model)).toEqual(
      `revalue setting type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = 'nonsense';
    expect(checkData(model)).toEqual(
      `transaction type  nonsense for -PT TeachersPensionScheme is not one of allowed types - internal bug`,
    );
    model.transactions[0].TYPE = liquidateAsset;
    expect(checkData(model)).toEqual(
      `liquidating type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = payOffDebt;
    expect(checkData(model)).toEqual(
      `payoff debt type of transaction -PT TeachersPensionScheme not a recognised format`,
    );
    model.transactions[0].TYPE = bondInvest;
    expect(checkData(model)).toEqual(
      `May only invest in Bond from Cash : malformed transaction -PT TeachersPensionScheme`,
    );
    const oldFrom = model.transactions[0].FROM;
    model.transactions[0].FROM = CASH_ASSET_NAME;
    expect(checkData(model)).toEqual(
      `Investment in Bond needs BMV as start of from value : malformed transaction -PT TeachersPensionScheme`,
    );
    model.transactions[0].FROM = oldFrom;
    model.transactions[0].TYPE = oldType;

    const oldDate = model.transactions[0].DATE;
    model.transactions[0].DATE = 'nonsense';
    expect(checkData(model)).toEqual(
      `Transaction -PT TeachersPensionScheme has bad date : \"nonsense\"`,
    );
    model.transactions[0].DATE = oldDate;

    const oldFromValue = model.transactions[0].FROM_VALUE;
    model.transactions[0].FROM_VALUE = '';
    expect(checkData(model)).toEqual(
      `Transaction from -PDB TeachersPensionScheme needs a non-empty from value`,
    );
    model.transactions[0].FROM_VALUE = oldFromValue;

    const oldTo = model.transactions[0].TO;
    model.transactions[0].TO = 'nonsense';
    expect(checkData(model)).toEqual(
      `Transaction -PT TeachersPensionScheme to unrecognised thing : nonsense`,
    );
    model.transactions[0].TO = oldTo;

    const oldToValue = model.transactions[0].TO_VALUE;
    model.transactions[0].TO_VALUE = '';
    expect(checkData(model)).toEqual(
      `Transaction to -PT TeachersPensionScheme needs a non-empty to value`,
    );
    model.transactions[0].TO_VALUE = 'nonsense';
    expect(checkData(model)).toEqual(
      `Transaction to value nonsense isn't a number or setting`,
    );
    model.transactions[0].TO_VALUE = oldToValue;

    expect(checkData(model)).toEqual(``);

    const model2 = getMinimalModelCopy();
    model2.assets.push({
      ...simpleAsset,
      NAME: 'a',
      START: '1 Jan 2019',
    });
    model2.assets.push({
      ...simpleAsset,
      NAME: 'd',
      START: '1 Jan 2019',
      IS_A_DEBT: true,
    });
    model2.incomes.push({
      ...simpleIncome,
      NAME: 'i',
      START: '1 Jan 2019',
    });
    model2.expenses.push({
      ...simpleExpense,
      NAME: 'e',
      START: '1 Jan 2019',
      END: '1 Jan 2020',
    });
    model2.settings.push({
      ...simpleSetting,
      NAME: 's',
      VALUE: 'val',
    });
    model2.transactions.push({
      ...simpleTransaction,
      NAME: 't',
      DATE: '1 Jan 2018',
    });
    expect(checkData(model2)).toEqual(``);
    model2.transactions[0].TO = 'a';
    expect(checkData(model2)).toEqual(
      `Transaction t dated before start of affected asset : a`,
    );
    model2.transactions[0].TO = 'i';
    expect(checkData(model2)).toEqual(
      `Transactions to incomes must begin 'Revalue' or '-PDB  or -PT `,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkData(model2)).toEqual(
      `Transaction Revaluet dated before start of affected income : i`,
    );
    model2.transactions[0].NAME = `t`;
    model2.transactions[0].TO = 'e';
    expect(checkData(model2)).toEqual(
      `Transactions to expenses must begin 'Revalue'`,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkData(model2)).toEqual(
      `Transaction Revaluet dated before start of affected expense : e`,
    );
    model2.transactions[0].DATE = `1 Jan 2021`;
    expect(checkData(model2)).toEqual(
      `Transaction Revaluet dated after end of affected expense : e`,
    );
    model2.transactions[0].NAME = `t`;
    model2.transactions[0].TO = 's';
    expect(checkData(model2)).toEqual(
      `Transactions to setting must begin 'Revalue'`,
    );
    model2.transactions[0].TO = 'd';
    model2.transactions[0].TYPE = revalueDebt;
    expect(checkData(model2)).toEqual(
      `revalue debt type of transaction t not a recognised format`,
    );
    model2.transactions[0].NAME = `${revalue}t`;
    expect(checkData(model2)).toEqual(``);

    model2.transactions[0].TYPE = custom;

    model2.incomes[0].NAME = '';
    expect(checkData(model2)).toEqual(`Income name needs some characters`);
    model2.incomes[0].NAME = 'i';

    model2.expenses[0].NAME = '';
    expect(checkData(model2)).toEqual(`Expense name needs some characters`);
    model2.expenses[0].NAME = 'e';

    const preName = model2.name;
    model2.name = '';
    expect(checkData(model2)).toEqual(`model name = ''`);
    model2.name = preName;

    expect(checkData(model2)).toEqual(``);

    const roi = {
      start: 'March 1, 2018',
      end: 'April 2, 2018',
    };
    const model3: ModelData = {
      ...emptyModel,
      transactions: [
        {
          // when you take cash from your pension pot
          ...simpleTransaction,
          NAME: 'get some pension', //
          FROM: crystallizedPension + 'Joe.PNN', // name is important
          FROM_VALUE: '30000', // a one-off payment
          TO: 'ISA',
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0', // all of what is removed goes to cash
          DATE: 'March 20 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: 'ISA',
          CAN_BE_NEGATIVE: true,
          START: 'March 1 2018',
        },
        {
          ...simpleAsset,
          NAME: crystallizedPension + 'Joe.PNN', // name is important - will be '+incomeTax+'Joe
          START: 'March 1 2018',
          VALUE: '60000',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    expect(checkData(model3)).toEqual(
      `Transaction get some pension needs to go to Cash for proper income tax calculation`,
    );

    unSuppressLogs();
  });
  it('check expense', () => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'April 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: '1 Jan 2017',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          LIABILITY: 'nonsense',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          NAME: 'x',
          FAVOURITE: undefined,
          VALUE: '1.00',
          HINT: 'growthValue',
          TYPE: adjustableType,
        },
      ],
    };
    suppressLogs();
    expect(
      checkExpense(
        {
          ...simpleExpense,
          NAME: '',
        },
        model,
      ),
    ).toEqual('Expense name needs some characters');
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: 'nonsense',
        },
        model,
      ),
    ).toEqual(`Expense value 'nonsense' is not a number`);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: 'x', // this is a setting name
          CPI_IMMUNE: true, // defined by setting => OK as long as doesn't grow by CPI
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: '2x', // this is a setting name
          CPI_IMMUNE: true, // defined by setting => OK as long as doesn't grow by CPI
        },
        model,
      ),
    ).toEqual(``);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE: 'x', // this is a setting name
          CPI_IMMUNE: false, // defined by setting => can't directly grow by CPI
        },
        model,
      ),
    ).toEqual(`Expense 'NoName' value 'x' may not grow with CPI`);
    expect(
      checkExpense(
        {
          ...simpleExpense,
          START: 'nonsense',
        },
        model,
      ),
    ).toEqual(
      `Expense start date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE_SET: 'nonsense',
        },
        model,
      ),
    ).toEqual(
      `Expense value set date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          END: 'nonsense',
        },
        model,
      ),
    ).toEqual(
      `Expense end date doesn't make sense :
      "nonsense"`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          VALUE_SET: '1 Jan 2018',
          START: '1 Jan 2017',
        },
        model,
      ),
    ).toEqual(
      `Expense value must be set on or before the start of the income.
      For NoName, start is 01 Jan 2017 and
      value is set 01 Jan 2018.`,
    );
    expect(
      checkExpense(
        {
          ...simpleExpense,
          RECURRENCE: 'nonsense',
        },
        model,
      ),
    ).toEqual(`transaction recurrence 'nonsense' must end in w, m or y`);

    unSuppressLogs();
  });
  it('check trigger', () => {
    const model = getMinimalModelCopy();
    expect(
      checkTrigger(
        {
          NAME: '',
          FAVOURITE: undefined,
          DATE: '1 Jan 2018',
        },
        model,
      ),
    ).toEqual('Date name needs some characters');
    expect(
      checkTrigger(
        {
          NAME: 'today',
          FAVOURITE: undefined,
          DATE: '1 Jan 2018',
        },
        model,
      ),
    ).toEqual(`Date name can't be 'today'`);
  });
  it('check bond model', () => {
    const model = getTestModel(bondModel);
    expect(checkData(model)).toEqual(``);

    suppressLogs();

    model.transactions[0].TYPE = 'custom';
    expect(checkData(model)).toEqual(
      `May only invest into Bond if the setting BondTargetValue is revalued (so we capture the revalue date) : malformed transaction BondInvest4y`,
    );
    model.transactions[0].TYPE = 'revalueSetting';

    model.transactions[1].NAME = 'nonsense';
    expect(checkData(model)).toEqual(
      `Malformed model : bond maturation BondMature5y requires an investment`,
    );
    model.transactions[1].NAME = 'BondInvest5y';

    model.transactions[0].DATE = '1 Jan 2020';
    expect(checkData(model)).toEqual(
      `May only invest into Bond if the setting BondTargetValue is not revalued after investment date : malformed transaction BondInvest4y`,
    );
    model.transactions[0].DATE = '1 Jan 2018';

    model.transactions[6].TO = '';
    expect(checkData(model)).toEqual(
      `May only mature from Bond to Cash : malformed transaction BondMature5y`,
    );
    model.transactions[6].TO = CASH_ASSET_NAME;

    model.transactions[6].FROM_VALUE = 'BondTargetValue2';
    expect(checkData(model)).toEqual(
      `Maturing Bond needs BMV as start of from value : malformed transaction BondMature5y`,
    );
    model.transactions[6].FROM_VALUE = 'BMVBondTargetValue2';

    model.transactions[6].STOP_DATE = '1 Jan 2029';
    expect(checkData(model)).toEqual(
      `Malformed model : bond maturation BondMature5y requires an investment`,
    );
    model.transactions[6].STOP_DATE = '1 Jan 2030';

    model.transactions[13].FROM_VALUE = 'BMVBondTargetValue';
    expect(checkData(model)).toEqual(
      `Malformed transaction : only bondInvest and bondMature types use BMV`,
    );
    model.transactions[13].FROM_VALUE = '0.0';

    model.settings[3].NAME = 'nonsense';
    expect(checkData(model)).toEqual(
      `\"Beginning of view range\" should be present in settings (value is a date)`,
    );
    model.settings[3].NAME = 'Beginning of view range';

    model.settings[4].NAME = 'nonsense';
    expect(checkData(model)).toEqual(
      `\"End of view range\" should be present in settings (value is a date)`,
    );
    model.settings[4].NAME = 'End of view range';

    model.settings[4].VALUE = 'nonsense';
    expect(checkData(model)).toEqual(
      `Setting \"End of view range\" should be a valid date string (e.g. 1 April 2018)`,
    );
    model.settings[4].VALUE = 'Dec 1, 2016';
    expect(checkData(model)).toEqual(
      `Setting \"End of view range\" should be after setting \"Beginning of view range\"`,
    );
    model.settings[4].VALUE = 'June 1, 2031';

    model.transactions[13].NAME = `${conditional} gain cash`;
    expect(checkData(model)).toEqual(
      `custom type of transaction Conditional gain cash not a recognised format`,
    );
    model.transactions[13].NAME = `base`;
    expect(checkData(model)).toEqual(`'base' as name is reserved`);
    model.transactions[13].NAME = model.transactions[12].NAME;
    expect(checkData(model)).toEqual(
      `duplicate name Revalue of BondTargetValue2 1`,
    );
    model.transactions[13].NAME = 'Gain Cash';

    model.settings[7].NAME = debtChartFocus;
    expect(checkData(model)).toEqual(
      `\"Focus of debts chart\" setting should not be present`,
    );
    model.settings[7].NAME = taxChartFocusType;
    expect(checkData(model)).toEqual(
      `\"Focus of tax chart, type\" setting should not be present`,
    );
    model.settings[7].NAME = 'mySetting';

    unSuppressLogs();
    expect(checkData(model)).toEqual('');
  });

  it('has proportional transaction blocked for string-valued asset', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Sell all Stff',
          FROM: 'Stff',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: 'MyCa',
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'January 3 2018',
        },
      ],
      assets: [
        {
          ...simpleAsset,
          NAME: 'Stff',
          START: 'January 2 2018',
          VALUE: '222',
          GROWTH: '12',
        },
        {
          ...simpleAsset,
          NAME: 'MyCa',
          START: 'January 1 2018',
          VALUE: 'MyCarValue',
          GROWTH: '12',
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'MyCarValue',
          VALUE: '10',
        },
      ],
    };

    suppressLogs();

    expect(checkData(model)).toEqual(
      `Dont allow a proportional transaction to a word-valued asset`,
    );

    unSuppressLogs();
    done();
  });
  it('has proportional transaction blocked for string-valued income', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue PRound',
          FROM: '',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: 'PRound',
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'January 3 2018',
        },
      ],
      incomes: [
        {
          ...simpleIncome,
          NAME: 'PRound',
          START: 'January 2 2018',
          VALUE: 'PRoundValue',
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'PRoundValue',
          VALUE: '10',
        },
      ],
    };

    suppressLogs();

    expect(checkData(model)).toEqual(
      `Dont allow a proportional transaction to a word-valued income`,
    );

    unSuppressLogs();
    done();
  });
  it('has proportional transaction blocked for string-valued expense', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 1, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue Dogs',
          FROM: '',
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: 'Dogs',
          TO_ABSOLUTE: false,
          TO_VALUE: '0.5',
          DATE: 'January 3 2018',
        },
      ],
      expenses: [
        {
          ...simpleExpense,
          NAME: 'Dogs',
          START: 'January 2 2018',
          END: 'January 4 2018',
          VALUE: 'DogsValue',
          CPI_IMMUNE: true,
        },
      ],
      settings: [
        ...defaultModelSettings(roi),
        {
          ...simpleSetting,
          NAME: 'DogsValue',
          VALUE: '10',
        },
      ],
    };

    suppressLogs();

    expect(checkData(model)).toEqual(
      `Dont allow a proportional transaction to a word-valued expense`,
    );

    unSuppressLogs();
    done();
  });
});
