import {
  allItems,
  chartAdditions,
  chartReductions,
  chartVals,
  birthDate,
  cgt,
  coarseDetail,
  crystallizedPension,
  gain,
  income,
  incomeTax,
  monthly,
  nationalInsurance,
  pensionDB,
  revalue,
  separator,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  totalDetail,
  viewDetail,
  viewFrequency,
  dot,
  annually,
  weekly,
  assetsView,
  expensesView,
  incomesView,
  taxView,
} from "../localization/stringConstants";
import {
  Context,
  DateFormatType,
  log,
  makeDateFromString,
  printDebug,
  showObj,
} from "../utils/utils";
import { generateSequenceOfDates, processGenerators } from "./evaluations";

import { checkEvalnType, evaluationType } from "./checks";
import {
  makeTwoDP,
  makeIncomeTaxTag,
  makeNetIncomeTag,
  makeNationalInsuranceTag,
  makeCGTTag,
  makeNetGainTag,
  getTriggerDate,
  deconstructTaxTag,
  dateAsString,
  lessThan,
} from "../utils/stringUtils";
import { getROI } from "./modelUtils";
import { getCategory } from "./category";
import { ViewSettings, getDisplayedView } from "../utils/viewUtils";
import { getSettings, getVarVal } from "./modelQueries";
import {
  Setting,
  ItemChartData,
  ChartDataPoint,
  ModelData,
  Evaluation,
  Asset,
  AssetOrDebtVal,
  Income,
  IncomeVal,
  Expense,
  ExpenseVal,
  SettingVal,
  DataForView,
  Interval,
} from "../types/interfaces";
import { makeModelFromJSONString } from "./modelFromJSON";

function logMapOfMap(
  twoMap: Map<string, Map<string, number>>,
  display = false,
) {
  /* istanbul ignore if */
  if (display) {
    log("twoMap:");
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

function logMapOfMapofMap(
  threeMap: Map<any, Map<any, Map<any, any>>>,
  display = false,
) {
  /* istanbul ignore if */
  if (display) {
    log("threeMap:");
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

function totalChartDataPoints(
  dateNameValueMap: Map<string, Map<string, number>>,
  dates: Date[],
  items: string[],
) {
  const result = new Map<string, Map<string, number>>();
  dates.forEach((date) => {
    let totalValue = 0.0;
    const dateString = dateAsString(DateFormatType.Test, date);
    items.forEach((item) => {
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
      nvm.set("Total", totalValue);
    }
  });
  logMapOfMap(result);
  return result;
}

function makeAgeString(date: Date, birthDateSetting: string) {
  const diff = date.getTime() - makeDateFromString(birthDateSetting).getTime();
  const age = Math.floor(diff / 31557600000); // Divide by 1000*60*60*24*365.25
  // log(`age from birthDate '${birthDateSetting}' = ${age}`);
  return `${age}`;
}

function makeChartDataPoints(
  dateNameValueMapIncoming: Map<string, Map<string, number>>,
  dates: Date[],
  itemsIncoming: string[],
  settings: Setting[],
  negateValues: boolean,
  totalValues: boolean,
): ItemChartData[] {
  let dateNameValueMap = dateNameValueMapIncoming;
  let items = itemsIncoming;
  if (totalValues) {
    // log(`total the items in map`);
    dateNameValueMap = totalChartDataPoints(dateNameValueMap, dates, items);
    items = ["Total"];
  }

  // log(`now make chart data for ${items}`);
  logMapOfMap(dateNameValueMap);
  const chartDataPointMap = new Map<
    string, // name
    ChartDataPoint[]
  >();

  const birthDateSetting = getSettings(settings, birthDate, "");
  dates.forEach((date) => {
    const dateString = dateAsString(DateFormatType.Test, date);
    items.forEach((item) => {
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
      /* istanbul ignore if */
      if (chartArray === undefined) {
        log("BUG; chartArray should be defined");
      } else {
        // log(`add to array ${showObj({label: dateString, y:value})}`);
        const twoDPstring = makeTwoDP(value);
        let dataLabel = dateString;
        if (birthDateSetting !== "") {
          dataLabel = makeAgeString(date, birthDateSetting);
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
  const allChartDataPoints: {
    name: string;
    chartDataPoints: ChartDataPoint[];
  }[] = [];
  for (const [item, array] of chartDataPointMap) {
    /* eslint-disable-line no-restricted-syntax */
    allChartDataPoints.push({ name: item, chartDataPoints: array });
  }

  /* istanbul ignore if  */
  if (printDebug()) {
    allChartDataPoints.forEach(
      (entry: { name: string; chartDataPoints: ChartDataPoint[] }) => {
        const name = entry.name;
        const message =
          `item ${name} has chart points ` +
          `${showObj(entry.chartDataPoints)}`;
        log(message);
      },
    );
  }
  const result: ItemChartData[] = [];
  // log(`done making asset points@`);
  allChartDataPoints.forEach((pr) => {
    const nonZeroInstance = pr.chartDataPoints.findIndex((cdp) => {
      return cdp.y !== 0;
    });
    if (nonZeroInstance >= 0) {
      // log(`non-zero instance found ${showObj(pr)}`);
      result.push({
        item: {
          NAME: pr.name,
          ERA: undefined,
        },
        chartDataPoints: pr.chartDataPoints,
      });
    }
  });
  return result;
}

function displayWordAs(
  word: string,
  model: ModelData,
  viewSettings: ViewSettings,
) {
  //log(`determine where/how to display ${showObj(word)} in a chart`);
  const result = {
    asset: false,
    debt: false,
  };

  const assetMatch = model.assets.filter((a) => {
    return a.NAME === word;
  });
  if (assetMatch.length !== 0) {
    // log(`matched name ${word}`);
    if (!assetMatch[0].IS_A_DEBT) {
      // have a matching asset
      // Include if focus is allItems or this asset name
      const setAsset = viewSettings.getShowItem(
        Context.Asset,
        assetMatch[0].NAME,
      );
      if (setAsset) {
        result.asset = true;
      }
    } else {
      // have a matching debt
      // Include if focus is allItems or this debt name
      const setDebt = viewSettings.getShowItem(
        Context.Debt,
        assetMatch[0].NAME,
      );
      if (setDebt) {
        result.debt = true;
      }
    }
  }

  const catMatch = model.assets.filter((a) => {
    return a.CATEGORY === word;
  });
  if (catMatch.length !== 0) {
    catMatch.forEach((a) => {
      // log(`matched category ${word}`);
      if (a.IS_A_DEBT) {
        // Have a debt with a matching category
        // Include if focus is allItems or this category name
        const setDebt = viewSettings.getShowItem(Context.Debt, a.NAME);
        if (setDebt) {
          result.debt = true;
        }
      } else {
        // Have an asset with a matching category
        // Include if focus is allItems or this category name
        const setAsset = viewSettings.getShowItem(Context.Asset, a.NAME);
        if (setAsset) {
          result.asset = true;
        }
      }
    });
  }
  return result;
}

function displayAs(name: string, model: ModelData, viewSettings: ViewSettings) {
  const words = name.split(separator);
  const result = {
    asset: false,
    debt: false,
  };
  if (words.length > 1) {
    words.shift(); // remove the first item which is the description
    // the second item is the thing that's affected and determine
    // where to display
  }
  words.forEach((w) => {
    const x = displayWordAs(w, model, viewSettings);
    if (x.asset) {
      result.asset = true;
    }
    if (x.debt) {
      result.debt = true;
    }
  });
  /* istanbul ignore if  */
  if (printDebug()) {
    if (result.asset) {
      log(`display ${name} as an asset`);
    }
    if (result.debt) {
      log(`display ${name} as an debt`);
    }
  }
  return result;
}
function makeADTChartNames(
  allNames: string[],
  model: ModelData,
  viewSettings: ViewSettings,
) {
  // log(`allNames = ${showObj(allNames)}`)
  const assetChartNames: string[] = [];
  const debtChartNames: string[] = [];
  allNames.forEach((n) => {
    const x = displayAs(n, model, viewSettings);
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
  model: ModelData,
  categoryCache: Map<string, string>,
) {
  // log(`categorise these ${items}`);
  const categoryNames = new Set<string>();
  const mapForChart = new Map<string, Map<string, number>>();
  allDates.forEach((date) => {
    items.forEach((item) => {
      // log(`item = ${showObj(item)}`);
      const d = dateAsString(DateFormatType.Test, date);

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
      /* istanbul ignore if */
      if (nameValueMap === undefined) {
        log("BUG - map should exist");
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

function filterIncomeOrExpenseItems(
  dateNameValueMap: Map<
    string, // date
    Map<
      string, // name
      number // value
    >
  >,
  allDates: Date[],
  names: string[],
  viewSettings: ViewSettings,
  context: Context,
) {
  // log(`filter items by ${focus}`);
  const categoryNames = new Set<string>();
  const mapForChart = new Map<string, Map<string, number>>();
  allDates.forEach((date) => {
    names.forEach((item) => {
      const d = dateAsString(DateFormatType.Test, date);

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
      /* istanbul ignore if */
      if (nameValueMap === undefined) {
        log("BUG - map should exist");
        return;
      }
      // log(`item ${item} has category ${category}`);

      if (viewSettings.getShowItem(context, item)) {
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
  const v = getDisplayedView();
  const frequency: string = viewSettings.getViewSetting(
    `${viewFrequency}${v?.lc}`,
    annually,
  );
  // log(`get viewFrequency${getDisplayedView()?.lc} = ${frequency}`);

  //if(frequency !== annually){
  //  log(`viewSettings gave monthly viewSetting`);
  //}
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
  const taxChartNet = taxChartNetString === "Y";
  return {
    frequency,
    taxChartType,
    taxChartPerson,
    taxChartNet,
  };
}

function mapNamesToTypes(model: ModelData) {
  const nameToTypeMap = new Map<string, string>();
  model.expenses.forEach((expense) => {
    nameToTypeMap.set(expense.NAME, evaluationType.expense);
  });
  model.incomes.forEach((income) => {
    nameToTypeMap.set(income.NAME, evaluationType.income);
    const liabilities = income.LIABILITY.split(separator);
    liabilities.forEach((l) => {
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
  model.assets.forEach((asset) => {
    nameToTypeMap.set(asset.NAME, evaluationType.asset);
    const liabilities = asset.LIABILITY.split(separator);
    liabilities.forEach((l) => {
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
      }
      /* istanbul ignore if */
      if (l.endsWith(nationalInsurance)) {
        log(`Error : didn't expect an asset to be liable to NI??`);
        const person = l.substring(0, l.length - nationalInsurance.length);
        const niTag = makeNationalInsuranceTag(person);
        const netIncomeTag = makeNetIncomeTag(person);
        // log(`netIncomeTag = ${netIncomeTag}, niTag   = ${niTag}`);
        nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
        nameToTypeMap.set(niTag, evaluationType.taxLiability);
      }
    });
    if (asset.NAME.startsWith(crystallizedPension)) {
      const person = asset.NAME.substring(crystallizedPension.length).split(
        dot,
      )[0];
      const icTag = makeIncomeTaxTag(person);
      const netIncomeTag = makeNetIncomeTag(person);

      // log(`netIncomeTag = ${netIncomeTag}, icTag   = ${icTag}`);
      nameToTypeMap.set(netIncomeTag, evaluationType.taxLiability);
      nameToTypeMap.set(icTag, evaluationType.taxLiability);
    }
  });
  model.settings.forEach((setting) => {
    nameToTypeMap.set(setting.NAME, evaluationType.setting);
  });
  nameToTypeMap.set(incomeTax, evaluationType.taxLiability);
  nameToTypeMap.set(nationalInsurance, evaluationType.taxLiability);
  nameToTypeMap.set(cgt, evaluationType.taxLiability);

  // for (const [key, value] of nameToTypeMap) {
  /* eslint-disable-line no-restricted-syntax */
  //   log(`nameToTypeMap[${key}]=${value}`);
  // }

  return nameToTypeMap;
}

function generateEvaluationDates(roi: Interval, frequency: string) {
  const addPreDate = true;
  let freqString = "";
  if (frequency === monthly) {
    freqString = "1m";
  } else if (frequency === weekly) {
    freqString = "1w";
  } else {
    freqString = "1y";
  }
  return generateSequenceOfDates(roi, freqString, addPreDate);
}

function getDisplayType(evaln: Evaluation, nameToTypeMap: Map<string, string>) {
  // ensure that for this evaluation, its type
  // is present in the typeDateNameValueMap
  const evalnType = nameToTypeMap.get(evaln.name);
  if (evalnType === undefined) {
    checkEvalnType(
      // could print 'BUG'
      evaln,
      nameToTypeMap,
    );
    return undefined; // don't include in chart
  }
  return evalnType;
}

function needsEmptyCharts(evaluationsAndVals: {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
}) {
  return evaluationsAndVals.evaluations.length === 0;
}
function emptyCharts() {
  const emptyData: DataForView = {
    labels: [],
    expensesData: [],
    incomesData: [],
    assetData: [],
    debtData: [],
    taxData: [],
    todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
    todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
    todaysIncomeValues: new Map<Income, IncomeVal>(),
    todaysExpenseValues: new Map<Expense, ExpenseVal>(),
    todaysSettingValues: new Map<Setting, SettingVal>(),
    reportData: [],
    totalTaxPaid: 0,
  };
  return emptyData;
}

function addAssetValueToChart(
  valueForChart: number,
  assetOrDebtNameValueMap: Map<string, number>,
  mapKey: string,
  showAssetAdditions: boolean,
  showAssetReductions: boolean,
  assetOrDebtValueSources: string[],
) {
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
}

export function makeChartData(
  model: ModelData,
  viewSettings: ViewSettings,
  evaluationsAndVals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
  },
) {
  if (needsEmptyCharts(evaluationsAndVals)) {
    return emptyCharts();
  }

  const roi = getROI(model);

  const assets = model.assets.filter((a) => {
    return a.IS_A_DEBT === false;
  });
  const debts = model.assets.filter((a) => {
    return a.IS_A_DEBT === true;
  });
  let incomeNames: string[] = model.incomes.map((i) => i.NAME);
  let expenseNames: string[] = model.expenses.map((e) => e.NAME);
  let assetNames: string[] = assets.map((a) => a.NAME);
  let debtNames: string[] = debts.map((d) => d.NAME);

  const categoryCache = new Map<string, string>();

  const { frequency, taxChartType, taxChartPerson, taxChartNet } =
    getSettingsValues(viewSettings);
  const showAllAssets = viewSettings.getShowAll(Context.Asset);
  const showAllDebts = viewSettings.getShowAll(Context.Debt);
  const showAllIncomes = viewSettings.getShowAll(Context.Income);
  const showAllExpenses = viewSettings.getShowAll(Context.Expense);
  const showAssetAdditions = viewSettings.getChartViewType(chartAdditions);
  const showAssetReductions = viewSettings.getChartViewType(chartReductions);
  const showAssetValues = viewSettings.getChartViewType(chartVals);

  // set up empty data structure for result
  const result: DataForView = {
    labels: [],
    expensesData: [],
    incomesData: [],
    assetData: [],
    debtData: [],
    taxData: [],
    todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
    todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
    todaysIncomeValues: new Map<Income, IncomeVal>(),
    todaysExpenseValues: new Map<Expense, ExpenseVal>(),
    todaysSettingValues: new Map<Setting, SettingVal>(),
    reportData: [],
    totalTaxPaid: 0,
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
    "assetOrDebtFocus",
    new Map<
      string, // date
      Map<
        string, // name
        number // value
      >
    >(),
  );
  typeDateNameValueMap.set(
    "tax",
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

  let taxTotal = 0.0;
  evaluationsAndVals.evaluations.forEach((evaln) => {
    const firstDateAfterEvaln = allDates.find((d) => d >= evaln.date);
    if (firstDateAfterEvaln === undefined) {
      // no need to capture data from this evaluation
      // it's after all our dates for the chart
      // log(`evaln = ${showObj(evaln)} not in date range - don't process`);
      return;
    }
    const evalnType = getDisplayType(evaln, nameToTypeMap);
    if (!evalnType) {
      // e.g. when quantities change we come here
      return;
    }
    // log(`processing ${showObj(evaln)}`);
    // log(`evalnType = ${evalnType}`);
    //
    // revalues or pensionDB incomes and expenses
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
        const matchingIncome = model.incomes.find((i) => {
          return i.NAME === evaln.name;
        });
        /* istanbul ignore if */
        if (matchingIncome === undefined) {
          throw new Error(`couldn't match income for ${evaln.name}`);
        }
        if (
          evaln.date <
          getTriggerDate(
            matchingIncome.START,
            model.triggers,
            getVarVal(model.settings),
          )
        ) {
          // we tracked this evaluation just to adjust accrued benefit
          // but don't actually received any of this income yet...
          // so skip for charting purposes
          return;
        }
      }
    }
    // log(`generate chart data for dates ${showObj(dates)}`);

    // Get a map ready to hold date->Map(name->value)
    ensureDateValueMapsExist(typeDateNameValueMap, evalnType);
    const dateNameValueMap = typeDateNameValueMap.get(evalnType);
    if (dateNameValueMap !== undefined) {
      const date = dateAsString(DateFormatType.Test, firstDateAfterEvaln);
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

        /* istanbul ignore else */
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
      if (!tagData.isNet && doIncludeEvaln) {
        taxTotal += evaln.value;
      }
      // log(`include taxLiability? = ${doIncludeEvaln}`);
    } else {
      doIncludeEvaln =
        viewSettings.getShowItem(Context.Asset, evaln.name) ||
        viewSettings.getShowItem(Context.Debt, evaln.name);
      // log(`include ${evaln.name}? = ${doIncludeEvaln}`);
    }
    // log(`doIncludeEvaln = ${doIncludeEvaln}`);
    if (doIncludeEvaln) {
      // log(`evaln of asset ${showObj(evaln)} for val or delta...`);
      // direct asset data to the assets part of typeDateNameValueMap
      // and the tax part to the "tax" part of typeDateNameValueMap
      let assetOrDebtDateNameValueMap;
      if (evalnType === evaluationType.taxLiability) {
        // log(`evaln for tax chart = ${showObj(evaln)}`);
        assetOrDebtDateNameValueMap = typeDateNameValueMap.get("tax");
      } else {
        assetOrDebtDateNameValueMap =
          typeDateNameValueMap.get("assetOrDebtFocus");
      }
      if (assetOrDebtDateNameValueMap !== undefined) {
        const date = dateAsString(DateFormatType.Test, firstDateAfterEvaln);
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
            // compare prevValue against evaln data
            if (prevValue !== evaln.oldValue) {
              // log(
              //   `${evaln.name} at ${evaln.date} was ${evaln.oldValue}, last known was ${prevValue}`,
              // );
              const unidentifiedChange = evaln.oldValue - prevValue;
              addAssetValueToChart(
                unidentifiedChange,
                assetOrDebtNameValueMap,
                `unidentified${separator}${evaln.name}`,
                showAssetAdditions,
                showAssetReductions,
                assetOrDebtValueSources,
              );
              prevValue = evaln.oldValue;
            }
            // log(`asset ${evaln.name} val is `+
            //    `${evaln.value}, was ${prevValue}`);
            // log(`and the source of change is ${evaln.source}`);
            // log(`and change happened ${evaln.date}`);
            const valueForChart = evaln.value - prevValue;
            addAssetValueToChart(
              valueForChart,
              assetOrDebtNameValueMap,
              mapKey,
              showAssetAdditions,
              showAssetReductions,
              assetOrDebtValueSources,
            );
            // log(`set asset value as 'previous'
            //   for ${evaln.name} is ${evaln.value}`);
            prevEvalAssetValue.set(evaln.name, evaln.value);
          }
        }
      }
    }
  });
  // log(`taxTotal = ${taxTotal}`);

  logMapOfMapofMap(typeDateNameValueMap);

  // remove the 'preDate' (helped with defining first displayable bucket)
  allDates.shift();

  const taxValueSources = assetOrDebtValueSources;
  const assetDetail = viewSettings.getViewSetting(viewDetail, coarseDetail, assetsView); // TODO debtsView?
  if (assetDetail === coarseDetail || assetDetail === totalDetail) {
    // log('gather chart data into categories');
    const dateNameValueMap = typeDateNameValueMap.get("assetOrDebtFocus");
    if (dateNameValueMap !== undefined) {
      const categories = assignCategories(
        dateNameValueMap,
        allDates,
        assetOrDebtValueSources,
        model,
        categoryCache,
      );
      if (categories !== undefined) {
        typeDateNameValueMap.set("assetOrDebtFocus", categories.map);
        assetOrDebtValueSources = [...categories.sources];
      }
      assetNames = [...categories.sources]; // NQR
      debtNames = [...categories.sources]; // NQR
    }
  }

  // log(`compare ${expenseChartFocus} against ${expenseChartFocusAll}`);
  if (!showAllExpenses) {
    // apply a filter to expense data
    // focussed expense views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterIncomeOrExpenseItems(
        dateNameValueMap,
        allDates,
        expenseNames,
        viewSettings,
        Context.Expense,
      );
      typeDateNameValueMap.set(evaluationType.expense, focusItems.map);
    }
  }

  const expenseDetail = viewSettings.getViewSetting(viewDetail, coarseDetail, expensesView);
  if (expenseDetail === coarseDetail || expenseDetail === totalDetail) {
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.expense);
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
  if (!showAllIncomes) {
    // apply a filter to income data
    // focussed income views have fewer items displayed
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
    if (dateNameValueMap !== undefined) {
      const focusItems = filterIncomeOrExpenseItems(
        dateNameValueMap,
        allDates,
        incomeNames,
        viewSettings,
        Context.Income,
      );
      typeDateNameValueMap.set(evaluationType.income, focusItems.map);
    }
  }

  const incomeDetail = viewSettings.getViewSetting(viewDetail, coarseDetail, incomesView);
  if (incomeDetail === coarseDetail || incomeDetail === totalDetail) {
    // unfocussed income views can have coarse views
    const dateNameValueMap = typeDateNameValueMap.get(evaluationType.income);
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

  const mapForChart = typeDateNameValueMap.get("assetOrDebtFocus");
  if (mapForChart !== undefined) {
    // log(`go to make asset points@`);

    let assetChartNames = [];
    let debtChartNames = [];
    // when we plot the values of a single asset
    // we want to use assetValueSources as the chart items
    // (i.e. in the chart legend)
    // when we plot deltas, additions or reductions,
    // use the source as the item
    if (/*showSingleAsset || */ !showAssetValues) {
      assetChartNames = assetOrDebtValueSources;
    } else if (showAllAssets) {
      // when showing all assets and values,
      // use assetNames (not sources)
      assetChartNames = assetNames;
    } else {
      assetChartNames = assetOrDebtValueSources;
    }
    if (!showAllAssets && /*!showSingleAsset && */ showAssetValues) {
      assetChartNames = assetChartNames.filter((i) => assetNames.includes(i));
    }
    // log(`assetChartNames = ${showObj(assetChartNames)}`);

    if (/*showSingleDebt || */ !showAssetValues) {
      debtChartNames = assetOrDebtValueSources;
    } else if (showAllDebts) {
      // when showing all debt and values,
      // use debtNames (not sources)
      debtChartNames = debtNames;
    } else {
      debtChartNames = assetOrDebtValueSources;
    }
    if (!showAllDebts && /*!showSingleDebt && */ showAssetValues) {
      debtChartNames = debtChartNames.filter((i) => debtNames.includes(i));
    }

    const aDTAssetChartNames = makeADTChartNames(
      assetChartNames,
      model,
      viewSettings,
    );
    const aDTDebtChartNames = makeADTChartNames(
      debtChartNames,
      model,
      viewSettings,
    );

    result.assetData = makeChartDataPoints(
      mapForChart,
      allDates,
      aDTAssetChartNames.assetChartNames,
      model.settings,
      false, // don't negate
      assetDetail === totalDetail,
    );

    result.debtData = makeChartDataPoints(
      mapForChart,
      allDates,
      aDTDebtChartNames.debtChartNames,
      model.settings,
      true, // negate values
      assetDetail === totalDetail, // TODO debt?
    );

    result.totalTaxPaid = taxTotal;
  }

  const taxDetail = viewSettings.getViewSetting(viewDetail, coarseDetail, taxView);
  const mapForTaxChart = typeDateNameValueMap.get("tax");
  if (mapForTaxChart !== undefined) {
    logMapOfMap(mapForTaxChart);
    result.taxData = makeChartDataPoints(
      mapForTaxChart,
      allDates,
      taxValueSources,
      model.settings,
      false, // don't negate
      taxDetail === totalDetail,
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
      expenseDetail === totalDetail,
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
      incomeDetail === totalDetail,
    );
  }

  // log(`chart data produced: ${showObj(result)}`);
  const birthDateSetting = getSettings(model.settings, birthDate, "");
  result.labels = allDates.map((d) => {
    if (birthDateSetting !== "") {
      return makeAgeString(d, birthDateSetting);
    } else {
      return dateAsString(DateFormatType.Test, d);
    }
  });

  // log(`labels = ${result.labels}`);
  return result;
}

export function makeChartDataFromEvaluations(
  unprocessedModel: ModelData,
  viewSettings: ViewSettings,
  evaluationsAndVals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
  },
) {
  const modelProcessed = makeModelFromJSONString(JSON.stringify(unprocessedModel));
  modelProcessed.name = 'ready to be processed';

  processGenerators(modelProcessed);
  modelProcessed.name = 'has been processed';

  viewSettings.setModel(modelProcessed);
  const result = makeChartData(modelProcessed, viewSettings, evaluationsAndVals);

  result.taxData.sort((a, b) => lessThan(a.item.NAME, b.item.NAME));

  return result;
}
