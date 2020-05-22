import React, { Component } from 'react';

import { DbModelData, DbTrigger } from '../../types/interfaces';
import { log, printDebug, showObj, makeDateFromString } from '../../utils';
import Button from './Button';
import Input from './Input';

interface EditTriggerFormState {
  NAME: string;
  DATE: string;
}
interface EditTriggerProps {
  checkFunction: (t: DbTrigger, modelData: DbModelData) => string;
  submitFunction: (
    triggerInput: DbTrigger,
    modelData: DbModelData,
  ) => Promise<void>;
  deleteFunction: (settingName: string) => Promise<boolean>;
  showTriggerTable: any;
  model: DbModelData;
}

export function newTriggerButtonData(
  submitTriggerFunction: (e: DbTrigger) => void,
) {
  return {
    text: 'Make new important date',
    action: async (e: React.ChangeEvent<HTMLInputElement>) => {
      // e.persist();
      e.preventDefault();
      const nameString = prompt('Name for new important date', '');
      if (nameString === null || nameString.length === 0) {
        alert('names need to have some characters');
        return;
      }
      const dateString = prompt('Important date (e.g. 1 Jan 2019)', '');
      if (dateString === null || dateString.length === 0) {
        alert(`date didn't make sense`);
        return;
      }
      const dateTry = makeDateFromString(dateString);
      if (!dateTry.getTime()) {
        alert(`date didn't make sense`);
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
            <Button
              action={this.add}
              type={'primary'}
              title={
                'Create new important date (over-writes any existing with the same name)'
              }
              id="addTrigger"
            />
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

  private async add(e: any) {
    e.preventDefault();

    // log('adding something ' + showObj(this));
    const trigger: DbTrigger = {
      NAME: this.state.NAME,
      DATE: makeDateFromString(this.state.DATE),
    };
    const message = this.props.checkFunction(trigger, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      await this.props.submitFunction(trigger, this.props.model);
      // alert('added new important date');
      this.props.showTriggerTable();
      // clear fields
      this.setState(this.defaultState);
      alert('added important date OK');
    }
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      this.setState(this.defaultState);
      alert('deleted important date');
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
}
