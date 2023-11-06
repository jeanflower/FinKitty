import React from "react";
import { makeStringFromCashValue } from "../../utils/stringUtils";
// import { showObj } from ''../../utils''
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { log } from "../../utils/utils";
import { evaluate } from "mathjs";

log;

interface CashExpressionFormatterProps {
  name: string;
  value: string;
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
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}:${result}`}</Tooltip>
        )}
      >
        <span className="float: right">{result}</span>
      </OverlayTrigger>
    );
  }
}

export default CashExpressionFormatter;
