import { cn } from '@/lib/utils'

export const sideNavItemBase =
  'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

export const sideNavProfileLinkClass = cn(sideNavItemBase, 'px-0')

export const revealBase =
  'opacity-0 transition-opacity duration-200 lg:group-hover:opacity-100 group-data-[expanded=true]:opacity-100'

export const sideNavRevealClass = cn(
  revealBase,
  'pointer-events-none lg:group-hover:pointer-events-auto group-data-[expanded=true]:pointer-events-auto',
)
