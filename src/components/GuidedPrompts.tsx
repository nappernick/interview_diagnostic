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

export default GuidedPrompts;