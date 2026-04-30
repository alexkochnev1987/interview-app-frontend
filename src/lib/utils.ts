import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-color': [
        { bg: ['surface-glass', 'surface-glass-soft', 'surface-low-soft', 'surface-low-glass'] },
      ],
      'border-color': [
        { border: ['hairline', 'hairline-strong'] },
      ],
      'ring-color': [
        { ring: ['hairline', 'hairline-strong'] },
      ],
      rounded: [
        { rounded: ['xl-2', 'xl-3', 'xl-4'] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customMerge(clsx(inputs))
}
