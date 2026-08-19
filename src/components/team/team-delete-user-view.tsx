'use client'

import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

import { TeamMemberModalShell } from './team-member-modal-shell'

type TeamDeleteUserViewProps = {
  member: TeamMember
  loading: boolean
  onConfirm: () => void
  onDismiss: () => void
}

export function TeamDeleteUserView({
  member,
  loading,
  onConfirm,
  onDismiss,
}: TeamDeleteUserViewProps) {
  const t = useTranslations('team.deleteUser')

  return (
    <TeamMemberModalShell
      member={member}
      title={t('title')}
      accessibilityTitle={t('accessibilityTitle')}
      loading={loading}
      onDismiss={onDismiss}
    >
      <Stack gap={4}>
        <BodyText size="sm">
          {t('description', { name: member.name, email: member.email })}
        </BodyText>
        {member.demo ? (
          <BodyText size="sm" tone="muted">
            {t('demoNotice')}
          </BodyText>
        ) : null}

        <Stack gap={2}>
          <DemoWriteGuard disabled={loading}>
            <Button
              type="button"
              variant="destructive"
              shape="pill"
              onClick={() => {
                void onConfirm()
              }}
            >
              {loading ? t('deleting') : t('confirm')}
            </Button>
          </DemoWriteGuard>
          <Button type="button" variant="ghost" shape="pill" disabled={loading} onClick={onDismiss}>
            {t('cancel')}
          </Button>
        </Stack>

        <BodyText size="xs" tone="muted">
          {t('footnote')}
        </BodyText>
      </Stack>
    </TeamMemberModalShell>
  )
}
