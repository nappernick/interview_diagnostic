// src/App.tsx
import React, { useEffect, useMemo, useRef } from "react";
import createEngine, {
  DiagramModel,
  NodeModel,
  CanvasWidget,
  DefaultNodeFactory,
  DefaultLinkFactory,
  NodeWidget,
  PortWidget,
  PortModel,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";
import "./styles.css";

// Custom Node Model
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
    console.log("CustomNodeModel created:", this.name);
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
    console.log("Added port:", label);
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

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error in diagram:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          Something went wrong with the diagram: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom Node Factory
class CustomNodeFactory extends DefaultNodeFactory {
  constructor() {
    super();
    this.type = "custom-node";
    console.log("CustomNodeFactory initialized");
  }

  generateReactWidget(event: { model: CustomNodeModel }): JSX.Element {
    console.log("Generating custom node widget for:", event.model.getName());
    return <CustomNodeWidget node={event.model} diagramEngine={this.engine} />;
  }
}

// Custom Node Widget
class CustomNodeWidget extends NodeWidget {
  state = { isHovered: false };
  maxRetries = 3;
  retryCount = 0;
  nodeRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  handleMouseEnter = () => this.setState({ isHovered: true });
  handleMouseLeave = () => this.setState({ isHovered: false });

  componentDidMount() {
    const tryMount = () => {
      if (this.nodeRef.current) {
        // @ts-ignore
        this.ref = this.nodeRef.current;
        // Skip super.componentDidMount() to avoid getBoundingClientRect error
        this.retryCount = 0;
        console.log("Custom node mounted:", (this.props.node as CustomNodeModel).getName());
      } else if (this.retryCount < this.maxRetries) {
        console.warn(
          `NodeWidget ref is null, retrying (${this.retryCount + 1}/${this.maxRetries})`
        );
        this.retryCount += 1;
        setTimeout(tryMount, 100);
      } else {
        console.error("Max retries reached; DOM element not available.");
      }
    };
    tryMount();
  }

  render() {
    const { node, diagramEngine: engine } = this.props;
    const typedNode = node as CustomNodeModel;
    const backgroundColor = this.state.isHovered ? "yellow" : typedNode.getColor();
    console.log("Rendering CustomNodeWidget for:", typedNode.getName());
    return (
      <div
        ref={this.nodeRef}
        className={`default-node ${typedNode.isSelected() ? "selected" : ""}`}
        style={{
          position: "relative",
          width: 100,
          height: 40,
          background: backgroundColor,
          border: "1px solid black",
        }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className="title">
          <div className="name">{typedNode.getName()}</div>
        </div>
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

// Main App Component
const App = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { engine, model } = useMemo(() => {
    console.log("Initializing engine and model");
    const engine = createEngine();
    const model = new DiagramModel();

    // Configure engine
    engine.getNodeFactories().deregisterFactory("default");
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    // Skip deregistering PathFindingLinkFactory to avoid crash
    console.log("Factories registered:", engine.getNodeFactories());

    const node = new CustomNodeModel({
      name: "Hello World",
      color: "rgb(192,255,0)",
    });
    node.setPosition(50, 50);
    node.addOutPort("Out");

    model.addNode(node);
    engine.setModel(model);

    console.log("Model set with node:", node.getName());
    return { engine, model };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        console.log("Repainting canvas");
        engine.repaintCanvas();
        console.log(
          "Container dimensions:",
          containerRef.current?.offsetWidth,
          containerRef.current?.offsetHeight
        );
        console.log("Registered Node Factories:", engine.getNodeFactories());
        console.log("Model layers:", model.getLayers());
        console.log("Nodes in model:", model.getNodes());
      }, 500);
    }
  }, [engine]);

  return (
    <div
      className="diagram-container"
      ref={containerRef}
      style={{ width: "100%", height: "600px" }}
    >
      <ErrorBoundary>
        <CanvasWidget
          engine={engine}
          // @ts-ignore: Suppress style prop error
          style={{ width: "100%", height: "100%" }}
        />
      </ErrorBoundary>
    </div>
  );
};

export default App;