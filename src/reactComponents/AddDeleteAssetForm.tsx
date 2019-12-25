import React, { Component } from 'react';

import { checkAssetLiability, isNumberString } from '../checks';
import { DbAsset, DbModelData } from '../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
} from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface EditFormState {
  NAME: string;
  VALUE: string;
  START: string;
  GROWTH: string;
  CPI_IMMUNE: string;
  CAN_BE_NEGATIVE: string;
  PURCHASE_PRICE: string;
  LIABILITY: string;
  CATEGORY: string;
}
interface EditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: DbModelData;
}
export class AddDeleteAssetForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  public constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteAssetForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      START: '',
      GROWTH: '',
      CPI_IMMUNE: '',
      CAN_BE_NEGATIVE: '',
      PURCHASE_PRICE: '',
      LIABILITY: '',
      CATEGORY: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleLiabilityChange = this.handleLiabilityChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handlePurchasePriceChange = this.handlePurchasePriceChange.bind(this);
    this.handleFixedChange = this.handleFixedChange.bind(this);
    this.handleCanBeNegativeChange = this.handleCanBeNegativeChange.bind(this);
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
              title="Asset name:"
              type="text"
              name="assetname"
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
              title={'Delete any asset with this name'}
              id="deleteAsset"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Asset value:"
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
              title="Category (optional):"
              type="text"
              name="assetcategory"
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
            introLabel="Date on which the asset starts:"
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
              title="Annual growth percentage (excluding inflation):"
              type="text"
              name="assetgrowth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={this.handleGrowthChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Is value immune to inflation?:"
              type="text"
              name="assetcpi-immune"
              value={this.state.CPI_IMMUNE}
              placeholder="Enter Y/N"
              onChange={this.handleFixedChange}
            />
          </div>
          </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Can asset ever have a negative value?:"
              type="text"
              name="assetCanBeNegative"
              value={this.state.CAN_BE_NEGATIVE}
              placeholder="Enter Y/N"
              onChange={this.handleCanBeNegativeChange}
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Liability (e.g. 'CGTJoe'):"
              type="text"
              name="liability"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Original purchase price (for CGT purposes):"
              type="text"
              name="purchase"
              value={this.state.PURCHASE_PRICE}
              placeholder="purchase"
              onChange={this.handlePurchasePriceChange}
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new asset (over-writes any existing with the same name)'
          }
          id="addAsset"
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
  private handlePurchasePriceChange(e: any) {
    const value = e.target.value;
    this.setState({ PURCHASE_PRICE: value });
  }
  private handleLiabilityChange(e: any) {
    const value = e.target.value;
    this.setState({ LIABILITY: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private handleFixedChange(e: any) {
    const value = e.target.value;
    this.setState({ CPI_IMMUNE: value });
  }
  private handleCanBeNegativeChange(e: any) {
    const value = e.target.value;
    this.setState({ CAN_BE_NEGATIVE: value });
  }  
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
  }
  private add(e: any): void {
    e.preventDefault();

    let isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      alert(`Asset value ${this.state.VALUE} should be a numerical value`);
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
    const liabilityMessage = checkAssetLiability(this.state.LIABILITY);
    if (liabilityMessage !== '') {
      alert(liabilityMessage);
      return;
    }
    let purchasePrice = this.state.PURCHASE_PRICE;
    if (purchasePrice === '') {
      purchasePrice = '0';
    }
    const parsedYNCPI = makeBooleanFromYesNo(this.state.CPI_IMMUNE);
    if (!parsedYNCPI.checksOK) {
      alert(`Inflation-immune: '${this.state.CPI_IMMUNE}' should be a Y/N value`);
      return;
    }
    const parsedYNNeg = makeBooleanFromYesNo(this.state.CAN_BE_NEGATIVE);
    if (!parsedYNNeg.checksOK) {
      alert(`Can be negative: '${this.state.CAN_BE_NEGATIVE}' should be a Y/N value`);
      return;
    }

    // log('adding something ' + showObj(this));
    const asset: DbAsset = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      START: this.state.START,
      GROWTH: this.state.GROWTH,
      CPI_IMMUNE: parsedYNCPI.value,
      CAN_BE_NEGATIVE: parsedYNNeg.value,
      CATEGORY: this.state.CATEGORY,
      PURCHASE_PRICE: purchasePrice,
      LIABILITY: this.state.LIABILITY,
    };
    const message = this.props.checkFunction(asset, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitFunction(asset);
      alert('added new asset');
      // clear fields
      this.setState(this.defaultState);
    }
  }
  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      alert('deleted expense');
      // clear fields
      this.setState(this.defaultState);
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
}
