import type { StatusTone } from '@/components/ui/status-pill'
import type { Interview } from '@/lib/api'

export function interviewStatusTone(status: Interview['status']): StatusTone {
  return status
}
