'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

import { OnboardingCompleteDialog } from '@/components/ui/onboarding/onboarding-complete-dialog'
import { OnboardingWelcomeDialog } from '@/components/ui/onboarding/onboarding-welcome-dialog'
import { useOnboardingTour } from '@/features/onboarding/use-onboarding-tour'
import { shouldOfferOnboarding } from '@/features/onboarding/onboarding-state'
import { isCandidateFlowPath } from '@/i18n/html-lang'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { notifyError } from '@/lib/toast'
import { useTranslations } from 'next-intl'

type OnboardingContextValue = {
  replayTour: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextValue>({
  replayTour: async () => {},
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

  const runtimeContext = useMemo(
    () => ({
      role: user?.role,
      isDemo: user?.demo === true,
    }),
    [user?.demo, user?.role],
  )

  const persistOnboarding = useCallback(
    async (status: 'completed' | 'skipped') => {
      try {
        await completeOnboarding(status)
      } catch {
        notifyError(t('errors.persistFailed'))
      }
    },
    [completeOnboarding, t],
  )

  const tour = useOnboardingTour({
    context: runtimeContext,
    onTourComplete: () => persistOnboarding('completed'),
    onTourSkip: () => persistOnboarding('skipped'),
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
    isStaffAppPath(pathname) && shouldOfferOnboarding(user)

  useEffect(() => {
    if (!shouldAutoStart || phase !== 'idle') {
      return
    }

    openWelcome()
  }, [shouldAutoStart, phase, openWelcome])

  useEffect(() => {
    return () => {
      void stopTour()
    }
  }, [stopTour])

  return (
    <OnboardingContext.Provider value={{ replayTour }}>
      {phase === 'welcome' ? (
        <OnboardingWelcomeDialog
          title={welcomeCopy.title}
          description={welcomeCopy.description}
          startLabel={welcomeCopy.startLabel}
          skipLabel={welcomeCopy.skipLabel}
          onStart={() => void startFromWelcome()}
          onSkip={() => void skipFromWelcome()}
        />
      ) : null}

      {phase === 'complete' ? (
        <OnboardingCompleteDialog
          title={completeCopy.title}
          description={completeCopy.description}
          actionLabel={completeCopy.actionLabel}
          onAction={() => {
            dismissComplete()
            router.push('/')
          }}
        />
      ) : null}

      {children}
    </OnboardingContext.Provider>
  )
}
