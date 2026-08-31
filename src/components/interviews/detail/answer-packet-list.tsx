'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import type {
  AnswerMediaState,
  QuestionUploadState,
} from '@/app/[locale]/interviews/[id]/interview-detail-types'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { RecordingViewBanner } from '@/components/ui/recording-view-banner'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { Answer, Interview } from '@/lib/api'
import { hasAnswerMedia } from '@/lib/interview-detail-format'

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
  onLoadMedia?: (questionIndex: number) => void
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
  onLoadMedia,
}: AnswerPacketListProps) {
  const t = useTranslations('questions.common')
  const [loadAllRecordings, setLoadAllRecordings] = useState(false)
  const [expandedRecordings, setExpandedRecordings] = useState<Set<number>>(() => new Set())

  const mediaQuestionIndices = useMemo(
    () =>
      interview.questions.reduce<number[]>((indices, _, questionIndex) => {
        const answer = answersByIndex.get(questionIndex)
        if (answer && hasAnswerMedia(answer)) {
          indices.push(questionIndex)
        }
        return indices
      }, []),
    [interview.questions, answersByIndex],
  )

  const allRecordingsVisible =
    loadAllRecordings ||
    (mediaQuestionIndices.length > 0 &&
      mediaQuestionIndices.every((questionIndex) => expandedRecordings.has(questionIndex)))

  const showLoadAllBanner = mediaQuestionIndices.length > 0 && !allRecordingsVisible

  const handleLoadAllRecordings = () => {
    setLoadAllRecordings(true)
    mediaQuestionIndices.forEach((questionIndex) => {
      onLoadMedia?.(questionIndex)
    })
  }

  const handleShowRecording = (questionIndex: number) => {
    setExpandedRecordings((current) => {
      const next = new Set(current)
      next.add(questionIndex)
      return next
    })
    onLoadMedia?.(questionIndex)
  }

  return (
    <Section gap={4}>
      <Inline gap={4} align="end" justify="between" wrap="wrap">
        <Stack gap={2}>
          <EyebrowLabel size="lg">{t('packetEyebrow')}</EyebrowLabel>
          <SectionHeading>{t('packetHeading')}</SectionHeading>
        </Stack>
        <BodyText size="sm">{t('packetLead')}</BodyText>
      </Inline>

      {showLoadAllBanner ? (
        <RecordingViewBanner
          eyebrowLabel={t('loadAllRecordingsEyebrow')}
          description={t('loadAllRecordingsDescription')}
          actionLabel={t('loadAllRecordings')}
          onAction={handleLoadAllRecordings}
        />
      ) : null}

      <Stack gap={4}>
        {interview.questions.map((question, questionIndex) => {
          const answer = answersByIndex.get(questionIndex)
          const uploadState = uploadStates[questionIndex] ?? {
            status: 'idle',
          }
          const media = mediaByQuestion[questionIndex]
          const showRecording = loadAllRecordings || expandedRecordings.has(questionIndex)

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
              onLoadMedia={onLoadMedia}
              showRecording={showRecording}
              onShowRecording={() => handleShowRecording(questionIndex)}
            />
          )
        })}
      </Stack>
    </Section>
  )
}
