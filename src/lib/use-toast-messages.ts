import { useApiErrorToastMessages } from './toast-messages/use-api-error-toast-messages'
import { useBulkDeleteToastMessages } from './toast-messages/use-bulk-delete-toast-messages'
import { useCandidateFeedbackToastMessages } from './toast-messages/use-candidate-feedback-toast-messages'
import { useDefaultsToastMessages } from './toast-messages/use-defaults-toast-messages'
import { useInterviewToastMessages } from './toast-messages/use-interview-toast-messages'
import { useInterviewsLibraryToastMessages } from './toast-messages/use-interviews-library-toast-messages'
import { usePageGateToastMessages } from './toast-messages/use-page-gate-toast-messages'
import {
  useDeleteQuestionToastMessages,
  useQuestionFacetsToastMessages,
  useQuestionFeedToastMessages,
  useQuestionsToastMessages,
  useQuestionToastMessages,
} from './toast-messages/use-question-toast-messages'
import { useRerunToastMessages } from './toast-messages/use-rerun-toast-messages'
import { useSimilarityToastMessages } from './toast-messages/use-similarity-toast-messages'
import { useTakeToastMessages } from './toast-messages/use-take-toast-messages'
import { useTeamToastMessages } from './toast-messages/use-team-toast-messages'
import { useTemplateToastMessages } from './toast-messages/use-template-toast-messages'

export {
  useApiErrorToastMessages,
  useBulkDeleteToastMessages,
  useCandidateFeedbackToastMessages,
  useDefaultsToastMessages,
  useDeleteQuestionToastMessages,
  useInterviewToastMessages,
  useInterviewsLibraryToastMessages,
  usePageGateToastMessages,
  useQuestionFacetsToastMessages,
  useQuestionFeedToastMessages,
  useQuestionsToastMessages,
  useQuestionToastMessages,
  useRerunToastMessages,
  useSimilarityToastMessages,
  useTakeToastMessages,
  useTeamToastMessages,
  useTemplateToastMessages,
}

export function useToastMessages() {
  return {
    defaults: useDefaultsToastMessages(),
    question: useQuestionToastMessages(),
    questions: useQuestionsToastMessages(),
    interviewsLibrary: useInterviewsLibraryToastMessages(),
    interview: useInterviewToastMessages(),
    take: useTakeToastMessages(),
    bulkDelete: useBulkDeleteToastMessages(),
    candidateFeedback: useCandidateFeedbackToastMessages(),
    questionFeed: useQuestionFeedToastMessages(),
    questionFacets: useQuestionFacetsToastMessages(),
    similarity: useSimilarityToastMessages(),
    pageGate: usePageGateToastMessages(),
    team: useTeamToastMessages(),
    template: useTemplateToastMessages(),
    rerun: useRerunToastMessages(),
    deleteQuestion: useDeleteQuestionToastMessages(),
    apiError: useApiErrorToastMessages(),
  }
}
