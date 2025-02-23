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
