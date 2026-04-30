import { type ReactNode } from 'react'

import { Grid } from '@/components/ui/layout/grid'

interface HeroGridProps {
  primary: ReactNode
  secondary: ReactNode
}

export function HeroGrid({ primary, secondary }: HeroGridProps) {
  return (
    <Grid as="section" columns="split-12-8" gap={6}>
      {primary}
      {secondary}
    </Grid>
  )
}
