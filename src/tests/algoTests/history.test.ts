import {
  MinimalModel,
  custom,
  birthDate,
  roiStart,
  viewType,
} from '../../localization/stringConstants';
import { getTestModel } from '../../models/exampleModels';
import { ModelData } from '../../types/interfaces';
import {
  revertToUndoModel,
  applyRedoToModel,
  markForUndo,
  setSetting,
  getSettings,
} from '../../utils';

interface UndoRedoModel {
  name: string;
  undoModel: UndoRedoModel | undefined;
  redoModel: UndoRedoModel | undefined;
}

export function revertToUndoModel2(model: UndoRedoModel | undefined): void {
  if (model === undefined) {
    return undefined;
  }
  if (model.undoModel !== undefined) {
    const targetModel = model.undoModel;
    model.undoModel = undefined;
    targetModel.redoModel = {
      name: model.name,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
  }
}
export function applyRedoModel2(model: UndoRedoModel | undefined): void {
  if (model === undefined) {
    return undefined;
  }
  if (model.redoModel !== undefined) {
    const targetModel = model.redoModel;
    model.redoModel = undefined;
    targetModel.undoModel = {
      name: model.name,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
  }
}

function couldUndo(model: ModelData) {
  expect(model.undoModel === undefined).toBe(false);
}
function cannotUndo(model: ModelData) {
  expect(model.undoModel === undefined).toBe(true);
  expect(revertToUndoModel(model)).toBe(false);
}

function couldRedo(model: ModelData) {
  expect(model.redoModel === undefined).toBe(false);
}
function cannotRedo(model: ModelData) {
  expect(model.redoModel === undefined).toBe(true);
  expect(applyRedoToModel(model)).toBe(false);
}

describe('historyStack', () => {
  it('should undo, redo fake data', () => {
    const model: UndoRedoModel | undefined = {
      name: 'b',
      undoModel: {
        name: 'a',
        undoModel: undefined,
        redoModel: undefined,
      },
      redoModel: {
        name: 'c',
        undoModel: undefined,
        redoModel: undefined,
      },
    };
    expect(model.name === 'b').toBe(true);
    // log(`model = ${showObj(model)}`);
    revertToUndoModel2(model);
    // log(`model = ${showObj(model)}`);
    expect(model !== undefined && model.name === 'a').toBe(true);
    expect(revertToUndoModel2(model) === undefined).toBe(true);
    applyRedoModel2(model);
    expect(model !== undefined && model.name === 'b').toBe(true);
    applyRedoModel2(model);
    expect(model !== undefined && model.name === 'c').toBe(true);
    expect(applyRedoModel2(model) === undefined).toBe(true);
    revertToUndoModel2(model);
    expect(model !== undefined && model.name === 'b').toBe(true);
  });

  it('should mark, add setting and recover', () => {
    const model = getTestModel(MinimalModel);

    // no data for "undo", no data for "redo"
    cannotUndo(model);
    cannotRedo(model);

    const numSettings = 5;

    expect(model.settings.length).toBe(numSettings);
    // log(`model without undo = ${showObj(model)}`);

    // take a copy for undo
    markForUndo(model);
    // log(`model with undo = ${showObj(model)}`);

    // have undo data, don't have redo data
    couldUndo(model);
    cannotRedo(model);

    setSetting(model.settings, 'a', 'b', custom, 'for testing');
    // log(`model with new setting = ${showObj(model)}`);
    expect(model.settings.length).toBe(numSettings + 1);

    // can be "undone"
    expect(revertToUndoModel(model)).toBe(true);
    expect(model.settings.length).toBe(numSettings);
    // log(`model = ${showObj(model)}`);

    // can't "undo" (again), can "redo" now
    couldRedo(model);
    cannotUndo(model);

    // redo
    expect(applyRedoToModel(model)).toBe(true);
    expect(model.settings.length).toBe(numSettings + 1);
    couldUndo(model);
    cannotRedo(model);

    // can be "undone"
    expect(revertToUndoModel(model)).toBe(true);
    expect(model.settings.length).toBe(numSettings);
    // log(`model = ${showObj(model)}`);

    // can't "undo" (again), can "redo" now
    couldRedo(model);
    cannotUndo(model);

    // prepare to mark another change
    markForUndo(model);

    // have undo data, don't have redo data
    couldUndo(model);
    cannotRedo(model);
  });

  it('should mark, edit setting and recover 01', () => {
    const model = getTestModel(MinimalModel);

    const numSettings = 5;

    cannotUndo(model);
    expect(model.settings.length).toBe(numSettings);
    // log(`model without undo = ${showObj(model)}`);

    // can't be "undone"
    cannotUndo(model);
    let dob = getSettings(model.settings, birthDate, 'missingDOB');
    expect(dob === '').toBe(true);

    markForUndo(model);
    // log(`model with undo = ${showObj(model)}`);

    couldUndo(model);
    setSetting(model.settings, birthDate, '1 Jan 2000', custom, 'for testing');
    // log(`model with new setting = ${showObj(model)}`);

    dob = getSettings(model.settings, birthDate, 'missingDOB');
    expect(dob === '1 Jan 2000').toBe(true);

    // can be "undone"
    expect(revertToUndoModel(model)).toBe(true);
    dob = getSettings(model.settings, birthDate, 'missingDOB');
    expect(dob === '').toBe(true);
    // log(`model = ${showObj(model)}`);

    // can't "undo"
    cannotUndo(model);
    expect(model.settings.length).toBe(numSettings);
  });

  it('should mark, edit setting and recover  02', () => {
    const model = getTestModel(MinimalModel);

    cannotUndo(model);
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
    expect(revertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
    // log(`model = ${showObj(model)}`);

    // can't "undo"
    cannotUndo(model);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
  });

  it('should mark, edit, mark, edit setting and recover', () => {
    const model = getTestModel(MinimalModel);

    cannotUndo(model);
    let roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');
    // log(`model without undo = ${showObj(model)}`);

    markForUndo(model);
    setSetting(model.settings, roiStart, '1 Jan 2018', viewType, 'for testing');
    markForUndo(model);
    setSetting(model.settings, roiStart, '1 Jan 2019', viewType, 'for testing');

    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2019');

    expect(revertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2018');

    expect(revertToUndoModel(model)).toBe(true);
    roiStartVal = getSettings(model.settings, roiStart, 'unknown');
    expect(roiStartVal).toBe('1 Jan 2017');

    cannotUndo(model);
  });
});
