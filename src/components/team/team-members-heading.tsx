'use client'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

export function TeamMembersHeading() {
  return (
    <Stack gap={2} width="full">
      <SectionHeading size="xl">Team Members</SectionHeading>
      <BodyText as="p" size="responsive-sm" width="prose">
        Manage your workspace collaborators and their access levels.
      </BodyText>
    </Stack>
  )
}
