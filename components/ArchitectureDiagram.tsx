import React, { useState, useRef, useCallback, useEffect } from "react";
import createEngine, {
  DiagramEngine,
  DiagramModel,
  DefaultLinkFactory,
  CanvasWidget,
  NodeModel,
  InputType,
  DefaultNodeModel,
  Action,
  ActionEvent,
} from "@projectstorm/react-diagrams";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import Palette, { paletteItems } from "./Palette";
import { CustomNodeModel, CustomNodeOptions } from "../types/node";
import { CustomNodeFactory } from "../factories/CustomNodeFactory";

import { NodeLayerModel, LinkLayerFactory } from "@projectstorm/react-diagrams";

const ArchitectureDiagram: React.FC = () => {
  const engineRef = useRef<DiagramEngine>();
  const [selectedNode, setSelectedNode] = useState<CustomNodeModel | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initializeEngine = () => {
    if (!engineRef.current) {
      const newEngine = createEngine({
        registerDefaultZoomCanvasAction: true,
        registerDefaultDeleteItemsAction: true,
        registerDefaultPanAndZoomCanvasAction: false,
      });

      newEngine.getLinkFactories().registerFactory(new DefaultLinkFactory());

      const uniqueTypes = Array.from(new Set(paletteItems.map((item) => item.type)));
      uniqueTypes.forEach((type) => {
        newEngine.getNodeFactories().registerFactory(new CustomNodeFactory(type));
      });

      const model = new DiagramModel();
      const nodeLayer = new NodeLayerModel();
      const linkLayer = new LinkLayerFactory().generateModel({});
      model.addAll(nodeLayer, linkLayer);

      newEngine.setModel(model);
      engineRef.current = newEngine;
    }
  };

  useEffect(() => {
    initializeEngine();

    console.log("[MinimalDiagram] First useEffect - START");
    const selectionAction = new Action({
      type: InputType.MOUSE_DOWN,
      fire: (event: ActionEvent) => {
        if (event.model instanceof CustomNodeModel) {
          setSelectedNode(event.model);
          onOpen();
        }
      },
    });

    if (engineRef.current) {
      console.log("Registering action:", selectionAction);
      engineRef.current.getActionEventBus().registerAction(selectionAction);
    }

    return () => {
      if (engineRef.current) {
        console.log("Deregistering action:", selectionAction);
        engineRef.current.getActionEventBus().deregisterAction(selectionAction);
      }
    };
  }, [onOpen]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    console.log("Handling drop...");
    event.preventDefault();
    if (!engineRef.current) return;

    try {
      const rawData = event.dataTransfer.getData("storm-diagram-node");
      if (!rawData) {
        console.error("No drop data found");
        return;
      }
      const data = JSON.parse(rawData);

      const relativePoint = engineRef.current.getRelativeMousePoint(event);

      const newNode = new CustomNodeModel({
        name: data.label,
        color: data.color,
        type: data.type,
        details: data.details,
        annotation: "",
      });
      newNode.setPosition(relativePoint.x, relativePoint.y);

      const model = engineRef.current.getModel() as DiagramModel;
      model.addNode(newNode);

      engineRef.current.repaintCanvas();
    } catch (error) {
      console.error("Error parsing drop data:", error);
    }
  };

  const handleAddNode = useCallback(
    (node: DefaultNodeModel) => {
      console.log("Handling add node...");
      if (!engineRef.current) return;

      const customNodeOptions = {
        ...node.getOptions(),
        type: "",
        details: "",
        annotation: "",
      } as CustomNodeOptions;
      const customNode = new CustomNodeModel(customNodeOptions);

      const model = engineRef.current.getModel() as DiagramModel;
      const nodeLayer = model.getLayers().find((layer) => layer instanceof NodeLayerModel);
      if (nodeLayer) {
        nodeLayer.addModel(customNode);
      }
      engineRef.current.repaintCanvas();
    },
    [1]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const saveAnnotation = () => {
    if (!selectedNode || !engineRef.current) return;

    const annotationTextarea = document.getElementById("annotation-textarea") as HTMLTextAreaElement;
    if (annotationTextarea) {
      (selectedNode.getOptions() as CustomNodeOptions).annotation = annotationTextarea.value;
      engineRef.current.repaintCanvas();
    }
    onClose();
  };

  return (
    <HStack spacing={4} align="stretch" height="80vh">
      <Box width="250px" p={4} bg="gray.100" overflowY="auto">
        <Palette onAddNode={handleAddNode} />
      </Box>
      <Box
        flex="1"
        border="1px solid #ddd"
        borderRadius="md"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        position="relative"
        width="100%" // Ensure Box fills available width
        height="100%" // Ensure Box fills available height
      >
        {engineRef.current && <CanvasWidget engine={engineRef.current} className="css-12q0bj3" />}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedNode ? (selectedNode.getOptions() as CustomNodeOptions).name : ""} Annotation
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              id="annotation-textarea"
              defaultValue={
                selectedNode ? (selectedNode.getOptions() as CustomNodeOptions).annotation : ""
              }
              placeholder="Enter annotation..."
              minH="100px"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={saveAnnotation} mr={3}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
};

export default ArchitectureDiagram;