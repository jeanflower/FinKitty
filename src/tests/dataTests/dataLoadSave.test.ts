// to allow final-scoping blocks for auto-generated code
/* eslint-disable no-lone-blocks */

import { getDB } from '../../database/database';
import {
  deleteModel,
  ensureModel,
  getModelNames,
  loadModel,
  saveModelLSM,
  saveModelToDBLSM,
  submitAssetLSM,
  submitExpenseLSM,
  submitIncomeLSM,
  submitNewSettingLSM,
  submitSettingLSM,
  submitTransactionLSM,
  submitTriggerLSM,
} from '../../database/loadSaveModel';
import { CASH_ASSET_NAME } from '../../localization/stringConstants';
import {
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleSetting,
  simpleTransaction,
} from '../../models/exampleModels';
import { Item } from '../../types/interfaces';
import { printDebug, log } from '../../utils';

/* global it */
/* global expect */
/* global describe */
if (printDebug()) {
  log;
}

describe('load save tests', () => {
  jest.setTimeout(20000); // allow time for this test to run

  // the cache of models is shared between tests
  // tests that assert about the contents of the cache
  // or whether data is dirty or clean
  // should not run in parallel

  // do not assume the cache is empty at the start of this test

  it('load save test', async () => {
    const printStory = false;
    try {
      const userName = 'TestUserID';
      const junkUserName = 'junkjunkjunk';
      const junkUserName2 = 'junkjunkjunk2';
      const junkUserName3 = 'junkjunkjunk3';
      const junkModelName = 'junkjunkjunk';

      // log(`cache has ${getCacheCount()} elements`);
      const names = await getModelNames(userName);
      // log(`cache has ${getCacheCount()} elements`);

      // log(`names are ${names}`);
      expect(names.length).toBeGreaterThan(0);

      await deleteModel(userName, junkModelName, false);
      await deleteModel(junkUserName, junkModelName, false);

      if (printStory) {
        log('deleted models');
      }

      let modelData = await loadModel(userName, junkModelName);
      expect(modelData).toBeUndefined();
      modelData = await loadModel(userName, junkModelName, true);
      expect(modelData).toBeUndefined();

      const modelName = names[0];
      // log(`load model called ${modelName}`);
      modelData = await loadModel(userName, modelName);
      expect(modelData).toBeDefined();

      modelData = await loadModel(userName, modelName, true);

      // if a name has come back then we expect
      // a model with that name
      expect(modelData).toBeDefined();

      // we'll (locally) adjust this model and see it become
      // 'dirty' status
      let oldTriggerCount = 0;
      if (modelData !== undefined) {
        // the loaded model has the name we expect
        expect(modelData.modelName).toEqual(modelName);
        // all meaningful models have settings of some sort
        expect(modelData.model.settings.length).toBeGreaterThan(0);
        // starts off clean (no edits)
        expect(modelData.status.isDirty).toBe(false);

        if (printStory) {
          log('loaded preexisting model, have clean copy');
        }

        oldTriggerCount = modelData.model.triggers.length;

        // add a trigger which doesn't make sense
        const response = await submitTriggerLSM(
          {
            DATE: 'nonsense',
            NAME: 'testTrigger',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        expect(response.length).toBeGreaterThan(0);

        if (printStory) {
          log(`failed to add nonsense trigger ${response}`);
        }

        // load the model again to refresh the
        // status to see it as dirty
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();

        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }
      if (modelData !== undefined) {
        expect(
          modelData.model.triggers.find((t) => {
            return t.NAME === 'testTrigger';
          }),
        ).toBeUndefined();

        // still clean (no edits)
        expect(modelData.status.isDirty).toBe(false);
        // same number of triggers
        expect(modelData.model.triggers.length).toEqual(oldTriggerCount);

        // now add a trigger which _does_ make sense
        let response = await submitTriggerLSM(
          {
            DATE: '1 Jan 1999',
            NAME: 'testTrigger',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        expect(response).toEqual('');

        if (printStory) {
          log('changed preexisting model, add new item ');
        }

        response = await submitTriggerLSM(
          {
            DATE: '1 Jan 2000',
            NAME: 'testTrigger',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        expect(response).toEqual('');

        if (printStory) {
          log(
            `triggers are ${modelData.model.triggers.map((t) => {
              return t.NAME;
            })}`,
          );
        }

        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        if (printStory) {
          log(
            `triggers are ${modelData.model.triggers.map((t) => {
              return t.NAME;
            })}`,
          );
        }

        let found: Item | undefined = modelData.model.triggers.find((t) => {
          return t.NAME === 'testTrigger';
        });
        if (printStory) {
          log(`found triggers are ${found ? found.NAME : ''}`);
        }
        expect(found).toBeDefined();

        if (printStory) {
          log(
            `assets are ${modelData.model.assets.map((a) => {
              return a.NAME;
            })}`,
          );
        }
        found = modelData.model.assets.find((a) => {
          return a.NAME === simpleAsset.NAME;
        });
        if (printStory) {
          log(`found assets are ${found ? found.NAME : ''}`);
        }
        expect(found !== undefined).toBe(false);

        await submitAssetLSM(
          simpleAsset,
          modelName,
          modelData.model,
          true,
          userName,
        );
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        let found: Item | undefined = modelData.model.assets.find((a) => {
          return a.NAME === simpleAsset.NAME;
        });
        if (printStory) {
          log(`found assets are ${found ? found.NAME : ''}`);
        }
        expect(found).toBeDefined();

        found = modelData.model.incomes.find((i) => {
          return i.NAME === 'IncomeName';
        });
        if (printStory) {
          log(`found incomes are ${found ? found.NAME : ''}`);
        }
        expect(found).toBeUndefined();

        const cashAsset = modelData.model.assets.find((a) => {
          return a.NAME === CASH_ASSET_NAME;
        });

        const response = await submitIncomeLSM(
          {
            ...simpleIncome,
            NAME: 'IncomeName',
            START: cashAsset ? cashAsset.START : '1 Jan 2000',
            VALUE_SET: cashAsset ? cashAsset.START : '1 Jan 2000',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        if (printStory) {
          log(`response from adding Income ${response}`);
        }
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        const found: Item | undefined = modelData.model.incomes.find((i) => {
          return i.NAME === 'IncomeName';
        });
        if (printStory) {
          log(`found incomes are ${found ? found.NAME : ''}`);
        }
        expect(found).toBeDefined();

        let response = await submitExpenseLSM(
          {
            ...simpleExpense,
            NAME: 'ExpenseName',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        response = await submitTransactionLSM(
          {
            ...simpleTransaction,
            NAME: 'TransName',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        if (printStory) {
          log('covered many submitLSM functions');
        }
        expect(response.length).toBe(0);

        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        if (printStory) {
          log(
            `settings before submitNewSettingLSM are ${modelData.model.settings.map(
              (s) => {
                return s.NAME;
              },
            )}`,
          );
        }

        const response = await submitNewSettingLSM(
          {
            ...simpleSetting,
            NAME: 'SettingName',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );

        if (printStory) {
          log(`submitted a new setting, response = ${response}`);
        }

        if (printStory) {
          log(
            `settings after submitNewSettingLSM are ${modelData.model.settings.map(
              (s) => {
                return s.NAME;
              },
            )}`,
          );
        }

        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        const response = await submitSettingLSM(
          {
            ...simpleSetting,
            NAME: 'SettingName',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        if (printStory) {
          log(`submitted a setting, response = ${response}`);
        }

        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        if (printStory) {
          log(
            `settings after submitSettingLSM are ${modelData.model.settings.map(
              (s) => {
                return s.NAME;
              },
            )}`,
          );
        }
        expect(
          modelData.model.settings.find((s) => {
            return s.NAME === 'SettingName';
          }),
        ).toBeDefined();

        if (printStory) {
          log(`ready to submit a setting again...`);
        }
        const response = await submitNewSettingLSM(
          {
            ...simpleSetting,
            NAME: 'SettingName',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        if (printStory) {
          log(`submitted a new setting, response = ${response}`);
        }
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        const response = await submitSettingLSM(
          {
            ...simpleSetting,
            NAME: 'SettingName',
            HINT: '',
            TYPE: '',
          },
          modelName,
          modelData.model,
          true,
          userName,
        );
        if (printStory) {
          log(`submitted a setting, response = ${response}`);
        }
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        const matchedSetting = modelData.model.settings.find((s) => {
          return s.NAME === 'SettingName';
        });
        expect(matchedSetting).toBeDefined();
        if (matchedSetting) {
          expect(matchedSetting.HINT.length).toBeGreaterThan(0);
          expect(matchedSetting.TYPE.length).toBeGreaterThan(0);
        }

        if (printStory) {
          log('changed preexisting model again, change existing item');
        }

        // load the model again to refresh
        // expect status is dirty
        modelData = await loadModel(userName, modelName);
        expect(modelData).toBeDefined();

        if (printStory) {
          log('changed preexisting model, copy is dirty');
        }

        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        // because we added a trigger, the status is dirty
        expect(modelData.status.isDirty).toBe(true);
        // and we have one more trigger than we used to have
        expect(modelData.model.triggers.length).toEqual(oldTriggerCount + 1);
      }

      // TODO abandon changes and reload
      // !! there is no way to do this !!

      // unknown users get undefined back for loaded models
      modelData = await loadModel(junkUserName, junkModelName);
      expect(modelData).toBeUndefined();

      if (printStory) {
        log(`failed to load model for ${junkUserName}`);
      }

      // TODO make changes and save to DB
      // do this on a test model rather than the (random)
      // pre-existing one

      // if we ensure a model is present (in the cache) then
      // we can load it
      await ensureModel(userName, junkModelName);
      await ensureModel(junkUserName2, junkModelName);
      await ensureModel(junkUserName2, junkModelName);

      if (printStory) {
        log(`set up junk models for userName and ${junkUserName2}`);
      }

      modelData = await loadModel(userName, junkModelName);
      expect(modelData).toBeDefined();

      if (modelData !== undefined) {
        // because we haven't saved to DB, the status is dirty
        expect(modelData.status.isDirty).toBe(true);

        expect(modelData.model.triggers.length).toEqual(0);

        modelData.model.triggers.push({
          NAME: 'testTrigger',
          DATE: '1 Jan 1999',
        });
        // save this adjusted model back
        await saveModelLSM(userName, junkModelName, modelData.model);

        if (printStory) {
          log(`changed junk model for userName and ${junkUserName2}`);
        }

        modelData = await loadModel(userName, junkModelName);
        expect(modelData).toBeDefined();
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }

      if (modelData !== undefined) {
        expect(modelData.model.triggers.length).toEqual(1);

        // because we added a trigger, the status is dirty
        expect(modelData.status.isDirty).toBe(true);

        if (printStory) {
          log('checked model for userName is changed and is dirty');
        }

        await saveModelToDBLSM(junkUserName2, junkModelName, modelData.model);

        if (printStory) {
          log(`saved junk model ${junkUserName2}`);
        }

        modelData = await loadModel(junkUserName2, junkModelName);
        expect(modelData).toBeDefined();

        if (printStory) {
          log(`loaded back junk model ${junkUserName2}`);
        }

        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }
      if (modelData !== undefined) {
        // because we saved to DB, the status is clean
        expect(modelData.status.isDirty).toBe(false);

        // save this model for another junk user
        // this is the first time any model has been stored
        // for this user

        if (printStory) {
          log(`go to save model for ${junkUserName3}`);
        }
        await saveModelLSM(junkUserName3, junkModelName, modelData.model);

        if (printStory) {
          log(`saved model for ${junkUserName3}`);
        }

        modelData = await loadModel(junkUserName3, junkModelName);
        expect(modelData).toBeDefined();

        if (printStory) {
          log(`loaded back undefined model for ${junkUserName3}`);
        }
        // the compiler thinks this could be undefined still so
        // make another code block to keep it happy
      }
      if (modelData !== undefined) {
        expect(modelData.model.triggers.length).toEqual(1);

        // because it's only local, the status is dirty
        expect(modelData.status.isDirty).toBe(true);
      }
      await deleteModel(junkUserName2, junkModelName, true);
    } catch (e) {
      log(`error ${e}`);
    }
  });
  it('load save model2', async () => {
    const userName = 'TestUserID';
    const junkModelName = 'junkjunkjunk';

    try {
      expect(await getDB().loadModel(userName, junkModelName)).toBeUndefined();
    } catch (e) {
      // log(`error ${e}`);
    }
  });
});
