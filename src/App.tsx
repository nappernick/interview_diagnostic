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

export default App;