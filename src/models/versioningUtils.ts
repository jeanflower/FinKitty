import {
  roiEnd,
  viewType,
  roiStart,
  birthDate,
  viewFrequency,
  monthly,
  viewDetail,
  assetChartFocus,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  chartViewType,
  cpi,
  constType,
  custom,
  taxPot,
  taxChartFocusPerson,
  allItems,
  taxChartFocusType,
  taxChartShowNet,
  pension,
  moveTaxFreePart,
  pensionDB,
  pensionSS,
  pensionTransfer,
  taxFree,
  transferCrystallizedPension,
  crystallizedPension,
  separator,
  dot,
} from '../localization/stringConstants';
import { ModelData, ModelDataFromFile } from '../types/interfaces';
import { getMinimalModelCopy, viewSetting } from './exampleModels';
import { log } from '../utils/utils';
import { migrateViewSetting } from '../App';

// 0; // may not include assets or settings in minimalModel
// 1; // may not include expense recurrence, asset/debt,
//           // asset quantity, transaction and settings types
// 2; // could use taxPot as an asset
// 3; // doesn't include tax view focus settings
// 4; // still includes many view settings
// 5; // still includes English-language special words
// 6; // uses -DC for pensions, even if they're DB pensions
// 7; // uses one cyrstallizedPension pot per person
// 8; // may have non-zero growth for incomes and expenses
const currentVersion = 9;

export function getCurrentVersion() {
  return currentVersion;
}

const mapForGuessSettingTypeForv2 = new Map([
  [roiEnd, viewType],
  [roiStart, viewType],
  [birthDate, viewType],
  [viewFrequency, viewType],
  [monthly, viewType],
  [viewDetail, viewType],
  [assetChartFocus, viewType],
  [debtChartFocus, viewType],
  [expenseChartFocus, viewType],
  [incomeChartFocus, viewType],
  [chartViewType, viewType],
  [cpi, constType],
]);

function getGuessSettingTypeForv2(name: string) {
  const mapResult = mapForGuessSettingTypeForv2.get(name);
  if (mapResult !== undefined) {
    return mapResult;
  }
  return constType;
}

const showMigrationLogs = false;

function migrateFromV0(model: ModelData) {
  // log(`in migrateOldVersions at v0, model has ${model.settings.length} settings`);
  // use getMinimalModelCopy and scan over all settings and assets
  const minimalModel = getMinimalModelCopy();
  minimalModel.settings.forEach((x) => {
    if (
      model.settings.filter((existing) => {
        return existing.NAME === x.NAME;
      }).length === 0
    ) {
      // log(`model needs insertion of missing data ${showObj(x)}`);
      model.settings.push(x);
      // throw new Error(`inserting missing data ${showObj(x)}`);
    }
  });
  minimalModel.assets.forEach((x) => {
    if (
      model.assets.filter((existing) => {
        return existing.NAME === x.NAME;
      }).length === 0
    ) {
      //log(`inserting missing data ${showObj(x)}`);
      model.assets.push(x);
      // throw new Error(`inserting missing data ${showObj(x)}`);
    }
  });
  model.version = 1;
}

function migrateFromV1(model: ModelData) {
  /* istanbul ignore if  */ //debug
  if (showMigrationLogs) {
    log(
      `in migrateOldVersions at v1, model has ${model.settings.length} settings`,
    );
  }
  for (const e of model.expenses) {
    if (e.RECURRENCE === undefined) {
      e.RECURRENCE = '1m';
    }
  }
  for (const a of model.assets) {
    if (a.IS_A_DEBT === undefined) {
      a.IS_A_DEBT = false;
    }
    if (a.QUANTITY === undefined) {
      a.QUANTITY = '';
    }
  }
  for (const t of model.transactions) {
    if (t.TYPE === undefined) {
      t.TYPE = custom;
    }
  }
  for (const s of model.settings) {
    if (s.TYPE === undefined) {
      s.TYPE = getGuessSettingTypeForv2(s.NAME);
    }
  }
  model.version = 2;
}

function migrateFromV2(model: ModelData) {
  /* istanbul ignore if  */ //debug
  if (showMigrationLogs) {
    log(`in migrateOldVersions at v2, model has ${model.assets.length} assets`);
    log(
      `${model.assets.map((x) => {
        return x.NAME;
      })}`,
    );
  }
  // remove any asset called taxPot
  let index = model.assets.findIndex((a) => {
    return a.NAME === taxPot;
  });
  if (index >= 0) {
    // log(`found taxPot at index = ${index}!`);
    model.assets.splice(index, 1);
    // log(
    //  `${model.assets.map(x => {
    //    return x.NAME;
    //  })}`,
    // );
    // log(
    //  `in migrateOldVersions at v2, model now has ${model.assets.length} assets`,
    // );
  }
  index = model.assets.findIndex((a) => {
    return a.NAME === taxPot;
  });
  if (index >= 0) {
    // log(`still found taxPot!`);
    model.assets.splice(index, 1);
  }
  model.version = 3;
}
function migrateFromV3(model: ModelData) {
  /* istanbul ignore if  */ //debug
  if (showMigrationLogs) {
    log(
      `in migrateOldVersions at v3, model has ${model.settings.length} settings`,
    );
  }
  if (
    model.settings.findIndex((x) => {
      return x.NAME === taxChartFocusPerson;
    }) === -1
  ) {
    model.settings.push({
      ...viewSetting,
      NAME: taxChartFocusPerson,
      VALUE: allItems,
    });
  }
  if (
    model.settings.findIndex((x) => {
      return x.NAME === taxChartFocusType;
    }) === -1
  ) {
    model.settings.push({
      ...viewSetting,
      NAME: taxChartFocusType,
      VALUE: allItems,
    });
  }
  if (
    model.settings.findIndex((x) => {
      return x.NAME === taxChartShowNet;
    }) === -1
  ) {
    model.settings.push({
      ...viewSetting,
      NAME: taxChartShowNet,
      VALUE: 'Y',
    });
  }
  model.version = 4;
}
function migrateFromV4(model: ModelData) {
  // log(`in migrateFromV4`);
  /* istanbul ignore if  */ //debug
  if (showMigrationLogs) {
    log(
      `in migrateOldVersions at v4, model has ${model.settings.length} settings`,
    );
  }
  // strip away any settings values which are no longer
  // stored persistently
  const debtChartView = 'Type of view for debt chart';
  const namesForRemoval = [
    viewFrequency,
    chartViewType,
    debtChartView,
    viewDetail,
    assetChartFocus,
    debtChartFocus,
    expenseChartFocus,
    incomeChartFocus,
    taxChartFocusPerson,
    taxChartFocusType,
    taxChartShowNet,
  ];
  namesForRemoval.forEach((name) => {
    const idx = model.settings.findIndex((s) => {
      return s.NAME === name;
    });
    if (idx >= 0) {
      // log(`setting setting ${name} to value ${model.settings[idx].VALUE}`);
      // When loading in an old model, set the view from the
      // old-style settings data.
      // This only matters for keeping tests passing.
      migrateViewSetting(model.settings[idx]);
      model.settings.splice(idx, 1);
    }
  });
  model.version = 5;
}

function changeSpecialWords(
  model: ModelData,
  transactionChanges: {
    oldPart: string;
    newPart: string;
  }[],
  incomeChanges: {
    oldPart: string;
    newPart: string;
  }[],
  assetChanges: {
    oldPart: string;
    newPart: string;
  }[],
) {
  model.transactions.forEach((t) => {
    transactionChanges.forEach((ch) => {
      if (t.NAME.startsWith(ch.oldPart)) {
        // log(`old t.NAME=${t.NAME}`);
        t.NAME = `${ch.newPart}${t.NAME.substring(ch.oldPart.length)}`;
        // log(`new t.NAME=${t.NAME}`);
      }
      let words = t.FROM.split(separator);
      let newWords: string[] = [];
      let hasChanged = false;
      words.forEach((w) => {
        if (w.startsWith(ch.oldPart)) {
          // log(`old t.FROM w = ${w}`);
          w = `${ch.newPart}${w.substring(ch.oldPart.length)}`;
          hasChanged = true;
          // log(`new t.FROM w = ${w}`);
        }
        // difficult to find test data for this
        /* istanbul ignore if  */
        if (ch.oldPart === 'TaxFree') {
          if (w.endsWith(ch.oldPart)) {
            // log(`old w = ${w`);
            w = `${ch.newPart}${w.substring(0, w.length - ch.oldPart.length)}`;
            hasChanged = true;
            // log(`new w = ${w}`);
          }
        }
        newWords.push(w);
      });
      if (hasChanged) {
        t.FROM = '';
        newWords.forEach((w) => {
          t.FROM = `${t.FROM}${w}${separator}`;
        });
        t.FROM = t.FROM.substring(0, t.FROM.length - 1);
        // log(`new t.FROM = ${t.FROM}`);
      }
      words = t.TO.split(separator);
      newWords = [];
      hasChanged = false;
      words.forEach((w) => {
        if (w.startsWith(ch.oldPart)) {
          // log(`old t.TO w = ${w}`);
          w = `${ch.newPart}${w.substring(ch.oldPart.length, w.length)}`;
          hasChanged = true;
          // log(`new t.TO w = ${w}`);
        }
        if (ch.oldPart === 'TaxFree') {
          if (w.endsWith(ch.oldPart)) {
            // log(`old w = ${w`);
            w = `${ch.newPart}${w.substring(0, w.length - ch.oldPart.length)}`;
            hasChanged = true;
            // log(`new w = ${w}`);
          }
        }
        newWords.push(w);
      });
      if (hasChanged) {
        t.TO = '';
        newWords.forEach((w) => {
          t.TO = `${t.TO}${w}${separator}`;
        });
        t.TO = t.TO.substring(0, t.TO.length - 1);
        // log(`new t.TO = ${t.TO}`);
      }
    });
  });
  model.incomes.forEach((i) => {
    incomeChanges.forEach((ch) => {
      if (i.NAME.startsWith(ch.oldPart)) {
        // log(`old i.NAME=${i.NAME}`);
        i.NAME = `${ch.newPart}${i.NAME.substring(
          ch.oldPart.length,
          i.NAME.length,
        )}`;
        // log(`new i.NAME=${i.NAME}`);
      }
    });
  });
  model.assets.forEach((a) => {
    assetChanges.forEach((ch) => {
      // log(`check for name change ${a.NAME}`);
      if (a.NAME.startsWith(ch.oldPart)) {
        // log(`old a.NAME=${a.NAME}`);
        a.NAME = `${ch.newPart}${a.NAME.substring(
          ch.oldPart.length,
          a.NAME.length,
        )}`;
        // log(`new a.NAME=${a.NAME}`);
      }
      if (ch.oldPart === 'TaxFree') {
        if (a.NAME.endsWith(ch.oldPart)) {
          // log(`old a.NAME=${a.NAME}`);
          a.NAME = `${ch.newPart}${a.NAME.substring(
            0,
            a.NAME.length - ch.oldPart.length,
          )}`;
          // log(`new a.NAME=${a.NAME}`);
        }
      }
    });
  });
}

function migrateFromV5(model: ModelData) {
  // log(`migrate from V5`);
  const transactionChanges = [
    {
      oldPart: 'PensionSS',
      newPart: pensionSS,
    },
    {
      oldPart: 'PensionTransfer',
      newPart: pensionTransfer,
    },
    {
      oldPart: 'PensionDB',
      newPart: pensionDB,
    },
    {
      oldPart: 'Pension',
      newPart: pension,
    },
    {
      oldPart: 'TransferCrystallizedPension',
      newPart: transferCrystallizedPension,
    },
    {
      oldPart: 'CrystallizedPension',
      newPart: crystallizedPension,
    },
    {
      oldPart: 'TaxFree',
      newPart: taxFree,
    },
    {
      oldPart: 'MoveTaxFreePart',
      newPart: moveTaxFreePart,
    },
  ];
  const incomeChanges = [
    {
      oldPart: 'PensionDB',
      newPart: pensionDB,
    },
    {
      oldPart: 'PensionTransfer',
      newPart: pensionTransfer,
    },
  ];
  const assetChanges = [
    {
      oldPart: 'CrystallizedPension',
      newPart: crystallizedPension,
    },
    {
      oldPart: 'Pension',
      newPart: pension,
    },
    {
      oldPart: 'TaxFree',
      newPart: taxFree,
    },
  ];
  changeSpecialWords(model, transactionChanges, incomeChanges, assetChanges);
  model.version = 6;
  // log(`model is ${showObj(model)}`);
}
function migrateFromV6(model: ModelData) {
  const transactionChanges = [
    {
      oldPart: '-DBT ',
      newPart: pensionTransfer,
    },
    {
      oldPart: '-DB ',
      newPart: pensionDB,
    },
    {
      oldPart: '-DC ',
      newPart: pension,
    },
  ];
  const incomeChanges = [
    {
      oldPart: '-DB ',
      newPart: pensionDB,
    },
    {
      oldPart: '-DBT ',
      newPart: pensionTransfer,
    },
  ];
  const assetChanges = [
    {
      oldPart: '-DC ',
      newPart: pension,
    },
  ];
  changeSpecialWords(model, transactionChanges, incomeChanges, assetChanges);
  model.version = 7;
}
function migrateFromV7(model: ModelData) {
  // assets were called
  // crystallizedPension + name
  // should now be called
  // crystallizedPension + name + dot + pensionName

  // Each cpAsset has a transaction which pays into it
  // where the transactionName also begins crystallizedPension
  const nameToPension = new Map<string, string>();
  model.transactions.forEach((t) => {
    if (t.NAME.startsWith(crystallizedPension)) {
      const name = t.TO.substring(crystallizedPension.length);
      const pensionName = t.NAME.substring(crystallizedPension.length);
      // log(`nameToPension gets [${name}, ${pensionName}]`);
      nameToPension.set(name, pensionName);
    }
  });
  model.transactions.forEach((t) => {
    // log(`check for name change ${a.NAME}`);
    if (
      t.FROM.startsWith(crystallizedPension) &&
      t.TO.startsWith(crystallizedPension) &&
      nameToPension.get(t.TO.substring(crystallizedPension.length)) ===
        undefined
    ) {
      const fromName = nameToPension.get(
        t.FROM.substring(crystallizedPension.length),
      );
      if (fromName !== undefined) {
        nameToPension.set(t.TO.substring(crystallizedPension.length), fromName);
      }
    }
  });

  model.assets.forEach((a) => {
    // log(`check for name change ${a.NAME}`);
    if (a.NAME.startsWith(crystallizedPension)) {
      const person = a.NAME.substring(crystallizedPension.length);
      let pensionName = 'pensionName';
      const mapEntry = nameToPension.get(person);
      // log(`nameToPension has [${person}, ${mapEntry}]`);
      if (mapEntry !== undefined) {
        pensionName = mapEntry;
      }
      a.NAME = `${crystallizedPension}${person}${dot}${pensionName}`;
    }
  });
  model.transactions.forEach((t) => {
    let words = t.FROM.split(separator);
    let newWords: string[] = [];
    let hasChanged = false;
    words.forEach((w) => {
      if (w.startsWith(crystallizedPension)) {
        // log(`old t.FROM w = ${w}`);
        const person = w.substring(crystallizedPension.length);
        let pensionName = 'pensionName';
        const mapEntry = nameToPension.get(person);
        // log(`nameToPension has [${person}, ${mapEntry}]`);
        if (mapEntry !== undefined) {
          pensionName = mapEntry;
        }
        w = `${crystallizedPension}${person}${dot}${pensionName}`;
        hasChanged = true;
        // log(`new t.FROM w = ${w}`);
      }
      newWords.push(w);
    });
    if (hasChanged) {
      t.FROM = '';
      newWords.forEach((w) => {
        t.FROM = `${t.FROM}${w}${separator}`;
      });
      t.FROM = t.FROM.substring(0, t.FROM.length - 1);
      // log(`new t.FROM = ${t.FROM}`);
    }
    words = t.TO.split(separator);
    newWords = [];
    hasChanged = false;
    words.forEach((w) => {
      if (w.startsWith(crystallizedPension)) {
        // log(`old t.FROM w = ${w}`);
        const person = w.substring(crystallizedPension.length);
        let pensionName = 'pensionName';
        const mapEntry = nameToPension.get(person);
        // log(`nameToPension has [${person}, ${mapEntry}]`);
        if (mapEntry !== undefined) {
          pensionName = mapEntry;
        }
        w = `${crystallizedPension}${person}${dot}${pensionName}`;
        hasChanged = true;
        // log(`new t.FROM w = ${w}`);
      }
      newWords.push(w);
    });
    if (hasChanged) {
      t.TO = '';
      newWords.forEach((w) => {
        t.TO = `${t.TO}${w}${separator}`;
      });
      t.TO = t.TO.substring(0, t.TO.length - 1);
      // log(`new t.TO = ${t.TO}`);
    }
  });
  model.version = 8;
}
function migrateFromV8(model: ModelDataFromFile) {
  model.expenses.forEach((e) => {
    if (e.GROWTH !== undefined) {
      const growthNum = parseFloat(e.GROWTH);
      if (growthNum !== 0.0) {
        const message = `nullifying expense growth in ${model.name}! ${e.NAME} has growth ${e.GROWTH}`;
        log(message);
        //alert(message);
        e.GROWTH = undefined;
      }
    }
  });
  model.incomes.forEach((i: any) => {
    if (i.GROWTH !== undefined) {
      const growthNum = parseFloat(i.GROWTH);
      if (growthNum !== 0.0) {
        // log(`migrating : income ${i.NAME} has non-zero growth ${i.GROWTH}`);
        const message = `nullifying income growth in ${model.name}! ${i.NAME} has growth ${i.GROWTH}`;
        log(message);
        //alert(message);
        i.GROWTH = undefined;
      }
    }
  });
  model.version = 9;
}

/*
function migrateFromV9(model: ModelData){
  model.version = 10;
}
*/
export function migrateOldVersions(model: ModelDataFromFile) {
  /* istanbul ignore if  */ //debug
  if (showMigrationLogs) {
    log(`in migrateOldVersions, model is ${model.version}`);
    // log(`in migrateOldVersions, model has ${model.settings.map(showObj)}`);
  }
  if (model.version === 0) {
    migrateFromV0(model);
  }
  if (model.version === 1) {
    migrateFromV1(model);
  }
  if (model.version === 2) {
    migrateFromV2(model);
  }
  if (model.version === 3) {
    migrateFromV3(model);
  }
  if (model.version === 4) {
    migrateFromV4(model);
  }
  if (model.version === 5) {
    migrateFromV5(model);
  }
  if (model.version === 6) {
    migrateFromV6(model);
  }
  if (model.version === 7) {
    migrateFromV7(model);
  }
  if (model.version === 8) {
    migrateFromV8(model);
  }
  /*
  if (model.version === 9) {
    migrateFromV9(model);
  }
  */
  // log(`model after migration is ${showObj(model)}`);

  // should throw immediately to alert of problems
  if (model.version !== getCurrentVersion()) {
    // log(`model.version = ${model.version}
    //   but current version is ${getCurrentVersion()}`);
    throw new Error('code not properly handling versions');
  }
}
