import { dbInterface, cleanUp } from './database';
import { DbModelData } from './../types/interfaces';

import {
  allItems,
  assetChartFocus,
  assetChartFocusHint,
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
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../stringConstants';

import { log, printDebug, showObj } from './../utils';

import AWS from 'aws-sdk';

export class AWSDB implements dbInterface{

  tableName  = 'FinKittyModels';
  ddb: any = undefined;

  async setupDDB() {
    if (this.ddb !== undefined) {
      // log(`found DB OK`);
      return;
    }
    const useLocalDB = 
      process.env.REACT_APP_AWS_USE_LOCAL === 'true';
    // log(`use local db? ${useLocalDB}`);
    const accessKeyID = useLocalDB
      ? process.env.REACT_APP_AWS_ACCESS_KEY_ID_FORLOCALACCESS
      : process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    const secretAccessKey = useLocalDB
      ? process.env.REACT_APP_AWS_SECRET_ACCESS_KEY_FORLOCALACCESS
      : process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
    const region = useLocalDB
      ? process.env.REACT_APP_AWS_REGION_FORLOCALACCESS
      : process.env.REACT_APP_AWS_REGION;
    const endpoint = useLocalDB
      ? process.env.REACT_APP_AWS_ENDPOINT_FORLOCALACCESS
      : process.env.REACT_APP_AWS_ENDPOINT;

    // Set the credentials and the region
    // this is insecure and the wrong way to do it
    AWS.config.update({
      accessKeyId: accessKeyID,
      secretAccessKey: secretAccessKey,
      region: region,
    });

    // Create the DynamoDB service object
    this.ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
    this.ddb.setEndpoint(endpoint);

    // log(`set up DDB`);
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTableNames(ddb: any) {
    // log(`Get a list of the table names`);
    const dbData: any = await new Promise((resolve, reject) => {
      ddb.listTables({}, (err: any, data: any) => {
        if (err) {
          log(`error from listTables : ${err.code},${err.stack}`);
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

  async tableExists(ddb: any): Promise<boolean> {
    const tableNames = await this.getTableNames(ddb);
    // log(`tableNames = ${tableNames}`);

    if (tableNames.indexOf(this.tableName) === -1) {
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

  makeTableDefinition() {
    // log(`tableName = ${tableName}, key = ${key}`);
    const params = {
      //TableArn: process.env.REACT_APP_AWS_TABLE_ARN,
      TableName: this.tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'UserID',
          AttributeType: 'S',
        },
        {
          AttributeName: 'ModelName',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          KeyType: 'HASH',
          AttributeName: 'UserID',
        },
        {
          KeyType: 'RANGE',
          AttributeName: 'ModelName',
        },
      ],
    };
    // log('made table definition '+showObj(params));
    return params;
  }

  async createTable(ddb: any) {
    // log('In createTable, for '+tableName);
    const params: any = this.makeTableDefinition();

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
        if (await this.tableExists(ddb)) {
          log('Table does not exist');
          return 'CREATE_TABLE_ERROR';
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
  }

  // see https://github.com/aws/aws-sdk-js/issues/2700
  async putItem(ddb: any, params: any) {
    if (printDebug()) {
      log(`go to put Item ${showObj(params)}`);
    }

    await new Promise((resolve, reject) => {
      ddb.putItem(params, (err: any, data: any) => {
        if (err) {
          log(`error from putItem : ${showObj(params)}, ${err}${err.stack}`);
          reject(err);
        } else {
          // log(`put item resolved OK`);
          resolve(data);
        }
      });
    });
  }

  minimalModel: DbModelData = {
    assets: [
      {
        NAME: CASH_ASSET_NAME,
        CATEGORY: '',
        START: '1 Jan 1990',
        VALUE: '0.0',
        GROWTH: '0.0',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: true,
        LIABILITY: '',
        PURCHASE_PRICE: '0.0',
      },
    ],
    incomes: [],
    expenses: [],
    triggers: [],
    settings: [
      {
        NAME: cpi,
        VALUE: '2.5',
        HINT: cpiHint,
      },
      {
        NAME: assetChartView,
        VALUE: assetChartVal,
        HINT: assetChartHint,
      },
      {
        NAME: viewFrequency,
        VALUE: monthly,
        HINT: viewFrequencyHint,
      },
      {
        NAME: viewDetail,
        VALUE: fine,
        HINT: viewDetailHint,
      },
      {
        NAME: roiStart,
        VALUE: '1 Jan 2017',
        HINT: roiStartHint,
      },
      {
        NAME: roiEnd,
        VALUE: '1 Jan 2020',
        HINT: roiEndHint,
      },
      {
        NAME: assetChartFocus,
        VALUE: CASH_ASSET_NAME,
        HINT: assetChartFocusHint,
      },
      {
        NAME: expenseChartFocus,
        VALUE: allItems,
        HINT: expenseChartFocusHint,
      },
      {
        NAME: incomeChartFocus,
        VALUE: allItems,
        HINT: incomeChartFocusHint,
      },
      {
        NAME: birthDate,
        VALUE: '',
        HINT: birthDateHint,
      },
    ],
    transactions: [],
  };

  addRequiredEntries(model: DbModelData) {
    this.minimalModel.settings.forEach(x => {
      if (
        model.settings.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        model.settings.push(x);
      }
    });
    this.minimalModel.assets.forEach(x => {
      if (
        model.assets.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        model.assets.push(x);
      }
    });
  }

  async ensureTableExists() {
    if (!(await this.tableExists(this.ddb))) {
      // log('table does not exist!');
      await this.createTable(this.ddb);
    }
    if (!(await this.tableExists(this.ddb))) {
      log('table still does not exist!!');
      await this.createTable(this.ddb);
    }
  }

  async deleteModel(userID: string, modelName: string) {
    await this.setupDDB();
    await this.ensureTableExists();

    const params = {
      Key: {
        UserID: {
          S: userID,
        },
        ModelName: {
          S: modelName,
        },
      },
      TableName: this.tableName,
    };

    const doDBDelete = (params: any): Promise<DbModelData> => {
      return new Promise((resolve, reject) => {
        this.ddb.deleteItem(params, function(err: any, data: any) {
          if (err) {
            console.error(
              'Unable to delete. Error:',
              JSON.stringify(err, null, 2),
            );
            reject(err);
          } else {
            // log("Model delete succeeded.");
            if (printDebug()) {
              data.Items.forEach(function(item: any) {
                log(`data returned = ${JSON.stringify(item)}`);
              });
            }
            resolve();
          }
        });
      });
    };
    return doDBDelete(params);
  }

  async saveModel(
    userID: string,
    modelName: string,
    model: DbModelData,
  ) {
    await this.setupDDB();
    await this.ensureTableExists();
    await this.deleteModel(userID, modelName);

    this.addRequiredEntries(model);

    const params = {
      TableName: this.tableName,
      Item: {
        UserID: { S: userID },
        ModelName: { S: modelName },
        Item: { S: JSON.stringify(model) },
      },
    };
    // log('go to put Item into ddb');
    return this.putItem(this.ddb, params);
  }

  // see https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html
  async getModelNames(userID: string): Promise<string[]> {
    // log(`get model names for ${userID}`);

    await this.setupDDB();
    await this.ensureTableExists();
    const params = {
      ExpressionAttributeValues: {
        ':u': { S: userID },
      },
      KeyConditionExpression: 'UserID = :u',
      ProjectionExpression: 'ModelName',
      TableName: this.tableName,
    };

    const doDBQuery = (params: any): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        this.ddb.query(params, function(err: any, data: any) {
          if (err) {
            console.error(
              'Unable to query. Error:',
              JSON.stringify(err, null, 2),
            );
            reject(err);
          } else if (data === undefined) {
            console.error('Unable to query. Undefined data.');
            reject('Unable to query. Undefined data.');
          } else if (data.Items === undefined) {
            console.error('Unable to query. Undefined data.');
            reject('Unable to query. Undefined data.');
          } else {
            // log("ModelNames query succeeded.");
            // data.Items.forEach(function(item:any) {
            //   log(`ModelNames item = ${JSON.stringify(item)}`);
            // });
            const names = data.Items.map((item: any) => {
              return item['ModelName'].S;
            });
            // log(`ModelNames names = ${names}, array length ${names.length}`);
            resolve(names);
          }
        });
      });
    };
    return doDBQuery(params);
  }

  async ensureModel(userID: string, modelName: string) {
    await this.setupDDB();
    await this.ensureTableExists();

    const names = await this.getModelNames(userID);
    if (
      names.filter(n => {
        return n === modelName;
      }).length === 0
    ) {
      return this.saveModel(userID, modelName, this.minimalModel);
    }
  }

  async tryLoadModel(
    userID: string,
    modelName: string,
  ): Promise<DbModelData> {
    await this.ensureTableExists();

    const params = {
      ExpressionAttributeValues: {
        ':u': { S: userID },
        ':m': { S: modelName },
      },
      KeyConditionExpression: 'UserID = :u and ModelName = :m',
      TableName: this.tableName,
    };

    const doDBQuery = (params: any): Promise<DbModelData> => {
      return new Promise((resolve, reject) => {
        //log(`query params = ${showObj(params)}`);
        this.ddb.query(params, function(err: any, data: any) {
          if (err) {
            console.error(
              'Unable to query. Error:',
              JSON.stringify(err, null, 2),
            );
            reject(err);
          } else if (data === undefined) {
            console.error('Unable to query. Undefined data.');
            reject('Unable to query. Undefined data.');
          } else if (data.Items === undefined) {
            console.error('Unable to query. Undefined data.');
            reject('Unable to query. Undefined data.');
          } else {
            //log(`Model query returned ${data.Items.length} items.`);
            //data.Items.forEach(function(item:any) {
            //  log(`Model item = ${JSON.stringify(item)}`);
            //});
            const models = data.Items.map((item: any) => {
              return JSON.parse(item['Item'].S);
            });
            // log(`Model models = ${models}, array length ${models.length}`);
            // log(`return model ${showObj(models[0])}`);

            if (models.length !== 1) {
              reject(`didn't find one model; found ${models}`);
            } else {
              resolve(cleanUp(models[0]));
            }
          }
        });
      });
    };
    return doDBQuery(params);
  }

  // It's unclear that we need a retry here.
  async loadModel(
    userID: string,
    modelName: string,
  ): Promise<DbModelData> {
    await this.setupDDB();
    await this.ensureTableExists();

    return this.tryLoadModel(userID, modelName).then(
      (value: DbModelData): Promise<DbModelData> => {
        return new Promise<DbModelData>(function(resolve: any) {
          resolve(value);
        });
      },
      (): Promise<DbModelData> => {
        log('second try at loading model...');
        return this.tryLoadModel(userID, modelName).then(
          (value: DbModelData): Promise<DbModelData> => {
            return new Promise<DbModelData>(function(resolve: any) {
              resolve(value);
            });
          },
          (): Promise<DbModelData> => {
            log('third try at loading model...');
            return this.tryLoadModel(userID, modelName);
          },
        );
      },
    );
  }
}
