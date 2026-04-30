import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'

type TakeStage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete'

interface LiveTranscriptPanelProps {
  isSupported: boolean
  finalTranscript: string
  interimTranscript: string
  warning?: string
  stage: TakeStage
}

export function LiveTranscriptPanel({
  isSupported,
  finalTranscript,
  interimTranscript,
  warning,
  stage,
}: LiveTranscriptPanelProps) {
  return (
    <SurfaceTile rounded="xl" minHeight="transcript">
      <Stack gap={2}>
        <EyebrowLabel>Live transcript</EyebrowLabel>
        {!isSupported ? (
          <BodyText size="sm">
            Live transcript is unavailable in this browser. Recording continues as usual.
          </BodyText>
        ) : (
          <BodyText size="sm" tone="foreground">
            {finalTranscript || interimTranscript ? (
              <>
                {finalTranscript}
                {interimTranscript ? (
                  <BodyText as="span" size="sm" tone="muted">
                    <em> {interimTranscript} (draft)</em>
                  </BodyText>
                ) : null}
              </>
            ) : (
              'Transcript will appear while you speak...'
            )}
          </BodyText>
        )}
        {stage === 'transition' ? (
          <BodyText size="xs">Updating transcript for the next question...</BodyText>
        ) : null}
        {warning ? (
          <BodyText size="xs" tone="warning">
            {warning}
          </BodyText>
        ) : null}
      </Stack>
    </SurfaceTile>
  )
}
