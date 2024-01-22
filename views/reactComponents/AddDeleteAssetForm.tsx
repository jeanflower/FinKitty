import React, { Component, FormEvent } from "react";
import { Button, Col, Row } from "react-bootstrap";

import { checkAssetLiability, isValidValue } from "../../models/checks";
import {
  Asset,
  ModelData,
  Transaction,
  Trigger,
  FormProps,
  DeleteResult,
  Generator,
  DCGeneratorDetails,
} from "../../types/interfaces";
import { log, printDebug, showObj } from "../../utils/utils";
import { makeButton } from "./Button";
import { DateSelectionRow, itemOptions } from "./DateSelectionRow";
import { Input } from "./Input";
import {
  cgt,
  pensionPrefix,
  crystallizedPension,
  pensionSS,
  autogen,
  revalueAsset,
  moveTaxFreePart,
  taxFree,
  transferCrystallizedPension,
  dot,
} from "../../localization/stringConstants";
import { incomeOptions } from "./AddDeleteIncomeForm";
import { makeRevalueName } from "../../models/modelUtils";
import {
  makeValueAbsPropFromString,
  checkTriggerDate,
  makeBooleanFromYesNo,
  makeQuantityFromString,
  lessThan,
} from "../../utils/stringUtils";
import Spacer from "react-spacer";
import {
  getVarVal,
  getSettings,
  isNumberString,
} from "../../models/modelQueries";
import { makeModelFromJSON } from "../../models/modelFromJSON";

interface EditAssetFormState {
  NAME: string;
  VALUE: string;
  QUANTITY: string;
  START: string;
  GROWTH: string;
  GROWS_WITH_INFLATION: string;
  PURCHASE_PRICE: string;
  LIABILITY: string;
  CATEGORY: string;
  inputting: string;
  DCP_STOP: string;
  DCP_CRYSTALLIZE: string;
  DCP_SS: string;
  DCP_INCOME_SOURCE: string;
  DCP_CONTRIBUTION_AMOUNT: string;
  DCP_EMP_CONTRIBUTION_AMOUNT: string;
  DCP_TRANSFER_TO: string;
  DCP_TRANSFER_DATE: string;
}

const inputtingRevalue = "revalue";
const inputtingAsset = "asset";
const inputtingPension = "definedContributionsPension";

interface EditAssetProps extends FormProps {
  checkAssetFunction: (a: Asset, model: ModelData) => string;
  submitAssetFunction: (arg0: Asset, arg1: ModelData) => Promise<void>;
  deleteAssetFunction: (name: string) => Promise<DeleteResult>;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
    modelData: ModelData,
  ) => Promise<void>;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  submitGeneratorFunction: (
    generator: Generator,
    modelData: ModelData,
  ) => Promise<void>;
  deleteGeneratorFunction: (name: string) => Promise<DeleteResult>;
  doCheckBeforeOverwritingExistingData: () => boolean;
}
export class AddDeleteAssetForm extends Component<
  EditAssetProps,
  EditAssetFormState
> {
  public defaultState: EditAssetFormState;

  private incomeSourceSelectID = "fromIncomeSelectAssetForm";

  public constructor(props: EditAssetProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`props for AddDeleteAssetForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: "",
      VALUE: "",
      QUANTITY: "",
      START: "",
      GROWTH: "",
      GROWS_WITH_INFLATION: "",
      PURCHASE_PRICE: "",
      LIABILITY: "",
      CATEGORY: "",
      inputting: inputtingAsset,
      DCP_STOP: "",
      DCP_CRYSTALLIZE: "",
      DCP_SS: "",
      DCP_INCOME_SOURCE: "",
      DCP_CONTRIBUTION_AMOUNT: "",
      DCP_EMP_CONTRIBUTION_AMOUNT: "",
      DCP_TRANSFER_TO: "",
      DCP_TRANSFER_DATE: "",
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleLiabilityChange = this.handleLiabilityChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handlePurchasePriceChange = this.handlePurchasePriceChange.bind(this);
    this.handleGrowsWithCPIChange = this.handleGrowsWithCPIChange.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleDcpTransferTo = this.handleDcpTransferTo.bind(this);
    this.setDcpTransferDate = this.setDcpTransferDate.bind(this);
    this.handleDcpTransferDateChange =
      this.handleDcpTransferDateChange.bind(this);

    this.setStart = this.setStart.bind(this);
    this.inputPension = this.inputPension.bind(this);
    this.inputAsset = this.inputAsset.bind(this);
    this.inputRevalue = this.inputRevalue.bind(this);
    this.setStop = this.setStop.bind(this);
    this.handleStopChange = this.handleStopChange.bind(this);
    this.setCrystallize = this.setCrystallize.bind(this);
    this.handleCrystallizeChange = this.handleCrystallizeChange.bind(this);
    this.handleDcpIncomeSourceChange =
      this.handleDcpIncomeSourceChange.bind(this);
    this.handleDcpContAmount = this.handleDcpContAmount.bind(this);
    this.handleDcpEmpContAmount = this.handleDcpEmpContAmount.bind(this);
    this.handleDcpSsChange = this.handleDcpSsChange.bind(this);

    this.add = this.add.bind(this);
    this.addFromButton = this.addFromButton.bind(this);
    this.addFromForm = this.addFromForm.bind(this);
    this.delete = this.delete.bind(this);
    this.goButtons = this.goButtons.bind(this);
    this.revalue = this.revalue.bind(this);
    this.ValueQuantityAndCategory = this.ValueQuantityAndCategory.bind(this);
    this.growthAndInflation = this.growthAndInflation.bind(this);
  }

  private inputsForGeneralAsset(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingAsset ? "block" : "none",
        }}
      >
        <Row>
          <Col>
            <Input
              title="Capital Gains Tax Liability (empty or someone's name)"
              type="text"
              name="liabilityCGT"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </Col>
          <Col>
            <Input
              title={
                "Original purchase price " +
                "(optional, needed for CGT purposes)"
              }
              type="text"
              name="purchase"
              value={this.state.PURCHASE_PRICE}
              placeholder="purchase"
              onChange={this.handlePurchasePriceChange}
            />
          </Col>
        </Row>
      </div>
    );
  }

  private inputAssetName(): React.ReactNode {
    return (
      <>
        Asset name
        <Spacer height={10} />
        {itemOptions(
          this.props.model.assets
            .filter((a) => {
              return !a.IS_A_DEBT;
            })
            .sort((a: Asset, b: Asset) => {
              return lessThan(a.NAME, b.NAME);
            }),
          this.props.model,
          this.handleNameChange,
          "assetname",
          "Select asset",
        )}
      </>
    );
  }

  private growthAndInflation(): React.ReactNode {
    if (this.state.inputting !== inputtingRevalue) {
      return (
        <Row>
          <Col>
            <Input
              title={
                "Annual growth percentage " +
                "(excluding inflation, e.g. 2 for 2% p.a.)"
              }
              type="text"
              name="assetgrowth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={this.handleGrowthChange}
            />
          </Col>
          <Col>
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="assetcpi-grows"
              value={this.state.GROWS_WITH_INFLATION}
              placeholder="Enter Y/N"
              onChange={this.handleGrowsWithCPIChange}
            />
          </Col>
        </Row>
      );
    }
  }

  private ValueQuantityAndCategory(): React.ReactNode {
    // log(`this.state.inputting = ${this.state.inputting}`);
    if (this.state.inputting === inputtingRevalue) {
      return (
        <Row>
          <Col>{this.inputAssetName()}</Col>
          <Col>
            <Input
              title={`Asset value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </Col>
        </Row>
      );
    } else if (this.state.inputting === inputtingPension) {
      return (
        <Row>
          <Col>
            <Input
              title={`${
                this.state.inputting === inputtingPension ? "Pension" : "Asset"
              } name`}
              type="text"
              name="assetname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                return this.handleNameChange(e.target.value);
              }}
            />
          </Col>
          <Col>
            <Input
              title={`${
                this.state.inputting === inputtingPension ? "Pension" : "Asset"
              } value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="assetcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col>
            <Input
              title={`${
                this.state.inputting === inputtingPension ? "Pension" : "Asset"
              } name`}
              type="text"
              name="assetname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                return this.handleNameChange(e.target.value);
              }}
            />
          </Col>
          <Col>
            <Input
              title={`${
                this.state.inputting === inputtingPension ? "Pension" : "Asset"
              } value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </Col>
          <Col>
            <Input
              title={"Quantity (optional)"}
              type="text"
              name="assetquantity"
              value={this.state.QUANTITY}
              placeholder="Enter quantity"
              onChange={this.handleQuantityChange}
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="assetcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </Col>
        </Row>
      );
    }
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputting === inputtingAsset) {
      return makeButton(
        "Create new asset (over-writes any existing with the same name)",
        this.addFromButton,
        "addAsset",
        "addAsset",
        "primary",
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return makeButton(
        "Revalue this asset",
        this.revalue,
        "revalueAsset",
        "revalueAsset",
        "primary",
      );
    } else if (this.state.inputting === inputtingPension) {
      return makeButton(
        "Create new pension",
        this.addFromButton,
        "addPension",
        "addPension",
        "primary",
      );
    }
  }

  private inputsForDCP(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingPension ? "block" : "none",
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Stop date for contributions`}
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setStop}
            inputName="stop date"
            inputValue={this.state.DCP_STOP}
            onChangeHandler={this.handleStopChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Date on which the pension crystallizes`}
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={this.setCrystallize}
            inputName="crystallize date"
            inputValue={this.state.DCP_CRYSTALLIZE}
            onChangeHandler={this.handleCrystallizeChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        <div className="container-fluid">
          {this.state.inputting === inputtingPension ? (
            <DateSelectionRow
              introLabel="On death, pension transfers to (optional)"
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={this.setDcpTransferDate}
              inputName="transferred stop date"
              inputValue={this.state.DCP_TRANSFER_DATE}
              onChangeHandler={this.handleDcpTransferDateChange}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
          ) : (
            <div />
          )}
        </div>
        <Row>
          <Col>
            <Input
              title="Is contribution salary-sacrificed"
              type="text"
              name="contributionSSAsset"
              value={this.state.DCP_SS}
              placeholder="Enter Y/N"
              onChange={this.handleDcpSsChange}
            />
          </Col>{" "}
          <Col>
            <label>Income from which pension contributions are made</label>
            {incomeOptions(
              this.props.model,
              this.handleDcpIncomeSourceChange,
              this.incomeSourceSelectID,
            )}
          </Col>{" "}
        </Row>{" "}
        <Row>
          <Col>
            <Input
              title="Pension contribution amount (>0, e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmountPensionAsset"
              value={this.state.DCP_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={this.handleDcpContAmount}
            />
          </Col>{" "}
          <Col>
            <Input
              title="Employer contribution amount (e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmount"
              value={this.state.DCP_EMP_CONTRIBUTION_AMOUNT}
              placeholder="Employer contributions"
              onChange={this.handleDcpEmpContAmount}
            />
          </Col>{" "}
        </Row>{" "}
        <Row>
          <Col>
            <Input
              title="Income Tax Liability (someone's name)"
              type="text"
              name="liabilityIC"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </Col>
          <Col>
            <Input
              title="On death, pension transfers to (optional)"
              type="text"
              name="transferNameAsset"
              value={this.state.DCP_TRANSFER_TO}
              placeholder="Enter person to transfer to"
              onChange={this.handleDcpTransferTo}
            />
          </Col>
        </Row>
      </div>
    );
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
            const dcGeneratorDetails: DCGeneratorDetails = g.DETAILS;
            this.setState({
              NAME: g.NAME,
              VALUE: g.DETAILS.VALUE,
              QUANTITY: '',
              START: g.DETAILS.START,
              GROWTH: g.DETAILS.GROWTH,
              GROWS_WITH_INFLATION: g.DETAILS.GROWS_WITH_CPI ? g.DETAILS.GROWS_WITH_CPI : 'n',
              LIABILITY: g.DETAILS.TAX_LIABILITY,
              PURCHASE_PRICE: '',
              CATEGORY: g.DETAILS.CATEGORY,
              inputting: inputtingPension,
              DCP_STOP: g.DETAILS.STOP,
              DCP_CRYSTALLIZE: g.DETAILS.CRYSTALLIZE,
              DCP_SS: g.DETAILS.SS,
              DCP_INCOME_SOURCE: g.DETAILS.INCOME_SOURCE,
              DCP_CONTRIBUTION_AMOUNT: g.DETAILS.CONTRIBUTION_AMOUNT,
              DCP_EMP_CONTRIBUTION_AMOUNT: g.DETAILS.EMP_CONTRIBUTION_AMOUNT,
              DCP_TRANSFER_TO: g.DETAILS.TRANSFER_TO,
              DCP_TRANSFER_DATE: g.DETAILS.TRANSFER_DATE,
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
  
  private renderDCBGenerators(
    generators: Generator[],
  ){
    return <>
      {this.renderGenerators(
        generators.filter((g) => {
          return g.TYPE === 'Defined Contributions';
        })
      )}
    </>;
  }


  public render() {
    // log('rendering an AddDeleteAssetForm');
    return (
      <>
        <div className="ml-3 my-4">
          {this.renderDCBGenerators(this.props.model.generators)}
        </div>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            "Add new asset mode",
            this.inputAsset,
            "inputAsset",
            "inputAsset",
            this.state.inputting === inputtingAsset
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Add pension mode",
            this.inputPension,
            "useDCPInputs",
            "useDCPInputs",
            this.state.inputting === inputtingPension
              ? "primary"
              : "outline-secondary",
          )}
          {makeButton(
            "Revalue asset mode",
            this.inputRevalue,
            "revalueAssetInputs",
            "revalueAssetInputs",
            this.state.inputting === inputtingRevalue
              ? "primary"
              : "outline-secondary",
          )}
        </div>
        <form className="container-fluid" onSubmit={this.addFromForm}>
          {this.ValueQuantityAndCategory()}
          <div className="container-fluid">
            {/* fills width */}
            <DateSelectionRow
              introLabel={`Date on which the ${
                this.state.inputting === inputtingRevalue
                  ? "revaluation occurs"
                  : this.state.inputting === inputtingPension
                  ? "pension asset begins"
                  : "asset starts"
              }`}
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={this.setStart}
              inputName="start date"
              inputValue={this.state.START}
              onChangeHandler={this.handleStartChange}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
          </div>
          {this.growthAndInflation()}
          {this.inputsForGeneralAsset()}
          {this.inputsForDCP()}
          {this.goButtons()}
        </form>
      </>
    );
  }

  private handleNameChange(name: string) {
    const value = name;
    this.setState({ NAME: value });
  }
  private handleGrowthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ GROWTH: value });
  }
  private handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handlePurchasePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ PURCHASE_PRICE: value });
  }
  private handleLiabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ LIABILITY: value });
  }
  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ QUANTITY: value });
  }
  private handleGrowsWithCPIChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ GROWS_WITH_INFLATION: value });
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setStart(value);
  }
  private setStop(value: string): void {
    this.setState({ DCP_STOP: value });
  }
  private handleStopChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setStop(value);
  }
  private setCrystallize(value: string): void {
    this.setState({ DCP_CRYSTALLIZE: value });
  }
  private handleCrystallizeChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    this.setCrystallize(value);
  }
  private handleDcpSsChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setState({ DCP_SS: value });
  }
  private handleDcpIncomeSourceChange(value: string): void {
    this.setState({ DCP_INCOME_SOURCE: value });
  }
  private handleDcpContAmount(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setState({ DCP_CONTRIBUTION_AMOUNT: value });
  }
  private handleDcpEmpContAmount(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setState({ DCP_EMP_CONTRIBUTION_AMOUNT: value });
  }
  private handleDcpTransferTo(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DCP_TRANSFER_TO: e.target.value });
  }
  private setDcpTransferDate(value: string): void {
    this.setState({ DCP_TRANSFER_DATE: value });
  }
  private handleDcpTransferDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setDcpTransferDate(e.target.value);
  }

  private async revalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const parseVal = makeValueAbsPropFromString(this.state.VALUE);
    if (!parseVal.checksOK) {
      this.props.showAlert(
        `Asset value ${this.state.VALUE} should be a numerical or % value`,
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

    const newName = makeRevalueName(this.state.NAME, this.props.model);

    const revalueTransaction: Transaction = {
      NAME: `${newName}`,
      ERA: 0, // new things are automatically current
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0.0",
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.START,
      TYPE: revalueAsset,
      RECURRENCE: "",
      STOP_DATE: "",
      CATEGORY: "",
    };
    log(`adding transaction ${showObj(revalueTransaction)}`);
    const message = this.props.checkTransactionFunction(
      revalueTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      this.props.showAlert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueTransaction,
      this.props.model,
    );

    this.props.showAlert("added new data");
    // clear fields
    this.setState(this.defaultState);
    this.resetSelect(this.incomeSourceSelectID);
    return;
  }

  private async addFromForm(e: FormEvent<Element>) {
    e.preventDefault();
    this.add();
  }
  private async addFromButton(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.add();
  }

  private async add() {
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

    const isNotValid = !isValidValue(this.state.VALUE, this.props.model);
    if (isNotValid) {
      this.props.showAlert(
        `Asset value ${this.state.VALUE} ` +
          `should be a numerical value or built from a setting`,
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
    const isNotANumber = !isNumberString(this.state.GROWTH);
    if (isNotANumber) {
      const setting = getSettings(
        this.props.model.settings,
        this.state.GROWTH,
        "",
        false, // allow for it not beinig there
      );
      if (setting === "") {
        this.props.showAlert(
          `Growth value '${this.state.GROWTH}' ` +
            `should be a numerical or setting value`,
        );
        return;
      }
    }
    if (this.state.inputting === inputtingPension) {

      const parsedYNCPI = makeBooleanFromYesNo(this.state.GROWS_WITH_INFLATION);
      if (!parsedYNCPI.checksOK) {
        this.props.showAlert(
          `Grows with CPI: '${this.state.GROWS_WITH_INFLATION}' ` +
            `should be a Y/N value`,
        );
        return;
      }

      const asset1Name = pensionPrefix + this.state.NAME;
      const asset2Name = taxFree + this.state.NAME;
      const asset3Name =
      crystallizedPension + this.state.LIABILITY + dot + this.state.NAME;
      const copyModel = makeModelFromJSON(JSON.stringify(this.props.model));

      const asset1: Asset = {
        NAME: asset1Name,
        ERA: 0, // new things are automatically current
        VALUE: this.state.VALUE,
        QUANTITY: "", // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: !parsedYNCPI.value,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      };
      {
        const message = this.props.checkAssetFunction(asset1, this.props.model);
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }

      const asset2: Asset = {
        NAME: asset2Name,
        ERA: 0, // new things are automatically current
        VALUE: "0.0",
        QUANTITY: "", // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      };
      const message = this.props.checkAssetFunction(asset2, this.props.model);
      if (message.length > 0) {
        this.props.showAlert(message);
        return;
      }

      const asset3: Asset = {
        NAME: asset3Name,
        ERA: 0, // new things are automatically current
        VALUE: "0.0",
        QUANTITY: "", // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      };
      {
        const message = this.props.checkAssetFunction(asset3, this.props.model);
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }
      const asset4Name =
        crystallizedPension +
        this.state.DCP_TRANSFER_TO +
        dot +
        this.state.NAME;

      const asset4: Asset = {
        NAME: asset4Name,
        ERA: 0, // new things are automatically current
        VALUE: "0.0",
        QUANTITY: "", // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      };
      if (this.state.DCP_TRANSFER_TO !== "") {
        const message = this.props.checkAssetFunction(asset4, this.props.model);
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }
      let contributions: Transaction | undefined = undefined;
      if (this.state.DCP_INCOME_SOURCE !== '') {

        // If there's an income, check other inputs like
        // whether it's a salary sacrifice etc
        const parseYNSS = makeBooleanFromYesNo(this.state.DCP_SS);
        if (!parseYNSS.checksOK) {
          this.props.showAlert(
            `Salary sacrifice '${this.state.DCP_SS}' should be a Y/N value`,
          );
          return;
        }
        let isNotANumber = !isNumberString(this.state.DCP_CONTRIBUTION_AMOUNT);
        if (isNotANumber) {
          this.props.showAlert(
            `Contribution amount '${this.state.DCP_CONTRIBUTION_AMOUNT}' ` +
              `should be a numerical value`,
          );
          return;
        }
        isNotANumber = !isNumberString(this.state.DCP_EMP_CONTRIBUTION_AMOUNT);
        if (isNotANumber) {
          this.props.showAlert(
            `Contribution amount '${this.state.DCP_EMP_CONTRIBUTION_AMOUNT}' ` +
              `should be a numerical value`,
          );
          return;
        }
        const contPc = parseFloat(this.state.DCP_CONTRIBUTION_AMOUNT);
        const contEmpPc = parseFloat(this.state.DCP_EMP_CONTRIBUTION_AMOUNT);

        const toProp = contPc === 0 ? 0.0 : (contPc + contEmpPc) / contPc;

        await this.props.submitAssetFunction(asset1, copyModel);
        await this.props.submitAssetFunction(asset2, copyModel);
        await this.props.submitAssetFunction(asset3, copyModel);
        if (this.state.DCP_TRANSFER_TO !== "") {
          await this.props.submitAssetFunction(asset4, copyModel);
        }

        contributions = {
          NAME: (parseYNSS.value ? pensionSS : pensionPrefix) + this.state.NAME,
          ERA: 0, // new things are automatically current
          FROM: this.state.DCP_INCOME_SOURCE,
          FROM_ABSOLUTE: false,
          FROM_VALUE: this.state.DCP_CONTRIBUTION_AMOUNT,
          TO: asset1Name,
          TO_ABSOLUTE: false,
          TO_VALUE: `${toProp}`,
          DATE: this.state.START, // match the income start date
          STOP_DATE: this.state.DCP_STOP, // match the income stop date
          RECURRENCE: "",
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        {
          const message = this.props.checkTransactionFunction(
            contributions,
            this.props.model,
          );
          if (message.length > 0) {
            this.props.showAlert(message);
            return;
          }
        }
      } else {
        // a pension without a contributing income 
        // set up the taxfree part it crystallizes to
        console.log(`submit assets ${asset1.NAME} ${asset2.NAME}`);
        await this.props.submitAssetFunction(asset1, copyModel);
        await this.props.submitAssetFunction(asset2, copyModel);
        await this.props.submitAssetFunction(asset3, copyModel);
        if (this.state.DCP_TRANSFER_TO !== "") {
          await this.props.submitAssetFunction(asset4, copyModel);
        }
        console.log(`model assets ${copyModel.assets.map((a)=>{
          return a.NAME;
        })}`);
      }

      const crystallizeTaxFree: Transaction = {
        NAME: moveTaxFreePart + this.state.NAME,
        ERA: 0, // new things are automatically current
        FROM: asset1Name,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.25", // TODO move hard coded value out of UI code
        TO: asset2Name,
        TO_ABSOLUTE: false,
        TO_VALUE: `1.0`,
        DATE: this.state.DCP_CRYSTALLIZE,
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
      {
        const message = this.props.checkTransactionFunction(
          crystallizeTaxFree,
          this.props.model,
        );
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }
      const crystallize: Transaction = {
        NAME: crystallizedPension + this.state.NAME,
        ERA: 0, // new things are automatically current,
        FROM: asset1Name,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: asset3Name,
        TO_ABSOLUTE: false,
        TO_VALUE: `1.0`,
        DATE: this.state.DCP_CRYSTALLIZE, // +1 sec
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
      {
        const message = this.props.checkTransactionFunction(
          crystallize,
          this.props.model,
        );
        if (message.length > 0) {
          this.props.showAlert(message);
          return;
        }
      }
      let transfer: Transaction | undefined;
      if (this.state.DCP_TRANSFER_TO !== "") {
        transfer = {
          NAME: transferCrystallizedPension + this.state.NAME,
          ERA: 0, // new things are automatically current,
          FROM: asset3Name,
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1.0",
          TO: asset4Name,
          TO_ABSOLUTE: false,
          TO_VALUE: "1.0",
          DATE: this.state.DCP_TRANSFER_DATE,
          STOP_DATE: "",
          RECURRENCE: "",
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        {
          const message = this.props.checkTransactionFunction(
            transfer,
            this.props.model,
          );
          if (message.length > 0) {
            this.props.showAlert(message);
            return;
          }
        }
      }

      const dcGeneratorDetails: DCGeneratorDetails = {
        VALUE: this.state.VALUE,
        GROWS_WITH_CPI: this.state.GROWS_WITH_INFLATION,
        GROWTH: this.state.GROWTH,
        TAX_LIABILITY: this.state.LIABILITY,
        CATEGORY: this.state.CATEGORY,
        START: this.state.START,
        STOP: this.state.DCP_STOP,
        CRYSTALLIZE: this.state.DCP_CRYSTALLIZE,
        SS: this.state.DCP_SS,
        INCOME_SOURCE: this.state.DCP_INCOME_SOURCE,
        CONTRIBUTION_AMOUNT: this.state.DCP_CONTRIBUTION_AMOUNT,
        EMP_CONTRIBUTION_AMOUNT: this.state.DCP_EMP_CONTRIBUTION_AMOUNT,
        TRANSFER_TO: this.state.DCP_TRANSFER_TO,
        TRANSFER_DATE: this.state.DCP_TRANSFER_DATE,  
      };

      console.log(`dcGeneratorDetails = ${dcGeneratorDetails}`)

      this.props.submitGeneratorFunction(
        {
          NAME: this.state.NAME,
          ERA: 0,
          TYPE: 'Defined Contributions',
          DETAILS: dcGeneratorDetails
        },
        this.props.model,
      );

      this.props.showAlert("added assets and transactions");
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
    } else {
      const parsedQuantity = makeQuantityFromString(this.state.QUANTITY);
      if (!parsedQuantity.checksOK) {
        this.props.showAlert(
          `Quantity '${this.state.QUANTITY}' ` +
            `should empty or a whole number value`,
        );
        return;
      }

      const name = this.state.LIABILITY;
      let builtLiability = "";
      if (name !== "") {
        builtLiability = name + cgt;
      }
      const liabilityMessage = checkAssetLiability(builtLiability);
      if (liabilityMessage !== "") {
        this.props.showAlert(liabilityMessage);
        return;
      }
      let purchasePrice = this.state.PURCHASE_PRICE;
      if (purchasePrice === "") {
        purchasePrice = "0";
      }
      const parsedYNCPI = makeBooleanFromYesNo(this.state.GROWS_WITH_INFLATION);
      if (!parsedYNCPI.checksOK) {
        this.props.showAlert(
          `Grows with CPI: '${this.state.GROWS_WITH_INFLATION}' ` +
            `should be a Y/N value`,
        );
        return;
      }

      // log('adding something ' + showObj(this));
      const asset: Asset = {
        NAME: this.state.NAME,
        ERA: 0, // new things are automatically current,
        VALUE: this.state.VALUE,
        QUANTITY: this.state.QUANTITY,
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: !parsedYNCPI.value,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: purchasePrice,
        LIABILITY: builtLiability,
      };
      // log(`Adding asset s${showObj(asset)}`);
      const message = this.props.checkAssetFunction(asset, this.props.model);
      if (message.length > 0) {
        this.props.showAlert(message);
      } else {
        await this.props.submitAssetFunction(asset, this.props.model);
        this.props.showAlert("added new asset");
        // clear fields
        this.setState(this.defaultState);
        this.resetSelect(this.incomeSourceSelectID);
      }
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    const deleteResult = await this.props.deleteAssetFunction(this.state.NAME);
    if (deleteResult.message === "") {
      if (deleteResult.itemsDeleted.length === 1) {
        this.props.showAlert("deleted asset");
      } else {
        this.props.showAlert(`deleted ${deleteResult.itemsDeleted}`);
      }
      // clear fields
      this.setState(this.defaultState);
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
  private inputPension(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingPension,
    });
  }
  private inputAsset(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingAsset,
    });
  }
  private inputRevalue(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = "0";
    }
  }
}
