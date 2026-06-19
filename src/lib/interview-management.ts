import type { Interview } from '@/lib/api'


export function isPendingInterview (interview: Interview): boolean {
    return interview.status === 'pending'
}

export function isCanceledInterview(interview: Interview): boolean {
    return interview.status === 'canceled'
}

export function canManageInterview (interview: Interview): boolean {
    return isPendingInterview(interview)
}
