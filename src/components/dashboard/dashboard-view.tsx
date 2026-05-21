import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDashed,
  Clock3,
  ListChecks,
  Sparkles,
  Users,
} from 'lucide-react'

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
import type { Interview } from '@/lib/api'
import {
  formatInterviewDate,
  formatInterviewStatusLabel,
  getCandidateInitials,
} from '@/lib/interview-formatters'

type DashboardViewProps = {
  interviews: Interview[]
  demoMode?: boolean
}

export function DashboardView({ interviews, demoMode = false }: DashboardViewProps) {
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
            <AlertTitle>Demo mode</AlertTitle>
            <AlertDescription>
              Sample interviews only — no live backend.{' '}
              <Link href="/login">Sign in</Link> for your workspace dashboard.
            </AlertDescription>
          </Alert>
        ) : null}

        <Grid as="section" columns="split-13-7" gap={6}>
          <Card variant="floating" size="lg" effects="blur-strong">
            <CardContent layout="fill-column" spacing="2xl">
              <Inline gap={4} align="start" justify="between" wrap="wrap">
                <Stack gap={4} width="lg">
                  <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
                    Recruiter Dashboard
                  </EyebrowBadge>
                  <Stack gap={3}>
                    <HeroTitle width="prose">
                      Run your interview pipeline from one editorial command surface.
                    </HeroTitle>
                    <HeroLead width="prose">
                      Monitor active sessions, spot stalled candidates, and keep scoring flows moving
                      without dropping into separate admin tools.
                    </HeroLead>
                  </Stack>
                </Stack>

                <Inline gap={3} wrap="wrap">
                  <Button asChild variant="gradient">
                    <Link href="/interviews/new">
                      New Interview
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline-pill" shape="pill" effects="blur">
                    <Link href="/questions">Question Bank</Link>
                  </Button>
                </Inline>
              </Inline>

              <Grid columns="metrics-3" gap={4}>
                <MetricPanel
                  icon={<CircleDashed />}
                  label="Active"
                  value={activeCount}
                  description="Interviews currently waiting on answers, uploads, or scoring."
                />
                <MetricPanel
                  icon={<Users />}
                  label="Candidates"
                  value={interviews.length}
                  description="Total candidate records visible in the current workspace."
                />
                <MetricPanel
                  icon={<ListChecks />}
                  label="Question Load"
                  value={questionVolume}
                  description="Questions currently attached across all visible interviews."
                />
              </Grid>
            </CardContent>
          </Card>

          <Card variant="tinted">
            <CardHeader spacing="sm">
              <EyebrowBadge icon={<BriefcaseBusiness className="size-3.5" />} tone="muted">
                Snapshot
              </EyebrowBadge>
              <CardTitle size="lg">Today&apos;s pipeline</CardTitle>
              <CardDescription width="sm">
                The redesigned shell uses tonal layers instead of hard separators, so activity stays
                readable even when the data density grows.
              </CardDescription>
            </CardHeader>
            <CardContent spacing="lg">
              <MetricPanel
                tone="elevated"
                labelVariant="raw"
                label={
                  <Inline gap={3} align="center" justify="between">
                    <BodyText as="span" size="sm-tight" tone="foreground">
                      Completed interviews
                    </BodyText>
                    <StatusPill tone="completed">{completedCount}</StatusPill>
                  </Inline>
                }
                description="Finished sessions with scorecards ready for review and handoff."
              />
              <MetricPanel
                tone="elevated"
                labelVariant="raw"
                label={
                  <Inline gap={3} align="center" justify="between">
                    <BodyText as="span" size="sm-tight" tone="foreground">
                      Last sync
                    </BodyText>
                    <StatusPill tone="neutral">
                      <Clock3 className="size-3" />
                      {demoMode ? 'Demo' : 'Live'}
                    </StatusPill>
                  </Inline>
                }
                description={
                  demoMode
                    ? 'Showing sample interviews for demonstration.'
                    : 'Updated against the live backend just now.'
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {interviews.length === 0 ? (
          <EmptyStateCard
            icon={<Users className="size-5" />}
            title="No interviews yet"
            description="Start with a candidate, attach questions from the bank, and this dashboard becomes your operating surface."
            action={
              <Button asChild variant="gradient">
                <Link href="/interviews/new">Create your first interview</Link>
              </Button>
            }
          />
        ) : (
          <Section gap={4}>
            <Inline gap={4} align="end" justify="between" wrap="wrap">
              <Stack gap={2}>
                <EyebrowLabel size="lg">Active records</EyebrowLabel>
                <SectionHeading>Recent interviews</SectionHeading>
              </Stack>
              <Button asChild variant="outline-pill" shape="pill" effects="blur">
                <Link href="/questions/new">Create a new question</Link>
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
                            {formatInterviewStatusLabel(interview.status)}
                          </StatusPill>
                        </Inline>
                      </CardHeader>
                      <CardContent spacing="md">
                        <Grid columns={2} gap={3}>
                          <MetricPanel
                            tone="elevated"
                            label="Questions"
                            value={interview.questions.length}
                            valueSize="md"
                          />
                          <MetricPanel
                            tone="elevated"
                            label="Uploaded"
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
                            Updated {formatInterviewDate(interview.updatedAt)}
                          </BodyText>
                          <HoverCue>
                            Open
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
