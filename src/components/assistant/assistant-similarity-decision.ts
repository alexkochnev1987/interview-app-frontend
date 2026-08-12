import type { AssistantSimilarityIntent } from './assistant-api-contract'

export type { AssistantSimilarityIntent } from './assistant-api-contract'

export type AssistantSimilarityDecision = {
  intent: AssistantSimilarityIntent
  displayText: string
}
