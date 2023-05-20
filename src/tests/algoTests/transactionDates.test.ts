import { generateSequenceOfDates } from '../../models/evaluations';
import { Asset } from '../../types/interfaces';
import { dateAsString, makeDateFromString } from '../../utils/stringUtils';
import { DateFormatType } from '../../utils/utils';

export const testAsset: Asset = {
  NAME: 'test_asset',
  ERA: undefined,
  CATEGORY: '',
  START: 'Jan 2017',
  VALUE: '1.2',
  QUANTITY: '',
  GROWTH: '0.0',
  CPI_IMMUNE: false,
  CAN_BE_NEGATIVE: true,
  IS_A_DEBT: false,
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};

describe('generateTransactionDates', () => {
  it('make simple pair monthly', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('June 30, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(2);

    expect(dateAsString(DateFormatType.Test, moments[0])).toBe(
      'Tue May 01 2018',
    );
    expect(dateAsString(DateFormatType.Test, moments[1])).toBe(
      'Fri Jun 01 2018',
    );
  });

  it('make simple pair weekly', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('May 9, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1w');

    expect(moments.length).toBe(2);

    expect(dateAsString(DateFormatType.Test, moments[0])).toBe(
      'Tue May 01 2018',
    );
    expect(dateAsString(DateFormatType.Test, moments[1])).toBe(
      'Tue May 08 2018',
    );
  });

  it('short roi', () => {
    const roi = {
      start: makeDateFromString('May 1, 2018 00:00:00'),
      end: makeDateFromString('May 1, 2018 00:00:01'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(1);

    expect(dateAsString(DateFormatType.Test, moments[0])).toBe(
      'Tue May 01 2018',
    );
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
    expect(dateAsString(DateFormatType.Test, moments[0])).toBe(
      'Tue May 01 2018',
    );
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

    expect(dateAsString(DateFormatType.Test, moments[0])).toBe(
      'Tue May 01 2018',
    );
    expect(dateAsString(DateFormatType.Test, moments[1])).toBe(
      'Wed May 02 2018',
    );
    expect(dateAsString(DateFormatType.Test, moments[2])).toBe(
      'Fri Jun 01 2018',
    );
    expect(dateAsString(DateFormatType.Test, moments[3])).toBe(
      'Sat Jun 02 2018',
    );
  });
});
