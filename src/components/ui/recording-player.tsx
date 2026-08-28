'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { RecordingVideo } from '@/components/ui/recording-video'
import { BodyText } from '@/components/ui/text'
import { VideoFrame, type VideoFrameVariants } from '@/components/ui/video-frame'

type PlaybackIssue = 'playbackFailed' | 'durationUnavailable'

interface RecordingPlayerProps {
  src: string
  density?: VideoFrameVariants['density']
  onRetry?: () => void
}

export function RecordingPlayer({ src, density, onRetry }: RecordingPlayerProps) {
  const t = useTranslations('recordingPlayer')
  const [playbackIssue, setPlaybackIssue] = useState<PlaybackIssue | null>(null)
  const [primedSrc, setPrimedSrc] = useState(src)

  if (src !== primedSrc) {
    setPrimedSrc(src)
    setPlaybackIssue(null)
  }

  const notice =
    playbackIssue === 'playbackFailed'
      ? {
          title: t('playbackFailedTitle'),
          description: t('playbackFailedDescription'),
          canRetry: true,
        }
      : playbackIssue === 'durationUnavailable'
        ? {
            title: t('durationUnavailableTitle'),
            description: t('durationUnavailableDescription'),
            canRetry: false,
          }
        : null

  return (
    <Stack gap={3}>
      <RecordingVideo
        src={src}
        density={density}
        onError={() => setPlaybackIssue('playbackFailed')}
        onDurationUnavailable={() =>
          setPlaybackIssue((current) => current ?? 'durationUnavailable')
        }
      />
      {notice ? (
        <Alert variant="warning">
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>
            {notice.canRetry && onRetry ? (
              <Inline gap={3} align="center" wrap="wrap">
                <span>{notice.description}</span>
                <Button
                  type="button"
                  variant="outline-pill"
                  shape="pill"
                  size="sm"
                  onClick={onRetry}
                >
                  <Icon size="md">
                    <RefreshCw />
                  </Icon>
                  {t('refresh')}
                </Button>
              </Inline>
            ) : (
              notice.description
            )}
          </AlertDescription>
        </Alert>
      ) : null}
    </Stack>
  )
}

export function RecordingPlayerSkeleton({
  density = 'compact',
}: {
  density?: VideoFrameVariants['density']
}) {
  return (
    <VideoFrame
      aspect="recording"
      density={density}
      aria-hidden="true"
      className="bg-muted animate-pulse"
    />
  )
}

export function RecordingPlayerError({
  density = 'compact',
  message,
  onRetry,
}: {
  density?: VideoFrameVariants['density']
  message?: string
  onRetry?: () => void
}) {
  const t = useTranslations('recordingPlayer')
  return (
    <VideoFrame
      aspect="recording"
      density={density}
      className="flex flex-col items-center justify-center bg-destructive/5 p-6 text-center ring-1 ring-destructive/20"
    >
      <Stack gap={3} align="center">
        <Icon size="lg" className="text-destructive">
          <AlertCircle />
        </Icon>
        <BodyText size="sm" tone="danger" weight="medium">
          {message || t('playbackFailedTitle')}
        </BodyText>
        {onRetry ? (
          <Button type="button" variant="outline-pill" shape="pill" size="sm" onClick={onRetry}>
            <Icon size="sm">
              <RefreshCw />
            </Icon>
            {t('refresh')}
          </Button>
        ) : null}
      </Stack>
    </VideoFrame>
  )
}
