'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ApiError } from '@/lib/api'
import { notifyError, notifyInfo } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

const SUCCESS_AUTORESET_MS = 2500

type ButtonVariant = ComponentProps<typeof Button>['variant']
type ButtonSize = ComponentProps<typeof Button>['size']
type IconSize = ComponentProps<typeof Icon>['size']

interface RerunInfo {
  title: string
  message: string
}

type RerunResult = RerunInfo | undefined

interface RerunButtonProps {
  onRun: () => Promise<RerunResult>
  idleLabel: string
  submittedLabel: string
  startingLabel: string
  errorTitle: string
  errorFallback: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconSize?: IconSize
  disabled?: boolean
  toastId?: string
}

export function RerunButton({
  onRun,
  idleLabel,
  submittedLabel,
  startingLabel,
  errorTitle,
  errorFallback,
  variant = 'outline-pill',
  size = 'sm',
  iconSize = 'md',
  disabled,
  toastId,
}: RerunButtonProps) {
  const router = useRouter()
  const toastMessages = useToastMessages()
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
      router.refresh()
    } catch (err) {
      if (!mountedRef.current) return
      if (err instanceof ApiError && err.status === 409) {
        notifyInfo(toastMessages.rerun.alreadyInProgressTitle, {
          id: toastId ? `${toastId}-already-in-progress` : undefined,
          description: err.message,
        })
        setPhase('submitted')
        router.refresh()
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
        ? startingLabel
        : phase === 'submitted'
          ? submittedLabel
          : idleLabel}
    </Button>
  )
}
