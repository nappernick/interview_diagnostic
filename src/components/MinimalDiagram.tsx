// src/components/MinimalDiagram.tsx
import React, { useEffect, useRef, useState } from "react";
import createEngine, {
  DiagramEngine,
  DiagramModel,
  DefaultLinkFactory,
  CanvasWidget,
  NodeModel,
  PortModel,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";
import { DefaultNodeFactory, NodeWidget, PortWidget } from "@projectstorm/react-diagrams";
import ErrorBoundary from "./ErrorBoundary";
import "./MinimalDiagram.css";

/* ----------------------------------------
   1) Custom Node Model
---------------------------------------- */
interface CustomNodeModelOptions {
  name: string;
  color: string;
}

class CustomNodeModel extends NodeModel {
  private name: string;
  private color: string;

  constructor(options: CustomNodeModelOptions) {
    super({ type: "custom-node" });
    this.name = options.name;
    this.color = options.color;
  }

  getName(): string {
    return this.name;
  }

  getColor(): string {
    return this.color;
  }

  addOutPort(label: string): PortModel {
    const port = new PortModel({
      type: "default",
      name: label,
      alignment: PortModelAlignment.RIGHT,
    });
    this.addPort(port);
    return port;
  }

  serialize() {
    return {
      ...super.serialize(),
      name: this.name,
      color: this.color,
    };
  }

  deserialize(event: any): void {
    super.deserialize(event);
    this.name = event.data.name;
    this.color = event.data.color;
  }
}

/* ----------------------------------------
   2) Custom Node Factory
---------------------------------------- */
class CustomNodeFactory extends DefaultNodeFactory {
  constructor() {
    super();
    this.type = "custom-node";
  }

  generateReactWidget(event: { model: CustomNodeModel }): JSX.Element {
    return <CustomNodeWidget node={event.model} diagramEngine={this.engine} />;
  }

  getInstance() {
    return new CustomNodeModel({ name: "", color: "" });
  }
}

/* ----------------------------------------
   3) Custom Node Widget
---------------------------------------- */
class CustomNodeWidget extends NodeWidget {
  state = { isHovered: false };
  nodeRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  handleMouseEnter = () => this.setState({ isHovered: true });
  handleMouseLeave = () => this.setState({ isHovered: false });

  componentDidMount() {
    if (this.nodeRef.current) {
      // @ts-ignore - assign the node's DOM ref so that the engine can measure it
      this.ref = this.nodeRef.current;
    }
  }

  render() {
    const { node, diagramEngine: engine } = this.props;
    const typedNode = node as CustomNodeModel;
    const bgColor = this.state.isHovered ? "yellow" : typedNode.getColor();

    return (
      <div
        ref={this.nodeRef}
        style={{
          position: "relative",
          width: 100,
          height: 40,
          background: bgColor,
          border: "1px solid black",
          userSelect: "none",
        }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div style={{ fontSize: 14, padding: "0 5px" }}>{typedNode.getName()}</div>
        {Object.values(typedNode.getPorts()).map((port) => (
          <PortWidget engine={engine} port={port} key={port.getID()}>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: -8,
                width: 10,
                height: 10,
                backgroundColor: "black",
              }}
            />
          </PortWidget>
        ))}
      </div>
    );
  }
}

/* ----------------------------------------
   4) MinimalDiagram Component
---------------------------------------- */
const MinimalDiagram: React.FC = () => {
  const engineRef = useRef<DiagramEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // We use state to ensure we only render CanvasWidget when ready.
  const [readyToRender, setReadyToRender] = useState(false);

  useEffect(() => {
    if (engineRef.current) return;

    // Create engine and register factories
    const engine = createEngine();
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());

    // Create diagram model and add a node
    const model = new DiagramModel();
    const node = new CustomNodeModel({
      name: "Hello World",
      color: "rgb(192,255,0)",
    });
    node.setPosition(100, 100);
    node.addOutPort("Out");
    model.addNode(node);

    // Set model to engine and save reference
    engine.setModel(model);
    engineRef.current = engine;

    // Allow a short delay before rendering the canvas
    setTimeout(() => {
      engine.repaintCanvas();
      setReadyToRender(true);
    }, 200);
  }, []);

  return (
    <div ref={containerRef} className="diagram-container">
      <ErrorBoundary>
        {engineRef.current && readyToRender && (
            <CanvasWidget engine={engineRef.current} className="css-12q0bj3" />
          )}
      </ErrorBoundary>
    </div>
  );
};

export default MinimalDiagram;