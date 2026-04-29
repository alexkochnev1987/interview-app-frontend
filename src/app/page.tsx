'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDashed,
  Clock3,
  Layers3,
  Sparkles,
  Users,
} from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { EyebrowLabel } from '@/components/app/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
import { IconBadge } from '@/components/app/icon-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { PageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchInterviews, type Interview } from '@/lib/api'
import {
  formatInterviewDate,
  formatInterviewStatusLabel,
  getCandidateInitials,
} from '@/lib/interview-formatters'

function mockQuestion(
  id: string,
  questionText: string,
  expectedConceptLabels: string[],
  redFlagLabels: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  weight: number
) {
  return {
    id,
    role: 'frontend intern',
    focus: 'fundamentals',
    outputLanguage: 'English',
    category: 'soft_skills',
    subcategory: 'fundamentals',
    questionText,
    followUpQuestions: [],
    expectedConcepts: expectedConceptLabels.map((label, index) => ({
      id: `${id}_concept_${index + 1}`,
      label,
      weight: Number((1 / expectedConceptLabels.length).toFixed(4)),
      description: `${label} should be covered in the answer.`,
    })),
    redFlags: redFlagLabels.map((label, index) => ({
      id: `${id}_flag_${index + 1}`,
      label,
      severity: 'medium' as const,
    })),
    difficulty,
    weight,
    sampleGoodAnswer: '',
    minimumPassScore: difficulty === 'hard' ? 3.5 : difficulty === 'medium' ? 3 : 2.5,
    tags: [],
    metadata: {},
  }
}

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'mock-11',
    candidateName: 'Alice Johnson',
    position: 'Senior Frontend Engineer',
    questions: [
      mockQuestion(
        'mock-1-q1',
        'Tell me about yourself',
        ['relevant experience', 'clear structure'],
        ['too generic'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-1-q2',
        'Describe a challenging project',
        ['ownership', 'trade-offs', 'result'],
        ['no measurable outcome'],
        'medium',
        2,
      ),
    ],
    answers: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    candidateName: 'Bob Smith',
    position: 'Backend Developer',
    questions: [
      mockQuestion(
        'mock-2-q1',
        'Why this role?',
        ['motivation', 'role alignment'],
        ['generic motivation'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-2-q2',
        'System design experience?',
        ['scalability', 'trade-offs'],
        ['no constraints discussion'],
        'hard',
        3,
      ),
    ],
    answers: [
      {
        questionIndex: 0,
        questionId: 'mock-2-q1',
        status: 'submitted',
        mediaKey: 's3://mock-camera',
        screenMediaKey: 's3://mock-screen',
        uploadedAt: new Date().toISOString(),
      },
    ],
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    candidateName: 'Carol Lee',
    position: 'Full Stack Engineer',
    questions: [
      mockQuestion(
        'mock-3-q1',
        'Strengths?',
        ['self-awareness', 'evidence'],
        ['buzzwords only'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-3-q2',
        'Weaknesses?',
        ['reflection', 'improvement plan'],
        ['fake weakness'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-3-q3',
        'Where do you see yourself in 5 years?',
        ['career direction', 'role fit'],
        ['no alignment with role'],
        'easy',
        1,
      ),
    ],
    answers: [],
    status: 'completed',
    result: {
      overallScore: 82,
      summary: 'Strong candidate with good communication skills.',
      categoryScores: { technical: 85, communication: 80, problemSolving: 81 },
      completedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchInterviews()
        if (!cancelled) {
          setInterviews(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setInterviews(MOCK_INTERVIEWS)
          setUsingMock(true)
          setError(err instanceof Error ? err.message : 'API unavailable')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeCount = interviews.filter((interview) =>
    ['pending', 'in_progress', 'processing'].includes(interview.status),
  ).length
  const completedCount = interviews.filter((interview) => interview.status === 'completed').length
  const questionVolume = interviews.reduce((sum, interview) => sum + interview.questions.length, 0)

  return (
    <PageShell>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card variant="floating" size="lg" effects="blur-strong">
          <CardContent layout="fill-column" spacing="2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-4">
                <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
                  Recruiter Dashboard
                </EyebrowBadge>
                <div className="space-y-3">
                  <HeroTitle width="prose">
                    Run your interview pipeline from one editorial command surface.
                  </HeroTitle>
                  <HeroLead width="prose">
                    Monitor active sessions, spot stalled candidates, and keep scoring flows moving
                    without dropping into separate admin tools.
                  </HeroLead>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="gradient">
                  <Link href="/interviews/new">
                    New Interview
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline-pill" shape="pill" effects="blur">
                  <Link href="/questions">Question Bank</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricPanel
                icon={<CircleDashed className="size-4" />}
                label="Active"
                value={activeCount}
                description="Interviews currently waiting on answers, uploads, or scoring."
              />
              <MetricPanel
                icon={<Users className="size-4" />}
                label="Candidates"
                value={interviews.length}
                description="Total candidate records visible in the current workspace."
              />
              <MetricPanel
                icon={<Layers3 className="size-4" />}
                label="Question Load"
                value={questionVolume}
                description="Questions currently attached across all visible interviews."
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader spacing="sm">
            <EyebrowBadge icon={<BriefcaseBusiness className="size-3.5" />} tone="muted">
              Snapshot
            </EyebrowBadge>
            <CardTitle size="lg">Today&apos;s pipeline</CardTitle>
            <CardDescription className="max-w-sm">
              The redesigned shell uses tonal layers instead of hard separators, so activity stays
              readable even when the data density grows.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="lg">
            <MetricPanel
              tone="elevated"
              labelVariant="raw"
              label={
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Completed interviews
                  </span>
                  <StatusPill tone="completed">{completedCount}</StatusPill>
                </div>
              }
              description="Finished sessions with scorecards ready for review and handoff."
            />
            <MetricPanel
              tone="elevated"
              labelVariant="raw"
              label={
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Last sync
                  </span>
                  <StatusPill tone="neutral">
                    <Clock3 className="size-3" />
                    {loading ? 'Loading' : 'Live'}
                  </StatusPill>
                </div>
              }
              description={
                loading
                  ? 'Waiting for the interview feed.'
                  : `Updated against ${usingMock ? 'fallback demo data' : 'the live backend'} just now.`
              }
            />
          </CardContent>
        </Card>
      </section>

      {usingMock && (
        <Alert variant="warning">
          <Sparkles className="size-4" />
          <AlertTitle>Demo data enabled</AlertTitle>
          <AlertDescription>
            {error ?? 'The API did not respond, so the dashboard is showing fallback interviews.'}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <LoadingStateCard label="Loading interviews..." />
      ) : interviews.length === 0 ? (
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
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <EyebrowLabel size="lg">Active records</EyebrowLabel>
              <h2 className="text-2xl font-semibold tracking-display text-foreground">
                Recent interviews
              </h2>
            </div>
            <Button asChild variant="outline-pill" shape="pill" effects="blur">
              <Link href="/questions/new">Create a new question</Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="group">
                <Link
                  href={`/interviews/${interview.id}`}
                  className="no-underline"
                >
                <Card
                  variant="surface"
                  height="full"
                  interaction="hover"
                >
                  <CardHeader spacing="md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <IconBadge tone="primary" size="md" textSize="sm">
                          {getCandidateInitials(interview.candidateName)}
                        </IconBadge>
                        <div>
                          <CardTitle size="list">
                            {interview.candidateName}
                          </CardTitle>
                          <CardDescription>{interview.position}</CardDescription>
                        </div>
                      </div>
                      <StatusPill tone={interview.status}>
                        {formatInterviewStatusLabel(interview.status)}
                      </StatusPill>
                    </div>
                  </CardHeader>
                  <CardContent spacing="md">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <MetricPanel
                        tone="elevated"
                        label="Questions"
                        value={interview.questions.length}
                        valueSize="md"
                      />
                      <MetricPanel
                        tone="elevated"
                        label="Uploaded"
                        value={interview.answers.filter((answer) => answer.status === 'submitted').length}
                        valueSize="md"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Updated {formatInterviewDate(interview.updatedAt)}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground transition-transform group-hover:translate-x-0.5">
                        Open
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
