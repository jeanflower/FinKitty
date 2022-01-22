import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Trigger, ModelData, FormProps } from '../../types/interfaces';
import { TriggerOptionList } from './TriggerOptionList';
import { log, showObj, printDebug } from '../../utils';
import { makeDateTooltip } from '../../stringUtils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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
  if (printDebug()) {
    log(`make tooltip with ${showObj(props)}`);
  }
  if (props.model.settings.length === 0) {
    return '';
  }
  return makeDateTooltip(props.inputValue, props.triggers);
}
export class DateSelectionRow extends Component<DateSelectionProps, {}> {
  constructor(props: DateSelectionProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === 'today') {
      e.target.value = new Date().toDateString();
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
        </div>{' '}
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
              type={'text'}
              name={
                this.props.inputName // e.g. 'income valuation date'
              }
              value={
                this.props.inputValue // e.g. this.state.VALUE_SET
              }
              placeholder={'Enter date'}
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
