import type { RecruiterAssistantRedirect } from '@/lib/api'

export function buildAssistantRedirectHref(redirect: RecruiterAssistantRedirect): string {
  const query = redirect.query
  if (!query || Object.keys(query).length === 0) {
    return redirect.path
  }

  const params = new URLSearchParams(query)
  return `${redirect.path}?${params.toString()}`
}
