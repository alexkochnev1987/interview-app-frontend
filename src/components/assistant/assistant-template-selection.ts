export type AssistantTemplateSelection = {
  message: string
  displayText: string
}

export function toAssistantTemplateSelection(
  index: number,
  templateName: string,
): AssistantTemplateSelection {
  return {
    message: String(index + 1),
    displayText: templateName,
  }
}
