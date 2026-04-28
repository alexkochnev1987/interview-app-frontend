'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, LoaderCircle, PenSquare } from 'lucide-react'

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
      <Card className="border-white/65 bg-white/88 shadow-float">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-5 px-8 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-[1.6rem] bg-[hsl(var(--surface-low)/0.95)] text-[hsl(var(--primary))] ring-1 ring-border/45">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Loading question
            </h1>
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
      <Card className="border-white/65 bg-white/88 shadow-float">
        <CardHeader className="space-y-4">
          <div className="flex size-14 items-center justify-center rounded-[1.6rem] bg-danger-soft text-destructive ring-1 ring-danger-soft-border">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-[-0.04em]">
              Question unavailable
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              The editor could not load this question, so the route stops here
              instead of rendering a partially broken form.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
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
            <Button asChild variant="outline" className="rounded-full bg-white/80">
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
