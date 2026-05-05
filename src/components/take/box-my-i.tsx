import type { ReactNode } from 'react';
import { Inline } from '@/components/ui/layout';

interface BoxMyIProps {
  children: ReactNode;
}

export function BoxMyI({ children }: BoxMyIProps) {
  return (
    <Inline wrap="wrap" align="center" gap={2}>
      {children}
    </Inline>
  );
}
