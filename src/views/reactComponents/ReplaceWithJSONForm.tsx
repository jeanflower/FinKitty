import React, { Component, FormEvent } from 'react';

import { log, printDebug } from '../../utils/utils';
import { Input } from './Input';
import { favouritesOnly, replaceWithModel, showHistorical } from '../../App';
import { makeModelFromJSON } from '../../models/modelUtils';
import { makeButton } from './Button';
import {
  checkModelOnEditOption,
  checkOverwriteOption,
  evalModeOption,
  goToOverviewPageOption,
  showTransactionsButtonOption,
  showTaxButtonOption,
  showAssetActionsButtonOption,
  showOptimiserButtonOption,
  favourites,
  showHistoricalOption,
} from '../../localization/stringConstants';

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  modelNames: string[];
  userID: string;
  showAlert: (arg0: string) => void;
  setReportKey: (
    args0: string,
    args1: number,
    args2: boolean,
    args3: boolean,
    args4: boolean,
  ) => void;
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
  showTransactionsButtonOption
  showTaxButtonOption
  showAssetActionsButtonOption
  showOptimiserButtonOption
  showHistoricalOption
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
          this.props.getOption(showTransactionsButtonOption)
            ? `don't show Transactions button`
            : 'do show Transactions button',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: showTransactionsButtonOption,
            });
            this.replace(e);
          },
          'toggleTransB',
          'toggleTransB',
          'outline-secondary',
        )}
        {makeButton(
          this.props.getOption(showTaxButtonOption)
            ? `don't show Tax button`
            : 'do show Tax button',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: showTaxButtonOption,
            });
            this.replace(e);
          },
          'toggleTaxB',
          'toggleTaxB',
          'outline-secondary',
        )}
        {makeButton(
          this.props.getOption(showAssetActionsButtonOption)
            ? `don't show Asset Actions button`
            : 'do show Asset Actions button',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: showAssetActionsButtonOption,
            });
            this.replace(e);
          },
          'toggleAActionsB',
          'toggleAActionsB',
          'outline-secondary',
        )}
        {makeButton(
          this.props.getOption(showTransactionsButtonOption)
            ? `don't show Optimiser button`
            : 'do show Optimiser button',
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: showOptimiserButtonOption,
            });
            this.replace(e);
          },
          'toggleOptB',
          'toggleOptB',
          'outline-secondary',
        )}
        <br></br>
        {makeButton(
          favouritesOnly() ? 'show all items' : `show favourite items`,
          () => {
            this.props.toggleOption(favourites);
          },
          'toggleFav',
          'toggleFav',
          'outline-secondary',
        )}
        {makeButton(
          showHistorical() ? 'hide old items' : `show old items`,
          () => {
            this.props.toggleOption(showHistoricalOption);
          },
          'showHistoricalOption',
          'showHistoricalOption',
          'outline-secondary',
        )}
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
    const overwriteWord = 'overwrite';
    const gotoOverview = 'overview';
    const checkModelOnEdit = checkModelOnEditOption;
    const evalWord = 'eval';

    // log(`modelName from props is ${modelName}`);
    let JSON = this.state.JSON.trim();

    /*
    Options to toggle are
    - checkOverwriteOption
    - goToOverviewPageOption
    - checkModelOnEditOption
    - 'evalMode'
    */

    if (JSON === showTransactionsButtonOption) {
      this.props.toggleOption(showTransactionsButtonOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === showTaxButtonOption) {
      this.props.toggleOption(showTaxButtonOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === showAssetActionsButtonOption) {
      this.props.toggleOption(showAssetActionsButtonOption);
      this.setState({ JSON: '' });
      return;
    }
    if (JSON === showOptimiserButtonOption) {
      this.props.toggleOption(showOptimiserButtonOption);
      this.setState({ JSON: '' });
      return;
    }
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
    if (JSON === showHistoricalOption) {
      this.props.toggleOption(showHistoricalOption);
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
      const newModel = makeModelFromJSON(JSON, modelName); // replaces name in JSON
      replaceWithModel(this.props.userID, modelName, newModel, false);
      this.props.showAlert('replaced data OK');
      this.setState({ JSON: '' });
    }
  }
}
