'use client'

import { useEffect, useState } from 'react'
import { Eye, LoaderCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { RecordingVideo } from '@/components/ui/recording-video'
import { BodyText } from '@/components/ui/text'
import {
  getInterviewAnswerMedia,
  type InterviewAnswerMediaResponse,
} from '@/lib/api'

interface LazyMediaPlaybackProps {
  interviewId: string
  questionIndex: number
  hasCamera: boolean
  hasScreen: boolean
}

type LoadState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'ready'; media: InterviewAnswerMediaResponse; loadedAt: number }
  | { phase: 'error'; message: string }

type PlaybackIssue = 'playbackFailed' | 'durationUnavailable'

const SIGNED_URL_LIFETIME_MS = 60 * 60 * 1000
const SIGNED_URL_REFRESH_THRESHOLD_MS = SIGNED_URL_LIFETIME_MS - 5 * 60 * 1000

export function LazyMediaPlayback({
  interviewId,
  questionIndex,
  hasCamera,
  hasScreen,
}: LazyMediaPlaybackProps) {
  const t = useTranslations('assessments.media')
  const [state, setState] = useState<LoadState>({ phase: 'idle' })
  const [isStale, setIsStale] = useState(false)
  const [playbackIssue, setPlaybackIssue] = useState<PlaybackIssue | null>(null)

  useEffect(() => {
    if (state.phase !== 'ready') {
      const handle = setTimeout(() => setIsStale(false), 0)
      return () => clearTimeout(handle)
    }
    const remaining =
      state.loadedAt + SIGNED_URL_REFRESH_THRESHOLD_MS - Date.now()
    if (remaining <= 0) {
      const handle = setTimeout(() => setIsStale(true), 0)
      return () => clearTimeout(handle)
    }
    const resetHandle = setTimeout(() => setIsStale(false), 0)
    const id = setTimeout(() => setIsStale(true), remaining)
    return () => {
      clearTimeout(resetHandle)
      clearTimeout(id)
    }
  }, [state])

  function handleMediaError() {
    setPlaybackIssue('playbackFailed')
  }

  function handleDurationUnavailable() {
    setPlaybackIssue((current) => current ?? 'durationUnavailable')
  }

  async function handleLoad() {
    setPlaybackIssue(null)
    setState({ phase: 'loading' })
    try {
      const media = await getInterviewAnswerMedia(interviewId, questionIndex)
      setState({ phase: 'ready', media, loadedAt: Date.now() })
    } catch (err) {
      setState({
        phase: 'error',
        message:
          err instanceof Error ? err.message : t('loadFailed'),
      })
    }
  }

  if (!hasCamera && !hasScreen) {
    return (
      <SurfaceTile rounded="xl" padding="lg">
        <BodyText size="sm" tone="muted" italic>
          {t('noRecording')}
        </BodyText>
      </SurfaceTile>
    )
  }

  if (state.phase === 'idle') {
    return (
      <SurfaceTile rounded="xl" padding="lg">
        <Inline gap={3} align="center" justify="between" wrap="wrap">
          <Stack gap={1}>
            <EyebrowLabel size="sm">{t('recordingEyebrow')}</EyebrowLabel>
            <BodyText size="sm" tone="muted">
              {hasCamera && hasScreen
                ? t('cameraAndScreen')
                : hasCamera
                  ? t('cameraOnly')
                  : t('screenOnly')}
            </BodyText>
          </Stack>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={handleLoad}
          >
            <Icon size="md">
              <Eye />
            </Icon>
            {t('loadRecording')}
          </Button>
        </Inline>
      </SurfaceTile>
    )
  }

  if (state.phase === 'loading') {
    return (
      <SurfaceTile rounded="xl" padding="lg">
        <Inline gap={2} align="center">
          <Icon size="md">
            <LoaderCircle />
          </Icon>
          <BodyText size="sm" tone="muted">
            {t('loading')}
          </BodyText>
        </Inline>
      </SurfaceTile>
    )
  }

  if (state.phase === 'error') {
    return (
      <Alert variant="danger">
        <AlertTitle>{t('unavailableTitle')}</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    )
  }

  const { cameraUrl, screenUrl } = state.media

  const notice =
    playbackIssue === 'playbackFailed'
      ? {
          title: t('playbackFailedTitle'),
          description: t('playbackFailedDescription'),
        }
      : playbackIssue === 'durationUnavailable'
        ? {
            title: t('durationUnavailableTitle'),
            description: t('durationUnavailableDescription'),
          }
        : isStale
          ? { title: t('expiredTitle'), description: t('expiredDescription') }
          : null

  return (
    <Stack gap={3}>
      {notice ? (
        <Alert variant="warning">
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>
            <Inline gap={3} align="center" wrap="wrap">
              <span>{notice.description}</span>
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                onClick={handleLoad}
              >
                <Icon size="md">
                  <RefreshCw />
                </Icon>
                {t('refreshLinks')}
              </Button>
            </Inline>
          </AlertDescription>
        </Alert>
      ) : null}
      <Grid columns="metrics-2-md" gap={4}>
        {cameraUrl ? (
          <SurfaceTile rounded="xl" padding="lg">
            <Stack gap={3}>
              <EyebrowLabel size="sm">{t('candidateCamera')}</EyebrowLabel>
              <RecordingVideo
                src={cameraUrl}
                onError={handleMediaError}
                onDurationUnavailable={handleDurationUnavailable}
              />
            </Stack>
          </SurfaceTile>
        ) : null}
        {screenUrl ? (
          <SurfaceTile rounded="xl" padding="lg">
            <Stack gap={3}>
              <EyebrowLabel size="sm">{t('candidateScreen')}</EyebrowLabel>
              <RecordingVideo
                src={screenUrl}
                onError={handleMediaError}
                onDurationUnavailable={handleDurationUnavailable}
              />
            </Stack>
          </SurfaceTile>
        ) : null}
      </Grid>
    </Stack>
  )
}
