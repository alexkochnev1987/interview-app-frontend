export type AssistantHrSelection = {
  message: string
  displayText: string
}

export function toAssistantHrSelection(hr: { id: string; name: string }): AssistantHrSelection {
  return {
    message: hr.id,
    displayText: hr.name,
  }
}
