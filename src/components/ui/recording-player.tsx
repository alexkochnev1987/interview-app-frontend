'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { RecordingVideo } from '@/components/ui/recording-video'
import type { VideoFrameVariants } from '@/components/ui/video-frame'

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
