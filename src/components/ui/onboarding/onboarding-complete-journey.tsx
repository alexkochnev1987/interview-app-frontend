'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cva } from 'class-variance-authority'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

const journeyTrackVariants = cva('relative w-full')

const journeyRowVariants = cva(
  'relative z-10 grid w-full grid-cols-4 items-start gap-3',
)

const journeyNodeVariants = cva(
  'flex min-w-0 flex-col items-center gap-2 px-1',
)

const journeyMarkerVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-full shadow-soft ring-1 bg-primary-gradient text-primary-foreground ring-[hsl(var(--primary)/0.2)]',
)

const journeySteps = [
  'journeyQuestions',
  'journeyAi',
  'journeyInterviews',
  'journeyAssessments',
] as const

export function OnboardingCompleteJourney() {
  const t = useTranslations('onboarding.complete')

  return (
    <div className={journeyTrackVariants()}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12%] right-[12%] top-4 z-0 h-px bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--primary)/0.28)] to-[hsl(var(--primary)/0.08)]"
      />

      <div className={journeyRowVariants()}>
        {journeySteps.map((key) => (
          <div key={key} className={journeyNodeVariants()}>
            <div className={journeyMarkerVariants()}>
              <Icon size="xs">
                <Check />
              </Icon>
            </div>
            <Text
              as="span"
              variant="captionMutedXs"
              className="max-w-full text-center text-[0.65rem] leading-4"
            >
              {t(key)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}
