import {
  checkForWordClashInModel,
  checkTriggerDate,
  getSpecialWord,
  getTriggerDate,
  hasDependentDate,
  lessThan,
  makeBooleanFromString,
  makeBooleanFromYesNo,
  makeCashValueFromString,
  makeDateFromString,
  makeDateTooltip,
  makeGrowthFromString,
  makeIncomeLiabilityFromNameAndNI,
  makePurchasePriceFromString,
  makeQuantityFromString,
  makeStringFromBoolean,
  makeStringFromCashValue,
  makeStringFromFromToValue,
  makeStringFromGrowth,
  makeStringFromPurchasePrice,
  makeStringFromValueAbsProp,
  makeValueAbsPropFromString,
  makeYesNoFromBoolean,
  removeNumberPart,
} from '../../utils/stringUtils';
import {
  minimalModel,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleSetting,
  simpleTransaction,
} from '../../models/exampleModels';
import {
  bondInvest,
  CASH_ASSET_NAME,
} from '../../localization/stringConstants';
import { makeModelFromJSONString } from '../../models/modelUtils';

import {
  revalue,
  conditional,
  pensionSS,
  pensionTransfer,
  pensionDB,
  pension,
  moveTaxFreePart,
  crystallizedPension,
  transferCrystallizedPension,
  bondMaturity,
} from '../../localization/stringConstants';
import { ModelData } from '../../types/interfaces';
import { endOfTime, log } from '../../utils/utils';

log;

describe('utils tests', () => {
  it('less than', () => {
    expect(lessThan(`a`, 'z')).toBe(-1);
    expect(lessThan(`z`, 'a')).toBe(1);
    expect(lessThan(`a`, 'a')).toBe(0);
    expect(lessThan(`a`, '-a')).toBe(-1);
    expect(lessThan(`-a`, 'a')).toBe(1);
    expect(lessThan(`A`, 'z')).toBe(-1);
    expect(lessThan(`Z`, 'a')).toBe(1);
    expect(lessThan(`a`, 'Z')).toBe(-1);
    expect(lessThan(`z`, 'A')).toBe(1);
    expect(lessThan(`A`, 'a')).toBe(-1);
    expect(lessThan(`a`, 'A')).toBe(1);
  });
  it('makeDateFromString', () => {
    expect(makeDateFromString('01/02/01').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('01/02/99').toDateString()).toBe(
      'Mon Feb 01 1999',
    );
    expect(makeDateFromString('01/02/2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('01/02/1999').toDateString()).toBe(
      'Mon Feb 01 1999',
    );
    expect(makeDateFromString('Thu Feb 01 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('Feb 01 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('01 Feb 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('Thu February 01 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('February 01 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
    expect(makeDateFromString('01 February 2001').toDateString()).toBe(
      'Thu Feb 01 2001',
    );
  });
  it('locales woes', () => {
    const d1 = new Date('2020');
    const d2 = new Date('1 Jan 2020');
    expect(d1.getTime()).toEqual(d2.getTime());
  });
  it('removeNumberPart', () => {
    expect(removeNumberPart('0a')).toBe('a');
    expect(removeNumberPart('0.0a')).toBe('a');
    expect(removeNumberPart('0')).toBe('');
    expect(removeNumberPart('a')).toBe(undefined);
    expect(removeNumberPart('a0')).toBe(undefined);
  });
  it('makeIncomeLiabilityFromNameAndNI', () => {
    expect(makeIncomeLiabilityFromNameAndNI('a', true)).toBe(
      'a(incomeTax)/a(NI)',
    );
    expect(makeIncomeLiabilityFromNameAndNI('a', false)).toBe('a(incomeTax)');
    expect(makeIncomeLiabilityFromNameAndNI('', true)).toBe('');
    expect(makeIncomeLiabilityFromNameAndNI('', false)).toBe('');

    expect(makeIncomeLiabilityFromNameAndNI('a/b', true, false)).toBe('');
    expect(makeIncomeLiabilityFromNameAndNI('a/b', false, false)).toBe('');
  });
  it('makeBooleanFromString', () => {
    expect(makeBooleanFromString('true')).toBe(true);
    expect(makeBooleanFromString('t')).toBe(true);
    expect(makeBooleanFromString('True')).toBe(true);
    expect(makeBooleanFromString('T')).toBe(true);
    expect(makeBooleanFromString('false')).toBe(false);
    expect(makeBooleanFromString('f')).toBe(false);
    expect(makeBooleanFromString('False')).toBe(false);
    expect(makeBooleanFromString('F')).toBe(false);
    expect(makeBooleanFromString('anything else')).toBe(false);
    expect(makeBooleanFromString('')).toBe(false);
  });
  it('makeBooleanFromYesNo', () => {
    expect(makeBooleanFromYesNo('yes')).toEqual({
      checksOK: true,
      value: true,
    });
    expect(makeBooleanFromYesNo('y')).toEqual({ checksOK: true, value: true });
    expect(makeBooleanFromYesNo('Yes')).toEqual({
      checksOK: true,
      value: true,
    });
    expect(makeBooleanFromYesNo('Y')).toEqual({ checksOK: true, value: true });
    expect(makeBooleanFromYesNo('no')).toEqual({
      checksOK: true,
      value: false,
    });
    expect(makeBooleanFromYesNo('n')).toEqual({ checksOK: true, value: false });
    expect(makeBooleanFromYesNo('No')).toEqual({
      checksOK: true,
      value: false,
    });
    expect(makeBooleanFromYesNo('N')).toEqual({ checksOK: true, value: false });
    expect(makeBooleanFromYesNo('anything else')).toEqual({
      checksOK: false,
      value: true,
    });
    expect(makeBooleanFromYesNo('')).toEqual({ checksOK: false, value: true });
  });
  it('makeYesNoFromBoolean', () => {
    expect(makeYesNoFromBoolean(true)).toEqual('Yes');
    expect(makeYesNoFromBoolean(false)).toEqual('No');
  });
  it('makeGrowthFromString', () => {
    const settings = [
      {
        NAME: 'a',
        VALUE: '10.0',
        HINT: '',
        TYPE: '',
      },
      {
        NAME: 'b',
        VALUE: '10a',
        HINT: '',
        TYPE: '',
      },
    ];
    expect(makeGrowthFromString('1', settings)).toEqual({
      checksOK: true,
      value: '1',
    });
    expect(makeGrowthFromString('1.0', settings)).toEqual({
      checksOK: true,
      value: '1',
    });
    expect(makeGrowthFromString('-1.0', settings)).toEqual({
      checksOK: true,
      value: '-1',
    });
    expect(makeGrowthFromString('a', settings)).toEqual({
      checksOK: true,
      value: 'a',
    });
    expect(makeGrowthFromString('2a', settings)).toEqual({
      checksOK: false,
      value: '',
    });
    expect(makeGrowthFromString('b', settings)).toEqual({
      checksOK: true,
      value: 'b',
    });
    expect(makeGrowthFromString('1%', settings)).toEqual({
      checksOK: true,
      value: '1',
    });
    expect(makeGrowthFromString('a%', settings)).toEqual({
      checksOK: false,
      value: '',
    });
    expect(makeGrowthFromString('', settings)).toEqual({
      checksOK: false,
      value: '',
    });
  });
  it('makeStringFromGrowth', () => {
    const settings = [
      {
        NAME: 'a',
        VALUE: '10.0',
        HINT: '',
        TYPE: '',
      },
      {
        NAME: 'b',
        VALUE: '10a',
        HINT: '',
        TYPE: '',
      },
    ];
    expect(makeStringFromGrowth('1', settings)).toEqual('1%');
    expect(makeStringFromGrowth('a', settings)).toEqual('a');
    expect(makeStringFromGrowth('b', settings)).toEqual('b');
    expect(makeStringFromGrowth('anything else', settings)).toEqual(
      'anything else',
    );
  });
  it('makeStringFromBoolean', () => {
    expect(makeStringFromBoolean(true)).toEqual('T');
    expect(makeStringFromBoolean(false)).toEqual('F');
  });
  it('makeCashValueFromString', () => {
    expect(makeCashValueFromString('1')).toEqual({ checksOK: true, value: 1 });
    expect(makeCashValueFromString('1.1')).toEqual({
      checksOK: true,
      value: 1.1,
    });
    expect(makeCashValueFromString('-1')).toEqual({
      checksOK: true,
      value: -1,
    });
    expect(makeCashValueFromString('-1.00')).toEqual({
      checksOK: true,
      value: -1,
    });
    expect(makeCashValueFromString('£1')).toEqual({ checksOK: true, value: 1 });
    expect(makeCashValueFromString('£1.1')).toEqual({
      checksOK: true,
      value: 1.1,
    });
    expect(makeCashValueFromString('-£1')).toEqual({
      checksOK: true,
      value: -1,
    });
    expect(makeCashValueFromString('-£1.00')).toEqual({
      checksOK: true,
      value: -1,
    });
    expect(makeCashValueFromString('')).toEqual({ checksOK: false, value: 0 });
    expect(makeCashValueFromString('anything else')).toEqual({
      checksOK: false,
      value: 0,
    });
  });
  it('makeQuantityFromString', () => {
    expect(makeQuantityFromString('0')).toEqual({ checksOK: true, value: '0' });
    expect(makeQuantityFromString('1')).toEqual({ checksOK: true, value: '1' });
    expect(makeQuantityFromString('-1')).toEqual({
      checksOK: true,
      value: '-1',
    });
    expect(makeQuantityFromString('')).toEqual({ checksOK: true, value: '' });
    expect(makeQuantityFromString('1.1')).toEqual({
      checksOK: false,
      value: '',
    });
    expect(makeQuantityFromString('anything else')).toEqual({
      checksOK: false,
      value: '',
    });
  });
  it('makeValueAbsPropFromString', () => {
    expect(makeValueAbsPropFromString('')).toEqual({
      absolute: true,
      checksOK: true,
      value: '0.0',
    });
    expect(makeValueAbsPropFromString('1')).toEqual({
      absolute: true,
      checksOK: true,
      value: '1',
    });
    expect(makeValueAbsPropFromString('-1')).toEqual({
      absolute: true,
      checksOK: true,
      value: '-1',
    });
    expect(makeValueAbsPropFromString('0.1')).toEqual({
      absolute: true,
      checksOK: true,
      value: '0.1',
    });
    expect(makeValueAbsPropFromString('1%')).toEqual({
      absolute: false,
      checksOK: true,
      value: '0.01',
    });
    expect(makeValueAbsPropFromString('-1%')).toEqual({
      absolute: false,
      checksOK: true,
      value: '-0.01',
    });
    expect(makeValueAbsPropFromString('2 units')).toEqual({
      absolute: true,
      checksOK: true,
      value: '2',
    });
    expect(makeValueAbsPropFromString('nonsense units')).toEqual({
      absolute: true,
      checksOK: false,
      value: 'nonsense units',
    });
    expect(makeValueAbsPropFromString('2a')).toEqual({
      absolute: true,
      checksOK: true,
      value: '2a',
    });
    expect(makeValueAbsPropFromString('nonsense%')).toEqual({
      absolute: true,
      checksOK: false,
      value: 'nonsense%',
    });
    expect(makeValueAbsPropFromString('a2')).toEqual({
      absolute: true,
      checksOK: false,
      value: 'a2',
    });
    expect(makeValueAbsPropFromString('£2')).toEqual({
      absolute: true,
      checksOK: true,
      value: '2',
    });
  });
  it('makeStringFromValueAbsProp', () => {
    expect(
      makeStringFromValueAbsProp('', true, CASH_ASSET_NAME, minimalModel, ''),
    ).toEqual('0.0');
    expect(
      makeStringFromValueAbsProp('0', true, CASH_ASSET_NAME, minimalModel, ''),
    ).toEqual('0');
    expect(
      makeStringFromValueAbsProp(
        '2 units',
        true,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2 units');
    const copyModel = makeModelFromJSONString(JSON.stringify(minimalModel));
    copyModel.assets.push({
      ...simpleAsset,
      NAME: 'cars',
      VALUE: '200',
      QUANTITY: '2',
    });
    expect(
      makeStringFromValueAbsProp('2', true, 'cars', copyModel, ''),
    ).toEqual('2 units');
    expect(
      makeStringFromValueAbsProp(
        '2',
        true,
        'cars',
        copyModel,
        'Revalue something',
      ),
    ).toEqual('2');
    expect(
      makeStringFromValueAbsProp(
        '0.02',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2%');
    expect(
      makeStringFromValueAbsProp(
        '0.0200000001',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2%');
    expect(
      makeStringFromValueAbsProp(
        '0.019999999',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2%');
    expect(
      makeStringFromValueAbsProp(
        '0.0220000001',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2.20000001%');
    expect(
      makeStringFromValueAbsProp(
        '0.022000000',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('2.2%');
    expect(
      makeStringFromValueAbsProp(
        'anything else ',
        false,
        CASH_ASSET_NAME,
        minimalModel,
        '',
      ),
    ).toEqual('NaN%');
  });
  it('makeStringFromCashValue', () => {
    expect(makeStringFromCashValue('', '£')).toEqual('');
    expect(makeStringFromCashValue('0', '£')).toEqual('£0.00');
    expect(makeStringFromCashValue('0.3001', '£')).toEqual('£0.30');
    expect(makeStringFromCashValue('-2.3001', '$')).toEqual('-$2.30');
    expect(makeStringFromCashValue('123456789', '£')).toEqual(
      '£123,456,789.00',
    );
    expect(makeStringFromCashValue('123456', '£')).toEqual('£123,456.00');
  });
  it('makeStringFromFromToValue', () => {
    expect(makeStringFromFromToValue('')).toEqual('');
    expect(makeStringFromFromToValue('0')).toEqual('£0.00');
    expect(makeStringFromFromToValue('0.123')).toEqual('£0.12');
    expect(makeStringFromFromToValue('2%')).toEqual('2%');
    expect(makeStringFromFromToValue('2.123%')).toEqual('2.123%');
    expect(makeStringFromFromToValue('-0.123')).toEqual('-£0.12');
    expect(makeStringFromFromToValue('-2%')).toEqual('-2%');
    expect(makeStringFromFromToValue('-2.123%')).toEqual('-2.123%');
    expect(makeStringFromFromToValue('12 units')).toEqual('12 units');
  });
  it('checkTriggerDate', () => {
    const simpleTrigger = {
      NAME: 'a',
      DATE: '1 Jan 2018',
    };
    expect(checkTriggerDate('', [simpleTrigger])).toEqual(undefined);
    expect(checkTriggerDate('a', [simpleTrigger])?.toDateString()).toEqual(
      'Mon Jan 01 2018',
    );
    expect(checkTriggerDate('a+1y', [simpleTrigger])?.toDateString()).toEqual(
      'Tue Jan 01 2019',
    );
    expect(checkTriggerDate('a-1y', [simpleTrigger])?.toDateString()).toEqual(
      'Sun Jan 01 2017',
    );
    expect(checkTriggerDate('a+1m', [simpleTrigger])?.toDateString()).toEqual(
      'Thu Feb 01 2018',
    );
    expect(checkTriggerDate('a-1m', [simpleTrigger])?.toDateString()).toEqual(
      'Fri Dec 01 2017',
    );
    expect(checkTriggerDate('a+1d', [simpleTrigger])?.toDateString()).toEqual(
      'Tue Jan 02 2018',
    );
    expect(checkTriggerDate('a-1d', [simpleTrigger])?.toDateString()).toEqual(
      'Sun Dec 31 2017',
    );
    expect(checkTriggerDate('nonsense', [simpleTrigger])).toEqual(undefined);
  });
  it('getTriggerDate', () => {
    const simpleTrigger = {
      NAME: 'a',
      DATE: '1 Jan 2018',
    };
    expect(getTriggerDate('', [simpleTrigger]).toDateString()).toEqual(
      new Date().toDateString(),
    );
    expect(getTriggerDate('a', [simpleTrigger]).toDateString()).toEqual(
      'Mon Jan 01 2018',
    );
    expect(getTriggerDate('a+1y', [simpleTrigger]).toDateString()).toEqual(
      'Tue Jan 01 2019',
    );
    expect(getTriggerDate('a-1y', [simpleTrigger]).toDateString()).toEqual(
      'Sun Jan 01 2017',
    );
    expect(getTriggerDate('a+1m', [simpleTrigger]).toDateString()).toEqual(
      'Thu Feb 01 2018',
    );
    expect(getTriggerDate('a-1m', [simpleTrigger]).toDateString()).toEqual(
      'Fri Dec 01 2017',
    );
    expect(getTriggerDate('a+1d', [simpleTrigger]).toDateString()).toEqual(
      'Tue Jan 02 2018',
    );
    expect(getTriggerDate('a-1d', [simpleTrigger]).toDateString()).toEqual(
      'Sun Dec 31 2017',
    );
    expect(getTriggerDate('nonsense', [simpleTrigger]).toDateString()).toEqual(
      new Date().toDateString(),
    );
  });
  it('makeDateTooltip', () => {
    const simpleTrigger = {
      NAME: 'a',
      DATE: '1 Jan 2018',
    };
    expect(makeDateTooltip('a', [simpleTrigger])).toEqual('1 January 2018');
    expect(makeDateTooltip('', [simpleTrigger])).toEqual('');
    expect(makeDateTooltip('nonsense', [simpleTrigger])).toEqual('');
    expect(makeDateTooltip('a', [simpleTrigger])).toEqual('1 January 2018');
    expect(makeDateTooltip('a+1y', [simpleTrigger])).toEqual('1 January 2019');
    expect(makeDateTooltip('a-1y', [simpleTrigger])).toEqual('1 January 2017');
    expect(makeDateTooltip('a+1m', [simpleTrigger])).toEqual('1 February 2018');
    expect(makeDateTooltip('a-1m', [simpleTrigger])).toEqual('1 December 2017');
    expect(makeDateTooltip('a+1d', [simpleTrigger])).toEqual('2 January 2018');
    expect(makeDateTooltip('a-1d', [simpleTrigger])).toEqual(
      '31 December 2017',
    );
  });
  it('makeStringFromPurchasePrice', () => {
    expect(makeStringFromPurchasePrice('0', 'jim')).toEqual('');
    expect(makeStringFromPurchasePrice('anything', 'jim(CGT)')).toEqual(
      'anything',
    );
  });
  it('makePurchasePriceFromString', () => {
    expect(makePurchasePriceFromString('')).toEqual('0');
    expect(makePurchasePriceFromString('anything')).toEqual('anything');
  });
  it('getSpecialWord', () => {
    expect(getSpecialWord('anything', minimalModel)).toEqual('');
    [
      revalue,
      conditional,
      pensionSS,
      pensionTransfer,
      pensionDB,
      pension,
      moveTaxFreePart,
      crystallizedPension,
      transferCrystallizedPension,
      bondMaturity,
    ].map((x) => {
      expect(getSpecialWord(`${x}anything`, minimalModel)).toEqual(`${x}`);
    });

    ['1y', '2y', '3y', '4y', '5y', '1m'].map((x) => {
      const m = makeModelFromJSONString(JSON.stringify(minimalModel));
      m.transactions.push({
        ...simpleTransaction,
        TYPE: bondInvest,
        NAME: `myName${x}`,
      });
      expect(getSpecialWord(`anything${x}`, m)).toEqual(`${x}`);
    });
    expect(getSpecialWord(`anything1y`, minimalModel)).toEqual('');
    const m = makeModelFromJSONString(JSON.stringify(minimalModel));
    m.triggers.push({
      NAME: 'something',
      DATE: `1999`,
    });
    m.transactions.push({
      ...simpleTransaction,
      DATE: 'something+1d',
    });
    expect(getSpecialWord(`something`, m)).toEqual('dateAlgebra');
  });
  it('hasDependentDate', () => {
    [
      (x: ModelData) => {
        x.expenses.push({
          ...simpleExpense,
          START: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.expenses.push({
          ...simpleExpense,
          END: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.expenses.push({
          ...simpleExpense,
          VALUE_SET: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.incomes.push({
          ...simpleIncome,
          START: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.incomes.push({
          ...simpleIncome,
          END: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.incomes.push({
          ...simpleIncome,
          VALUE_SET: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.transactions.push({
          ...simpleTransaction,
          DATE: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.transactions.push({
          ...simpleTransaction,
          STOP_DATE: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.triggers.push({
          NAME: 'b',
          DATE: 'a+1y',
        });
      },
      (x: ModelData) => {
        x.assets.push({
          ...simpleAsset,
          START: 'a+1d',
        });
      },
      (x: ModelData) => {
        x.triggers.push({
          NAME: 'a+boo',
          DATE: 'a+boo',
        });
        x.incomes.push({
          ...simpleIncome,
          START: 'a+1d',
        });
      },
    ].map((makeChange) => {
      const x = makeModelFromJSONString(JSON.stringify(minimalModel));
      makeChange(x);
      expect(
        hasDependentDate(
          {
            NAME: 'a',
            DATE: '1 Jan 1999',
          },
          x,
        ),
      ).toBe(true);
      expect(
        hasDependentDate(
          {
            NAME: 'b',
            DATE: '1 Jan 1999',
          },
          x,
        ),
      ).toBe(false);
    });
  });
  it('checkForWordClashInModel', () => {
    [
      {
        makeChange: (m: ModelData) => {
          return m;
        },
        replacement: '',
        outcome: `  Asset 'Cash' has quantity boo called    `,
      },
      {
        makeChange: (m: ModelData) => {
          return m;
        },
        replacement: CASH_ASSET_NAME,
        outcome: `  Asset 'Cash' has name boo called Cash   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            NAME: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'a' has name boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            CATEGORY: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has category boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            START: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has start boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has value boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            VALUE: '2a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has value boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            QUANTITY: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has quantity boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            GROWTH: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has growth boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            LIABILITY: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has liability boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.assets.push({
            ...simpleAsset,
            PURCHASE_PRICE: 'a',
          });
        },
        replacement: 'a',
        outcome: `  Asset 'NoName' has purchase price boo called a   `,
      },
      {
        makeChange: (m: ModelData) => {
          m.settings.push({
            ...simpleSetting,
            NAME: 'a',
          });
        },
        replacement: 'a',
        outcome: `Setting 'a' has name boo called a     `,
      },
      {
        makeChange: (m: ModelData) => {
          m.settings.push({
            ...simpleSetting,
            VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `Setting 'NoName' has value boo called a     `,
      },
      {
        makeChange: (m: ModelData) => {
          m.triggers.push({
            NAME: 'a',
            DATE: '1 Jan 1999',
          });
        },
        replacement: 'a',
        outcome: ` Trigger 'a' has name boo called a    `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            NAME: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'a' has name boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            CATEGORY: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has category boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            START: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has start boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            END: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has end boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has value boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            VALUE_SET: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has value set boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            GROWTH: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has growth boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.incomes.push({
            ...simpleIncome,
            LIABILITY: 'a',
          });
        },
        replacement: 'a',
        outcome: `   Income 'NoName' has liability boo called a  `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            NAME: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'a' has name boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            CATEGORY: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has category boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            START: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has start boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            END: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has end boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has value boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            VALUE_SET: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has value set boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.expenses.push({
            ...simpleExpense,
            GROWTH: 'a',
          });
        },
        replacement: 'a',
        outcome: `    Expense 'NoName' has growth boo called a `,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            NAME: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'a' has name boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            FROM: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has from boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            FROM_VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has from value boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            TO: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has to boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            TO_VALUE: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has to value boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            DATE: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has date boo called a`,
      },
      {
        makeChange: (m: ModelData) => {
          m.transactions.push({
            ...simpleTransaction,
            STOP_DATE: 'a',
          });
        },
        replacement: 'a',
        outcome: `     Transaction 'NoName' has stop date boo called a`,
      },
    ].map(
      (x: {
        makeChange: (m: ModelData) => void;
        replacement: string;
        outcome: string;
      }) => {
        const m = makeModelFromJSONString(JSON.stringify(minimalModel));
        x.makeChange(m);
        expect(checkForWordClashInModel(m, x.replacement, 'boo')).toEqual(
          x.outcome,
        );
      },
    );
  });
  it('endOfTime', () => {
    expect(endOfTime().toDateString()).toEqual('Fri Jan 01 2100');
  });
});
