/** Backend NLU phrase to start a free-text candidate name instead of picking from the list. */
export const ASSISTANT_NEW_CANDIDATE_MESSAGE = 'new candidate' as const

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
