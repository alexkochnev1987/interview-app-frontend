export const ONBOARDING_EVENT_NAMES = {
  questionCreated: 'onboarding:question-created',
  aiDraftGenerated: 'onboarding:ai-draft-generated',
  aiDraftApplied: 'onboarding:ai-draft-applied',
  questionSelected: 'onboarding:question-selected',
  interviewCreated: 'onboarding:interview-created',
  evaluationStarted: 'onboarding:evaluation-started',
} as const

export type OnboardingEventName =
  (typeof ONBOARDING_EVENT_NAMES)[keyof typeof ONBOARDING_EVENT_NAMES]

export type OnboardingEventDetail = {
  nextRoute?: string
  questionId?: string
}

export function emitOnboardingEvent(
  name: OnboardingEventName,
  detail: OnboardingEventDetail = {},
): boolean {
  if (typeof window === 'undefined') return false

  const event = new CustomEvent<OnboardingEventDetail>(name, {
    cancelable: true,
    detail,
  })
  window.dispatchEvent(event)

  return event.defaultPrevented
}

export function listenForOnboardingEvent(
  name: OnboardingEventName,
  listener: (detail: OnboardingEventDetail) => void,
) {
  if (typeof window === 'undefined') return () => {}

  const handleEvent = (event: Event) => {
    event.preventDefault()
    listener((event as CustomEvent<OnboardingEventDetail>).detail ?? {})
  }

  window.addEventListener(name, handleEvent)
  return () => window.removeEventListener(name, handleEvent)
}
