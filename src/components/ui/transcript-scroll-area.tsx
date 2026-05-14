import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface TranscriptScrollAreaProps {
  children: ReactNode;
}

export function TranscriptScrollArea({ children }: TranscriptScrollAreaProps) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]',
      )}
    >
      {children}
    </div>
  );
}
