import type { Interview } from '@/lib/api'

export function formatInterviewDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatInterviewStatusLabel(status: Interview['status']) {
  return status.replace('_', ' ')
}

export function getCandidateInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
