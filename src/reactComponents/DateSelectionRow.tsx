import React, { Component } from 'react';
import { IDbTrigger } from '../types/interfaces';
import { TriggerOptionList } from './TriggerOptionList';

interface IDateSelectionProps {
  introLabel: string;
  setDateFunction: (value: string) => void;
  selectID: string;
  inputName: string;
  inputValue: string;
  onChangeHandler: (e: any) => void;
  triggers: IDbTrigger[];
  submitTrigger: any;
}
export class DateSelectionRow extends Component<IDateSelectionProps, {}> {
  public render() {
    // log('rendering a DateSelectionRow');
    return (
      <div className="row">
      <div className="col p-2 mb-2 bg-secondary text-white">
        {
          this.props.introLabel // e.g. Date on which the income value is set:
        }
      </div> {/* end col */}
      <div className="col">
        <TriggerOptionList
          triggers={this.props.triggers}
          submitTrigger={this.props.submitTrigger}
          selectId={this.props.selectID}
          handleChange={this.props.setDateFunction}
        />
      </div>{/* end col */}
      <div className="col">
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
      </div>{/* end col */}
    </div>
    );
  }
}
