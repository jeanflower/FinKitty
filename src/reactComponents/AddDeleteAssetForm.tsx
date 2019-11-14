import React, { Component } from 'react';

import { checkAssetLiability } from '../checks';
import { DbAsset, DbModelData } from '../types/interfaces';
import { checkTriggerDate, log, printDebug, showObj } from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface EditFormState {
  NAME: string;
  ASSET_VALUE: string;
  ASSET_START: string;
  ASSET_GROWTH: string;
  ASSET_PURCHASE_PRICE: string;
  ASSET_LIABILITY: string;
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

  private valueSetSelectID = 'valueSetSelect';
  private assetStartSelectID = 'assetStartSelect';
  private assetEndSelectID = 'assetEndSelect';

  constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteAssetForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      ASSET_VALUE: '',
      ASSET_START: '',
      ASSET_GROWTH: '',
      ASSET_PURCHASE_PRICE: '',
      ASSET_LIABILITY: '',
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
              inputtype="text"
              name="name"
              value={this.state.NAME}
              placeholder="Enter name"
              handlechange={this.handleNameChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Asset value:"
              inputtype="text"
              name="value"
              value={this.state.ASSET_VALUE}
              placeholder="Enter value"
              handlechange={this.handleValueChange}
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
            inputValue={this.state.ASSET_START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        <div className="row">
          <div className="col">
            <Input
              title="Annual growth percentage (excluding inflation):"
              inputtype="text"
              name="growth"
              value={this.state.ASSET_GROWTH}
              placeholder="Enter growth"
              handlechange={this.handleGrowthChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Liability (e.g. 'CGTJoe'):"
              inputtype="text"
              name="liability"
              value={this.state.ASSET_LIABILITY}
              placeholder="Enter liability"
              handlechange={this.handleLiabilityChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Category (optional):"
              inputtype="text"
              name="category"
              value={this.state.CATEGORY}
              placeholder="category"
              handlechange={this.handleCategoryChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Original purchase price (for CGT purposes):"
              inputtype="text"
              name="purchase"
              value={this.state.ASSET_PURCHASE_PRICE}
              placeholder="purchase"
              handlechange={this.handlePurchasePriceChange}
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
    this.setState({ ASSET_GROWTH: value });
  }
  private handleCategoryChange(e: any) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handlePurchasePriceChange(e: any) {
    const value = e.target.value;
    this.setState({ ASSET_PURCHASE_PRICE: value });
  }
  private handleLiabilityChange(e: any) {
    const value = e.target.value;
    this.setState({ ASSET_LIABILITY: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ ASSET_VALUE: value });
  }
  private setStart(value: string): void {
    this.setState({ ASSET_START: value });
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

    let isNotANumber = Number.isNaN(parseFloat(this.state.ASSET_VALUE));
    if (isNotANumber) {
      alert(
        `Asset value ${this.state.ASSET_VALUE} should be a numerical value`,
      );
      return;
    }
    const date = checkTriggerDate(
      this.state.ASSET_START,
      this.props.model.triggers,
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Start date '${this.state.ASSET_START}' should be a date`);
      return;
    }
    isNotANumber = Number.isNaN(parseFloat(this.state.ASSET_GROWTH));
    if (isNotANumber) {
      alert(
        `Growth value '${this.state.ASSET_GROWTH}' should be a numerical value`,
      );
      return;
    }
    const liabilityMessage = checkAssetLiability(this.state.ASSET_LIABILITY);
    if (liabilityMessage !== '') {
      alert(liabilityMessage);
      return;
    }
    let purchasePrice = this.state.ASSET_PURCHASE_PRICE;
    if (purchasePrice === '') {
      purchasePrice = '0';
    }

    // log('adding something ' + showObj(this));
    const asset: DbAsset = {
      NAME: this.state.NAME,
      ASSET_VALUE: this.state.ASSET_VALUE,
      ASSET_START: this.state.ASSET_START,
      ASSET_GROWTH: this.state.ASSET_GROWTH,
      CATEGORY: this.state.CATEGORY,
      ASSET_PURCHASE_PRICE: purchasePrice,
      ASSET_LIABILITY: this.state.ASSET_LIABILITY,
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
  }
}
