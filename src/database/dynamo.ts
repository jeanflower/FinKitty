import AWS from 'aws-sdk';
import {
  DbAsset,
  DbAssetDynamo,
  DbExpense,
  DbExpenseDynamo,
  DbIncome,
  DbIncomeDynamo,
  DbItem,
  DbModelData,
  DbSetting,
  DbSettingDynamo,
  DbTransaction,
  DbTransactionDynamo,
  DbTrigger,
  DbTriggerDynamo,
} from '../types/interfaces';
import {
  log,
  makeBooleanFromString,
  makeStringFromBoolean,
  printDebug,
  showObj,
} from '../utils';

import {
  allItems,
  assetChartHint,
  assetChartVal,
  assetChartView,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  monthly,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../stringConstants';

export const INCOMES_TABLE = 'INCOMES';
export const EXPENSES_TABLE = 'EXPENSES';
export const TRIGGERS_TABLE = 'TRIGGERS';
export const ASSETS_TABLE = 'ASSETS';
export const TRANSACTIONS_TABLE = 'TRANSACTIONS';
export const SETTINGS_TABLE = 'GLOBALS'; // e.g. cpi

const tablesArray = [
  INCOMES_TABLE,
  EXPENSES_TABLE,
  TRIGGERS_TABLE,
  ASSETS_TABLE,
  TRANSACTIONS_TABLE,
  SETTINGS_TABLE,
];

const CREATE_TABLE_ERROR = 'failed to create table';
const NO_SUCH_TABLE_ERROR = 'unrecognised table name';

function translateForDB(x: string) {
  if (x === '') {
    return 'None';
  }
  return x;
}
function translateFromDB(x: string) {
  if (x === 'None') {
    return '';
  }
  return x;
}

function makeTableDefinition(tableName: string) {
  const key = 'NAME'; // All tables use the same key
  // log(`tableName = ${tableName}, key = ${key}`);
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: key,
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: key,
        KeyType: 'HASH', // every query must use the hash key
      },
    ],
    TableName: tableName,
  };
  // log('made table definition '+showObj(params));
  return params;
}

function setupDDB() {
  // Load credentials from config.json
  // AWS.config.loadFromPath('./config.json');
  // this does not work

  // Set the credentials and the region
  // this is insecure and the wrong way to do it
  AWS.config.update({
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
    region: 'local',
  });

  // Create the DynamoDB service object
  const ddb: any = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

  ddb.setEndpoint('http://127.0.0.1:8000');
  return ddb;
}

async function getTableNames(ddb: any) {
  const dbData: any = await new Promise((resolve, reject) => {
    ddb.listTables({}, (err: any, data: any) => {
      if (err) {
        log(`error from listTables : ${err}${err.stack}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  if (printDebug()) {
    log(`Got list tables : ${dbData.TableNames}`);
  }
  return dbData.TableNames;
}

async function tableExists(ddb: any, tableName: string): Promise<boolean> {
  const tableNames = await getTableNames(ddb);

  if (tableNames.indexOf(tableName) === -1) {
    if (printDebug()) {
      log('No tables');
    }
    return false;
  }
  if (printDebug()) {
    log('We have a table');
  }
  return true;
}

async function getModelNames(ddb: any) {
  const dBTableNames = await getTableNames(ddb);

  const stub = 'INCOMES';
  const incomeDbTables: string[] = dBTableNames.filter(
    (tableName: string) => tableName.substring(0, stub.length) === stub,
  );
  // log(`incomeDbTables = ${incomeDbTables}`);

  // remove the "INCOMES" stub from the table name
  // to get the model name
  let modelNames = incomeDbTables.map(incomeTableName =>
    incomeTableName.substring(stub.length),
  );
  // log(`modelNames = ${modelNames}`);

  // Only allow modelNames out of we also have corresponding
  // other tables too. (NB no checks for table data consistency)
  modelNames = modelNames.filter(incomeTable => {
    for (const tableStub of tablesArray) {
      /* eslint-disable-line no-restricted-syntax */
      if (tableStub !== stub) {
        if (dBTableNames.indexOf(tableStub + incomeTable) === -1) {
          return false; // not a model name (missing table)
        }
      }
    }
    return true;
  });

  // log(`modelNames = ${modelNames}`);
  return modelNames;
}

export async function getDbModelNames() {
  const ddb = setupDDB();
  return getModelNames(ddb);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// pass in a message about what has just happened
// (e.g. 'created table for Names')
async function debugSyncs(message: string) {
  const doSleep = true;
  // if in release we doSleep, it's a desperate measure to work
  // around unexplained DB interaction failures to perform
  // work in a prescribed order!
  // (e.g. I need to createTable before submitItem)

  if (printDebug()) {
    log(`.... waiting after ${message}`);
  }
  if (doSleep) {
    await sleep(50);
  }
  if (printDebug()) {
    log(`done waiting after ${message}`);
  }
}
async function createTable(ddb: any, tableName: string) {
  // log('In createTable, for '+tableName);
  const params: any = makeTableDefinition(tableName);

  params.ProvisionedThroughput = {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  };
  params.StreamSpecification = {
    StreamEnabled: false,
  };
  try {
    // log(`Go create table with ${showObj(params)}`);
    await new Promise((resolve, reject) => {
      ddb.createTable(params, (err: any, data: any) => {
        if (err) {
          log(
            `error from createTable : ${showObj(params)}, ${err}${err.stack}`,
          );
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    // log('Created table');
    if (printDebug()) {
      if (await tableExists(ddb, tableName)) {
        log('Table does not exist');
        return CREATE_TABLE_ERROR;
      }
      log('Table exists');
    }
  } catch (error) {
    log(`Error creating table${error}`);
  }
  if (printDebug()) {
    try {
      const dbData: any = await new Promise((resolve, reject) => {
        ddb.listTables({}, (err: any, data: any) => {
          if (err) {
            log(`error from listTables : ${err}${err.stack}`);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      log(`To confirm we made a table; listed tables: ${showObj(dbData)}`);
    } catch (error) {
      log('Error listing tables');
    }
  }
  return debugSyncs(`createTable ${tableName}`);
}

function isEmptyData(data: string, descriptor: string) {
  if (data === '') {
    log(`BUG : empty ${descriptor} going into DB! (blocked)`);
    return true;
  }
  return false;
}

// see https://github.com/aws/aws-sdk-js/issues/2700
async function putItem(ddb: any, params: any) {
  if (printDebug()) {
    log(`go to put Item ${showObj(params)}`);
  }

  await new Promise((resolve, reject) => {
    ddb.putItem(params, (err: any, data: any) => {
      if (err) {
        log(`error from putItem : ${showObj(params)}, ${err}${err.stack}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function submitDBSetting(
  ddb: any,
  modelName: string,
  item: DbSettingDynamo,
) {
  if (printDebug()) {
    log(`item is ${showObj(item)}`);
  }

  if (
    isEmptyData(item.NAME.S, 'item name') ||
    isEmptyData(item.VALUE.S, 'item value')
  ) {
    return;
  }

  const params = {
    TableName: SETTINGS_TABLE + modelName,
    Item: item,
  };
  await putItem(ddb, params);
}

async function submitAsset(ddb: any, modelName: string, asset: DbAssetDynamo) {
  if (printDebug()) {
    log(`asset is ${showObj(asset)}`);
  }

  if (
    isEmptyData(asset.NAME.S, 'asset name') ||
    isEmptyData(asset.START.S, 'asset start') ||
    isEmptyData(asset.VALUE.N, 'asset value') ||
    isEmptyData(asset.GROWTH.S, 'asset growth') ||
    isEmptyData(asset.LIABILITY.S, 'asset liability') ||
    isEmptyData(asset.CATEGORY.S, 'category') ||
    isEmptyData(asset.PURCHASE_PRICE.N, 'asset purchase price')
  ) {
    return;
  }

  const params = {
    TableName: ASSETS_TABLE + modelName,
    Item: asset,
  };
  await putItem(ddb, params);
}

async function addRequiredSettings(ddb: any, tableName: string): Promise<any> {
  const modelName = tableName.substring(SETTINGS_TABLE.length);
  // log(`modelName is ${modelName}`);
  await Promise.all([
    submitDBSetting(ddb, modelName, {
      NAME: { S: cpi },
      VALUE: { S: '2.5' },
      HINT: { S: cpiHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: assetChartView },
      VALUE: { S: assetChartVal },
      HINT: { S: assetChartHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: viewFrequency },
      VALUE: { S: monthly },
      HINT: { S: viewFrequencyHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: viewDetail },
      VALUE: { S: fine },
      HINT: { S: viewDetailHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: roiStart },
      VALUE: { S: '1 Jan 2017' },
      HINT: { S: roiStartHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: roiEnd },
      VALUE: { S: '1 Jan 2020' },
      HINT: { S: roiEndHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: assetChartFocus },
      VALUE: { S: CASH_ASSET_NAME },
      HINT: { S: assetChartFocusHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: expenseChartFocus },
      VALUE: { S: allItems },
      HINT: { S: expenseChartFocusHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: incomeChartFocus },
      VALUE: { S: allItems },
      HINT: { S: incomeChartFocusHint },
    }),
    submitDBSetting(ddb, modelName, {
      NAME: { S: birthDate },
      VALUE: { S: 'None' },
      HINT: { S: birthDateHint },
    }),
    submitAsset(ddb, modelName, {
      NAME: { S: CASH_ASSET_NAME },
      CATEGORY: { S: translateForDB('') },
      START: { S: '1 Jan 1990' },
      VALUE: { N: '0.0' },
      GROWTH: { S: '0.0' },
      LIABILITY: { S: translateForDB('') },
      PURCHASE_PRICE: { N: '0.0' },
    }),
  ]);
}

async function ensureDbTable(ddb: any, tableName: string) {
  // log(`ensure table ${tableName}`);
  if (!(await tableExists(ddb, tableName))) {
    // log(`need to create a table for ${tableName}`);
    await createTable(ddb, tableName);
    await debugSyncs(`ensureDbTable created ${tableName}`);
    if (tableName.startsWith(SETTINGS_TABLE)) {
      await addRequiredSettings(ddb, tableName);
      await debugSyncs(`ensureDbTable put defaults in ${tableName}`);
    }
  } else {
    // log('don't need to create a table');
    await debugSyncs(`ensureDbTable found pre-existing ${tableName}`);
  }
}

export async function ensureDbTables(modelName: string) {
  const ddb = setupDDB();
  const results = tablesArray.map(t => ensureDbTable(ddb, t + modelName));
  await Promise.all(results);
  await debugSyncs(`ensureDbTables completed for ${modelName}`);
}

async function deleteItem(ddb: any, params: any) {
  try {
    if (printDebug()) {
      log('go to delete Item');
    }
    await new Promise((resolve, reject) => {
      ddb.deleteItem(params, (err: any, data: any) => {
        if (err) {
          log(`error from deleteItem : ${err}${err.stack}`);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } catch (error) {
    log(`Error deleting item ${error}`);
    return false;
  }
  return true;
}

async function submitTrigger(
  ddb: any,
  modelName: string,
  trigger: DbTriggerDynamo,
) {
  if (printDebug()) {
    log(`trigger is ${showObj(trigger)}`);
  }

  if (
    isEmptyData(trigger.NAME.S, 'name') ||
    isEmptyData(trigger.DATE.N, 'date')
  ) {
    return;
  }

  const params = {
    TableName: TRIGGERS_TABLE + modelName,
    Item: trigger,
  };
  await putItem(ddb, params);
}

async function submitDBTransaction(
  ddb: any,
  modelName: string,
  transaction: DbTransactionDynamo,
) {
  if (printDebug()) {
    log(`transaction is ${showObj(transaction)}`);
  }

  if (
    isEmptyData(transaction.NAME.S, 'transaction name') ||
    isEmptyData(transaction.DATE.S, 'transaction date') ||
    isEmptyData(transaction.FROM.S, 'transaction from') ||
    isEmptyData(transaction.TO.S, 'transaction to') ||
    isEmptyData(
      transaction.FROM_VALUE.N,
      'transaction from value',
    ) ||
    isEmptyData(transaction.TO_VALUE.N, 'transaction to value') ||
    isEmptyData(transaction.STOP_DATE.S, 'transaction stop date') ||
    isEmptyData(
      transaction.RECURRENCE.S,
      'transaction recurrence',
    ) ||
    isEmptyData(transaction.CATEGORY.S, 'category')
  ) {
    log(`BUG: empty fields in transaction for DB ${showObj(transaction)}`);
    return;
  }

  const params = {
    TableName: TRANSACTIONS_TABLE + modelName,
    Item: transaction,
  };
  await putItem(ddb, params);
}

async function submitExpense(
  ddb: any,
  modelName: string,
  expense: DbExpenseDynamo,
) {
  if (printDebug()) {
    log(`expense is ${showObj(expense)}`);
  }

  if (
    isEmptyData(expense.START.S, 'expense start') ||
    isEmptyData(expense.END.S, 'expense end') ||
    isEmptyData(expense.NAME.S, 'expense name') ||
    isEmptyData(expense.VALUE.N, 'expense value') ||
    isEmptyData(expense.VALUE_SET.S, 'expense value set') ||
    isEmptyData(expense.CATEGORY.S, 'category') ||
    isEmptyData(expense.GROWTH.N, 'expense growth') ||
    isEmptyData(expense.CPI_IMMUNE.S, 'expense immune to CPI')
  ) {
    return;
  }

  const params = {
    TableName: EXPENSES_TABLE + modelName,
    Item: expense,
  };
  await putItem(ddb, params);
}

async function submitIncome(
  ddb: any,
  modelName: string,
  income: DbIncomeDynamo,
) {
  if (printDebug()) {
    log(`income is ${showObj(income)}`);
  }

  if (
    isEmptyData(income.START.S, 'income start') ||
    isEmptyData(income.END.S, 'income end') ||
    isEmptyData(income.NAME.S, 'income name') ||
    isEmptyData(income.VALUE.N, 'income value') ||
    isEmptyData(income.VALUE_SET.S, 'income value set') ||
    isEmptyData(income.GROWTH.N, 'income growth') ||
    isEmptyData(income.CATEGORY.S, 'category') ||
    isEmptyData(income.CPI_IMMUNE.S, 'income immune to CPI') ||
    isEmptyData(income.LIABILITY.S, 'income liability')
  ) {
    return;
  }

  const params = {
    TableName: INCOMES_TABLE + modelName,
    Item: income,
  };
  await putItem(ddb, params);
}

async function deleteDbItem(name: string, tableName: string) {
  if (printDebug()) {
    log(`delete expense ${showObj(name)}`);
  }
  const ddb = setupDDB();
  const params = {
    TableName: tableName,
    Key: {
      NAME: { S: name },
    },
  };
  return deleteItem(ddb, params);
}

export async function deleteExpense(name: string, modelName: string) {
  return deleteDbItem(name, EXPENSES_TABLE + modelName);
}
export async function deleteIncome(name: string, modelName: string) {
  return deleteDbItem(name, INCOMES_TABLE + modelName);
}
export async function deleteTrigger(name: string, modelName: string) {
  return deleteDbItem(name, TRIGGERS_TABLE + modelName);
}
export async function deleteAsset(name: string, modelName: string) {
  return deleteDbItem(name, ASSETS_TABLE + modelName);
}
export async function deleteSetting(name: string, modelName: string) {
  return deleteDbItem(name, SETTINGS_TABLE + modelName);
}
export async function deleteTransaction(name: string, modelName: string) {
  return deleteDbItem(name, TRANSACTIONS_TABLE + modelName);
}

export async function submitIDbExpenses(
  expenseInputs: DbExpense[],
  modelName: string,
) {
  const ddb = setupDDB();

  await Promise.all(
    expenseInputs.map(expenseInput => {
      const expenseData: DbExpenseDynamo = {
        END: { S: expenseInput.END },
        CPI_IMMUNE: {
          S: makeStringFromBoolean(expenseInput.CPI_IMMUNE),
        },
        GROWTH: { N: `${expenseInput.GROWTH}` },
        NAME: { S: expenseInput.NAME },
        START: { S: expenseInput.START },
        VALUE: { N: `${expenseInput.VALUE}` },
        VALUE_SET: { S: expenseInput.VALUE_SET },
        CATEGORY: { S: translateForDB(expenseInput.CATEGORY) },
      };
      return submitExpense(ddb, modelName, expenseData);
    }),
  );
  await debugSyncs(`submitIDbExpenses to ${modelName}`);
}

export async function submitIDbSettings(
  inputs: DbSetting[],
  modelName: string,
) {
  const ddb = setupDDB();

  await Promise.all(
    inputs.map(input => {
      const data: DbSettingDynamo = {
        NAME: { S: input.NAME },
        VALUE: { S: translateForDB(input.VALUE) },
        HINT: { S: translateForDB(input.HINT) },
      };
      return submitDBSetting(ddb, modelName, data);
    }),
  );
  await debugSyncs(`submitIDbSettings to ${modelName}`);
}

export async function submitIDbIncomes(incomes: DbIncome[], modelName: string) {
  const ddb = setupDDB();

  await Promise.all(
    incomes.map(incomeInput => {
      const incomeData: DbIncomeDynamo = {
        END: { S: incomeInput.END },
        CPI_IMMUNE: { S: incomeInput.CPI_IMMUNE ? 'T' : 'F' },
        GROWTH: { N: `${incomeInput.GROWTH}` },
        NAME: { S: incomeInput.NAME },
        START: { S: incomeInput.START },
        VALUE: { N: `${incomeInput.VALUE}` },
        VALUE_SET: { S: incomeInput.VALUE_SET },
        LIABILITY: { S: translateForDB(incomeInput.LIABILITY) },
        CATEGORY: { S: translateForDB(incomeInput.CATEGORY) },
      };
      return submitIncome(ddb, modelName, incomeData);
    }),
  );
  await debugSyncs(`submitIDbIncomes to ${modelName}`);
}

export async function submitIDbTriggers(
  triggers: DbTrigger[],
  modelName: string,
) {
  const ddb = setupDDB();

  await Promise.all(
    triggers.map((triggerInput: DbTrigger) => {
      const triggerData: DbTriggerDynamo = {
        DATE: { N: `${triggerInput.DATE.getTime()}` },
        NAME: { S: triggerInput.NAME },
      };
      return submitTrigger(ddb, modelName, triggerData);
    }),
  );
  await debugSyncs(`submitIDbTriggers to ${modelName}`);
}

export async function submitIDbAssets(assets: DbAsset[], modelName: string) {
  const ddb = setupDDB();

  // log(`go to submit assets to ${modelName}`);

  await Promise.all(
    assets.map(assetInput => {
      const assetData: DbAssetDynamo = {
        GROWTH: { S: assetInput.GROWTH },
        NAME: { S: assetInput.NAME },
        START: { S: assetInput.START }, // use triggers
        VALUE: { N: assetInput.VALUE },
        LIABILITY: { S: translateForDB(assetInput.LIABILITY) },
        PURCHASE_PRICE: { N: assetInput.PURCHASE_PRICE },
        CATEGORY: { S: translateForDB(assetInput.CATEGORY) },
      };

      return submitAsset(ddb, modelName, assetData);
    }),
  );
  debugSyncs(`submitIDbAssets to ${modelName}`);
}

export async function submitIDbTransactions(
  inputs: DbTransaction[],
  modelName: string,
) {
  const ddb = setupDDB();

  await Promise.all(
    inputs.map(input => {
      const data: DbTransactionDynamo = {
        DATE: { S: translateForDB(input.DATE) }, // use triggers
        FROM: { S: translateForDB(input.FROM) }, // which asset
        FROM_ABSOLUTE: {
          BOOL: input.FROM_ABSOLUTE,
        },
        FROM_VALUE: { N: `${input.FROM_VALUE}` },
        NAME: { S: input.NAME },
        TO: { S: translateForDB(input.TO) }, // which asset
        TO_ABSOLUTE: {
          BOOL: input.TO_ABSOLUTE,
        },
        TO_VALUE: { N: `${input.TO_VALUE}` },
        STOP_DATE: {
          S: translateForDB(input.STOP_DATE),
        }, // use triggers
        RECURRENCE: {
          S: translateForDB(input.RECURRENCE),
        },
        CATEGORY: { S: translateForDB(input.CATEGORY) },
      };
      return submitDBTransaction(ddb, modelName, data);
    }),
  );
  return debugSyncs(`submitIDbTransactions to ${modelName}`);
}

export async function submitIDbModel(model: DbModelData, modelName: string) {
  return Promise.all([
    submitIDbExpenses(model.expenses, modelName),
    submitIDbIncomes(model.incomes, modelName),
    submitIDbTriggers(model.triggers, modelName),
    submitIDbAssets(model.assets, modelName),
    submitIDbTransactions(model.transactions, modelName),
    submitIDbSettings(model.settings, modelName),
  ]);
}

async function getDBData(ddb: any, tableName: string): Promise<any[]> {
  const params = {
    TableName: tableName,
  };

  if (printDebug()) {
    log('go call scan on DB');
  }
  try {
    const dbData: any = await new Promise((resolve, reject) => {
      ddb.scan(params, (err: any, data: any) => {
        if (err) {
          log(`error from scan : ${showObj(params)}, ${err}${err.stack}`);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    if (printDebug()) {
      log(`from scan, got ${dbData.Items.length} data items`);
    }
    dbData.Items.forEach((element: DbSettingDynamo) => {
      if (printDebug()) {
        log(`db element is ${showObj(element)}`);
      }
    });
    return dbData.Items;
  } catch (error) {
    log(`Error in scan of db ${error}`);
    return [];
  }
}

async function getTransactionData(
  ddb: any,
  tableName: string,
): Promise<DbTransaction[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbTransaction[] = [];
  dbItems.forEach((element: DbTransactionDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }

    // log(` element.FROM_ABSOLUTE.BOOL = ${ element.FROM_ABSOLUTE.BOOL}`)
    const item: DbTransaction = {
      NAME: element.NAME.S,
      FROM: translateFromDB(element.FROM.S),
      FROM_ABSOLUTE: element.FROM_ABSOLUTE.BOOL,
      FROM_VALUE: element.FROM_VALUE.N,
      TO: translateFromDB(element.TO.S),
      TO_ABSOLUTE: element.TO_ABSOLUTE.BOOL,
      TO_VALUE: element.TO_VALUE.N,
      DATE: translateFromDB(element.DATE.S),
      STOP_DATE: translateFromDB(element.STOP_DATE.S),
      RECURRENCE: translateFromDB(element.RECURRENCE.S),
      CATEGORY: translateFromDB(element.CATEGORY.S),
    };

    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getSettingsData(
  ddb: any,
  tableName: string,
): Promise<DbSetting[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbSetting[] = [];
  dbItems.forEach((element: DbSettingDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }

    const item: DbSetting = {
      NAME: element.NAME.S,
      VALUE: translateFromDB(element.VALUE.S),
      HINT: translateFromDB(element.HINT.S),
    };
    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getTriggerData(
  ddb: any,
  tableName: string,
): Promise<DbTrigger[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbTrigger[] = [];
  dbItems.forEach((element: DbTriggerDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }
    const item: DbTrigger = {
      NAME: element.NAME.S,
      DATE: new Date(parseInt(element.DATE.N, 10)),
    };
    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getAssetData(ddb: any, tableName: string): Promise<DbAsset[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbAsset[] = [];
  dbItems.forEach((element: DbAssetDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }
    const item: DbAsset = {
      NAME: element.NAME.S,
      START: element.START.S,
      VALUE: element.VALUE.N,
      GROWTH: element.GROWTH.S,
      LIABILITY: translateFromDB(element.LIABILITY.S),
      PURCHASE_PRICE: element.PURCHASE_PRICE.N,
      CATEGORY: translateFromDB(element.CATEGORY.S),
    };
    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getExpenseData(
  ddb: any,
  tableName: string,
): Promise<DbExpense[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbExpense[] = [];
  dbItems.forEach((element: DbExpenseDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }
    const item: DbExpense = {
      NAME: element.NAME.S,
      VALUE: element.VALUE.N,
      VALUE_SET: element.VALUE_SET.S,
      START: element.START.S,
      END: element.END.S,
      GROWTH: element.GROWTH.N,
      CPI_IMMUNE: makeBooleanFromString(element.CPI_IMMUNE.S),
      CATEGORY: translateFromDB(element.CATEGORY.S),
    };
    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getIncomeData(ddb: any, tableName: string): Promise<DbIncome[]> {
  const dbItems = await getDBData(ddb, tableName);
  const result: DbIncome[] = [];
  dbItems.forEach((element: DbIncomeDynamo) => {
    if (printDebug()) {
      log(`db element is ${showObj(element)}`);
    }
    const item: DbIncome = {
      NAME: element.NAME.S,
      VALUE: element.VALUE.N,
      VALUE_SET: element.VALUE_SET.S,
      START: element.START.S,
      END: element.END.S,
      GROWTH: element.GROWTH.N,
      CPI_IMMUNE: makeBooleanFromString(element.CPI_IMMUNE.S),
      LIABILITY: translateFromDB(element.LIABILITY.S),
      CATEGORY: translateFromDB(element.CATEGORY.S),
    };
    // log(`item is ${showObj(item)}`);
    result.push(item);
  });
  return result;
}

async function getItemData(ddb: any, tableName: string): Promise<DbItem[]> {
  // log(`go get Item data from ${tableName}`);
  let list: DbItem[] = [];
  if (tableName.startsWith(EXPENSES_TABLE)) {
    list = await getExpenseData(ddb, tableName);
  } else if (tableName.startsWith(INCOMES_TABLE)) {
    list = await getIncomeData(ddb, tableName);
  } else if (tableName.startsWith(TRIGGERS_TABLE)) {
    list = await getTriggerData(ddb, tableName);
  } else if (tableName.startsWith(ASSETS_TABLE)) {
    list = await getAssetData(ddb, tableName);
  } else if (tableName.startsWith(TRANSACTIONS_TABLE)) {
    list = await getTransactionData(ddb, tableName);
  } else if (tableName.startsWith(SETTINGS_TABLE)) {
    list = await getSettingsData(ddb, tableName);
  } else {
    log(NO_SUCH_TABLE_ERROR);
    return [];
  }
  list = list.sort((a, b) => {
    if (a.NAME === b.NAME) {
      return 0;
    }
    return a.NAME <= b.NAME ? -1 : 1;
  });
  return list;
}

async function getDbItems(tableName: string): Promise<DbItem[]> {
  const ddb = setupDDB();

  // const NUM_RETRIES = 5;
  // for (let i = 0; i < NUM_RETRIES; i += 1) {
  //  log(`Attempt ${i} to get data from ${tableName}`);
  try {
    // we _do_ want to wait each time
    // (the linter warns that await-in-loop is a bad idea!)
    // https://eslint.org/docs/rules/no-await-in-loop
    const result = await getItemData(
      ddb,
      tableName,
    ); /* eslint-disable-line no-await-in-loop */
    if (printDebug()) {
      log(`Returning item data from DB ${showObj(result)}`);
    }
    return result;
  } catch (err) {
    // if (i < NUM_RETRIES - 1) {
    // suppress and retry
    // } else {
    log('failed to get data after multiple retries');
    // }
  }
  // }
  log('Error getting DBItems');
  return [];
}

async function getDbTriggers(modelName: string): Promise<DbTrigger[]> {
  const result: any = await getDbItems(TRIGGERS_TABLE + modelName);
  // log('got triggers '+showObj(result));
  return result;
}
async function getDbExpenses(modelName: string): Promise<DbExpense[]> {
  const result: any = await getDbItems(EXPENSES_TABLE + modelName);
  // log('got expenses '+showObj(result));
  return result;
}
async function getDbIncomes(modelName: string): Promise<DbIncome[]> {
  const result: any = await getDbItems(INCOMES_TABLE + modelName);
  // log('got incomes '+showObj(result));
  return result;
}
export async function getDbAssets(modelName: string): Promise<DbAsset[]> {
  const result: any = await getDbItems(ASSETS_TABLE + modelName);
  // log('got assets '+showObj(result));
  return result;
}
async function getDbTransactions(modelName: string): Promise<DbTransaction[]> {
  const result: any = await getDbItems(TRANSACTIONS_TABLE + modelName);
  // log('got transactions '+showObj(result));
  return result;
}
async function getDbSettings(modelName: string): Promise<DbSetting[]> {
  const result: any = await getDbItems(SETTINGS_TABLE + modelName);
  // log('got settings '+showObj(result));
  return result;
}

export async function getDbModel(modelName: string) {
  const triggers = await getDbTriggers(modelName);
  const expenses = await getDbExpenses(modelName);
  const incomes = await getDbIncomes(modelName);
  const transactions = await getDbTransactions(modelName);
  const assets = await getDbAssets(modelName);
  const settings = await getDbSettings(modelName);
  return {
    triggers,
    expenses,
    incomes,
    transactions,
    assets,
    settings,
  };
}

async function deleteTable(tableName: string) {
  // log(`go to delete ${tableName}`);
  const ddb = setupDDB();

  if (!(await tableExists(ddb, tableName))) {
    // log(`!!no table to delete '${tableName}'`);
    return debugSyncs(`delete table found no ${tableName}`);
  }

  const params = {
    TableName: tableName,
  };

  await ddb.deleteTable(params, (err: any /* , data: any */) => {
    if (err) {
      log(`Unable to delete table. Error JSON:${JSON.stringify(err, null, 2)}`);
    } else {
      // log(`Deleted table. Table description JSON: ${JSON.stringify(data, null, 2)}`);
    }
  });
  return debugSyncs(`delete table asked ddb to delete ${tableName}`);
}

async function clearTable(tableName: string) {
  const ddb = setupDDB();

  if (!(await tableExists(ddb, tableName))) {
    await debugSyncs(`clearTable found absent ${tableName}`);
    // log(`!!no table to delete '${tableName}'`);
    // log(`${tableName} doesn't exist, ensure it exists`);
    await ensureDbTable(ddb, tableName);
    return debugSyncs(`clearTable ensured ${tableName}`);
  }
  // log(`${tableName} exists, go delete and ensure a fresh one exists`);
  await debugSyncs(`clearTable found present ${tableName}`);

  const params = {
    TableName: tableName,
  };

  await ddb.deleteTable(params, (err: any /* , data: any */) => {
    if (err) {
      log(`Unable to delete table. Error JSON:${JSON.stringify(err, null, 2)}`);
    } else {
      // log(`Deleted table. Table description JSON: ${JSON.stringify(data, null, 2)}`);
    }
  });
  await debugSyncs(`clearTable deleted ${tableName}`);
  // log('go to ensure table');
  await ensureDbTable(ddb, tableName);
  return debugSyncs(`clearTable ensured ${tableName}`);
}

export async function makeAssetsCopy(oldName: string, newName: string) {
  const x: DbAsset[] = await getDbAssets(oldName);
  await clearTable(ASSETS_TABLE + newName);
  return submitIDbAssets(x, newName);
}
export async function makeExpensesCopy(oldName: string, newName: string) {
  const x: DbExpense[] = await getDbExpenses(oldName);
  await clearTable(EXPENSES_TABLE + newName);
  return submitIDbExpenses(x, newName);
}
export async function makeIncomesCopy(oldName: string, newName: string) {
  const x: DbIncome[] = await getDbIncomes(oldName);
  await clearTable(INCOMES_TABLE + newName);
  return submitIDbIncomes(x, newName);
}
export async function makeSettingsCopy(oldName: string, newName: string) {
  const x: DbSetting[] = await getDbSettings(oldName);
  await clearTable(SETTINGS_TABLE + newName);
  return submitIDbSettings(x, newName);
}
export async function makeTransactionsCopy(oldName: string, newName: string) {
  const x: DbTransaction[] = await getDbTransactions(oldName);
  await clearTable(TRANSACTIONS_TABLE + newName);
  return submitIDbTransactions(x, newName);
}
export async function makeTriggersCopy(oldName: string, newName: string) {
  const x: DbTrigger[] = await getDbTriggers(oldName);
  await clearTable(TRIGGERS_TABLE + newName);
  return submitIDbTriggers(x, newName);
}

export async function makeDbCopy(oldName: string, newName: string) {
  return Promise.all([
    makeAssetsCopy(oldName, newName),
    makeIncomesCopy(oldName, newName),
    makeExpensesCopy(oldName, newName),
    makeTriggersCopy(oldName, newName),
    makeTransactionsCopy(oldName, newName),
    makeSettingsCopy(oldName, newName),
  ]);
}
export async function deleteAllTables(modelName: string) {
  return Promise.all(
    tablesArray.map(tableStub => deleteTable(tableStub + modelName)),
  );
}
export async function deleteAllData(modelName: string) {
  await clearTable(TRIGGERS_TABLE + modelName);
  await clearTable(EXPENSES_TABLE + modelName);
  await clearTable(INCOMES_TABLE + modelName);
  await clearTable(ASSETS_TABLE + modelName);
  await clearTable(TRANSACTIONS_TABLE + modelName);
  await clearTable(SETTINGS_TABLE + modelName);
  /*
  return Promise.all(
    tablesArray.map(tableStub => {
      const tableName = tableStub + modelName;
      log(`clear tableName = ${tableName}`);
      return clearTable(tableName);
    }),
  );
*/
}
export async function deleteAllTriggers(modelName: string) {
  return clearTable(TRIGGERS_TABLE + modelName);
}
export async function deleteAllExpenses(modelName: string) {
  return clearTable(EXPENSES_TABLE + modelName);
}
export async function deleteAllIncomes(modelName: string) {
  return clearTable(INCOMES_TABLE + modelName);
}
export async function deleteAllAssets(modelName: string) {
  return clearTable(ASSETS_TABLE + modelName);
}
export async function deleteAllTransactions(modelName: string) {
  return clearTable(TRANSACTIONS_TABLE + modelName);
}
export async function deleteAllSettings(modelName: string) {
  return clearTable(SETTINGS_TABLE + modelName);
}
