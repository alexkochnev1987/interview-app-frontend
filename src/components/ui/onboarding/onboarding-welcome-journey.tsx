'use client'

import { useTranslations } from 'next-intl'
import { cva } from 'class-variance-authority'

import { Text } from '@/components/ui/text'

const journeyTrackVariants = cva('relative w-full')

const journeyRowVariants = cva(
  'relative z-10 grid w-full grid-cols-4 items-start gap-3',
)

const journeyNodeVariants = cva(
  'flex min-w-0 flex-col items-center gap-2 px-1',
)

const journeyMarkerVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-soft ring-1',
  {
    variants: {
      tone: {
        start: 'bg-primary-gradient text-primary-foreground ring-[hsl(var(--primary)/0.2)]',
        mid: 'bg-surface-low-glass text-[hsl(var(--primary))] ring-hairline',
        end: 'bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))] ring-[hsl(var(--primary)/0.15)]',
      },
    },
    defaultVariants: {
      tone: 'mid',
    },
  },
)

const journeySteps = [
  { key: 'journeyQuestions', tone: 'start' as const },
  { key: 'journeyAi', tone: 'mid' as const },
  { key: 'journeyInterviews', tone: 'mid' as const },
  { key: 'journeyAssessments', tone: 'end' as const },
]

export function OnboardingWelcomeJourney() {
  const t = useTranslations('onboarding.welcome')

  return (
    <div className={journeyTrackVariants()}>
        <div
          aria-hidden
          className="pointer-events-none absolute left-[12%] right-[12%] top-4 z-0 h-px bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--primary)/0.28)] to-[hsl(var(--primary)/0.08)]"
        />

        <div className={journeyRowVariants()}>
          {journeySteps.map((step, index) => (
            <div key={step.key} className={journeyNodeVariants()}>
              <div className={journeyMarkerVariants({ tone: step.tone })}>
                {index + 1}
              </div>
              <Text
                as="span"
                variant="captionMutedXs"
                className="max-w-full text-center text-[0.65rem] leading-4"
              >
                {t(step.key)}
              </Text>
            </div>
          ))}
        </div>
    </div>
  )
}
