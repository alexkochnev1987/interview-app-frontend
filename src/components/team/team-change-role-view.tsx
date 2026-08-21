'use client'

import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { RadioGroup, RadioItem } from '@/components/ui/radio-group'
import { BodyText } from '@/components/ui/text'
import type { TeamMemberRole } from '@/features/team/team-roles'
import type { TeamMember } from '@/lib/api'

import { TeamMemberModalShell } from './team-member-modal-shell'
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
    <TeamMemberModalShell
      member={member}
      title={t('title')}
      accessibilityTitle={t('accessibilityTitle')}
      loading={loading}
      onDismiss={onDismiss}
    >
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
          <RadioGroup value={selectedRole} onValueChange={(v) => onSelectRole(v as TeamMemberRole)}>
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
            onClick={() => {
              void onApply()
            }}
          >
            {loading ? t('applying') : t('apply')}
          </Button>
        </DemoWriteGuard>
        <Button type="button" variant="ghost" shape="pill" disabled={loading} onClick={onDismiss}>
          {t('cancel')}
        </Button>
      </Stack>

      <BodyText size="xs" tone="muted">
        {t('footnote')}
      </BodyText>
    </TeamMemberModalShell>
  )
}
