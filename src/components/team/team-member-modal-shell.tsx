'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { Separator } from '@/components/ui/separator'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

export interface TeamMemberModalShellProps {
  member: TeamMember
  title: string
  accessibilityTitle: string
  loading: boolean
  onDismiss: () => void
  children: ReactNode
}

export function TeamMemberModalShell({
  member,
  title,
  accessibilityTitle,
  loading,
  onDismiss,
  children,
}: TeamMemberModalShellProps) {
  return (
    <ModalShell
      dismissDisabled={loading}
      onDismiss={onDismiss}
      accessibilityTitle={accessibilityTitle}
      accessibilityDescription={`${member.name}, ${member.email}`}
    >
      <CardHeader spacing="sm">
        <Inline justify="between" align="start">
          <Stack gap={1}>
            <CardTitle size="lg">{title}</CardTitle>
            <BodyText size="sm">
              {member.name} · {member.email}
            </BodyText>
          </Stack>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={loading}
            onClick={onDismiss}
          >
            <X />
          </Button>
        </Inline>
      </CardHeader>

      <Separator />

      <CardContent spacing="md">{children}</CardContent>
    </ModalShell>
  )
}
