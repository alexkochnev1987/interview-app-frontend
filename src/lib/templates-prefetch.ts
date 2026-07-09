import { dehydrate, type DehydratedState } from '@tanstack/react-query'

import { templatesListQueryKey } from '@/components/templates/query-keys'
import type { Interview, Template } from '@/lib/api'
import { getQueryClient } from '@/lib/get-query-client'
import { requestServer, type ServerRequestContext } from '@/lib/server-fetch'

export async function prefetchTemplatesList(
  ctx: ServerRequestContext,
): Promise<DehydratedState> {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: templatesListQueryKey(ctx.locale),
    queryFn: async () =>
      (await requestServer<Template[]>('/templates', ctx)) ?? [],
  })
  return dehydrate(queryClient)
}

export async function fetchTemplate(
  ctx: ServerRequestContext,
  id: string,
): Promise<Template | undefined> {
  return requestServer<Template>(`/templates/${encodeURIComponent(id)}`, ctx)
}

// Prefill source for duplicate / save-as-template; the interview already carries its questions.
export async function fetchInterview(
  ctx: ServerRequestContext,
  id: string,
): Promise<Interview | undefined> {
  return requestServer<Interview>(`/interviews/${encodeURIComponent(id)}`, ctx)
}
