'use client'

import { Bot, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ChatMessageBubble } from '@/components/ui/chat'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SafeExternalLink } from '@/components/ui/safe-external-link'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'
import { AssistantInterviewList } from './assistant-interview-list'
import { AssistantInterviewSummary } from './assistant-interview-summary'

type AssistantChatBubbleProps = {
  message: AiAssistantChatMessage
  muted?: boolean
}

export function AssistantChatBubble({ message, muted }: AssistantChatBubbleProps) {
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
        </Stack>
        {message.result?.createdInterview ? (
          <Stack gap={2}>
            <Button asChild size="sm" variant="outline">
              <SafeExternalLink href={message.result.createdInterview.candidateLink}>
                {t('createdInterview.openLink')}
              </SafeExternalLink>
            </Button>
          </Stack>
        ) : null}
      </ChatMessageBubble>
    </Inline>
  )
}
