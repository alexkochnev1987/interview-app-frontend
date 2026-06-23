import type { Interview } from '@/lib/api'


export function isPendingInterview (interview: Interview): boolean {
    return interview.status === 'pending'
}

export function canManageInterview (interview: Interview): boolean {
    return isPendingInterview(interview)
}
