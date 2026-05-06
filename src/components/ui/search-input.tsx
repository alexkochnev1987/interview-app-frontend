import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'

import { IconAffix } from '@/components/ui/icon-affix'
import { Input } from '@/components/ui/input'

type SearchInputProps = Omit<
  ComponentProps<typeof Input>,
  'shape' | 'iconAffix' | 'type'
>

export function SearchInput({ size = 'lg', ...props }: SearchInputProps) {
  return (
    <IconAffix icon={<Search className="size-4" />}>
      <Input
        type="search"
        size={size}
        shape="pill"
        iconAffix="leading"
        {...props}
      />
    </IconAffix>
  )
}
