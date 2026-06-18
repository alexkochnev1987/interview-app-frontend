import { useEffect } from 'react';
import type { TakeStage } from '@/components/take/types';

const STAGES_WITH_LEAVE_WARNING = new Set<TakeStage>([
  'lobby',
  'interview',
  'recording',
  'transition',
]);

export function useTakeInterviewBeforeUnload(stage: TakeStage, leaveWarningText: string) {
  useEffect(() => {
    if (!STAGES_WITH_LEAVE_WARNING.has(stage)) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = leaveWarningText;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [stage, leaveWarningText]);
}
