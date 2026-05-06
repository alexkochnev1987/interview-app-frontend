import { BodyText } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const baseClasses =
  'rounded-2xl bg-surface-low-soft p-5 ring-1 ring-hairline whitespace-pre-wrap'

interface TranscriptBlockProps {
  text: string | null | undefined
  emptyLabel?: string
  className?: string
}

export function TranscriptBlock({
  text,
  emptyLabel = 'Transcript is not available yet.',
  className,
}: TranscriptBlockProps) {
  if (!text) {
    return (
      <div className={cn(baseClasses, className)}>
        <BodyText size="sm" tone="muted" italic>
          {emptyLabel}
        </BodyText>
      </div>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      <BodyText size="sm" tone="foreground">
        {text}
      </BodyText>
    </div>
  )
}
