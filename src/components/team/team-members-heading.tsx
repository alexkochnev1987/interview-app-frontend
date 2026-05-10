'use client'

import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

export function TeamMembersHeading() {
  return (
    <Inline gap={4} justify="between" align="end" wrap="wrap" width="full">
      <Stack gap={2} grow="fill">
        <SectionHeading size="xl">Team Members</SectionHeading>
        <BodyText as="p" size="responsive-sm" width="prose">
          Manage your workspace collaborators and their access levels.
        </BodyText>
      </Stack>
      <Button type="button" variant="default" size="xl">
        <Send aria-hidden />
        Notifications
      </Button>
    </Inline>
  )
}
