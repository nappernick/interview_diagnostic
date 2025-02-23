import React from "react";
import { PortWidget } from "@projectstorm/react-diagrams";
import { CustomNodeModel } from "../types/node";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { getIconForType } from "../utils/iconMapping";

export const CustomNodeWidget: React.FC<{ node: CustomNodeModel; engine: DiagramEngine }> = ({
  node,
  engine,
}) => {
  const icon = getIconForType(node.getOptions().type || "", node.getOptions().color, 28);
  console.log(`Rendering node: type=${node.getOptions().type}, color=${node.getOptions().color}`); // Debug

  return (
    <div
      style={{
        position: "relative",
        // width: 100,
        // height: 100,
        // backgroundColor: node.getOptions().color || "#f0f0f0",
        // borderRadius: 5,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PortWidget
        style={{ position: "absolute", left: -8, top: 40 }}
        port={node.getPort("in")!}
        engine={engine}
      >
        <div
          className="port"
          style={{
            width: 16,
            height: 16,
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        />
      </PortWidget>

      {icon}

      <PortWidget
        style={{ position: "absolute", right: -8, top: 40 }}
        port={node.getPort("out")!}
        engine={engine}
      >
        <div
          className="port"
          style={{
            width: 16,
            height: 16,
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        />
      </PortWidget>
    </div>
  );
};