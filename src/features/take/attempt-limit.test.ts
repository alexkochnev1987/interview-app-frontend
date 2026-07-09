import { describe, expect, it } from 'vitest';

import {
  getDisplayedAttemptNumber,
  resolveInitialVersionNumber,
  resolveNextVersionAfterSave,
  shouldSendAnswerProgressDuringRecording,
} from './attempt-limit';

describe('resolveInitialVersionNumber', () => {
  it('starts from first attempt when answer meta is missing', () => {
    expect(resolveInitialVersionNumber(undefined)).toBe(1);
  });

  it('returns the next attempt while under the limit', () => {
    expect(resolveInitialVersionNumber({ versionCount: 2, selectedVersionNumber: 2 })).toBe(3);
  });

  it('keeps selected version when attempts are already at limit', () => {
    expect(resolveInitialVersionNumber({ versionCount: 3, selectedVersionNumber: 3 })).toBe(3);
  });
});

describe('resolveNextVersionAfterSave', () => {
  it('moves from second to third attempt at boundary', () => {
    expect(resolveNextVersionAfterSave(2, { versionCount: 2 })).toBe(3);
  });

  it('returns null after third attempt', () => {
    expect(resolveNextVersionAfterSave(3, { versionCount: 3 })).toBeNull();
  });

  it('returns null when server already reports limit reached', () => {
    expect(resolveNextVersionAfterSave(2, { versionCount: 3 })).toBeNull();
  });
});

describe('shouldSendAnswerProgressDuringRecording', () => {
  it('sends progress for attempts one and two', () => {
    expect(shouldSendAnswerProgressDuringRecording(1)).toBe(true);
    expect(shouldSendAnswerProgressDuringRecording(2)).toBe(true);
  });

  it('skips progress on the final attempt', () => {
    expect(shouldSendAnswerProgressDuringRecording(3)).toBe(false);
  });
});

describe('getDisplayedAttemptNumber', () => {
  it('shows current in-flight version while recording', () => {
    expect(getDisplayedAttemptNumber({ versionCount: 2 }, 3, true)).toBe(3);
  });

  it('shows first attempt instead of zero before recording starts', () => {
    expect(getDisplayedAttemptNumber(undefined, 1, false)).toBe(1);
    expect(getDisplayedAttemptNumber({ versionCount: 0 }, 1, false)).toBe(1);
  });

  it('shows used attempts after recording stops', () => {
    expect(getDisplayedAttemptNumber({ versionCount: 2 }, 2, false)).toBe(2);
    expect(getDisplayedAttemptNumber({ versionCount: 3 }, 3, false)).toBe(3);
  });
});
