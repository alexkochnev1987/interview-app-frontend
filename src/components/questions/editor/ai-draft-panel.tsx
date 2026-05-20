'use client'

import { WandSparkles } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface AiDraftPanelProps {
  hasPendingDraft: boolean
  pendingCount: number
  loading: boolean
  disabled: boolean
  error?: string
  onGenerate: () => void
  onApplyAll: () => void
}

export function AiDraftPanel({
  hasPendingDraft,
  pendingCount,
  loading,
  disabled,
  error,
  onGenerate,
  onApplyAll,
}: AiDraftPanelProps) {
  return (
    <Card variant="surface">
      <CardHeader spacing="lg">
        <Stack gap={1.5}>
          <Inline gap={3} align="start" justify="between">
            <CardTitle size="lg">AI draft</CardTitle>
            {hasPendingDraft ? (
              <StatusPill tone="neutral">{pendingCount} pending</StatusPill>
            ) : null}
          </Inline>
          <CardDescription>
            Let AI propose category, follow-up probes, expected concepts, red flags,
            and tags based on your question text. Each change shows up as a
            reviewable diff before anything is applied.
          </CardDescription>
        </Stack>

        <Stack gap={2}>
          {error ? (
            <BodyText role="alert" size="sm" tone="danger">
              {error}
            </BodyText>
          ) : null}
          <Inline gap={2} align="center" justify="end" wrap="wrap">
            {hasPendingDraft ? (
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                onClick={onApplyAll}
              >
                Apply all
              </Button>
            ) : null}
            <Button
              type="button"
              variant="gradient"
              onClick={onGenerate}
              disabled={disabled || loading}
            >
              <WandSparkles className="size-4" />
              {loading ? 'Generating...' : 'Generate AI Draft'}
            </Button>
          </Inline>
        </Stack>
      </CardHeader>
    </Card>
  )
}
