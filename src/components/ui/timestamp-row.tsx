import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface TimestampRowItem {
  label: string
  value: string | null | undefined
}

interface TimestampRowProps {
  items: TimestampRowItem[]
  fallbackLabel?: string
}

export function TimestampRow({
  items,
  fallbackLabel = '—',
}: TimestampRowProps) {
  return (
    <Inline gap={6} wrap="wrap">
      {items.map(({ label, value }) => (
        <Stack key={label} gap={1}>
          <EyebrowLabel size="sm">{label}</EyebrowLabel>
          <BodyText size="sm" tone="foreground">
            {value ?? fallbackLabel}
          </BodyText>
        </Stack>
      ))}
    </Inline>
  )
}
