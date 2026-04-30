'use client'

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
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { PillRow } from '@/components/ui/pill-row'
import { SelectableOverlay } from '@/components/ui/selectable-overlay'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { type Question } from '@/lib/api'
import { truncateText } from '@/lib/text'

interface QuestionCardProps {
  question: Question
  selectable: boolean
  selected: boolean
  onToggleSelected: (id: string) => void
}

function CardBody({
  question,
  selectable,
  selected,
}: Omit<QuestionCardProps, 'onToggleSelected'>) {
  return (
    <UnstyledLink href={`/questions/${question.id}`}>
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
          <PillRow reserveCorner={selectable}>
            {question.deleted ? <StatusPill tone="failed">Deleted</StatusPill> : null}
            <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
            {question.category ? (
              <StatusPill tone="neutral" casing="chip">
                {question.category}
              </StatusPill>
            ) : null}
          </PillRow>
          <Stack gap={2}>
            <CardTitle size="list-clamp">
              {truncateText(question.questionText)}
            </CardTitle>
            <CardDescription>
              {question.role ? `${question.role} · ` : ''}
              weight {question.weight}
            </CardDescription>
          </Stack>
        </CardHeader>
        <CardContent spacing="md">
          <Grid columns={2} gap={3}>
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
          </Grid>

          <Stack gap={3}>
            <Stack gap={2}>
              <EyebrowLabel>Expected concepts</EyebrowLabel>
              <BodyText size="sm">
                {question.expectedConcepts.length > 0
                  ? question.expectedConcepts
                      .slice(0, 3)
                      .map((item) => item.label)
                      .join(', ')
                  : 'Not specified'}
              </BodyText>
            </Stack>
            <Stack gap={2}>
              <EyebrowLabel>Red flag signals</EyebrowLabel>
              <BodyText size="sm">
                {question.redFlags.length > 0
                  ? question.redFlags
                      .slice(0, 2)
                      .map((item) => item.label)
                      .join(', ')
                  : 'Not specified'}
              </BodyText>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </UnstyledLink>
  )
}

export function QuestionCard({
  question,
  selectable,
  selected,
  onToggleSelected,
}: QuestionCardProps) {
  if (!selectable) {
    return <CardBody question={question} selectable={false} selected={false} />
  }
  return (
    <SelectableOverlay
      marker={
        <Checkbox
          size="md"
          surface="card"
          checked={selected}
          onCheckedChange={() => onToggleSelected(question.id)}
          aria-label="Select question for bulk delete"
        />
      }
    >
      <CardBody question={question} selectable selected={selected} />
    </SelectableOverlay>
  )
}
