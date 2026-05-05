import type { ReactNode } from 'react'

import { Container, Grid, Stack } from '@/components/ui/layout'
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

export function PageMainWideGap({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={8}>{children}</Stack>
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

export const PageMainCompact = PageMainLayout

export function PageMainEditor({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={6}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainTight({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">{children}</Container>
    </PageFrame>
  )
}

export function PageMainCompactStack({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="compact">
      <Container width="default">
        <Stack gap={6}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function LoginPageShell({ children }: ChildrenProps) {
  return (
    <PageFrame as="main" spacing="login">
      <Container width="default">
        <Grid columns="login-shell" gap={8} align="center">
          {children}
        </Grid>
      </Container>
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

export const MaxWidth4xl = PageContent
