import React, { Component, FormEvent } from "react";
import { Col, Row } from "react-bootstrap";

import {
  ModelData,
  Transaction,
  Trigger,
  FormProps,
  Item,
  DeleteResult,
} from "../../types/interfaces";
import { log, printDebug, showObj } from "../../utils/utils";
import { makeButton } from "./Button";
import { itemOptions, DateSelectionRow } from "./DateSelectionRow";
import { Input } from "./Input";
import {
  custom,
  CASH_ASSET_NAME,
  liquidateAsset,
  conditional,
  adjustableType,
} from "../../localization/stringConstants";

import {
  lessThan,
  makeValueAbsPropFromString,
  makeStringFromBoolean,
  makeBooleanFromYesNo,
  makeBooleanFromString,
} from "../../utils/stringUtils";

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
  submitFunction: (transaction: Transaction) => Promise<void>;
  deleteFunction: (name: string) => Promise<DeleteResult>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  doCheckBeforeOverwritingExistingData: () => boolean;
}

export class AddDeleteTransactionForm extends Component<
  EditTransactionProps,
  EditTransactionFormState
> {
  public defaultState: EditTransactionFormState;

  private transactionFromSelectID = "fromAssetSelect";
  private transactionToSelectID = "toAssetSelect";

  public constructor(props: EditTransactionProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`props for AddDeleteTransactionForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: "",
      CATEGORY: "",
      FROM: "",
      FROM_ABSOLUTE: "F",
      FROM_VALUE: "",
      FROM_INPUT_VALUE: "",
      TO: "",
      TO_ABSOLUTE: "F",
      TO_VALUE: "",
      TO_INPUT_VALUE: "",
      DATE: "",
      STOP_DATE: "",
      RECURRENCE: "",
      LIQUIDATE_FOR_CASH: "No",
    };

    this.state = this.defaultState;

    this.handleFromValueChange = this.handleFromValueChange.bind(this);
    this.handleToValueChange = this.handleToValueChange.bind(this);

    this.setDate = this.setDate.bind(this);
    this.setStopDate = this.setStopDate.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteTransactionForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <Row>
          <Col>
            <Input
              title="Transaction name"
              type="text"
              name="transactionname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ NAME: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the transaction occurs"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setDate}
            inputName="date"
            inputValue={this.state.DATE}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
              this.setDate(e.target.value);
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        <Row>
          <Col>
            <label>Source asset (optional):</label>
          </Col>{" "}
          <Col>
            <label>Target asset (optional):</label>
          </Col>{" "}
          {/* end col */}
        </Row>
        {/* end row */}
        <Row>
          <Col>
            {itemOptions(
              (this.props.model.assets as Item[])
                .sort((a, b) => {
                  if (a.NAME === CASH_ASSET_NAME && b.NAME !== CASH_ASSET_NAME) {
                    return -1;
                  }
                  if (a.NAME !== CASH_ASSET_NAME && b.NAME === CASH_ASSET_NAME) {
                    return 1;
                  }
                  return lessThan(a.NAME, b.NAME);
                })
                .concat(
                  this.props.model.settings
                    .filter((setting) => {
                      return (
                        setting.TYPE === adjustableType &&
                        !setting.NAME.startsWith("variable")
                      );
                    })
                    .sort((a, b) => {
                      return lessThan(a.NAME, b.NAME);
                    }),
                ),
              this.props.model,
              (value: string) => {
                // log(`from value changed to ${value}`);
                this.setState({ FROM: value });
              },
              this.transactionFromSelectID,
              "Choose an asset/setting",
            )}
          </Col>{" "}
          <Col>
            {itemOptions(
              (this.props.model.assets as Item[])
                .sort((a, b) => {
                  if (a.NAME === CASH_ASSET_NAME && b.NAME !== CASH_ASSET_NAME) {
                    return -1;
                  }
                  if (a.NAME !== CASH_ASSET_NAME && b.NAME === CASH_ASSET_NAME) {
                    return 1;
                  }
                  return lessThan(a.NAME, b.NAME);
                })
                .concat(
                  this.props.model.settings
                    .filter((setting) => {
                      return (
                        setting.TYPE === adjustableType &&
                        !setting.NAME.startsWith("variable")
                      );
                    })
                    .sort((a, b) => {
                      return lessThan(a.NAME, b.NAME);
                    }),
                ),
              this.props.model,
              (value: string) => {
                this.setState({ TO: value });
              },
              this.transactionToSelectID,
              "Choose an asset/setting",
            )}
          </Col>{" "}
        </Row>
        <Row>
          <Col>
            <Input
              title={
                "How much to reduce the source asset " +
                "(can be % of asset value)"
              }
              type="text"
              name="fromValue"
              value={this.state.FROM_INPUT_VALUE}
              placeholder="Enter value"
              onChange={this.handleFromValueChange}
            />
          </Col>{" "}
          <Col>
            <Input
              title={
                "How much to add to the target asset  " +
                "(can be % of transaction amount)"
              }
              type="text"
              name="toValue"
              value={this.state.TO_INPUT_VALUE}
              placeholder="Enter value"
              onChange={this.handleToValueChange}
            />
          </Col>{" "}
        </Row>
        <Row>
          <Col>
            <Input
              title="Transaction recurrence, e.g. 6m, 2y (optional)"
              type="text"
              name="recurrence"
              value={this.state.RECURRENCE}
              placeholder="Enter recurrence"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ RECURRENCE: e.target.value });
              }}
            />
          </Col>{" "}
          <Col>
            <Input
              title="Liquidate asset to maintain cash-flow"
              type="text"
              name="liquidateForCash"
              value={this.state.LIQUIDATE_FOR_CASH}
              placeholder="Enter whether we only transact to keep cash afloat"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ LIQUIDATE_FOR_CASH: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
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
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
              this.setStopDate(e.target.value);
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        <Row>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="transactioncategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ CATEGORY: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
        {makeButton(
          "Create new transaction " +
            "(over-writes any existing with the same name)",
          this.add,
          "addTransaction",
          "addTransaction",
          "primary",
        )}
      </form>
    );
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
  private setDate(value: string): void {
    this.setState({ DATE: value });
  }
  private setStopDate(value: string): void {
    this.setState({ STOP_DATE: value });
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = "0";
    }
  }
  private async add(e: FormEvent<Element>): Promise<void> {
    e.preventDefault();

    if (this.state.NAME === "") {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (this.props.doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.transactions.find((a) => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        this.props.showAlert(
          `There's already a transaction called ${this.state.NAME}`,
        );
        return;
      }
    }

    const fromAbsolute = this.state.FROM_ABSOLUTE;
    const fromValue = this.state.FROM_VALUE;
    const toAbsolute = this.state.TO_ABSOLUTE;
    const toValue = this.state.TO_VALUE;
    if (fromAbsolute === "") {
      this.props.showAlert(
        "From absolute should be T (absolute value) or F (relative value",
      );
      return;
    }
    if (toAbsolute === "") {
      this.props.showAlert(
        "To absolute should be T (absolute value) or F (relative value",
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
        "If we're liquidating assets to keep cash afloat, " +
          "the TO asset should be CASH",
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
      ERA: 0, // new things are automatically current,
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
      await this.props.submitFunction(transaction);
      this.props.showAlert("added new transaction");
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    const deleteResult = await this.props.deleteFunction(this.state.NAME);
    if (deleteResult.message === "") {
      if (deleteResult.itemsDeleted.length === 1) {
        this.props.showAlert("deleted transaction");
      } else {
        this.props.showAlert(`deleted ${deleteResult.itemsDeleted}`);
      }

      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.transactionFromSelectID);
      this.resetSelect(this.transactionToSelectID);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
}
