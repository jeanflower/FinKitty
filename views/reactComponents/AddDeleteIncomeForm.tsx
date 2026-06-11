import React, { Component, FormEvent } from "react";
import { Col, Row } from "react-bootstrap";

import {
  checkIncomeLiability,
  checkModelAfterAddingGenerator,
  isValidValue,
} from "../../models/checks";
import {
  Income,
  Item,
  ModelData,
  Transaction,
  Trigger,
  FormProps,
  DeleteResult,
  Generator,
  DBPGeneratorDetails,
} from "../../types/interfaces";
import { log, printDebug, showObj } from "../../utils/utils";
import { makeButton } from "./Button";
import { DateSelectionRow, itemOptions } from "./DateSelectionRow";
import { Input } from "./Input";
import { revalueInc } from "../../localization/stringConstants";

import { makeRevalueName } from "../../models/modelUtils";
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  makeBooleanFromYesNo,
  makeIncomeLiabilityFromNameAndNI,
  makeGrowthFromString,
  growthInputErrorMessage,
  lessThan,
  makeProportionFromString,
  proportionMustEndWithPercentMessage,
} from "../../utils/stringUtils";
import Spacer from "react-spacer";
import { isAnIncome, getVarVal } from "../../models/modelQueries";

interface EditIncomeFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWS_WITH_CPI: string;
  GROWTH: string;
  LIABILITY: string;
  RECURRENCE: string;
  CATEGORY: string;
  inputting: string;
  DB_INCOME_SOURCE: string;
  DB_CONTRIBUTION_AMOUNT: string;
  DB_ACCRUAL: string;
  DB_SS: string;
  DB_STOP_SOURCE: string;
  DB_START: string;
  DB_END: string;
  DB_TRANSFER_TO: string;
  DB_TRANSFER_PROPORTION: string;
  DB_TRANSFERRED_STOP: string;
  DB_INCOME_GROWTH: string;
}

const inputtingRevalue = "revalue";
const inputtingIncome = "income";
const inputtingPension = "definedBenefitsPension";

interface EditIncomeProps extends FormProps {
  modelRaw: ModelData;
  checkIncomeFunction: (i: Income, model: ModelData) => string;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;

  submitIncomeFunction: (
    incomeInput: Income,
  ) => Promise<boolean>;
  submitTransactionFunction: (
    transactionInput: Transaction,
  ) => Promise<void>;
  deleteIncomeFunction: (name: string) => Promise<DeleteResult>;
  submitTriggerFunction: (
    triggerInput: Trigger,
  ) => Promise<void>;
  submitGeneratorFunction: (
    generator: Generator,
  ) => Promise<boolean>;
  doCheckBeforeOverwritingExistingData: () => boolean;
  filterForEra: (item: Item) => boolean;
}

export function incomeOptions(
  model: ModelData, 
  handleChange: (s: string) => void, id: string) 
{
  const optionData = model.incomes.map((income) => {
    return {
      text: income.NAME,
      action: (e: FormEvent<Element>) => {
        // log(`detected action`);
        // e.persist();
        e.preventDefault();
        handleChange(income.NAME);
      },
    };
  });

  const options = optionData.map((bd) => (
    <option
      value={bd.text}
      id={`option-income-${bd.text}`}
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
      onChange={(e) => {
        // log('in onChange for income select');
        const found = optionData.find((od) => {
          return od.text === e.target.value;
        });
        // log(`found = ${showObj(found)}`);
        if (found !== undefined) {
          found.action(e);
        } else {
          handleChange('');
        }
      }}
    >
      <option>Choose an income</option>
      {options}
    </select>
  );
}


export class AddDeleteIncomeForm extends Component<
  EditIncomeProps,
  EditIncomeFormState
> {
  public defaultState: EditIncomeFormState;

  private incomeSourceSelectID = "fromIncomeSelectIncomeForm";

  public constructor(props: EditIncomeProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`props for AddDeleteIncomeForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: "",
      VALUE: "",
      VALUE_SET: "",
      START: "",
      END: "",
      GROWS_WITH_CPI: "",
      GROWTH: "0%",
      LIABILITY: "",
      RECURRENCE: "1m",
      CATEGORY: "",
      inputting: inputtingIncome,
      DB_INCOME_SOURCE: "",
      DB_CONTRIBUTION_AMOUNT: "",
      DB_ACCRUAL: "",
      DB_SS: "",
      DB_STOP_SOURCE: "",
      DB_START: "",
      DB_END: "",
      DB_TRANSFER_TO: "",
      DB_TRANSFER_PROPORTION: "",
      DB_TRANSFERRED_STOP: "",
      DB_INCOME_GROWTH: "0%",
    };

    this.state = this.defaultState;

    this.revalue = this.revalue.bind(this);

    this.setValueSet = this.setValueSet.bind(this);
    this.setStart = this.setStart.bind(this);
    this.setEnd = this.setEnd.bind(this);
    this.setDbpStart = this.setDbpStart.bind(this);
    this.setDbpEnd = this.setDbpEnd.bind(this);
    this.setDbpStopSource = this.setDbpStopSource.bind(this);
    this.setDbpTransferredStop = this.setDbpTransferredStop.bind(this);

    this.add = this.add.bind(this);
    this.setInputincome = this.setInputincome.bind(this);
    this.setInputDBP = this.setInputDBP.bind(this);
    this.setInputRevalue = this.setInputRevalue.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteIncomeForm');
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            "Add new income mode",
            this.setInputincome,
            "useIncomeInputs",
            "useIncomeInputs",
            this.state.inputting === inputtingIncome
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Add pension mode",
            this.setInputDBP,
            "useDBPInputs",
            "useDBPInputs",
            this.state.inputting === inputtingPension
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Revalue income mode",
            this.setInputRevalue,
            "useRevalueInputsIncome",
            "useRevalueInputsIncome",
            this.state.inputting === inputtingRevalue
              ? "primary"
              : "outline-secondary",
          )}
        </div>
        <form className="container-fluid" onSubmit={this.add}>
          <Row>
            <Col>{this.inputIncomeName()}</Col>
            <Col>
              <Input
                title={`${
                  this.state.inputting === inputtingPension
                    ? "Pension"
                    : this.state.inputting === inputtingIncome
                    ? "Income"
                    : "New income"
                } value (amount before tax, per month)`}
                type="text"
                name="incomevalue"
                value={this.state.VALUE}
                placeholder="Enter value"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({ VALUE: e.target.value });
                }}
              />
            </Col>
          </Row>
          <div className="container-fluid">
            {/* fills width */}
            <DateSelectionRow
              introLabel={`${
                this.state.inputting === inputtingPension
                  ? "Date on which the pension's value is set"
                  : this.state.inputting === inputtingIncome
                  ? "Date on which the new income's value is set"
                  : "Date on which the income's new value is set"
              }`}
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={this.setValueSet}
              inputName="income valuation date"
              inputValue={this.state.VALUE_SET}
              onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
                this.setValueSet(e.target.value);
              }}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
          </div>
          {this.inputsForGeneralIncome()}
          {this.inputsForDefinedBenefitsPensionIncome()}
          {this.growthsEtc()}
          {this.revalueButton()}
        </form>
      </>
    );
  }

  private inputIncomeName(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <>
          Income name
          <Spacer height={10} />
          {itemOptions(
            this.props.model.incomes.sort((a: Income, b: Income) => {
              return lessThan(a.NAME, b.NAME);
            }),
            this.props.model,
            (name: string) => {
              this.setState({ NAME: name });
            },
            "incomenameselect",
            "Select income",
          )}
        </>
      );
    } else {
      return (
        <Input
          title={
            this.state.inputting === inputtingPension
              ? "Pension name"
              : "Income name"
          }
          type="text"
          name="incomename"
          value={this.state.NAME}
          placeholder="Enter name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ NAME: e.target.value });
          }}
        />
      );
    }
  }

  private growthsEtc(): React.ReactNode {
    if (
      this.state.inputting !== inputtingIncome &&
      this.state.inputting !== inputtingPension
    ) {
      return;
    }
    return (
      <>
        {this.state.inputting === inputtingIncome ? (
          <Row>
            <Col>
              <Input
                title={
                  "Annual growth percentage " +
                  "(excluding inflation, e.g. 2% p.a.)"
                }
                type="text"
                name="incomegrowth"
                value={this.state.GROWTH}
                placeholder="Enter growth"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({ GROWTH: e.target.value });
                }}
              />
            </Col>
            <Col />
          </Row>
        ) : null}
        <Row>
          <Col>
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="incomecpi-grows"
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
              title="Tax liability (empty or someone's name)"
              type="text"
              name="taxable"
              value={this.state.LIABILITY}
              placeholder="Enter tax liability"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ LIABILITY: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="incomecategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ CATEGORY: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
        {makeButton(
          "Create new income (over-writes any existing with the same name)",
          this.add,
          "addIncome",
          "addIncome",
          "primary",
        )}
      </>
    );
  }
  private revalueButton(): React.ReactNode {
    if (this.state.inputting !== inputtingRevalue) {
      return;
    }
    return makeButton(
      "Add income revaluation",
      this.revalue,
      "revalueIncome",
      "revalueIncome",
      "primary",
    );
  }
  private inputsForGeneralIncome(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingIncome ? "block" : "none",
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the income starts"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setStart}
            inputName="income start date"
            inputValue={this.state.START}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
              this.setState({ START: e.target.value });
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the income ends"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setEnd}
            inputName="income end date"
            inputValue={this.state.END}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
              this.setState({ END: e.target.value });
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
      </div>
    );
  }

  private inputsForDefinedBenefitsPensionIncome(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingPension ? "block" : "none",
        }}
      >
        {/*
 * name of pension
 * contribution from which income - ???
DB_INCOME_SOURCE
 * contribution amount = £ or %
DB_CONTRIBUTION_AMOUNT
 * annual accrual rate is a fraction (of annual income amount)
DB_ACCRUAL
 * whether it's salary sacrifice
DB_SS
 * contribution stop date 
DB_STOP_SOURCE
 * growth rate
DB_GROWTH, DB_CPI_IMMUNE
 * value - given all payments up to date value set - done
VALUE
handleDbpValueChange
 * date value set - expected to be "now" or start of model - done
VALUE_SET
 * standard date of pension start  - done
DB_START
 * when to stop paying (someone dies)
DB_END
 * who to transfer to
DB_TRANSFER_TO
 - how much to transfer
DB_TRANSFER_PROPORTION
 - when to stop paying second person (someone dies)
DB_TRANSFERRED_STOP
        */}

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which contributions end (optional)"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setDbpStopSource}
            inputName="end date"
            inputValue={this.state.DB_STOP_SOURCE}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setDbpStopSource(e.target.value);
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the pension starts"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setDbpStart}
            inputName="pension start date"
            inputValue={this.state.DB_START}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>): void => {
              this.setDbpStart(e.target.value);
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the pension ends" ///transfers"
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setDbpEnd}
            inputName="pension end/transfer date"
            inputValue={this.state.DB_END}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ DB_END: e.target.value });
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          {
            <DateSelectionRow
              introLabel="Date on which transferred pension stops (optional)"
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={this.setDbpTransferredStop}
              inputName="transferred stop date"
              inputValue={this.state.DB_TRANSFERRED_STOP}
              onChangeHandler={(
                e: React.ChangeEvent<HTMLInputElement>,
              ) => {
                this.setDbpTransferredStop(e.target.value);
              }}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
          }
        </div>
        <Row>
          <Col>
            <label>Income source (optional)</label>
            {incomeOptions(
              this.props.model,
              (value: string) => {
                this.setState({ DB_INCOME_SOURCE: value });
              },
              this.incomeSourceSelectID,
            )}
          </Col>{" "}
          <Col>
            <Input
              title="Is contribution salary-sacrificed"
              type="text"
              name="contributionSSIncome"
              value={this.state.DB_SS}
              placeholder="Enter Y/N"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_SS: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
        <Row>
          <Col>
            <Input
              title="Pension contribution amount (e.g. 5%, optional)"
              type="text"
              name="contributionAmountPensionIncome"
              value={this.state.DB_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_CONTRIBUTION_AMOUNT: e.target.value });
              }}
            />
          </Col>{" "}
          <Col>
            <Input
              title={
                "Contribution accrual to annual benefit " +
                "(e.g. 2% for 1/50, optional)"
              }
              type="text"
              name="incomeaccrual"
              value={this.state.DB_ACCRUAL}
              placeholder="Enter accrual rate"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_ACCRUAL: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
        <Row>
          <Col>
            <Input
              title={
                "Annual income growth percentage " +
                "(excluding inflation, e.g. 2% p.a.)"
              }
              type="text"
              name="dbpincomegrowth"
              value={this.state.DB_INCOME_GROWTH}
              placeholder="Enter income growth"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_INCOME_GROWTH: e.target.value });
              }}
            />
          </Col>
          <Col />
        </Row>
        <Row>
          <Col>
            <Input
              title="On death, pension transfers to (optional)"
              type="text"
              name="transferNameIncome"
              value={this.state.DB_TRANSFER_TO}
              placeholder="Enter person to transfer to"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_TRANSFER_TO: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={
                "Proportion transferred on death " +
                "(e.g. 50%, optional)"
              }
              type="text"
              name="transferProportion"
              value={this.state.DB_TRANSFER_PROPORTION}
              placeholder="Enter transfer proportion"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DB_TRANSFER_PROPORTION: e.target.value });
              }}
            />
          </Col>{" "}
        </Row>
      </div>
    );
  }

  private setDbpStopSource(value: string) {
    this.setState({ DB_STOP_SOURCE: value });
  }
  private setDbpTransferredStop(value: string) {
    this.setState({ DB_TRANSFERRED_STOP: value });
  }

  private setDbpEnd(value: string) {
    this.setState({ DB_END: value });
  }

  private setValueSet(value: string): void {
    this.setState({ VALUE_SET: value });
  }

  private setDbpStart(value: string): void {
    this.setState({ DB_START: value });
  }

  private setStart(value: string): void {
    this.setState({ START: value });
  }

  private setEnd(value: string): void {
    this.setState({ END: value });
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = "0";
    }
  }
  private async revalue(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();

    if (!isAnIncome(this.state.NAME, this.props.model)) {
      this.props.showAlert(
        `Income name ${this.state.NAME} should be an existing income`,
      );
      return;
    }

    const parseVal = makeValueAbsPropFromString(
      this.state.VALUE,
      this.props.model.settings,
    );
    if (!parseVal.checksOK) {
      this.props.showAlert(
        `Income value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }
    const date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
      undefined,
      this.props.model,
    );
    const isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }

    const newName = makeRevalueName(this.state.NAME, this.props.model);

    const revalueIncomeTransaction: Transaction = {
      NAME: `${newName}`,
      ERA: 0, // new things are automatically current,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0.0",
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.VALUE_SET, // match the income start date
      TYPE: revalueInc,
      RECURRENCE: "",
      STOP_DATE: "",
      CATEGORY: "",
    };
    const message = await this.props.checkTransactionFunction(
      revalueIncomeTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueIncomeTransaction,
    );

    this.props.showAlert("added new data");
    // clear fields
    this.setState(this.defaultState);
    this.resetSelect(this.incomeSourceSelectID);
    return;
  }

  private async add(e: FormEvent<Element>): Promise<void> {
    e.preventDefault();

    log(`in income form's add function`);

    if (this.state.NAME === "") {
      this.props.showAlert(`Income name should be non-empty`);
      return;
    }

    if (this.props.doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.incomes.find((a) => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        this.props.showAlert(
          `There's already an income called ${this.state.NAME}`,
        );
        return;
      }
    }

    const isNotValid = !isValidValue(this.state.VALUE, this.props.model);
    if (isNotValid) {
      this.props.showAlert(
        `Income value ${this.state.VALUE} should be numerical ` +
          `or built from an Asset or setting`,
      );
      return;
    }
    let date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
      undefined,
      this.props.model,
    );
    let isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Value set date should be a date`);
      return;
    }
    const parseYNGrowsWithCPI = makeBooleanFromYesNo(this.state.GROWS_WITH_CPI);
    if (!parseYNGrowsWithCPI.checksOK) {
      this.props.showAlert(
        `Grows with inflation '${this.state.GROWS_WITH_CPI}' ` +
          `should be a Y/N value`,
      );
      return;
    }
    if (this.state.inputting === inputtingPension) {
      const parsedIncomeGrowth = makeGrowthFromString(
        this.state.DB_INCOME_GROWTH,
        this.props.model.settings,
        true,
      );
      if (!parsedIncomeGrowth.checksOK) {
        this.props.showAlert(
          growthInputErrorMessage(
            this.state.DB_INCOME_GROWTH,
            parsedIncomeGrowth,
          ),
        );
        return;
      }

      if (this.props.doCheckBeforeOverwritingExistingData()) {
        const matchingGenerator = this.props.modelRaw.generators.find((g) => {
          return g.NAME === this.state.NAME;
        });
        if (matchingGenerator !== undefined) {
          this.props.showAlert(
            `There's already a generator called ${this.state.NAME}`,
          );
          return;
        }
      }

      let contributionAmount = "";
      if (this.state.DB_CONTRIBUTION_AMOUNT !== "") {
        const parsedContribution = makeProportionFromString(
          this.state.DB_CONTRIBUTION_AMOUNT,
          true,
        );
        if (!parsedContribution.checksOK) {
          this.props.showAlert(proportionMustEndWithPercentMessage);
          return;
        }
        contributionAmount = parsedContribution.value;
      }

      let accrual = "";
      if (this.state.DB_ACCRUAL !== "") {
        const parsedAccrual = makeProportionFromString(
          this.state.DB_ACCRUAL,
          true,
        );
        if (!parsedAccrual.checksOK) {
          this.props.showAlert(proportionMustEndWithPercentMessage);
          return;
        }
        accrual = parsedAccrual.value;
      }

      let transferProportion = "";
      if (this.state.DB_TRANSFER_PROPORTION !== "") {
        const parsedTransferProportion = makeProportionFromString(
          this.state.DB_TRANSFER_PROPORTION,
          true,
        );
        if (!parsedTransferProportion.checksOK) {
          this.props.showAlert(proportionMustEndWithPercentMessage);
          return;
        }
        transferProportion = parsedTransferProportion.value;
      }

      const dbGeneratorDetails: DBPGeneratorDetails = {
        VALUE: this.state.VALUE,
        VALUE_SET: this.state.VALUE_SET,
        STOP_SOURCE: this.state.DB_STOP_SOURCE,
        START: this.state.DB_START,
        END: this.state.DB_END,
        GROWS_WITH_CPI: this.state.GROWS_WITH_CPI,
        IncomeGrowth: parsedIncomeGrowth.value,
        TRANSFERRED_STOP: this.state.DB_TRANSFERRED_STOP,
        INCOME_SOURCE: this.state.DB_INCOME_SOURCE,
        SALARY_SACRIFICED: this.state.DB_SS,
        CONTRIBUTION_AMOUNT: contributionAmount,
        ACCRUAL: accrual,
        TRANSFER_TO: this.state.DB_TRANSFER_TO,
        TRANSFER_PROPORTION: transferProportion,
        TAX_LIABILITY: this.state.LIABILITY,
        CATEGORY: this.state.CATEGORY,
      };
      const generator: Generator = {
        NAME: this.state.NAME,
        ERA: 0,
        TYPE: "Defined Benefits",
        DETAILS: dbGeneratorDetails,
      };
      const outcome = checkModelAfterAddingGenerator(
        this.props.modelRaw,
        generator,
      );
      if (outcome.message !== "") {
        this.props.showAlert(outcome.message);
        return;
      }

      const submittedOK = await this.props.submitGeneratorFunction(generator);
      if (submittedOK) {
        this.props.showAlert("added new data");
        // clear fields
        this.setState(this.defaultState);
        this.resetSelect(this.incomeSourceSelectID);
      }
      return;
    }

    const parsedGrowth = makeGrowthFromString(
      this.state.GROWTH,
      this.props.model.settings,
      true,
    );
    if (!parsedGrowth.checksOK) {
      this.props.showAlert(
        growthInputErrorMessage(this.state.GROWTH, parsedGrowth),
      );
      return;
    }

    date = checkTriggerDate(
      this.state.START,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
      undefined,
      this.props.model,
    );
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    date = checkTriggerDate(
      this.state.END,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
      undefined,
      this.props.model,
    );
    isNotADate = date === undefined;
    if (isNotADate) {
      this.props.showAlert(`End date '${this.state.END}' should be a date`);
      return;
    }

    const builtLiability = makeIncomeLiabilityFromNameAndNI(
      this.state.LIABILITY,
      true, // NI payable
    );
    const liabilityMessage = checkIncomeLiability(builtLiability);
    if (liabilityMessage !== "") {
      this.props.showAlert(liabilityMessage);
      return;
    }

    // log('adding something ' + showObj(this));
    const income: Income = {
      NAME: this.state.NAME,
      ERA: 0, // new things are automatically current,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: !parseYNGrowsWithCPI.value,
      LIABILITY: builtLiability,
      RECURRENCE: this.state.RECURRENCE,
      CATEGORY: this.state.CATEGORY,
    };
    const message = await this.props.checkIncomeFunction(
      income,
      this.props.model,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
    } else {
      if (await this.props.submitIncomeFunction(income)) {
        this.props.showAlert(`added new income ${income.NAME}`);
        // clear fields
        this.setState(this.defaultState);
        this.resetSelect(this.incomeSourceSelectID);
      }
    }
  }

  private setInputDBP(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingPension,
    });
  }
  private setInputincome(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingIncome,
    });
  }
  private setInputRevalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
