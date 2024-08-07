import React from "react";
import { Component, FormEvent } from "react";

import { Input } from "./Input";
import { ModelData } from "../../types/interfaces";
import { makeButton } from "./Button";
import { log, printDebug } from "../../utils/utils";
import { minimalModel } from "../../models/minimalModel";

interface CreateModelFormState {
  newName: string;
}
interface CreateModelFormProps {
  userID: string;
  currentModelName: string;
  backupModel: (model: ModelData, modelName: string) => Promise<void>,
  modelData: ModelData;
  showAlert: (message: string) => void;
  cloneModel: (newName: string, oldModel: ModelData) => Promise<boolean>;
  exampleModels: {
    name: string;
    model: string;
  }[];
  getExampleModel: (JSONdata: string) => ModelData;
  getModelNames: (userID: string) => Promise<string[]>;
}

export class CreateModelForm extends Component<
  CreateModelFormProps,
  CreateModelFormState
> {
  public defaultState: CreateModelFormState;

  public constructor(props: CreateModelFormProps) {
    super(props);
    this.defaultState = {
      newName: "",
    };

    this.state = this.defaultState;

    this.clonePropsModel = this.clonePropsModel.bind(this);
  }

  private exampleButtonList() {
    const buttons: JSX.Element[] = this.props.exampleModels.map((x) => {
      return makeButton(
        `Create ${x.name} example`,
        async () => {
          const model = this.props.getExampleModel(x.model);
          // console.log(`from button click, created model ${model.name}`);
          await this.copyModel(model);
        },
        `btn-create-${x.name}-example`,
        `btn-create-${x.name}-example`,
        "outline-primary",
      );
    });
    return <div role="group">{buttons}</div>;
  }

  public render() {
    return (
      <>
        <div className="btn-group ml-3" role="group">
          {makeButton(
            "Make backup of model",
            (e: FormEvent) => {
              e.preventDefault();
              this.props.backupModel(this.props.modelData, this.props.currentModelName);
            },
            `btn-backup`,
            `btn-backup`,
            "outline-primary",
          )}
        </div>
        <br></br>
        <br></br>
        <form
          className="container-fluid"
          onSubmit={async (e) => {
            e.preventDefault();
            // log(`make copy of minimal model`);
            this.copyModel(minimalModel);
          }}
        >
          <Input
            type={"text"}
            title={"Create new model"}
            name={"createModel"}
            value={this.state.newName}
            placeholder={"Enter new model name here"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ newName: e.target.value });
            }}
          />
          {makeButton(
            "New model",
            async () => {
              /* istanbul ignore if  */
              if (printDebug()) {
                log(`action on button for new model`);
              }
              this.copyModel(minimalModel);
            },
            `btn-createMinimalModel`,
            `btn-createMinimalModel`,
            "outline-primary",
          )}
          {makeButton(
            "Clone model",
            this.clonePropsModel,
            `btn-clone`,
            `btn-clone`,
            "outline-primary",
          )}
          <br></br>
          {this.exampleButtonList()}
          <br></br>
        </form>
      </>
    );
  }

  private async clonePropsModel(e: FormEvent<Element>) {
    // log(`in clonePropsModel`);
    e.preventDefault();
    this.copyModel(this.props.modelData);
  }

  private mounted = false;

  public newModelFormIsMounted() {
    return this.mounted;
  }

  public componentWillUnmount(): void {
    this.mounted = false;
  }
  public componentDidMount(): void {
    this.mounted = true;
  }

  private async copyModel(model: ModelData) {
    // log(`in copyModel`);
    const newName = this.state.newName;
    if (newName.includes("{")) {
      this.props.showAlert(
        `Names of models are not permitted to include characaters '{'`,
      );
      return;
    }
    if (newName.length === 0) {
      this.props.showAlert("Please provide a new name for the model");
      return;
    }
    // log(`going to create an example model called ${newName}`);
    if (
      !(await this.props.getModelNames(this.props.userID)).includes(newName) ||
      window.confirm(`will replace ${newName}, you sure?`)
    ) {
      log(`go to clone model`);
      if (await this.props.cloneModel(newName, model)) {
        // log('cloned ok -  clear name field');
        if (this.mounted) {
          this.setState({ newName: "" });
        }
      } else {
        log("failed to clone ok");
      }
    }
  }
}
