'use client'

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
} from 'react'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { ApiError } from '@/lib/api'
import { notifyError, notifyInfo } from '@/lib/toast'

const SUCCESS_AUTORESET_MS = 2500

type ButtonVariant = ComponentProps<typeof Button>['variant']
type ButtonSize = ComponentProps<typeof Button>['size']
type IconSize = ComponentProps<typeof Icon>['size']

interface ActionInfo {
  title: string
  message: string
}

type ActionResult = ActionInfo | undefined

interface AsyncActionButtonProps {
  onRun: () => Promise<ActionResult>
  idleLabel: string
  submittedLabel: string
  startingLabel: string
  errorTitle: string
  errorFallback: string
  inProgressTitle: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconSize?: IconSize
  icon?: ReactElement<{ className?: string }>
  disabled?: boolean
  toastId?: string
  onSuccess?: () => void
}

export function AsyncActionButton({
  onRun,
  idleLabel,
  submittedLabel,
  startingLabel,
  errorTitle,
  errorFallback,
  inProgressTitle,
  variant = 'outline-pill',
  size = 'sm',
  iconSize = 'md',
  icon = <RefreshCw />,
  disabled,
  toastId,
  onSuccess,
}: AsyncActionButtonProps) {
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
          id: toastId ? `${toastId}-informational` : undefined,
          description: result.message,
        })
      }
      setPhase('submitted')
      // An informational result means nothing was enqueued, so don't kick live polling for a no-op.
      if (!result) onSuccess?.()
    } catch (err) {
      if (!mountedRef.current) return
      if (err instanceof ApiError && err.status === 409) {
        notifyInfo(inProgressTitle, {
          id: toastId ? `${toastId}-already-in-progress` : undefined,
          description: err.message,
        })
        setPhase('submitted')
        onSuccess?.()
        return
      }
      notifyError(errorTitle, {
        id: toastId ? `${toastId}-error` : undefined,
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
    <DemoWriteGuard disabled={disabled || phase !== 'idle'}>
      <Button
        type="button"
        variant={variant}
        size={size}
        shape="pill"
        onClick={handleClick}
      >
        <Icon size={iconSize}>{icon}</Icon>
        {phase === 'submitting'
          ? startingLabel
          : phase === 'submitted'
            ? submittedLabel
            : idleLabel}
      </Button>
    </DemoWriteGuard>
  )
}
