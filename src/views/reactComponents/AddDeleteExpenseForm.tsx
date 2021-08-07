import React, { Component, FormEvent } from 'react';

import {
  Expense,
  ModelData,
  Transaction,
  Trigger,
  FormProps,
} from '../../types/interfaces';
import { log, printDebug, showObj } from '../../utils';
import { makeButton } from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import { Input } from './Input';
import { isNumberString } from '../../models/checks';
import { revalue, revalueExp } from '../../localization/stringConstants';
import { doCheckBeforeOverwritingExistingData } from '../../App';
import { isATransaction } from '../../models/modelUtils';
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  makeGrowthFromString,
  makeBooleanFromYesNo,
} from '../../stringUtils';

interface EditExpenseFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWTH: string;
  GROWS_WITH_CPI: string;
  CATEGORY: string;
  RECURRENCE: string;
  inputting: string;
}

const inputtingRevalue = 'revalue';
const inputtingExpense = 'expense';

interface EditExpenseProps extends FormProps {
  checkFunction: (e: Expense, model: ModelData) => string;
  submitFunction: (expenseInput: Expense, modelData: ModelData) => Promise<any>;
  deleteFunction: (name: string) => Promise<boolean>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
    modelData: ModelData,
  ) => Promise<void>;
}
export class AddDeleteExpenseForm extends Component<
  EditExpenseProps,
  EditExpenseFormState
> {
  public defaultState: EditExpenseFormState;

  public constructor(props: EditExpenseProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteExpenseForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      VALUE_SET: '',
      START: '',
      END: '',
      GROWTH: '',
      GROWS_WITH_CPI: '',
      CATEGORY: '',
      RECURRENCE: '',
      inputting: inputtingExpense,
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleGrowsWithCPIChange = this.handleGrowsWithCPIChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleRecurrenceChange = this.handleRecurrenceChange.bind(this);
    this.setInputRevalue = this.setInputRevalue.bind(this);
    this.setInputExpense = this.setInputExpense.bind(this);
    this.twoExtraDates = this.twoExtraDates.bind(this);
    this.newExpenseForm = this.newExpenseForm.bind(this);
    this.revalue = this.revalue.bind(this);

    this.handleValueSetChange = this.handleValueSetChange.bind(this);
    this.setValueSet = this.setValueSet.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.setEnd = this.setEnd.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  private newExpenseForm(): React.ReactNode {
    if (this.state.inputting !== inputtingExpense) {
      return;
    }
    return (
      <>
        <div className="row">
          <div className="col">
            <Input
              title="Annual growth percentage (excluding inflation, e.g. 2 for 2% p.a.)"
              type="text"
              name="expensegrowth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={this.handleGrowthChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="expensecpi-grows"
              value={this.state.GROWS_WITH_CPI}
              placeholder="Enter Y/N"
              onChange={this.handleGrowsWithCPIChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Recurrence"
              type="text"
              name="expenserecurrence"
              value={this.state.RECURRENCE}
              placeholder="recurrence"
              onChange={this.handleRecurrenceChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Category (optional)"
              type="text"
              name="expensecategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
      </>
    );
  }

  private twoExtraDates(): React.ReactNode {
    if (this.state.inputting !== inputtingExpense) {
      return;
    }
    return (
      <>
        <DateSelectionRow
          introLabel="Date on which the expense starts"
          model={this.props.model}
          showAlert={this.props.showAlert}
          setDateFunction={this.setStart}
          inputName="start date"
          inputValue={this.state.START}
          onChangeHandler={this.handleStartChange}
          triggers={this.props.model.triggers}
          submitTriggerFunction={this.props.submitTriggerFunction}
        />
        <DateSelectionRow
          introLabel="Date on which the expense ends"
          model={this.props.model}
          showAlert={this.props.showAlert}
          setDateFunction={this.setEnd}
          inputName="end date"
          inputValue={this.state.END}
          onChangeHandler={this.handleEndChange}
          triggers={this.props.model.triggers}
          submitTriggerFunction={this.props.submitTriggerFunction}
        />
      </>
    );
  }

  private goButton(): React.ReactNode {
    if (this.state.inputting === inputtingExpense) {
      return makeButton(
        'Create new expense (over-writes any existing with the same name)',
        this.add,
        'addExpense',
        'addExpense',
        'primary',
      );
    } else {
      return makeButton(
        'Revalue an expense',
        this.revalue,
        'revalueExpense',
        'revalueExpense',
        'primary',
      );
    }
  }

  public render() {
    // log('rendering an AddDeleteExpenseForm');
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            'Add new expense mode',
            this.setInputExpense,
            'useExpenseInputs',
            'useExpenseInputs',
            this.state.inputting === inputtingExpense ? 'primary' : 'secondary',
          )}
          {makeButton(
            'Revalue expense mode',
            this.setInputRevalue,
            'useRevalueInputsExpense',
            'useRevalueInputsExpense',
            this.state.inputting === inputtingRevalue ? 'primary' : 'secondary',
          )}
        </div>
        <form className="container-fluid" onSubmit={this.add}>
          <div className="row">
            <div className="col">
              <Input
                title="Expense name"
                type="text"
                name="expensename"
                value={this.state.NAME}
                placeholder="Enter name"
                onChange={this.handleNameChange}
              />
            </div>
            {/* end col */}
            <div className="col">
              <Input
                title="Expense value"
                type="text"
                name="expensevalue"
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
              introLabel="Date on which the expense value is set"
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={this.setValueSet}
              inputName="expense valuation date"
              inputValue={this.state.VALUE_SET}
              onChangeHandler={this.handleValueSetChange}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
            {this.twoExtraDates()}
          </div>
          {this.newExpenseForm()}
          {this.goButton()}
        </form>
      </>
    );
  }

  private handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleGrowthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ GROWTH: value });
  }
  private handleRecurrenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ RECURRENCE: value });
  }
  private handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handleGrowsWithCPIChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ GROWS_WITH_CPI: value });
  }
  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private setInputRevalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
  private setInputExpense(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingExpense,
    });
  }

  private setValueSet(value: string): void {
    this.setState({
      VALUE_SET: value,
    });
  }
  private handleValueSetChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setValueSet(value);
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setStart(value);
  }
  private setEnd(value: string): void {
    this.setState({ END: value });
  }
  private handleEndChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setEnd(value);
  }
  private async revalue(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();

    const parseVal = makeValueAbsPropFromString(this.state.VALUE);
    if (!parseVal.checksOK) {
      this.props.showAlert(
        `Expense value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }

    const date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue} ${this.state.NAME} ${count}`, this.props.model)
    ) {
      count += 1;
    }

    const revalueExpenseTransaction: Transaction = {
      NAME: `${revalue} ${this.state.NAME} ${count}`,
      FROM: '',
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.0',
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.VALUE_SET, // match the income start date
      TYPE: revalueExp,
      RECURRENCE: '',
      STOP_DATE: '',
      CATEGORY: '',
    };
    const message = await this.props.checkTransactionFunction(
      revalueExpenseTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueExpenseTransaction,
      this.props.model,
    );

    this.props.showAlert('added new data');
    // clear fields
    this.setState(this.defaultState);
    return;
  }
  private async add(e: FormEvent<Element>): Promise<void> {
    e.preventDefault();

    if (this.state.NAME === '') {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.expenses.find(a => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        this.props.showAlert(
          `There's already an expense called ${this.state.NAME}`,
        );
        return;
      }
    }

    const isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      this.props.showAlert(
        `Expense value ${this.state.VALUE} should be a numerical value`,
      );
      return;
    }
    let date = checkTriggerDate(this.state.START, this.props.model.triggers);
    let isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.END, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`End date '${this.state.END}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.VALUE_SET, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }
    const parsedGrowth = makeGrowthFromString(
      this.state.GROWTH,
      this.props.model.settings,
    );
    if (!parsedGrowth.checksOK) {
      this.props.showAlert(
        `Growth value '${this.state.GROWTH}' should be a numerical value`,
      );
      return;
    }
    const parsedYN = makeBooleanFromYesNo(this.state.GROWS_WITH_CPI);
    if (!parsedYN.checksOK) {
      this.props.showAlert(
        `Grows with inflation '${this.state.GROWS_WITH_CPI}' should be a Y/N value`,
      );
      return;
    }

    // log('adding something ' + showObj(this));
    const expense: Expense = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: !parsedYN.value,
      CATEGORY: this.state.CATEGORY,
      RECURRENCE: this.state.RECURRENCE,
    };
    const message = this.props.checkFunction(expense, this.props.model);
    if (message.length > 0) {
      this.props.showAlert(message);
    } else {
      await this.props.submitFunction(expense, this.props.model);
      this.props.showAlert('added new expense');
      // clear fields
      this.setState(this.defaultState);
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      this.props.showAlert('deleted expense');
      // clear fields
      this.setState(this.defaultState);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
}
