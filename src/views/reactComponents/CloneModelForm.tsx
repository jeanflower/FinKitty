import React, { Component } from 'react';

import Input from './Input';
import { DbModelData } from '../../types/interfaces';
import Button from './Button';
import { log, minimalModel } from '../../utils';

interface CreateModelFormState {
  newName: string;
}
interface CreateModelFormProps {
  userID: string;
  modelData: DbModelData;
  showAlert: (arg0: string) => void;
  cloneModel: (newName: string, oldModel: DbModelData) => Promise<boolean>;
  exampleModels: {
    name: string;
    model: string;
  }[];
  getExampleModel: (JSONdata: string) => DbModelData;
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
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for JSON form ${value}`);
    this.setState({ newName: value });
  }

  private handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    // log(`setting new value for JSON form ${value}`);
    this.clonePropsModel(e);
  }

  private exampleButtonList() {
    const buttons: JSX.Element[] = this.props.exampleModels.map(x => {
      return (
        <Button
          action={async () => {
            return this.copyModel(this.props.getExampleModel(x.model));
          }}
          title={`Create ${x.name} example`}
          id={`btn-create-${x.name}-example`}
          key={`btn-create-${x.name}-example`}
          type="secondary"
        />
      );
    });
    return <div role="group">{buttons}</div>;
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.clonePropsModel}>
        <Input
          type={'text'}
          title={'Create new model'}
          name={'createModel'}
          value={this.state.newName}
          placeholder={'Enter new model name here'}
          onChange={this.handleValueChange}
          onSubmit={this.handleSubmit}
        />
        <Button
          action={async () => {
            this.copyModel(minimalModel);
          }}
          title="New model"
          id={`btn-createMinimalModel`}
          type="secondary"
        />
        <Button
          action={this.clonePropsModel}
          title="Clone model"
          id={`btn-clone`}
          type="secondary"
        />
        {this.exampleButtonList()}
      </form>
    );
  }

  private async clonePropsModel(e: any) {
    e.preventDefault();
    this.copyModel(this.props.modelData);
  }

  private async copyModel(model: DbModelData) {
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
      if (await this.props.cloneModel(newName, model)) {
        log('cloned ok -  clear name field');
        this.setState({ newName: '' });
      } else {
        log('cloned ok -  clear name field');
      }
    }
  }
}
