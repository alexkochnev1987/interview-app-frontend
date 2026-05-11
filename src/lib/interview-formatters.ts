import type { Interview } from '@/lib/api'

const DISPLAY_TIME_ZONE = 'UTC'

const DISPLAY_LOCALE = 'en-US'

const interviewDateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const interviewDateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatMetricLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatInterviewDate(iso: string) {
  return interviewDateFormatter.format(new Date(iso))
}

export function formatInterviewDateTime(iso: string) {
  return interviewDateTimeFormatter.format(new Date(iso))
}

export function formatInterviewStatusLabel(status: Interview['status']) {
  return status.replaceAll('_', ' ')
}

export function getCandidateInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
