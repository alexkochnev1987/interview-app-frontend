'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Stack } from '@/components/ui/layout/stack'
import { ApiError } from '@/lib/api'

const SUCCESS_AUTORESET_MS = 2500

type ButtonVariant = ComponentProps<typeof Button>['variant']
type ButtonSize = ComponentProps<typeof Button>['size']
type IconSize = ComponentProps<typeof Icon>['size']

type Notice = { kind: 'error' | 'info'; title: string; message: string }

export interface RerunInfo {
  title: string
  message: string
}

export type RerunResult = { info?: RerunInfo } | void

const ALREADY_IN_PROGRESS_TITLE = 'Re-evaluation already in progress'

interface RerunButtonProps {
  onRun: () => Promise<RerunResult>
  idleLabel: string
  submittedLabel: string
  errorTitle: string
  errorFallback: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconSize?: IconSize
  disabled?: boolean
}

export function RerunButton({
  onRun,
  idleLabel,
  submittedLabel,
  errorTitle,
  errorFallback,
  variant = 'outline-pill',
  size = 'sm',
  iconSize = 'md',
  disabled,
}: RerunButtonProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'submitted'>(
    'idle',
  )
  const [notice, setNotice] = useState<Notice | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function handleClick() {
    setPhase('submitting')
    setNotice(null)
    try {
      const result = await onRun()
      if (!mountedRef.current) return
      if (result?.info) {
        setNotice({
          kind: 'info',
          title: result.info.title,
          message: result.info.message,
        })
      }
      setPhase('submitted')
      router.refresh()
    } catch (err) {
      if (!mountedRef.current) return
      if (err instanceof ApiError && err.status === 409) {
        setNotice({
          kind: 'info',
          title: ALREADY_IN_PROGRESS_TITLE,
          message: err.message,
        })
        setPhase('submitted')
        router.refresh()
        return
      }
      setNotice({
        kind: 'error',
        title: errorTitle,
        message: err instanceof Error ? err.message : errorFallback,
      })
      setPhase('idle')
    }
  }

  useEffect(() => {
    if (phase !== 'submitted') return
    const timer = setTimeout(() => {
      if (mountedRef.current) setPhase('idle')
    }, SUCCESS_AUTORESET_MS)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <Stack gap={2}>
      <Button
        type="button"
        variant={variant}
        size={size}
        shape="pill"
        onClick={handleClick}
        disabled={disabled || phase !== 'idle'}
      >
        <Icon size={iconSize}>
          <RefreshCw />
        </Icon>
        {phase === 'submitting'
          ? 'Starting…'
          : phase === 'submitted'
            ? submittedLabel
            : idleLabel}
      </Button>
      {notice ? (
        <Alert variant={notice.kind === 'info' ? 'warning' : 'danger'}>
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}
    </Stack>
  )
}
