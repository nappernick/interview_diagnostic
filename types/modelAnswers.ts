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
}