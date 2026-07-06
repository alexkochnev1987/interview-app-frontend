import { cva, type VariantProps } from 'class-variance-authority'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const nameVariants = cva('truncate leading-none', {
  variants: {
    nameMaxWidth: {
      none: '',
      sm: 'max-w-[100px]',
      md: 'max-w-[140px]',
      lg: 'max-w-[200px]',
    },
  },
  defaultVariants: {
    nameMaxWidth: 'md',
  },
})

const dotSeparatorVariants = cva('text-xs leading-none text-muted-foreground')

function DotSeparator() {
  return (
    <span aria-hidden="true" className={dotSeparatorVariants()}>
      ·
    </span>
  )
}

interface IdentityBadgeProps extends VariantProps<typeof nameVariants> {
  name: string
  role: string
}

export function IdentityBadge({ name, role, nameMaxWidth }: IdentityBadgeProps) {
  return (
    <Inline gap={2} align="baseline" justify="end" wrap="nowrap">
      <BodyText
        as="span"
        size="xs"
        weight="medium"
        tone="foreground"
        className={cn(nameVariants({ nameMaxWidth }))}
      >
        {name}
      </BodyText>
      <DotSeparator />
      <EyebrowLabel size="sm" weight="normal" className="leading-none">
        {role}
      </EyebrowLabel>
    </Inline>
  )
}
