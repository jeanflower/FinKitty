import {
  deleteAllAssets,
  deleteAllTables,
  ensureDbTables,
  getDbAssets,
  submitIDbAssets,
} from '../../database/dynamo';

const modelName = 'DatabaseTestData';

import { DbAsset } from '../../types/interfaces';
import { testAssets01 } from './databaseTestData01';

const sampleAssets = testAssets01;

function sameAsset(a: DbAsset, b: DbAsset) {
  // log(a.NAME === b.NAME);
  // log(a.GROWTH === b.GROWTH);
  // log(a.LIABILITY === b.LIABILITY);
  // log(a.PURCHASE_PRICE === b.PURCHASE_PRICE);
  // log(a.START === b.START);
  // log(a.VALUE === b.VALUE);
  // log(a.CATEGORY === b.CATEGORY);
  const result =
    a.NAME === b.NAME &&
    a.GROWTH === b.GROWTH &&
    a.LIABILITY === b.LIABILITY &&
    a.PURCHASE_PRICE === b.PURCHASE_PRICE &&
    a.START === b.START &&
    a.VALUE === b.VALUE &&
    a.CATEGORY === b.CATEGORY;
  // log(result);
  return result;
}

describe('database work', () => {
  beforeEach(async () => {
    // log(`go to clear DB and ensure blank tables`);
    await deleteAllTables(modelName);
    await ensureDbTables(modelName);
  });

  it('work with assets', async () => {
    // log(`---getAssets...`);
    let assets = await getDbAssets(modelName);
    // log(`---got assets`);
    // log(showObj(assets));
    expect(assets.length).toBe(1); // Cash asset
    expect(sampleAssets.length).toBe(5);

    // log(`---submitAssets...`);
    // log(`sampleAssets = ${showObj(sampleAssets)}`);
    await submitIDbAssets(sampleAssets, modelName);
    // log(`---getAssets...`);
    assets = await getDbAssets(modelName);
    // log(`---got assets`);
    // log(showObj(assets[0]));
    // log(showObj(sampleAssets[0]));
    expect(assets.length).toBe(5);
    // log(`got 4 assets out of DB`);

    // log(`assets = ${showObj(assets)}`);
    // log(`sampleAssets = ${showObj(sampleAssets)}`);

    sampleAssets.sort((a, b) => {
      if (a.NAME < b.NAME) {
        return -1;
      } else if (a.NAME > b.NAME) {
        return 1;
      } else {
        return 0;
      }
    });

    assets.sort((a, b) => {
      if (a.NAME < b.NAME) {
        return -1;
      } else if (a.NAME > b.NAME) {
        return 1;
      } else {
        return 0;
      }
    });

    expect(sameAsset(assets[0], sampleAssets[0])).toBe(true);
    expect(sameAsset(assets[1], sampleAssets[1])).toBe(true);
    expect(sameAsset(assets[2], sampleAssets[2])).toBe(true);
    expect(sameAsset(assets[3], sampleAssets[3])).toBe(true);
    expect(sameAsset(assets[4], sampleAssets[4])).toBe(true);
    const newAsset = {
      ...assets[0],
      NAME: 'newAssetName',
    };
    await submitIDbAssets([newAsset], modelName);
    // log(`added one more asset to DB`);

    assets = await getDbAssets(modelName);

    assets.sort((a, b) => {
      if (a.NAME < b.NAME) {
        return -1;
      } else if (a.NAME > b.NAME) {
        return 1;
      } else {
        return 0;
      }
    });

    expect(assets.length).toBe(6);
    // log(`got 5 assets out of DB`);

    // log(`sampleAssets = ${showObj(sampleAssets)}`);
    // log(`assets = ${showObj(assets)}`);

    expect(sameAsset(assets[0], sampleAssets[0])).toBe(true);
    expect(sameAsset(assets[1], sampleAssets[1])).toBe(true);
    expect(sameAsset(assets[2], sampleAssets[2])).toBe(true);
    expect(sameAsset(assets[3], sampleAssets[3])).toBe(true);
    expect(sameAsset(assets[4], sampleAssets[4])).toBe(true);
    expect(sameAsset(assets[5], newAsset)).toBe(true);
    // log(`checked some of asset info from DB`);

    newAsset.LIABILITY = 'editedLiability';

    await submitIDbAssets([newAsset], modelName);
    // log(`edited an asset in DB`);
    assets = await getDbAssets(modelName);
    expect(assets.length).toBe(6);

    assets.sort((a, b) => {
      if (a.NAME < b.NAME) {
        return -1;
      } else if (a.NAME > b.NAME) {
        return 1;
      } else {
        return 0;
      }
    });

    // log(`assets = ${showObj(assets)}`);
    // log(`sampleAssets = ${showObj(sampleAssets)}`);

    expect(sameAsset(assets[0], sampleAssets[0])).toBe(true);
    expect(sameAsset(assets[1], sampleAssets[1])).toBe(true);
    expect(sameAsset(assets[2], sampleAssets[2])).toBe(true);
    expect(sameAsset(assets[3], sampleAssets[3])).toBe(true);
    expect(sameAsset(assets[4], sampleAssets[4])).toBe(true);
    expect(sameAsset(assets[5], newAsset)).toBe(true);

    // log(`checked some asset info from DB`);

    // log(`go to delete all tables`);
    // if we delete assets then query, there are none
    // await deleteAllData(modelName);
    await deleteAllAssets(modelName);

    // log(`deleted all data`);
    assets = await getDbAssets(modelName);
    // log(`got assets ${showObj(assets)}`);

    expect(assets.length).toBe(0);
    // log(`cleared all data from DB and got 0 assets back`);
  });

  afterEach(async () => {
    await deleteAllTables(modelName);
    // await ensureDbTables(modelName);
  });
});
