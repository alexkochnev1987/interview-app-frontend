import { type ReactNode } from 'react'

interface TwoColumnLayoutProps {
  main: ReactNode
  aside: ReactNode
}

export function TwoColumnLayout({ main, aside }: TwoColumnLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <div className="space-y-6">{main}</div>
      <aside className="space-y-6">{aside}</aside>
    </div>
  )
}
