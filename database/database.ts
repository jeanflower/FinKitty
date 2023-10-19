import { RESTDB } from './REST_db';
import { DbInterface } from './dbInterface';

const restdb = new RESTDB();

export function getDB(): DbInterface {
  // TODO code a transient DB
  // which stores all data on the client
  // (e.g. in a map)
  // for tests
  return restdb;
}
