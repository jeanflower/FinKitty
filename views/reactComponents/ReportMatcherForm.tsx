import React, { Component, FormEvent } from "react";

import { Input } from "./Input";
import { ReportMatcher } from "../../types/interfaces";
import { makeButton } from "./Button";
import {
  defaultReportSize,
  defaultSourceExcluder,
  defaultSourceMatcher,
} from "../../localization/stringConstants";

interface ReportMatcherFormState {
  sourceMatcher: string;
  sourceExcluder: string;
  maxReportSize: string;
  saveAsCSV: boolean;
  reportIncludesSettings: boolean;
  reportIncludesExpenses: boolean;
}
interface ReportMatcherFormProps {
  reportMatcher: ReportMatcher;
  setReportKey: (
    textInput: string,
    maxSize: number,
    saveAsCSV: boolean,
    reportIncludesSettings: boolean,
    reportIncludesExpenses: boolean,
  ) => void;
  maxReportSize: number;
  reportIncludesSettings: boolean;
  reportIncludesExpenses: boolean;
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
      maxReportSize: `${this.props.maxReportSize}`,
      saveAsCSV: false,
      reportIncludesSettings: false,
      reportIncludesExpenses: false,
    };

    this.state = this.defaultState;

    this.submit = this.submit.bind(this);
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.submit}>
        <div style={{ display: "none" }}>
          {makeButton(
            "Filter table",
            this.submit,
            "MatchFilterer",
            "MatchFilterer",
            "primary",
          )}
        </div>
        <Input
          type={"text"}
          title={"Match sources (e.g. Buy|Sell, or . means everything)"}
          name={"reportSourceMatcher"}
          value={this.state.sourceMatcher}
          placeholder={"Enter matcher here"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ sourceMatcher: e.target.value });
          }}
        />
        <Input
          type={"text"}
          title={"Exclude sources"}
          name={"reportSourceExcluder"}
          value={this.state.sourceExcluder}
          placeholder={"Enter excluder here"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ sourceExcluder: e.target.value });
          }}
        />
        <Input
          type={"text"}
          title={"Max number of report items"}
          name={"maxReportSize"}
          value={this.state.maxReportSize}
          placeholder={"0"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ maxReportSize: e.target.value });
          }}
        />
        {makeButton(
          "reset to default",
          (e) => {
            e.persist();
            this.setState(
              {
                sourceMatcher: defaultSourceMatcher,
                sourceExcluder: defaultSourceExcluder,
                maxReportSize: `${defaultReportSize}`,
              },
              () => {
                this.submit(e);
              },
            );
          },
          "resetToDefault",
          "resetToDefault",
          "primary",
        )}
        {makeButton(
          "export to csv",
          (e) => {
            e.persist();
            this.setState(
              {
                saveAsCSV: !this.state.saveAsCSV,
              },
              () => {
                this.submit(e);
              },
            );
          },
          "exportToCSV",
          "exportToCSV",
          this.state.saveAsCSV ? "primary" : "secondary",
        )}
        {makeButton(
          "include settings",
          (e) => {
            e.persist();
            this.setState(
              {
                reportIncludesSettings: !this.state.reportIncludesSettings,
              },
              () => {
                this.submit(e);
              },
            );
          },
          "includeSettings",
          "includeSettings",
          this.state.reportIncludesSettings ? "primary" : "secondary",
        )}
        {makeButton(
          "include expenses",
          (e) => {
            e.persist();
            this.setState(
              {
                reportIncludesExpenses: !this.state.reportIncludesExpenses,
              },
              () => {
                this.submit(e);
              },
            );
          },
          "includeExpenses",
          "includeExpenses",
          this.state.reportIncludesExpenses ? "primary" : "secondary",
        )}
      </form>
    );
  }

  private async submit(e: FormEvent<Element>) {
    e.preventDefault();
    try {
      const regex1 = RegExp(this.state.sourceMatcher);
      const regex2 = RegExp(this.state.sourceExcluder);
      if ("test".match(regex1) === null) {
        // log(`do not show source ${source} bcs it doesn't match ${matcher}`);
      }
      if ("test".match(regex2) === null) {
        // log(`do not show source ${source} bcs it doesn't match ${matcher}`);
      }
    } catch (e) {
      alert("error processing regexp");
      return false;
    }

    this.props.setReportKey(
      JSON.stringify({
        sourceMatcher: this.state.sourceMatcher,
        sourceExcluder: this.state.sourceExcluder,
      }),
      parseInt(this.state.maxReportSize),
      this.state.saveAsCSV,
      this.state.reportIncludesSettings,
      this.state.reportIncludesExpenses,
    );
    return;
  }
}
