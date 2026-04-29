'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, LoaderCircle } from 'lucide-react'

import { IconBadge } from '@/components/app/icon-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const onCancelRef = useRef(onCancel)
  const loadingRef = useRef(loading)
  useEffect(() => {
    onCancelRef.current = onCancel
    loadingRef.current = loading
  })

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loadingRef.current) onCancelRef.current()
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <Card
        variant="floating"
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader spacing="sm">
          {destructive && (
            <IconBadge tone="danger" size="md">
              <AlertTriangle className="size-5" />
            </IconBadge>
          )}
          <CardTitle size="lg">{title}</CardTitle>
          {description && (
            <CardDescription>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent layout="row-end" spacing="sm">
          <Button
            type="button"
            variant="outline"
            shape="pill"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            shape="pill"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <LoaderCircle className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </CardContent>
      </Card>
    </div>,
    document.body,
  )
}
