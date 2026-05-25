import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

export function LoginMarketingPanel() {
  return (
    <Stack as="section" gap={6}>
      <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
        Conductor AI
      </EyebrowBadge>

      <Stack gap={4}>
        <HeroTitle size="xl" width="prose">
          Review candidate performance with the calm of an editorial workspace.
        </HeroTitle>
        <HeroLead width="prose">
          The new design system trades brittle admin chrome for layered surfaces, sharper
          hierarchy, and faster decision-making during interview review.
        </HeroLead>
      </Stack>

      <Grid columns="metrics-3" gap={4}>
        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <ShieldCheck className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                Protected access
              </SectionHeading>
              <BodyText size="sm">
                Session-based auth for recruiter-only workflows.
              </BodyText>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <LockKeyhole className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                Unified shell
              </SectionHeading>
              <BodyText size="sm">
                Shared tokens across dashboard, library, and interview flows.
              </BodyText>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <ArrowRight className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                Fast triage
              </SectionHeading>
              <BodyText size="sm">
                Move from sign-in straight into active interviews and scorecards.
              </BodyText>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  )
}
