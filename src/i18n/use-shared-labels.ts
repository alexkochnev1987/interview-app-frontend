import { useTranslations } from 'next-intl'

import type { Interview } from '@/lib/api'
import type { ReviewStatus } from '@/lib/assessment-status'

type RoleKey =
  | 'super_admin'
  | 'admin'
  | 'hr'
  | 'candidate'
  | 'interviewer'
  | 'system'
  | 'assistant'

type DifficultyKey = 'easy' | 'medium' | 'hard'
type DecisionKey = 'proceed' | 'review' | 'reject'
type BehaviorRiskKey = 'high' | 'medium' | 'low' | 'none'
type InterviewStatusKey = Interview['status']
type ReviewStatusKey = ReviewStatus

function fallbackLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function useSharedLabels() {
  const t = useTranslations('shared.labels')
  const safeLabel = (prefix: string, value: string) => {
    if (t.has(`${prefix}.${value}`)) {
      return t(`${prefix}.${value}`)
    }
    return fallbackLabel(value)
  }

  return {
    role(role: string) {
      return t.has(`roles.${role}`) ? t(`roles.${role as RoleKey}`) : fallbackLabel(role)
    },
    roleFilterAll() {
      return t('roleFilters.all')
    },
    difficulty(difficulty: string) {
      return t.has(`difficulty.${difficulty}`)
        ? t(`difficulty.${difficulty as DifficultyKey}`)
        : fallbackLabel(difficulty)
    },
    interviewStatus(status: string) {
      return safeLabel('interviewStatus', status as InterviewStatusKey)
    },
    reviewStatus(status: string) {
      return safeLabel('reviewStatus', status as ReviewStatusKey)
    },
    decision(decision: string) {
      return safeLabel('decision', decision as DecisionKey)
    },
    behaviorRisk(risk: string) {
      return t.has(`behaviorRisk.${risk}`)
        ? t(`behaviorRisk.${risk as BehaviorRiskKey}`)
        : fallbackLabel(risk)
    },
  }
}
