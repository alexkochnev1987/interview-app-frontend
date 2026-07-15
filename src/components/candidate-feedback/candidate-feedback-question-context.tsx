'use client'

import { useTranslations } from 'next-intl'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { TranscriptBlock } from '@/components/ui/transcript-block'
import { type Answer, type InterviewQuestion } from '@/lib/api'

interface CandidateFeedbackQuestionContextProps {
  question: InterviewQuestion
  answer: Answer | undefined
}

export function CandidateFeedbackQuestionContext({
  question,
  answer,
}: CandidateFeedbackQuestionContextProps) {
  const tQuestion = useTranslations('assessments.question')

  return (
    <Stack gap={4}>
      <BodyText as="p" size="base" weight="semibold" tone="foreground">
        {question.questionText}
      </BodyText>

      <Stack gap={3}>
        <EyebrowLabel size="sm">{tQuestion('transcriptEyebrow')}</EyebrowLabel>
        <TranscriptBlock
          text={answer?.transcript?.text}
          emptyLabel={answer ? tQuestion('transcriptPending') : tQuestion('noAnswer')}
        />
      </Stack>
    </Stack>
  )
}
