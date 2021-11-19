import React, { Component, FormEvent } from 'react';

import { log, printDebug } from '../../utils';
import { Input } from './Input';
import { replaceWithModel } from '../../App';
import { makeModelFromJSON } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  modelNames: string[];
  userID: string;
  model: ModelData;
  showAlert: (arg0: string) => void;
  setReportKey: (args0: string, model: ModelData) => void;
  toggleCheckOverwrite: () => void;
  toggleOverview: () => void;
  doCheckOverwrite: () => boolean;
  eval: () => void;
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
          title={'input report:txt|overwrite|overview|eval|txt:{jsonData}'}
          name={'replaceWithJSON'}
          value={this.state.JSON}
          placeholder={'Enter text input here'}
          onChange={this.handleValueChange}
          onSubmit={this.handleSubmit}
        />
      </form>
    );
  }

  private async replace(e: FormEvent<Element>) {
    e.preventDefault();
    let modelName = this.props.modelName;

    // special words
    const reportStarter = 'report:';
    const overwriteWord = 'overwrite';
    const gotoOverview = 'overview';
    const evalWord = 'eval';

    // log(`modelName from props is ${modelName}`);
    let JSON = this.state.JSON.trim();
    if (JSON.startsWith(reportStarter)) {
      this.props.setReportKey(
        JSON.substring(reportStarter.length),
        this.props.model,
      );
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === overwriteWord) {
      this.props.toggleCheckOverwrite();
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === evalWord) {
      this.props.eval();
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === gotoOverview) {
      this.props.toggleOverview();
      this.setState({ JSON: '' });
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
    const alreadyExists = this.props.modelNames.find(existing => {
      return existing === modelName;
    });
    if (
      !alreadyExists ||
      !this.props.doCheckOverwrite() ||
      window.confirm(
        `will replace ${modelName} which already exists, you sure?`,
      )
    ) {
      const newModel = makeModelFromJSON(JSON);
      replaceWithModel(this.props.userID, modelName, newModel, false);
      this.props.showAlert('replaced data OK');
      this.setState({ JSON: '' });
    }
  }
}
