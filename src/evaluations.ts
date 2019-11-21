import { checkData } from './checks';
import {
  annually,
  CASH_ASSET_NAME,
  cgt,
  conditional,
  cpi,
  crystallizedPension,
  incomeTax,
  monthly,
  nationalInsurance,
  pension,
  pensionSS,
  revalue,
  roiEnd,
  separator,
  taxPot,
  growth,
} from './stringConstants';
import {
  DatedThing,
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  Evaluation,
  Interval,
} from './types/interfaces';
import {
  getMonthlyGrowth,
  getSettings,
  getTriggerDate,
  log,
  printDebug,
  showObj,
  makeDateFromString,
} from './utils';

function parseRecurrenceString(recurrence: string) {
  const result = {
    frequency: '', // monthly or annual
    count: 0,
  };
  const l = recurrence.length;
  const lastChar = recurrence.substring(l - 1, l);
  // log(`lastChar of ${recurrence} is ${lastChar}`);
  if (lastChar === 'm') {
    result.frequency = monthly;
  } else if (lastChar === 'y') {
    result.frequency = annually;
  } else {
    log(`BUG!! frequency should be of form 4m or 6y not ${recurrence}`);
  }
  const firstPart = recurrence.substring(0, l - 1);
  // log(`firstPart of ${recurrence} is ${firstPart}`);
  const n = parseFloat(firstPart);
  if (n === undefined || Number.isNaN(n)) {
    log(`BUG!! frequency should be of form 4m or 6y not ${recurrence}`);
  }
  result.count = n;
  return result;
}

export function generateSequenceOfDates(
  roi: Interval,
  frequency: string /* e.g. 1m or 1y */,
  addPreDate = false,
): Date[] {
  const result: Date[] = [];
  const freq = parseRecurrenceString(frequency);

  if (addPreDate) {
    // add a pre-dates before roi
    const preDate = new Date(roi.start);
    if (frequency === '1m') {
      preDate.setMonth(preDate.getMonth() - 1);
    } else if (frequency === '1y') {
      preDate.setFullYear(preDate.getFullYear() - 1);
    } else {
      throw new Error(`BUG : frequency ${frequency} not implemented!`);
    }
    result.push(preDate);
  }

  // now add dates in roi, from start
  let numstepsAdvanced = 0;
  let thisDate = roi.start;
  while (thisDate < roi.end) {
    const newDate: Date = new Date(thisDate);
    result.push(newDate);

    // advance thisDate for the next transaction
    const nextDate = new Date(roi.start);
    numstepsAdvanced += freq.count;
    if (freq.frequency === monthly) {
      // log(`monthly dates for ${frequency}`);
      nextDate.setMonth(nextDate.getMonth() + numstepsAdvanced);
    } else if (freq.frequency === annually) {
      // log(`annual dates for ${frequency}`);
      nextDate.setFullYear(nextDate.getFullYear() + numstepsAdvanced);
    } else {
      throw new Error(`BUG : frequency ${frequency} not understood!`);
    }
    thisDate = nextDate;
  }
  // log(`return ${transactionMoments.length} transactionMoments`)
  return result;
}

export function generateTaxYearSequenceDates(roi: Interval): Date[] {
  const result: Date[] = [];

  let numYearsAdvanced = 0;
  let thisDate = roi.start;
  if (thisDate.getMonth() > 3 || thisDate.getDay() > 5) {
    thisDate.setFullYear(thisDate.getFullYear() + numYearsAdvanced);
  }
  thisDate.setMonth(3);
  thisDate.setDate(5);

  const stopBefore = roi.end;
  stopBefore.setFullYear(stopBefore.getFullYear() + 1);
  while (thisDate < stopBefore) {
    const newDate: Date = new Date(thisDate);
    result.push(newDate);

    // advance thisDate for the next transaction
    numYearsAdvanced += 1;
    const nextDate = new Date(roi.start);
    nextDate.setFullYear(nextDate.getFullYear() + numYearsAdvanced);

    thisDate = nextDate;
  }
  // log(`return ${transactionMoments.length} transactionMoments`)
  return result;
}

export const momentType = {
  expense: 'Expense',
  expenseStart: 'expenseStart',
  income: 'Income',
  incomeStart: 'IncomeStart',
  asset: 'Asset',
  assetStart: 'AssetStart',
  transaction: 'Transaction',
};

export function sortByDate(arrayOfDatedThings: DatedThing[]) {
  if (printDebug()) {
    log('before date sort --------------');
    arrayOfDatedThings.forEach(t => {
      log(`t.name = ${t.name}, ${t.type}, ${t.date}`);
    });
  }
  arrayOfDatedThings.sort((a, b) => {
    const ad = a.date; // getTriggerDate(a.date, triggers);
    const bd = b.date; // getTriggerDate(b.date, triggers);
    let result = 0;

    // the primary sort mechanism is the date
    // look for differences between defined / undefined
    // or both defined and one before the other
    if (ad !== undefined && bd === undefined) {
      result = -1;
    } else if (ad === undefined && bd !== undefined) {
      result = 1;
    } else if (ad !== undefined && bd !== undefined) {
      if (ad < bd) {
        result = 1;
      } else if (ad > bd) {
        result = -1;
      }
    }
    if (result === 0) {
      // dates are equal or both undefined
      // so we need some other way of distinguishing
      // special-case CASH status
      if (b.name === CASH_ASSET_NAME && a.name !== CASH_ASSET_NAME) {
        result = -1;
      } else if (a.name === CASH_ASSET_NAME && b.name !== CASH_ASSET_NAME) {
        result = 1;
      }
    }
    if (result === 0) {
      // dates equal, cash status matches
      // if an asset has started, that's a special case
      if (
        a.type === momentType.assetStart &&
        b.type !== momentType.assetStart
      ) {
        result = 1;
      } else if (
        b.type === momentType.assetStart &&
        a.type !== momentType.assetStart
      ) {
        result = -1;
      }
    }
    if (result === 0) {
      // dates equal, cash status equal, asset-start equal
      // pay attention to whether it's an asset
      if (a.type === momentType.asset && b.type !== momentType.asset) {
        result = 1;
      } else if (b.type === momentType.asset && a.type !== momentType.asset) {
        result = -1;
      }
    }
    if (result === 0) {
      // dates equal, cash status equal, asset-start equal
      // whether it's an asset is equal
      if (a.name < b.name) {
        result = 1;
      } else if (a.name > b.name) {
        result = -1;
      } else if (a.type < b.type) {
        result = 1;
      } else if (a.type > b.type) {
        result = -1;
      } else {
        result = 0;
      }
    }
    // log(`${showObj(a)} < ${showObj(b)} = ${result}`)
    return result;
  });

  if (printDebug()) {
    log('after date sort --------------');
    arrayOfDatedThings.forEach(t => {
      log(`t.name = ${t.name}, ${t.type}, ${t.date}`);
    });
  }
}

export const evaluationType = {
  expense: 'Expense',
  income: 'Income',
  asset: 'Asset',
};

function setValue(
  values: Map<string, number>,
  evaluations: Evaluation[],
  date: Date,
  name: string,
  newValue: number,
  source: string, // something that triggered the new value
) {
  if (printDebug()) {
    if (values.get(name) === undefined) {
      log(
        `setting first value of ${name}, ` +
          `date = ${date.toDateString()}, ` +
          `newValue = ${newValue}`,
      );
    } else {
      log(
        `setting value of ${name}, ` +
          `date = ${date.toDateString()}, ` +
          `newValue = ${newValue}`,
      );
    }
  }
  values.set(name, newValue);
  const evaln = {
    name,
    date,
    value: newValue,
    source,
  };
  // log(`add evaluation for ${name} at ${date}`);
  // log(`add evaluation ${showObj(evaln)}`);
  evaluations.push(evaln);
  if (printDebug()) {
    log(`date = ${date}, name = ${name}, value = ${values.get(name)}`);
  }
  if (printDebug()) {
    for (const key of values.keys()) {
      /* eslint-disable-line no-restricted-syntax */
      log(`values.get(${key}) = ${values.get(key)}`);
    }
  }
}

function diffMonths(d1: Date, d2: Date) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear() - 1) * 12;
  months += 12 - d1.getMonth();
  months += d2.getMonth() - 1;
  if (d1.getDate() <= d2.getDate()) {
    months += 1;
  }
  // log(`in diff, months = ${months}`);
  return months <= 0 ? 0 : months;
}

interface Moment {
  date: Date;
  name: string;
  type: string;
  setValue: number | undefined;
  transaction: DbTransaction | undefined;
}

export function getYearOfTaxYear(d: Date) {
  let startYearOfTaxYear;
  if (d.getMonth() > 3) {
    startYearOfTaxYear = d.getFullYear();
  } else if (d.getMonth() < 3) {
    startYearOfTaxYear = d.getFullYear() - 1;
  } else if (d.getDate() > 5) {
    startYearOfTaxYear = d.getFullYear();
  } else {
    startYearOfTaxYear = d.getFullYear() - 1;
  }
  // log(`tax year of ${d} = ${startYearOfTaxYear}`);
  // log(`details: d.getDate() = ${d.getDate()}, `+
  //  `d.getMonth() = ${d.getMonth()}, `+
  //  `d.getFullYear() = ${d.getFullYear()}, `);
  return startYearOfTaxYear;
}

function updateValueForCPI(
  dateSet: Date,
  dateNow: Date,
  origValue: number,
  cpiVal: number,
) {
  const numYears = dateNow.getFullYear() - dateSet.getFullYear();
  // log(`update tax bands after ${numYears} have passed at ${cpiVal} rate`)
  const result = Math.exp(
    Math.log(origValue) + numYears * Math.log(1.0 + cpiVal / 100.0),
  );
  // log(`update tax band from ${origValue} to ${result}`);
  return result;
}

const taxBandsSet = makeDateFromString('April 5 2018');
const noTaxBandSet = 12500;
const lowTaxBandSet = 50000;
const highTaxBandSet = 150000;

function calculateTaxPayable(income: number, d: Date, cpiVal: number) {
  // log(`in calculateTaxPayable`);
  let taxPayable = 0;

  const noTaxBand = updateValueForCPI(taxBandsSet, d, noTaxBandSet, cpiVal);
  const lowTaxBand = updateValueForCPI(taxBandsSet, d, lowTaxBandSet, cpiVal);
  const sizeOfLowTaxBand = lowTaxBand - noTaxBand;
  const highTaxBand = updateValueForCPI(taxBandsSet, d, highTaxBandSet, cpiVal);
  const sizeOfHighTaxBand = highTaxBand - lowTaxBand;

  const lowTaxRate = 0.2;
  const highTaxRate = 0.4;
  const topTaxRate = 0.45;

  // TODO
  // adjust noTaxBand for high incomes

  let incomeInNoTaxBand = 0;
  let incomeInLowTaxBand = 0;
  let incomeInHighTaxBand = 0;
  let incomeInTopTaxBand = 0;

  incomeInNoTaxBand = income;
  // test next band
  incomeInLowTaxBand = incomeInNoTaxBand - noTaxBand;
  // see if we have strayed into next band
  if (incomeInLowTaxBand > 0) {
    // we have some income in low tax band
    // cap income in no tax band
    incomeInNoTaxBand = noTaxBand;
    // test next band
    incomeInHighTaxBand = incomeInLowTaxBand - sizeOfLowTaxBand;
    // see if we have strayed into next band
    if (incomeInHighTaxBand > 0) {
      // we have some income in high tax band
      // cap income in low tax band
      incomeInLowTaxBand = sizeOfLowTaxBand;
      incomeInTopTaxBand = incomeInHighTaxBand - sizeOfHighTaxBand;
      // see if we have strayed into next band
      if (incomeInTopTaxBand > 0) {
        // we have some income in top tax band
        // cap income in high tax band
        incomeInHighTaxBand = sizeOfHighTaxBand;
      } else {
        // income falls into no, low and high tax bands
        incomeInTopTaxBand = 0;
      }
    } else {
      // income falls into no and low tax bands
      incomeInHighTaxBand = 0;
    }
  } else {
    // income falls into no tax band
    incomeInLowTaxBand = 0;
  }
  // log(`${income} = ${incomeInNoTaxBand} + `
  //   + `${incomeInLowTaxBand} + ${incomeInHighTaxBand} + `
  //   + `${incomeInTopTaxBand}`);

  taxPayable =
    lowTaxRate * incomeInLowTaxBand +
    highTaxRate * incomeInHighTaxBand +
    topTaxRate * incomeInTopTaxBand;

  // log(`taxPayable from income ${income} is ${taxPayable}`);
  return taxPayable;
}

const NIBandsSet = makeDateFromString('April 5 2018');
const noNIBandSet = 8628;
const lowNIBandSet = 50004;

function calculateNIPayable(income: number, d: Date, cpiVal: number) {
  // log(`in calculateNIPayable`);
  let NIPayable = 0;

  const noNIBand = updateValueForCPI(NIBandsSet, d, noNIBandSet, cpiVal);
  const lowNIBand = updateValueForCPI(NIBandsSet, d, lowNIBandSet, cpiVal);
  const sizeOfLowNIBand = lowNIBand - noNIBand;

  const lowNIRate = 0.12;
  const highNIRate = 0.02;

  let incomeInNoNIBand = 0;
  let incomeInLowNIBand = 0;
  let incomeInHighNIBand = 0;

  incomeInNoNIBand = income;
  // test next band
  incomeInLowNIBand = incomeInNoNIBand - noNIBand;
  // see if we have strayed into next band
  if (incomeInLowNIBand > 0) {
    // we have some income in low NI band
    // cap income in no NI band
    incomeInNoNIBand = noNIBand;
    // test next band
    incomeInHighNIBand = incomeInLowNIBand - sizeOfLowNIBand;
    // see if we have strayed into next band
    if (incomeInHighNIBand > 0) {
      // we have some income in high tax band
      // cap income in low tax band
      incomeInLowNIBand = sizeOfLowNIBand;
    } else {
      // income falls into no and low tax bands
      incomeInHighNIBand = 0;
    }
  } else {
    // income falls into no tax band
    incomeInLowNIBand = 0;
  }
  // log(`${income} = ${incomeInNoNIBand} + `
  //    + `${incomeInLowNIBand} + ${incomeInHighNIBand}`);

  NIPayable = lowNIRate * incomeInLowNIBand + highNIRate * incomeInHighNIBand;

  // log(`NI = ${lowNIRate * incomeInLowNIBand} + `
  //  + `${highNIRate * incomeInHighNIBand} = ${NIPayable}`);

  // log(`NIPayable from income ${income} is ${NIPayable}`);
  return NIPayable;
}

const CGTBandsSet = makeDateFromString('April 5 2018');
const noCGTBandSet = 12000;

function calculateCGTPayable(gain: number, d: Date, cpiVal: number) {
  // log(`in calculateCGTPayable`);
  const noCGTBand = updateValueForCPI(CGTBandsSet, d, noCGTBandSet, cpiVal);

  const CGTRate = 0.2;
  // TODO - this should depend on whether payer is high income tax payer

  if (gain < noCGTBand) {
    // log(`CGT not payable on ${gain}`);
    return 0.0;
  }

  const payable = CGTRate * (gain - noCGTBand);
  // log(`${payable} due as CGT`);
  return payable;
}

function adjustCash(
  amount: number,
  d: Date,
  values: Map<string, number>,
  evaluations: Evaluation[],
  source: string, // what led to the change
) {
  const cashValue = values.get(CASH_ASSET_NAME);
  if (cashValue === undefined) {
    // log('don't adjust undefined cash asset');
    // NB some tests have an expense and watch its value
    // without having a cash asset to decrement
  } else {
    // log('in adjustCash, setValue:');
    setValue(
      values,
      evaluations,
      d,
      CASH_ASSET_NAME,
      cashValue + amount,
      source,
    );
  }
}

function payIncomeTax(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: Map<string, number>,
  evaluations: Evaluation[],
  source: string, // e.g. IncomeTaxJoe
) {
  // log(`pay income tax on ${income} for date ${startOfTaxYear}`);
  // calculate tax liability
  const taxDue = calculateTaxPayable(income, startOfTaxYear, cpiVal);
  // log(`taxDue for ${source} on ${startOfTaxYear} = ${taxDue}`);
  if (taxDue > 0) {
    // log('in payIncomeTax, adjustCash:');
    adjustCash(-taxDue, startOfTaxYear, values, evaluations, source);
    let taxValue = values.get(taxPot);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log('in adjustCash, setValue:');
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + taxDue,
      source,
    );
  }
  return taxDue; // for information only - cash already adjusted
}

function payNI(
  startOfTaxYear: Date,
  income: number,
  cpiVal: number,
  values: Map<string, number>,
  evaluations: Evaluation[],
  source: string, // e.g. NIJoe
) {
  // log(`pay NI on ${income} for date ${startOfTaxYear}`);
  // calculate NI liability
  const NIDue = calculateNIPayable(income, startOfTaxYear, cpiVal);
  // log(`taxDue = ${taxDue}`);
  if (NIDue > 0) {
    // log('in payNI, adjustCash:');
    adjustCash(-NIDue, startOfTaxYear, values, evaluations, source);

    let taxValue = values.get(taxPot);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log('in adjustCash, setValue:');
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + NIDue,
      source,
    );
  }
  return NIDue; // just for information/debugging
}

function payCGT(
  startOfTaxYear: Date,
  gain: number,
  cpiVal: number,
  values: Map<string, number>,
  evaluations: Evaluation[],
  source: string, // e.g. 'CGTJoe'
) {
  // log(`pay CGT on ${gain} for date ${startOfTaxYear}`);
  // calculate CGT liability
  // TODO should pass in whether high rate income tax next
  const CGTDue = calculateCGTPayable(gain, startOfTaxYear, cpiVal);
  // log(`taxDue = ${taxDue}`);
  if (CGTDue > 0) {
    // log('in payCGT, adjustCash:');
    adjustCash(-CGTDue, startOfTaxYear, values, evaluations, source);
    let taxValue = values.get(taxPot);
    if (taxValue === undefined) {
      taxValue = 0.0;
    }
    // log('in adjustCash, setValue:');
    setValue(
      values,
      evaluations,
      startOfTaxYear,
      taxPot,
      taxValue + CGTDue,
      source,
    );
  }
}
function OptimizeIncomeTax(
  date: Date,
  cpiVal: number,
  amount: number,
  values: Map<string, number>,
  person: string,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  evaluations: Evaluation[],
) {
  // log(`settle up income tax for ${person} and ${amount} on ${date}`);
  const noTaxBand = updateValueForCPI(taxBandsSet, date, noTaxBandSet, cpiVal);
  if (amount > noTaxBand) {
    return;
  }
  const unusedAllowance = noTaxBand - amount;
  // if we have unused allowance, see
  // have we got some crystallised pension we can use?
  for (const valueKey of values.keys()) {
    /* eslint-disable-line no-restricted-syntax */
    // log(`values.get(${key}) = ${values.get(key)}`);
    if (valueKey.startsWith(crystallizedPension)) {
      // is it for the right person?
      const liability = `${incomeTax}${valueKey.substr(
        crystallizedPension.length,
      )}`;
      // e.g. IncomeTaxJoe
      // log(`liability = ${liability}`);
      if (liability === person) {
        let amountToTransfer = unusedAllowance;
        const pensionVal = values.get(valueKey);
        if (pensionVal === undefined) {
          log('BUG!!! pension has no value');
          return;
        }
        if (amountToTransfer > pensionVal) {
          amountToTransfer = pensionVal;
        }
        // log(`to use allowance, on ${date}, '
        //  +'move ${amountToTransfer} from ${valueKey}`);
        const personAmountMap = liableIncomeInTaxYear.get('income');
        if (personAmountMap === undefined) {
          log('BUG!!! person has no liability');
          return;
        }
        const cashVal = values.get(CASH_ASSET_NAME);
        if (cashVal === undefined) {
          log('BUG!!! cash has no value');
        } else {
          personAmountMap.set(person, amount + amountToTransfer);

          // log(`valueKey = ${valueKey}`);
          // log(`liability = ${liability}`);
          // log('in settleIncomeTax, setValue:');
          setValue(
            values,
            evaluations,
            date,
            CASH_ASSET_NAME,
            cashVal + amountToTransfer,
            valueKey,
          ); // e.g. 'CrystallizedPensionNorwich'
          setValue(
            values,
            evaluations,
            date,
            valueKey,
            pensionVal - amountToTransfer,
            liability,
          ); // e.g. 'IncomeTaxJoe'
        }
      }
    }
  }
}

function settleUpTax(
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  startYearOfTaxYear: number,
  cpiVal: number,
  values: Map<string, number>,
  evaluations: Evaluation[],
) {
  const date = new Date(startYearOfTaxYear + 1, 3, 5);
  // before going to pay income tax,
  // see if there's a wise move to use up unused income tax allowance
  // for each person
  for (const [key, value] of liableIncomeInTaxYear) {
    /* eslint-disable-line no-restricted-syntax */
    if (key === 'income' && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        OptimizeIncomeTax(
          date,
          cpiVal,
          amount,
          values,
          person,
          liableIncomeInTaxYear,
          evaluations,
        );
      }
    }
  }

  for (const [key, value] of liableIncomeInTaxYear) {
    /* eslint-disable-line no-restricted-syntax */
    if (key === 'income' && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        // log(`go to pay income tax for ${person}`);
        const taxPaid = payIncomeTax(
          date,
          amount,
          cpiVal,
          values,
          evaluations,
          person, // e.g. IncomeTaxJoe
        );
        if (printDebug()) {
          log(`${person} paid income tax ${taxPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    } else if (key === nationalInsurance && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        const NIPaid = payNI(
          new Date(startYearOfTaxYear + 1, 3, 5),
          amount,
          cpiVal,
          values,
          evaluations,
          person,
        ); // e.g. 'NIJoe'
        if (printDebug()) {
          log(`${person} paid NI ${NIPaid} for ${date}`);
        }
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    } else if (key === 'cgt' && value !== undefined) {
      for (const [person, amount] of value) {
        /* eslint-disable-line no-restricted-syntax */
        payCGT(
          new Date(startYearOfTaxYear + 1, 3, 5),
          amount,
          cpiVal,
          values,
          evaluations,
          person,
        ); // e.g. 'CGTJoe'
        // log('resetting liableIncomeInTaxYear');
        value.set(person, 0);
      }
    }
  }
}

function handleLiability(
  liability: any,
  type: string, // "income" or "NI"
  incomeValue: number,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  let map = liableIncomeInTaxYear.get(type);
  if (map === undefined) {
    // set up a map to collect accumulations for type
    liableIncomeInTaxYear.set(type, new Map<string, number>());
    map = liableIncomeInTaxYear.get(type);
  }
  if (map !== undefined) {
    // log this amount in the accumulating total
    let taxLiability = map.get(liability);
    if (taxLiability === undefined) {
      taxLiability = 0;
    }
    // log(`${liability} accumulate ${incomeValue} into ${taxLiability}`);
    const newLiability = taxLiability + incomeValue;
    map.set(liability, newLiability);
    // log(`${type} accumulated ${liability} liability = ${newLiability}`);
  }
}

function handleIncome(
  incomeValue: number,
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
  triggers: DbTrigger[],
  pensionTransactions: DbTransaction[],
  liabilitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
  sourceDescription: string,
) {
  // log(`handle income value = ${incomeValue}`);

  // default income increment is all of the income
  let amountForCashIncrement = incomeValue;
  let amountForIncomeTax = incomeValue;
  let amountForNI = incomeValue;
  // some types of pension scheme reduce NI liability

  if (moment.type === momentType.asset) {
    // asset growth does not transfer money into cash
    amountForCashIncrement = 0;
  }
  pensionTransactions.forEach(transaction => {
    const tFromValue = parseFloat(transaction.FROM_VALUE);
    const tToValue = parseFloat(transaction.TO_VALUE);

    if (getTriggerDate(transaction.DATE, triggers) > moment.date) {
      return;
    }
    // log(`see if ${showObj(transaction)} should affect `
    //  +`this handleIncome moment ${showObj(moment)}`);
    if (moment.name === transaction.FROM) {
      // log(`matched transaction ${showObj(transaction)}`);

      let cashToDivert = 0;
      if (transaction.FROM_ABSOLUTE) {
        cashToDivert = tFromValue;
      } else {
        // e.g. employee chooses 5% pension contribution
        cashToDivert = tFromValue * amountForCashIncrement;
        // log(`cashToDivert = ${transaction.FROM_VALUE} * ${amountForCashIncrement}`);
      }
      amountForCashIncrement -= cashToDivert;
      amountForIncomeTax -= cashToDivert;

      if (transaction.NAME.startsWith(pensionSS)) {
        amountForNI -= cashToDivert;
      }

      let amountForPension = 0;
      if (transaction.TO_ABSOLUTE) {
        amountForPension = tToValue;
      } else {
        // e.g. employer increments employee's pension contribution
        amountForPension = tToValue * cashToDivert;
      }
      let pensionValue = values.get(transaction.TO);
      if (transaction.TO === '') {
        if (printDebug()) {
          log('pension contributions going into void');
        }
      } else if (pensionValue === undefined) {
        log('BUG : contributing to undefined pension scheme');
      } else {
        pensionValue += amountForPension;
        // log(`new pensionValue is ${pensionValue}`);
        // log(`income source = ${transaction.NAME}`);
        // log('in handleIncome, setValue:');
        setValue(
          values,
          evaluations,
          moment.date,
          transaction.TO,
          pensionValue,
          transaction.NAME,
        );
      }
    }
  });

  // pay income into cash
  if (amountForCashIncrement > 0) {
    // log(`cash source = ${sourceDescription}`);
    // log('in handleIncome, adjustCash:');
    adjustCash(
      amountForCashIncrement,
      moment.date,
      values,
      evaluations,
      sourceDescription,
    );
  }

  // log(`look for ${moment.name} in liabilitiesMap`);
  const liabilityList = liabilitiesMap.get(moment.name); // e.g. "IncomeTaxJoe, NIJoe"
  // log(`liabilityList = ${liabilityList}`);
  if (liabilityList !== undefined) {
    const words: string[] = liabilityList.split(separator);
    words.forEach(liability => {
      // log(`liability = ${liability}`);
      if (liability.startsWith(incomeTax)) {
        // log(`IncomeTax due on ${amountForIncomeTax} for ${showObj(moment.name)}`);
        handleLiability(
          liability,
          'income',
          amountForIncomeTax,
          liableIncomeInTaxYear,
        );
      }
      if (liability.startsWith(nationalInsurance)) {
        // log(`NI moment is ${showObj(moment.name)} amount ${amountForNI}`);
        handleLiability(
          liability,
          nationalInsurance,
          amountForNI,
          liableIncomeInTaxYear,
        );
      }
    });
  }
}

function logExpenseGrowth(
  expense: DbExpense,
  cpiVal: number,
  growths: Map<string, number>,
) {
  const expenseGrowth = parseFloat(expense.GROWTH);
  const monthlyInf = expense.CPI_IMMUNE
    ? getMonthlyGrowth(expenseGrowth)
    : getMonthlyGrowth(expenseGrowth + cpiVal);
  growths.set(expense.NAME, monthlyInf);
}

function logIncomeGrowth(
  income: DbIncome,
  cpiVal: number,
  growths: Map<string, number>,
) {
  const incomeGrowth = parseFloat(income.GROWTH);
  const monthlyInf = income.CPI_IMMUNE
    ? getMonthlyGrowth(incomeGrowth)
    : getMonthlyGrowth(incomeGrowth + cpiVal);
  // log(`for ${income.NAME}, monthly infl is ${monthlyInf}`);
  growths.set(income.NAME, monthlyInf);
}

function logAssetGrowth(
  asset: DbAsset,
  cpiVal: number,
  growths: Map<string, number>,
  settings: DbSetting[],
) {
  // log(`stored growth is ${asset.GROWTH}`);
  let growth: number = parseFloat(asset.GROWTH);
  // log(`growth is ${growth}`);
  if (Number.isNaN(growth)) {
    // log(`growth is recognised as NaN`);
    let settingVal = getSettings(settings, asset.GROWTH, 'None');
    // log(`setting value for ${asset.GROWTH} is ${settingVal}`);
    if (settingVal === 'None') {
      log(`BUG : no setting value for asset growth ${asset.GROWTH}`);
      settingVal = '0.0';
    }
    growth = parseFloat(settingVal);
    if (Number.isNaN(growth)) {
      if (settingVal === 'None') {
        log(
          'BUG : cant parse setting value for asset growth ' +
            `${asset.GROWTH} = ${settingVal}`,
        );
        growth = 0.0;
      }
    }
  } else {
    // log(`growth is not recognised as a NaN - assume parseFloat gave something useful`);
  }
  // log(`annual growth before cpi adjustment is ${growth}`);
  const monthlyInf = asset.CPI_IMMUNE
    ? getMonthlyGrowth(growth)
    : getMonthlyGrowth(growth + cpiVal);
  // log(`monthly growth is ${monthlyInf}`);
  growths.set(asset.NAME, monthlyInf);
}

function getGrowth(name: string, growths: Map<string, number>) {
  let result = growths.get(name);
  if (result === undefined) {
    log(`Bug : Undefined growth value for ${name}!`);
    result = 0.0;
  }
  return result;
}

function getMonthlyMoments(
  x: {
    // could be an income or an expense
    NAME: string;
    START: string; // trigger string
    END: string; // trigger string
    VALUE: string;
    VALUE_SET: string; // trigger string
  },
  type: string,
  monthlyInf: number,
  triggers: DbTrigger[],
  rOIEndDate: Date,
) {
  let endDate = getTriggerDate(x.END, triggers);
  if (rOIEndDate < endDate) {
    endDate = rOIEndDate;
  }
  const roi = {
    start: getTriggerDate(x.START, triggers),
    end: endDate,
  };
  const dates = generateSequenceOfDates(roi, '1m');
  const newMoments: Moment[] = dates.map(date => {
    const result: Moment = {
      date,
      name: x.NAME,
      type,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });

  // Set up special values in the first value.
  // This will be the first instance, the value may need advancing
  // by monthlyInf from date at which the value was set
  // (can be before the expense ever kicks in).
  if (newMoments.length > 0) {
    if (type === momentType.expense) {
      newMoments[0].type = momentType.expenseStart;
    } else if (type === momentType.income) {
      newMoments[0].type = momentType.incomeStart;
    }
    let startVal = parseFloat(x.VALUE);
    // take account of VALUE_SET and CPI+GROWTH
    const from = getTriggerDate(x.VALUE_SET, triggers);
    const to = getTriggerDate(x.START, triggers);
    if (from > to) {
      log(`BUG : income/expense start value set after start date ${x.NAME}`);
    }
    // log(`${x.NAME} grew between ${from} and ${to}`);
    const numMonths = diffMonths(from, to);
    // log(`numMonths = ${numMonths}`);
    // log(`there are ${numMonths} months between `
    //   +`${x.VALUE_SET} and ${x.START}`)
    // apply monthlyInf
    // log(`before growth on x start value : ${startVal}`);
    for (let i = 0; i < numMonths; i += 1) {
      startVal *= 1.0 + monthlyInf;
      // log(`applied growth to x start value : ${startVal}`);
    }
    newMoments[0].setValue = startVal;
  }
  // log(`generated ${newMoments.length} moments for ${x.NAME}`);
  return newMoments;
}

function getAssetMonthlyMoments(
  asset: DbAsset,
  triggers: DbTrigger[],
  rOIEndDate: Date,
) {
  const roi = {
    start: getTriggerDate(asset.START, triggers),
    end: rOIEndDate,
  };
  // log(`roi = ${showObj(roi)}`)
  const dates = generateSequenceOfDates(roi, '1m');
  // log(`dates = ${showObj(dates)}`)
  const newMoments = dates.map(date => {
    const result: Moment = {
      date,
      name: asset.NAME,
      type: momentType.asset,
      setValue: 0,
      transaction: undefined,
    };
    return result;
  });
  if (newMoments.length > 0) {
    newMoments[0].type = momentType.assetStart;
    newMoments[0].setValue = parseFloat(asset.VALUE);
  }
  return newMoments;
}

function getTransactionMoments(
  transaction: DbTransaction,
  triggers: DbTrigger[],
  rOIEndDate: Date,
) {
  const newMoments: Moment[] = [];
  if (transaction.NAME.startsWith(pension)) {
    // we don't track pension actions here
    // (see pensionTransactions, reviewed during processIncome)
    return newMoments;
  }
  const recurrenceGiven = transaction.RECURRENCE.length > 0;
  if (recurrenceGiven) {
    // create a sequence of moments
    // use ROI to limit number of moments generated
    let stop = rOIEndDate;
    if (transaction.STOP_DATE !== '') {
      const transStop = getTriggerDate(transaction.STOP_DATE, triggers);
      if (stop > transStop) {
        stop = transStop;
      }
    }
    const sequenceRoi: Interval = {
      start: getTriggerDate(transaction.DATE, triggers),
      end: stop,
    };
    const transactionDates = generateSequenceOfDates(
      sequenceRoi,
      transaction.RECURRENCE,
    );
    transactionDates.forEach(d => {
      newMoments.push({
        name: transaction.NAME,
        date: d,
        type: momentType.transaction,
        setValue: undefined,
        transaction,
      });
    });
  } else {
    const date = getTriggerDate(transaction.DATE, triggers);
    if (date < rOIEndDate) {
      newMoments.push({
        name: transaction.NAME,
        date,
        type: momentType.transaction,
        transaction,
        setValue: undefined,
      });
    }
  }
  return newMoments;
}

// TODO consider an attribute on assets which
// tells us this.  For now, allo cash and mortgages
// to go negative at will.
function assetAllowedNegative(assetName: string) {
  return (
    assetName === CASH_ASSET_NAME ||
    assetName.includes('mortgage') ||
    assetName.includes('Mortgage')
  );
}

function revalueApplied(
  t: DbTransaction,
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
) {
  if (!t.NAME.startsWith(revalue)) {
    return false;
  }
  // log(`it's a revaluation`)
  if (t.FROM !== '') {
    log(
      'WARNING : FROM supplied but no used ' +
        `for a revaluation transaction ${showObj(t)}`,
    );
  }
  let tToValue = parseFloat(t.TO_VALUE);
  const words = t.TO.split(separator);
  words.forEach(w => {
    if (!t.TO_ABSOLUTE) {
      const prevValue = values.get(w);
      if (prevValue === undefined) {
        log(
          'WARNING : proportional value supplied' +
            ' for a revaluation transaction' +
            ` with no prev value ${showObj(t)}`,
        );
      } else {
        tToValue = prevValue * parseFloat(t.TO_VALUE);
      }
    }
    // log(`passing ${t.TO_VALUE} as new value of ${moment.name}`);
    // log('in revalueApplied, setValue:');
    setValue(values, evaluations, moment.date, w, tToValue, revalue);
  });
  return true;
}

function calculateFromChange(
  t: DbTransaction,
  preToValue: number | undefined,
  preFromValue: number,
  fromWord: string,
): number | undefined {
  const tFromValue = parseFloat(t.FROM_VALUE);
  const tToValue = parseFloat(t.TO_VALUE);

  let fromChange = 0;
  // log(`t.FROM_VALUE = ${t.FROM_VALUE}`)
  if (t.NAME.startsWith(conditional) && preToValue === undefined) {
    throw new Error(
      `Bug : conditional transaction to undefined value ${showObj(t)}`,
    );
  } else if (
    t.NAME.startsWith(conditional) &&
    preToValue !== undefined &&
    preToValue >= 0
  ) {
    // don't need to perform this transaction
    // no need to 'maintain' value of to-asset
    // as it's already >= 0
    // log(`no need to maintain ${t.TO} from ${t.FROM} `
    //   +`as targetValue = ${targetValue}`)
    return undefined;
  } else if (t.FROM_ABSOLUTE) {
    fromChange = tFromValue;
    if (
      t.NAME.startsWith(conditional) &&
      preToValue !== undefined &&
      !t.TO_ABSOLUTE &&
      preToValue > -fromChange * tToValue
    ) {
      // log(`cap conditional amount - we only need ${preToValue}`);
      fromChange = -preToValue / tToValue;
    }
  } else {
    // relative amounts behave differently for conditionals
    if (t.NAME.startsWith(conditional) && !t.TO_ABSOLUTE) {
      if (preToValue !== undefined) {
        // proportion of target
        // log(`use proportion of target amount; proportion of ${preToValue}`);
        fromChange = (-preToValue * tFromValue) / tToValue;
      }
    } else {
      // proportion of source
      // log(`use proportion of source amount; proportion of ${preFromValue}`);
      fromChange = preFromValue * tFromValue;
    }
  }
  // Allow some assets to become negative but not others
  if (!assetAllowedNegative(fromWord) && fromChange > preFromValue) {
    if (t.NAME.startsWith(conditional)) {
      // transfer as much as we have
      // log(`transfer only ${value} because we don't have ${fromChange}`);
      fromChange = preFromValue;
    } else {
      // don't transfer anything
      // log(`don't apply transaction from ${fromWord} `
      // +`because value ${preFromValue} < ${fromChange} `);
      return undefined;
    }
  }
  if (fromWord !== undefined) {
    if (!assetAllowedNegative(fromWord) && preFromValue <= 0) {
      // we cannot help
      return undefined;
    }
  }
  // log(`fromChange = ${fromChange}`);
  return fromChange;
}

function calculateToChange(
  t: DbTransaction,
  preToValue: number | undefined,
  fromChange: number | undefined,
  moment: Moment,
) {
  let toChange = 0;
  if (t.TO === '') {
    return toChange;
  }
  const tToValue = parseFloat(t.TO_VALUE);
  // log(`t.TO = ${t.TO}`)
  // log(`before transaction, toValue = ${toValue}`)
  if (preToValue === undefined) {
    throw new Error(`Bug : transacting to unvalued asset ${showObj(moment)}`);
  }
  // log(`t.TO_VALUE = ${t.TO_VALUE}`);
  if (t.TO_ABSOLUTE) {
    toChange = tToValue;
  } else {
    if (fromChange === undefined) {
      throw new Error(
        'Bug : transacting to proportion of undefined fromChange' +
          `${showObj(moment)}`,
      );
    }
    // proportion of the amount taken from from_asset
    toChange = tToValue * fromChange;
  }
  return toChange;
}

function handleCGTLiability(
  t: DbTransaction,
  fromWord: string,
  preFromValue: number,
  fromChange: number,
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // log(`${fromWord} reducing from ${value} by ${fromChange}`);
  // log(`liabilites are ${liabliitiesMap.get(fromWord}`);
  const liabilities = liabliitiesMap.get(fromWord);
  if (liabilities === undefined) {
    return;
  }
  const liabilityWords = liabilities.split(separator);
  // log(`liabilityWords = ${liabilityWords}`);
  const cgtLiability = liabilityWords.find(word => word.startsWith(cgt));
  // log(`cgtLiability = ${cgtLiability}`);
  if (cgtLiability === undefined) {
    return;
  }
  const proportionSale = fromChange / preFromValue;
  const purchasePrice = values.get(`Purchase${fromWord}`);
  if (purchasePrice !== undefined) {
    const totalGain = preFromValue - purchasePrice;
    // log(`totalGain = ${totalGain}`);
    const proportionGain = totalGain * proportionSale;
    // log(`proportionGain = ${proportionGain}`);
    let cgtMap = liableIncomeInTaxYear.get('cgt');
    if (cgtMap === undefined) {
      liableIncomeInTaxYear.set('cgt', new Map<string, number>());
      cgtMap = liableIncomeInTaxYear.get('cgt');
    }
    if (cgtMap !== undefined) {
      let currentcgtVal = cgtMap.get(cgtLiability);
      if (currentcgtVal === undefined) {
        currentcgtVal = 0.0;
      }
      currentcgtVal += proportionGain;
      cgtMap.set(cgtLiability, currentcgtVal);
      // log(`logged cgt for ${cgtLiability}, accumulated value ${currentcgtVal}`);
    }
    const newPurchasePrice = purchasePrice * (1 - proportionSale);
    // when selling some asset, we reduce the Purchase value
    // of what's left for CGT purposes
    // log('in handleCGTLiability, setValue:');
    setValue(
      values,
      evaluations,
      moment.date,
      `Purchase${fromWord}`,
      newPurchasePrice,
      t.NAME, // TODO no test??
    );
  } else {
    log('BUG!! - CGT liability on an asset with no record of purchase price');
  }
}

export function makeSourceForFromChange(t: DbTransaction) {
  let sourceDescription = t.NAME;
  if (sourceDescription.startsWith(conditional)) {
    sourceDescription = sourceDescription.substr(conditional.length + 1);
  }
  // log(`sourceDescription = ${sourceDescription}`);
  return sourceDescription;
}

export function makeSourceForToChange(t: DbTransaction, fromWord: string) {
  let source = t.NAME;
  if (source.startsWith(conditional)) {
    source = fromWord;
  }
  return source;
}

function processTransactionFromTo(
  t: DbTransaction,
  fromWord: string,
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
  triggers: DbTrigger[],
  pensionTransactions: DbTransaction[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // log(`processTransactionFromTo takes in ${t.NAME}`);
  const preFromValue = values.get(fromWord);
  const preToValue = values.get(t.TO);

  // handle conditional transactions
  // Conditions on source/from:
  //   UseUp (move money if source > 0)  not coded
  //   this is linked to - which assets may become -ve?
  // Condition on target/to:
  //   Maintain (move money there if target < 0)
  //   Payoff / repay (move money there if target < 0)

  let fromChange;
  if (preFromValue !== undefined) {
    fromChange = calculateFromChange(t, preToValue, preFromValue, fromWord);
    // Transaction is permitted to be blocked by the calculation
    // of fromChange - e.g. if it would require an asset to become
    // a not-premitted value (e.g. shares become negative).
    if (fromChange === undefined) {
      return;
    }
  }

  // Determine how to change the To asset.
  let toChange;
  if (preToValue !== undefined) {
    toChange = calculateToChange(t, preToValue, fromChange, moment);
  }

  // apply fromChange
  if (fromChange !== undefined && preFromValue !== undefined) {
    handleCGTLiability(
      t,
      fromWord,
      preFromValue,
      fromChange,
      moment,
      values,
      evaluations,
      liabliitiesMap,
      liableIncomeInTaxYear,
    );
    // log(`reduce ${fromWord}'s ${preFromValue} by ${fromChange}`);
    // log('in processTransactionFromTo, setValue:');
    setValue(
      values,
      evaluations,
      moment.date,
      fromWord,
      preFromValue - fromChange,
      makeSourceForFromChange(t),
    );
  }

  // apply toChange
  if (toChange !== undefined) {
    // special case - if we're transacting out of
    // something called CrystallizedPension* into CASH_ASSET_NAME
    // then we should treat this as an income
    // (it's liable to income tax)
    // log(`transacting ${fromChange} from ${fromWord}
    // into ${t.TO}`);
    if (fromWord.startsWith(crystallizedPension) && t.TO === CASH_ASSET_NAME) {
      // log(`register ${toChange} pension withdrawal as liable for income tax`);
      handleIncome(
        toChange,
        moment,
        values,
        evaluations,
        triggers,
        pensionTransactions,
        liabliitiesMap,
        liableIncomeInTaxYear,
        fromWord,
      );
    } else {
      if (preToValue === undefined) {
        throw new Error(
          'Bug : transacting to adjust undefined toValue' +
            `${showObj(moment)}`,
        );
      }
      // log('in processTransactionFromTo, setValue:');
      setValue(
        values,
        evaluations,
        moment.date,
        t.TO,
        preToValue + toChange,
        makeSourceForToChange(t, fromWord),
      );
    }
  }
}

function processTransactionTo(
  t: DbTransaction,
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
) {
  if (!t.FROM_ABSOLUTE) {
    throw new Error(
      `BUG : transacting from a proportional amount of undefined ${showObj(t)}`,
    );
  }
  const tToValue = parseFloat(t.TO_VALUE);
  const fromChange = parseFloat(t.FROM_VALUE);
  // Determine how much to add to the To asset.
  // Set the increased value of the To asset accordingly.
  // log(`t.TO = ${t.TO}`)
  let value = values.get(t.TO);
  // log(`before transaction, value = ${value}`)
  if (value === undefined) {
    throw new Error(`Bug : transacting to unvalued asset ${showObj(moment)}`);
  } else {
    let change = 0;
    // log(`t.TO_VALUE = ${t.TO_VALUE}`);
    if (t.TO_ABSOLUTE) {
      change = tToValue;
    } else {
      if (tToValue > 1.0) {
        log(`WARNING : not-absolute value ${tToValue} > 1.0`);
      }
      // proportion of the amount taken from from_asset
      change = tToValue * fromChange;
    }
    // log(`fromChange for the "TO" part of this transaction = ${fromChange}`);
    value += change;
    // log('in processTransactionTo, setValue:');
    setValue(values, evaluations, moment.date, t.TO, value, t.NAME);
  }
}

function processTransactionMoment(
  moment: Moment,
  values: Map<string, number>,
  evaluations: Evaluation[],
  triggers: DbTrigger[],
  pensionTransactions: DbTransaction[],
  liabliitiesMap: Map<string, string>,
  liableIncomeInTaxYear: Map<string, Map<string, number>>,
) {
  // transactions have a direct effect on their
  // "from" and "to" assets.  Apply the transaction
  // and set new asset values.
  const t = moment.transaction;
  if (t === undefined) {
    throw Error('BUG!!! moment of type transaction should have a transaction');
  }
  // log(`process transaction ${showObj(t)}`);

  // Some transactions are simple Revalues.  They have no
  // FROM and a value for TO.  Code similar to application
  // of growth to assets, except we know the new value.
  if (revalueApplied(t, moment, values, evaluations)) {
    return;
  }

  // todo for a conditional transactions from a list
  // of sources, use something like this
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
  // and remember a cumulative amount that's been transferred
  // so we stop at the absolute total for the list

  // Determine how much to take off the From asset(s).
  // Set the reduced value of the From asset accordingly.
  if (t.FROM !== '') {
    // we can sometimes see multiple 'FROM's
    // handle one word at a time TODO make comma-separated!
    const words = t.FROM.split(separator);
    words.forEach(fromWord => {
      // log(`process a transaction from ${fromWord}`);
      processTransactionFromTo(
        t,
        fromWord,
        moment,
        values,
        evaluations,
        triggers,
        pensionTransactions,
        liabliitiesMap,
        liableIncomeInTaxYear,
      );
    });
  } else if (t.FROM === '' && t.TO !== '') {
    processTransactionTo(t, moment, values, evaluations);
  }
}

function logPensionIncomeLiabilities(
  t: DbTransaction,
  liabilitiesMap: Map<string, string>,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  const words = t.FROM.split(separator);
  words.forEach(word => {
    if (word.startsWith(crystallizedPension)) {
      const liability = `${incomeTax}${word.substr(
        crystallizedPension.length,
      )}`;
      // e.g. IncomeTaxJoe
      // log(`logging liability for crystallized pension ${liability}`);
      liabilitiesMap.set(t.NAME, liability);
    }
  });
}

function logAssetIncomeLiabilities(
  a: DbAsset,
  liabilitiesMap: Map<string, string>,
) {
  // log(`see if ${t.NAME} needs a tax liability`);
  // e.g. CrystallizedPensionJoe
  if (a.LIABILITY !== '') {
    // log(`logging liability ${showObj(a)}`);
    liabilitiesMap.set(a.NAME, a.LIABILITY);
  } else if (a.NAME.startsWith(crystallizedPension)) {
    const liability = `${incomeTax}${a.NAME.substr(
      crystallizedPension.length,
    )}`;
    // e.g. IncomeTaxJoe
    liabilitiesMap.set(a.NAME, liability);
  }
}

function logPurchaseValues(
  a: DbAsset,
  values: Map<string, number>,
  evaluations: Evaluation[],
  triggers: DbTrigger[],
) {
  if (a.LIABILITY.includes(cgt)) {
    // log('in logPurchaseValues, setValue:');
    setValue(
      values,
      evaluations,
      getTriggerDate(a.START, triggers),
      `Purchase${a.NAME}`,
      parseFloat(a.PURCHASE_PRICE),
      `Purchase${a.NAME}`,
    );
  }
}

// This is the key entry point for code calling from outside
// this file.
export function getEvaluations(data: DbModelData): Evaluation[] {
  const message = checkData(data);
  if (message.length > 0) {
    log(message);
    const result: Evaluation[] = [];
    return result;
  }
  // log('in getEvaluations');
  const roiEndDate: Date = makeDateFromString(
    getSettings(data.settings, roiEnd, '1 Jan 1999'),
  );

  if (printDebug()) {
    log(`data = ${showObj(data)}`);
  }

  // Calculate a set of "moments" for each transaction/income/expense...
  // each has a date - we'll process these in date order.
  let allMoments: Moment[] = [];

  // Calculate a monthly growth once per item,
  // refer to this map for each indiviual moment.
  const growths = new Map<string, number>([]);

  // Record which items are liable for income tax.
  // Map from income name to a person identifier.
  // (e.g. "PaperRound", "IncomeTaxJane").
  // (e.g. "PaperRound", "NIJane").
  // (e.g. "get some pension", "IncomeTaxJoe" )
  const liabilitiesMap = new Map<string, string>([]);

  // Some transactions affect income processing.
  const pensionTransactions: DbTransaction[] = [];

  // Keep track of current value of any expense, income or asset
  const values = new Map<string, number>([]);

  const cpiInitialVal: number = parseFloat(
    getSettings(data.settings, cpi, '0.0'),
  );
  values.set(cpi, cpiInitialVal);

  // A historical record of evaluations (useful for creating trends or charts)
  const evaluations: Evaluation[] = [];

  // For each expense, work out monthly growth and
  // a set of moments starting when the expense began,
  // ending when the roi ends.
  data.expenses.forEach(expense => {
    logExpenseGrowth(expense, cpiInitialVal, growths);
    const monthlyInf = getGrowth(expense.NAME, growths);
    const newMoments = getMonthlyMoments(
      expense,
      momentType.expense,
      monthlyInf,
      data.triggers,
      roiEndDate,
    );
    allMoments = allMoments.concat(newMoments);
  });

  // For each income, work out monthly growth and
  // a set of moments starting when the income began,
  // ending when the roi ends.
  data.incomes.forEach(income => {
    logIncomeGrowth(income, cpiInitialVal, growths);
    const monthlyInf = getGrowth(income.NAME, growths);
    const newMoments = getMonthlyMoments(
      income,
      momentType.income,
      monthlyInf,
      data.triggers,
      roiEndDate,
    );
    allMoments = allMoments.concat(newMoments);
    liabilitiesMap.set(income.NAME, income.LIABILITY);
  });

  // log(`liabilitiesMap = ...`);
  // liabilitiesMap.forEach((value, key)=>{log(`{\`${key}\`, \`${value}\`}`)});

  data.assets.forEach(asset => {
    logAssetGrowth(asset, cpiInitialVal, growths, data.settings);
    const newMoments = getAssetMonthlyMoments(asset, data.triggers, roiEndDate);
    allMoments = allMoments.concat(newMoments);

    logAssetIncomeLiabilities(asset, liabilitiesMap);

    logPurchaseValues(asset, values, evaluations, data.triggers);
  });

  data.transactions.forEach(transaction => {
    // one-off asset-asset transactions generate a single moment
    // recurring asset-asset transactions generate a sequence of moments
    const newMoments = getTransactionMoments(
      transaction,
      data.triggers,
      roiEndDate,
    );
    allMoments = allMoments.concat(newMoments);

    // some transactions affect income processing
    // (e.g. diverting income to pensions)
    if (transaction.NAME.startsWith(pension)) {
      pensionTransactions.push(transaction);
    }

    // some transactions out of pensions are liable to incometax
    logPensionIncomeLiabilities(transaction, liabilitiesMap);
  });

  // log(`pensionTransactions = ${pensionTransactions}`);

  const datedMoments = allMoments.filter(moment => moment.date !== undefined);
  const unDatedMoments = allMoments.filter(moment => moment.date === undefined);

  // Process the moments in dat order
  sortByDate(datedMoments);

  let startYearOfTaxYear;
  if (datedMoments.length > 0) {
    startYearOfTaxYear = getYearOfTaxYear(
      datedMoments[datedMoments.length - 1].date,
    );
  }
  // we track different types of income liability for different individuals
  // the outer map has a key for "cgt", "incomeTax" and "NI".
  // the inner map has a key for the person who is liable to pay and
  // a value for the accrued liable value as a tax year progresses
  const liableIncomeInTaxYear = new Map<string, Map<string, number>>();

  // log(`gathered ${datedMoments.length} moments to process`);
  while (datedMoments.length > 0) {
    const moment = datedMoments.pop();
    if (moment === undefined) {
      throw new Error('BUG!!! array length > 0 should pop!');
    }

    // Each moment we process is in dated order.
    // log(`popped moment is ${showObj(moment)}, `+
    //  `${datedMoments.length} moments left`);

    // Detect if this date has brought us into a new tax year.
    // At a change of tax year, log last year's accrual
    // and start a fresh accrual for the next year.
    const momentsTaxYear = getYearOfTaxYear(moment.date);
    // log(`momentsTaxYear = ${momentsTaxYear}`);
    // log(`startYearOfTaxYear = ${startYearOfTaxYear}`);
    if (
      startYearOfTaxYear !== undefined &&
      momentsTaxYear > startYearOfTaxYear
    ) {
      // change of tax year - report count of moments
      // log('change of tax year...');
      settleUpTax(
        liableIncomeInTaxYear,
        startYearOfTaxYear,
        cpiInitialVal,
        values,
        evaluations,
      );
      startYearOfTaxYear = momentsTaxYear;
    }

    if (moment.type === momentType.transaction) {
      processTransactionMoment(
        moment,
        values,
        evaluations,
        data.triggers,
        pensionTransactions,
        liabilitiesMap,
        liableIncomeInTaxYear,
      );
    } else if (
      moment.type === momentType.expenseStart ||
      moment.type === momentType.incomeStart ||
      moment.type === momentType.assetStart
    ) {
      // Starts of assets are well defined
      // log(`start moment ${moment.name}, ${moment.type}`)
      if (moment.setValue === undefined) {
        log('BUG!!! starts of income/asset/expense should have a value!');
        break;
      }
      const incomeValue = moment.setValue;
      // log('in getEvaluations starting something, setValue:');
      setValue(
        values,
        evaluations,
        moment.date,
        moment.name,
        incomeValue,
        moment.name, // e.g. Cash (it's just the starting value)
      );
      if (moment.type === momentType.incomeStart) {
        handleIncome(
          incomeValue,
          moment,
          values,
          evaluations,
          data.triggers,
          pensionTransactions,
          liabilitiesMap,
          liableIncomeInTaxYear,
          moment.name,
        );
      } else if (moment.type === momentType.expenseStart) {
        // log('in getEvaluations, adjustCash:');
        adjustCash(
          -moment.setValue,
          moment.date,
          values,
          evaluations,
          moment.name,
        );
      }
    } else {
      // not a transaction
      // not at start of expense/income/asset
      let x = values.get(moment.name);
      if (x !== undefined) {
        const inf = getGrowth(moment.name, growths);
        if (printDebug()) {
          log(`change = x * inf = ${x * inf}`);
        }
        const change = x * inf;
        x += change;
        // We _do_ want to log changes of 0
        // because this is how we generate monthly
        // data to plot.
        // if(change!==0){ TODO - do we want to log no-change evaluations?
        // log('in getEvaluations, setValue:');
        setValue(values, evaluations, moment.date, moment.name, x, growth);
        // }
        if (moment.type === momentType.asset) {
          // some assets experience growth which is
          // liable for tax
          // log(`asset moment for growth : ${moment.date}, ${moment.name}`);
          handleIncome(
            change,
            moment,
            values,
            evaluations,
            data.triggers,
            pensionTransactions,
            liabilitiesMap,
            liableIncomeInTaxYear,
            moment.name,
          );
        } else if (moment.type === momentType.income) {
          handleIncome(
            x,
            moment,
            values,
            evaluations,
            data.triggers,
            pensionTransactions,
            liabilitiesMap,
            liableIncomeInTaxYear,
            moment.name,
          );
        } else if (moment.type === momentType.expense) {
          // log('in getEvaluations, adjustCash:');
          adjustCash(-x, moment.date, values, evaluations, moment.name);
        }
      } else {
        log(`Bug : Undefined value for ${showObj(moment)}!`);
      }
      if (printDebug()) {
        log(`${moment.date.toDateString()},
                  ${moment.name},
                  value = ${values.get(moment.name)}`);
      }
    }

    // Catch any tax information if we've just processed the last
    // of the moments.
    if (startYearOfTaxYear !== undefined && datedMoments.length === 0) {
      // change of tax year - report count of moments
      // log('last item in tax year...');
      settleUpTax(
        liableIncomeInTaxYear,
        startYearOfTaxYear,
        cpiInitialVal,
        values,
        evaluations,
      );
    }
  }

  if (unDatedMoments.length > 0) {
    log('Bug : Unhandled undated moments!');
  }

  if (printDebug()) {
    evaluations.forEach(evalns => {
      log(showObj(evalns));
    });
  }
  // log(`getEvaluations returning ${evaluations.length} evaluations`);
  return evaluations;
}
