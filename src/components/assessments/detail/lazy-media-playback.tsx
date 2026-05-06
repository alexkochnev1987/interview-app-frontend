'use client'

import { useEffect, useState } from 'react'
import { Eye, LoaderCircle, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { VideoFrame, VideoSurface } from '@/components/ui/video-frame'
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

const SIGNED_URL_REFRESH_THRESHOLD_MS = 55 * 60 * 1000

export function LazyMediaPlayback({
  interviewId,
  questionIndex,
  hasCamera,
  hasScreen,
}: LazyMediaPlaybackProps) {
  const [state, setState] = useState<LoadState>({ phase: 'idle' })
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    if (state.phase !== 'ready') {
      setIsStale(false)
      return
    }
    const remaining =
      state.loadedAt + SIGNED_URL_REFRESH_THRESHOLD_MS - Date.now()
    if (remaining <= 0) {
      setIsStale(true)
      return
    }
    setIsStale(false)
    const id = setTimeout(() => setIsStale(true), remaining)
    return () => clearTimeout(id)
  }, [state])

  if (!hasCamera && !hasScreen) {
    return (
      <SurfaceTile rounded="xl" padding="lg">
        <BodyText size="sm" tone="muted" italic>
          No recording was uploaded for this answer.
        </BodyText>
      </SurfaceTile>
    )
  }

  async function handleLoad() {
    setState({ phase: 'loading' })
    try {
      const media = await getInterviewAnswerMedia(interviewId, questionIndex)
      setState({ phase: 'ready', media, loadedAt: Date.now() })
    } catch (err) {
      setState({
        phase: 'error',
        message:
          err instanceof Error ? err.message : 'Failed to load media URLs.',
      })
    }
  }

  if (state.phase === 'idle') {
    return (
      <SurfaceTile rounded="xl" padding="lg">
        <Inline gap={3} align="center" justify="between" wrap="wrap">
          <Stack gap={1}>
            <EyebrowLabel size="sm">Recording</EyebrowLabel>
            <BodyText size="sm" tone="muted">
              {hasCamera && hasScreen
                ? 'Camera and screen recordings are available.'
                : hasCamera
                  ? 'Camera recording is available.'
                  : 'Screen recording is available.'}
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
            Load recording
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
            Loading recording...
          </BodyText>
        </Inline>
      </SurfaceTile>
    )
  }

  if (state.phase === 'error') {
    return (
      <Alert variant="danger">
        <AlertTitle>Recording unavailable</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    )
  }

  const { cameraUrl, screenUrl } = state.media

  return (
    <Stack gap={3}>
      {isStale ? (
        <Alert variant="warning">
          <AlertTitle>Recording links may have expired</AlertTitle>
          <AlertDescription>
            <Inline gap={3} align="center" wrap="wrap">
              <span>
                Signed URLs are valid for one hour. Refresh to get new playback
                links.
              </span>
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
                Refresh links
              </Button>
            </Inline>
          </AlertDescription>
        </Alert>
      ) : null}
      <Grid columns="metrics-2-md" gap={4}>
        {cameraUrl ? (
          <SurfaceTile rounded="xl" padding="lg">
            <Stack gap={3}>
              <EyebrowLabel size="sm">Candidate camera</EyebrowLabel>
              <VideoFrame>
                <VideoSurface
                  controls
                  preload="metadata"
                  playsInline
                  src={cameraUrl}
                />
              </VideoFrame>
            </Stack>
          </SurfaceTile>
        ) : null}
        {screenUrl ? (
          <SurfaceTile rounded="xl" padding="lg">
            <Stack gap={3}>
              <EyebrowLabel size="sm">Candidate screen</EyebrowLabel>
              <VideoFrame>
                <VideoSurface
                  controls
                  preload="metadata"
                  playsInline
                  src={screenUrl}
                />
              </VideoFrame>
            </Stack>
          </SurfaceTile>
        ) : null}
      </Grid>
    </Stack>
  )
}
