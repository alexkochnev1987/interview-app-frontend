'use client'

import { AssistantChatLauncher } from '@/components/assistant/assistant-chat-launcher'
import { AssistantChatWidget } from '@/components/assistant/assistant-chat-widget'
import { useAuth } from '@/lib/auth-context'
import { canShowRecruiterAssistant } from '@/lib/auth-roles'

export function AssistantChatMount() {
  const { user } = useAuth()

  if (!canShowRecruiterAssistant(user)) {
    return null
  }

  return (
    <>
      <AssistantChatWidget />
      <AssistantChatLauncher />
    </>
  )
}
