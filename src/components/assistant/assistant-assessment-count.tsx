'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { RecruiterAssistantAssessmentCount } from '@/lib/api'
import type { AssessmentsStatusFilter } from '@/lib/assessments-query-state'

type AssistantAssessmentCountProps = {
  assessmentCount: RecruiterAssistantAssessmentCount
}

type LooselyTypedFilters = Record<string, unknown>

function readAssessmentCountFilterString(
  filters: RecruiterAssistantAssessmentCount['filters'],
  key: string,
): string | undefined {
  if (!filters) return undefined

  const value = (filters as LooselyTypedFilters)[key]
  return typeof value === 'string' ? value : undefined
}

function isAssessmentsStatusFilter(value: string): value is AssessmentsStatusFilter {
  return (
    value === 'all' ||
    value === 'ready_to_score' ||
    value === 'ready' ||
    value === 'scoring' ||
    value === 'failed'
  )
}

export function AssistantAssessmentCount({ assessmentCount }: AssistantAssessmentCountProps) {
  const t = useTranslations('assistant')
  const sharedLabels = useSharedLabels()
  const statusFilter = readAssessmentCountFilterString(assessmentCount.filters, 'status')
  const queryFilter = readAssessmentCountFilterString(assessmentCount.filters, 'q')?.trim()

  return (
    <ChatResultCard>
      <Stack gap={1}>
        <BodyText as="span" size="xs" weight="semibold" tone="muted">
          {t('assessmentCount.heading')}
        </BodyText>
        <BodyText as="span" size="base" weight="semibold">
          {t('assessmentCount.total', { count: assessmentCount.total })}
        </BodyText>
        {statusFilter && statusFilter !== 'all' && isAssessmentsStatusFilter(statusFilter) ? (
          <BodyText as="span" size="xs" tone="muted">
            {t('assessmentCount.statusFilter', {
              status:
                statusFilter === 'scoring'
                  ? t('assessmentCount.statusScoring')
                  : sharedLabels.reviewStatus(statusFilter),
            })}
          </BodyText>
        ) : null}
        {queryFilter ? (
          <BodyText as="span" size="xs" tone="muted">
            {t('assessmentCount.queryFilter', { query: queryFilter })}
          </BodyText>
        ) : null}
      </Stack>
    </ChatResultCard>
  )
}
