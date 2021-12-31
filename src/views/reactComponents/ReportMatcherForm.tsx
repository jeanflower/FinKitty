import React, { Component, FormEvent } from 'react';

import { Input } from './Input';
import { ReportMatcher } from '../../types/interfaces';

interface ReportMatcherFormState {
  JSON: string;
}
interface ReportMatcherFormProps {
  reportMatcher: ReportMatcher;
  setReportKey: (args0: string) => void;
}

export class ReportMatcherForm extends Component<
  ReportMatcherFormProps,
  ReportMatcherFormState
> {
  public defaultState: ReportMatcherFormState;

  public constructor(props: ReportMatcherFormProps) {
    super(props);
    this.defaultState = {
      JSON: JSON.stringify(this.props.reportMatcher),
    };

    this.state = this.defaultState;

    this.submit = this.submit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for JSON form ${value}`);
    this.setState({ JSON: value });
  }

  private handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    // log(`setting new value for JSON form ${value}`);
    this.submit(e);
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.submit}>
        <Input
          type={'text'}
          title={'matcher'}
          name={'replaceWithJSON'}
          value={this.state.JSON}
          placeholder={'Enter text input here'}
          onChange={this.handleValueChange}
          onSubmit={this.handleSubmit}
        />
      </form>
    );
  }

  private async submit(e: FormEvent<Element>) {
    e.preventDefault();

    this.props.setReportKey(this.state.JSON);
    return;
  }
}
