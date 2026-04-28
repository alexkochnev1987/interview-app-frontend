'use client'

import Link from 'next/link'
import { Filter, Plus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { HeroGrid } from '@/components/layout/hero-grid'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'

interface QuestionsLibraryHeaderProps {
  loading: boolean
  totalCount: number
  visibleCount: number
}

export function QuestionsLibraryHeader({
  loading,
  totalCount,
  visibleCount,
}: QuestionsLibraryHeaderProps) {
  return (
    <HeroGrid
      primary={(
      <Card className="border-white/65 bg-white/88 shadow-float">
        <CardContent className="flex h-full flex-col gap-6 px-8 py-8">
          <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
            Question Library
          </EyebrowBadge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
              Curate the question bank before AI scoring ever sees a candidate.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Store reusable prompts, codify expected concepts and red flags,
              and keep your evaluation rubric visible instead of buried in JSON.
            </p>
          </div>
          <div>
            <Button asChild variant="gradient" className="h-14 px-8 text-base font-semibold">
              <Link href="/questions/new">
                <Plus className="size-5" />
                New Question
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      )}
      secondary={(
      <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
        <CardContent className="flex h-full flex-col gap-6 px-8 py-8">
          <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
            Overview
          </EyebrowBadge>
          <div className="space-y-3">
            <CardTitle className="text-2xl tracking-[-0.03em]">
              Library health
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              The new surface emphasizes utility metadata and evaluation depth
              rather than generic admin cards.
            </CardDescription>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricPanel
              tone="elevated"
              label="Total questions"
              value={loading ? '...' : totalCount}
            />
            <MetricPanel
              tone="elevated"
              label="Visible now"
              value={loading ? '...' : visibleCount}
            />
          </div>
        </CardContent>
      </Card>
      )}
    />
  )
}
