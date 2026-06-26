import type { Interview } from '@/lib/api'
import type { StatusTone } from '@/components/ui/status-pill'

export function interviewStatusTone(status: Interview['status']): StatusTone {
    return status
}