'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import {
  VideoFrame,
  VideoSurface,
  type VideoFrameVariants,
} from '@/components/ui/video-frame'
import {
  isDurationKnown,
  primeVideoDuration,
} from '@/lib/video-duration-priming'

interface RecordingVideoProps {
  src: string
  density?: VideoFrameVariants['density']
  onError?: () => void
}

export function RecordingVideo({ src, density, onError }: RecordingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detachRef = useRef<(() => void) | null>(null)
  const [isPriming, setIsPriming] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    setIsPriming(false)

    const handleMetadata = () => {
      if (isDurationKnown(video.duration)) {
        setIsPriming(false)
        return
      }
      setIsPriming(true)
      detachRef.current?.()
      detachRef.current = primeVideoDuration(video, {
        onSettled: () => setIsPriming(false),
      })
    }

    video.addEventListener('loadedmetadata', handleMetadata)
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata)
      detachRef.current?.()
      detachRef.current = null
    }
  }, [src])

  function handleError() {
    detachRef.current?.()
    detachRef.current = null
    setIsPriming(false)
    onError?.()
  }

  return (
    <VideoFrame aspect="recording" density={density}>
      <VideoSurface
        ref={videoRef}
        fit="fill"
        controls
        preload="metadata"
        playsInline
        src={src}
        onError={handleError}
      />
      {isPriming ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Icon size="xl" spinning className="text-white">
            <LoaderCircle />
          </Icon>
        </div>
      ) : null}
    </VideoFrame>
  )
}
