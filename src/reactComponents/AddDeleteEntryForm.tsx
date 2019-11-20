import React, { Component } from 'react';

import { log, printDebug, showObj } from '../utils';
import Button from './Button';
import Input from './Input';

interface EditFormState {
  NAME: string;
}
interface EditProps {
  submitFunction: any;
  deleteFunction: any;
}
export class AddDeleteEntryForm extends Component<EditProps, EditFormState> {
  constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log('props for EditForm: ' + showObj(props));
    }

    this.state = {
      NAME: '',
    };

    this.handleName = this.handleName.bind(this);
    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }
  public render() {
    return (
      <form className="container-fluid" onSubmit={this.add}>
        <Input
          type={'text'}
          name={'name'}
          value={this.state.NAME}
          placeholder={'Enter name'}
          onChange={this.handleName}
        />{' '}
        <Button
          action={this.add}
          type={'primary'}
          title={'Create new entry (over-writes an existing match)'}
          id="addEntry"
        />{' '}
        <Button
          action={this.delete}
          type={'secondary'}
          title={'Delete entry (loses data)'}
          id="deleteEntry"
        />{' '}
      </form>
    );
  }

  private handleName(e: any) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private add(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.submitFunction(this.state.NAME);
    alert('added new setting');
    // clear fields
    this.setState({ NAME: '' });
  }
  private delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    this.props.deleteFunction(this.state.NAME);
    alert('deleted setting');
    // clear fields
    this.setState({ NAME: '' });
  }
}
