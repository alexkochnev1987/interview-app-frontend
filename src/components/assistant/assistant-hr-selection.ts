export type AssistantHrSelection = {
  message: string
  displayText: string
}

export function toAssistantHrSelection(hr: { id: string; name: string }): AssistantHrSelection {
  return {
    message: hr.name,
    displayText: hr.name,
  }
}
