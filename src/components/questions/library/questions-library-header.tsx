'use client'

import Link from 'next/link'
import { Filter, Plus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { MetricPanel } from '@/components/ui/metric-panel'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { HeroGrid } from '@/components/ui/layout/hero-grid'
import { Stack } from '@/components/ui/layout/stack'

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
      primary={
        <Card variant="floating" size="lg">
          <CardContent layout="fill-column" spacing="xl">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Question Library
            </EyebrowBadge>
            <Stack gap={3}>
              <HeroTitle>
                Curate the question bank before AI scoring ever sees a candidate.
              </HeroTitle>
              <HeroLead width="prose">
                Store reusable prompts, codify expected concepts and red flags,
                and keep your evaluation rubric visible instead of buried in JSON.
              </HeroLead>
            </Stack>
            <Stack>
              <Button asChild variant="gradient" size="hero">
                <Link href="/questions/new">
                  <Plus className="size-5" />
                  New Question
                </Link>
              </Button>
            </Stack>
          </CardContent>
        </Card>
      }
      secondary={
        <Card variant="tinted" size="lg">
          <CardContent layout="fill-column" spacing="xl">
            <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
              Overview
            </EyebrowBadge>
            <Stack gap={3}>
              <CardTitle size="lg">Library health</CardTitle>
              <CardDescription>
                The new surface emphasizes utility metadata and evaluation depth
                rather than generic admin cards.
              </CardDescription>
            </Stack>
            <Grid columns="metrics-2-md" gap={4}>
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
            </Grid>
          </CardContent>
        </Card>
      }
    />
  )
}
