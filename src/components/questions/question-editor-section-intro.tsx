import type { ReactNode } from 'react'

interface QuestionEditorSectionIntroProps {
  description: string
  icon: ReactNode
  title: string
}

export function QuestionEditorSectionIntro({
  description,
  icon,
  title,
}: QuestionEditorSectionIntroProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
        {icon}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
