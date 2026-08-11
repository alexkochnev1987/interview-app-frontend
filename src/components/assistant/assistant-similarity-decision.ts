export const ASSISTANT_SIMILARITY_CONTINUE_MESSAGE = 'yes, create the question anyway'
export const ASSISTANT_SIMILARITY_ABORT_MESSAGE = 'no, cancel creating the question'

export type AssistantSimilarityDecision = {
  message: string
  displayText: string
}
