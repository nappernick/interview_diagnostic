# src Code Files

## /src/App.tsx

```
import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Container,
  Heading,
  ButtonGroup,
  Button,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  extendTheme,
  Spinner,
  VStack,
  Text
} from '@chakra-ui/react';
import CodeChallenge from "./components/CodeChallenge";
import SystemDesign from "./components/SystemDesign";
import DiagnosticReportComponent from "./components/DiagnosticReport";
import WizardApp from "./components/WizardApp";
import GuidedPrompts from './components/GuidedPrompts';
import RevisionSummary from './components/RevisionSummary';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import MinimalDiagram from './components/MinimalDiagram';
import { fetchCodingChallengesByLevel, CodingProblem, fetchCodingChallenge } from './api';

const theme = extendTheme({
  colors: {
    brand: {
      500: '#FF1A1A',
      600: '#E60000',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'red',
      },
    },
  },
});

type Module = "coding" | "design" | "report" | "wizard" | "guided-prompts" | "revision-summary" | "architecture-diagram" | "revision";


const App: React.FC = () => {
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [defaultProblem, setDefaultProblem] = useState<CodingProblem | null>(null);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [currentModule, setCurrentModule] = useState<Module>("coding");
  const [guidedPromptResponses, setGuidedPromptResponses] = useState<{ [id: number]: string }>( {});
  const [revisionEntries, setRevisionEntries] = useState<
    { id: number; question: string; answer: string }[]
  >([]);

  useEffect(() => {
    const getDefaultProblem = async () => {
      try {
        const problem = await fetchCodingChallenge();
        setDefaultProblem(problem);
      } catch (error) {
        console.error("Failed to fetch default coding challenge:", error);
      } finally {
        setLoadingDefault(false);
      }
    };
    getDefaultProblem();
  }, []);

  const handleCodingLevelSelect = async (level: 'entry' | 'intermediate' | 'advanced') => {
    try {
      const problems = await fetchCodingChallengesByLevel(level);
      setCodingProblems(problems);
    } catch (error) {
      console.error("Failed to fetch coding challenges:", error);
    }
  };

  const handleGuidedPromptsComplete = (responses: { [id: number]: string }) => {
    const newEntries = Object.entries(responses).map(([id, answer]) => ({
      id: parseInt(id, 10),
      question: `Question ${id}`,
      answer,
    }));
    setRevisionEntries(newEntries);
    setGuidedPromptResponses(responses);
    setCurrentModule("revision-summary");
  };

  const handleRevisionSave = (id: number, updatedAnswer: string) => {
    setRevisionEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, answer: updatedAnswer } : entry
      )
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.lg" py={8}>
        <Box bg="white" borderRadius="lg" boxShadow="lg" p={6}>
          <Heading
            mb={6}
            size="xl"
            bgGradient="linear(to-r, brand.500, brand.600)"
            bgClip="text"
          >
            Interview Diagnostic Test
          </Heading>

          <Tabs isFitted variant="enclosed" colorScheme="brand">
            <TabList mb="1em">
              <Tab onClick={() => setCurrentModule("coding")}>
                Coding Challenge
              </Tab>
              <Tab onClick={() => setCurrentModule("design")}>
                System Design
              </Tab>
              <Tab onClick={() => setCurrentModule("report")}>
                Diagnostic Report
              </Tab>
              <Tab onClick={() => setCurrentModule("wizard")}>
                Design Wizard
              </Tab>
              <Tab onClick={() => setCurrentModule("guided-prompts")}>
                Guided Prompts
              </Tab>
              <Tab onClick={() => setCurrentModule("revision")}> Revision </Tab>
              <Tab onClick={() => setCurrentModule("architecture-diagram")}> Diagram </Tab>

            </TabList>

            <TabPanels>
              {/* Coding Challenge TabPanel - Remains the same */}
              <TabPanel>
                {/* ... (your existing code for coding challenges) */}
                {loadingDefault ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="xl" color="brand.500" />
                  </Box>
                ) : (
                  defaultProblem && <CodeChallenge problem={defaultProblem} />
                )}
                <ButtonGroup spacing={4} mt={4} justifyContent="center">
                  <Button onClick={() => handleCodingLevelSelect("entry")}>
                    Entry Level
                  </Button>
                  <Button
                    onClick={() => handleCodingLevelSelect("intermediate")}
                  >
                    Intermediate
                  </Button>
                  <Button onClick={() => handleCodingLevelSelect("advanced")}>
                    Advanced
                  </Button>
                </ButtonGroup>
                {codingProblems.length > 0 && (
                  <Box mt={4}>
                    {codingProblems.map((problem) => (
                      <CodeChallenge key={problem.id} problem={problem} />
                    ))}
                  </Box>
                )}
              </TabPanel>

              {/* System Design TabPanel - Remains the same */}
              <TabPanel>
                <SystemDesign />
              </TabPanel>

              {/* Diagnostic Report TabPanel - Remains the same */}
              <TabPanel>
                <DiagnosticReportComponent />
              </TabPanel>

              {/* Design Wizard TabPanel - Remains the same */}
              <TabPanel>
                <WizardApp />
              </TabPanel>

              {/* Guided Prompts TabPanel - Now Dedicated */}
              <TabPanel>
                <GuidedPrompts onComplete={handleGuidedPromptsComplete} />
              </TabPanel>

              {/* Revision TabPanel - Now Dedicated */}
              <TabPanel>
                <RevisionSummary
                  entries={revisionEntries}
                  onSave={handleRevisionSave}
                />
              </TabPanel>

              {/* Architecture Diagram TabPanel - Now Dedicated */}
              <TabPanel>
                <ArchitectureDiagram />
                {/* <MinimalDiagram /> */}
                
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </ChakraProvider>
  );
};

export default App;```


## /src/api.ts

```typescript
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  topics: string[];
  company_context?: string;
  problem_statement: string;
  input_format: string;
  output_format: string;
  test_cases?: Array<{
    input: string;
    expected: any;
    description: string;
  }>;
  follow_up?: string[];
}


export interface PhasePrompt {
  prompt_id: string
  type: "radio" | "multi_select" | "short_text" | "code_completion" | "diagram" | "scenario_based"
  question_text?: string
  prompt?: string                 // For diagram or scenario-based prompt
  starter_code?: string           // For code_completion type
  expected_solution?: string      // For code_completion type
  options?: {
    value: string
    label: string
  }[]
  correct_answers?: string[]      // For multi_select or scenario, optional
  // For radio questions, we might just store correct_answers = [someValue].
  userAnswer?: any                // The user's response (we'll fill at runtime)
}

export interface DesignPhase {
  name: string
  description?: string
  prompts: PhasePrompt[]
}

export interface DesignQuestion {
  id: string
  title: string
  context: string
  difficulty: "intermediate" | "advanced"
  // The advanced phased approach:
  phases?: DesignPhase[]

  // The old approach: functional & non-functional + optional multiple-choice
  requirements: {
    functional: string[]
    non_functional: string[]
  }
  options?: string[]   
}

export interface DiagnosticReport {
  coding: {
    passed: number;
    total: number;
    percentage: number;
  };
  design: {
    score: number;
    total: number;
    percentage: number;
  };
  overall_recommendation: string;
}

export const fetchCodingChallenge = async (topic?: string): Promise<CodingProblem> => {
  const params = topic ? { topic } : {};
  const response = await axios.get(`${API_BASE}/coding_challenge`, { params }); // <-- Using axios.get
  return response.data;
};

export const fetchCodingChallengesByLevel = async (level: string): Promise<CodingProblem[]> => {
  const response = await axios.get(`${API_BASE}/coding_challenges?level=${level}`); // <-- Correct URL
  return response.data;
};

export const submitCodingSolution = async (
  problem_id: string,
  code: string
): Promise<any> => {
  const response = await axios.post(`${API_BASE}/submit_code`, { problem_id, code });
  return response.data;
};

export const fetchDesignQuestions = async (): Promise<DesignQuestion[]> => {
  const response = await axios.get(`${API_BASE}/design_questions`);
  return response.data;
};

export const fetchDiagnosticReport = async (): Promise<DiagnosticReport> => {
  const response = await axios.get(`${API_BASE}/diagnostic_report`);
  return response.data;
};

const mockDesignQuestions: DesignQuestion[] = [
  {
    id: "sd_100",
    title: "Design a Live Chat Service",
    difficulty: "advanced",
    context: "Real-time chat for Yelp users to message businesses or other users.",
    // We'll skip old-style "options" for this question, but still fill requirements:
    requirements: {
      functional: [
        "Real-time messaging between users",
        "Notify user when a new message arrives",
        "Allow chat history retrieval"
      ],
      non_functional: [
        "Handle 10k concurrent active chats",
        "End-to-end latency < 100ms per message",
        "99.99% availability"
      ]
    },
    phases: [
      {
        name: "Requirements",
        description: "List out the functional and non-functional needs, confirm scope",
        prompts: [
          {
            prompt_id: "req_phase_q1",
            type: "short_text",
            question_text: "Identify key scale constraints for the chat service."
          },
          {
            prompt_id: "req_phase_q2",
            type: "multi_select",
            question_text: "Which non-functional requirements are most critical?",
            options: [
              { value: "low_latency", label: "Low latency" },
              { value: "eventual_consistency", label: "Eventual consistency (1 minute)" },
              { value: "high_availability", label: "High availability" },
              { value: "support_moderation", label: "Built-in chat moderation" }
            ],
            correct_answers: ["low_latency", "high_availability"]
          }
        ]
      },
      {
        name: "Architecture",
        description: "Propose a high-level design, including data flow, servers, etc.",
        prompts: [
          {
            prompt_id: "arch_q1",
            type: "radio",
            question_text: "Pick the best approach for real-time updates:",
            options: [
              { value: "polling", label: "Clients poll every 2s for new messages" },
              { value: "websockets", label: "Use WebSockets for push-based updates" },
              { value: "long_poll", label: "Use HTTP long-polling" }
            ],
            correct_answers: ["websockets"]
          },
          {
            prompt_id: "arch_q2",
            type: "diagram",
            prompt: "Sketch or upload your architecture diagram (clients, chat service, DB)."
            // In practice, you'd store a link or JSON for the user-drawn diagram.
          }
        ]
      },
      {
        name: "Implementation Detail",
        description: "Delve into data structures or code for storing & retrieving chat messages",
        prompts: [
          {
            prompt_id: "impl_q1",
            type: "code_completion",
            question_text: "Complete the function that inserts a message into the chat storage.",
            starter_code: 
`function storeMessage(chatId, sender, message) {
  // TODO: implement
}`,
            expected_solution: 
`function storeMessage(chatId, sender, message) {
  // Implementation might involve:
  // 1) Insert into a messages table or NoSQL
  // 2) Update last-updated timestamp
  // 3) Possibly push an event to a queue
}`
          }
        ]
      },
      {
        name: "Scalability",
        description: "How to scale for 10x traffic and remain <100ms latency?",
        prompts: [
          {
            prompt_id: "scale_scenario",
            type: "scenario_based",
            prompt: "Traffic spikes 10x. Outline your approach to maintain real-time performance.",
            // We might store correct_answers or not, since this is open-ended
          }
        ]
      }
    ]
  },
  // Example of old-style question with 'options':
  {
    id: "sd_2",
    title: "Design Yelp's Photo Storage Service",
    difficulty: "intermediate",
    context: "Backend service to handle photo uploads and serving.",
    requirements: {
      functional: ["Upload photos", "Generate thumbnails", "Bulk uploads", "Photo deletion"],
      non_functional: ["Handle 500 uploads/sec", "<200ms latency", "99.99% availability", "Max 20MB photos"]
    },
    options: [
      "Centralized monolith with direct file storage",
      "AWS S3 + CloudFront + background image processing",
      "Use a relational DB for storing binary data"
    ]
  }
]


// The shape of a user’s response for each prompt
export interface UserAnswer {
  question_id: string
  phase_name?: string
  prompt_id?: string
  answer_value?: string | string[]  // could store single or multiple
}

// We'll store all user answers, then submit them
export async function submitDesignAnswers(answers: UserAnswer[]) {
  // In a real app, you'd POST to an API for scoring
  // We'll just return the data as "result"
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Answers submitted successfully!",
        totalAnswers: answers.length,
        answers
      })
    }, 500)
  })
}```


## /src/components/ArchitectureDiagram.tsx

```
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

export default ArchitectureDiagram;```


## /src/components/CodeChallenge.tsx

```
import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  List,
  ListItem,
  Code,
  Spinner,
  useToast,
  Icon, // Import Icon from Chakra UI
} from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";
import {
  fetchCodingChallenge,
  submitCodingSolution,
  CodingProblem,
} from "../api";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

const CodeChallenge: React.FC<{ problem: CodingProblem }> = ({ problem }) => {
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    // Set a basic template when the problem changes
    if (problem) {
        setCode("def solution(data):\n    # Write your solution here\n    pass");
    }
  }, [problem]);

  const handleSubmit = async () => {
    if (problem) {
      setLoading(true);
      try {
        const res = await submitCodingSolution(problem.id, code);
        setResult(res);
        toast({
          title: "Solution submitted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error submitting solution",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setLoading(false);
    }
  };

  if (!problem)
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.500" />
      </Box>
    );

  return (
    <VStack spacing={6} align="stretch">
      <Card variant="filled">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="lg" color="brand.600">
              {problem.title}
            </Heading>

            <Text fontSize="md">{problem.problem_statement}</Text>

            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontWeight="bold">Input Format:</Text>
              <Code p={2} display="block">
                {problem.input_format}
              </Code>

              <Text fontWeight="bold" mt={2}>Output Format:</Text>
              <Code p={2} display="block">
                {problem.output_format}
              </Code>
            </Box>

            {problem.follow_up && (
              <Box>
                <Heading size="sm" mb={2}>
                  Follow-up Questions:
                </Heading>
                <List spacing={2}>
                  {problem.follow_up.map((q, index) => (
                    <ListItem key={index}>
                      {/* @ts-ignore */}
                      <Icon as={MdArrowForward} color="brand.500" mr={2} /> {/* CORRECT USE OF ICON */}
                      <Text>{q}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Box
            borderRadius="md"
            overflow="hidden"
            border="1px"
            borderColor="gray.200"
          >
            <AceEditor
              mode="python"
              theme="github"
              onChange={setCode}
              name="codeEditor"
              fontSize={14}
              width="100%"
              height="400px"
              value={code}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showLineNumbers: true,
                tabSize: 4,
              }}
            />
          </Box>

          <Button
            mt={4}
            colorScheme="brand"
            size="lg"
            isLoading={loading}
            loadingText="Running..."
            onClick={handleSubmit}
          >
            Submit Code
          </Button>

          {result && (
            <Box mt={4} p={4} bg="gray.50" borderRadius="md">
              <Heading size="sm" mb={2}>
                Results:
              </Heading>
              <Code p={4} display="block" whiteSpace="pre-wrap">
                {JSON.stringify(result, null, 2)}
              </Code>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default CodeChallenge;
```


## /src/components/CustomNodeFactory.tsx

```
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
}```


## /src/components/CustomNodeModel.tsx

```
import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';

export class CustomNodeModel extends NodeModel {
  constructor(options: { subtype: string; label: string; color: string }) {
    super({ type: 'custom-node', ...options });
    this.subtype = options.subtype;
    this.label = options.label;
    this.color = options.color;

    // Add input and output ports
    this.addPort(new DefaultPortModel({ in: true, name: 'in' }));
    this.addPort(new DefaultPortModel({ in: false, name: 'out' }));
  }

  // Properties
  subtype: string;
  label: string;
  color: string;
}```


## /src/components/CustomNodeWidget.tsx

```
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
};```


## /src/components/DiagnosticReport.tsx

```
import React, { useEffect, useState } from "react";
import { fetchDiagnosticReport, DiagnosticReport } from "../api";

const DiagnosticReportComponent: React.FC = () => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchDiagnosticReport()
      .then((data) => setReport(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading diagnostic report...</div>;
  if (!report) return <div>No report available.</div>;

  return (
    <div style={{ margin: "20px" }}>
      <h2>Diagnostic Report</h2>
      <div>
        <h3>Coding Challenges</h3>
        <p>
          Passed: {report.coding.passed} / {report.coding.total} (
          {report.coding.percentage.toFixed(2)}%)
        </p>
      </div>
      <div>
        <h3>System Design</h3>
        <p>
          Score: {report.design.score} / {report.design.total} (
          {report.design.percentage.toFixed(2)}%)
        </p>
      </div>
      <div>
        <h3>Overall Recommendation</h3>
        <p>{report.overall_recommendation}</p>
      </div>
    </div>
  );
};

export default DiagnosticReportComponent;
```


## /src/components/ErrorBoundary.tsx

```
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Diagram Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "1em", color: "red", background: "#ffe0e0" }}>
          Diagram Error: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}```


## /src/components/GuidedPrompts.tsx

```
// src/components/GuidedPrompts.tsx
import React, { useState, useCallback } from "react";
import {
  VStack,
  Text,
  Textarea,
  Button,
  HStack,
  Progress,
  Box,
  Heading,
  useToast,
  IconButton,
  Tooltip,
  useDisclosure
} from "@chakra-ui/react";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon, 
  InfoIcon 
} from '@chakra-ui/icons';
import ModelAnswerOverlay from './ModelAnswerOverlay';

// Define the structure for a prompt
interface Prompt {
  id: number;
  question: string;
  hint?: string;
  required?: boolean;
  minLength?: number;
  modelAnswer?: {
    answer: string;
    explanation: string;
    keyPoints: string[];
    commonMistakes?: string[];
    additionalResources?: {
      title: string;
      url: string;
    }[];
  };
}
// Expanded prompts with more detailed questions and hints
const prompts: Prompt[] = [
  {
    id: 1,
    question: "What are the key functional requirements?",
    hint: "Consider user actions, system behaviors, and core features",
    required: true,
    minLength: 50
  },
  {
    id: 2,
    question: "List non-functional requirements (e.g., performance, scalability).",
    hint: "Think about performance metrics, scalability targets, and reliability goals",
    required: true,
    minLength: 30
  },
  {
    id: 3,
    question: "What assumptions are you making?",
    hint: "Consider user base size, traffic patterns, data volume, and technical constraints",
    required: true
  },
  {
    id: 4,
    question: "What are the system boundaries and interfaces?",
    hint: "Define what's in scope vs out of scope, and external system interactions",
    required: true
  },
  {
    id: 5,
    question: "Are there any specific compliance or security requirements?",
    hint: "Consider data privacy, regulatory requirements, and security standards",
    required: false
  }
];

interface GuidedPromptsProps {
  onComplete?: (responses: { [id: number]: string }) => void;
}

const GuidedPrompts: React.FC<GuidedPromptsProps> = ({ onComplete }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<{ [id: number]: string }>({});
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentPrompt = prompts[currentPromptIndex];
  const progress = ((currentPromptIndex + 1) / prompts.length) * 100;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponses(prev => ({ ...prev, [currentPrompt.id]: e.target.value }));
  }, [currentPrompt.id]);

  const validateCurrentResponse = useCallback(() => {
    if (!currentPrompt.required) return true;
    
    const response = responses[currentPrompt.id] || '';
    if (!response.trim()) {
      toast({
        title: "Required Field",
        description: "Please provide an answer before continuing",
        status: "warning",
        duration: 3000,
      });
      return false;
    }

    if (currentPrompt.minLength && response.length < currentPrompt.minLength) {
      toast({
        title: "Response Too Short",
        description: `Please provide at least ${currentPrompt.minLength} characters`,
        status: "warning",
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [currentPrompt, responses, toast]);

  const handleNext = useCallback(() => {
    if (!validateCurrentResponse()) return;
    
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else if (onComplete) {
      onComplete(responses);
      toast({
        title: "All Questions Completed!",
        status: "success",
        duration: 3000,
      });
    }
  }, [currentPromptIndex, onComplete, responses, validateCurrentResponse, toast]);

  const handleBack = useCallback(() => {
    setCurrentPromptIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const isLastQuestion = currentPromptIndex === prompts.length - 1;

  return (
    <VStack spacing={6} align="stretch" width="100%" maxW="800px" mx="auto" p={4}>
      <Box>
        <Heading size="md" mb={2}>System Design Requirements</Heading>
        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
        <Text fontSize="sm" mt={2} color="gray.600">
          Question {currentPromptIndex + 1} of {prompts.length}
        </Text>
      </Box>

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          {currentPrompt.question}
        </Text>
        {currentPrompt.hint && (
          <Text fontSize="sm" color="gray.600" mb={4}>
            💡 {currentPrompt.hint}
          </Text>
        )}
        <Textarea
          value={responses[currentPrompt.id] || ""}
          onChange={handleChange}
          placeholder="Type your answer here..."
          minH="150px"
          size="lg"
        />
        {currentPrompt.minLength && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Minimum length: {currentPrompt.minLength} characters
            (Current: {(responses[currentPrompt.id] || '').length})
          </Text>
        )}
      </Box>

      <HStack justify="space-between">
        <HStack>
          <Tooltip label="Previous question">
            <IconButton
              aria-label="Previous question"
              icon={<ChevronLeftIcon />}
              onClick={handleBack}
              isDisabled={currentPromptIndex === 0}
            />
          </Tooltip>

          <Tooltip label={isLastQuestion ? "Complete" : "Next question"}>
            <IconButton
              aria-label={isLastQuestion ? "Complete" : "Next question"}
              icon={isLastQuestion ? <CheckIcon /> : <ChevronRightIcon />}
              onClick={handleNext}
              colorScheme={isLastQuestion ? "green" : "blue"}
            />
          </Tooltip>
        </HStack>

        {currentPrompt.modelAnswer && (
          <Button
            leftIcon={<InfoIcon />}
            onClick={onOpen}
            variant="outline"
            size="sm"
          >
            Show Model Answer
          </Button>
        )}
      </HStack>

      {currentPrompt.modelAnswer && (
        <ModelAnswerOverlay
          isOpen={isOpen}
          onClose={onClose}
          modelAnswer={{
            id: currentPrompt.id,
            title: currentPrompt.question,
            ...currentPrompt.modelAnswer
          }}
          currentResponse={responses[currentPrompt.id]}
        />
      )}
    </VStack>
  );
};

export default GuidedPrompts;```


## /src/components/MinimalDiagram.tsx

```
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

export default MinimalDiagram;```


## /src/components/ModelAnswerOverlay.tsx

```
// src/components/ModelAnswerOverlay.tsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Heading,
  List,
  ListItem,
  ListIcon,
  Link,
  Divider,
  Box,
  Badge,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { ModelAnswer } from '../types/modelAnswers';

interface ModelAnswerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  modelAnswer: ModelAnswer;
  currentResponse?: string;
}

const ModelAnswerOverlay: React.FC<ModelAnswerOverlayProps> = ({
  isOpen,
  onClose,
  modelAnswer,
  currentResponse
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{modelAnswer.title}</Heading>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Model Answer & Explanation
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {currentResponse && (
              <Box bg="gray.50" p={4} borderRadius="md">
                <Heading size="sm" mb={2}>Your Current Response:</Heading>
                <Text color="gray.700">{currentResponse}</Text>
              </Box>
            )}

            <Box>
              <Heading size="sm" mb={2}>Model Answer:</Heading>
              <Text whiteSpace="pre-wrap">{modelAnswer.answer}</Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={2}>Explanation:</Heading>
              <Text>{modelAnswer.explanation}</Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>Key Points:</Heading>
              <List spacing={2}>
                {modelAnswer.keyPoints.map((point, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    <Text>{point}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            {modelAnswer.commonMistakes && (
              <Box>
                <Heading size="sm" mb={2}>Common Mistakes to Avoid:</Heading>
                <List spacing={2}>
                  {modelAnswer.commonMistakes.map((mistake, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon as={WarningIcon} color="orange.500" />
                      <Text>{mistake}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {modelAnswer.additionalResources && (
              <Box>
                <Heading size="sm" mb={2}>Additional Resources:</Heading>
                <List spacing={2}>
                  {modelAnswer.additionalResources.map((resource, index) => (
                    <ListItem key={index}>
                      <Link 
                        href={resource.url} 
                        isExternal 
                        color="blue.500"
                        display="flex"
                        alignItems="center"
                      >
                        {resource.title} <ExternalLinkIcon mx={2} />
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost">
            Save for Later
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModelAnswerOverlay;```


## /src/components/Palette.tsx

```
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, VStack, Heading, Divider, HStack } from "@chakra-ui/react"; // Added HStack for icon + label layout
import { CustomNodeModel } from "../types/node";
import { getIconForType } from "../utils/iconMapping"; // Import our new icon mapping

interface PaletteItem {
  type: string;
  label: string;
  details: string;
  color: string;
  category: string;
}

export const paletteItems: PaletteItem[] = [
  // --- Databases ---
  {
    category: "Databases",
    type: "RelationalDB",
    label: "Relational DB",
    details: "SQL-based (e.g., MySQL, PostgreSQL, Oracle)",
    color: "rgb(255, 99, 71)",
  },
  {
    category: "Databases",
    type: "NoSQL_Document",
    label: "NoSQL (Document)",
    details: "MongoDB, CouchDB",
    color: "rgb(255, 159, 64)",
  },
  {
    category: "Databases",
    type: "NoSQL_KeyValue",
    label: "NoSQL (Key-Value)",
    details: "Redis, Memcached",
    color: "rgb(255, 205, 86)",
  },
  {
    category: "Databases",
    type: "NoSQL_WideColumn",
    label: "NoSQL (Wide-Col)",
    details: "Cassandra, HBase",
    color: "rgb(75, 192, 192)",
  },
  {
    category: "Databases",
    type: "NoSQL_Graph",
    label: "NoSQL (Graph)",
    details: "Neo4j, Amazon Neptune",
    color: "rgb(54, 162, 235)",
  },
  {
    category: "Databases",
    type: "SearchEngine",
    label: "Search Engine",
    details: "Elasticsearch, Solr",
    color: "rgb(153, 102, 255)",
  },
  {
    category: "Databases",
    type: "TimeSeriesDB",
    label: "Time Series DB",
    details: "InfluxDB, Prometheus",
    color: "rgb(201, 203, 207)",
  },

  // --- Caching ---
  {
    category: "Caching",
    type: "Cache_InMemory",
    label: "In-Memory Cache",
    details: "Redis, Memcached (can also be a KV store)",
    color: "rgb(255, 205, 86)",
  },
  {
    category: "Caching",
    type: "Cache_CDN",
    label: "CDN",
    details: "Content Delivery Network (e.g., Cloudflare, Akamai)",
    color: "rgb(75, 192, 192)",
  },

  // --- Load Balancers ---
  {
    category: "Load Balancers",
    type: "LoadBalancer_Elastic",
    label: "Elastic LB(",
    details: "Dynamically scales (e.g., AWS ELB)",
    color: "rgb(255, 165, 0)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Traditional",
    label: "Traditional LB(",
    details: "Static load balancing (e.g., Nginx, HAProxy)",
    color: "rgb(138, 43, 226)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Application",
    label: "Application LB(",
    details: "Layer 7, routes based on content",
    color: "rgb(255, 99, 71)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Network",
    label: "Network LB(",
    details: "Layer 4, routes based on IP protocol data",
    color: "rgb(60, 179, 113)",
  },

  // --- Messaging ---
  {
    category: "Messaging",
    type: "MessageQueue",
    label: "Message Queue",
    details: "RabbitMQ, Kafka, SQS",
    color: "rgb(54, 162, 235)",
  },
  {
    category: "Messaging",
    type: "PubSub",
    label: "Pub/Sub System",
    details: "Redis Pub/Sub, Google Pub/Sub, Kafka",
    color: "rgb(153, 102, 255)",
  },

  // --- Servers ---
  {
    category: "Servers",
    type: "WebServer",
    label: "Web Server",
    details: "Apache, Nginx",
    color: "rgb(106, 90, 205)",
  },
  {
    category: "Servers",
    type: "AppServer",
    label: "Application Server",
    details: "Node.js, Tomcat, Gunicorn",
    color: "rgb(255, 140, 0)",
  },

  // --- Other ---
  {
    category: "Other",
    type: "APIGateway",
    label: "API Gateway",
    details: "Handles routing, authentication, rate limiting",
    color: "rgb(255, 0, 0)",
  },
  {
    category: "Other",
    type: "Firewall",
    label: "Firewall",
    details: "Security, network traffic control",
    color: "rgb(0, 128, 0)", // Green
  },
  {
    category: "Other",
    type: "User",
    label: "User",
    details: "Represents a client/user",
    color: "rgb(128, 0, 128)", // Purple
  },
  {
    category: "Other",
    type: "Microservice",
    label: "Microservice",
    details: "Independent, small service",
    color: "rgb(210, 105, 30)",
  },
  {
    category: "Other",
    type: "ExternalAPI",
    label: "External API",
    details: "Third-party service integration",
    color: "rgb(0, 0, 255)", // Blue
  },
  {
    category: "Other",
    type: "BlobStorage",
    label: "Blob Storage",
    details: "Object storage for unstructured data (S3, Azure Blob Storage)",
    color: "rgb(139, 69, 19)", // Brown
  },
];

interface PaletteProps {
  onAddNode: (node: CustomNodeModel) => void;
}
interface PaletteProps {
  onAddNode: (node: CustomNodeModel) => void;
}

const Palette: React.FC<PaletteProps> = ({ onAddNode }) => {
  const groupedItems: { [category: string]: PaletteItem[] } = {};
  paletteItems.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <VStack spacing={3} align="stretch">
      {Object.keys(groupedItems).map((category) => (
        <React.Fragment key={category}>
          <Heading size="md">{category}</Heading>
          <Divider />
          {groupedItems[category].map((item) => (
            <Button
              key={item.type}
              draggable
              onDragStart={(event) => {
                const data = {
                  type: item.type,
                  label: item.label,
                  color: item.color,
                  details: item.details,
                  id: uuidv4(),
                };
                event.dataTransfer.setData("storm-diagram-node", JSON.stringify(data));
              }}
              width="100%"
              colorScheme="gray"
              backgroundColor={item.color}
              color="white"
            >
              <HStack spacing={2}>
                {getIconForType(item.type)} {/* Default size (24px) */}
                <span>{item.label}</span>
              </HStack>
            </Button>
          ))}
        </React.Fragment>
      ))}
    </VStack>
  );
};

export default Palette;```


## /src/components/RequirementsSection.tsx

```
import React, { useState } from "react";
import {
  VStack,
  Box,
  Textarea,
  Text,
  List,
  ListItem,
  Checkbox,
  Tooltip,
  Button,
} from "@chakra-ui/react";

interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
}

const initialFunctionalChecklist: ChecklistItem[] = [
  {
    id: 1,
    text: "List core features (e.g., user registration, search, review submission)",
    checked: false,
  },
  {
    id: 2,
    text: "Detail key functionalities (e.g., filtering, sorting, notifications)",
    checked: false,
  },
];

const initialNonFunctionalChecklist: ChecklistItem[] = [
  {
    id: 1,
    text: "Specify performance targets (e.g., response time < 100ms)",
    checked: false,
  },
  {
    id: 2,
    text: "Mention scalability goals (e.g., support 10K concurrent users)",
    checked: false,
  },
  {
    id: 3,
    text: "Address security measures (e.g., encryption, authentication)",
    checked: false,
  },
];

const RequirementsSection: React.FC = () => {
  const [functionalText, setFunctionalText] = useState("");
  const [nonFunctionalText, setNonFunctionalText] = useState("");
  const [assumptionsText, setAssumptionsText] = useState("");
  const [functionalChecklist, setFunctionalChecklist] =
    useState<ChecklistItem[]>(initialFunctionalChecklist);
  const [nonFunctionalChecklist, setNonFunctionalChecklist] =
    useState<ChecklistItem[]>(initialNonFunctionalChecklist);
  const [showFunctionalReminder, setShowFunctionalReminder] = useState(false);
  const [showNonFunctionalReminder, setShowNonFunctionalReminder] =
    useState(false);

  const handleFunctionalBlur = () => {
    setShowFunctionalReminder(!functionalChecklist.every((item) => item.checked));
  };

  const handleNonFunctionalBlur = () => {
    setShowNonFunctionalReminder(
      !nonFunctionalChecklist.every((item) => item.checked)
    );
  };

    const handleSave = () => {
        //validate and save all data.
        handleFunctionalBlur();
        handleNonFunctionalBlur();

        // Check if reminders are showing, indicating incomplete checklists
        if (!functionalChecklist.every((item) => item.checked) || !nonFunctionalChecklist.every((item) => item.checked)) {
            console.warn("Cannot save: Incomplete checklists.");
            return;
        }

        // If checklists are complete, proceed with saving
        const requirementsData = {
          functional: {
            text: functionalText,
            checklist: functionalChecklist,
          },
          nonFunctional: {
            text: nonFunctionalText,
            checklist: nonFunctionalChecklist,
          },
          assumptions: assumptionsText,
        };

        console.log("Saving requirements:", requirementsData);
        // Here you would typically send this data to a backend API
        // using axios or fetch.  For example:
        // axios.post("/api/requirements", requirementsData)
        //   .then(response => { ... })
        //   .catch(error => { ... });
    }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Tooltip
          label="List all the key functions the system should perform."
          aria-label="Functional Requirements Tooltip"
        >
          <Text fontSize="lg" fontWeight="bold">
            Functional Requirements
          </Text>
        </Tooltip>
        <Textarea
          value={functionalText}
          onChange={(e) => setFunctionalText(e.target.value)}
          onBlur={handleFunctionalBlur} // Check on leaving the textarea
          placeholder="Enter functional requirements here..."
          mt={2}
        />
        <List spacing={2} mt={2}>
          {functionalChecklist.map((item) => (
            <ListItem key={item.id}>
              <Checkbox
                isChecked={item.checked}
                onChange={(e) => {
                  setFunctionalChecklist((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, checked: e.target.checked } : i
                    )
                  );
                }}
              >
                {item.text}
              </Checkbox>
            </ListItem>
          ))}
        </List>
        {showFunctionalReminder && (
          <Text color="red.500" mt={2}>
            Reminder: Please ensure all functional items are addressed.
          </Text>
        )}
      </Box>

      <Box>
        <Tooltip
          label="Outline the performance, scalability, and security requirements."
          aria-label="Non-Functional Requirements Tooltip"
        >
          <Text fontSize="lg" fontWeight="bold">
            Non-Functional Requirements
          </Text>
        </Tooltip>
        <Textarea
          value={nonFunctionalText}
          onChange={(e) => setNonFunctionalText(e.target.value)}
          onBlur={handleNonFunctionalBlur} // Check on leaving the textarea
          placeholder="Enter non-functional requirements here..."
          mt={2}
        />
        <List spacing={2} mt={2}>
          {nonFunctionalChecklist.map((item) => (
            <ListItem key={item.id}>
              <Checkbox
                isChecked={item.checked}
                onChange={(e) => {
                  setNonFunctionalChecklist((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, checked: e.target.checked } : i
                    )
                  );
                }}
              >
                {item.text}
              </Checkbox>
            </ListItem>
          ))}
        </List>
        {showNonFunctionalReminder && (
          <Text color="red.500" mt={2}>
            Reminder: Please ensure all non-functional items are addressed.
          </Text>
        )}
      </Box>

      <Box>
        <Tooltip
          label="Enter any assumptions you're making regarding the system."
          aria-label="Assumptions Tooltip"
        >
          <Text fontSize="lg" fontWeight="bold">
            Assumptions
          </Text>
        </Tooltip>
        <Textarea
          value={assumptionsText}
          onChange={(e) => setAssumptionsText(e.target.value)}
          placeholder="Enter assumptions here..."
          mt={2}
        />
      </Box>

      <Button onClick={handleSave} colorScheme="blue" mt={4}>
        Save Requirements
      </Button>
    </VStack>
  );
};

export default RequirementsSection;```


## /src/components/RevisionSummary.tsx

```
// src/components/RevisionSummary.tsx
import React, { useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  VStack,
  useToast,
  Tooltip,
  IconButton
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

interface RevisionEntry {
  id: number;
  question: string;
  answer: string;
}

interface RevisionSummaryProps {
  entries: RevisionEntry[];
  onSave: (id: number, updatedAnswer: string) => void;
  onSubmit?: () => void; // Optional callback for submission
}

const RevisionSummary: React.FC<RevisionSummaryProps> = ({ entries, onSave, onSubmit }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingEntry, setEditingEntry] = useState<RevisionEntry | null>(null);
  const [newAnswer, setNewAnswer] = useState("");
  const toast = useToast();

  const handleEdit = useCallback((entry: RevisionEntry) => {
    setEditingEntry(entry);
    setNewAnswer(entry.answer);
    onOpen();
  }, [onOpen]);

  const handleSave = useCallback(() => {
    if (editingEntry) {
      if (newAnswer.trim() === "") {
          toast({
              title: "Empty Answer",
              description: "Please provide an answer before saving.",
              status: "warning",
              duration: 3000,
          });
          return;
      }
        
      onSave(editingEntry.id, newAnswer);
      setEditingEntry(null); // Clear editing state
      setNewAnswer("");
      onClose();
      toast({
        title: "Answer Updated",
        description: "Your answer has been successfully updated.",
        status: "success",
        duration: 2000,
      });
    }
  }, [editingEntry, newAnswer, onSave, onClose, toast]);

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
    setNewAnswer("");
    onClose();
  }, [onClose]);

  return (
    <Box p={4} width="100%">
      <Heading mb={4}>Revision Summary</Heading>

      <Accordion allowMultiple mb={6}>
        {entries.map(entry => (
          <AccordionItem key={entry.id} isDisabled={editingEntry !== null}>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                {entry.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={2}>
                  <Text>
                    {entry.answer || (
                      <Text as="i" color="gray.500">No response provided.</Text>
                    )}
                  </Text>
                <Tooltip label="Edit Answer">
                    <IconButton
                      aria-label="Edit Answer"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      isDisabled={editingEntry !== null}
                    />
                </Tooltip>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {onSubmit && (
          <Button
            colorScheme="green"
            onClick={onSubmit}
            isDisabled={editingEntry !== null}
            leftIcon={<CheckIcon />}
          >
            Submit All Revisions
          </Button>
      )}

      <Modal isOpen={isOpen} onClose={handleCancelEdit} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit Answer:{" "}
            {editingEntry ? editingEntry.question : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Update your answer here..."
              minH="150px"
            />
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Tooltip label="Save Changes">
                  <IconButton
                      aria-label="Save changes"
                      icon={<CheckIcon />}
                      colorScheme="blue"
                      onClick={handleSave}
                    />
                </Tooltip>
              <Tooltip label="Cancel">
                <IconButton
                    aria-label="cancel"
                    icon={<CloseIcon />}
                    onClick={handleCancelEdit}
                    variant="ghost"
                />
              </Tooltip>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RevisionSummary;```


## /src/components/SystemDesign.tsx

```
import React, { useEffect, useState, JSX } from "react";
import { fetchDesignQuestions, submitDesignAnswers, DesignQuestion } from "../api";

interface Response {
  question_id: string;
  selected_option: string;
}

const SystemDesign: React.FC = () => {
  const [questions, setQuestions] = useState<DesignQuestion[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDesignQuestions()
      .then((data) => {
        const designQuestions = data || [];
        setQuestions(designQuestions);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching design questions:', err);
        setError('Failed to load design questions. Please try again.');
      });
  }, []);

  const handleOptionChange = (questionId: string, selected: string) => {
    setResponses((prev) => {
      const other = prev.filter((r) => r.question_id !== questionId);
      return [...other, { question_id: questionId, selected_option: selected }];
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitDesignAnswers(responses);
      setResult(res);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  if (questions.length === 0) return <div>Loading design questions...</div>;

  return (
    <div style={{ margin: "20px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
      <h2 style={{ textAlign: "center" }}>System Design Questions</h2>
      <div style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)", padding: "20px" }}>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "40px" }}>
            <h3 style={{ color: "#333" }}>{q.title} ({q.difficulty})</h3>
            <p style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666" }}>Context: </strong>
              {q.context}
            </p>

            {q.requirements && (
              <>
                {q.requirements.functional && q.requirements.functional.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Functional Requirements:</strong>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                      {q.requirements.functional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {q.requirements.non_functional && q.requirements.non_functional.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Non-functional Requirements:</strong>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                      {q.requirements.non_functional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* If old-style question has options, render them as radio buttons */}
            {(!q.phases || q.phases.length === 0) && q.options && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontWeight: "bold" }}>Possible Approaches:</p>
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      padding: "8px"
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      onChange={() => handleOptionChange(q.id, opt)}
                      style={{ marginRight: "10px" }}
                    />
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {loading ? "Submitting..." : "Submit Design Answers"}
          </button>
        </div>

        {result && (
          <div style={{ 
            marginTop: "30px", 
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px"
          }}>
            <h4 style={{ color: "#444" }}>Design Score / Results:</h4>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDesign;
```


## /src/components/SystemDesignWizard.tsx

```
// src/SystemDesignWizard.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Heading, Text, Textarea, Button, VStack } from "@chakra-ui/react";

interface Scenario {
  id: number;
  title: string;
  description: string;
}

interface WizardStep {
  id: number;
  step_number: number;
  title: string;
  prompt_text: string;
}

interface SystemDesignWizardProps {
  scenario: Scenario;
}

export const SystemDesignWizard: React.FC<SystemDesignWizardProps> = ({ scenario }) => {
  const [steps, setSteps] = useState<WizardStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");

  // For debugging: store all user responses if you want
  const [allResponses, setAllResponses] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // fetch scenario steps using scenario.id
    axios
      .get<WizardStep[]>(`http://localhost:5000/api/wizard/scenario/${scenario.id}/steps`)
      .then(res => {
        setSteps(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [scenario.id]);

  const handleSubmit = () => {
    if (!steps.length) return;
    const step = steps[currentStepIndex];
    // post userResponse
    axios.post("http://localhost:5000/api/wizard/submit_response", {
      scenario_id: scenario.id,
      step_id: step.id,
      user_response: userResponse
    })
    .then(() => {
      // Save local copy
      setAllResponses(prev => ({ ...prev, [step.id]: userResponse }));
      // Move to next step
      setUserResponse("");
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // Reached last step
        alert("All steps completed!");
      }
    })
    .catch(err => console.error(err));
  };

  if (!steps.length) {
    return (
      <Box p={4}>
        <Text>Loading scenario steps...</Text>
      </Box>
    );
  }

  const currentStep = steps[currentStepIndex];
  return (
    <VStack spacing={4} align="stretch" p={6}>
      {/* Display overall scenario context */}
      <Heading size="lg">{scenario.title}</Heading>
      <Text mb={4}>{scenario.description}</Text>
      <Heading size="md">
        Step {currentStep.step_number}: {currentStep.title}
      </Heading>
      <Text>{currentStep.prompt_text}</Text>
      <Textarea
        minH="150px"
        value={userResponse}
        onChange={(e) => setUserResponse(e.target.value)}
        placeholder="Type your answer here..."
      />
      <Button onClick={handleSubmit}>
        {currentStepIndex < steps.length - 1 ? "Next Step" : "Finish"}
      </Button>
    </VStack>
  );
};
```


## /src/components/WizardApp.tsx

```
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import axios from "axios";
import { SystemDesignWizard } from "./SystemDesignWizard";

interface Scenario {
  id: number;
  title: string;
  description: string;
}

const WizardApp: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Fetch all wizard scenarios from the backend
  useEffect(() => {
    setLoadingScenarios(true);
    axios
      .get("http://localhost:5000/api/wizard/scenarios")
      .then((response) => {
        setScenarios(response.data);
      })
      .catch((error) => {
        console.error("Error fetching wizard scenarios", error);
      })
      .finally(() => {
        setLoadingScenarios(false);
      });
  }, []);

  // If a scenario is selected, display the wizard for that scenario.
  if (selectedScenario) {
    return (
      <Box p={4}>
        <Button mb={4} onClick={() => setSelectedScenario(null)}>
          Back to Scenarios
        </Button>
        <SystemDesignWizard scenario={selectedScenario} />
      </Box>
    );
  }

  // Otherwise, show the scenario selection page.
  return (
    <Box p={4}>
      <Heading mb={4}>Select a System Design Scenario</Heading>
      {loadingScenarios ? (
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading scenarios...</Text>
        </VStack>
      ) : scenarios.length === 0 ? (
        <Text>No scenarios available.</Text>
      ) : (
        <SimpleGrid columns={[1, null, 2]} spacing={6}>
          {scenarios.map((scenario) => (
            <Box
              key={scenario.id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg="white"
              boxShadow="md"
            >
              <Heading size="md">{scenario.title}</Heading>
              <Text mb={4}>{scenario.description}</Text>
              <Button
                onClick={() => setSelectedScenario(scenario)}
                colorScheme="brand"
              >
                Start Scenario
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default WizardApp;
```


## /src/data/modelAnswers.ts

```typescript
// src/data/modelAnswers.ts
import { ModelAnswer } from "../types/modelAnswers"

export const modelAnswers: ModelAnswer[] = [
  {
    id: 1,
    title: "Functional Requirements",
    answer: `A well-structured system should include:
- User authentication and authorization
- Real-time data processing capabilities
- Data persistence and retrieval
- API endpoints for external integrations
- Monitoring and logging functionality`,
    explanation: "Functional requirements define the specific behaviors and capabilities that a system must exhibit. They are the core features that deliver value to users.",
    keyPoints: [
      "Always start with user-facing features",
      "Include both primary and secondary functions",
      "Consider system-to-system interactions",
      "Define success criteria for each requirement"
    ],
    commonMistakes: [
      "Mixing functional and non-functional requirements",
      "Being too vague or too specific",
      "Forgetting to consider error cases",
      "Omitting administrative functions"
    ],
    additionalResources: [
      {
        title: "Writing Good Requirements",
        url: "https://www.example.com/requirements"
      }
    ]
  },{
    id: 2,
    title: "Non-Functional Requirements for E-commerce",
    answer: `- Performance: The site should load product pages in under 2 seconds.
  - Scalability: The system should handle 10,000 concurrent users with minimal performance degradation.
  - Security: All user data must be encrypted in transit and at rest. PCI DSS compliance is required.
  - Availability: The system should have 99.99% uptime.
  - Usability: The checkout process should be completed in under 5 steps.`,
    explanation: "Non-functional requirements define the quality attributes of the system. For an e-commerce platform, performance, scalability, security, availability, and usability are critical for a positive user experience and business success.",
    keyPoints: [
      "Quantify requirements whenever possible (e.g., response time, uptime).",
      "Prioritize non-functional requirements based on business needs.",
      "Consider trade-offs between different quality attributes.",
      "Use industry standards and best practices as benchmarks."
    ],
    commonMistakes: [
      "Ignoring non-functional requirements until late in the development process.",
      "Setting unrealistic or unachievable targets.",
      "Failing to consider the impact of non-functional requirements on cost.",
      "Not involving stakeholders in defining non-functional requirements."
    ],
    additionalResources: [
      {
        title: "Non-Functional Requirements in Software Engineering",
        url: "https://www.example.com/non-functional-requirements"
      }
    ]
  },
  {
    id: 3,
    title: "High-Level Architecture for Ride-Sharing",
    answer: `The system would likely have the following components:
  - Mobile Apps (iOS, Android) for riders and drivers.
  - API Gateway: Handles routing and authentication.
  - User Service: Manages user accounts and profiles.
  - Driver Service: Tracks driver location and availability.
  - Trip Service: Manages the matching of riders and drivers, trip progress, and payment.
  - Mapping Service: Provides map data, routing, and ETA calculations.
  - Notification Service: Sends push notifications and SMS messages.
  - Payment Service: Integrates with a third-party payment gateway.`,
    explanation: "A ride-sharing service requires a distributed architecture to handle real-time data, location tracking, and high concurrency.  The services are separated to allow for independent scaling and development.",
    keyPoints: [
      "Use a microservices architecture for flexibility and scalability.",
      "Prioritize real-time communication between riders and drivers.",
      "Consider geographic distribution and data sharding for global coverage.",
      "Use a robust messaging system (e.g., Kafka, RabbitMQ) for asynchronous communication."
    ],
    commonMistakes: [
      "Choosing a monolithic architecture that becomes difficult to scale.",
      "Underestimating the complexity of real-time location tracking.",
      "Not planning for high availability and fault tolerance.",
      "Failing to secure sensitive user data and payment information."
    ],
    additionalResources: [
      {
        title: "Designing a Ride-Sharing Service",
        url: "https://www.example.com/ride-sharing-architecture"
      }
    ]
  },
  {
      id: 4,
      title: "Relational Database Schema for a Blog",
      answer: `
        Users: (user_id INT PRIMARY KEY, username VARCHAR(255) UNIQUE, email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), registration_date DATETIME)
        Posts: (post_id INT PRIMARY KEY, user_id INT, title VARCHAR(255), content TEXT, publication_date DATETIME, FOREIGN KEY (user_id) REFERENCES Users(user_id))
        Comments: (comment_id INT PRIMARY KEY, post_id INT, user_id INT, content TEXT, comment_date DATETIME, FOREIGN KEY (post_id) REFERENCES Posts(post_id), FOREIGN KEY (user_id) REFERENCES Users(user_id))
        Tags: (tag_id INT PRIMARY KEY, name VARCHAR(255) UNIQUE)
        Post_Tags: (post_id INT, tag_id INT, PRIMARY KEY (post_id, tag_id), FOREIGN KEY (post_id) REFERENCES Posts(post_id), FOREIGN KEY (tag_id) REFERENCES Tags(tag_id))
      `,
      explanation: "This schema uses a standard relational model.  Users can create multiple posts. Comments are associated with both a user and a post.  A many-to-many relationship between posts and tags is implemented using a junction table (Post_Tags).",
      keyPoints: [
        "Use appropriate data types for each column.",
        "Define primary keys and foreign keys to ensure data integrity.",
        "Use unique constraints to prevent duplicate entries.",
        "Consider indexing columns that are frequently used in queries."
      ],
      commonMistakes: [
        "Using overly large data types (e.g., TEXT for short strings).",
        "Forgetting to add foreign key constraints.",
        "Creating redundant or unnecessary tables.",
        "Poorly designed many-to-many relationships."
      ],
      additionalResources: [
        {
          title: "Database Design Best Practices",
          url: "https://www.example.com/database-design"
        }
      ]
    },
    {
        id: 5,
        title: "Load Balancing Algorithms",
        answer: `
          - Round Robin: Distributes requests sequentially to each server.
          - Least Connections: Sends requests to the server with the fewest active connections.
          - IP Hash: Uses the client's IP address to determine which server to send the request to.
          - Weighted Round Robin: Similar to Round Robin, but servers with higher weights receive more requests.
          - Weighted Least Connections: Similar to Least Connections, but servers with higher weights receive more requests.
        `,
        explanation: "Different load balancing algorithms are suitable for different scenarios. Round Robin is simple but may not be optimal if servers have different capacities. Least Connections is better for dynamic workloads. IP Hash ensures session persistence.",
        keyPoints: [
          "Choose an algorithm based on your application's needs and server capabilities.",
          "Consider using health checks to monitor server availability.",
          "Use sticky sessions (session affinity) if your application requires it.",
          "Monitor load balancer performance and adjust the algorithm if needed."
        ],
        commonMistakes: [
          "Using the wrong algorithm for your workload.",
          "Not configuring health checks correctly.",
          "Overloading a single server due to misconfiguration.",
          "Failing to monitor load balancer performance."
        ],
        additionalResources: [
          {
            title: "Load Balancing Algorithms Explained",
            url: "https://www.example.com/load-balancing-algorithms"
          }
        ]
      }
];```


## /src/factories/CustomNodeFactory.tsx

```
import React from "react";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CustomNodeModel } from "../types/node";
import { CustomNodeWidget } from "../components/CustomNodeWidget"; // Ensure correct path

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
}```


## /src/index.tsx

```
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from react-dom/client
import App from './App';

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}```


## /src/layouts/MainLayout.tsx

```
// src/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import { Box, Container, VStack } from '@chakra-ui/react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
};```


## /src/theme/index.ts

```typescript
// src/theme/index.ts
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  colors: {
    yelp: {
      red: '#FF1A1A',
      darkRed: '#AF0606',
      gray: '#666666',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'red',
      },
      variants: {
        solid: {
          bg: 'yelp.red',
          _hover: { bg: 'yelp.darkRed' }
        }
      }
    }
  }
})```


## /src/theme/theme.ts

```typescript
// theme.ts
import { extendTheme } from "@chakra-ui/react"

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#ffb8b8',
      200: '#ff8a8a',
      300: '#ff5c5c',
      400: '#ff2e2e',
      500: '#ff0000', // Yelp-inspired red
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    }
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
          borderRadius: 'xl',
        }
      }
    },
    Card: {
      baseStyle: {
        p: 6,
        borderRadius: 'xl',
        boxShadow: 'lg',
        bg: 'white',
      }
    }
  }
})
```


## /src/types/modelAnswers.ts

```typescript
// src/types/modelAnswers.ts
export interface ModelAnswer {
  id: number;
  title: string;
  answer: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes?: string[];
  additionalResources?: {
    title: string;
    url: string;
  }[];
}```


## /src/types/node.ts

```typescript
import { v4 as uuidv4 } from "uuid";
import { DefaultNodeModel, DefaultNodeModelOptions, DefaultPortModel } from "@projectstorm/react-diagrams";

export interface CustomNodeOptions extends DefaultNodeModelOptions {
  type?: string;
  details?: string;
  annotation?: string;
  x?: number;
  y?: number;
  id?: string;
}

export class CustomNodeModel extends DefaultNodeModel {
  constructor(options: CustomNodeOptions) {
    if (!options.id) {
      options.id = uuidv4();
    }
    super(options);
    // Initialize ports
    this.addPort(new DefaultPortModel({ in: true, name: "in" }));
    this.addPort(new DefaultPortModel({ in: false, name: "out" }));
    if (typeof options.x === "number" && typeof options.y === "number") {
      this.setPosition(options.x, options.y);
    }
  }

  serialize() {
    const base = super.serialize();
    const opts = this.options as CustomNodeOptions;
    return {
      ...base,
      type: opts.type,
      details: opts.details,
      annotation: opts.annotation,
    };
  }

  deserialize(event: any): void {
    super.deserialize(event);
    const opts = this.options as CustomNodeOptions;
    opts.type = event.data.type;
    opts.details = event.data.details;
    opts.annotation = event.data.annotation;
  }

  public setAnnotation(txt: string) {
    const opts = this.options as CustomNodeOptions;
    opts.annotation = txt;
  }

  public getAnnotation(): string {
    return (this.options as CustomNodeOptions).annotation || "";
  }
}```


## /src/utils/iconMapping.tsx

```

import { Icon } from "@chakra-ui/react";
import { FaCloudversify } from "react-icons/fa"; // CloudIcon
import { GiUnbalanced } from "react-icons/gi"; // BalancerIcon
import { HiMiniQueueList } from "react-icons/hi2"; // QueueIcon
import { GiServerRack } from "react-icons/gi"; // ServerIcon
import { TbApiAppOff } from "react-icons/tb"; // APIIcon
import { BsPersonArmsUp } from "react-icons/bs"; // UserIcon
import { HiMiniArrowsPointingOut } from "react-icons/hi2"; // MicroserviceIcon
import { TbExternalLinkOff } from "react-icons/tb"; // ExternalAPIIcon
import { GiBurstBlob } from "react-icons/gi"; // BlobStorageIcon
import { SiMongodb } from "react-icons/si";
import { DiRedis } from "react-icons/di";
import { GiFirewall } from "react-icons/gi";
import { FaPizzaSlice } from "react-icons/fa6";
import { FaMedapps } from "react-icons/fa6";
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import { SiGooglepubsub } from "react-icons/si";
import { SiGraphql } from "react-icons/si";
import { GiKeyLock } from "react-icons/gi";
import { GrDocumentStore } from "react-icons/gr";
import { GiTimeDynamite } from "react-icons/gi";
import { BiLogoPostgresql } from "react-icons/bi";



export const getIconForType = (type: string, color?: string, size: string | number = 6): JSX.Element => {
  const iconProps = {
    boxSize: size,
    color: color,
  };

  switch (type) {
    // Databases
    case "RelationalDB":
      // @ts-ignore
      return <Icon as={BiLogoPostgresql} {...iconProps} />;
    case "NoSQL_Document":
      // @ts-ignore
      return <Icon as={GrDocumentStore} {...iconProps} />;
    case "NoSQL_KeyValue":
      // @ts-ignore
      return <Icon as={GiKeyLock} {...iconProps} />;
      case "NoSQL_WideColumn":
      // @ts-ignore
      return <Icon as={SiMongodb} {...iconProps} />;
    case "NoSQL_Graph":
      // @ts-ignore
      return <Icon as={SiGraphql} {...iconProps} />;
    case "SearchEngine":
      // @ts-ignore
      return <Icon as={MdOutlineScreenSearchDesktop} {...iconProps} />;
    case "TimeSeriesDB":
      // @ts-ignore
      return <Icon as={GiTimeDynamite} {...iconProps} />;
    // Caching
    case "Cache_InMemory":
      // @ts-ignore
      return <Icon as={DiRedis} {...iconProps} />;
    case "Cache_CDN":
      // @ts-ignore
      return <Icon as={FaCloudversify} {...iconProps} />;
    // Load Balancers
    case "LoadBalancer_Elastic":
    case "LoadBalancer_Traditional":
    case "LoadBalancer_Application":
    case "LoadBalancer_Network":
      // @ts-ignore
      return <Icon as={GiUnbalanced} {...iconProps} />;
    // Messaging
    case "MessageQueue":
      // @ts-ignore
      return <Icon as={HiMiniQueueList} {...iconProps} />;
    case "PubSub":
      // @ts-ignore
      return <Icon as={SiGooglepubsub} {...iconProps} />;
    // Servers
    case "WebServer":
      // @ts-ignore
      return <Icon as={FaMedapps} {...iconProps} />;
    case "AppServer":
      // @ts-ignore
      return <Icon as={GiServerRack} {...iconProps} />;
    // Other
    case "APIGateway":
      // @ts-ignore
      return <Icon as={TbApiAppOff} {...iconProps} />;
    case "Firewall":
      // @ts-ignore
      return <Icon as={GiFirewall} {...iconProps} />;
    case "User":
      // @ts-ignore
      return <Icon as={BsPersonArmsUp} {...iconProps} />;
    case "Microservice":
      // @ts-ignore
      return <Icon as={HiMiniArrowsPointingOut} {...iconProps} />;
    case "ExternalAPI":
      // @ts-ignore
      return <Icon as={TbExternalLinkOff} {...iconProps} />;
    case "BlobStorage":
      // @ts-ignore
      return <Icon as={GiBurstBlob} {...iconProps} />;
    default:
      // @ts-ignore
      return <Icon as={FaPizzaSlice} {...iconProps} />;
  }
};
```

