import { StatusPill } from '@/components/app/status-pill'

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied'

const labels: Record<PermissionStatus, string> = {
  idle: 'Idle',
  pending: 'Requesting',
  granted: 'Allowed',
  denied: 'Blocked',
}

const tones = {
  idle: 'neutral',
  pending: 'in_progress',
  granted: 'completed',
  denied: 'failed',
} as const

interface PermissionPillProps {
  status: PermissionStatus
  className?: string
}

export function PermissionPill({ status, className }: PermissionPillProps) {
  return (
    <StatusPill tone={tones[status]} className={className}>
      {labels[status]}
    </StatusPill>
  )
}
