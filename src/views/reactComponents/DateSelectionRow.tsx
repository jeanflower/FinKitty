import React, { Component } from 'react';
import { DbTrigger, DbModelData, FormProps } from '../../types/interfaces';
import { TriggerOptionList } from './TriggerOptionList';
import { log, makeDateTooltip, showObj, printDebug } from '../../utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface DateSelectionProps extends FormProps {
  introLabel: string;
  setDateFunction: (value: string) => void;
  inputName: string;
  inputValue: string;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggers: DbTrigger[];
  submitTriggerFunction: (
    triggerInput: DbTrigger,
    modelData: DbModelData,
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
  public render() {
    return (
      <div className="row">
        <div className="col p-2 mb-2 bg-secondary text-white">
          {
            this.props.introLabel // e.g. Date on which the income value is set:
          }
        </div>{' '}
        {/* end col */}
        <div className="col">
          <TriggerOptionList
            triggers={this.props.triggers}
            model={this.props.model}
            showAlert={this.props.showAlert}
            submitTriggerFunction={this.props.submitTriggerFunction}
            handleChange={this.props.setDateFunction}
            selectedItem=""
          />
        </div>
        {/* end col */}
        <div className="col">
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
                this.props.onChangeHandler // e.g. this.handleValueSetChange
              }
              className="form-control"
            />
          </OverlayTrigger>
        </div>
        {/* end col */}
      </div>
    );
  }
}
