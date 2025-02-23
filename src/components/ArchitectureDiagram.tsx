import React, { useState, useRef, useCallback, useEffect } from "react";
import createEngine, {
    DiagramEngine,
    DiagramModel,
    DefaultNodeModel,
    DefaultLinkModel,
    CanvasWidget,
    InputType,
    Action,
    ActionEvent,
    DefaultNodeFactory,
    DefaultLinkFactory,
    NodeLayerFactory,
    LinkLayerFactory,
    NodeLayerModel
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
    HStack
} from "@chakra-ui/react";
import Palette, { paletteItems } from "./Palette";
import { CustomNodeModel, CustomNodeOptions } from "../types/node";

import { CustomNodeFactory } from "../factories/CustomNodeFactory";


const ArchitectureDiagram: React.FC = () => {
    const engineRef = useRef<DiagramEngine>();

    
  const initializeEngine = () => {
    if (!engineRef.current) {
        const newEngine = createEngine({
            registerDefaultZoomCanvasAction: true,
            registerDefaultDeleteItemsAction: true,
            registerDefaultPanAndZoomCanvasAction: false
        });
        // Register the default factories (optional)
        newEngine.getLinkFactories().registerFactory(new DefaultLinkFactory());

        // Determine unique node types from your palette
        const uniqueTypes = Array.from(new Set(paletteItems.map(item => item.type)));

        // Register a custom factory for each unique node type
        uniqueTypes.forEach((type) => {
          newEngine.getNodeFactories().registerFactory(new CustomNodeFactory(type));
      });

        // Create a new DiagramModel with layers
        const model = new DiagramModel();
        const nodeLayer = new NodeLayerModel();  // Fix: Use 'new' keyword
        const linkLayer = new LinkLayerFactory().generateModel({});
        model.addAll(nodeLayer, linkLayer);

        newEngine.setModel(model);
        engineRef.current = newEngine;
    }
  };

    const [selectedNode, setSelectedNode] = useState<CustomNodeModel | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        initializeEngine();

        const selectionAction = new Action({
            type: InputType.MOUSE_DOWN,
            fire: (event: ActionEvent) => {
                if (event.model instanceof CustomNodeModel) {
                    setSelectedNode(event.model);
                    onOpen();
                }
            }
        });

        if (engineRef.current) {
            const eventBus = engineRef.current.getActionEventBus();
            eventBus.registerAction(selectionAction);
        }

        return () => {
            if (engineRef.current) {
                const eventBus = engineRef.current.getActionEventBus();
                eventBus.deregisterAction(selectionAction);
            }
        };
    }, [onOpen]);

    const handleAddNode = useCallback(
        (node: DefaultNodeModel) => {
            if (!engineRef.current) return;

            const customNodeOptions = {
                ...node.getOptions(),
                type: "",
                details: "",
                annotation: ""
            } as CustomNodeOptions;
            const customNode = new CustomNodeModel(customNodeOptions);

            const model = engineRef.current.getModel() as DiagramModel;
            // Find the NodeLayer in the model
            const nodeLayer = model.getLayers().find(layer => layer instanceof NodeLayerModel);
            if (nodeLayer) {
                nodeLayer.addModel(customNode);
            }
            engineRef.current.repaintCanvas();
        },
        [1]
    );

    const saveAnnotation = useCallback(() => {
        if (!selectedNode || !engineRef.current) return;

        const annotation = document.getElementById("annotation-textarea") as HTMLTextAreaElement;
        if (annotation) {
            (selectedNode.getOptions() as CustomNodeOptions).annotation = annotation.value;
            engineRef.current.repaintCanvas();
        }
        onClose();
    }, [selectedNode, onClose, 0]);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
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
          type: data.type, // This should match the registered factory type.
          details: data.details,
          annotation: "",
          x: relativePoint.x,
          y: relativePoint.y,
        });
    
        const model = engineRef.current.getModel() as DiagramModel;
        // Instead of trying to get a specific node layer, add the node directly:
        model.addNode(newNode);
        engineRef.current.repaintCanvas();
      } catch (error) {
        console.error("Error parsing drop data:", error);
      }
    };
    

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
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
            >
                {engineRef.current && <CanvasWidget engine={engineRef.current} />}
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
                            defaultValue={selectedNode ? (selectedNode.getOptions() as CustomNodeOptions).annotation : ""}
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
