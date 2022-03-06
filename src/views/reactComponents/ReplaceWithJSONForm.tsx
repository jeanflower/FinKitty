import React, { Component, FormEvent } from 'react';

import { log, printDebug } from '../../utils';
import { Input } from './Input';
import { replaceWithModel } from '../../App';
import { makeModelFromJSON } from '../../models/modelUtils';
import { makeButton } from './Button';
import {
  checkModelOnEditOption,
  checkOverwriteOption,
  evalModeOption,
  goToOverviewPageOption,
} from '../../localization/stringConstants';

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  modelNames: string[];
  userID: string;
  showAlert: (arg0: string) => void;
  setReportKey: (args0: string) => void;
  toggleOption: (type: string) => void;
  getOption: (type: string) => boolean;
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

  /*
Options to toggle are
  checkOverwriteOption
  goToOverviewPageOption
  checkModelOnEditOption
  evalModeOption
*/

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.replace}>
        <Input
          type={'text'}
          title={
            'input report:{sourceMatcher:regexp,sourceExcluder:regexp}|newModelName:{jsonModelData}'
          }
          name={'replaceWithJSON'}
          value={this.state.JSON}
          placeholder={'Enter text input here'}
          onChange={this.handleValueChange}
          onSubmit={this.handleSubmit}
        />
        {makeButton(
          this.props.getOption(evalModeOption)
            ? `don't refresh charts on model edit`
            : 'do refresh charts on model edit',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: 'eval',
            });
            this.replace(e);
          },
          'toggleEDC',
          'toggleEDC',
          'outline-secondary',
        )}
        <br></br>
        {makeButton(
          this.props.getOption(checkModelOnEditOption)
            ? `don't check model on edit`
            : 'do check model on edit',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: checkModelOnEditOption,
            });
            this.replace(e);
          },
          'toggleCMOE',
          'toggleCMOE',
          'outline-secondary',
        )}
        <br></br>
        {makeButton(
          this.props.getOption(checkOverwriteOption)
            ? `don't check before overwrite`
            : 'do check before overwrite',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: 'overwrite',
            });
            this.replace(e);
          },
          'toggleCBO',
          'toggleCBO',
          'outline-secondary',
        )}
        <br></br>
        {makeButton(
          this.props.getOption(goToOverviewPageOption)
            ? `don't jump to overview page when selecting a model`
            : `do jump to overview page when selecting a model`,
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: 'overview',
            });
            this.replace(e);
          },
          'toggleJTO',
          'toggleJTO',
          'outline-secondary',
        )}
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
    const checkModelOnEdit = checkModelOnEditOption;
    const evalWord = 'eval';

    // log(`modelName from props is ${modelName}`);
    let JSON = this.state.JSON.trim();
    if (JSON.startsWith(reportStarter)) {
      this.props.setReportKey(JSON.substring(reportStarter.length));
      this.setState({ JSON: '' });
      return;
    }

    /*
Options to toggle are
 checkOverwriteOption
  goToOverviewPageOption
  checkModelOnEditOption
  'evalMode'
*/

    if (JSON === overwriteWord) {
      this.props.toggleOption(checkOverwriteOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === evalWord) {
      this.props.toggleOption(evalModeOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === gotoOverview) {
      this.props.toggleOption(goToOverviewPageOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === checkModelOnEdit) {
      this.props.toggleOption(checkModelOnEditOption);
      this.setState({ JSON: '' });
      return;
    }

    const i = this.state.JSON.indexOf(`{`);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`index of { in ${JSON} is ${i}`);
    }
    if (i !== 0) {
      modelName = JSON.substring(0, i);
      // log(`modelName from JSON is ${modelName}`);
      JSON = JSON.substring(i);
    }
    const alreadyExists = this.props.modelNames.find((existing) => {
      return existing === modelName;
    });
    if (
      !alreadyExists ||
      !this.props.getOption('checkOverwrite') ||
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
