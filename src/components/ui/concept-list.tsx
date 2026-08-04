import { cva, type VariantProps } from 'class-variance-authority'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const chipVariants = cva('rounded-full px-3 py-1 text-xs font-medium ring-1', {
  variants: {
    tone: {
      covered: 'bg-pill-emerald-bg text-pill-emerald ring-pill-emerald-border',
      missed: 'bg-pill-amber-bg text-pill-amber ring-pill-amber-border',
      flag: 'bg-pill-rose-bg text-pill-rose ring-pill-rose-border',
      neutral: 'bg-surface-low-soft text-muted-foreground ring-hairline',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

interface ConceptListProps extends VariantProps<typeof chipVariants> {
  label: string
  items: ReadonlyArray<string>
  emptyLabel?: string
  className?: string
}

export function ConceptList({
  label,
  items,
  tone,
  emptyLabel = 'None',
  className,
}: ConceptListProps) {
  return (
    <Stack gap={2} className={className}>
      <EyebrowLabel size="sm">{label}</EyebrowLabel>
      {items.length === 0 ? (
        <BodyText size="sm" tone="muted">
          {emptyLabel}
        </BodyText>
      ) : (
        <Inline gap={2} wrap="wrap">
          {items.map((item) => (
            <span key={item} className={cn(chipVariants({ tone }))}>
              {item}
            </span>
          ))}
        </Inline>
      )}
    </Stack>
  )
}
