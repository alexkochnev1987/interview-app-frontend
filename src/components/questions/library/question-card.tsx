'use client'

import Link from 'next/link'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { type Question } from '@/lib/api'
import { truncateText } from '@/lib/text'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  selectable: boolean
  selected: boolean
  onToggleSelected: (id: string) => void
}

export function QuestionCard({
  question,
  selectable,
  selected,
  onToggleSelected,
}: QuestionCardProps) {
  return (
    <div className="group relative">
      {selectable && (
        <span
          className="absolute right-4 top-4 z-10 transition-transform duration-200 group-hover:-translate-y-1"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelected(question.id)}
            aria-label="Select question for bulk delete"
            className="size-5 bg-card"
          />
        </span>
      )}
      <Link href={`/questions/${question.id}`} className="no-underline">
        <Card
          variant={question.deleted ? 'danger-soft' : 'surface'}
          height="full"
          interaction="hover"
          state={
            question.deleted
              ? 'deleted'
              : selected && selectable
                ? 'selected'
                : 'default'
          }
        >
          <CardHeader spacing="md">
            <div
              className={cn(
                'flex flex-wrap items-center gap-2',
                selectable && 'pr-8',
              )}
            >
              {question.deleted ? (
                <StatusPill tone="failed">Deleted</StatusPill>
              ) : null}
              <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
              {question.category ? (
                <StatusPill tone="neutral" casing="chip">
                  {question.category}
                </StatusPill>
              ) : null}
            </div>
            <div className="space-y-2">
              <CardTitle size="list-clamp">
                {truncateText(question.questionText)}
              </CardTitle>
              <CardDescription>
                {question.role ? `${question.role} · ` : ''}
                weight {question.weight}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent spacing="md">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricPanel
                tone="compact"
                label="Concepts"
                value={question.expectedConcepts.length}
                valueSize="md"
              />
              <MetricPanel
                tone="compact"
                label="Red flags"
                value={question.redFlags.length}
                valueSize="md"
              />
            </div>

            <div className="space-y-3">
              <div>
                <EyebrowLabel>Expected concepts</EyebrowLabel>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {question.expectedConcepts.length > 0
                    ? question.expectedConcepts
                        .slice(0, 3)
                        .map((item) => item.label)
                        .join(', ')
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <EyebrowLabel>Red flag signals</EyebrowLabel>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {question.redFlags.length > 0
                    ? question.redFlags
                        .slice(0, 2)
                        .map((item) => item.label)
                        .join(', ')
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
