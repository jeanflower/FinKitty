import React, { Component, FormEvent } from 'react';

import { log, printDebug } from '../../utils';
import { Input } from './Input';
import { replaceWithModel } from '../../App';
import { makeModelFromJSON } from '../../models/modelUtils';

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  userID: string;
  showAlert: (arg0: string) => void;
  debug: (args0: string) => void;
}

export class ReplaceWithJSONForm extends Component<
  ReplaceWithJSONFormProps,
  ReplaceWithJSONFormState
> {
  public defaultState: ReplaceWithJSONFormState;

  public constructor(props: ReplaceWithJSONFormProps) {
    super(props);
    this.defaultState = {
      JSON: '',
    };

    this.state = this.defaultState;

    this.replace = this.replace.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for JSON form ${value}`);
    this.setState({ JSON: value });
  }

  private handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    // log(`setting new value for JSON form ${value}`);
    this.replace(e);
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.replace}>
        <Input
          type={'text'}
          title={'Replace model with JSON data:'}
          name={'replaceWithJSON'}
          value={this.state.JSON}
          placeholder={'Enter JSON data here to replace model'}
          onChange={this.handleValueChange}
          onSubmit={this.handleSubmit}
        />
      </form>
    );
  }

  private async replace(e: FormEvent<Element>) {
    e.preventDefault();
    let modelName = this.props.modelName;

    // log(`modelName from props is ${modelName}`);
    let JSON = this.state.JSON;
    const debugStarter = 'debug:';
    if(JSON.startsWith(debugStarter)){
      this.props.debug(JSON.substring(debugStarter.length))
      return;
    }

    const i = this.state.JSON.indexOf(`{`);
    if (printDebug()) {
      log(`index of { in ${JSON} is ${i}`);
    }
    if (i !== 0) {
      modelName = JSON.substring(0, i);
      // log(`modelName from JSON is ${modelName}`);
      JSON = JSON.substring(i);
    }
    if (
      window.confirm(`will replace if ${modelName} already exists, you sure?`)
    ) {
      const newModel = makeModelFromJSON(JSON);
      replaceWithModel(this.props.userID, modelName, newModel, false);
      this.props.showAlert('replaced data OK');
      this.setState({ JSON: '' });
    }
  }
}
