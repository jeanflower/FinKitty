import { constType, viewType } from "../localization/stringConstants";
import { Setting } from "../types/interfaces";

export const simpleSetting: Setting = {
  NAME: 'NoName',
  ERA: undefined,
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};
export const viewSetting: Setting = {
  ...simpleSetting,
  HINT: '',
  TYPE: viewType,
};
