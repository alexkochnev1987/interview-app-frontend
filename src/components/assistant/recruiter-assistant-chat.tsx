'use client'

import { Bot, CheckCircle2, Send, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Panel } from '@/components/ui/panel'
import { Textarea } from '@/components/ui/textarea'
import { BodyText, SectionHeading } from '@/components/ui/text'
import {
  RecruiterAssistantResponse,
  RecruiterAssistantSuggestedQuestion,
} from '@/lib/api'
import { cn } from '@/lib/utils'
import type { RecruiterAssistantChatMessage } from './recruiter-assistant-chat-types'
import { useRecruiterAssistantChat } from './use-recruiter-assistant-chat'

export function RecruiterAssistantChat() {
  const {
    messages,
    input,
    setInput,
    pendingAction,
    loading,
    error,
    latestResult,
    submitMessage,
    confirmPendingAction,
  } = useRecruiterAssistantChat()

  return (
    <Stack gap={5} className="mx-auto w-full max-w-6xl">
      <Stack gap={2}>
        <Inline gap={2} align="center">
          <Sparkles className="size-5 text-[hsl(var(--primary))]" />
          <Heading>Recruiter assistant</Heading>
        </Inline>
        <BodyText size="base" width="lg">
          Ask for interview question sets and candidate interviews. The assistant only works with app-related recruiting workflows.
        </BodyText>
      </Stack>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel padding="none" radius="lg" className="overflow-hidden">
          <Stack gap={0}>
            <div className="max-h-[58vh] min-h-[420px] overflow-y-auto p-4">
              <Stack gap={3}>
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
                {loading ? (
                  <ChatBubble
                    message={{
                      id: 'loading',
                      role: 'assistant',
                      text: 'Working...',
                    }}
                    muted
                  />
                ) : null}
              </Stack>
            </div>

            <form onSubmit={submitMessage} className="border-t border-border/60 p-3">
              <Stack gap={2}>
                {error ? (
                  <BodyText tone="danger" size="sm">
                    {error}
                  </BodyText>
                ) : null}
                <Inline gap={2} align="end" wrap="nowrap">
                  <Textarea
                    size="xs"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask me to prepare questions or create an interview..."
                    className="min-h-[72px] rounded-2xl"
                  />
                  <Button
                    type="submit"
                    size="icon-xl"
                    loading={loading}
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <Send />
                  </Button>
                </Inline>
              </Stack>
            </form>
          </Stack>
        </Panel>

        <Stack gap={3}>
          {pendingAction ? (
            <Panel radius="lg" padding="lg">
              <Stack gap={3}>
                <Inline gap={2} align="center">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <SectionHeading size="sm">Pending confirmation</SectionHeading>
                </Inline>
                <BodyText>
                  {pendingAction.type === 'create_interview'
                    ? 'Create missing questions and create the interview.'
                    : 'Create the missing questions from this suggested set.'}
                </BodyText>
                <Button
                  variant="gradient"
                  width="full"
                  loading={loading}
                  onClick={confirmPendingAction}
                >
                  Confirm action
                </Button>
              </Stack>
            </Panel>
          ) : null}

          <QuestionPlan result={latestResult} />
        </Stack>
      </div>
    </Stack>
  )
}

function ChatBubble({
  message,
  muted,
}: {
  message: RecruiterAssistantChatMessage
  muted?: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-border/60 bg-background',
          muted && 'text-muted-foreground',
        )}
      >
        {!isUser ? (
          <Inline gap={2} align="center" className="mb-1">
            <Bot className="size-3.5" />
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Assistant
            </span>
          </Inline>
        ) : null}
        {message.text}
        {message.result?.createdInterview ? (
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <a href={message.result.createdInterview.candidateLink}>
                Open candidate link
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function QuestionPlan({
  result,
}: {
  result?: RecruiterAssistantResponse
}) {
  const questions = result?.suggestedQuestions ?? []
  if (questions.length === 0) {
    return (
      <Panel radius="lg" padding="lg">
        <Stack gap={2}>
          <SectionHeading size="sm">Question plan</SectionHeading>
          <BodyText>
            Suggested and matched questions will appear here after you send a recruiting request.
          </BodyText>
        </Stack>
      </Panel>
    )
  }

  const existing = questions.filter((question) => !question.needsCreation).length
  const missing = questions.length - existing

  return (
    <Panel radius="lg" padding="lg">
      <Stack gap={3}>
        <Stack gap={1}>
          <SectionHeading size="sm">Question plan</SectionHeading>
          <BodyText>
            {existing} matched in the question bank, {missing} need creation.
          </BodyText>
        </Stack>
        <Stack gap={2}>
          {questions.map((question, index) => (
            <QuestionRow key={question.key ?? index} question={question} index={index} />
          ))}
        </Stack>
      </Stack>
    </Panel>
  )
}

function QuestionRow({
  question,
  index,
}: {
  question: RecruiterAssistantSuggestedQuestion
  index: number
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-3">
      <Stack gap={2}>
        <Inline gap={2} align="center">
          <Badge variant={question.needsCreation ? 'outline' : 'secondary'}>
            {question.needsCreation ? 'New' : 'Existing'}
          </Badge>
          <BodyText as="span" size="xs" weight="semibold" tone="muted">
            #{index + 1}
          </BodyText>
        </Inline>
        <BodyText tone="foreground" weight="medium">
          {question.existingQuestionText ?? question.questionText}
        </BodyText>
        {question.tags && question.tags.length > 0 ? (
          <Inline gap={1}>
            {question.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="capsLabelMuted" size="capsLabelSm">
                {tag}
              </Badge>
            ))}
          </Inline>
        ) : null}
      </Stack>
    </div>
  )
}
