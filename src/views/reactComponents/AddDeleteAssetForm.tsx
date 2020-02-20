import React, { Component } from 'react';

import { checkAssetLiability, isNumberString } from '../../models/checks';
import { DbAsset, DbModelData, DbTransaction } from '../../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
  makeQuantityFromString,
  makeCashValueFromString,
  makeValueAbsPropFromString,
  isATransaction,
} from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import {
  cgt,
  pension,
  crystallizedPension,
  pensionSS,
  autogen,
  revalue,
  revalueAsset,
} from '../../localization/stringConstants';
import { incomeOptions } from './AddDeleteIncomeForm';

interface EditFormState {
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
}

const inputtingRevalue = 'revalue';
const inputtingAsset = 'asset';
const inputtingPension = 'definedContributionsPension';

interface EditProps {
  checkAssetFunction: any;
  submitAssetFunction: any;
  deleteAssetFunction: any;
  checkTransactionFunction: any;
  submitTransactionFunction: any;
  submitTrigger: any;
  model: DbModelData;
}
export class AddDeleteAssetForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  private incomeSourceSelectID = 'fromIncomeSelectAssetForm';

  public constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteAssetForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      QUANTITY: '',
      START: '',
      GROWTH: '',
      GROWS_WITH_INFLATION: '',
      PURCHASE_PRICE: '',
      LIABILITY: '',
      CATEGORY: '',
      inputting: inputtingAsset,
      DCP_STOP: '',
      DCP_CRYSTALLIZE: '',
      DCP_SS: '',
      DCP_INCOME_SOURCE: '',
      DCP_CONTRIBUTION_AMOUNT: '',
      DCP_EMP_CONTRIBUTION_AMOUNT: '',
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
    this.setStart = this.setStart.bind(this);
    this.inputPension = this.inputPension.bind(this);
    this.inputAsset = this.inputAsset.bind(this);
    this.inputRevalue = this.inputRevalue.bind(this);
    this.setStop = this.setStop.bind(this);
    this.setCrystallize = this.setCrystallize.bind(this);
    this.handleCrystallizeChange = this.handleCrystallizeChange.bind(this);
    this.handleDcpIncomeSourceChange = this.handleDcpIncomeSourceChange.bind(
      this,
    );
    this.handleDcpContAmount = this.handleDcpContAmount.bind(this);
    this.handleDcpEmpContAmount = this.handleDcpEmpContAmount.bind(this);
    this.handleDcpSsChange = this.handleDcpSsChange.bind(this);

    this.add = this.add.bind(this);
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
          display: this.state.inputting === inputtingAsset ? 'block' : 'none',
        }}
      >
        <div className="row">
          <div className="col">
            <Input
              title="Capital Gains Tax Liability (empty or someone's name)"
              type="text"
              name="liabilityCGT"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Original purchase price (optional, needed for CGT purposes)"
              type="text"
              name="purchase"
              value={this.state.PURCHASE_PRICE}
              placeholder="purchase"
              onChange={this.handlePurchasePriceChange}
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
      </div>
    );
  }

  private growthAndInflation(): React.ReactNode {
    if (this.state.inputting !== inputtingRevalue) {
      return (
        <div className="row">
          <div className="col">
            <Input
              title="Annual growth percentage (excluding inflation, e.g. 2 for 2% p.a.)"
              type="text"
              name="assetgrowth"
              value={this.state.GROWTH}
              placeholder="Enter growth"
              onChange={this.handleGrowthChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Does value grow with inflation?"
              type="text"
              name="assetcpi-grows"
              value={this.state.GROWS_WITH_INFLATION}
              placeholder="Enter Y/N"
              onChange={this.handleGrowsWithCPIChange}
            />
          </div>
        </div>
      );
    }
  }

  private ValueQuantityAndCategory(): React.ReactNode {
    if (this.state.inputting === inputtingRevalue) {
      return (
        <div className="row">
          <div className="col">
            <Input
              title={`Asset value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="row">
          <div className="col">
            <Input
              title={`${
                this.state.inputting === inputtingPension ? 'Pension' : 'Asset'
              } value`}
              type="text"
              name="assetvalue"
              value={this.state.VALUE}
              placeholder="Enter value"
              onChange={this.handleValueChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title={'Quantity (optional)'}
              type="text"
              name="assetquantity"
              value={this.state.QUANTITY}
              placeholder="Enter quantity"
              onChange={this.handleQuantityChange}
            />
          </div>
          {/* end col */}
          <div className="col">
            <Input
              title="Category (optional)"
              type="text"
              name="assetcategory"
              value={this.state.CATEGORY}
              placeholder="category"
              onChange={this.handleCategoryChange}
            />
          </div>
        </div>
      );
    }
  }

  private goButtons(): React.ReactNode {
    if (this.state.inputting === inputtingAsset) {
      return (
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new asset (over-writes any existing with the same name)'
          }
          id="addAsset"
        />
      );
    } else if (this.state.inputting === inputtingRevalue) {
      return (
        <Button
          action={this.revalue}
          type={'primary'}
          title={'Revalue this asset'}
          id="revalueAsset"
        />
      );
    } else if (this.state.inputting === inputtingPension) {
      return (
        <Button
          action={this.add}
          type={'primary'}
          title={'Create new pension'}
          id="addPension"
        />
      );
    }
  }

  private inputsForDCP(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingPension ? 'block' : 'none',
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Stop date for contributions`}
            setDateFunction={this.setStop}
            inputName="stop date"
            inputValue={this.state.DCP_STOP}
            onChangeHandler={this.handleStopChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Date on which the pension crystallizes`}
            setDateFunction={this.setCrystallize}
            inputName="crystallize date"
            inputValue={this.state.DCP_CRYSTALLIZE}
            onChangeHandler={this.handleCrystallizeChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        <div className="row">
          <div className="col">
            <Input
              title="Is contribution salary-sacrificed"
              type="text"
              name="contributionSSAsset"
              value={this.state.DCP_SS}
              placeholder="Enter Y/N"
              onChange={this.handleDcpSsChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <label>Income from which pension contributions are madee</label>
            {incomeOptions(
              this.props.model,
              this.handleDcpIncomeSourceChange,
              this.incomeSourceSelectID,
            )}
          </div>{' '}
          {/* end col */}
        </div>{' '}
        <div className="row">
          <div className="col">
            <Input
              title="Pension contribution amount (>0, e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmountPensionAsset"
              value={this.state.DCP_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={this.handleDcpContAmount}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Employer contribution amount (e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmount"
              value={this.state.DCP_EMP_CONTRIBUTION_AMOUNT}
              placeholder="Employer contributions"
              onChange={this.handleDcpEmpContAmount}
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        <div className="row">
          <div className="col">
            <Input
              title="Income Tax Liability (someone's name)"
              type="text"
              name="liabilityIC"
              value={this.state.LIABILITY}
              placeholder="Enter liability"
              onChange={this.handleLiabilityChange}
            />
          </div>
          {/* end col */}
          <div className="col"></div>
          {/* end col */}
        </div>
        {/* end row */}
      </div>
    );
  }

  public render() {
    // log('rendering an AddDeleteAssetForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title={`${
                this.state.inputting === inputtingPension ? 'Pension' : 'Asset'
              } name`}
              type="text"
              name="assetname"
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
              title={`Delete ${
                this.state.inputting === inputtingPension ? 'pension' : 'asset'
              }`}
              id="deleteAsset"
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputAsset}
              type={
                this.state.inputting === inputtingAsset
                  ? 'primary'
                  : 'secondary'
              }
              title={'Add a new asset'}
              id="inputAsset"
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputPension}
              type={
                this.state.inputting === inputtingPension
                  ? 'primary'
                  : 'secondary'
              }
              title={'Add a pension'}
              id="useDCPInputs"
            />
          </div>
          {/* end col */}
          <div className="col">
            <Button
              action={this.inputRevalue}
              type={
                this.state.inputting === inputtingRevalue
                  ? 'primary'
                  : 'secondary'
              }
              title={'Revalue asset'}
              id="revalueAsset"
            />
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        {this.ValueQuantityAndCategory()}
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel={`Date on which the ${
              this.state.inputting === inputtingRevalue
                ? 'revaluation occurs'
                : this.state.inputting === inputtingPension
                ? 'pension asset begins'
                : 'asset starts'
            }`}
            setDateFunction={this.setStart}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        {this.growthAndInflation()}
        {this.inputsForGeneralAsset()}
        {this.inputsForDCP()}
        {this.goButtons()}
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
  private handlePurchasePriceChange(e: any) {
    const value = e.target.value;
    this.setState({ PURCHASE_PRICE: value });
  }
  private handleLiabilityChange(e: any) {
    const value = e.target.value;
    this.setState({ LIABILITY: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private handleQuantityChange(e: any) {
    const value = e.target.value;
    this.setState({ QUANTITY: value });
  }
  private handleGrowsWithCPIChange(e: any) {
    const value = e.target.value;
    this.setState({ GROWS_WITH_INFLATION: value });
  }
  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
  }
  private setStop(value: string): void {
    this.setState({ DCP_STOP: value });
  }
  private handleStopChange(e: any): void {
    const value = e.target.value;
    this.setStop(value);
  }
  private setCrystallize(value: string): void {
    this.setState({ DCP_CRYSTALLIZE: value });
  }
  private handleCrystallizeChange(e: any): void {
    const value = e.target.value;
    this.setCrystallize(value);
  }
  private handleDcpSsChange(e: any): void {
    const value = e.target.value;
    this.setState({ DCP_SS: value });
  }
  private handleDcpIncomeSourceChange(value: string): void {
    this.setState({ DCP_INCOME_SOURCE: value });
  }
  private handleDcpContAmount(e: any): void {
    const value = e.target.value;
    this.setState({ DCP_CONTRIBUTION_AMOUNT: value });
  }
  private handleDcpEmpContAmount(e: any): void {
    const value = e.target.value;
    this.setState({ DCP_EMP_CONTRIBUTION_AMOUNT: value });
  }

  private async revalue(e: any) {
    e.preventDefault();

    const parseVal = makeValueAbsPropFromString(this.state.VALUE);
    if (!parseVal.checksOK) {
      alert(
        `Income value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }

    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Value set date should be a date`);
      return;
    }

    let count = 1;
    while (
      isATransaction(`${revalue} ${this.state.NAME} ${count}`, this.props.model)
    ) {
      count += 1;
    }

    const revalueExpenseTransaction: DbTransaction = {
      NAME: `${revalue} ${this.state.NAME} ${count}`,
      FROM: '',
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.0',
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.START,
      TYPE: revalueAsset,
      RECURRENCE: '',
      STOP_DATE: '',
      CATEGORY: '',
    };
    // log(`adding transaction ${showObj(revalueExpenseTransaction)}`);
    const message = await this.props.checkTransactionFunction(
      revalueExpenseTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      alert(message);
      return;
    }
    await this.props.submitTransactionFunction(revalueExpenseTransaction);

    alert('added new data');
    // clear fields
    this.setState(this.defaultState);
    this.resetSelect(this.incomeSourceSelectID);
    return;
  }

  private async add(e: any) {
    e.preventDefault();

    let isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      alert(`Asset value ${this.state.VALUE} should be a numerical value`);
      return;
    }
    const date = checkTriggerDate(this.state.START, this.props.model.triggers);
    const isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    isNotANumber = !isNumberString(this.state.GROWTH);
    if (isNotANumber) {
      alert(`Growth value '${this.state.GROWTH}' should be a numerical value`);
      return;
    }

    if (this.state.inputting === inputtingPension) {
      const asset1Name = pension + this.state.NAME;
      const asset2Name = this.state.NAME + 'TaxFree';
      const asset3Name = crystallizedPension + this.state.LIABILITY;
      const asset1: DbAsset = {
        NAME: asset1Name,
        VALUE: this.state.VALUE,
        QUANTITY: '', // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      };
      let message = this.props.checkAssetFunction(asset1, this.props.model);
      if (message.length > 0) {
        alert(message);
        return;
      }

      const asset2: DbAsset = {
        NAME: asset2Name,
        VALUE: '0.0',
        QUANTITY: '', // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      };
      message = this.props.checkAssetFunction(asset2, this.props.model);
      if (message.length > 0) {
        alert(message);
        return;
      }

      const asset3: DbAsset = {
        NAME: asset3Name,
        VALUE: '0.0',
        QUANTITY: '', // pensions are continuous
        START: this.state.START,
        GROWTH: this.state.GROWTH,
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: this.state.CATEGORY,
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      };
      message = this.props.checkAssetFunction(asset3, this.props.model);
      if (message.length > 0) {
        alert(message);
        return;
      }

      const parseYNSS = makeBooleanFromYesNo(this.state.DCP_SS);
      if (!parseYNSS.checksOK) {
        alert(`Salary sacrifice '${this.state.DCP_SS}' should be a Y/N value`);
        return;
      }
      let isNotANumber = !isNumberString(this.state.DCP_CONTRIBUTION_AMOUNT);
      if (isNotANumber) {
        alert(
          `Contribution amount '${this.state.DCP_CONTRIBUTION_AMOUNT}' should be a numerical value`,
        );
        return;
      }
      isNotANumber = !isNumberString(this.state.DCP_EMP_CONTRIBUTION_AMOUNT);
      if (isNotANumber) {
        alert(
          `Contribution amount '${this.state.DCP_EMP_CONTRIBUTION_AMOUNT}' should be a numerical value`,
        );
        return;
      }
      const contPc = parseFloat(this.state.DCP_CONTRIBUTION_AMOUNT);
      const contEmpPc = parseFloat(this.state.DCP_EMP_CONTRIBUTION_AMOUNT);

      const toProp = contPc === 0 ? 0.0 : (contPc + contEmpPc) / contPc;

      await this.props.submitAssetFunction(asset1);
      await this.props.submitAssetFunction(asset2);
      await this.props.submitAssetFunction(asset3);

      const contributions: DbTransaction = {
        NAME: (parseYNSS.value ? pensionSS : pension) + this.state.NAME,
        FROM: this.state.DCP_INCOME_SOURCE,
        FROM_ABSOLUTE: false,
        FROM_VALUE: this.state.DCP_CONTRIBUTION_AMOUNT,
        TO: asset1Name,
        TO_ABSOLUTE: false,
        TO_VALUE: `${toProp}`,
        DATE: this.state.START, // match the income start date
        STOP_DATE: this.state.DCP_STOP, // match the income stop date
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
      message = this.props.checkTransactionFunction(
        contributions,
        this.props.model,
      );
      if (message.length > 0) {
        await this.props.deleteAssetFunction(asset1);
        await this.props.deleteAssetFunction(asset2);
        alert(message);
        return;
      }
      const crystallizeTaxFree: DbTransaction = {
        NAME: 'MoveTaxFreePart' + this.state.NAME,
        FROM: asset1Name,
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.25', // TODO move hard coded value out of UI code
        TO: asset2Name,
        TO_ABSOLUTE: false,
        TO_VALUE: `1.0`,
        DATE: this.state.DCP_CRYSTALLIZE,
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
      message = this.props.checkTransactionFunction(
        crystallizeTaxFree,
        this.props.model,
      );
      if (message.length > 0) {
        await this.props.deleteAssetFunction(asset1);
        await this.props.deleteAssetFunction(asset2);
        alert(message);
        return;
      }
      const crystallize: DbTransaction = {
        NAME: crystallizedPension + this.state.NAME,
        FROM: asset1Name,
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: asset3Name,
        TO_ABSOLUTE: false,
        TO_VALUE: `1.0`,
        DATE: this.state.DCP_CRYSTALLIZE, // +1 sec
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
        TYPE: autogen,
      };
      message = this.props.checkTransactionFunction(
        crystallize,
        this.props.model,
      );
      if (message.length > 0) {
        await this.props.deleteAssetFunction(asset1);
        await this.props.deleteAssetFunction(asset2);
        alert(message);
        return;
      }

      await this.props.submitTransactionFunction(contributions);
      await this.props.submitTransactionFunction(crystallizeTaxFree);
      await this.props.submitTransactionFunction(crystallize);

      alert('added assets and transactions');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
    } else {
      let quantityScale = 1.0;
      const parsedQuantity = makeQuantityFromString(this.state.QUANTITY);
      if (!parsedQuantity.checksOK) {
        alert(
          `Quantity '${this.state.QUANTITY}' should empty or a whole number value`,
        );
        return;
      }
      if (parsedQuantity.value !== '') {
        quantityScale = parseFloat(parsedQuantity.value);
      }

      const parsedValue = makeCashValueFromString(this.state.VALUE);
      let numValueForSubmission = parsedValue.value;
      if (!parsedValue.checksOK) {
        alert(`Value '${this.state.VALUE}' not understood as a cash value`);
        return;
      }
      numValueForSubmission *= quantityScale;

      const name = this.state.LIABILITY;
      let builtLiability = '';
      if (name !== '') {
        builtLiability = name + cgt;
      }
      const liabilityMessage = checkAssetLiability(builtLiability);
      if (liabilityMessage !== '') {
        alert(liabilityMessage);
        return;
      }
      let purchasePrice = this.state.PURCHASE_PRICE;
      if (purchasePrice === '') {
        purchasePrice = '0';
      }
      const parsedYNCPI = makeBooleanFromYesNo(this.state.GROWS_WITH_INFLATION);
      if (!parsedYNCPI.checksOK) {
        alert(
          `Grows with CPI: '${this.state.GROWS_WITH_INFLATION}' should be a Y/N value`,
        );
        return;
      }

      // log('adding something ' + showObj(this));
      const asset: DbAsset = {
        NAME: this.state.NAME,
        VALUE: `${numValueForSubmission}`,
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
      const message = this.props.checkAssetFunction(asset, this.props.model);
      if (message.length > 0) {
        alert(message);
      } else {
        await this.props.submitAssetFunction(asset);
        alert('added new asset');
        // clear fields
        this.setState(this.defaultState);
        this.resetSelect(this.incomeSourceSelectID);
      }
    }
  }
  private async delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteAssetFunction(this.state.NAME)) {
      alert('deleted asset');
      // clear fields
      this.setState(this.defaultState);
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
  private inputPension(e: any) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingPension,
    });
  }
  private inputAsset(e: any) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingAsset,
    });
  }
  private inputRevalue(e: any) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
}
