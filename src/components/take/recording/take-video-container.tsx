import type { ReactNode } from 'react';

import { RecordingPreviewFrame } from '@/components/ui/recording-preview';

interface TakeVideoContainerProps {
  children: ReactNode;
  layout?: 'aspectVideo' | 'grow';
}

export function TakeVideoContainer({ children, layout = 'aspectVideo' }: TakeVideoContainerProps) {
  return <RecordingPreviewFrame layout={layout}>{children}</RecordingPreviewFrame>;
}
