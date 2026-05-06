export const TAKE_MESSAGES = {
  browserUnsupported: 'This browser must support camera, microphone, and full-screen sharing.',
  shortRecordingSubmit: 'Recording is too short to submit yet. Please record a bit longer and try again.',
  syncingInProgress: 'Recording is still syncing for this question. Try submitting again in a moment.',
  screenShareStopped: 'Screen sharing stopped. Reconnect camera and entire-screen sharing to continue this question.',
  screenShareStoppedRestartSetup: 'Screen sharing stopped. Start the setup again to continue the interview.',
  recordingStoppedWithoutAction:
    'Recording stopped without a follow-up action. Start a new version for this answer.',
  uploadFailedFallback: 'Upload failed',
  submitFailedTitle: 'Submit failed',
  preparingRecording: 'Preparing recording...',
  reconnectCameraAndScreen: 'Reconnect camera + screen',
  rerecordAsNewVersion: 'Re-record as new version',
  submitAndNext: 'Submit & Next',
  savingCurrentVersion: 'Saving current version',
} as const;
