'use client'

import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ChatComposerBar, ChatMessageViewport, ChatReplyAnnouncer } from '@/components/ui/chat'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'

import { ASSISTANT_CHAT_COMPOSER_ID } from './assistant-api-contract'
import { AssistantChatBubble } from './assistant-chat-bubble'
import { useAssistantChatSession, useAssistantChatShell } from './assistant-chat-provider'
import { AssistantExamplePrompts } from './assistant-example-prompts'
import { AssistantPendingActionModal } from './assistant-pending-action-modal'

export function AiAssistantChat() {
  const {
    messages,
    input,
    setInput,
    pendingAction,
    loading,
    error,
    welcomeRole,
    submitMessage,
    sendUserMessage,
    confirmPendingAction,
    dismissPendingAction,
  } = useAssistantChatSession()
  const { open } = useAssistantChatShell()

  const t = useTranslations('assistant')
  const showPrompts = !messages.some((message) => message.role === 'user')
  const latestAssistant = messages.findLast((message) => message.role === 'assistant')
  const awaitingInput = latestAssistant?.result?.awaitingInput
  const composerPlaceholder =
    awaitingInput && t.has(`input.awaiting.${awaitingInput}`)
      ? t(`input.awaiting.${awaitingInput}`)
      : t(`input.placeholder.${welcomeRole}`)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastAnnouncedIdRef = useRef<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!open) return
    document.getElementById(ASSISTANT_CHAT_COMPOSER_ID)?.focus()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  useEffect(() => {
    if (loading) return
    if (!latestAssistant || latestAssistant.id === lastAnnouncedIdRef.current) return

    lastAnnouncedIdRef.current = latestAssistant.id
    setAnnouncement(latestAssistant.text)
  }, [latestAssistant, loading])

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    void submitMessage()
  }

  return (
    <>
      <ChatReplyAnnouncer>{announcement}</ChatReplyAnnouncer>
      <Stack gap={0} grow="fill" height="full">
        <ChatMessageViewport size="widget">
          <Stack gap={3}>
            {messages.map((message, index) => {
              const isLatestAssistant =
                message.role === 'assistant' &&
                !messages.slice(index + 1).some((entry) => entry.role === 'assistant')

              return (
                <AssistantChatBubble
                  key={message.id}
                  message={message}
                  disabled={loading}
                  onSelectTemplate={
                    isLatestAssistant && !loading
                      ? (selection) =>
                          void sendUserMessage(selection.message, {
                            displayText: selection.displayText,
                          })
                      : undefined
                  }
                  onSelectHr={
                    isLatestAssistant && !loading
                      ? (selection) =>
                          void sendUserMessage(selection.message, {
                            displayText: selection.displayText,
                          })
                      : undefined
                  }
                  onSelectInterview={
                    isLatestAssistant && !loading
                      ? (selection) =>
                          void sendUserMessage(selection.message, {
                            displayText: selection.displayText,
                          })
                      : undefined
                  }
                />
              )
            })}
            {loading ? (
              <AssistantChatBubble
                message={{
                  id: 'loading',
                  role: 'assistant',
                  text: t('loading'),
                }}
                muted
              />
            ) : null}
            <div ref={bottomRef} aria-hidden="true" />
          </Stack>
        </ChatMessageViewport>

        <ChatComposerBar tone="widget">
          <form onSubmit={submitMessage}>
            <Stack gap={2}>
              {error ? (
                <BodyText tone="danger" size="sm">
                  {error}
                </BodyText>
              ) : null}
              {showPrompts ? (
                <AssistantExamplePrompts
                  welcomeRole={welcomeRole}
                  disabled={loading}
                  onSelect={setInput}
                />
              ) : null}
              <Inline gap={2} align="end" wrap="nowrap">
                <Textarea
                  id={ASSISTANT_CHAT_COMPOSER_ID}
                  size="xs"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={composerPlaceholder}
                />
                <Button
                  type="submit"
                  size="icon-xl"
                  loading={loading}
                  disabled={!input.trim()}
                  aria-label={t('sendAriaLabel')}
                >
                  <Send />
                </Button>
              </Inline>
            </Stack>
          </form>
        </ChatComposerBar>
      </Stack>

      {pendingAction ? (
        <AssistantPendingActionModal
          pendingAction={pendingAction}
          loading={loading}
          onConfirm={confirmPendingAction}
          onCancel={dismissPendingAction}
        />
      ) : null}
    </>
  )
}
