import {
  lessThan,
  makeBooleanFromString,
  makeBooleanFromYesNo,
  makeDateFromString,
  makeGrowthFromString,
  makeIncomeLiabilityFromNameAndNI,
  makeStringFromGrowth,
  makeYesNoFromBoolean,
  removeNumberPart,
} from '../../utils/stringUtils';

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
  });
});
