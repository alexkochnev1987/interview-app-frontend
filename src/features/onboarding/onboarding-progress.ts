import type { OnboardingFlowId } from '@/features/onboarding/types'

const STORAGE_KEY = 'interview-app:onboarding-progress'

type StoredOnboardingProgress = {
  flowId: OnboardingFlowId
  stepId: string
  stepRoutes?: Record<string, string>
  createdQuestionId?: string
}

type OnboardingProgressListener = () => void

const listeners = new Set<OnboardingProgressListener>()

export function subscribeOnboardingProgress(
  listener: OnboardingProgressListener,
): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function notifyOnboardingProgressListeners() {
  for (const listener of listeners) {
    listener()
  }
}

function readStoredProgress(): StoredOnboardingProgress | null {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredOnboardingProgress
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    notifyOnboardingProgressListeners()
    return null
  }
}

function writeStoredProgress(progress: StoredOnboardingProgress) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  notifyOnboardingProgressListeners()
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
  if (!existing) return

  writeStoredProgress({
    ...existing,
    createdQuestionId: questionId,
  })
}

export function storeOnboardingStepRoute(stepId: string, route: string) {
  const existing = readStoredProgress()
  if (!existing) return

  writeStoredProgress({
    ...existing,
    stepRoutes: {
      ...existing.stepRoutes,
      [stepId]: route,
    },
  })
}

export function clearStoredOnboardingStep() {
  if (typeof window === 'undefined') return

  window.sessionStorage.removeItem(STORAGE_KEY)
  notifyOnboardingProgressListeners()
}
