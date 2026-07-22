import type { RecruiterAssistantResponse } from '@/lib/api'

export type RecruiterAssistantChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  result?: RecruiterAssistantResponse
}

export const recruiterAssistantStarterPrompt =
  'Create an interview for a developer with 10 questions. Suggest the 10 necessary questions first; I will choose.'

export const recruiterAssistantWelcomeMessage: RecruiterAssistantChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'I can help prepare interview questions, check your question bank, create missing questions, and create interviews after confirmation.',
}
