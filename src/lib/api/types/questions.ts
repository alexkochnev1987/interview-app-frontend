import type { QuestionDifficulty, QuestionRedFlagSeverity } from './common';

export interface QuestionExpectedConcept {
  id: string;
  label: string;
  weight: number;
  description: string;
}

export interface QuestionRedFlag {
  id: string;
  label: string;
  severity: QuestionRedFlagSeverity;
}

interface QuestionBase {
  externalId?: string;
  role?: string;
  focus?: string;
  outputLanguage: string;
  category?: string;
  subcategory?: string;
  questionText: string;
  followUpQuestions: string[];
  expectedConcepts: QuestionExpectedConcept[];
  redFlags: QuestionRedFlag[];
  difficulty: QuestionDifficulty;
  weight: number;
  sampleGoodAnswer?: string;
  minimumPassScore: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface QuestionDraft extends QuestionBase {}
export interface QuestionInput extends QuestionBase {}

export interface Question extends QuestionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  externalId?: string;
  role?: string;
  focus?: string;
  outputLanguage: string;
  category?: string;
  subcategory?: string;
  questionText: string;
  followUpQuestions: string[];
  expectedConcepts: QuestionExpectedConcept[];
  redFlags: QuestionRedFlag[];
  difficulty: QuestionDifficulty;
  weight: number;
  sampleGoodAnswer?: string;
  minimumPassScore: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface CandidateQuestionView {
  text: string;
}

export interface SimilarQuestionMatch {
  question: Question;
  score: number;
  reasons: string[];
}
