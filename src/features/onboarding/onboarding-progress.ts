import type { OnboardingFlowId } from '@/features/onboarding/types'

const STORAGE_KEY = 'interview-app:onboarding-progress'

type StoredOnboardingProgress = {
  flowId: OnboardingFlowId
  stepId: string
  stepRoutes?: Record<string, string>
  createdQuestionId?: string
}

function readStoredProgress(): StoredOnboardingProgress | null {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredOnboardingProgress
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function writeStoredProgress(progress: StoredOnboardingProgress) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getStoredOnboardingStep(
  flowId: OnboardingFlowId,
): string | null {
  const progress = readStoredProgress()
  if (!progress || progress.flowId !== flowId) return null

  return progress.stepId
}

export function getStoredOnboardingStepRoute(stepId: string): string | null {
  const progress = readStoredProgress()
  return progress?.stepRoutes?.[stepId] ?? null
}

export function getStoredOnboardingCreatedQuestionId(): string | null {
  const progress = readStoredProgress()
  return progress?.createdQuestionId ?? null
}

export function storeOnboardingStep(flowId: OnboardingFlowId, stepId: string) {
  const existing = readStoredProgress()

  writeStoredProgress({
    flowId,
    stepId,
    stepRoutes: existing?.flowId === flowId ? existing.stepRoutes : undefined,
    createdQuestionId:
      existing?.flowId === flowId ? existing.createdQuestionId : undefined,
  })
}

export function storeOnboardingCreatedQuestionId(questionId: string) {
  const existing = readStoredProgress()

  writeStoredProgress({
    flowId: existing?.flowId ?? 'staff-first-login',
    stepId: existing?.stepId ?? 'interview-select',
    stepRoutes: existing?.stepRoutes,
    createdQuestionId: questionId,
  })
}

export function storeOnboardingStepRoute(stepId: string, route: string) {
  const existing = readStoredProgress()

  writeStoredProgress({
    flowId: existing?.flowId ?? 'staff-first-login',
    stepId: existing?.stepId ?? stepId,
    stepRoutes: {
      ...existing?.stepRoutes,
      [stepId]: route,
    },
    createdQuestionId: existing?.createdQuestionId,
  })
}

export function clearStoredOnboardingStep() {
  if (typeof window === 'undefined') return

  window.sessionStorage.removeItem(STORAGE_KEY)
}
