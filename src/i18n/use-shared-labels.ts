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

  return {
    role(role: string) {
      return t.has(`roles.${role}`) ? t(`roles.${role as RoleKey}`) : fallbackLabel(role)
    },
    difficulty(difficulty: string) {
      return t.has(`difficulty.${difficulty}`)
        ? t(`difficulty.${difficulty as DifficultyKey}`)
        : fallbackLabel(difficulty)
    },
    interviewStatus(status: Interview['status']) {
      return t(`interviewStatus.${status}`)
    },
    reviewStatus(status: ReviewStatus) {
      return t(`reviewStatus.${status}`)
    },
    decision(decision: DecisionKey) {
      return t(`decision.${decision}`)
    },
    behaviorRisk(risk: BehaviorRiskKey) {
      return t(`behaviorRisk.${risk}`)
    },
  }
}
