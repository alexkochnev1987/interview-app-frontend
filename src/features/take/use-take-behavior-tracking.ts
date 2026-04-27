import { useEffect } from 'react';

import type { AnswerBehaviorEvent } from './runtime';
import type { TakeBehaviorSignals } from './utils';

interface UseTakeBehaviorTrackingParams {
  recording: boolean;
  currentVersionNumberRef: { current: number };
  behaviorSignalsRef: { current: TakeBehaviorSignals };
  behaviorEventsRef: { current: AnswerBehaviorEvent[] };
  scheduleProgressFlush: (reason: 'event') => void;
}

export function useTakeBehaviorTracking({
  recording,
  currentVersionNumberRef,
  behaviorSignalsRef,
  behaviorEventsRef,
  scheduleProgressFlush,
}: UseTakeBehaviorTrackingParams) {
  useEffect(() => {
    if (!recording) {
      return;
    }

    const recordBehaviorEvent = (
      eventType: AnswerBehaviorEvent['eventType'],
      signalKey: keyof TakeBehaviorSignals,
    ) => {
      behaviorSignalsRef.current = {
        ...behaviorSignalsRef.current,
        [signalKey]: behaviorSignalsRef.current[signalKey] + 1,
      };

      behaviorEventsRef.current = [
        ...behaviorEventsRef.current,
        {
          eventType,
          occurredAt: new Date().toISOString(),
          versionNumber: currentVersionNumberRef.current,
        },
      ];

      scheduleProgressFlush('event');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordBehaviorEvent('tab_hidden', 'tabHiddenCount');
      }
    };

    const handleWindowBlur = () => {
      recordBehaviorEvent('window_blur', 'windowBlurCount');
    };

    const handlePaste = () => {
      recordBehaviorEvent('paste', 'pasteCount');
    };

    const handleResize = () => {
      recordBehaviorEvent('resize', 'resizeCount');
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === 'Shift' || event.key === 'CapsLock') {
        return;
      }

      recordBehaviorEvent('keydown', 'keydownCount');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeydown, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown, true);
    };
  }, [recording, currentVersionNumberRef, behaviorSignalsRef, behaviorEventsRef, scheduleProgressFlush]);
}
