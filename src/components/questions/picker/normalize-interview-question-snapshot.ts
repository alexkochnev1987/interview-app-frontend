import { type InterviewQuestion, type Question } from '@/lib/api'

/** Ensures interview question snapshots have library fields the picker UI expects. */
export function normalizeInterviewQuestionSnapshot(
  question: InterviewQuestion,
): Question {
  return {
    ...question,
    followUpQuestions: question.followUpQuestions ?? [],
    expectedConcepts: question.expectedConcepts ?? [],
    redFlags: question.redFlags ?? [],
    tags: question.tags ?? [],
    metadata: question.metadata ?? {},
    deleted: question.deleted ?? false,
    pendingDeletion: question.pendingDeletion ?? false,
    usageCount: question.usageCount ?? 0,
  }
}

export function normalizeInterviewQuestionSnapshots(
  questions: InterviewQuestion[],
): Question[] {
  return questions.map(normalizeInterviewQuestionSnapshot)
}
