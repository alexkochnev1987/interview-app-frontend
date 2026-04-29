import type { ReactNode } from 'react';

interface BoxMyIProps {
  children: ReactNode;
}

export function BoxMyI({ children }: BoxMyIProps) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
