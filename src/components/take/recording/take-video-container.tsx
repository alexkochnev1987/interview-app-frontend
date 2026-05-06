import type { ReactNode } from 'react';
import { RecordingPreviewFrame } from '@/components/ui/recording-preview';

interface TakeVideoContainerProps {
  children: ReactNode;
}

export function TakeVideoContainer({ children }: TakeVideoContainerProps) {
  return <RecordingPreviewFrame>{children}</RecordingPreviewFrame>;
}
