import React, { Component } from 'react';

import {
  DbModelData,
  DbTransaction,
  DbTrigger,
  FormProps,
  DbSetting,
} from '../../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeValueAbsPropFromString,
  isATransaction,
} from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import {
  adjustableType,
  revalue,
  revalueSetting,
} from '../../localization/stringConstants';

interface EditSettingFormState {
  NAME: string;
  VALUE: string;
  START: string;
  inputting: string;
}
interface EditSettingProps extends FormProps {
  submitSettingFunction: (arg0: DbSetting, arg1: DbModelData) => Promise<void>;
  checkTransactionFunction: (t: DbTransaction, model: DbModelData) => string;
  submitTransactionFunction: (
    transactionInput: DbTransaction,
    modelData: DbModelData,
  ) => Promise<void>;
  submitTriggerFunction: (
    triggerInput: DbTrigger,
    modelData: DbModelData,
  ) => Promise<void>;
}

const inputtingRevalue = 'revalue';
const inputtingSetting = 'setting';

export class AddDeleteSettingForm extends Component<
  EditSettingProps,
  EditSettingFormState
> {
  public defaultState: EditSettingFormState;

  public constructor(props: EditSettingProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteSettingForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      START: '',
      inputting: inputtingSetting,
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);

    this.add = this.add.bind(this);

    this.inputSetting = this.inputSetting.bind(this);
    this.inputRevalue = this.inputRevalue.bind(this);
    this.revalue = this.revalue.bind(this);
  }

  private ValueAndCategory(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <div className="row">
          <div className="col">
            <Input
              title={`Setting value`}
              type="text"
              name="settingvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="row">
          <div className="col">
            <Input
              title={`Setting value`}
              type="text"
              name="settingvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>
          {/* end col */}
        </div>
      );
    }
  }

  private async revalue(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Given date ${this.state.START} should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue} ${this.state.NAME} ${count}`, this.props.model)
    ) {
      count += 1;
    }

    let toAbsolute = true;
    let toValue = this.state.VALUE;

    const parsed = makeValueAbsPropFromString(toValue);
    if (parsed.checksOK && !parsed.absolute) {
      toAbsolute = false;
      toValue = parsed.value;
    }

    const revalueTransaction: DbTransaction = {
      NAME: `${revalue} ${this.state.NAME} ${count}`,
      FROM: '',
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.0',
      TO: this.state.NAME,
      TO_ABSOLUTE: toAbsolute,
      TO_VALUE: toValue,
      DATE: this.state.START,
      TYPE: revalueSetting,
      RECURRENCE: '',
      STOP_DATE: '',
      CATEGORY: '',
    };
    // log(`adding transaction ${showObj(revalueExpenseTransaction)}`);
    const message = await this.props.checkTransactionFunction(
      revalueTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueTransaction,
      this.props.model,
    );

    this.props.showAlert('added new data');
    // clear fields
    this.setState(this.defaultState);
    return;
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputting === inputtingSetting) {
      return (
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new setting (over-writes any existing with the same name)'
          }
          id="addSetting"
        />
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return (
        <Button
          action={this.revalue}
          type={'primary'}
          title={'Revalue this setting'}
          id="revalueSetting"
        />
      );
    }
  }

  private startDate(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={'Date on which the revaluation occurs'}
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setStart}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
      );
    } else {
      return <div className="row"></div>;
    }
  }

  public render() {
    // log('rendering an AddDeleteSettingForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title={'Setting name'}
              type="text"
              name="settingname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputSetting}
              type={
                this.state.inputting === inputtingSetting
                  ? 'primary'
                  : 'secondary'
              }
              title={'Add a new setting'}
              id="inputSetting"
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputRevalue}
              type={
                this.state.inputting === inputtingRevalue
                  ? 'primary'
                  : 'secondary'
              }
              title={'Revalue setting'}
              id="revalueSettingInputs"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        {this.ValueAndCategory()}
        {this.startDate()}

        {this.goButtons()}
      </form>
    );
  }

  private handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setStart(value);
  }

  private async add(e: any) {
    e.preventDefault();

    // log('adding something ' + showObj(this));
    const setting: DbSetting = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      HINT: '',
      TYPE: adjustableType,
    };

    await this.props.submitSettingFunction(setting, this.props.model);

    this.props.showAlert('added new setting');
    // clear fields
    this.setState(this.defaultState);
  }

  private inputSetting(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingSetting,
    });
  }
  private inputRevalue(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
