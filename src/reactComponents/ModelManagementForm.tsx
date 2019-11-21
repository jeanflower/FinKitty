import React, { Component } from 'react';

import { log, printDebug, showObj } from '../utils';
import Button from './Button';
import Input from './Input';

interface ModelManagementFormState {
  NAME: string;
}
interface ModelManagementProps {
  name: string;
  models: string[];
  selectFunction: any;
  saveAsFunction: any;
  clearDataFunction: any;
  checkModelDataFunction: any;
  logDataFunction: any;
  replaceWithSampleFunction: any;
}
export class ModelManagementForm extends Component<
  ModelManagementProps,
  ModelManagementFormState
> {
  public constructor(props: ModelManagementProps) {
    super(props);

    if (printDebug()) {
      log('props for ModelManagementForm: ' + showObj(props));
    }

    // log(`props.models = ${props.models}`);
    this.state = {
      NAME: props.name,
    };

    this.handleName = this.handleName.bind(this);
    this.select = this.select.bind(this);
    this.saveAs = this.saveAs.bind(this);
    this.clearData = this.clearData.bind(this);
    this.checkModelData = this.checkModelData.bind(this);
    this.logData = this.logData.bind(this);
    this.replaceWithSample = this.replaceWithSample.bind(this);
  }

  public render() {
    return (
      <div>
        <p>Select a model</p>
        {this.modelList(this.props.models) /*buttons to select*/}
        <p>Choose an action</p>
        <Button
          action={(e: any) => {
            this.checkModelData(e);
          }}
          title="Check model integrity"
          id={`btn-check`}
          type="secondary"
        />
        <Button
          action={(e: any) => {
            this.logData(e);
          }}
          title="Log model data"
          id={`btn-log`}
          type="secondary"
        />
        <Button
          action={(e: any) => {
            this.clearData(e);
          }}
          title="Clear model data (!)"
          id={`btn-clear`}
          type="secondary"
        />
        <Button
          action={(e: any) => {
            this.replaceWithSample(e);
          }}
          title="Replace model data with sample (!)"
          id={`btn-replace`}
          type="secondary"
        />
        <form className="container-fluid" onSubmit={this.select}>
          <Input
            type={'text'}
            title={'Save as : provide a name'}
            name={'input-model-name'}
            value={this.state.NAME}
            placeholder={'Enter name'}
            onChange={this.handleName}
          />{' '}
          <Button
            action={this.saveAs}
            type={'secondary'}
            title={'Save as (overwites any existing)'}
            id="saveAsModel"
          />{' '}
        </form>
      </div>
    );
  }

  private modelList(models: string[]) {
    // log(`models = ${models}`)
    const buttons = models.map(model => (
      <Button
        key={model}
        action={(e: any) => {
          e.persist();
          this.setState(
            {
              ...this.state,
              NAME: model,
            },
            () => {
              this.select(e);
            },
          );
        }}
        title={model}
        id={`btn-${model}`}
        type={this.state.NAME === model ? 'primary' : 'secondary'}
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private handleName(e: any) {
    e.preventDefault();
    const value = e.target.value;
    this.setState({
      NAME: value,
    });
  }
  private select(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.selectFunction(this.state.NAME);
  }
  private saveAs(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.saveAsFunction(this.state.NAME);
  }
  private checkModelData(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.checkModelDataFunction(this.state.NAME);
  }
  private clearData(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.clearDataFunction(this.state.NAME);
  }
  private logData(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.logDataFunction(this.state.NAME);
  }
  private replaceWithSample(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.replaceWithSampleFunction(this.state.NAME);
  }
}
