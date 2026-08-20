import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { IconBox } from '@/components/ui/icon-box'
import { Stack } from '@/components/ui/layout'
import { SurfaceCard } from '@/components/ui/surface-card'
import { Text } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'

interface TakeCompleteScreenProps {
  candidateName: string
  position: string
  showHomeLink?: boolean
}

export function TakeCompleteScreen({
  candidateName,
  position,
  showHomeLink = false,
}: TakeCompleteScreenProps) {
  const tTake = useTranslations('takeFlow')
  return (
    <SurfaceCard tone="glassFloat" size="lg">
      <CardContent layout="stack-center" spacing="xl">
        <Stack gap={6} align="center" width="full">
          <IconBox centered>
            <CheckCircle2 size={32} />
          </IconBox>
          <Stack gap={3} align="center">
            <Heading variant="heroTitle">{tTake('completeTitle', { candidateName })}</Heading>
            <Text variant="heroDescription">{tTake('completeDescription', { position })}</Text>
          </Stack>
          {showHomeLink ? (
            <Button asChild variant="gradient" size="lg">
              <UnstyledLink href={routes.portal.home}>{tTake('completeHomeCta')}</UnstyledLink>
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </SurfaceCard>
  )
}
