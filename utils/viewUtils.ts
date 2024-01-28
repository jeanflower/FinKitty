import { ItemCategory, ModelData } from "../types/interfaces";
import {
  viewFrequency,
  annually,
  chartViewType,
  chartVals,
  viewDetail,
  fineDetail,
  assetChartFocus,
  allItems,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  ViewType,
  assetsView,
  debtsView,
  expensesView,
  homeView,
  incomesView,
  overview,
  reportView,
  settingsView,
  taxView,
  transactionsView,
  triggersView,
  optimizerView,
  planningView,
  monitoringView,
} from "../localization/stringConstants";
import { allViews } from "./allViews";
import { Context, log, printDebug } from "./utils";

export class ViewSettings {
  private kvPairs: Map<string, string> = new Map<string, string>();
  private show = {
    [Context.Asset]: new Map<string, boolean>(),
    [Context.Debt]: new Map<string, boolean>(),
    [Context.Income]: new Map<string, boolean>(),
    [Context.Expense]: new Map<string, boolean>(),
    [Context.Transaction]: new Map<string, boolean>(),
    [Context.Trigger]: new Map<string, boolean>(),
    [Context.Setting]: new Map<string, boolean>(),
  };
  private dependents = {
    [Context.Asset]: new Map<string, string[]>(),
    [Context.Debt]: new Map<string, string[]>(),
    [Context.Income]: new Map<string, string[]>(),
    [Context.Expense]: new Map<string, string[]>(),
    [Context.Transaction]: new Map<string, string[]>(),
    [Context.Trigger]: new Map<string, string[]>(),
    [Context.Setting]: new Map<string, string[]>(),
  };
  private supercategories = {
    [Context.Asset]: new Map<string, string[]>(),
    [Context.Debt]: new Map<string, string[]>(),
    [Context.Income]: new Map<string, string[]>(),
    [Context.Expense]: new Map<string, string[]>(),
    [Context.Transaction]: new Map<string, string[]>(),
    [Context.Trigger]: new Map<string, string[]>(),
    [Context.Setting]: new Map<string, string[]>(),
  };
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

  public constructor(pairs: { NAME: string; VALUE: string }[]) {
    // log(`build new ViewSettings object from ${showObj(pairs)}`);
    pairs.forEach((p) => {
      // log(`input pair ${p.NAME}, ${p.VALUE}`);
      this.kvPairs.set(p.NAME, p.VALUE);
      const ctxt = this.makeContextFromString(p.NAME);
      if (ctxt !== undefined) {
        this.show[ctxt].set(p.VALUE, true);
      }
    });
    this.dependents = this.makeEmptyDependents();
    this.supercategories = this.makeEmptySuperCategories();
  }
  private makeEmptyDependents() {
    const result: {
      [Context.Asset]: Map<string, string[]>;
      [Context.Debt]: Map<string, string[]>;
      [Context.Income]: Map<string, string[]>;
      [Context.Expense]: Map<string, string[]>;
      [Context.Transaction]: Map<string, string[]>;
      [Context.Trigger]: Map<string, string[]>;
      [Context.Setting]: Map<string, string[]>;
    } = {
      [Context.Asset]: new Map<string, string[]>(),
      [Context.Debt]: new Map<string, string[]>(),
      [Context.Income]: new Map<string, string[]>(),
      [Context.Expense]: new Map<string, string[]>(),
      [Context.Transaction]: new Map<string, string[]>(),
      [Context.Trigger]: new Map<string, string[]>(),
      [Context.Setting]: new Map<string, string[]>(),
    };
    result[Context.Asset].set(allItems, []);
    result[Context.Debt].set(allItems, []);
    result[Context.Income].set(allItems, []);
    result[Context.Expense].set(allItems, []);
    return result;
  }
  private makeEmptySuperCategories() {
    const result: {
      [Context.Asset]: Map<string, string[]>;
      [Context.Debt]: Map<string, string[]>;
      [Context.Income]: Map<string, string[]>;
      [Context.Expense]: Map<string, string[]>;
      [Context.Transaction]: Map<string, string[]>;
      [Context.Trigger]: Map<string, string[]>;
      [Context.Setting]: Map<string, string[]>;
    } = {
      [Context.Asset]: new Map<string, string[]>(),
      [Context.Debt]: new Map<string, string[]>(),
      [Context.Income]: new Map<string, string[]>(),
      [Context.Expense]: new Map<string, string[]>(),
      [Context.Transaction]: new Map<string, string[]>(),
      [Context.Trigger]: new Map<string, string[]>(),
      [Context.Setting]: new Map<string, string[]>(),
    };
    return result;
  }
  private setInMapIfAbsent(context: Context, key: string, ascendent: string) {
    const map = this.show[context];
    if (map.get(key) !== undefined) {
      return;
    }
    const value =
      this.highlightButton(context, ascendent) ||
      this.highlightButton(context, allItems);
    map.set(key, value);
  }

  private addToDependents(context: Context, key: string, value: string) {
    const map = this.dependents[context];
    let arr: string[] | undefined = map.get(key);
    if (arr === undefined) {
      arr = [];
      map.set(key, arr);
    }
    if (
      arr.find((v) => {
        return v === value;
      }) === undefined
    ) {
      arr.push(value);
    }
    this.addToSuperCategories(context, value, key);
  }
  private addToSuperCategories(context: Context, key: string, value: string) {
    const map = this.supercategories[context];
    let arr: string[] | undefined = map.get(key);
    if (arr === undefined) {
      arr = [];
      map.set(key, arr);
    }
    if (
      arr.find((v) => {
        return v === value;
      }) === undefined
    ) {
      arr.push(value);
    }
  }

  private setItemFromModel(context: Context, a: ItemCategory) {
    this.addToDependents(context, allItems, a.NAME);
    this.addToDependents(context, allItems, a.CATEGORY);
    this.addToDependents(context, a.CATEGORY, a.NAME);
    this.setInMapIfAbsent(context, a.CATEGORY, a.CATEGORY);
    this.setInMapIfAbsent(context, a.NAME, a.CATEGORY);
  }

  public setModel(model: ModelData) {
    // log(`in setModel`);
    // log(`model assets ${model.assets.map((a)=>{return a.NAME})}`);
    // for incomes and expenses the filters list is
    // allIncomes, all expenses
    // all income names and categories
    // all expense names and categories
    // allAssets,
    // all asset names and categories

    this.dependents = this.makeEmptyDependents();
    this.supercategories = this.makeEmptySuperCategories();

    model.assets.forEach((a) => {
      if (a.IS_A_DEBT) {
        this.setItemFromModel(Context.Debt, a);
      } else {
        this.setItemFromModel(Context.Asset, a);
      }
    });
    model.expenses.forEach((a) => {
      this.setItemFromModel(Context.Expense, a);
    });
    model.incomes.forEach((a) => {
      this.setItemFromModel(Context.Income, a);
    });

    //for (const [key, value] of this.kvPairs) {
    /* eslint-disable-line no-restricted-syntax */
    //log(`after setModel, this.kvPairs[${key}]=${value}`);
    //}
    //for (const [key, value] of this.show[Context.Asset]) {
    /* eslint-disable-line no-restricted-syntax */
    //log(`after setModel, this.show[Context.Asset][${key}]=${value}`);
    //}
  }

  private makeContextFromString(context: string) {
    if (context === assetChartFocus) {
      return Context.Asset;
    } else if (context === debtChartFocus) {
      return Context.Debt;
    } else if (context === incomeChartFocus) {
      return Context.Income;
    } else if (context === expenseChartFocus) {
      return Context.Expense;
    } else {
      return undefined;
    }
  }

  // call from e.g. people adding a new Setting in a UI
  public setViewSetting(settingName: string, settingValue: string): boolean {
    if (settingName === viewFrequency) {
      const v = getDisplayedView();
      settingName = `${viewFrequency}${v?.lc}`;
    }
    if (settingName === viewDetail) {
      const v = getDisplayedView();
      settingName = `${viewDetail}${v?.lc}`;
    }

    if (this.kvPairs.get(settingName)) {
      this.kvPairs.set(settingName, settingValue);
      // log(`set ${settingName} to value ${settingValue}`);
      return true;
    } else {
      return false;
    }
  }
  public setDetailViewSetting(settingValue: string) {
    allViews.map((v) => {
      const settingName = `${viewDetail}${v.lc}`;
      if (this.kvPairs.get(settingName)) {
        this.kvPairs.set(settingName, settingValue);
        // log(`set ${settingName} to value ${settingValue}`);
      } else {
        // log(`set ${settingName} not found!`);
      }
    });
  }
  private setViewFilter(context: Context, settingType: string, value: boolean) {
    // log(`switch show(${settingType}) to ${value}`);
    this.show[context].set(settingType, value);
    const deps = this.dependents[context].get(settingType);
    if (deps !== undefined) {
      deps.forEach((dep) => {
        // log(`switch dependent show(${dep}) to ${value}`);
        this.show[context].set(dep, value);
      });
    }
    if (value === false) {
      const sups = this.supercategories[context].get(settingType);
      if (sups !== undefined) {
        sups.forEach((sup) => {
          // log(`switch superCategory show(${dep}) to ${false}`);
          this.show[context].set(sup, false);
        });
      }
    }
  }

  public toggleViewFilter(context: Context, filterName: string) {
    // log(`toggleViewFilter with context = `+
    // `${context}, filterName = ${filterName}`);
    if (this.highlightButton(context, filterName)) {
      this.setViewFilter(context, filterName, false);
    } else {
      // log(`switch show(${value}) from false to true`);
      this.setViewFilter(context, filterName, true);
    }
  }

  // e.g. for data in FutureExpense test data, the viewFrequency is captured
  // as a setting, but we need it as part of the viewSettings object instead
  public migrateViewSettingString(context: string, value: string) {
    context;
    value;
    const ctxt = this.makeContextFromString(context);
    if (ctxt !== undefined) {
      if (this.show[ctxt].get(value) === undefined) {
        return false;
      }
      this.migrateViewSetting(ctxt, value);
      return true;
    }
    if (this.kvPairs.get(context)) {
      this.kvPairs.set(context, value);
      if (context === viewFrequency && value !== annually) {
        if (printDebug()) {
          log(`migrateViewSettingString setting non-annual frequency`);
        }
      }
      return true;
    } else {
      return false;
    }
  }

  private migrateViewSetting(context: Context, value: string) {
    //clear pre-existing settings
    for (const [key] of this.show[context]) {
      // clear value
      // log(`clear values: set show(${key})  = false`);
      this.show[context].set(key, false);
    }
    // log(`set show(${value})  = true`);
    this.setViewFilter(context, value, true);
  }

  public getShowItem(context: Context, item: string): boolean {
    const result: boolean | undefined = this.show[context].get(item);
    if (result === undefined) {
      return false;
    } else {
      return result;
    }
  }

  //no need to optimise this
  public getShowAll(context: Context): boolean {
    const result = this.show[context].get(allItems);
    if (result === undefined) {
      return false;
    } else {
      return result;
    }
  }

  //no need to optimise this
  public getViewSetting(
    settingType: string,
    defaultValue: string,
    viewType: ViewType | undefined = undefined,
  ) {
    if (viewType == undefined) {
      viewType = getDisplayedView();
    }
    if (settingType === viewFrequency) {
      settingType = `${viewFrequency}${viewType?.lc}`;
      // log(`settingType = ${settingType}`);
    }
    if (settingType === viewDetail) {
      settingType = `${viewDetail}${viewType?.lc}`;
      // log(`settingType = ${settingType}`);
    }
    let result = this.kvPairs.get(settingType);
    if (result === undefined) {
      // log(`Error: missing view setting for ${settingType}`);
      result = defaultValue;
    }

    // log(`get ${settingType} as value ${result}}`);
    return result;
  }

  //no need to optimise this
  public getChartViewType(chartVal: string) {
    return this.kvPairs.get(chartViewType) === chartVal;
  }

  public highlightButton(context: Context, value: string) {
    const mapVal = this.show[context].get(value);
    // log(`highlightButton ${value}? ${mapVal}`)
    return mapVal !== undefined && mapVal;
  }
}

export function getDefaultViewSettings(): ViewSettings {
  const result = new ViewSettings(
    allViews
      .map((v) => {
        return {
          NAME: `${viewFrequency}${v.lc}`,
          VALUE: annually,
        };
      })
      .concat(
        allViews
      .map((v) => {
        return {
          NAME: `${viewDetail}${v.lc}`,
          VALUE: fineDetail,
        };
      })
        ,[
        {
          NAME: chartViewType,
          VALUE: chartVals,
        },
        {
          NAME: assetChartFocus,
          VALUE: allItems,
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
          VALUE: "Y",
        },
      ]),
  );
  return result;
}

export const views = new Map<
  ViewType,
  {
    display: boolean;
  }
>([
  [
    homeView,
    {
      display: true,
    },
  ],
  [
    overview,
    {
      display: false,
    },
  ],
  [
    incomesView,
    {
      display: false,
    },
  ],
  [
    expensesView,
    {
      display: false,
    },
  ],
  [
    assetsView,
    {
      display: false,
    },
  ],
  [
    debtsView,
    {
      display: false,
    },
  ],
  [
    taxView,
    {
      display: false,
    },
  ],
  [
    triggersView,
    {
      display: false,
    },
  ],
  [
    transactionsView,
    {
      display: false,
    },
  ],
  [
    reportView,
    {
      display: false,
    },
  ],
  [
    optimizerView,
    {
      display: false,
    },
  ],
  [
    planningView,
    {
      display: false,
    },
  ],
  [
    monitoringView,
    {
      display: false,
    },
  ],
  [
    settingsView,
    {
      display: false,
    },
  ],
]);

export function getDisplay(type: ViewType): boolean {
  const view = views.get(type);
  /* istanbul ignore if */
  if (view === undefined) {
    log(`Error : unrecognised view ${type}`);
    return false;
  }
  const result = view.display;
  return result;
}

export function getDisplayedView(): ViewType | undefined {
  const view = [...views.keys()].find((k) => {
    const val = views.get(k);
    return val && val.display;
  });
  return view;
}

// from https://coolors.co
const colors = [
  "4E81BC",
  "C0504E",
  "9CBB58",
  "23BFAA",
  "8064A1",
  "4BACC5",
  "F79647",
  "7F6084",
  "77A032",
  "33558B",
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  /* istanbul ignore else */
  if (result !== null) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  } else {
    log("Error: hex value not understood");
    return {
      r: 30,
      g: 30,
      b: 100,
    };
  }
}

export function getColor(index: number) {
  return hexToRgb(colors[index % colors.length]);
}
