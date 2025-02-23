import React, { useEffect, useRef } from "react";
import createEngine, {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  CanvasWidget,
} from "@projectstorm/react-diagrams";

const MinimalDiagram: React.FC = () => {
  const engineRef = useRef<DiagramEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (engineRef.current) return; // Prevent re-initialization

    const engine = createEngine();
    const model = new DiagramModel();

    const node = new DefaultNodeModel({
      name: "Hello World",
      color: "rgb(192,255,0)",
    });
    node.setPosition(100, 100);
    node.addOutPort("Out");

    model.addNode(node);

    engine.setModel(model);
    engine.repaintCanvas();

    engineRef.current = engine;

    console.log("Model nodes after setup:", model.getNodes());
    console.log("Node position:", node.getX(), node.getY());
  }, []);

  useEffect(() => {
    const checkCanvas = () => {
      if (engineRef.current && containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        if (canvas) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          canvas.width = width;
          canvas.height = height;
          engineRef.current.repaintCanvas();
          console.log("Canvas found, resized to:", canvas.width, canvas.height);
        } else {
          console.log("Canvas still not found");
        }
      }
    };

    // Initial check with delay to allow mounting
    const timeout = setTimeout(checkCanvas, 100);
    window.addEventListener("resize", checkCanvas);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkCanvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        position: "relative",
        overflow: "visible",
        background: "#f0f0f0",
      }}
    >
      {engineRef.current && <CanvasWidget engine={engineRef.current} />}
    </div>
  );
};

export default MinimalDiagram;