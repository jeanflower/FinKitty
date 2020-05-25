import { checkEvalnType } from './checks';
import {
  evaluationType,
  generateSequenceOfDates,
  getEvaluations,
  makeSourceForFromChange,
} from './evaluations';
import {
  allItems,
  assetChartAdditions,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  coarse,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  monthly,
  revalue,
  roiEnd,
  roiStart,
  separator,
  assetChartFocus,
  taxPot,
  viewDetail,
  viewFrequency,
  growth,
  pensionDB,
  debtChartFocus,
  debtChartView,
  debtChartVal,
  total,
} from '../localization/stringConstants';
import {
  ChartDataPoint,
  DataForView,
  DbItemCategory,
  DbModelData,
  DbSetting,
  Evaluation,
  Interval,
  ItemChartData,
} from '../types/interfaces';
import {
  getSettings,
  log,
  makeTwoDP,
  printDebug,
  showObj,
  makeDateFromString,
  getTriggerDate,
} from '../utils';

function logMapOfMap(
  twoMap: Map<string, Map<string, number>>,
  display = false,
) {
  if (display) {
    log('twoMap:');
    for (const [key, value] of twoMap) {
      /* eslint-disable-line no-restricted-syntax */
      log(`twoMap[${key}]...`);
      for (const [key2, value2] of value) {
        /* eslint-disable-line no-restricted-syntax */
        log(`twoMap[${key}][${key2}]=${value2}`);
      }
    }
  }
}

function logMapOfMapofMap(threeMap: any, display = false) {
  if (display) {
    log('threeMap:');
    for (const [key, value] of threeMap) {
      /* eslint-disable-line no-restricted-syntax */
      log(`threeMap[${key}]...`);
      for (const [key2, value2] of value) {
        /* eslint-disable-line no-restricted-syntax */
        log(`threeMap[${key}][${key2}]...`);
        for (const [key3, value3] of value2) {
          /* eslint-disable-line no-restricted-syntax */
          log(`threeMap[${key}][${key2}][${key3}] = ${showObj(value3)}`);
        }
      }
    }
  }
}

function getCategoryFromItems(name: string, items: DbItemCategory[]) {
  const found = items.find(i => i.NAME === name);
  if (found !== undefined) {
    if (found.CATEGORY.length > 0) {
      return found.CATEGORY;
    } else {
      return name;
    }
  }
  return undefined;
}

function getCategorySub(name: string, model: DbModelData) {
  // log(`look for category for ${name}`);
  let category: string | undefined = getCategoryFromItems(name, model.incomes);
  if (category === undefined) {
    category = getCategoryFromItems(name, model.expenses);
  }
  if (category === undefined) {
    category = getCategoryFromItems(name, model.assets);
  }
  if (category === undefined) {
    category = getCategoryFromItems(name, model.transactions);
  }
  const foundTransaction = model.transactions.find(i => {
    const source1 = makeSourceForFromChange(i);
    if (source1 === name) {
      return true;
    }
    return false;
  });
  if (foundTransaction !== undefined) {
    if (foundTransaction.CATEGORY.length > 0) {
      // log(`returning transaction ${category}`);
      return foundTransaction.CATEGORY;
    }
    // log(`no transaction category`);
    return name;
  }
  if (category === undefined) {
    // log(`no category`);
    return name;
  }
  // log(`returning ${category}`);
  return category;
}

function getCategory(name: string, model: DbModelData) {
  // log(`get category for ${name}`);
  const words = name.split(separator);
  if (words.length === 0) {
    return '';
  }
  const firstPart = words[0];
  const firstPartCat = getCategorySub(firstPart, model);
  if (words.length === 1) {
    if (firstPartCat !== firstPart) {
      return firstPartCat;
    }
  }
  // maybe use second part? for growth or revalue
  if (words.length > 1 && (firstPart === growth || firstPart === revalue)) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    if (secondPartCat !== secondPart) {
      return firstPart + separator + secondPartCat;
    }
  }
  // maybe use second part? for deltas
  if (words.length > 1) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    return firstPartCat + separator + secondPartCat;
  }
  // log(`no category for ${name}`);
  return name;
}

function totalChartDataPoints(
  dateNameValueMap: Map<string, Map<string, number>>,
  dates: Date[],
  items: string[],
) {
  const result = new Map<string, Map<string, number>>();
  dates.forEach(date => {
    let totalValue = 0.0;
    const dateString = date.toDateString();
    items.forEach(item => {
      // log(`get data from map for date ${dateString}`);
      const nameValueMap = dateNameValueMap.get(dateString);
      if (nameValueMap !== undefined) {
        const mapValue = nameValueMap.get(item);
        if (mapValue !== undefined) {
          totalValue += mapValue;
        }
      }
    });
    let nvm = result.get(dateString);
    if (nvm === undefined) {
      result.set(dateString, new Map<string, number>());
      nvm = result.get(dateString);
    }
    if (nvm !== undefined) {
      nvm.set('Total', totalValue);
    }
  });
  logMapOfMap(result);
  return result;
}

function makeChartDataPoints(
  dateNameValueMapIncoming: Map<string, Map<string, number>>,
  dates: Date[],
  itemsIncoming: string[],
  settings: DbSetting[],
  negateValues = false,
  totalValues = false,
): ItemChartData[] {
  let dateNameValueMap = dateNameValueMapIncoming;
  let items = itemsIncoming;
  if (totalValues) {
    // log(`total the items in map`);
    dateNameValueMap = totalChartDataPoints(dateNameValueMap, dates, items);
    items = ['Total'];
  }

  // log(`now make chart data for ${items}`);
  logMapOfMap(dateNameValueMap);
  const chartDataPointMap = new Map<
    string, // name
    ChartDataPoint[]
  >();

  dates.forEach(date => {
    const dateString = date.toDateString();
    items.forEach(item => {
      let value = 0.0;
      // log(`get data from map for date ${dateString}`);
      const nameValueMap = dateNameValueMap.get(dateString);
      if (nameValueMap !== undefined) {
        const mapValue = nameValueMap.get(item);
        // log(`got ${item} data ${mapValue} out of map`);
        if (mapValue !== undefined) {
          value = mapValue;
          // log(`value for ${item.NAME} from map = ${value}`);
          if (negateValues) {
            // for plotting debt values we negate
            value = -value;
          }
        } else {
          // this type of effect; this source;
          // didn't have an effect in this date period
          // log(`item.NAME ${item.NAME} not found in nameValueMap`);
        }
      } else {
        // nothing happened during this date period
        // log(`dateString ${dateString} not found in dateNameValueMap`);
      }
      if (!chartDataPointMap.has(item)) {
        // log(`first time for ${showObj(item)}, set up fresh array`);
        chartDataPointMap.set(item, []);
      }
      const chartArray = chartDataPointMap.get(item);
      if (chartArray === undefined) {
        log('BUG; chartArray should be defined');
      } else {
        // log(`add to array ${showObj({label: dateString, y:value})}`);
        const twoDPstring = makeTwoDP(value);
        const birthDateSetting = getSettings(settings, birthDate, '');
        let dataLabel = dateString;
        if (birthDateSetting !== '') {
          const diff =
            date.getTime() - makeDateFromString(birthDateSetting).getTime();
          const age = Math.floor(diff / 31557600000); // Divide by 1000*60*60*24*365.25
          // log(`age from birthDate '${birthDateSetting}' = ${age}`);
          dataLabel = `${age}`;
        } else {
          // log(`no birthDate given, dataLabel = ${dataLabel}`);
        }
        chartArray.push({
          label: dataLabel,
          y: value,
          ttip: `${parseFloat(twoDPstring).toFixed(2)} at ${dateString}`,
        });
      }
    });
  });
  const allChartDataPoints = [];
  for (const [item, array] of chartDataPointMap) {
    /* eslint-disable-line no-restricted-syntax */
    allChartDataPoints.push({ name: item, chartDataPoints: array });
  }

  if (printDebug()) {
    allChartDataPoints.forEach(entry => {
      log(
        `item ${showObj(entry.name)} has chart points ` +
          `${showObj(entry.chartDataPoints)}`,
      );
    });
  }
  const result: ItemChartData[] = [];
  // log(`done making asset points@`);
  allChartDataPoints.forEach(pr => {
    const nonZeroInstance = pr.chartDataPoints.findIndex(cdp => {
      return cdp.y !== 0;
    });
    if (nonZeroInstance >= 0) {
      // log(`non-zero instance found ${showObj(pr)}`);
      result.push({
        item: { NAME: pr.name },
        chartDataPoints: pr.chartDataPoints,
      });
    }
  });
  return result;
}

function displayWordAs(
  word: string,
  model: DbModelData,
  assetChartFocusName: string,
  debtChartFocusName: string,
) {
  //log(`determine where/how to display ${showObj(word)} in a chart`);
  const result = {
    asset: false,
    debt: false,
    tax: false,
  };

  if (word === taxPot) {
    // log(`display ${showObj(word)} as tax`);
    result.tax = true;
    return result;
  }
  const nameMatch = model.assets.filter(a => {
    return a.NAME === word;
  });
  if (nameMatch.length !== 0) {
    // log(`matched name ${word}`);
    if (!nameMatch[0].IS_A_DEBT) {
      // have a matching asset
      // Include if focus is allItems or this asset name
      if (
        assetChartFocusName === allItems ||
        assetChartFocusName === nameMatch[0].CATEGORY ||
        assetChartFocusName === word
      ) {
        result.asset = true;
      }
    } else {
      // have a matching debt
      // Include if focus is allItems or this debt name
      if (
        debtChartFocusName === allItems ||
        debtChartFocusName === nameMatch[0].CATEGORY ||
        debtChartFocusName === word
      ) {
        result.debt = true;
      }
    }
  }

  const catMatch = model.assets.filter(a => {
    return a.CATEGORY === word;
  });
  if (catMatch.length !== 0) {
    catMatch.forEach(a => {
      // log(`matched category ${word}`);
      if (a.IS_A_DEBT) {
        // Have a debt with a matching category
        // Include if focus is allItems or this category name
        if (
          debtChartFocusName === allItems ||
          debtChartFocusName === word ||
          debtChartFocusName === a.NAME
        ) {
          result.debt = true;
        }
      } else {
        // Have an asset with a matching category
        // Include if focus is allItems or this category name
        if (
          assetChartFocusName === allItems ||
          assetChartFocusName === word ||
          assetChartFocusName === a.NAME
        ) {
          result.asset = true;
        }
      }
    });
  }

  // log(`given focus ${assetChartFocusName} and ${debtChartFocusName}`);
  // log(`display ${showObj(word)} as asset? ${showObj(result)}`);
  return result;
}

function displayAs(
  name: string,
  model: DbModelData,
  assetChartFocusName: string,
  debtChartFocusName: string,
) {
  const words = name.split(separator);
  const result = {
    asset: false,
    debt: false,
    tax: false,
  };
  if (words.length > 1) {
    words.shift(); // remove the first item which is the description
    // the second item is the thing that's affected and determine
    // where to display
  }
  words.forEach(w => {
    const x = displayWordAs(w, model, assetChartFocusName, debtChartFocusName);
    if (x.asset) {
      result.asset = true;
    }
    if (x.debt) {
      result.debt = true;
    }
    if (x.tax) {
      result.tax = true;
    }
  });
  if (printDebug()) {
    if (result.asset) {
      log(`display ${name} as an asset`);
    }
    if (result.debt) {
      log(`display ${name} as an debt`);
    }
    if (result.tax) {
      log(`display ${name} as tax`);
    }
  }
  return result;
}
function makeADTChartNames(
  allNames: string[],
  model: DbModelData,
  assetChartFocusName: string,
  debtChartFocusName: string,
) {
  // log(`allNames = ${showObj(allNames)}`)
  const assetChartNames: string[] = [];
  const debtChartNames: string[] = [];
  allNames.forEach(n => {
    const x = displayAs(n, model, assetChartFocusName, debtChartFocusName);
    if (x.asset) {
      assetChartNames.push(n);
    } else if (x.debt) {
      debtChartNames.push(n);
    }
  });

  return {
    assetChartNames,
    debtChartNames,
  };
}

function assignCategories(
  dateNameValueMap: Map<
    string, // date
    Map<
      string, // name
      number // value
    >
  >,
  allDates: Date[],
  items: string[],
  model: DbModelData,
) {
  // log(`categorise these ${items}`);
  const categoryNames = new Set<string>();
  const mapForChart = new Map<string, Map<string, number>>();
  allDates.forEach(date => {
    items.forEach(item => {
      // log(`item = ${showObj(item)}`);
      const d = date.toDateString();

      const NVM = dateNameValueMap.get(d);
      if (NVM === undefined) {
        // no data to log here
        return;
      }
      const val = NVM.get(item);
      if (val === undefined) {
        // no data to log here
        return;
      }
      if (!mapForChart.has(d)) {
        mapForChart.set(d, new Map<string, number>());
      }
      const nameValueMap = mapForChart.get(d);
      if (nameValueMap === undefined) {
        log('BUG - map should exist');
        return;
      }

      const category = getCategory(item, model);
      categoryNames.add(category);
      const existingVal = nameValueMap.get(category);
      if (existingVal === undefined) {
        nameValueMap.set(category, val);
        // log(`set map ${category}->${val}`);
      } else {
        const newVal = existingVal + val;
        nameValueMap.set(category, newVal);
        // log(`set map ${category}->${newVal}`);
      }
    });
  });
  return {
    map: mapForChart,
    sources: categoryNames,
  };
}

function filterItems(
  dateNameValueMap: Map<
    string, // date
    Map<
      string, // name
      number // value
    >
  >,
  allDates: Date[],
  names: string[],
  model: DbModelData,
  focus: string,
) {
  // log(`filter items by ${focus}`);
  const categoryNames = new Set<string>();
  const mapForChart = new Map<string, Map<string, number>>();
  allDates.forEach(date => {
    names.forEach(item => {
      const d = date.toDateString();

      const NVM = dateNameValueMap.get(d);
      if (NVM === undefined) {
        // no data to log here
        return;
      }
      const val = NVM.get(item);
      if (val === undefined) {
        // no data to log here
        return;
      }
      if (!mapForChart.has(d)) {
        mapForChart.set(d, new Map<string, number>());
      }
      const nameValueMap = mapForChart.get(d);
      if (nameValueMap === undefined) {
        log('BUG - map should exist');
        return;
      }

      const category = getCategory(item, model);
      // log(`item ${item} has category ${category}`);

      if (item === focus || category === focus) {
        // log(`include this item for ${focus}`);
        nameValueMap.set(item, val);
      } else {
        // log(`do not include this item for ${focus}`);
      }
    });
  });
  return {
    map: mapForChart,
    sources: categoryNames,
  };
}

function ensureDateValueMapsExist(
  typeDateNameValueMap: Map<
    string, // type
    Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >
  >,
  name: string,
) {
  const dateNameValueMap = typeDateNameValueMap.get(name);
  if (dateNameValueMap === undefined) {
    typeDateNameValueMap.set(
      name,
      new Map<
        string, // date
        Map<
          string, // name
          number // value
        >
      >(),
    );
  }
}

function getSettingsValues(model: DbModelData) {
  // log(`entering makeChartDataFromEvaluations`);
  const expenseFocus: string = getSettings(
    model.settings,
    expenseChartFocus,
    allItems,
  );
  const incomeFocus: string = getSettings(
    model.settings,
    incomeChartFocus,
    allItems,
  );
  const assetChartFocusName = getSettings(
    model.settings,
    assetChartFocus,
    allItems,
  );
  const debtChartFocusName = getSettings(
    model.settings,
    debtChartFocus,
    allItems,
  );
  const detail: string = getSettings(model.settings, viewDetail, fine);
  const frequency: string = getSettings(model.settings, viewFrequency, monthly);
  const assetChartSetting: string = getSettings(
    model.settings,
    assetChartView,
    assetChartVal,
  );
  const debtChartSetting: string = getSettings(
    model.settings,
    debtChartView,
    debtChartVal,
  );
  return {
    expenseFocus,
    incomeFocus,
    assetChartFocusName,
    debtChartFocusName,
    detail,
    frequency,
    assetChartSetting,
    debtChartSetting,
  };
}
function mapNamesToTypes(model: DbModelData) {
  const nameToTypeMap = new Map<string, string>();
  model.expenses.forEach(expense => {
    nameToTypeMap.set(expense.NAME, evaluationType.expense);
  });
  model.incomes.forEach(income => {
    nameToTypeMap.set(income.NAME, evaluationType.income);
  });
  model.assets.forEach(asset => {
    nameToTypeMap.set(asset.NAME, evaluationType.asset);
  });
  model.settings.forEach(setting => {
    nameToTypeMap.set(setting.NAME, evaluationType.setting);
  });
  nameToTypeMap.set(taxPot, evaluationType.asset);
  return nameToTypeMap;
}

function generateEvaluationDates(roi: Interval, frequency: string) {
  const addPreDate = true;
  let freqString = '';
  if (frequency === monthly) {
    freqString = '1m';
  } else {
    freqString = '1y';
  }
  return generateSequenceOfDates(roi, freqString, addPreDate);
}

export function makeChartDataFromEvaluations(
  roi: Interval,
  model: DbModelData,
  evaluationsAndVals: {
    evaluations:Evaluation[],
    todaysValues: Map<string, number>,
  }
) {
  const {
    expenseFocus,
    incomeFocus,
    assetChartFocusName,
    debtChartFocusName,
    detail,
    frequency,
    assetChartSetting,
    debtChartSetting,
  } = getSettingsValues(model);

  // set up empty data structure for result
  const result: DataForView = {
    expensesData: [],
    incomesData: [],
    assetData: [],
    debtData: [],
    taxData: [],
    todaysValues: new Map<string, number>(),
  };

  result.todaysValues = evaluationsAndVals.todaysValues;

  // each expense/income/asset has a name
  // remember, for each name, whether it's an expense/income/asset
  // so we can draw that data into the chart view
  // for expense/income/asset
  const nameToTypeMap = mapNamesToTypes(model);

  const allDates: Date[] = generateEvaluationDates(roi, frequency);

  // log(`dates for chart = ${showObj(allDates)}`);
  // type, date, name, value
  const typeDateNameValueMap = new Map<
    string, // type
    Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >
  >();

  typeDateNameValueMap.set(
    'assetOrDebtFocus', // we will track data for this special asset
    new Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >(),
  );
  typeDateNameValueMap.set(
    taxPot, // we will track data for this special "asset"
    new Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >(),
  );
  let assetOrDebtValueSources: string[] = [];

  let incomeNames: string[] = model.incomes.map(i => i.NAME);
  let expenseNames: string[] = model.expenses.map(e => e.NAME);
  let assetNames: string[] = model.assets
    .filter(a => {
      return a.IS_A_DEBT === false;
    })
    .map(a => a.NAME);
  let debtNames: string[] = model.assets
    .filter(a => {
      return a.IS_A_DEBT === true;
    })
    .map(a => a.NAME);

  const prevEvalAssetValue = new Map<string, number>();
  // prev is used to calc + or -

  evaluationsAndVals.evaluations.forEach(evaln => {
    const firstDateAfterEvaln = allDates.find(d => d >= evaln.date);
    if (firstDateAfterEvaln === undefined) {
      // no need to capture data from this evaluation
      // it's after all our dates for the chart
      return;
    }
    // ensure that for this evaluation, its type
    // is present in the typeDateNameValueMap
    const evalnType = nameToTypeMap.get(evaln.name);
    if (evalnType === undefined) {
      checkEvalnType(
        // could print 'BUG'
        evaln,
        nameToTypeMap,
      );
      return; // don't include in chart
    }
    if (
      evalnType === evaluationType.income ||
      evalnType === evaluationType.expense
    ) {
      if (evaln.source === revalue) {
        // expenses and incomes are accumulated for the chart data
        // each evaluation of an income or an expense
        // represents money coming in or going out
        // but the exception is a revaluation.
        // A revaluation of income or expense isn't included
        // as an effect on the charts.  Chart elements
        // only show incomes and expenses as these affect
        // assets.
        // log(`skip expense or income revaluation`);
        return;
      }
      if (evaln.name.startsWith(pensionDB)) {
        // log(`charting value for ${evaln.name}, ${evaln.value}`);
        const matchingIncome = model.incomes.find(i => {
          return i.NAME === evaln.name;
        });
        if (matchingIncome === undefined) {
          throw new Error(`couldn't match income for ${evaln.name}`);
        }
        if (evaln.date < getTriggerDate(matchingIncome.START, model.triggers)) {
          // we tracked this evaluation just to adjust accrued benfit
          // but don't actually received any of this income yet...
          // so skip for charting purposes
          return;
        }
      }
    }
    // log(`generate chart data for dates ${showObj(dates)}`);
    // log(`processing ${showObj(evaln)}`);

    // Get a map ready to hold date->Map(name->value)
    ensureDateValueMapsExist(typeDateNameValueMap, evalnType);
    const dateNameValueMap = typeDateNameValueMap.get(evalnType);
    if (dateNameValueMap !== undefined) {
      const date = firstDateAfterEvaln.toDateString();
      if (!dateNameValueMap.has(date)) {
        // log(`make a map for date ${date}`);
        dateNameValueMap.set(date, new Map<string, number>());
      }
      // for this type and date, we have a map ready to hold
      // name->value
      const nameValueMap = dateNameValueMap.get(date);
      if (nameValueMap !== undefined) {
        // log(`set data for ${evalnType}, ${date}, `
        //   +`${evaln.name}, ${evaln.value}, ${evaln.source}`);
        const existingValue = nameValueMap.get(evaln.name);
        if (existingValue === undefined || evalnType === evaluationType.asset) {
          // don't show taxPot as an asset
          // (its in our data so we can show it in
          // "detailed" asset view)
          if (evaln.name !== taxPot) {
            // asset valuations over-write previous values
            nameValueMap.set(evaln.name, evaln.value);
          }
        } else {
          // income or expense values accumulate over time
          // log(`accumulate chart values for ${evaln.name}`);
          const newValue = existingValue + evaln.value;
          // log(`change ${existingValue} to ${newValue}`);
          nameValueMap.set(evaln.name, newValue);
        }
      }
    }

    logMapOfMapofMap(typeDateNameValueMap);

    // accumulate data for assets and debts (includes taxPot)
    if (
      evaln.name === taxPot ||
      evaln.name === assetChartFocusName ||
      evaln.name === debtChartFocusName ||
      (assetChartFocusName === allItems &&
        assetNames.indexOf(evaln.name) >= 0 &&
        evaln.name !== taxPot) ||
      (debtChartFocusName === allItems &&
        debtNames.indexOf(evaln.name) >= 0 &&
        evaln.name !== taxPot) ||
      getCategory(evaln.name, model) === assetChartFocusName ||
      getCategory(evaln.name, model) === debtChartFocusName
    ) {
      // log(`evaln of asset ${evaln.name} for val or delta...`);
      // direct asset data to the assets part of typeDateNameValueMap
      // and the tax part to the taxPot part of typeDateNameValueMap
      let assetDateNameValueMap;
      if (evaln.name === taxPot) {
        assetDateNameValueMap = typeDateNameValueMap.get(taxPot);
      } else {
        assetDateNameValueMap = typeDateNameValueMap.get('assetOrDebtFocus');
      }
      if (assetDateNameValueMap !== undefined) {
        const date = firstDateAfterEvaln.toDateString();
        if (!assetDateNameValueMap.has(date)) {
          assetDateNameValueMap.set(date, new Map<string, number>());
        }
        const assetNameValueMap = assetDateNameValueMap.get(date);
        if (assetNameValueMap !== undefined) {
          // log(`${date} asset source '${evaln.source}' and value '${evaln.value}'`);
          // log(`assetChartSetting = ${assetChartSetting}`);
          // Either log values or deltas; taxPot always plot deltas
          // and assets plot values or deltas according to assetChartSetting.
          if (evaln.name !== taxPot && assetChartSetting === assetChartVal) {
            // Log asset values.
            // log(`add data[${evaln.name}] = ${evaln.value}`);
            if (assetOrDebtValueSources.indexOf(evaln.name) < 0) {
              // log(`add value source ${evaln.name}`);
              assetOrDebtValueSources.push(evaln.name);
            }
            // we display the latest evaluation, even if there
            // was one already, we overwrite the value
            assetNameValueMap.set(evaln.name, evaln.value);
          } else {
            // view a delta - what has been the change to the asset?
            let mapKey = '';
            if (evaln.name === taxPot) {
              mapKey = evaln.source;
            } else {
              mapKey = evaln.source + separator + evaln.name;
            }
            let prevValue = 0.0;
            const mapValue = prevEvalAssetValue.get(evaln.name);
            if (mapValue !== undefined) {
              prevValue = mapValue;
            }
            // log(`asset ${evaln.name} val is `+
            //    `${evaln.value}, was ${prevValue}`);
            // log(`and the source of change is ${evaln.source}`);
            // log(`and change happened ${evaln.date}`);
            let valueForChart = evaln.value - prevValue;
            // log(`asset val change is ${valueForChart}
            //   from ${evaln.source}`);
            // log(`this delta is ${valueForChart}`);
            const existingDelta = assetNameValueMap.get(mapKey);
            if (existingDelta !== undefined) {
              // accumulate changes
              // log(`existing delta is ${existingDelta}`);
              valueForChart += existingDelta;
              // log(`accumulated delta is ${valueForChart}`);
            } else if (valueForChart !== 0) {
              // log(`no pre-existing delta`);
            }
            if (
              evaln.name !== taxPot &&
              assetChartSetting === assetChartAdditions &&
              valueForChart < 0
            ) {
              // log(`suppress -ve deltas when looking for additions`);
            } else if (
              evaln.name !== taxPot &&
              assetChartSetting === assetChartReductions &&
              valueForChart > 0
            ) {
              // log(`suppress +ve deltas when looking for reductions`);
            } else if (valueForChart === 0) {
              // log(`don\'t include zero values for chart: ${evaln.source}`);
            } else {
              // log(`log chart delta ${valueForChart}`);
              assetNameValueMap.set(mapKey, valueForChart);
              if (assetOrDebtValueSources.indexOf(mapKey) < 0) {
                // log(`log chart mapKey ${mapKey}`);
                assetOrDebtValueSources.push(mapKey);
              }
            }
            // log(`set asset value as 'previous'
            //   for ${evaln.name} is ${evaln.value}`);
            prevEvalAssetValue.set(evaln.name, evaln.value);
          }
        }
      }
    }
  });

  logMapOfMapofMap(typeDateNameValueMap);

  // remove the 'preDate' (helped with defining first displayable bucket)
  allDates.shift();

  const taxValueSources = assetOrDebtValueSources;
  if (detail === coarse || detail === total) {
    // log('gather chart data into categories');
    let dateNameValueMap = typeDateNameValueMap.get('assetOrDebtFocus');
    if (dateNameValueMap !== undefined) {
      const categories = assignCategories(
        dateNameValueMap,
        allDates,
        assetOrDebtValueSources,
        model,
      );
      if (categories !== undefined) {
        typeDateNameValueMap.set('assetOrDebtFocus', categories.map);
        assetOrDebtValueSources = [...categories.sources];
      }
      assetNames = [...categories.sources]; // NQR
      debtNames = [...categories.sources]; // NQR
    }
    if (expenseFocus === allItems) {
      // unfocussed expense views can have coarse views
      dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
      if (dateNameValueMap !== undefined) {
        const categories = assignCategories(
          dateNameValueMap,
          allDates,
          expenseNames,
          model,
        );
        typeDateNameValueMap.set(evaluationType.expense, categories.map);
        expenseNames = [...categories.sources];
      }
    }
    if (incomeFocus === allItems) {
      // unfocussed income views can have coarse views
      dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
      if (dateNameValueMap !== undefined) {
        const categories = assignCategories(
          dateNameValueMap,
          allDates,
          incomeNames,
          model,
        );
        typeDateNameValueMap.set(evaluationType.income, categories.map);
        incomeNames = [...categories.sources];
      }
    }
  }

  // log(`compare ${expenseChartFocus} against ${expenseChartFocusAll}`);
  if (expenseFocus !== allItems) {
    // apply a filter to expense data
    // focussed expense views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterItems(
        dateNameValueMap,
        allDates,
        expenseNames,
        model,
        expenseFocus,
      );
      typeDateNameValueMap.set(evaluationType.expense, focusItems.map);
    }
  }
  if (incomeFocus !== allItems) {
    // apply a filter to income data
    // focussed income views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterItems(
        dateNameValueMap,
        allDates,
        incomeNames,
        model,
        incomeFocus,
      );
      typeDateNameValueMap.set(evaluationType.income, focusItems.map);
    }
  }

  const mapForChart = typeDateNameValueMap.get('assetOrDebtFocus');
  if (mapForChart !== undefined) {
    // log(`go to make asset points@`);
    // log(`assets = ${showObj(assets)}`);

    let assetChartNames = [];
    let debtChartNames = [];
    // when we plot the values of a single asset
    // we want to use assetValueSources as the chart items
    // (i.e. in the chart legend)
    // when we plot deltas, additions or reductions,
    // use the source as the item
    if (
      assetNames.includes(assetChartFocusName) ||
      assetChartSetting !== assetChartVal
    ) {
      assetChartNames = assetOrDebtValueSources;
    } else if (assetChartFocusName === allItems) {
      // when showing all assets and values,
      // use assetNames (not sources)
      assetChartNames = assetNames;
    } else {
      assetChartNames = assetOrDebtValueSources;
    }
    if (
      assetChartFocusName !== allItems &&
      !assetNames.includes(assetChartFocusName) &&
      assetChartSetting === assetChartVal
    ) {
      assetChartNames = assetChartNames.filter(i => assetNames.includes(i));
    }
    // log(`assetChartNames = ${showObj(assetChartNames)}`);

    if (
      debtNames.includes(debtChartFocusName) ||
      assetChartSetting !== debtChartVal
    ) {
      debtChartNames = assetOrDebtValueSources;
    } else if (debtChartFocusName === allItems) {
      // when showing all debt and values,
      // use debtNames (not sources)
      debtChartNames = debtNames;
    } else {
      debtChartNames = assetOrDebtValueSources;
    }
    if (
      debtChartFocusName !== allItems &&
      !debtNames.includes(debtChartFocusName) &&
      debtChartSetting === debtChartVal
    ) {
      debtChartNames = debtChartNames.filter(i => debtNames.includes(i));
    }

    const aDTAssetChartNames = makeADTChartNames(
      assetChartNames,
      model,
      assetChartFocusName,
      debtChartFocusName,
    );
    const aDTDebtChartNames = makeADTChartNames(
      debtChartNames,
      model,
      assetChartFocusName,
      debtChartFocusName,
    );

    result.assetData = makeChartDataPoints(
      mapForChart,
      allDates,
      aDTAssetChartNames.assetChartNames,
      model.settings,
      false, // don't negate
      detail === total,
    );

    result.debtData = makeChartDataPoints(
      mapForChart,
      allDates,
      aDTDebtChartNames.debtChartNames,
      model.settings,
      true, // negate values
      detail === total,
    );
  }

  const mapForTaxChart = typeDateNameValueMap.get(taxPot);
  if (mapForTaxChart !== undefined) {
    result.taxData = makeChartDataPoints(
      mapForTaxChart,
      allDates,
      taxValueSources,
      model.settings,
      false, // don't negate
      detail === total,
    );
  }

  logMapOfMapofMap(typeDateNameValueMap);

  const expenseDateNameValueMap = typeDateNameValueMap.get(
    evaluationType.expense,
  );
  if (expenseDateNameValueMap !== undefined) {
    result.expensesData = makeChartDataPoints(
      expenseDateNameValueMap,
      allDates,
      expenseNames,
      model.settings,
      false, // don't negate
      detail === total,
    );
  }
  const incomeDateNameValueMap = typeDateNameValueMap.get(
    evaluationType.income,
  );
  if (incomeDateNameValueMap !== undefined) {
    result.incomesData = makeChartDataPoints(
      incomeDateNameValueMap,
      allDates,
      incomeNames,
      model.settings,
      false, // don't negate
      detail === total,
    );
  }

  // log(`chart data produced: ${showObj(result)}`);
  return result;
}

export function makeChartData(model: DbModelData): DataForView {
  // log('in makeChartData');
  const evaluationsAndVals = getEvaluations(model);
  const evaluations = evaluationsAndVals.evaluations;
  if (evaluations.length === 0) {
    // don't do more work
    // skip settings-exist checks
    // stop unnecessary error reports
    const emptyData: DataForView = {
      expensesData: [],
      incomesData: [],
      assetData: [],
      debtData: [],
      taxData: [],
      todaysValues: new Map<string, number>(),
    };
    return emptyData;
  }

  const roiStartDate: Date = makeDateFromString(
    getSettings(model.settings, roiStart, 'Oct 1, 2017'),
  );
  const roiEndDate: Date = makeDateFromString(
    getSettings(model.settings, roiEnd, 'Oct 1, 2022'),
  );
  const roi = {
    start: roiStartDate,
    end: roiEndDate,
  };

  // log(`roi is ${showObj(roi)}`);
  return makeChartDataFromEvaluations(roi, model, evaluationsAndVals);
}
