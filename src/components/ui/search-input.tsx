import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'

import { IconAffix } from '@/components/ui/icon-affix'
import { Input } from '@/components/ui/input'

type SearchInputProps = Omit<
  ComponentProps<typeof Input>,
  'shape' | 'iconAffix' | 'type'
> & {
  width?: ComponentProps<typeof IconAffix>['width']
}

export function SearchInput({ size = 'lg', width, ...props }: SearchInputProps) {
  return (
    <IconAffix icon={<Search className="size-4" />} width={width}>
      <Input
        type="search"
        size={size}
        shape="rounded"
        iconAffix="leading"
        {...props}
      />
    </IconAffix>
  )
}
