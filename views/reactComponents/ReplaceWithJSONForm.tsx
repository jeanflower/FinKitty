import React, { Component, FormEvent } from "react";

import { log, printDebug } from "../../utils/utils";
import { Input } from "./Input";
import { makeButton } from "./Button";
import {
  checkModelOnEditOption,
  checkOverwriteOption,
  evalModeOption,
  goToAssetsPageOption,
  showHistoricalOption,
  showCurrentOption,
  showFutureOption,
  advancedUI,
  simpleUI,
  showAllBackupsOption,
} from "../../localization/stringConstants";
import { makeModelFromJSON } from "../../models/modelFromJSON";
import { ModelData } from "../../types/interfaces";
import { getTestModel } from "../../models/testModel";

interface ReplaceWithJSONFormState {
  JSON: string;
}
interface ReplaceWithJSONFormProps {
  modelName: string;
  modelNames: string[];
  userID: string;
  showAlert: (arg0: string) => void;
  setReportKey: (
    args0: string,
    args1: number,
    args2: boolean,
    args3: boolean,
    args4: boolean,
  ) => void;
  toggleOption: (type: string) => void;
  setUIMode: (type: string) => void;
  getOption: (type: string) => boolean;
  getUIMode: () => string;
  showHistorical: () => boolean;
  showCurrent: () => boolean;
  showFuture: () => boolean;
  replaceWithModel: (
    userName: string | undefined,
    thisModelName: string,
    newModel: ModelData,
    confirmBeforeReplace: boolean,
  ) => Promise<boolean>;
}

export class ReplaceWithJSONForm extends Component<
  ReplaceWithJSONFormProps,
  ReplaceWithJSONFormState
> {
  public defaultState: ReplaceWithJSONFormState;

  public constructor(props: ReplaceWithJSONFormProps) {
    super(props);
    this.defaultState = {
      JSON: "",
    };

    this.state = this.defaultState;

    this.replace = this.replace.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  private handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    // log(`setting new value for JSON form ${value}`);
    this.replace(e);
  }

  public render() {
    return (
      <form className="container-fluid" onSubmit={this.replace}>
        <Input
          type={"text"}
          title={"newModelName:{jsonModelData}"}
          name={"replaceWithJSON"}
          value={this.state.JSON}
          placeholder={"Enter text input here"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ JSON: e.target.value });
          }}
          onSubmit={this.handleSubmit}
        />
        {makeButton(
          this.props.getUIMode() === simpleUI
            ? "switch to advanced UI mode"
            : "switch to simple UI mode",
          async (e: FormEvent<Element>) => {
            if (this.props.getUIMode() === simpleUI) {
              await this.setState({
                JSON: advancedUI,
              });
            } else {
              await this.setState({
                JSON: simpleUI,
              });
            }
            this.replace(e);
          },
          "toggleTransB",
          "toggleTransB",
          "outline-secondary",
        )}
        <br></br>
        {makeButton(
          this.props.showHistorical() ? "hide old items" : `show old items`,
          () => {
            this.props.toggleOption(showHistoricalOption);
          },
          "showHistoricalOption",
          "showHistoricalOption",
          "outline-secondary",
        )}
        {makeButton(
          this.props.showCurrent()
            ? "hide current items"
            : `show current items`,
          () => {
            this.props.toggleOption(showCurrentOption);
          },
          "showCurrentOption",
          "showCurrentOption",
          "outline-secondary",
        )}
        {makeButton(
          this.props.showFuture() ? "hide future items" : `show future items`,
          () => {
            this.props.toggleOption(showFutureOption);
          },
          "showFutureOption",
          "showFutureOption",
          "outline-secondary",
        )}
        {makeButton(
          this.props.getOption(evalModeOption)
            ? `don't refresh charts on model edit`
            : "do refresh charts on model edit",
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: "eval",
            });
            this.replace(e);
          },
          "toggleEDC",
          "toggleEDC",
          "outline-secondary",
        )}
        <br></br>
        {makeButton(
          this.props.getOption(checkModelOnEditOption)
            ? `don't check model on edit`
            : "do check model on edit",
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: checkModelOnEditOption,
            });
            this.replace(e);
          },
          "toggleCMOE",
          "toggleCMOE",
          "outline-secondary",
        )}
        <br></br>
        {makeButton(
          this.props.getOption(checkOverwriteOption)
            ? `don't check before overwrite`
            : "do check before overwrite",
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: "overwrite",
            });
            this.replace(e);
          },
          "toggleCBO",
          "toggleCBO",
          "outline-secondary",
        )}
        <br></br>
        {makeButton(
          this.props.getOption(goToAssetsPageOption)
            ? `don't jump to Assets page when selecting a model`
            : `do jump to Assets page when selecting a model`,
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: "overview",
            });
            this.replace(e);
          },
          "toggleJTO",
          "toggleJTO",
          "outline-secondary",
        )}
        <br></br>
        {makeButton(
          this.props.getOption(showAllBackupsOption)
            ? "show latest model backu"
            : "show all model backups",
          async (e: FormEvent<Element>) => {
            await this.setState({
              JSON: showAllBackupsOption,
            });
            this.replace(e);
          },
          "toggleSAB",
          "toggleSAB",
          "outline-secondary",
        )}
      </form>
    );
  }

  private async replace(e: FormEvent<Element>) {
    e.preventDefault();
    let modelName = this.props.modelName;

    // special words
    const overwriteWord = "overwrite";
    const gotoOverview = "overview";
    const checkModelOnEdit = checkModelOnEditOption;
    const evalWord = "eval";

    // log(`modelName from props is ${modelName}`);
    let JSONinput = this.state.JSON.trim();

    /*
    Options to toggle are
    - checkOverwriteOption
    - goToAssetsPageOption
    - checkModelOnEditOption
    - 'evalMode'
    */

    if (JSONinput === simpleUI) {
      this.props.setUIMode(simpleUI);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === advancedUI) {
      this.props.setUIMode(advancedUI);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === overwriteWord) {
      this.props.toggleOption(checkOverwriteOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === evalWord) {
      this.props.toggleOption(evalModeOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === gotoOverview) {
      this.props.toggleOption(goToAssetsPageOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === checkModelOnEdit) {
      this.props.toggleOption(checkModelOnEditOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === showAllBackupsOption) {
      this.props.toggleOption(showAllBackupsOption);
      this.setState({ JSON: "" });
      return;
    }    
    if (JSONinput === showHistoricalOption) {
      this.props.toggleOption(showHistoricalOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === showCurrentOption) {
      this.props.toggleOption(showCurrentOption);
      this.setState({ JSON: "" });
      return;
    }
    if (JSONinput === showFutureOption) {
      this.props.toggleOption(showFutureOption);
      this.setState({ JSON: "" });
      return;
    }
    const i = this.state.JSON.indexOf(`{`);
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`index of { in ${JSONinput} is ${i}`);
    }
    if (i !== 0) {
      modelName = JSONinput.substring(0, i);
      // log(`modelName from JSON is ${modelName}`);
      JSONinput = JSONinput.substring(i);
    }
    const alreadyExists = this.props.modelNames.find((existing) => {
      return existing === modelName;
    });
    if (
      !alreadyExists ||
      !this.props.getOption("checkOverwrite") ||
      window.confirm(
        `will replace ${modelName} which already exists, you sure?`,
      )
    ) {
      let newModel;

      const result = JSON.parse(JSONinput);
      // log(`parsed JSON and found ${showObj(result)}`);
      if (result.testName !== undefined) {
        // log("this isn't JSON but refers to test data we can look up");
        const testModel = getTestModel(result.testName);

        // still use makeModelFromJSON as it does some checks and migrations
        // from old data
        newModel = makeModelFromJSON(JSON.stringify(testModel));
      } else {
        newModel = makeModelFromJSON(JSONinput);
      }

      this.props.replaceWithModel(
        this.props.userID,
        modelName,
        newModel,
        false,
      );
      this.props.showAlert("replaced data OK");
      this.setState({ JSON: "" });
    }
  }
}
