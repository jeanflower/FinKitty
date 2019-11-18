import React, { Component } from 'react';
import { DbTrigger } from '../types/interfaces';
import { TriggerOptionList } from './TriggerOptionList';
import ReactTooltip from 'react-tooltip';
import { makeTooltip } from '../utils';

interface DateSelectionProps {
  introLabel: string;
  setDateFunction: (value: string) => void;
  selectID: string;
  inputName: string;
  inputValue: string;
  onChangeHandler: (e: any) => void;
  triggers: DbTrigger[];
  submitTrigger: any;
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
            submitTrigger={this.props.submitTrigger}
            selectId={this.props.selectID}
            handleChange={this.props.setDateFunction}
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
            data-tip={makeTooltip(this.props.inputValue, this.props.triggers)}
          />
        </div>
        {/* end col */}
      </div>
    );
  }
}
