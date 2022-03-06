import {
  checkTriggerDate,
  getTriggerDate,
  lessThan,
  makeBooleanFromString,
  makeBooleanFromYesNo,
  makeCashValueFromString,
  makeDateFromString,
  makeDateTooltip,
  makeGrowthFromString,
  makeIncomeLiabilityFromNameAndNI,
  makeQuantityFromString,
  makeStringFromBoolean,
  makeStringFromCashValue,
  makeStringFromFromToValue,
  makeStringFromGrowth,
  makeStringFromValueAbsProp,
  makeValueAbsPropFromString,
  makeYesNoFromBoolean,
  removeNumberPart,
} from '../../utils/stringUtils';
import { minimalModel, simpleAsset } from '../../models/exampleModels';
import { CASH_ASSET_NAME } from '../../localization/stringConstants';
import { makeModelFromJSONString } from '../../models/modelUtils';

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
});
