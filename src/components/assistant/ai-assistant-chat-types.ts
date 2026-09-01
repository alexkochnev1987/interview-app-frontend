import type { RecruiterAssistantResponse } from '@/lib/api'

export type AiAssistantChatMessage = {
  id: string
  role: 'user' | 'assistant'
  /** Visible bubble text (may be localized). */
  text: string
  /** Exact message sent to the assistant API when it differs from `text`. */
  sentMessage?: string
  result?: RecruiterAssistantResponse
}
