'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useLocale } from 'next-intl'
import { useEffect, type ReactNode } from 'react'

import { setClientApiLocale } from '@/lib/api'
import { getQueryClient } from '@/lib/get-query-client'

interface AppQueryClientProviderProps {
  children: ReactNode
}

export function AppQueryClientProvider({ children }: AppQueryClientProviderProps) {
  const queryClient = getQueryClient()
  const locale = useLocale()

  useEffect(() => {
    setClientApiLocale(locale)
  }, [locale])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  )
}
