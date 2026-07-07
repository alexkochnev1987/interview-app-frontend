'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Driver } from 'driver.js'
import { useLocale, useTranslations } from 'next-intl'

import { buildDriverSteps } from '@/features/onboarding/build-driver-steps'
import {
  createOnboardingDriver,
  destroyOnboardingDriver,
} from '@/features/onboarding/create-onboarding-driver'
import {
  DEFAULT_ONBOARDING_FLOW_ID,
  getOnboardingFlow,
} from '@/features/onboarding/flows/registry'
import { prepareOnboardingStep } from '@/features/onboarding/prepare-onboarding-step'
import { resolveOnboardingSteps } from '@/features/onboarding/resolve-onboarding-steps'
import { getDriverProgressTemplate } from '@/features/onboarding/tour-progress-template'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import type {
  OnboardingFlowId,
  OnboardingRuntimeContext,
  OnboardingStepContent,
  ResolvedOnboardingStep,
} from '@/features/onboarding/types'

export type OnboardingPhase =
  | 'idle'
  | 'welcome'
  | 'touring'
  | 'complete'

type UseOnboardingTourOptions = {
  flowId?: OnboardingFlowId
  context: OnboardingRuntimeContext
  onTourComplete?: () => void | Promise<void>
  onTourSkip?: () => void | Promise<void>
}

export function useOnboardingTour({
  flowId = DEFAULT_ONBOARDING_FLOW_ID,
  context,
  onTourComplete,
  onTourSkip,
}: UseOnboardingTourOptions) {
  const t = useTranslations('onboarding')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const driverRef = useRef<Driver | null>(null)
  const completedRef = useRef(false)
  const [phase, setPhase] = useState<OnboardingPhase>('idle')

  useEffect(() => {
    if (phase !== 'welcome' && phase !== 'touring' && phase !== 'complete') {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [phase])

  const prepareStep = useCallback(
    async (step: ResolvedOnboardingStep) =>
      prepareOnboardingStep({
        step,
        pathname: pathnameRef.current,
        push: router.push,
      }),
    [router],
  )

  const translateStep = useCallback(
    (contentKey: string): OnboardingStepContent => ({
      title: t(`steps.${contentKey}.title`),
      description: t(`steps.${contentKey}.description`),
    }),
    [t],
  )

  const stopTour = useCallback(async () => {
    await destroyOnboardingDriver(driverRef.current)
    driverRef.current = null
  }, [])

  const openWelcome = useCallback(() => {
    setPhase('welcome')
  }, [])

  const runTour = useCallback(
    async (options?: { skipWelcome?: boolean }) => {
      await stopTour()
      completedRef.current = false

      const flow = getOnboardingFlow(flowId)
      const resolvedSteps = await resolveOnboardingSteps(flow, context, pathname)

      if (resolvedSteps.length === 0) {
        setPhase('idle')
        return false
      }

      const labels = {
        next: t('tour.next'),
        back: t('tour.back'),
        done: t('tour.done'),
        progress: getDriverProgressTemplate(locale),
      }

      const driverSteps = buildDriverSteps({
        steps: resolvedSteps,
        translateStep,
        labels,
        prepareStep,
        onDone: () => {
          completedRef.current = true
          void onTourComplete?.()
          setPhase('complete')
        },
      })
      const driver = await createOnboardingDriver({
        steps: driverSteps,
        labels,
        isComplete: () => completedRef.current,
        onSkip: () => {
          void onTourSkip?.()
          setPhase('idle')
        },
      })

      driverRef.current = driver
      setPhase('touring')

      const firstStep = resolvedSteps[0]
      await prepareStep(firstStep)

      driver.drive()

      if (options?.skipWelcome) {
        return true
      }

      return true
    },
    [context, flowId, locale, onTourComplete, onTourSkip, pathname, prepareStep, stopTour, t, translateStep],
  )

  const startFromWelcome = useCallback(async () => {
    const started = await runTour()
    if (!started) {
      setPhase('idle')
    }
  }, [runTour])

  const skipFromWelcome = useCallback(async () => {
    setPhase('idle')
    await onTourSkip?.()
  }, [onTourSkip])

  const replayTour = useCallback(async () => {
    await runTour({ skipWelcome: true })
  }, [runTour])

  const dismissComplete = useCallback(() => {
    setPhase('idle')
  }, [])

  return {
    phase,
    openWelcome,
    startFromWelcome,
    skipFromWelcome,
    replayTour,
    dismissComplete,
    stopTour,
    welcomeCopy: {
      title: t('welcome.title'),
      description: t('welcome.description'),
      startLabel: t('welcome.start'),
      skipLabel: t('welcome.skip'),
    },
    completeCopy: {
      title: t('complete.title'),
      description: t('complete.description'),
      actionLabel: t('complete.action'),
    },
  }
}
