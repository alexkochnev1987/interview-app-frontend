'use client'

import { AssistantChatLauncher } from '@/components/assistant/assistant-chat-launcher'
import { AssistantChatWidget } from '@/components/assistant/assistant-chat-widget'
import { useAppConfig } from '@/lib/app-config-context'
import { useAuth } from '@/lib/auth-context'
import { canShowRecruiterAssistant } from '@/lib/auth-roles'

export function AssistantChatMount() {
  const { user } = useAuth()
  const { RECRUITER_ASSISTANT_ENABLED } = useAppConfig()

  if (!RECRUITER_ASSISTANT_ENABLED || !canShowRecruiterAssistant(user)) {
    return null
  }

  return (
    <>
      <AssistantChatWidget />
      <AssistantChatLauncher />
    </>
  )
}
