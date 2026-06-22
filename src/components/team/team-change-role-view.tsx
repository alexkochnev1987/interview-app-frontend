'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'

import type { TeamMemberRole } from '@/features/team/team-roles'

import { TeamRoleBadge } from './team-role-badge'

type TeamChangeRoleViewProps = {
  member: TeamMember
  roleOptions: { value: TeamMemberRole; label: string }[]
  selectedRole: TeamMemberRole
  onSelectRole: (role: TeamMemberRole) => void
  loading: boolean
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
  hasChange,
  onApply,
  onDismiss,
}: TeamChangeRoleViewProps) {
  const t = useTranslations('team.changeRole')

  return (
    <ModalShell
      dismissDisabled={loading}
      onDismiss={onDismiss}
      accessibilityTitle={t('accessibilityTitle')}
      accessibilityDescription={`${member.name}, ${member.email}`}
    >
      <CardHeader spacing="sm">
        <Inline justify="between" align="start">
          <Stack gap={1}>
            <CardTitle size="lg">{t('title')}</CardTitle>
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
          <EyebrowLabel size="sm">{t('currentRole')}</EyebrowLabel>
          <TeamRoleBadge role={member.role} />
        </Stack>

        <Stack gap={2}>
          <EyebrowLabel size="sm">{t('newRole')}</EyebrowLabel>
          {roleOptions.length === 0 ? (
            <BodyText size="sm" tone="muted">
              {t('noRoles')}
            </BodyText>
          ) : (
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
          )}
        </Stack>

        <Stack gap={2}>
          <DemoWriteGuard disabled={roleOptions.length === 0 || !hasChange || loading}>
            <Button
              type="button"
              variant="gradient"
              shape="pill"
              onClick={() => { void onApply() }}
            >
              {loading ? t('applying') : t('apply')}
            </Button>
          </DemoWriteGuard>
          <Button
            type="button"
            variant="ghost"
            shape="pill"
            disabled={loading}
            onClick={onDismiss}
          >
            {t('cancel')}
          </Button>
        </Stack>

        <BodyText size="xs" tone="muted">
          {t('footnote')}
        </BodyText>
      </CardContent>
    </ModalShell>
  )
}
