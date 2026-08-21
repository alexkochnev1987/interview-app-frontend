'use client'

import { cva } from 'class-variance-authority'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const themeSwitcherTriggerVariants = cva(
  'flex items-center justify-between gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-surface-low-soft cursor-pointer',
  {
    variants: {
      width: {
        full: 'w-full',
        fit: 'w-fit min-w-0 whitespace-nowrap',
        fixed: 'w-[140px] min-w-[140px] whitespace-nowrap',
      },
    },
    defaultVariants: {
      width: 'fit',
    },
  },
)

const themeSwitcherItemVariants = cva(
  'grid w-full grid-cols-[1fr_auto] items-center gap-2 whitespace-nowrap text-sm font-semibold',
  {
    variants: {
      active: {
        true: 'text-foreground',
        false: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export type ThemeValue = 'system' | 'light' | 'dark'

export type ThemeOption = {
  value: ThemeValue
  label: string
}

type ThemeSwitcherProps = {
  ariaLabel?: string
  options?: ThemeOption[]
  align?: 'start' | 'center' | 'end'
  width?: 'full' | 'fit' | 'fixed'
}

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const

const emptySubscribe = () => () => {}

export function ThemeSwitcher({
  ariaLabel = 'Select theme',
  options,
  align = 'end',
  width = 'fit',
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  const t = useTranslations('profile.preferences')

  const defaultOptions: ThemeOption[] = [
    { value: 'system', label: t('themeSystem') },
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
  ]

  const resolvedOptions = options ?? defaultOptions
  const currentTheme = mounted ? ((theme as ThemeValue) ?? 'system') : 'system'
  const currentOption =
    resolvedOptions.find((opt) => opt.value === currentTheme) ?? resolvedOptions[0]
  const CurrentIcon = themeIcons[currentOption.value] ?? Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(themeSwitcherTriggerVariants({ width }))}
        aria-label={ariaLabel}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <CurrentIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{currentOption.label}</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {resolvedOptions.map((option) => {
          const IconComponent = themeIcons[option.value]
          const isSelected = currentTheme === option.value
          return (
            <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
              <div className={cn(themeSwitcherItemVariants({ active: isSelected }))}>
                <span className="flex items-center gap-2">
                  <IconComponent className="size-4 text-muted-foreground" />
                  <span>{option.label}</span>
                </span>
                {isSelected ? <Check className="size-4 text-primary" /> : null}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
