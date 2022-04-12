import React, { Component, FormEvent } from 'react';

import { Input } from './Input';
import { ReportMatcher } from '../../types/interfaces';
import { makeButton } from './Button';
import {
  defaultSourceExcluder,
  defaultSourceMatcher,
} from '../../localization/stringConstants';

interface ReportMatcherFormState {
  sourceMatcher: string;
  sourceExcluder: string;
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
      sourceMatcher: this.props.reportMatcher.sourceMatcher,
      sourceExcluder: this.props.reportMatcher.sourceExcluder,
    };

    this.state = this.defaultState;

    this.submit = this.submit.bind(this);
    this.handleMatcherChange = this.handleMatcherChange.bind(this);
    this.handleExcluderChange = this.handleExcluderChange.bind(this);
  }

  private handleMatcherChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for sourceMatcher form ${value}`);
    this.setState({ sourceMatcher: value });
  }
  private handleExcluderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // log(`setting new value for sourceExcluder form ${value}`);
    this.setState({ sourceExcluder: value });
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.submit}>
        <div style={{ display: 'none' }}>
          {makeButton(
            'Filter table',
            this.submit,
            'MatchFilterer',
            'MatchFilterer',
            'primary',
          )}
        </div>
        <Input
          type={'text'}
          title={'Match sources'}
          name={'reportSourceMatcher'}
          value={this.state.sourceMatcher}
          placeholder={'Enter matcher here'}
          onChange={this.handleMatcherChange}
        />
        <Input
          type={'text'}
          title={'Exclude sources'}
          name={'reportSourceExcluder'}
          value={this.state.sourceExcluder}
          placeholder={'Enter excluder here'}
          onChange={this.handleExcluderChange}
        />
        {makeButton(
          'reset to default',
          (e) => {
            e.persist();
            this.setState(
              {
                sourceMatcher: defaultSourceMatcher,
                sourceExcluder: defaultSourceExcluder,
              },
              () => {
                this.submit(e);
              },
            );
          },
          'test',
          'test',
          'primary',
        )}
      </form>
    );
  }

  private async submit(e: FormEvent<Element>) {
    e.preventDefault();
    try {
      const regex1 = RegExp(this.state.sourceMatcher);
      const regex2 = RegExp(this.state.sourceExcluder);
      if ('test'.match(regex1) === null) {
        // log(`do not show source ${source} bcs it doesn't match ${matcher}`);
      }
      if ('test'.match(regex2) === null) {
        // log(`do not show source ${source} bcs it doesn't match ${matcher}`);
      }
    } catch (e) {
      alert('error processing regexp');
      return false;
    }

    this.props.setReportKey(
      JSON.stringify({
        sourceMatcher: this.state.sourceMatcher,
        sourceExcluder: this.state.sourceExcluder,
      }),
    );
    return;
  }
}
