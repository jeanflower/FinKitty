import React, { Component, FormEvent } from "react";
import { Col, Row } from "react-bootstrap";

import {
  Asset,
  Transaction,
  Trigger,
  FormProps,
  DeleteResult,
} from "../../types/interfaces";
import { log, printDebug, showObj } from "../../utils/utils";
import { makeButton } from "./Button";
import { DateSelectionRow, itemOptions } from "./DateSelectionRow";
import { Input } from "./Input";
import {
  revalue,
  revalueDebt,
  payOffDebt,
  conditional,
  CASH_ASSET_NAME,
} from "../../localization/stringConstants";
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  lessThan,
} from "../../utils/stringUtils";
import Spacer from "react-spacer";
import {
  getVarVal,
  isATransaction,
  isNumberString,
} from "../../models/modelQueries";

interface EditDebtFormState {
  NAME: string;
  VALUE: string;
  START: string;
  GROWTH: string;
  CATEGORY: string;
  PAYMENT: string;
  inputting: string;
}
interface EditDebtProps extends FormProps {
  checkAssetFunction: (a: Asset) => string;
  submitAssetFunction: (arg0: Asset) => Promise<void>;
  deleteAssetFunction: (name: string) => Promise<DeleteResult>;
  checkTransactionFunction: (t: Transaction) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
  ) => Promise<void>;
  submitTriggerFunction: (
    triggerInput: Trigger,
  ) => Promise<void>;
  doCheckBeforeOverwritingExistingData: () => boolean;
}

const inputtingRevalue = "revalue";
const inputtingDebt = "debt";

export class AddDeleteDebtForm extends Component<
  EditDebtProps,
  EditDebtFormState
> {
  public defaultState: EditDebtFormState;

  public constructor(props: EditDebtProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`props for AddDeleteDebtForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: "",
      VALUE: "",
      START: "",
      GROWTH: "",
      CATEGORY: "",
      PAYMENT: "",
      inputting: inputtingDebt,
    };

    this.state = this.defaultState;

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);

    this.inputDebt = this.inputDebt.bind(this);
    this.inputRevalue = this.inputRevalue.bind(this);
    this.growthAndInflation = this.growthAndInflation.bind(this);
    this.revalue = this.revalue.bind(this);
  }

  private inputDebtName(): React.ReactNode {
    return (
      <>
        Debt name
        <Spacer height={10} />
        {itemOptions(
          this.props.model.assets
            .filter((a) => {
              return a.IS_A_DEBT;
            })
            .sort((a: Asset, b: Asset) => {
              return lessThan(a.NAME, b.NAME);
            }),
          this.props.model,
          (s: string)=>{
            this.setState({
              NAME: s,
            });
          },
          "debtname",
          "Select debt",
        )}
      </>
    );
  }

  private ValueAndCategory(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <Row>
          <Col>{this.inputDebtName()}</Col>
          <Col>
            <Input
              title={`Debt value`}
              type="text"
              name="debtvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  VALUE: e.target.value,
                })
              }}
            />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col>
            <Input
              title={"Debt name"}
              type="text"
              name="debtname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  NAME: e.target.value,
                })
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Debt value`}
              type="text"
              name="debtvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  VALUE: e.target.value,
                })
              }}            
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="debtcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  CATEGORY: e.target.value,
                })
              }}
            />
          </Col>
        </Row>
      );
    }
  }

  private growthAndInflation(): React.ReactNode {
    if (this.state.inputting !== inputtingRevalue) {
      return (
        <Row>
          <Col>
            <Input
              title={
                "Annual interest rate (excluding inflation, " +
                "e.g. 2 for 2% p.a.)"
              }
              type="text"
              name="debtgrowth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  GROWTH: e.target.value,
                })
              }}
            />
          </Col>
          <Col>
            <Input
              title="Monthly repayment (optional)"
              type="text"
              name="debtpayoff"
              value={this.state.PAYMENT}
              placeholder="Enter payment"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  PAYMENT: e.target.value,
                })
              }}
            />
          </Col>
        </Row>
      );
    }
  }

  private async revalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const parseVal = makeValueAbsPropFromString(`-${this.state.VALUE}`);
    if (!parseVal.checksOK) {
      this.props.showAlert(
        `Debt value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }

    const date = checkTriggerDate(
      this.state.START,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue}${this.state.NAME} ${count}`, this.props.model)
    ) {
      count += 1;
    }

    const revalueTransaction: Transaction = {
      NAME: `${revalue}${this.state.NAME} ${count}`,
      ERA: 0, // new things are automatically current,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0.0",
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.START,
      TYPE: revalueDebt,
      RECURRENCE: "",
      STOP_DATE: "",
      CATEGORY: "",
    };
    // log(`adding transaction ${showObj(revalueExpenseTransaction)}`);
    const message = await this.props.checkTransactionFunction(
      revalueTransaction,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueTransaction,
    );

    this.props.showAlert("added new data");
    // clear fields
    this.setState(this.defaultState);
    return;
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputting === inputtingDebt) {
      return makeButton(
        "Create new debt (over-writes any existing with the same name)",
        this.add,
        "addDebt",
        "addDebt",
        "primary",
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return makeButton(
        "Revalue this debt",
        this.revalue,
        "revalueDebt",
        "revalueDebt",
        "primary",
      );
    }
  }

  public render() {
    // log('rendering an AddDeleteDebtForm');
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            "Add new debt mode",
            this.inputDebt,
            "inputDebt",
            "inputDebt",
            this.state.inputting === inputtingDebt
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Revalue debt mode",
            this.inputRevalue,
            "revalueDebtInputs",
            "revalueDebtInputs",
            this.state.inputting === inputtingRevalue
              ? "primary"
              : "outline-secondary",
          )}
        </div>
        <form className="container-fluid" onSubmit={this.add}>
          {this.ValueAndCategory()}
          <Row>
            <Col> </Col>
          </Row>{" "}
          {/* TODO add vertical padding*/}
          <DateSelectionRow
            introLabel={`Date on which the ${
              this.state.inputting === inputtingRevalue
                ? "revaluation occurs"
                : "debt starts"
            }`}
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={(s: string) => {
              this.setState({
                START: s,
              })
            }}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({
                START: e.target.value,
              })
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          {this.growthAndInflation()}
          {this.goButtons()}
        </form>
      </>
    );
  }

  private async add(e: FormEvent<Element>) {
    e.preventDefault();

    if (this.state.NAME === "") {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (this.props.doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.assets.find((a) => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        if (matchingItem.IS_A_DEBT) {
          this.props.showAlert(
            `There's already a debt called ${this.state.NAME}`,
          );
        } else {
          this.props.showAlert(
            `There's already an asset called ${this.state.NAME}`,
          );
        }
        return;
      }
    }

    let isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      this.props.showAlert(
        `Debt value ${this.state.VALUE} should be a numerical value`,
      );
      return;
    }
    const date = checkTriggerDate(
      this.state.START,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    isNotANumber = !isNumberString(this.state.GROWTH);
    if (isNotANumber) {
      this.props.showAlert(
        `Growth value '${this.state.GROWTH}' should be a numerical value`,
      );
      return;
    }
    if (this.state.PAYMENT !== "") {
      isNotANumber = !isNumberString(this.state.PAYMENT);
      if (isNotANumber) {
        this.props.showAlert(
          `Payment value '${this.state.PAYMENT}' should be a numerical value`,
        );
        return;
      }
    }

    const asset: Asset = {
      NAME: this.state.NAME,
      ERA: 0, // new things are automatically current,
      VALUE: `-${parseFloat(this.state.VALUE)}`,
      QUANTITY: "", // debts are continuous
      START: this.state.START,
      GROWTH: this.state.GROWTH,
      CPI_IMMUNE: true, // debts never grow with CPI
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: true,
      CATEGORY: this.state.CATEGORY,
      PURCHASE_PRICE: "0.0",
      LIABILITY: "",
    };
    log('adding a debt ' + showObj(asset));
    const message = this.props.checkAssetFunction(asset);
    if (message.length > 0) {
      this.props.showAlert(message);
    } else {
      await this.props.submitAssetFunction(asset);
      if (this.state.PAYMENT !== "") {
        let count = 1;
        while (
          isATransaction(
            `Payment to ${this.state.NAME} ${count}`,
            this.props.model,
          )
        ) {
          count += 1;
        }
        const transaction: Transaction = {
          NAME: `${conditional}Payment to ${this.state.NAME} ${count}`,
          ERA: 0, // new things are automatically current,
          CATEGORY: this.state.CATEGORY,
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: this.state.PAYMENT,
          TO: this.state.NAME,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: this.state.START,
          STOP_DATE: "",
          RECURRENCE: "1m",
          TYPE: payOffDebt,
        };
        log('adding transaction ' + showObj(transaction));
        const message = await this.props.checkTransactionFunction(
          transaction,
        );
        if (message.length > 0) {
          this.props.showAlert(message);
          await this.props.deleteAssetFunction(asset.NAME);
        } else {
          await this.props.submitTransactionFunction(
            transaction,
          );
          this.props.showAlert("added new debt and payment");
          // clear fields
          this.setState(this.defaultState);
        }
      } else {
        this.props.showAlert("added new debt");
        // clear fields
        this.setState(this.defaultState);
      }
    }
  }

  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteAssetFunction(this.state.NAME)) {
      this.props.showAlert("deleted debt");
      // clear fields
      this.setState(this.defaultState);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
  private inputDebt(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingDebt,
    });
  }
  private inputRevalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
