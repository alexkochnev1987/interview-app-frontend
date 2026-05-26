import { ClipboardList, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Link } from '@/i18n/navigation'

export function AssessmentsListHeader() {
  return (
    <Card variant="floating" size="lg">
      <CardContent layout="fill-column" spacing="xl">
        <EyebrowBadge icon={<Icon size="sm"><ClipboardList /></Icon>}>
          Assessments
        </EyebrowBadge>
        <Stack gap={3}>
          <HeroTitle>
            Review submitted interviews and AI evaluations.
          </HeroTitle>
          <HeroLead width="prose">
            Open a finished interview to see candidate answers, per-question
            scoring, behavior signals, and the overall result.
          </HeroLead>
        </Stack>
        <Inline>
          <Button asChild variant="gradient" size="hero">
            <Link href="/interviews/new">
              <Icon size="lg"><Plus /></Icon>
              New Interview
            </Link>
          </Button>
        </Inline>
      </CardContent>
    </Card>
  )
}
