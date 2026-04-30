'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, LoaderCircle, PenSquare } from 'lucide-react'

import { HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function QuestionLoadingCard() {
  return (
    <main className="container py-10 md:py-12">
      <Card variant="floating" size="state">
        <CardContent layout="stack-center" spacing="lg">
          <IconBadge tone="surface" size="lg">
            <LoaderCircle className="size-5 animate-spin" />
          </IconBadge>
          <div className="space-y-2">
            <HeroTitle size="sm">Loading question</HeroTitle>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Pulling the saved prompt, rubric, and metadata into the unified editor.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

interface QuestionUnavailableCardProps {
  message: string
}

export function QuestionUnavailableCard({ message }: QuestionUnavailableCardProps) {
  return (
    <main className="container py-10 md:py-12">
      <Card variant="floating">
        <CardHeader spacing="md">
          <IconBadge tone="danger" size="lg">
            <AlertTriangle className="size-5" />
          </IconBadge>
          <div className="space-y-2">
            <CardTitle size="xl">
              Question unavailable
            </CardTitle>
            <CardDescription className="max-w-2xl">
              The editor could not load this question, so the route stops here
              instead of rendering a partially broken form.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent spacing="lg">
          <Alert variant="danger">
            <AlertTitle>Load failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-3">
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
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
