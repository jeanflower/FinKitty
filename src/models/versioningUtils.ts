import { migrateViewSetting } from '../App';
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
} from '../localization/stringConstants';
import { ModelData } from '../types/interfaces';
import { getMinimalModelCopy, viewSetting } from './exampleModels';

export function getCurrentVersion() {
  // return 0; // may not include assets or settings in minimalModel
  // return 1; // may not include expense recurrence, asset/debt,
  //           // asset quantity, transaction and settings types
  // return 2; // could use taxPot as an asset
  // return 3; // doesn't include tax view focus settings
  // return 4; // still includes many view settings
  return 5;
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

function migrateFromV0(model:ModelData){
    // log(`in migrateOldVersions at v0, model has ${model.settings.length} settings`);
    // use getMinimalModelCopy and scan over all settings and assets
    const minimalModel = getMinimalModelCopy();
    minimalModel.settings.forEach(x => {
      if (
        model.settings.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        // log(`model needs insertion of missing data ${showObj(x)}`);
        model.settings.push(x);
        // throw new Error(`inserting missing data ${showObj(x)}`);
      }
    });
    minimalModel.assets.forEach(x => {
      if (
        model.assets.filter(existing => {
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

function migrateFromV1(model: ModelData){
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

function migrateFromV2(model: ModelData){
  if (showMigrationLogs) {
    log(
      `in migrateOldVersions at v2, model has ${model.assets.length} assets`,
    );
    log(
      `${model.assets.map(x => {
        return x.NAME;
      })}`,
    );
  }
  // remove any asset called taxPot
  let index = model.assets.findIndex(a => {
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
  index = model.assets.findIndex(a => {
    return a.NAME === taxPot;
  });
  if (index >= 0) {
    log(`still found taxPot!`);
    model.assets.splice(index, 1);
  }
  model.version = 3;
}
function migrateFromV3(model: ModelData){
  if (showMigrationLogs) {
    log(
      `in migrateOldVersions at v3, model has ${model.settings.length} settings`,
    );
  }
  if (
    model.settings.findIndex(x => {
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
    model.settings.findIndex(x => {
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
    model.settings.findIndex(x => {
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
function migrateFromV4(model: ModelData){
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
  namesForRemoval.forEach(name => {
    const idx = model.settings.findIndex(s => {
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
/*
function migrateFromV5(model: ModelData){
  model.version = 6;
}
function migrateFromV6(model: ModelData){
  model.version = 7;
}
*/
export function migrateOldVersions(model: ModelData) {
  if (showMigrationLogs) {
    log(`in migrateOldVersions, model has ${model.settings.length} settings`);
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
/*  
  if (model.version === 5) {
    migrateFromV5(model);
  }
  if (model.version === 6) {
    migrateFromV6(model);
  }
*/
  // log(`model after migration is ${showObj(model)}`);

  // should throw immediately to alert of problems
  if (model.version !== getCurrentVersion()) {
    throw new Error('code not properly handling versions');
  }
}
