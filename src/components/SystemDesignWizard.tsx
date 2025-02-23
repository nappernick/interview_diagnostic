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
