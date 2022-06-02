import { checkTriggerDate } from '../../utils/stringUtils';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  expectEvals,
  expectChartData,
  printTestCodeForChart,
} from './algoTestUtils';

expectEvals;
expectChartData;
printTestCodeForChart;

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debugTest', () => {
    const varVal = 1.0;
    const simpleTrigger = {
      NAME: 'a',
      DATE: '1 Jan 2018',
    };
    const cleanedString = { cleaned: '' };

    expect(
      checkTriggerDate(
        '1 Jan 2018-1d-2d',
        [simpleTrigger],
        varVal,
      )?.toDateString(),
    ).toEqual(undefined);
    cleanedString.cleaned = '';
    checkTriggerDate(
      '1 Jan 2018-1d-2d',
      [simpleTrigger],
      varVal,
      cleanedString,
    );
    expect(cleanedString.cleaned).toEqual('Invalid Date 1 Jan 2018-1d-2d');

    expect(
      checkTriggerDate('a-1m-2d', [simpleTrigger], varVal)?.toDateString(),
    ).toEqual(undefined);
    cleanedString.cleaned = '';
    checkTriggerDate('a-1m-2d', [simpleTrigger], varVal, cleanedString);
    expect(cleanedString.cleaned).toEqual('Invalid Date a-1m-2d');

    expect(checkTriggerDate('nonsense', [simpleTrigger], varVal)).toEqual(
      undefined,
    );
    expect(
      checkTriggerDate(
        'nonsense<1 Nov 2018?1 Dec 2019:2 Dec 2019',
        [simpleTrigger],
        varVal,
      )?.toDateString(),
    ).toEqual(undefined);
    expect(
      checkTriggerDate(
        '1 Nov 2018<nonsense?1 Dec 2019:2 Dec 2019',
        [simpleTrigger],
        varVal,
      )?.toDateString(),
    ).toEqual(undefined);
    expect(
      checkTriggerDate(
        '2 Nov 2018<1 Nov 2018?1 Dec 2019:nonsense',
        [simpleTrigger],
        varVal,
      )?.toDateString(),
    ).toEqual(undefined);
  });
});
