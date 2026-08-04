'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { Separator } from '@/components/ui/separator'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

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
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
