import React, { Component, FormEvent } from "react";
import { Col, Row } from "react-bootstrap";

import {
  Expense,
  ModelData,
  Transaction,
  Trigger,
  FormProps,
  DeleteResult,
} from "../../types/interfaces";
import { log, printDebug, showObj } from "../../utils/utils";
import { makeButton } from "./Button";
import { DateSelectionRow, itemOptions } from "./DateSelectionRow";
import { Input } from "./Input";
import { revalueExp } from "../../localization/stringConstants";

import { makeRevalueName } from "../../models/modelUtils";
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  makeBooleanFromYesNo,
  lessThan,
} from "../../utils/stringUtils";
import Spacer from "react-spacer";
import { getVarVal, isNumberString } from "../../models/modelQueries";

interface EditExpenseFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWS_WITH_CPI: string;
  CATEGORY: string;
  RECURRENCE: string;
  inputting: string;
}

const inputtingRevalue = "revalue";
const inputtingExpense = "expense";

interface EditExpenseProps extends FormProps {
  checkFunction: (e: Expense, model: ModelData) => string;
  submitFunction: (expenseInput: Expense, modelData: ModelData) => Promise<any>;
  deleteFunction: (name: string) => Promise<DeleteResult>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
    modelData: ModelData,
  ) => Promise<void>;
  doCheckBeforeOverwritingExistingData: () => boolean;
}
export class AddDeleteExpenseForm extends Component<
  EditExpenseProps,
  EditExpenseFormState
> {
  public defaultState: EditExpenseFormState;

  public constructor(props: EditExpenseProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`props for AddDeleteExpenseForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: "",
      VALUE: "",
      VALUE_SET: "",
      START: "",
      END: "",
      GROWS_WITH_CPI: "",
      CATEGORY: "",
      RECURRENCE: "",
      inputting: inputtingExpense,
    };

    this.state = this.defaultState;

    this.setInputRevalue = this.setInputRevalue.bind(this);
    this.setInputExpense = this.setInputExpense.bind(this);
    this.twoExtraDates = this.twoExtraDates.bind(this);
    this.newExpenseForm = this.newExpenseForm.bind(this);
    this.revalue = this.revalue.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  private newExpenseForm(): React.ReactNode {
    if (this.state.inputting !== inputtingExpense) {
      return;
    }
    return (
      <>
        <Row>
          <Col>
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="expensecpi-grows"
              value={this.state.GROWS_WITH_CPI}
              placeholder="Enter Y/N"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ GROWS_WITH_CPI: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
        <Row>
          <Col>
            <Input
              title="Recurrence (e.g. 1m or 2y)"
              type="text"
              name="expenserecurrence"
              value={this.state.RECURRENCE}
              placeholder="recurrence"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ RECURRENCE: e.target.value });
              }}
            />
          </Col>{" "}
          <Col>
            <Input
              title="Category (optional, e.g. Basic or Leisure)"
              type="text"
              name="expensecategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ CATEGORY: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
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
          setDateFunction={(value) => {
            this.setState({ START: value });
          }}
          inputName="start date"
          inputValue={this.state.START}
          onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
            this.setState({ START: e.target.value });
          }}
          triggers={this.props.model.triggers}
          submitTriggerFunction={this.props.submitTriggerFunction}
        />
        <DateSelectionRow
          introLabel="Date on which the expense ends"
          model={this.props.model}
          showAlert={this.props.showAlert}
          setDateFunction={(value) => {
            this.setState({ END: value });
          }}
          inputName="end date"
          inputValue={this.state.END}
          onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
            this.setState({ END: e.target.value });
          }}
          triggers={this.props.model.triggers}
          submitTriggerFunction={this.props.submitTriggerFunction}
        />
      </>
    );
  }

  private goButton(): React.ReactNode {
    if (this.state.inputting === inputtingExpense) {
      return makeButton(
        "Create new expense (over-writes any existing with the same name)",
        this.add,
        "addExpense",
        "addExpense",
        "primary",
      );
    } else {
      return makeButton(
        "Revalue an expense",
        this.revalue,
        "revalueExpense",
        "revalueExpense",
        "primary",
      );
    }
  }

  public render() {
    // log('rendering an AddDeleteExpenseForm');
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            "Add new expense mode",
            this.setInputExpense,
            "useExpenseInputs",
            "useExpenseInputs",
            this.state.inputting === inputtingExpense
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Revalue expense mode",
            this.setInputRevalue,
            "useRevalueInputsExpense",
            "useRevalueInputsExpense",
            this.state.inputting === inputtingRevalue
              ? "primary"
              : "outline-secondary",
          )}
        </div>
        <form className="container-fluid" onSubmit={this.add}>
          <Row>
            <Col>{this.inputExpenseName()}</Col>
            <Col>
              <Input
                title="Expense value"
                type="text"
                name="expensevalue"
                value={this.state.VALUE}
                placeholder="Enter value"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({ VALUE: e.target.value });
                }}
              />
            </Col>{" "}
          </Row>
          <div className="container-fluid">
            {/* fills width */}
            <DateSelectionRow
              introLabel="Date on which the expense value is set"
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={(value) => {
                this.setState({
                    VALUE_SET: value,
                });}
              }
              inputName="expense valuation date"
              inputValue={this.state.VALUE_SET}
              onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
                this.setState({
                  VALUE_SET: e.target.value,
                });
              }}
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
  private inputExpenseName(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <>
          Expense name
          <Spacer height={10} />
          {itemOptions(
            this.props.model.expenses.sort((a: Expense, b: Expense) => {
              return lessThan(a.NAME, b.NAME);
            }),
            this.props.model,
            (name: string) => {
              this.setState({ NAME: name });
            },
            "expensename",
            "Select expense",
          )}
        </>
      );
    } else {
      return (
        <Input
          title="Expense name"
          type="text"
          name="expensename"
          value={this.state.NAME}
          placeholder="Enter name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ NAME: e.target.value });
          }}
        />
      );
    }
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
  private async revalue(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();

    log("in function revalue");
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
      getVarVal(this.props.model.settings),
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }

    const newName = makeRevalueName(this.state.NAME, this.props.model);

    const revalueExpenseTransaction: Transaction = {
      NAME: `${newName}`,
      ERA: 0, // new things are automatically current,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0.0",
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.VALUE_SET, // match the income start date
      TYPE: revalueExp,
      RECURRENCE: "",
      STOP_DATE: "",
      CATEGORY: "",
    };
    log(`revalueExpenseTransaction = ${showObj(revalueExpenseTransaction)}`);
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

    this.props.showAlert("added new data");
    // clear fields
    this.setState(this.defaultState);
    return;
  }
  private async add(e: FormEvent<Element>): Promise<void> {
    e.preventDefault();

    if (this.state.NAME === "") {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (this.props.doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.expenses.find((a) => {
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
    let date = checkTriggerDate(
      this.state.START,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
    );
    let isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    date = checkTriggerDate(
      this.state.END,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
    );
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`End date '${this.state.END}' should be a date`);
      return;
    }
    date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
    );
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }
    const parsedYN = makeBooleanFromYesNo(this.state.GROWS_WITH_CPI);
    if (!parsedYN.checksOK) {
      this.props.showAlert(
        `Grows with inflation '${this.state.GROWS_WITH_CPI}' ` +
          `should be a Y/N value`,
      );
      return;
    }

    // log('adding something ' + showObj(this));
    const expense: Expense = {
      NAME: this.state.NAME,
      ERA: 0, // new things are automatically current,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      CPI_IMMUNE: !parsedYN.value,
      CATEGORY: this.state.CATEGORY,
      RECURRENCE: this.state.RECURRENCE,
    };
    const message = this.props.checkFunction(expense, this.props.model);
    if (message.length > 0) {
      this.props.showAlert(message);
    } else {
      await this.props.submitFunction(expense, this.props.model);
      this.props.showAlert("added new expense");
      // clear fields
      this.setState(this.defaultState);
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    const deleteResult = await this.props.deleteFunction(this.state.NAME);
    if (deleteResult.message === "") {
      if (deleteResult.itemsDeleted.length === 1) {
        this.props.showAlert("deleted expense");
      } else {
        this.props.showAlert(`deleted ${deleteResult.itemsDeleted}`);
      }
      // clear fields
      this.setState(this.defaultState);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
}
