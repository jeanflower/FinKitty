import React, { Component, FormEvent } from "react";

import { Trigger, ModelData, FormProps } from "../../types/interfaces";
import { newTriggerButtonData } from "./AddDeleteTriggerForm";
import { lessThan } from "../../utils/stringUtils";

const welcomeString = "Choose a date (optional)";

interface TriggerOptionListProps extends FormProps {
  triggers: Trigger[];
  handleChange: (value: string) => void;
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
  selectedItem: string;
}

export class TriggerOptionList extends Component<
  TriggerOptionListProps,
  { selectedItem: string }
> {
  public constructor(props: TriggerOptionListProps) {
    super(props);
    this.state = { selectedItem: "" };
  }
  private newTriggerMade(e: Trigger) {
    this.props.submitTriggerFunction(e, this.props.model);
    this.setState({
      ...this.state,
      selectedItem: e.NAME,
    });
    this.props.handleChange(e.NAME);
  }
  public render() {
    const optionData = this.props.triggers
      .sort((a, b) => {
        return lessThan(a.NAME, b.NAME);
      })
      .map((trigger) => {
        return {
          text: trigger.NAME,
          action: (e: FormEvent<Element>) => {
            // log(`detected action`);
            // e.persist();
            e.preventDefault();
            this.props.handleChange(trigger.NAME);
          },
        };
      });
    optionData.push(
      newTriggerButtonData(
        this.newTriggerMade.bind(this),
        this.props.showAlert,
      ),
    );
    const options = optionData.map((bd) => (
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
        onChange={(e) => {
          const found = optionData.find((od) => {
            return od.text === e.target.value;
          });
          if (found !== undefined) {
            found.action(e);
          }
        }}
        value={this.props.selectedItem}
      >
        <option>{welcomeString}</option>
        {options}
      </select>
    );
  }
}
