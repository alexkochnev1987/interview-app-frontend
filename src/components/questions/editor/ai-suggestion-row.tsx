'use client'

import { EyebrowLabel } from '@/components/app/eyebrow-label'
import { SurfaceTile } from '@/components/app/surface-tile'
import { Button } from '@/components/ui/button'
import { type QuestionInput } from '@/lib/api'
import { previewValue, type DraftFieldKey } from '@/lib/question-editor/parsers'

interface AiSuggestionRowProps {
  value: QuestionInput[DraftFieldKey]
  onApply: () => void
  onKeep: () => void
}

export function AiSuggestionRow({
  value,
  onApply,
  onKeep,
}: AiSuggestionRowProps) {
  return (
    <SurfaceTile tone="primary-soft" rounded="xl" padding="md" className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <EyebrowLabel tone="primary">AI suggestion</EyebrowLabel>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="gradient" onClick={onApply}>
            Use AI value
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline-pill"
            shape="pill"
            onClick={onKeep}
          >
            Keep current
          </Button>
        </div>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-foreground">
        {previewValue(value)}
      </pre>
    </SurfaceTile>
  )
}
