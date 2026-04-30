import type { ReactNode } from 'react';

interface TakeVideoContainerProps {
  children: ReactNode;
}

export function TakeVideoContainer({ children }: TakeVideoContainerProps) {
  return <div className="video-container ring-1 ring-border/45">{children}</div>;
}
