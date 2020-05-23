import React, { Component } from 'react';

import { checkIncomeLiability, isNumberString } from '../../models/checks';
import {
  DbIncome,
  DbModelData,
  DbTransaction,
  DbTrigger,
} from '../../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
  makeGrowthFromString,
  makeIncomeLiabilityFromNameAndNI,
  isAnIncome,
  isATransaction,
  makeValueAbsPropFromString,
} from '../../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import {
  pensionDB,
  incomeTax,
  pension,
  pensionSS,
  separator,
  pensionTransfer,
  autogen,
  revalue,
  revalueInc,
} from '../../localization/stringConstants';

interface EditIncomeFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWTH: string;
  GROWS_WITH_CPI: string;
  LIABILITY: string;
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

const inputtingRevalue = 'revalue';
const inputtingIncome = 'income';
const inputtingPension = 'definedBenefitsPension';

interface EditIncomeProps {
  checkIncomeFunction: (i: DbIncome, model: DbModelData) => string;
  checkTransactionFunction: (t: DbTransaction, model: DbModelData) => string;
  submitIncomeFunction: (
    incomeInput: DbIncome,
    modelData: DbModelData,
  ) => Promise<void>;
  submitTransactionFunction: (
    transactionInput: DbTransaction,
    modelData: DbModelData,
  ) => Promise<void>;
  deleteFunction: (name: string) => Promise<boolean>;
  submitTriggerFunction: (
    triggerInput: DbTrigger,
    modelData: DbModelData,
  ) => Promise<void>;
  model: DbModelData;
}

export function incomeOptions(
  model: DbModelData,
  handleChange: any,
  id: string,
) {
  const optionData = model.incomes.map(income => {
    return {
      text: income.NAME,
      action: (e: any) => {
        // log(`detected action`);
        // e.persist();
        e.preventDefault();
        handleChange(income.NAME);
      },
    };
  });

  // remove income with certain properties...
  //optionData = optionData.filter(od => od.text !== taxPot);

  const options = optionData.map(bd => (
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
      onChange={e => {
        const found = optionData.find(od => {
          return od.text === e.target.value;
        });
        if (found !== undefined) {
          found.action(e);
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

  private incomeSourceSelectID = 'fromIncomeSelectIncomeForm';

  public constructor(props: EditIncomeProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteIncomeForm has
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
      LIABILITY: '',
      CATEGORY: '',
      inputting: inputtingIncome,
      DB_INCOME_SOURCE: '',
      DB_CONTRIBUTION_AMOUNT: '',
      DB_ACCRUAL: '',
      DB_SS: '',
      DB_STOP_SOURCE: '',
      DB_START: '',
      DB_END: '',
      DB_TRANSFER_TO: '',
      DB_TRANSFER_PROPORTION: '',
      DB_TRANSFERRED_STOP: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleGrowsWithCPIChange = this.handleGrowsWithCPIChange.bind(this);
    this.handleLiabilityChange = this.handleLiabilityChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.revalue = this.revalue.bind(this);

    this.handleDbcIncomeSourceChange = this.handleDbcIncomeSourceChange.bind(
      this,
    );
    this.handleDbcSsChange = this.handleDbcSsChange.bind(this);
    this.handleDbcAccrualChange = this.handleDbcAccrualChange.bind(this);
    this.handleDbcTransferTo = this.handleDbcTransferTo.bind(this);
    this.handleDbcContAmount = this.handleDbcContAmount.bind(this);
    this.handleDbcTransferProportion = this.handleDbcTransferProportion.bind(
      this,
    );

    this.handleValueSetChange = this.handleValueSetChange.bind(this);
    this.setValueSet = this.setValueSet.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.setEnd = this.setEnd.bind(this);
    this.handleDbcStartChange = this.handleDbcStartChange.bind(this);
    this.setDbcStart = this.setDbcStart.bind(this);
    this.handleDbcEndChange = this.handleDbcEndChange.bind(this);
    this.setDbcEnd = this.setDbcEnd.bind(this);
    this.handleDbcStopSourceChange = this.handleDbcStopSourceChange.bind(this);
    this.setDbcStopSource = this.setDbcStopSource.bind(this);
    this.handleDbcTransferredStopChange = this.handleDbcTransferredStopChange.bind(
      this,
    );
    this.setDbcTransferredStop = this.setDbcTransferredStop.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
    this.setInputincome = this.setInputincome.bind(this);
    this.setInputDBP = this.setInputDBP.bind(this);
    this.setInputRevalue = this.setInputRevalue.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteIncomeForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title={
                this.state.inputting === inputtingPension
                  ? 'Pension name'
                  : 'Income name'
              }
              type="text"
              name="incomename"
              value={this.state.NAME}
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Button
              action={this.setInputincome}
              type={
                this.state.inputting === inputtingIncome
                  ? 'primary'
                  : 'secondary'
              }
              title={'Add a new income'}
              id="useIncomeInputs"
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Button
              action={this.setInputDBP}
              type={
                this.state.inputting === inputtingPension
                  ? 'primary'
                  : 'secondary'
              }
              title={'Add a pension'}
              id="useDBPInputs"
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Button
              action={this.setInputRevalue}
              type={
                this.state.inputting === inputtingRevalue
                  ? 'primary'
                  : 'secondary'
              }
              title={'Revalue an income'}
              id="useRevalueInputs"
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title={`${
                this.state.inputting === inputtingPension
                  ? 'Pension'
                  : this.state.inputting === inputtingIncome
                  ? 'Income'
                  : 'New income'
              } value (amount before tax, per month)`}
              type="text"
              name="incomevalue"
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
            introLabel={`${
              this.state.inputting === inputtingPension
                ? "Date on which the pension's value is set"
                : this.state.inputting === inputtingIncome
                ? "Date on which the new income's value is set"
                : "Date on which the income's new value is set"
            }`}
            model={this.props.model}
            setDateFunction={this.setValueSet}
            inputName="income valuation date"
            inputValue={this.state.VALUE_SET}
            onChangeHandler={this.handleValueSetChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
        </div>
        {this.inputsForGeneralIncome()}
        {this.inputsForDefinedBenefitsPensionIncome()}
        {this.growthsEtc()}
        {this.revalueButton()}
      </form>
    );
  }
  private growthsEtc(): React.ReactNode {
    return (
      <div
        style={{
          display:
            this.state.inputting === inputtingIncome ||
            this.state.inputting === inputtingPension
              ? 'block'
              : 'none',
        }}
      >
        <div className="row">
          <div className="col">
            <Input
              title="Annual growth percentage (excluding inflation, e.g. 2 for 2% p.a.)"
              type="text"
              name="incomegrowth"
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
              name="incomecpi-grows"
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
              title="Tax liability (empty or someone's name)"
              type="text"
              name="taxable"
              value={this.state.LIABILITY}
              placeholder="Enter tax liability"
              onChange={this.handleLiabilityChange}
            />
          </div>
          <div className="col">
            <Input
              title="Category (optional)"
              type="text"
              name="incomecategory"
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
            'Create new income (over-writes any existing with the same name)'
          }
          id="addIncome"
        />
      </div>
    );
  }
  private revalueButton(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingRevalue ? 'block' : 'none',
        }}
      >
        <Button
          action={this.revalue}
          type={'primary'}
          title={'Add income revaluation'}
          id="revalueIncome"
        />
      </div>
    );
  }
  private inputsForGeneralIncome(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputting === inputtingIncome ? 'block' : 'none',
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the income starts"
            model={this.props.model}
            setDateFunction={this.setStart}
            inputName="income start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the income ends"
            model={this.props.model}
            setDateFunction={this.setEnd}
            inputName="income end date"
            inputValue={this.state.END}
            onChangeHandler={this.handleEndChange}
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
          display: this.state.inputting === inputtingPension ? 'block' : 'none',
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
handleDbcValueChange
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
            setDateFunction={this.setDbcStopSource}
            inputName="end date"
            inputValue={this.state.DB_STOP_SOURCE}
            onChangeHandler={this.handleDbcStopSourceChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the pension starts"
            model={this.props.model}
            setDateFunction={this.setDbcStart}
            inputName="pension start date"
            inputValue={this.state.DB_START}
            onChangeHandler={this.handleDbcStartChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          <DateSelectionRow
            introLabel="Date on which the pension ends" ///transfers"
            model={this.props.model}
            setDateFunction={this.setDbcEnd}
            inputName="pension end/transfer date"
            inputValue={this.state.DB_END}
            onChangeHandler={this.handleDbcEndChange}
            triggers={this.props.model.triggers}
            submitTriggerFunction={this.props.submitTriggerFunction}
          />
          {
            <DateSelectionRow
              introLabel="Date on which transferred pension stops (optional)"
              model={this.props.model}
              setDateFunction={this.setDbcTransferredStop}
              inputName="transferred stop date"
              inputValue={this.state.DB_TRANSFERRED_STOP}
              onChangeHandler={this.handleDbcTransferredStopChange}
              triggers={this.props.model.triggers}
              submitTriggerFunction={this.props.submitTriggerFunction}
            />
          }
        </div>
        <div className="row">
          <div className="col">
            <label>Income source (optional)</label>
            {incomeOptions(
              this.props.model,
              this.handleDbcIncomeSourceChange,
              this.incomeSourceSelectID,
            )}
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Is contribution salary-sacrificed (optional)"
              type="text"
              name="contributionSSIncome"
              value={this.state.DB_SS}
              placeholder="Enter Y/N"
              onChange={this.handleDbcSsChange}
            />
          </div>{' '}
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title="Pension contribution amount (e.g. 0.05 for 5%, optional)"
              type="text"
              name="contributionAmountPensionIncome"
              value={this.state.DB_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={this.handleDbcContAmount}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Contribution accrual to annual benefit (e.g. 0.02 for 1/50, optional)"
              type="text"
              name="incomeaccrual"
              value={this.state.DB_ACCRUAL}
              placeholder="Enter accrual rate"
              onChange={this.handleDbcAccrualChange}
            />
          </div>{' '}
          {/* end col */} {/* end col */}
        </div>
        {/* end row */}
        {
          <div className="row">
            <div className="col">
              <Input
                title="On death, pension transfers to (optional)"
                type="text"
                name="transferName"
                value={this.state.DB_TRANSFER_TO}
                placeholder="Enter person to transfer to"
                onChange={this.handleDbcTransferTo}
              />
            </div>
            <div className="col">
              <Input
                title="Proportion transferred on death (e.g. 0.5 for 50%, optional)"
                type="text"
                name="transferProportion"
                value={this.state.DB_TRANSFER_PROPORTION}
                placeholder="Enter transfer proportion"
                onChange={this.handleDbcTransferProportion}
              />
            </div>{' '}
          </div>
        }
      </div>
    );
  }
  private handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ NAME: e.target.value });
  }
  private handleGrowthChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ GROWTH: e.target.value });
  }
  private handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ CATEGORY: e.target.value });
  }
  private handleLiabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ LIABILITY: e.target.value });
  }
  private handleGrowsWithCPIChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ GROWS_WITH_CPI: e.target.value });
  }
  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ VALUE: e.target.value });
  }
  private handleDbcIncomeSourceChange(value: string) {
    this.setState({ DB_INCOME_SOURCE: value });
  }
  private handleDbcSsChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DB_SS: e.target.value });
  }
  private handleDbcAccrualChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DB_ACCRUAL: e.target.value });
  }
  private handleDbcTransferProportion(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DB_TRANSFER_PROPORTION: e.target.value });
  }

  private setDbcStopSource(value: string) {
    this.setState({ DB_STOP_SOURCE: value });
  }
  private handleDbcStopSourceChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setDbcStopSource(e.target.value);
  }
  private handleDbcTransferTo(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DB_TRANSFER_TO: e.target.value });
  }
  private handleDbcContAmount(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ DB_CONTRIBUTION_AMOUNT: e.target.value });
  }
  private setDbcTransferredStop(value: string) {
    this.setState({ DB_TRANSFERRED_STOP: value });
  }
  private handleDbcTransferredStopChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    this.setDbcTransferredStop(e.target.value);
  }

  private setDbcEnd(value: string) {
    this.setState({ DB_END: value });
  }
  private handleDbcEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setDbcEnd(e.target.value);
  }

  private setValueSet(value: string): void {
    this.setState({ VALUE_SET: value });
  }
  private handleValueSetChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setValueSet(e.target.value);
  }

  private setDbcStart(value: string): void {
    this.setState({ DB_START: value });
  }
  private handleDbcStartChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.setDbcStart(value);
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
    this.setEnd(e.target.value);
  }
  private resetSelect(id: string) {
    const selector: any = document.getElementById(id);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private async revalue(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    e.preventDefault();

    if (!isAnIncome(this.state.NAME, this.props.model)) {
      alert(`Income name ${this.state.NAME} should be an existing income`);
      return;
    }

    const parseVal = makeValueAbsPropFromString(this.state.VALUE);
    if (!parseVal.checksOK) {
      alert(
        `Income value ${this.state.VALUE} should be a numerical or % value`,
      );
      return;
    }
    const date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
    );
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

    const revalueIncomeTransaction: DbTransaction = {
      NAME: `${revalue} ${this.state.NAME} ${count}`,
      FROM: '',
      FROM_ABSOLUTE: false,
      FROM_VALUE: '0.0',
      TO: this.state.NAME,
      TO_ABSOLUTE: parseVal.absolute,
      TO_VALUE: parseVal.value,
      DATE: this.state.VALUE_SET, // match the income start date
      TYPE: revalueInc,
      RECURRENCE: '',
      STOP_DATE: '',
      CATEGORY: '',
    };
    const message = await this.props.checkTransactionFunction(
      revalueIncomeTransaction,
      this.props.model,
    );
    if (message.length > 0) {
      alert(message);
      return;
    }
    await this.props.submitTransactionFunction(
      revalueIncomeTransaction,
      this.props.model,
    );

    alert('added new data');
    // clear fields
    this.setState(this.defaultState);
    this.resetSelect(this.incomeSourceSelectID);
    return;
  }

  private async add(e: any): Promise<void> {
    e.preventDefault();

    if (this.state.NAME === '') {
      alert(`Income name should be non-empty`);
      return;
    }
    let isNotANumber = !isNumberString(this.state.VALUE);
    if (isNotANumber) {
      alert(`Income value ${this.state.VALUE} should be a numerical value`);
      return;
    }
    let date = checkTriggerDate(
      this.state.VALUE_SET,
      this.props.model.triggers,
    );
    let isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Value set date should be a date`);
      return;
    }
    const parsedGrowth = makeGrowthFromString(
      this.state.GROWTH,
      this.props.model.settings,
    );
    if (!parsedGrowth.checksOK) {
      alert(`Growth value '${this.state.GROWTH}' should be a numerical value`);
      return;
    }
    const parseYNGrowsWithCPI = makeBooleanFromYesNo(this.state.GROWS_WITH_CPI);
    if (!parseYNGrowsWithCPI.checksOK) {
      alert(
        `Grows with inflation '${this.state.GROWS_WITH_CPI}' should be a Y/N value`,
      );
      return;
    }

    if (this.state.inputting === inputtingPension) {
      // do work to
      // (a) check integrity of inputs
      // (b) build an income for the pension, check integrity of income
      // (c) build an income for the transferred pension, check integrity of income
      // (d) build a transaction for the contributions to the income, check integrity of transaction
      // (e) build a transaction for the accrual of the benefit, check integrity of transaction
      // (f) submit income
      // (g) submit transactions
      // (h) reset to defaults

      const parseYNDBSS = makeBooleanFromYesNo(this.state.DB_SS);
      if (this.state.DB_INCOME_SOURCE !== '') {
        if (!parseYNDBSS.checksOK) {
          alert(`Salary sacrifice '${this.state.DB_SS}' should be a Y/N value`);
          return;
        } else {
          // log(`parseYNDBSS = ${showObj(parseYNDBSS)}`);
        }

        isNotANumber = !isNumberString(this.state.DB_CONTRIBUTION_AMOUNT);
        if (isNotANumber) {
          alert(
            `Contribution amount '${this.state.DB_CONTRIBUTION_AMOUNT}' should be a numerical value`,
          );
          return;
        }

        isNotANumber = !isNumberString(this.state.DB_ACCRUAL);
        if (isNotANumber) {
          alert(
            `Accrual value '${this.state.DB_ACCRUAL}' should be a numerical value`,
          );
          return;
        }
      } else {
        isNotANumber = !isNumberString(this.state.DB_CONTRIBUTION_AMOUNT);
        if (!isNotANumber) {
          alert(
            `Contribution amount '${this.state.DB_CONTRIBUTION_AMOUNT}' from no income?`,
          );
          return;
        }

        isNotANumber = !isNumberString(this.state.DB_ACCRUAL);
        if (!isNotANumber) {
          alert(`Accrual value '${this.state.DB_ACCRUAL}' from no income?`);
          return;
        }
      }
      const inputLiability = makeIncomeLiabilityFromNameAndNI(
        this.state.LIABILITY,
        false, // no NI payable
      );
      let liabilityMessage = checkIncomeLiability(inputLiability);
      if (liabilityMessage !== '') {
        alert(liabilityMessage);
        return;
      }

      const sourceIncome = this.props.model.incomes.find(i => {
        return i.NAME === this.state.DB_INCOME_SOURCE;
      });
      if (sourceIncome === undefined && this.state.DB_INCOME_SOURCE !== '') {
        alert(`${this.state.DB_INCOME_SOURCE} not recognised as an income`);
        return;
      } else if (sourceIncome) {
        const liabilities = sourceIncome.LIABILITY;
        if (liabilities.length === 0) {
          alert(`Source income '${sourceIncome.NAME}' should pay income tax`);
          return;
        }
        const words = liabilities.split(separator);
        const incomeTaxWord = words.find(w => {
          return w.endsWith(incomeTax);
        });
        if (incomeTaxWord === undefined) {
          alert(
            `Source income '${sourceIncome.NAME}' should have an income tax liability`,
          );
          return;
        } else {
          // insist incomeTaxWord matches inputLiability
          if (incomeTaxWord !== inputLiability) {
            log(`${incomeTaxWord} !== ${inputLiability}`);
            alert(
              `Source income '${sourceIncome.NAME}' should have income tax liability ${inputLiability}`,
            );
            return;
          }
        }
      }
      let builtLiability2: string | undefined;
      if (this.state.DB_TRANSFER_TO !== '') {
        isNotANumber = !isNumberString(this.state.DB_TRANSFER_PROPORTION);
        if (isNotANumber) {
          alert(
            `Transfer proportion ${this.state.DB_TRANSFER_PROPORTION} should be a numerical value`,
          );
          return;
        }
        builtLiability2 = makeIncomeLiabilityFromNameAndNI(
          this.state.DB_TRANSFER_TO,
          false, // no NI payable
        );
        liabilityMessage = checkIncomeLiability(builtLiability2);
        if (liabilityMessage !== '') {
          alert(liabilityMessage);
          return;
        }
      }
      const newIncomeName1 = pensionDB + this.state.NAME;
      const pensionDbcIncome1: DbIncome = {
        START: this.state.DB_START,
        END: this.state.DB_END,
        NAME: newIncomeName1,
        VALUE: this.state.VALUE,
        VALUE_SET: this.state.VALUE_SET,
        LIABILITY: inputLiability,
        GROWTH: parsedGrowth.value,
        CPI_IMMUNE: !parseYNGrowsWithCPI.value,
        CATEGORY: this.state.CATEGORY,
      };
      let message = await this.props.checkIncomeFunction(
        pensionDbcIncome1,
        this.props.model,
      );
      if (message.length > 0) {
        alert(message);
        return;
      }
      let pensionDbcIncome2: DbIncome | undefined;
      let newIncomeName2: string | undefined;
      if (this.state.DB_TRANSFER_TO !== '' && builtLiability2 !== undefined) {
        newIncomeName2 = pensionTransfer + this.state.NAME;
        pensionDbcIncome2 = {
          START: this.state.DB_START,
          END: this.state.DB_TRANSFERRED_STOP,
          NAME: newIncomeName2,
          VALUE: '0.0',
          VALUE_SET: this.state.VALUE_SET,
          LIABILITY: builtLiability2,
          GROWTH: parsedGrowth.value,
          CPI_IMMUNE: !parseYNGrowsWithCPI.value,
          CATEGORY: this.state.CATEGORY,
        };
        const message = await this.props.checkIncomeFunction(
          pensionDbcIncome2,
          this.props.model,
        );
        if (message.length > 0) {
          alert(message);
          return;
        }
      }

      await this.props.submitIncomeFunction(
        pensionDbcIncome1,
        this.props.model,
      );
      if (pensionDbcIncome2) {
        await this.props.submitIncomeFunction(
          pensionDbcIncome2,
          this.props.model,
        );
      }
      let pensionDbctran1: DbTransaction | undefined;
      let pensionDbctran2: DbTransaction | undefined;
      if (this.state.DB_INCOME_SOURCE !== '') {
        pensionDbctran1 = {
          NAME: (parseYNDBSS.value ? pensionSS : pension) + this.state.NAME,
          FROM: this.state.DB_INCOME_SOURCE,
          FROM_ABSOLUTE: false,
          FROM_VALUE: this.state.DB_CONTRIBUTION_AMOUNT,
          TO: '',
          TO_ABSOLUTE: false,
          TO_VALUE: '0.0',
          DATE: this.state.VALUE_SET, // match the income start date
          STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbctran1,
          this.props.model,
        );
        if (message.length > 0) {
          //log(`bad transaction1 ${showObj(pensionDbctran1)}`);
          alert(message);
          await this.props.deleteFunction(pensionDbcIncome1.NAME);
          if (pensionDbcIncome2) {
            await this.props.deleteFunction(pensionDbcIncome2.NAME);
          }
          return;
        }
        // log(`this.state.DB_ACCRUAL = ${this.state.DB_ACCRUAL}`);
        const monthlyAccrualValue = `${parseFloat(this.state.DB_ACCRUAL) /
          12.0}`;
        // log(`monthlyAccrualValue = ${monthlyAccrualValue}`);
        pensionDbctran2 = {
          NAME: newIncomeName1, // kicks in when we see income java
          FROM: this.state.DB_INCOME_SOURCE,
          FROM_ABSOLUTE: false,
          FROM_VALUE: monthlyAccrualValue, // percentage of income offered up to pension
          TO: newIncomeName1,
          TO_ABSOLUTE: false,
          TO_VALUE: '1.0',
          DATE: this.state.VALUE_SET, // match the income start date
          STOP_DATE: this.state.DB_STOP_SOURCE, // match the income stop date
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbctran2,
          this.props.model,
        );
        if (message.length > 0) {
          //log(`bad transaction2 ${showObj(pensionDbctran2)}`);
          alert(message);
          await this.props.deleteFunction(pensionDbcIncome1.NAME);
          if (pensionDbcIncome2) {
            await this.props.deleteFunction(pensionDbcIncome2.NAME);
          }
          return;
        }
      }
      let pensionDbctran3: DbTransaction | undefined;
      if (this.state.DB_TRANSFER_TO !== '' && newIncomeName2) {
        pensionDbctran3 = {
          NAME: newIncomeName2,
          FROM: newIncomeName1,
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: newIncomeName2,
          TO_ABSOLUTE: false,
          TO_VALUE: this.state.DB_TRANSFER_PROPORTION,
          DATE: this.state.DB_END,
          STOP_DATE: this.state.DB_TRANSFERRED_STOP,
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
          TYPE: autogen,
        };
        message = await this.props.checkTransactionFunction(
          pensionDbctran3,
          this.props.model,
        );
        if (message.length > 0) {
          //log(`bad transaction3 ${showObj(pensionDbctran3)}`);
          alert(message);
          await this.props.deleteFunction(pensionDbcIncome1.NAME);
          if (pensionDbcIncome2) {
            await this.props.deleteFunction(pensionDbcIncome2.NAME);
          }
          return;
        }
      }

      if (pensionDbctran1) {
        await this.props.submitTransactionFunction(
          pensionDbctran1,
          this.props.model,
        );
      }
      if (pensionDbctran2) {
        await this.props.submitTransactionFunction(
          pensionDbctran2,
          this.props.model,
        );
      }
      if (pensionDbctran3) {
        await this.props.submitTransactionFunction(
          pensionDbctran3,
          this.props.model,
        );
      }

      alert('added new data');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
      return;
    }

    date = checkTriggerDate(this.state.START, this.props.model.triggers);
    isNotADate = date === undefined;
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

    const builtLiability = makeIncomeLiabilityFromNameAndNI(
      this.state.LIABILITY,
      true, // NI payable
    );
    const liabilityMessage = checkIncomeLiability(builtLiability);
    if (liabilityMessage !== '') {
      alert(liabilityMessage);
      return;
    }

    // log('adding something ' + showObj(this));
    const income: DbIncome = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: !parseYNGrowsWithCPI.value,
      LIABILITY: builtLiability,
      CATEGORY: this.state.CATEGORY,
    };
    const message = await this.props.checkIncomeFunction(
      income,
      this.props.model,
    );
    if (message.length > 0) {
      alert(message);
    } else {
      await this.props.submitIncomeFunction(income, this.props.model);
      alert('added new income');
      // clear fields
      this.setState(this.defaultState);
      this.resetSelect(this.incomeSourceSelectID);
    }
  }

  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      alert('deleted income');
      // clear fields
      this.setState(this.defaultState);
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
  private setInputDBP(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingPension,
    });
  }
  private setInputincome(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingIncome,
    });
  }
  private setInputRevalue(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      ...this.state,
      inputting: inputtingRevalue,
    });
  }
}
