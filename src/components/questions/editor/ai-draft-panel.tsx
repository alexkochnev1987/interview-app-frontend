'use client'

import { WandSparkles } from 'lucide-react'

import { StatusPill } from '@/components/app/status-pill'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AiDraftPanelProps {
  hasPendingDraft: boolean
  pendingCount: number
  loading: boolean
  disabled: boolean
  onGenerate: () => void
  onApplyAll: () => void
}

export function AiDraftPanel({
  hasPendingDraft,
  pendingCount,
  loading,
  disabled,
  onGenerate,
  onApplyAll,
}: AiDraftPanelProps) {
  return (
    <Card variant="surface">
      <CardHeader spacing="lg">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <CardTitle size="lg">AI draft</CardTitle>
            {hasPendingDraft ? (
              <StatusPill tone="neutral">{pendingCount} pending</StatusPill>
            ) : null}
          </div>
          <CardDescription>
            Let AI propose category, follow-up probes, expected concepts, red flags,
            and tags based on your question text. Each change shows up as a
            reviewable diff before anything is applied.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
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
        </div>
      </CardHeader>
    </Card>
  )
}
