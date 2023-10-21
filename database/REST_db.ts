import { makeModelFromJSON } from '../models/modelFromJSON';
import { ModelData } from '../types/interfaces';
import { log, printDebug } from '../utils/utils';
import { DbInterface } from './dbInterface';
import { minimalModel } from '../models/minimalModel';

const url = process.env.NEXT_PUBLIC_REACT_APP_SERVER_URL_NOT_SECRET;


export class RESTDB implements DbInterface {
  getModelNames(userID: string): Promise<string[]> {
    console.log(`database URL is ${url}`);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`url for REST requests = ${url}`);
    }
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    return new Promise((resolve, reject) => {
      const requestOptions: {
        method: string;
        headers: Headers;
        redirect: 'follow' | 'error' | 'manual' | undefined;
      } = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };
      const address = `${url}models?userID=${userID}`;
      // log(`address for fetch is ${address}`);
      return (
        fetch(address, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            // log(result);
            try {
              const parsedResult = JSON.parse(result);
              // log(`model names are ${parsedResult}`);
              resolve(parsedResult);
            } catch (err) {
              /* istanbul ignore next */
              reject('Query failed');
            }
          })
          /* istanbul ignore next */
          .catch((error) => {
            /* istanbul ignore next */
            log(`error ${error}`);
            /* istanbul ignore next */
            reject(error);
          })
      );
    });
  }

  loadModel(
    userID: string, 
    modelName: string,
  ): Promise<ModelData> {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    return new Promise((resolve, reject) => {
      const requestOptions: {
        method: string;
        headers: Headers;
        redirect: 'follow' | 'error' | 'manual' | undefined;
      } = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };
      // log(`in find model for ${modelName}`);

      return (
        fetch(
          `${url}find?userID=${userID}&modelName=${modelName}`,
          requestOptions,
        )
          .then((response) => response.text())
          .then((result) => {
            // log(`in find model for ${modelName}, result = ${result}`);
            // log(`typeof result from find query ${typeof result}`);
            if (result === '' || result === 'Query failed') {
              reject('no model found');
              return;
            }
            // log(`result has ${JSON.parse(result).assets.length} assets`);
            try {
              //log('make model from REST data');
              resolve(makeModelFromJSON(result, modelName));
            } catch (err) {
              /* istanbul ignore next */
              reject(`no model found err = ${err}`);
            }
          })
          /* istanbul ignore next */
          .catch((error) => {
            /* istanbul ignore next */
            log(`error ${error}`);
            /* istanbul ignore next */
            reject(error);
          })
      );
    });
  }

  ensureModel(userID: string, modelName: string) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('userID', userID);
    urlencoded.append('modelName', modelName);
    urlencoded.append('model', JSON.stringify(minimalModel));

    const requestOptions: {
      method: string;
      headers: Headers;
      body: URLSearchParams;
      redirect: 'follow' | 'error' | 'manual' | undefined;
    } = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };
    // log(`go to fetch for create for ${modelName}`);

    return (
      fetch(`${url}create`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          /* istanbul ignore if  */
          if (printDebug()) {
            log(`create result = ${result}`);
          }
        })
        /* istanbul ignore next */
        .catch((error) => {
          /* istanbul ignore next */
          log(`error ${error}`);
        })
    );
    //throw new Error("Method not implemented.");
  }

  saveModel(userID: string, modelName: string, model: ModelData) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('userID', userID);
    urlencoded.append('modelName', modelName);
    // before save to DB, discard undo stack
    const modelCopy = {
      ...model,
    };
    delete modelCopy.undoModel;
    delete modelCopy.redoModel;
    urlencoded.append('model', JSON.stringify(modelCopy));

    // log(`update DB for user ${userID}`);
    // log(`update DB for modelName ${modelName}`);
    // log(`update DB for model ${JSON.stringify(model)}`);

    const requestOptions: {
      method: string;
      headers: Headers;
      body: URLSearchParams;
      redirect: 'follow' | 'error' | 'manual' | undefined;
    } = {
      method: 'PUT',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    // log('go to fetch for update');

    return (
      fetch(`${url}update`, requestOptions)
        .then(async (response) => {
          // log(`update successful`);
          // log(`response = ${JSON.stringify(response)}`);
          /* istanbul ignore if */
          if (response.status > 399) {
            // e.g. 413 means Payload too large
            log(`status from save attempt: ${response.statusText}`);
            return 'Failed to save';
          }
          const result = await response.text();
          // log(`response.text() = ${result}`);
          return result;
        })
        .then((result) => {
          /* istanbul ignore if  */
          if (printDebug()) {
            log(result);
          }
          /* istanbul ignore if */
          if (result === 'Failed to save') {
            return false;
          }
          return true;
        })
        /* istanbul ignore next */
        .catch((error) => {
          /* istanbul ignore next */
          log(`error from update ${error}`);
          /* istanbul ignore next */
          return false;
        })
    );
  }

  deleteModel(userID: string, modelName: string) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('userID', userID);
    urlencoded.append('modelName', modelName);

    const requestOptions: {
      method: string;
      headers: Headers;
      body: URLSearchParams;
      redirect: 'follow' | 'error' | 'manual' | undefined;
    } = {
      method: 'DELETE',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    // log('go to fetch for delete');

    return (
      fetch(`${url}delete`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          /* istanbul ignore if  */
          if (printDebug()) {
            log(result);
          }
        })
        /* istanbul ignore next */
        .catch((error) => {
          /* istanbul ignore next */
          log(`error ${error}`);
        })
    );
  }
}
