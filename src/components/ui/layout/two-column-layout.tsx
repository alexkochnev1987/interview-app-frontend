import { type ReactNode } from 'react'

import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'

interface TwoColumnLayoutProps {
  main: ReactNode
  aside: ReactNode
}

export function TwoColumnLayout({ main, aside }: TwoColumnLayoutProps) {
  return (
    <Grid columns="aside-22" gap={6}>
      <Stack gap={6}>{main}</Stack>
      <Stack as="aside" gap={6}>
        {aside}
      </Stack>
    </Grid>
  )
}
