'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { fetchHrUsers } from '@/lib/api'
import { getErrorMessage } from '@/lib/api-error'

import { hrUsersQueryKey } from './query-keys'

export function useHrUsers(options?: { enabled?: boolean }) {
  const t = useTranslations('questions.common')
  const query = useQuery({
    queryKey: hrUsersQueryKey(),
    queryFn: ({ signal }) => fetchHrUsers({ signal }),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })

  return {
    hrUsers: query.data ?? [],
    loading: query.isLoading,
    error: getErrorMessage(query.error, t('assignedHrLoadError')) ?? null,
    refetch: query.refetch,
  }
}
