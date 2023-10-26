import React, { Component, FormEvent } from "react";

import { log, printDebug, showObj } from "../../utils/utils";
import { InputRow } from "./Input";

interface EditFormState {
  originalValue: string;
  value: string;
}
interface EditProps {
  name: string;
  getValue: () => string;
  submitFunction: (value: string) => Promise<{
    updated: boolean;
    value: string;
  }>;
  showAlert: (message: string) => void;
}
export class AddDeleteEntryForm extends Component<EditProps, EditFormState> {
  public constructor(props: EditProps) {
    super(props);
    /* istanbul ignore if  */
    if (printDebug()) {
      log("props for AddDeleteEntryForm: " + showObj(props));
    }

    this.state = {
      value: this.props.getValue(),
      originalValue: this.props.getValue(),
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
        <InputRow
          title={`${this.props.name}`}
          type={"text"}
          name={`EditWidget${this.props.name}`}
          value={this.state.value}
          placeholder={this.props.getValue()}
          onChange={this.handleValue}
        />
      </form>
    );
  }
  private handleValue(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ value: value });
  }
  private async add(e: FormEvent<Element>) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    this.props.showAlert(`updating`);
    const outcome = await this.props.submitFunction(this.state.value);
    if (outcome.updated) {
      this.setState({
        originalValue: this.state.value,
      });
    } else {
      // log(`submit returned false, set state to ${this.state.originalValue}`);
      this.setState({
        value: this.state.originalValue,
      });
    }
  }
}
