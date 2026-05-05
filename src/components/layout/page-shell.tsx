import type { ReactNode } from 'react'

import { Container, Grid, Stack } from '@/components/ui/layout'
import { PageFrame } from '@/components/ui/page-frame'

interface PageMainProps {
  children: ReactNode
}

interface PageMainWideGapProps {
  children: ReactNode
}

interface PageMainLayoutProps {
  children: ReactNode
}

interface PageMainEditorProps {
  children: ReactNode
}

interface PageMainTightProps {
  children: ReactNode
}

interface PageMainCompactStackProps {
  children: ReactNode
}

interface LoginPageShellProps {
  children: ReactNode
}

interface PageContentProps {
  children: ReactNode
}

export function PageMain({ children }: PageMainProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={8}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainWideGap({ children }: PageMainWideGapProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={8}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainLayout({ children }: PageMainLayoutProps) {
  return (
    <PageFrame as="main" spacing="compact">
      <Container width="default">{children}</Container>
    </PageFrame>
  )
}

export const PageMainCompact = PageMainLayout

export function PageMainEditor({ children }: PageMainEditorProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">
        <Stack gap={6}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function PageMainTight({ children }: PageMainTightProps) {
  return (
    <PageFrame as="main" spacing="page">
      <Container width="default">{children}</Container>
    </PageFrame>
  )
}

export function PageMainCompactStack({ children }: PageMainCompactStackProps) {
  return (
    <PageFrame as="main" spacing="compact">
      <Container width="default">
        <Stack gap={6}>{children}</Stack>
      </Container>
    </PageFrame>
  )
}

export function LoginPageShell({ children }: LoginPageShellProps) {
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

export function PageContent({ children }: PageContentProps) {
  return (
    <Container width="prose" align="center">
      {children}
    </Container>
  )
}

export const MaxWidth4xl = PageContent
