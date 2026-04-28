import { type ReactNode } from 'react'

interface CardGridProps {
  children: ReactNode
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {children}
    </section>
  )
}
