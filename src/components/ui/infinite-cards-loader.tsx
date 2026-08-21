'use client'

import { LoaderCircle, RefreshCw } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

export type InfiniteCardsLoaderLabels = {
  loadErrorTitle: string
  retry: string
  allLoaded: string
  loadingMore: string
  loadMore: string
  showing: string
}

export type InfiniteCardsLoaderProps = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  error: string | null
  onLoadMore: () => void
  labels: InfiniteCardsLoaderLabels
}

export function InfiniteCardsLoader({
  hasNextPage,
  isFetchingNextPage,
  error,
  onLoadMore,
  labels,
}: InfiniteCardsLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || error) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      { rootMargin: '256px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, error, onLoadMore])

  if (error) {
    return (
      <Alert variant="danger">
        <AlertTitle>{labels.loadErrorTitle}</AlertTitle>
        <AlertDescription>
          <Inline gap={3} align="center" wrap="wrap">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="sm"
              onClick={onLoadMore}
            >
              <Icon size="sm">
                <RefreshCw />
              </Icon>
              {labels.retry}
            </Button>
          </Inline>
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasNextPage) {
    return (
      <Stack gap={2} align="center">
        <BodyText size="sm" tone="muted">
          {labels.allLoaded}
        </BodyText>
      </Stack>
    )
  }

  return (
    <Stack gap={3} align="center">
      <div ref={sentinelRef} aria-hidden="true" />
      <Button
        type="button"
        variant="outline-pill"
        shape="pill"
        size="sm"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? (
          <Icon size="sm" spinning>
            <LoaderCircle />
          </Icon>
        ) : null}
        {isFetchingNextPage ? labels.loadingMore : labels.loadMore}
      </Button>
      <BodyText size="xs" tone="muted">
        {labels.showing}
      </BodyText>
    </Stack>
  )
}
