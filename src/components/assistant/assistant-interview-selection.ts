export type AssistantInterviewSelection = {
  message: string
  displayText: string
}

export function toAssistantInterviewSelection(interview: {
  id: string
  candidateName: string
  position: string
}): AssistantInterviewSelection {
  return {
    message: interview.id,
    displayText: `${interview.candidateName} (${interview.position})`,
  }
}
