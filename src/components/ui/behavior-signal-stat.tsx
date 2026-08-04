import { cva, type VariantProps } from 'class-variance-authority'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'

const statVariants = cva('rounded-2xl p-4 ring-1', {
  variants: {
    severity: {
      ok: 'bg-surface-low-soft ring-hairline',
      watch: 'bg-warning-soft ring-warning-soft-border',
      risk: 'bg-danger-soft ring-danger-soft-border',
    },
  },
  defaultVariants: {
    severity: 'ok',
  },
})

const valueVariants = cva('text-2xl font-semibold tracking-display', {
  variants: {
    severity: {
      ok: 'text-foreground',
      watch: 'text-warning-soft-foreground',
      risk: 'text-danger-soft-foreground',
    },
  },
  defaultVariants: {
    severity: 'ok',
  },
})

interface BehaviorSignalStatProps extends VariantProps<typeof statVariants> {
  label: string
  value: number
  watchAt?: number
  riskAt?: number
}

function severityFor(value: number, watchAt: number, riskAt: number) {
  if (value >= riskAt) return 'risk' as const
  if (value >= watchAt) return 'watch' as const
  return 'ok' as const
}

export function BehaviorSignalStat({
  label,
  value,
  severity,
  watchAt,
  riskAt,
}: BehaviorSignalStatProps) {
  const resolved =
    severity ??
    (watchAt !== undefined && riskAt !== undefined ? severityFor(value, watchAt, riskAt) : 'ok')

  return (
    <div className={statVariants({ severity: resolved })}>
      <Stack gap={1}>
        <EyebrowLabel size="sm">{label}</EyebrowLabel>
        <span className={valueVariants({ severity: resolved })}>{value}</span>
      </Stack>
    </div>
  )
}
