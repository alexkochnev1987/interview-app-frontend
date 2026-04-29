import { CircleDot } from 'lucide-react';

import { StatusPill } from '@/components/app/status-pill';
import { BoxMyI } from '@/components/take/box-my-i';
import type { TakeStage } from '@/components/take/types';

interface TakeRecordingStatusProps {
  stage: TakeStage;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export function TakeRecordingStatus({ stage, timeLeft, formatTime }: TakeRecordingStatusProps) {
  return (
    <BoxMyI>
      <StatusPill tone={stage === 'recording' ? 'processing' : 'neutral'}>
        {stage === 'recording'
          ? 'Recording'
          : stage === 'transition'
            ? 'Saving version'
            : 'Awaiting response'}
      </StatusPill>
      {stage === 'recording' ? (
        <StatusPill tone="failed">
          <CircleDot className="size-3" />
          {formatTime(timeLeft)}
        </StatusPill>
      ) : null}
    </BoxMyI>
  );
}
