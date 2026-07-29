'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { cn } from '@/lib/utils'

type BrandMarkProps = {
  className?: string
  href?: string
}

export function BrandMark({ className, href = '/' }: BrandMarkProps) {
  const tCommon = useTranslations('common')

  return (
    <UnstyledLink href={href}>
      <Inline gap={2} align="center" wrap="nowrap">
        <IconBadge tone="gradient" size="sm">
          <Icon size="md">
            <Sparkles />
          </Icon>
        </IconBadge>
        <Stack gap={0} className={cn('min-w-0', className)}>
          <EyebrowLabel size="sm" className="truncate">
            {tCommon('brandEyebrow')}
          </EyebrowLabel>
          <BodyText as="span" size="sm" weight="semibold" tone="foreground" className="truncate">
            {tCommon('appName')}
          </BodyText>
        </Stack>
      </Inline>
    </UnstyledLink>
  )
}
