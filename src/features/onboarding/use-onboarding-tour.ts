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
import {
  clearStoredOnboardingStep,
  getStoredOnboardingStep,
  storeOnboardingStep,
} from '@/features/onboarding/onboarding-progress'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import type {
  OnboardingFlowId,
  OnboardingRuntimeContext,
  OnboardingStepContent,
  ResolvedOnboardingStep,
} from '@/features/onboarding/types'
import type { OnboardingEventDetail } from '@/features/onboarding/onboarding-events'

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
  const driverRef = useRef<Driver | null>(null)
  const completedRef = useRef(false)
  const [phase, setPhase] = useState<OnboardingPhase>('idle')

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  const prepareStep = useCallback(
    async (step: ResolvedOnboardingStep, detail?: OnboardingEventDetail) =>
      prepareOnboardingStep({
        step,
        getPathname: () => pathnameRef.current,
        push: router.push,
        routeOverride: detail?.nextRoute,
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
    async (options?: { skipWelcome?: boolean; startStepId?: string | null }) => {
      await stopTour()
      completedRef.current = false

      if (!options?.startStepId) {
        clearStoredOnboardingStep()
      }

      const flow = getOnboardingFlow(flowId)
      const resolvedSteps = await resolveOnboardingSteps(flow, context, pathname)
      const startIndex = options?.startStepId
        ? resolvedSteps.findIndex((step) => step.id === options.startStepId)
        : 0

      if (resolvedSteps.length === 0 || startIndex < 0) {
        clearStoredOnboardingStep()
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
        onStepActive: (step) => {
          storeOnboardingStep(flowId, step.id)
        },
        onDone: () => {
          completedRef.current = true
          clearStoredOnboardingStep()
          void onTourComplete?.()
          setPhase('complete')
        },
      })
      const driver = await createOnboardingDriver({
        steps: driverSteps,
        labels,
        isComplete: () => completedRef.current,
        onSkip: () => {
          clearStoredOnboardingStep()
          void onTourSkip?.()
          setPhase('idle')
        },
      })

      driverRef.current = driver
      setPhase('touring')

      const firstStep = resolvedSteps[startIndex]
      storeOnboardingStep(flowId, firstStep.id)
      await prepareStep(firstStep)

      driver.drive(startIndex)

      return true
    },
    [context, flowId, locale, onTourComplete, onTourSkip, pathname, prepareStep, stopTour, t, translateStep],
  )

  useEffect(() => {
    if (phase !== 'idle') {
      return
    }

    const storedStepId = getStoredOnboardingStep(flowId)
    if (!storedStepId) {
      return
    }

    const timer = window.setTimeout(() => {
      void runTour({ skipWelcome: true, startStepId: storedStepId })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [flowId, phase, runTour])

  const startFromWelcome = useCallback(async () => {
    const started = await runTour()
    if (!started) {
      setPhase('idle')
    }
  }, [runTour])

  const skipFromWelcome = useCallback(async () => {
    clearStoredOnboardingStep()
    setPhase('idle')
    await onTourSkip?.()
  }, [onTourSkip])

  const replayTour = useCallback(async () => {
    if (phase !== 'idle') {
      return
    }

    clearStoredOnboardingStep()
    await runTour({ skipWelcome: true })
  }, [phase, runTour])

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
