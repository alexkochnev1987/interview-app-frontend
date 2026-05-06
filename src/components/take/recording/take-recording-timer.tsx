import { RecordingTimerBadge } from '@/components/ui/recording-preview';

interface TakeRecordingTimerProps {
  timeLabel: string;
}

export function TakeRecordingTimer({ timeLabel }: TakeRecordingTimerProps) {
  return <RecordingTimerBadge timeLabel={timeLabel} />;
}
