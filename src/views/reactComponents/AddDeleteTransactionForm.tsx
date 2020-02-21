import React, { Component } from 'react';

import { DbModelData, DbTransaction } from '../../types/interfaces';
import {
  log,
  makeBooleanFromString,
  makeStringFromBoolean,
  printDebug,
  showObj,
  makeValueAbsPropFromString,
} from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import {
  taxPot,
  custom,
  /*  
  CASH_ASSET_NAME,
  liquidateAsset,
  conditional,
  payOffDebt,
  revalue,
  revalueAsset,
  revalueInc,
  revalueExp,
  revalueDebt,
*/
} from '../../localization/stringConstants';

interface EditFormState {
  NAME: string;
  CATEGORY: string;
  FROM: string;
  FROM_ABSOLUTE: string;
  FROM_VALUE: string;
  FROM_INPUT_VALUE: string;
  TO: string;
  TO_ABSOLUTE: string;
  TO_VALUE: string;
  TO_INPUT_VALUE: string;
  DATE: string;
  STOP_DATE: string; // for regular transactions
  RECURRENCE: string;
}
interface EditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: DbModelData;
}
function assetOptions(model: DbModelData, handleChange: any, id: string) {
  let optionData = model.assets.map(asset => {
    return {
      text: asset.NAME,
      action: (e: any) => {
        // log(`detected action`);
        // e.persist();
        e.preventDefault();
        handleChange(asset.NAME);
      },
    };
  });
  // remove optionData whose text is taxPot
  optionData = optionData.filter(od => od.text !== taxPot);
  const options = optionData.map(bd => (
    <option
      value={bd.text}
      id={`option-asset-${bd.text}`}
      key={bd.text}
      className="text-muted"
    >
      {bd.text}
    </option>
  ));
  return (
    <select
      className="custom-select"
      id={id}
      onChange={e => {
        const found = optionData.find(od => {
          return od.text === e.target.value;
        });
        if (found !== undefined) {
          found.action(e);
        }
      }}
    >
      <option>Choose an asset</option>
      {options}
    </select>
  );
}

export class AddDeleteTransactionForm extends Component<
  EditProps,
  EditFormState
> {
  public defaultState: EditFormState;

  private transactionFromSelectID = 'fromAssetSelect';
  private transactionToSelectID = 'toAssetSelect';

  public constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteTransactionForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      CATEGORY: '',
      FROM: '',
      FROM_ABSOLUTE: '',
      FROM_VALUE: '',
      FROM_INPUT_VALUE: '',
      TO: '',
      TO_ABSOLUTE: '',
      TO_VALUE: '',
      TO_INPUT_VALUE: '',
      DATE: '',
      STOP_DATE: '',
      RECURRENCE: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.handleFromValueChange = this.handleFromValueChange.bind(this);
    this.handleToValueChange = this.handleToValueChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleRecurrenceChange = this.handleRecurrenceChange.bind(this);

    this.handleDateChange = this.handleDateChange.bind(this);
    this.setDate = this.setDate.bind(this);

    this.handleStopDateChange = this.handleStopDateChange.bind(this);
    this.setStopDate = this.setStopDate.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteTransactionForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title="Transaction name"
              type="text"
              name="transactionname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the transaction occurs"
            setDateFunction={this.setDate}
            inputName="date"
            inputValue={this.state.DATE}
            onChangeHandler={this.handleDateChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        <div className="row">
          <div className="col">
            <label>Transact from asset (optional):</label>
          </div>{' '}
          {/* end col */}
          <div className="col">
            <label>Transact to asset (optional):</label>
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            {assetOptions(
              this.props.model,
              this.handleFromChange,
              this.transactionFromSelectID,
            )}
          </div>{' '}
          {/* end col */}
          <div className="col">
            {assetOptions(
              this.props.model,
              this.handleToChange,
              this.transactionToSelectID,
            )}
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="How much to reduce the value of the asset being sold (can be % of asset value)"
              type="text"
              name="fromValue"
              value={this.state.FROM_INPUT_VALUE}
              placeholder="Enter value"
              onChange={this.handleFromValueChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="How much to add to the value of the asset being purchased (can be % of transaction amount)"
              type="text"
              name="toValue"
              value={this.state.TO_INPUT_VALUE}
              placeholder="Enter value"
              onChange={this.handleToValueChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Transaction recurrence, e.g. 6m, 2y (optional)"
              type="text"
              name="recurrence"
              value={this.state.RECURRENCE}
              placeholder="Enter recurrence"
              onChange={this.handleRecurrenceChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which any recurrence stops (optional)"
            setDateFunction={this.setStopDate}
            inputName="stopDate"
            inputValue={this.state.STOP_DATE}
            onChangeHandler={this.handleStopDateChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Category (optional)"
              type="text"
              name="transactioncategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new transaction (over-writes any existing with the same name)'
          }
          id="addTransaction"
        />
      </form>
    );
  }
  private handleNameChange(e: any) {
    const value = e.target.value;
    this.setState({
      NAME: value,
    });
  }
  private handleFromChange(value: string) {
    // log(`from value changed to ${value}`);
    this.setState({
      FROM: value,
    });
  }
  private handleToChange(value: string) {
    this.setState({
      TO: value,
    });
  }
  private handleFromValueChange(e: any) {
    const value = e.target.value;
    const parseResult = makeValueAbsPropFromString(value);
    this.setState({
      FROM_ABSOLUTE: makeStringFromBoolean(parseResult.absolute),
    });
    this.setState({
      FROM_VALUE: parseResult.value,
    });
    this.setState({
      FROM_INPUT_VALUE: value,
    });
  }
  private handleToValueChange(e: any) {
    const value = e.target.value;
    const parseResult = makeValueAbsPropFromString(value);
    this.setState({
      TO_ABSOLUTE: makeStringFromBoolean(parseResult.absolute),
    });
    this.setState({
      TO_VALUE: parseResult.value,
    });
    this.setState({
      TO_INPUT_VALUE: value,
    });
  }
  private handleCategoryChange(e: any) {
    const value = e.target.value;
    this.setState({
      CATEGORY: value,
    });
  }
  private handleRecurrenceChange(e: any) {
    const value = e.target.value;
    this.setState({
      RECURRENCE: value,
    });
  }
  private setDate(value: string): void {
    this.setState({ DATE: value });
  }
  private handleDateChange(e: any): void {
    const value = e.target.value;
    this.setDate(value);
  }
  private setStopDate(value: string): void {
    this.setState({ STOP_DATE: value });
  }
  private handleStopDateChange(e: any): void {
    const value = e.target.value;
    this.setStopDate(value);
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private add(e: any): void {
    e.preventDefault();

    let fromAbsolute = this.state.FROM_ABSOLUTE;
    let fromValue = this.state.FROM_VALUE;
    if (this.state.FROM === '') {
      if (fromAbsolute === '') {
        // log('setting fromAbsolute = True');
        fromAbsolute = 'True';
      }
      if (fromValue === '') {
        fromValue = '0';
      }
    }
    let toAbsolute = this.state.TO_ABSOLUTE;
    let toValue = this.state.TO_VALUE;
    if (this.state.TO === '') {
      if (toAbsolute === '') {
        toAbsolute = 'True';
      }
      if (toValue === '') {
        toValue = '0';
      }
    }
    if (fromAbsolute === '') {
      alert('From absolute should be T (absolute value) or F (relative value');
      return;
    }
    if (toAbsolute === '') {
      alert('To absolute should be T (absolute value) or F (relative value');
      return;
    }
    const type = custom;

    const transaction: DbTransaction = {
      NAME: this.state.NAME,
      CATEGORY: this.state.CATEGORY,
      FROM: this.state.FROM,
      FROM_ABSOLUTE: makeBooleanFromString(fromAbsolute),
      FROM_VALUE: fromValue,
      TO: this.state.TO,
      TO_ABSOLUTE: makeBooleanFromString(toAbsolute),
      TO_VALUE: toValue,
      DATE: this.state.DATE,
      STOP_DATE: this.state.STOP_DATE,
      RECURRENCE: this.state.RECURRENCE,
      TYPE: type,
    };
    // log('adding something ' + showObj(transaction));
    const message = this.props.checkFunction(transaction, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitFunction(transaction);
      alert('added new transaction');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    }
  }
  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      alert('deleted transaction');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
}
