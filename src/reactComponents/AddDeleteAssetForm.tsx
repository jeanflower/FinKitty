import React, { Component } from 'react';

import { checkAssetLiability } from '../checks';
import { DbAsset, DbModelData } from '../types/interfaces';
import { checkTriggerDate, log, printDebug, showObj } from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface EditFormState {
  NAME: string;
  VALUE: string;
  START: string;
  GROWTH: string;
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

  private assetStartSelectID = 'assetStartSelect';

  constructor(props: EditProps) {
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
              name="name"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Asset value:"
              type="text"
              name="value"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the asset starts:"
            setDateFunction={this.setStart}
            selectID="assetStartSelect"
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
              name="growth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={this.handleGrowthChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Liability (e.g. 'CGTJoe'):"
              type="text"
              name="liability"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Category (optional):"
              type="text"
              name="category"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </div>{' '}
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
          </div>{' '}
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
        <Button
          action={this.delete}
          type={'secondary'}
          title={'Delete any asset with this name'}
          id="deleteAsset"
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
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
    this.resetStartSelect();
  }
  private resetStartSelect() {
    const selector: any = document.getElementById(this.assetStartSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private add(e: any): void {
    e.preventDefault();

    let isNotANumber = Number.isNaN(parseFloat(this.state.VALUE));
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
    isNotANumber = Number.isNaN(parseFloat(this.state.GROWTH));
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

    // log('adding something ' + showObj(this));
    const asset: DbAsset = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      START: this.state.START,
      GROWTH: this.state.GROWTH,
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
      this.resetStartSelect();
    }
  }
  private delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    this.props.deleteFunction(this.state.NAME);
    alert('deleted asset');
    // clear fields
    this.setState(this.defaultState);
    this.resetStartSelect();
  }
}
