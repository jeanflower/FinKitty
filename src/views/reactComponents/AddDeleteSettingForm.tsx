import React, { Component, FormEvent } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  ModelData,
  Setting,
  Transaction,
  Trigger,
  FormProps,
} from '../../types/interfaces';
import {
  adjustableType,
  revalue,
  revalueSetting,
} from '../../localization/stringConstants';
import { log, printDebug, showObj } from '../../utils/utils';

import { makeButton } from './Button';
import { DateSelectionRow, itemOptions } from './DateSelectionRow';
import { Input } from './Input';
import { doCheckBeforeOverwritingExistingData } from '../../App';
import { ViewSettings } from '../../models/charting';
import { isATransaction } from '../../models/modelUtils';
import {
  checkTriggerDate,
  makeValueAbsPropFromString,
} from '../../utils/stringUtils';
import Spacer from 'react-spacer';

interface EditSettingFormState {
  NAME: string;
  VALUE: string;
  START: string;
  inputting: string;
}
interface EditSettingProps extends FormProps {
  viewSettings: ViewSettings;
  submitSettingFunction: (
    arg0: Setting,
    arg1: ModelData,
    arg2: ViewSettings,
  ) => Promise<void>;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
    modelData: ModelData,
  ) => Promise<void>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
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
    /* istanbul ignore if  */
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
        <Row>
          <Col>{this.inputSettingName()}</Col>
          <Col>
            <Input
              title={`Setting value`}
              type="text"
              name="settingvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col>
            <Input
              title={'Setting name'}
              type="text"
              name="settingname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                return this.handleNameChange(e.target.value);
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Setting value`}
              type="text"
              name="settingvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </Col>
        </Row>
      );
    }
  }

  private async revalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Given date ${this.state.START} should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue}${this.state.NAME} ${count}`, this.props.model)
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

    const revalueTransaction: Transaction = {
      NAME: `${revalue}${this.state.NAME} ${count}`,
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
      return makeButton(
        'Create new setting (over-writes any existing with the same name)',
        this.add,
        'addSetting',
        'addSetting',
        'primary',
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return makeButton(
        'Revalue this setting',
        this.revalue,
        'revalueSetting',
        'revalueSetting',
        'primary',
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
    }
  }

  public render() {
    // log('rendering an AddDeleteSettingForm');
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            'Add new setting mode',
            this.inputSetting,
            'inputSetting',
            'inputSetting',
            this.state.inputting === inputtingSetting
              ? 'primary'
              : 'outline-secondary',
          )}
          {makeButton(
            'Revalue setting mode',
            this.inputRevalue,
            'revalueSettingInputs',
            'revalueSettingInputs',
            this.state.inputting === inputtingRevalue
              ? 'primary'
              : 'outline-secondary',
          )}
        </div>
        <form className="container-fluid" onSubmit={this.add}>
          {this.ValueAndCategory()}
          {this.startDate()}
          {this.goButtons()}
        </form>
      </>
    );
  }

  private inputSettingName(): React.ReactNode {
    return (
      <>
        Setting name
        <Spacer height={10} />
        {itemOptions(
          this.props.model.settings.filter((s) => {
            return s.TYPE === adjustableType;
          }),
          this.props.model,
          this.handleNameChange,
          'settingname',
          'Select setting',
        )}
      </>
    );
  }

  private handleNameChange(name: string) {
    const value = name;
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

  private async add(e: FormEvent<Element>) {
    e.preventDefault();

    if (this.state.NAME === '') {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.settings.find((a) => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        log(
          `this.props.model.settings = ${showObj(this.props.model.settings)}`,
        );
        this.props.showAlert(
          `There's already a setting called ${this.state.NAME}`,
        );
        return;
      }
    }

    // log('adding something ' + showObj(this));
    const setting: Setting = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      HINT: '',
      TYPE: adjustableType,
    };

    await this.props.submitSettingFunction(
      setting,
      this.props.model,
      this.props.viewSettings,
    );

    this.props.showAlert(`added new setting ${this.state.NAME}`);
    // clear fields
    this.setState(this.defaultState);
  }

  private inputSetting(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingSetting,
    });
  }
  private inputRevalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
