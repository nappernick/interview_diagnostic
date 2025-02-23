import React from "react";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CustomNodeModel } from "../types/node";
import { CustomNodeWidget } from "../components/CustomNodeWidget"; // Import the widget

export class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
  private nodeType: string;

  constructor(nodeType: string) {
    super(nodeType);
    this.nodeType = nodeType;
  }

  generateModel(event: any): CustomNodeModel {
    return new CustomNodeModel({
      name: this.nodeType,
      color: "#cccccc",
      type: this.nodeType,
      details: "",
      annotation: "",
    });
  }

  generateReactWidget(event: { model: CustomNodeModel }): JSX.Element {
    return <CustomNodeWidget engine={this.engine as DiagramEngine} node={event.model} />;
  }
}