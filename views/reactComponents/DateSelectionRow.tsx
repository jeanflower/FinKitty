import React, { Component, FormEvent } from "react";
import { Col, Row } from "react-bootstrap";

import { Trigger, ModelData, FormProps, Item } from "../../types/interfaces";
import { TriggerOptionList } from "./TriggerOptionList";
import { log, showObj, printDebug, DateFormatType } from "../../utils/utils";
import { dateAsString, makeDateTooltip } from "../../utils/stringUtils";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { getVarVal } from "../../models/modelQueries";

interface DateSelectionProps extends FormProps {
  introLabel: string;
  setDateFunction: (value: string) => void;
  inputName: string;
  inputValue: string;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggers: Trigger[];
  submitTriggerFunction: (
    triggerInput: Trigger,
    modelData: ModelData,
  ) => Promise<void>;
}
function makeDateTooltipForRow(props: DateSelectionProps) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`make tooltip with ${showObj(props)}`);
  }
  if (props.model.settings.length === 0) {
    return "";
  }
  return makeDateTooltip(
    props.inputValue,
    props.triggers,
    getVarVal(props.model.settings),
  );
}
export class DateSelectionRow extends Component<DateSelectionProps> {
  constructor(props: DateSelectionProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "today") {
      e.target.value = dateAsString(DateFormatType.Unknown, new Date());
    }
    this.props.onChangeHandler(e);
  }

  public render() {
    return (
      <Row>
        <div className="col p-2 mb-2 bg-secondary text-white">
          {
            this.props.introLabel // e.g. Date on which the income value is set:
          }
        </div>{" "}
        {/* end col */}
        <Col>
          <TriggerOptionList
            triggers={this.props.triggers}
            model={this.props.model}
            showAlert={this.props.showAlert}
            submitTriggerFunction={this.props.submitTriggerFunction}
            handleChange={this.props.setDateFunction}
            selectedItem=""
          />
        </Col>
        <Col>
          <OverlayTrigger
            placement="top"
            overlay={(props: any) => (
              <Tooltip {...props}>{`${makeDateTooltipForRow(
                this.props,
              )}`}</Tooltip>
            )}
          >
            <input
              type={"text"}
              name={
                this.props.inputName // e.g. 'income valuation date'
              }
              value={
                this.props.inputValue // e.g. this.state.VALUE_SET
              }
              placeholder={"Enter date"}
              onChange={
                this.handleChange
                // e.g. this.handleValueSetChange
              }
              className="form-control"
            />
          </OverlayTrigger>
        </Col>
      </Row>
    );
  }
}

export function itemOptions(
  items: Item[],
  model: ModelData,
  handleChange: any,
  id: string,
  welcomeString: string,
) {
  const optionData = items.map((i) => {
    return {
      text: i.NAME,
      action: (e: FormEvent<Element>) => {
        // log(`detected action`);
        // e.persist();
        e.preventDefault();
        handleChange(i.NAME);
      },
    };
  });
  const options = optionData.map((bd) => (
    <option
      value={bd.text}
      id={`option-${id}-${bd.text}`}
      key={bd.text}
      className="text-muted"
    >
      {bd.text}
    </option>
  ));
  return (
    <select
      className="custom-select"
      id={id}
      onChange={(e) => {
        const found = optionData.find((od) => {
          return od.text === e.target.value;
        });
        if (found !== undefined) {
          found.action(e);
        } else {
          handleChange("");
        }
      }}
    >
      <option>{welcomeString}</option>
      {options}
    </select>
  );
}
