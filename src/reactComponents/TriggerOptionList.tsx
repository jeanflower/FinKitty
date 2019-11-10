import React, { Component } from 'react';

import { IDbTrigger } from '../types/interfaces';
import { newTriggerButtonData } from './AddDeleteTriggerForm';

const welcomeString = 'Choose a date (optional)';

interface ITriggerOptionListProps {
  triggers: IDbTrigger[];
  handleChange: (value: string) => void;
  submitTrigger: (trigger: IDbTrigger) => void;
  selectId: string;
}
interface ITriggerOptionListState {
  selectedItem: string;
}

export class TriggerOptionList extends Component<ITriggerOptionListProps, ITriggerOptionListState> {
  public render() {
    const optionData = this.props.triggers.map((trigger) => {
      return {
        text: trigger.NAME,
        action: (e: any) => {
          // log(`detected action`);
          // e.persist();
          e.preventDefault();
          this.handleChange(trigger.NAME);
        },
      };
    });
    optionData.push(newTriggerButtonData(
      this.props.submitTrigger,
      this.props.selectId,
      welcomeString,
    ));
    const options = optionData.map((bd) =>
      <option
        value={bd.text}
        id={`option-useTrigger-${bd.text}`}
        key={bd.text}
        className="text-muted"
      >
        {bd.text}
      </option>,
    );
    return (
      <select
        className="custom-select"
        id={this.props.selectId}
        onChange={(e) => {
          const found = optionData.find((od) => {
            return od.text === e.target.value;
          });
          if (found !== undefined) {
            found.action(e);
          }
        }}
      >
      <option>{welcomeString}</option>
        {options}
      </select>
    );
  }
  private handleChange(selection: string) {
    this.setState({
      ...this.state,
      selectedItem: selection,
    });
    this.props.handleChange(selection);
  }
}
