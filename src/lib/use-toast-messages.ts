import { useBulkDeleteToastMessages } from './toast-messages/use-bulk-delete-toast-messages'
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

export {
  useBulkDeleteToastMessages,
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
    questionFeed: useQuestionFeedToastMessages(),
    questionFacets: useQuestionFacetsToastMessages(),
    similarity: useSimilarityToastMessages(),
    pageGate: usePageGateToastMessages(),
    team: useTeamToastMessages(),
    rerun: useRerunToastMessages(),
    deleteQuestion: useDeleteQuestionToastMessages(),
  }
}
