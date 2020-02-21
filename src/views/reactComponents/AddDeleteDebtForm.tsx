import React, { Component } from 'react';

import { isNumberString } from '../../models/checks';
import { DbAsset, DbModelData, DbTransaction } from '../../types/interfaces';
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
  revalue,
  revalueDebt,
  payOffDebt,
  conditional,
  CASH_ASSET_NAME,
} from '../../localization/stringConstants';

interface EditFormState {
  NAME: string;
  VALUE: string;
  START: string;
  GROWTH: string;
  CATEGORY: string;
  PAYMENT: string;
  inputting: string;
}
interface EditProps {
  checkAssetFunction: any;
  submitAssetFunction: any;
  deleteAssetFunction: any;
  checkTransactionFunction: any;
  submitTransactionFunction: any;
  submitTrigger: any;
  model: DbModelData;
}

const inputtingRevalue = 'revalue';
const inputtingDebt = 'debt';

export class AddDeleteDebtForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  public constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteDebtForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      START: '',
      GROWTH: '',
      CATEGORY: '',
      PAYMENT: '',
      inputting: inputtingDebt,
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handlePaymentChange = this.handlePaymentChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);

    this.inputDebt = this.inputDebt.bind(this);
    this.inputRevalue = this.inputRevalue.bind(this);
    this.growthAndInflation = this.growthAndInflation.bind(this);
    this.revalue = this.revalue.bind(this);
  }

  private ValueAndCategory(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <div className="row">
          <div className="col">
            <Input
              title={`Debt value`}
              type="text"
              name="debtvalue"
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
              title={`Debt value`}
              type="text"
              name="debtvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Category (optional)"
              type="text"
              name="debtcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </div>
        </div>
      );
    }
  }

  private growthAndInflation(): React.ReactNode {
    if (this.state.inputting !== inputtingRevalue) {
      return (
        <div>
          <div className="row">
            <div className="col">
              <Input
                title="Annual interest rate (excluding inflation, e.g. 2 for 2% p.a.)"
                type="text"
                name="debtgrowth"
                value={this.state.GROWTH}
                placeholder="Enter growth"
                onChange={this.handleGrowthChange}
              />
            </div>
            {/* end col */}
            <div className="col">
              <Input
                title="Monthly repayment (optional)"
                type="text"
                name="debtpayoff"
                value={this.state.PAYMENT}
                placeholder="Enter payment"
                onChange={this.handlePaymentChange}
              />
            </div>
            {/* end col */}
          </div>
        </div>
      );
    }
  }

  private async revalue(e: any) {
    e.preventDefault();

    const parseVal = makeValueAbsPropFromString(`-${this.state.VALUE}`);
    if (!parseVal.checksOK) {
      alert(
        `Income value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }

    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Value set date should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue} ${this.state.NAME} ${count}`, this.props.model)
    ) {
      count += 1;
    }

    const revalueTransaction: DbTransaction = {
      NAME: `${revalue} ${this.state.NAME} ${count}`,
      FROM: '',
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.0',
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.START,
      TYPE: revalueDebt,
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
      alert(message);
      return;
    }
    await this.props.submitTransactionFunction(revalueTransaction);

    alert('added new data');
    // clear fields
    this.setState(this.defaultState);
    return;
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputting === inputtingDebt) {
      return (
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new debt (over-writes any existing with the same name)'
          }
          id="addDebt"
        />
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return (
        <Button
          action={this.revalue}
          type={'primary'}
          title={'Revalue this debt'}
          id="revalueDebt"
        />
      );
    }
  }

  public render() {
    // log('rendering an AddDeleteDebtForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title={'Debt name'}
              type="text"
              name="debtname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputDebt}
              type={
                this.state.inputting === inputtingDebt ? 'primary' : 'secondary'
              }
              title={'Add a new debt'}
              id="inputDebt"
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
              title={'Revalue debt'}
              id="revalueDebt"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        {this.ValueAndCategory()}
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Date on which the ${
              this.state.inputting === inputtingRevalue
                ? 'revaluation occurs'
                : 'debt starts'
            }`}
            setDateFunction={this.setStart}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        {this.growthAndInflation()}
        {this.goButtons()}
      </form>
    );
  }

  private handleNameChange(e: any) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleGrowthChange(e: any) {
    const value = e.target.value;
    this.setState({ GROWTH: value });
  }
  private handlePaymentChange(e: any) {
    const value = e.target.value;
    this.setState({ PAYMENT: value });
  }
  private handleCategoryChange(e: any) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
  }

  private async add(e: any) {
    e.preventDefault();

    let isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      alert(`Debt value ${this.state.VALUE} should be a numerical value`);
      return;
    }
    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    isNotANumber = !isNumberString(this.state.GROWTH);
    if (isNotANumber) {
      alert(`Growth value '${this.state.GROWTH}' should be a numerical value`);
      return;
    }
    if (this.state.PAYMENT !== '') {
      isNotANumber = !isNumberString(this.state.PAYMENT);
      if (isNotANumber) {
        alert(
          `Payment value '${this.state.PAYMENT}' should be a numerical value`,
        );
        return;
      }
    }

    // log('adding something ' + showObj(this));
    const asset: DbAsset = {
      NAME: this.state.NAME,
      VALUE: `-${parseFloat(this.state.VALUE)}`,
      QUANTITY: '', // debts are continuous
      START: this.state.START,
      GROWTH: this.state.GROWTH,
      CPI_IMMUNE: true, // debts never grow with CPI
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: true,
      CATEGORY: this.state.CATEGORY,
      PURCHASE_PRICE: '0.0',
      LIABILITY: '',
    };
    const message = this.props.checkAssetFunction(asset, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      await this.props.submitAssetFunction(asset);
      if (this.state.PAYMENT !== '') {
        let count = 1;
        while (
          isATransaction(
            `Payment to ${this.state.NAME} ${count}`,
            this.props.model,
          )
        ) {
          count += 1;
        }
        const transaction: DbTransaction = {
          NAME: `${conditional}Payment to ${this.state.NAME} ${count}`,
          CATEGORY: this.state.CATEGORY,
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: this.state.PAYMENT,
          TO: this.state.NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: this.state.START,
          STOP_DATE: '',
          RECURRENCE: '1m',
          TYPE: payOffDebt,
        };
        // log('adding something ' + showObj(transaction));
        const message = this.props.checkTransactionFunction(
          transaction,
          this.props.model,
        );
        if (message.length > 0) {
          alert(message);
          await this.props.deleteAssetFunction(asset);
        } else {
          this.props.submitTransactionFunction(transaction);
          alert('added new debt and payment');
          // clear fields
          this.setState(this.defaultState);
        }
      } else {
        alert('added new debt');
        // clear fields
        this.setState(this.defaultState);
      }
    }
  }

  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteAssetFunction(this.state.NAME)) {
      alert('deleted debt');
      // clear fields
      this.setState(this.defaultState);
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
  private inputDebt(e: any) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingDebt,
    });
  }
  private inputRevalue(e: any) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
