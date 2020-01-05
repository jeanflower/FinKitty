import React, { Component } from 'react';

import { checkIncomeLiability, isNumberString } from '../checks';
import { DbIncome, DbModelData, DbTransaction } from '../types/interfaces';
import {
  checkTriggerDate,
  log,
  printDebug,
  showObj,
  makeBooleanFromYesNo,
  makeGrowthFromString,
  makeIncomeLiabilityFromNameAndNI,
} from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';
import {
  pensionDBC,
  incomeTax,
  pension,
  pensionSS,
  separator,
  pensionTransfer,
} from '../stringConstants';

interface EditFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWTH: string;
  CPI_IMMUNE: string;
  LIABILITY: string;
  CATEGORY: string;
  inputtingDefinedBenefitsPension: boolean;
  DBC_INCOME_SOURCE: string;
  DBC_CONTRIBUTION_AMOUNT: string;
  DBC_ACCRUAL: string;
  DBC_SS: string;
  DBC_STOP_SOURCE: string;
  DBC_START: string;
  DBC_END: string;
  DBC_TRANSFER_TO: string;
  DBC_TRANSFER_PROPORTION: string;
  DBC_TRANSFERRED_STOP: string;
}
interface EditProps {
  checkIncomeFunction: any;
  checkTransactionFunction: any;
  submitIncomeFunction: any;
  submitTransactionFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: DbModelData;
}
export class AddDeleteIncomeForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  public constructor(props: EditProps) {
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
      CPI_IMMUNE: '',
      LIABILITY: '',
      CATEGORY: '',
      inputtingDefinedBenefitsPension: false,
      DBC_INCOME_SOURCE: '',
      DBC_CONTRIBUTION_AMOUNT: '',
      DBC_ACCRUAL: '',
      DBC_SS: '',
      DBC_STOP_SOURCE: '',
      DBC_START: '',
      DBC_END: '',
      DBC_TRANSFER_TO: '',
      DBC_TRANSFER_PROPORTION: '',
      DBC_TRANSFERRED_STOP: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleFixedChange = this.handleFixedChange.bind(this);
    this.handleLiabilityChange = this.handleLiabilityChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);

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
    this.toggleDBPInputs = this.toggleDBPInputs.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteIncomeForm');
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            <Input
              title="Income name"
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
              action={this.delete}
              type={'secondary'}
              title={'Delete any income with this name'}
              id="deleteIncome"
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Button
              action={this.toggleDBPInputs}
              type={
                this.state.inputtingDefinedBenefitsPension
                  ? 'primary'
                  : 'secondary'
              }
              title={'Use Defined Benefits Pension inputs'}
              id="useDBPInputs"
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
        <div className="row">
          <div className="col">
            <Input
              title={`${
                this.state.inputtingDefinedBenefitsPension
                  ? 'Pension'
                  : 'Income'
              } value (amount before tax, per month):`}
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
            introLabel={`Date on which the ${
              this.state.inputtingDefinedBenefitsPension ? 'pension' : 'income'
            } value is set:`}
            setDateFunction={this.setValueSet}
            inputName="income valuation date"
            inputValue={this.state.VALUE_SET}
            onChangeHandler={this.handleValueSetChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
        {this.inputsForGeneralIncome()}
        {this.inputsForDefinedBenefitsPensionIncome()}
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
              title="Is value immune to inflation?"
              type="text"
              name="incomecpi-immune"
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
              title="Tax liability (empty or someone's name)"
              type="text"
              name="taxable"
              value={this.state.LIABILITY}
              placeholder="Enter tax liability"
              onChange={this.handleLiabilityChange}
            />
          </div>{' '}
          {/* end col */}
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
      </form>
    );
  }
  private inputsForGeneralIncome(): React.ReactNode {
    return (
      <div
        style={{
          display: !this.state.inputtingDefinedBenefitsPension
            ? 'block'
            : 'none',
        }}
      >
        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which the income starts"
            setDateFunction={this.setStart}
            inputName="start date"
            inputValue={this.state.START}
            onChangeHandler={this.handleStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          <DateSelectionRow
            introLabel="Date on which the income ends"
            setDateFunction={this.setEnd}
            inputName="end date"
            inputValue={this.state.END}
            onChangeHandler={this.handleEndChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
        </div>
      </div>
    );
  }
  private inputsForDefinedBenefitsPensionIncome(): React.ReactNode {
    return (
      <div
        style={{
          display: this.state.inputtingDefinedBenefitsPension
            ? 'block'
            : 'none',
        }}
      >
        {/*
 * name of pension
 * contribution from which income - ???
DBC_INCOME_SOURCE
 * contribution amount = £ or %
DBC_CONTRIBUTION_AMOUNT
 * annual accrual rate is a fraction (of annual income amount)
DBC_ACCRUAL
 * whether it's salary sacrifice
DBC_SS
 * contribution stop date 
DBC_STOP_SOURCE
 * growth rate
DBC_GROWTH, DBC_CPI_IMMUNE
 * value - given all payments up to date value set - done
VALUE
handleDbcValueChange
 * date value set - expected to be "now" or start of model - done
VALUE_SET
 * standard date of pension start  - done
DBC_START
 * when to stop paying (someone dies)
DBC_END
 * who to transfer to
DBC_TRANSFER_TO
 - how much to transfer
DBC_TRANSFER_PROPORTION
 - when to stop paying second person (someone dies)
DBC_TRANSFERRED_STOP
        */}

        <div className="container-fluid">
          {/* fills width */}
          <DateSelectionRow
            introLabel="Date on which contributions end"
            setDateFunction={this.setDbcStopSource}
            inputName="end date"
            inputValue={this.state.DBC_STOP_SOURCE}
            onChangeHandler={this.handleDbcStopSourceChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          <DateSelectionRow
            introLabel="Date on which the pension starts"
            setDateFunction={this.setDbcStart}
            inputName="start date"
            inputValue={this.state.DBC_START}
            onChangeHandler={this.handleDbcStartChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          <DateSelectionRow
            introLabel="Date on which the pension ends" ///transfers"
            setDateFunction={this.setDbcEnd}
            inputName="pension end/transfer date"
            inputValue={this.state.DBC_END}
            onChangeHandler={this.handleDbcEndChange}
            triggers={this.props.model.triggers}
            submitTrigger={this.props.submitTrigger}
          />
          {
            <DateSelectionRow
              introLabel="Date on which transferred pension stops"
              setDateFunction={this.setDbcTransferredStop}
              inputName="transferred stop date"
              inputValue={this.state.DBC_TRANSFERRED_STOP}
              onChangeHandler={this.handleDbcTransferredStopChange}
              triggers={this.props.model.triggers}
              submitTrigger={this.props.submitTrigger}
            />
          }
        </div>
        <div className="row">
          <div className="col">
            <Input
              title="Contribution from which income"
              type="text"
              name="incomecontribution"
              value={this.state.DBC_INCOME_SOURCE}
              placeholder="Enter income"
              onChange={this.handleDbcIncomeSourceChange}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Is contribution salary-sacrificed"
              type="text"
              name="contributionSS"
              value={this.state.DBC_SS}
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
              title="Pension contribution amount (e.g. 0.05 for 5%)"
              type="text"
              name="contributionAmount"
              value={this.state.DBC_CONTRIBUTION_AMOUNT}
              placeholder="Enter amount of contributions"
              onChange={this.handleDbcContAmount}
            />
          </div>{' '}
          {/* end col */}
          <div className="col">
            <Input
              title="Contribution accrual to annual benefit (e.g. 0.02 for 1/50)"
              type="text"
              name="incomeaccrual"
              value={this.state.DBC_ACCRUAL}
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
                title="Pension transfers to"
                type="text"
                name="transferName"
                value={this.state.DBC_TRANSFER_TO}
                placeholder="Enter person to transfer to"
                onChange={this.handleDbcTransferTo}
              />
            </div>
            <div className="col">
              <Input
                title="Pension transfer proportion (e.g. 0.5 for 50%)"
                type="text"
                name="transferProportion"
                value={this.state.DBC_TRANSFER_PROPORTION}
                placeholder="Enter transfer proportion"
                onChange={this.handleDbcTransferProportion}
              />
            </div>{' '}
          </div>
        }
      </div>
    );
  }
  private handleNameChange(e: any) {
    this.setState({ NAME: e.target.value });
  }
  private handleGrowthChange(e: any) {
    this.setState({ GROWTH: e.target.value });
  }
  private handleCategoryChange(e: any) {
    this.setState({ CATEGORY: e.target.value });
  }
  private handleLiabilityChange(e: any) {
    this.setState({ LIABILITY: e.target.value });
  }
  private handleFixedChange(e: any) {
    this.setState({ CPI_IMMUNE: e.target.value });
  }
  private handleValueChange(e: any) {
    this.setState({ VALUE: e.target.value });
  }
  private handleDbcIncomeSourceChange(e: any) {
    this.setState({ DBC_INCOME_SOURCE: e.target.value });
  }
  private handleDbcSsChange(e: any) {
    this.setState({ DBC_SS: e.target.value });
  }
  private handleDbcAccrualChange(e: any) {
    this.setState({ DBC_ACCRUAL: e.target.value });
  }
  private handleDbcTransferProportion(e: any) {
    this.setState({ DBC_TRANSFER_PROPORTION: e.target.value });
  }

  private setDbcStopSource(value: string) {
    this.setState({ DBC_STOP_SOURCE: value });
  }
  private handleDbcStopSourceChange(e: any) {
    this.setDbcStopSource(e.target.value);
  }
  private handleDbcTransferTo(e: any) {
    this.setState({ DBC_TRANSFER_TO: e.target.value });
  }
  private handleDbcContAmount(e: any) {
    this.setState({ DBC_CONTRIBUTION_AMOUNT: e.target.value });
  }
  private setDbcTransferredStop(value: string) {
    this.setState({ DBC_TRANSFERRED_STOP: value });
  }
  private handleDbcTransferredStopChange(e: any) {
    this.setDbcTransferredStop(e.target.value);
  }

  private setDbcEnd(value: string) {
    this.setState({ DBC_END: value });
  }
  private handleDbcEndChange(e: any) {
    this.setDbcEnd(e.target.value);
  }

  private setValueSet(value: string): void {
    this.setState({ VALUE_SET: value });
  }
  private handleValueSetChange(e: any): void {
    this.setValueSet(e.target.value);
  }

  private setDbcStart(value: string): void {
    this.setState({ DBC_START: value });
  }
  private handleDbcStartChange(e: any): void {
    const value = e.target.value;
    this.setDbcStart(value);
  }

  private setStart(value: string): void {
    this.setState({ START: value });
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
  }

  private setEnd(value: string): void {
    this.setState({ END: value });
  }
  private handleEndChange(e: any): void {
    this.setEnd(e.target.value);
  }
  private async add(e: any): Promise<void> {
    e.preventDefault();

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
    const parseYNCPIImmune = makeBooleanFromYesNo(this.state.CPI_IMMUNE);
    if (!parseYNCPIImmune.checksOK) {
      alert(`CPI-immune '${this.state.CPI_IMMUNE}' should be a Y/N value`);
      return;
    }

    if (this.state.inputtingDefinedBenefitsPension) {
      // do work to
      // (a) check integrity of inputs
      // (b) build an income for the pension, check integrity of income
      // (c) build an income for the transferred pension, check integrity of income
      // (d) build a transaction for the contributions to the income, check integrity of transaction
      // (e) build a transaction for the accrual of the benefit, check integrity of transaction
      // (f) submit income
      // (g) submit transactions
      // (h) reset to defaults

      const builtLiability1 = makeIncomeLiabilityFromNameAndNI(
        this.state.LIABILITY,
        false, // no NI payable
      );
      const liabilityMessage = checkIncomeLiability(builtLiability1);
      if (liabilityMessage !== '') {
        alert(liabilityMessage);
        return;
      }

      // check income is an income
      const sourceIncome = this.props.model.incomes.find(i => {
        return i.NAME === this.state.DBC_INCOME_SOURCE;
      });
      if (sourceIncome === undefined) {
        alert(
          `Income '${this.state.DBC_INCOME_SOURCE}' should be an income name`,
        );
        return;
      }

      const parseYNDBCSS = makeBooleanFromYesNo(this.state.DBC_SS);
      if (!parseYNDBCSS.checksOK) {
        alert(`Salary sacrifice '${this.state.DBC_SS}' should be a Y/N value`);
        return;
      }

      isNotANumber = !isNumberString(this.state.DBC_CONTRIBUTION_AMOUNT);
      if (isNotANumber) {
        alert(
          `Contribution amount '${this.state.DBC_CONTRIBUTION_AMOUNT}' should be a numerical value`,
        );
        return;
      }

      isNotANumber = !isNumberString(this.state.DBC_ACCRUAL);
      if (isNotANumber) {
        alert(
          `Accrual value '${this.state.DBC_ACCRUAL}' should be a numerical value`,
        );
        return;
      }

      const liabilities = sourceIncome.LIABILITY;
      if (liabilities.length === 0) {
        alert(`Source income '${sourceIncome.NAME}' should pay income tax`);
        return;
      }
      const words = liabilities.split(separator);
      const incomeTaxWord = words.find(w => {
        return w.startsWith(incomeTax);
      });
      if (incomeTaxWord === undefined) {
        alert(
          `Source income '${sourceIncome.NAME}' should have an income tax liability`,
        );
        return;
      }
      const personName = incomeTaxWord.substring(
        incomeTax.length,
        incomeTaxWord.length,
      );
      if (personName !== this.state.LIABILITY) {
        alert(
          `Source income '${sourceIncome.NAME}' should have a same income tax liability ` +
            `as this pension, but '${personName}' and '${this.state.LIABILITY}' are different`,
        );
        return;
      }

      isNotANumber = !isNumberString(this.state.DBC_TRANSFER_PROPORTION);
      if (isNotANumber) {
        alert(
          `Transfer proportion ${this.state.DBC_TRANSFER_PROPORTION} should be a numerical value`,
        );
        return;
      }
      let builtLiability2: string | undefined;
      if (this.state.DBC_TRANSFER_TO !== '') {
        builtLiability2 = makeIncomeLiabilityFromNameAndNI(
          this.state.DBC_TRANSFER_TO,
          false, // no NI payable
        );
        const liabilityMessage = checkIncomeLiability(builtLiability2);
        if (liabilityMessage !== '') {
          alert(liabilityMessage);
          return;
        }
      }
      const newIncomeName1 = pensionDBC + this.state.NAME;
      const pensionDbcIncome1: DbIncome = {
        START: this.state.DBC_START,
        END: this.state.DBC_END,
        NAME: newIncomeName1,
        VALUE: this.state.VALUE,
        VALUE_SET: this.state.VALUE_SET,
        LIABILITY: builtLiability1,
        GROWTH: parsedGrowth.value,
        CPI_IMMUNE: parseYNCPIImmune.value,
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
      if (this.state.DBC_TRANSFER_TO !== '' && builtLiability2 !== undefined) {
        newIncomeName2 = pensionTransfer + this.state.NAME;
        pensionDbcIncome2 = {
          START: this.state.DBC_START,
          END: this.state.DBC_TRANSFERRED_STOP,
          NAME: newIncomeName2,
          VALUE: '0.0',
          VALUE_SET: this.state.VALUE_SET,
          LIABILITY: builtLiability2,
          GROWTH: parsedGrowth.value,
          CPI_IMMUNE: parseYNCPIImmune.value,
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

      await this.props.submitIncomeFunction(pensionDbcIncome1);
      if (pensionDbcIncome2) {
        await this.props.submitIncomeFunction(pensionDbcIncome2);
      }

      const pensionDbctran1: DbTransaction = {
        NAME: (parseYNDBCSS ? pensionSS : pension) + this.state.NAME,
        FROM: this.state.DBC_INCOME_SOURCE,
        FROM_ABSOLUTE: false,
        FROM_VALUE: this.state.DBC_CONTRIBUTION_AMOUNT,
        TO: '',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.0',
        DATE: this.state.VALUE_SET, // match the income start date
        STOP_DATE: this.state.DBC_STOP_SOURCE, // match the income stop date
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
      };
      message = await this.props.checkTransactionFunction(
        pensionDbctran1,
        this.props.model,
      );
      if (message.length > 0) {
        alert(message);
        await this.props.deleteFunction(pensionDbcIncome1);
        if (pensionDbcIncome2) {
          await this.props.deleteFunction(pensionDbcIncome2);
        }
        return;
      }
      // log(`this.state.DBC_ACCRUAL = ${this.state.DBC_ACCRUAL}`);
      const monthlyAccrualValue = `${parseFloat(this.state.DBC_ACCRUAL) /
        12.0}`;
      // log(`monthlyAccrualValue = ${monthlyAccrualValue}`);
      const pensionDbctran2: DbTransaction = {
        NAME: newIncomeName1, // kicks in when we see income java
        FROM: this.state.DBC_INCOME_SOURCE,
        FROM_ABSOLUTE: false,
        FROM_VALUE: monthlyAccrualValue, // percentage of income offered up to pension
        TO: newIncomeName1,
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: this.state.VALUE_SET, // match the income start date
        STOP_DATE: this.state.DBC_STOP_SOURCE, // match the income stop date
        RECURRENCE: '',
        CATEGORY: this.state.CATEGORY,
      };
      message = await this.props.checkTransactionFunction(
        pensionDbctran2,
        this.props.model,
      );
      if (message.length > 0) {
        alert(message);
        await this.props.deleteFunction(pensionDbcIncome1);
        if (pensionDbcIncome2) {
          await this.props.deleteFunction(pensionDbcIncome2);
        }
        return;
      }
      let pensionDbctran3: DbTransaction | undefined;
      if (this.state.DBC_TRANSFER_TO !== '' && newIncomeName2) {
        pensionDbctran3 = {
          NAME: newIncomeName2,
          FROM: newIncomeName1,
          FROM_ABSOLUTE: false,
          FROM_VALUE: '1.0',
          TO: newIncomeName2,
          TO_ABSOLUTE: false,
          TO_VALUE: this.state.DBC_TRANSFER_PROPORTION,
          DATE: this.state.DBC_END,
          STOP_DATE: this.state.DBC_TRANSFERRED_STOP,
          RECURRENCE: '',
          CATEGORY: this.state.CATEGORY,
        };
      }
      message = await this.props.checkTransactionFunction(
        pensionDbctran3,
        this.props.model,
      );
      if (message.length > 0) {
        alert(message);
        await this.props.deleteFunction(pensionDbcIncome1);
        if (pensionDbcIncome2) {
          await this.props.deleteFunction(pensionDbcIncome2);
        }
        return;
      }

      await this.props.submitTransactionFunction(pensionDbctran1);
      await this.props.submitTransactionFunction(pensionDbctran2);
      if (pensionDbctran3) {
        await this.props.submitTransactionFunction(pensionDbctran3);
      }

      alert('added new data');
      // clear fields
      this.setState(this.defaultState);
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
      CPI_IMMUNE: parseYNCPIImmune.value,
      LIABILITY: builtLiability,
      CATEGORY: this.state.CATEGORY,
    };
    const message = this.props.checkIncomeFunction(income, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitIncomeFunction(income);
      alert('added new income');
      // clear fields
      this.setState(this.defaultState);
    }
  }
  private async delete(e: any) {
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
  private toggleDBPInputs(e: any) {
    e.preventDefault();
    const currentState = this.state.inputtingDefinedBenefitsPension;
    this.setState({
      ...this.state,
      inputtingDefinedBenefitsPension: !currentState,
    });
  }
}
