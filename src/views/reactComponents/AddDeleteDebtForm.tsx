import React, { Component } from 'react';

import { isNumberString } from '../../models/checks';
import { DbAsset, DbModelData } from '../../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
} from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface EditFormState {
  NAME: string;
  VALUE: string;
  START: string;
  GROWTH: string;
  CPI_IMMUNE: string;
  CATEGORY: string;
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
      CPI_IMMUNE: '',
      CATEGORY: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleFixedChange = this.handleFixedChange.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteAssetForm');
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
              action={this.delete}
              type={'secondary'}
              title={`Delete debt`}
              id="deleteAsset"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title={`Debt value`}
              type="text"
              name="assetvalue"
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
        {/* end row */}

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Date on which the debt starts`}
            setDateFunction={this.setStart}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
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
              title="Is value immune to inflation?"
              type="text"
              name="debtcpi-immune"
              value={this.state.CPI_IMMUNE}
              placeholder="Enter Y/N"
              onChange={this.handleFixedChange}
            />
          </div>
        </div>
        {/* end row */}

        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new debt (over-writes any existing with the same name)'
          }
          id="addDebt"
        />
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
  private handleCategoryChange(e: any) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private handleFixedChange(e: any) {
    const value = e.target.value;
    this.setState({ CPI_IMMUNE: value });
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

    const parsedYNCPI = makeBooleanFromYesNo(this.state.CPI_IMMUNE);
    if (!parsedYNCPI.checksOK) {
      alert(
        `Inflation-immune: '${this.state.CPI_IMMUNE}' should be a Y/N value`,
      );
      return;
    }

    // log('adding something ' + showObj(this));
    const asset: DbAsset = {
      NAME: this.state.NAME,
      VALUE: `${-parseFloat(this.state.VALUE)}`,
      QUANTITY: '', // debts are continuous
      START: this.state.START,
      GROWTH: this.state.GROWTH,
      CPI_IMMUNE: parsedYNCPI.value,
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: true,
      CATEGORY: this.state.CATEGORY,
      PURCHASE_PRICE: '',
      LIABILITY: '',
    };
    const message = this.props.checkAssetFunction(asset, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      await this.props.submitAssetFunction(asset);
      alert('added new debt');
      // clear fields
      this.setState(this.defaultState);
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
}
