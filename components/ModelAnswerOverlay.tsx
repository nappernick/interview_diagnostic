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

export default ModelAnswerOverlay;