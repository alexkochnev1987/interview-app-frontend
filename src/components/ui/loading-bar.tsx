import { cn } from '@/lib/utils'

type LoadingBarProps = {
  visible: boolean
  className?: string
}

export function LoadingBar({ visible, className }: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-busy={visible}
      aria-label="Loading"
      data-slot="loading-bar"
      className={cn(
        'pointer-events-none h-0.5 w-full overflow-hidden bg-transparent transition-opacity',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      <div className="h-full w-full origin-left animate-indeterminate-progress bg-primary" />
    </div>
  )
}
