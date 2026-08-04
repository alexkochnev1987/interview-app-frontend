import type { RecruiterAssistantResponse } from '@/lib/api'

export type AiAssistantChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  result?: RecruiterAssistantResponse
}
