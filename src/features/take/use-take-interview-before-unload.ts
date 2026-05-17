import { useEffect } from 'react';

import type { TakeStage } from '@/components/take/types';

import { TAKE_MESSAGES } from '@/features/take/messages';

const BEFORE_UNLOAD_GUARD_STAGES = new Set<TakeStage>([
  'lobby',
  'interview',
  'recording',
  'transition',
]);

export function useTakeInterviewBeforeUnload(stage: TakeStage) {
  useEffect(() => {
    if (!BEFORE_UNLOAD_GUARD_STAGES.has(stage)) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = TAKE_MESSAGES.beforeUnloadLeaveInterview;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [stage]);
}
