import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { IconBox } from '@/components/ui/icon-box'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceCard } from '@/components/ui/surface-card'
import { Text } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'

interface PracticeCompleteScreenProps {
  candidateName: string
}

export function PracticeCompleteScreen({ candidateName }: PracticeCompleteScreenProps) {
  const tPractice = useTranslations('practice')
  return (
    <SurfaceCard tone="glassFloat" size="lg">
      <CardContent layout="stack-center" spacing="xl">
        <Stack gap={6} align="center" width="full">
          <IconBox centered>
            <CheckCircle2 size={32} />
          </IconBox>
          <Stack gap={3} align="center">
            <Heading variant="heroTitle">{tPractice('complete.title', { candidateName })}</Heading>
            <Text variant="heroDescription">{tPractice('complete.description')}</Text>
          </Stack>
          <Button asChild variant="gradient" size="lg">
            <UnstyledLink href={routes.portal.home}>{tPractice('complete.homeCta')}</UnstyledLink>
          </Button>
        </Stack>
      </CardContent>
    </SurfaceCard>
  )
}
