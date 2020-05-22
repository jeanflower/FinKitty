import React, { Component } from 'react';
import { DbTrigger, DbModelData } from '../../types/interfaces';
import { TriggerOptionList } from './TriggerOptionList';
import { makeDateTooltip } from '../../utils';
import ReactTooltip from 'react-tooltip';

interface DateSelectionProps {
  introLabel: string;
  model: DbModelData;
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
export class DateSelectionRow extends Component<DateSelectionProps, {}> {
  public render() {
    // log('rendering a DateSelectionRow');
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
            submitTriggerFunction={this.props.submitTriggerFunction}
            handleChange={this.props.setDateFunction}
            selectedItem=""
          />
        </div>
        {/* end col */}
        <div className="col">
          <ReactTooltip />
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
            data-tip={makeDateTooltip(
              this.props.inputValue,
              this.props.triggers,
            )}
          />
        </div>
        {/* end col */}
      </div>
    );
  }
}
