import React, { Component } from 'react';

import { makeModelFromJSON } from '../../utils';
import Button from './Button';
import Input from './Input';
import { replaceWithModel } from '../../App';

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  userID: string;
  showAlert: (arg0: string) => void;
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
  }

  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for JSON form ${value}`);
    this.setState({ JSON: value });
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.replace}>
        <div className="row">
          <div className="col">
            <Input
              type={'text'}
              name={'replaceWithJSON'}
              value={this.state.JSON}
              placeholder={'Enter JSON data here'}
              onChange={this.handleValueChange}
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
        <div className="row">
          <div className="col">
            <Button
              action={this.replace}
              type={'secondary'}
              title={
                'Replace model from JSON input (over-writes any existing with the same name)'
              }
              id="replaceModel"
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
      </form>
    );
  }

  private async replace(e: any) {
    e.preventDefault();
    let modelName = this.props.modelName;
    let JSON = this.state.JSON;
    const i = this.state.JSON.indexOf(`{`);
    // log(`index of { in ${JSON} is ${i}`);
    if (i !== 0) {
      modelName = JSON.substring(0, i);
      JSON = JSON.substring(i);
    }
    if (window.confirm(`replace data in model ${modelName}, you sure?`)) {
      const newModel = makeModelFromJSON(modelName, JSON);
      replaceWithModel(this.props.userID, modelName, newModel);
      this.props.showAlert('replaced data OK');
      this.setState({ JSON: '' });
    }
  }
}
