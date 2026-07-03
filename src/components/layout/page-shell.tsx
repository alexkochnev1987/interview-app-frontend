import type { ReactNode } from 'react'

import { Container, Stack } from '@/components/ui/layout'
import { PageFrame } from '@/components/ui/page-frame'

type ChildrenProps = {
  children: ReactNode
}

type PageMainViewportSpacing = 'page' | 'take'

type PageMainViewportProps = ChildrenProps & {
  spacing?: PageMainViewportSpacing
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

export function PageMainViewport({
  children,
  spacing = 'page',
}: PageMainViewportProps) {
  return (
    <PageFrame as="main" spacing={spacing} stretch="viewport">
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
