import type { ReactNode } from 'react';

import { RING_BORDER_SOFT } from '@/components/app/style-tokens';

interface TakeVideoContainerProps {
  children: ReactNode;
}

export function TakeVideoContainer({ children }: TakeVideoContainerProps) {
  return <div className={`video-container ${RING_BORDER_SOFT}`}>{children}</div>;
}
