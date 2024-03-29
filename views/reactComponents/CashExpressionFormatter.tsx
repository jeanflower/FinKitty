import React from "react";
import { makeStringFromCashValue } from "../../utils/stringUtils";
// import { showObj } from ''../../utils''
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { log } from "../../utils/utils";
import { evaluate } from "mathjs";

import styles from './CashExpressionFormatter.module.css';

log;

interface CashExpressionFormatterProps {
  name: string;
  value: string;
  highlightColor?: string;
}
class CashExpressionFormatter extends React.Component<CashExpressionFormatterProps> {
  public render() {
    let result: string;
    if (
      this.props.value === "" ||
      this.props.value === undefined ||
      this.props.value === "undefined"
    ) {
      return "";
    }
    let evaluation = this.props.value;
    let evaluationOK = false;
    try {
      evaluation = evaluate(this.props.value);
      evaluationOK = true;
    } catch(error) {
      // OK, we'll just keep the original expression
    }
    if (evaluationOK) {
      result = makeStringFromCashValue(`${evaluation}`, "£");
    } else {
      result = this.props.value;
    }
    // log(`cash formatter from ${this.props.value} = ${result}`);
    let className = 'float: right';
    if(this.props.highlightColor === 'red'){
      className = styles.red;
    } else if(this.props.highlightColor === 'green'){
      className = styles.green;
    }
    // console.log(`className = ${className} for val ${result}`);
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}:${result}`}</Tooltip>
        )}
      >
        <span className={className}>{result}</span>
      </OverlayTrigger>
    );
  }
}

export default CashExpressionFormatter;
