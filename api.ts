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
}