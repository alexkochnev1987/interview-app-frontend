import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface HiddenFileInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const HiddenFileInput = forwardRef<HTMLInputElement, HiddenFileInputProps>(
  function HiddenFileInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="file"
        className={cn('hidden', className)}
        {...props}
      />
    )
  },
)
