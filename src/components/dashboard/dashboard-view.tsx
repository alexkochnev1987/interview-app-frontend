import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDashed,
  Clock3,
  ListChecks,
  Sparkles,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { HoverCue } from '@/components/ui/hover-cue'
import { HoverGroup } from '@/components/ui/hover-group'
import { IconBadge } from '@/components/ui/icon-badge'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyStateCard } from '@/components/ui/state-card'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useInterviewFormatters } from '@/i18n/use-interview-formatters'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { Interview } from '@/lib/api'
import {
  getCandidateInitials,
} from '@/lib/interview-formatters'

type DashboardViewProps = {
  interviews: Interview[]
  demoMode?: boolean
}

export function DashboardView({ interviews, demoMode = false }: DashboardViewProps) {
  const t = useTranslations('dashboard')
  const labels = useSharedLabels()
  const formatters = useInterviewFormatters()
  const activeCount = interviews.filter((interview) =>
    ['pending', 'in_progress', 'processing'].includes(interview.status),
  ).length
  const completedCount = interviews.filter(
    (interview) => interview.status === 'completed',
  ).length
  const questionVolume = interviews.reduce(
    (sum, interview) => sum + interview.questions.length,
    0,
  )

  return (
    <PageShell>
      <Stack gap={6}>
        {demoMode ? (
          <Alert variant="warning">
            <AlertTitle>{t('demoMode.title')}</AlertTitle>
            <AlertDescription>
              {t('demoMode.description')}{' '}
              <Link href="/login">{t('demoMode.signInAction')}</Link>{' '}
              {t('demoMode.signInSuffix')}
            </AlertDescription>
          </Alert>
        ) : null}

        <Grid as="section" columns="split-13-7" gap={6}>
          <Card variant="floating" size="lg" effects="blur-strong">
            <CardContent layout="fill-column" spacing="2xl">
              <Inline gap={4} align="start" justify="between" wrap="wrap">
                <Stack gap={4} width="lg">
                  <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
                    {t('hero.eyebrow')}
                  </EyebrowBadge>
                  <Stack gap={3}>
                    <HeroTitle width="prose">
                      {t('hero.title')}
                    </HeroTitle>
                    <HeroLead width="prose">
                      {t('hero.lead')}
                    </HeroLead>
                  </Stack>
                </Stack>

                <Inline gap={3} wrap="wrap">
                  <Button asChild variant="gradient">
                    <Link href="/interviews/new">
                      {t('hero.newInterview')}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline-pill" shape="pill" effects="blur">
                    <Link href={routes.questions.list}>{t('hero.questionBank')}</Link>
                  </Button>
                </Inline>
              </Inline>

              <Grid columns="metrics-3" gap={4}>
                <MetricPanel
                  icon={<CircleDashed />}
                  label={t('metrics.active.label')}
                  value={activeCount}
                  description={t('metrics.active.description')}
                />
                <MetricPanel
                  icon={<Users />}
                  label={t('metrics.candidates.label')}
                  value={interviews.length}
                  description={t('metrics.candidates.description')}
                />
                <MetricPanel
                  icon={<ListChecks />}
                  label={t('metrics.questionLoad.label')}
                  value={questionVolume}
                  description={t('metrics.questionLoad.description')}
                />
              </Grid>
            </CardContent>
          </Card>

          <Card variant="tinted">
            <CardHeader spacing="sm">
              <EyebrowBadge icon={<BriefcaseBusiness className="size-3.5" />} tone="muted">
                {t('snapshot.eyebrow')}
              </EyebrowBadge>
              <CardTitle size="lg">{t('snapshot.title')}</CardTitle>
              <CardDescription width="sm">
                {t('snapshot.description')}
              </CardDescription>
            </CardHeader>
            <CardContent spacing="lg">
              <MetricPanel
                tone="elevated"
                labelVariant="raw"
                label={
                  <Inline gap={3} align="center" justify="between">
                    <BodyText as="span" size="sm-tight" tone="foreground">
                      {t('metrics.completed.label')}
                    </BodyText>
                    <StatusPill tone="completed">{completedCount}</StatusPill>
                  </Inline>
                }
                description={t('metrics.completed.description')}
              />
              <MetricPanel
                tone="elevated"
                labelVariant="raw"
                label={
                  <Inline gap={3} align="center" justify="between">
                    <BodyText as="span" size="sm-tight" tone="foreground">
                      {t('metrics.lastSync.label')}
                    </BodyText>
                    <StatusPill tone="neutral">
                      <Clock3 className="size-3" />
                      {demoMode ? t('metrics.lastSync.demo') : t('metrics.lastSync.live')}
                    </StatusPill>
                  </Inline>
                }
                description={
                  demoMode
                    ? t('metrics.lastSync.demoDescription')
                    : t('metrics.lastSync.liveDescription')
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {interviews.length === 0 ? (
          <EmptyStateCard
            icon={<Users className="size-5" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button asChild variant="gradient">
                <Link href="/interviews/new">{t('empty.action')}</Link>
              </Button>
            }
          />
        ) : (
          <Section gap={4}>
            <Inline gap={4} align="end" justify="between" wrap="wrap">
              <Stack gap={2}>
                <EyebrowLabel size="lg">{t('recent.eyebrow')}</EyebrowLabel>
                <SectionHeading>{t('recent.title')}</SectionHeading>
              </Stack>
              <Button asChild variant="outline-pill" shape="pill" effects="blur">
                <Link href={routes.questions.new}>{t('recent.createQuestion')}</Link>
              </Button>
            </Inline>

            <Grid columns="cards-2-3" gap={4}>
              {interviews.map((interview) => (
                <HoverGroup key={interview.id}>
                  <UnstyledLink href={`/interviews/${interview.id}`}>
                    <Card variant="surface" height="full" interaction="hover">
                      <CardHeader spacing="md">
                        <Inline gap={4} align="start" justify="between">
                          <Inline gap={3} align="center">
                            <IconBadge tone="primary" size="md" textSize="sm">
                              {getCandidateInitials(interview.candidateName)}
                            </IconBadge>
                            <Stack gap={0}>
                              <CardTitle size="list">{interview.candidateName}</CardTitle>
                              <CardDescription>{interview.position}</CardDescription>
                            </Stack>
                          </Inline>
                          <StatusPill tone={interview.status}>
                            {labels.interviewStatus(interview.status)}
                          </StatusPill>
                        </Inline>
                      </CardHeader>
                      <CardContent spacing="md">
                        <Grid columns={2} gap={3}>
                          <MetricPanel
                            tone="elevated"
                            label={t('recent.questions')}
                            value={interview.questions.length}
                            valueSize="md"
                          />
                          <MetricPanel
                            tone="elevated"
                            label={t('recent.uploaded')}
                            value={
                              interview.answers.filter(
                                (answer) => answer.status === 'submitted',
                              ).length
                            }
                            valueSize="md"
                          />
                        </Grid>

                        <Inline gap={3} align="center" justify="between">
                          <BodyText as="span" size="sm">
                            {formatters.updated(interview.updatedAt)}
                          </BodyText>
                          <HoverCue>
                            {t('recent.open')}
                            <ArrowRight className="size-4" />
                          </HoverCue>
                        </Inline>
                      </CardContent>
                    </Card>
                  </UnstyledLink>
                </HoverGroup>
              ))}
            </Grid>
          </Section>
        )}
      </Stack>
    </PageShell>
  )
}
