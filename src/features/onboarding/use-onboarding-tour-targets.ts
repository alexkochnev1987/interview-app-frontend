'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { DEFAULT_ONBOARDING_FLOW_ID } from '@/features/onboarding/flows/registry'
import {
  getStoredOnboardingCreatedQuestionId,
  getStoredOnboardingStep,
} from '@/features/onboarding/onboarding-progress'

function emptySubscribe() {
  return () => {}
}

export function useOnboardingCreatedQuestionId(): string | null {
  const getSnapshot = useCallback(() => getStoredOnboardingCreatedQuestionId(), [])

  return useSyncExternalStore(emptySubscribe, getSnapshot, () => null)
}

function readAssessmentsCardHighlight(
  firstInterviewId: string | undefined,
): string | null {
  if (!firstInterviewId) {
    return null
  }

  const stepId = getStoredOnboardingStep(DEFAULT_ONBOARDING_FLOW_ID)
  const isTourOnAssessments =
    stepId === 'candidate-link' || stepId === 'assessments-evaluation'

  return isTourOnAssessments ? firstInterviewId : null
}

export function useOnboardingAssessmentsCardHighlight(
  firstInterviewId: string | undefined,
): string | null {
  const getSnapshot = useCallback(
    () => readAssessmentsCardHighlight(firstInterviewId),
    [firstInterviewId],
  )

  return useSyncExternalStore(emptySubscribe, getSnapshot, () => null)
}
