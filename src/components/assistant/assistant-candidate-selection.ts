import { ASSISTANT_NEW_CANDIDATE_MESSAGE } from './assistant-api-contract'

export { ASSISTANT_NEW_CANDIDATE_MESSAGE } from './assistant-api-contract'

export type AssistantCandidateSelection = {
  message: string
  displayText: string
}

export function toAssistantCandidateSelection(candidate: {
  id: string
  name: string
}): AssistantCandidateSelection {
  return {
    message: candidate.id,
    displayText: candidate.name,
  }
}

export function toAssistantNewCandidateSelection(displayText: string): AssistantCandidateSelection {
  return {
    message: ASSISTANT_NEW_CANDIDATE_MESSAGE,
    displayText,
  }
}
