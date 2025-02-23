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

export default RevisionSummary;