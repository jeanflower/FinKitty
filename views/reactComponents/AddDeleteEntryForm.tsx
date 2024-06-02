import React, { Component, FormEvent } from "react";

import { DateFormatType, log, printDebug, showObj } from "../../utils/utils";
import { InputRow } from "./Input";
import { dateAsString } from "../../utils/stringUtils";
import { inspect } from 'util';
inspect;

interface EditFormState {
  originalValue: string;
  value: string;
}
interface EditProps {
  name: string;
  value: Date;
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

    const dateString = dateAsString(DateFormatType.View, props.value);

    this.state = {
      value: dateString,
      originalValue: dateString,
    };

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
          placeholder={this.props.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ value: e.target.value });
          }}
        />
      </form>
    );
  }
  private async add(e: FormEvent<Element>) {
    e.preventDefault();
    // log('adding something ' + showObj(this));    
    const outcome = await this.props.submitFunction(this.state.value);
    // log(`response from submitting new date ${inspect(outcome)}`);
    if (outcome.updated) {
      this.setState({
        originalValue: this.state.value,
      });
      this.props.showAlert(`updated`);
    } else {
      // log(`submit returned false, set state to ${this.state.originalValue}`);
      this.props.showAlert(`failed to update ${this.state.value} as a date`);
      this.setState({
        value: this.state.originalValue,
      });
    }
  }
}
