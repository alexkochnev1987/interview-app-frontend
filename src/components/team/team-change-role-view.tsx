'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { ModalShell } from '@/components/ui/modal-shell'
import { RadioGroup, RadioItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

import type { TeamMemberRole } from '@/features/team/team-roles'

import { TeamRoleBadge } from './team-role-badge'

type TeamChangeRoleViewProps = {
  member: TeamMember
  roleOptions: { value: TeamMemberRole; label: string }[]
  selectedRole: TeamMemberRole
  onSelectRole: (role: TeamMemberRole) => void
  loading: boolean
  error: string | null
  hasChange: boolean
  onApply: () => void
  onDismiss: () => void
}

export function TeamChangeRoleView({
  member,
  roleOptions,
  selectedRole,
  onSelectRole,
  loading,
  error,
  hasChange,
  onApply,
  onDismiss,
}: TeamChangeRoleViewProps) {
  return (
    <ModalShell
      dismissDisabled={loading}
      onDismiss={onDismiss}
      accessibilityTitle="Change role"
      accessibilityDescription={`${member.name}, ${member.email}`}
    >
      <CardHeader spacing="sm">
        <Inline justify="between" align="start">
          <Stack gap={1}>
            <CardTitle size="lg">Change role</CardTitle>
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

      <CardContent spacing="md">
        <Stack gap={2}>
          <EyebrowLabel size="sm">Current Role</EyebrowLabel>
          <TeamRoleBadge role={member.role} />
        </Stack>

        <Stack gap={2}>
          <EyebrowLabel size="sm">New Role</EyebrowLabel>
          <RadioGroup
            value={selectedRole}
            onValueChange={(v) => onSelectRole(v as TeamMemberRole)}
          >
            {roleOptions.map(({ value, label }) => (
              <RadioItem key={value} value={value}>
                {label}
              </RadioItem>
            ))}
          </RadioGroup>
        </Stack>

        {error && (
          <BodyText size="sm" tone="danger">
            {error}
          </BodyText>
        )}

        <Stack gap={2}>
          <Button
            type="button"
            variant="gradient"
            shape="pill"
            disabled={!hasChange || loading}
            onClick={() => { void onApply() }}
          >
            {loading ? 'Applying role change...' : 'Apply role change'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="pill"
            disabled={loading}
            onClick={onDismiss}
          >
            Cancel
          </Button>
        </Stack>

        <BodyText size="xs" tone="muted">
          This change takes effect immediately. The user keeps their session until next request.
        </BodyText>
      </CardContent>
    </ModalShell>
  )
}
