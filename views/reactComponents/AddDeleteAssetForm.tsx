import React, { Component, FormEvent } from "react";
import { Button, Col, Row } from "react-bootstrap";

import { checkAssetLiability, checkRecurrence, isValidValue } from "../../models/checks";
import {
  Asset,
  ModelData,
  Transaction,
  Trigger,
  FormProps,
  DeleteResult,
  Generator,
  DCGeneratorDetails,
  BondGeneratorDetails,
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
  inputMode: string;
  DCP_STOP: string;
  DCP_CRYSTALLIZE: string;
  DCP_SS: string;
  DCP_INCOME_SOURCE: string;
  DCP_CONTRIBUTION_AMOUNT: string;
  DCP_EMP_CONTRIBUTION_AMOUNT: string;
  DCP_TRANSFER_TO: string;
  DCP_TRANSFER_DATE: string;
  BOND_DURATION: string;
  BOND_SOURCE: string;
  BOND_TARGET: string;
  BOND_YEAR: string;
  BOND_RECURRENCE: string;
  BOND_RECURRENCE_STOP: string;
}

const inputtingRevalue = "revalue";
const inputtingAsset = "asset";
const inputtingPension = "definedContributionsPension";
const inputtingBonds = "bonds";

interface EditAssetProps extends FormProps {
  checkAssetFunction: (a: Asset, model: ModelData) => string;
  submitAssetFunction: (arg0: Asset) => Promise<void>;
  deleteAssetFunction: (name: string) => Promise<DeleteResult>;
  checkTransactionFunction: (t: Transaction, model: ModelData) => string;
  submitTransactionFunction: (
    transactionInput: Transaction,
  ) => Promise<void>;
  submitTriggerFunction: (
    triggerInput: Trigger,
  ) => Promise<void>;
  submitGeneratorFunction: (
    generator: Generator,
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
      inputMode: inputtingAsset,
      DCP_STOP: "",
      DCP_CRYSTALLIZE: "",
      DCP_SS: "",
      DCP_INCOME_SOURCE: "",
      DCP_CONTRIBUTION_AMOUNT: "",
      DCP_EMP_CONTRIBUTION_AMOUNT: "",
      DCP_TRANSFER_TO: "",
      DCP_TRANSFER_DATE: "",
      BOND_DURATION: "",
      BOND_SOURCE: "",
      BOND_TARGET: "",
      BOND_YEAR: "",
      BOND_RECURRENCE: "",
      BOND_RECURRENCE_STOP: "",
    };

    this.state = this.defaultState;

    this.add = this.add.bind(this);
    this.addFromButton = this.addFromButton.bind(this);
    this.addFromForm = this.addFromForm.bind(this);
    this.delete = this.delete.bind(this);
    this.goButtons = this.goButtons.bind(this);
    this.revalue = this.revalue.bind(this);
    this.topRowOfForm = this.topRowOfForm.bind(this);
    this.growthAndInflation = this.growthAndInflation.bind(this);
  }
/*
  For bonds:

  Start date. START
  Duration.  BOND_DURATION
  Invested amount. VALUE
  Interest rate. GROWTH
  Source asset of investment amount. BOND_SOURCE
  Target asset on bond maturation.  BOND_TARGET
  Recurrence. BOND_RECURRENCE
  Recurrence. BOND_RECURRENCE_STOP
  Year. BOND_YEAR
  Category: CATEGORY
*/

  private inputsForGeneralAsset(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputMode === inputtingAsset ? "block" : "none",
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ LIABILITY: e.target.value });
              }}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ PURCHASE_PRICE: e.target.value });
              }}
            />
          </Col>
        </Row>
      </div>
    );
  }

  private getAssetOptions() {
    return this.props.model.assets
      .filter((a) => {
        return !a.IS_A_DEBT;
      })
      .sort((a: Asset, b: Asset) => {
        return lessThan(a.NAME, b.NAME);
      });
  }

  private inputAssetName(
    label: string,
    action: (s:string) => void,
    id: string,
    defaultText: string,
  ): React.ReactNode {
    return (
      <>
        {label}
        <Spacer height={10} />
        {itemOptions(
          this.getAssetOptions(),
          this.props.model,
          action,
          id,
          defaultText,
        )}
      </>
    );
  }

  private growthAndInflation(): React.ReactNode {
    if (this.state.inputMode === inputtingRevalue) {
      // nothing here
    } else if (this.state.inputMode === inputtingAsset
      || this.state.inputMode === inputtingPension) {
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ GROWTH: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="assetcpi-grows"
              value={this.state.GROWS_WITH_INFLATION}
              placeholder="Enter Y/N"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ GROWS_WITH_INFLATION: e.target.value });
              }}
            />
          </Col>
        </Row>
      );
    } else if (this.state.inputMode === inputtingBonds) {
      return (
        <>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ GROWTH: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Duration (e.g. 5y or 6m)`}
              type="text"
              name="duration"
              value={this.state.BOND_DURATION}
              placeholder="Enter duration"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ BOND_DURATION: e.target.value });
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Input
              title={`Recurrence (optional, e.g. 5y or 6m)`}
              type="text"
              name="recurrence"
              value={this.state.BOND_RECURRENCE}
              placeholder="Enter recurrence"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ BOND_RECURRENCE: e.target.value });
              }}
            />
          </Col>
          <Col>
          <Input
              title={`Recurrence end (optional)`}
              type="text"
              name="recurrencestop"
              value={this.state.BOND_RECURRENCE_STOP}
              placeholder="When recurrence stops"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ BOND_RECURRENCE_STOP: e.target.value });
              }}
            />
          </Col>
        </Row>
        </>
      );
    }
  }

  private topRowOfForm(): React.ReactNode {
    // log(`this.state.inputting = ${this.state.inputting}`);
    if (this.state.inputMode === inputtingAsset) {
      return (
        <Row>
          <Col>
            <Input
              title={`Asset name`}
              type="text"
              name="assetname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ NAME: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Asset value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ VALUE: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={"Quantity (optional)"}
              type="text"
              name="assetquantity"
              value={this.state.QUANTITY}
              placeholder="Enter quantity"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ QUANTITY: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="assetcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ CATEGORY: e.target.value });
              }}
            />
          </Col>
        </Row>
      );
    } else if (this.state.inputMode === inputtingPension) {
      return (
        <Row>
          <Col>
            <Input
              title={`Pension name`}
              type="text"
              name="assetname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ NAME: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Pension value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ VALUE: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="Category (optional)"
              type="text"
              name="assetcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ CATEGORY: e.target.value });
              }}
            />
          </Col>
        </Row>
      );
    } else if (this.state.inputMode === inputtingRevalue) {
      return (
        <Row>
          <Col>{this.inputAssetName(
            "Asset name",
            (s: string) => {
              this.setState({ NAME: s });
            },
            'assetname',
            'Select Asset',
          )}</Col>
          <Col>
            <Input
              title={`Asset value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ VALUE: e.target.value });
              }}
            />
          </Col>
        </Row>
      );
    } else if (this.state.inputMode === inputtingBonds) {
      return (
        <Row>
          <Col>
            <Input
              title={`Bond name`}
              type="text"
              name="assetname"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ NAME: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title={`Asset value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ VALUE: e.target.value });
              }}
            />
          </Col>
        </Row>
      );
    }
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputMode === inputtingAsset) {
      return makeButton(
        "Create new asset (over-writes any existing with the same name)",
        this.addFromButton,
        "addAsset",
        "addAsset",
        "primary",
      );
    } else if (this.state.inputMode === inputtingRevalue) {
      return makeButton(
        "Revalue this asset",
        this.revalue,
        "revalueAsset",
        "revalueAsset",
        "primary",
      );
    } else if (this.state.inputMode === inputtingPension) {
      return makeButton(
        "Create new pension",
        this.addFromButton,
        "addPension",
        "addPension",
        "primary",
      );
    } else if (this.state.inputMode === inputtingBonds) {
      return makeButton(
        "Add new bond",
        this.addFromButton,
        "addBond",
        "addBond",
        "primary",
      );
    }
  }

  private inputsForDCP(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputMode === inputtingPension ? "block" : "none",
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Stop date for contributions`}
            model={this.props.model}
            showAlert={this.props.showAlert}
            setDateFunction={(s) => {
              this.setState({ DCP_STOP: s });
            }}
            inputName="stop date"
            inputValue={this.state.DCP_STOP}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ DCP_STOP: e.target.value });
            }}
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
            setDateFunction={
              (s) => {
                this.setState({ DCP_CRYSTALLIZE: s });
              }
            }
            inputName="crystallize date"
            inputValue={this.state.DCP_CRYSTALLIZE}
            onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ DCP_CRYSTALLIZE: e.target.value });
            }}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        <div className="container-fluid">
          {this.state.inputMode === inputtingPension ? (
            <DateSelectionRow
              introLabel="On death, pension transfers to (optional)"
              model={this.props.model}
              showAlert={this.props.showAlert}
              setDateFunction={(s) => {
                this.setState({ DCP_TRANSFER_DATE: s });
              }}
              inputName="transferred stop date"
              inputValue={this.state.DCP_TRANSFER_DATE}
              onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DCP_TRANSFER_DATE: e.target.value });
              }}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DCP_SS: e.target.value });
              }}
            />
          </Col>
          <Col>
            <label>Income from which pension contributions are made</label>
            {incomeOptions(
              this.props.model,
              (s: string) => {
                // console.log(`set DCP_INCOME_SOURCE ${s}`);
                this.setState({ DCP_INCOME_SOURCE: s });
              },
              this.incomeSourceSelectID,
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <Input
              title="Pension contribution amount (>0, e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmountPensionAsset"
              value={this.state.DCP_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DCP_CONTRIBUTION_AMOUNT: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="Employer contribution amount (e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmount"
              value={this.state.DCP_EMP_CONTRIBUTION_AMOUNT}
              placeholder="Employer contributions"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DCP_EMP_CONTRIBUTION_AMOUNT: e.target.value });
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Input
              title="Income Tax Liability (someone's name)"
              type="text"
              name="liabilityIC"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ LIABILITY: e.target.value });
              }}
            />
          </Col>
          <Col>
            <Input
              title="On death, pension transfers to (optional)"
              type="text"
              name="transferNameAsset"
              value={this.state.DCP_TRANSFER_TO}
              placeholder="Enter person to transfer to"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({ DCP_TRANSFER_TO: e.target.value });
              }}
            />
          </Col>
        </Row>
      </div>
    );
  }

  private renderGenerators(
    generators: Generator[],
  ){
    // log(`render ${generators.length} generators`);
    return generators.map((g) => {
      // log(`use key = ${g.NAME}`);
      return <div
          id={g.NAME}
          key={g.NAME}
        >
        <div><b>{g.NAME}</b></div>
        {Object.keys(g.DETAILS).map((key) => {
          return <div key={key}>
            {`${key} ${g.DETAILS[key]}`}
          </div>;
        })}
        <Button
          onClick={()=>{
            console.log(`edit ${g.NAME}`);
            if (g.TYPE === "Defined Contributions") {       
              const details: DCGeneratorDetails = g.DETAILS;       
              this.setState({
                inputMode: inputtingPension,

                NAME: g.NAME,
                VALUE: details.VALUE,
                QUANTITY: '',
                START: details.START,
                GROWTH: details.GROWTH,
                GROWS_WITH_INFLATION: details.GROWS_WITH_CPI ? details.GROWS_WITH_CPI : 'n',
                LIABILITY: details.TAX_LIABILITY,
                PURCHASE_PRICE: '',
                CATEGORY: details.CATEGORY,
                DCP_STOP: details.STOP,
                DCP_CRYSTALLIZE: details.CRYSTALLIZE,
                DCP_SS: details.SS,
                DCP_INCOME_SOURCE: details.INCOME_SOURCE,
                DCP_CONTRIBUTION_AMOUNT: details.CONTRIBUTION_AMOUNT,
                DCP_EMP_CONTRIBUTION_AMOUNT: details.EMP_CONTRIBUTION_AMOUNT,
                DCP_TRANSFER_TO: details.TRANSFER_TO,
                DCP_TRANSFER_DATE: details.TRANSFER_DATE,
              });
              this.setSelect(
                this.incomeSourceSelectID, 
                this.props.model.incomes.map((a) => {return a.NAME}).indexOf(details.INCOME_SOURCE) + 1
              );
            } else if(g.TYPE === "Bonds") {
              const details: BondGeneratorDetails = g.DETAILS;

              this.setState({
                inputMode: inputtingBonds,

                NAME: g.NAME,
                VALUE: details.VALUE,
                START: details.START,
                GROWTH: details.GROWTH,
                CATEGORY: details.CATEGORY,
                BOND_DURATION: details.DURATION,
                BOND_SOURCE: details.SOURCE,
                BOND_TARGET: details.TARGET,
                BOND_YEAR: details.YEAR,
                BOND_RECURRENCE: details.RECURRENCE,
                BOND_RECURRENCE_STOP: details.RECURRENCE_STOP,
              });
              const items = this.getAssetOptions();
              const itemNames = items.map((a) => {return a.NAME});
              console.log(`look for ${details.SOURCE} in ${itemNames}`)
              this.setSelect('selectSourceAsset', itemNames.indexOf(details.SOURCE) + 1);
              this.setSelect('selectTargetAsset', itemNames.indexOf(details.TARGET) + 1);
            }
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
      </div>
    })  
  }
  
  private renderDCPGenerators(
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
  private renderBondGenerators(
    generators: Generator[],
  ){
    return <>
      {this.renderGenerators(
        generators.filter((g) => {
          return g.TYPE === 'Bonds';
        })
      )}
    </>;
  }

  private inputModeButtons(){
    return  <div className="btn-group ml-3" role="group"> {/* Buttons for input modes */}
      {[
        {
          mode: inputtingAsset,
          label: "Add new asset mode",
          id: "inputAsset",
        },
        {
          mode: inputtingPension,
          label: "Add pension mode",
          id: "useDCPInputs",
        },
        {
          mode: inputtingRevalue,
          label: "Revalue asset mode",
          id: "revalueAssetInputs",
        },
        {
          mode: inputtingBonds,
          label: "Add bond mode",
          id: "bondInputs",
        }
      ].map((x) => {
        return makeButton(
          x.label,
          (e) => {
            e.preventDefault();
            this.setState({
              ...this.state,
              inputMode: x.mode,
            });            
          },
          x.id,
          x.id,
          this.state.inputMode === x.mode
            ? "primary"
            : "outline-secondary",
        )
      })}
    </div>
  }

  private dateSelectorForStart(){
    return  <div className="container-fluid">
      {/* fills width */}
      <DateSelectionRow
        introLabel={`Date on which the ${
          this.state.inputMode === inputtingRevalue
            ? "revaluation occurs"
            : this.state.inputMode === inputtingPension
            ? "pension asset begins"
            : "asset starts"
        }`}
        model={this.props.model}
        showAlert={this.props.showAlert}
        setDateFunction={(s) => {
          this.setState({ START: s });
        }}
        inputName="start date"
        inputValue={this.state.START}
        onChangeHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
          this.setState({ START: e.target.value });
        }}
        triggers={this.props.model.triggers}
        submitTriggerFunction={this.props.submitTriggerFunction}
      />
    </div>

  }

  private inputsForBonds(){
    if (this.state.inputMode !== inputtingBonds) {
      return <></>;
    }
    return <>
    <Row>
      <Col>{this.inputAssetName(
        "Source asset for investment",
        (s: string) => {
          this.setState({ BOND_SOURCE: s });
        },
        'selectSourceAsset',
        'Select Source Asset',
      )}</Col>
      <Col>{this.inputAssetName(
        "Target asset for maturing bond",
        (s: string) => {
          this.setState({ BOND_TARGET: s });
        },
        'selectTargetAsset',
        'Select Target Asset',
      )}</Col>
    </Row>
    <Row>
      <Col>
        <Input
          title="Year we'll use funds (e.g. 2025)"
          type="text"
          name="bondYear"
          value={this.state.BOND_YEAR}
          placeholder="Enter year"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ BOND_YEAR: e.target.value });
          }}
        />
      </Col>
      <Col>
        <Input
          title="Category (optional)"
          type="text"
          name="assetcategory"
          value={this.state.CATEGORY}
          placeholder="category"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ CATEGORY: e.target.value });
          }}
        />
      </Col>
    </Row>    
    </>
  }

  public render() {
    // log('rendering an AddDeleteAssetForm');
    return (
      <>
        <div className="ml-3 my-4">
          {this.renderDCPGenerators(this.props.model.generators)}
          {this.renderBondGenerators(this.props.model.generators)}
        </div>
        {this.inputModeButtons()}
        <form className="container-fluid" onSubmit={this.addFromForm}>
          {this.topRowOfForm()}
          {this.dateSelectorForStart()}
          {this.growthAndInflation()}
          {this.inputsForGeneralAsset()}
          {this.inputsForDCP()}
          {this.inputsForBonds()}
          {this.goButtons()}
        </form>
      </>
    );
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
      if (this.state.inputMode === inputtingPension ||
        this.state.inputMode === inputtingBonds
      ) {
        // this is how we _edit_ as well as create new
        // so we should only warn and stop if we're trying
        // to create new
        /*
        const matchingItem = this.props.model.generators.find((a) => {
          return a.NAME === this.state.NAME;
        });
        if (matchingItem !== undefined) {
          this.props.showAlert(
            `There's already a generator called ${this.state.NAME}`,
          );
          return;
        }
        */
      } else {
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
    }

    // check VALUE
    const isNotValid = !isValidValue(this.state.VALUE, this.props.model);
    if (isNotValid) {
      this.props.showAlert(
        `Asset value ${this.state.VALUE} ` +
          `should be a numerical value or built from a setting`,
      );
      return;
    }
    // check START
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
    // check GROWTH
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
    if (this.state.inputMode === inputtingPension) {

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
      copyModel.name = 'temporary copy';
      copyModel.undoModel = undefined;
      copyModel.redoModel = undefined;

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

        copyModel.assets.push(asset1);
        copyModel.assets.push(asset2);
        copyModel.assets.push(asset3);
        if (this.state.DCP_TRANSFER_TO !== "") {
          copyModel.assets.push(asset4);
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
            copyModel,
          );
          if (message.length > 0) {
            this.props.showAlert(message);
            return;
          }
        }
      } else {
        // a pension without a contributing income 
        // set up the taxfree part it crystallizes to
        copyModel.assets.push(asset1);
        copyModel.assets.push(asset2);
        copyModel.assets.push(asset3);
        if (this.state.DCP_TRANSFER_TO !== "") {
          copyModel.assets.push(asset4);
        }
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
          copyModel,
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
          copyModel,
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
            copyModel,
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
      );

      this.props.showAlert("added assets and transactions");
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
    } else if (this.state.inputMode === inputtingAsset) {
      // check QUANTITY
      const parsedQuantity = makeQuantityFromString(this.state.QUANTITY);
      if (!parsedQuantity.checksOK) {
        this.props.showAlert(
          `Quantity '${this.state.QUANTITY}' ` +
            `should empty or a whole number value`,
        );
        return;
      }

      // check LIABILITY
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

      // check PURCHASE_PRICE
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
        await this.props.submitAssetFunction(asset);
        this.props.showAlert("added new asset");
        // clear fields
        this.setState(this.defaultState);
        this.resetSelect(this.incomeSourceSelectID);
      }
    } else if (this.state.inputMode === inputtingBonds) {
      // check DURATION
      if (this.state.BOND_DURATION.length === 0) {
        this.props.showAlert(
          `Please provide a duration e.g. 1y, 5y or 6m`,
        );
        return;
    } else {
        const checkDur = checkRecurrence(this.state.BOND_DURATION);
        if (checkDur !== '') {
          this.props.showAlert(
            `Duration value '${this.state.BOND_DURATION}' ` +
              `should be something like 1y, 5y, or 6m`,
          );
          return;
        }
      }

      // check RECURRENCE
      if (this.state.BOND_RECURRENCE.length > 0) {
        const checkRec = checkRecurrence(this.state.BOND_RECURRENCE);
        if (checkRec !== '') {
          this.props.showAlert(
            `Recurrence value '${this.state.BOND_RECURRENCE}' ` +
              `should be something like 1y, 5y, or 6m`,
          );
          return;
        }
      }
      // check BOND_SOURCE
      if (!this.props.model.assets.find((a) => {
        return a.NAME === this.state.BOND_SOURCE
      })) {
        this.props.showAlert(
          `Bond source asset '${this.state.BOND_SOURCE}' ` +
            `not found in model`,
        );
        return;
      }
      // check TARGET_ASSET
      if (!this.props.model.assets.find((a) => {
        return a.NAME === this.state.BOND_TARGET
      })) {
        this.props.showAlert(
          `Bond source asset '${this.state.BOND_TARGET}' ` +
            `not found in model`,
        );
        return;
      }
      // check YEAR
      try {
        const year = parseInt(this.state.BOND_YEAR);
        if (year < 1990 || year > 2200) { // TODO hard coded magic numbers
          this.props.showAlert(
            `Bond year '${this.state.BOND_YEAR}' ` +
              `should be something like 2025`,
          );
          return;  
        }
      } catch(err) {
        this.props.showAlert(
          `Bond year '${this.state.BOND_YEAR}' ` +
            `should be something like 2025`,
        );
        return;
      }

      const bondGeneratorDetails: BondGeneratorDetails = {
        VALUE: this.state.VALUE,
        GROWTH: this.state.GROWTH,
        CATEGORY: this.state.CATEGORY,
        START: this.state.START,
        DURATION: this.state.BOND_DURATION,
        SOURCE: this.state.BOND_SOURCE,
        TARGET: this.state.BOND_TARGET,
        YEAR: this.state.BOND_YEAR,
        RECURRENCE: this.state.BOND_RECURRENCE,
        RECURRENCE_STOP: this.state.BOND_RECURRENCE_STOP,
      };

      console.log(`bondGeneratorDetails = ${bondGeneratorDetails}`)

      this.props.submitGeneratorFunction(
        {
          NAME: this.state.NAME,
          ERA: 0,
          TYPE: 'Bonds',
          DETAILS: bondGeneratorDetails
        },
      );

      this.props.showAlert("added bond information");
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
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

  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = "0";
    }
  }
  private setSelect(id: string, index: number) {
    console.log(`setSelect on id = ${id} and index = ${index}`);
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = index;
    } else {
      console.log(`no element found with id = ${id}`);
    }
  }
}
