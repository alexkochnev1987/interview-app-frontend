import { EyebrowLabel } from '@/components/app/eyebrow-label'
import { SurfaceTile } from '@/components/app/surface-tile'

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
    <SurfaceTile rounded="xl" className="min-h-[130px]">
      <EyebrowLabel>Live transcript</EyebrowLabel>
      {!isSupported ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Live transcript is unavailable in this browser. Recording continues as usual.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-foreground">
          {finalTranscript || interimTranscript ? (
            <>
              {finalTranscript}
              {interimTranscript ? (
                <span className="ml-1 italic text-muted-foreground">
                  {interimTranscript} (draft)
                </span>
              ) : null}
            </>
          ) : (
            'Transcript will appear while you speak...'
          )}
        </p>
      )}
      {stage === 'transition' ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Updating transcript for the next question...
        </p>
      ) : null}
      {warning ? <p className="mt-2 text-xs leading-5 text-warning-soft-foreground">{warning}</p> : null}
    </SurfaceTile>
  )
}
