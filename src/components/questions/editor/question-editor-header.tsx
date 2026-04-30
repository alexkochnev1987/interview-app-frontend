'use client'

import { Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { Card, CardContent } from '@/components/ui/card'
import { type QuestionInput } from '@/lib/api'

interface QuestionEditorHeaderProps {
  title: string
  difficulty: QuestionInput['difficulty']
  weight: number
  pendingDraftCount: number
}

export function QuestionEditorHeader({
  title,
  difficulty,
  weight,
  pendingDraftCount,
}: QuestionEditorHeaderProps) {
  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="xl">
        <div className="space-y-4">
          <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
            Unified Question Editor
          </EyebrowBadge>
          <div className="space-y-3">
            <HeroTitle>{title}</HeroTitle>
            <HeroLead width="prose">
              Shape the prompt, define the rubric, and keep AI-generated draft
              suggestions visible as explicit diffs instead of invisible background
              mutations.
            </HeroLead>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricPanel
            label="Difficulty"
            value={<StatusPill tone={difficulty}>{difficulty}</StatusPill>}
            valueSize="raw"
            valueTone="none"
          />
          <MetricPanel label="Weight" value={weight} />
          <MetricPanel label="Pending AI diffs" value={pendingDraftCount} />
        </div>
      </CardContent>
    </Card>
  )
}
