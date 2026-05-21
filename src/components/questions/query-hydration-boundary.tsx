'use client'

import {
  HydrationBoundary,
  type DehydratedState,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

type QueryHydrationBoundaryProps = {
  state: DehydratedState
  children: ReactNode
}

export function QueryHydrationBoundary({
  state,
  children,
}: QueryHydrationBoundaryProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>
}
