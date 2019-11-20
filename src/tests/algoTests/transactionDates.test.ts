import { generateSequenceOfDates } from '../../evaluations';
import { DbAsset } from '../../types/interfaces';
import { makeDateFromString } from '../../utils';

export const testAsset: DbAsset = {
  NAME: 'test_asset',
  CATEGORY: '',
  START: 'Jan 2017',
  VALUE: '1.2',
  GROWTH: '0.0',
  CPI_IMMUNE: false,
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};

describe('generateTransactionDates', () => {
  it('make simple pair', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('June 30, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(2);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
    expect(moments[1].toDateString()).toBe('Fri Jun 01 2018');
  });

  it('short roi', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('May 1, 2018 00:00:01'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(1);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
  });

  it('zero-length roi', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('May 1, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(0);
  });

  it('single long month roi', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('June 1, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(1);
    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
  });

  it('make two pairs and sort', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('June 30, 2018 00:00:00'),
    };
    let moments = generateSequenceOfDates(roi, '1m');

    const roi2 = {
      start: makeDateFromString('May 2, 2018 00:00:00'),
      end: makeDateFromString('June 30, 2018 00:00:00'),
    };
    moments = moments.concat(generateSequenceOfDates(roi2, '1m'));
    // log(`moments = ${showObj(moments)}`);

    moments.sort((a, b) => (a > b ? 1 : a === b ? 0 : -1));
    expect(moments.length).toBe(4);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
    expect(moments[1].toDateString()).toBe('Wed May 02 2018');
    expect(moments[2].toDateString()).toBe('Fri Jun 01 2018');
    expect(moments[3].toDateString()).toBe('Sat Jun 02 2018');
  });
});
