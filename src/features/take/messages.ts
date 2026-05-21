export function formatTakeQuestionCountLabel(count: number): string {
  return count === 1 ? `${count} question` : `${count} questions`;
}

export const TAKE_MESSAGES = {
  browserUnsupported: 'This browser must support camera, microphone, and full-screen sharing.',
  shortRecordingSubmit: 'Recording is too short to submit yet. Please record a bit longer and try again.',
  syncingInProgress: 'Recording is still syncing for this question. Try submitting again in a moment.',
  screenShareStopped:
    'Screen sharing stopped. Reconnect camera and entire-screen sharing to continue this question.',
  recordingStoppedWithoutAction:
    'Recording stopped without a follow-up action. Start a new version for this answer.',
  uploadFailedFallback: 'Upload failed',
  submitFailedTitle: 'Submit failed',
  reconnectCameraAndScreen: 'Reconnect camera + screen',
  rerecordAsNewVersion: 'Retake',
  submitAndNext: 'Submit & Next',
  submitCompleteInterview: 'Submit & Finish',
  lobbyEnableCameraMicFirst: 'Enable your microphone and camera first, then share your entire screen.',
  lobbyInterviewStartBlocked:
    'Could not start the interview. Keep microphone, camera, and entire-screen sharing active, then try again.',
  lobbyEyebrow: 'Prep room',
  lobbyLead:
    'Enable mic and camera, share your full screen, then select Start Interview when all checks are ready.',
  lobbyJoin: 'Start Interview',
  lobbyJoinBusy: 'One moment…',
  lobbyDevicesHelp:
    'Status updates as you connect. In the system share dialog, choose Entire screen.',
  lobbyToolbarMic: 'Microphone',
  lobbyToolbarCamera: 'Camera',
  lobbyToolbarScreen: 'Entire screen share',
  lobbyPreviewCameraOffTitle: 'Camera is off',
  lobbyPreviewCameraOffLead: 'Tap the camera icon in the controls to turn your preview back on.',
  lobbyPreviewMutedTitle: 'Camera preview paused',
  lobbyPreviewMutedLead: 'Tap the microphone or camera icon in the controls to allow access and show your preview.',
  consentContinue: 'Continue to device check',
  consentPrepHint:
    "Next you'll activate your microphone and camera, preview yourself, then share your entire screen to join.",
  guidanceInterview:
    'While recording, tap Submit when you are finished, or Retake to record another attempt.',
  guidanceBeforeRecording:
    'Your camera and full screen share stay on. Recording starts automatically when this question is ready.',
  guidanceInterviewerSpeaking:
    'The interviewer is reading the question aloud. Recording will start automatically when they finish.',
  recordingSessionTitleInterview: 'Interview',
  sessionReadyLabel: 'Ready to record',
  recordingPrepLabel: 'Preparing session…',
  recordingStartingBusy: 'Starting recording…',
  beforeUnloadLeaveInterview:
    'If you reload or leave now, you will exit this interview and may lose your progress. Are you sure?',
} as const;

export function isLastInterviewQuestion(
  currentQuestionIndex: number,
  totalQuestions: number,
): boolean {
  if (totalQuestions <= 0) return false;
  return currentQuestionIndex + 1 >= totalQuestions;
}

export function submitAnswerActionLabel(currentQuestionIndex: number, totalQuestions: number): string {
  if (totalQuestions <= 0) return TAKE_MESSAGES.submitAndNext;
  return isLastInterviewQuestion(currentQuestionIndex, totalQuestions)
    ? TAKE_MESSAGES.submitCompleteInterview
    : TAKE_MESSAGES.submitAndNext;
}
