import React, { Component } from 'react';

import { DbModelData, DbTrigger } from '../types/interfaces';
import { log, printDebug, showObj } from '../utils';
import Button from './Button';
import Input from './Input';

interface EditFormState {
  NAME: string;
  TRIGGER_DATE: string;
}
interface EditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  showTriggerTable: any;
  model: DbModelData;
}

export function newTriggerButtonData(submitTrigger: any, selectId: string) {
  return {
    text: 'Make new important date',
    action: async (e: any) => {
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
      const dateTry = new Date(dateString);
      if (!dateTry.getTime()) {
        alert(`date didn't make sense`);
        return;
      }
      await submitTrigger({
        NAME: nameString,
        TRIGGER_DATE: dateTry,
      });

      const element = document.getElementById(selectId);
      if (element !== null && element instanceof HTMLInputElement) {
        // log(`set trigger selection ${nameString}`);
        element.value = nameString;
      } else {
        // log(`not setting trigger selection ${nameString}`);
      }
    },
  };
}
export class AddDeleteTriggerForm extends Component<EditProps, EditFormState> {
  public defaultState: EditFormState;

  constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteIncomeForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      TRIGGER_DATE: '',
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
        Name:
        <Input
          inputtype={'text'}
          name={'name'}
          value={this.state.NAME}
          placeholder={'Enter name'}
          handlechange={this.handleName}
        />{' '}
        Date:
        <Input
          inputtype={'text'}
          name={'date'}
          value={this.state.TRIGGER_DATE}
          placeholder={'Enter date'}
          handlechange={this.handleValueChange}
        />{' '}
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new important date (over-writes any existing with the same name)'
          }
          id="addTrigger"
        />{' '}
        <Button
          action={this.delete}
          type={'secondary'}
          title={'Delete any important date with this name'}
          id="deleteTrigger"
        />{' '}
      </form>
    );
  }

  private handleName(e: any) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ TRIGGER_DATE: value });
  }

  private async add(e: any) {
    e.preventDefault();

    // log('adding something ' + showObj(this));
    const trigger: DbTrigger = {
      NAME: this.state.NAME,
      TRIGGER_DATE: new Date(this.state.TRIGGER_DATE),
    };
    const message = this.props.checkFunction(trigger, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      await this.props.submitFunction(trigger);
      // alert('added new important date');
      this.props.showTriggerTable();
      // clear fields
      this.setState(this.defaultState);
    }
  }
  private delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    this.props.deleteFunction(this.state.NAME);
  }
}
