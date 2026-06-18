import type { ReactNode } from 'react'

import { Container, Stack } from '@/components/ui/layout'
import { PageFrame } from '@/components/ui/page-frame'

type ChildrenProps = {
  children: ReactNode
}

export function PageMain({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={8}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainViewport({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="page" stretch="viewport">
      <Container width="default" layout="viewportColumn">
        <Stack gap={8} grow="fill" width="full">
          {children}
        </Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainLayout({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="compact">
      <Container width="default">{children}</Container>
    </PageFrame>
  )
}

export function PageContent({ children }: ChildrenProps) {
  return (
    <Container width="prose" align="center">
      {children}
    </Container>
  )
}
