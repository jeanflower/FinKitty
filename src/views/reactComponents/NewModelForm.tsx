import React from 'react';
import { Component, FormEvent } from 'react';

import { Input } from './Input';
import { ModelData } from '../../types/interfaces';
import { makeButton } from './Button';
import { log, printDebug } from '../../utils/utils';
import { minimalModel } from '../../models/exampleModels';
import dateFormat from 'dateformat';
import FileSaver from 'file-saver';

interface CreateModelFormState {
  newName: string;
}
interface CreateModelFormProps {
  userID: string;
  currentModelName: string;
  saveModel: (
    userID: string,
    modelName: string,
    modelData: ModelData,
  ) => Promise<void>;
  modelData: ModelData;
  showAlert: (arg0: string) => void;
  cloneModel: (newName: string, oldModel: ModelData) => Promise<boolean>;
  exampleModels: {
    name: string;
    model: string;
  }[];
  getExampleModel: (JSONdata: string) => ModelData;
  getModelNames: (userID: string) => Promise<string[]>;
}

export class CreateModelForm extends Component<
  CreateModelFormProps,
  CreateModelFormState
> {
  public defaultState: CreateModelFormState;

  public constructor(props: CreateModelFormProps) {
    super(props);
    this.defaultState = {
      newName: '',
    };

    this.state = this.defaultState;

    this.clonePropsModel = this.clonePropsModel.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.backupModel = this.backupModel.bind(this);
  }

  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for JSON form ${value}`);
    this.setState({ newName: value });
  }

  private exampleButtonList() {
    const buttons: JSX.Element[] = this.props.exampleModels.map((x) => {
      return makeButton(
        `Create ${x.name} example`,
        async () => {
          return this.copyModel(this.props.getExampleModel(x.model));
        },
        `btn-create-${x.name}-example`,
        `btn-create-${x.name}-example`,
        'outline-primary',
      );
    });
    return <div role="group">{buttons}</div>;
  }

  public render() {
    return (
      <form
        className="container-fluid"
        onSubmit={async (e) => {
          e.preventDefault();
          // log(`make copy of minimal model`);
          this.copyModel(minimalModel);
        }}
      >
        <Input
          type={'text'}
          title={'Create new model'}
          name={'createModel'}
          value={this.state.newName}
          placeholder={'Enter new model name here'}
          onChange={this.handleValueChange}
        />
        {makeButton(
          'New model',
          async () => {
            /* istanbul ignore if  */
            if (printDebug()) {
              log(`action on button for new model`);
            }
            this.copyModel(minimalModel);
          },
          `btn-createMinimalModel`,
          `btn-createMinimalModel`,
          'outline-primary',
        )}
        {makeButton(
          'Make backup of model',
          this.backupModel,
          `btn-backup`,
          `btn-backup`,
          'outline-primary',
        )}
        {makeButton(
          'Clone model',
          this.clonePropsModel,
          `btn-clone`,
          `btn-clone`,
          'outline-primary',
        )}
        {this.exampleButtonList()}
      </form>
    );
  }

  private async clonePropsModel(e: FormEvent<Element>) {
    // log(`in clonePropsModel`);
    e.preventDefault();
    this.copyModel(this.props.modelData);
  }

  private async backupModel(e: FormEvent<Element>) {
    e.preventDefault();
    const d = new Date();

    const backupName =
      this.props.currentModelName +
      'backup ' +
      dateFormat(d, 'yyyy-mm-dd HH:MM:ss');

    if (window.confirm(`Save a local text file for this model?`)) {
      const backupText = JSON.stringify(this.props.modelData);

      const blob = new Blob([backupText], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(blob, `${backupName}.txt`);
    }

    await this.props.saveModel(
      this.props.userID,
      this.props.currentModelName +
        'backup ' +
        dateFormat(d, 'yyyy-mm-dd HH:MM:ss'),
      this.props.modelData,
    );
  }

  private async copyModel(model: ModelData) {
    // log(`in copyModel`);
    const newName = this.state.newName;
    if (newName.length === 0) {
      this.props.showAlert('Please provide a new name for the model');
      return;
    }
    // log(`going to create an example model called ${newName}`);
    if (
      !(await this.props.getModelNames(this.props.userID)).includes(newName) ||
      window.confirm(`will replace ${newName}, you sure?`)
    ) {
      log(`go to clone model`);
      if (await this.props.cloneModel(newName, model)) {
        // log('cloned ok -  clear name field');
        this.setState({ newName: '' });
      } else {
        log('failed to clone ok');
      }
    }
  }
}
