'use client'

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
    <div className="mt-3 rounded-xl-2 bg-[hsl(var(--primary-fixed)/0.55)] p-4 ring-1 ring-[hsl(var(--primary)/0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
          AI suggestion
        </div>
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
    </div>
  )
}
