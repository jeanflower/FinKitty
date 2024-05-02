import { makePartitionedModelNames } from "App";
import Image from "next/image";
import WaitGif from '../catWait.gif';
import React from "react";
import { Form } from "react-bootstrap";
import { makeButton } from "./Button";

interface ModelListProps {
  modelNames: string[];
  showAllBackups: boolean;
  actionOnSelect: (arg0: string) => void;
}

export class ModelButtons extends React.Component<ModelListProps> {

  public render(){
    const modelNames = this.props.modelNames;

    if (modelNames.length === 0) {
      return (
        <div role="group">
          <Image src={WaitGif} alt="FinKitty wait symbol" />
          Loading models...
        </div>
      );
    }

    modelNames.sort();
    const primaryModelNames: {
      primaryName: string,
      backupNames: string[],
    }[] = makePartitionedModelNames(modelNames);
    const buttonFor = (
      model: string,
      isBackup: boolean,
    ) => {
      return makeButton(
        model,
        (e: React.MouseEvent<HTMLButtonElement>) => {
          e.persist();
          this.props.actionOnSelect(model);
        },
        model,
        `btn-model-${model}`,
        (isBackup ? "outline-secondary" : "outline-primary"),
      );
    };

    // log(`modelNames = ${modelNames}`);
    const buttons = primaryModelNames.map((model: {
      primaryName: string,
      backupNames: string[],
    }) => {
      return <React.Fragment
        key={model.primaryName}
      >
        <div>
          {buttonFor(model.primaryName, false)}
          {this.props.showAllBackups ? 
            model.backupNames.map((m) => {
              return buttonFor(m, true);
            }) :
            model.backupNames.length > 0 ? buttonFor(model.backupNames[model.backupNames.length - 1], true) : <></>
           }
        </div>
      </React.Fragment>
    });
    return (
      <Form>
        <div className="ml-3" id="selectLabel">
          Select an existing model
          <br />
          {buttons}
        </div>
      </Form>
    );
  }  
}