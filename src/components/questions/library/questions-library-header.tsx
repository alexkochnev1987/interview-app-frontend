'use client'

import Link from 'next/link'
import { Filter, Plus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
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
      <Card variant="floating" size="lg">
        <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
            Question Library
          </EyebrowBadge>
          <div className="space-y-3">
            <HeroTitle>
              Curate the question bank before AI scoring ever sees a candidate.
            </HeroTitle>
            <HeroLead width="prose">
              Store reusable prompts, codify expected concepts and red flags,
              and keep your evaluation rubric visible instead of buried in JSON.
            </HeroLead>
          </div>
          <div>
            <Button asChild variant="gradient" size="hero">
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
      <Card variant="tinted" size="lg">
        <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
            Overview
          </EyebrowBadge>
          <div className="space-y-3">
            <CardTitle size="lg">
              Library health
            </CardTitle>
            <CardDescription>
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
