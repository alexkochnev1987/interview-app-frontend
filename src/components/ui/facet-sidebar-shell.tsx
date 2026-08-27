'use client'

import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

export interface FacetSidebarShellProps {
  hideHeading?: boolean
  filtersTitle: ReactNode
  activeFilterCount: number
  activeFiltersText?: ReactNode
  resetTitle?: string
  resetLabel: ReactNode
  canReset: boolean
  onReset: () => void
  error?: string | null
  unavailableTitle?: ReactNode
  retryLabel?: ReactNode
  onRetry?: () => void
  children: ReactNode
}

export function FacetSidebarShell({
  hideHeading = false,
  filtersTitle,
  activeFilterCount,
  activeFiltersText,
  resetTitle,
  resetLabel,
  canReset,
  onReset,
  error,
  unavailableTitle,
  retryLabel,
  onRetry,
  children,
}: FacetSidebarShellProps) {
  return (
    <Card variant="surface" size="sm">
      <CardContent spacing="md">
        <Stack gap={3}>
          {!hideHeading ? (
            <Inline gap={2} align="center" justify="between">
              <BodyText as="span" size="base" tone="foreground" weight="semibold">
                {filtersTitle}
              </BodyText>
              {activeFilterCount > 0 && activeFiltersText ? (
                <BodyText as="span" size="xs" tone="muted">
                  {activeFiltersText}
                </BodyText>
              ) : null}
            </Inline>
          ) : null}

          <Button
            type="button"
            variant="default"
            shape="pill"
            size="xl"
            width="full"
            disabled={!canReset}
            onClick={onReset}
            title={resetTitle}
          >
            <Icon size="md">
              <RotateCcw />
            </Icon>
            {resetLabel}
          </Button>

          {error ? (
            <Stack gap={2}>
              {unavailableTitle ? (
                <BodyText size="sm" weight="semibold">
                  {unavailableTitle}
                </BodyText>
              ) : null}
              <BodyText size="sm" tone="muted">
                {error}
              </BodyText>
              {onRetry && retryLabel ? (
                <Button
                  type="button"
                  variant="outline-pill"
                  shape="pill"
                  size="sm"
                  onClick={onRetry}
                >
                  {retryLabel}
                </Button>
              ) : null}
            </Stack>
          ) : (
            children
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
