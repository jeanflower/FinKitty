import React, { Component } from 'react';

import { IDbModelData, IDbTransaction } from '../types/interfaces';
import {
  log,
  makeBooleanFromString,
  makeStringFromBoolean,
  printDebug,
  showObj,
} from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import { taxPot } from '../stringConstants';

interface IEditFormState {
  NAME: string;
  CATEGORY: string;
  TRANSACTION_FROM: string;
  TRANSACTION_FROM_ABSOLUTE: string;
  TRANSACTION_FROM_VALUE: string;
  TRANSACTION_FROM_INPUT_VALUE: string;
  TRANSACTION_TO: string;
  TRANSACTION_TO_ABSOLUTE: string;
  TRANSACTION_TO_VALUE: string;
  TRANSACTION_TO_INPUT_VALUE: string;
  TRANSACTION_DATE: string;
  TRANSACTION_STOP_DATE: string; // for regular transactions
  TRANSACTION_RECURRENCE: string;
}
interface IEditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: IDbModelData;
}
function assetOptions(
  model: IDbModelData,
  selectId: string,
  handleChange: any,
) {
  let optionData = model.assets.map((asset) => {
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
  optionData = optionData.filter((od) =>
    od.text !== taxPot,
  );
  const options = optionData.map((bd) =>
    <option
      value={bd.text}
      id={`option-asset-${bd.text}`}
      key={bd.text}
      className="text-muted"
    >
      {bd.text}
    </option>,
  );
  return (
    <select
      className="custom-select"
      id={selectId}
      onChange={(e) => {
        const found = optionData.find((od) => {
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

export class AddDeleteTransactionForm extends Component<IEditProps, IEditFormState> {
  public defaultState: IEditFormState;

  private transactionDateSelectID = 'transactionDateSelect';
  private transactionStopDateSelectID = 'transactionStopDateSelect';

  constructor(props: IEditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteTransactionForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      CATEGORY: '',
      TRANSACTION_FROM: '',
      TRANSACTION_FROM_ABSOLUTE: '',
      TRANSACTION_FROM_VALUE: '',
      TRANSACTION_FROM_INPUT_VALUE: '',
      TRANSACTION_TO: '',
      TRANSACTION_TO_ABSOLUTE: '',
      TRANSACTION_TO_VALUE: '',
      TRANSACTION_TO_INPUT_VALUE: '',
      TRANSACTION_DATE: '',
      TRANSACTION_STOP_DATE: '',
      TRANSACTION_RECURRENCE: '',
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
      <form
        className="container-fluid"
        onSubmit={this.add}
      >
      <div className="row">
        <div className="col">
          <Input
            title="Transaction name:"
            inputtype="text"
            name="name"
            value={this.state.NAME}
            placeholder="Enter name"
            handlechange={this.handleNameChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}

      <div className="container-fluid">
        {/* fills width */}
        <DateSelectionRow
          introLabel="Date on which the transaction occurs:"
          setDateFunction={this.setDate}
          selectID="transactionDateSelect"
          inputName="date"
          inputValue={this.state.TRANSACTION_DATE}
          onChangeHandler={this.handleDateChange}
          triggers={this.props.model.triggers}
          submitTrigger={this.props.submitTrigger}
        />
      </div>
      <div className="row">
        <div className="col">
          <label>
            Transact from asset (optional):
          </label>
        </div> {/* end col */}
        <div className="col">
          <label>
            Transact to asset (optional):
          </label>
        </div> {/* end col */}
      </div>{/* end row */}
      <div className="row">
        <div className="col">
          {assetOptions(
            this.props.model,
            'fromAssetSelect',
            this.handleFromChange,
          )}
        </div> {/* end col */}
        <div className="col">
          {assetOptions(
            this.props.model,
            'toAssetSelect',
            this.handleToChange,
          )}
        </div> {/* end col */}
      </div>{/* end row */}
      <div className="row">
        <div className="col">
          <Input
            title="How much to take (can be % of asset value):"
            inputtype="text"
            name="fromValue"
            value={this.state.TRANSACTION_FROM_INPUT_VALUE}
            placeholder="Enter from value"
            handlechange={this.handleFromValueChange}
          />
        </div> {/* end col */}
        <div className="col">
          <Input
            title="How much to add (can be % of transaction amount):"
            inputtype="text"
            name="toValue"
            value={this.state.TRANSACTION_TO_INPUT_VALUE}
            placeholder="Enter to value"
            handlechange={this.handleToValueChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}
      <div className="row">
        <div className="col">
          <Input
            title="Transaction recurrence, e.g. 6m, 2y (optional):"
            inputtype="text"
            name="recurrence"
            value={this.state.TRANSACTION_RECURRENCE}
            placeholder="Enter recurrence"
            handlechange={this.handleRecurrenceChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}
      <div className="container-fluid">
        {/* fills width */}
        <DateSelectionRow
          introLabel="Date on which any recurrence stops:"
          setDateFunction={this.setStopDate}
          selectID="transactionStopDateSelect"
          inputName="stopDate"
          inputValue={this.state.TRANSACTION_STOP_DATE}
          onChangeHandler={this.handleStopDateChange}
          triggers={this.props.model.triggers}
          submitTrigger={this.props.submitTrigger}
        />
      </div>{/* end row */}
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
        </div> {/* end col */}
      </div>{/* end row */}
      <Button
        action={this.add}
        type={'primary'}
        title={'Create new transaction (over-writes any existing with the same name)'}
        id="addTransaction"
      />
      <Button
        action={this.delete}
        type={'secondary'}
        title={'Delete any transaction with this name'}
        id="deleteTransaction"
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
      TRANSACTION_FROM: value,
    });
  }
  private handleToChange(value: string) {
    this.setState({
      TRANSACTION_TO: value,
    });
  }
  private parseValue(input: string) {
    const result = {
      absolute: true,
      value: input,
    };
    if (input.length === 0) {
      return result;
    }
    if (input[input.length - 1] === '%') {
      const numberPart = input.substring(0, input.length - 1);
      const num = parseFloat(numberPart);
      if (num !== undefined && !Number.isNaN(num)) {
        result.absolute = false;
        result.value = `${num / 100.0}`;
      }
    }
    return result;
  }
  private handleFromValueChange(e: any) {
    const value = e.target.value;
    const parseResult = this.parseValue(value);
    this.setState({
      TRANSACTION_FROM_ABSOLUTE:
        makeStringFromBoolean(parseResult.absolute),
    });
    this.setState({
      TRANSACTION_FROM_VALUE: parseResult.value,
    });
    this.setState({
      TRANSACTION_FROM_INPUT_VALUE: value,
    });
  }
  private handleToValueChange(e: any) {
    const value = e.target.value;
    const parseResult = this.parseValue(value);
    this.setState({
      TRANSACTION_TO_ABSOLUTE:
        makeStringFromBoolean(parseResult.absolute),
    });
    this.setState({
      TRANSACTION_TO_VALUE: parseResult.value,
    });
    this.setState({
      TRANSACTION_TO_INPUT_VALUE: value,
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
      TRANSACTION_RECURRENCE: value,
    });
  }
  private setDate(value: string): void {
    this.setState({TRANSACTION_DATE: value});
  }
  private handleDateChange(e: any): void {
    const value = e.target.value;
    this.setDate(value);
    this.resetDateSelect();
  }
  private setStopDate(value: string): void {
    this.setState({TRANSACTION_STOP_DATE: value});
  }
  private handleStopDateChange(e: any): void {
    const value = e.target.value;
    this.setStopDate(value);
    this.resetStopDateSelect();
  }
  private resetDateSelect() {
    const selector: any = document.getElementById(this.transactionDateSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private resetStopDateSelect() {
    const selector: any = document.getElementById(this.transactionStopDateSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private add(e: any): void {
    e.preventDefault();

    let fromAbsolute = this.state.TRANSACTION_FROM_ABSOLUTE;
    let fromValue = this.state.TRANSACTION_FROM_VALUE;
    if (this.state.TRANSACTION_FROM === '') {
      if (fromAbsolute === '') {
        log('setting fromAbsolute = True');
        fromAbsolute = 'True';
      }
      if (fromValue === '') {
        fromValue = '0';
      }
    }
    let toAbsolute = this.state.TRANSACTION_TO_ABSOLUTE;
    let toValue = this.state.TRANSACTION_TO_VALUE;
    if (this.state.TRANSACTION_TO === '') {
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
    const transaction: IDbTransaction = {
      NAME: this.state.NAME,
      CATEGORY: this.state.CATEGORY,
      TRANSACTION_FROM: this.state.TRANSACTION_FROM,
      TRANSACTION_FROM_ABSOLUTE:
        makeBooleanFromString(fromAbsolute),
      TRANSACTION_FROM_VALUE: fromValue,
      TRANSACTION_TO: this.state.TRANSACTION_TO,
      TRANSACTION_TO_ABSOLUTE:
        makeBooleanFromString(toAbsolute),
      TRANSACTION_TO_VALUE: toValue,
      TRANSACTION_DATE: this.state.TRANSACTION_DATE,
      TRANSACTION_STOP_DATE: this.state.TRANSACTION_STOP_DATE,
      TRANSACTION_RECURRENCE: this.state.TRANSACTION_RECURRENCE,
    };
    // log('adding something ' + showObj(transaction));
    const message = this.props.checkFunction(transaction, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitFunction( transaction );
      alert('added new transaction');
      // clear fields
      this.setState(this.defaultState);
      this.resetDateSelect();
    }
  }
  private delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    this.props.deleteFunction(this.state.NAME);
  }
}
