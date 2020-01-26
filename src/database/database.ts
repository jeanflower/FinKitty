import { DbModelData } from './../types/interfaces';
import { AWSDB } from './aws_db';
import { RESTDB } from './REST_db';

export interface DbInterface {
  getModelNames(userID: string): Promise<string[]>;
  loadModel(userID: string, modelName: string): Promise<DbModelData>;
  ensureModel(userID: string, modelName: string): any;
  saveModel(userID: string, modelName: string, model: DbModelData): any;
  deleteModel(userID: string, modelName: string): any;
}

const awsdb = new AWSDB();
const restdb = new RESTDB();

export function getDB(): DbInterface {
  if (process.env.REACT_APP_USE_AWS_NOT_SECRET === 'true') {
    return awsdb;
  } else {
    return restdb;
  }
}
