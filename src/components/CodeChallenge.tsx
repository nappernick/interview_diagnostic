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
