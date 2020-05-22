import React, { Component } from 'react';

import { log, printDebug, showObj } from '../../utils';
import Button from './Button';
import Input from './Input';
import { DbModelData } from '../../types/interfaces';

interface EditFormState {
  NAME: string;
}
interface EditProps {
  submitFunction: (settingInput: string, model: DbModelData) => Promise<any>;
  deleteFunction: (settingName: string) => Promise<boolean>;
  model: DbModelData;
}
export class AddDeleteEntryForm extends Component<EditProps, EditFormState> {
  public constructor(props: EditProps) {
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
      </form>
    );
  }

  private handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private async add(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    await this.props.submitFunction(this.state.NAME, this.props.model);
    alert('added new setting');
    // clear fields
    this.setState({ NAME: '' });
  }
  private async delete(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    if (await this.props.deleteFunction(this.state.NAME)) {
      alert('deleted setting');
      // clear fields
      this.setState({ NAME: '' });
    } else {
      alert(`failed to delete ${this.state.NAME}`);
    }
  }
}
