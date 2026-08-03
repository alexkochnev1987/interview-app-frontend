'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <SonnerToaster
      theme={theme as ToasterProps['theme']}
      expand
      closeButton
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderColor: 'hsl(var(--border))',
        },
        className: 'relative rounded-xl border shadow-float pr-12',
        descriptionClassName: '!text-[hsl(var(--muted-foreground))]',
        classNames: {
          success: '!text-[hsl(var(--card-foreground))] **:data-icon:!text-[hsl(var(--primary))]',
          error: '!text-[hsl(var(--card-foreground))] **:data-icon:!text-[hsl(var(--destructive))]',
          info: '!text-[hsl(var(--card-foreground))] **:data-icon:!text-[hsl(var(--secondary))]',
          closeButton:
            'left-auto! right-2! top-1/2! -translate-y-1/2! !border-[hsl(var(--border))] !bg-[hsl(var(--card))] !text-[hsl(var(--muted-foreground))] hover:!text-[hsl(var(--card-foreground))]',
        },
      }}
      {...props}
    />
  )
}
