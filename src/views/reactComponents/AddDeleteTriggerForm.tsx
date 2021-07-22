import React, { Component, FormEvent } from 'react';
import { doCheckBeforeOverwritingExistingData } from '../../App';

import { ModelData, Trigger, FormProps } from '../../types/interfaces';
import { log, printDebug, showObj } from '../../utils';
import { makeDateFromString } from '../../stringUtils';
import { makeButton } from './Button';
import { Input } from './Input';

interface EditTriggerFormState {
  NAME: string;
  DATE: string;
}
interface EditTriggerProps extends FormProps {
  checkFunction: (t: Trigger, modelData: ModelData) => string;
  submitFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  deleteFunction: (settingName: string) => Promise<boolean>;
}

export function newTriggerButtonData(
  submitTriggerFunction: (e: Trigger) => void,
  showAlert: (arg0: string) => void,
) {
  return {
    text: 'Make new important date',
    action: async (e: FormEvent<Element>) => {
      // e.persist();
      e.preventDefault();
      const nameString = prompt('Name for new important date', '');
      if (nameString === null || nameString.length === 0) {
        showAlert('names need to have some characters');
        return;
      }
      const dateString = prompt('Important date (e.g. 1 Jan 2019)', '');
      if (dateString === null || dateString.length === 0) {
        showAlert(`date didn't make sense`);
        return;
      }
      const dateTry = makeDateFromString(dateString);
      if (!dateTry.getTime()) {
        showAlert(`date didn't make sense`);
        return;
      }
      await submitTriggerFunction({
        NAME: nameString,
        DATE: dateTry,
      });
    },
  };
}
export class AddDeleteTriggerForm extends Component<
  EditTriggerProps,
  EditTriggerFormState
> {
  public defaultState: EditTriggerFormState;

  public constructor(props: EditTriggerProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteIncomeForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      DATE: '',
    };

    this.state = this.defaultState;

    this.handleName = this.handleName.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <div className="row">
          <div className="col">
            Name:
            <Input
              type={'text'}
              name={'triggername'}
              value={this.state.NAME}
              placeholder={'Enter name'}
              onChange={this.handleName}
            />
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
        <div className="row">
          <div className="col">
            Date:
            <Input
              type={'text'}
              name={'date'}
              value={this.state.DATE}
              placeholder={'Enter date'}
              onChange={this.handleValueChange}
            />
            {makeButton(
              'Create new important date (over-writes any existing with the same name)',
              this.add,
              "addTrigger",
              "addTrigger",
              'primary',
            )}
          </div>{' '}
          {/* end col */}
        </div>{' '}
        {/* end row */}
      </form>
    );
  }

  private handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ DATE: value });
  }

  private async add(e: FormEvent<Element>) {
    e.preventDefault();

    if (this.state.NAME === '') {
      this.props.showAlert(`Name should be not empty`);
      return;
    }

    if (doCheckBeforeOverwritingExistingData()) {
      const matchingItem = this.props.model.triggers.find(a => {
        return a.NAME === this.state.NAME;
      });
      if (matchingItem !== undefined) {
        this.props.showAlert(
          `There's already a date called ${this.state.NAME}`,
        );
        return;
      }
    }

    // log('adding something ' + showObj(this));
    const trigger: Trigger = {
      NAME: this.state.NAME,
      DATE: makeDateFromString(this.state.DATE),
    };
    const message = this.props.checkFunction(trigger, this.props.model);
    if (message.length > 0) {
      this.props.showAlert(message);
    } else {
      await this.props.submitFunction(trigger, this.props.model);
      // this.props.showAlert('added new important date');
      // clear fields
      this.setState(this.defaultState);
      this.props.showAlert('added important date OK');
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      this.setState(this.defaultState);
      this.props.showAlert('deleted important date');
    } else {
      this.props.showAlert(`failed to delete ${this.state.NAME}`);
    }
  }
}
