'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { Separator } from '@/components/ui/separator'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

type NameErrorKey = 'nameRequired'
type EmailErrorKey = 'emailRequired' | 'emailInvalid'

/** Best-effort Google link detection from fields the team API already returns. */
export function isGoogleLinkedTeamMember(
  member: Pick<TeamMember, 'avatarSource' | 'hasGoogleAvatar' | 'pictureUrl'>,
): boolean {
  return (
    member.hasGoogleAvatar ||
    member.avatarSource === 'google' ||
    Boolean(member.pictureUrl?.includes('googleusercontent.com'))
  )
}

type TeamEditAccountViewProps = {
  member: TeamMember
  name: string
  email: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  loading: boolean
  hasChange: boolean
  nameErrorKey?: NameErrorKey
  emailErrorKey?: EmailErrorKey
  onSave: () => void
  onDismiss: () => void
}

export function TeamEditAccountView({
  member,
  name,
  email,
  onNameChange,
  onEmailChange,
  loading,
  hasChange,
  nameErrorKey,
  emailErrorKey,
  onSave,
  onDismiss,
}: TeamEditAccountViewProps) {
  const t = useTranslations('team.editAccount')
  const showGoogleEmailNotice = isGoogleLinkedTeamMember(member)

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
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void onSave()
          }}
        >
          <Stack gap={4}>
            <FormField
              htmlFor="team-edit-account-name"
              label={t('nameLabel')}
              error={nameErrorKey ? t(nameErrorKey) : undefined}
            >
              <Input
                id="team-edit-account-name"
                type="text"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </FormField>

            <FormField
              htmlFor="team-edit-account-email"
              label={t('emailLabel')}
              hint={showGoogleEmailNotice ? t('googleEmailNotice') : undefined}
              error={emailErrorKey ? t(emailErrorKey) : undefined}
            >
              <Input
                id="team-edit-account-email"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </FormField>

            <Stack gap={2}>
              <DemoWriteGuard disabled={!hasChange || loading}>
                <Button type="submit" variant="gradient" shape="pill">
                  {loading ? t('saving') : t('save')}
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
        </form>
      </CardContent>
    </ModalShell>
  )
}
