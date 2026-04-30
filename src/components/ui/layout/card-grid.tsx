import { type ReactNode } from 'react'

import { Grid } from '@/components/ui/layout/grid'

interface CardGridProps {
  children: ReactNode
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <Grid as="section" columns="cards-2-3" gap={4}>
      {children}
    </Grid>
  )
}
