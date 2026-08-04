'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      expand
      closeButton
      position="top-right"
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderColor: 'hsl(var(--border))',
        },
        classNames: {
          toast:
            'group toast !bg-card !text-card-foreground !border-border/70 !shadow-xl relative rounded-xl border pr-12',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground font-medium',
          cancelButton: '!bg-muted !text-muted-foreground',
          success:
            '!bg-success-soft !text-success-soft-foreground !border-success-soft-border **:data-icon:!text-success-soft-foreground',
          error:
            '!bg-danger-soft !text-danger-soft-foreground !border-danger-soft-border **:data-icon:!text-danger-soft-foreground',
          warning:
            '!bg-warning-soft !text-warning-soft-foreground !border-warning-soft-border **:data-icon:!text-warning-soft-foreground',
          closeButton:
            'left-auto! right-2! top-1/2! -translate-y-1/2! !border-border !bg-card !text-card-foreground',
        },
      }}
      {...props}
    />
  )
}
