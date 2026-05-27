'use client'

import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/code-block'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { type QuestionInput } from '@/lib/api'
import { previewValue, type DraftFieldKey } from '@/lib/question-editor/parsers'

interface AiSuggestionRowProps {
  value: QuestionInput[DraftFieldKey]
  onApply: () => void
  onKeep: () => void
}

export function AiSuggestionRow({ value, onApply, onKeep }: AiSuggestionRowProps) {
  return (
    <SurfaceTile
      tone="primary-soft"
      rounded="xl"
      padding="sm"
      onDismiss={onKeep}
      dismissLabel="Dismiss AI suggestion"
    >
      <Stack gap={2}>
        <CodeBlock size="sm" inset="dismiss-affordance">
          {previewValue(value)}
        </CodeBlock>
        <Inline gap={1} align="center" justify="end">
          <Button
            type="button"
            size="xs"
            variant="gradient"
            shape="pill"
            onClick={onApply}
          >
            Use AI
          </Button>
        </Inline>
      </Stack>
    </SurfaceTile>
  )
}
