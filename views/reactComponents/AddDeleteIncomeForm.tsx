import React, { Component, FormEvent } from "react";
import { Button, Col, Row } from "react-bootstrap";

import { checkIncomeLiability, isValidValue } from "../../models/checks";
import {
  Income,
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
import {
  pensionDB,
  incomeTax,
  pensionPrefix,
  pensionSS,
  separator,
  pensionTransfer,
  autogen,
  revalueInc,
} from "../../localization/stringConstants";

import { makeRevalueName } from "../../models/modelUtils";
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  makeBooleanFromYesNo,
  makeIncomeLiabilityFromNameAndNI,
  lessThan,
} from "../../utils/stringUtils";
import Spacer from "react-spacer";
import {
  isAnIncome,
  getVarVal,
  isNumberString,
} from "../../models/modelQueries";
import { makeModelFromJSON } from "../../models/modelFromJSON";

interface EditIncomeFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWS_WITH_CPI: string;
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
}

const inputtingRevalue = "revalue";
const inputtingIncome = "income";
const inputtingPension = "definedBenefitsPension";

interface EditIncomeProps extends FormProps {
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
  ) => Promise<void>;
  deleteGeneratorFunction: (name: string) => Promise<DeleteResult>;
  doCheckBeforeOverwritingExistingData: () => boolean;
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

  private renderGenerators(
    generators: Generator[],
  ){
    return generators.map((g) => {
      return <>
        <div><b>{g.NAME}</b></div>
        {Object.keys(g.DETAILS).map((key) => {
          return <div>
            {`${key} ${g.DETAILS[key]}`}
          </div>;
        })}
        <Button
          onClick={()=>{
            console.log(`edit ${g.NAME}`);
            this.setState({
              NAME: g.NAME,
              VALUE: g.DETAILS.VALUE,
              VALUE_SET: g.DETAILS.VALUE_SET,
              START: "",
              END: "",
              GROWS_WITH_CPI: g.DETAILS.GROWS_WITH_CPI ? g.DETAILS.GROWS_WITH_CPI : 'n',
              LIABILITY: g.DETAILS.TAX_LIABILITY,
              RECURRENCE: "1m",
              CATEGORY: g.DETAILS.CATEGORY,
              inputting: inputtingPension,
              DB_INCOME_SOURCE: g.DETAILS.INCOME_SOURCE,
              DB_CONTRIBUTION_AMOUNT: g.DETAILS.CONTRIBUTION_AMOUNT,
              DB_ACCRUAL: g.DETAILS.ACCRUAL,
              DB_SS: g.DETAILS.SALARY_SACRIFICED,
              DB_STOP_SOURCE: g.DETAILS.STOP_SOURCE,
              DB_START: g.DETAILS.START,
              DB_END: g.DETAILS.END,
              DB_TRANSFER_TO: g.DETAILS.TRANSFER_TO,
              DB_TRANSFER_PROPORTION: g.DETAILS.TRANSFER_PROPORTION,
              DB_TRANSFERRED_STOP: g.DETAILS.TRANSFERRED_STOP,
            })
          }}
        >Edit</Button>

        <Button
          onClick={async ()=>{
            console.log(`delete ${g.NAME}`);
            const outcome = await this.props.deleteGeneratorFunction(g.NAME);
            if (outcome.itemsDeleted) {
              this.props.showAlert(`deleted ${g.NAME}`);
              // clear fields
              this.setState(this.defaultState);
              this.resetSelect(this.incomeSourceSelectID);
            } else {
              this.props.showAlert(outcome.message);
            }
          }}
        >Delete</Button>
      </>
    })  
  }
  
  private renderDPBGenerators(
    generators: Generator[],
  ){
    return <>
      {this.renderGenerators(
        generators.filter((g) => {
          return g.TYPE === 'Defined Benefits';
        })
      )}
    </>;
  }

  public render() {
    // log('rendering an AddDeleteIncomeForm');
    return (
      <>
        <div className="ml-3 my-4">
          {this.renderDPBGenerators(this.props.model.generators)}
        </div>
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
              title="Pension contribution amount (e.g. 0.05 for 5%, optional)"
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
                "(e.g. 0.02 for 1/50, optional)"
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
                "(e.g. 0.5 for 50%, optional)"
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

    const parseVal = makeValueAbsPropFromString(this.state.VALUE);
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
      // do work to
      // (a) check integrity of inputs
      // (b) build an income for the pension, check integrity of income
      // (c) build an income for the transferred pension,
      //     check integrity of income
      // (d) build a transaction for the contributions to the income,
      //     check integrity of transaction
      // (e) build a transaction for the accrual of the benefit,
      //     check integrity of transaction
      // (f) submit income
      // (g) submit transactions
      // (h) reset to defaults

      const copyModel = makeModelFromJSON(JSON.stringify(this.props.model));
      copyModel.name = 'temporary copy';
      copyModel.undoModel = undefined;
      copyModel.redoModel = undefined;

      const parseYNDBSS = makeBooleanFromYesNo(this.state.DB_SS);
      if (this.state.DB_INCOME_SOURCE !== "") {
        if (!parseYNDBSS.checksOK) {
          this.props.showAlert(
            `Salary sacrifice '${this.state.DB_SS}' should be a Y/N value`,
          );
          return;
        } else {
          // log(`parseYNDBSS = ${showObj(parseYNDBSS)}`);
        }

        let isNotANumber = this.state.DB_CONTRIBUTION_AMOUNT === '' 
          || !isNumberString(this.state.DB_CONTRIBUTION_AMOUNT);
        if (isNotANumber) {
          this.props.showAlert(
            `Contribution amount '${this.state.DB_CONTRIBUTION_AMOUNT}' ` +
              `should be a numerical value`,
          );
          return;
        }

        isNotANumber = this.state.DB_ACCRUAL === '' 
          || !isNumberString(this.state.DB_ACCRUAL);
        if (isNotANumber) {
          this.props.showAlert(
            `Accrual value '${this.state.DB_ACCRUAL}' ` +
              `should be a numerical value`,
          );
          return;
        }
      } else {
        let isNotANumber = this.state.DB_CONTRIBUTION_AMOUNT === '' 
          || !isNumberString(this.state.DB_CONTRIBUTION_AMOUNT);
        if (!isNotANumber) {
          this.props.showAlert(
            `Contribution amount '${this.state.DB_CONTRIBUTION_AMOUNT}' ` +
              `from no income?`,
          );
          return;
        }

        isNotANumber = this.state.DB_ACCRUAL === '' || !isNumberString(this.state.DB_ACCRUAL);
        if (!isNotANumber) {
          this.props.showAlert(
            `Accrual value '${this.state.DB_ACCRUAL}' from no income?`,
          );
          return;
        }
      }
      const inputLiability = makeIncomeLiabilityFromNameAndNI(
        this.state.LIABILITY,
        false, // no NI payable
      );
      let liabilityMessage = checkIncomeLiability(inputLiability);
      if (liabilityMessage !== "") {
        this.props.showAlert(liabilityMessage);
        return;
      }

      const sourceIncome = copyModel.incomes.find((i) => {
        return i.NAME === this.state.DB_INCOME_SOURCE;
      });
      if (sourceIncome === undefined && this.state.DB_INCOME_SOURCE !== "") {
        this.props.showAlert(
          `${this.state.DB_INCOME_SOURCE} not recognised as an income`,
        );
        return;
      } else if (sourceIncome) {
        const liabilities = sourceIncome.LIABILITY;
        if (liabilities.length === 0) {
          this.props.showAlert(
            `Source income '${sourceIncome.NAME}' should pay income tax`,
          );
          return;
        }
        const words = liabilities.split(separator);
        const incomeTaxWord = words.find((w) => {
          return w.endsWith(incomeTax);
        });
        if (incomeTaxWord === undefined) {
          this.props.showAlert(
            `Source income '${sourceIncome.NAME}' ` +
              `should have an income tax liability`,
          );
          return;
        } else {
          // insist incomeTaxWord matches inputLiability
          if (incomeTaxWord !== inputLiability) {
            log(`${incomeTaxWord} !== ${inputLiability}`);
            this.props.showAlert(
              `Source income '${sourceIncome.NAME}' ` +
                `should have income tax liability matching '${inputLiability}'`,
            );
            return;
          }
        }
      }
      let builtLiability2: string | undefined;
      if (this.state.DB_TRANSFER_TO !== "") {
        const isNotANumber = this.state.DB_TRANSFER_PROPORTION === '' 
          || !isNumberString(this.state.DB_TRANSFER_PROPORTION);
        if (isNotANumber) {
          this.props.showAlert(
            `Transfer proportion ${this.state.DB_TRANSFER_PROPORTION} ` +
              `should be a numerical value`,
          );
          return;
        }
        builtLiability2 = makeIncomeLiabilityFromNameAndNI(
          this.state.DB_TRANSFER_TO,
          false, // no NI payable
        );
        liabilityMessage = checkIncomeLiability(builtLiability2);
        if (liabilityMessage !== "") {
          this.props.showAlert(liabilityMessage);
          return;
        }
      }
      const newIncomeName1 = pensionDB + this.state.NAME;
      const pensionDbpIncome1: Income = {
        START: this.state.DB_START,
        END: this.state.DB_END,
        NAME: newIncomeName1,
        ERA: 0, // new things are automatically current,
        VALUE: this.state.VALUE,
        VALUE_SET: this.state.VALUE_SET,
        LIABILITY: inputLiability,
        CPI_IMMUNE: !parseYNGrowsWithCPI.value,
        RECURRENCE: this.state.RECURRENCE,
        CATEGORY: this.state.CATEGORY,
      };
      let message = await this.props.checkIncomeFunction(
        pensionDbpIncome1,
        copyModel,
      );
      if (message.length > 0) {
        this.props.showAlert(message);
        return;
      }
      let pensionDbpIncome2: Income | undefined;
      let newIncomeName2: string | undefined;
      if (this.state.DB_TRANSFER_TO !== "" && builtLiability2 !== undefined) {
        newIncomeName2 = pensionTransfer + this.state.NAME;
        pensionDbpIncome2 = {
          START: this.state.DB_START,
          END: this.state.DB_TRANSFERRED_STOP,
          NAME: newIncomeName2,
          ERA: 0, // new things are automatically current,
          VALUE: "0.0",
          VALUE_SET: this.state.VALUE_SET,
          LIABILITY: builtLiability2,
          CPI_IMMUNE: !parseYNGrowsWithCPI.value,
          RECURRENCE: this.state.RECURRENCE,
          CATEGORY: this.state.CATEGORY,
        };
        const message = await this.props.checkIncomeFunction(
          pensionDbpIncome2,
          copyModel,
        );
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }

      copyModel.incomes.push(pensionDbpIncome1);
      if (pensionDbpIncome2) {
        copyModel.incomes.push(pensionDbpIncome2);
      }

      let pensionDbptran1: Transaction | undefined;
      let pensionDbptran2: Transaction | undefined;
      if (this.state.DB_INCOME_SOURCE !== "") {
        pensionDbptran1 = {
          NAME: (parseYNDBSS.value ? pensionSS : pensionPrefix) + this.state.NAME,
          ERA: 0, // new things are automatically current,
          FROM: this.state.DB_INCOME_SOURCE,
          FROM_ABSOLUTE: false,
          FROM_VALUE: this.state.DB_CONTRIBUTION_AMOUNT,
          TO: "",
          TO_ABSOLUTE: false,
          TO_VALUE: "0.0",
          DATE: this.state.VALUE_SET, // match the income start date
          STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
          RECURRENCE: "",
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbptran1,
          copyModel,
        );
        if (message.length > 0) {
          //log(`bad transaction1 ${showObj(pensionDbptran1)}`);
          this.props.showAlert(message);
          return;
        }
        // log(`this.state.DB_ACCRUAL = ${this.state.DB_ACCRUAL}`);
        const monthlyAccrualValue = `${
          parseFloat(this.state.DB_ACCRUAL) / 12.0
        }`;
        // Why divide by 12 here?
        // the accrual rate adds, say, 1/49th of an income to the
        // annual pension benefit.
        // If w3e earn money each month, or each week, it's still 1/49th
        // of that income.
        // But if we are tracking a future _monthly_ pension benefit,
        // we should only add 1/49th /12 otherwise our pension will be
        // very large from not many contributions!

        // log(`monthlyAccrualValue = ${monthlyAccrualValue}`);
        pensionDbptran2 = {
          NAME: newIncomeName1, // kicks in when we see income java
          ERA: 0, // new things are automatically current,
          FROM: this.state.DB_INCOME_SOURCE,
          FROM_ABSOLUTE: false,
          FROM_VALUE: monthlyAccrualValue, // % of income offered up to pension
          TO: newIncomeName1,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: this.state.VALUE_SET, // match the income start date
          STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
          RECURRENCE: "",
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbptran2,
          copyModel,
        );
        if (message.length > 0) {
          //log(`bad transaction2 ${showObj(pensionDbptran2)}`);
          this.props.showAlert(message);
          return;
        }
      }
      let pensionDbptran3: Transaction | undefined;
      if (this.state.DB_TRANSFER_TO !== "" && newIncomeName2) {
        pensionDbptran3 = {
          NAME: newIncomeName2,
          ERA: 0, // new things are automatically current,
          FROM: newIncomeName1,
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: newIncomeName2,
          TO_ABSOLUTE: false,
          TO_VALUE: this.state.DB_TRANSFER_PROPORTION,
          DATE: this.state.DB_END,
          STOP_DATE: this.state.DB_TRANSFERRED_STOP,
          RECURRENCE: "",
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbptran3,
          copyModel,
        );
        if (message.length > 0) {
          //log(`bad transaction3 ${showObj(pensionDbptran3)}`);
          this.props.showAlert(message);
          return;
        }
      }

      const dbGeneratorDetails: DBPGeneratorDetails = {
        VALUE: this.state.VALUE,
        VALUE_SET: this.state.VALUE_SET,
        STOP_SOURCE: this.state.DB_STOP_SOURCE,
        START: this.state.DB_START,
        END: this.state.DB_END,
        GROWS_WITH_CPI: this.state.GROWS_WITH_CPI,
        TRANSFERRED_STOP: this.state.DB_TRANSFERRED_STOP,
        INCOME_SOURCE: this.state.DB_INCOME_SOURCE,
        SALARY_SACRIFICED: this.state.DB_SS,
        CONTRIBUTION_AMOUNT: this.state.DB_CONTRIBUTION_AMOUNT,
        ACCRUAL: this.state.DB_ACCRUAL,
        TRANSFER_TO: this.state.DB_TRANSFER_TO,
        TRANSFER_PROPORTION: this.state.DB_TRANSFER_PROPORTION,
        TAX_LIABILITY: this.state.LIABILITY,
        CATEGORY: this.state.CATEGORY,        
      };
      this.props.submitGeneratorFunction(
        {
          NAME: this.state.NAME,
          ERA: 0,
          TYPE: 'Defined Benefits',
          DETAILS: dbGeneratorDetails
        },
      );
      this.props.showAlert("added new data");
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
      return;
    }

    date = checkTriggerDate(
      this.state.START,
      this.props.model.triggers,
      getVarVal(this.props.model.settings),
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
