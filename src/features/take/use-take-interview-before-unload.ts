import { useEffect } from 'react';
import type { TakeStage } from '@/components/take/types';
import { TAKE_MESSAGES } from '@/features/take/messages';

const STAGES_WITH_LEAVE_WARNING = new Set<TakeStage>([
  'lobby',
  'interview',
  'recording',
  'transition',
]);

export function useTakeInterviewBeforeUnload(stage: TakeStage) {
  useEffect(() => {
    if (!STAGES_WITH_LEAVE_WARNING.has(stage)) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = TAKE_MESSAGES.beforeUnloadLeaveInterview;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [stage]);
}
