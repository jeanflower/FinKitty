import React, { Component, FormEvent } from 'react';

import {
  ModelData,
  Transaction,
  Trigger,
  FormProps,
} from '../../types/interfaces';
import { log, printDebug, showObj } from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import { Input } from './Input';
import {
  custom,
  CASH_ASSET_NAME,
  liquidateAsset,
  conditional,
  adjustableType,
} from '../../localization/stringConstants';
import { doCheckBeforeOverwritingExistingData } from '../../App';
import {
  lessThan,
  makeValueAbsPropFromString,
  makeStringFromBoolean,
  makeBooleanFromYesNo,
  makeBooleanFromString,
} from '../../stringUtils';

interface EditTransactionFormState {
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
  LIQUIDATE_FOR_CASH: string;
}
interface EditTransactionProps extends FormProps {
  checkFunction: (transaction: Transaction, model: ModelData) => string;
  submitFunction: (transaction: Transaction, model: ModelData) => Promise<void>;
  deleteFunction: (name: string) => Promise<boolean>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
}
function assetOptions(model: ModelData, handleChange: any, id: string) {
  const optionData = model.assets
    .sort((a, b) => {
      return lessThan(a.NAME, b.NAME);
    })
    .map(asset => {
      return {
        text: asset.NAME,
        action: (e: FormEvent<Element>) => {
          // log(`detected action`);
          // e.persist();
          e.preventDefault();
          handleChange(asset.NAME);
        },
      };
    })
    .concat(
      model.settings
        .filter(setting => {
          return setting.TYPE === adjustableType;
        })
        .sort((a, b) => {
          return lessThan(a.NAME, b.NAME);
        })
        .map(setting => {
          return {
            text: setting.NAME,
            action: (e: FormEvent<Element>) => {
              // log(`detected action`);
              // e.persist();
              e.preventDefault();
              handleChange(setting.NAME);
            },
          };
        }),
    );
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
      <option>Choose an asset/setting</option>
      {options}
    </select>
  );
}

export class AddDeleteTransactionForm extends Component<
  EditTransactionProps,
  EditTransactionFormState
> {
  public defaultState: EditTransactionFormState;

  private transactionFromSelectID = 'fromAssetSelect';
  private transactionToSelectID = 'toAssetSelect';

  public constructor(props: EditTransactionProps) {
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
      LIQUIDATE_FOR_CASH: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.handleFromValueChange = this.handleFromValueChange.bind(this);
    this.handleToValueChange = this.handleToValueChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleRecurrenceChange = this.handleRecurrenceChange.bind(this);
    this.handleLiquidateForCashChange = this.handleLiquidateForCashChange.bind(
      this,
    );

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
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setDate}
            inputName="date"
            inputValue={this.state.DATE}
            onChangeHandler={this.handleDateChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
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
          <div className="col">
            <Input
              title="Liquidate asset to maintain cash-flow"
              type="text"
              name="liquidateForCash"
              value={this.state.LIQUIDATE_FOR_CASH}
              placeholder="Enter whether we only transact to keep cash afloat"
              onChange={this.handleLiquidateForCashChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which any recurrence stops (optional)"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setStopDate}
            inputName="stopDate"
            inputValue={this.state.STOP_DATE}
            onChangeHandler={this.handleStopDateChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
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
  private handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  private handleFromValueChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  private handleToValueChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  private handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({
      CATEGORY: value,
    });
  }
  private handleRecurrenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({
      RECURRENCE: value,
    });
  }
  private handleLiquidateForCashChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({
      LIQUIDATE_FOR_CASH: value,
    });
  }
  private setDate(value: string): void {
    this.setState({ DATE: value });
  }
  private handleDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setDate(value);
  }
  private setStopDate(value: string): void {
    this.setState({ STOP_DATE: value });
  }
  private handleStopDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setStopDate(value);
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private async add(e: FormEvent<Element>): Promise<void> {
    e.preventDefault();

    if (this.state.NAME === '') {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.transactions.find(a => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        this.props.showAlert(
          `There's already a transaction called ${this.state.NAME}`,
        );
        return;
      }
    }

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
      this.props.showAlert(
        'From absolute should be T (absolute value) or F (relative value',
      );
      return;
    }
    if (toAbsolute === '') {
      this.props.showAlert(
        'To absolute should be T (absolute value) or F (relative value',
      );
      return;
    }
    const parsedLiquidateYN = makeBooleanFromYesNo(
      this.state.LIQUIDATE_FOR_CASH,
    );
    if (!parsedLiquidateYN.checksOK) {
      this.props.showAlert(
        "Whether we're keeping cash afloat should be 'y' or 'n'",
      );
      return;
    }
    if (parsedLiquidateYN.value && this.state.TO !== CASH_ASSET_NAME) {
      this.props.showAlert(
        "If we're liquidating assets to keep cash afloat, the TO asset should be CASH",
      );
      return;
    }

    let type = custom;
    let transactionName = this.state.NAME;
    if (parsedLiquidateYN.value) {
      type = liquidateAsset;
      transactionName = `${conditional}${this.state.NAME}`;
    }

    const transaction: Transaction = {
      NAME: transactionName,
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
      this.props.showAlert(message);
    } else {
      await this.props.submitFunction(transaction, this.props.model);
      this.props.showAlert('added new transaction');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      this.props.showAlert('deleted transaction');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
}
