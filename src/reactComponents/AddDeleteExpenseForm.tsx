import React, { Component } from 'react';

import { DbExpense, DbModelData } from '../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
  makeGrowthFromString,
} from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface EditFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWTH: string;
  CPI_IMMUNE: string;
  CATEGORY: string;
}
interface EditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: DbModelData;
}
export class AddDeleteExpenseForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  private valueSetSelectID = 'valueSetSelect';
  private expenseStartSelectID = 'expenseStartSelect';
  private expenseEndSelectID = 'expenseEndSelect';

  public constructor(props: EditProps) {
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
      CPI_IMMUNE: '',
      CATEGORY: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleFixedChange = this.handleFixedChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);

    this.handleValueSetChange = this.handleValueSetChange.bind(this);
    this.setValueSet = this.setValueSet.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.setEnd = this.setEnd.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteExpenseForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title="Expense name:"
              type="text"
              name="name"
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
              title={'Delete any expense with this name'}
              id="deleteExpense"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Expense value (amount per month):"
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
            introLabel="Date on which the expense value is set:"
            setDateFunction={this.setValueSet}
            selectID={this.valueSetSelectID}
            inputName="expense valuation date"
            inputValue={this.state.VALUE_SET}
            onChangeHandler={this.handleValueSetChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          <DateSelectionRow
            introLabel="Date on which the expense starts:"
            setDateFunction={this.setStart}
            selectID="expenseStartSelect"
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          <DateSelectionRow
            introLabel="Date on which the expense ends:"
            setDateFunction={this.setEnd}
            selectID="expenseEndSelect"
            inputName="end date"
            inputValue={this.state.END}
            onChangeHandler={this.handleEndChange}
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
              title="Is value immune to inflation?:"
              type="text"
              name="cpi-immune"
              value={this.state.CPI_IMMUNE}
              placeholder="Enter Y/N"
              onChange={this.handleFixedChange}
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
        </div>
        {/* end row */}
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new expense (over-writes any existing with the same name)'
          }
          id="addExpense"
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
  private handleFixedChange(e: any) {
    const value = e.target.value;
    if (value === '') {
      this.setState({ CPI_IMMUNE: '' });
      return;
    }
    const parsedYN = makeBooleanFromYesNo(value);
    if (parsedYN.checksOK) {
      this.setState({ CPI_IMMUNE: value });
    } else {
      alert(`Couldn't understand ${value} as a Yes/No value`);
    }
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private setValueSet(value: string): void {
    this.setState({
      VALUE_SET: value,
    });
  }
  private handleValueSetChange(e: any): void {
    const value = e.target.value;
    this.setValueSet(value);
    this.resetValueSetSelect();
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
    this.resetStartSelect();
  }
  private setEnd(value: string): void {
    this.setState({ END: value });
  }
  private handleEndChange(e: any): void {
    const value = e.target.value;
    this.setEnd(value);
    this.resetEndSelect();
  }
  private resetValueSetSelect() {
    const selector: any = document.getElementById(this.valueSetSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private resetStartSelect() {
    const selector: any = document.getElementById(this.expenseStartSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private resetEndSelect() {
    const selector: any = document.getElementById(this.expenseEndSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private add(e: any): void {
    e.preventDefault();

    let isNotANumber = Number.isNaN(parseFloat(this.state.VALUE));
    if (isNotANumber) {
      alert(`Expense value ${this.state.VALUE} should be a numerical value`);
      return;
    }
    let date = checkTriggerDate(this.state.START, this.props.model.triggers);
    let isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.END, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      alert(`End date '${this.state.END}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.VALUE_SET, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Value set date should be a date`);
      return;
    }
    const parsedGrowth = makeGrowthFromString(this.state.GROWTH, this.props.model.settings);
    if(!parsedGrowth.checksOK){
      alert(`Growth value '${this.state.GROWTH}' should be a numerical value`);
      return;
    }
    const parsedYN = makeBooleanFromYesNo(this.state.CPI_IMMUNE);
    if (!parsedYN.checksOK) {
      alert(`Fixed '${this.state.CPI_IMMUNE}' should be a Y/N value`);
      return;
    }

    // log('adding something ' + showObj(this));
    const expense: DbExpense = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: parsedYN.value,
      CATEGORY: this.state.CATEGORY,
    };
    const message = this.props.checkFunction(expense, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitFunction(expense);
      alert('added new expense');
      // clear fields
      this.setState(this.defaultState);
      this.resetValueSetSelect();
      this.resetStartSelect();
      this.resetEndSelect();
    }
  }
  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      alert('deleted expense');
      // clear fields
      this.setState(this.defaultState);
      this.resetValueSetSelect();
      this.resetStartSelect();
      this.resetEndSelect();
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
}
