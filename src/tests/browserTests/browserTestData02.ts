import {
  roiEnd,
  roiStart,
  constType,
} from '../../localization/stringConstants';
import { DbModelData } from '../../types/interfaces';
import { setSetting } from '../../utils';
import { browserTestSettings } from './browserBaseTypes';

export function getTestModel02() {
  const model: DbModelData = {
    expenses: [],
    incomes: [],
    assets: [],
    transactions: [],
    settings: [...browserTestSettings],
    triggers: [],
  };
  setSetting(model.settings, roiStart, '1 Jan 2019', constType);
  setSetting(model.settings, roiEnd, '1 Feb 2019', constType);
  return { model, roi: { start: '1 Jan 2018', end: '1 Fed 2018' } };
}
