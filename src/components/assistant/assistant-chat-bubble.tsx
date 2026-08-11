'use client'

import { Bot, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChatMessageBubble } from '@/components/ui/chat'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'
import { AssistantCreatedInterview } from './assistant-created-interview'
import { AssistantCreatedQuestion } from './assistant-created-question'
import { AssistantInterviewList } from './assistant-interview-list'
import { AssistantInterviewSummary } from './assistant-interview-summary'
import { AssistantRedirectAction } from './assistant-redirect-action'
import { AssistantTemplateList } from './assistant-template-list'
import type { AssistantTemplateSelection } from './assistant-template-selection'

type AssistantChatBubbleProps = {
  message: AiAssistantChatMessage
  muted?: boolean
  disabled?: boolean
  onSelectTemplate?: (selection: AssistantTemplateSelection) => void
}

export function AssistantChatBubble({
  message,
  muted,
  disabled = false,
  onSelectTemplate,
}: AssistantChatBubbleProps) {
  const t = useTranslations('assistant')
  const sharedLabels = useSharedLabels()
  const isUser = message.role === 'user'
  const lines = message.text.split('\n')

  const status = message.result?.status
  const isRefused = status === 'refused'
  const isDenied = status === 'denied'
  const isExecuted = status === 'executed'
  const escalateTo = message.result?.escalateTo

  return (
    <Inline justify={isUser ? 'end' : 'start'} width="full">
      <ChatMessageBubble
        variant={isUser ? 'user' : isExecuted ? 'success' : 'assistant'}
        muted={muted}
      >
        {!isUser ? (
          <Inline gap={2} align="center">
            <Icon size="sm">
              <Bot />
            </Icon>
            <BodyText as="span" size="xs" weight="semibold" tone="muted">
              {t('bubbleLabel')}
            </BodyText>
          </Inline>
        ) : null}
        <Stack gap={2}>
          {lines.map((line, index) => (
            <BodyText
              // oxlint-disable-next-line react/no-array-index-key
              key={`${message.id}-${index}`}
              as="span"
              size="sm"
              tone={isUser ? 'inherit' : muted ? 'muted' : 'foreground'}
            >
              {line || '\u00A0'}
            </BodyText>
          ))}
          {isExecuted ? (
            <Alert variant="success">
              <CheckCircle2 />
              <AlertTitle>{t('status.executedTitle')}</AlertTitle>
            </Alert>
          ) : null}
          {isRefused || isDenied ? (
            <Alert variant={isDenied ? 'danger' : 'warning'}>
              <ShieldAlert />
              <AlertTitle>
                {isDenied ? t('denial.deniedTitle') : t('denial.refusedTitle')}
              </AlertTitle>
              {escalateTo ? (
                <AlertDescription>
                  {t('denial.escalateHint', {
                    role: sharedLabels.role(escalateTo),
                  })}
                </AlertDescription>
              ) : null}
            </Alert>
          ) : null}

          {message.result?.interviews && message.result.interviews.length > 0 ? (
            <AssistantInterviewList interviews={message.result.interviews} />
          ) : null}
          {message.result?.interview ? (
            <AssistantInterviewSummary interview={message.result.interview} />
          ) : null}
          {message.result?.createdQuestion ? (
            <AssistantCreatedQuestion question={message.result.createdQuestion} />
          ) : null}
          {message.result?.createdInterview ? (
            <AssistantCreatedInterview interview={message.result.createdInterview} />
          ) : null}
          {message.result?.redirect ? (
            <AssistantRedirectAction redirect={message.result.redirect} />
          ) : null}
          {message.result?.awaitingInput === 'templateChoice' &&
          message.result.templates &&
          message.result.templates.length > 0 &&
          onSelectTemplate ? (
            <AssistantTemplateList
              templates={message.result.templates}
              disabled={disabled}
              onSelect={onSelectTemplate}
            />
          ) : null}
        </Stack>
      </ChatMessageBubble>
    </Inline>
  )
}
