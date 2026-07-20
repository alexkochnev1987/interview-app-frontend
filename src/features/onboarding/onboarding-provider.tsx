'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { OnboardingCompleteDialog } from '@/components/ui/onboarding/onboarding-complete-dialog'
import { OnboardingWelcomeDialog } from '@/components/ui/onboarding/onboarding-welcome-dialog'
import { DEFAULT_ONBOARDING_FLOW_ID } from '@/features/onboarding/flows/registry'
import { getStoredOnboardingStep } from '@/features/onboarding/onboarding-progress'
import { useOnboardingTour } from '@/features/onboarding/use-onboarding-tour'
import { shouldOfferOnboarding } from '@/features/onboarding/onboarding-state'
import { isCandidateFlowPath } from '@/i18n/html-lang'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { notifyError } from '@/lib/toast'
import { useTranslations } from 'next-intl'

type OnboardingContextValue = {
  replayTour: () => Promise<void>
  canReplayTour: boolean
}

const OnboardingContext = createContext<OnboardingContextValue>({
  replayTour: async () => {},
  canReplayTour: true,
})

export function useOnboardingReplay() {
  return useContext(OnboardingContext)
}

function isStaffAppPath(pathname: string): boolean {
  if (isCandidateFlowPath(pathname)) {
    return false
  }

  return pathname !== '/login'
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, completeOnboarding } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('onboarding')
  const [onboardingOfferDismissed, setOnboardingOfferDismissed] = useState(false)

  const runtimeContext = useMemo(
    () => ({
      role: user?.role,
      isDemo: user?.demo === true,
    }),
    [user?.demo, user?.role],
  )

  const persistOnboarding = useCallback(
    async (status: 'completed' | 'skipped'): Promise<boolean> => {
      try {
        await completeOnboarding(status)
        return true
      } catch {
        notifyError(t('errors.persistFailed'))
        return false
      }
    },
    [completeOnboarding, t],
  )

  const handleTourSkip = useCallback(async () => {
    if (!shouldOfferOnboarding(user)) {
      return
    }

    setOnboardingOfferDismissed(true)
    const persisted = await persistOnboarding('skipped')
    if (!persisted) {
      setOnboardingOfferDismissed(false)
    }
  }, [persistOnboarding, user])

  const tour = useOnboardingTour({
    context: runtimeContext,
    onTourSkip: handleTourSkip,
  })

  const {
    phase,
    openWelcome,
    stopTour,
    startFromWelcome,
    skipFromWelcome,
    replayTour,
    dismissComplete,
    welcomeCopy,
    completeCopy,
  } = tour

  const shouldAutoStart =
    isStaffAppPath(pathname) &&
    shouldOfferOnboarding(user) &&
    !onboardingOfferDismissed

  useEffect(() => {
    if (!shouldAutoStart || phase !== 'idle') {
      return
    }

    if (getStoredOnboardingStep(DEFAULT_ONBOARDING_FLOW_ID)) {
      return
    }

    openWelcome()
  }, [shouldAutoStart, phase, openWelcome])

  useEffect(() => {
    return () => {
      void stopTour()
    }
  }, [stopTour])

  const replayContextValue = useMemo(
    () => ({
      replayTour,
      canReplayTour: phase === 'idle',
    }),
    [replayTour, phase],
  )

  return (
    <OnboardingContext.Provider value={replayContextValue}>
      {phase === 'welcome' ? (
        <OnboardingWelcomeDialog
          title={welcomeCopy.title}
          description={welcomeCopy.description}
          startLabel={welcomeCopy.startLabel}
          skipLabel={welcomeCopy.skipLabel}
          onStart={() => void startFromWelcome()}
          onSkip={() => {
            setOnboardingOfferDismissed(true)
            void skipFromWelcome()
          }}
        />
      ) : null}

      {phase === 'complete' ? (
        <OnboardingCompleteDialog
          title={completeCopy.title}
          description={completeCopy.description}
          actionLabel={completeCopy.actionLabel}
          onAction={() => {
            void (async () => {
              if (!shouldOfferOnboarding(user)) {
                dismissComplete()
                return
              }

              setOnboardingOfferDismissed(true)
              const persisted = await persistOnboarding('completed')
              if (!persisted) {
                setOnboardingOfferDismissed(false)
                return
              }

              dismissComplete()
              router.push('/')
            })()
          }}
        />
      ) : null}

      {children}
    </OnboardingContext.Provider>
  )
}
