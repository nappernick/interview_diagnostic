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

export default RequirementsSection;