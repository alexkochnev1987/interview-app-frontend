'use client'

import { useTranslations } from 'next-intl'

import {
  InfiniteCardsLoader as UiInfiniteCardsLoader,
  type InfiniteCardsLoaderProps as UiInfiniteCardsLoaderProps,
} from '@/components/ui/infinite-cards-loader'

export type InfiniteCardsLoaderProps = Omit<UiInfiniteCardsLoaderProps, 'labels'> & {
  totalLoaded: number
  total: number
}

export function InfiniteCardsLoader(props: InfiniteCardsLoaderProps) {
  const t = useTranslations('interviews.library.infinite')
  const tFeed = useTranslations('interviews.library.feed')

  return (
    <UiInfiniteCardsLoader
      {...props}
      labels={{
        loadErrorTitle: t('loadErrorTitle'),
        retry: tFeed('retry'),
        allLoaded: t('allLoaded', { count: props.total }),
        loadingMore: t('loadingMore'),
        loadMore: t('loadMore'),
        showing: t('showing', { loaded: props.totalLoaded, total: props.total }),
      }}
    />
  )
}
