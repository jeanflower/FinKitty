import {
  custom,
  MinimalModel,
  roiStart,
  viewType,
} from '../../localization/stringConstants';
import { getTestModel } from '../../models/exampleModels';
import {
  convertToUndoModel,
  markForUndo,
  setSetting,
  getSettings,
} from '../../utils';

describe('historyStack', () => {
  it('should mark, add setting and recover', () => {
    const model = getTestModel(MinimalModel);

    expect(model.undoModel === undefined).toBe(true);
    expect(model.settings.length).toBe(16);
    // log(`model without undo = ${showObj(model)}`);

    // can't be "undone"
    expect(convertToUndoModel(model)).toBe(false);
    expect(model.settings.length).toBe(16);

    markForUndo(model);
    // log(`model with undo = ${showObj(model)}`);

    expect(model.undoModel === undefined).toBe(false);
    setSetting(model.settings, 'a', 'b', custom, 'for testing');
    // log(`model with new setting = ${showObj(model)}`);

    expect(model.settings.length).toBe(17);

    // can be "undone"
    expect(convertToUndoModel(model)).toBe(true);
    expect(model.settings.length).toBe(16);
    // log(`model = ${showObj(model)}`);

    // can't "undo"
    expect(convertToUndoModel(model)).toBe(false);
    expect(model.settings.length).toBe(16);
  });

  it('should mark, edit setting and recover', () => {
    const model = getTestModel(MinimalModel);

    expect(model.undoModel === undefined).toBe(true);
    let roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
    // log(`model without undo = ${showObj(model)}`);

    markForUndo(model);
    // log(`model with undo = ${showObj(model)}`);

    setSetting(model.settings, roiStart, '1 Jan 2018', viewType, 'for testing');
    // log(`model with new setting = ${showObj(model)}`);

    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2018');

    // can be "undone"
    expect(convertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
    // log(`model = ${showObj(model)}`);

    // can't "undo"
    expect(convertToUndoModel(model)).toBe(false);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
  });

  it('should mark, edit, mark, edit setting and recover', () => {
    const model = getTestModel(MinimalModel);

    expect(model.undoModel === undefined).toBe(true);
    let roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
    // log(`model without undo = ${showObj(model)}`);

    markForUndo(model);
    setSetting(model.settings, roiStart, '1 Jan 2018', viewType, 'for testing');
    markForUndo(model);
    setSetting(model.settings, roiStart, '1 Jan 2019', viewType, 'for testing');

    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2019');

    expect(convertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2018');

    expect(convertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');

    expect(convertToUndoModel(model)).toBe(false);
  });
});
