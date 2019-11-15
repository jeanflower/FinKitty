import React, { Component } from 'react';

import { DbTrigger } from '../types/interfaces';
import { newTriggerButtonData } from './AddDeleteTriggerForm';

const welcomeString = 'Choose a date (optional)';

interface TriggerOptionListProps {
  triggers: DbTrigger[];
  handleChange: (value: string) => void;
  submitTrigger: (trigger: DbTrigger) => void;
  selectId: string;
}
interface TriggerOptionListState {
  selectedItem: string;
}

export class TriggerOptionList extends Component<
  TriggerOptionListProps,
  TriggerOptionListState
> {
  constructor(props: TriggerOptionListProps) {
    super(props);
    this.state = { selectedItem: '' };
  }
  private newTriggerMade(e: DbTrigger) {
    this.props.submitTrigger(e);
    this.setState({
      ...this.state,
      selectedItem: e.NAME,
    });
    this.props.handleChange(e.NAME);
  }
  public render() {
    const optionData = this.props.triggers.map(trigger => {
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
    optionData.push(
      newTriggerButtonData(this.newTriggerMade.bind(this), this.props.selectId),
    );
    const options = optionData.map(bd => (
      <option
        value={bd.text}
        id={`option-useTrigger-${bd.text}`}
        key={bd.text}
        className="text-muted"
      >
        {bd.text}
      </option>
    ));
    return (
      <select
        className="custom-select"
        id={this.props.selectId}
        onChange={e => {
          const found = optionData.find(od => {
            return od.text === e.target.value;
          });
          if (found !== undefined) {
            found.action(e);
          }
        }}
        value={this.state.selectedItem}
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
