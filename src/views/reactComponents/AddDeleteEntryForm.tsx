import React, { Component } from 'react';

import { log, printDebug, showObj } from '../../utils';
import Input from './Input';

interface EditFormState {
  VALUE: string;
}
interface EditProps {
  name: string;
  getValue: () => string;
  submitFunction: (value: string) => Promise<any>;
  showAlert: (message: string) => void;
}
export class AddDeleteEntryForm extends Component<EditProps, EditFormState> {
  public constructor(props: EditProps) {
    super(props);
    if (printDebug()) {
      log('props for AddDeleteEntryForm: ' + showObj(props));
    }

    this.state = {
      VALUE: this.props.getValue(),
    };

    this.handleValue = this.handleValue.bind(this);
    this.add = this.add.bind(this);
  }
  public render() {
    //log(`rendering widget, title = ${this.props.name}`);
    //log(`rendering widget, value from callback = ${this.props.getValue()}`);
    //log(`rendering widget, value in component = ${this.state.VALUE}`);
    return (
      <form className="container-fluid" onSubmit={this.add}>
      <Input
        title={`${this.props.name}, currently ${this.props.getValue()}`}
        type={'text'}
        name={`EditWidget${name}`}
        value={this.state.VALUE}
        placeholder={'Enter new value'}
        onChange={this.handleValue}
        onSubmit={this.add}
      />
      </form>
    );
  }
  private handleValue(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private async add(e: any) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      this.state.VALUE,
    );
    this.props.showAlert(`updating`);
  }
}
