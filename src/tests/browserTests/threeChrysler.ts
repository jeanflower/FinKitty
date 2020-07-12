import { DbModelData } from '../../types/interfaces';
import { getMinimalModelCopy } from '../../utils';
import { CASH_ASSET_NAME } from '../../localization/stringConstants';
import { setROI } from '../testUtils';
import { simpleAsset } from '../../types/simple';

export function getThreeChryslerModel() {
  const roi = {
    start: 'Dec 1, 2017 00:00:00',
    end: 'June 1, 2018 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: DbModelData = {
    ...minimalModel,
    assets: [
      ...minimalModel.assets,
      {
        ...simpleAsset,
        NAME: 'Cars',
        START: 'January 2 2018',
        VALUE: 'chrysler',
        QUANTITY: '3',
      },
    ],
    settings: [
      ...minimalModel.settings,
      {
        NAME: 'twoChryslers',
        VALUE: '2chrysler',
        HINT: '',
        TYPE: 'const',
      },
      {
        NAME: 'chrysler',
        VALUE: '50USD',
        HINT: '',
        TYPE: 'const',
      },
      {
        NAME: 'USD',
        VALUE: '2',
        HINT: '',
        TYPE: 'adjustable',
      },
    ],
  };
  model.assets.filter(a => {
    return a.NAME === CASH_ASSET_NAME;
  })[0].START = '1 Jan 2018';

  setROI(model, roi);
  return { model: model, roi: roi };
}
