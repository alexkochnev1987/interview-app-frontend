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
  interviewId: string | undefined,
): string | null {
  if (!interviewId) {
    return null
  }

  const stepId = getStoredOnboardingStep(DEFAULT_ONBOARDING_FLOW_ID)
  const isTourOnAssessments =
    stepId === 'candidate-link' || stepId === 'assessments-evaluation'

  return isTourOnAssessments ? interviewId : null
}

export function useOnboardingAssessmentsCardHighlight(
  interviewId: string | undefined,
): string | null {
  const getSnapshot = useCallback(
    () => readAssessmentsCardHighlight(interviewId),
    [interviewId],
  )

  return useSyncExternalStore(emptySubscribe, getSnapshot, () => null)
}
