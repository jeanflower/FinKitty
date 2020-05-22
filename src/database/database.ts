import { DbModelData } from './../types/interfaces';
import { RESTDB } from './REST_db';

export interface DbInterface {
  getModelNames(userID: string): Promise<string[]>;
  loadModel(userID: string, modelName: string): Promise<DbModelData>;
  ensureModel(userID: string, modelName: string): Promise<void>;
  saveModel(
    userID: string,
    modelName: string,
    model: DbModelData,
  ): Promise<void>;
  deleteModel(userID: string, modelName: string): Promise<void>;
}

const restdb = new RESTDB();

export function getDB(): DbInterface {
  // TODO code a transient DB
  // which stores all data on the client
  // (e.g. in a map)
  // for tests
  return restdb;
}
