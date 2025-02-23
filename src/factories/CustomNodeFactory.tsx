// src/factories/CustomNodeFactory.tsx
import React from "react";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CustomNodeModel } from "../types/node";

/**
 * A simple factory that returns a very basic widget for any node type you pass in.
 * For example, if you pass in "RelationalDB", this factory is keyed with that type,
 * and will create CustomNodeModel + a <div> for rendering.
 */
export class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
  private nodeType: string;

  constructor(nodeType: string) {
    super(nodeType); // internally sets 'this.type' to nodeType
    this.nodeType = nodeType;
  }

  // Called if the diagram engine needs a new model (e.g. from deserialization)
  generateModel(event: any): CustomNodeModel {
    // For a brand new node of this type, just do minimal info:
    return new CustomNodeModel({
      name: this.nodeType,
      color: "#cccccc",
      type: this.nodeType,
      details: "",
      annotation: ""
    });
  }

  // Called to render the node’s React widget
  generateReactWidget(event: { model: CustomNodeModel }): JSX.Element {
    const node = event.model;
    return (
      <div
        style={{
          border: "1px solid #000",
          backgroundColor: node.getOptions().color || "#f0f0f0",
          padding: "10px",
          minWidth: 80,
          minHeight: 40,
          textAlign: "center",
        }}
      >
        <strong>{node.getOptions().name}</strong>
      </div>
    );
  }
}
  