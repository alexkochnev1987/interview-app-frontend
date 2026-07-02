'use client'

import { useTranslations } from 'next-intl'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { Answer, Interview } from '@/lib/api'

import type {
  AnswerMediaState,
  QuestionUploadState,
} from '@/app/[locale]/interviews/[id]/interview-detail-types'

import { AnswerPacketCard } from './answer-packet-card'

interface AnswerPacketListProps {
  interview: Interview
  answersByIndex: Map<number, Answer>
  uploadStates: QuestionUploadState[]
  mediaByQuestion: Record<number, AnswerMediaState>
  isTerminal: boolean
  hasActiveValidation: boolean
  validating: boolean
  onUpload: (questionIndex: number, fileInput: HTMLInputElement | null) => void
}

export function AnswerPacketList({
  interview,
  answersByIndex,
  uploadStates,
  mediaByQuestion,
  isTerminal,
  hasActiveValidation,
  validating,
  onUpload,
}: AnswerPacketListProps) {
  const t = useTranslations('questions.common')

  return (
    <Section gap={4}>
      <Inline gap={4} align="end" justify="between" wrap="wrap">
        <Stack gap={2}>
          <EyebrowLabel size="lg">{t('packetEyebrow')}</EyebrowLabel>
          <SectionHeading>{t('packetHeading')}</SectionHeading>
        </Stack>
        <BodyText size="sm">{t('packetLead')}</BodyText>
      </Inline>

      <Stack gap={4}>
        {interview.questions.map((question, questionIndex) => {
          const answer = answersByIndex.get(questionIndex)
          const uploadState = uploadStates[questionIndex] ?? {
            status: 'idle',
          }
          const media = mediaByQuestion[questionIndex]

          return (
            <AnswerPacketCard
              key={question.id}
              question={question}
              questionIndex={questionIndex}
              answer={answer}
              uploadState={uploadState}
              media={media}
              isTerminal={isTerminal}
              hasActiveValidation={hasActiveValidation}
              validating={validating}
              onUpload={onUpload}
            />
          )
        })}
      </Stack>
    </Section>
  )
}
