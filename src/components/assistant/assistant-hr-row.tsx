'use client'

import { Button } from '@/components/ui/button'
import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { AssignedHr } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { APP_ROLE } from '@/lib/auth-roles'
import { canViewUserProfile } from '@/lib/user-profile-access'

import { toAssistantHrSelection, type AssistantHrSelection } from './assistant-hr-selection'

type AssistantHrRowProps = {
  hr: AssignedHr
  disabled?: boolean
  onSelect?: (selection: AssistantHrSelection) => void
}

export function AssistantHrRow({ hr, disabled = false, onSelect }: AssistantHrRowProps) {
  const { user } = useAuth()
  const canOpenProfile =
    !!user && canViewUserProfile({ id: hr.id, role: APP_ROLE.hr }, { id: user.id, role: user.role })

  const content = (
    <Stack gap={0} width="full" align="start">
      <BodyText size="sm" weight="medium">
        {hr.name}
      </BodyText>
      <BodyText size="xs" tone="muted">
        {hr.email}
      </BodyText>
    </Stack>
  )

  if (onSelect) {
    return (
      <Button
        type="button"
        variant="outline"
        size="picker"
        width="full"
        disabled={disabled}
        onClick={() => onSelect(toAssistantHrSelection(hr))}
      >
        {content}
      </Button>
    )
  }

  const card = <ChatResultCard>{content}</ChatResultCard>

  if (!canOpenProfile) {
    return card
  }

  return <UnstyledLink href={routes.profile.detail(hr.id)}>{card}</UnstyledLink>
}
