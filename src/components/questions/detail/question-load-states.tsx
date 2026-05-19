'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, LoaderCircle, PenSquare } from 'lucide-react'

import { HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

export function QuestionLoadingCard() {
  return (
    <PageShell>
      <Card variant="floating" size="state">
        <CardContent layout="stack-center" spacing="lg">
          <IconBadge tone="surface" size="lg">
            <LoaderCircle className="size-5 animate-spin" />
          </IconBadge>
          <Stack gap={2}>
            <HeroTitle size="sm">Loading question</HeroTitle>
            <BodyText size="sm" width="lg">
              Pulling the saved prompt, rubric, and metadata into the unified editor.
            </BodyText>
          </Stack>
        </CardContent>
      </Card>
    </PageShell>
  )
}

interface QuestionUnavailableCardProps {
  message: string
}

export function QuestionUnavailableCard({ message }: QuestionUnavailableCardProps) {
  return (
    <PageShell>
      <Card variant="floating">
        <CardHeader spacing="md">
          <IconBadge tone="danger" size="lg">
            <AlertTriangle className="size-5" />
          </IconBadge>
          <Stack gap={2}>
            <CardTitle size="xl">
              {TOAST_MESSAGES.pageGate.questions.unavailableTitle}
            </CardTitle>
            <CardDescription width="lg">
              {TOAST_MESSAGES.pageGate.questions.loadFailedCardDescription}
            </CardDescription>
          </Stack>
        </CardHeader>
        <CardContent spacing="lg">
          <BodyText size="sm" tone="muted">
            {message}
          </BodyText>

          <Inline gap={3} wrap="wrap">
            <Button asChild variant="gradient">
              <Link href="/questions">
                <ArrowLeft className="size-4" />
                Back to Question Library
              </Link>
            </Button>
            <Button asChild variant="outline-pill" shape="pill">
              <Link href="/questions/new">
                <PenSquare className="size-4" />
                Create New Question
              </Link>
            </Button>
          </Inline>
        </CardContent>
      </Card>
    </PageShell>
  )
}
