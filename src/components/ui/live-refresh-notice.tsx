'use client'

import { CirclePause, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'

export interface LiveRefreshNoticeProps {
  title: ReactNode
  description: ReactNode
  refreshLabel: ReactNode
  onRefresh: () => void
  disabled?: boolean
}

export function LiveRefreshNotice({
  title,
  description,
  refreshLabel,
  onRefresh,
  disabled,
}: LiveRefreshNoticeProps) {
  return (
    <Alert variant="warning">
      <Icon size="md">
        <CirclePause />
      </Icon>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <Inline gap={3} align="center" wrap="wrap">
          <span>{description}</span>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRefresh}
            disabled={disabled}
          >
            <Icon size="md">
              <RefreshCw />
            </Icon>
            {refreshLabel}
          </Button>
        </Inline>
      </AlertDescription>
    </Alert>
  )
}
