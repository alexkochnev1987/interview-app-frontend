'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ApiError } from '@/lib/api'
import { notifyError, notifyInfo } from '@/lib/toast'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const SUCCESS_AUTORESET_MS = 2500

type ButtonVariant = ComponentProps<typeof Button>['variant']
type ButtonSize = ComponentProps<typeof Button>['size']
type IconSize = ComponentProps<typeof Icon>['size']

export interface RerunInfo {
  title: string
  message: string
}

export type RerunResult = RerunInfo | undefined

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
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function handleClick() {
    setPhase('submitting')
    try {
      const result = await onRun()
      if (!mountedRef.current) return
      if (result) {
        notifyInfo(result.title, {
          id: 'rerun-informational',
          description: result.message,
        })
      }
      setPhase('submitted')
      router.refresh()
    } catch (err) {
      if (!mountedRef.current) return
      if (err instanceof ApiError && err.status === 409) {
        notifyInfo(TOAST_MESSAGES.rerun.alreadyInProgressTitle, {
          id: 'rerun-already-in-progress',
          description: err.message,
        })
        setPhase('submitted')
        router.refresh()
        return
      }
      notifyError(errorTitle, {
        description: err instanceof Error ? err.message : errorFallback,
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
  )
}
