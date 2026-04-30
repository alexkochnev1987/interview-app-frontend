import { type ReactNode } from 'react'

interface HeroGridProps {
  primary: ReactNode
  secondary: ReactNode
}

export function HeroGrid({ primary, secondary }: HeroGridProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {primary}
      {secondary}
    </section>
  )
}
