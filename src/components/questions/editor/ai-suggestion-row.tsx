'use client'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
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

export function AiSuggestionRow({
  value,
  onApply,
  onKeep,
}: AiSuggestionRowProps) {
  return (
    <SurfaceTile tone="primary-soft" rounded="xl" padding="md">
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between" wrap="wrap">
          <EyebrowLabel tone="primary">AI suggestion</EyebrowLabel>
          <Inline gap={2} wrap="wrap">
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
          </Inline>
        </Inline>
        <CodeBlock>{previewValue(value)}</CodeBlock>
      </Stack>
    </SurfaceTile>
  )
}
