import React, { Component } from 'react';

import { log, printDebug, showObj } from '../utils';
import Button from './Button';
import Input from './Input';

interface IModelManagementFormState {
  NAME: string;
}
interface IModelManagementProps {
  name: string;
  models: string[];
  viewFunction: any;
  saveAsFunction: any;
  deleteFunction: any;
}
export class ModelManagementForm
  extends Component<IModelManagementProps, IModelManagementFormState> {
  constructor(props: IModelManagementProps) {
    super(props);

    if (printDebug()) {
      log('props for ModelManagementForm: ' + showObj(props));
    }

    // log(`props.models = ${props.models}`);
    this.state = {
      NAME: props.name,
    };

    this.handleName = this.handleName.bind(this);
    this.view = this.view.bind(this);
    this.saveAs = this.saveAs.bind(this);
    this.delete = this.delete.bind(this);
    this.flip = this.flip.bind(this);
  }

  public render() {
    return (
      <div>
      <h3>Existing models:</h3>
      {this.modelList(this.props.models)}
      <form className="container-fluid"
        onSubmit={this.view}>
        <Input
          inputtype={'text'}
          title={'Manage model : name'}
          name={'input-model-name'}
          value={this.state.NAME}
          placeholder={'Enter name'}
          handlechange={this.handleName}
        />{' '}
        <Button
          action={(event: any) => {
            event.persist();
            this.view(event);
          }}
          type={'primary'}
          title={'View model'}
          id="viewModel"
        />{' '}
        <Button
          action={this.flip}
          type={'secondary'}
          title={'Switch models for comparison'}
          id="switchModel"
        />{' '}
        <Button
          action={this.saveAs}
          type={'secondary'}
          title={'Save as (overwites any existing)'}
          id="saveAsModel"
        />{' '}
        <Button
          action={this.delete}
          type={'secondary'}
          title={'Delete model (cannot be undone)'}
          id={`btn-${'Delete model (cannot be undone)'}`}
        />{' '}
      </form>
      </div>
    );
  }

  private modelList(models: string[]) {
    // log(`models = ${models}`)
    const buttons = models.map((model) =>
        <Button
          key={model}
          action={(e: any) => {
            e.persist();
            this.setState({
              ...this.state,
              NAME: model,
            }, () => {
              this.view(e);
            });
          }}
          title={model}
          id={`btn-${model}`}
          type="secondary"
        />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }

  private handleName(e: any) {
    e.preventDefault();
    const value = e.target.value;
    this.setState({
      NAME: value,
    });
  }
  private view(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.viewFunction(this.state.NAME);
  }
  private flip(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    const nextName: string = this.props.viewFunction(this.state.NAME);
    this.setState({
      NAME: nextName,
    });
  }
  private saveAs(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.saveAsFunction(this.state.NAME);
  }
  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    const response = await this.props.deleteFunction(this.state.NAME);
    if (response === true) {
      this.setState({ NAME: 'default' });
    }
  }
}
