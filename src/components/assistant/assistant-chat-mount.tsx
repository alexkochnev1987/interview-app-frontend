'use client'

import { AssistantChatLauncher } from '@/components/assistant/assistant-chat-launcher'
import { AssistantChatWidget } from '@/components/assistant/assistant-chat-widget'
import { useAppConfig } from '@/lib/app-config-context'
import { useAuth } from '@/lib/auth-context'
import { canShowRecruiterAssistant } from '@/lib/auth-roles'

export function AssistantChatMount() {
  const { user } = useAuth()
  const { ENABLE_AI_ASSISTANT } = useAppConfig()

  if (!ENABLE_AI_ASSISTANT || !canShowRecruiterAssistant(user)) {
    return null
  }

  return (
    <>
      <AssistantChatWidget />
      <AssistantChatLauncher />
    </>
  )
}
