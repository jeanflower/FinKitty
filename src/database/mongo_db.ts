import { DbInterface, minimalModel, cleanUp } from './database';
import { DbModelData } from './../types/interfaces';

const url = process.env.REACT_APP_MONGO_URL;

export class MongoDB implements DbInterface {
  getModelNames(userID: string): Promise<string[]> {
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
      // console.log(`address for fetch is ${address}`);
      fetch(address, requestOptions)
        .then(response => response.text())
        .then(result => {
          // console.log(result);
          try {
            const parsedResult = JSON.parse(result);
            // console.log(`model names are ${parsedResult}`);
            resolve(parsedResult);
          } catch (err) {
            reject('Query failed');
          }
        })
        .catch(error => {
          console.log('error', error);
          reject(error);
        });
    });
  }

  loadModel(userID: string, modelName: string): Promise<DbModelData> {
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

      fetch(
        `${url}find?userID=${userID}&modelName=${modelName}`,
        requestOptions,
      )
        .then(response => response.text())
        .then(result => {
          // console.log(`in find model for ${modelName}, result = ${result}`);
          // console.log(`typeof result from find query ${typeof result}`);
          if (result === '') {
            reject('no model found');
            return;
          }
          // console.log(`result has ${JSON.parse(result).assets.length} assets`);
          try {
            resolve(cleanUp(JSON.parse(result)));
          } catch (err) {
            reject('no model found');
          }
        })
        .catch(error => {
          console.log('error', error);
          reject(error);
        });
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
    // console.log(`go to fetch for create for ${modelName}`);

    fetch(`${url}create`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    //throw new Error("Method not implemented.");
  }

  saveModel(userID: string, modelName: string, model: DbModelData) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('userID', userID);
    urlencoded.append('modelName', modelName);
    urlencoded.append('model', JSON.stringify(model));

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

    // console.log('go to fetch for update');

    fetch(`${url}update`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
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

    // console.log('go to fetch for delete');

    fetch(`${url}delete`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
}
