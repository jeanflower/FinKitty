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
  assetChartAdditions,
  assetChartFocus,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  cgt,
  coarse,
  crystallizedPension,
  debtChartFocus,
  debtChartVal,
  debtChartView,
  expenseChartFocus,
  fine,
  gain,
  growth,
  income,
  incomeChartFocus,
  incomeTax,
  monthly,
  nationalInsurance,
  pensionDB,
  revalue,
  roiEnd,
  roiStart,
  separator,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  total,
  viewDetail,
  viewFrequency,
  viewType,
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
  getEvaluations,
  makeSourceForFromChange,
} from './evaluations';

import { checkEvalnType } from './checks';

export class ViewSettings {
  private kvPairs: Map<string, string> = new Map<string, string>();

  constructor(pairs: DbSetting[] = []){
    pairs.forEach((p)=>{
      this.kvPairs.set(p.NAME, p.VALUE);
    });
  }
  hasSetting(name: string){
    return this.kvPairs.get(name) !== undefined;
  }
  setViewSetting(key: string, value: string){
    this.kvPairs.set(key, value);
  }
  showItem(item: string): boolean {
    return this.kvPairs.get(expenseChartFocus) === item ||
      this.kvPairs.get(incomeChartFocus) === item ||
      this.kvPairs.get(assetChartFocus) === item ||
      this.kvPairs.get(debtChartFocus) === item;
  }
  showCategory(category: string): boolean {
    return this.showItem(category);
  }
  showAllExpenses(): boolean {
    return this.kvPairs.get(expenseChartFocus) === allItems;
  }
  getViewSetting(
    settingType: string,
    defaultValue: string,
    ){
    const result = this.kvPairs.get(settingType);
    if(result !== undefined){
      return result;
    } else {
      return defaultValue;
    }
  }
  getSettingsForTable(): DbSetting[]{
    const result: DbSetting[] = [];
    for (const k of this.kvPairs.keys()) {
      const v = this.kvPairs.get(k);
      if(v !== undefined){
        result.push({
          NAME: k,
          VALUE: v,
          TYPE: viewType,
          HINT: '',
        });
      }
    }
    return result;
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
  assetChartFocusName: string,
  debtChartFocusName: string,
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

      if (viewSettings.showItem(item) || viewSettings.showCategory(category)) {
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
  // log(`entering makeChartDataFromEvaluations`);
  const incomeFocus: string = viewSettings.getViewSetting(
    incomeChartFocus,
    allItems,
  );
  const assetChartFocusName = viewSettings.getViewSetting(
    assetChartFocus,
    allItems,
  );
  const debtChartFocusName = viewSettings.getViewSetting(
    debtChartFocus,
    allItems,
  );
  const detail: string = viewSettings.getViewSetting(
    viewDetail,
    fine,
  );
  const frequency: string = viewSettings.getViewSetting(
    viewFrequency,
    monthly,
  );
  const assetChartSetting: string = viewSettings.getViewSetting(
    assetChartView,
    assetChartVal,
  );
  const debtChartSetting: string = viewSettings.getViewSetting(
    debtChartView,
    debtChartVal,
  );
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
    incomeFocus,
    assetChartFocusName,
    debtChartFocusName,
    detail,
    frequency,
    assetChartSetting,
    debtChartSetting,
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

export function makeChartDataFromEvaluations(
  //roi: Interval,
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
) {
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

  const categoryCache = new Map<string, string>();
  const {
    incomeFocus,
    assetChartFocusName,
    debtChartFocusName,
    detail,
    frequency,
    assetChartSetting,
    debtChartSetting,
    taxChartPerson,
    taxChartType,
    taxChartNet,
  } = getSettingsValues(viewSettings);

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
      // log(`evaln = ${showObj(evaln)} not in date range - don't process`);
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
      // log(`don't include ${evaln.name} in chart`);
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
      doIncludeEvaln =
        evaln.name === assetChartFocusName ||
        evaln.name === debtChartFocusName ||
        (assetChartFocusName === allItems &&
          assetNames.indexOf(evaln.name) >= 0) ||
        (debtChartFocusName === allItems &&
          debtNames.indexOf(evaln.name) >= 0) ||
        getCategory(evaln.name, categoryCache, model) === assetChartFocusName ||
        getCategory(evaln.name, categoryCache, model) === debtChartFocusName;
    }
    if (doIncludeEvaln) {
      // log(`evaln of asset ${showObj(evaln)} for val or delta...`);
      // direct asset data to the assets part of typeDateNameValueMap
      // and the tax part to the "tax" part of typeDateNameValueMap
      let assetDateNameValueMap;
      if (evalnType === evaluationType.taxLiability) {
        // log(`evaln for tax chart = ${showObj(evaln)}`);
        assetDateNameValueMap = typeDateNameValueMap.get('tax');
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
          // Either log values or deltas;
          // and assets plot values or deltas according to assetChartSetting.
          if (
            evalnType !== evaluationType.taxLiability &&
            assetChartSetting === assetChartVal
          ) {
            // Log asset values.
            // log(`add data[${evaln.name}] = ${evaln.value}`);
            if (assetOrDebtValueSources.indexOf(evaln.name) < 0) {
              // log(`add value source ${evaln.name}`);
              assetOrDebtValueSources.push(evaln.name);
            }
            // we display the latest evaluation, even if there
            // was one already, we overwrite the value
            assetNameValueMap.set(evaln.name, evaln.value);
          } else if (evalnType === evaluationType.taxLiability) {
            const mapKey = evaln.source;
            // log(`setting tax chart data ${mapKey}, ${evaln.value}`);
            assetNameValueMap.set(mapKey, evaln.value);
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
              assetChartSetting === assetChartAdditions &&
              valueForChart < 0
            ) {
              // log(`suppress -ve deltas when looking for additions`);
            } else if (
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
        categoryCache,
      );
      if (categories !== undefined) {
        typeDateNameValueMap.set('assetOrDebtFocus', categories.map);
        assetOrDebtValueSources = [...categories.sources];
      }
      assetNames = [...categories.sources]; // NQR
      debtNames = [...categories.sources]; // NQR
    }
    if (viewSettings.showAllExpenses()) {
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
    if (incomeFocus === allItems) {
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
  if (!viewSettings.showAllExpenses()) {
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
        categoryCache,
        viewSettings,
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

export function makeChartData(
  model: DbModelData,
  viewSettings: ViewSettings,
): DataForView {
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
      todaysAssetValues: new Map<string, number>(),
      todaysDebtValues: new Map<string, number>(),
      todaysIncomeValues: new Map<string, number>(),
      todaysExpenseValues: new Map<string, number>(),
      todaysSettingValues: new Map<string, string>(),
    };
    return emptyData;
  }

  // log(`roi is ${showObj(roi)}`);
  return makeChartDataFromEvaluations(model, viewSettings, evaluationsAndVals);
}
