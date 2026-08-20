'use client'

import { useTranslations } from 'next-intl'

import {
  InfiniteCardsLoader as UiInfiniteCardsLoader,
  type InfiniteCardsLoaderProps as UiInfiniteCardsLoaderProps,
} from '@/components/ui/infinite-cards-loader'

export type QuestionsInfiniteCardsLoaderProps = Omit<UiInfiniteCardsLoaderProps, 'labels'> & {
  totalLoaded: number
  total: number
}

export function QuestionsInfiniteCardsLoader(props: QuestionsInfiniteCardsLoaderProps) {
  const t = useTranslations('questions.library.infinite')
  const tFeed = useTranslations('questions.picker.feed')

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
