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
  allItems,
  chartAdditions,
  assetChartFocus,
  chartReductions,
  chartVals,
  chartViewType,
  assetsView,
  birthDate,
  cgt,
  coarse,
  crystallizedPension,
  debtChartFocus,
  debtsView,
  expenseChartFocus,
  expensesView,
  fine,
  gain,
  growth,
  income,
  incomeChartFocus,
  incomesView,
  incomeTax,
  monthly,
  nationalInsurance,
  overview,
  pensionDB,
  revalue,
  roiEnd,
  roiStart,
  separator,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxView,
  total,
  viewDetail,
  viewFrequency,
  ViewType,
} from '../localization/stringConstants';
import {
  deconstructTaxTag,
  getSettings,
  getTriggerDate,
  log,
  makeCGTTag,
  makeDateFromString,
  makeIncomeTaxTag,
  makeNationalInsuranceTag,
  makeNetGainTag,
  makeNetIncomeTag,
  makeTwoDP,
  printDebug,
  showObj,
} from '../utils';
import {
  evaluationType,
  generateSequenceOfDates,
  makeSourceForFromChange,
} from './evaluations';

import { checkEvalnType } from './checks';

export class ViewSettings {
  private kvPairs: Map<string, string> = new Map<string, string>();
  /*
e.g.
    {
      NAME: viewFrequency,
      VALUE: monthly,
    },
    {
      NAME: assetChartView,
      VALUE: assetChartVal,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
    },
    {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusPerson,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusType,
      VALUE: allItems,
    },
    {
      NAME: taxChartShowNet,
      VALUE: 'Y',
    },
    {
      NAME: valueFocusDate,
      VALUE: '',
    },
*/
  assetChartFocusName = '';
  incomeChartFocusName = '';
  expenseChartFocusName = '';
  debtChartFocusName = '';
  constructor(pairs: { NAME: string; VALUE: string }[]) {
    pairs.forEach(p => {
      this.kvPairs.set(p.NAME, p.VALUE);
      if (p.NAME === assetChartFocus) {
        this.assetChartFocusName = p.VALUE;
      } else if (p.NAME === debtChartFocus) {
        this.debtChartFocusName = p.VALUE;
      } else if (p.NAME === incomeChartFocus) {
        this.incomeChartFocusName = p.VALUE;
      } else if (p.NAME === expenseChartFocus) {
        this.expenseChartFocusName = p.VALUE;
      }
    });
  }
  setViewSetting(key: string, value: string): boolean {
    if (key === assetChartFocus) {
      this.assetChartFocusName = value;
    } else if (key === debtChartFocus) {
      this.debtChartFocusName = value;
    } else if (key === incomeChartFocus) {
      this.incomeChartFocusName = value;
    } else if (key === expenseChartFocus) {
      this.expenseChartFocusName = value;
    }
    if (this.kvPairs.get(key)) {
      this.kvPairs.set(key, value);
      return true;
    } else {
      return false;
    }
  }
  getShowAssetItem(item: string): boolean {
    //return this.getShowItem(item, assetChartFocus);
    return item === this.assetChartFocusName;
  }
  getShowDebtItem(item: string): boolean {
    //return this.getShowItem(item, debtChartFocus);
    return item === this.debtChartFocusName;
  }

  getShowItem(item: string, context: string): boolean {
    if (context === assetChartFocus) {
      return item === this.assetChartFocusName;
    } else if (context === debtChartFocus) {
      return item === this.debtChartFocusName;
    } else if (context === incomeChartFocus) {
      return item === this.incomeChartFocusName;
    } else if (context === expenseChartFocus) {
      return item === this.expenseChartFocusName;
    }
    return this.kvPairs.get(context) === item;
  }

  //no need to optimise this
  getShowSingleItem(names: string[], context: string) {
    const focus = this.kvPairs.get(context);
    return (
      names.find(n => {
        return n === focus;
      }) !== undefined
    );
  }

  //no need to optimise this
  getShowAll(context: string): boolean {
    if (context === assetChartFocus) {
      return this.assetChartFocusName === allItems;
    } else if (context === debtChartFocus) {
      return this.debtChartFocusName === allItems;
    } else if (context === incomeChartFocus) {
      return this.incomeChartFocusName === allItems;
    } else if (context === expenseChartFocus) {
      return this.expenseChartFocusName === allItems;
    }
    return this.kvPairs.get(context) === allItems;
  }

  //no need to optimise this
  getViewSetting(settingType: string, defaultValue: string) {
    const result = this.kvPairs.get(settingType);
    if (result !== undefined) {
      return result;
    } else {
      return defaultValue;
    }
  }

  //no need to optimise this
  getShowValue(chartVal: string) {
    return this.kvPairs.get(chartViewType) === chartVal;
  }
}

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

//let numCacheHits = 0;
//let numComputed = 0;
function getCategory(
  name: string,
  cache: Map<string, string>,
  model: DbModelData,
) {
  const cachedResult = cache.get(name);
  if (cachedResult !== undefined) {
    //numCacheHits = numCacheHits + 1;
    //log(`numComputed = ${numComputed}, numCacheHits = ${numCacheHits}`);
    return cachedResult;
  }
  //numComputed = numComputed + 1;
  //log(`numComputed = ${numComputed}, numCacheHits = ${numCacheHits}`);
  // log(`get category for ${name}`);
  const words = name.split(separator);
  if (words.length === 0) {
    cache.set(name, '');
    return '';
  }
  const firstPart = words[0];
  const firstPartCat = getCategorySub(firstPart, model);
  if (words.length === 1) {
    if (firstPartCat !== firstPart) {
      cache.set(name, firstPartCat);
      return firstPartCat;
    }
  }
  // maybe use second part? for growth or revalue
  if (words.length > 1 && (firstPart === growth || firstPart === revalue)) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    if (secondPartCat !== secondPart) {
      const cat = firstPart + separator + secondPartCat;
      cache.set(name, cat);
      return cat;
    }
  }
  // maybe use second part? for deltas
  if (words.length > 1) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    const cat = firstPartCat + separator + secondPartCat;
    cache.set(name, cat);
    return cat;
  }
  // log(`no category for ${name}`);
  cache.set(name, name);
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
  viewSettings: ViewSettings,
  showAllAssets: boolean,
  showAllDebts: boolean,
) {
  //log(`determine where/how to display ${showObj(word)} in a chart`);
  const result = {
    asset: false,
    debt: false,
    tax: false,
  };

  const nameMatch = model.assets.filter(a => {
    return a.NAME === word;
  });
  if (nameMatch.length !== 0) {
    // log(`matched name ${word}`);
    if (!nameMatch[0].IS_A_DEBT) {
      // have a matching asset
      // Include if focus is allItems or this asset name
      if (
        showAllAssets ||
        viewSettings.getShowAssetItem(nameMatch[0].CATEGORY) ||
        viewSettings.getShowAssetItem(word)
      ) {
        result.asset = true;
      }
    } else {
      // have a matching debt
      // Include if focus is allItems or this debt name
      if (
        showAllDebts ||
        viewSettings.getShowDebtItem(nameMatch[0].CATEGORY) ||
        viewSettings.getShowDebtItem(word)
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
          showAllDebts ||
          viewSettings.getShowDebtItem(word) ||
          viewSettings.getShowDebtItem(a.NAME)
        ) {
          result.debt = true;
        }
      } else {
        // Have an asset with a matching category
        // Include if focus is allItems or this category name
        if (
          showAllAssets ||
          viewSettings.getShowAssetItem(word) ||
          viewSettings.getShowAssetItem(a.NAME)
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
  viewSettings: ViewSettings,
  showAllAssets: boolean,
  showAllDebts: boolean,
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
    const x = displayWordAs(
      w,
      model,
      viewSettings,
      showAllAssets,
      showAllDebts,
    );
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
  viewSettings: ViewSettings,
  showAllAssets: boolean,
  showAllDebts: boolean,
) {
  // log(`allNames = ${showObj(allNames)}`)
  const assetChartNames: string[] = [];
  const debtChartNames: string[] = [];
  allNames.forEach(n => {
    const x = displayAs(n, model, viewSettings, showAllAssets, showAllDebts);
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
  categoryCache: Map<string, string>,
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

      const category = getCategory(item, categoryCache, model);
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
  categoryCache: Map<string, string>,
  viewSettings: ViewSettings,
  context: string,
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

      const category = getCategory(item, categoryCache, model);
      // log(`item ${item} has category ${category}`);

      if (
        viewSettings.getShowItem(item, context) ||
        viewSettings.getShowItem(category, context)
      ) {
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
    // log(`add storage for ${name} to typeDateNameValueMap`)
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

function getSettingsValues(viewSettings: ViewSettings) {
  const detail: string = viewSettings.getViewSetting(viewDetail, fine);
  const frequency: string = viewSettings.getViewSetting(viewFrequency, monthly);
  const taxChartType: string = viewSettings.getViewSetting(
    taxChartFocusType,
    allItems,
  );
  const taxChartPerson: string = viewSettings.getViewSetting(
    taxChartFocusPerson,
    allItems,
  );
  const taxChartNetString: string = viewSettings.getViewSetting(
    taxChartShowNet,
    allItems,
  );
  const taxChartNet =
    taxChartNetString === 'Y' ||
    taxChartNetString === 'y' ||
    taxChartNetString === 'yes';
  return {
    detail,
    frequency,
    taxChartType,
    taxChartPerson,
    taxChartNet,
  };
}

function mapNamesToTypes(model: DbModelData) {
  const nameToTypeMap = new Map<string, string>();
  model.expenses.forEach(expense => {
    nameToTypeMap.set(expense.NAME, evaluationType.expense);
  });
  model.incomes.forEach(income => {
    nameToTypeMap.set(income.NAME, evaluationType.income);
    const liabilities = income.LIABILITY.split(separator);
    liabilities.forEach(l => {
      if (l.endsWith(incomeTax)) {
        const person = l.substring(0, l.length - incomeTax.length);
        const icTag = makeIncomeTaxTag(person);
        const netIncomeTag = makeNetIncomeTag(person);
        // log(`netIncomeTag = ${netIncomeTag}, icTag   = ${icTag}`);
        nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
        nameToTypeMap.set(icTag, evaluationType.taxLiability);
      } else if (l.endsWith(nationalInsurance)) {
        const person = l.substring(0, l.length - nationalInsurance.length);
        const niTag = makeNationalInsuranceTag(person);
        const netIncomeTag = makeNetIncomeTag(person);
        // log(`netIncomeTag = ${netIncomeTag}, niTag   = ${niTag}`);
        nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
        nameToTypeMap.set(niTag, evaluationType.taxLiability);
      }
    });
  });
  model.assets.forEach(asset => {
    nameToTypeMap.set(asset.NAME, evaluationType.asset);
    const liabilities = asset.LIABILITY.split(separator);
    liabilities.forEach(l => {
      if (l.endsWith(cgt)) {
        const person = l.substring(0, l.length - cgt.length);
        const cgtTag = makeCGTTag(person);
        const netGainTag = makeNetGainTag(person);
        // log(`netGainTag = ${netGainTag}, cgtTag   = ${cgtTag}`);
        nameToTypeMap.set(netGainTag, evaluationType.taxLiability);
        nameToTypeMap.set(cgtTag, evaluationType.taxLiability);
      } else if (l.endsWith(incomeTax)) {
        const person = l.substring(0, l.length - incomeTax.length);
        const icTag = makeIncomeTaxTag(person);
        const netIncomeTag = makeNetIncomeTag(person);
        // log(`netIncomeTag = ${netIncomeTag}, icTag   = ${icTag}`);
        nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
        nameToTypeMap.set(icTag, evaluationType.taxLiability);
      } else if (l.endsWith(nationalInsurance)) {
        const person = l.substring(0, l.length - nationalInsurance.length);
        const niTag = makeNationalInsuranceTag(person);
        const netIncomeTag = makeNetIncomeTag(person);
        // log(`netIncomeTag = ${netIncomeTag}, niTag   = ${niTag}`);
        nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
        nameToTypeMap.set(niTag, evaluationType.taxLiability);
      }
    });
    if (asset.NAME.startsWith(crystallizedPension)) {
      const person = asset.NAME.substring(
        crystallizedPension.length,
        asset.NAME.length,
      );
      const icTag = makeIncomeTaxTag(person);
      const netIncomeTag = makeNetIncomeTag(person);

      // log(`netIncomeTag = ${netIncomeTag}, icTag   = ${icTag}`);
      nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
      nameToTypeMap.set(icTag, evaluationType.taxLiability);
    }
  });
  model.settings.forEach(setting => {
    nameToTypeMap.set(setting.NAME, evaluationType.setting);
  });
  nameToTypeMap.set(incomeTax, evaluationType.taxLiability);
  nameToTypeMap.set(nationalInsurance, evaluationType.taxLiability);
  nameToTypeMap.set(cgt, evaluationType.taxLiability);
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

function getDisplayType(
  evaln: Evaluation,
  nameToTypeMap: Map<string, string>,
  getDisplay: (type: ViewType) => boolean,
) {
  // ensure that for this evaluation, its type
  // is present in the typeDateNameValueMap
  const evalnType = nameToTypeMap.get(evaln.name);
  if (evalnType === undefined) {
    checkEvalnType(
      // could print 'BUG'
      evaln,
      nameToTypeMap,
    );
    // log(`don't include ${evaln.name} in chart`);
    return undefined; // don't include in chart
  }
  if (
    evalnType === evaluationType.income &&
    !(getDisplay(incomesView) || getDisplay(overview))
  ) {
    return undefined;
  }
  if (
    evalnType === evaluationType.expense &&
    !(getDisplay(expensesView) || getDisplay(overview))
  ) {
    return undefined;
  }
  if (
    evalnType === evaluationType.asset &&
    !(getDisplay(assetsView) || getDisplay(debtsView) || getDisplay(overview))
  ) {
    return undefined;
  }
  if (
    evalnType === evaluationType.taxLiability &&
    !(getDisplay(taxView) || getDisplay(overview))
  ) {
    return undefined;
  }
  return evalnType;
}

export function makeChartDataFromEvaluations(
  model: DbModelData,
  viewSettings: ViewSettings,
  evaluationsAndVals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<string, number>;
    todaysDebtValues: Map<string, number>;
    todaysIncomeValues: Map<string, number>;
    todaysExpenseValues: Map<string, number>;
    todaysSettingValues: Map<string, string>;
  },
  getDisplay: (type: ViewType) => boolean = () => {
    return true;
  },
) {
  if (evaluationsAndVals.evaluations.length === 0) {
    const emptyData: DataForView = {
      expensesData: [],
      incomesData: [],
      assetData: [],
      debtData: [],
      taxData: [],
      todaysAssetValues: new Map<string, number>(),
      todaysDebtValues: new Map<string, number>(),
      todaysIncomeValues: new Map<string, number>(),
      todaysExpenseValues: new Map<string, number>(),
      todaysSettingValues: new Map<string, string>(),
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

  const categoryCache = new Map<string, string>();
  const {
    detail,
    frequency,
    taxChartPerson,
    taxChartType,
    taxChartNet,
  } = getSettingsValues(viewSettings);

  const showAllAssets = viewSettings.getShowAll(assetChartFocus);
  const showAllDebts = viewSettings.getShowAll(debtChartFocus);
  const showAllIncomes = viewSettings.getShowAll(incomeChartFocus);
  const showAllExpenses = viewSettings.getShowAll(expenseChartFocus);
  const showAssetAdditions = viewSettings.getShowValue(chartAdditions);
  const showAssetReductions = viewSettings.getShowValue(chartReductions);
  const showAssetValues = viewSettings.getShowValue(chartVals);
  const showSingleAsset = viewSettings.getShowSingleItem(
    assetNames,
    assetChartFocus,
  );
  const showSingleDebt = viewSettings.getShowSingleItem(
    debtNames,
    debtChartFocus,
  );

  // set up empty data structure for result
  const result: DataForView = {
    expensesData: [],
    incomesData: [],
    assetData: [],
    debtData: [],
    taxData: [],
    todaysAssetValues: new Map<string, number>(),
    todaysDebtValues: new Map<string, number>(),
    todaysIncomeValues: new Map<string, number>(),
    todaysExpenseValues: new Map<string, number>(),
    todaysSettingValues: new Map<string, string>(),
  };

  result.todaysAssetValues = evaluationsAndVals.todaysAssetValues;
  result.todaysDebtValues = evaluationsAndVals.todaysDebtValues;
  result.todaysIncomeValues = evaluationsAndVals.todaysIncomeValues;
  result.todaysExpenseValues = evaluationsAndVals.todaysExpenseValues;
  result.todaysSettingValues = evaluationsAndVals.todaysSettingValues;

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
    'tax', // we will track data for this special "asset"
    new Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >(),
  );
  let assetOrDebtValueSources: string[] = [];

  const prevEvalAssetValue = new Map<string, number>();
  // prev is used to calc + or -

  evaluationsAndVals.evaluations.forEach(evaln => {
    const firstDateAfterEvaln = allDates.find(d => d >= evaln.date);
    if (firstDateAfterEvaln === undefined) {
      // no need to capture data from this evaluation
      // it's after all our dates for the chart
      // log(`evaln = ${showObj(evaln)} not in date range - don't process`);
      return;
    }
    const evalnType = getDisplayType(evaln, nameToTypeMap, getDisplay);
    if (!evalnType) {
      return;
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
          // we tracked this evaluation just to adjust accrued benefit
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

        if (evalnType === evaluationType.taxLiability) {
          //  log(`set taxLiability ${showObj(evaln)}`);
          nameValueMap.set(evaln.source, evaln.value);
        } else if (
          existingValue === undefined ||
          evalnType === evaluationType.asset
        ) {
          // asset valuations over-write previous values
          nameValueMap.set(evaln.name, evaln.value);
        } else if (
          evalnType === evaluationType.income ||
          evalnType === evaluationType.expense ||
          evalnType === evaluationType.expense
        ) {
          // income or expense values accumulate over time
          // log(`accumulate chart values for ${evaln.name}`);
          const newValue = existingValue + evaln.value;
          // log(`change ${existingValue} to ${newValue}`);
          nameValueMap.set(evaln.name, newValue);
        } else if (evalnType === evaluationType.setting) {
          // nameValueMap.set(evaln.name, evaln.value);
        } else {
          throw new Error(`unhandled evaluation type ${evalnType}`);
        }
      }
    }

    logMapOfMapofMap(typeDateNameValueMap);
    // log(`evaln.name = ${evaln.name}, evalnType = ${evalnType}`);

    // accumulate data for assets, debts, tax
    let doIncludeEvaln = false;
    if (evalnType === evaluationType.taxLiability) {
      // log(`tax evaln = ${showObj(evaln)}`);
      const tagData = deconstructTaxTag(evaln.source);
      // log(`tag = ${showObj(tagData)}`);
      let rightType = false;
      let rightPerson = false;
      if (taxChartType === allItems) {
        rightType = true;
      } else if (taxChartType === gain) {
        if (tagData.isGain) {
          rightType = true;
        }
      } else if (taxChartType === income) {
        if (tagData.isIncome) {
          rightType = true;
        }
      }
      if (rightType) {
        // log(`taxChartNet = ${taxChartNet} and tagData.isNet = ${tagData.isNet}`);
        if (!taxChartNet && tagData.isNet) {
          // log(`exclude ${evaln.source} from graph`);
          rightType = false;
        }
      }
      if (rightType) {
        if (taxChartPerson === allItems) {
          rightPerson = true;
        } else {
          if (tagData.person === taxChartPerson) {
            rightPerson = true;
          }
        }
      }
      doIncludeEvaln = rightType && rightPerson;
      // log(`include? = ${doIncludeEvaln}`);
    } else {
      const category = getCategory(evaln.name, categoryCache, model);
      doIncludeEvaln =
        viewSettings.getShowAssetItem(evaln.name) ||
        viewSettings.getShowDebtItem(evaln.name) ||
        (showAllAssets && assetNames.indexOf(evaln.name) >= 0) ||
        (showAllDebts && debtNames.indexOf(evaln.name) >= 0) ||
        viewSettings.getShowAssetItem(category) ||
        viewSettings.getShowDebtItem(category);
    }
    if (doIncludeEvaln) {
      // log(`evaln of asset ${showObj(evaln)} for val or delta...`);
      // direct asset data to the assets part of typeDateNameValueMap
      // and the tax part to the "tax" part of typeDateNameValueMap
      let assetOrDebtDateNameValueMap;
      if (evalnType === evaluationType.taxLiability) {
        // log(`evaln for tax chart = ${showObj(evaln)}`);
        assetOrDebtDateNameValueMap = typeDateNameValueMap.get('tax');
      } else {
        assetOrDebtDateNameValueMap = typeDateNameValueMap.get(
          'assetOrDebtFocus',
        );
      }
      if (assetOrDebtDateNameValueMap !== undefined) {
        const date = firstDateAfterEvaln.toDateString();
        if (!assetOrDebtDateNameValueMap.has(date)) {
          assetOrDebtDateNameValueMap.set(date, new Map<string, number>());
        }
        const assetOrDebtNameValueMap = assetOrDebtDateNameValueMap.get(date);
        if (assetOrDebtNameValueMap !== undefined) {
          // log(`${date} asset source '${evaln.source}' and value '${evaln.value}'`);
          // log(`assetChartSetting = ${assetChartSetting}`);
          // Either log values or deltas;
          // and assets plot values or deltas according to assetChartSetting.
          if (evalnType !== evaluationType.taxLiability && showAssetValues) {
            // Log asset values.
            // log(`add data[${evaln.name}] = ${evaln.value}`);
            if (assetOrDebtValueSources.indexOf(evaln.name) < 0) {
              // log(`add value source ${evaln.name}`);
              assetOrDebtValueSources.push(evaln.name);
            }
            // we display the latest evaluation, even if there
            // was one already, we overwrite the value
            assetOrDebtNameValueMap.set(evaln.name, evaln.value);
          } else if (evalnType === evaluationType.taxLiability) {
            const mapKey = evaln.source;
            // log(`setting tax chart data ${mapKey}, ${evaln.value}`);
            assetOrDebtNameValueMap.set(mapKey, evaln.value);
            if (assetOrDebtValueSources.indexOf(mapKey) < 0) {
              assetOrDebtValueSources.push(mapKey);
            }
          } else {
            // view a delta - what has been the change to the asset?
            const mapKey = evaln.source + separator + evaln.name;
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
            const existingDelta = assetOrDebtNameValueMap.get(mapKey);
            if (existingDelta !== undefined) {
              // accumulate changes
              // log(`existing delta is ${existingDelta}`);
              valueForChart += existingDelta;
              // log(`accumulated delta is ${valueForChart}`);
            } else if (valueForChart !== 0) {
              // log(`no pre-existing delta`);
            }
            if (showAssetAdditions && valueForChart < 0) {
              // log(`suppress -ve deltas when looking for additions`);
            } else if (showAssetReductions && valueForChart > 0) {
              // log(`suppress +ve deltas when looking for reductions`);
            } else if (valueForChart === 0) {
              // log(`don\'t include zero values for chart: ${evaln.source}`);
            } else {
              // log(`log chart delta ${valueForChart}`);
              assetOrDebtNameValueMap.set(mapKey, valueForChart);
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
        categoryCache,
      );
      if (categories !== undefined) {
        typeDateNameValueMap.set('assetOrDebtFocus', categories.map);
        assetOrDebtValueSources = [...categories.sources];
      }
      assetNames = [...categories.sources]; // NQR
      debtNames = [...categories.sources]; // NQR
    }
    if (showAllExpenses) {
      // unfocussed expense views can have coarse views
      dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
      if (dateNameValueMap !== undefined) {
        const categories = assignCategories(
          dateNameValueMap,
          allDates,
          expenseNames,
          model,
          categoryCache,
        );
        typeDateNameValueMap.set(evaluationType.expense, categories.map);
        expenseNames = [...categories.sources];
      }
    }
    if (showAllIncomes) {
      // unfocussed income views can have coarse views
      dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
      if (dateNameValueMap !== undefined) {
        const categories = assignCategories(
          dateNameValueMap,
          allDates,
          incomeNames,
          model,
          categoryCache,
        );
        typeDateNameValueMap.set(evaluationType.income, categories.map);
        incomeNames = [...categories.sources];
      }
    }
  }

  // log(`compare ${expenseChartFocus} against ${expenseChartFocusAll}`);
  if (!showAllExpenses) {
    // apply a filter to expense data
    // focussed expense views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterItems(
        dateNameValueMap,
        allDates,
        expenseNames,
        model,
        categoryCache,
        viewSettings,
        expenseChartFocus,
      );
      typeDateNameValueMap.set(evaluationType.expense, focusItems.map);
    }
  }
  if (!showAllIncomes) {
    // apply a filter to income data
    // focussed income views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterItems(
        dateNameValueMap,
        allDates,
        incomeNames,
        model,
        categoryCache,
        viewSettings,
        incomeChartFocus,
      );
      typeDateNameValueMap.set(evaluationType.income, focusItems.map);
    }
  }

  const mapForChart = typeDateNameValueMap.get('assetOrDebtFocus');
  if (mapForChart !== undefined) {
    // log(`go to make asset points@`);
    // log(`assetChartFocusName = ${assetChartFocusName}`);

    let assetChartNames = [];
    let debtChartNames = [];
    // when we plot the values of a single asset
    // we want to use assetValueSources as the chart items
    // (i.e. in the chart legend)
    // when we plot deltas, additions or reductions,
    // use the source as the item
    if (showSingleAsset || !showAssetValues) {
      assetChartNames = assetOrDebtValueSources;
    } else if (showAllAssets) {
      // when showing all assets and values,
      // use assetNames (not sources)
      assetChartNames = assetNames;
    } else {
      assetChartNames = assetOrDebtValueSources;
    }
    if (!showAllAssets && !showSingleAsset && showAssetValues) {
      assetChartNames = assetChartNames.filter(i => assetNames.includes(i));
    }
    // log(`assetChartNames = ${showObj(assetChartNames)}`);

    if (showSingleDebt || !showAssetValues) {
      debtChartNames = assetOrDebtValueSources;
    } else if (showAllDebts) {
      // when showing all debt and values,
      // use debtNames (not sources)
      debtChartNames = debtNames;
    } else {
      debtChartNames = assetOrDebtValueSources;
    }
    if (!showAllDebts && !showSingleDebt && showAssetValues) {
      debtChartNames = debtChartNames.filter(i => debtNames.includes(i));
    }

    const aDTAssetChartNames = makeADTChartNames(
      assetChartNames,
      model,
      viewSettings,
      showAllAssets,
      showAllDebts,
    );
    const aDTDebtChartNames = makeADTChartNames(
      debtChartNames,
      model,
      viewSettings,
      showAllAssets,
      showAllDebts,
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

  const mapForTaxChart = typeDateNameValueMap.get('tax');
  if (mapForTaxChart !== undefined) {
    logMapOfMap(mapForTaxChart);
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
