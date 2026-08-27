import type { AssistantRegisteredCandidateIntent } from './assistant-api-contract'

export type { AssistantRegisteredCandidateIntent } from './assistant-api-contract'

export type AssistantRegisteredCandidateDecision = {
  intent: AssistantRegisteredCandidateIntent
  displayText: string
}
