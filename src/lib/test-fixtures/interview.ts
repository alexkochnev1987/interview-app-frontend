import type { Interview, InterviewQuestion, InterviewResult } from '@/lib/api'

const ISO = '2024-01-01T00:00:00.000Z'

export type InterviewAnswer = Interview['answers'][number]

export function questionFixture(
  partial: Partial<InterviewQuestion> = {},
): InterviewQuestion {
  return {
    id: 'q1',
    questionText: 'Tell us about a hard problem you solved.',
    outputLanguage: 'en',
    followUpQuestions: [],
    expectedConcepts: [],
    redFlags: [],
    difficulty: 'medium',
    weight: 1,
    minimumPassScore: 50,
    tags: [],
    metadata: {},
    createdAt: ISO,
    updatedAt: ISO,
    deleted: false,
    usageCount: 0,
    ...partial,
  }
}

export function interviewResultFixture(
  partial: Partial<InterviewResult> = {},
): InterviewResult {
  return {
    overallScore: 75,
    summary: 'Evaluation summary',
    categoryScores: {
      relevance: 80,
      depth: 70,
      communication: 75,
    },
    completedAt: ISO,
    ...partial,
  }
}

export function submittedAnswerFixture(
  partial: Partial<InterviewAnswer> = {},
): InterviewAnswer {
  return {
    questionIndex: 0,
    questionId: 'q1',
    status: 'submitted',
    mediaKey: 'media/interviews/iv-1/answers/q0-camera.webm',
    uploadedAt: ISO,
    ...partial,
  }
}

export function interviewFixture(partial: Partial<Interview> = {}): Interview {
  return {
    id: 'iv-1',
    candidateName: 'Test Candidate',
    position: 'Engineer',
    questions: [],
    answers: [],
    status: 'pending',
    createdAt: ISO,
    updatedAt: '2024-01-02T00:00:00.000Z',
    ...partial,
  }
}
